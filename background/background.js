chrome.browserAction.onClicked.addListener(function(activeTab) {
  var query = { url: "chrome-extension://" + chrome.runtime.id + "/index.html" };
  chrome.tabs.query(query, function(tabs) {
    if (tabs.length == 0) {
      // var windowSpecs = {width: 620, height: 430, type: 'normal', state: 'normal', focused: true, url: APP_URL};
      var tabSpecs = {active: true, url: "chrome-extension://fkejanlfomiednfigechphohcjaklelo/index.html"};
      chrome.tabs.create(tabSpecs, function(tab) {
        console.log("Vocal Web site tab initialized: " + tab.url);
      });
    } else {
      var tab = tabs[0];
      chrome.tabs.update(tab.id, { active: true, highlighted: true }, function(tab) {
        console.log("Vocal Web site tab initialized: " + tab.url);
      });
    }
  });
});
