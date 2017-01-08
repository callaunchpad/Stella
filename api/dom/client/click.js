var possibleElements = $(query);

console.log(possibleElements);

for (var i = 0; i < possibleElements.length; i++) {
  var elem = possibleElements[i];
  var elemInView = Utils.isElementInView(elem, elementInView);
  if (elemInView) {
    elem.click();
    console.log(elem);
    break;
  }
}

elementInView = null;
