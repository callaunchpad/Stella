var running = {};

function clearNotification(notificationId) {
  chrome.notifications.clear(notificationId, function(cleared) {
    log("Notification " + notificationId + " was cleared: " + cleared);
    if (cleared) delete running[notificationId];
  })
}

function getAllSessionNotifications() {
  return Object.keys(running);
}

function getAllSystemNotifications() {
  chrome.notifications.getAll(function(notifications) {
    log(notifications);
  });
}

function createNotification(title, message, contextMessage) {
  // if (Notification in window && Notification.permission === "granted") {
  //   var options = {
  //     body: message,
  //     icon: 'public/img/stella.png'
  //   }
  //   var n = new Notification(title,options);
  //   setTimeout(n.close.bind(n), 3000);
  // }

  chrome.notifications.getPermissionLevel(function (level) {
    console.log("Permission: " + level);
  });
  var options = {
    type: 'basic',
    iconUrl: 'public/img/stella.png',
    // appIconMaskUrl: undefined,
    title: title,
    message: message,
    // contextMessage: 'some test',
    priority: 2,
    // eventTime: Date.now(),
    // buttons: undefined,
    // imageUrl: 'public/img/stella.png',
    // items: undefined,
    // progress: undefined,
    // isClickable: undefined,
    requireInteraction: true
  }
  console.log(options);

  // chrome.notifications.getAll(function(notifications) {
  //   var ids = Object.keys(notifications);
  //   for (var i  = 0; i < ids.length; i++) {
  //     var id = ids[i];
  //     clearNotification(id);
  //   }
  // });

  chrome.notifications.create(options, function(id) {
    log("Notification created: " + id);
    running[id] = true;
    var timeout = setTimeout(clearNotification, 2000, id);
    console.log("Last error:", chrome.runtime.lastError);
  })
  // log(getAllSystemNotifications());
}

var notifications = {
  create: createNotification,
  remove: clearNotification,
  running: getAllSessionNotifications,
  system: getAllSystemNotifications
}
