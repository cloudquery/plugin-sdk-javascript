import { Int64 } from '@apache-arrow/esnext-esm';

import { createColumn } from '../schema/column.js';
import { addCQIDsColumns } from '../schema/meta.js';
import { pathResolver, parentColumnResolver } from '../schema/resolvers.js';
import { createTable } from '../schema/table.js';
import { JSONType } from '../types/json.js';

export const createTables = () => {
  const allTables = [
    createTable({
      name: 'table1',
      title: 'Table 1',
      description: 'Table 1 description',
      resolver: (clientMeta, parent, stream) => {
        stream.write({ id: 'id-1', json: '{ "a": 1 }' });
        stream.write({ id: 'id-2', json: [1, 2, 3] });
        return Promise.resolve();
      },
      columns: [
        createColumn({
          name: 'id',
          resolver: pathResolver('id'),
        }),
        createColumn({
          name: 'json',
          resolver: pathResolver('json'),
          type: new JSONType(),
        }),
      ],
    }),
    createTable({
      name: 'table2',
      title: 'Table 2',
      description: 'Table 2 description',
      resolver: (clientMeta, parent, stream) => {
        stream.write({ name: 'name-1' });
        stream.write({ name: 'name-2' });
        return Promise.resolve();
      },
      columns: [
        createColumn({
          name: 'name',
          resolver: pathResolver('name'),
        }),
      ],
    }),
    createTable({
      name: 'table3',
      title: 'Table 3',
      description: 'Table 3 description',
      resolver: (clientMeta, parent, stream) => {
        stream.write({ name: 'name-1' });
        stream.write({ name: 'name-2' });
        return Promise.resolve();
      },
      columns: [
        createColumn({
          name: 'name',
          primaryKey: true,
          resolver: pathResolver('name'),
        }),
      ],
      relations: [
        createTable({
          name: 'table3_child1',
          resolver: (clientMeta, parent, stream) => {
            stream.write({ name: 'name-1', id: 1 });
            stream.write({ name: 'name-2', id: 2 });
            return Promise.resolve();
          },
          columns: [
            createColumn({
              name: 'name',
              resolver: pathResolver('name'),
            }),
            createColumn({
              name: 'id',
              resolver: pathResolver('id'),
              type: new Int64(),
              primaryKey: true,
            }),
            createColumn({
              name: 'parent_name',
              resolver: parentColumnResolver('name'),
              primaryKey: true,
            }),
          ],
        }),
      ],
    }),
  ];

  const tableWithCQIDs = allTables.map((table) => addCQIDsColumns(table));
  return tableWithCQIDs;
};
