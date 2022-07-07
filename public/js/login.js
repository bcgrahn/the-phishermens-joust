const button = document.getElementById('button-input');
const indicator = document.querySelector('.indicator-sheet');

let socket = io();

const heading = document.querySelector('h1');
const container = document.getElementById('colour-block');

button.addEventListener('click', (e) => {
	const sendingId = document.querySelector('.username-input');
	window.location = '/game?username=' + sendingId.value;
	// socket.emit('availability-check', sendingId.value);
});


