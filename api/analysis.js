var learnedWordMapping = {};

function takeAction(text) {
  text = text.toLowerCase();
// <<<<<<< HEAD
//   text = text.toLowerCase().remove(TRIGGER_NAME + " ");
//   natural.phonemifyAndTrigger(text);
// }

// =======
  var tokens = natural.tokenizeThenStem(text);


    if(tokens.length == 0){ //if there is no command, just dont do anything
    return;
  }
  // var action;
  console.log(natural.initialFilter);
  for(var i = 0; i < tokens.length; i +=1){
      if(tokens[i] == "youtub"){
        tokens[i] = "youtube";
        continue
      }
      if(tokens[i] == 'googl'){
        tokens[i] = 'google'
      }
  }
  tokens = applyUnknownWordMapping(tokens, learnedWordMapping);
  //TODO: read in all training words from json file and send pass this function
  // buildUnknownWordMapping(tokens, )
  console.log(tokens);
  command_category = natural.initialFilterClassifier.classify(tokens);
  console.log('Command is:' + command_category);
  tuple = natural.initialFilterMap[command_category];
  console.log(tuple);
  actionMap = tuple['map'];
  classifier = tuple['classifier'];
  var action = classifier.classify(tokens);
  action = parseAction(action, command_category, text, tokens);
  console.log('Action is:' + action);
  actionMap[action](text);
  // if (text.contains('tab')) {
  //   var action = natural.tabClassifier.classify(tokens);
  //   natural.tabActionMap[action]();
  // } else if (text.contains('search') || text.contains('look up') || text.contains('play')) {
  //   var action = natural.searchClassifier.classify(tokens);
  //   console.log(action);
  //   natural.searchActionMap[action](text);
  // } else {
  //   var action = natural.otherClassifier.classify(tokens);
  //   action = natural.determineScroll(action, text, tokens);
  //   console.log('action is : '+action);
  //   natural.functionMap[action](text.replace(TRIGGER_NAME, '').trimLeft().trimRight());
  // }
}


/**
 * given a user query string, this function tokenizes the query and replaces words in the query
 * that we have previously established as having a mapping in bayes set
 * @author Hank O'Brien
 * @param tokens user's tokenized query string
 * @param thesaurusMapping dictionary which maps previously unknown words to known words in the bayes set
 * @returns the tokenized query with all 'learned' words replaced with their known counterpart
 */
function applyUnknownWordMapping(tokens, thesaurusMapping){
    //profile is dictionary mapping previously unknown words to works we know, e.g. assist : help
    // var tokens = tokenizeThenStem(query);
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i] in thesaurusMapping){
            //if we've already had to look up the word in the thesaurus,
            // we should just replace it on all future queries
            tokens[i] = thesaurusMapping[tokens[i]];
        }
    }
    return tokens;
}

/**
 * If an important word in the search query is not in the naive bayes training set
 * then we query the thesaurus to find related words. if a word is found that's related, we add
 * a dictionary entry that establishes the mapping for future uses of the word
 * @author Hank
 * @param tokens a list of important/relevant words from the search query
 * @param trainingSet the set of words the naive bayes classifier was trained with
 */
function buildUnknownWordMapping(tokens, trainingSet){
    for(var i = 0; i < tokens.length; i++){
        var unknownWord = tokens[i];
        if(!trainingSet.contains(unknownWord) && !ignoredWords.contains(unknownWord)){
            Debug.log('thesaurus was queried');
            var synonym = thesaurus.query(unknownWord, trainingSet);
            //if we didn't find a synonym, log that none was found
            if(synonym === 'not found'){
                Debug.log('no synonym found for word: ' + unknownWord);
            } else {
                learnedWordMapping[unknownWord] =  synonym;
                tokens[i] = synonym;
            }
        }
    }

}

function parseAction(action, command_category, text, tokens) {
  console.log('Now in parseAction');
  if (command_category == 'tabActionCommands'){
    return natural.determineTab(action, text, tokens)
  } else if (command_category == 'interactActionCommands') {
    return natural.determineScroll(action, text, tokens)
  } else {
    return action
  }
}

function checkQuestion(text, tokens){ //this is disgusting
/**
  Hardcoded way to determine if a given command is a question.
  Most likely not to be used.
  @author Arsh Zahed
  @param text -- text to check for question
  @param token -- tokens to use for checking if there is a question.
  @return boolean -- true if question. false if not
**/
  return !text.contains('you') && (tokens.length>1 && (tokens[1].isQuestion()) || 
    (tokens.indexOf('stella') < tokens.length - 1 && tokens[tokens.indexOf('stella') + 1].isQuestion()))
}

function getQuestion(text){//agh so hardcoded
/**
  Hardcoded way to snip the question from a given command (should be known
  the command is a question at this point).
  Most likely will not be used
  @author Arsh Zahed
  @param text -- text to use to get the question from
  @return string -- the question in the command.
**/
  var loc = text.indexOf('stella');
  if(loc<text.length/2){//if stella is less than half way into text, question is probably second part
    return text.substring(loc+6).trimLeft();
  }//else the question is the first part
  return text.substring(0, loc);
}

// function oldTakeAction(text) {
//   text = text.toLowerCase();
//   var didAction = doCoreAction(text);
//   text = text.toLowerCase().remove(TRIGGER_NAME + " ");
//   if (!didAction) didAction = doInteractAction(text);
//   if (!didAction) didAction = doBrowserAction(text);
//   if (!didAction) didAction = doSearchAction(text);
//   if (!didAction) didAction = doTabAction(text);
// }

// function doCoreAction(text) {
//   if (text.contains("what can you do") || text.contains("open help menu") || text.contains("open help")) {
//     API.Core.openDocumentation(); return true;
//   } else if (text.contains("close help menu") || text.contains("close help")) {
//     API.Core.closeDocumentation(); return true;
//   } else if (text.contains("hello " + TRIGGER_NAME)) {
//     API.Core.focus(); return true;
//   } else if (text.contains(TRIGGER_NAME + " go to sleep")) {
//     API.Core.goToSleep(); return true;
//   } else if (text.contains("continuous analysis")) {
//     API.Core.toggleContinuousAnalysis(text); return true;
//   } else if (text.contains("be quiet") || text.contains("stop speaking") || text.contains("shut up")) {
//     API.Core.stopSpeaking(); return true;
//   }
//   return false;
// }

// function doSearchAction(text) {
//   Debug.log(text);
//   if (!text.contains("youtube") && (text.contains("search") || text.contains("look up") || text.contains("google"))) {
//     API.Search.requestSearch(text, "google"); return true;
//   } else if (!text.contains("google") && (text.contains("search") || text.contains("look up") || text.contains("youtube"))) {
//     API.Search.requestSearch(text, "youtube"); return true;
//   } else if (text.contains("play")) {
//     API.Search.youtubeSearch(text); return true;
//   } else if (text.isQuestion()) {
//     API.Search.answerQuestion(text); return true;
//   }
//   return false;
// }

// function doInteractAction(text) {
//   if (text.contains("scroll up a little")) {
//     API.Interact.Scroll.littleUp(); return true;
//   } else if (text.contains("scroll up a lot") || text.contains("scroll up alot")) {
//     API.Interact.Scroll.bigUp(); return true;
//   } else if (text.contains("scroll up") || text.contains("scroll up more")) {
//     API.Interact.Scroll.medUp(); return true;
//   } else if (text.contains("scroll down a little")) {
//     API.Interact.Scroll.littleDown(); return true;
//   } else if (text.contains("scroll down a lot") || text.contains("scroll down alot")) {
//     API.Interact.Scroll.bigDown(); return true;
//   } else if (text.contains("scroll down") || text.contains("scroll down more")) {
//     API.Interact.Scroll.medDown(); return true;
//   } else if (text.contains("click on the link that contains") || text.contains("click the link that contains") || text.contains("click on the link that says") || text.contains("click the link that says")) {
//     API.Interact.Click.handleLink(text); return true;
//   } else if (text.contains("type") && (text.contains("in the box") || text.contains("in box") || text.contains("in the input") || text.contains("in input"))) {
//     API.Interact.Type.handleTextbox(text); return true;
//   }
//   return false;
// }

// function doBrowserAction(text) {
//   if (text.contains("go back")) {
//     API.Browser.Window.back(); return true;
//   } else if (text.contains("go forward")) {
//     API.Browser.Window.forward(); return true;
//   } else if (text.contains("refresh the page") || text.contains("refresh page")) {
//     API.Browser.Window.refresh(); return true;
//   } else if (text.contains("refresh yourself") || text.contains("reset")) {
//     API.Browser.Window.refreshApp(); return true;
//   }
//   return false;
// }

// function doTabAction(text) {
//   if (text.contains("open a new tab") || text.contains("open another tab")) {
//     API.Tabs.openEmptyTab(); return true;
//   } else if ((text.contains("reopen the last ") || text.contains("re-open the last ") || text.contains("open the last ")) && text.contains("tabs")) {
//     API.Tabs.reopenTabs(text); return true;
//   } else if ((text.contains("open the ") && text.contains("tab")) || text.contains("go to the ") && text.contains("tab")) {
//     API.Tabs.openSpecificTab(text); return true;
//   } else if (text.contains("go to ") || text.contains("open ")) {
//     API.Tabs.goToWebsite(text); return true;
//   } else if (text.contains("mute all audible tabs") || text.contains("close all audible tabs") || text.contains("stop all audible tabs")) {
//     API.Tabs.discardNonActiveAudibleTabs(); return true;
//   } else if (text.contains("close the current tab") || text.contains("close this tab")) {
//     API.Tabs.closeCurrentTab(); return true; // If not voice web
//   } else if (text.contains("close the last tab") || text.contains("close last tab")) {
//     API.Tabs.closeLastTab(); return true; // If not voice web
//   } else if (text.contains("close the first tab") || text.contains("close first tab")) {
//     API.Tabs.closeFirstTab(); return true; // If not voice web
//   } else if (text.contains("close the first") && text.contains("tabs")) {
//     API.Tabs.closePastTabs(text); return true; // If not voice web
//   } else if (text.contains("close the last") && text.contains("tabs")) {
//     API.Tabs.closeRecentTabs(text); return true; // If not voice web
//   } else if (text.contains("close the previous tab") || text.contains("close previous tab")) {
//     API.Tabs.closePreviousTab(); return true; // If not voice webclose
//   } else if (text.contains("close the previous") && text.contains("tabs")) {
//     API.Tabs.closePreviousTabs(text); return true; // If not voice web
//   } else if (text.contains("close the next tab") || text.contains("close next tab")) {
//     API.Tabs.closeNextTab(); return true; // If not voice webclose
//   } else if (text.contains("close the next") && text.contains("tabs")) {
//     API.Tabs.closeNextTabs(text); return true; // If not voice web
//   } else if (text.contains("close the ") && text.contains("tab")) {
//     API.Tabs.closeSpecificTab(text); return true; // If not voice web
//   } else if ((text.contains("close the ") && text.contains("tabs")) || (text.contains("closed the ") && text.contains("tabs"))) {
//     API.Tabs.closeSpecificTabs(text); return true; // If not voice web
//   } else if (text.contains("enter memory save mode")) {
//     API.Tabs.discardNonActiveTabs(); return true;
//   }
//   API.Core.dontUnderstand();
//   return false;
// }
// >>>>>>> team-2
