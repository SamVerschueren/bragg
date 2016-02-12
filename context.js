'use strict';
var createError = require('http-errors');
var statuses = require('statuses');
module.exports = {
	throw: function () {
		throw createError.apply(null, arguments);
	},
	onerror: function (context, err) {
		if (!err) {
			return;
		}

		if (!(err instanceof Error)) {
			err = new Error('non-error thrown: ' + err);
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

		var code = statuses[err.status];
		var msg = err.status + ' - ' + (err.expose ? err.message : code);

		context.fail(msg);
	}
};
