'use strict';
const isPromise = require('is-promise');
const context = require('./context');

const compose = middlewares => {
	return ctx => {
		return middlewares.reduce((promise, middleware) => {
			return promise.then(result => middleware(ctx, result));
		}, Promise.resolve());
	};
};

const respond = (ctx, res) => {
	if (isPromise(ctx.body)) {
		return ctx.body.then(result => res.succeed(result));
	}

	res.succeed(ctx.body);
};

class Application {

	constructor() {
		this._middleware = [];
		this._context = Object.create(context);
	}

	use(fn) {
		this._middleware.push(fn);
		return this;
	}

	createContext(req, ctx) {
		const context = Object.create(this._context);
		context.request = {};
		context.app = this;
		context.onerror = context.onerror.bind(context);

		Object.defineProperty(context, 'req', {enumerable: true, value: req});
		Object.defineProperty(context, 'context', {enumerable: true, value: ctx});

		for (const key of ['body', 'query', 'params', 'identity']) {
			Object.defineProperty(context.request, key, {enumerable: true, writable: true, value: req[key] || {}});
		}

		if (req['http-method']) {
			Object.defineProperty(context, 'method', {enumerable: true, value: req['http-method']});
		}

		if (req['resource-path']) {
			Object.defineProperty(context, 'path', {enumerable: true, value: req['resource-path']});
		}

		return context;
	}

	listen() {
		const fn = compose(this._middleware);

		return (req, context) => {
			const ctx = this.createContext(req, context);
			fn(ctx)
				.then(() => respond(ctx, context))
				.catch(err => ctx.onerror(context, err));
		};
	}
}

module.exports = () => new Application();
