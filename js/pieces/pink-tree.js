// Pink Tree: a tall, slim tree with separate clumps of leaves, recoloured from green to pink
// (tree 1, top-left, of the green sheet).
import { makeTree } from "../tree.js";
import sheet from "../../assets/green-sheet.js";

makeTree({
  id: "pink-tree", title: "Pink Tree",
  image: sheet,
  crop: [0.05, 0.052, 0.193, 0.44],                        // where this tree sits on the sheet
  fit: 0.82,
  paper: function (r, g, b) { return r > 205 && g > 205 && b > 205; },   // white background and the faint grey watermark
  trunkTop: 0.74,
  leafScale: 1.45, leafDy: 0.14,                           // bigger stars, nudged down so they sit centred
  symbols: { leaf: "*" },                                  // leaves (and falling leaves) are * on this tree
  flare: [2, 1],                                           // the trunk is thin, so only a small flare
  leafColour: function (s) { return [s.r, s.g, s.b]; },
  // the picture's light green, dark green and outlines become three pinks (light to dark)
  tones: [[255, 198, 216], [252, 142, 182], [230, 86, 142]],
  woodRamp: [[150, 95, 60], [192, 132, 86]],
  fall: [[255, 198, 216], [252, 142, 182], [230, 86, 142]],
  fallChance: 0
});
