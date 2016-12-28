var feature = document.getElementsByClassName("g mnr-c g-blk");

if (feature.length > 0) {
  var featureText = feature[0].innerText;
  console.log(featureText);
  chrome.runtime.sendMessage({speechText: featureText}, function() {});
}
