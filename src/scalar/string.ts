import { Utf8 as ArrowString } from '@apache-arrow/esnext-esm';
import { boolean, isBooleanable } from 'boolean';

import { isInvalid, NULL_VALUE } from './util.js';

export class String {
  private _valid = false;
  private _value = "";

  public constructor(v: unknown) {
    this.Valid = v;
    return this;
  }

  public get DataType() {
    return new ArrowString();
  }

  public get Valid(): boolean {
    return this._valid;
  }

  public get Value(): string {
    return this._value;
  }

  public set Valid(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof String) {
      this._valid = value.Valid;
      this._value = value.Value;
      return;
    }
    
    if (typeof value === 'string' || value instanceof String) {
      this._value = this.toString();
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as String`);
  }

  public toString() {
    if (this._valid) {
      return this._value.toString();
    }

    return NULL_VALUE;
  }
}
