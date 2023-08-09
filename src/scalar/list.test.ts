import test from 'ava';

import { Int64 } from './int64.js';
import { List } from './list.js';

test('list', (t) => {
  const l = new List(Int64);
  t.deepEqual(l, new List(Int64));

  l.value = [new Int64(17), new Int64(19), new Int64(null)];
  t.is(l.length, 3);
});

test('list equality', (t) => {
  const l1 = new List(Int64);
  l1.value = [new Int64(17), new Int64(19), new Int64(null)];

  const l2 = new List(Int64);
  l2.value = [new Int64(17), new Int64(19), new Int64(null)];

  t.deepEqual(l1, l2);
});

test('list inequality', (t) => {
  const l1 = new List(Int64);
  l1.value = new Int64(4);

  const l2 = new List(Int64);
  l2.value = new Int64(7);

  t.notDeepEqual(l1, l2);
});

test('list equality when invalid', (t) => {
  const l1 = new List(Int64);
  l1.value = new Int64(null);

  const l2 = new List(Int64);
  l2.value = new Int64(null);

  t.deepEqual(l1, l2);
});
