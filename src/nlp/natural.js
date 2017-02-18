var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();
console.log(tokenizer.tokenize("your dog has fleas."));