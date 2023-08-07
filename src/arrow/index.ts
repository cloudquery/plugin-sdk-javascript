import { makeVector, vectorFromArray, Dictionary, Uint8, Utf8 } from '@apache-arrow/esnext-esm';

export const testArrow = () => {
  const uft8Vector = vectorFromArray(['foo', 'bar', 'baz'], new Utf8());

  const dictionaryVector1 = vectorFromArray(['foo', 'bar', 'baz', 'foo', 'bar']);

  const dictionaryVector2 = makeVector({
    data: [0, 1, 2, 0, 1], // indexes into the dictionary
    dictionary: uft8Vector,
    type: new Dictionary(new Utf8(), new Uint8()),
  });

  return {
    uft8Vector,
    dictionaryVector1,
    dictionaryVector2,
  };
};
