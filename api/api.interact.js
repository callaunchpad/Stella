function handleLinkClick(text) {
  var content = text.replace("click on the link that says ", "");
  content = content.replace("click the link that says ", "");
  content = content.replace("click on the link that contains ", "");
  content = content.replace("click the link that contains ", "");
  console.log("Trying to click on link containing:" + content);
  Click.refLink(content);
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
    handleLinkClick: handleLinkClick
  }
}
