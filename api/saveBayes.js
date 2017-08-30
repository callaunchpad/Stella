var natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    classifier = new natural.BayesClassifier();

function trainNaiveBayes() {
  for (var key in coreActionCommands) {
    //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
    if (coreActionCommands.hasOwnProperty(key)) {
      classifier.addDocument(coreActionCommands[key], key);
    }
  }
  for (var key in searchActionCommands) {
    //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
    if (searchActionCommands.hasOwnProperty(key)) {
      classifier.addDocument(searchActionCommands[key], key);
    }
  }
  for (var key in interactActionCommands) {
    //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
    if (interactActionCommands.hasOwnProperty(key)) {
      classifier.addDocument(interactActionCommands[key], key);
    }
  }
  for (var key in browserActionCommands) {
    //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
    if (browserActionCommands.hasOwnProperty(key)) {
      classifier.addDocument(browserActionCommands[key], key);
    }
  }
  for (var key in tabActionCommands) {
    //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
    if (tabActionCommands.hasOwnProperty(key)) {
      classifier.addDocument(tabActionCommands[key], key);
    }
  }
  classifier.train();
}

function saveBayes() {
	trainNaiveBayes();
	classifier.save('weightings.json', function(err, classifier){});
}
// var coreActionMap = {
//   'open-documentation': API.Core.openDocumentation,
//   'close-documentation': API.Core.closeDocumentation,
//   'focus': API.Core.focus,
//   'sleep': API.Core.goToSleep,
//   'continuous-analysis': API.Core.toggleContinuousAnalysis,
//   'stop-speaking': API.Core.stopSpeaking
// };

var coreActionCommands = {
  'open-documentation': ['open', 'start', 'menu', 'docs', 'documentation', 'help'],
  'close-documentation': ['close', 'exit', 'menu', 'docs', 'documentation', 'help'],
  'focus': ['wake', 'up', 'hello',],
  'sleep': ['exit', 'die', 'sleep'],
  'continuous-analysis': ['analyse', 'analyze', 'continuous'],
  'stop-speaking': ['stop', 'speak', 'shut', 'up', 'quiet', 'halt', 'hold']
};
var searchActionCommands = {
  'request-search-google': ['search', 'look up', 'find', 'identify', 'google', 'online'],
  'request-search-youtube': ['search', 'look up', 'find', 'identify', 'youtube', 'video'],
  'youtube-search': ['play', 'video']
  //answerQuestion
};

// var searchActionMap = {
//   'request-search-youtube': API.Search,requestSearch,
//   'request-search-google': API.Search.requestSearch,
//   'youtube-search': API.youtubeSearch,
// }
var interactActionCommands = {
  //general scroll comman -- up, down, little, a lot all modify scroll
//   'scroll': ['scroll', 'move'],
  'scroll-up': ['scroll', 'move', 'up', 'above', 'higher'],
  'scroll-down':['scroll', 'move', 'down', 'below', 'lower'],
  'scroll-up-a-little': ['scroll', 'move', 'up', 'above', 'higher', 'little', 'bit', 'tiny', 'tad', 'slightly'],
  'scroll-down-a-little':['scroll', 'move', 'down', 'below', 'lower','little', 'bit', 'tiny', 'tad', 'slightly'],
  'scroll-up-a-lot': ['scroll', 'move', 'up', 'above', 'higher','a lot', 'ton', 'way'],
  'scroll-down-a-lot':['scroll', 'move', 'down', 'below', 'lower','a lot', 'ton', 'way'],
//   'up': ['up', 'above', 'higher'].
//   'down': ['down', 'below', 'lower']
//   'little': ['little', 'bit', 'tiny', 'tad', 'slightly'],
//   'a-lot': ['a lot', 'ton', 'way'],
  //seperate from scroll
  'click-link': ['click', 'link'],
  'type': ['type', 'box', 'input']
};


var browserActionCommands = {
  'go-back': ['go', 'back', 'previous', 'past'],
  'go-forward': ['go', 'forward'],
  'refresh-page': ['refresh', 'reload', 'reset', 'page'],
  'refresh-yourself': ['refresh', 'reload', 'reset', 'you', 'yourself']
};

 var tabActionCommands = {
   'open-empty-tab': ['open', 'new', 'tab', 'another', 'other'],
   'reopen-tabs': ['reopen', 'last', 're-open', 'open', 'previous', 'tabs'],
   'open-specific-tab': ['go to', 'open', 'go to the', 'tab'],
   'go-to-website': ['go to', 'open', 'Google', 'Facebook', 'Youtube', '.com'],
   'discard-non-active-audible-tabs': ['discard', 'close', 'non', 'no', 'active', 'audible', 'tabs', 'mute'],
   'close-current-tab': ['close', 'current', 'tab', 'this'],
   'close-last-tab': ['close', 'last', 'tab', 'previous'],
   'close-first-tab': ['close', 'first', 'tab'], 
   'close-past-tabs': ['close', 'past', 'tab'],
   'close-recent-tabs': ['close', 'recent', 'tab'],
   'close-previous-tab': ['close', 'previous', 'tab'],
   'close-previous-tabs': ['close', 'previous', 'tabs'],
   'close-next-tab': ['close', 'next', 'tab'],
   'close-next-tabs': ['close', 'next', 'tabs'],
   'close-specific-tab': ['close', 'specific', 'tab'],
   'close-specific-tabs': ['close', 'discard', 'tabs'],
   'memory-save': ['memory', 'save', 'reduce']
  }
saveBayes();
console.log('Bayes attempted to save');