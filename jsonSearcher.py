import json

raw_thesaurus = open("jsonThesaurus.txt")
thesaurus = []


#entries will have the format: {'synonyms': [...], word': "..."}
for entry in raw_thesaurus.readlines():
	thesaurus.append(json.loads(entry))


raw_thesaurus = open("jsonThesaurus.txt")


#invokes binary search to find key in thesaurus which is now a list of json objects
def finder(thesaurus, key):
	"""
	@author[Michael Fan]
	@param[thesaurus]: a list of json objects that represents entries in a thesaurus.
	@param[key]: the string to search for in the thesaurus
	@returns[]: redirects to binary search
    """
	small = 0
	big = len(thesaurus) - 1
	return binarySearch(thesaurus, key, small, big)


#does a binary search to return the json entry with 'word' = key
def binarySearch(thesaurus, key, small, big):
	"""
	@author[Michael Fan]
	@param[thesaurus]: a list of json objects that represents entries in a thesaurus.
	@param[key]: the string to search for in the thesaurus
	@param[small]: lower bound index for binary search
	@param[big]: upper bound index for binary search
	@returns[json/string]: if the thesaurus entry matching key is found, return the json entry else return "not found"
	"""
	while small <= big:
		middle = (small + big)//2
		if thesaurus[middle]['word'] == key:
			return thesaurus[middle]
		elif thesaurus[middle]['word'] > key:
			big = middle - 1
		else:
			small = middle + 1

	return "not found"


#takes in a json object 'jsonEntry' and a list 'bayesBank' which contains the training words recognized by the classifier
def find_synonym(jsonEntry, bayesBank):
	"""
	@author:[Michael Fan]
	@param[jsonEntry]: a thesaurus entry saved as a json object
	@param[bayesBank]: a bank of words that are currently recognized by the bayes classifer
	@returns[string]: returns a synonym found in the bayesBank else "not found"
	"""
	synonyms = jsonEntry['synonyms']
	bank = set(bayesBank)
	for s in synonyms:
		if s in bank:
			return s
	return "not found"


#main function to be called by Hank O'Brien's ajax call
def main(key, bayesBank):
	"""
	@author:[Michael Fan]
	@param[key]: word to be searched for in the thesaurus
	@param[bayesBank]: a bank of words that are currently recognized by the bayes classifer
	@return[string]: the synonym that was matched against the bayesBank or "not found" if not found
	"""
    entry = finder(thesaurus, key)
    if entry == "not found":
    	return "not found"
    bank = set(bayesBank)
    return find_synonym(entry, bank)

# if __name__ == "__main__":
#     main()



#tests
# entry = finder(thesaurus, "assist")
# bayesBank = ["help"]
# print find_synonym(entry, bayesBank)
