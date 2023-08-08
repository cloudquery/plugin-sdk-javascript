import { createLogger as createWinstonLogger, format as winstonFormat, transports } from 'winston';

export enum LogLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export enum LogFormat {
  json = 'json',
  text = 'text',
}

export const createLogger = (level: LogLevel, format: LogFormat) => {
  // Winston doesn't have a TRACE level, so we need to normalize it to DEBUG.
  const normalizedLevel = level === LogLevel.trace ? LogLevel.debug : level;
  const logger = createWinstonLogger({
    level: normalizedLevel,
    format: format == LogFormat.json ? winstonFormat.json() : winstonFormat.simple(),
    transports: [new transports.Console()],
  });

  return logger;
};
