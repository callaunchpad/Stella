function findClass(element, className) {
  var foundElement = null, found;
  function recurse(element, className, found) {
    if (found) return;
    for (var i = element.childNodes.length - 1; i >= 0; i--) {
      var el = element.childNodes[i];
      var classes = el.className != undefined? el.className.split(" ") : [];
      for (var j = 0, jl = classes.length; j < jl; j++) {
        if (classes[j] == className) {
          found = true;
          foundElement = element.childNodes[i];
          break;
        }
      }
      if(found) break;
      recurse(element.childNodes[i], className, found);
    }
  }
  recurse(element, className, false);
  return foundElement;
}

var feature = document.getElementsByClassName("g mnr-c g-blk");

if (feature.length > 0) {
  var featureText = feature[0].innerText;
  var mod = findClass(feature[0], 'mod');
  if (mod) {
    var modText = mod.innerText;
    console.log(modText);
    modText = modText.replace("More items...", "");
    chrome.runtime.sendMessage({speechText: modText}, function() {});
  } else {
    console.log(featureText);
    featureText = featureText.replace("More items...", "");
    chrome.runtime.sendMessage({speechText: featureText}, function() {});
  }
}
