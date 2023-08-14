import type { StructRowProxy } from '@apache-arrow/esnext-esm';

import type { Table } from '../schema/table.js';

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OverwriteFunction = (table: Table, primaryKeys: string[], record: StructRowProxy<any>) => void;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOverwrite = (memoryDB: Record<string, any[]>): OverwriteFunction => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (table: Table, primaryKeys: string[], record: StructRowProxy<any>) => {
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
};
