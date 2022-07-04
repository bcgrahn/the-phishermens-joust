const game_over = new Audio('../../Audio/Fx/game_over.mp3');

function getRgb(value, threshold) {
	if (value <= threshold / 2) {
		let red = (2 * (255 * value)) / threshold;
		return `rgb(${red}, 255, 0)`;
	} else {
		let green = 255 - 255 * ((value - threshold / 2) / threshold);
		return `rgb(255, ${green}, 0)`;
	}
}

function getVolume(value, threshold) {
	return value / threshold;
}

function gameOver(value, threshold) {
	if (value > threshold) {
		game_over.play();
	}
}

// const body = document.querySelector('body');

document.addEventListener('DOMContentLoaded', function () {
	let socket = io();
	let streaming = false;
	let status = document.getElementById('status');
	let sendingId = document.getElementById('sending-id');
	let form = document.getElementById('enter');
	let orientation = document.getElementById('orientation');

	let startStreaming = function (e) {
		e.preventDefault();
		streaming = true;
		form.style.display = 'none';
		status.className = 'csspinner line back-and-forth no-overlay';
		status.style.display = 'block';
		document.activeElement.blur();
		socket.emit('player-join', sendingId.value);
		return false;
	};

	form.addEventListener('submit', startStreaming);

	if (window.DeviceMotionEvent !== undefined) {
		window.ondevicemotion = function (e) {
			if (!streaming) return false;
			socket.emit('motion', {
				sender: sendingId.value,
				x: e.acceleration.x,
				y: e.acceleration.y,
				z: e.acceleration.z,
				interval: e.interval,
				rotationRate: e.rotationRate,
			});

			let total = Math.sqrt(
				Math.pow(e.acceleration.x, 2) +
					Math.pow(e.acceleration.y, 2) +
					Math.pow(e.acceleration.z, 2)
			);

			document.body.style.background = getRgb(total, 5);
			gameOver(total, 5);
		};
		window.ondeviceorientation = function (e) {
			if (!streaming) return false;
			socket.emit('orientation', {
				sender: sendingId.value,
				alpha: e.alpha,
				beta: e.beta,
				gamma: e.gamma,
			});
			// orientation.innerText = "A: " + e.alpha.toFixed(2) + "\nB: " + e.beta.toFixed(2) + "\nG: " + e.gamma.toFixed(2);
		};
	} else {
		status.style.display = 'block';
		status.innerHTML =
			'Unfortunately, this device does not have the right sensors.';
	}

	// socket.on('message', (player) => {
	// 	alert(player.username);
	// });
});
