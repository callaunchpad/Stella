// Scrolling

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
    chrome.tabs.executeScript(null, { code: "$.expr[':'].casecontains = $.expr.createPseudo(function(arg) { return function( elem ) { return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0; }; }); console.log($('a:casecontains(\"" + content + "\")')[0]); $('a:casecontains(\"" + content + "\")')[0].click();" }, function(result) {
      log("Clicked on link containing:" + content);
    });
  });
}

var Click = {
  refLink: clickLink
}
