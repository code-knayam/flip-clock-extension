document.getElementById('saveSettings').addEventListener('click', function() {
  const name = document.getElementById('nameInput').value;
  const is24Hour = document.getElementById('formatToggle').checked;
  const bgColor = document.getElementById('bgColor').value;

  const bgImageInput = document.getElementById('bgImage');
  const bgImageFile = bgImageInput.files[0];

  if (bgImageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const bgImage = event.target.result;

      chrome.storage.sync.set({
        userName: name,
        is24Hour: is24Hour,
        bgColor: bgColor,
        bgImage: bgImage
      }, function() {
        alert('Settings saved!');
      });
    };
    reader.readAsDataURL(bgImageFile);
  } else {
    chrome.storage.sync.set({
      userName: name,
      is24Hour: is24Hour,
      bgColor: bgColor
    }, function() {
      alert('Settings saved!');
    });
  }
});

chrome.storage.sync.get(['userName', 'is24Hour', 'bgColor'], function(data) {
  document.getElementById('nameInput').value = data.userName || '';
  document.getElementById('formatToggle').checked = data.is24Hour !== undefined ? data.is24Hour : true
