import { createLogger as createWinstonLogger, format, transports } from 'winston';
import { fullFormat, shortFormat } from 'winston-error-format';

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

export const createLogger = (level: LogLevel, logFormat: LogFormat) => {
  // Winston doesn't have a TRACE level, so we need to normalize it to DEBUG.
  const normalizedLevel = level === LogLevel.trace ? LogLevel.debug : level;

  const consoleFormat = format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level} ${message}`;
  });

  const logger = createWinstonLogger({
    level: normalizedLevel,
    format:
      logFormat == LogFormat.json
        ? format.combine(fullFormat(), format.timestamp(), format.json())
        : format.combine(shortFormat(), format.timestamp(), format.colorize(), consoleFormat),
    transports: [new transports.Console()],
  });

  return logger;
};
