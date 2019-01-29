const request = require('supertest');
const { app } = require('../server');
const { expect } = require('chai');
const coldBrew = require('cold-brew');
const { Key, By, until } = require('selenium-webdriver');

describe('server', function() {
	it('should serve html when a get request is made', function(done) {
		request(app)
		.get('/')
		.expect('Content-Type', 'text/html; charset=UTF-8')
		.expect(200, done);
	});

	it('should serve the correct html page', function(done) {
		request(app)
		.get('/')
		.end((error, response) => {
			expect(response.text.match(/<title>Cold Brew Tutorial<\/title>/))
			.to.not.be.null;
			done();
		})
	});
});



const PORT = 3000;
const ADDRESS = 'http://localhost:' + PORT + '/';

describe('client-side messenger application', function() {
	let client;

	beforeEach(function() {
		client = coldBrew.createClient();
	});

	it('should not reload the page when the text form is submitted', function(done) {
		this.timeout(5000);

		client.get(ADDRESS);

		client.do([
			['sendKeys', 'form input', {type: 'text'}, 'hello word' + Key.ENTER],
			['click', 'form button', {}]
		]);

		client.executeScript(function() {
			return window.location.href;
		}).then((url) => {
			expect(url).to.equal(ADDRESS);
			done();
		}) ;

		afterEach(function(done) {
			client.quit().then(() => done());
		});
	})
});