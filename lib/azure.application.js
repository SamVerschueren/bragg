'use strict';
const isObj = require('is-obj');
const Application = require('./application');
const compose = require('./utils/compose');

class AzureApplication extends Application {

	createContext(req, ctx) {
		const context = super.createContext(req, ctx);
		context.cloud = 'azure';

		if (req.method) {
			Object.defineProperty(context, 'method', {enumerable: true, value: req.method});
		}

		if (req.params && req.params.path) {
			Object.defineProperty(context, 'path', {enumerable: true, value: `/${req.params.path}`});
		}

		// Define `request` properties
		Object.defineProperty(context.request, 'body', {enumerable: true, writable: true, value: req.rawBody});
		Object.defineProperty(context.request, 'query', {enumerable: true, writable: true, value: req.query});
		Object.defineProperty(context.request, 'headers', {enumerable: true, writable: true, value: req.headers});

		return context;
	}

	respond(context, res) {
		if (res instanceof Error) {
			context.res = {
				status: res.status,
				body: res.message
			};
		} else {
			const json = typeof res.json === 'boolean' ? res.json : isObj(res.body);

			const headers = {};

			if (json) {
				headers['Content-Type'] = 'application/json';
			}

			context.res = {
				status: res.status || 200,
				headers: Object.assign(headers, res.headers),
				body: res.body
			};
		}

		context.done();
	}

	listen() {
		const fn = compose(this._middleware);

		return context => {
			// Make sure the regular `console.log` calls end up in the logfile
			this._hijackLogging(context);

			const ctx = this.createContext(context.req, context);

			fn(ctx)
				.then(() => ctx.body)
				.then(() => this.respond(context, ctx))
				.catch(err => this.respond(context, ctx.onerror(err)));
		};
	}

	_hijackLogging(context) {
		console.log = context.log;
		console.error = context.log.error;
		console.warn = context.log.warn;
		console.info = context.log.info;
	}
}

module.exports = AzureApplication;
