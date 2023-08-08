import { isDeepStrictEqual } from 'node:util';

import { DataType, Field, Bool } from '@apache-arrow/esnext-esm';

import * as arrow from './arrow.js';

export type Column = {
  name: string;
  type: DataType;
  description: string;
  primaryKey: boolean;
  notNull: boolean;
  incrementalKey: boolean;
  unique: boolean;
};

export const createColumn = ({
  name = '',
  type = new Bool(),
  description = '',
  incrementalKey = false,
  notNull = false,
  primaryKey = false,
  unique = false,
}: Partial<Column> = {}): Column => ({
  name,
  type,
  description,
  primaryKey,
  notNull,
  incrementalKey,
  unique,
});

export const formatColumn = (column: Column): string => {
  const { name, type, description, primaryKey, notNull, incrementalKey, unique } = column;
  return `Column(name=${name}, type=${type}, description=${description}, primary_key=${primaryKey}, not_null=${notNull}, incremental_key=${incrementalKey}, unique=${unique})`;
};

export const equals = (column: Column, other: unknown): boolean => {
  return isDeepStrictEqual(column, other);
};

export const toArrowField = (column: Column): Field => {
  const { name, type, notNull, primaryKey, unique, incrementalKey } = column;
  const metadataMap = new Map<string, string>();
  metadataMap.set(arrow.METADATA_PRIMARY_KEY, primaryKey ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);
  metadataMap.set(arrow.METADATA_UNIQUE, unique ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);
  metadataMap.set(arrow.METADATA_INCREMENTAL, incrementalKey ? arrow.METADATA_TRUE : arrow.METADATA_FALSE);

  return new Field(name, type, /*nullable=*/ !notNull, metadataMap);
};

export const fromArrowField = (field: Field): Column => {
  const { name, type, nullable } = field;
  const metadata = field.metadata;
  const primaryKey = metadata.get(arrow.METADATA_PRIMARY_KEY) === arrow.METADATA_TRUE;
  const unique = metadata.get(arrow.METADATA_UNIQUE) === arrow.METADATA_TRUE;
  const incrementalKey = metadata.get(arrow.METADATA_INCREMENTAL) === arrow.METADATA_TRUE;

  return {
    name,
    type,
    description: '',
    primaryKey,
    notNull: !nullable,
    unique,
    incrementalKey,
  };
};
