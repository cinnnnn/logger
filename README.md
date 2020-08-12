# Tailwind Logger
The purpose of the Tailwind Logger is to provide a way to create well typed, structured, consistent logs.

This will allow services like Elastic Search or Datadog to properly index all fields on the log.

## Installation

```bash
npm install @tailwindapp/logger
```

## Usage

### Service Name
To use the logger, you must initialize it with a service name.

```ts
const log = new LambdaLogger({
  service: 'image-service'
});
```

### Levels
You can also initialize it with a logging level. The default level is 'warning'.

```ts
const log = new LambdaLogger({
  service: 'image-service',
  level: 'debug'
});
```

If you log an error that is the same or above the initially set level, it will write the log.

If it is below the initially set level it will not write the log.

For example, if we set the level to `warning`:
```ts
const log = new LambdaLogger({
  service: 'image-service',
  level: 'warning'
});

log.error('Error Message') // ✔️ this will be written
log.warning('Warning Message') // ✔️ this will written
log.info('Info Message') // ❌ this will not be written
log.debug('Debug Message') // ❌ this will not be written
```

If we set the level to `debug` then all logs will be written
```ts
const log = new LambdaLogger({
  service: 'image-service',
  level: 'warning'
});

log.error('Error Message') // ✔️ this will be written
log.warning('Warning Message') // ✔️ this will written
log.info('Info Message') // ✔️ this will written
log.debug('Debug Message') // ✔️ this will written
```

. The valid levels in descending order of priority:

* `'emerg'`
* `'alert'`
* `'critical'`
* `'error'`
* `'warning'`
* `'notice'`
* `'info'`
* `'debug'`

See [RFC 5424](https://tools.ietf.org/html/rfc5424).

### Data, Metrics & Errors
You can also pass in additional `data` or `metrics` that are relevant to the logs.

You can also pass in an `error` object if you are catching a thrown error somewhere.

`data` must be in a `string: string` format

`metrics` must be in a `string: number` format.

`error` can be any error that you catch. It will be unwrapped for you if possible

This is so they can be properly auto-indexed by Elastic Search.

```ts
const log = new LambdaLogger({
  service: 'image-service',
  level: 'warning'
});

const loginError = new Error('Malformed login request');

log.error('Login Failed!', {
  data: {
    username: 'piesupplies'
  },
  error: loginError
});

log.warning('Post rate is very high', {
  metrics: {
    posts: 50
  },
  data: {
    email: 'contact@piesupplies.com'
  }
});

```


## Specific Loggers

### LambdaLogger
Currently the only logger we have is the `LambdaLogger`.

Once we need another logger it would be good to split this into a generic log class, and specific loggers that extend it.

```ts
const log = new LambdaLogger({
  level: 'warning'
});
```
