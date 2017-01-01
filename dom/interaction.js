function littleScrollUp() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '-=300px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function medScrollUp() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '-=500px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function bigScrollUp() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '-=1000px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function littleScrollDown() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '+=300px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function medScrollDown() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '+=500px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}

function bigScrollDown() {
  chrome.tabs.executeScript(null, { file: "scripts/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, {
      code: "$('html, body').stop().animate({scrollTop: '+=1000px'}, '1000', 'swing', function() { console.log('Finished animating'); });"
    }, function(result) {
    });
  });
}
