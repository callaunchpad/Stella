function say(text) {
  chrome.tts.speak(text, {enqueue: true, gender: 'male', lang: 'en-GB', pitch: 0, rate: 0.8});
}

var tts = {
  say: say
}
