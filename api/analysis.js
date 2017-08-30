function takeAction(text) {
  text = text.toLowerCase();
  var tokens = natural.tokenizeThenStem(text);
  if(tokens.length == 0){ //if there is no command, just dont do anything
    return;
  }
  var action;
  console.log(natural.initialFilter)
  for(var i = 0; i < tokens.length; i +=1){
      if(tokens[i] == "youtub"){
        tokens[i] = "youtube";
        continue
      }
      if(tokens[i] == 'googl'){
        tokens[i] = 'google'
      }
  }
  console.log(tokens);
  command_category = natural.initialFilterClassifier.classify(tokens);
  console.log('Command is:' + command_category);
  tuple = natural.initialFilterMap[command_category]
  console.log(tuple)
  actionMap = tuple['map']
  classifier = tuple['classifier']
  var action = classifier.classify(tokens);
  action = parseAction(action, command_category, text, tokens)
  console.log('Action is:' + action)
  actionMap[action](text)
}

function parseAction(action, command_category, text, tokens) {
  console.log('Now in parseAction')
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
  Hardcorded way to determine if a given command is a question.
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
