import { StructRowProxy, Utf8 } from '@apache-arrow/esnext-esm';
import { pluginV3 } from '@cloudquery/plugin-pb-javascript';
import { default as Ajv } from 'ajv';

import { WriteRequest, WriteStream, ReadStream, ReadRequest } from '../grpc/plugin.js';
import { Plugin, newPlugin, SyncOptions, TableOptions, NewClientFunction } from '../plugin/plugin.js';
import { sync } from '../scheduler/scheduler.js';
import { createColumn } from '../schema/column.js';
import { pathResolver } from '../schema/resolvers.js';
import { Table, createTable, filterTables, decodeTable, decodeRecord, getPrimaryKeys } from '../schema/table.js';

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

  const allTables: Table[] = [
    createTable({
      name: 'table1',
      title: 'Table 1',
      description: 'Table 1 description',
      resolver: (clientMeta, parent, stream) => {
        stream.write({ id: 'table1-name1' });
        stream.write({ id: 'table1-name2' });
        return Promise.resolve();
      },
      columns: [
        createColumn({
          name: 'id',
          type: new Utf8(),
          resolver: pathResolver('id'),
        }),
      ],
    }),
    createTable({
      name: 'table2',
      title: 'Table 2',
      description: 'Table 2 description',
      resolver: (clientMeta, parent, stream) => {
        stream.write({ name: 'table2-name1' });
        stream.write({ name: 'table2-name2' });
        return Promise.resolve();
      },
      columns: [
        createColumn({
          name: 'name',
          type: new Utf8(),
          resolver: pathResolver('name'),
        }),
      ],
    }),
  ];

  const memdb: { inserts: unknown[]; [key: string]: unknown } = {
    inserts: [],
    ...memoryDB,
  };

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overwrite = (table: Table, primaryKeys: string[], record: StructRowProxy<any>) => {
    const tableData = memoryDB[table.name] || [];

    if (primaryKeys.length === 0) {
      // If there are no primary keys, simply append the data
      tableData.push(record);
      memoryDB[table.name] = tableData;
      return;
    }

    // Otherwise, perform an upsert based on the primary keys
    const recordIndex = tableData.findIndex((existingRecord) => {
      return primaryKeys.every((key) => existingRecord[key] === record[key]);
    });

    if (recordIndex > -1) {
      // If record exists, update (overwrite) it
      tableData[recordIndex] = record;
    } else {
      // If record doesn't exist, insert it
      tableData.push(record);
    }

    memoryDB[table.name] = tableData; // Update the memoryDB with the modified table data
  };

  const deleteStale = (message: pluginV3.cloudquery.plugin.v3.Write.MessageDeleteStale): void => {
    const tableName = message.table_name;

    // Filter the table based on the provided criteria
    const filteredTable = memoryDB[tableName].filter((row) => {
      const sc = row.Schema();

      const sourceColIndex = sc.FieldIndices('source_name_column');
      const syncColIndex = sc.FieldIndices('sync_time_column');

      // Ensure both columns are present
      if (sourceColIndex === undefined || syncColIndex === undefined) {
        return true; // Keep the record if either column is missing
      }

      const rowSourceName = row.Column(sourceColIndex).Value(0);
      const rowSyncTime = row.Column(syncColIndex).Value(0); // Assuming it returns a Date object

      // If source names match and the record's sync time is not before the given sync time, keep the record
      return rowSourceName === message.source_name && !rowSyncTime.before(message.sync_time);
    });

    // Update the memory database with the filtered table
    memoryDB[tableName] = filteredTable;
  };

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
    write(stream: WriteStream): Promise<void> {
      return new Promise((resolve, reject) => {
        stream.on('data', (request: WriteRequest) => {
          switch (request.message) {
            case 'migrate_table': {
              // Update table schema in the `tables` map
              const table = decodeTable(request.migrate_table.table);
              tables[table.name] = table;
              break;
            }

            case 'insert': {
              const [tableName, batches] = decodeRecord(request.insert.record);

              if (!memoryDB[tableName]) {
                memoryDB[tableName] = [];
              }

              const tableSchema = tables[tableName];
              const pks = getPrimaryKeys(tableSchema);

              for (const batch of batches) {
                //eslint-disable-next-line unicorn/no-array-for-each
                for (const record of batch) {
                  overwrite(tableSchema, pks, record);
                }
              }
              break;
            }

            case 'delete': {
              deleteStale(request.delete);
              break;
            }

            default: {
              throw new Error(`Unknown request message type: ${request.message}`);
            }
          }
        });

        stream.on('finish', () => {
          resolve();
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    },
    read(stream: ReadStream): Promise<void> {
      return new Promise((resolve, reject) => {
        stream.on('data', (request: ReadRequest) => {
          const table = decodeTable(request.table);

          try {
            const rows = memoryDB[table.name] || [];

            // We iterate over records in reverse here because we don't set an expectation
            // of ordering on plugins, and we want to make sure that the tests are not
            // dependent on the order of insertion either.
            for (let index = rows.length - 1; index >= 0; index--) {
              stream.write(rows[index]);
            }
            stream.end();
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    },
  };

  const newClient: NewClientFunction = (logger, spec, options) => {
    const parsedSpec = JSON.parse(spec) as Partial<Spec>;
    const validSchema = validate(parsedSpec);
    if (!validSchema) {
      const messages = validate.errors?.map((error) => error.message).join(', ');
      return Promise.reject(new Error(`Invalid spec: ${messages}`));
    }
    const { concurrency = 10_000 } = parsedSpec;
    pluginClient.spec = { concurrency };
    return Promise.resolve(pluginClient);
  };

  const plugin = newPlugin('memdb', '0.0.1', newClient);
  pluginClient.plugin = plugin;
  return plugin;
};
