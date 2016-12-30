function refocus(callback) {
  var query = { url: "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html" };
  chrome.tabs.query(query, function(tabs) {
    var tab = tabs[0];
    chrome.tabs.update(tab.id, { active: true, highlighted: true }, function(tab) {
      callback(tab);
    });
  });
}

function discardAllAudibleTabs(callback) {
    var query = { audible: true };
    chrome.tabs.query(query, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            chrome.tabs.discard(tab.id, function(tab) {
                log("Removed tab from memory. Click tab again to reload." + JSON.stringify(tab));
            });
        }
        callback(tabs);
    });
}

function memorySaveMode(callback) {
    var query = { active: false }
    chrome.tabs.query(query, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            chrome.tabs.discard(tab.id, function(tab) {
                log("Removed tab from memory. Click tab again to reload." + JSON.stringify(tab));
            });
        }
        callback(tabs);
    });
}

function getCurrentTab(callback) {
  var query = { active: true, currentWindow: true };

  chrome.tabs.query(query, function(tabs) {
    var tab = tabs[0];
    // console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(tab);
  });
}

function openEmptyTab(callback) {
    chrome.tabs.create({}, function(tab) {
        callback(tab);
    });
}

function openNewTab(url, callback) {
    var props = { url: url };
    chrome.tabs.create(props, function(tab) {
        callback(tab);
    });
}

function duplicateTab(tabId, callback) {
    // tabId: integer
    chrome.tabs.duplicate(tabId, function(tab) {
        callback(tab);
    });
}

function closeRecentTabs(num) {
  var query = { currentWindow: true };
  chrome.tabs.query(query, function(tabs) {
    var counter = 0;
    while (counter < num && counter < tabs.length - 1) {
      var tab = tabs[tabs.length - 1 - counter];
      if (tab.url != "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html") {
        chrome.tabs.remove(tab.id, function(tab) {
          log("Tab removed: " + JSON.stringify(tab));
        });
      }
      counter++;
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTab(function(tab) {
    renderStatus('Current Tab URL: ' + tab.url);
  });
});

var Tabs = {
  refocus: refocus,
  muteTabs: discardAllAudibleTabs,
  memSave: memorySaveMode,
  getCurrent: getCurrentTab,
  openEmpty: openEmptyTab,
  openNew: openNewTab,
  duplicate: duplicateTab,
  closeTabs: closeRecentTabs
}
