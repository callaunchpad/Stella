var natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    stemmer = natural.PorterStemmer,
    randomstring = require('randomstring'),
    AWS = require('aws-sdk');
AWS.config.update({
  "accessKeyId": "AKIAILJWVKYWDZXIMDSA",
  "secretAccessKey": "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",
  "region": "us-east-1"
});
var s3 = new AWS.S3();


function tokenizeAndStem(command) {
  natural.PorterStemmer.attach();
  return command.tokenizeAndStem();
}
function tokenizeThenStem(command) {
  var tokenized = tokenizer.tokenize(command);
  var tokens = [];
  for(i=0; i<tokenized.length; i++){
    var val = customStem(tokenized[i]);//stemmer.stem(tokenized[i]);
    if(val != '')
      tokens.push(val);
  }
  return tokens;
}

/*
Some special keywords may contain more useful information when they're not stemmed
or when they're stemmed another way. Put all those words and in specialWords, and 
use customStem for stemming.
*/
function customStem(text){
/*
Stems normally, excpet for words that are in specialWords.
*/
  if(text in specialWords){
    return specialWords[text];
  }
  else{
    return stemmer.stem(text);
  }
}

var specialWords = {
/*
special key words that require custom stemming
key is the original key word, value is the custom stem
*/
  'tabs' : 'tabs',
  "Google": "google",
  "YouTube": "youtube"
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
  'open-documentation': ['open', 'start', 'menu', 'docs', 'documentation', 'help', 'can', 'do', 'function', 'operate'],
  'close-documentation': ['close', 'exit', 'menu', 'docs', 'documentation', 'help'],
  'focus': ['wake', 'up', 'hello', TRIGGER_NAME],
  'sleep': ['exit', 'die', 'sleep', 'off', 'turn', 'power', 'bye', TRIGGER_NAME],
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
  'google': ['google', 'online', 'search'],
  //youtube search
  'youtube-search': ['play', 'video', 'youtube']
  //answerQuestion
};

var interactActionMap = {
  'scroll-up': API.Interact.Scroll.medUp,
  'scroll-down': API.Interact.Scroll.medDown,
  'scroll-up-a-little': API.Interact.Scroll.littleUp,
  'scroll-down-a-little': API.Interact.Scroll.littleDown,
  'scroll-up-a-lot': API.Interact.Scroll.bigUp,
  'scroll-down-a-lot': API.Interact.Scroll.bigDown,
  'click-link': API.Interact.Click.handleLink,
  'type': API.Interact.Type.handleTextbox
};


var interactActionCommands = {
  'scroll':['scroll', 'go', 'show', 'move', 'up', 'above', 'higher', 'down', 'below', 'lower'],
  'click-link': ['click', 'link'],
  'type': ['type', 'box', 'input']
};

var scrollActionDirections = {
  '-up': ['up', 'above', 'higher'],
  '-down':['down', 'below', 'lower']
};

var scrollActionModifiers = {
  '-a-little': ['little', 'bit', 'tiny', 'tad', 'slightly'],
  '-a-lot': ['lot', 'ton', 'way', 'bunch', 'large'],
  '': ['medium', 'decent', 'normal']
};

//determine scroll function
function determineScroll(action, text, tokens){
  //right now all scroll functions map to 'scroll-down-a-little'.
  //experimenting to fix this issue
  if(action != 'scroll') return action;

  var direction = scrollDirClassifier.classify(tokens);
  var modifier = scrollModClassifier.classify(tokens);
  return action+direction+modifier;



}

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
  'refresh-yourself': ['refresh', 'reload', 'reset', 'you', 'yourself'],
};

var tabActionMap ={
  'open-empty-tab': API.Tabs.openEmptyTab,
  'reopen-tabs': API.Tabs.reopenTabs,
  'open-specific-tab': API.Tabs.openSpecificTab,
  'go-to-website': API.Tabs.goToWebsite,
  'discard-non-active-audible-tabs': API.Tabs.discardNonActiveAudibleTabs,
  'close-current-tab': API.Tabs.closeCurrentTab,
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

var closeTabNoNumCommands = {
/*
No numbers in text
*/
  'close-current-tab': ['current', 'tab', 'this'],
  'close-last-tab': ['last', 'tab', 'previous'],
  'close-first-tab': ['first', 'tab'],
  // 'close-past-tabs': ['past', 'tab'],
  'close-recent-tabs': ['recent', 'tab'],
  'close-previous-tab': ['previous', 'tab'],
  // 'close-previous-tabs': ['previous', 'tabs'],
  'close-next-tab': ['next', 'tab']
  // 'close-next-tabs': ['next', 'tabs'],
  // 'close-specific-tab': ['specific', 'tab'],
  // 'close-specific-tabs': ['tabs']
}

var closeTabOneNumCommands ={
  'close-past-tabs': ['past', 'tabs'],
  'close-specific-tab': ['tab', 'numplace'],
  'close-previous-tabs': ['previous', 'tabs'],
  'close-next-tabs': ['next', 'tabs']
}
function determineCloseTab(action, text, tokens){
  if (action!= 'close') return action;

  num = textTonums(text); //get any specific numbers
  console.log(num);
  if(num.length > 2){ //if more than two numbers, can't do that
    tts.say('Please either specify a specific tab or a range of tabs to close.');
    return null;
  }
  else if(num.length == 2){
    return 'close-specific-tabs';
  }   
  else if(num.length == 1){
    var tks = replaceNum(tokens);
    action = closeTabOneNumClassifier.classify(tks);
    console.log(action);
    return action;
  }
  else{
    action = closeTabNoNumClassifier.classify(tokens);
    console.log(action);
    return action;
  }
}

function replaceNum(tokens){
  var tks = [];
  for (var i = 0; i < tokens.length; i++){
    if(textTonum(tokens[i]) != 0){
      tks[i] = 'numplace';
    }
    else{
      tks[i] = tokens[i];
    }
  }
  return tks;
}
var tabActionCommands = {
  'open-empty-tab': ['open', 'new', 'tab', 'empty', 'another', 'other'],
  'reopen-tabs': ['reopen', 'last', 're-open', 'open', 'previous', 'tabs'],
  'open-specific-tab': ['go to', 'open', 'go to the', 'tab'],
  'go-to-website': ['go', 'to', 'open', 'visit', 'w', 'dot', 'com', 'org', 'net', 'Google', 'Facebook', 'Youtube'],
  'discard-non-active-audible-tabs': ['discard',  'non', 'no', 'active', 'audible', 'audio', 'sound', 'noise', 'tab'],
  'close': ['close', 'remove', 'delete', 'tab', 'exit', 'dispose', 'discard', 'tabs'],
  'memory-save': ['memory', 'save', 'reduce']
};

var textParameterCommands = [
  //search
  'API.Search.youtubeSearch',
  'API.Search.answerQuestion',
  //tab
  'API.Tabs.reopenTabs',
  'API.Tabs.openSpecificTab',
  'API.Tabs.goToWebsite',
  'API.Tabs.closePastTabs',
  'API.Tabs.closeRecentTabs',
  'API.Tabs.closePreviousTabs',
  'API.Tabs.closeNextTabs',
  'API.Tabs.closeSpecificTab',
  'API.Tabs.closeSpecificTabs',
  //core 
  'API.Core.toggleContinuousAnalysis',
  //interact
  'API.Interact.Click.handleLink',
  'API.Interact.Type.handleTextbox',
  //none for browser
]

var questionIndicators = {
  'question' : ["are", "who", "what", "when", "where", "why", "will", "how", "whom", "whose", "which", "is", "did", "can", "could", "would", "may"]
}
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
var questionClassifier = trainNaiveBayes(questionIndicators);
var searchClassifier = trainNaiveBayes(searchActionCommands);
var tabClassifier = trainNaiveBayes(tabActionCommands);
var otherClassifier = trainNaiveBayes(commandMap);
var closeTabOneNumClassifier = trainNaiveBayes(closeTabOneNumCommands);
var closeTabNoNumClassifier = trainNaiveBayes(closeTabNoNumCommands);
//scroll functions
var scrollDirClassifier = trainNaiveBayes(scrollActionDirections);
var scrollModClassifier = trainNaiveBayes(scrollActionModifiers);

function isQuestion(text){
  return questionClassifier.classify(text);
}
console.log(tabClassifier.classify(['new', 'tab']));

function storeSpeechInS3(text) {
    var key = randomstring.generate(10);
    var params = {
        Bucket: 'launchpad.stella',
        Key: `speech/${key}.txt`,
        Body: text,
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);              // a successful response
    });
}

module.exports = {
  searchClassifier, tabClassifier, otherClassifier, tokenizeAndStem,
  tabActionMap, searchActionMap, functionMap, tokenizeThenStem,
  determineScroll, storeSpeechInS3, questionClassifier, determineCloseTab
};