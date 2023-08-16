import { Bool as ArrowBool } from '@apache-arrow/esnext-esm';
import { boolean, isBooleanable } from 'boolean';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Bool implements Scalar<Nullable<boolean>> {
  private _valid = false;
  private _value: Nullable<boolean> = null;

  public constructor(v?: unknown) {
    this.value = v;
    return this;
  }

  public get dataType() {
    return new ArrowBool();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): Nullable<boolean> {
    return this._value;
  }

  public set value(value: unknown) {
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

    throw new FormatError(`Unable to set Bool from value`, { props: { value } });
  }

  public toString() {
    if (this._valid) {
      return String(this._value!);
    }

    return NULL_VALUE;
  }
}
