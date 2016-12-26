var $ = require('jquery')
console.log('hi')

var debug = true;
function renderStatus(statusText) { document.getElementById('status').textContent = statusText; }
function log(obj) { if (debug) console.log(obj); }

var info = $("#info")[0];
var info_start = $("#info_start")[0];
var info_speak_now = $("#info_speak_now")[0];
var info_no_speech = $("#info_no_speech")[0];
var info_no_microphone = $("#info_no_microphone")[0];
var info_allow = $("#info_allow")[0];
var info_denied = $("#info_denied")[0];
var info_blocked = $("#info_blocked")[0];
var info_upgrade = $("#info_upgrade")[0];
var start_button = $("#start_button")[0];
var start_img = $("#start_img")[0];
var results = $("#results")[0];
var final_span = $("#final_span")[0];
var interim_span = $("#interim_span")[0];
var div_language = $("#div_language")[0];
var select_language = $("#select_language")[0];
var select_dialect = $("#select_dialect")[0];
