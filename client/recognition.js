continuous_check.addEventListener('change', toggleRecognition);

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var forced_stop = false;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    micRec();
  };

  recognition.onerror = function(event) {
    // if (event.error == 'no-speech') { micOff(); showInfo('info_no_speech'); ignore_onend = true; }
    if (event.error == 'audio-capture') {
      micOff();
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
        Debug.log('Mic recording not allowed');
        chrome.tabs.create({active: false, url: APP_URL}, function(tab) { Debug.log("Premissions tab created: " + tab); });
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    if (!forced_stop && continuous_check.checked) {
      recognition.start();
      return;
    };
    recognizing = false;
    if (ignore_onend) return;
    micOff();
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    Debug.log("Finished Speaking: " + final_transcript);
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    message_input.value = linebreak(interim_transcript);
    if (interim_transcript.length == 0) {
      message_input.value = linebreak(final_transcript);
      var new_speech = event.results[event.results.length - 1][0].transcript;
      var lowercaseTranscript = final_transcript.toLowerCase();
      if (lowercaseTranscript.contains(TRIGGER_NAME)) {
        toggleRecognition();
        notifications.create("Here's what I heard...", final_transcript.replace(TRIGGER_NAME, ""));
        takeAction(final_transcript);
        insertMessage();
      }
      final_transcript = '';
      message_input.value = '';
    }
  };
}

function toggleRecognition(event) {
  if (recognizing) {
    Debug.log("Turning Mic Off");
    recognition.stop();
    return false;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  forced_stop = false;
  ignore_onend = false;
  message_input.value = '';
  micOff();
  if (info_allow) showInfo('info_allow');
  if (event) start_timestamp = event.timeStamp;
  return true;
}

function forceStop() {
  forced_stop = true;
  if (recognizing) {
    Debug.log("Forcing Mic Off");
    recognition.stop();
    console.log(final_transcript);
    takeAction(final_transcript);
    return;
  }
}
