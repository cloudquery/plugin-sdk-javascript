import { DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Bool } from './bool.js';

[null, undefined].forEach((v) => {
  test(`should set values to false when ${v} is passed`, (t) => {
    const b = new Bool(v);
    t.false(b.valid);
    t.true(DataType.isBool(b.dataType));
  });
});

[1, true, 'true', 'Y', 'y', 'TRUE', 'on', new Bool(true)].forEach((v, index) => {
  test(`should support truthy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.true(b.valid);
    t.true(b.value);
    t.true(DataType.isBool(b.dataType));
    t.is(b.toString(), 'true');
  });
});

[0, false, 'false', 'N', 'n', 'FALSE', 'off'].forEach((v, index) => {
  test(`should support falsy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.true(b.valid);
    t.false(b.value);
    t.true(DataType.isBool(b.dataType));
    t.is(b.toString(), 'false');
  });
});

test('should throw when unable to set value', (t) => {
  t.throws(() => new Bool({ value: {} }), { message: 'Unable to set Bool from value' });
});
