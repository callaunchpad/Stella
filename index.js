var debug = true;
function renderStatus(statusText) { document.getElementById("status").textContent = statusText; }
function log(obj) { if (debug) console.log(obj); }
String.prototype.contains = function(substr) { return this.indexOf(substr) != -1; }
