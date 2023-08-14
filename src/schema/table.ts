import type { Writable } from 'node:stream';

import type { RecordBatch } from '@apache-arrow/esnext-esm';
import { Table as ArrowTable, tableFromIPC, tableToIPC, Schema } from '@apache-arrow/esnext-esm';
import { isMatch } from 'matcher';

import * as arrow from './arrow.js';
import type { Column } from './column.js';
import { fromArrowField, toArrowField } from './column.js';
import type { ClientMeta } from './meta.js';
import type { Resource } from './resource.js';
import type { Nullable } from './types.js';

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
  multiplexer = (client) => [client],
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

const getAllChildren = (table: Table): Table[] => {
  return table.relations.flatMap((relation) => [relation, ...getAllChildren(relation)]);
};

const filterByNamesRecursive = (tables: Table[], names: string[]): Table[] => {
  const filtered = tables
    .filter((table) => names.includes(table.name))
    .map((table) => ({ ...table, relations: filterByNamesRecursive(table.relations, names) }));
  return filtered;
};

const deduplicate = (tables: Table[]): Table[] => {
  return tables.filter((table, index, array) => array.findIndex((t) => t.name === table.name) === index);
};

export const filterTables = (
  tables: Table[],
  include: string[],
  skip: string[],
  skipDependantTables: boolean,
): Table[] => {
  const flattened = flattenTables(tables);

  const withIncludes = flattened.filter((table) => isMatch(table.name, include));

  // Include all children of included tables if skipDependantTables is false
  const withChildren = skipDependantTables
    ? withIncludes
    : deduplicate(withIncludes.flatMap((table) => [table, ...getAllChildren(table)]));

  // If a child was included, include the parent as well
  const withParents = deduplicate(withChildren.flatMap((table) => [...getAllParents(table), table]));

  const withSkipped = withParents.filter((table) => {
    return !isMatch(table.name, skip) && !getAllParents(table).some((parent) => isMatch(parent.name, skip));
  });

  const skippedParents = withParents
    .filter((table) => table.parent && !withSkipped.includes(table.parent))
    .map((table) => table.parent!.name);

  if (skippedParents.length > 0) {
    throw new Error(
      `Can't skip parent table when child table is included. Skipped parents are: ${skippedParents.join(', ')}`,
    );
  }

  const filtered = filterByNamesRecursive(
    tables,
    withSkipped.map((table) => table.name),
  );
  return filtered;
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
