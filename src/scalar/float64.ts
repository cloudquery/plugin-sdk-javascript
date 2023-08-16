import type { DataType } from '@apache-arrow/esnext-esm';
import { Float64 as ArrowFloat64 } from '@apache-arrow/esnext-esm';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Float64 implements Scalar<Nullable<number>> {
  private _valid = false;
  private _value: Nullable<number> = null;

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowFloat64();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): Nullable<number> {
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

    throw new FormatError(`Unable to set Float64 from value`, { props: { value } });
  }

  public toString() {
    if (this._valid) {
      return String(this._value!);
    }

    return NULL_VALUE;
  }
}
