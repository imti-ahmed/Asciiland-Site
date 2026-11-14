// A cyclic, endless carousel: the trees sit side by side in a loop. Back / Next slide the row one
// tree at a time, always in the same direction, so the last tree is followed by the first again.
// The loop always has enough trees to fill the window, so nothing ever pops in or out on screen:
// a tree only jumps from one end of the loop to the other while it is out of sight.
import { pieces } from "./engine.js";
import "./counter.js";
import "./brand.js";
import "./menus.js";

// Pieces show in this order. Add new ones here.
import "./pieces/spring-tree.js";
import "./pieces/maple.js";
import "./pieces/pine.js";
import "./pieces/terracotta-tree.js";
import "./pieces/pink-tree.js";
import "./pieces/golden-tree.js";

// Biggest size (in pixels) any tree is drawn at. Change this one number to make trees bigger or smaller.
var MAX_ART_SIZE = 600;
var GAP = -150;             // space between trees, in pixels (negative = the empty edges overlap, trees sit closer)
// The slide is a spring: it speeds up, overshoots a touch and settles. Higher STIFFNESS = snappier,
// higher DAMPING = less bounce.
var STIFFNESS = 60, DAMPING = 10;
var MIN_SLOTS = 6;          // least number of trees in the loop (pieces are repeated to reach it)
var SWAY_PUSH = 0.4;        // how hard the moving row pushes the trees to sway in its direction

var stage = document.getElementById("stage");
var slots = [];             // { canvas, inst }
var n = 0, size = 0, spacing = 0;
var pos = 0, posV = 0;      // which tree is in the middle (a fraction while sliding) and its speed; never wraps back
var target = 0;             // the tree we are heading for

function sizeOf() {
  return Math.max(200, Math.floor(Math.min(stage.clientWidth, stage.clientHeight, MAX_ART_SIZE)));
}

function addSlot(piece) {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", piece.title + ": " + (piece.hint || ""));
  canvas.style.width = canvas.style.height = size + "px";
  stage.appendChild(canvas);
  var inst = piece.create(canvas);
  inst.resize(size);
  slots.push({ canvas: canvas, inst: inst });
}

// Make sure the loop is long enough that its jump point (half a loop away) is beyond the screen edge.
// The count is a multiple of the number of pieces, so the pattern repeats cleanly across the jump.
function ensureSlots() {
  var perSide = Math.ceil((stage.clientWidth / 2 + size) / spacing) + 1;
  var need = Math.max(MIN_SLOTS, perSide * 2);
  need = Math.ceil(need / pieces.length) * pieces.length;
  while (slots.length < need) addSlot(pieces[slots.length % pieces.length]);
  n = slots.length;
}

// Shortest signed distance, in places, from the middle to tree i (between -n/2 and n/2).
function offset(i) {
  var d = (i - pos) % n;
  if (d < -n / 2) d += n; else if (d >= n / 2) d -= n;
  return d;
}

function place() {
  var mid = stage.clientWidth / 2;
  for (var i = 0; i < n; i++) {
    var x = mid + offset(i) * spacing - size / 2;
    slots[i].canvas.style.transform = "translate(" + x.toFixed(2) + "px, -50%)";
  }
}

// A tree is "on screen" (or about to be) when any part of it is within the window plus a half-tree margin.
function onScreen(i) {
  return Math.abs(offset(i) * spacing) < stage.clientWidth / 2 + size;
}

function layout() {
  size = sizeOf();
  spacing = Math.max(40, size + GAP);
  slots.forEach(function (s) {
    s.canvas.style.width = s.canvas.style.height = size + "px";
    s.inst.resize(size);
  });
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

layout();
requestAnimationFrame(loop);
