// Pine (the Christmas tree): a green cone made of tiers, with needles that drift down slowly.
import { makeTree, stepLeaf } from "../tree.js";
import { conifer } from "../painters.js";

makeTree({
  id: "pine", title: "Pine",
  paint: conifer({ seed: 5, cx: 0.5, ground: 0.92, top: 0.08, tiers: 7, width: 0.5, trunkW: 0.07, trunkH: 0.15 }),
  trunkTop: 0.77,
  leafColour: stepLeaf([[130, 230, 125], [68, 192, 100], [24, 150, 80]]),   // three greens: light, middle, dark
  woodRamp: [[150, 88, 40], [195, 125, 60]],
  fall: [[130, 230, 125], [68, 192, 100], [24, 150, 80]],
  fallChance: 0.3,
  ambientRate: 3
});
