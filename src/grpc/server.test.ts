import test from 'ava';
import { getServer } from './server';

test('getServer', (t) => {
  const serve = getServer();
  t.not(serve, undefined);
});
