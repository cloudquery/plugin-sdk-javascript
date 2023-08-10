import { Duplex } from 'node:stream';

import pMap from 'p-map';
import pTimeout from 'p-timeout';
import { Logger } from 'winston';

import { SyncStream, SyncResponse, MigrateTable, Insert } from '../grpc/plugin.js';
import { Column } from '../schema/column.js';
import { ClientMeta } from '../schema/meta.js';
import { Resource, encodeResource } from '../schema/resource.js';
import { Table, encodeTable } from '../schema/table.js';
import { Nullable } from '../schema/types.js';

export type Options = {
  logger: Logger;
  client: ClientMeta;
  tables: Table[];
  stream: SyncStream;
  deterministicCQId: boolean;
  concurrency: number;
};

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

    syncStream.write(new SyncResponse({ insert: new Insert({ record: encodeResource(resource) }) }));

    await Promise.all(table.relations.map((child) => resolveTable(logger, client, child, resource, syncStream)));
  }
};

export const sync = async ({ logger, client, tables, stream: syncStream, concurrency }: Options) => {
  for (const table of tables) {
    logger.info(`sending migrate message for table ${table.name}`);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    syncStream.write(new SyncResponse({ migrate_table: new MigrateTable({ table: encodeTable(table) }) }));
  }

  await pMap(tables, (table) => resolveTable(logger, client, table, null, syncStream), { concurrency });

  syncStream.end();
  return await Promise.resolve();
};
