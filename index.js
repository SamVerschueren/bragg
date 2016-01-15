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

Application.prototype.createContext = function (req) {
	if (!req['http-method']) {
		throw new Error('No http-method provided.');
	}

	if (!req['resource-path']) {
		throw new Error('No resource-path provided.');
	}

	var context = Object.create(this._context);
	context.req = req;
	context.method = req['http-method'];
	context.path = req['resource-path'];
	context.request = {};

	['body', 'query', 'params', 'identity'].forEach(function (key) {
		if (req[key]) {
			context.request[key] = req[key];
		}
	});

	return context;
};

Application.prototype.listen = function () {
	var fn = compose(this._middleware);
	var self = this;

	return function (req, context) {
		try {
			var ctx = self.createContext(req);
			fn.call(ctx)
				.then(function () {
					return respond.call(ctx, context);
				})
				.catch(function (err) {
					ctx.onerror(context, err);
				});
		} catch (err) {
			self._context.onerror(context, err);
		}
	};
};

function compose(middlewares) {
	return function () {
		var self = this;

		return middlewares.reduce(function (promise, middleware) {
			return promise.then(middleware.bind(self));
		}, Promise.resolve());
	};
}

function respond(context) {
	if (isPromise(this.body)) {
		return this.body.then(function (result) {
			context.succeed(result);
		});
	}

	context.succeed(this.body);
}

module.exports = Application;
