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
