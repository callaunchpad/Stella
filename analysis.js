// var request = {
//   config: {
//     encoding: 'LINEAR16',
//     sampleRate: 16000
//   },
//   singleUtterance: false,
//   interimResults: false,
//   verbose: true
// };
//
// fs.createReadStream('./system-test/data/bridge.raw')
//   .on('error', console.error)
//   .pipe(speech.createRecognizeStream(request))
//   .on('error', console.error)
//   .on('data', function(data) {
//     log(data);
//     // The first "data" event emitted might look like:
//     //   data = {
//     //     endpointerType: Speech.endpointerTypes.START_OF_SPEECH,
//     //     results: [],
//     //     ...
//     //   }
//
//     // A later "data" event emitted might look like:
//     //   data = {
//     //     endpointerType: Speech.endpointerTypes.END_OF_AUDIO,
//     //     results: [],
//     //     ...
//     //   }
//
//     // A final "data" event emitted might look like:
//     //   data = {
//     //     endpointerType:
//     //       Speech.endpointerTypes.ENDPOINTER_EVENT_UNSPECIFIED,
//     //     results: [
//     //       {
//     //         transcript: "how old is the Brooklyn Bridge",
//     //         confidence: 88.15
//     //       }
//     //     ],
//     //     ...
//     //   }
//   });
