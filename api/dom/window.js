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

function refreshPage() {
  chrome.tabs.executeScript(null, { code: "location.reload();" }, function(result) {
    log("Refreshed the page");
  });
}

function refreshExtension() {
  log("Refreshed the extension");
  location.reload();
}

var Window = {
  back: goBack,
  forward: goForward,
  refresh: refreshPage,
  refreshApp: refreshExtension
}
