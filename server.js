const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const https = require('https');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/index.html'));
});

let numClients = 0;
server.listen(3000, () => {
	console.log('listening on port 3000');
	io.on('connection', (socket) => {
		socket.on('join', (response) => {
			numClients++;
			// console.log(numClients);
			response(numClients);
		});

		socket.on('send_offer', (offer) => {
			// console.log('broadcast receive_offer');
			socket.broadcast.emit('receive_offer', offer);
		});

		socket.on('send_answer', (answer) => {
			// console.log('broadcast receive_answer');
			socket.broadcast.emit('receive_answer', answer);
		});

		socket.on('send_ice_candidate', (candidate) => {
			socket.broadcast.emit('receive_ice_candidate', candidate);
		});

		socket.on('leave', () => {
			numClients--;
			console.log(numClients);
		});
	});
});

module.exports = { 
	app,
	resetNumClients(num) {
		numClients = num;
	}
};