import winston from 'winston';

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogFormat {
  JSON = 'json',
  TEXT = 'text',
}

export const createLogger = (level: LogLevel, format: LogFormat) => {
  // Winston doesn't have a TRACE level, so we need to normalize it to DEBUG.
  const normalizedLevel = level === LogLevel.TRACE ? LogLevel.DEBUG : level;
  const logger = winston.createLogger({
    level: normalizedLevel,
    format: format == LogFormat.JSON ? winston.format.json() : winston.format.simple(),
    transports: [new winston.transports.Console()],
  });

  return logger;
};
