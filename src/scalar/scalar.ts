import { DataType, Precision } from '@apache-arrow/esnext-esm';

import { JSONType } from '../types/json.js';
import { UUIDType } from '../types/uuid.js';

import { Bool } from './bool.js';
import { Date } from './date.js';
import { Float32 } from './float32.js';
import { Float64 } from './float64.js';
import { Int16 } from './int16.js';
import { Int32 } from './int32.js';
import { Int64 } from './int64.js';
import { JSON as JSONScalar } from './json.js';
import { List } from './list.js';
import { Text } from './text.js';
import { Timestamp } from './timestamp.js';
import { Uint16 } from './uint16.js';
import { Uint32 } from './uint32.js';
import { Uint64 } from './uint64.js';
import { UUID } from './uuid.js';

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
    if (dataType.isSigned) {
      switch (dataType.bitWidth) {
        case 16: {
          return new Int16();
        }
        case 32: {
          return new Int32();
        }
        default: {
          return new Int64();
        }
      }
    }

    switch (dataType.bitWidth) {
      case 16: {
        return new Uint16();
      }
      case 32: {
        return new Uint32();
      }
      default: {
        return new Uint64();
      }
    }
  }

  if (DataType.isFloat(dataType)) {
    switch (dataType.precision) {
      // TODO: case Precision.HALF: {
      // }
      case Precision.SINGLE: {
        return new Float32();
      }
      default: {
        return new Float64();
      }
    }
  }

  if (DataType.isDecimal(dataType)) {
    // TODO: Add Decimal support
    return new Float64();
  }

  if (DataType.isTimestamp(dataType)) {
    return new Timestamp(dataType.unit);
  }

  if (DataType.isList(dataType)) {
    const childScalar = newScalar(dataType.valueType);
    return new List(childScalar);
  }

  if (DataType.isDate(dataType)) {
    return new Date(dataType.unit);
  }

  if (dataType instanceof UUIDType) {
    return new UUID();
  }

  if (dataType instanceof JSONType) {
    return new JSONScalar();
  }

  return new Text();
};
