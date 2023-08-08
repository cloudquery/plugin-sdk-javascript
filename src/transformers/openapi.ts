import { DataType, Utf8, Int64, Bool } from '@apache-arrow/esnext-esm';

import { Column } from '../schema/column.js';
import { JSONType } from '../types/json.js';

interface OAPIProperty {
  type?: string;
  description?: string;
  $ref?: string;
  items?: {
    $ref: string;
  };
}

interface OAPIDefinition {
  properties: {
    [key: string]: OAPIProperty;
  };
}

function oapiTypeToArrowType(field: OAPIProperty): DataType {
  const oapiType = field.type;
  switch (oapiType) {
    case 'string': {
      return new Utf8();
    }
    case 'number':
    case 'integer': {
      return new Int64();
    }
    case 'boolean': {
      return new Bool();
    }
    case 'array':
    case 'object': {
      return new JSONType();
    }
    default: {
      return !oapiType && '$ref' in field ? new JSONType() : new Utf8();
    }
  }
}

export function getColumnByName(columns: Column[], name: string): Column | undefined {
  for (const column of columns) {
    if (column.name === name) {
      return column;
    }
  }
  return undefined;
}

export function oapiDefinitionToColumns(definition: OAPIDefinition, overrideColumns: Column[] = []): Column[] {
  const columns: Column[] = [];
  for (const key in definition.properties) {
    const value = definition.properties[key];
    const columnType = oapiTypeToArrowType(value);
    const column = new Column(key, columnType, value.description);
    const overrideColumn = getColumnByName(overrideColumns, key);
    if (overrideColumn) {
      column.type = overrideColumn.type;
      column.primaryKey = overrideColumn.primaryKey;
      column.unique = overrideColumn.unique;
    }
    columns.push(column);
  }
  return columns;
}
