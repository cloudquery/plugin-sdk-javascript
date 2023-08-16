import { default as Ajv } from 'ajv';

import { ValidationError } from '../errors/errors.js';
import type { Plugin, SyncOptions, TableOptions, NewClientFunction } from '../plugin/plugin.js';
import { newPlugin } from '../plugin/plugin.js';
import { sync } from '../scheduler/scheduler.js';
import type { Table } from '../schema/table.js';
import { filterTables } from '../schema/table.js';

import { createDeleteStale } from './delete-stale.js';
import { createOverwrite } from './overwrite.js';
import { createRead } from './read.js';
import { createTables } from './tables.js';
import { createWrite } from './write.js';

export const createMemDBClient = () => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memoryDB: Record<string, any[]> = {};
  const tables: Record<string, Table> = {};
  return {
    id: () => 'memdb',
    memoryDB,
    tables,
  };
};

const spec = {
  type: 'object',
  properties: {
    concurrency: { type: 'integer' },
  },
};

type Spec = {
  concurrency: number;
};

const ajv = new Ajv.default();
const validate = ajv.compile(spec);

export const newMemDBPlugin = (): Plugin => {
  const memdbClient = createMemDBClient();
  const memoryDB = memdbClient.memoryDB;
  const tables = memdbClient.tables;

  const overwrite = createOverwrite(memoryDB);
  const deleteStale = createDeleteStale(memoryDB);
  const write = createWrite(memoryDB, tables, overwrite, deleteStale);
  const read = createRead(memoryDB);

  const allTables = createTables();

  const pluginClient = {
    plugin: null as unknown as Plugin,
    spec: null as unknown as Spec,
    close: () => Promise.resolve(),
    tables: (options: TableOptions) => {
      const { tables, skipTables, skipDependentTables } = options;
      const filtered = filterTables(allTables, tables, skipTables, skipDependentTables);
      return Promise.resolve(filtered);
    },
    sync: async (options: SyncOptions) => {
      const { stream, tables, skipTables, skipDependentTables, deterministicCQId } = options;
      const filtered = filterTables(allTables, tables, skipTables, skipDependentTables);
      const logger = pluginClient.plugin.getLogger();
      const {
        spec: { concurrency },
      } = pluginClient;

      return await sync({
        logger,
        client: memdbClient,
        stream,
        tables: filtered,
        deterministicCQId,
        concurrency,
      });
    },
    write,
    read,
  };

  const newClient: NewClientFunction = (logger, spec /* options */) => {
    const parsedSpec = JSON.parse(spec) as Partial<Spec>;
    const validSchema = validate(parsedSpec);
    if (!validSchema) {
      const messages = validate.errors?.map((error) => error.message).join(', ');
      return Promise.reject(new ValidationError(`Invalid spec: ${messages}`, { props: { spec } }));
    }
    const { concurrency = 10_000 } = parsedSpec;
    pluginClient.spec = { concurrency };
    return Promise.resolve(pluginClient);
  };

  const plugin = newPlugin('memdb', '0.0.1', newClient);
  pluginClient.plugin = plugin;
  return plugin;
};
