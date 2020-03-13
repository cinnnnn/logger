import { LOG_SEVERITY } from './levels';

export interface Log {
  /**
   * The technology from which the log originated.
   */
  source: string;
  /**
   * Syslog level severity
   * @see https://tools.ietf.org/html/rfc5424
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
  /**
   * A unique id for each
   * node container
   */
  executionId: string;

  process:  {
    memoryUsage: NodeJS.MemoryUsage;
    pid: number;
    uptime: number;
    versions: NodeJS.ProcessVersions;
  };
}

export interface LambdaLog extends Log {
  source: 'lambda';
  aws: {
    context: {
      functionName: string;
      functionVersion: string;
      invokedFunctionArn: string;
      memoryLimitInMB: string;
      awsRequestId: string;
      logGroupName: string;
      logStreamName: string;
    };
  };
}
