import { createHash } from 'node:crypto';

import test from 'ava';

import { createColumn } from '../schema/column.js';
import { addCQIDsColumns, cqIDColumn } from '../schema/meta.js';
import { Resource } from '../schema/resource.js';
import { createTable } from '../schema/table.js';

import { setCQId } from './cqid.js';

test('setCQId - should set to random value if deterministicCQId is false', (t): void => {
  const resource = new Resource(addCQIDsColumns(createTable({ name: 'table1' })), null, null);

  setCQId(resource, false, () => 'random');

  t.is(resource.getColumnData(cqIDColumn.name).valid, true);
  t.is(resource.getColumnData(cqIDColumn.name).value.toString(), 'random');
});

test('setCQId - should set to random value if deterministicCQId is true and table does not have non _cq_id PKs', (t): void => {
  const resource = new Resource(addCQIDsColumns(createTable({ name: 'table1' })), null, null);

  setCQId(resource, true, () => 'random');

  t.is(resource.getColumnData(cqIDColumn.name).valid, true);
  t.is(resource.getColumnData(cqIDColumn.name).value.toString(), 'random');
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

  const expectedSha256 = createHash('sha256');
  expectedSha256.update('pk1');
  expectedSha256.update('pk1-value');
  expectedSha256.update('pk2');
  expectedSha256.update('pk2-value');
  expectedSha256.update('pk3');
  expectedSha256.update('pk3-value');

  setCQId(resource, true);

  t.is(resource.getColumnData(cqIDColumn.name).valid, true);
  t.is(resource.getColumnData(cqIDColumn.name).value.toString(), expectedSha256.digest('hex'));
});
