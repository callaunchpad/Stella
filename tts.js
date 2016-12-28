chrome.runtime.onMessage.addListener(function(request) { say(request.speechText); });

function say(text) {  chrome.tts.speak(text, {enqueue: true, gender: 'female', lang: 'en-GB', pitch: 0.8, rate: 0.85}); }

var tts = { say: say }
