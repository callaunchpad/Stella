
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    stemmer = new natural.PorterStemmer();

var userProfile = {};
var ignoredWords = ['a','the','or','is','and','who'];

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
            $.ajax({
                type: "POST",
                url: "../../jsonSearcher.py",
                data: { param: unknownWord, trainingSet}
            }).done(function( o ) {
                //assuming o is a word found that matched from the JSON file
                userProfile.push({unknownWord: o});
                tokens[i] = o;
            });
        }
    }

}

/**
 * given a user query string, this function tokenizes the query and replaces words in the query
 * that we have previously established as having a mapping in bayes set
 * @author Hank
 * @param query user's raw query string
 * @param thesaurusMapping dictionary which maps previously unknown words to known words in the bayes set
 * @returns the tokenized query with all 'learned' words replaced with their known counterpart
 */
function applyUnknownWordMapping(query, thesaurusMapping){
    //profile is dictionary mapping previously unknown words to works we know, e.g. assist -> help
    var tokens = tokenizeThenStem(query);
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i] in thesaurusMapping){
            //if we've already had to look up the word in the thesaurus,
            // we should just replace it on all future queries
            tokens[i] = thesaurusMapping[tokens[i]];
        }
    }
    return tokens;
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
     Stems normally, except for words that are in specialWords.
     */
    if(text in specialWords){
        return specialWords[text];
    }
    else{
        return stemmer.stem(text);
    }
}




module.exports = {
    phonemifyAndTrigger: phonemifyAndTrigger
};


//build key word set
//raw string
//aggressive stem
//metaphone phonetics
//N-gram
//for each n-gram test similarity to keywords

// natural.PorterStemmer.attach();
//
// var coreWords = {"HLP":1, "AST":1, "TKMNTXN":1, "SLP":1, "KT":1, "KNTNS":1, "ANLS":1}; //help, assist, documentation, sleep, quiet, continuous, analysis
// var searchWords = {"SRX":2, "LK":2, "KKL":2, "ATP":2}; //search, look, google, youtube
// var interactWords = {"SKL":3, "KLK":3}; //scroll, click
// var browserWords = {"PK":4, "FRRT":4, "RFRX":4};//back, forward, refresh
// var tabWords = {"TP":5};//tab


// var specialWords = {
//     /*
//      special key words that require custom stemming
//      key is the original key word, value is the custom stem
//      */
//     'tabs' : 'tabs',
//     "Google": "google",
//     "YouTube": "youtube"
// }


// function phonemifyAndTrigger(final_transcript) {
//     Debug.log(final_transcript);
//
//     var tokenizer = new natural.WordTokenizer();
//     var tokenList = tokenizer.tokenize(final_transcript);
//
//     var metaphone = natural.DoubleMetaphone;
//
//     function toPhoneme(curr, index, arr) {
//         arr[index] = metaphone.process(curr);
//     }
//
//     tokenList.forEach(toPhoneme);
//
//     var concatList = [];
//     var i;
//
//     for (i = 0; i < tokenList.length; i++) {
//         var j = 0;
//         for (j = 0; j < 2; j++) {
//             concatList.push(tokenList[i][j])
//         }
//     }
//
//     // Debug.log("help phonemes: " + apiWords);
//     Debug.log("token phonemes: " + concatList);
//
//     // var NGrams = natural.NGrams;
//     //number of words per ngram  = 2
//     // var nGramSet = NGrams.ngrams(concatList.join(" "), 2);
//
//     if (setContainsListMember(concatList, coreWords)) {
//         evaluateCoreExp(concatList);
//     } else if (setContainsListMember(concatList, searchWords)) {
//         evaluateSearchExp(concatList);
//     } else if (setContainsListMember(concatList, interactWords)) {
//         evaluateInteractExp(concatList);
//     } else if (setContainsListMember(concatList, browserWords)) {
//         evaluateBrowserExp(concatList);
//     } else if (setContainsListMember(concatList, tabWords)) {
//         evaluateTabExp(concatList);
//     }
//
// }


// function stringDistance(str1, str2){
//     natural = require('natural');
//     Debug.log("str1: " + str1 + " str2: " + str2);
//     jwDistance = natural.JaroWinklerDistance(str1, str2);
//     return jwDistance;
// }
//
// function setContainsListMember(lst, dict) {
//     var i = 0;
//     for (i = 0; i < lst.length; i++) {
//         if (lst[i] in dict) {
//             return true;
//         }
//     }
//     return false;
// }
//
// function hasSimilarity(commandWords, apiWords){
//     // Debug.log("apiWords: " + Object.keys(apiWords)[0]);
//     // Debug.log("commandWords: " + commandWords);
//     // Debug.log("api length: " + Object.keys(apiWords).length + " ###words length: " + commandWords.length);
//     var counter = 0;
//     for(var i = 0; i < Object.keys(apiWords).length; i++){
//         for(var j = 0; j < commandWords.length; j++){
//             if(stringDistance(Object.keys(apiWords)[i], commandWords[j]) > 0.85){
//                 Debug.log("Similarity found between " + apiWords[i] + " and " + commandWords[j]);
//                 counter++;
//             }
//         }
//     }
//
//     if (counter > 0) {
//         return true;
//     }
//
//     Debug.log("No similarity");
//     return false;
// }


