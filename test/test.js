import test from 'ava';
import AWSApplication from '../lib/aws.application';
import AzureApplication from '../lib/azure.application';
import m from '..';

test('create an AWS application by default', t => {
	t.true(m() instanceof AWSApplication);
});

test.serial('create an Azure application if `AzureWebJobsStorage` is present', t => {
	process.env.AzureWebJobsStorage = '/storage';
	t.true(m() instanceof AzureApplication);
	delete process.env.AzureWebJobsStorage;
});

test('app should not have middlewares by default', t => {
	const app = m();
	t.deepEqual(app._middleware, []);
});
