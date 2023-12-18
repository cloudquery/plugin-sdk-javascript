import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import stream from 'node:stream/promises';

import { execa } from 'execa';
import pMap from 'p-map';
import { pathExists } from 'path-exists';
import { isDirectory } from 'path-type';
import { type Logger } from 'winston';

import type { Plugin } from '../plugin/plugin.js';
import { flattenTables } from '../schema/table.js';

type Options = {
  logger: Logger;
  message: string;
  distDir: string;
  docsDir: string;
  pluginVersion: string;
  pluginDirectory: string;
  plugin: Plugin;
};

type SupportedTarget = {
  os: string;
  arch: string;
  path: string;
  checksum: string;
};

const computeHash = async (filepath: string) => {
  const fileHandle = await fs.open(filepath, 'r');
  const input = fileHandle.createReadStream();
  const hash = createHash('sha256');
  await stream.pipeline(input, hash);
  return hash.digest('hex');
};

const writeTablesJSON = async (logger: Logger, outputDirectory: string, plugin: Plugin) => {
  if (plugin.kind() !== 'source') {
    return;
  }

  const outputPath = path.join(outputDirectory, 'tables.json');
  logger.info(`Writing tables to ${outputPath}`);
  await plugin.init('', { noConnection: true });
  const tables = await plugin.tables({ tables: ['*'], skipTables: [], skipDependentTables: false });
  const flattened = flattenTables(tables);
  const tablesToWrite = flattened.map(({ name, title, description, isIncremental, parent, relations, columns }) => {
    return {
      name,
      title,
      description,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      is_incremental: isIncremental,
      parent: parent && parent.name,
      relations: relations.map((relation) => relation.name),
      columns: columns.map(({ name, description, type, incrementalKey, notNull, primaryKey, unique }) => {
        return {
          name,
          description,
          type: type.toString(),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          incremental_key: incrementalKey,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          not_null: notNull,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          primary_key: primaryKey,
          unique,
        };
      }),
    };
  });
  await fs.writeFile(path.join(outputDirectory, 'tables.json'), JSON.stringify(tablesToWrite, null, 2));
  logger.info(`Wrote ${tablesToWrite.length} tables to ${outputPath}`);
};

const runDockerCommand = async (logger: Logger, commandArguments: string[], cwd: string) => {
  const process = execa('docker', commandArguments, {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  process.stdout?.on('data', (data) => {
    logger.debug(data.toString());
  });
  process.stderr?.on('data', (data) => {
    logger.debug(data.toString());
  });
  await process;
};

const writePackageJSON = async (
  logger: Logger,
  outputDirectory: string,
  message: string,
  pluginVersion: string,
  supportedTargets: SupportedTarget[],
  plugin: Plugin,
) => {
  const packageJsonPath = path.join(outputDirectory, 'package.json');
  logger.info(`Writing package.json to ${packageJsonPath}`);
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        schema_version: 1,
        name: plugin.name(),
        team: plugin.team(),
        kind: plugin.kind(),
        version: pluginVersion,
        message: message,
        protocols: [3],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        supported_targets: supportedTargets,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        package_type: 'docker',
      },
      null,
      2,
    ),
  );
};

const buildDockerfile = async (
  logger: Logger,
  outputDirectory: string,
  pluginDirectory: string,
  pluginVersion: string,
  plugin: Plugin,
) => {
  const dockerfile = plugin.dockerFile();
  const dockerFilePath = path.join(pluginDirectory, dockerfile);
  if (!(await pathExists(dockerFilePath))) {
    throw new Error(`docker file ${dockerFilePath} does not exist`);
  }

  logger.info(`Building ${plugin.buildTargets().length} targets`);
  const supportedTargets = await pMap(
    plugin.buildTargets(),
    async ({ os, arch }) => {
      const imageRepository = `registry.cloudquery.io/${plugin.team()}/${plugin.kind()}-${plugin.name()}`;
      const imageTag = `${imageRepository}:${pluginVersion}-${os}-${arch}`;
      const imageTar = `plugin-${plugin.name()}-${pluginVersion}-${os}-${arch}.tar`;
      const imagePath = `${outputDirectory}/${imageTar}`;
      logger.info(`Building docker image ${imageTag}`);
      const dockerBuildArguments = [
        'buildx',
        'build',
        '-t',
        imageTag,
        '--platform',
        `${os}/${arch}`,
        '-f',
        dockerFilePath,
        '.',
        '--progress',
        'plain',
        '--load',
      ];
      logger.debug(`Running command 'docker ${dockerBuildArguments.join(' ')}'`);
      await runDockerCommand(logger, dockerBuildArguments, pluginDirectory);
      logger.debug(`Saving docker image ${imageTag} to ${imagePath}`);
      const dockerSaveArguments = ['save', '-o', imagePath, imageTag];
      logger.debug(`Running command 'docker ${dockerSaveArguments.join(' ')}'`);
      await runDockerCommand(logger, dockerSaveArguments, pluginDirectory);
      const checksum = await computeHash(imagePath);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      return { os, arch, path: imageTar, checksum, docker_image_tag: imageTag };
    },
    { concurrency: 1 },
  );
  return supportedTargets as SupportedTarget[];
};

const copyDocumentation = async (logger: Logger, documentationDirectory: string, outputDirectory: string) => {
  if (!(await pathExists(documentationDirectory))) {
    throw new Error(`docs directory ${documentationDirectory} does not exist`);
  }
  if (!(await isDirectory(documentationDirectory))) {
    throw new Error(`path to docs ${documentationDirectory} is not a directory`);
  }

  const outputPath = path.join(outputDirectory, 'docs');
  logger.info(`Copying docs from ${documentationDirectory} to ${outputPath}`);
  await fs.cp(documentationDirectory, outputPath, {
    recursive: true,
  });
};

export const packageDocker = async ({
  logger,
  distDir,
  docsDir,
  plugin,
  pluginDirectory,
  pluginVersion,
  message,
}: Options) => {
  logger.info(`Packaging plugin to ${distDir}`);
  await fs.mkdir(distDir, { recursive: true });
  await copyDocumentation(logger, docsDir, distDir);
  await writeTablesJSON(logger, distDir, plugin);
  const supportedTargets = await buildDockerfile(logger, distDir, pluginDirectory, pluginVersion, plugin);
  await writePackageJSON(logger, distDir, message, pluginVersion, supportedTargets, plugin);
  logger.info(`Done packaging plugin to ${distDir}`);
};
