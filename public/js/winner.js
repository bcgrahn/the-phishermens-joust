const titleContainer = document.querySelector('.title-container');

//--------------------------------------

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// --- Global Constants -------------------------------------------------------------

const fireworks = [];
const particles = [];

let friction = 0.99;
let canvasWipe = 'rgba(0, 0, 0, 0.5)';
let canvasAlpha = 1;
const fireworkRadius = 5;
const fireworkInitVelocity = 25;
const gravity = 0.1;
const alpha_subtract = 0.001;
let redness = 0;
let socket = io();

// ----------------------------------------------------------------------------------

class Firework {
	constructor(x, y, radius, velocity, colour) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.velocity = velocity;
		this.colour = colour;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.colour;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.y -= gravity;
		this.x += this.velocity.x;
		this.y -= this.velocity.y;
		this.alpha =
			Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) /
			fireworkInitVelocity;
	}
}

// --- Class Definiitions -----------------------------------------------------------

class Particle {
	constructor(x, y, radius, velocity, colour) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.velocity = velocity;
		this.colour = colour;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.colour;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		// this.velocity.y += gravity * 0.005;
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		if (this.alpha - alpha_subtract <= 0) {
			this.alpha = 0;
		} else {
			this.alpha -= alpha_subtract;
		}
	}

	change(colour) {
		this.colour = colour;
	}
}

// ----------------------------------------------------------------------------------

// --- Sockets ----------------------------------------------------------------------

socket.on('display-winner', (username) => {
	document.querySelector('.title').innerHTML = `${username} is the winner!`;
});

// ----------------------------------------------------------------------------------

// --- Functions --------------------------------------------------------------------

function animate() {
	canvasWipe = `rgba(${redness}, ${redness / 2}, ${
		redness / 2
	}, ${canvasAlpha})`;
	if (redness > 0) {
		redness -= 1;
	}
	requestAnimationFrame(animate);
	c.fillStyle = canvasWipe;
	c.fillRect(0, 0, canvas.width, canvas.height);

	fireworks.forEach((firework, index) => {
		firework.update();
		// console.log(firework);

		if (firework.y - firework.radius > canvas.height) {
			setTimeout(() => {
				fireworks.splice(index, 1);
			}, 0);
		}

		if (firework.velocity.y <= 0) {
			setTimeout(() => {
				fireworks.splice(index, 1);
			}, 0);

			redness = firework.radius * 2;

			for (let i = 0; i < firework.radius * 10; i++) {
				const velocity = Math.random() * 7;
				const direction = Math.random() * 2 * Math.PI;
				particles.push(
					new Particle(
						firework.x,
						firework.y,
						(firework.radius * Math.random()) / 2,
						{
							x: velocity * Math.sin(direction),
							y: velocity * Math.cos(direction),
						},
						`rgba(${255 * Math.random()}, 100, 100, ${1 * Math.random()})`
					)
				);
			}
		}
	});

	particles.forEach((particle, index) => {
		particle.update();

		if (particle.alpha <= 0 || particle.colour == `rgba(255,255,255,1)`) {
			particles.splice(index, 1);
		}

		// if (particle.x + particle.radius < 0 || particle.x - particle.radius > innerWidth) {
		// 	//setTimeout(() => {particle.colour = `rgba(255,255,255,1)`})
		// 		particle.alpha -= 0.001;
		// }

		// if (particle.y + particle.radius < 0 || particle.y - particle.radius > innerHeight) {
		// 	//particle.colour = `rgba(255,255,255,1)`
		// 		particle.alpha -= 0.001;
		// }
	});

	// console.log(particles.length)

	if (particles.length > 750) {
		particles.splice(0, 1);
	}

	if (fireworks.length > 2) {
		for (let i = 0; i < fireworks.length - 2; i++) {
			// console.log("Removing fireworks")
			fireworks.splice(0, 1);
		}
	}
}

// ----------------------------------------------------------------------------------

// --- Event Listeners --------------------------------------------------------------

window.addEventListener('resize', () => {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
});

window.addEventListener('click', () => {
	window.location = '/';
});

// document.addEventListener('click', (event) => {
// 	console.log('Creating Firework');

// });

// ----------------------------------------------------------------------------------

animate();

const audio = new Audio('audio.mp3');

let playing = false;

window.addEventListener('scroll', (e) => {
	if (!audio.isPlaying) {
		audio.play();
	}
});

window.addEventListener('touchstart', () => {
	audio.muted = false;
	audio.play();
});

setInterval(function () {
	x = innerWidth * Math.random();
	y = innerHeight * Math.random();
	xVel = 5 * (Math.random() - 0.5);
	yVel = (Math.sqrt(innerHeight) / 4.3) * Math.random() + 6;

	fireworks.push(
		new Firework(
			x,
			canvas.height + fireworkRadius,
			2 * Math.random() * fireworkRadius + 5,
			{
				x: xVel,
				y: yVel,
			},
			`rgba(255, 255, 255, ${
				Math.sqrt(Math.pow(xVel, 2) + Math.pow(yVel, 2)) / fireworkInitVelocity
			})`
		)
	);
}, 4000);

const btnUp = document.querySelector('.button-Up');
const btnDown = document.querySelector('.button-Down');
const label = document.querySelector('.friction-text');

// btnUp.onclick = () => {
// 	friction += 0.01
// 	label.innerHTML = `${friction}`
// }

// btnUp.onclick = () => {
// 	friction -= 0.01
// 	label.innerHTML = `${friction}`
// }

// btnUp.addEventListener('click', () => {
// 	friction += 0.01
// 	// friction.toFixed(2)
// 	friction = Math.round(friction * 100) / 100
// 	label.innerHTML = `Velocity x ${friction}`
// })

// btnDown.addEventListener('click', () => {
// 	friction -= 0.01
// 	friction.toFixed(2)
// 	friction = Math.round(friction * 100) / 100
// 	label.innerHTML = `Velocity x ${friction}`
// })

// --- timer ---

let countdown = document.querySelector('.countdown');

console.log(countdown);

// Set the date we're counting down to
let countDownDate = new Date('May 28, 2022 17:30:00').getTime();

// Update the count down every 1 second
let x = setInterval(function () {
	// Get today's date and timelet now = new Date().getTime();
	let now = new Date().getTime();

	// Find the distance between now and the count down date
	let distance = countDownDate - now;

	// Time calculations for days, hours, minutes and seconds
	let days = Math.floor(distance / (1000 * 60 * 60 * 24));
	let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((distance % (1000 * 60)) / 1000);

	// Output the result in an element with id="demo"
	countdown.innerHTML = hours + 'h ' + minutes + 'm ' + seconds + 's ';

	// If the count down is over, write some text
	if (distance < 0) {
		clearInterval(x);
		countdown.innerHTML = 'See you guys soon! ;)';
	}
}, 1000);
