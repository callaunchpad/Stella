function goBack() {
  chrome.tabs.executeScript(null, { code: "window.history.back();" }, function(result) {
    Debug.log("Went back one page");
  });
}

function goForward() {
  chrome.tabs.executeScript(null, { code: "window.history.forward();" }, function(result) {
    Debug.log("Went forward one page");
  });
}

function refreshPage() {
  chrome.tabs.executeScript(null, { code: "location.reload();" }, function(result) {
    Debug.log("Refreshed the page");
  });
}

function refreshExtension() {
  Debug.log("Refreshed the extension");
  location.reload();
}

var Window = {
  back: goBack,
  forward: goForward,
  refresh: refreshPage,
  refreshApp: refreshExtension
}
