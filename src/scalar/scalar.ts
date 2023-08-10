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
    return new Bool();
  }
  if (DataType.isInt(dataType)) {
    return new Int64();
  }
  if (DataType.isFloat(dataType)) {
    return new Float64();
  }
  if (DataType.isTimestamp(dataType)) {
    return new Timestamp();
  }

  return new Text();
};
