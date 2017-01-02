var debug = true;
const TRIGGER_NAME = "stella";
const APP_URL = "chrome-extension://ecbiglglpcmpjmdplphadimldeldkpbl/index.html";
function renderStatus(statusText) { document.getElementById("status").textContent = statusText; }
function log(obj) { if (debug) console.log(obj); }
function linebreak(s) { return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>'); }
function capitalize(s) { return s.replace(/\S/, function(m) { return m.toUpperCase(); }); }

String.prototype.contains = function(substr) { return this.indexOf(substr) != -1; }
String.prototype.getWords = function(startIndex, endIndex) { return this.split(" ").slice(startIndex, endIndex).join(" "); }
String.prototype.remove = function(substr) { return this.replace(substr, ""); };
String.prototype.isQuestion = function() { return ["are", "who", "what", "when", "where", "why", "will", "how", "whom", "whose", "which", "is"].includes(this.getWords(0, 1)); }

function ordinalToNum(text) {
  if (text.contains("first")) text = text.replace("first", "1");
  if (text.contains("second")) text = text.replace("second", "2");
  if (text.contains("third")) text = text.replace("third", "3");
  if (text.contains("fourth")) text = text.replace("fourth", "4");
  if (text.contains("fifth")) text = text.replace("fifth", "5");
  if (text.contains("sixth")) text = text.replace("sixth", "6");
  if (text.contains("seventh")) text = text.replace("seventh", "7");
  if (text.contains("eighth")) text = text.replace("eighth", "8");
  if (text.contains("ninth")) text = text.replace("ninth", "9");
  if (text.contains("tenth")) text = text.replace("tenth", "10");
  if (text.contains("eleventh")) text = text.replace("eleventh", "11");
  if (text.contains("twelfth")) text = text.replace("twelfth", "12");
  if (text.contains("thirteenth")) text = text.replace("thirteenth", "13");
  if (text.contains("fourteenth")) text = text.replace("fourteenth", "14");
  if (text.contains("fifteenth")) text = text.replace("fifteenth", "15");
  if (text.contains("sixteenth")) text = text.replace("sixteenth", "16");
  if (text.contains("seventeenth")) text = text.replace("seventeenth", "17");
  if (text.contains("eigteenth")) text = text.replace("eigteenth", "18");
  if (text.contains("nineteenth")) text = text.replace("nineteenth", "19");
  if (text.contains("twentieth")) text = text.replace("twentieth", "20");
  if (text.contains("twenty")) text = text.replace("twenty", "2");
  if (text.contains("thirtieth")) text = text.replace("thirtieth", "30");
  if (text.contains("thirty")) text = text.replace("thirty", "3");
  if (text.contains("fourtieth")) text = text.replace("fourtieth", "40");
  if (text.contains("fourty")) text = text.replace("fourty", "4");
  if (text.contains("fiftieth")) text = text.replace("fiftieth", "50");
  if (text.contains("fifty")) text = text.replace("fifty", "5");
  text = text.replace(" ", "");
  return parseInt(text);
}

function micRec() {
  // log('MIC Recording');
  rec_dot.style.borderColor = '#FF3030';
  rec_dot.style.borderRadius = '30px';
  rec_pulse.style.display = 'block';
}

function micOff() {
  // log('MIC Off');
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
     if (x != null) { g = g + x; }
     else if (w == "hundred") { g = g * 100; }
     else {
         x = Magnitude[w];
         if (x != null) {
             n = n + g * x
             g = 0;
         }
         else { console.log("Unknown number: "+w); }
     }
 }
