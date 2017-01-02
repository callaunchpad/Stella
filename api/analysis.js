function openDocumentation() {
  $('.chat-container').stop().animate({
    left: '50%'},
    '6000',
    'swing',
  function() {
    console.log('Finished animating');
  });

  setTimeout(function() {
    $('.table-container').stop().animate({
      top: '0'},
      '3000',
      'swing',
    function() {
      console.log('Finished animating');
    });
  }, 100);
}

function closeDocumentation() {
  console.log("CLOSING DOCS");
  $('.table-container').stop().animate({
    top: '100%'},
    '3000',
    'swing',
  function() {
    console.log('Finished animating');
  });

  setTimeout(function() {
    $('.chat-container').stop().animate({
      left: '25%'},
      '6000',
      'swing',
    function() {
      console.log('Finished animating');
    });
  }, 100);
}

function googleSearch(query) {
  var url = 'http://google.com/search?q=' + query;
  Tabs.openNew(url, function(tab) {
    log("Searched Google for " + query);
    chrome.tabs.executeScript(null, { file: "dom/preview.js" }, function(result) {
      console.log("Previews Google feature text");
    });
  });
}

function openEmptyTab() {
  Tabs.openEmpty(function(tab) {
    log("New Empty Tab Created: " + JSON.stringify(tab));
  });
}

function openSpecificTab(text) {
  var textArr = text.split(" ");
  var num = ordinalToNum(textArr[textArr.indexOf("tab") - 1]);
  var index = num - 1;
  Tabs.openSpecificTab(index, function(tab) {
    responseMessage((textArr[textArr.indexOf("tab") - 1]) + " tab opened: " + tab.url);
  });
}

function goToWebsite(text) {
  var url = text.match(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm);
  if (url) {
    url = url[0];
    if (!url.contains("http://")) url = "http://" + url;
    responseMessage('Going to: ' + url);
    Tabs.openNew(url, function(tab) {
      log("New tab at " + url + " created: " + JSON.stringify(tab));
    });
  } else {
    tts.say('Sorry, I cannot find the url you requested.');
  }
}

function discardNonActiveAudibleTabs() {
  responseMessage('Muted all audible tabs.');
  Tabs.muteTabs(function(tabs) {
    log("Muted all audible tabs " + tabs);
  });
}

function requestSearch(text) {
  var textArr = text.split(" ");
  var query = '';
  console.log(textArr);
  if (textArr[0] == "look" && textArr[1] == "up") {
    query = text.replace("look up", "");
  } else if (textArr[0] == "search") {
    if (textArr[1] == "for") {
      query = text.replace("search for", "");
    } else if (textArr[2] == "for") {
      textArr.splice(0,3);
      query = textArr.join(" ");
    } else if (textArr[3] == "up") {
      query = text.replace("search up", "");
    } else {
      query = text.replace("search", "");
    }
  } else if (textArr[0] == "google") {
    query = text.replace("google", "");
  }
  googleSearch(query);
}

function closeCurrentTab() {
  Tabs.closeCurrent(function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closeLastTab() {
  Tabs.closeLastTabs(1, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closePastTabs(text) {
  var num = text.match(/[0-9]+\s(tabs)/g);
  if (num) {
    num = num[0].replace(" tabs", "");
  } else {
    var textArr = text.split(" ");
    num = textTonum(textArr[textArr.indexOf("first") + 1]);
  }
  Tabs.closeFirstTabs(num), function(tab) {
    responseMessage("Closed tab: " + tab.url);
  };
}

function closeRecentTabs(text) {
  var num = text.match(/[0-9]+\s(tabs)/g);
  if (num) {
    num = num[0].replace(" tabs", "");
  } else {
    var textArr = text.split(" ");
    num = textTonum(textArr[textArr.indexOf("last") + 1]);
  }
  Tabs.closeLastTabs(num, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closePreviousTab() {
  console.log('closing previous tab');
  Tabs.closePrevTabs(1, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closePreviousTabs(text) {
  var num = text.match(/[0-9]+\s(tabs)/g);
  if (num) {
    num = num[0].replace(" tabs", "");
  } else {
    var textArr = text.split(" ");
    num = textTonum(textArr[textArr.indexOf("previous") + 1]);
  }
  console.log('closing previous' + num + 'tabs');
  Tabs.closePrevTabs(num, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closeNextTab() {
  console.log('closing next tab');
  Tabs.closeNextTabs(1, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closeNextTabs(text) {
  var num = text.match(/[0-9]+\s(tabs)/g);
  if (num) {
    num = num[0].replace(" tabs", "");
  } else {
    var textArr = text.split(" ");
    num = textTonum(textArr[textArr.indexOf("next") + 1]);
  }
  console.log('closing next' + num + 'tabs');
  Tabs.closeNextTabs(num, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closeSpecificTab(text) {
  var textArr = text.split(" ");
  var num = ordinalToNum(textArr[textArr.indexOf("tab") - 1]);
  console.log('closing the ' + (textArr[textArr.indexOf("tab") - 1]) + ' tab');
  var index = num - 1;
  Tabs.closeSpecificTabs(index, index, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closeSpecificTabs(text) {
  var textArr = text.split(" ");
  var startNum = ordinalToNum(textArr[textArr.indexOf("the") + 1]);
  var endNum = ordinalToNum(textArr[textArr.indexOf("tabs") - 1]);
  console.log('closing the ' + (textArr[textArr.indexOf("the") + 1]) + ' to ' + (textArr[textArr.indexOf("tabs") - 1]) + 'tabs');
  var start = startNum - 1;
  var end = endNum - 1;
  Tabs.closeSpecificTabs(start, end, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function discardNonActiveTabs() {
  Tabs.memSave(function (tabs) {
    log("Dicarded the following tabs from memory: " + tabs);
  });
}

function answerQuestion(text) {
  log('Searching Google for ' + text);
  tts.say('Searching Google for ' + text);
  googleSearch(text);
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
    log(TRIGGER_NAME + " refocused: " + tab.id);
    tts.say("Hello, what would you like me to do?");
  })
}

function handleLinkClick(text) {
  var content = text.replace("click on the link that says ", "");
  content = content.replace("click the link that says ", "");
  content = content.replace("click on the link that contains ", "");
  content = content.replace("click the link that contains ", "");
  console.log("Trying to click on link containing:" + content);
  Click.refLink(content);
}

function dontUnderstand() {
  tts.say("Sorry I do not know how to do that yet.");
}

function doTabAction(text) {
  var text = text.toLowerCase().remove(TRIGGER_NAME + " ");
  if (text.contains("what can you do") || text.contains("open help menu") || text.contains("open help")) {
    openDocumentation();
  } else if (text.contains("close help menu") || text.contains("close help")) {
    closeDocumentation();
  } else if (text.contains("open a new tab") || text.contains("open another tab")) {
    openEmptyTab();
  } else if ((text.contains("open the ") && text.contains("tab")) || text.contains("go to the ") && text.contains("tab")) {
    openSpecificTab(text);
  } else if (text.contains("go to ") || text.contains("open ")) {
    goToWebsite(text);
  } else if (text.contains("mute all audible tabs") || text.contains("close all audible tabs") || text.contains("stop all audible tabs")) {
    discardNonActiveAudibleTabs();
  } else if (text.contains("search") || text.contains("look up") || text.contains("google")) {
    requestSearch(text);
  } else if (text.contains("close the current tab") || text.contains("close this tab")) {
    closeCurrentTab(); // If not voice web
  } else if (text.contains("close the last tab") || text.contains("close last tab")) {
    closeLastTab(); // If not voice web
  } else if (text.contains("close the first") && text.contains("tabs")) {
    closePastTabs(text); // If not voice web
  } else if (text.contains("close the last") && text.contains("tabs")) {
    closeRecentTabs(text); // If not voice web
  } else if (text.contains("close the previous tab") || text.contains("close previous tab")) {
    closePreviousTab(); // If not voice webclose
  } else if (text.contains("close the previous") && text.contains("tabs")) {
    closePreviousTabs(text); // If not voice web
  } else if (text.contains("close the next tab") || text.contains("close next tab")) {
    closeNextTab(); // If not voice webclose
  } else if (text.contains("close the next") && text.contains("tabs")) {
    closeNextTabs(text); // If not voice web
  } else if (text.contains("close the ") && text.contains("tab")) {
    closeSpecificTab(text); // If not voice web
  } else if ((text.contains("close the ") && text.contains("tabs")) || (text.contains("closed the ") && text.contains("tabs"))) {
    closeSpecificTabs(text); // If not voice web
  } else if (text.contains("enter memory save mode")) {
    discardNonActiveTabs();
  } else if (text.isQuestion()) {
    answerQuestion(text);
  } else if (text.contains("scroll up a little")) {
    Scroll.littleUp();
  } else if (text.contains("scroll up a lot") || text.contains("scroll up alot")) {
    Scroll.bigUp();
  } else if (text.contains("scroll up") || text.contains("scroll up more")) {
    Scroll.medUp();
  } else if (text.contains("scroll down a little")) {
    Scroll.littleDown();
  } else if (text.contains("scroll down a lot") || text.contains("scroll down alot")) {
    Scroll.bigDown();
  } else if (text.contains("scroll down") || text.contains("scroll down more")) {
    Scroll.medDown();
  } else if (text.contains("click on the link that contains") || text.contains("click the link that contains") || text.contains("click on the link that says") || text.contains("click the link that says")) {
    handleLinkClick(text);
  } else if (text.contains("go back")) {
    Window.back();
  } else if (text.contains("go forward")) {
    Window.forward();
  } else if (text.contains("refresh the page") || text.contains("refresh page")) {
    Window.refresh();
  } else if (text.contains("refresh yourself") || text.contains("reset")) {
    Window.refreshApp();
  } else {
    dontUnderstand();
  }
}

function toggleContinuousAnalysis(text) {
  if (text.contains("off")) {
    continuous_check.checked = false;
  } else if (text.contains("on")) {
    continuous_check.checked = true;
  }
}

function analyze(text) {
  var text = text.toLowerCase();
  if (text.contains("hello " + TRIGGER_NAME)) { return 'hello'; }
  if (text.contains(TRIGGER_NAME + " go to sleep")) { return 'sleep' };
  if (text.contains("continuous analysis")) { return 'continuous' };
  if (text.contains("be quiet") || text.contains("stop speaking") || text.contains("shut up")) { return 'quiet' };
  // return null;
  return 'tabs';
}

function takeAction(text) {
  switch(analyze(text)) {
    case 'hello':
      log('Refocus Command');
      focus();
      break;
    case 'search':
      log('Search Command');
      break;
    case 'continuous':
      log('Toggle Continuous Analysis');
      toggleContinuousAnalysis(text);
      break;
    case 'tabs':
      log('Tab Command');
      doTabAction(text);
      break;
    case 'sleep':
      log('Sleep Command');
      goToSleep();
      break;
    case 'quiet':
      log('Quiet Command');
      stopSpeaking();
      break;
    default:
      log('Not a valid Command');
      responseMessage('Not a valid Command');
  }
}
