// Maple: a spiky maple-leaf crown in yellow, orange and red on a thin maroon trunk
// (tree 1, top-left, of the crayon sheet).
import { makeTree } from "../tree.js";
import sheet from "../../assets/crayon-sheet.js";

makeTree({
  id: "maple", title: "Maple",
  image: sheet,
  crop: [0.008, 0.018, 0.342, 0.28],                       // where this tree sits on the sheet (stops above the grass)
  // background: the off-white paper, plus pale pinkish pixels where crayon fades into the paper
  paper: function (r, g, b) { return (r > 228 && g > 228 && b > 222) || (b > 100 && r + g + b > 330); },
  // trunk and the dark veins in the crown: anything dark
  isWood: function (r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b < 78; },
  narrow: 0.85,                                            // a little thinner than the picture
  trunkTop: 0.66,
  flare: [2, 1],                                           // the trunk is thin, so only a small flare
  leafColour: function (s) { return [s.r, s.g, s.b]; },
  tones: [[255, 208, 50], [255, 142, 30], [242, 58, 36]],  // yellow centre, orange, red (light to dark)
  woodRamp: [[158, 46, 42]],                               // a brighter maroon
  fall: [[255, 208, 50], [255, 142, 30], [242, 58, 36]],
  fallChance: 0
});
