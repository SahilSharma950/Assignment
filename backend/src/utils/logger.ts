import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env.js';

// ─── Log Format ───────────────────────────────────────────────────────────────

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stackStr = stack ? `\n${String(stack)}` : '';
  return `${String(ts)} [${level}]: ${String(message)}${metaStr}${stackStr}`;
});

const fileFormat = combine(timestamp(), errors({ stack: true }), splat(), json());

// ─── Transports ───────────────────────────────────────────────────────────────

const transports: winston.transport[] = [];

// Console transport — always active in development/test
if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        splat(),
        consoleFormat,
      ),
    }),
  );
}

// File transport — error logs (never expire)
transports.push(
  new DailyRotateFile({
    filename: path.join(env.LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxFiles: '30d',
    zippedArchive: true,
  }),
);

// File transport — combined logs (all levels)
transports.push(
  new DailyRotateFile({
    filename: path.join(env.LOG_DIR, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxFiles: '14d',
    zippedArchive: true,
  }),
);

// ─── Logger Instance ──────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels: {
    ...winston.config.npm.levels,
    http: 3, // Add 'http' level between info and debug
  },
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(env.LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(env.LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
});
