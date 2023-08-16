import type { DataType, DateUnit } from '@apache-arrow/esnext-esm';
import { Date_ as ArrowDate } from '@apache-arrow/esnext-esm';
import { DateTime } from 'luxon';

import { FormatError } from '../errors/errors.js';
import type { Nullable } from '../schema/types.js';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Date implements Scalar<Nullable<globalThis.Date>> {
  private _valid = false;
  private _value: Nullable<globalThis.Date> = null;
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

  public get value(): Nullable<globalThis.Date> {
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

    if (value instanceof DateTime) {
      dateValue = value;
    }

    if (value instanceof globalThis.Date) {
      dateValue = DateTime.fromJSDate(value, { zone: 'utc' });
    }

    if (dateValue && dateValue.isValid) {
      this._value = dateValue.toJSDate();
      this._valid = true;
      return;
    }

    throw new FormatError(`Unable to set Date from value`, { props: { value } });
  }

  public toString(): string {
    if (this._valid) {
      return this._value!.toISOString();
    }

    return NULL_VALUE;
  }
}
