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

io.sockets.on('connection', function (socket) {
	//add the socket id to stack of objects based on id
	socket.on('player-join', (data) => {
		let player = { username: data, id: socket.id };
		players.push(player);
		console.log("User '" + data + "' joined");
		io.sockets.emit('message', player);
	});

	socket.on('motion', function (data) {
		bg_col = 'rgb(0,255,0)';
		let a = data;

		let username = a.sender;
		let x = a.x;
		let y = a.y;
		let z = a.z;

		let total = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

		const index = players.findIndex((object) => {
			return object.username === username;
		});

		if (total > 5) {
			// console.log(sender_id + ' total: ' + total);
			if (players) {
				console.log(players);
			}
		}
	});

	// socket.on('orientation', function (data) {
	// console.log(
	// 	'ORIENTATION: ' + data.alpha + ' ' + data.beta + ' ' + data.gamma
	// );
	// console.log('ORIENTATION OBJECT: ' + JSON.stringify(data, null, 4) + '\n');
	// });

	socket.on('disconnect', () => {
		const index = players.findIndex((object) => {
			return object.id === socket.id;
		});

		if (index >= 0) {
			username = players[index].username;
			players.splice(index, 1);
			console.log(username + ' disconnected');
		}
	});
});
