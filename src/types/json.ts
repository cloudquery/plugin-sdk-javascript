import { Type, DataType } from '@apache-arrow/esnext-esm';

import type { ExtensionType } from './extensions.js';

export class JSONType extends DataType<Type.Binary> implements ExtensionType {
  constructor() {
    super(Type.Binary);
  }

  get name(): string {
    return 'json';
  }
  get metadata(): string {
    return 'json-serialized';
  }

  toString(): string {
    return this.name;
  }
}
