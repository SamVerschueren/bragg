'use strict';
const AWSApplication = require('./lib/aws.application');
const AzureApplication = require('./lib/azure.application');

module.exports = () => {
	if (process.env.AzureWebJobsStorage) {
		return new AzureApplication();
	}

	return new AWSApplication();
};
