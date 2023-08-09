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

    switch (typeof value) {
      case 'object':
        if (value !== undefined && 
            value !== null && 
            Object.hasOwn(value,'toString')) {
          this._value = value.toString();
          this._valid = true;
          return;
        }    
      case 'string':
        if (typeof value === 'string' || value instanceof String) {
          this._value = value.toString();
          this._valid = true;
          return;
        }
      default:
        throw new Error(`Unable to set '${value}' as Text`);
    }    
  }
  
  public toString = () : string => {
    if (this._valid) {
      return this._value.toString();
    }

    return NULL_VALUE;
  }
}
