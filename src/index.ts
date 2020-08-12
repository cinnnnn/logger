import { Context } from 'aws-lambda';
import shortid from 'shortid';

/**
 * Optional `data`, `metric`, and `error` options
 * @public
 */
export type LogOptions = { data?: Log['data']; metrics?: Log['metrics']; error?: any };
/** @public */
export type LogFunction = (message: Log['message'], options?: LogOptions) => void;
type LogWriterFunction = (level: LOG_SEVERITY, message: Log['message'], options?: LogOptions) => void;

/**
 * Options for the LambdaLogger
 * @public
 */
export type LoggerConstructorOptions = {
  /** @deprecated Service is now pulled from CloudWatch */
  service?: string;
  logLevel?: string;
  /** @deprecated Context is now pulled from CloudWatch */
  context?: Context;
};

/** Emergency: system is unusable @public */
export const LOG_EMERGENCY = 'emerg';
/** Alert: action must be taken immediately @public */
export const LOG_ALERT = 'alert';
/** Critical: critical conditions @public */
export const LOG_CRITICAL = 'critical';
/** Error: error conditions @public */
export const LOG_ERROR = 'error';
/** Warning: warning conditions @public */
export const LOG_WARNING = 'warning';
/** Notice: normal but significant condition @public */
export const LOG_NOTICE  = 'notice';
/** Informational: informational messages @public */
export const LOG_INFO  = 'info';
/** Debug: debug-level messages @public */
export const LOG_DEBUG = 'debug';
/** {@link https://tools.ietf.org/html/rfc5424 | RFC 5424} @public */
export type LOG_SEVERITY = typeof LOG_EMERGENCY | typeof LOG_ALERT | typeof LOG_CRITICAL | typeof LOG_ERROR | typeof LOG_WARNING | typeof LOG_NOTICE | typeof LOG_INFO | typeof LOG_DEBUG;

/**
 * Map of the numerical codes of severity
 * {@link https://tools.ietf.org/html/rfc5424 | RFC 5424}
 * @public
 */
export const LogPriority: {
  [LOG_EMERGENCY]: 0;
  [LOG_ALERT]: 1;
  [LOG_CRITICAL]: 2;
  [LOG_ERROR]: 3;
  [LOG_WARNING]: 4;
  [LOG_NOTICE]: 5;
  [LOG_INFO]: 6;
  [LOG_DEBUG]: 7;
} = {
  [LOG_EMERGENCY]: 0,
  [LOG_ALERT]: 1,
  [LOG_CRITICAL]: 2,
  [LOG_ERROR]: 3,
  [LOG_WARNING]: 4,
  [LOG_NOTICE]: 5,
  [LOG_INFO]: 6,
  [LOG_DEBUG]: 7,
};

/** @public */
export interface Log {
  /**
   * The technology from which the log originated.
   */
  source: string;
  /**
   * Syslog level severity
   * {@link https://tools.ietf.org/html/rfc5424 | RFC 5424}
   */
  status: LOG_SEVERITY;
  /**
   * The name of the application or service generating the log events.
   * @deprecated We pull the stack from the CloudWatch logs directly now
   */
  service?: string;
  /**
   * The message for the log.
   */
  message: string;
  /**
   * Any context we want to add
   * with the log. Must be a string
   */
  data: Record<string, string>;
  /**
   * Any metrics we want to record
   * with the log. Must be numeric
   */
  metrics: Record<string, number>;

  /**
   * Specific context related to errors
   */
  error?: {
    message?: string;
    name?: string;
    stack?: string;
    raw?: string;
  };
  /**
   * A unique id for each
   * logger instance
   */
  logId: string;

  process:  {
    memoryUsage: NodeJS.MemoryUsage;
    pid: number;
    uptime: number;
    versions: NodeJS.ProcessVersions;
  };
}

interface LambdaLog extends Log {
  source: 'lambda';
  /** @deprecated Context is now pulled from the CloudWatch logs directly */
  awsData?: {
    context: {
      functionName?: string;
      functionVersion?: string;
      invokedFunctionArn?: string;
      memoryLimitInMB?: string;
      awsRequestId?: string;
      logGroupName?: string;
      logStreamName?: string;
    };
  };
}

/**
 * Used to identify lambda functions that
 * are run in the same context
 */
const logId = shortid.generate();

/**
 * We want the logger to be a singleton
 * so we cache it in the module.
 */
let logInstance: LambdaLogger;

/**
 * This logger will attach logs information
 * for lambda functions
 * @public
 */
export class LambdaLogger {
  private logLevel: LOG_SEVERITY;

  constructor({ logLevel = LOG_WARNING }: LoggerConstructorOptions) {
    if(!logInstance) {
      logInstance = this;

      // If you construct this with an invalid level
      // we will set the level to warning.
      if(Object.keys(LogPriority).includes(logLevel)) {
        this.logLevel = logLevel as LOG_SEVERITY;
      } else {
        this.logLevel = LOG_WARNING;
      }
    }

    return logInstance;
  }

  /**
   * Sets the lambda context after
   * the logger has been constructed
   *
   * @deprecated Context is now pulled from CloudWatch
   */
  setLambdaContext(context: Context): void {
    return;
  }

  /**
   * Creates and writes a log to the database if the log
   * level is as severe or more severe than the
   * current log level
   * @public
   */
  private writeLog: LogWriterFunction = (level, message, {data= {}, metrics= {}, error} = {}) => {
    // We don't want to write any logs with a higher log level
    if (LogPriority[this.logLevel] < LogPriority[level]) {
      return;
    }

    const logEntry: LambdaLog = {
      source: 'lambda',
      status: level,
      message: message,
      data: data,
      metrics: metrics,
      logId: logId,
      process: {
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
        uptime: process.uptime(),
        versions: process.versions
      },
    };

    // If there's an error we'll attempt to unwrap it
    if (error) {
      logEntry.error = {};
      // If it's an acutal error object we'll extract
      // the message and the stack
      if (error instanceof Error) {
        logEntry.error.message = error.message;
        logEntry.error.name = error.name;
        logEntry.error.stack = error.stack;
        logEntry.error = {
          message: error.message,
          name: error.name,
          stack: error.stack
        };
      } else {
        // Otherwise it could be anything so we'll go ahead and
        // try to stringify it and add it
        try {
          // We'll truncate the full error at 1024 characters as to not
          // blow up our logs
          logEntry.error.raw = JSON.stringify(error).substr(0, 512);
        } catch (jsonStringifyError) {
          // We don't log inside the logger
        }
      }
    }

    switch (level) {
      case LOG_ALERT:
      case LOG_EMERGENCY:
      case LOG_CRITICAL:
      case LOG_ERROR:
        // eslint-disable-next-line no-console
        console.error(JSON.stringify(logEntry));
        return;
      case LOG_WARNING:
        // eslint-disable-next-line no-console
        console.warn(JSON.stringify(logEntry));
        return;
      case LOG_NOTICE:
      case LOG_INFO:
        // eslint-disable-next-line no-console
        console.info(JSON.stringify(logEntry));
        return;
      default:
        // eslint-disable-next-line no-console
        console.debug(JSON.stringify(logEntry));
        break;
    }

  };

  readonly emergency: LogFunction = this.writeLog.bind(this, LOG_EMERGENCY);
  readonly alert: LogFunction = this.writeLog.bind(this, LOG_ALERT);
  readonly critical: LogFunction = this.writeLog.bind(this, LOG_CRITICAL);
  readonly error: LogFunction = this.writeLog.bind(this, LOG_ERROR);
  readonly warning: LogFunction = this.writeLog.bind(this, LOG_WARNING);
  readonly notice: LogFunction = this.writeLog.bind(this, LOG_NOTICE);
  readonly info: LogFunction = this.writeLog.bind(this, LOG_INFO);
  readonly debug: LogFunction = this.writeLog.bind(this, LOG_DEBUG);
}
