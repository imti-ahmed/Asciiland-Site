// Smiley Tree: a tree of round yellow crowns where every crown is a big smiley (red eyes and a red smile, and a darker yellow border of \ round each ball).
// The shape is tree 8 (bottom row, middle) of the green "tree logos" sheet; the colours are our own.
import { makeTree } from "../tree.js";
import sheet from "../../assets/logo-sheet.js";

makeTree({
  id: "smiley-tree", title: "Smiley Tree",
  image: sheet,
  crop: [0.3802, 0.655, 0.246, 0.3131],                      // where this tree sits on the sheet
  minFill: 0.2,                                              // the roots at the foot curve thinly: keep faint cells so the base stays whole
  // The eight round crowns, nearest first: [x, y, radius], as fractions of the crop (radius of its width). They are
  // measured off the picture. The last three pale ones sit behind the others.
  faces: [
    [0.5247, 0.1888, 0.1818],   // top, biggest
    [0.6286, 0.5179, 0.1474],   // middle
    [0.2143, 0.6276, 0.1604],   // lower left, big
    [0.3377, 0.4362, 0.1299],   // upper left
    [0.8409, 0.5510, 0.0974],   // right, small
    [0.7175, 0.3316, 0.1039],   // pale, behind the top and middle ones
    [0.3636, 0.7423, 0.1019],   // pale, behind the lower left one
    [0.7662, 0.7423, 0.0877]    // pale, lower right
  ],
  // Three leaf colours in the yellow range, laid out by the picture's own pale, lime and deeper areas:
  // pale yellow, yellow, golden. The trailing 1 keeps the engine's contrast step off them.
  leafColour: function (s) { return s.lum >= 178 ? [255, 238, 130, 1] : s.lum >= 150 ? [255, 208, 48, 1] : [236, 168, 24, 1]; },
  faceColour: [232, 36, 44],                                 // the eyes and smile: a bright red, so they stand out on the yellow
  symbols: { trunk: "|" },                                   // whole trunk drawn with | (no #)
  flare: [1, 1],                                             // a small root flare: the picture already has a wide curved base
  woodRamp: [[176, 112, 52]],                                // a brighter brown for the trunk
  // A border round every ball: a darker yellow, drawn with \ so the rim hatches against the / of the leaves.
  faceRim: { colour: [214, 140, 10], symbol: "\\" },
  fall: [[255, 238, 130], [255, 208, 48], [236, 168, 24]],
  fallChance: 0
});
