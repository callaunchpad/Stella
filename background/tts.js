chrome.runtime.onMessage.addListener(function(request) { sayParagraph(request.speechText); });

function say(text) {
  Debug.log("say: " + text);
  responseMessage(text);
  chrome.tts.isSpeaking(function(speaking) {
    Debug.log("Is speaking: " + speaking);
  });
  var options = {
    enqueue: true,
    gender: 'female',
    lang: 'en-GB',
    pitch: 0.8,
    rate: 0.85,
    onEvent: function(event) {
      Debug.log('Event ' + event.type + ' at position ' + event.charIndex);
      if (event.type == 'error') Debug.log('Error: ' + event.errorMessage);
    }
  };
  function catchError() { 
    if (chrome.runtime.lastError)
      Debug.log('Error: ' + chrome.runtime.lastError.message);
  }
  chrome.tts.speak(text, options, catchError);
}

function sayParagraph(paragraph) {
  var sentences = paragraph.split(/(?:\. |\.\.\.|\? |\! |\: |\; |[\r\n])+/);
  for (var i = 0; i < sentences.length; i++) {
    if (sentences[i].length > 0) say(sentences[i]);
  }
}

function stop() {
  return chrome.tts.stop();
}

var tts = {
  say: say,
  stop: stop
}
