import { Utf8, Int64, Bool } from '@apache-arrow/esnext-esm';
import test from 'ava';

import type { Column } from '../schema/column.js';
import { createColumn } from '../schema/column.js';
import { JSONType } from '../types/json.js';

import { oapiDefinitionToColumns } from './openapi.js';

const OAPI_SPEC = {
  swagger: '2.0',
  info: {
    version: '2.0',
    title: 'Test API',
    description: 'Unit tests APIs',
  },
  host: 'cloudquery.io',
  schemes: ['https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  paths: {},
  definitions: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TestDefinition: {
      type: 'object',
      properties: {
        string: {
          type: 'string',
        },
        number: {
          type: 'number',
        },
        integer: {
          type: 'integer',
        },
        boolean: {
          type: 'boolean',
        },
        object: {
          $ref: '#/definitions/SomeDefinition',
        },
        array: {
          type: 'array',
          items: { $ref: '#/definitions/SomeDefinition' },
        },
      },
    },
  },
};

test('should parse spec as expected', (t) => {
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
      name: 'integer',
      type: new Int64(),
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
      type: new JSONType(),
    }),
  ];

  const columns = oapiDefinitionToColumns(OAPI_SPEC['definitions']['TestDefinition']);
  t.deepEqual(columns, expectedColumns);
});
