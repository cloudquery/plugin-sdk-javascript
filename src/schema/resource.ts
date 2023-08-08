import { Scalar, Vector } from '../scalar/scalar.js';

import { Table } from './table.js';
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
    // TODO: Init from table columns
    this.data = [];
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
