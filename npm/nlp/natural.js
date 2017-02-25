
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

var coreWords = {"HLP", "AST", "TKMNTXN", "SLP", "KT", "KNTNS", "ANLS"}; //help, assist, documentation, sleep, quiet, continuous, analysis
var searchWords = {"SRX", "LK", "KKL", "ATP"};//search, look, google, youtube
var interactWords = {"SKL", "KLK"};//scroll, click
var browserWords = {"PK", "FRRT", "RFRX"};//back, forward, refresh
var tabWords = {"TP"};//tab


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

    Debug.log("help phonemes: " + apiWords);
    Debug.log("token phonemes: " + concatList);
    
    var NGrams = natural.NGrams;
    //number of words per ngram  = 2
    var nGramSet = NGrams.ngrams(concatList.join(" "), 2);

    if (setContainsListMember(concatList, apiWords)) {
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
    var helpWords = {"HLP", "AST", "TKMNTXN"};
    var focusWords = {"HL"}; //hello
    var sleepWords = {"SLP"}; //sleep
    var quietWords = {"KT", "SHT", "STP"}; //quiet, shut, stop

    if (hasSimilarity(concatList, helpWords)) {
        if (hasSimilarity(concatList, ["KLS"]))
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
    jwDistance = natural.JaroWinklerDistance(str1, str2);
    return jwDistance;
}

function setContainsListMember(lst, dict) {
    var i = 0;
    for (i = 0; i < lst.length; i++) {
        if (dict.contains(lst[i])) {
            return true;
        }
    }
    return false;
}

function hasSimilarity(commandWords, apiWords){
    var counter = 0;
    for(var i = 0; i < apiWords.length; i++){
        for(var j = 0; j < commandWords.length; j++){
            if(stringDistance(apiWords[i], commandWords[j]) > 0.85){
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


module.exports = {
    phonemifyAndTrigger: phonemifyAndTrigger;
};