const request = require('supertest');
const { app } = require('../server');

describe('server', function() {
	it('should serve html when a get request is made', function(done) {
		request(app)
		.get('/')
		.expect('Content-Type', 'text/html; charset-UTF-8')
		.expect(200, done);
	});
});