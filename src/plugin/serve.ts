import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { startServer, Network } from '../grpc/server.js';
import { LogFormat, LogLevel, createLogger } from '../logger/logger.js';

import type { Plugin } from './plugin.js';

const TELEMETRY_LEVEL_CHOICES = ['none', 'errors', 'stats', 'all'] as const;

export type ServeArguments = {
  address: string;
  network: Network;
  logLevel: LogLevel;
  logFormat: LogFormat;
  sentry: boolean;
  otelEndpoint: string;
  otelEndpointInsecure: boolean;
  telemetryLevel: (typeof TELEMETRY_LEVEL_CHOICES)[number];
};

export const createServeCommand = (plugin: Plugin) => {
  return yargs(hideBin(process.argv))
    .command<ServeArguments>(
      'serve',
      'start plugin gRPC server',
      () => {},
      ({ address, logLevel, logFormat }: ServeArguments) => {
        const logger = createLogger(logLevel, logFormat);
        plugin.setLogger(logger);
        startServer(logger, address, plugin);
      },
    )
    .options({
      address: {
        alias: 'a',
        type: 'string',
        description: 'address to bind to',
        default: 'localhost:7777',
      },
      network: {
        alias: 'n',
        type: 'string',
        choices: Object.values(Network),
        description: 'network to bind to',
        default: 'tcp',
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'log-level': {
        alias: 'l',
        type: 'string',
        choices: Object.values(LogLevel),
        description: 'log level',
        default: 'info',
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'log-format': {
        alias: 'f',
        type: 'string',
        choices: Object.values(LogFormat),
        description: 'log format',
        default: 'text',
      },
      sentry: {
        type: 'boolean',
        description: 'enable sentry reporting. Pass `--no-sentry` to disable.',
        default: true,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'otel-endpoint': {
        type: 'string',
        description: 'OpenTelemetry collector endpoint',
        default: '',
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'otel-endpoint-insecure': {
        type: 'boolean',
        description: 'use Open Telemetry HTTP endpoint (for development only)',
        default: false,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'telemetry-level': {
        type: 'string',
        description: 'CQ Telemetry level',
        hidden: true,
        choices: TELEMETRY_LEVEL_CHOICES,
        default: 'all',
      },
    })
    .env('CQ_')
    .strict()
    .demandCommand(1, 1, 'Specify a command to run');
};
