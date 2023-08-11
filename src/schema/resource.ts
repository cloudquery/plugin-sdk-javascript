import { tableToIPC, Table as ArrowTable, RecordBatch, vectorFromArray } from '@apache-arrow/esnext-esm';

import { Scalar, Vector, newScalar, Stringable } from '../scalar/scalar.js';

import { cqIDColumn } from './meta.js';
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

  getColumnData(columnName: string): Scalar<Stringable> {
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

  setCqId(value: string): void {
    const columnIndex = this.table.columns.findIndex((c) => c.name === cqIDColumn.name);
    if (columnIndex === -1) {
      return;
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
  // TODO: Check if this can be simplified
  let batch = new RecordBatch(schema, undefined);
  for (let index = 0; index < table.columns.length; index++) {
    const column = table.columns[index];
    const data = resource.getColumnData(column.name);
    const vector = vectorFromArray([data], column.type);
    batch = batch.setChildAt(index, vector);
  }
  const arrowTable = new ArrowTable(schema, batch);
  const bytes = tableToIPC(arrowTable);
  return bytes;
};
