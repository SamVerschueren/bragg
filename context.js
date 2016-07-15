'use strict';
const createError = require('http-errors');
const statuses = require('statuses');

module.exports = {
	// eslint-disable-next-line babel/object-shorthand
	throw: function () {
		// eslint-disable-next-line prefer-spread
		throw createError.apply(null, arguments);
	},
	onerror: (context, err) => {
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

		// default to 500
		if (typeof err.status !== 'number') {
			err.status = 500;
		}

		// TODO Emit an event and let the user handle the logging
		console.log(err);

		if (!err.expose) {
			console.log(err.stack);
		}

		const code = statuses[err.status];
		const msg = `${err.status} - ${err.expose ? err.message : code}`;

		context.fail(msg);
	}
};
