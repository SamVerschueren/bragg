'use strict';
module.exports = middlewares => {
	return ctx => {
		return middlewares.reduce((promise, middleware) => {
			return promise.then(result => middleware(ctx, result));
		}, Promise.resolve());
	};
};
