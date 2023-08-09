import { DataType, Float64 as ArrowFloat64 } from '@apache-arrow/esnext-esm';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Float64 implements Scalar<number> {
  private _valid = false;
  private _value: number = 0;

  public constructor(v: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowFloat64();
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

    if (value instanceof Float64) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    if (typeof value === 'number') {
      this._value = value;
      this._valid = true;
      return;
    }

    const floatValue = Number.parseFloat(String(value));
    if (!Number.isNaN(floatValue)) {
      this._value = floatValue;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Float64`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }
}
