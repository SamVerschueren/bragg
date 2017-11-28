'use strict';
const createError = require('http-errors');
const statuses = require('statuses');

module.exports = {
	// eslint-disable-next-line object-shorthand
	throw: function () {
		// eslint-disable-next-line prefer-spread
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

		if (!err.expose) {
			console.log(err.stack);
		}

		const code = statuses[err.status];
		const msg = `${err.status} - ${err.expose ? err.message : code}`;

		// Call the error callback and fail
		Promise.resolve(() => app.errorCb(err))
			.then(() => context.fail(msg));
	}
};
