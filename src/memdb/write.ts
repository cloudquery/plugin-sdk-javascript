import { WriteStream, WriteRequest } from '../grpc/plugin.js';
import { Table, decodeTable, decodeRecord, getPrimaryKeys } from '../schema/table.js';

import { DeleteStaleFunction } from './delete-stale.js';
import { OverwriteFunction } from './overwrite.js';

export const createWrite = (
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  memoryDB: Record<string, any>,
  tables: Record<string, Table>,
  overwrite: OverwriteFunction,
  deleteStale: DeleteStaleFunction,
) => {
  return (stream: WriteStream): Promise<void> => {
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
  };
};
