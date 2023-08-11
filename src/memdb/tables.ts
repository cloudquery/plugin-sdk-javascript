import { Utf8 } from '@apache-arrow/esnext-esm';

import { createColumn } from '../schema/column.js';
import { addCQIDsColumns } from '../schema/meta.js';
import { pathResolver } from '../schema/resolvers.js';
import { createTable } from '../schema/table.js';

export const createTables = () => {
  const allTables = [
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

  const tableWithCQIDs = allTables.map((table) => addCQIDsColumns(table));
  return tableWithCQIDs;
};
