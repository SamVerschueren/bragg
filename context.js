'use strict';
var createError = require('http-errors');
module.exports = {
	throw: function () {
		throw createError.apply(null, arguments);
	},
	onerror: function (context, err) {
		console.log(err);

		if (!(err instanceof Error)) {
			err = createError('non-error thrown: ' + err);
		}

		var status = err.status || 500;

		context.fail(status + ' - ' + err.message);
	}
};
