import { DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Bool } from './bool.js';

for (const v of [null, undefined]) {
  test(`should set values to false when ${v} is passed`, (t) => {
    const b = new Bool(v);
    t.false(b.valid);
    t.true(DataType.isBool(b.dataType));
  });
}

for (const [index, v] of [1, true, 'true', 'Y', 'y', 'TRUE', 'on', new Bool(true)].entries()) {
  test(`should support truthy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.true(b.valid);
    t.true(b.value);
    t.true(DataType.isBool(b.dataType));
    t.is(b.toString(), 'true');
  });
}

for (const [index, v] of [0, false, 'false', 'N', 'n', 'FALSE', 'off'].entries()) {
  test(`should support falsy value '${v}' (${index})`, (t) => {
    const b = new Bool(v);
    t.true(b.valid);
    t.false(b.value);
    t.true(DataType.isBool(b.dataType));
    t.is(b.toString(), 'false');
  });
}

test('should throw when unable to set value', (t) => {
  t.throws(() => new Bool({ value: {} }), { message: 'Unable to set Bool from value' });
});
