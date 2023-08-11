import { Binary, TimeNanosecond } from '@apache-arrow/esnext-esm';

import { UUIDType } from '../types/uuid.js';

import { Column, createColumn, ColumnResolver } from './column.js';
import { Resource } from './resource.js';
import { Table, getPrimaryKeys } from './table.js';

export type ClientMeta = {
  id: () => string;
};

export const parentCqUUIDResolver = (): ColumnResolver => {
  return (_: ClientMeta, r: Resource, c: Column) => {
    if (r.parent === null) {
      return Promise.resolve(r.setColumData(c.name, null));
    }
    const parentCqID = r.parent.getColumnData(cqIDColumn.name);
    return Promise.resolve(r.setColumData(c.name, parentCqID));
  };
};

// These columns are managed and populated by the source plugins
export const cqIDColumn = createColumn({
  name: '_cq_id',
  type: new UUIDType(),
  description: 'Internal CQ ID of the row',
  notNull: true,
  unique: true,
});
export const cqParentIDColumn = createColumn({
  name: '_cq_parent_id',
  type: new UUIDType(),
  description: 'Internal CQ ID of the parent row',
  resolver: parentCqUUIDResolver(),
  ignoreInTests: true,
});

// These columns are managed and populated by the destination plugin
export const cqSyncTimeColumn = createColumn({
  name: '_cq_sync_time',
  type: new TimeNanosecond(),
  description: 'Internal CQ row of when sync was started (this will be the same for all rows in a single fetch)',
  ignoreInTests: true,
});
export const cqSourceNameColumn = createColumn({
  name: '_cq_source_name',
  type: new Binary(),
  description: 'Internal CQ row that references the source plugin name data was retrieved',
  ignoreInTests: true,
});

export const addCQIDsColumns = (table: Table): Table => {
  const hasPks = getPrimaryKeys(table).length > 0;
  const cqID = hasPks ? cqIDColumn : { ...cqIDColumn, primaryKey: true };
  return {
    ...table,
    columns: [cqID, cqParentIDColumn, ...table.columns],
    relations: table.relations.map((relation) => addCQIDsColumns(relation)),
  };
};
