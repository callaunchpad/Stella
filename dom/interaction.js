// Scrolling
const LITTLE = 200;
const MED = 500;
const ALOT = 1000;

function littleScrollUp() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '-=" + LITTLE + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function medScrollUp() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '-=" + MED + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function bigScrollUp() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '-=" + ALOT + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function littleScrollDown() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '+=" + LITTLE + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function medScrollDown() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '+=" + MED + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function bigScrollDown() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '+=" + ALOT + "px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

var Scroll = {
  littleUp: littleScrollUp,
  medUp: medScrollUp,
  bigUp: bigScrollUp,
  littleDown: littleScrollDown,
  medDown: medScrollDown,
  bigDown: bigScrollDown
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
