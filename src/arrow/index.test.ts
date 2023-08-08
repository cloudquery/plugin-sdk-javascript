import test from 'ava';

import { testArrow } from './index.js';

test('testArrow', (t) => {
  const vectors = testArrow();
  t.not(vectors, undefined);
});
