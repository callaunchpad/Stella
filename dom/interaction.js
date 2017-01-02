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
    var contentString = "var clickLinkContent = '" + content + "';";
    console.log(contentString);
    chrome.tabs.executeScript(null, { code: contentString }, function() {
      chrome.tabs.executeScript(null, { file: "dom/click.js" });
    });
  });
}

var Click = {
  refLink: clickLink
}
