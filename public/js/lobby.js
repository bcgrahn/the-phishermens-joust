let socket = io();

let readyCount = 0;
let totalCount = 0;
let remainingCount = 0;
let remainingTime = 10;
let intrvl = null;

function eliminationLogic() {
	remainingCount--;
	socket.emit('remaining-count', remainingCount);
}

function isEnd() {
	if (remainingCount <= 1) {
		socket.emit('end-of-game');
	}
}

socket.on('winner-found', (username) => {
	// const heading = document.querySelector('h1');
	// heading.innerHTML = username;
	socket.emit('display-winner', username);

	window.location = '/winner';
});

socket.on('player-connected', (player) => {
	addPlayer(player);
	if (intrvl != null) {
		const heading = document.querySelector('h1');
		clearInterval(intrvl);
		intrvl = null;
		heading.innerHTML = "The Phisherman's Joust";
	}
});

socket.on('player-disconnected', (player) => {
	removePlayer(player);
});

socket.on('status-change', (player) => {
	const e = document.getElementById(`player-${player.id}`).children.item(1);
	e.innerHTML = player.status;

	if (player.status == 'ready') {
		readyCount += 1;
		if (readyCount > 1 && readyCount == totalCount) {
			remainingTime = 10;
			intrvl = setInterval(() => {
				const heading = document.querySelector('h1');
				heading.innerHTML = `Starting in ${remainingTime--}s`;
				if (remainingTime < 0) {
					startButton.click();
					if (intrvl != null) {
						clearInterval(intrvl);
						intrvl = null;
					}
				}
			}, 1000);
		}
		e.style.color = 'rgb(36, 209, 134)';
		socket.emit('player-change', readyCount, totalCount);
	} else if (player.status == 'eliminated') {
		eliminationLogic();
		e.style.color = 'rgb(194, 72, 72)';
		isEnd();
	} else if (player.status == 'playing') {
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

let started = false;

startButton.addEventListener('click', function () {
	if (!started) {
		if (readyCount > 1) {
			remainingCount = readyCount;
			socket.emit('server-game-start');
			socket.emit('remaining-count', remainingCount);
			const heading = document.querySelector('h1');
			heading.innerHTML = `Game in progress`;
			if (intrvl != null)
				clearInterval(intrvl);
			started = true;

			let pauseButton = document.getElementById('pause-music');
			pauseButton.classList.remove('disable')
			let restartButton = document.getElementById('restart-music')
			restartButton.classList.remove('disable')

			socket.emit('music-start');
		} else {
			const heading = document.querySelector('h1');
			heading.innerHTML = 'Not enough players ready';
			setTimeout(() => {
				heading.innerHTML = "The Phisherman's Joust";
			}, 3000);
		}
	} else {
		alert('Please restart game first')
	}
});

document.getElementById('restart-game').addEventListener('click', function () {
	console.log('RESTARTING GAME');
	let pauseButton = document.getElementById('pause-music');
	pauseButton.classList.add('disable')
	let restartButton = document.getElementById('restart-music')
	restartButton.classList.add('disable')
	socket.emit('server-game-restart');
	socket.emit('remaining-count', remainingCount);
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

	const ol = document.getElementById('player_ul');
	ol.appendChild(li);

	totalCount += 1;

	socket.emit('player-change', readyCount, totalCount);
}

function removePlayer(player) {
	const el = document.getElementById(`player-${player.id}`).children.item(1);
	el.innerHTML = 'Disconnected';
	el.style.color = 'rgb(194, 72, 72)';

	totalCount = Math.max((totalCount - 1), 0);

	if (player.status == 'ready') {
		readyCount = Math.max((readyCount - 1), 0);
	}

	if (player.status == 'playing') {
		eliminationLogic();
	}

	socket.emit('player-change', readyCount, totalCount);
	isEnd();

	setTimeout(() => {
		const e = document.getElementById(`player-${player.id}`);
		e.parentElement.removeChild(e);
	}, 3000);
}
