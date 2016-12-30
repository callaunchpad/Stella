var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

$(window).load(function() {
  setTimeout(function() {
    responseMessage("Hello, I'm Stella! Ask me anything.");
  }, 100);
});

function updateScrollbar() {
  $messages.scrollTop($messages[0].scrollHeight);
}

function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') return false;
  $('<div class="message message-personal">' + msg + '</div>').appendTo($messages).addClass('new');
  $('.message-input').val(null);
  updateScrollbar();
}

function responseMessage(message) {
  $('<div class="message loading new"><figure class="avatar"><img src="public/img/stella.png" /></figure><span></span></div>').appendTo($messages);
  updateScrollbar();

  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="public/img/stella.png" /></figure>' + message + '</div>').appendTo($messages).addClass('new');
    updateScrollbar();
  }, 1000);

}
