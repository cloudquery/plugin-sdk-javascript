import { DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Text } from './text.js';

// eslint-disable-next-line unicorn/no-null
[null, undefined, new Text()].forEach((v) => {
  test(`should set values to null string when ${v} is passed`, (t) => {
    const s = new Text(v);
    t.is(s.value, null);
    t.is(s.valid, false);
    t.true(DataType.isUtf8(s.dataType));
  });
});

[
  { value: '', expected: '' },
  { value: 'test string', expected: 'test string' },
  { value: String('new string object'), expected: 'new string object' },
  { value: new Text('new text object'), expected: 'new text object' },
  { value: new TextEncoder().encode('test'), expected: 'test' },
].forEach(({ value, expected }, index) => {
  test(`valid strings: '${value}' (${index})`, (t) => {
    const s = new Text(value);
    t.is(s.valid, true);
    t.is(s.value, expected);
    t.true(DataType.isUtf8(s.dataType));
  });
});

test('should throw when unable to set value', (t) => {
  t.throws(() => new Text({ value: {} }), { message: 'Unable to set Text from value' });
});
