import test from 'ava';
import context from '../context';

test('no arguments should throw 500', t => {
	const error = t.throws(() => context.throw());

	t.is(error.message, 'Internal Server Error');
	t.is(error.status, 500);
	t.is(error.statusCode, 500);
});

test('throw 404', t => {
	const error = t.throws(() => context.throw(404));

	t.is(error.message, 'Not Found');
	t.is(error.status, 404);
	t.is(error.statusCode, 404);
});

test('throw 404 with custom error message', t => {
	const error = t.throws(() => context.throw(404, 'User not found'));

	t.is(error.message, 'User not found');
	t.is(error.status, 404);
	t.is(error.statusCode, 404);
});

test('onerror should call correct handlers', async t => {
	t.plan(2);

	const app = {
		errorCb: err => {
			t.is(err.message, 'non-error thrown: Not Found');
		}
	};

	const ctx = {
		fail(message) {
			t.is(message, '500 - Internal Server Error');
		}
	};

	await context.onerror(app, ctx, 'Not Found');
});
