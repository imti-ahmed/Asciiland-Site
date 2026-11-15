// Blue Tree: wide layered blue crowns sprinkled with light blue blossom, on a dark charcoal trunk with angled branches.
// The shape is the owner's blue blossom illustration; the colours are our own. The blossom pile at its foot is left out.
import { makeTree } from "../tree.js";
import tree from "../../assets/blue-tree.js";

makeTree({
  id: "blue-tree", title: "Blue Tree",
  image: tree,
  crop: [0.0933, 0.1133, 0.7333, 0.8],                       // the tree without the faded clouds and trees behind it
  // the pale grey/white background (faded trees, clouds and frame lines are all very light), and the blue blossom
  // pile around the foot: below this height anything that is not dark charcoal trunk is dropped
  paper: function (r, g, b, u, v) { return (r > 225 && g > 225 && b > 225) || (v > 0.82 && b >= 130); },
  isWood: function (r, g, b) { return r < 80 && g < 85 && b < 110; },       // the charcoal trunk and branches
  // Three leaf colours, taken from the picture's own areas: light blossom, bright blue crown, darker blue shade.
  // The trailing 1 keeps the engine's contrast step off them.
  leafColour: function (s) { return s.g >= 150 ? [150, 188, 255, 1] : s.g >= 112 ? [56, 124, 255, 1] : [34, 78, 214, 1]; },
  symbols: { leaf: "0", trunk: "|" },                         // leaves (and falling leaves) are 0; whole trunk drawn with | (no #)
  woodRamp: [[60, 80, 102]],                                 // charcoal, lifted a little so it stays bright enough
  fall: [[150, 188, 255], [100, 152, 255]],                  // falling blossom
  fallChance: 0.4
});
