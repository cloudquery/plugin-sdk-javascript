import { DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Text } from './text.js';

for (const v of [null, undefined, new Text()]) {
  test(`should set values to null string when ${v} is passed`, (t) => {
    const s = new Text(v);
    t.is(s.value, null);
    t.false(s.valid);
    t.true(DataType.isUtf8(s.dataType));
  });
}

for (const [index, { value, expected }] of [
  { value: '', expected: '' },
  { value: 'test string', expected: 'test string' },
  { value: 'new string object', expected: 'new string object' },
  { value: new Text('new text object'), expected: 'new text object' },
  { value: new TextEncoder().encode('test'), expected: 'test' },
].entries()) {
  test(`valid strings: '${value}' (${index})`, (t) => {
    const s = new Text(value);
    t.true(s.valid);
    t.is(s.value, expected);
    t.true(DataType.isUtf8(s.dataType));
  });
}

test('should throw when unable to set value', (t) => {
  t.throws(() => new Text({ value: {} }), { message: 'Unable to set Text from value' });
});
