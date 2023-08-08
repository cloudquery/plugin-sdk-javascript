import { Utf8 as ArrowString } from '@apache-arrow/esnext-esm';

import { isInvalid, NULL_VALUE } from './util.js';

export class Text {
  private _valid = false;
  private _value = "";

  public constructor(v: unknown) {
    this.Value = v
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

  public set Value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }
    if (typeof value === 'string' || value instanceof String) {
      this._value = value.toString();
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
