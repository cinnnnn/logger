/** Emergency: system is unusable */
export const LOG_EMERGENCY = 'emerg';
/** Alert: action must be taken immediately */
export const LOG_ALERT = 'alert';
/** Critical: critical conditions */
export const LOG_CRITICAL = 'critical';
/** Error: error conditions */
export const LOG_ERROR = 'error';
/** Warning: warning conditions */
export const LOG_WARNING = 'warning';
/** Notice: normal but significant condition */
export const LOG_NOTICE  = 'notice';
/** Informational: informational messages */
export const LOG_INFO  = 'info';
/** Debug: debug-level messages */
export const LOG_DEBUG = 'debug';
/** @see https://tools.ietf.org/html/rfc5424 */
export type LOG_SEVERITY = typeof LOG_EMERGENCY | typeof LOG_ALERT | typeof LOG_CRITICAL | typeof LOG_ERROR | typeof LOG_WARNING | typeof LOG_NOTICE | typeof LOG_INFO | typeof LOG_DEBUG;

/**
 * Map of the numerical codes of severity
 * @see https://tools.ietf.org/html/rfc5424
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
