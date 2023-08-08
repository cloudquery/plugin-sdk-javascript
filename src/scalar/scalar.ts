import { DataType } from '@apache-arrow/esnext-esm';

export interface Scalar<T> {
  toString: () => string;
  get valid(): boolean;
  get value(): T;
  set value(value: unknown);
  get dataType(): DataType;
}

export type Vector = Scalar<unknown>[];
