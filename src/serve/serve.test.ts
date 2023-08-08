import test from 'ava';
import { serve as serveWithExit, ServeArguments } from './serve.js';

const serve = serveWithExit.exitProcess(false);

test('should return error without command', (t) => {
  t.throws(() => serve.parse([]), { message: 'Specify a command to run' });
});

test('should pass with serve command and return default flags', (t) => {
  delete process.env.CQ_TELEMETRY_LEVEL;
  const results = serve.parse(['serve']) as ServeArguments;
  const { address, network, logLevel, logFormat, sentry, otelEndpoint, telemetryLevel } = results;
  t.deepEqual(
    { address, network, logLevel, logFormat, sentry, otelEndpoint, telemetryLevel },
    {
      address: 'localhost:7777',
      network: 'tcp',
      logLevel: 'info',
      logFormat: 'text',
      sentry: true,
      otelEndpoint: '',
      telemetryLevel: 'all',
    },
  );
});
