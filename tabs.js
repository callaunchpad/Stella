function getCurrentTabUrl(callback) {
  var queryInfo = { active: true, currentWindow: true };

  chrome.tabs.query(queryInfo, function(tabs) {
    // get active tab
    var tab = tabs[0];
    var url = tab.url;
    log(tab);
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}

function openNewTab(props, callback) {
  // var props = {
  //   windowId: 'windowToBeOpenedIn',
  //   index: 'intendedTabPosition',
  //   url: url,
  //   active: true,
  //   selected: true,
  //   pinned: false,
  //   openerTabId: null
  // };

  chrome.tabs.create(props, function(tab) {
    callback(tab);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    renderStatus('Current Tab URL: ' + url);
  });

  // API Examples
  // openNewTab({url:"http://www.google.com"}, function(tab) {
  //   log(tab);
  // });

});
