import test from 'ava';
import {createHttpError} from '..';

test('create a not found error', t => {
	const notFound = createHttpError(404);

	t.is(notFound.status, 404);
	t.is(notFound.message, 'Not Found');
});

test('create a 400 error with custom message', t => {
	const notFound = createHttpError(400, 'Provide a name');

	t.is(notFound.status, 400);
	t.is(notFound.message, 'Provide a name');
});
