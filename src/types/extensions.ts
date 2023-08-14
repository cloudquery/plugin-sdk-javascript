import { DataType } from '@apache-arrow/esnext-esm';

import { JSONType } from './json.js';
import { UUIDType } from './uuid.js';

export interface ExtensionType {
  get name(): string;
  get metadata(): string;
}

const extensions = [JSONType, UUIDType];

export const isExtensionType = (type: DataType) => extensions.some((extension) => type instanceof extension);
