import { pluginV3 } from '@cloudquery/plugin-pb-javascript';
import grpc = require('@grpc/grpc-js');

import { Plugin } from '../plugin/plugin.js';
import { encode as encodeTables } from '../schema/table.js';

export class MigrateTable extends pluginV3.cloudquery.plugin.v3.Sync.MessageMigrateTable {}
export class SyncResponse extends pluginV3.cloudquery.plugin.v3.Sync.Response {}
export class ReadResponse extends pluginV3.cloudquery.plugin.v3.Read.Response {}
export class WriteResponse extends pluginV3.cloudquery.plugin.v3.Write.Response {}

export type SyncStream = grpc.ServerWritableStream<
  pluginV3.cloudquery.plugin.v3.Sync.Request,
  pluginV3.cloudquery.plugin.v3.Sync.Response
>;

export type ReadStream = grpc.ServerWritableStream<
  pluginV3.cloudquery.plugin.v3.Read.Request,
  pluginV3.cloudquery.plugin.v3.Read.Response
>;

export type WriteStream = grpc.ServerReadableStream<
  pluginV3.cloudquery.plugin.v3.Write.Request,
  pluginV3.cloudquery.plugin.v3.Write.Response
>;

export class PluginServer extends pluginV3.cloudquery.plugin.v3.UnimplementedPluginService {
  // Needed due to some TypeScript nonsense
  private plugin: Plugin & grpc.UntypedHandleCall;

  constructor(plugin: Plugin) {
    super();
    this.plugin = plugin as Plugin & grpc.UntypedHandleCall;
  }

  GetName(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetName.Request,
      pluginV3.cloudquery.plugin.v3.GetName.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetName.Response>,
  ): void {
    return callback(null, new pluginV3.cloudquery.plugin.v3.GetName.Response({ name: this.plugin.name() }));
  }
  GetVersion(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetVersion.Request,
      pluginV3.cloudquery.plugin.v3.GetVersion.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetVersion.Response>,
  ): void {
    return callback(null, new pluginV3.cloudquery.plugin.v3.GetVersion.Response({ version: this.plugin.version() }));
  }
  Init(
    call: grpc.ServerUnaryCall<pluginV3.cloudquery.plugin.v3.Init.Request, pluginV3.cloudquery.plugin.v3.Init.Response>,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.Init.Response>,
  ): void {
    const { spec = new Uint8Array(), no_connection: noConnection = false } = call.request.toObject();

    const stringSpec = new TextDecoder().decode(spec);
    this.plugin
      .init(stringSpec, { noConnection })
      .then(() => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(null, new pluginV3.cloudquery.plugin.v3.Init.Response());
      })
      .catch((error) => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(error, null);
      });
  }
  GetTables(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetTables.Request,
      pluginV3.cloudquery.plugin.v3.GetTables.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetTables.Response>,
  ): void {
    const {
      tables = [],
      skip_tables: skipTables = [],
      skip_dependent_tables: skipDependentTables = false,
    } = call.request.toObject();

    this.plugin
      .tables({ tables, skipTables, skipDependentTables })
      .then((tables) => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(null, new pluginV3.cloudquery.plugin.v3.GetTables.Response({ tables: encodeTables(tables) }));
      })
      .catch((error) => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(error, null);
      });
  }
  Sync(call: SyncStream): void {
    const {
      tables = [],
      skip_tables: skipTables = [],
      skip_dependent_tables: skipDependentTables = false,
      deterministic_cq_id: deterministicCQId = false,
      backend: { connection = '', table_name: tableName = '' } = {},
    } = call.request.toObject();

    this.plugin.sync({
      tables,
      skipTables,
      skipDependentTables,
      deterministicCQId,
      backendOptions: { connection, tableName },
      stream: call,
    });
  }
  Read(call: ReadStream): void {
    this.plugin.read(call);
  }
  Write(call: WriteStream, callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.Write.Response>): void {
    this.plugin.write(call);
    callback(null, new pluginV3.cloudquery.plugin.v3.Write.Response());
  }
  Close(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.Close.Request,
      pluginV3.cloudquery.plugin.v3.Close.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.Close.Response>,
  ): void {
    this.plugin
      .close()
      .then(() => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(null, new pluginV3.cloudquery.plugin.v3.Close.Response());
      })
      .catch((error) => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(error, null);
      });
  }
}
