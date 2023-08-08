import { Utf8, Int64, Bool } from '@apache-arrow/esnext-esm';
import test from 'ava';

import { Column } from '../schema/column.js';
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
    new Column('string', new Utf8(), ''),
    new Column('number', new Int64(), ''),
    new Column('integer', new Int64(), ''),
    new Column('boolean', new Bool(), ''),
    new Column('object', new JSONType(), ''),
    new Column('array', new JSONType(), ''),
  ];

  const columns = oapiDefinitionToColumns(OAPI_SPEC['definitions']['TestDefinition']);
  t.deepEqual(columns, expectedColumns);
});
