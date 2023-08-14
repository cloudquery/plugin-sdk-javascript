import type { DataType } from '@apache-arrow/esnext-esm';
import { Field, Utf8, Int64, Float64, Bool, List } from '@apache-arrow/esnext-esm';

import type { Column } from '../schema/column.js';
import { createColumn } from '../schema/column.js';
import { JSONType } from '../types/json.js';

function defaultGetTypeFromValue(key: string, value: unknown): DataType | null {
  switch (typeof value) {
    case 'string': {
      return new Utf8();
    }
    case 'number': {
      return value % 1 === 0 ? new Int64() : new Float64();
    }
    case 'boolean': {
      return new Bool();
    }
    case 'object': {
      if (Array.isArray(value)) {
        if (value.length === 0) return new JSONType(); // Empty array, can't infer type

        // Assuming array of same type, getting type of first element
        const elementType = defaultGetTypeFromValue(key + '.element', value[0]);
        if (elementType === null) return new JSONType();

        const field = new Field('element', elementType); // 'element' can be any name as it's just for internal representation
        return new List(field);
      } else {
        return new JSONType();
      }
    }
    default: {
      throw new Error(`Unsupported type: ${typeof value}`);
    }
  }
}

type Options = {
  skipColumns?: string[];
  primaryKeys?: string[];
  getTypeFromValue?: (key: string, value: unknown) => DataType | null | undefined;
  overrides?: Map<string, Column>;
};

export function objectToColumns(
  object: Record<string, unknown>,
  {
    skipColumns = [],
    primaryKeys = [],
    getTypeFromValue = defaultGetTypeFromValue,
    overrides = new Map(),
  }: Options = {},
): Column[] {
  return Object.entries(object)
    .filter(([key]) => !skipColumns.includes(key))
    .map(([key, value]): Column | null => {
      if (overrides.has(key)) {
        return overrides.get(key)!;
      }

      let type = getTypeFromValue(key, value);
      if (type === undefined && getTypeFromValue !== defaultGetTypeFromValue) {
        type = defaultGetTypeFromValue(key, value);
      }
      if (type === null || type === undefined) return null;

      const isPrimaryKey = primaryKeys.includes(key);

      return createColumn({ name: key, type, primaryKey: isPrimaryKey });
    })
    .filter((column): column is Column => column !== null); // This is a type-guard
}
