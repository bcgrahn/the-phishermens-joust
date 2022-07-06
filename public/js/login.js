const button = document.querySelector('.button-input');
const indicator = document.querySelector('.indicator-sheet');

let indicator_value = 0;
let soft_threshold = 5;
let hard_threshold = 50;
const sensitivity = 0.002;
let cooldown = 0.0005 * soft_threshold;
let motionTracking = false;
let playerStatus = '';

let socket = io();

const heading = document.querySelector('h1');

button.addEventListener('click', (e) => {
	const sendingId = document.querySelector('.username-input');
	socket.emit('availability-check', sendingId.value);
});

// socket.emit('login-check');

// socket.on('login-response', (logged_in) => {
//     if (!logged_in) {
//         alert('You are not logged in, please refresh the page')
//     }
// })

socket.on('force-refresh', () => {
	location.reload(true);
});

socket.on('game-start', () => {
    if (player.status == 'ready') {
        player.Status = 'playing'
        cooldown = 0.0005 * soft_threshold;
    }
    else {
        alert("You weren't ready'");
    }
})

socket.on('availability-response', (availible) => {
	if (availible) {
		playerStatus = 'waiting';

		const sheet = document.querySelector('.login-sheet');
		sheet.classList.add('after');

		const heading = document.querySelector('h1');
		heading.innerHTML = 'Waiting';
		heading.style.color = 'rgb(207, 187, 89)';

		setInterval(() => {
			indicator_value -= cooldown;
			if (indicator_value < 0) {
				indicator_value = 0;
			}
		}, 10);
	} else {
		const prompt = document.querySelector('.prompt');
		prompt.innerHTML = 'User already exists';
	}
});

if (window.DeviceMotionEvent !== undefined) {
	window.ondevicemotion = function (e) {
		if (playerStatus != 'waiting') return false;
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
			motionTracking = false;
            playerStatus = 'ready'
			socket.emit('status-change', 'ready');

			const container = document.querySelector('.container');
			container.style.backgroundColor = 'rgb(36, 209, 134)';
			container.innerHTML = 'Game will begin soon';

			indicator.style.clipPath = `circle(0% at 50% 150%)`;
		}

		indicator.style.clipPath = `circle(${
			150 * indicator_value + 50
		}% at 50% 150%)`;
	};
}

// DeviceMotionEvent.requestPermission()
// 	.then((response) => {
// 		if (response == 'granted') {
// 			window.addEventListener('devicemotion', (e) => {
// 				// do something with e
// 			});
// 		}
// 	})
// 	.catch(console.error);

if (window.DeviceMotionEvent !== undefined) {
	window.ondevicemotion = function (e) {
		if (playerStatus != 'playing') return false;

		// //Velocity
		// total_acceleration += Math.sqrt(
		// 	Math.pow(e.acceleration.x, 2) +
		// 	Math.pow(e.acceleration.y, 2) +
		// 	Math.pow(e.acceleration.z, 2) 
		// );

		//Acceleration
		total_acceleration = Math.sqrt(
			Math.pow(e.acceleration.x, 2) +
			Math.pow(e.acceleration.y, 2) +
			Math.pow(e.acceleration.z, 2) 
		);

		// //Rate of change of Acceleration
		// temp_acceleration = Math.sqrt(
		// 	Math.pow(e.acceleration.x, 2) +
		// 	Math.pow(e.acceleration.y, 2) +
		// 	Math.pow(e.acceleration.z, 2)
		// );
		// total_acceleration = prev_acceleration - temp_acceleration;
		// prev_acceleration = temp_acceleration;

		colour_value += sensitivity * total_acceleration;

		if (colour_value > soft_threshold || total_acceleration > hard_threshold) {
			colour_value = soft_threshold;
			game_over = true;
			socket.emit('status-change', true);
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

		socket.emit('motion', {
			sender: sendingId.value,
			rgb: getRgb(colour_value, soft_threshold),
		});
	};

	socket.on('bpm-change', (bpm_change) => {
		hard_threshold *= bpm_change.threshold_percentage;
		console.log(hard_threshold);
	});
	
}