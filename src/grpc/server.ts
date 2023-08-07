import { discovery1 } from '@cloudquery/plugin-pb-javascript';
import { pluginV3 } from '@cloudquery/plugin-pb-javascript';
import grpc = require('@grpc/grpc-js');

class DiscoveryServer extends discovery1.cloudquery.discovery.v1.UnimplementedDiscoveryService {
  GetVersions(
    call: grpc.ServerUnaryCall<
      discovery1.cloudquery.discovery.v1.GetVersions.Request,
      discovery1.cloudquery.discovery.v1.GetVersions.Response
    >,
    callback: grpc.sendUnaryData<discovery1.cloudquery.discovery.v1.GetVersions.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
}

class PluginServer extends pluginV3.cloudquery.plugin.v3.UnimplementedPluginService {
  GetName(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetName.Request,
      pluginV3.cloudquery.plugin.v3.GetName.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetName.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
  GetVersion(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetVersion.Request,
      pluginV3.cloudquery.plugin.v3.GetVersion.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetVersion.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
  Init(
    call: grpc.ServerUnaryCall<pluginV3.cloudquery.plugin.v3.Init.Request, pluginV3.cloudquery.plugin.v3.Init.Response>,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.Init.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
  GetTables(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.GetTables.Request,
      pluginV3.cloudquery.plugin.v3.GetTables.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.GetTables.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
  Sync(
    call: grpc.ServerWritableStream<
      pluginV3.cloudquery.plugin.v3.Sync.Request,
      pluginV3.cloudquery.plugin.v3.Sync.Response
    >,
  ): void {
    throw new Error('Method not implemented.');
  }
  Read(
    call: grpc.ServerWritableStream<
      pluginV3.cloudquery.plugin.v3.Read.Request,
      pluginV3.cloudquery.plugin.v3.Read.Response
    >,
  ): void {
    throw new Error('Method not implemented.');
  }
  Write(
    call: grpc.ServerReadableStream<
      pluginV3.cloudquery.plugin.v3.Write.Request,
      pluginV3.cloudquery.plugin.v3.Write.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.Write.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
  Close(
    call: grpc.ServerUnaryCall<
      pluginV3.cloudquery.plugin.v3.Close.Request,
      pluginV3.cloudquery.plugin.v3.Close.Response
    >,
    callback: grpc.sendUnaryData<pluginV3.cloudquery.plugin.v3.Close.Response>,
  ): void {
    throw new Error('Method not implemented.');
  }
}

export const getServer = () => {
  const server = new grpc.Server();
  server.addService(pluginV3.cloudquery.plugin.v3.UnimplementedPluginService.definition, new PluginServer());
  server.addService(discovery1.cloudquery.discovery.v1.UnimplementedDiscoveryService.definition, new DiscoveryServer());

  return server;
};

export const startServer = (address: string) => {
  const server = getServer();
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    server.start();
    console.log('server running on port', port);
  });
};
