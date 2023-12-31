import { FixedSizeBinary } from '@apache-arrow/esnext-esm';
import { parse, stringify } from 'uuid';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class UUID implements Scalar<Nullable<Uint8Array>> {
  private _valid = false;
  private _value: Nullable<Uint8Array> = null;

  public constructor(v?: unknown) {
    this.value = v;
  }

  public get dataType() {
    return new FixedSizeBinary(16);
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): Nullable<Uint8Array> {
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
      // parse throws on invalid uuids
      this._value = parse(value);
      this._valid = true;
      return;
    }

    if (value instanceof Uint8Array) {
      this._value = value;
      this._valid = true;
      return;
    }

    if (value instanceof UUID) {
      this._value = value.value;
      this._valid = value.valid;
      return;
    }

    if (typeof value!.toString === 'function' && value!.toString !== Object.prototype.toString) {
      // parse throws on invalid uuids
      this._value = parse(value!.toString());
      this._valid = true;
      return;
    }

    throw new FormatError(`Unable to set UUID from value`, { props: { value } });
  }

  public toString() {
    if (this._valid) {
      return stringify(this._value!);
    }

    return NULL_VALUE;
  }
}
