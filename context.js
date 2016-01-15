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

		context.fail(err.status + ' - ' + err.message);
	}
};
