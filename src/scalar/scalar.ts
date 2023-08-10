import { DataType } from '@apache-arrow/esnext-esm';

import { Bool } from './bool.js';
import { Float64 } from './float64.js';
import { Int64 } from './int64.js';
import { Text } from './text.js';
import { Timestamp } from './timestamp.js';

export interface Scalar<T> {
  toString: () => string;
  get valid(): boolean;
  get value(): T;
  set value(value: unknown);
  get dataType(): DataType;
}

export type Vector = Scalar<unknown>[];

export const newScalar = (dataType: DataType): Scalar<unknown> => {
  if (DataType.isBool(dataType)) {
    return new Bool(false);
  }
  if (DataType.isInt(dataType)) {
    return new Int64(0);
  }
  if (DataType.isFloat(dataType)) {
    return new Float64(0);
  }
  if (DataType.isTimestamp(dataType)) {
    return new Timestamp('1970-01-01T00:00:00.000Z');
  }

  return new Text('');
};
