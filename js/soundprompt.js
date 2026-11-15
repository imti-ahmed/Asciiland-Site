// The small welcome popup that asks whether to switch the sound on. It appears once the trees have finished fading in (js/main.js sends "intro-done").
// A click on its button is also what lets the browser play sound, so "Sound on" always works.
// It stays away when the browser already allowed the sound to start by itself (nothing left to ask).
import { setSound, soundPlaying } from "./sound.js";

var SHOW_AFTER_MS = 0;                          // straight away when the last tree has faded in
var box = document.getElementById("sound-prompt");
var yes = document.getElementById("sound-yes");
var no = document.getElementById("sound-no");

function close() {
  box.classList.remove("show");
  box.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", onKey);
}
function onKey(e) { if (e.key === "Escape") { setSound(false); close(); } }

yes.addEventListener("click", function () { setSound(true); close(); });
no.addEventListener("click", function () { setSound(false); close(); });

window.addEventListener("intro-done", function () { setTimeout(show, SHOW_AFTER_MS); });
function show() {
  if (soundPlaying()) return;
  box.classList.add("show");
  box.setAttribute("aria-hidden", "false");
  document.addEventListener("keydown", onKey);
}
