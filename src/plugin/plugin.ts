import { Logger } from 'winston';

import { SyncStream, ReadStream, WriteStream } from '../grpc/plugin.js';
import { Table } from '../schema/table.js';

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

export interface SourceClient {
  tables: (options: TableOptions) => Promise<Table[]>;
  sync: (options: SyncOptions) => void;
}

export interface DestinationClient {
  read: (stream: ReadStream) => void;
  write: (stream: WriteStream) => void;
}

export interface Client extends SourceClient, DestinationClient {
  close: () => Promise<void>;
}

export interface Plugin extends Client {
  getLogger: () => Logger;
  setLogger: (logger: Logger) => void;
  name: () => string;
  version: () => string;
  init: (spec: string, options: NewClientOptions) => Promise<void>;
}

export const newUnimplementedSource = (): SourceClient => {
  return {
    tables: () => Promise.reject(new Error('unimplemented')),
    sync: () => Promise.reject(new Error('unimplemented')),
  };
};

export const newUnimplementedDestination = (): DestinationClient => {
  return {
    read: () => Promise.reject(new Error('unimplemented')),
    write: () => Promise.reject(new Error('unimplemented')),
  };
};

export const newPlugin = (name: string, version: string, newClient: NewClientFunction): Plugin => {
  const plugin = {
    client: undefined as Client | undefined,
    logger: undefined as Logger | undefined,
    name: () => name,
    version: () => version,
    write: (stream: WriteStream) => {
      return plugin.client?.write(stream) ?? new Error('client not initialized');
    },
    read: (stream: ReadStream) => {
      return plugin.client?.read(stream) ?? new Error('client not initialized');
    },
    getLogger: () => {
      return plugin.logger!;
    },
    setLogger: (logger: Logger) => {
      plugin.logger = logger;
    },
    sync: (options: SyncOptions) => {
      return plugin.client?.sync(options) ?? new Error('client not initialized');
    },
    tables: (options: TableOptions) => {
      return plugin.client?.tables(options) ?? Promise.reject(new Error('client not initialized'));
    },
    init: async (spec: string, options: NewClientOptions) => {
      plugin.client = await newClient(plugin.logger!, spec, options);
    },
    close: () => plugin.client?.close() ?? Promise.reject(new Error('client not initialized')),
  };

  return plugin;
};
