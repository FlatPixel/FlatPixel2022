//
// Global variable
//

/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
EasingFunctions = {
  // no easing, no acceleration
  linear: (t) => t,
  // accelerating from zero velocity
  easeInQuad: (t) => t * t,
  // decelerating to zero velocity
  easeOutQuad: (t) => t * (2 - t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  // accelerating from zero velocity
  easeInCubic: (t) => t * t * t,
  // decelerating to zero velocity
  easeOutCubic: (t) => --t * t * t + 1,
  // acceleration until halfway, then deceleration
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity
  easeInQuart: (t) => t * t * t * t,
  // decelerating to zero velocity
  easeOutQuart: (t) => 1 - --t * t * t * t,
  // acceleration until halfway, then deceleration
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // accelerating from zero velocity
  easeInQuint: (t) => t * t * t * t * t,
  // decelerating to zero velocity
  easeOutQuint: (t) => 1 + --t * t * t * t * t,
  // acceleration until halfway, then deceleration
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
};

var body, main, cube, home, work;
var wheelData;
var videos = [];

var break_mobile_width = 600;
var break_mobile_height = 790;
const allExceptMobile = window.matchMedia(
  "screen and (min-width: " +
    (break_mobile_width + 1) +
    "px) and (min-height: " +
    (break_mobile_height + 1) +
    "px)"
);
const mobileOnly = window.matchMedia(
  "screen and (orientation: portrait) and (max-width: " +
    break_mobile_width +
    "px)," +
    " screen and (orientation: landscape) and (max-height: " +
    break_mobile_height +
    "px)"
);
const mobilePortraitOnly = window.matchMedia(
  "screen and (orientation: portrait) and (max-width: " +
    break_mobile_width +
    "px)"
);
const mobileLandscapeOnly = window.matchMedia(
  "screen and (orientation: landscape) and (max-height:" +
    break_mobile_height +
    "px)"
);

//
// Init (OnDOMLoaded)
//

document.addEventListener("DOMContentLoaded", function () {
  body = document.querySelector("body");
  main = document.querySelector("main");
  cube = document.querySelector("#cube");
  home = document.querySelector("#home");
  work = document.querySelector("#work");

  // Set auto placement
  if (mobileLandscapeOnly.matches) {
    setTimeout(() => {
      window.scroll({
        top: (home.offsetWidth * 2.45) / 3,
        left: 0,
      });
    }, 100);
  }

  // Add key events
  window.addEventListener("keydown", (event) => {
    if (event.keyCode == 37) {
      rotate("show-left");
      hideAndShowWorkBtn();
      muteAllVideos();
    }
    if (event.keyCode == 38) {
      rotate("show-front");
      hideAndShowWorkBtn();
      muteAllVideos();
    }
    if (event.keyCode == 39) {
      rotate("show-right");
      hideAndShowWorkBtn();
      muteAllVideos();
    }
    if (event.keyCode == 40) {
      rotate("show-bottom");
      replaceWorkBtnToNextBtn();
      autoloadVideos();
    }
  });

  // Add buttons events
  var buttons = document.querySelectorAll("nav > ul > li > a.link-menu");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      var side = button.getAttribute("data-side");
      rotate(side);
      if (side != "show-bottom") {
        muteAllVideos();
        hideAndShowWorkBtn();
      } else {
        replaceWorkBtnToNextBtn();
      }
      active(button);
    });
  });

  // Add link event
  var giveus = document.querySelector(".give-us-a-shout");
  giveus.addEventListener("click", (event) => {
    rotate("show-right");
    hideAndShowWorkBtn();
    var button = document.querySelector("#btnContact");
    active(button);
  });

  // Scroll navigation
  document.addEventListener("wheel", onWheelFromDocument);
  work.addEventListener("wheel", onWheelFromWork);

  // Add NextVideo button event
  var nextVideoBtn = document.querySelector("#btnNextVideo");
  nextVideoBtn.addEventListener("click", (event) => {
    var workHeight = work.offsetHeight;
    var workCurrentScroll = work.scrollTop;

    var videoTarget = Math.min(
      Math.floor(workCurrentScroll / workHeight) + 1,
      videos.length - 1
    );

    var newScrollValue = workHeight * videoTarget;

    work.scrollTo({
      top: newScrollValue,
      left: 0,
      behavior: "smooth",
    });
  });

  (function () {
    scrollTo();
  })();

  // Fill videos array
  var videoContainers = work.querySelectorAll(".video-container");
  videoContainers.forEach((container) => {
    videos.push({
      container: container,
      media: container.querySelector("video"),
      playPromise: null,
      muteIcon: container.querySelector(".mute"),
      externalIcon: container.querySelector(".external"),
      loadingIcon: container.querySelector(".loading"),
      intervalId: null,
      lerpValue: 0,
    });
  });

  // Add click event to video container
  videos.forEach((video) => {
    video.container.addEventListener("click", (event) => {
      toggleMuteVideo(video);
    });

    if (video.externalIcon) {
      video.externalIcon.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }
  });

  // Add video loading
  videos.forEach((video) => {
    video.media.addEventListener("loadstart", (event) => {
      video.loadingIcon.style.display = "block";
      // console.log("loadstart");
    });
    // video.media.addEventListener("waiting", event => {
    //   video.loadingIcon.style.display = "block";
    //   // console.log("waiting");
    // });
    video.media.addEventListener("canplay", (event) => {
      video.loadingIcon.style.display = "none";
      // console.log("canplay");
    });
  });

  // Add NextBtn behaviour on wheel
  work.addEventListener("scroll", debounce(handleNextBtn, 100), false);

  // Add scrolling video autoplay
  work.addEventListener("scroll", debounce(autoplayVideos, 100), false);
  document.addEventListener("scroll", debounce(autoplayVideos, 100), false);

  // Route HTML5 - Parse url and init page
  var hash = window.location.hash;
  if (hash.includes("about")) {
    rotate("show-left");
    hideAndShowWorkBtn();
    muteAllVideos();
    var button = document.querySelector("#btnAbout");
    active(button);
  } else if (hash.includes("home")) {
    rotate("show-front");
    replaceNextBtnToWorkBtn();
    hideAndShowWorkBtn();
    muteAllVideos();
    var button = document.querySelector("#btnHome");
    active(button);
  } else if (hash.includes("work")) {
    rotate("show-bottom");
    replaceWorkBtnToNextBtn();
    var button = document.querySelector("#btnWork");
    active(button);
    autoplayVideos();
  } else if (hash.includes("contact")) {
    rotate("show-right");
    hideAndShowWorkBtn();
    muteAllVideos();
    var button = document.querySelector("#btnContact");
    active(button);
  }
});

//
// Functions
//

var hasChangedCubeFace = false;
var hitVelocityScrollTop = 0;
function onWheelFromDocument(event) {
  wheelData = normalizeWheel(event);

  // Scroll allow to go bottom face
  if (
    cube.classList.contains("show-bottom") == false &&
    wheelData.pixelY > 10
  ) {
    work.scrollTop = 0;
    rotate("show-bottom");
    replaceWorkBtnToNextBtn();
    autoplayVideos();

    hasChangedCubeFace = true;
    setTimeout(() => {
      hasChangedCubeFace = false;
    }, 1500);
  }

  // Scroll allow to go front face
  if (
    cube.classList.contains("show-bottom") &&
    hitVelocityScrollTop > 0 &&
    Math.abs(wheelData.pixelY) > hitVelocityScrollTop &&
    wheelData.pixelY < 0 &&
    work.scrollTop == 0
  ) {
    hitVelocityScrollTop = 0;
    rotate("show-front");
    replaceNextBtnToWorkBtn();
    muteAllVideos();
  }

  if (
    work.scrollTop == 0 &&
    wheelData.pixelY < 0 &&
    hitVelocityScrollTop == 0
  ) {
    hitVelocityScrollTop = Math.abs(wheelData.pixelY);

    setTimeout(() => {
      hitVelocityScrollTop = 0;
    }, 1000);
  }

  if (cube.classList.contains("show-bottom") && hasChangedCubeFace == false) {
    work.scrollBy({
      top: wheelData.pixelY,
      left: 0,
    });
  }
}

function onWheelFromWork(event) {
  wheelData = normalizeWheel(event);

  // Scroll allow to go front face
  if (
    cube.classList.contains("show-bottom") &&
    hitVelocityScrollTop > 0 &&
    Math.abs(wheelData.pixelY) > hitVelocityScrollTop &&
    wheelData.pixelY < 0 &&
    work.scrollTop == 0
  ) {
    hitVelocityScrollTop = 0;
    rotate("show-front");
    replaceNextBtnToWorkBtn();
    muteAllVideos();
  }

  if (
    work.scrollTop == 0 &&
    wheelData.pixelY < 0 &&
    hitVelocityScrollTop == 0
  ) {
    hitVelocityScrollTop = Math.abs(wheelData.pixelY);

    setTimeout(() => {
      hitVelocityScrollTop = 0;
    }, 1000);
  }

  if (cube.classList.contains("show-bottom") && hasChangedCubeFace == false) {
    work.scrollBy({
      top: wheelData.pixelY,
      left: 0,
    });
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
}

function rotate(side) {
  document.getElementById("cube").className = side;
}

function active(button) {
  var buttons = document.querySelectorAll("nav > ul > li > a");

  buttons.forEach((b) => {
    b.classList.remove("active");
  });

  if (button) button.classList.add("active");
}

function hideWorkBtn() {
  var btnWork = document.querySelector("#btnWork");
  btnWork.parentElement.classList.remove("show");
  btnWork.parentElement.classList.add("hide");

  setTimeout(() => {
    btnWork.parentElement.style.display = "none";
  }, 250);
}

function showWorkBtn() {
  var btnWork = document.querySelector("#btnWork");
  btnWork.parentElement.style.display = "block";
  btnWork.parentElement.classList.remove("hide");
  btnWork.parentElement.classList.add("show");
}

function showNextBtn() {
  var nextVideoBtn = document.querySelector("#btnNextVideo");
  nextVideoBtn.parentElement.style.display = "block";
  nextVideoBtn.parentElement.classList.remove("hide");
  nextVideoBtn.parentElement.classList.add("show");
}

function hideNextBtn() {
  var nextVideoBtn = document.querySelector("#btnNextVideo");
  nextVideoBtn.parentElement.classList.remove("show");
  nextVideoBtn.parentElement.classList.add("hide");

  setTimeout(() => {
    nextVideoBtn.parentElement.style.display = "none";
  }, 250);
}

function hideAndShowWorkBtn() {
  hideNextBtn();
  hideWorkBtn();
  setTimeout(showWorkBtn, 500);
}

var replaceTimeOut = null;
function replaceWorkBtnToNextBtn() {
  if (replaceTimeOut) {
    clearTimeout(replaceTimeOut);
    replaceTimeOut = null;
  }

  hideWorkBtn();
  replaceTimeOut = setTimeout(showNextBtn, 500);
}

function replaceNextBtnToWorkBtn() {
  if (replaceTimeOut) {
    clearTimeout(replaceTimeOut);
    replaceTimeOut = null;
  }

  hideNextBtn();
  replaceTimeOut = setTimeout(showWorkBtn, 500);
}

function handleNextBtn(event) {
  var nextVideoBtn = document.querySelector("#btnNextVideo");

  var maxScrollValue = (videos.length - 1) * work.offsetHeight;
  var offsetTolerance = work.offsetHeight / 2;
  // console.log("work.offsetHeight: " + work.offsetHeight);
  // console.log("videos.length: " + videos.length);
  // console.log("maxScrollValue: " + maxScrollValue);
  // console.log("work.scrollTop: " + work.scrollTop);

  if (
    cube.classList.contains("show-bottom") &&
    work.scrollTop >= maxScrollValue - offsetTolerance
  ) {
    hideNextBtn();
  } else if (
    cube.classList.contains("show-bottom") &&
    nextVideoBtn.parentElement.classList.contains("hide")
  ) {
    replaceWorkBtnToNextBtn();
  }
}

// Vanilla JavaScript Scroll to Anchor
// @ https://perishablepress.com/vanilla-javascript-scroll-anchor/
function scrollTo() {
  const links = document.querySelectorAll(".scroll");
  links.forEach((each) => (each.onclick = scrollAnchors));
}

function scrollAnchors(e, respond = null) {
  const distanceToTop = (el) => Math.floor(el.getBoundingClientRect().top);
  e.preventDefault();
  var targetID = respond
    ? respond.getAttribute("href")
    : this.getAttribute("href");
  const targetAnchor = document.querySelector(targetID);
  if (!targetAnchor) return;
  const originalTop = distanceToTop(targetAnchor);
  window.scrollBy({ top: originalTop - 50, left: 0, behavior: "smooth" });
  const checkIfDone = setInterval(function () {
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

function toggleMuteVideo(video, shouldMute) {
  shouldMute = shouldMute || !video.media.muted;

  if (shouldMute) {
    if (video.muteIcon) video.muteIcon.style.display = "block";
    video.media.muted = shouldMute;
    video.media.volume = 0;

    if (video.intervalId) {
      clearInterval(video.intervalId);
      video.intervalId = null;
      video.lerpValue = 0;
    }
  } else {
    if (video.muteIcon) video.muteIcon.style.display = "none";
    video.media.muted = shouldMute;
    video.media.volume = 0;

    if (video.intervalId) {
      clearInterval(video.intervalId);
      video.intervalId = null;
      video.lerpValue = 0;
    }
    video.intervalId = window.setInterval(lerpVideoSound, 200, video, 0, 1);
  }
}

function muteAllVideos() {
  videos.forEach((video) => {
    toggleMuteVideo(video, true);
  });
}

function lerpVideoSound(video, from, to) {
  video.lerpValue += 0.1;

  var v = lerp(from, to, video.lerpValue);
  v = EasingFunctions.easeInQuad(v);
  video.media.volume = Math.max(Math.min(v, 1), 0);

  // console.log("lerpVideoSound id: " + video.intervalId);
  // console.log("lerpValue: " + video.lerpValue);
  // console.log("volume: " + video.media.volume);

  if (video.lerpValue >= 1 && video.intervalId) {
    clearInterval(video.intervalId);
    video.intervalId = null;
    video.lerpValue = 0;
  }
}

function autoplayVideos() {
  var scrollTop, scrollMiddle;

  if (mobileOnly.matches) {
    scrollTop = window.pageYOffset;
    scrollMiddle = window.pageYOffset + window.innerHeight / 2;
    // console.log("scroll: ", scrollTop, scrollMiddle);
  } else {
    scrollTop = work.scrollTop;
    scrollMiddle = work.scrollTop + work.offsetHeight / 2;
    // console.log("scroll: ", scrollTop, scrollMiddle);
  }

  var i = 0;
  videos.forEach((video) => {
    var videoTop = video.container.offsetTop;
    var videoBottom = video.container.offsetTop + video.container.offsetHeight;
    // console.log("video#" + i + ": " + videoTop + " " + videoBottom);

    if (
      scrollMiddle > videoTop &&
      scrollMiddle < videoBottom &&
      video.media.paused
    ) {
      video.playPromise = video.media.play();

      if (video.playPromise) {
        video.playPromise
          .then((_) => {
            // Automatic playback started!
            video.playPromise = null;
          })
          .catch((error) => {
            console.log("Auto-play was prevented");
          });
      }
    }

    if (
      (scrollMiddle < videoTop || scrollMiddle > videoBottom) &&
      video.media.paused == false
    ) {
      if (video.playPromise) {
        video.playPromise
          .then((_) => {
            // Automatic playback started!
            video.playPromise = null;
            video.media.pause();
          })
          .catch((error) => {
            console.log("Auto-play was prevented");
          });
      } else {
        video.media.pause();
      }
      toggleMuteVideo(video, true);
    }
    i++;
  });
}

//
// Usefull functions
//

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;

  // This is the function that is actually executed when
  // the DOM event is triggered.
  return function executedFunction() {
    // Store the context of this and any
    // parameters passed to executedFunction
    var context = this;
    var args = arguments;

    // The function to be called after
    // the debounce time has elapsed
    var later = function () {
      // null timeout to indicate the debounce ended
      timeout = null;

      // Call function now if you did not on the leading end
      if (!immediate) func.apply(context, args);
    };

    // Determine if you should call the function
    // on the leading or trail end
    var callNow = immediate && !timeout;

    // This will reset the waiting every function execution.
    // This is the step that prevents the function from
    // being executed because it will never reach the
    // inside of the previous setTimeout
    clearTimeout(timeout);

    // Restart the debounce waiting period.
    // setTimeout returns a truthy value (it differs in web vs node)
    timeout = setTimeout(later, wait);

    // Call immediately if you're dong a leading
    // end execution
    if (callNow) func.apply(context, args);
  };
}

// Reasonable defaults
var PIXEL_STEP = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;

function normalizeWheel(/*object*/ event) /*object*/ {
  var sX = 0,
    sY = 0, // spinX, spinY
    pX = 0,
    pY = 0; // pixelX, pixelY

  // Legacy
  if ("detail" in event) {
    sY = event.detail;
  }
  if ("wheelDelta" in event) {
    sY = -event.wheelDelta / 120;
  }
  if ("wheelDeltaY" in event) {
    sY = -event.wheelDeltaY / 120;
  }
  if ("wheelDeltaX" in event) {
    sX = -event.wheelDeltaX / 120;
  }

  // side scrolling on FF with DOMMouseScroll
  if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ("deltaY" in event) {
    pY = event.deltaY;
  }
  if ("deltaX" in event) {
    pX = event.deltaX;
  }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) {
      // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {
      // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) {
    sX = pX < 1 ? -1 : 1;
  }
  if (pY && !sY) {
    sY = pY < 1 ? -1 : 1;
  }

  return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
}
