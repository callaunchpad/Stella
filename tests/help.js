module.exports = {
  'Help Menu test': function (client) {
    client
      .url('')
      .setValue('input[id="message_input"]', 'open help menu')
      .click('button[type="submit"]')
      .assert.containsText('main', 'News feed')
      .end();
  }
};