// Terracotta Tree: boxy salmon crowns on a navy branching trunk (tree 6 of the illustrated sheet).
import { makeTree } from "../tree.js";
import { bright } from "../engine.js";
import sheet from "../../assets/tree-sheet.js";

makeTree({
  id: "terracotta-tree", title: "Terracotta Tree",
  image: sheet,
  crop: [0.571, 0.510, 0.329, 0.408],                      // where this tree sits on the sheet
  paper: function (r, g, b) { return r > 225 && g > 225 && b > 200; },          // the cream background
  // trunk = anything that isn't clearly orange. This also catches the soft grey edge pixels around the
  // navy trunk, which used to be mistaken for leaves and showed up as orange slashes under the trunk.
  isWood: function (r, g, b) { return r - b < 40; },
  symbols: { leaf: "+", trunk: "|" },                      // leaves are + on this tree; whole trunk drawn with | (no #)
  leafColour: function (s) { return bright(s.r, s.g, s.b, 250); },   // the picture's colours, brightened
  tones: [[255, 196, 160], [250, 150, 114], [236, 106, 78]],   // three: light salmon, coral, deeper terracotta
  woodRamp: [[62, 72, 170]],                               // a brighter navy for the trunk
  fall: [[255, 196, 160], [250, 150, 114], [236, 106, 78]],
  fallChance: 0
});
