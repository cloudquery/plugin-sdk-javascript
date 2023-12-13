import test from 'ava';
import { pathExists } from 'path-exists';
import { temporaryDirectoryTask } from 'tempy';

import { newMemDBPlugin } from '../memdb/memdb.js';

import { createServeCommand } from './serve.js';

const serve = createServeCommand(newMemDBPlugin()).exitProcess(false);

test('should return error without command', (t) => {
  t.throws(() => serve.parse([]), { message: 'Specify a command to run' });
});

test('should build memdb docker plugin', async (t) => {
  delete process.env.CQ_TELEMETRY_LEVEL;
  await temporaryDirectoryTask(async (outputDirectory) => {
    await serve.parse(['package', '-m', 'test', 'v1.0.0', '.', '--dist-dir', outputDirectory]);
    t.true(await pathExists(`${outputDirectory}/tables.json`));
    t.true(await pathExists(`${outputDirectory}/package.json`));
    t.true(await pathExists(`${outputDirectory}/cq-plugin-memdb-v1.0.0-linux-amd64.tar`));
    t.true(await pathExists(`${outputDirectory}/cq-plugin-memdb-v1.0.0-linux-arm64.tar`));
    t.true(await pathExists(`${outputDirectory}/docs/overview.md`));
  });
});
