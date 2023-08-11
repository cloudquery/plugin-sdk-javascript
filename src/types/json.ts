import { DataType, Type } from '@apache-arrow/esnext-esm';

export class JSONType extends DataType<Type.Utf8> {
  readonly extensionName: string = 'json';

  constructor() {
    super();
  }

  get typeId(): Type.Utf8 {
    return Type.Utf8;
  }
}
