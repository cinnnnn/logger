/* eslint-disable no-console */

import { LambdaLogger } from '.';
import mockConsole from 'jest-mock-console';

const context = {
  functionName: 'function-name',
  functionVersion: 'function-version',
  invokedFunctionArn: 'function-arn',
  memoryLimitInMB: 'function-memory',
  awsRequestId: 'function-req-id',
  logGroupName: 'function-log-group-name',
  logStreamName: 'function-log-stream-name'
};

describe('LambdaLogger' ,  () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('Notice doesn\'t log with Error level', () => {
    const restoreConsole = mockConsole();

    const log = new LambdaLogger({
      service: 'test',
      context: context as any,
      logLevel: 'error'
    });

    log.notice('Notice Message');
    log.notice('Notice Message');

    expect(console.log).toHaveBeenCalledTimes(0);

    restoreConsole();
  });

  test('Error logs on Notice level', () => {
    const restoreConsole = mockConsole();

    const log = new LambdaLogger({
      service: 'test',
      context: context as any,
      logLevel: 'notice'
    });

    log.critical('Critical Message');

    expect(console.log).toHaveBeenCalled();

    restoreConsole();
  });

  test('Debug logs on Debug level with data and metrics', () => {
    const restoreConsole = mockConsole();

    const expectedData = {
      'user_id' : '4242'
    };

    const expectedMetrics = {
      'user_count': 16
    };

    const log = new LambdaLogger({
      service: 'test',
      context: context as any,
      logLevel: 'debug'
    });

    log.debug('Debug Message', {
      data: expectedData,
      metrics: expectedMetrics
    });

    const logEntry = JSON.parse(console.log['mock']['calls'][0][0]) ;

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(logEntry.data).toEqual(expectedData);
    expect(logEntry.metrics).toEqual(expectedMetrics);

    restoreConsole();
  });

  test('Logger works without context', () => {
    const restoreConsole = mockConsole();

    const expectedData = {
      'user_id' : '4242'
    };

    const expectedMetrics = {
      'user_count': 16
    };

    const log = new LambdaLogger({
      service: 'test',
      logLevel: 'debug'
    });

    log.info('Info Message', {
      data: expectedData,
      metrics: expectedMetrics
    });

    const logEntry = JSON.parse(console.log['mock']['calls'][0][0]) ;

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(logEntry.data).toEqual(expectedData);
    expect(logEntry.metrics).toEqual(expectedMetrics);

    restoreConsole();
  });

});
