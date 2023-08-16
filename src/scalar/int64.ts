import type { DataType } from '@apache-arrow/esnext-esm';
import { Int64 as ArrowInt64 } from '@apache-arrow/esnext-esm';
import { bigIntToNumber } from '@apache-arrow/esnext-esm/util/bigint.js';

import { FormatError } from '../errors/errors.js';

import type { Scalar } from './scalar.js';
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
      if (!this.validInt64(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int64`);
      }
      this._value = value;
      this._valid = true;
      return;
    }

    if (typeof value === 'number') {
      const v = BigInt(value);
      if (!this.validInt64(v)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Int64`);
      }
      this._value = v;
      this._valid = true;
      return;
    }

    throw new FormatError(`Unable to set Int64 from value`, { props: { value } });
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }

  validInt64(n: bigint) {
    const MIN_INT64 = BigInt('-9223372036854775808'); // -2^63
    const MAX_INT64 = BigInt('9223372036854775807'); // 2^63 - 1
    return Number.isSafeInteger(bigIntToNumber(n)) && n >= MIN_INT64 && n <= MAX_INT64;
  }
}
