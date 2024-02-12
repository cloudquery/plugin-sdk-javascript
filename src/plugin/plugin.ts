import type { Logger } from 'winston';

import { UnimplementedError, InitializationError } from '../errors/errors.js';
import type { SyncStream, ReadStream, WriteStream } from '../grpc/plugin.js';
import type { Table } from '../schema/table.js';

export type BackendOptions = {
  tableName: string;
  connection: string;
};

export type TableOptions = {
  tables: string[];
  skipTables: string[];
  skipDependentTables: boolean;
};

export type SyncOptions = {
  tables: string[];
  skipTables: string[];
  skipDependentTables: boolean;
  deterministicCQId: boolean;
  backendOptions: BackendOptions;
  stream: SyncStream;
};

export type NewClientOptions = {
  noConnection: boolean;
};

export type NewClientFunction = (logger: Logger, spec: string, options: NewClientOptions) => Promise<Client>;

export type PluginKind = 'source' | 'destination';

export type BuildTarget = {
  os: 'linux' | 'darwin' | 'windows';
  arch: 'amd64' | 'arm64';
};

export type PluginOptions = {
  team: string;
  kind: PluginKind;
  dockerFile?: string;
  buildTargets?: BuildTarget[];
  jsonSchema?: string;
};

export interface SourceClient {
  tables: (options: TableOptions) => Promise<Table[]>;
  sync: (options: SyncOptions) => void;
}

export interface DestinationClient {
  read: (stream: ReadStream) => void;
  write: (stream: WriteStream) => Promise<void>;
}

export interface Client extends SourceClient, DestinationClient {
  close: () => Promise<void>;
}

export interface Plugin extends Client {
  getLogger: () => Logger;
  setLogger: (logger: Logger) => void;
  name: () => string;
  version: () => string;
  team: () => string | undefined;
  kind: () => PluginKind | undefined;
  jsonSchema: () => string | undefined;
  dockerFile: () => string;
  buildTargets: () => BuildTarget[];
  init: (spec: string, options: NewClientOptions) => Promise<void>;
}

export const newUnimplementedSource = (): SourceClient => {
  return {
    tables: () => Promise.reject(new UnimplementedError('unimplemented', { props: { method: 'tables' } })),
    sync: () => Promise.reject(new UnimplementedError('unimplemented', { props: { method: 'sync' } })),
  };
};

export const newUnimplementedDestination = (): DestinationClient => {
  return {
    read: () => Promise.reject(new UnimplementedError('unimplemented', { props: { method: 'read' } })),
    write: () => Promise.reject(new UnimplementedError('unimplemented', { props: { method: 'write' } })),
  };
};

const defaultBuildTargets: BuildTarget[] = [
  { os: 'linux', arch: 'amd64' },
  { os: 'linux', arch: 'arm64' },
];

export const newPlugin = (
  name: string,
  version: string,
  newClient: NewClientFunction,
  options?: PluginOptions,
): Plugin => {
  const plugin = {
    client: undefined as Client | undefined,
    logger: undefined as Logger | undefined,
    name: () => name,
    version: () => version,
    team: () => options?.team,
    kind: () => options?.kind,
    jsonSchema: () => options?.jsonSchema,
    dockerFile: () => options?.dockerFile || 'Dockerfile',
    buildTargets: () => options?.buildTargets || defaultBuildTargets,
    write: (stream: WriteStream) => {
      return plugin.client?.write(stream) ?? Promise.reject(new InitializationError('client not initialized'));
    },
    read: (stream: ReadStream) => {
      return plugin.client?.read(stream) ?? new InitializationError('client not initialized');
    },
    getLogger: () => {
      return plugin.logger!;
    },
    setLogger: (logger: Logger) => {
      plugin.logger = logger;
    },
    sync: (options: SyncOptions) => {
      return plugin.client?.sync(options) ?? new InitializationError('client not initialized');
    },
    tables: (options: TableOptions) => {
      return plugin.client?.tables(options) ?? Promise.reject(new InitializationError('client not initialized'));
    },
    init: async (spec: string, options: NewClientOptions) => {
      plugin.client = await newClient(plugin.logger!, spec, options);
    },
    close: () => plugin.client?.close() ?? Promise.reject(new InitializationError('client not initialized')),
  };

  return plugin;
};
