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
    // if (event.error == 'no-speech') {
    //   micOff();
    //   showInfo('info_no_speech');
    //   ignore_onend = true;
    // }
    if (event.error == 'audio-capture') {
      micOff();
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
        chrome.tabs.create({active: false, url: "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html"}, function(tab) { log("Premissions tab created: " + tab); });
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    if (!forced_stop && continuous_check.checked) {
      recognition.start();
      // setTimeout(toggleRecognition, 2000);
      return;
    };
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    micOff();
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    log("FINISHED: " + final_transcript);
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
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    if (interim_transcript.length == 0) {
      var new_speech = event.results[event.results.length - 1][0].transcript;
      if (final_transcript.contains("Jarvis")) {
        toggleRecognition();
        takeAction(final_transcript);
        // if (!forced_stop) setTimeout(toggleRecognition, 2000);
        // chrome.alarms.create("restart", {when: 3000});
      }
      final_transcript = '';
      final_span.innerHTML = '';
      interim_span.innerHTML = '';
    }
  };
}

function toggleRecognition(event) {
  if (recognizing) {
    log("Turning Mic Off");
    // forced_stop = true;
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  forced_stop = false;
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  micOff();
  if (info_allow) showInfo('info_allow');
  if (event) start_timestamp = event.timeStamp;
}

function forceStop() {
  forced_stop = true;
  if (recognizing) {
    log("Forcing Mic Off");
    recognition.stop();
    return;
  }
}

// toggleRecognition();

// chrome.alarms.onAlarm.addListener(function(alarm) {
//   if (alarm.name == 'restartMic') {
//     toggleRecognition();
//   }
// });
