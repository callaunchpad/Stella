chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == 'restartMic') {
    start_button.click();
  }
});
