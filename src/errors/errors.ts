import ModernError from 'modern-errors';
import modernErrorsBugs from 'modern-errors-bugs';

import type { Column } from '../schema/column.js';
import type { ClientMeta } from '../schema/meta.js';
import type { ResourceType } from '../schema/resource.js';
import type { Table } from '../schema/table.js';

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsBugs],
});

export const UnknownError = BaseError.subclass('UnknownError', {
  bugs: 'https://github.com/cloudquery/plugin-sdk-javascript/issues',
});

export const ValidationError = BaseError.subclass('ValidationError', { props: { spec: '' } });
export const TableError = BaseError.subclass('TableError');
export const WriteError = BaseError.subclass('WriteError', { props: { message: '' } });
export const UnimplementedError = BaseError.subclass('UnimplementedError');
export const InitializationError = BaseError.subclass('InitializationError');
export const FormatError = BaseError.subclass('FormatError', { props: { value: undefined as unknown } });
export const ResourceError = BaseError.subclass('ResourceError', {
  props: { resource: undefined as unknown as ResourceType },
});
export const ResolverError = BaseError.subclass('ResolverError', {
  props: {
    column: undefined as unknown as Column,
    resource: undefined as unknown as ResourceType,
  },
});

export const SyncError = BaseError.subclass('SyncError');
export const SyncValidationError = SyncError.subclass('SyncValidationError');
export const SyncColumnResolveError = SyncError.subclass('SyncColumnResolveError', {
  props: {
    column: undefined as unknown as Column,
    table: undefined as unknown as Table,
    resource: undefined as unknown as ResourceType,
    clientMeta: undefined as unknown as ClientMeta,
  },
});
export const SyncPreResolveError = SyncError.subclass('SyncPreResolveError', {
  props: {
    table: undefined as unknown as Table,
    resource: undefined as unknown as ResourceType,
    clientMeta: undefined as unknown as ClientMeta,
  },
});
export const SyncPostResolveError = SyncError.subclass('SyncPostResolveError', {
  props: {
    table: undefined as unknown as Table,
    resource: undefined as unknown as ResourceType,
    clientMeta: undefined as unknown as ClientMeta,
  },
});
export const SyncTableResolveError = SyncError.subclass('SyncTableResolveError', {
  props: {
    table: undefined as unknown as Table,
  },
});

export const TransformError = BaseError.subclass('TransformError', { props: { value: undefined as unknown } });

export const SyncResourceEncodeError = BaseError.subclass('SyncResourceEncodeError', {
  props: {
    resource: undefined as unknown as ResourceType,
  },
});
