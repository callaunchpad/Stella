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
    start_img.src = 'mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
        chrome.tabs.create({url: "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html"}, function(tab) { log("Premissions tab created: " + tab); });
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = 'mic.gif';
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
        // start_button.click();
        toggleRecognition();
        takeAction(final_transcript);
        if (!forced_stop) setTimeout(toggleRecognition, 2000);
        // chrome.alarms.create("restart", {when: 3000});
      }
    }
    // if (final_transcript || interim_transcript) {
    //   showButtons('inline-block');
    // }
  };
}

function toggleRecognition(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  if (select_dialect) recognition.lang = select_dialect.value;
  recognition.start();
  forced_stop = false;
  ignore_onend = false;
  if (final_span) final_span.innerHTML = '';
  if (interim_span) interim_span.innerHTML = '';
  if (start_img) start_img.src = 'mic-slash.gif';
  if (info_allow) showInfo('info_allow');
  // showButtons('none');
  if (event) start_timestamp = event.timeStamp;
}

function forceStop() {
  forced_stop = true;
  if (recognizing) {
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
