import test from 'ava';

import { createColumn } from './column.js';
import { addCQIDsColumns, cqIDColumn, cqParentIDColumn, parentCqUUIDResolver } from './meta.js';
import { Resource } from './resource.js';
import { createTable } from './table.js';

test('addCQIDsColumns', (t) => {
  const table = createTable({
    name: 'table1',
    columns: [
      createColumn({ name: 'column1', primaryKey: true }),
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
              createColumn({ name: 'column3', primaryKey: true }),
            ],
          }),
        ],
      }),
    ],
  });

  const tableWithCQIDs = addCQIDsColumns(table);

  t.is(tableWithCQIDs.columns.length, 6);
  t.deepEqual(tableWithCQIDs.columns[0], { ...cqIDColumn, primaryKey: false });
  t.deepEqual(tableWithCQIDs.columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[0].columns.length, 4);
  t.deepEqual(tableWithCQIDs.relations[0].columns[0], { ...cqIDColumn, primaryKey: true });
  t.deepEqual(tableWithCQIDs.relations[0].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[1].columns.length, 3);
  t.deepEqual(tableWithCQIDs.relations[1].columns[0], { ...cqIDColumn, primaryKey: true });
  t.deepEqual(tableWithCQIDs.relations[1].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[2].columns.length, 3);
  t.deepEqual(tableWithCQIDs.relations[2].columns[0], { ...cqIDColumn, primaryKey: true });
  t.deepEqual(tableWithCQIDs.relations[2].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[3].columns.length, 3);
  t.deepEqual(tableWithCQIDs.relations[3].columns[0], { ...cqIDColumn, primaryKey: true });
  t.deepEqual(tableWithCQIDs.relations[3].columns[1], cqParentIDColumn);

  t.is(tableWithCQIDs.relations[3].relations[0].columns.length, 5);
  t.deepEqual(tableWithCQIDs.relations[3].relations[0].columns[0], { ...cqIDColumn, primaryKey: false });
  t.deepEqual(tableWithCQIDs.relations[3].relations[0].columns[1], cqParentIDColumn);
});

test('parentCqUUIDResolver - should set to null for null parent', (t) => {
  const table = addCQIDsColumns(createTable({ name: 'table1' }));
  const resource = new Resource(table, null, null);

  parentCqUUIDResolver()({ id: () => '' }, resource, cqParentIDColumn);

  t.is(resource.getColumnData(cqParentIDColumn.name).valid, false);
});

test('parentCqUUIDResolver - should set to null for parent with _cq_id column', (t) => {
  const table = addCQIDsColumns(createTable({ name: 'table1', relations: [createTable({ name: 'table1-child1' })] }));

  const parentResource = new Resource(table, null, null);
  parentResource.setColumData(cqIDColumn.name, null);
  const childResource = new Resource(table.relations[0], parentResource, null);

  parentCqUUIDResolver()({ id: () => '' }, childResource, cqParentIDColumn);

  t.is(childResource.getColumnData(cqParentIDColumn.name).valid, false);
});

test('parentCqUUIDResolver - should set to _cq_id column value when parent has it', (t) => {
  const table = addCQIDsColumns(createTable({ name: 'table1', relations: [createTable({ name: 'table1-child1' })] }));

  const parentResource = new Resource(table, null, null);
  parentResource.setColumData(cqIDColumn.name, '9241a9cb-f580-420f-8fd7-46d2c4f55ccb');
  const childResource = new Resource(table.relations[0], parentResource, null);

  parentCqUUIDResolver()({ id: () => '' }, childResource, cqParentIDColumn);

  const cqParentId = childResource.getColumnData(cqParentIDColumn.name);
  t.is(cqParentId.valid, true);
  t.is(cqParentId.toString(), '9241a9cb-f580-420f-8fd7-46d2c4f55ccb');
});
