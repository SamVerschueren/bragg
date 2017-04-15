'use strict';
const Application = require('./application');
const compose = require('./utils/compose');

class AWSApplication extends Application {

	createContext(req, ctx) {
		const context = super.createContext(req, ctx);
		context.cloud = 'aws';

		Object.defineProperty(context, 'method', {enumerable: true, value: req.httpMethod});
		Object.defineProperty(context, 'path', {enumerable: true, value: req.path});

		// Define `request` properties
		Object.defineProperty(context.request, 'body', {enumerable: true, writable: true, value: req.body || ''});
		Object.defineProperty(context.request, 'query', {enumerable: true, writable: true, value: req.queryStringParameters || {}});
		Object.defineProperty(context.request, 'headers', {enumerable: true, writable: true, value: req.headers || {}});
		Object.defineProperty(context.request, 'identity', {enumerable: true, writable: true, value: (req.requestContext && req.requestContext.identity) || {}});

		return context;
	}

	respond(context, res) {
		let result;

		if (res instanceof Error) {
			result = {
				statusCode: res.status,
				body: res.message
			};
		} else {
			result = {
				statusCode: res.status || 200,
				headers: Object.assign({
					'Content-Type': 'application/json'
				}, res.headers),
				body: res.body
			};
		}

		context.done(undefined, result);
	}

	listen() {
		const fn = compose(this._middleware);

		return (req, context) => {
			const ctx = this.createContext(req, context);

			fn(ctx)
				.then(() => ctx.body)
				.then(result => {
					ctx.body = result;

					this.respond(context, ctx);
				})
				.catch(err => this.respond(context, ctx.onerror(err)));
		};
	}
}

module.exports = AWSApplication;
