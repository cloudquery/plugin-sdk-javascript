import { pluginV3 } from '@cloudquery/plugin-pb-javascript';
import grpc = require('@grpc/grpc-js');

import type { Plugin } from '../plugin/plugin.js';
import { encodeTables, flattenTables } from '../schema/table.js';

export class MigrateTable extends pluginV3.cloudquery.plugin.v3.Sync.MessageMigrateTable {}
export class DeleteStale extends pluginV3.cloudquery.plugin.v3.Write.MessageDeleteStale {}
export class SyncRequest extends pluginV3.cloudquery.plugin.v3.Sync.Request {}
export class Insert extends pluginV3.cloudquery.plugin.v3.Sync.MessageInsert {}
export class SyncResponse extends pluginV3.cloudquery.plugin.v3.Sync.Response {}
export class ReadRequest extends pluginV3.cloudquery.plugin.v3.Read.Request {}
export class ReadResponse extends pluginV3.cloudquery.plugin.v3.Read.Response {}
export class WriteRequest extends pluginV3.cloudquery.plugin.v3.Write.Request {}
export class WriteResponse extends pluginV3.cloudquery.plugin.v3.Write.Response {}

export type SyncStream = grpc.ServerWritableStream<SyncRequest, SyncResponse>;

export type ReadStream = grpc.ServerWritableStream<ReadRequest, ReadResponse>;

export type WriteStream = grpc.ServerReadableStream<WriteRequest, WriteResponse>;

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

  GetSpecSchema(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetSpecSchema.Request,
      pluginV3.cloudquery.plugin.v3.GetSpecSchema.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetSpecSchema.Response>,
  ): void {
    return callback(
      null,
      new pluginV3.cloudquery.plugin.v3.GetSpecSchema.Response({ json_schema: this.plugin.jsonSchema() }),
    );
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
        const flattened = flattenTables(tables);
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(
          null,
          new pluginV3.cloudquery.plugin.v3.GetTables.Response({ tables: encodeTables(flattened) }),
        );
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
    this.plugin
      .write(call)
      .then(() => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(null, new pluginV3.cloudquery.plugin.v3.Write.Response());
      })
      .catch((error) => {
        // eslint-disable-next-line promise/no-callback-in-promise
        return callback(error, null);
      });
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

  Transform(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    call: grpc.ServerDuplexStream<
      pluginV3.cloudquery.plugin.v3.Transform.Request,
      pluginV3.cloudquery.plugin.v3.Transform.Response
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  TransformSchema(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.TransformSchema.Request,
      pluginV3.cloudquery.plugin.v3.TransformSchema.Response
    >,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.TransformSchema.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }

  TestConnection(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.TestConnection.Request,
      pluginV3.cloudquery.plugin.v3.TestConnection.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.TestConnection.Response>,
  ): void {
    const { spec = new Uint8Array() } = call.request.toObject();

    const stringSpec = new TextDecoder().decode(spec);
    if (this.plugin.testConnection) {
      this.plugin
        .testConnection(stringSpec)
        .then(({ success, failureCode, failureDescription }) => {
          // eslint-disable-next-line promise/no-callback-in-promise
          return callback(
            null,
            new pluginV3.cloudquery.plugin.v3.TestConnection.Response({
              success,
              failure_code: failureCode,
              failure_description: failureDescription,
            }),
          );
        })
        .catch((error) => {
          // eslint-disable-next-line promise/no-callback-in-promise
          return callback(error, null);
        });
    } else {
      // fall back to init
      this.plugin
        .init(stringSpec, { noConnection: false })
        .then(() => {
          // eslint-disable-next-line promise/no-callback-in-promise
          return callback(null, new pluginV3.cloudquery.plugin.v3.TestConnection.Response({ success: true }));
        })
        .catch(() => {
          // eslint-disable-next-line promise/no-callback-in-promise
          return callback(
            null,
            new pluginV3.cloudquery.plugin.v3.TestConnection.Response({
              success: false,
              failure_code: 'UNKNOWN',
              failure_description: 'Failed to connect',
            }),
          );
        });
    }
  }
}
