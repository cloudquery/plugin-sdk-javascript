import { Readable, Writable } from 'node:stream';

import { Logger } from 'winston';

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
  stream: Writable;
};

export type NewClientOptions = {
  noConnection: boolean;
};

export type NewClientFunction = (logger: Logger, spec: string, options: NewClientOptions) => Promise<Client>;

export interface SourceClient {
  close: () => Promise<void>;
  tables: (options: TableOptions) => Promise<string[]>;
  sync: (options: SyncOptions) => void;
}

export interface DestinationClient {
  close: () => Promise<void>;
  read: (stream: Writable) => void;
  write: (stream: Readable) => void;
}

export interface Client extends SourceClient, DestinationClient {}

export interface Plugin {
  name: () => string;
  version: () => string;
  write: (stream: Readable) => void;
  read: (stream: Writable) => void;
  setLogger: (logger: Logger) => void;
  sync: (options: SyncOptions) => void;
  tables: (options: TableOptions) => Promise<string[]>;
  init: (spec: string, options: NewClientOptions) => Promise<void>;
  close: () => Promise<void>;
}

export const newUnimplementedSourceClient = (): SourceClient => {
  return {
    close: () => Promise.reject(new Error('unimplemented')),
    tables: () => Promise.reject(new Error('unimplemented')),
    sync: () => Promise.reject(new Error('unimplemented')),
  };
};

export const newUnimplementedDestinationClient = (): DestinationClient => {
  return {
    close: () => Promise.reject(new Error('unimplemented')),
    read: () => Promise.reject(new Error('unimplemented')),
    write: () => Promise.reject(new Error('unimplemented')),
  };
};

export const newUnimplementedClient: NewClientFunction = (logger: Logger, spec: string, options: NewClientOptions) => {
  return Promise.resolve({
    ...newUnimplementedSourceClient(),
    ...newUnimplementedDestinationClient(),
  });
};

export const newPlugin = (name: string, version: string, newClient: NewClientFunction): Plugin => {
  const plugin = {
    client: undefined as Client | undefined,
    logger: undefined as Logger | undefined,
    name: () => name,
    version: () => version,
    write: (stream: Readable) => plugin.client?.write(stream) ?? new Error('client not initialized'),
    read: (stream: Writable) => plugin.client?.read(stream) ?? new Error('client not initialized'),
    setLogger: (logger: Logger) => {
      plugin.logger = logger;
    },
    sync: (options: SyncOptions) => plugin.client?.sync(options) ?? new Error('client not initialized'),
    tables: (options: TableOptions) =>
      plugin.client?.tables(options) ?? Promise.reject(new Error('client not initialized')),
    init: async (spec: string, options: NewClientOptions) => {
      plugin.client = await newClient(plugin.logger!, spec, options);
    },
    close: () => plugin.client?.close() ?? Promise.reject(new Error('client not initialized')),
  };

  return plugin;
};
