import {
  Plugin,
  newUnimplementedDestination,
  newPlugin,
  SyncOptions,
  TableOptions,
  NewClientOptions,
} from '../plugin/plugin.js';
import { sync } from '../scheduler/scheduler.js';
import { Table, createTable, filterTables } from '../schema/table.js';

export const createMemDBClient = () => {
  return { id: () => 'memdb' };
};

export const newMemDBPlugin = (): Plugin => {
  const memdbClient = createMemDBClient();

  const allTables: Table[] = [
    createTable({ name: 'table1', title: 'Table 1', description: 'Table 1 description' }),
    createTable({ name: 'table2', title: 'Table 2', description: 'Table 2 description' }),
  ];

  const pluginClient = {
    ...newUnimplementedDestination(),
    init: (spec: string, options: NewClientOptions) => Promise.resolve(),
    close: () => Promise.resolve(),
    tables: (options: TableOptions) => {
      const { tables, skipTables, skipDependentTables } = options;
      const filtered = filterTables(allTables, tables, skipTables, skipDependentTables);
      return Promise.resolve(filtered);
    },
    sync: async (options: SyncOptions) => {
      const { stream, tables, skipTables, skipDependentTables, deterministicCQId } = options;
      const filtered = filterTables(allTables, tables, skipTables, skipDependentTables);
      return await sync(memdbClient, filtered, stream, { deterministicCQId });
    },
  };

  return newPlugin('memdb', '0.0.1', () => Promise.resolve(pluginClient));
};
