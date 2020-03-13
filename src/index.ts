import { Context } from 'aws-lambda';
import shortid from 'shortid';

/** Optional `data` and `metric` values for  @public */
export type LogOptions = { data?: Log['data']; metrics?: Log['metrics'] };
/** @public */
export type LogFunction = (message: Log['message'], options?: LogOptions) => void;
type LogWriterFunction = (level: LOG_SEVERITY, message: Log['message'], options?: LogOptions) => void;

/**
 * Options for the LambdaLogger
 * @public
 */
export type LoggerConstructorOptions = {
  service: string;
  logLevel?: string;
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
   */
  service: string;
  /**
   * The message for the error.
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
  aws: {
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
  private service: string;
  private context?: Context;

  constructor({ service, context = null, logLevel = LOG_WARNING }: LoggerConstructorOptions) {
    if(!logInstance) {
      logInstance = this;

      // If you construct this with an invalid level
      // we will set the level to warning.
      if(Object.keys(LogPriority).includes(logLevel)) {
        this.logLevel = logLevel as LOG_SEVERITY;
      } else {
        this.logLevel = LOG_WARNING;
      }
      this.service = service;
      this.context = context;
    }

    return logInstance;
  }

  /**
   * Sets the lambda context after
   * the logger has been constructed
   */
  setLambdaContext(context: Context): void {
    this.context = context;
  }

  /**
   * Creates and writes a log to the database if the log
   * level is as severe or more severe than the
   * current log level
   * @public
   */
  private writeLog: LogWriterFunction = (level, message, {data= {}, metrics= {}} = {}) => {
    // We don't want to write any logs with a higher log level
    if (LogPriority[this.logLevel] < LogPriority[level]) {
      return;
    }

    const logEntry: LambdaLog = {
      source: 'lambda',
      status: level,
      service: this.service ,
      message: message,
      data: data,
      metrics: metrics,
      aws: {
        context: {
          functionName: this.context?.functionName,
          functionVersion: this.context?.functionVersion,
          invokedFunctionArn: this.context?.invokedFunctionArn,
          memoryLimitInMB: this.context?.memoryLimitInMB,
          awsRequestId: this.context?.awsRequestId,
          logGroupName: this.context?.logGroupName,
          logStreamName: this.context?.logStreamName
        }
      },
      logId: logId,
      process: {
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
        uptime: process.uptime(),
        versions: process.versions
      },
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logEntry));

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
