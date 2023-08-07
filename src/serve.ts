import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const NETWORK_CHOICES = ['tcp', 'tcp4', 'tcp6', 'unix', 'unixpacket'] as const;
const LOG_LEVEL_CHOICES = ['trace', 'debug', 'info', 'warn', 'error'] as const;
const LOG_FORMAT_CHOICES = ['json', 'text'] as const;
const TELEMETRY_LEVEL_CHOICES = ['none', 'errors', 'stats', 'all'] as const;

export type ServeArgs = {
  address: string;
  network: (typeof NETWORK_CHOICES)[number];
  logLevel: (typeof LOG_LEVEL_CHOICES)[number];
  logFormat: (typeof LOG_FORMAT_CHOICES)[number];
  sentry: boolean;
  otelEndpoint: string;
  otelEndpointInsecure: boolean;
  telemetryLevel: (typeof TELEMETRY_LEVEL_CHOICES)[number];
};

export const serve = yargs(hideBin(process.argv))
  .command<ServeArgs>(
    'serve',
    'start plugin gRPC server',
    () => {},
    ({ address, network, logLevel, logFormat, sentry: sentry, otelEndpoint, telemetryLevel }: ServeArgs) => {
      console.log({ address, network, logLevel, logFormat, sentry, otelEndpoint, telemetryLevel });
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
      choices: LOG_LEVEL_CHOICES,
      description: 'log level',
      default: 'info',
    },
    'log-format': {
      alias: 'f',
      type: 'string',
      choices: LOG_FORMAT_CHOICES,
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
