import { Type, DataType } from '@apache-arrow/esnext-esm';

import { ExtensionType } from './extensions.js';

export class JSONType extends DataType<Type.Binary> implements ExtensionType {
  get name(): string {
    return 'json';
  }
  get metadata(): string {
    return 'json-serialized';
  }

  get typeId(): Type.Binary {
    return Type.Binary;
  }
}
