import { FixedSizeBinary } from '@apache-arrow/esnext-esm';

import type { ExtensionType } from './extensions.js';

export class UUIDType extends FixedSizeBinary implements ExtensionType {
  constructor() {
    super(16);
  }

  get name(): string {
    return 'uuid';
  }
  get metadata(): string {
    return 'uuid-serialized';
  }

  toString(): string {
    return this.name;
  }
}
