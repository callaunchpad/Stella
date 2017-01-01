start_button.addEventListener('click', startButton);
select_language.addEventListener('change', updateCountry);
start_button.style.display = 'inline-block';

for (var i = 0; i < langs.length; i++) { select_language.options[i] = new Option(langs[i][0], i); }
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;
showInfo('info_start');

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) { select_dialect.remove(i); }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) { select_dialect.options.add(new Option(list[i][1], list[i][0])); }
  select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

function startButton(event) {
  if (!toggleRecognition(event)) forceStop();
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) child.style.display = child.id == s ? 'inline' : 'none';
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}

// INITIAL ACTIONS
toggleRecognition();
setTimeout(function() {
  tts.say("Hello, I'm Stella! Ask me anything.");
}, 100);
