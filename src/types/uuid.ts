import { DataType, Type } from '@apache-arrow/esnext-esm';

export class UUIDType extends DataType<Type.Utf8> {
  readonly extensionName: string = 'uuid';

  constructor() {
    super();
  }

  get typeId(): Type.Utf8 {
    return Type.Utf8;
  }
}
