import { DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Bool } from './bool.js';

// eslint-disable-next-line unicorn/no-null
[null, undefined].forEach((v) => {
  test(`should set values to false when ${v} is passed`, (t) => {
    const b = new Bool(v);
    t.is(b.valid, false);
    t.true(DataType.isBool(b.dataType));
  });
});

[1, true, 'true', 'Y', 'y', 'TRUE', 'on', new Bool(true)].forEach((v, index) => {
  test(`should support truthy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.is(b.valid, true);
    t.is(b.value, true);
    t.true(DataType.isBool(b.dataType));
    t.is(b.toString(), 'true');
  });
});

[0, false, 'false', 'N', 'n', 'FALSE', 'off'].forEach((v, index) => {
  test(`should support falsy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.is(b.valid, true);
    t.is(b.value, false);
    t.true(DataType.isBool(b.dataType));
    t.is(b.toString(), 'false');
  });
});

test('should throw when unable to set value', (t) => {
  t.throws(() => new Bool({ value: {} }), { message: 'Unable to set Bool from value' });
});
