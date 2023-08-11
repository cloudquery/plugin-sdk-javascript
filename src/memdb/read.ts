import { ReadStream, ReadRequest } from '../grpc/plugin.js';
import { decodeTable } from '../schema/table.js';

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRead = (memoryDB: Record<string, any[]>) => {
  return (stream: ReadStream): Promise<void> => {
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
  };
};
