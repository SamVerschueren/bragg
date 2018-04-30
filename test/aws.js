import test from 'ava';
import pify from 'aws-lambda-pify';
import m from '..';
import index from './fixtures';

const fixture = {
	httpMethod: 'POST',
	path: '/test',
	body: '{"foo":"bar"}',
	queryStringParameters: {
		hello: 'world'
	},
	headers: {
		'Content-Type': 'application/json'
	}
};

test.beforeEach(t => {
	t.context.app = m();
	t.context.fn = pify(index.handler);
});

test('create context', t => {
	const app = m();

	const ctx = app.createContext(fixture, {foo: 'bar'});
	delete ctx.onerror;

	t.deepEqual(ctx, {
		app,
		cloud: 'aws',
		req: fixture,
		headers: { },
		context: {
			foo: 'bar'
		},
		method: 'POST',
		path: '/test',
		request: {
			body: '{"foo":"bar"}',
			query: {
				hello: 'world'
			},
			identity: {},
			headers: {
				'Content-Type': 'application/json'
			}
		}
	});
});

test('overwrite body', t => {
	const ctx = t.context.app.createContext(fixture, {foo: 'bar'});
	ctx.request.body = 'foo';

	t.deepEqual(ctx.request.body, 'foo');
});

test('error when overwriting ctx.method', t => {
	const ctx = t.context.app.createContext(fixture, {foo: 'bar'});
	t.throws(() => {
		ctx.method = 'POST';
	}, TypeError);
});

test('body not set', async t => {
	t.deepEqual(await t.context.fn(fixture), {
		statusCode: 200,
		body: undefined,
		headers: { }
	});
});

test('return the body', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/foo'}), {
		statusCode: 200,
		body: 'Bar',
		headers: { }
	});
});

test('resolves body if it is a promise', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/foo-bar'}), {
		statusCode: 200,
		body: 'Foo Bar',
		headers: { }
	});
});

test('chain middlewares', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/foo-bar-baz'}), {
		statusCode: 200,
		body: 'Foo Bar Baz',
		headers: { }
	});
});

test('error', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/blabla'}), {
		statusCode: 404,
		body: 'Resource not found',
		headers: { }
	});
});

test('500 error', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/error'}), {
		statusCode: 500,
		body: 'Internal Server Error',
		headers: { }
	});
});

test('account ID should be available in the context object', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/account'}), {
		statusCode: 200,
		body: '123456789012',
		headers: { }
	});
});

test('json response', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/json'}), {
		statusCode: 201,
		body: '{"hello":"world"}',
		headers: {
			'Content-Type': 'application/json'
		}
	});
});

test('custom headers', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/headers'}), {
		statusCode: 200,
		body: '{"unicorn":"rainbow"}',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'X-Api-Key': 'foo'
		}
	});
});

test('set one header', async t => {
	t.deepEqual(await t.context.fn({httpMethod: 'GET', path: '/cors'}), {
		statusCode: 200,
		body: undefined,
		headers: {
			'Access-Control-Allow-Origin': 'https://foo.bar'
		}
	});
});
