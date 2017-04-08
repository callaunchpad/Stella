var raw_thesaurus = JSON.parse('jsonThesaurus.json');
var bs = require('binarysearch');


var thesaurus = jQuery.map(raw_thesaurus, function(value, index){
  return [value]
});

//look at 2 values to make sure boundaries between
//entries are read correctly
Debug.log('thesaurus data 0' + thesaurus[0]);
Debug.log('thesaurus data 1' + thesaurus[1]);

// raw_thesaurus = JSON.parse('jsonThesaurus');

/**
@author: adapted by [Hank O'Brien] from [Michael Fan]
@param[thesaurus]: a list of json objects that represents entries in a thesaurus.
@param[key]: the string to search for in the thesaurus
@returns[]: redirects to binary search
**/
function finder(thesaurus, key){
  var small = 0;
  var big = thesaurus.length - 1;
  return binaryDictSearch(thesaurus, key, small, big);
}

/**
@author: adapted by [Hank O'Brien] from [Michael Fan]
@param[thesaurus]: a list of json objects that represents entries in a thesaurus.
@param[key]: the string to search for in the thesaurus
@param[small]: lower bound index for binary search
@param[big]: upper bound index for binary search
@returns[json/string]: if the thesaurus entry matching key is found, return the json entry else return "not found"
**/
function binaryDictSearch(thesaurus, key, small, big){

  while(small <= big){
    var middle = (small + big)/2;
		if(thesaurus[middle]['word'] === key){
			return thesaurus[middle]
    }	else if(thesaurus[middle]['word'] > key){
			big = middle - 1
    } else{
			small = middle + 1
    }
  }
  return 'not found';
}

/**
@author: adapted by [Hank O'Brien] from [Michael Fan]
@param[jsonEntry]: a thesaurus entry saved as a json object
@param[bayesBank]: a bank of words that are currently recognized by the bayes classifer
@returns[string]: returns a synonym found in the bayesBank else "not found"
**/
function findSynonym(jsonEntry, bayesBank){
    var synonyms = jsonEntry['synonyms'];
    var bank = set(bayesBank);
    for(var i = 0; i < synonyms.length; i++) {
        var s = synonyms[i];
        if (s in bank) {
            return s;
        }
    }
    return "not found";

}

module.exports = {findSynonym : findSynonym};
