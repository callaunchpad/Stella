function answerQuestion(text) {
  log('Searching Google for ' + text);
  tts.say('Searching Google for ' + text);
  googleSearch(text);
}

function googleSearch(query) {
  var url = 'http://google.com/search?q=' + query;
  Tabs.openNew(url, function(tab) {
    log("Searched Google for " + query);
    chrome.tabs.executeScript(null, { file: "dom/preview.js" }, function(result) {
      console.log("Previews Google feature text");
    });
  });
}

function youtubeSearch(text, custom) {
  var playPhrases = ["play a video of ", "play the song ", "play some ", "play "];
  for (var i = 0; i < playPhrases.length; i++) {
    if (text.contains(playPhrases[i])) text = text.replace(playPhrases[i], "");
    console.log(text);
  }
  var query = text;
  var url = 'http://youtube.com/search?q=' + query;
  Tabs.openNew(url, function(tab) {
    log("Searched Youtube for " + query);
    if (!custom) Click.clickYoutube(true, null);
    else CLick.clickYoutube(false, custom);
  });
}

function requestSearch(text, engine) {
  var textArr = text.split(" ");
  var query = '';
  console.log(textArr);
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
  if (engine == "youtube") youtubeSearch(text, query)
    else googleSearch(query);
}

API.Search = {
  answerQuestion: answerQuestion,
  googleSearch: googleSearch,
  youtubeSearch: youtubeSearch,
  requestSearch: requestSearch
}
