import test from 'ava';
import { getServer } from '.';

test('getServer', (t) => {
  const serve = getServer();
  t.not(serve, undefined);
  t.pass();
});
