inputFile = open('jsonThesaurus.json', 'r')
outputFile = open('output.json', 'w')

outputFile.write('{\n')
entry = inputFile.readline()
while(entry):
    synonymsStart = entry.index('[')
    synonymsEnd = entry.index(']')
    synonyms = entry[synonymsStart : synonymsEnd+1]
    wordIndex = entry.index('\"word\":')
    word = entry[wordIndex+7:-2]
    outputFile.write(str(word) + ':' + str(synonyms))
    entry = inputFile.readline()
    if(entry):
        outputFile.write(',\n')

outputFile.write('\n}')
