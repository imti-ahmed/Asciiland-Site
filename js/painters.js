// Draws tree shapes in code, on a white unit square (x and y both run 0 to 1).
// Wood is painted brown (red >= green) and foliage green (green > red); each tree's palette recolours it.
// Lighter greens become lighter palette colours, so lighter = higher up / more sunlit.
import { rng } from "./engine.js";

function wood(l) { return "hsl(28, 40%, " + l + "%)"; }
function green(l) { return "hsl(110, 55%, " + l + "%)"; }
function lerp(a, b, f) { return a + (b - a) * f; }

function blob(c, x, y, r, col) {
  c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
}
// A trunk that is wide at the bottom and narrower at the top.
function trunk(c, x, groundY, topY, wBottom, wTop) {
  c.fillStyle = wood(28);
  c.beginPath();
  c.moveTo(x - wBottom / 2, groundY); c.lineTo(x + wBottom / 2, groundY);
  c.lineTo(x + wTop / 2, topY); c.lineTo(x - wTop / 2, topY);
  c.closePath(); c.fill();
}

// Cone-shaped tree built from stacked tiers (pine, spruce, christmas tree).
// o: { seed, cx, ground, top, tiers, width, trunkW, trunkH }  (trunkH = how much trunk shows below the lowest tier)
export function conifer(o) {
  return function (c) {
    var R = rng(o.seed), base = o.ground - (o.trunkH || 0.07);
    trunk(c, o.cx, o.ground, base, o.trunkW, o.trunkW * 0.8);
    for (var i = 0; i < o.tiers; i++) {
      var f0 = i / o.tiers, f1 = (i + 1.6) / (o.tiers + 0.6);
      var yTop = lerp(o.top, base, f0), yBot = Math.min(base, lerp(o.top, base, f1));
      var half = lerp(0.05, o.width / 2, f1);
      c.fillStyle = green(Math.round(lerp(40, 26, f0) + (R() - 0.5) * 5));
      c.beginPath(); c.moveTo(o.cx, yTop); c.lineTo(o.cx + half, yBot); c.lineTo(o.cx - half, yBot); c.closePath(); c.fill();
      for (var k = 0; k < 6; k++) {                      // ragged, lighter edge on each tier
        var bx = o.cx + (R() - 0.5) * half * 1.9, by = yBot - R() * 0.03;
        blob(c, bx, by, 0.022 + R() * 0.02, green(Math.round(lerp(46, 30, f0) + R() * 8)));
      }
    }
  };
}
