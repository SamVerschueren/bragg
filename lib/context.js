'use strict';
const createError = require('http-errors');
const statuses = require('statuses');

module.exports = {
	throw: (...args) => {
		throw createError(...args);
	},
	onerror: (err, context) => {
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

		// TODO Emit an event and let the user handle the logging
		console.log(err);

		if (!err.expose) {
			console.log(err.stack);
		}

		err.message = err.expose ? err.message : err.code;
		err.headers = context.headers || {};

		return err;
	}
};
