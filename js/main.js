// A cyclic, endless carousel: the trees sit side by side in a loop. Back / Next slide the row one
// tree at a time, always in the same direction, so the last tree is followed by the first again.
// The loop always has enough trees to fill the window, so nothing ever pops in or out on screen:
// a tree only jumps from one end of the loop to the other while it is out of sight.
import { pieces } from "./engine.js";
import "./counter.js";
import "./brand.js";
import "./menus.js";
import "./sound.js";

// Pieces show in this order. Add new ones here.
import "./pieces/spring-tree.js";
import "./pieces/maple.js";
import "./pieces/pine.js";
import "./pieces/blue-tree.js";
import "./pieces/smiley-tree.js";
import "./pieces/terracotta-tree.js";
import "./pieces/pink-tree.js";
import "./pieces/golden-tree.js";
import "./pieces/coral-tree.js";
import "./pieces/mushroom-tree.js";
import "./pieces/candy-tree.js";

// Biggest size (in pixels) any tree is drawn at. Change this one number to make trees bigger or smaller.
var MAX_ART_SIZE = 600;
var TREE_GAP = 120;         // the empty space between the drawn parts of two neighbouring trees, in pixels. Equal for every pair.
// The slide is a spring: it speeds up, overshoots a touch and settles. Higher STIFFNESS = snappier,
// higher DAMPING = less bounce.
var STIFFNESS = 60, DAMPING = 10;
var MIN_SLOTS = 6;          // least number of trees in the loop (pieces are repeated to reach it)
var SWAY_PUSH = 0.4;        // how hard the moving row pushes the trees to sway in its direction

var stage = document.getElementById("stage");
var slots = [];             // { canvas, inst }
var n = 0, size = 0;
var P = [], L = 1;          // where each tree's drawn middle sits along the loop, and the loop's total length (px)
var boundsKey = "";         // changes when a tree finishes loading, so the spacing is worked out again
var pos = 0, posV = 0;      // which tree is in the middle (a fraction while sliding) and its speed; never wraps back
var target = 0;             // the tree we are heading for
var introDone = false;      // set once the page-load animation has finished

function sizeOf() {
  return Math.max(200, Math.floor(Math.min(stage.clientWidth, stage.clientHeight, MAX_ART_SIZE)));
}

function addSlot(piece) {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", piece.title + ": " + (piece.hint || ""));
  canvas.style.width = canvas.style.height = size + "px";
  if (introDone) canvas.classList.add("show");           // trees added after the intro just fade in
  stage.appendChild(canvas);
  var inst = piece.create(canvas);
  inst.resize(size);
  slots.push({ canvas: canvas, inst: inst });
}

// The drawn part of a tree (not its empty square): how wide it is, and where its middle is inside the square.
function drawn(i) {
  var b = slots[i].inst.bounds();
  if (!b) b = { left: size * 0.15, right: size * 0.85 };     // until the picture has loaded, a guess
  return { w: b.right - b.left, mid: (b.left + b.right) / 2 };
}

// Line the trees up so the gap between the DRAWN parts of neighbours is the same everywhere (TREE_GAP). Each tree's
// middle is P[i] along the loop; L is the loop's length, so the last tree is followed by the first again.
function spaceTrees() {
  var i, w, prevHalf = 0;
  P = [];
  for (i = 0; i < n; i++) {
    w = drawn(i).w;
    P.push(i === 0 ? 0 : P[i - 1] + prevHalf + TREE_GAP + w / 2);
    prevHalf = w / 2;
  }
  L = P[n - 1] + prevHalf + TREE_GAP + drawn(0).w / 2;
}

// The loop must be long enough that its jump point (half a loop away) is beyond the screen edge, so nothing pops.
// The count is a multiple of the number of pieces, so the pattern repeats cleanly across the jump.
function ensureSlots() {
  var need = Math.max(MIN_SLOTS, Math.ceil((stage.clientWidth + 2 * size) / (size * 0.55 + TREE_GAP)));
  need = Math.ceil(need / pieces.length) * pieces.length;
  while (slots.length < need) addSlot(pieces[slots.length % pieces.length]);
  n = slots.length;
  spaceTrees();
  while (L < stage.clientWidth + 2 * size + 100) {            // still too short: add another round of pieces
    for (var k = 0; k < pieces.length; k++) addSlot(pieces[slots.length % pieces.length]);
    n = slots.length;
    spaceTrees();
  }
}

// Shortest signed distance, in places, from the middle to tree i (between -n/2 and n/2). Used to order the intro.
function offset(i) {
  var d = (i - pos) % n;
  if (d < -n / 2) d += n; else if (d >= n / 2) d -= n;
  return d;
}

// Where the loop's middle is right now: between the drawn middles of the two trees `pos` lies between.
function centreAt(p) {
  var k = Math.floor(p), f = p - k;
  function at(j) { var m = Math.floor(j / n); return P[j - m * n] + m * L; }
  return at(k) + f * (at(k + 1) - at(k));
}

// Pixels from the screen's middle to the drawn middle of tree i (the nearest copy of it around the loop).
function screenDist(i, c) {
  var m = Math.round((pos - i) / n);
  return P[i] + m * L - c;
}

function place() {
  var mid = stage.clientWidth / 2, c = centreAt(pos);
  for (var i = 0; i < n; i++) {
    var x = mid + screenDist(i, c) - drawn(i).mid;
    slots[i].canvas.style.transform = "translate(" + x.toFixed(2) + "px, -50%)";
  }
}

// A tree is "on screen" (or about to be) when any part of it is within the window plus a half-tree margin.
function onScreen(i) {
  return Math.abs(screenDist(i, centreAt(pos))) < stage.clientWidth / 2 + size;
}

function layout() {
  size = sizeOf();
  slots.forEach(function (s) {
    s.canvas.style.width = s.canvas.style.height = size + "px";
    s.inst.resize(size);
  });
  ensureSlots();
  place();
}

// Pictures load a moment after the page starts. When one finishes, its drawn width becomes known: space again.
function checkBounds() {
  var key = "";
  for (var i = 0; i < n; i++) { var b = slots[i].inst.bounds(); key += b ? Math.round(b.left) + ":" + Math.round(b.right) + "," : "-,"; }
  if (key === boundsKey) return;
  boundsKey = key;
  ensureSlots();
  place();
}

function go(step) {
  if (n > 1) target += step;
}

document.getElementById("back").addEventListener("click", function () { go(-1); });
document.getElementById("next").addEventListener("click", function () { go(1); });

var rt;
window.addEventListener("resize", function () {
  clearTimeout(rt);
  rt = setTimeout(layout, 120);
});

var last = performance.now();

function loop(now) {
  var dt = Math.min(0.1, (now - last) / 1000); last = now;
  checkBounds();

  // spring toward the target tree. Stepped in small fixed slices so a slow frame never makes it jump.
  if (pos !== target || posV !== 0) {
    var steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / steps;
    for (var k = 0; k < steps; k++) {
      posV += (STIFFNESS * (target - pos) - DAMPING * posV) * h;
      pos += posV * h;
    }
    if (Math.abs(target - pos) < 0.0005 && Math.abs(posV) < 0.0005) { pos = target; posV = 0; }
    place();
  }

  // the trees lean and shake in the direction the row is moving (the row moves left as pos grows)
  var push = -posV * SWAY_PUSH;
  for (var i = 0; i < n; i++) {
    slots[i].inst.drive(push);
    if (onScreen(i)) slots[i].inst.frame(now);
  }
  requestAnimationFrame(loop);
}

// Page load, in this order: (1) the top and bottom bars fade in, (2) the middle tree, (3) the trees on both
// sides in pairs: the nearest left and right trees together, then the next pair, and so on.
var MIDDLE_AT = 280, SIDES_AT = 700, PAIR_GAP = 220;       // when each step starts, in milliseconds
function intro() {
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function showAll() { slots.forEach(function (s) { s.canvas.classList.add("show"); }); }
  document.body.classList.add("ready");
  if (calm) { showAll(); introDone = true; return; }
  setTimeout(function () { slots[0].canvas.classList.add("show"); }, MIDDLE_AT);   // the middle tree comes after the bars
  var steps = {};                                            // trees grouped by how far they are from the middle
  for (var i = 1; i < n; i++) if (onScreen(i)) (steps[Math.round(Math.abs(offset(i)))] = steps[Math.round(Math.abs(offset(i)))] || []).push(i);
  var dists = Object.keys(steps).map(Number).sort(function (a, b) { return a - b; });
  dists.forEach(function (d, k) {                            // the left and right tree at each distance appear together
    setTimeout(function () { steps[d].forEach(function (i) { slots[i].canvas.classList.add("show"); }); }, SIDES_AT + k * PAIR_GAP);
  });
  setTimeout(function () { showAll(); introDone = true; }, SIDES_AT + dists.length * PAIR_GAP + 200);   // anything off-screen
}

layout();
requestAnimationFrame(loop);
// wait for the font and a couple of frames, so the first thing you see is the finished page fading in
var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
fontsReady.then(function () { requestAnimationFrame(function () { requestAnimationFrame(intro); }); });
