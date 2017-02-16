// jQuery Custom Pseudo Expressions

$.expr[':'].casecontains =$.expr.createPseudo(function(arg) {
  return function( elem ) {
    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});

$.expr[':'].attributecasecontains =$.expr.createPseudo(function(arg) {
  return function( elem ) {
  	args = arg.split(",");
  	if ($(elem).attr(args[0])) {
  		return $(elem).attr(args[0]).toLowerCase().indexOf(args[1]) >= 0;
  	} else {
  		return false;
  	};
  };
});

// Custom DOM Utilities

function Utils() {}
Utils.prototype = {
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