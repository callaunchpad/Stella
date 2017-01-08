// Scrolling
const LITTLE = 200;
const MED = 500;
const ALOT = 1000;

function scrollUp(amount) {
  return function() {
    Tabs.getCurrent(function(tab) {
      if(tab.url == APP_URL) {
        $('tbody').stop().animate({
          scrollTop: '-=' + amount + 'px'},
          '1000',
          'swing',
          function() {
            console.log('Finished animating');
          });
      } else {
        chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
          chrome.tabs.executeScript(null, {
            code: "$('html, body').stop().animate({scrollTop: '-=" + amount + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
          }, function(result) {
          });
        });
      }
    });
  }
}

function scrollDown(amount) {
  return function() {
    Tabs.getCurrent(function(tab) {
      if(tab.url == APP_URL) {
        $('tbody').stop().animate({
          scrollTop: '+=' + amount + 'px'},
          '1000',
          'swing',
          function() {
            console.log('Finished animating');
          });
      } else {
        chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
          chrome.tabs.executeScript(null, {
            code: "$('html, body').stop().animate({scrollTop: '+=" + amount + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
          }, function(result) {
          });
        });
      }
    });
  }
}

var Scroll = {
  littleUp: scrollUp(LITTLE),
  medUp: scrollUp(MED),
  bigUp: scrollUp(ALOT),
  littleDown: scrollDown(LITTLE),
  medDown: scrollDown(MED),
  bigDown: scrollDown(ALOT)
}

// Clicking

function clickLink(content) {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    var command = "var query = 'a:casecontains(" + content + ")'; var elementInView = true;";
    chrome.tabs.executeScript(null, { code: command }, function() {
      chrome.tabs.executeScript(null, { file: "api/dom/utils.js" }, function() {
        chrome.tabs.executeScript(null, { file: "api/dom/click.js" });
      });
    });
  });
}

function clickYoutubeLink(first, custom) {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    if (first) {
      var command = "var videos = $('a.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.yt-uix-sessionlink.spf-link[href*=\"/watch?v=\"]'); if (videos.length > 0) videos[0].click();";
      chrome.tabs.executeScript(null, { code: command }, function() {});
    } else if (custom) {
      var command = "var query = 'a.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.yt-uix-sessionlink.spf-link[href*=\"/watch?v=\"]:casecontains(" + custom + ")'; var elementInView = false;"
      chrome.tabs.executeScript(null, { code: command }, function() {
        chrome.tabs.executeScript(null, { file: "api/dom/utils.js" }, function() {
          chrome.tabs.executeScript(null, { file: "api/dom/click.js" });
        });
      });
    }
  });
}

var Click = {
  link: clickLink,
  youtube: clickYoutubeLink
}

// Typing

function typeInTextbox(input, label) {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    console.log("Input: " + input);
    console.log("Label: " + label);
    chrome.tabs.executeScript(null, { file: "api/dom/utils.js" }, function() {
      var command = "var input = \"" + input + "\"; var label = \"" + label + "\";";
      chrome.tabs.executeScript(null, { code: command }, function() {
        chrome.tabs.executeScript(null, { file: "api/dom/type.js" }, function(result) {
          console.log("Result: " + result);
          if (result == "false") {
            tts.say("I couldn't find the textbox. However, I relabeled the textboxes. Please ask again!");
            console.log("Couldn't find textbox!");
          }
        });
      });
    });
  });
}

var Type = {
  textbox: typeInTextbox
}
