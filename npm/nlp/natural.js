
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

var helpWords = [["HLP","MN"], "assist", "documentation"];

function parseCommand(final_transcript) {
    Debug.log(final_transcript);

    // var tokenList = final_transcript.tokenizeAndStem();

    // Debug.log(tokenList);

    var tokenizer = new natural.WordTokenizer();
    var tokenList = tokenizer.tokenize(final_transcript);

    var metaphone = natural.Metaphone;

    function processWrapper(curr, index, arr) {
        arr[index] = metaphone.process(curr);
    }
    helpWords.forEach(processWrapper);
    tokenList.forEach(processWrapper);
    Debug.log("****");
    Debug.log(tokenList);
    Debug.log(helpWords);

    var NGrams = natural.NGrams;
    //number of words per ngram  = 2
    var nGramSet = NGrams.ngrams(tokenList.join(" "), 2);

    Debug.log(nGramSet);



}

module.exports = {
    parseCommand: parseCommand
};