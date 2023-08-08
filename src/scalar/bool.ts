import { Bool as ArrowBool } from '@apache-arrow/esnext-esm';
import { boolean, isBooleanable } from 'boolean';

import { isInvalid, NULL_VALUE } from './util.js';

export class Bool {
  private _valid = false;
  private _value = false;

  public constructor(v: unknown) {
    this.valid = v;
    return this;
  }

  public get dataType() {
    return new ArrowBool();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): boolean {
    return this._value;
  }

  public set valid(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof Bool) {
      this._valid = value.valid;
      this._value = value.value;
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
