function takeAction(text) {
  text = text.toLowerCase();
  text = text.toLowerCase().remove(TRIGGER_NAME + " ");
  natural.phonemifyAndTrigger(text);
}

