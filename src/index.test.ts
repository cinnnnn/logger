/* eslint-disable no-console */

import { LambdaLogger } from '.';
import mockConsole from 'jest-mock-console';

describe('LambdaLogger' ,  () => {
  const log = new LambdaLogger({
    logLevel: 'error'
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('Notice doesn\'t log with Error level', () => {
    const restoreConsole = mockConsole();

    log.notice('Notice Message');
    log.notice('Notice Message');

    expect(console.log).toHaveBeenCalledTimes(0);

    restoreConsole();
  });

  test('Critical logs on Error level', () => {
    const restoreConsole = mockConsole();

    log.critical('Critical Message');

    expect(console.error).toHaveBeenCalled();

    restoreConsole();
  });

  test('Error logs on Error level with data and metrics', () => {
    const restoreConsole = mockConsole();

    const expectedData = {
      'user_id' : '4242'
    };

    const expectedMetrics = {
      'user_count': 16
    };

    const testError = new Error('Test Error');

    log.error('Error Message', {
      data: expectedData,
      metrics: expectedMetrics,
      error: testError
    });

    const logEntry = JSON.parse(console.error['mock']['calls'][0][0]) ;

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(logEntry.data).toEqual(expectedData);
    expect(logEntry.metrics).toEqual(expectedMetrics);
    expect(logEntry.error.message).toEqual(testError.message);
    expect(logEntry.error.stack).toEqual(testError.stack);
    expect(logEntry.error.name).toEqual(testError.name);

    restoreConsole();
  });

  test('Logger with context', () => {
    const restoreConsole = mockConsole();

    const expectedData = {
      'user_id' : '4242'
    };

    const expectedMetrics = {
      'user_count': 16
    };

    log.alert('Alert Message', {
      data: expectedData,
      metrics: expectedMetrics
    });

    const logEntry = JSON.parse(console.error['mock']['calls'][0][0]) ;

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(logEntry.data).toEqual(expectedData);
    expect(logEntry.metrics).toEqual(expectedMetrics);

    restoreConsole();
  });

});
