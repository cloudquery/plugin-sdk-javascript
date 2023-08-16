import { Utf8 as ArrowString } from '@apache-arrow/esnext-esm';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Text implements Scalar<Nullable<string>> {
  private _valid = false;
  private _value: Nullable<string> = null;

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

  public get value(): Nullable<string> {
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

    if (typeof value === 'string') {
      this._value = value;
      this._valid = true;
      return;
    }

    if (value instanceof Uint8Array) {
      this._value = new TextDecoder().decode(value);
      this._valid = true;
      return;
    }

    if (value instanceof Text) {
      this._value = value.value;
      this._valid = value.valid;
      return;
    }

    if (typeof value!.toString === 'function' && value!.toString !== Object.prototype.toString) {
      this._value = value!.toString();
      this._valid = true;
      return;
    }

    throw new FormatError(`Unable to set Text from value`, { props: { value } });
  }

  public toString() {
    if (this._valid) {
      return this._value!;
    }

    return NULL_VALUE;
  }
}
