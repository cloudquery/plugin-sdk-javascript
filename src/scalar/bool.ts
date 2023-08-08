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

  public get Valid(): boolean {
    return this._valid;
  }

  public get Value(): boolean {
    return this._value;
  }

  public set Valid(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof Bool) {
      this._valid = value.Valid;
      this._value = value.Value;
      return;
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
