import type { DataType } from '@apache-arrow/esnext-esm';
import { Uint64 as ArrowUint64 } from '@apache-arrow/esnext-esm';
import { bigIntToNumber } from '@apache-arrow/esnext-esm/util/bigint.js';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Uint64 implements Scalar<Nullable<bigint>> {
  private _valid = false;
  private _value: Nullable<bigint> = null;

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowUint64();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): Nullable<bigint> {
    if (!this._valid) {
      return null;
    }
    return this._value;
  }

  public set value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof Uint64) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'bigint') {
      if (!this.validUint64(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Uint64`);
      }
      this._value = value;
      this._valid = true;
      return;
    }

    if (typeof value === 'number') {
      const v = BigInt(value);
      if (!this.validUint64(v)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Uint64`);
      }
      this._value = v;
      this._valid = true;
      return;
    }

    throw new FormatError(`Unable to set Uint64 from value`, { props: { value } });
  }

  public toString() {
    if (this._valid) {
      return String(this._value!);
    }

    return NULL_VALUE;
  }

  validUint64(n: bigint) {
    return Number.isSafeInteger(bigIntToNumber(n)) && n >= 0 && n <= 18_446_744_073_709_551_615n;
  }
}
