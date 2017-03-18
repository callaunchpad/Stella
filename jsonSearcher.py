import json
raw_thesaurus = open("jsonThesaurus.txt")
thesaurus = []
for entry in raw_thesaurus.readlines():
	thesaurus.append(json.loads(entry))


raw_thesaurus = open("jsonThesaurus.txt")

#binary search to find key in thesaurus which is now a list of json objects
def finder(thesaurus, key):
	small = 0
	big = len(thesaurus) - 1
	return binarySearch(thesaurus, key, small, big)

def average(big, small):
	return (big + small)/2

def binarySearch(thesaurus, key, small, big):
	while small <= big:
		middle = (small + big)//2
		print middle
		if thesaurus[middle]['word'] == key:
			return thesaurus[middle]
		elif thesaurus[middle]['word'] > key:
			big = middle - 1
		else:
			small = middle + 1

	return "not found"


#takes in a json object 'jsonEntry' and a list 'bayesBank' which contains the training words recognized by the classifier
#will return any word in the list of synonyms found in the jsonEntry which is contained by bayesBank
def find_synonym(jsonEntry, bayesBank):
	synonyms = jsonEntry['synonyms']
	bank = set(bayesBank)
	for s in synonyms:
		if s in bank:
			return s

	return "not found"


#tests
# entry = finder(thesaurus, "assist")
# bayesBank = ["help"]
# print find_synonym(entry, bayesBank)