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

function closeCurrentTab(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     var tab = tabs[0];
     chrome.tabs.remove(tab.id, function() {
       log("Tab removed: " + JSON.stringify(tab));
       if (callback) callback(tab);
     });
  });
}

function closeFirstTabs(num, callback) {
  var query = { currentWindow: true };
  chrome.tabs.query(query, function(tabs) {
    while (num > 0) {
      var tab = tabs[num];
      if (tab.url != "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html") {
        if (callback) callback(tab);
        chrome.tabs.remove(tab.id, function() {
          log("Tab removed: " + JSON.stringify(tab));
        });
      }
      num--;
    }
  });
}

function closeLastTabs(num, callback) {
  var query = { currentWindow: true };
  chrome.tabs.query(query, function(tabs) {
    var counter = 0;
    while (counter < num && counter < tabs.length - 1) {
      var tab = tabs[tabs.length - 1 - counter];
      if (tab.url != "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html") {
        if (callback) callback(tab);
        chrome.tabs.remove(tab.id, function() {
          log("Tab removed: " + JSON.stringify(tab));
        });
      }
      counter++;
    }
  });
}

function closeNextTabs(num, callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     var activeTab = tabs[0];
     var query = { currentWindow: true };
     chrome.tabs.query(query, function(tabs) {
       var activeTabIndex = -1;
       for (var i = 0; i < tabs.length; i++) {
         var tab = tabs[i];
         if (tab.id == activeTab.id) {
           activeTabIndex = i;
           break;
         }
       }
       while (num > 0) {
         if (activeTabIndex + num < tabs.length) {
           var tab = tabs[activeTabIndex + num];
           if (tab.url != "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html") {
             if (callback) callback(tab);
             chrome.tabs.remove(tab.id, function() {
               log("Tab removed: " + JSON.stringify(tab));
             });
           }
         }
         num--;
       }
     });
  });
}

function closePreviousTabs(num, callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     var activeTab = tabs[0];
     var query = { currentWindow: true };
     chrome.tabs.query(query, function(tabs) {
       var activeTabIndex = -1;
       for (var i = 0; i < tabs.length; i++) {
         var tab = tabs[i];
         if (tab.id == activeTab.id) {
           activeTabIndex = i;
           break;
         }
       }
       while (num > 0) {
         if (activeTabIndex > num) {
           var tab = tabs[activeTabIndex - num];
           if (tab.url != "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html") {
             if (callback) callback(tab);
             chrome.tabs.remove(tab.id, function() {
               log("Tab removed: " + JSON.stringify(tab));
             });
           }
         }
         num--;
       }
     });
  });
}

function closeSpecificTabs(start, end, callback) {
  var query = { currentWindow: true };
  chrome.tabs.query(query, function(tabs) {
    for (var i = start; i <= end; i++) {
      var tab = tabs[i];
      if (start > 0 && end < tabs.length) {
        if (tab.url != "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html") {
          if (callback) callback(tab);
          chrome.tabs.remove(tab.id, function() {
            log("Tab removed: " + JSON.stringify(tab));
          });
        }
      }
    }
  });
}

function openSpecificTab(index, callback) {
  var query = { currentWindow: true };
  chrome.tabs.query(query, function(tabs) {
    if (index > 0 && index < tabs.length) {
      var tab = tabs[index];
      chrome.tabs.update(tab.id, { active: true, highlighted: true }, function(tab) {
        callback(tab);
      });
    }
  });
}

function reopen(num, callback) {
  var query = { text: '', maxResults: num };
  chrome.history.search(query, function(results) {
    for (var i = 0; i < results.length; i++) {
      openNewTab(results[i].url, callback);
    }
  })
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
  closeCurrent: closeCurrentTab,
  closeFirstTabs: closeFirstTabs,
  closeLastTabs: closeLastTabs,
  closeNextTabs: closeNextTabs,
  closePrevTabs: closePreviousTabs,
  closeSpecificTabs: closeSpecificTabs,
  openSpecificTab: openSpecificTab,
  reopen: reopen
}
