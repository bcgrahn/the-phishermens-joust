//imports
require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const https = require('https');
const socketio = require('socket.io');
let server, io;

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

const ssl = https.createServer(
	{
		key: fs.readFileSync(path.join(__dirname, './certs/key.pem'), 'utf-8'),
		cert: fs.readFileSync(path.join(__dirname, './certs/cert.pem'), 'utf-8'),
	},
	app
);

ssl.listen(process.env.PORT, () => {
	console.log(`Server is active on port: ${process.env.PORT}`);
});

io = socketio(ssl);

io.sockets.on('connection', function (socket) {
	//add the socket id to stack of objects based on id
	socket.on('motion', function (data) {
		let a = data;

		let sender_id = a.sender;
		let x = a.x;
		let y = a.y;
		let z = a.z;

		let total = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

		if (total > 5) {
			console.log(sender_id + ' total: ' + total);
		}
	});

	socket.on('orientation', function (data) {
		// console.log(
		// 	'ORIENTATION: ' + data.alpha + ' ' + data.beta + ' ' + data.gamma
		// );
		// console.log('ORIENTATION OBJECT: ' + JSON.stringify(data, null, 4) + '\n');
	});
});
