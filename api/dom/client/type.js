var textboxes = $('input:attributecasecontains(placeholder,' + label + ')');
if (textboxes.length > 0) {
   var textbox = textboxes[0];
   textbox.value = input;
   true;
} else {
	var inputNumber = 1;
 	var textboxes = $('input');
 	for (var i = 0; i < textboxes.length; i++) {
 		textboxes[i].placeholder = inputNumber++;
 	}
 	false;
}
