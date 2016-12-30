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

  chrome.notifications.create(options, function(id) {
    log("Notification created: " + id);
    running[id] = true;
    var timeout = setTimeout(clearNotification, 3000, id);
    log("Last error:", chrome.runtime.lastError);
  })
}

var notifications = {
  create: createNotification,
  remove: clearNotification,
  running: getAllSessionNotifications,
  system: getAllSystemNotifications
}
