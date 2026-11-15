// Mushroom Tree: bright pink dome crowns with dark purple stripes, held up by a thin dark twisting trunk.
// The shape is the bottom-left tree of the painted sheet; the colours are our own.
import { makeTree } from "../tree.js";
import sheet from "../../assets/fantasy-sheet.js";

makeTree({
  id: "mushroom-tree", title: "Mushroom Tree",
  image: sheet,
  crop: [0.039, 0.539, 0.454, 0.426],                        // where this tree sits on the sheet (the blue tree beside it is dropped as a stray piece)
  minFill: 0.2,                                              // the trunk and branches are thinner than a symbol: keep faint cells so they stay joined
  // the grey backdrop and the lighter grey patch behind the tree, and the grey blur where they meet the trunk (dull, not dark)
  paper: function (r, g, b) { return Math.max(r, g, b) - Math.min(r, g, b) < 30 && 0.299 * r + 0.587 * g + 0.114 * b > 62; },
  // trunk and branches: a very dark red-brown. The dark purple stripes on the crowns are as dark but bluer, so they stay leaves.
  isWood: function (r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b < 80 && b < r * 0.82; },
  // Three leaf colours, from the picture's own areas: light pink dome, mid pink, dark purple stripes.
  // The trailing 1 keeps the engine's contrast step off them.
  leafColour: function (s) { return s.g >= 104 ? [246, 150, 246, 1] : s.g >= 65 ? [216, 90, 216, 1] : [130, 40, 150, 1]; },
  leafSet: "()",                                           // leaves (and falling leaves) are ( or ), each a random one
  woodRamp: [[92, 52, 78]],                                  // the near-black trunk, lifted so it stays visible on the grey page
  fall: [[246, 150, 246], [216, 90, 216]],
  fallChance: 0.3
});
