import test from 'ava';

import { createColumn } from './column.js';
import { addCQIDsColumns, cqIDColumn, cqParentIDColumn } from './meta.js';
import { createTable } from './table.js';

test('addCQIDsColumns', (t) => {
  const table = createTable({
    name: 'table1',
    columns: [
      createColumn({ name: 'column1' }),
      createColumn({ name: 'column2' }),
      createColumn({ name: 'column3' }),
      createColumn({ name: 'column4' }),
    ],
    relations: [
      createTable({
        name: 'table1-child1',
        columns: [createColumn({ name: 'column1' }), createColumn({ name: 'column2' })],
      }),
      createTable({ name: 'table1-child2', columns: [createColumn({ name: 'column1' })] }),
      createTable({ name: 'table1-child3', columns: [createColumn({ name: 'column1' })] }),
      createTable({
        name: 'table1-child4',
        columns: [createColumn({ name: 'column1' })],
        relations: [
          createTable({
            name: 'table1-child4-child1',
            columns: [
              createColumn({ name: 'column1' }),
              createColumn({ name: 'column2' }),
              createColumn({ name: 'column3' }),
            ],
          }),
        ],
      }),
    ],
  });

  const tableWithCQIDs = addCQIDsColumns(table);

  t.is(tableWithCQIDs.columns.length, 6);
  t.is(tableWithCQIDs.columns[0], cqIDColumn);
  t.is(tableWithCQIDs.columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[0].columns.length, 4);
  t.is(tableWithCQIDs.relations[0].columns[0], cqIDColumn);
  t.is(tableWithCQIDs.relations[0].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[1].columns.length, 3);
  t.is(tableWithCQIDs.relations[1].columns[0], cqIDColumn);
  t.is(tableWithCQIDs.relations[1].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[2].columns.length, 3);
  t.is(tableWithCQIDs.relations[2].columns[0], cqIDColumn);
  t.is(tableWithCQIDs.relations[2].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[3].columns.length, 3);
  t.is(tableWithCQIDs.relations[3].columns[0], cqIDColumn);
  t.is(tableWithCQIDs.relations[3].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[3].relations[0].columns.length, 5);
  t.is(tableWithCQIDs.relations[3].relations[0].columns[0], cqIDColumn);
  t.is(tableWithCQIDs.relations[3].relations[0].columns[1], cqParentIDColumn);
});
