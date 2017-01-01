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
  var options = {
    type: 'basic',
    iconUrl: 'public/img/stella.png',
    title: title,
    message: message,
    priority: 2,
    eventTime: Date.now()
  }

  chrome.notifications.create(options, function(id) {
    log("Notification created: " + id);
    running[id] = true;
    var timeout = setTimeout(clearNotification, 1500, id);
    log("Last error:", chrome.runtime.lastError);
  })
}

var notifications = {
  create: createNotification,
  remove: clearNotification,
  running: getAllSessionNotifications,
  system: getAllSystemNotifications
}
