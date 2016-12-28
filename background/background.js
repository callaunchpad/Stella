chrome.browserAction.onClicked.addListener(function(activeTab) {
  var query = { url: "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html" };
  chrome.tabs.query(query, function(tabs) {
    if (tabs.length == 0) {
      chrome.tabs.create({active: true, url: "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html"}, function(tab) {
        console.log("Vocal Web site tab initialized: " + tab.url);
      });
    } else {
      var tab = tabs[0];
      console.log("Vocal Web site tab initialized: " + tab.url);
    }
  });
});
