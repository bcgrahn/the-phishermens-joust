let socket = io();

socket.on('player-connected', (player) => {
	addPlayer(player);
});

socket.on('player-disconnected', (player) => {
	removePlayer(player);
});

socket.on('status-change', (data) => {
	const e = document.getElementById(`player-${data.id}`).children.item(1);
	e.innerHTML = data.status.status;

	if (data.status.status == 'ready') {
		e.style.color = 'rgb(36, 209, 134)';
	} else if (data.status.status == 'eliminated') {
		e.style.color = 'rgb(255, 0, 0)';
	} else if (data.status.status == 'playing') {
		e.style.color = data.status.colour;
	}
});

socket.on('server-restart', () => {
	location.reload(true);
});

const startButton = document.getElementById('start-game');

startButton.addEventListener('click', function () {
	console.log('STARTING GAME');
	socket.emit('server-game-start');
});

function addPlayer(player) {
	const li = document.createElement('li');

	li.classList.add('player-li');
	li.id = 'player-' + player.id;

	const d1 = document.createElement('div');
	const d2 = document.createElement('div');

	d1.classList.add('player');
	d2.classList.add('status');

	d1.innerHTML = player.username;
	d2.innerHTML = 'Waiting';
	d2.style.color = 'rgb(207, 187, 89)';

	li.appendChild(d1);
	li.appendChild(d2);

	const ol = document.querySelector('.player-ul');
	ol.appendChild(li);
}

function removePlayer(player) {
	const el = document.getElementById(`player-${player.id}`).children.item(1);
	el.innerHTML = 'Disconnected';
	el.style.color = 'rgb(194, 72, 72)';

	setTimeout(() => {
		const e = document.getElementById(`player-${player.id}`);
		e.parentElement.removeChild(e);
	}, 3000);
}
