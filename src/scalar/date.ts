import { DataType, Date_ as ArrowDate, DateUnit } from '@apache-arrow/esnext-esm';
import { DateTime } from 'luxon';

import { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Date implements Scalar<DateTime> {
  private _valid = false;
  private _value: DateTime = DateTime.fromMillis(0);
  private _unit: DateUnit;

  public constructor(unit: DateUnit, v?: unknown) {
    this._unit = unit;
    this.value = v;
    return this;
  }

  public get dataType(): DataType {
    return new ArrowDate(this._unit);
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

    if (value instanceof Date && value.dataType === this.dataType) {
      this._valid = value.valid;
      this._value = value.value;
      return;
    }

    let dateValue: DateTime | null = null;

    if (typeof value === 'string') {
      dateValue = DateTime.fromISO(value, { setZone: true });

      if (!dateValue.isValid) {
        dateValue = DateTime.fromFormat(value, 'yyyy-MM-dd', { zone: 'utc' });
      }
    }

    if (dateValue && dateValue.isValid) {
      this._value = dateValue;
      this._valid = true;
      return;
    }

    throw new Error(`Unable to set '${value}' as Date`);
  }

  public toString(): string {
    if (this._valid) {
      return this._value.toISO()!;
    }

    return NULL_VALUE;
  }
}