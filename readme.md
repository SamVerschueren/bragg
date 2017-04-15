# bragg

[![Build Status](https://travis-ci.org/SamVerschueren/bragg.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg)
[![Coverage Status](https://coveralls.io/repos/SamVerschueren/bragg/badge.svg?branch=master&service=github)](https://coveralls.io/github/SamVerschueren/bragg?branch=master)

> Serverless web framework for [AWS λ](https://aws.amazon.com/lambda/) and [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)

This framework is heavily inspired by [koa](http://koajs.com/).

## Install

```
$ npm install --save bragg
```


## Usage

### Simple example

Adding a single function as middleware is quite easy. The following example will result in a `200` response with
the body set to `Foo Bar`.

```js
const bragg = require('bragg');
const app = bragg();

app.use(ctx => {
	ctx.body = 'Foo Bar';
});

exports.handler = app.listen();
```

### Promise support

If a promise is assigned to the `body` property, it will be resolved before sending the result to the client.

```js
const bragg = require('bragg');
const app = bragg();

app.use(ctx => {
	ctx.body = Promise.resolve('Foo Bar');
});

exports.handler = app.listen();
```

### Middlewares

Multiple middlewares will be executed one after the other. The result of the following example is `Foo Bar Baz`.

```js
const bragg = require('bragg');
const app = bragg();

app.use(() => {
	return 'Foo';
});

app.use((ctx, result) => {
	return Promise.resolve(result + ' Bar');
});

app.use((ctx, result) => {
	ctx.body = result + ' Baz';
});

exports.handler = app.listen();
```


## Middlewares

- [bragg-router](https://github.com/SamVerschueren/bragg-router) - Router middleware.
- [bragg-env](https://github.com/SamVerschueren/bragg-env) - Extract the environment.
- [bragg-decode-components](https://github.com/SamVerschueren/bragg-decode-components) - Decode the `params` and `query` object.
- [bragg-safe-guard](https://github.com/SamVerschueren/bragg-safe-guard) - Prevents leaking information outside the bragg context.
- [bragg-sns](https://github.com/SamVerschueren/bragg-sns) - SNS middleware.
- [bragg-dynamodb](https://github.com/SamVerschueren/bragg-dynamodb) - DynamoDB middleware.
- [bragg-cloudwatch](https://github.com/SamVerschueren/bragg-cloudwatch) - CloudWatch middleware.
- [bragg-cron](https://github.com/SamVerschueren/bragg-cron) - Cronjob middleware.
- [bragg-kms-decrypt](https://github.com/SamVerschueren/bragg-kms-decrypt) - Decrypt properties from the response object.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
