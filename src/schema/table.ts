import { Writable } from 'node:stream';

import { Table as ArrowTable, tableFromIPC, tableToIPC, Schema, RecordBatch } from '@apache-arrow/esnext-esm';
import { isMatch } from 'matcher';

import * as arrow from './arrow.js';
import { Column, fromArrowField, toArrowField } from './column.js';
import { ClientMeta } from './meta.js';
import { Resource } from './resource.js';
import { Nullable } from './types.js';

export type TableResolver = (clientMeta: ClientMeta, parent: Nullable<Resource>, stream: Writable) => Promise<void>;
export type RowResolver = (clientMeta: ClientMeta, resource: Resource) => Promise<void>;
export type Multiplexer = (clientMeta: ClientMeta) => ClientMeta[];
export type Transform = (table: Table) => void;

export type Table = {
  name: string;
  title: string;
  description: string;
  columns: Column[];
  relations: Table[];
  transform: Transform;
  resolver: TableResolver;
  multiplexer: Multiplexer;
  postResourceResolver: RowResolver;
  preResourceResolver: RowResolver;
  isIncremental: boolean;
  ignoreInTests: boolean;
  parent: Nullable<Table>;
  pkConstraintName: string;
};

export const createTable = ({
  name = '',
  title = '',
  description = '',
  columns = [],
  relations = [],
  transform = () => {},
  resolver = () => Promise.resolve(),
  multiplexer = () => [],
  postResourceResolver = () => Promise.resolve(),
  preResourceResolver = () => Promise.resolve(),
  isIncremental = false,
  ignoreInTests = false,
  parent = null,
  pkConstraintName = '',
}: Partial<Table> = {}): Table => ({
  name,
  title,
  description,
  columns,
  relations,
  transform,
  resolver,
  multiplexer,
  postResourceResolver,
  preResourceResolver,
  isIncremental,
  ignoreInTests,
  parent,
  pkConstraintName,
});

export const getTablesNames = (tables: Table[]) => tables.map((table) => table.name);
export const getTopLevelTableByName = (tables: Table[], name: string): Table | undefined =>
  tables.find((table) => table.name === name);

export const getTableByName = (tables: Table[], name: string): Table | undefined => {
  const table = tables.find((table) => table.name === name);
  if (table) {
    return table;
  }
  for (const table of tables) {
    const found = getTableByName(table.relations, name);
    if (found) {
      return found;
    }
  }
};

export const getPrimaryKeys = (table: Table): string[] => {
  return table.columns.filter((column) => column.primaryKey).map((column) => column.name);
};

export const flattenTables = (tables: Table[]): Table[] => {
  return tables.flatMap((table) => [table, ...flattenTables(table.relations.map((c) => ({ ...c, parent: table })))]);
};

export const getAllParents = (table: Table): Table[] => {
  if (table.parent === null) {
    return [];
  }
  return [table.parent, ...getAllParents(table.parent)];
};

export const filterTables = (
  tables: Table[],
  include: string[],
  skip: string[],
  skipDependantTables: boolean,
): Table[] => {
  const flattened = flattenTables(tables);

  const withIncludes = flattened.filter((table) => {
    return isMatch(table.name, include) || getAllParents(table).some((parent) => isMatch(parent.name, include));
  });
  // If a child was included, include the parent as well
  const withParents = withIncludes
    .flatMap((table) => [...getAllParents(table), table])
    .filter((value, index, array) => array.indexOf(value) === index);

  const withSkipped = withParents.filter((table) => {
    return !isMatch(table.name, skip) && !getAllParents(table).some((parent) => isMatch(parent.name, skip));
  });

  const withSkipDependant = withSkipped.filter((table) => table.parent === null || !skipDependantTables);

  const skippedParents = withParents
    .filter((table) => table.parent && !withSkipDependant.includes(table.parent))
    .map((table) => table.parent!.name);

  if (skippedParents.length > 0) {
    throw new Error(
      `Can't skip parent table when child table is included. Skipped parents are: ${skippedParents.join(', ')}`,
    );
  }

  return withSkipDependant;
};

export const toArrowSchema = (table: Table): Schema => {
  const metadata = new Map<string, string>();
  metadata.set(arrow.METADATA_TABLE_NAME, table.name);
  metadata.set(arrow.METADATA_TABLE_DESCRIPTION, table.description);
  metadata.set(arrow.METADATA_TABLE_TITLE, table.title);
  metadata.set(arrow.METADATA_CONSTRAINT_NAME, table.pkConstraintName);
  if (table.isIncremental) {
    metadata.set(arrow.METADATA_INCREMENTAL, arrow.METADATA_TRUE);
  }
  if (table.parent) {
    metadata.set(arrow.METADATA_TABLE_DEPENDS_ON, table.parent.name);
  }
  const fields = table.columns.map((c) => toArrowField(c));
  return new Schema(fields, metadata);
};

export const fromArrowSchema = (schema: Schema): Table => {
  return createTable({
    name: schema.metadata.get(arrow.METADATA_TABLE_NAME) || '',
    title: schema.metadata.get(arrow.METADATA_TABLE_TITLE) || '',
    description: schema.metadata.get(arrow.METADATA_TABLE_DESCRIPTION) || '',
    pkConstraintName: schema.metadata.get(arrow.METADATA_CONSTRAINT_NAME) || '',
    isIncremental: schema.metadata.get(arrow.METADATA_INCREMENTAL) === arrow.METADATA_TRUE,
    // dependencies: schema.metadata.get(arrow.METADATA_TABLE_DEPENDS_ON) || '',
    columns: schema.fields.map((f) => fromArrowField(f)),
  });
};

export const encodeTable = (table: Table): Uint8Array => {
  const schema = toArrowSchema(table);
  const arrowTable = new ArrowTable(schema);
  return tableToIPC(arrowTable);
};

export const encodeTables = (tables: Table[]): Uint8Array[] => {
  return tables.map((table) => encodeTable(table));
};

export const decodeTable = (bytes: Uint8Array): Table => {
  const arrowTable = tableFromIPC(bytes);
  return fromArrowSchema(arrowTable.schema);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decodeRecord = (bytes: Uint8Array): [string, RecordBatch<any>[]] => {
  const arrowTable = tableFromIPC(bytes);
  return [(arrowTable.schema.metadata.get(arrow.METADATA_TABLE_NAME) || '')!, arrowTable.batches];
};
