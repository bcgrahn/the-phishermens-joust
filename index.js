//imports
require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path')
const https = require('https');
const socketio = require('socket.io');
let server, io;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

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

const ssl = https.createServer({
    key:fs.readFileSync(path.join(__dirname,'./certs/key.pem'),'utf-8'),
    cert:fs.readFileSync(path.join(__dirname,'./certs/cert.pem'),'utf-8') 
},app)

ssl.listen(process.env.PORT, ()=>{console.log(`Server is active on port: ${process.env.PORT}`)});
