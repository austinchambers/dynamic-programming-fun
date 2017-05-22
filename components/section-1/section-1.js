"use strict";

window.addEventListener("load", function() {
  var button1 = document.getElementById("button-1");

  var button1WasClicked = false;

  button1.addEventListener("click", function() {
    button1WasClicked = !button1WasClicked
    if (button1WasClicked) {
      button1.setAttribute("class", "btn btn-warning");
    } else {
      button1.setAttribute("class", "btn btn-danger");
    }
  });
});

