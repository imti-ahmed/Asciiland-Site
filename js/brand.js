// The title in the top bar. On hover the name (not the slashes) scrambles through ASCII symbols and
// settles on the credit line, opening out from the centre; moving away scrambles it back.
var NAME = "ASCIILAND", CREDIT = "MADE BY IMTIYAZ";
var SYMBOLS = "/|#*+@~^<>=-_%&$";
var DURATION = 380;          // how long one change takes, in milliseconds
var TICK = 30;               // how often the scrambling symbols change, in milliseconds

var el = document.getElementById("brand-text");
var shown = NAME, target = NAME, from = NAME, start = 0, lastTick = 0, running = false;
var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rnd() { return SYMBOLS.charAt((Math.random() * SYMBOLS.length) | 0); }

function frame(now) {
  var f = Math.min(1, (now - start) / DURATION);
  if (now - lastTick >= TICK || f >= 1) {
    lastTick = now;
    // the text grows or shrinks from its centre toward the new length, and the letters lock in from the
    // middle outwards. Spots beyond the new text (while shrinking) are scrambling symbols.
    var len = Math.round(from.length + (target.length - from.length) * f), out = "";
    var offset = Math.floor((len - target.length) / 2);          // where the new text starts inside the shown text
    var mid = (target.length - 1) / 2, reach = f * f * (target.length / 2 + 1);   // slow start, quick finish
    for (var i = 0; i < len; i++) {
      var ti = i - offset, ch = ti >= 0 && ti < target.length ? target.charAt(ti) : "";
      if (ch === " ") out += " ";
      else out += ch && Math.abs(ti - mid) <= reach ? ch : rnd();
    }
    shown = f >= 1 ? target : out;
    el.textContent = shown;
  }
  if (f < 1) requestAnimationFrame(frame); else running = false;
}

function change(to) {
  if (to === target) return;
  target = to; from = shown; start = performance.now(); lastTick = 0;
  if (calm) { shown = to; el.textContent = to; return; }   // no animation for people who ask for less motion
  if (!running) { running = true; requestAnimationFrame(frame); }
}

var brand = el.parentNode;
brand.addEventListener("pointerenter", function () { change(CREDIT); });
brand.addEventListener("pointerleave", function () { change(NAME); });
