'use strict';
const createError = require('http-errors');
const statuses = require('statuses');

module.exports = {
	throw() {
		console.warn('Bragg: `throw` is deprecated, use `createHttpError` instead');
		throw createError.apply(null, arguments);
	},
	onerror: (app, context, err) => {
		if (!err) {
			return;
		}

		if (!(err instanceof Error)) {
			err = new Error(`non-error thrown: ${err}`);
		}

		// ENOENT support
		if (err.code === 'ENOENT') {
			err.status = 404;
		}

		// Default to 500
		if (typeof err.status !== 'number') {
			err.status = 500;
		}

		err.code = statuses[err.status];

		if (!err.expose) {
			console.log(err.stack);
		}

		const msg = `${err.status} - ${err.expose ? err.message : err.code}`;

		// Call the error callback and fail
		return Promise.resolve()
			.then(() => app.errorCb(err))
			.then(() => context.fail(msg))
			.catch(error => {
				if (error) {
					context.fail(error);

					return;
				}

				context.fail(msg);
			});
	}
};
