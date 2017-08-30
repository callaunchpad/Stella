function goToWebsite(text) {
  var url = text.match(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm);
  if (url) {
    url = url[0];
    if (!url.contains("http://")) url = "http://" + url;
    responseMessage('Going to: ' + url);
    Tabs.openNew(url, function(tab) {
      Debug.log("New tab at " + url + " created: " + JSON.stringify(tab));
    });
  } else {
    tts.say('Sorry, I cannot find the url you requested.');
  }
}

function openEmptyTab() {
  Tabs.openEmpty(function(tab) {
    Debug.log("New Empty Tab Created: " + JSON.stringify(tab));
  });
}

function openSpecificTab(text) {
  var textArr = text.split(" ");
  // var num = ordinalToNum(textArr[textArr.indexOf("tab") - 1]);
  // var index = num - 1;
  var index = textTonum(text) - 1;
  Tabs.openSpecificTab(index, function(tab) {
    responseMessage((textArr[textArr.indexOf("tab") - 1]) + " tab opened: " + tab.url);
  });
}

function discardNonActiveAudibleTabs() {
  responseMessage('Muted all audible tabs.');
  Tabs.muteTabs(function(tabs) {
    Debug.log("Muted all audible tabs " + tabs);
  });
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

function closeFirstTab() {
  Tabs.closeFirstTabs(1, function(tab) {
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
  Tabs.closeFirstTabs(num, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
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
  Debug.log('closing previous tab');
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
  Debug.log('closing previous' + num + 'tabs');
  Tabs.closePrevTabs(num, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function closeNextTab() {
  Debug.log('closing next tab');
  Tabs.closeNextTabs(1, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

// function closeNextTabs(text) {
//   var num = text.match(/[0-9]+\s(tabs)/g);
//   if (num) {
//     num = num[0].replace(" tabs", "");
//   } else {
//     var textArr = text.split(" ");
//     num = textTonum(textArr[textArr.indexOf("next") + 1]);
//   }
//   Debug.log('closing next' + num + 'tabs');
//   Tabs.closeNextTabs(num, function(tab) {
//     responseMessage("Closed tab: " + tab.url);
//   });
// }
function closeNextTabs(text) {
  // var num = text.match(/[0-9]+\s(tabs)/g);
  // if (num) {
  //   num = num[0].replace(" tabs", "");
  // } else {
  //   var textArr = text.split(" ");
  //   num = textTonum(textArr[textArr.indexOf("next") + 1]);
  // }
  num = textTonum(text);
  Debug.log('closing next' + num + 'tabs');
  Tabs.closeNextTabs(num, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

// function closeSpecificTab(text) {
//   var textArr = text.split(" ");
//   var num = ordinalToNum(textArr[textArr.indexOf("tab") - 1]);
//   Debug.log('closing the ' + (textArr[textArr.indexOf("tab") - 1]) + ' tab');
//   var index = num - 1;
//   Tabs.closeSpecificTabs(index, index, function(tab) {
//     responseMessage("Closed tab: " + tab.url);
//   });
// }
function closeSpecificTab(text) {
  var textArr = text.split(" ");
  var num = textTonum(text)
  Debug.log('closing the ' + num + ' tab');
  var index = num - 1;
  Tabs.closeSpecificTabs(index, index, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

// function closeSpecificTabs(text) {
//   var textArr = text.split(" ");
//   var startNum = ordinalToNum(textArr[textArr.indexOf("the") + 1]);
//   var endNum = ordinalToNum(textArr[textArr.indexOf("tabs") - 1]);
//   Debug.log('closing the ' + (textArr[textArr.indexOf("the") + 1]) + ' to ' + (textArr[textArr.indexOf("tabs") - 1]) + 'tabs');
//   var start = startNum - 1;
//   var end = endNum - 1;
//   Tabs.closeSpecificTabs(start, end, function(tab) {
//     responseMessage("Closed tab: " + tab.url);
//   });
// }

function closeSpecificTabs(text) {
  var textArr = text.split(" ");
  var nums = textTonums(text);
  var startNum = Math.min(num[0], num[1]);
  var endNum = Math.max(num[0], num[1]);
  console.log(startNum + " " + endNum);
  Debug.log('closing the ' + startNum + ' to ' + endNum + 'tabs');
  var start = startNum - 1;
  var end = endNum - 1;
  Tabs.closeSpecificTabs(start, end, function(tab) {
    responseMessage("Closed tab: " + tab.url);
  });
}

function discardNonActiveTabs() {
  Tabs.memSave(function (tabs) {
    Debug.log("Dicarded the following tabs from memory: " + tabs);
    tts.say("Background chrome tabs have been unloaded from memory. Simply click on them to reload.")
  });
}

function reopenTabs(text) {
  // var num = text.match(/[0-9]+\s(tabs)/g);
  // if (num) {
  //   num = num[0].replace(" tabs", "");
  // } else {
  //   var textArr = text.split(" ");
  //   num = textTonum(textArr[textArr.indexOf("last") + 1]);
  // }
  var num = textTonum(text);
  if(num == 0){
    num =1;
  }
  Tabs.reopen(num, function (tab) {
    Debug.log("Reopened site: " + tab.url);
  });
}

API.Tabs = {
  goToWebsite: goToWebsite,
  openEmptyTab: openEmptyTab,
  openSpecificTab: openSpecificTab,
  discardNonActiveAudibleTabs: discardNonActiveAudibleTabs,
  closeCurrentTab: closeCurrentTab,
  closeLastTab: closeLastTab,
  closeFirstTab: closeFirstTab,
  closePastTabs: closePastTabs,
  closeRecentTabs: closeRecentTabs,
  closePreviousTab: closePreviousTab,
  closePreviousTabs: closePreviousTabs,
  closeNextTab: closeNextTab,
  closeNextTabs: closeNextTabs,
  closeSpecificTab: closeSpecificTab,
  closeSpecificTabs: closeSpecificTabs,
  discardNonActiveTabs: discardNonActiveTabs,
  reopenTabs: reopenTabs
}
