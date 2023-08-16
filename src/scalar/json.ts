import { Utf8 as ArrowString } from '@apache-arrow/esnext-esm';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

const validate = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

class JSONType implements Scalar<Nullable<Uint8Array>> {
  private _valid = false;
  private _value: Nullable<Uint8Array> = null;

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

  public get value(): Nullable<Uint8Array> {
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

    if (value instanceof JSONType) {
      this._value = value.value;
      this._valid = value.valid;
      return;
    }

    try {
      this._value = new TextEncoder().encode(JSON.stringify(value));
      this._valid = true;
    } catch (error) {
      throw new FormatError(`Unable to set JSON from value`, { cause: error, props: { value } });
    }
  }

  public toString() {
    if (this._valid) {
      return new TextDecoder().decode(this._value);
    }

    return NULL_VALUE;
  }
}

export { JSONType as JSON };
