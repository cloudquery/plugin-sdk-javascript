import { tableToIPC, Table as ArrowTable, vectorFromArray } from '@apache-arrow/esnext-esm';

import { Scalar, Vector, newScalar } from '../scalar/scalar.js';

import { Table, toArrowSchema } from './table.js';
import { Nullable } from './types.js';

export class Resource {
  item: unknown;
  parent: Nullable<Resource>;
  table: Table;
  data: Vector;

  constructor(table: Table, parent: Nullable<Resource>, item: unknown) {
    this.table = table;
    this.parent = parent;
    this.item = item;
    this.data = table.columns.map((column) => newScalar(column.type));
  }

  getColumnData(columnName: string): Scalar<unknown> {
    const columnIndex = this.table.columns.findIndex((c) => c.name === columnName);
    if (columnIndex === undefined) {
      throw new Error(`Column '${columnName}' not found`);
    }
    return this.data[columnIndex];
  }

  setColumData(columnName: string, value: unknown): void {
    const columnIndex = this.table.columns.findIndex((c) => c.name === columnName);
    if (columnIndex === undefined) {
      throw new Error(`Column '${columnName}' not found`);
    }
    this.data[columnIndex].value = value;
  }

  getItem(): unknown {
    return this.item;
  }

  setItem(item: unknown): void {
    this.item = item;
  }
}

export const encodeResource = (resource: Resource): Uint8Array => {
  const { table } = resource;
  const schema = toArrowSchema(table);
  const arrowTable = new ArrowTable(schema);
  for (let index = 0; index < table.columns.length; index++) {
    const column = table.columns[index];
    const data = resource.getColumnData(column.name);
    const vector = vectorFromArray([data], column.type);
    arrowTable.setChildAt(index, vector);
  }
  const bytes = tableToIPC(arrowTable);
  return bytes;
};
