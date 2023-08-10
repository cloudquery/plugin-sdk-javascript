import { DataType, Int64 as ArrowInt64 } from '@apache-arrow/esnext-esm';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Int64 implements Scalar<bigint> {
  private _valid = false;
  private _value: bigint = BigInt(0);

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowInt64();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): bigint {
    return this._value;
  }

  public set value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof Int64) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'bigint') {
      this._value = value;
      this._valid = true;
      return;
    }

    if (typeof value === 'number') {
      if (!Number.isSafeInteger(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int64`);
      }
      this._value = BigInt(value);
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Int64`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }
}
