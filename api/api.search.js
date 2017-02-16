function answerQuestion(text) {
  Debug.log('Searching Google for ' + text);
  tts.say('Searching Google for ' + text);
  googleSearch(text);
}

function googleSearch(query) {
  var url = 'http://google.com/search?q=' + query;
  Tabs.openNew(url, function(tab) {
    Debug.log("Searched Google for " + query);
    chrome.tabs.executeScript(null, { file: "api/dom/preview.js" }, function(result) {
      Debug.log("Previews Google feature text");
    });
  });
}

function youtubeSearch(text, custom) {
  var playPhrases = ["play a video of ", "play the song ", "play some ", "play "];
  var playVideo = false;
  for (var i = 0; i < playPhrases.length; i++) {
    if (text.contains(playPhrases[i])) {
      custom = text.replace(playPhrases[i], "");
      playVideo = true;
    }
    Debug.log(text);
  }
  var query = custom;
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
