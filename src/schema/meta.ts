import { Binary, TimeNanosecond } from '@apache-arrow/esnext-esm';

import { UUIDType } from '../types/uuid.js';

import { Column, createColumn, ColumnResolver } from './column.js';
import { Resource } from './resource.js';

export type ClientMeta = {
  id: () => string;
};

export const parentCqUUIDResolver = (): ColumnResolver => {
  return (_: ClientMeta, r: Resource, c: Column) => {
    if (r.parent === null) {
      return Promise.resolve(r.setColumData(c.name, null));
    }
    const parentCqID = r.parent.getColumnData(cqIDColumn.name);
    if (parentCqID == null) {
      return Promise.resolve(r.setColumData(c.name, null));
    }
    return Promise.resolve(r.setColumData(c.name, parentCqID));
  };
};

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
export const cqSyncTimeColumn = createColumn({
  name: '_cq_sync_time',
  type: new TimeNanosecond(),
  description: 'Internal CQ row of when sync was started (this will be the same for all rows in a single fetch)',
  resolver: parentCqUUIDResolver(),
  ignoreInTests: true,
});
export const cqSourceNameColumn = createColumn({
  name: '_cq_source_name',
  type: new Binary(),
  description: 'Internal CQ row that references the source plugin name data was retrieved',
  resolver: parentCqUUIDResolver(),
  ignoreInTests: true,
});
