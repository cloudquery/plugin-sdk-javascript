import { DataType, List as ArrowList } from '@apache-arrow/esnext-esm';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

type TVector<T extends Scalar<unknown>> = T[];

export class List<T extends Scalar<unknown>> implements Scalar<TVector<T>> {
  private _type: new (value?: unknown) => T;
  private _valid = false;
  private _value: TVector<T> = [];

  constructor(scalarType: new (value?: unknown) => T, initialValue?: unknown) {
    this._type = scalarType;
    if (!isInvalid(initialValue)) this.value = initialValue;
  }

  get dataType(): DataType {
    return new ArrowList(this._type.prototype.dataType);
  }

  set value(inputValue: unknown) {
    if (isInvalid(inputValue)) {
      this._valid = false;
      this._value = [];
      return;
    }

    const inputArray = Array.isArray(inputValue) ? inputValue : [inputValue];
    const temporaryVector: TVector<T> = [];

    if (inputArray.length > 0) {
      const firstItemScalar = new this._type();
      firstItemScalar.value = inputArray[0];
      const firstItemType = Object.getPrototypeOf(firstItemScalar).constructor;

      for (const item of inputArray) {
        const scalar = new this._type();
        scalar.value = item;

        if (Object.getPrototypeOf(scalar).constructor !== firstItemType) {
          throw new Error(
            `Type mismatch: All items should be of the same type as the first item. Expected type ${
              firstItemType.name
            }, but got ${Object.getPrototypeOf(scalar).constructor.name}`,
          );
        }

        temporaryVector.push(scalar);
      }

      this._value = temporaryVector;
      this._valid = true; // List becomes valid if we successfully process values
      return;
    }

    this._valid = true; // An empty list is valid
  }

  get valid(): boolean {
    return this._valid;
  }

  get value(): TVector<T> {
    return this._value;
  }

  toString(): string {
    if (!this._valid) {
      return NULL_VALUE;
    }
    return `[${this._value.map((v) => v.toString()).join(', ')}]`;
  }

  get length(): number {
    return this._value.length;
  }

  // If you need an equality method, you can add an equals method similar to the Python __eq__
  equals(other: List<T>): boolean {
    if (!other) return false;
    if (this.constructor !== other.constructor) return false;
    if (this._valid !== other.valid) return false;
    return JSON.stringify(this._value) === JSON.stringify(other.value); // crude equality check for objects, might need refinement.
  }
}
