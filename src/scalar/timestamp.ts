import type { DataType } from '@apache-arrow/esnext-esm';
import { Timestamp as ArrowTimestamp, TimeUnit } from '@apache-arrow/esnext-esm';
import { DateTime } from 'luxon';

import type { Scalar } from './scalar.js';
import { isInvalid, NULL_VALUE } from './util.js';

export class Timestamp implements Scalar<DateTime> {
  private _valid = false;
  private _value: DateTime = DateTime.fromMillis(0);
  private _unit: TimeUnit = TimeUnit.NANOSECOND;

  public constructor(v?: unknown, unit?: TimeUnit) {
    this.value = v;
    if (unit) {
      this._unit = unit;
    }
    return this;
  }

  public get dataType(): DataType {
    return new ArrowTimestamp(this._unit);
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

  public toString(): string {
    if (this._valid) {
      return this._value.toISO()!;
    }

    return NULL_VALUE;
  }
}
