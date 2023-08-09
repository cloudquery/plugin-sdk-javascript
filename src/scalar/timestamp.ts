import { DataType, Timestamp as ArrowTimestamp } from '@apache-arrow/esnext-esm';
import { DateTime } from 'luxon';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Timestamp implements Scalar<DateTime> {
  private _valid = false;
  private _value: DateTime = DateTime.fromMillis(0);

  public constructor(v: unknown) {
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowTimestamp();
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get value(): DateTime {
    return this._value;
  }

  public set value(value: unknown) {
    if (isInvalid(value)) {
      this._valid = false;
      return;
    }

    if (value instanceof Timestamp) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    let dateValue: DateTime | null = null;

    if (typeof value === 'string') {
      dateValue = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSSSSSSSS ZZZZ', { setZone: true });

      if (!dateValue.isValid) {
        dateValue = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSSSSSSSS', { zone: 'utc' });
      }

      if (!dateValue.isValid) {
        dateValue = DateTime.fromFormat(value, "yyyy-MM-dd HH:mm:ss.SSSSSSSSS'Z'", { zone: 'utc' });
      }

      if (!dateValue.isValid) {
        dateValue = DateTime.fromISO(value, { setZone: true });
      }
    }

    if (dateValue && dateValue.isValid) {
      this._value = dateValue;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Timestamp`);
  }

  public toString() {
    if (this._valid) {
      return this._value.toISO();
    }

    return NULL_VALUE;
  }

  public equals(scalar: Timestamp): boolean {
    if (!scalar) {
      return false;
    }
    if (scalar instanceof Timestamp) {
      return this._value.equals(scalar.value) && this._valid === scalar.valid;
    }
    return false;
  }
}
