import { Utf8, Int64, Bool, List, Field, Float64, DataType } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Column, createColumn } from '../schema/column.js';
import { JSONType } from '../types/json.js';

import { objectToColumns } from './transform.js';

test('should parse object as expected', (t) => {
  const expectedColumns: Column[] = [
    createColumn({
      name: 'string',
      type: new Utf8(),
    }),
    createColumn({
      name: 'number',
      type: new Int64(),
    }),
    createColumn({
      name: 'float',
      type: new Float64(),
    }),
    createColumn({
      name: 'boolean',
      type: new Bool(),
    }),
    createColumn({
      name: 'object',
      type: new JSONType(),
    }),
    createColumn({
      name: 'array',
      type: new List(new Field('element', new Utf8())),
    }),
  ];

  const columns = objectToColumns({
    string: 'test',
    number: 1,
    float: 3.14,
    boolean: false,
    object: { inner: 'foo' },
    array: ['foo', 'bar'],
  });
  t.deepEqual(columns, expectedColumns);
});

test('should parse object with custom types', (t) => {
  const expectedColumns: Column[] = [
    createColumn({
      name: 'string',
      type: new Utf8(),
    }),
    createColumn({
      name: 'float',
      type: new Float64(),
    }),
  ];

  const columns = objectToColumns(
    {
      string: 'test',
      float: 1,
    },
    {
      getTypeFromValue: function (key: string, value: unknown): DataType | null | undefined {
        if (key === 'float') return new Float64();
        return undefined;
      },
    },
  );
  t.deepEqual(columns, expectedColumns);
});

test('should parse object with custom types and allow skip columns in type transformer', (t) => {
  const expectedColumns: Column[] = [
    createColumn({
      name: 'string',
      type: new Utf8(),
    }),
  ];

  const columns = objectToColumns(
    {
      string: 'test',
      skip: 'test',
    },
    {
      getTypeFromValue: function (key: string, value: unknown): DataType | null | undefined {
        return key === 'skip' ? null : undefined;
      },
    },
  );
  t.deepEqual(columns, expectedColumns);
});

test('should parse object and skip columns', (t) => {
  const expectedColumns: Column[] = [
    createColumn({
      name: 'string',
      type: new Utf8(),
    }),
  ];

  const columns = objectToColumns(
    {
      string: 'test',
      skip: 'test',
    },
    {
      skipColumns: ['skip'],
    },
  );
  t.deepEqual(columns, expectedColumns);
});

test('should parse object and set PKs', (t) => {
  const expectedColumns: Column[] = [
    createColumn({
      name: 'id',
      type: new Utf8(),
      primaryKey: true,
    }),
    createColumn({
      name: 'string',
      type: new Utf8(),
    }),
  ];

  const columns = objectToColumns(
    {
      id: 'the-id',
      string: 'test',
    },
    {
      primaryKeys: ['id'],
    },
  );
  t.deepEqual(columns, expectedColumns);
});

test('should allow direct overrides', (t) => {
  const expectedColumns: Column[] = [
    createColumn({
      name: 'id',
      type: new Utf8(),
      notNull: true,
      unique: true,
    }),
    createColumn({
      name: 'string',
      type: new Utf8(),
    }),
  ];

  const columns = objectToColumns(
    {
      id: 'the-id',
      string: 'test',
    },
    {
      overrides: new Map<string, Column>([
        [
          'id',
          createColumn({
            name: 'id',
            type: new Utf8(),
            notNull: true,
            unique: true,
          }),
        ],
      ]),
    },
  );
  t.deepEqual(columns, expectedColumns);
});
