import type { DataType } from '@apache-arrow/esnext-esm';
import { List as ArrowList } from '@apache-arrow/esnext-esm';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

type TVector<T extends Scalar<unknown>> = T[];

export class List<T extends Scalar<unknown>> implements Scalar<Nullable<TVector<T>>> {
  private _childScalarInstance: T;
  private _valid = false;
  private _value: Nullable<TVector<T>> = null;

  constructor(childScalarInstance: T, initialValue?: TVector<T>) {
    this._childScalarInstance = childScalarInstance;

    if (!isInvalid(initialValue)) {
      this._value = initialValue!.map((value) => {
        const instance = Object.create(this._childScalarInstance);
        instance.value = value;
        return instance;
      });
    }
  }

  get dataType(): DataType {
    return new ArrowList(this._childScalarInstance.dataType.ArrayType);
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
      this._childScalarInstance.value = inputArray[0];
      const firstItemType = Object.getPrototypeOf(this._childScalarInstance).constructor;

      for (const item of inputArray) {
        try {
          this._childScalarInstance.value = item;
        } catch {
          throw new FormatError(
            `Type mismatch: All items should be of the same type as the first item. Expected type ${firstItemType.name}`,
            { props: { value: inputValue } },
          );
        }

        // Here, instead of creating a new scalar, we clone the existing instance with the current value
        const scalarClone = Object.create(this._childScalarInstance);
        scalarClone.value = item;
        temporaryVector.push(scalarClone);
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

  get value(): Nullable<TVector<T>> {
    if (!this._valid) {
      return null;
    }
    return this._value;
  }

  toString(): string {
    if (!this._valid) {
      return NULL_VALUE;
    }
    return `[${this._value!.map((v) => v.toString()).join(', ')}]`;
  }

  get length(): number {
    if (!this._valid) {
      return 0;
    }
    return this._value!.length;
  }

  // If you need an equality method, you can add an equals method similar to the Python __eq__
  equals(other: List<T>): boolean {
    if (!other) return false;
    if (this.constructor !== other.constructor) return false;
    if (this._valid !== other.valid) return false;
    return JSON.stringify(this._value) === JSON.stringify(other.value); // crude equality check for objects, might need refinement.
  }
}
