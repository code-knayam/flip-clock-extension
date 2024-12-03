var format;
initExtension();

async function initExtension() {
	const defaultFormat = await getPreference("format");
	format = defaultFormat || 24;
	updateFormatSelectorStatus(format);
	updateClock();
	showClock();
	setInterval(updateClock, 1000);
}

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
	updateAmOrPm();
	const now = new Date();
	let hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();

	const hoursEl = document.getElementById("hours");
	const minutesEl = document.getElementById("minutes");
	const secondsEl = document.getElementById("seconds");

	if (format === 12) {
		updateAmOrPm(hours >= 12 ? "PM" : "AM");
		hours = hours % 12 || 12;
	}

	flip(hoursEl, hours);
	flip(minutesEl, minutes);
	flip(secondsEl, seconds);
}

function updateFormatSelectorStatus(format) {
	const clockFormatEle = document.getElementById("formatSelector");
	clockFormatEle.checked = format === 12;
}

document.getElementById("formatSelector").addEventListener("change", (e) => {
	format = e?.target?.checked ? 12 : 24;
	updatePreference({ key: "format", val: format });
});

function updateAmOrPm(tx) {
	const amOrPm = document.getElementById("amOrPm");

	if (tx) {
		amOrPm.style.display = "unset";
		amOrPm.innerText = tx;
	} else {
		amOrPm.style.display = "none";
	}
}

async function updatePreference(pref) {
	let prefs = await getPreferences();

	if (!prefs || !prefs.preferences) {
		prefs = { preferences: {} };
	}

	if (prefs) {
		prefs.preferences[pref.key] = pref.val;
		chrome.storage.sync.set({ preferences: prefs.preferences });
	}
}

async function getPreference(key) {
	const pref = await getPreferences();
	return pref && key ? pref?.preferences?.[key] : "";
}

async function getPreferences() {
	return await chrome.storage?.sync.get("preferences");
}
