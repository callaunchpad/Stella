var natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    stemmer = natural.PorterStemmer,
    randomstring = require('randomstring'),
    AWS = require('aws-sdk');

var s3 = new AWS.S3();

var key = null;
var options = {mimeType: 'video/webm;codecs=vp9'};
var mediaRecorder = null;
var recordedChunks = [];

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function startRecording() {
  key = randomstring.generate(10);
  recordedChunks = [];
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(function(stream) {
      mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.addEventListener('dataavailable', function(e) {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
        var audioContent = new File([new Blob(recordedChunks)], `${key}.webm`);
        storeAudioInS3(audioContent, key);
      });
      mediaRecorder.start();
    });
}

function stopRecording(text) {
  mediaRecorder.stop();

  storeSpeechInS3(text, key);
}

function storeSpeechInS3(text, key) {
    var params = {
        Bucket: 'launchpad.stella',
        Key: `speech/${key}.txt`,
        Body: text,
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);               // a successful response
    });
}

function storeAudioInS3(audio, key) {
    var params = {
        Bucket: 'launchpad.stella',
        Key: audio.name,
        Body: `audio/${key}.webm`,
        ContentType: audio.type,
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);               // a successful response
    });
}

function tokenizeAndStem(command) {
  natural.PorterStemmer.attach();
  return command.tokenizeAndStem();
}

function tokenizeThenStem(command) {
  /**
  Takes in a command string and returns and
  @author Arsh Zahed
  @param command -- a string of the command
  @return array -- the tokenized and stemed version of the input command
**/
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
/**
  Takes in a specific word, and checks if it is in specialWords. If so, return the corresponding
  special stem. Else, stem normally.
  @author Arsh Zahed
  @param text -- a aspecific word to be stemmed
  @return string -- the stmemmed version of the input word
**/
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
  'google': 'google',
  'youtube': 'youtube',
  'memory': 'memory',
  'audible': 'audible',
  'play': 'play'

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
  'open-documentation': ['open', 'start', 'menu', 'docs', 'documentation', 'help', 'what', 'can', 'do', 'function', 'operate'],
  'close-documentation': ['close', 'exit', 'menu', 'docs', 'documentation', 'help'],
  'focus': ['wake', 'up', 'hello'],
  'sleep': ['exit', 'die', 'sleep', 'off', 'turn', 'power', 'bye'],
  'continuous-analysis': ['analyse', 'analyze', 'continuous'],
  'stop-speaking': ['stop', 'speak', 'shut', 'up', 'quiet', 'halt', 'hold']
};

var searchActionMap = {
  // 'request-search': API.Search.requestSearch,
  'youtube-search': API.Search.youtubeSearch,
  'google-search': API.Search.googleSearch
};

var searchActionCommands = {
  //search
  // 'request-search': ['search', 'look up', 'find', 'identify'],
  // google search
  'google-search': ['google', 'online', 'what', 'when', 'who', 'how', 'where', 'on'],
  //youtube search
  'youtube-search': ['play', 'video', 'youtube', 'by', 'song', 'on',]
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


function determineScroll(action, text, tokens){
/**
  Takes in an action. If it is 'scroll' it will continue, if not it returns the action.
  If the the action is 'scroll', use the text and tokens to determine which scroll
  function is desired by using seperate Naive Bayes classifiers.
  @author Arsh Zahed
  @param action -- action to be checked
  @param text -- text to use for classification
  @param token -- tokens to use for classification
  @return string -- the modified action to be executed.
**/
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
  'close-recent-tabs': ['recent', 'tab'],
  'close-previous-tab': ['previous', 'tab'],
  'close-next-tab': ['next', 'tab']
}

var closeTabOneNumCommands ={
  'close-past-tabs': ['past', 'tabs'],
  'close-specific-tab': ['tab', 'numplace'],
  'close-previous-tabs': ['previous', 'tabs'],
  'close-next-tabs': ['next', 'tabs']
}

function determineCloseTab(action, text, tokens){
/**
  Takes in an action. If it is 'close' it will continue, if not it returns the action.
  If the the action is 'close', use the text and tokens to determine which close tab
  function is desired by using seperate Naive Bayes classifiers.
  @author Arsh Zahed
  @param action -- action to be checked
  @param text -- text to use for classification
  @param token -- tokens to use for classification
  @return string -- the modified action to be executed.
**/
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

function determineOpenTab(action, text, tokens){
/**
  Takes in an action. If it is 'open' it will continue, if not it returns the action.
  If the the action is 'open', use the text and tokens to determine which close tab
  function is desired by whether it has a number or not.
  @author Arsh Zahed
  @param action -- action to be checked
  @param text -- text to use for classification
  @param token -- tokens to use for classification
  @return string -- the modified action to be executed.
**/
  if (action!= 'open') return action;

  num = textTonums(text); //get any specific numbers
  console.log(num);
  if(num.length > 1){ //if more than two numbers, can't do that
    return null;
  }
  else if(num.length == 1){
    return 'open-specific-tab';
  }
  else{
    return 'open-empty-tab';
  }
}

function replaceNum(tokens){
/**
  Replaces any tokens that are numbers with the string, 'numplace' to make
  classification based on whether there is a number easier.
  @author Arsh Zahed
  @param token -- tokens to use for classification
  @return array -- the modified tokens.
**/
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

function determineTab(action, text, tokens){
/**
  Takes in an action and sends it to determineCLoseTab and
  determineOpenTab to classify further if necessary.
  @author Arsh Zahed
  @param action -- action to be checked
  @param text -- text to use for classification
  @param token -- tokens to use for classification
  @return string -- the modified action to be executed.
**/
  return determineCloseTab(determineOpenTab(action, text, tokens), text, tokens);
}
// NOTE: open-specific-tab can handle "go to /n-th tab" commands trained on the listed words below, except for "go to the first tab" for some reason?
var tabActionCommands = {
  'open' : ['open', 'new', 'tab', 'empty', 'another', 'other'],
  //'open-empty-tab': ['open', 'new', 'tab', 'empty', 'another', 'other'],
  'reopen-tabs': ['reopen', 'last', 're-open', 'open', 'previous', 'tabs'],
  //'open-specific-tab': ['go to', 'open', 'go to the', 'tab', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'],
  'go-to-website': ['go to', 'go', 'open', 'visit', 'w', 'dot', 'com', 'org', 'net', 'google', 'facebook', 'youtube'],
  'discard-non-active-audible-tabs': ['discard',  'non', 'no', 'active', 'audible', 'audio', 'sound', 'noise', 'tabs', 'mute'],
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


function combineKeywords(commandsDictionary){
  keywords = []
  keys = Object.keys(commandsDictionary)
  keys.forEach(function(key){
    keywords = keywords.concat(commandsDictionary[key])
  })
  return keywords
}

var initialFilter = {
  'searchActionCommands': combineKeywords(searchActionCommands),
  'coreActionCommands': combineKeywords(coreActionCommands),
  'interactActionCommands': combineKeywords(interactActionCommands),
  'browserActionCommands': combineKeywords(browserActionCommands),
  'tabActionCommands': combineKeywords(tabActionCommands)
}


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


var initialFilterMap = {
  'coreActionCommands':{
    'map': coreActionMap,
    'classifier': otherClassifier
  },
  'interactActionCommands': {
    'map': interactActionMap,
    'classifier': otherClassifier
  },
  'browserActionCommands': {
    'map': browserActionMap,
    'classifier': otherClassifier
  },
  'tabActionCommands':{
    'map': tabActionMap,
    'classifier': tabClassifier
  },
  'searchActionCommands':{
    'map': searchActionMap,
    'classifier': searchClassifier
  }
}

var initialFilterClassifier = trainNaiveBayes(initialFilter)

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
  initialFilterClassifier, searchClassifier, tabClassifier, 
  otherClassifier, tokenizeAndStem, initialFilterMap, tabActionMap, 
  searchActionMap, functionMap, tokenizeThenStem, determineScroll, 
  initialFilter, determineCloseTab, startRecording, stopRecording,
  determineTab
};
