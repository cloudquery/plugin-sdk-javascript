import type { DataType } from '@apache-arrow/esnext-esm';
import { Int16 as ArrowInt16 } from '@apache-arrow/esnext-esm';
import { bigIntToNumber } from '@apache-arrow/esnext-esm/util/bigint.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Int16 implements Scalar<bigint> {
  private _valid = false;
  private _value: bigint = BigInt(0);

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowInt16();
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

    if (value instanceof Int16) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'bigint') {
      if (!this.validInt16(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int16`);
      }
      this._value = value;
      this._valid = true;
      return;
    }

    if (typeof value === 'number') {
      const v = BigInt(value);
      if (!this.validInt16(v)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int16`);
      }
      this._value = v;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Int16`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }

  validInt16(n: bigint) {
    const number_ = bigIntToNumber(n);
    return Number.isSafeInteger(number_) && number_ >= -32_768 && number_ <= 32_767;
  }
}
