import { DataType, Field } from '@apache-arrow/esnext-esm';
import * as arrow from './arrow.js';

export class Column {
  name: string;
  type: DataType;
  description: string;
  primary_key: boolean;
  not_null: boolean;
  incremental_key: boolean;
  unique: boolean;

  constructor(
    name: string,
    type: DataType,
    description: string = '',
    primary_key: boolean = false,
    not_null: boolean = false,
    incremental_key: boolean = false,
    unique: boolean = false,
  ) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.primary_key = primary_key;
    this.not_null = not_null;
    this.incremental_key = incremental_key;
    this.unique = unique;
  }

  toString(): string {
    return `Column(name=${this.name}, type=${this.type}, description=${this.description}, primary_key=${this.primary_key}, not_null=${this.not_null}, incremental_key=${this.incremental_key}, unique=${this.unique})`;
  }

  // JavaScript (and TypeScript) uses a single method for both string representation and debugging output
  toJSON(): string {
    return this.toString();
  }

  equals(value: any): boolean {
    if (value instanceof Column) {
      return (
        this.name === value.name &&
        this.type === value.type &&
        this.description === value.description &&
        this.primary_key === value.primary_key &&
        this.not_null === value.not_null &&
        this.incremental_key === value.incremental_key &&
        this.unique === value.unique
      );
    }
    return false;
  }

  toArrowField(): Field {
    const metadataMap = new Map<string, string>();
    metadataMap.set(arrow.METADATA_PRIMARY_KEY, this.primary_key ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);
    metadataMap.set(arrow.METADATA_UNIQUE, this.unique ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);
    metadataMap.set(arrow.METADATA_INCREMENTAL, this.incremental_key ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);

    return new Field(this.name, this.type, /*nullable=*/ !this.not_null, metadataMap);
  }

  static fromArrowField(field: Field): Column {
    const metadata = field.metadata;
    const primary_key = metadata.get(arrow.METADATA_PRIMARY_KEY) === arrow.METADATA_TRUE;
    const unique = metadata.get(arrow.METADATA_UNIQUE) === arrow.METADATA_TRUE;
    const incremental_key = metadata.get(arrow.METADATA_INCREMENTAL) === arrow.METADATA_TRUE;

    return new Column(field.name, field.type, '', primary_key, !field.nullable, unique, incremental_key);
  }
}
