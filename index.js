var debug = true;
function renderStatus(statusText) { document.getElementById("status").textContent = statusText; }
function log(obj) { if (debug) console.log(obj); }
String.prototype.contains = function(substr) { return this.indexOf(substr) != -1; }
function linebreak(s) { return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>'); }
function capitalize(s) { return s.replace(/\S/, function(m) { return m.toUpperCase(); }); }

function micRec() {
  log('MIC Recording');
  rec_dot.style.borderColor = '#FF3030';
  rec_dot.style.borderRadius = '30px';
  rec_pulse.style.display = 'block';
}

function micOff() {
  log('MIC Off');
  rec_dot.style.borderRadius = 'none';
  rec_pulse.style.display = 'none';
  rec_dot.style.borderColor = 'lightgray';
}

var langs = [['Afrikaans',       ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu',   ['ms-MY']],
 ['Català',          ['ca-ES']],
 ['Čeština',         ['cs-CZ']],
 ['Deutsch',         ['de-DE']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Español',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Euskara',         ['eu-ES']],
 ['Français',        ['fr-FR']],
 ['Galego',          ['gl-ES']],
 ['Hrvatski',        ['hr_HR']],
 ['IsiZulu',         ['zu-ZA']],
 ['Íslenska',        ['is-IS']],
 ['Italiano',        ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Magyar',          ['hu-HU']],
 ['Nederlands',      ['nl-NL']],
 ['Norsk bokmål',    ['nb-NO']],
 ['Polski',          ['pl-PL']],
 ['Português',       ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Română',          ['ro-RO']],
 ['Slovenčina',      ['sk-SK']],
 ['Suomi',           ['fi-FI']],
 ['Svenska',         ['sv-SE']],
 ['Türkçe',          ['tr-TR']],
 ['български',       ['bg-BG']],
 ['Pусский',         ['ru-RU']],
 ['Српски',          ['sr-RS']],
 ['한국어',            ['ko-KR']],
 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                     ['cmn-Hans-HK', '普通话 (香港)'],
                     ['cmn-Hant-TW', '中文 (台灣)'],
                     ['yue-Hant-HK', '粵語 (香港)']],
 ['日本語',           ['ja-JP']],
 ['Lingua latīna',   ['la']]];

 // Credit to JavaAndCSharp and danfuzz from StackOverflow: http://stackoverflow.com/questions/11980087/javascript-words-to-numbers

 var Small = {
     'zero': 0,
     'one': 1,
     'two': 2,
     'three': 3,
     'four': 4,
     'five': 5,
     'six': 6,
     'seven': 7,
     'eight': 8,
     'nine': 9,
     'ten': 10,
     'eleven': 11,
     'twelve': 12,
     'thirteen': 13,
     'fourteen': 14,
     'fifteen': 15,
     'sixteen': 16,
     'seventeen': 17,
     'eighteen': 18,
     'nineteen': 19,
     'twenty': 20,
     'thirty': 30,
     'forty': 40,
     'fifty': 50,
     'sixty': 60,
     'seventy': 70,
     'eighty': 80,
     'ninety': 90
 };

 var Magnitude = {
     'thousand':     1000,
     'million':      1000000,
     'billion':      1000000000,
     'trillion':     1000000000000,
     'quadrillion':  1000000000000000,
     'quintillion':  1000000000000000000,
     'sextillion':   1000000000000000000000,
     'septillion':   1000000000000000000000000,
     'octillion':    1000000000000000000000000000,
     'nonillion':    1000000000000000000000000000000,
     'decillion':    1000000000000000000000000000000000,
 };

 var a, n, g;

 function textTonum(s) {
     a = s.toString().split(/[\s-]+/);
     n = 0;
     g = 0;
     a.forEach(feach);
     return n + g;
 }

 function feach(w) {
     var x = Small[w];
     if (x != null) {
         g = g + x;
     }
     else if (w == "hundred") {
         g = g * 100;
     }
     else {
         x = Magnitude[w];
         if (x != null) {
             n = n + g * x
             g = 0;
         }
         else {
             alert("Unknown number: "+w);
         }
     }
 }
