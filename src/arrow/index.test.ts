import test from 'ava';
import { testArrow } from './';

test('testArrow', (t) => {
  const vectors = testArrow();
  t.not(vectors, undefined);
});
