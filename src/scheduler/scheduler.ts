import { Duplex } from 'node:stream';

import pMap from 'p-map';
import pTimeout from 'p-timeout';
import type { Logger } from 'winston';

import type { SyncStream } from '../grpc/plugin.js';
import { SyncResponse, MigrateTable, Insert } from '../grpc/plugin.js';
import type { Column } from '../schema/column.js';
import type { ClientMeta } from '../schema/meta.js';
import { Resource, encodeResource } from '../schema/resource.js';
import type { Table } from '../schema/table.js';
import { encodeTable, flattenTables } from '../schema/table.js';
import type { Nullable } from '../schema/types.js';

import { setCQId } from './cqid.js';

export type Options = {
  logger: Logger;
  client: ClientMeta;
  tables: Table[];
  stream: SyncStream;
  deterministicCQId: boolean;
  concurrency: number;
  strategy?: Strategy;
};

export enum Strategy {
  dfs = 'dfs',
  roundRobin = 'round-robin',
}

class TableResolverStream extends Duplex {
  queue: unknown[] = [];

  constructor() {
    super({ objectMode: true });
  }

  _read() {
    while (this.queue.length > 0) {
      this.push(this.queue.shift());
    }
    if (this.writableEnded) {
      // end readable stream if writable stream has ended
      this.push(null);
    }
  }

  _write(chunk: unknown, _: string, next: (error?: Error | null) => void) {
    this.queue.push(chunk);
    next();
  }
}

const validateResource = (resource: Resource) => {
  const missingPKs = resource.table.columns
    .filter((column, index) => column.primaryKey && !resource.data[index].valid)
    .map((column) => column.name);

  if (missingPKs.length > 0) {
    throw new Error(`missing primary key(s) ${missingPKs.join(', ')}`);
  }
};

const resolveColumn = async (client: ClientMeta, table: Table, resource: Resource, column: Column) => {
  try {
    return await column.resolver(client, resource, column);
  } catch (error) {
    throw new Error(`error resolving column ${column.name} for table ${table.name}: ${error}`);
  }
};

const resolveTable = async (
  logger: Logger,
  client: ClientMeta,
  table: Table,
  parent: Nullable<Resource>,
  syncStream: SyncStream,
  deterministicCQId: boolean,
) => {
  logger.info(`resolving table ${table.name}`);
  const stream = new TableResolverStream();
  try {
    await table.resolver(client, null, stream);
  } catch (error) {
    logger.error(`error resolving table ${table.name}: ${error}`);
    return;
  } finally {
    stream.end();
  }

  for await (const data of stream) {
    logger.info(`resolving resource for table ${table.name}`);
    const resolveResourceTimeout = 10 * 60 * 1000;
    const resource = new Resource(table, parent, data);

    try {
      await pTimeout(table.preResourceResolver(client, resource), { milliseconds: resolveResourceTimeout });
    } catch (error) {
      logger.error(`error resolving preResourceResolver for table ${table.name}: ${error}`);
      continue;
    }

    try {
      const allColumnsPromise = pMap(table.columns, (column) => resolveColumn(client, table, resource, column), {
        stopOnError: true,
      });
      await pTimeout(allColumnsPromise, { milliseconds: resolveResourceTimeout });
    } catch (error) {
      logger.error(`error resolving columns for table ${table.name}: ${error}`);
      continue;
    }

    try {
      await table.postResourceResolver(client, resource);
    } catch (error) {
      logger.error(`error resolving postResourceResolver for table ${table.name}: ${error}`);
      continue;
    }

    setCQId(resource, deterministicCQId);

    try {
      validateResource(resource);
    } catch (error) {
      logger.error(`error validating resource for table ${table.name}: ${error}`);
      continue;
    }

    try {
      syncStream.write(new SyncResponse({ insert: new Insert({ record: encodeResource(resource) }) }));
    } catch (error) {
      logger.error(`error writing insert for table ${table.name}: ${error}`);
      continue;
    }

    await pMap(table.relations, (child) =>
      resolveTable(logger, client, child, resource, syncStream, deterministicCQId),
    );
  }
};

const syncDfs = async ({
  logger,
  client,
  tables,
  stream: syncStream,
  concurrency,
  deterministicCQId,
}: Omit<Options, 'strategy'>) => {
  const tableClients = tables.flatMap((table) => {
    const clients = table.multiplexer(client);
    return clients.map((client) => ({ table, client }));
  });

  await pMap(
    tableClients,
    ({ table, client }) => resolveTable(logger, client, table, null, syncStream, deterministicCQId),
    {
      concurrency,
    },
  );
};

export const getRoundRobinTableClients = (tables: Table[], client: ClientMeta) => {
  let tablesWithClients = tables
    .map((table) => ({ table, clients: table.multiplexer(client) }))
    .filter(({ clients }) => clients.length > 0);

  const tableClients: { table: Table; client: ClientMeta }[] = [];
  while (tablesWithClients.length > 0) {
    for (const { table, clients } of tablesWithClients) {
      tableClients.push({ table, client: clients.shift() as ClientMeta });
    }
    tablesWithClients = tablesWithClients.filter(({ clients }) => clients.length > 0);
  }

  return tableClients;
};

const syncRoundRobin = async ({
  logger,
  client,
  tables,
  stream: syncStream,
  concurrency,
  deterministicCQId,
}: Omit<Options, 'strategy'>) => {
  const tableClients = getRoundRobinTableClients(tables, client);
  await pMap(
    tableClients,
    ({ table, client }) => resolveTable(logger, client, table, null, syncStream, deterministicCQId),
    {
      concurrency,
    },
  );
};

export const sync = async ({
  logger,
  client,
  tables,
  stream,
  concurrency,
  strategy = Strategy.dfs,
  deterministicCQId,
}: Options) => {
  for (const table of flattenTables(tables)) {
    logger.info(`sending migrate message for table ${table.name}`);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    stream.write(new SyncResponse({ migrate_table: new MigrateTable({ table: encodeTable(table) }) }));
  }

  switch (strategy) {
    case Strategy.dfs: {
      logger.debug(`using dfs strategy`);
      await syncDfs({ logger, client, tables, stream, concurrency, deterministicCQId });
      break;
    }
    case Strategy.roundRobin: {
      logger.debug(`using round-robin strategy`);
      await syncRoundRobin({ logger, client, tables, stream, concurrency, deterministicCQId });
      break;
    }
    default: {
      throw new Error(`unknown strategy ${strategy}`);
    }
  }

  stream.end();
  return await Promise.resolve();
};
