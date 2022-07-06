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

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/lobby', (req, res) => {
	res.render('lobby.ejs');
});

app.get('/', function (req, res) {
	res.render('landing.ejs');
});

app.get('/login', function (req, res) {
	res.render('login.ejs');
});
app.get('/play', function (req, res) {
	res.render('login.ejs');
});

// app.get('/game', function (req, res) {
// 	res.render('index.ejs');
// });

app.get('/spectate', function (req, res) {
	res.render('spectator.ejs', { players });
});

if(process.env.PORT==null){
	const ssl = https.createServer(
		{
			key: fs.readFileSync(path.join(__dirname, './certs/key.pem'), 'utf-8'),
			cert: fs.readFileSync(path.join(__dirname, './certs/cert.pem'), 'utf-8'),
		},
		app
	);
	
	ssl.listen(5000, () => {
		console.log(`Server is active on port: ${5000}`);
	});
	
	io = socketio(ssl);
}else{
	const http = require('http');
	server = http.Server(app);
	server.listen(process.env.PORT,()=>console.log(`Server is active on port: ${process.env.PORT}`))
	io = socketio(server);
}

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

function createPlayer(user_name, socketId) {
	let player = {
		username: user_name,
		id: socketId,
		data: 0,
		status: 'waiting',
	};
	players.push(player);
	console.log("User '" + user_name + "' connected");
	io.emit('player-connected', player);
}

// -----------------

setTimeout(() => {
	io.sockets.emit('server-restart');
}, 1000);

io.sockets.on('connection', function (socket) {
	//add the socket id to stack of objects based on id
	socket.on('availability-check', (user_name) => {
		if (user_name.trim() != '') {
			if (players != null) {
				const index = players.findIndex((object) => {
					return object.username === user_name;
				});

				if (index > -1) {
					socket.emit('availability-response', false);
				} else {
					socket.emit('availability-response', true);
					createPlayer(user_name, socket.id);
				}
			} else {
				socket.emit('availability-response', true);
				createPlayer(user_name, socket.id);
			}
		} else {
			console.log(
				'Blank user attempted connection, redirecting user to login page...'
			);
			socket.emit('redirect', '/');
		}
	});

	// socket.on('login-check', () => {
	// 	if (players != null) {
	// 		const index = players.findIndex((object) => {
	// 			return object.id === socket.id;
	// 		});

	// 		if (index > -1) {
	// 			socket.emit('login-response', true);
	// 		}
	// 		else {
	// 			socket.emit('login-response', false);
	// 		}
	// 	}
	// 	else {
	// 		socket.emit('login-response', false);
	// 	}
	// })

	socket.on('server-game-start', () => {
		console.log('server-game-start request logged');
		io.sockets.emit('game-start');
	});

	socket.on('request-players', (data) => {
		socket.emit('player-load', players);
	});

	socket.on('motion', function (data) {
		const username = data.sender;
		const rgb = data.rgb;

		const index = players.findIndex((object) => {
			return object.username === username;
		});
		if (players[index] != null) {
			players[index].rgb = rgb;
			if (rgb == 'rgb(255, 0, 0)') {
				console.log(players[index].username + ' eliminated.');
			}
		}

		io.sockets.emit('motion-update', players[index]);
	});

	socket.on('status-change', (status) => {
		if (players != null) {
			const index = players.findIndex((object) => {
				return object.id === socket.id;
			});

			if (index > -1) {
				players[index].status = status;
				io.sockets.emit('status-change', players[index]);
				console.log(
					"'" +
						players[index].username +
						"' status change: " +
						players[index].status
				);
			} else {
				socket.emit('force-refresh');
			}
		} else {
			socket.emit('force-refresh');
		}
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
