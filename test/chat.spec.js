const request = require('supertest');
const { app, resetNumClients } = require('../server');
const { expect } = require('chai');
const coldBrew = require('cold-brew');
const {By, Key, until } = require("selenium-webdriver");

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
			['sendKeys', 'form input', {type: 'text'}, 'hello world' + Key.ENTER],
			['click', 'form button', {}]
		]);

		client.executeScript(function() {
			return window.location.href;
		}).then((url) => {
			expect(url).to.equal(ADDRESS);
			done();
		}) ;
	});

	it('should post a message to your page(not send!)', function(done) {
		this.timeout(2000);
		client.get(ADDRESS);
		client.do([
			['sendKeys', 'form input', {}, 'Hello World' + Key.ENTER]
		]);
		//exception: TypeError: Wait condition must be a promise-like object, function, or a Condition object
		// client.wait(until.elementLocated(By.css('p.message')));
		client.wait(function() {
			return By.css('p.message') !== null;
		});

		client.findElementByAttributes(
			'p.message',
			{innerText: 'Hello World'}
		).then((found) => {
			if(found) done();
		});
	});

	it('should signal to the server when a client arrives on the page', function(done) {
		this.timeout(2000);
		client.get(ADDRESS);
		client.waitUntilSendSignaling([
			'join'
		]).then((sent) => {
			if(sent) {
				done();
			}
		});
	});

	afterEach(function(done) {
		client.quit().then(() => done());
	});
});

describe('signaling offer and answer', function() {
	let client1;
	let client2;

	beforeEach(function() {
		resetNumClients(0);
		client1 = coldBrew.createClient();
		client2 = coldBrew.createClient();
	});

	it('offer should be sent by the second person to arrive on the page', function(done) {
		this.timeout(5000);

		client1.get(ADDRESS);
		client2.get(ADDRESS);

		client2.waitUntilSendSignaling(['send_offer']).then((sent) => {
			if(sent) {
				done();
			}
		});
	});

	it('clients should exchange offer and answer', function(done) {
		this.timeout(5000);

		client1.get(ADDRESS);
		client2.get(ADDRESS);

		client2.waitUntilSendSignaling(['send_offer']);
		console.log('client2 send_offer');
		client1.waitUntilReceiveSignaling(['receive_offer']);
		console.log('client1 receive_offer');
		client1.waitUntilSendSignaling(['send_answer']);
		console.log('client1 send_answer');
		client2.waitUntilReceiveSignaling(['receive_answer']).then((received) => {
			console.log('client2 receive_answer', received);
			if(received) {
				done();
			}
		});
	});

	afterEach(function(done) {
		client1.quit();
		client2.quit().then(() => done());
	});
});