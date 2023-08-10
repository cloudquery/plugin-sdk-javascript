import { getProperty } from 'dot-prop';

import { ColumnResolver } from './column.js';

export const pathResolver = (path: string): ColumnResolver => {
  return (_, resource, c) => {
    resource.setColumData(c.name, getProperty(resource.getItem(), path));
    return Promise.resolve();
  };
};
