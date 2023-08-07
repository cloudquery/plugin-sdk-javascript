import { Bool as ArrowBool } from '@apache-arrow/esnext-esm';
import { boolean, isBooleanable } from 'boolean';
import { isInvalid, NULL_VALUE } from './util.js';

export class Bool {
  private _valid = false;
  private _value = false;

  public constructor(v: unknown) {
    this.Valid = v;
    return this;
  }

  public get DataType() {
    return new ArrowBool();
  }

  public get Valid() {
    return this._valid;
  }

  public get Value() {
    return this._value;
  }

  public set Valid(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    let val = value;
    // Check if this might be a scalar boolean
    if (Object.hasOwnProperty.call(value, 'value')) {
      val = (value as { value: unknown }).value;
    }

    if (isBooleanable(value)) {
      this._value = boolean(value);
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Bool`);
  }

  public toString() {
    if (this._valid) {
      return String(this._value);
    }

    return NULL_VALUE;
  }
}
