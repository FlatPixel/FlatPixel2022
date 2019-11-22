document.addEventListener("DOMContentLoaded", function() {
  // Add key events
  window.addEventListener("keydown", event => {
    if (event.keyCode == 37) {
      rotate("show-left");
    }
    if (event.keyCode == 39) {
      rotate("show-right");
    }
  });

  // Add link event
  var giveus = document.querySelector(".give-us-a-shout");

  giveus.addEventListener("click", event => {
    rotate("show-right");
    var button = document.querySelector("#btnContact");
    active(button);
  });

  // Add buttons events
  var buttons = document.querySelectorAll("nav > ul > li > a");

  buttons.forEach(button => {
    button.addEventListener("click", event => {
      rotate(button.getAttribute("data-side"));
      active(button);
    });
  });
});

function rotate(side) {
  document.getElementById("cube").className = side;
}

function active(button) {
  var buttons = document.querySelectorAll("nav > ul > li > a");
  buttons.forEach(b => {
    b.classList.remove("active");
  });

  button.classList.add("active");
}

// Vanilla JavaScript Scroll to Anchor
// @ https://perishablepress.com/vanilla-javascript-scroll-anchor/

(function() {
  scrollTo();
})();

function scrollTo() {
  const links = document.querySelectorAll(".scroll");
  links.forEach(each => (each.onclick = scrollAnchors));
}

function scrollAnchors(e, respond = null) {
  const distanceToTop = el => Math.floor(el.getBoundingClientRect().top);
  e.preventDefault();
  var targetID = respond
    ? respond.getAttribute("href")
    : this.getAttribute("href");
  const targetAnchor = document.querySelector(targetID);
  if (!targetAnchor) return;
  const originalTop = distanceToTop(targetAnchor);
  window.scrollBy({ top: originalTop - 50, left: 0, behavior: "smooth" });
  const checkIfDone = setInterval(function() {
    const atBottom =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
    if (distanceToTop(targetAnchor) === 0 || atBottom) {
      targetAnchor.tabIndex = "-1";
      // targetAnchor.focus();
      window.history.pushState("", "", targetID);
      clearInterval(checkIfDone);
    }
  }, 100);
}
