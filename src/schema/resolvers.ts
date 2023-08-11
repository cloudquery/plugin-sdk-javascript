import { getProperty } from 'dot-prop';

import { ColumnResolver } from './column.js';

export const pathResolver = (path: string): ColumnResolver => {
  return (_, resource, c) => {
    resource.setColumData(c.name, getProperty(resource.getItem(), path));
    return Promise.resolve();
  };
};

export const parentColumnResolver = (parentColumn: string): ColumnResolver => {
  return (_, resource, c) => {
    const parent = resource.parent;
    if (!parent) {
      throw new Error(`parent not found for column ${c.name}`);
    }
    const parentData = parent.getColumnData(parentColumn);
    if (!parentData) {
      throw new Error(`parent data not found for column ${c.name}`);
    }
    resource.setColumData(c.name, parentData);
    return Promise.resolve();
  };
};
