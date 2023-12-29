import path from 'node:path';

import { valid as semverValid } from 'semver';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { startServer, Network } from '../grpc/server.js';
import { LogFormat, LogLevel, createLogger } from '../logger/logger.js';
import { packageDocker } from '../package/docker.js';

import type { Plugin } from './plugin.js';

const TELEMETRY_LEVEL_CHOICES = ['none', 'errors', 'stats', 'all'] as const;

export type BaseArguments = {
  logLevel: LogLevel;
  logFormat: LogFormat;
  sentry: boolean;
  otelEndpoint: string;
  otelEndpointInsecure: boolean;
  telemetryLevel: (typeof TELEMETRY_LEVEL_CHOICES)[number];
};

export type ServeArguments = BaseArguments & {
  address: string;
  network: Network;
};

export type PackageArguments = BaseArguments & {
  message: string;
  distDir: string;
  docsDir: string;
  pluginVersion: string;
  pluginDirectory: string;
};

export const createServeCommand = (plugin: Plugin) => {
  return yargs(hideBin(process.argv))
    .command<ServeArguments>(
      'serve',
      'start plugin gRPC server',
      (yargs) => {
        return yargs.options({
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
          license: {
            type: 'string',
            description: 'set offline license file (placeholder for future use)',
            default: '',
          },
        });
      },
      ({ address, logLevel, logFormat }: ServeArguments) => {
        const logger = createLogger(logLevel, logFormat);
        plugin.setLogger(logger);
        startServer(logger, address, plugin);
      },
    )
    .command<PackageArguments>(
      'package <pluginVersion> <pluginDirectory>',
      'package the plugin as a Docker image',
      (yargs) => {
        return yargs
          .options({
            message: {
              alias: 'm',
              type: 'string',
              description:
                'message that summarizes what is new or changed in this version. Use @<file> to read from file. Supports markdown.',
              demandOption: true,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'dist-dir': {
              alias: 'D',
              type: 'string',
              description: 'dist directory to output the built plugin. (default: <plugin_directory>/dist)',
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'docs-dir': {
              type: 'string',
              description:
                'docs directory containing markdown files to copy to the dist directory. (default: <plugin_directory>/docs)',
            },
          })
          .positional('pluginVersion', {
            type: 'string',
            description: 'version to tag the Docker image with',
          })
          .positional('pluginDirectory', {
            type: 'string',
          });
      },
      async ({ message, distDir, docsDir, pluginVersion, pluginDirectory, logLevel, logFormat }: PackageArguments) => {
        const logger = createLogger(logLevel, logFormat);
        plugin.setLogger(logger);
        if (!plugin.name()) {
          throw new Error('plugin name is required');
        }
        if (!plugin.team()) {
          throw new Error('plugin team is required');
        }
        if (!plugin.kind()) {
          throw new Error('plugin kind is required');
        }
        if (!plugin.dockerFile()) {
          throw new Error('docker file is required');
        }
        if (plugin.buildTargets().length === 0) {
          throw new Error('at least one build target is required');
        }
        if (!semverValid(pluginVersion)) {
          throw new Error(`invalid plugin version: ${pluginVersion}`);
        }
        distDir = distDir || path.join(pluginDirectory, 'dist');
        docsDir = docsDir || path.join(pluginDirectory, 'docs');
        await packageDocker({ logger, message, distDir, docsDir, pluginVersion, pluginDirectory, plugin });
      },
    )
    .options({
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
