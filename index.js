//imports
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');
let server, io;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

server = http.Server(app);
server.listen(5000);

io = socketio(server);

io.sockets.on('connection', function (socket) {

    socket.on('motion', function (data) {
      let a = data.acceleration;
      console.log('MOTION: ' + a.x + ' ' + a.y + ' ' + a.z );
      // console.log('MOTION OBJECT: ' + JSON.stringify(data, null, 4) + '\n');
    });
  
    socket.on('orientation', function (data) {
      console.log('ORIENTATION: ' + data.alpha + ' ' + data.beta + ' ' + data.gamma);
      // console.log('ORIENTATION OBJECT: ' + JSON.stringify(data, null, 4) + '\n');
    });
  
});