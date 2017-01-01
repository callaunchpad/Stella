function goBack() {
  chrome.tabs.executeScript(null, { code: "window.history.back();" }, function(result) {
    log("Went back one page");
  });
}

function goForward() {
  chrome.tabs.executeScript(null, { code: "window.history.forward();" }, function(result) {
    log("Went forward one page");
  });
}

var Window = {
  back: goBack,
  forward: goForward
}
