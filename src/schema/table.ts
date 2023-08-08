import { Writable } from 'node:stream';

import { Column } from './column.js';
import { ClientMeta } from './meta.js';
import { Resource } from './resource.js';
import { Nullable } from './types.js';

export type TableResolver = (clientMeta: ClientMeta, parent: Nullable<Resource>, stream: Writable) => void;
export type RowResolver = (clientMeta: ClientMeta, resource: Resource) => void;
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
