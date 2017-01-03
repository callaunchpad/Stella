function Utils() {

}

Utils.prototype = {
    constructor: Utils,
    isElementInView: function (element, fullyInView) {
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = $(element).offset().top;
        var elementBottom = elementTop + $(element).height();

        if (fullyInView === true) {
            return ((pageTop < elementTop) && (pageBottom > elementBottom));
        } else {
            return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
        }
    }
};

var Utils = new Utils();

$.expr[':'].casecontains =$.expr.createPseudo(function(arg) {
  return function( elem ) {
    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});

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
