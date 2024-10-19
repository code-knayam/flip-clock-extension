let previousTime = {
	hours: null,
	minutes: null,
	seconds: null,
};

let format24 = true; // Default to 24-hour format

function flip(element, newValue) {
	const topHalf = element.querySelector(".top");
	const bottomHalf = element.querySelector(".bottom");

	// If the value has changed, apply the flip animation
	if (
		topHalf.textContent !== (newValue < 10 ? "0" + newValue : String(newValue))
	) {
		bottomHalf.textContent = topHalf.textContent; // Set top to the old bottom value
		topHalf.textContent = newValue < 10 ? "0" + newValue : newValue; // Set bottom to the new value

		element.classList.remove("flip");
		void element.offsetWidth; // Trigger reflow to reset animation
		element.classList.add("flip");
	}
}

function updateClock() {
	const now = new Date();
	let hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();

	if (!format24 && hours > 12) hours -= 12;

	// Flip only the updated elements
	if (previousTime.hours !== hours) {
		flip(document.getElementById("hours"), hours);
		previousTime.hours = hours;
	}
	if (previousTime.minutes !== minutes) {
		flip(document.getElementById("minutes"), minutes);
		previousTime.minutes = minutes;
	}
	if (previousTime.seconds !== seconds) {
		flip(document.getElementById("seconds"), seconds);
		previousTime.seconds = seconds;
	}
}

// Load user settings and display greeting
// chrome.storage.sync.get(
// 	["userName", "is24Hour", "bgColor", "bgImage"],
// 	function (data) {
// 		if (data.userName) {
// 			document.getElementById(
// 				"greeting"
// 			).textContent = `Welcome, ${data.userName}`;
// 		}

// 		format24 = data.is24Hour !== undefined ? data.is24Hour : true;

// 		if (data.bgColor) {
// 			document.body.style.backgroundColor = data.bgColor;
// 		}

// 		if (data.bgImage) {
// 			document.body.style.backgroundImage = `url(${data.bgImage})`;
// 			document.body.style.backgroundSize = "cover";
// 		}

// 		setInterval(updateClock, 1000); // Update every second
// 		updateClock(); // Initial call to display the correct time
// 	}
// );
setInterval(updateClock, 1000); // Update every second
updateClock();
