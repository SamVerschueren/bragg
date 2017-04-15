import test from 'ava';
import pify from 'aws-lambda-pify';
import './fixtures/azure-env';		// eslint-disable-line import/no-unassigned-import
import m from '../';
import index from './fixtures/index';

const fixture = {
	req: {
		method: 'POST',
		params: {
			path: 'test'
		},
		rawBody: '{"foo":"bar"}',
		query: {
			hello: 'world'
		},
		headers: {
			'Content-Type': 'application/json'
		}
	}
};

test.beforeEach(t => {
	t.context.app = m();
	t.context.fn = pify(index.handler);
});

test('create context', t => {
	const app = m();

	const ctx = app.createContext(fixture.req, {foo: 'bar'});
	delete ctx.onerror;

	t.deepEqual(ctx, {
		app,
		cloud: 'azure',
		req: fixture.req,
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
			headers: {
				'Content-Type': 'application/json'
			}
		}
	});
});

test('overwrite body', t => {
	const ctx = t.context.app.createContext(fixture.req, {foo: 'bar'});
	ctx.request.body = 'foo';

	t.deepEqual(ctx.request.body, 'foo');
});

test('error when overwriting a property of the context object', t => {
	const ctx = t.context.app.createContext(fixture.req, {foo: 'bar'});
	t.throws(() => {
		ctx.path = 'foo';
	}, TypeError);
});
