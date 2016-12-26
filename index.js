var debug = true;
function renderStatus(statusText) {
  document.getElementById("status").textContent = statusText;
  console.log(statusText);
}
function log(obj) { if (debug) console.log(obj); }
