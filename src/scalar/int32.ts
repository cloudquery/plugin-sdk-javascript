import { DataType, Int32 as ArrowInt32 } from '@apache-arrow/esnext-esm';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';
import {bigIntToNumber} from "@apache-arrow/esnext-esm/util/bigint.js";

export class Int32 implements Scalar<bigint> {
  private _valid = false;
  private _value: bigint = BigInt(0);

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowInt32();
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

    if (value instanceof Int32) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'bigint') {
      if (!this.validInt32(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int32`);
      }
      this._value = value;
      this._valid = true;
      return;
    }

    if (typeof value === 'number') {
      const v = BigInt(value);
      if (!this.validInt32(v)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int32`);
      }
      this._value = v;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Int32`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }

  validInt32(n: bigint) {
    const num = bigIntToNumber(n);
    return Number.isSafeInteger(num) && num >= -2_147_483_648 && num <= 2_147_483_647;
  }
}
