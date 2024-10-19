chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.sync.set({
		is24Hour: true,
		bgColor: "#1a1a1a",
	});
});
