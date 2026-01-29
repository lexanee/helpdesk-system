import winston from "winston";
import { isDevelopment, isProduction } from "../config/env.config.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format for console output
 */
const consoleFormat = printf((info) => {
  const ts = info.timestamp as string;
  const ctx = info.context ? `[${String(info.context)}]` : "";
  const { level, message, timestamp: _ts, context: _ctx, ...meta } = info;
  const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} ${level} ${ctx} ${String(message)}${metaStr}`;
});

/**
 * Custom log format for file output (JSON)
 */
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

/**
 * Winston logger instance
 */
const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  defaultMeta: { service: "helpdesk-backend" },
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        consoleFormat
      ),
    }),
  ],
});

// Add file transports in production
if (isProduction) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    })
  );
}

/**
 * Create a child logger with context
 */
export const createLogger = (context: string) => {
  return logger.child({ context });
};

/**
 * Default logger export
 */
export default logger;
