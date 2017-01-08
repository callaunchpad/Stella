function dontUnderstand() {
  tts.say("Sorry I do not know how to do that yet.");
}

function stopSpeaking() {
  tts.stop();
}

function goToSleep() {
  tts.say('Okay, goodbye.');
  forceStop();
}

function focus() {
  Tabs.refocus(function(tab) {
    Debug.log(TRIGGER_NAME + " refocused: " + tab.id);
    tts.say("Hello, what would you like me to do?");
  })
}

function openDocumentation() {
  $('.chat-container').stop().animate({ left: '50%' }, '6000', 'swing', function() {
    Debug.log('Finished animating');
  });
  setTimeout(function() {
    $('.table-container').stop().animate({ top: '0' }, '3000', 'swing', function() {
      Debug.log('Finished animating');
    });
  }, 100);
  tts.say("Here are some things I can do.");
  tts.say("Make sure to say my name before each command, so I know you are talking to me.");
}

function closeDocumentation() {
  Debug.log("CLOSING DOCS");
  $('.table-container').stop().animate({ top: '100%' }, '2000', 'swing', function() {
    Debug.log('Finished animating');
  });
  setTimeout(function() {
    $('.chat-container').stop().animate({ left: '25%' }, '50000', 'swing', function() {
      Debug.log('Finished animating');
    });
  }, 100);
}

function toggleContinuousAnalysis(text) {
  if (text.contains("off")) {
    continuous_check.checked = false;
  } else if (text.contains("on")) {
    continuous_check.checked = true;
  }
}

API.Core = {
  dontUnderstand: dontUnderstand,
  stopSpeaking: stopSpeaking,
  goToSleep: goToSleep,
  focus: focus,
  openDocumentation: openDocumentation,
  closeDocumentation: closeDocumentation,
  toggleContinuousAnalysis: toggleContinuousAnalysis
}
