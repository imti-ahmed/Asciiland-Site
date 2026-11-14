// Golden Tree: a cloud-shaped yellow crown on a thin dark purple trunk.
// The shape is tree 3 (top-right) of the illustrated sheet; the colours are our own.
import { makeTree } from "../tree.js";
import sheet from "../../assets/tree-sheet.js";

makeTree({
  id: "golden-tree", title: "Golden Tree",
  image: sheet,
  crop: [0.555, 0.10, 0.31, 0.397],                        // where this tree sits on the sheet
  paper: function (r, g, b) { return r > 225 && g > 225 && b > 200; },   // the cream background
  // trunk = the pale pink line down the middle of the picture (pinkish, and only near the centre)
  isWood: function (r, g, b, u) { return b > 140 && g < 215 && u > 0.44 && u < 0.66; },
  symbols: { trunk: "|" },                                 // whole trunk drawn with | (no #)
  flare: [2, 1],                                           // the trunk is thin, so only a small flare
  leafColour: function (s) { return [s.r, s.g, s.b]; },
  tones: [[255, 228, 92], [255, 202, 32], [242, 166, 12]], // three yellows
  woodRamp: [[88, 44, 130]],                               // dark purple trunk
  fall: [[255, 228, 92], [255, 202, 32], [242, 166, 12]],
  fallChance: 0
});
