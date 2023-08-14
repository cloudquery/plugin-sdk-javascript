import { FixedSizeBinary } from '@apache-arrow/esnext-esm';
import { validate } from 'uuid';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class UUID implements Scalar<Uint8Array> {
  private _valid = false;
  private _value = new TextEncoder().encode(NULL_VALUE);

  public constructor(v?: unknown) {
    this.value = v;
  }

  public get dataType() {
    return new FixedSizeBinary(16);
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): Uint8Array {
    return this._value;
  }

  public set value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (typeof value === 'string') {
      this._value = new TextEncoder().encode(value);
      this._valid = validate(value);
      return;
    }

    if (value instanceof Uint8Array) {
      this._value = value;
      this._valid = validate(new TextDecoder().decode(value));
      return;
    }

    if (value instanceof UUID) {
      this._value = value.value;
      this._valid = value.valid;
      return;
    }

    if (typeof value!.toString === 'function' && value!.toString !== Object.prototype.toString) {
      this._value = Buffer.from(value!.toString());
      this._valid = validate(value!.toString());
      return;
    }

    throw new Error(`Unable to set '${value}' as UUID`);
  }

  public toString() {
    if (this._valid) {
      return new TextDecoder().decode(this._value);
    }

    return NULL_VALUE;
  }
}
