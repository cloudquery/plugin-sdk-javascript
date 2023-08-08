import winston from 'winston';
import grpc = require('@grpc/grpc-js');
import { discovery1 } from '@cloudquery/plugin-pb-javascript';

const SUPPORTED_VERSIONS = [3];

export class DiscoveryServer extends discovery1.cloudquery.discovery.v1.UnimplementedDiscoveryService {
  GetVersions(
    call: grpc.ServerUnaryCall<
      discovery1.cloudquery.discovery.v1.GetVersions.Request,
      discovery1.cloudquery.discovery.v1.GetVersions.Response
    >,
    callback: grpc.sendUnaryData<discovery1.cloudquery.discovery.v1.GetVersions.Response>,
  ): void {
    return callback(
      null,
      new discovery1.cloudquery.discovery.v1.GetVersions.Response({ versions: SUPPORTED_VERSIONS }),
    );
  }
}
