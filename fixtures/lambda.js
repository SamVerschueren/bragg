'use strict';
var Promise = require('pinkie-promise');
var bragg = require('../');
var app = bragg();

app.use(function () {
    if (this.path === '/foo') {
        this.body = 'Bar';
    } else if (this.path === '/foo-bar') {
        this.body = Promise.resolve('Foo Bar');
    } else if (this.path === '/foo-bar-baz') {
        return Promise.resolve('Foo');
    }
});

app.use(function (result) {
    if (result) {
        return Promise.resolve(result + ' Bar');
    }
});

app.use(function (result) {
    if (result) {
        this.body = result + ' Baz';
    }
});

exports.handler = app.listen();
