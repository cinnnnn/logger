import { LOG_SEVERITY, LOG_WARNING, LogPriority, LOG_EMERGENCY, LOG_CRITICAL, LOG_ALERT, LOG_ERROR, LOG_INFO, LOG_NOTICE, LOG_DEBUG } from './levels';
import { LambdaLog, Log } from './log-format';
import { Context } from 'aws-lambda';
import shortid from 'shortid';

/**
 * Used to identify lambda functions that
 * are run in the same context
 */
const executionId = shortid.generate();

/**
 * This logger will attach logs information
 * for lambda functions
 */
export class LambdaLogger {
  private logLevel: LOG_SEVERITY;
  private logId: string;
  private service: string;
  private context?: Context;

  constructor({ service, context = null, logLevel = LOG_WARNING }: LoggerConstructorOptions) {
    this.service = service;
    this.context = context;
    this.logLevel = logLevel;
    this.logId = shortid.generate();
  }

  /**
   * Creates and writes a log to the database if the log
   * level is as severe or more severe than the
   * current log level
   * @param message
   * @param level
   * @param data
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
      logId: this.logId,
      executionId: executionId,
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

export type LogOptions = { data?: Log['data']; metrics?: Log['metrics'] };
export type LogFunction = (message: Log['message'], options?: LogOptions) => void;
export type LogWriterFunction = (level: LOG_SEVERITY, message: Log['message'], options?: LogOptions) => void;

export type LoggerConstructorOptions = {
  service: string;
  logLevel?: LOG_SEVERITY;
  context?: Context;
};
