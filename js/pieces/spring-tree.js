// Spring Tree: light green leaves with pink blossom, from the original picture.
import { makeTree } from "../tree.js";
import { mix } from "../engine.js";
import image from "../../assets/spring-tree.js";

var PINK = [[244, 143, 177], [250, 190, 208]];

makeTree({
  id: "spring-tree", title: "Spring Tree",
  image: image,
  // picture colours, lifted toward fresh green, with a third of the leaves as pink blossom
  leafColour: function (s, r1, r2) {
    var r = mix(s.qr, 150, 0.4), g = mix(s.qg, 222, 0.4), b = mix(s.qb, 60, 0.4);
    if (r1 < 0.32) {                                       // blossom keeps its own pink (the 1 = leave the colour alone)
      var pk = PINK[r2 < 0.5 ? 0 : 1];
      return [mix(r, pk[0], 0.92), mix(g, pk[1], 0.92), mix(b, pk[2], 0.92), 1];
    }
    return [r, g, b];
  },
  tones: [[190, 240, 100], [130, 210, 72], [72, 176, 56]],  // three greens: light, middle, dark
  fall: PINK
});
