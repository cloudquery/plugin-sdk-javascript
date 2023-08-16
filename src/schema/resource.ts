import { tableToIPC, Table as ArrowTable, RecordBatch, vectorFromArray } from '@apache-arrow/esnext-esm';

import { ResourceError } from '../errors/errors.js';
import type { Scalar, Vector } from '../scalar/scalar.js';
import { newScalar } from '../scalar/scalar.js';
import { isExtensionType } from '../types/extensions.js';

import { cqIDColumn } from './meta.js';
import type { Table } from './table.js';
import { toArrowSchema } from './table.js';
import type { Nullable } from './types.js';

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
      throw new ResourceError(`Column '${columnName}' not found`, { props: { resource: this } });
    }
    return this.data[columnIndex];
  }

  setColumData(columnName: string, value: unknown): void {
    const columnIndex = this.table.columns.findIndex((c) => c.name === columnName);
    if (columnIndex === undefined) {
      throw new ResourceError(`Column '${columnName}' not found`, { props: { resource: this } });
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
    // For extension types, we need to get the underlying value
    const data = isExtensionType(column.type)
      ? resource.getColumnData(column.name).value
      : resource.getColumnData(column.name);

    const vector = vectorFromArray([data], column.type);
    batch = batch.setChildAt(index, vector);
  }
  const arrowTable = new ArrowTable(schema, batch);
  const bytes = tableToIPC(arrowTable);
  return bytes;
};

export type ResourceType = Resource;
