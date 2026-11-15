// Coral Tree: flat, layered coral crowns of / and \ alternating by tier on a thin straight-line trunk with curved branches. The bushes at its foot are left out.
// The shape is the top-left tree of the "variety of cute trees" sheet; the colours are our own.
import { makeTree } from "../tree.js";
import sheet from "../../assets/variety-sheet.js";

makeTree({
  id: "coral-tree", title: "Coral Tree",
  image: sheet,
  crop: [0.162, 0.200, 0.336, 0.330],                      // where this tree sits on the sheet
  // the cream background, and the coral bushes around the foot: below this height anything that is not brown trunk is dropped
  paper: function (r, g, b, u, v) { return (r > 225 && g > 205 && b > 180) || (v > 0.68 && r >= 160); },
  // trunk and branches are brown; the coral leaves are far brighter in red
  isWood: function (r) { return r < 160; },
  // The crowns are stacked tiers: bright coral on the front tier, a deeper tier behind it, a deep red edge furthest back.
  // Each leaf takes the picture's own tier colour (not a lightness band), so the tiers stay separate and visible.
  // The trailing 1 keeps the engine's contrast step off these three colours.
  leafColour: function (s) { return s.g >= 115 ? [255, 148, 112, 1] : s.g >= 70 ? [246, 92, 60, 1] : [200, 40, 26, 1]; },
  symbols: { trunk: "|" },                                 // whole trunk drawn with | (no #)
  // Depth: the symbol alternates tier by tier. Front tier /, the tier behind it \, the back edge / again.
  // Falling leaves keep the symbol of the leaf they came from.
  leafChar: function (s) { return s.g >= 115 ? "/" : s.g >= 70 ? "\\" : "/"; },
  woodRamp: [[148, 86, 54]],                               // a warmer, brighter brown for the trunk
  fall: [[255, 150, 112], [250, 100, 70], [214, 56, 36]],
  fallChance: 0
});
