var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();
var stemmer = natural.PorterStemmer;

function tokenizeAndStem(command) {
  natural.PorterStemmer.attach();
  return command.tokenizeAndStem();
}

var coreActionMap = {
  'open-documentation': API.Core.openDocumentation,
  'close-documentation': API.Core.closeDocumentation,
  'focus': API.Core.focus,
  'sleep': API.Core.goToSleep,
  'continuous-analysis': API.Core.toggleContinuousAnalysis,
  'stop-speaking': API.Core.stopSpeaking
};

var coreActionCommands = {
  'open-documentation': ['open', 'start', 'menu', 'docs', 'documentation', 'help'],
  'close-documentation': ['close', 'exit', 'menu', 'docs', 'documentation', 'help'],
  'focus': ['wake', 'up', 'hello', TRIGGER_NAME],
  'sleep': ['exit', 'die', 'sleep', TRIGGER_NAME],
  'continuous-analysis': ['analyse', 'analyze', 'continuous'],
  'stop-speaking': ['stop', 'speak', 'shut', 'up', 'quiet', 'halt', 'hold']
};

var searchActionMap = {
  'request-search': API.Search.requestSearch,
  'youtube-search': API.Search.youtubeSearch,
  'google-search': API.Search.googleSearch
};

var searchActionCommands = {
  //search
  'request-search': ['search', 'look up', 'find', 'identify'],
  // google search
  'google': ['google', 'online'],
  //youtube search
  'youtube-search': ['play', 'video']
  //answerQuestion
};

var interactActionMap = {
  'scroll-up': API.Interact.Scroll.medUp,
  'scorll-down': API.Interact.Scroll.medDown,
  'scroll-up-a-little': API.Interact.Scroll.littleUp,
  'scroll-down-a-little': API.Interact.Scroll.littleDown,
  'scroll-up-a-lot': API.Interact.Scroll.bigUp,
  'scroll-down-a-lot': API.Interact.Scroll.bigDown,
  'click-link': API.Interact.Click.handleLink,
  'type': API.Interact.Type.handleTextbox
};

var interactActionCommands = {
  'scroll-up': ['scroll', 'move', 'up', 'above', 'higher'],
  'scroll-down':['scroll', 'move', 'down', 'below', 'lower'],
  'scroll-up-a-little': ['scroll', 'move', 'up', 'above', 'higher', 'little', 'bit', 'tiny', 'tad', 'slightly'],
  'scroll-down-a-little':['scroll', 'move', 'down', 'below', 'lower','little', 'bit', 'tiny', 'tad', 'slightly'],
  'scroll-up-a-lot': ['scroll', 'move', 'up', 'above', 'higher','a lot', 'ton', 'way'],
  'scroll-down-a-lot':['scroll', 'move', 'down', 'below', 'lower','a lot', 'ton', 'way'],
  'click-link': ['click', 'link'],
  'type': ['type', 'box', 'input']
};

var browserActionMap = {
  'go-back': API.Browser.Window.back,
  'go-forward': API.Browser.Window.forward,
  'refresh-page': API.Browser.Window.refresh,
  'refresh-yourself': API.Browser.Window.refreshApp
};

var browserActionCommands = {
  'go-back': ['go', 'back', 'previous', 'past'],
  'go-forward': ['go', 'forward'],
  'refresh-page': ['refresh', 'reload', 'reset', 'page'],
  'refresh-yourself': ['refresh', 'reload', 'reset', 'you', 'yourself']
};

var tabActionMap ={
  'open-empty-tab': API.Tabs.openEmptyTab,
  'reopen-tabs': API.Tabs.reopenTabs,
  'open-specific-tab': API.Tabs.openSpecificTab,
  'go-to-website': API.Tabs.goToWebsite,
  'discard-non-active': API.Tabs.discardNonActiveAudibleTabs,
  'close-current-tab': API.Tabs.closeCUrrentTab,
  'close-last-tab': API.Tabs.closeLastTab,
  'close-first-tab': API.Tabs.closeFirstTab,
  'close-past-tabs': API.Tabs.closePastTabs,
  'close-recent-tabs': API.Tabs.closeRecentTabs,
  'close-previous-tab': API.Tabs.closePreviousTab,
  'close-previous-tabs': API.Tabs.closePreviousTabs,
  'close-next-tab': API.Tabs.closeNextTab,
  'close-next-tabs': API.Tabs.closeNextTabs,
  'close-specific-tab': API.Tabs.closeSpecificTab,
  'close-specific-tabs': API.Tabs.closeSpecificTabs,
  'memory-save': API.Tabs.discardNonActiveTabs
};

var tabActionCommands = {
  'open-empty-tab': ['open', 'new', 'tab', 'empty', 'another', 'other'],
  'reopen-tabs': ['reopen', 'last', 're-open', 'open', 'previous', 'tabs'],
  'open-specific-tab': ['go to', 'open', 'go to the', 'tab'],
  'go-to-website': ['go to', 'open', 'Google', 'Facebook', 'Youtube'],
  'discard-non-active-audible-tabs': ['discard', 'close', 'non', 'no', 'active', 'audible', 'tabs'],
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
};

var functionMap = Object.assign({}, coreActionMap, interactActionMap, browserActionMap);
var commandMap = Object.assign({}, coreActionCommands, interactActionCommands, browserActionCommands);

function trainNaiveBayes(commands) {
  var classifier = new natural.BayesClassifier();
    for (var key in commands) {
      //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
      if (commands.hasOwnProperty(key)) {
        classifier.addDocument(commands[key], key);
    }
  }
  classifier.train();
  return classifier;
}

var searchClassifier = trainNaiveBayes(searchActionCommands);
var tabClassifier = trainNaiveBayes(tabActionCommands);
var otherClassifier = trainNaiveBayes(commandMap);

console.log(tabClassifier.classify(['new', 'tab']));

module.exports = {
  searchClassifier, tabClassifier, otherClassifier, tokenizeAndStem, tabActionMap, searchActionMap, functionMap
};