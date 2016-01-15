# bragg [![Build Status](https://travis-ci.org/SamVerschueren/bragg.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg)

> AWS λ web framework

The framework is heavily inspired by [Koa](http://koajs.com/).

## Install

```
$ npm install --save bragg
```


## Usage

### Simple example

```js
var bragg = require('bragg');
var app = bragg();

app.use(function () {
    this.body = 'Foo Bar';
});

exports.handler = app.listen();
```

The result if the lambda function in this case is `Foo Bar`.

### Promises

```js
var Promise = require('pinkie-promise');
var bragg = require('bragg');
var app = bragg();

app.use(function () {
    this.body = Promise.resolve('Foo Bar');
});

exports.handler = app.listen();
```

If the `body` is a promise function, the result of the lambda function will be the same as the result of the promise.

### Middlewares

```js
var Promise = require('pinkie-promise');
var bragg = require('bragg');
var app = bragg();

app.use(function () {
    return 'Foo';
});

app.use(function (result) {
    return Promise.resolve(result + ' Bar');
});

app.use(function (result) {
    this.body = result + ' Baz';
});

exports.handler = app.listen();
```

The output of the lambda function will be `Foo Bar Baz`.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
