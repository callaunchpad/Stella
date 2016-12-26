log(Tabs);

function analyze(text) {
  var text = text.toLowerCase();
  if (text.contains("jarvis go to sleep")) { return 'sleep' };
  if (text.contains("continuous analysis")) { return 'continuous' };
  // return null;
  return 'tabs';
}

function doTabAction(text) {
  var text = text.toLowerCase();
  if (text.contains("open a new tab")) {
    Tabs.openEmpty(function(tab) {
      log("New Empty Tab Created: " + JSON.stringify(tab));
    });
  } else if (text.contains("go to ")) {
    var url = text.match(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm)[0];
    if (!url.contains("http://")) url = "http://" + url;
    renderStatus('Going to: ' + url);
    Tabs.openNew(url, function(tab) {
      log("New tab at " + url + " created: " + JSON.stringify(tab));
    });
  } else if (text.contains("mute all audible tabs") || text.contains("close all audible tabs") || text.contains("stop all audible tabs")) {
    renderStatus('Muted all audible tabs.');
    Tabs.muteTabs(function(tabs) {
      log("Muted all audible tabs " + tabs);
    });
  } else if (text.contains("close this tab")) {
    Tabs.closeTabs(1);
  } else if (text.contains("close the last") && text.contains("tabs")) {
    var num = text.match(/[0-9]+\s(tabs)/g)
    if (num) {
      num = num[0].replace(" tabs", "");
    } else {
      var textArr = text.split(" ");
      num = textTonum(textArr[textArr.indexOf("last") + 1]);
    }
    Tabs.closeTabs(num);
  }
}

function toggleContinuousAnalysis(text) {
  if (text.contains("off")) {
    continuous_check.checked = false;
  } else if (text.contains("on")) {
    continuous_check.checked = true;
  }
}

function takeAction(text) {
  switch(analyze(text)) {
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
      forceStop();
      break;
    default:
      log('Not a valid Command');
      renderStatus('Not a valid Command');
  }
}
