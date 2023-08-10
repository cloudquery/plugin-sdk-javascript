import { Utf8 as ArrowString } from '@apache-arrow/esnext-esm';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Text implements Scalar<string> {
  private _valid = false;
  private _value = '';

  public constructor(v: unknown) {
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
      this._valid = true;
      return;
    }

    if (value instanceof Uint8Array) {
      this._value = new TextDecoder().decode(value);
      this._valid = true;
      return;
    }

    if (typeof value!.toString === 'function' && value!.toString !== Object.prototype.toString) {
      this._value = value!.toString();
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Text`);
  }

  public toString() {
    if (this._valid) {
      return this._value.toString();
    }

    return NULL_VALUE;
  }
}
