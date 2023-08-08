import { DataType, Field } from '@apache-arrow/esnext-esm';

import * as arrow from './arrow.js';

export class Column {
  name: string;
  type: DataType;
  description: string;
  primaryKey: boolean;
  notNull: boolean;
  incrementalKey: boolean;
  unique: boolean;

  constructor(
    name: string,
    type: DataType,
    description: string = '',
    primaryKey: boolean = false,
    notNull: boolean = false,
    incrementalKey: boolean = false,
    unique: boolean = false,
  ) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.primaryKey = primaryKey;
    this.notNull = notNull;
    this.incrementalKey = incrementalKey;
    this.unique = unique;
  }

  toString(): string {
    return `Column(name=${this.name}, type=${this.type}, description=${this.description}, primary_key=${this.primaryKey}, not_null=${this.notNull}, incremental_key=${this.incrementalKey}, unique=${this.unique})`;
  }

  // JavaScript (and TypeScript) uses a single method for both string representation and debugging output
  toJSON(): string {
    return this.toString();
  }

  equals(value: object): boolean {
    if (value instanceof Column) {
      return (
        this.name === value.name &&
        this.type === value.type &&
        this.description === value.description &&
        this.primaryKey === value.primaryKey &&
        this.notNull === value.notNull &&
        this.incrementalKey === value.incrementalKey &&
        this.unique === value.unique
      );
    }
    return false;
  }

  toArrowField(): Field {
    const metadataMap = new Map<string, string>();
    metadataMap.set(arrow.METADATA_PRIMARY_KEY, this.primaryKey ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);
    metadataMap.set(arrow.METADATA_UNIQUE, this.unique ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);
    metadataMap.set(arrow.METADATA_INCREMENTAL, this.incrementalKey ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);

    return new Field(this.name, this.type, /*nullable=*/ !this.notNull, metadataMap);
  }

  static fromArrowField(field: Field): Column {
    const metadata = field.metadata;
    const primaryKey = metadata.get(arrow.METADATA_PRIMARY_KEY) === arrow.METADATA_TRUE;
    const unique = metadata.get(arrow.METADATA_UNIQUE) === arrow.METADATA_TRUE;
    const incrementalKey = metadata.get(arrow.METADATA_INCREMENTAL) === arrow.METADATA_TRUE;

    return new Column(field.name, field.type, '', primaryKey, !field.nullable, unique, incrementalKey);
  }
}
