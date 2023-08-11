import { Utf8 as ArrowString } from '@apache-arrow/esnext-esm';
import { validate } from 'uuid';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class UUID implements Scalar<string> {
  private _valid = false;
  private _value = '';

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType() {
    return new ArrowString();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): string {
    return this._value;
  }

  public set value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (typeof value === 'string') {
      this._value = value;
      this._valid = validate(value);
      return;
    }

    if (value instanceof Uint8Array) {
      this._value = new TextDecoder().decode(value);
      this._valid = validate(this._value);
      return;
    }

    if (value instanceof UUID) {
      this._value = value.value;
      this._valid = value.valid;
      return;
    }

    if (typeof value!.toString === 'function' && value!.toString !== Object.prototype.toString) {
      this._value = value!.toString();
      this._valid = validate(this._value);
      return;
    }

    throw new Error(`Unable to set '${value}' as UUID`);
  }

  public toString() {
    if (this._valid) {
      return this._value;
    }

    return NULL_VALUE;
  }
}
