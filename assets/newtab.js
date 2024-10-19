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
	const topHalf = element.querySelector(".digit .top");
	const flipper = element.querySelector(".digit.flipper");
	const flipperDigit = element.querySelector(".digit.flipper .flipper-digit");

	const currentValue = topHalf.textContent;

	// Format the newValue to ensure it's two digits (e.g., 01, 02)
	const formattedNewValue = newValue < 10 ? "0" + newValue : String(newValue);

	// If the current value is different from the new value, perform the flip
	if (currentValue !== formattedNewValue) {
		// Set the current value in the flipper element

		// Trigger the flip animation
		flipper.classList.add("flip-animation");

		setTimeout(() => {
			topHalf.textContent = formattedNewValue;
		}, 400);

		setTimeout(() => {
			flipperDigit.textContent = formattedNewValue;
		}, 500);

		// Wait for the animation to complete before updating the top value
		setTimeout(function () {
			// After the flip, update the top value with the new one
			// Remove the flip class to reset the animation
			flipper.classList.remove("flip-animation");
		}, 600); // Adjust this timeout to match the duration of your CSS flip animation
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
