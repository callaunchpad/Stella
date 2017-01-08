function handleLink(text) {
  var content = text.replace("click on the link that says ", "");
  content = content.replace("click the link that says ", "");
  content = content.replace("click on the link that contains ", "");
  content = content.replace("click the link that contains ", "");
  console.log("Trying to click on link containing: " + content);
  Click.link(content);
}

function handleTextbox(text) {
  var phrase = text.split(" ");
  var input = phrase.slice(phrase.indexOf("type") + 1, phrase.indexOf("in")).join(" ");
  var label = "";
  if (text.contains("in box") || text.contains("in the box")) {
    label = phrase.slice(phrase.indexOf("box") + 1, phrase.length).join(" ");
  } else {
    label = phrase.slice(phrase.indexOf("input") + 1, phrase.length).join(" ");
  }
  console.log("Parsed text!");
  Type.textbox(input, label);
}

API.Interact = {
  Scroll: {
    littleUp: Scroll.littleUp,
    medUp: Scroll.medUp,
    bigUp: Scroll.bigUp,
    littleDown: Scroll.littleDown,
    medDown: Scroll.medDown,
    bigDown: Scroll.bigDown
  },
  Click: {
    handleLink: handleLink
  },
  Type: {
    handleTextbox: handleTextbox
  }
}
