import { DataType, Uint16 as ArrowUint16 } from '@apache-arrow/esnext-esm';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Uint16 implements Scalar<bigint> {
  private _valid = false;
  private _value: bigint = BigInt(0);

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowUint16();
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

    if (value instanceof Uint16) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'bigint') {
      if (!this.validUint16(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Uint16`);
      }
      this._value = value;
      this._valid = true;
      return;
    }

    if (typeof value === 'number') {
      const v = BigInt(value);
      if (!this.validUint16(v)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Uint16`);
      }
      this._value = v;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Uint16`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }

  validUint16(n: bigint) {
    return Number.isSafeInteger(n) && n >= 0 && n <= 65_535;
  }
}