import test from 'ava';

import { createTable } from '../schema/table.js';

import { getRoundRobinTableClients } from './scheduler.js';

test('getRoundRobinTableClients', (t): void => {
  const client = { id: () => 'client_0' };
  const tables = [
    createTable({
      name: 'table1',
      multiplexer: () => {
        return Array.from({ length: 2 }).map((_, index) => ({
          id: () => `client_${index}`,
        }));
      },
    }),
    createTable({
      name: 'table2',
      multiplexer: () => {
        return Array.from({ length: 4 }).map((_, index) => ({
          id: () => `client_${index}`,
        }));
      },
    }),
    createTable({
      name: 'table3',
      multiplexer: () => {
        return Array.from({ length: 1 }).map((_, index) => ({
          id: () => `client_${index}`,
        }));
      },
    }),
    createTable({
      name: 'table4',
      multiplexer: () => {
        return [];
      },
    }),
  ];

  const tableClients = getRoundRobinTableClients(tables, client);
  t.is(tableClients.length, 7);
  t.is(tableClients[0].table.name, 'table1');
  t.is(tableClients[0].client.id(), 'client_0');
  t.is(tableClients[1].table.name, 'table2');
  t.is(tableClients[1].client.id(), 'client_0');
  t.is(tableClients[2].table.name, 'table3');
  t.is(tableClients[2].client.id(), 'client_0');
  t.is(tableClients[3].table.name, 'table1');
  t.is(tableClients[3].client.id(), 'client_1');
  t.is(tableClients[4].table.name, 'table2');
  t.is(tableClients[4].client.id(), 'client_1');
  t.is(tableClients[5].table.name, 'table2');
  t.is(tableClients[5].client.id(), 'client_2');
  t.is(tableClients[6].table.name, 'table2');
  t.is(tableClients[6].client.id(), 'client_3');
});
