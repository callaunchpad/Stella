function answerQuestion(text) {
  Debug.log('Searching Google for ' + text);
  tts.say('Searching Google for ' + text);
  googleSearch(text);
}

function googleSearch(text) {
  var endingPhrase = 'on google'
  var searchPhrases = ['look up ', 'search up ', 'search ', 'google ', 'find ']
  var query = text
  for (var i = 0; i < searchPhrases.length; i++) {
    if (text.contains(searchPhrases[i])) {
      query = query.replace(searchPhrases[i], '');
      break;
    }
  }
  query = query.replace(endingPhrase, '')
  var url = 'http://google.com/search?q=' + query;
  Tabs.openNew(url, function(tab) {
    Debug.log("Searched Google for " + query);
    chrome.tabs.executeScript(null, { file: "api/dom/preview.js" }, function(result) {
      Debug.log("Previews Google feature text");
    });
  });
}

function youtubeSearch(text) {
  if (text.contains("stella")){
    text = text.replace("stella", "")
  }
  var playPhrases = ["play a video of ", "play the song ", "play some ", "play ", "find ", "look up "];
  var endingPhrase = "on youtube"
  var playVideo = false;
  for (var i = 0; i < playPhrases.length; i++) {
    if (text.contains(playPhrases[i])) {
      text = text.replace(playPhrases[i], "");
      if (playPhrases[i].contains('play')) {
        playVideo = true;
      }
      break;
    }
    Debug.log(text);
  }
  text = text.replace(endingPhrase, "")
  var query = text;
  var url = 'http://youtube.com/search?q=' + query;
  Tabs.openNew(url, function(tab) {
    Debug.log("Searched Youtube for " + query);
    if (playVideo) {
      Click.youtube(true, null)
    }
    // if (!custom) Click.youtube(true, null);
    // else Click.youtube(false, custom);
  });
}

function requestSearch(text, engine) {
  //strip Stella from text
  text = text.replace(TRIGGER_NAME+' ', '');
  var textArr = text.split(" ");
  var query = '';
  Debug.log(textArr);
  if (textArr[0] == "look" && textArr[1] == "up") {
    query = text.replace("look up", "");
  } else if (textArr[0] == "search") {
    if (textArr[1] == "for") {
      query = text.replace("search for", "");
    } else if (textArr[2] == "for") {
      textArr.splice(0,3);
      query = textArr.join(" ");
    } else if (textArr[3] == "up") {
      query = text.replace("search up", "");
    } else {
      query = text.replace("search", "");
    }
  } else if (textArr[0] == "google") {
    query = text.replace("google", "");
  } else if (textArr[0] == "youtube") {
    query = text.replace("youtube", "");
  }
  Debug.log("Parsed query: " + query);
  if (engine == "youtube") youtubeSearch(text, query)
    else googleSearch(query);
}

API.Search = {
  answerQuestion: answerQuestion,
  googleSearch: googleSearch,
  youtubeSearch: youtubeSearch,
  requestSearch: requestSearch
}
