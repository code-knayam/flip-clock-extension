// Check if it's local development or running as an extension
const isLocalDev = window.location.protocol === "http:";
updateClock(); // Initial call to display the correct time

showClock();
setInterval(updateClock, 1000);

// Function to show clock and hide name input
function showClock() {
	document.getElementById("flipClock").style.display = "flex";
}

// Clock update function (same as before)
function flip(element, newValue) {
	const topHalf = element.querySelector(".digit .main");
	const flipper = element.querySelector(".digit.flipper");
	const flipperDigit = element.querySelector(".digit.flipper .flipper-digit");

	const flipperBack = element.querySelector(".digit.flipper-back");
	const flipperDigitBack = element.querySelector(
		".digit.flipper-back .flipper-digit"
	);

	const currentValue = topHalf.textContent;

	const formattedNewValue = newValue < 10 ? "0" + newValue : String(newValue);

	if (currentValue !== formattedNewValue) {
		flipper.classList.add("flip-animation");
		flipperBack.classList.add("flip-animation");

		setTimeout(() => {
			topHalf.textContent = formattedNewValue;
			flipperDigitBack.textContent = formattedNewValue;
		}, 200);

		setTimeout(() => {
			flipperDigit.textContent = formattedNewValue;
			flipperBack.classList.add("flip-animation");
		}, 400);

		setTimeout(function () {
			flipper.classList.remove("flip-animation");
			flipperBack.classList.remove("flip-animation");
		}, 600);
	}
}

function updateClock() {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();

	const hoursEl = document.getElementById("hours");
	const minutesEl = document.getElementById("minutes");
	const secondsEl = document.getElementById("seconds");

	flip(hoursEl, hours);
	flip(minutesEl, minutes);
	flip(secondsEl, seconds);
}
