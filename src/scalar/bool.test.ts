import test from 'ava';
import { DataType } from '@apache-arrow/esnext-esm';
import { Bool } from './bool.js';

// eslint-disable-next-line unicorn/no-null
[null, undefined].forEach((v) => {
  test(`should set values to false when ${v} is passed`, (t) => {
    const b = new Bool(v);
    t.is(b.Valid, false);
    t.true(DataType.isBool(b.DataType));
  });
});

[1, true, 'true', 'Y', 'y', 'TRUE', 'on', new Bool(true)].forEach((v, index) => {
  test(`should support truthy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.is(b.Valid, true);
    t.is(b.Value, true);
    t.true(DataType.isBool(b.DataType));
    t.is(b.toString(), 'true');
  });
});

[0, false, 'false', 'N', 'n', 'FALSE', 'off'].forEach((v, index) => {
  test(`should support falsy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.is(b.Valid, true);
    t.is(b.Value, false);
    t.true(DataType.isBool(b.DataType));
    t.is(b.toString(), 'false');
  });
});

test('should throw when unable to set value', (t) => {
  t.throws(() => new Bool({ value: {} }), { message: "Unable to set '[object Object]' as Bool" });
});
