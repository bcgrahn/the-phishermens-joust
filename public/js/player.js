let colour_value = 0;
const soft_threshold = 2;
const hard_threshold = 20 * soft_threshold;
const sensitivity = 0.03;
const cooldown = 0.01;
let game_over = false;
let alerted = false;

const background = document.getElementById('status');

function getRgb(value, threshold) {
	if (value <= threshold / 2) {
		let red = (2 * (255 * value)) / threshold;
		return `rgb(${red}, 255, 0)`;
	} else {
		let green = 255 - 255 * 2 * ((value - threshold / 2) / threshold);
		return `rgb(255, ${green}, 0)`;
	}
}

document.addEventListener('DOMContentLoaded', function () {
	let socket = io();
	let streaming = false;
	let status = document.getElementById('status');
	let sendingId = document.getElementById('sending-id');
	let form = document.getElementById('enter');
	let orientation = document.getElementById('orientation');

	setInterval(() => {
		colour_value -= cooldown;
		if (colour_value < 0) {
			colour_value = 0;
		}
	}, 10);

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

			colour_value += (sensitivity * total) / soft_threshold;

			if (colour_value > soft_threshold || total > hard_threshold) {
				colour_value = soft_threshold;
				game_over = true;
			}

			background.style.backgroundColor = getRgb(colour_value, soft_threshold);

			if (game_over && !alerted) {
				game_over = false;
				alerted = true;
				setTimeout(() => {
					alert('You lose :(');
				}, 100);
				setTimeout(() => {
					alerted = false;
				}, 3000);
			}
		};
	} else {
		status.style.display = 'block';
		status.innerHTML =
			'Unfortunately, this device does not have the right sensors.';
	}
});
