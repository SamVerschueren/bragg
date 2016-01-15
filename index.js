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
	var context = Object.create(this._context);
	context.req = req;
	context.request = {};

	['body', 'query', 'params', 'identity'].forEach(function (key) {
		if (req[key]) {
			context.request[key] = req[key];
		}
	});

	if (req['http-method']) {
		context.method = req['http-method'];
	}

	if (req['resource-path']) {
		context.path = req['resource-path'];
	}

	return context;
};

Application.prototype.listen = function () {
	var fn = compose(this._middleware);
	var self = this;

	return function (req, context) {
		var ctx = self.createContext(req);
		fn.call(ctx)
			.then(function () {
				return respond.call(ctx, context);
			})
			.catch(function (err) {
				ctx.onerror(context, err);
			});
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
