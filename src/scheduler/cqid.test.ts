import test from 'ava';
import { NIL as NIL_UUID } from 'uuid';

import { createColumn } from '../schema/column.js';
import { addCQIDsColumns, cqIDColumn } from '../schema/meta.js';
import { Resource } from '../schema/resource.js';
import { createTable } from '../schema/table.js';

import { setCQId } from './cqid.js';

test('setCQId - should set to random value if deterministicCQId is false', (t): void => {
  const resource = new Resource(
    addCQIDsColumns(
      createTable({
        name: 'table1',
        columns: [
          createColumn({ name: 'pk1', primaryKey: true, unique: true, notNull: true }),
          createColumn({ name: 'pk2', primaryKey: true, unique: true, notNull: true }),
          createColumn({ name: 'pk3', primaryKey: true, unique: true, notNull: true }),
          createColumn({ name: 'non_pk' }),
        ],
      }),
    ),
    null,
    null,
  );

  setCQId(resource, false, () => NIL_UUID);

  t.is(resource.getColumnData(cqIDColumn.name).valid, true);
  t.is(resource.getColumnData(cqIDColumn.name).value.toString(), NIL_UUID);
});

test('setCQId - should set to random value if deterministicCQId is true and table does not have non _cq_id PKs', (t): void => {
  const resource = new Resource(
    addCQIDsColumns(
      createTable({
        name: 'table1',
        columns: [
          createColumn({ name: 'pk1', primaryKey: false, unique: true, notNull: true }),
          createColumn({ name: 'pk2', primaryKey: false, unique: true, notNull: true }),
          createColumn({ name: 'pk3', primaryKey: false, unique: true, notNull: true }),
          createColumn({ name: 'non_pk' }),
        ],
      }),
    ),
    null,
    null,
  );

  setCQId(resource, true, () => NIL_UUID);

  t.is(resource.getColumnData(cqIDColumn.name).valid, true);
  t.is(resource.getColumnData(cqIDColumn.name).value.toString(), NIL_UUID);
});

test('setCQId - should set to fixed value if deterministicCQId is true and table has non _cq_id PKs', (t): void => {
  const resource = new Resource(
    addCQIDsColumns(
      createTable({
        name: 'table1',
        columns: [
          createColumn({ name: 'pk1', primaryKey: true, unique: true, notNull: true }),
          createColumn({ name: 'pk2', primaryKey: true, unique: true, notNull: true }),
          createColumn({ name: 'pk3', primaryKey: true, unique: true, notNull: true }),
          createColumn({ name: 'non_pk' }),
        ],
      }),
    ),
    null,
    null,
  );

  resource.setColumData('pk1', 'pk1-value');
  resource.setColumData('pk2', 'pk2-value');
  resource.setColumData('pk3', 'pk3-value');
  resource.setColumData('non_pk', 'non-pk-value');

  setCQId(resource, true);

  t.is(resource.getColumnData(cqIDColumn.name).valid, true);
  t.is(resource.getColumnData(cqIDColumn.name).value.toString(), '415bd5dd-9bac-5806-b9d1-c53f17d37455');
});
