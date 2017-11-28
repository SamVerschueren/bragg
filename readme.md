# bragg [![Build Status](https://travis-ci.org/SamVerschueren/bragg.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg)

> AWS λ web framework

This framework is heavily inspired by [koa](http://koajs.com/).

## Install

```
$ npm install --save bragg
```


## Usage

### Simple example

Adding a single function as middleware is quite easy. The following example will succeed the lambda function with
the value `Foo Bar`.

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

app.onError(err => {
	console.error(err.message);

	return cleanUp();	// Async cleanup process
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


## Mapping template

In order for you to use parameters provided through API Gateway, you should add a [mapping template](http://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings.html#models-mappings-mappings)
in the integration request.

```js
#set($path = $input.params().path)
#set($qs = $input.params().querystring)
#set($identity = $context.identity)
{
	"identity": {
		#foreach($key in $identity.keySet())
			"$key": "$util.escapeJavaScript($identity.get($key))"
		#if($foreach.hasNext), #end
		#end
	},
	"params": {
		#foreach($key in $path.keySet())
			"$key": "$path.get($key)"
		#if($foreach.hasNext), #end
		#end
	},
	"query": {
		#foreach($key in $qs.keySet())
			"$key": "$qs.get($key)"
		#if($foreach.hasNext), #end
		#end
	},
	"body": $input.json('$')
}
```

These properties will then be available in the `request` object in the middleware function.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
