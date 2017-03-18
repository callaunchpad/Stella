
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();
console.log(tokenizer.tokenize("your dog has fleas."));


//build key word set
//raw string
//aggressive stem
//metaphone phonetics
//N-gram
//for each n-gram test similarity to keywords

natural.PorterStemmer.attach();

var coreWords = {"HLP":1, "AST":1, "TKMNTXN":1, "SLP":1, "KT":1, "KNTNS":1, "ANLS":1}; //help, assist, documentation, sleep, quiet, continuous, analysis
var searchWords = {"SRX":2, "LK":2, "KKL":2, "ATP":2}; //search, look, google, youtube
var interactWords = {"SKL":3, "KLK":3}; //scroll, click
var browserWords = {"PK":4, "FRRT":4, "RFRX":4};//back, forward, refresh
var tabWords = {"TP":5};//tab


function phonemifyAndTrigger(final_transcript) {
    Debug.log(final_transcript);

    var tokenizer = new natural.WordTokenizer();
    var tokenList = tokenizer.tokenize(final_transcript);

    var metaphone = natural.DoubleMetaphone;

    function toPhoneme(curr, index, arr) {
        arr[index] = metaphone.process(curr);
    }

    tokenList.forEach(toPhoneme);

    var concatList = [];
    var i;

    for (i = 0; i < tokenList.length; i++) {
        var j = 0;
        for (j = 0; j < 2; j++) {
            concatList.push(tokenList[i][j])
        }
    }

    // Debug.log("help phonemes: " + apiWords);
    Debug.log("token phonemes: " + concatList);
    
    // var NGrams = natural.NGrams;
    //number of words per ngram  = 2
    // var nGramSet = NGrams.ngrams(concatList.join(" "), 2);

    if (setContainsListMember(concatList, coreWords)) {
        evaluateCoreExp(concatList);
    } else if (setContainsListMember(concatList, searchWords)) {
        evaluateSearchExp(concatList);
    } else if (setContainsListMember(concatList, interactWords)) {
        evaluateInteractExp(concatList);
    } else if (setContainsListMember(concatList, browserWords)) {
        evaluateBrowserExp(concatList);
    } else if (setContainsListMember(concatList, tabWords)) {
        evaluateTabExp(concatList);
    }

}

function evaluateCoreExp(concatList) {
    //open and close documentation
    var helpWords = {"HLP":1, "AST":1, "TKMNTXN":1};
    var focusWords = {"HL":2}; //hello
    var sleepWords = {"SLP":3}; //sleep
    var quietWords = {"KT":4, "SHT":4, "STP":4}; //quiet, shut, stop

    Debug.log(concatList);

    if (hasSimilarity(concatList, helpWords)) {
        if (hasSimilarity(concatList, {"KLS":5}))
            API.Core.closeDocumentation();
        else
            API.Core.openDocumentation();
    } else if (hasSimilarity(concatList, focusWords)) {
        API.Core.focus();
    } else if (hasSimilarity(concatList, sleepWords)) {
        API.Core.goToSleep();
    } else if (hasSimilarity(concatList, quietWords)) {
        API.Core.stopSpeaking();
    }
}

function evaluateSearchExp(concatList) {
    return null;
}

function evaluateInteractExp(concatList) {
    return null;
}

function evaluateBrowserExp(concatList) {
    return null;
}

function evaluateTabExp(concatList) {
    return null;
}


function stringDistance(str1, str2){
    natural = require('natural');
    Debug.log("str1: " + str1 + " str2: " + str2);
    jwDistance = natural.JaroWinklerDistance(str1, str2);
    return jwDistance;
}

function setContainsListMember(lst, dict) {
    var i = 0;
    for (i = 0; i < lst.length; i++) {
        if (lst[i] in dict) {
            return true;
        }
    }
    return false;
}

function hasSimilarity(commandWords, apiWords){
    // Debug.log("apiWords: " + Object.keys(apiWords)[0]);
    // Debug.log("commandWords: " + commandWords);
    // Debug.log("api length: " + Object.keys(apiWords).length + " ###words length: " + commandWords.length);
    var counter = 0;
    for(var i = 0; i < Object.keys(apiWords).length; i++){
        for(var j = 0; j < commandWords.length; j++){
            if(stringDistance(Object.keys(apiWords)[i], commandWords[j]) > 0.85){
                Debug.log("Similarity found between " + apiWords[i] + " and " + commandWords[j]);
                counter++;
            }
        }
    }

    if (counter > 0) {
        return true;
    }
    
    Debug.log("No similarity");
    return false;
}

function applyProfile(query, profile){
    //profile is dictionary mapping previously unknown words to works we know, e.g. assist -> help
    var tokens = tokenize(query);
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i] in profile){
            tokens[i] = profile[tokens[i]];
        }
    }
    return tokens;
}


module.exports = {
    phonemifyAndTrigger: phonemifyAndTrigger
};