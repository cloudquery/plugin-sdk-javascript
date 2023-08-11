import { DeleteStale } from '../grpc/plugin.js';

export type DeleteStaleFunction = (message: DeleteStale) => void;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDeleteStale = (memoryDB: Record<string, any[]>) => {
  return (message: DeleteStale) => {
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
};
