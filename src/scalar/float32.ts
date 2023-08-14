import type { DataType } from '@apache-arrow/esnext-esm';
import { Float32 as ArrowFloat32 } from '@apache-arrow/esnext-esm';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Float32 implements Scalar<number> {
  private _valid = false;
  private _value: number = 0;

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowFloat32();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): number {
    return this._value;
  }

  public set value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof Float32) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'number') {
      if (!this.validFloat32(value)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Float32`);
      }

      this._value = value;
      this._valid = true;
      return;
    }

    const floatValue = Number.parseFloat(String(value));
    if (!Number.isNaN(floatValue)) {
      if (!this.validFloat32(floatValue)) {
        throw new TypeError(`Value '${value}' cannot be safely converted to Float32`);
      }

      this._value = floatValue;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Float32`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }

  validFloat32(n: number) {
    const float32 = new Float32Array(1);
    float32[0] = n;
    return float32[0] === n;
  }
}
