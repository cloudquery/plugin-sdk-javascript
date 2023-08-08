import { DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Text } from './text.js';

// eslint-disable-next-line unicorn/no-null
[null, undefined].forEach((v) => {
  test(`should set values to empty string when ${v} is passed`, (t) => {
    const s = new Text(v);
    t.is(s.value, '');
    t.true(DataType.isUtf8(s.dataType));
  });
});

['', 'test string', String('asdf')].forEach((v, index) => {
  test(`valid strings: '${v}' (${index})`, (t) => {
    const s = new Text(v);
    t.is(s.valid, true);
    t.is(s.value, v.toString());
    t.true(DataType.isUtf8(s.dataType));
  });
});

test('should throw when unable to set value', (t) => {
  t.throws(() => new Text({ value: {} }), { message: "Unable to set '[object Object]' as Text" });
});
