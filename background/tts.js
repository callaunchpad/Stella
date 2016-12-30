chrome.runtime.onMessage.addListener(function(request) { sayParagraph(request.speechText); });

function say(text) {
  console.log("say: " + text);
  responseMessage(text);
  chrome.tts.isSpeaking(function(speaking) { console.log("Is speaking: " + speaking);});
  var options = { enqueue: true, gender: 'female', lang: 'en-GB', pitch: 0.8, rate: 0.85, onEvent: function(event) { console.log('Event ' + event.type + ' at position ' + event.charIndex); if (event.type == 'error') console.log('Error: ' + event.errorMessage); } };
  function catchError() { if (chrome.runtime.lastError) console.log('Error: ' + chrome.runtime.lastError.message); }
  chrome.tts.speak(text, options, catchError);
}

function sayParagraph(paragraph) {
  var sentences = paragraph.split(". ");
  for (var i = 0; i < sentences.length; i++) {
    say(sentences[i]);
  }
}

function stop() { return chrome.tts.stop(); }

var tts = {
  say: say,
  stop: stop
}
