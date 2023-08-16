import { getProperty } from 'dot-prop';

import { ResolverError } from '../errors/errors.js';

import type { ColumnResolver } from './column.js';

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
      throw new ResolverError(`parent not found for column ${c.name}`, { props: { resource, column: c } });
    }
    const parentData = parent.getColumnData(parentColumn);
    if (!parentData) {
      throw new ResolverError(`parent data not found for column ${c.name}`, { props: { resource, column: c } });
    }
    resource.setColumData(c.name, parentData);
    return Promise.resolve();
  };
};
