import test from 'ava';
import pify from 'aws-lambda-pify';
import index from './fixtures/lambda';
import m from '.';

const fn = pify(index.handler);

const fixture = {
	'http-method': 'POST',
	'resource-path': '/test',
	body: {
		foo: 'bar'
	},
	query: {
		hello: 'world'
	}
};

const overwriteFn = ctx => {
	ctx.path = 'hello';
};

test.beforeEach(t => {
	t.context.app = m();
});

test('create', t => {
	t.deepEqual(t.context.app._middleware, []);
});

test('create context', t => {
	const ctx = t.context.app.createContext(fixture, {foo: 'bar'});

	t.truthy(ctx.app);

	delete ctx.app;
	delete ctx.onerror;

	t.deepEqual(ctx, {
		req: fixture,
		context: {
			foo: 'bar'
		},
		method: 'POST',
		path: '/test',
		request: {
			body: fixture.body,
			query: fixture.query,
			params: {},
			identity: {}
		}
	});
});

test('overwrite body', t => {
	const ctx = t.context.app.createContext(fixture, {foo: 'bar'});
	ctx.request.body = 'foo';

	t.deepEqual(ctx.request.body, 'foo');
});

test('error when overwriting a property of the context object', t => {
	const ctx = t.context.app.createContext(fixture, {foo: 'bar'});
	t.throws(overwriteFn.bind(ctx), TypeError);
});

test('return undefined if the body is not set', async t => {
	t.falsy(await fn(fixture));
});

test('return the body', async t => {
	t.is(await fn({'http-method': 'GET', 'resource-path': '/foo'}), 'Bar');
});

test('resolves body if it is a promise', async t => {
	t.is(await fn({'http-method': 'GET', 'resource-path': '/foo-bar'}), 'Foo Bar');
});

test('chain middlewares', async t => {
	t.is(await fn({'http-method': 'GET', 'resource-path': '/foo-bar-baz'}), 'Foo Bar Baz');
});

test('error', t => {
	t.throws(fn({'http-metod': 'GET', 'resource-path': '/blabla'}), '404 - Resource not found');
});

test('500 error', t => {
	t.throws(fn({'http-metod': 'GET', 'resource-path': '/error'}), '500 - Internal Server Error');
});
