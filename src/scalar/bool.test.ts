import test from 'ava';
import { DataType } from '@apache-arrow/esnext-esm';
import { Bool } from './bool.js';

[null, undefined].forEach((v) => {
  test(`should set values to false when ${v} is passed`, (t) => {
    const b = new Bool(v);
    t.is(b.Valid, false);
    t.true(DataType.isBool(b.DataType));
  });
});

[1, true, 'true', 'Y', 'y', 'TRUE', 'on'].forEach((v, i) => {
  test(`should support truthy value '${v}' (${i})`, (t) => {
    const b = new Bool(v);
    t.is(b.Valid, true);
    t.is(b.Value, true);
    t.true(DataType.isBool(b.DataType));
    t.is(b.toString(), 'true');
  });
});

[0, false, 'false', 'N', 'n', 'FALSE', 'off'].forEach((v, i) => {
  test(`should support falsy value '${v}' (${i})`, (t) => {
    const b = new Bool(v);
    t.is(b.Valid, true);
    t.is(b.Value, false);
    t.true(DataType.isBool(b.DataType));
    t.is(b.toString(), 'false');
  });
});
