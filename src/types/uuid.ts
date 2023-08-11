import { DataType, Type } from '@apache-arrow/esnext-esm';

export class UUIDType extends DataType<Type.Utf8> {
  readonly extensionName: string = 'uuid';

  constructor() {
    super();
  }

  get typeId(): Type.Utf8 {
    return Type.Utf8;
  }

  public toString() {
    return `uuid`;
  }

  protected static [Symbol.toStringTag] = ((proto: UUIDType) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>proto).ArrayType = Uint8Array;
    return (proto[Symbol.toStringTag] = 'uuid');
  })(UUIDType.prototype);
}
