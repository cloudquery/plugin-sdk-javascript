import winston from 'winston';
import grpc = require('@grpc/grpc-js');
import { pluginV3 } from '@cloudquery/plugin-pb-javascript';
import { discovery1 } from '@cloudquery/plugin-pb-javascript';
import { PluginServer } from './plugin.js';
import { DiscoveryServer } from './discovery.js';

export const getServer = () => {
  const server = new grpc.Server();
  server.addService(pluginV3.cloudquery.plugin.v3.UnimplementedPluginService.definition, new PluginServer());
  server.addService(discovery1.cloudquery.discovery.v1.UnimplementedDiscoveryService.definition, new DiscoveryServer());

  return server;
};

export const startServer = (logger: winston.Logger, address: string) => {
  const server = getServer();
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      logger.error(error);
      return;
    }
    server.start();
    logger.info('server running on port', port);
  });
};
