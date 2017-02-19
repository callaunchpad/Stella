
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
Debug.log('init stemmer');

var test = "stemmer test x";

Debug.log(test.tokenizeAndStem());
Debug.log("stemmer".stem());

var helpWords = ["HLP", "ASST", "TKMNTXN"];



function shouldOpenHelp(final_transcript) {
    Debug.log(final_transcript);

    // var tokenList = final_transcript.tokenizeAndStem();

    // Debug.log(tokenList);

    var tokenizer = new natural.WordTokenizer();
    var tokenList = tokenizer.tokenize(final_transcript);

    var metaphone = natural.Metaphone;

    function toPhoneme(curr, index, arr) {
        arr[index] = metaphone.process(curr);
    }
    // helpWords.forEach(toPhoneme);
    tokenList.forEach(toPhoneme);
    // helpWords = [].concat.apply([], helpWords); //flattens 2D arrays DoubleMetaphone generates
    tokenList = [].concat.apply([], tokenList);

    // var helpPhonemes = [];
    // for(var i = 0; i < helpWords.length; i++){
    //     helpPhonemes.concat(metaphone.process(helpWords[i]));
    // }
    //
    // var tokenPhonemes = [];
    // for(var j = 0; i < tokenList.length; i++){
    //     tokenPhonemes.concat(metaphone.process(tokenList[j]));
    // }


    Debug.log("help phonemes");
    Debug.log(helpWords);
    Debug.log("token phonemes");
    Debug.log(tokenList);

    var NGrams = natural.NGrams;
    //number of words per ngram  = 2
    var nGramSet = NGrams.ngrams(tokenList.join(" "), 2);

    var sortedTokens = tokenList.slice().sort();
    helpWords.sort();

    Debug.log(sortedTokens);
    Debug.log(helpWords);

    return hasSimilarity(sortedTokens, helpWords);


}

function hasSimilarity(sortedWords, helpWords){
    for(var i = 0; i < helpWords.length; i++){
        if(sortedWords.indexOf(helpWords[i]) > -1){
            Debug.log("There was a similarity");
            return true;
        }
    }
    Debug.log("No similarity");
    return false;
}


module.exports = {
    shouldOpenHelp: shouldOpenHelp
};