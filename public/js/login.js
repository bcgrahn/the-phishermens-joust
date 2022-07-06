const button = document.querySelector('.button-input');
const indicator = document.querySelector('.indicator-sheet');

let loggedIn = false;

let indicator_value = 0;
let soft_threshold = 5;
let hard_threshold = 50;
const sensitivity = 0.002;
let cooldown = 0.0005 * soft_threshold;
let game_over = false;
let alerted = false;

let socket = io();

const heading = document.querySelector('h1');

button.addEventListener('click', (e) => {
	const sheet = document.querySelector('.login-sheet');
	sheet.classList.add('after');

	const heading = document.querySelector('h1');
	heading.innerHTML = 'Waiting';
	heading.style.color = 'rgb(207, 187, 89)';

	const sendingId = document.querySelector('.username-input');

	socket.emit('player-join', sendingId.value);

	loggedIn = true;

	setInterval(() => {
		indicator_value -= cooldown;
		if (indicator_value < 0) {
			indicator_value = 0;
		}
	}, 10);
});

if (window.DeviceMotionEvent !== undefined) {
	window.ondevicemotion = function (e) {
		if (!loggedIn) return false;
		let total = Math.sqrt(
			Math.pow(e.acceleration.x, 2) +
				Math.pow(e.acceleration.y, 2) +
				Math.pow(e.acceleration.z, 2)
		);

		if (total > hard_threshold) {
			console.log("PLAYER DIED");
			new Audio("./../audio_files/death-scream.mp3").play();
		}

		indicator_value += sensitivity * total;
		if (indicator_value > 1) {
			indicator_value = 1;
			cooldown = 0;

			heading.innerHTML = 'Ready';
			heading.style.color = 'rgb(36, 209, 134)';

			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			}

			socket.emit('status-change', true);
		}

		// alert(total);

		indicator.style.clipPath = `circle(${
			150 * indicator_value + 50
		}% at 50% 150%)`;
	};
} else {
	status.style.display = 'block';
	status.innerHTML =
		'Unfortunately, this device does not have the right sensors.';
}

DeviceMotionEvent.requestPermission()
	.then((response) => {
		if (response == 'granted') {
			window.addEventListener('devicemotion', (e) => {
				// do something with e
			});
		}
	})
	.catch(console.error);
