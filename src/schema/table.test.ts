import test from 'ava';

import { filterTables, createTable } from './table.js';

const tableA = createTable({ name: 'a' });
const tableC = createTable({ name: 'c' });
const tableB = createTable({ name: 'b', relations: [tableC] });

const allTables = [tableA, tableB];

const testCases = [
  {
    name: 'should return all tables when * is specified',
    allTables,
    tables: ['*'],
    skipTables: [],
    skipDependentTables: false,
    expected: [tableA, tableB, tableC],
  },
  {
    name: 'should skip tables when * and skipTables are specified',
    allTables,
    tables: ['*'],
    skipTables: ['a'],
    skipDependentTables: false,
    expected: [tableB, tableC],
  },
  {
    name: 'should skip tables when skipTables is specified',
    allTables,
    tables: ['a'],
    skipTables: ['b'],
    skipDependentTables: false,
    expected: [tableA],
  },
  {
    name: 'should return only specified tables',
    allTables,
    tables: ['a'],
    skipTables: [],
    skipDependentTables: false,
    expected: [tableA],
  },
  {
    name: 'should return parent and child if child is specified',
    allTables,
    tables: ['c'],
    skipTables: [],
    skipDependentTables: false,
    expected: [tableB, tableC],
  },
  {
    name: 'should skip dependent tables when skipDependentTables is specified',
    allTables,
    tables: ['*'],
    skipTables: [],
    skipDependentTables: true,
    expected: [tableA, tableB],
  },
  {
    name: 'should error when child is included, but parent skipped',
    allTables,
    tables: ['c'],
    skipTables: ['b'],
    skipDependentTables: false,
    expected: [],
    expectedError: `Can't skip parent table when child table is included. Skipped parents are: b`,
  },
];

testCases.forEach((testCase) => {
  test(`filterTables - ${testCase.name}`, (t) => {
    const { allTables, tables, skipTables, skipDependentTables, expected, expectedError } = testCase;
    if (expectedError) {
      t.throws(() => filterTables(allTables, tables, skipTables, skipDependentTables), { message: expectedError });
      return;
    }
    const actual = filterTables(allTables, tables, skipTables, skipDependentTables);
    t.deepEqual(
      actual.map(({ name }) => name),
      expected.map(({ name }) => name),
    );
  });
});
