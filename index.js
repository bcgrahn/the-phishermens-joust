//imports
require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');

const fs = require('fs');
const path = require('path');
const https = require('https');
const socketio = require('socket.io');
let server, io;

// --- gloabal variables ---

const players = [];

// -------------------------

// --- functions ---

function get_rgb(value, threshold) {
	if (value <= threshold / 2) {
		let red = (2 * (255 * value)) / threshold;
		return `rgb(${red}, 255, 0)`;
	} else {
		let green = 255 - 255 * ((value - threshold / 2) / threshold);
		return `rgb(255, ${green}, 0)`;
	}
}

// -----------------

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (req, res) => {
	res.render(__dirname + '/views/player');
});

app.get('/admin', (req, res) => {
	res.render(__dirname + '/views/admin');
});

app.get('/', function (req, res) {
	res.render('home.ejs');
});
app.get('/game', function (req, res) {
	res.render('index.ejs');
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

// let socketIo = require('socket.io')(https, {cors: {origin: '*'}});

io.sockets.on('connection', function (socket) {
	//check if client is in the database
	// console.log('client ' + socket.id + ' connected');
	// if (players.length > 0) {
	// 	console.log('length: ' + players.length);
	// 	const index = players.findIndex((object) => {
	// 		return object.id === socket.id;
	// 	});
	// 	console.log('index: ' + index);
	// } else {
	// 	socket.emit('redirect', '/');
	// }

	//add the socket id to stack of objects based on id
	socket.on('player-join', (user_name) => {
		if (user_name.trim() != '') {
			if (user_name == 'admin') {
				socket.emit('redirect', '/admin');
			} else {
				let player = {
					username: user_name,
					id: socket.id,
					rgb: 'rgb(0, 0, 0)',
				};
				players.push(player);
				console.log("User '" + user_name + "' connected");
				io.emit('player-connected', player);
			}
		} else {
			console.log(
				'Blank user attempted connection, redirecting user to login page...'
			);
			socket.emit('redirect', '/');
		}
	});

	socket.on('motion', function (data) {
		const username = data.sender;
		const rgb = data.rgb;

		const index = players.findIndex((object) => {
			return object.username === username;
		});
		if (players[index] != null) {
			players[index].rgb = rgb;
		}

		if (rgb == 'rgb(255, 0, 0)') {
			console.log(players[index].username + ' eliminated.');
		}

		io.sockets.emit('motion-update', players[index]);
	});

	// socket.on('orientation', function (data) {
	// console.log(
	// 	'ORIENTATION: ' + data.alpha + ' ' + data.beta + ' ' + data.gamma
	// );
	// console.log('ORIENTATION OBJECT: ' + JSON.stringify(data, null, 4) + '\n');
	// });

	socket.on('disconnect', () => {
		if (players != null) {
			const index = players.findIndex((object) => {
				return object.id === socket.id;
			});
			if (index >= 0) {
				username = players[index].username;
				io.emit('player-disconnected', players[index]);
				players.splice(index, 1);
				console.log("User '" + username + "' disconnected");
			}
		}
	});
});
