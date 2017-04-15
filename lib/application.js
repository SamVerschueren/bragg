'use strict';
const context = require('./context');

class Application {

	constructor() {
		this._middleware = [];
		this._context = Object.create(context);
	}

	use(fn) {
		this._middleware.push(fn);
		return this;
	}

	createContext(req, ctx) {
		const context = Object.create(this._context);
		context.request = {};
		context.app = this;
		context.onerror = context.onerror.bind(context);

		Object.defineProperty(context, 'req', {enumerable: true, value: req});
		Object.defineProperty(context, 'context', {enumerable: true, value: ctx});

		return context;
	}

	respond() {
		throw new Error('Method `respond()` is not implemented');
	}

	listen() {
		throw new Error('Method `listen()` is not implemented');
	}
}

module.exports = Application;
