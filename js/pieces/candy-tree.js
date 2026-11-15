// Candy Tree: five round, swirly crowns (pink, orange, teal, yellow, purple) on a bendy brown trunk.
// The shape and colours are the owner's picture. Unlike the other trees it keeps FIVE leaf colours (one per ball,
// each with its own light and dark), because the colourful balls are the whole point of this tree.
import { makeTree } from "../tree.js";
import { bright } from "../engine.js";
import picture from "../../assets/candy-tree.js";

makeTree({
  id: "candy-tree", title: "Candy Tree",
  image: picture,
  crop: [0.164, 0.112, 0.667, 0.786],                        // the tree without the empty grey around it
  // the light grey backdrop and the faint "pngtree" watermark, and the white shine spots on the balls (left as holes)
  paper: function (r, g, b) { return Math.max(r, g, b) - Math.min(r, g, b) < 22 && 0.299 * r + 0.587 * g + 0.114 * b > 200; },
  symbols: { trunk: "|" },                                   // whole trunk drawn with | (no #)
  // trunk and branches are brown: orange-brown, much less red-pink than the balls. (The orange ball has more red and less green.)
  isWood: function (r, g, b) { return r < 228 && g > r * 0.5 && g < r * 0.8 && b < r * 0.42; },
  // each ball keeps its own hue; the picture's dark swirl and rim keep their shade, only brightened
  leafColour: function (s) { return bright(s.r, s.g, s.b, 190); },
  fall: [[255, 70, 140], [255, 120, 60], [70, 235, 235], [235, 225, 70], [200, 70, 230]],   // the five ball colours
  fallChance: 0.3
});
