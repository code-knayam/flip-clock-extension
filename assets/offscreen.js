// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PLAY_SOUND') {
        const audio = document.getElementById('chime');
        audio.currentTime = 0;
        audio.play();
    }
}); 