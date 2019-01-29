const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
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
			response(numClients);
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