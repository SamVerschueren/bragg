'use strict';
var Promise = require('pinkie-promise');
var isPromise = require('is-promise');
var context = require('./context');

function Application() {
	if (!(this instanceof Application)) {
		return new Application();
	}

	this._middleware = [];
	this._context = Object.create(context);
}

Application.prototype.use = function (fn) {
	this._middleware.push(fn);
	return this;
};

Application.prototype.createContext = function (req, ctx) {
	var context = Object.create(this._context);
	context.request = {};
	context.app = this;
	context.onerror = context.onerror.bind(context);

	Object.defineProperty(context, 'req', {enumerable: true, value: req});
	Object.defineProperty(context, 'context', {enumerable: true, value: ctx});

	['body', 'query', 'params', 'identity'].forEach(function (key) {
		Object.defineProperty(context.request, key, {enumerable: true, writable: true, value: req[key] || {}});
	});

	if (req['http-method']) {
		Object.defineProperty(context, 'method', {enumerable: true, value: req['http-method']});
	}

	if (req['resource-path']) {
		Object.defineProperty(context, 'path', {enumerable: true, value: req['resource-path']});
	}

	return context;
};

Application.prototype.listen = function () {
	var fn = compose(this._middleware);
	var self = this;

	return function (req, context) {
		var ctx = self.createContext(req, context);
		fn(ctx)
			.then(function () {
				return respond(ctx, context);
			})
			.catch(function (err) {
				ctx.onerror(context, err);
			});
	};
};

function compose(middlewares) {
	return function (ctx) {
		return middlewares.reduce(function (promise, middleware) {
			return promise.then(function (result) {
				return middleware(ctx, result);
			});
		}, Promise.resolve());
	};
}

function respond(ctx, res) {
	if (isPromise(ctx.body)) {
		return ctx.body.then(function (result) {
			res.succeed(result);
		});
	}

	res.succeed(ctx.body);
}

module.exports = Application;
