// The background sound: a soft, looping recording of an autumn forest atmosphere, controlled by the Sound pill in the
// bottom bar ("Sound On" / "Sound Off"). The file is local (assets/sounds/forest-ambience.mp3); nothing is fetched online.
//
// Browsers do not allow sound before the visitor has done something on the page (click, tap or key). So the
// sound tries to start straight away, and if the browser says no, it starts on the first click, tap or key press.
// It fades in and out so it never starts or stops with a jolt, and it pauses while the tab is hidden.
//
// On top of that, pressing any tree plays a big leaf rustle (assets/sounds/leaf-rustle.mp3) over the loop, which
// keeps playing underneath. Both follow the Sound pill. The rustle is decoded once, ahead of time, and played from
// memory (Web Audio), so it starts the instant a tree is pressed; a plain audio element would lag.
import soundUrl from "../assets/sounds/forest-ambience.mp3";
import rustleUrl from "../assets/sounds/leaf-rustle.mp3";

var VOLUME = 2;                                    // how loud the sound is: 1 is full, above 1 is boosted (see setLevel)
var FADE_MS = 1500;                                // fade-in time; fading out is quicker
var btn = document.getElementById("sound");
var audio = new Audio(soundUrl);
audio.loop = true;
audio.preload = "auto";
audio.volume = 0;

var on = true;                                     // the pill's state: sound starts on
var playing = false;                               // is the audio actually running (the browser allowed it)?
var fader = 0;

var RUSTLE_VOLUME = 0.4;                           // how loud the rustle is (0 to 1); it plays over the background loop
var RUSTLE_GAP_MS = 120;                           // presses closer together than this do not start another rustle
var RUSTLE_CUT_START_S = 0.5, RUSTLE_CUT_END_S = 1;  // seconds cut off the start and the end of the file
var EDGE_FADE_S = 0.01, END_FADE_S = 0.25;         // a quick fade-in so the cut start does not click, and a fade-out at the cut end
var lastRustle = 0;
var ctx = null, rustleBuf = null;                  // the audio context, and the rustle ready to play from memory

export function soundOn() { return on; }

// Cut the clip down: drop RUSTLE_CUT_START_S from the start and RUSTLE_CUT_END_S from the end, and keep the middle.
// The new start fades in and the new end fades out, so the cuts do not click. The file itself is not changed.
function crop(buf) {
  var rate = buf.sampleRate, total = buf.length;
  var from = Math.min(total - 1, Math.round(RUSTLE_CUT_START_S * rate));
  var to = Math.max(from + 1, total - Math.round(RUSTLE_CUT_END_S * rate));
  var len = to - from, fadeIn = Math.max(1, Math.round(EDGE_FADE_S * rate)), fadeOut = Math.max(1, Math.round(END_FADE_S * rate));
  var out = ctx.createBuffer(buf.numberOfChannels, len, rate);
  for (var c = 0; c < buf.numberOfChannels; c++) {
    var src = buf.getChannelData(c), dst = out.getChannelData(c);
    for (var i = 0; i < len; i++) dst[i] = src[from + i] * Math.min(1, (i + 1) / fadeIn, (len - i) / fadeOut);
  }
  return out;
}

// Get the audio ready now, so the first press is as fast as the rest. (The context starts paused: browsers only let
// it run after a click, and the first press resumes it.)
try {
  var AC = window.AudioContext || window.webkitAudioContext;
  ctx = AC ? new AC() : null;
  if (ctx) fetch(rustleUrl).then(function (r) { return r.arrayBuffer(); })
    .then(function (data) { return ctx.decodeAudioData(data); })
    .then(function (buf) { rustleBuf = crop(buf); })
    .catch(function () { /* no rustle, the rest still works */ });
} catch (err) { ctx = null; }

// A plain audio element cannot go above full volume, so a louder-than-1 VOLUME goes through a gain stage (Web Audio).
// `level` is the single loudness number: up to 1 it moves the element's volume, above 1 it adds gain on top.
var level = 0, boost = null;
try {
  if (ctx) { boost = ctx.createGain(); ctx.createMediaElementSource(audio).connect(boost); boost.connect(ctx.destination); }
} catch (err) { boost = null; }
function setLevel(v) {
  level = v;
  audio.volume = Math.min(1, v);
  if (boost) boost.gain.value = Math.max(1, v);
}

// One rustle, from the start, the moment it is asked for.
function rustle() {
  var now = performance.now();
  if (!on || !ctx || !rustleBuf || now - lastRustle < RUSTLE_GAP_MS) return;
  lastRustle = now;
  if (ctx.state === "suspended") ctx.resume();
  var src = ctx.createBufferSource(), gain = ctx.createGain();
  src.buffer = rustleBuf;
  gain.gain.value = RUSTLE_VOLUME;
  src.connect(gain); gain.connect(ctx.destination);
  src.start(0);
}

// Any press on a tree (the stage holds nothing but the trees' canvases).
document.getElementById("stage").addEventListener("pointerdown", function (e) {
  if (e.target && e.target.tagName === "CANVAS") rustle();
});

// Move the volume smoothly to `target`, then call `done`.
function fadeTo(target, ms, done) {
  clearInterval(fader);
  var from = level, t0 = performance.now();
  fader = setInterval(function () {
    var k = Math.min(1, (performance.now() - t0) / ms);
    setLevel(from + (target - from) * k);
    if (k === 1) { clearInterval(fader); if (done) done(); }
  }, 30);
}

function start() {
  if (!on) return;
  if (ctx && ctx.state === "suspended") ctx.resume();   // the boosted path only makes sound once the context runs
  if (playing) { fadeTo(VOLUME, 600); return; }          // already running (maybe mid fade-out): just bring it back up
  var p = audio.play();
  if (p && p.then) p.then(running, function () { /* not allowed yet: wait for a click */ });
  else running();
}

function running() {
  playing = true;
  fadeTo(VOLUME, FADE_MS);
  ["pointerdown", "keydown"].forEach(function (n) { window.removeEventListener(n, firstTouch); });   // no longer needed
}

function stop() {
  fadeTo(0, 500, function () { if (!on) { audio.pause(); playing = false; } });   // (switched back on meanwhile: keep playing)
}

// The first click, tap or key press lets the browser play sound. (Pressing the Sound pill itself is handled by the pill.)
function firstTouch(e) {
  if (e.target && e.target.closest && e.target.closest("#sound, #sound-prompt")) return;   // the popup's buttons decide for themselves
  start();
}
["pointerdown", "keydown"].forEach(function (n) { window.addEventListener(n, firstTouch); });

// One place that switches the sound, used by the pill and by the welcome popup (js/soundprompt.js).
export function setSound(value) {
  on = value;
  btn.querySelector("span").textContent = on ? "Sound On" : "Sound Off";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  if (on) start(); else stop();
}
export function soundPlaying() { return playing; }

btn.addEventListener("click", function () { setSound(!on); });

document.addEventListener("visibilitychange", function () {   // no wind in a tab nobody is looking at
  if (document.hidden) { if (playing) { clearInterval(fader); audio.pause(); playing = false; } }
  else start();
});

start();
