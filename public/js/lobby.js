let socket = io();

let readyCount = 0;
let totalCount = 0;

socket.on('player-connected', (player) => {
	addPlayer(player);
});

socket.on('player-disconnected', (player) => {
	removePlayer(player);
});

socket.on('status-change', (player) => {
	const e = document.getElementById(`player-${player.id}`).children.item(1);
	e.innerHTML = player.status.status;

	if (player.status.status == 'ready') {
		readyCount += 1;
		e.style.color = 'rgb(36, 209, 134)';

		socket.emit('player-change', readyCount, totalCount);
	} else if (player.status.status == 'eliminated') {
		e.style.color = 'rgb(194, 72, 72)';
	} else if (player.status.status == 'playing') {
		e.style.color = player.status.colour;
		// e.innerHTML = '';
		// e.style.backgroundColor = data.status.colour;
		// e.style.width = `${50 - data.status.value * 50}%`;
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
	d2.innerHTML = 'waiting';
	d2.style.color = 'rgb(207, 187, 89)';

	li.appendChild(d1);
	li.appendChild(d2);

	const ol = document.querySelector('.player-ul');
	ol.appendChild(li);

	totalCount += 1;

	socket.emit('player-change', readyCount, totalCount);
}

function removePlayer(player) {
	const el = document.getElementById(`player-${player.id}`).children.item(1);
	el.innerHTML = 'Disconnected';
	el.style.color = 'rgb(194, 72, 72)';

	totalCount -= 1;

	if (player.status.status == 'ready') {
		readyCount -= 1;
	}

	socket.emit('player-change', readyCount, totalCount);

	setTimeout(() => {
		const e = document.getElementById(`player-${player.id}`);
		e.parentElement.removeChild(e);
	}, 3000);
}
