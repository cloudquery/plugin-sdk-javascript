import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { startServer } from '../grpc/server.js';
import { LogFormat, LogLevel, createLogger } from '../logger/logger.js';

const NETWORK_CHOICES = ['tcp', 'tcp4', 'tcp6', 'unix', 'unixpacket'] as const;

const TELEMETRY_LEVEL_CHOICES = ['none', 'errors', 'stats', 'all'] as const;

export type ServeArguments = {
  address: string;
  network: (typeof NETWORK_CHOICES)[number];
  logLevel: LogLevel;
  logFormat: LogFormat;
  sentry: boolean;
  otelEndpoint: string;
  otelEndpointInsecure: boolean;
  telemetryLevel: (typeof TELEMETRY_LEVEL_CHOICES)[number];
};

export const serve = yargs(hideBin(process.argv))
  .command<ServeArguments>(
    'serve',
    'start plugin gRPC server',
    () => {},
    ({ address, network, logLevel, logFormat, sentry: sentry, otelEndpoint, telemetryLevel }: ServeArguments) => {
      const logger = createLogger(logLevel, logFormat);
      logger.info(JSON.stringify({ address, network, logLevel, logFormat, sentry, otelEndpoint, telemetryLevel }));
      startServer(logger, address);
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
      choices: NETWORK_CHOICES,
      description: 'network to bind to',
      default: 'tcp',
    },
    'log-level': {
      alias: 'l',
      type: 'string',
      choices: Object.values(LogLevel),
      description: 'log level',
      default: 'info',
    },
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
    'otel-endpoint': {
      type: 'string',
      description: 'OpenTelemetry collector endpoint',
      default: '',
    },
    'otel-endpoint-insecure': {
      type: 'boolean',
      description: 'use Open Telemetry HTTP endpoint (for development only)',
      default: false,
    },
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
