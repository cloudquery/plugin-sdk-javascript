import { DataType, Utf8, Int64, Bool } from '@apache-arrow/esnext-esm';
import { JSONType } from '../types/json.js';
import { Column } from '../schema/column.js';

interface Field {
  type?: string;
  [key: string]: any;
}

function oapiTypeToArrowType(field: Field): DataType {
  const oapiType = field.type;
  switch (oapiType) {
    case 'string':
      return new Utf8();
    case 'number':
    case 'integer':
      return new Int64();
    case 'boolean':
      return new Bool();
    case 'array':
    case 'object':
      return new JSONType();
    default:
      if (!oapiType && '$ref' in field) {
        return new JSONType();
      } else {
        return new Utf8();
      }
  }
}

export function getColumnByName(columns: Column[], name: string): Column | null {
  for (let column of columns) {
    if (column.name === name) {
      return column;
    }
  }
  return null;
}

export function oapiDefinitionToColumns(definition: any, overrideColumns: Column[] = []): Column[] {
  let columns: Column[] = [];
  for (let key in definition.properties) {
    const value = definition.properties[key];
    const columnType = oapiTypeToArrowType(value);
    let column = new Column(key, columnType, value.description);
    const overrideColumn = getColumnByName(overrideColumns, key);
    if (overrideColumn) {
      column.type = overrideColumn.type;
      column.primary_key = overrideColumn.primary_key;
      column.unique = overrideColumn.unique;
    }
    columns.push(column);
  }
  return columns;
}
