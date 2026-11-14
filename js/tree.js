// The shared tree engine. Every tree piece is just a settings object passed to makeTree().
//
// Settings (all optional except id, title and either `image` or `paint`):
//   id, title, hint
//   image           base64 picture of the tree (white background)
//   paint(ctx)      OR draw the tree in code on a white unit square (0..1 in x and y).
//                   Paint wood in brown (red >= green) and foliage in any green (green > red);
//                   the palette below recolours the foliage.
//   crop            [x, y, width, height] as fractions of `image`: use just that part of the picture
//   fit             how tall the cropped tree is drawn, as a share of the square (default 0.8)
//   narrow          squeeze the tree's width (1 = as drawn, 0.85 = 15% thinner)
//   onePiece        keep only the biggest connected shape (default: on when `crop` is used)
//   paper(r,g,b)    returns true for background pixels (default: near-white)
//   isWood(r,g,b,u,v)   returns true for trunk/branch pixels (default: red >= green, i.e. brown).
//                   u, v = where the spot is in the square (0..1 across, 0..1 down)
//   trunkTop        painted trees: wood below this height (0 = top, 1 = bottom) is trunk "#"
//   symbols         { leaf: "/", branch: "|", trunk: "#", fall: <falling symbol> }
//   leafColour(s, r1, r2)   returns [r,g,b] (or a css colour) for a leaf cell (see rampLeaf for the easy way)
//   woodRamp        [[r,g,b], ...] dark to light, for wood cells (default: the picture's own brown)
//   fall            [[r,g,b], ...] colours for ambient falling bits and a share of shaken-off leaves
//   fallChance      share of shaken-off leaves that use `fall` colours (default 0.28)
//   ambient         "leaf" (falls from the canopy) or "sky" (falls from the top, like snow)
//   ambientRate     bits per second (default 7)
//   flare           extra trunk cells each side at the base, bottom row first (default [3,2,1,1])
//   tones           [[r,g,b], ...] light to dark (normally 3): limit the leaves to these colours, laid out by the
//                   picture's own light and dark areas. Leaves marked with a 4th value (blossom) are kept.
//   contrast        how far apart the light and dark leaves are (default 1.6, 1 = as painted). A 4th value
//                   in a leafColour result, e.g. [r,g,b,1], keeps that leaf out of it (used for blossom)
//   fruit           { symbol: "*", colours: [[r,g,b], ...], stem: [r,g,b], count: 5, shape: [...] }: round fruits
//                   hanging on stems inside the crown (shape defaults to FRUIT_SHAPE below)
//   leafSet         a string of symbols, e.g. "0123456789": each leaf (and falling leaf) is a random one of them
//   leafScale       draw leaf symbols bigger (1 = normal, 1.4 = 40% bigger). Falling leaves follow.
//   leafDy          nudge leaf symbols down, in cell heights (useful for `*`, which sits high)
//   glow            glow strength (default 0.26, 0 = off)
import { clamp, mix, rgb, rng, drawGlow, hasFilter, register } from "./engine.js";

var COLS = 100, SWAY = 0.45, SHIMMER = 0.55;
var HALF = 0.5, MAXH = 3, MAX_PARTS = 420;
// The default fruit: a two-symbol stem with a round fruit hanging from it. "|" = stem, "o" = fruit, space = leaf.
// 5 wide and 3 tall looks round because symbols are nearly twice as tall as they are wide.
var FRUIT_SHAPE = [
  "  |  ",
  "  |  ",
  " ooo ",
  "ooooo",
  " ooo "
];
var GROUND_MARGIN = 2;                    // empty rows left under every tree's lowest wood cell (the shared ground line)
var SWAY_CELLS = 3.2, BEND_CELLS = 1.0;   // how many grid cells the wind can shift the tree (at the top)

function ramp(stops, t) {
  var x = clamp(t, 0, 1) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  if (stops.length === 1) return stops[0];
  return [mix(stops[i][0], stops[i + 1][0], f), mix(stops[i][1], stops[i + 1][1], f), mix(stops[i][2], stops[i + 1][2], f)];
}

// Easy leaf colouring: shade from dark to light along `ramp`, plus a few `accent` colours.
export function rampLeaf(o) {
  return function (s, r1, r2) {
    var c = ramp(o.ramp, s.shade + (r2 - 0.5) * 0.35);
    if (o.accent && r1 < (o.accentChance || 0.15)) {
      var a = o.accent[(r2 * o.accent.length) | 0];
      c = [mix(c[0], a[0], 0.9), mix(c[1], a[1], 0.9), mix(c[2], a[2], 0.9)];
    }
    return c;
  };
}

// A fixed set of leaf colours for painted trees (give them light to dark): each leaf takes one of them,
// following the painted shading plus a little speckle. (The trailing 1 keeps the contrast step off them.)
export function stepLeaf(colours) {
  var C = colours.map(function (c) { return [c[0], c[1], c[2], 1]; }), n = C.length;
  return function (s, r1, r2) {
    var v = clamp((s.shade + (r2 - 0.5) * 0.35 - 0.1) / 0.75, 0, 0.999);   // 0 = darkest, 1 = lightest
    return C[n - 1 - Math.floor(v * n)];
  };
}

export function makeTree(cfg) {
  var SYM = { leaf: "/", branch: "|", trunk: "#" };
  if (cfg.symbols) for (var key in cfg.symbols) SYM[key] = cfg.symbols[key];
  if (!SYM.fall) SYM.fall = SYM.leaf;
  var GLOW = cfg.glow === undefined ? 0.26 : cfg.glow;
  var FLARE = cfg.flare || [3, 2, 1, 1];
  var FALL = cfg.fall || [[244, 143, 177], [250, 190, 208]];
  var CONTRAST = cfg.contrast === undefined ? 1.6 : cfg.contrast;
  var LEAF_SET = cfg.leafSet || null;
  var LEAF_SCALE = cfg.leafScale || 1, LEAF_DY = cfg.leafDy || 0;
  var FALL_CHANCE = cfg.fallChance === undefined ? 0.28 : cfg.fallChance;
  var AMBIENT_RATE = cfg.ambientRate || 7;
  var SKY = cfg.ambient === "sky";

  function fallColour() { var f = FALL[(Math.random() * FALL.length) | 0]; return rgb(f[0], f[1], f[2]); }

  function create(canvas) {
    var ctx = canvas.getContext("2d");
    var layer = document.createElement("canvas");
    var lctx = layer.getContext("2d");

    var img = new Image(), ready = !!cfg.paint, hasImage = !cfg.paint;
    var cells = [], grid = [], parts = [];
    var rows = 50, S = 600, cellW = 6, cellH = 11, dpr = 1, groundY = 0;
    var t0 = performance.now(), last = t0, acc = 0;
    var pile = [], pileH = [], pileTotal = 0, decayAcc = 0;
    var bend = 0, bendV = 0, windX = 0, windMag = 0, pvx = 0, pvy = 0;
    var lastPX = null, lastPY = 0, lastPT = 0, shedAcc = 0, dragging = false;
    var ext = 0;                                            // wind pushed in from outside (the carousel sliding)

    function build() {
      cellW = S / COLS; cellH = cellW * 1.8; rows = Math.floor(S / cellH);
      var K = 3;
      var off = document.createElement("canvas");
      off.width = COLS * K; off.height = rows * K;
      var o = off.getContext("2d", { willReadFrequently: true });
      o.fillStyle = "#fff"; o.fillRect(0, 0, off.width, off.height);
      if (cfg.paint) { o.save(); o.scale(off.width, off.height); cfg.paint(o); o.restore(); }
      else if (cfg.crop) {                                  // cut one tree out of a bigger picture, keep its proportions
        var cw = cfg.crop[2] * img.naturalWidth, ch = cfg.crop[3] * img.naturalHeight;
        var fh = cfg.fit || 0.8, fw = Math.min(0.92, fh * cw / ch) * (cfg.narrow || 1);
        o.drawImage(img, cfg.crop[0] * img.naturalWidth, cfg.crop[1] * img.naturalHeight, cw, ch,
                    (0.5 - fw / 2) * off.width, (0.5 - fh / 2) * off.height, fw * off.width, fh * off.height);
      }
      else o.drawImage(img, 0, 0, off.width, off.height);
      var data = o.getImageData(0, 0, off.width, off.height).data;
      var W = off.width, rand = rng(11);

      cells = [];
      var lowestLeafRow = 0, maxY = 0;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < COLS; c++) {
          var sr = 0, sg = 0, sb = 0, n = 0;
          for (var j = 0; j < K; j++) for (var i = 0; i < K; i++) {
            var p = ((r * K + j) * W + (c * K + i)) * 4;
            var R = data[p], G = data[p + 1], B = data[p + 2];
            if (cfg.paper ? cfg.paper(R, G, B) : (R > 236 && G > 236 && B > 236)) continue;   // paper
            sr += R; sg += G; sb += B; n++;
          }
          if (n < K * K * 0.4) continue;                    // no stray edge symbols
          sr /= n; sg /= n; sb /= n;

          var isBrown = cfg.isWood ? cfg.isWood(sr, sg, sb, (c + 0.5) / COLS, (r + 0.5) / rows) : sr >= sg;
          var lum = 0.299 * sr + 0.587 * sg + 0.114 * sb;
          var qr = 255 * Math.pow(clamp(lum + (sr - lum) * 1.6, 0, 255) / 255, 1.1);
          var qg = 255 * Math.pow(clamp(lum + (sg - lum) * 1.6, 0, 255) / 255, 1.1);
          var qb = 255 * Math.pow(clamp(lum + (sb - lum) * 1.6, 0, 255) / 255, 1.1);

          if (!isBrown && r > lowestLeafRow) lowestLeafRow = r;
          var cy = (r + 0.5) * cellH;
          if (isBrown && cy > maxY) maxY = cy;
          var ce = { x: (c + 0.5) * cellW, y: cy, row: r, col_i: c, brown: isBrown, ch: LEAF_SET ? LEAF_SET.charAt((rand() * LEAF_SET.length) | 0) : SYM.leaf,
                     r1: rand(), r2: rand(), phase: rand() * 6.283, col: "", lum: lum };
          cells.push(ce);

          if (isBrown) {
            if (cfg.woodRamp) { var wc = ramp(cfg.woodRamp, (sr - 85) / 50); ce.col = rgb(wc[0], wc[1], wc[2]); }
            else ce.col = rgb(qr, qg, qb);
          } else {
            var lc = cfg.leafColour({ r: sr, g: sg, b: sb, qr: qr, qg: qg, qb: qb, lum: lum, shade: clamp((sg - 105) / 100, 0, 1) }, ce.r1, ce.r2);
            if (typeof lc === "string") ce.col = lc; else { ce.col = rgb(lc[0], lc[1], lc[2]); ce.c3 = lc; }
          }
        }
      }
      // Keep only the biggest connected shape: drops stray symbols (a neighbour tree caught by the crop, specks).
      if (cfg.onePiece !== undefined ? cfg.onePiece : !!cfg.crop) {
        var at = {}, best = [], qi;
        for (qi = 0; qi < cells.length; qi++) at[cells[qi].row * COLS + cells[qi].col_i] = cells[qi];
        for (qi = 0; qi < cells.length; qi++) {
          if (cells[qi].seen) continue;
          var group = [cells[qi]], head = 0; cells[qi].seen = true;
          while (head < group.length) {
            var g0 = group[head++];
            for (var ar = -1; ar <= 1; ar++) for (var ac = -1; ac <= 1; ac++) {
              var nc = g0.col_i + ac; if (nc < 0 || nc >= COLS) continue;
              var nb = at[(g0.row + ar) * COLS + nc];
              if (nb && !nb.seen) { nb.seen = true; group.push(nb); }
            }
          }
          if (group.length > best.length) best = group;
        }
        cells = best;
        lowestLeafRow = 0; maxY = 0;
        for (qi = 0; qi < cells.length; qi++) {
          if (!cells[qi].brown && cells[qi].row > lowestLeafRow) lowestLeafRow = cells[qi].row;
          if (cells[qi].brown && cells[qi].y > maxY) maxY = cells[qi].y;
        }
      }
      for (var k = 0; k < cells.length; k++) {
        var ck = cells[k];
        if (!ck.brown) continue;
        var isTrunk = cfg.trunkTop !== undefined ? (ck.row + 0.5) / rows >= cfg.trunkTop : ck.row >= lowestLeafRow;
        ck.ch = isTrunk ? SYM.trunk : SYM.branch;
      }
      // Every tree stands on the same line: slide the whole tree up or down (whole rows only) so its
      // lowest wood cell sits on GROUND_ROW. This keeps the bottoms of all trees aligned in the carousel.
      var lowestWood = -1;
      for (var lw = 0; lw < cells.length; lw++) if (cells[lw].brown && cells[lw].row > lowestWood) lowestWood = cells[lw].row;
      if (lowestWood >= 0) {
        var dr = (rows - 1 - GROUND_MARGIN) - lowestWood, kept = [];
        for (var sh = 0; sh < cells.length; sh++) {
          var cs = cells[sh];
          if (!cs.brown && cs.row >= lowestWood) continue;      // leaves never sit level with or below the trunk's foot
          cs.row += dr; cs.y += dr * cellH;
          if (cs.row >= 0 && cs.row < rows) kept.push(cs);
        }
        cells = kept;
        maxY = (rows - 1 - GROUND_MARGIN + 0.5) * cellH;
      }
      // Widen the lowest part of the trunk (a root flare): the bottom row grows most, tapering upwards.
      var trunkRows = {}, lowestTrunk = -1, tk;
      for (tk = 0; tk < cells.length; tk++) {
        var tc = cells[tk];
        if (tc.ch !== SYM.trunk || !tc.brown) continue;
        var tr = trunkRows[tc.row] || (trunkRows[tc.row] = { min: COLS, max: -1, cell: tc });
        if (tc.col_i < tr.min) tr.min = tc.col_i;
        if (tc.col_i > tr.max) tr.max = tc.col_i;
        if (tc.row > lowestTrunk) lowestTrunk = tc.row;
      }
      for (var fi = 0; fi < FLARE.length; fi++) {
        var fr = trunkRows[lowestTrunk - fi];
        if (!fr) continue;
        for (var side = -1; side <= 1; side += 2) {
          for (var e = 1; e <= FLARE[fi]; e++) {
            var fc = side < 0 ? fr.min - e : fr.max + e;
            if (fc < 0 || fc >= COLS) continue;
            var taken = false;
            for (tk = 0; tk < cells.length; tk++) if (cells[tk].row === fr.cell.row && cells[tk].col_i === fc) { taken = true; break; }
            if (taken) continue;
            cells.push({ x: (fc + 0.5) * cellW, y: fr.cell.y, row: fr.cell.row, col_i: fc, brown: true, ch: SYM.trunk,
                         r1: rand(), r2: rand(), phase: rand() * 6.283, col: fr.cell.col });
          }
        }
      }
      // A fixed set of leaf colours for picture trees: the picture's range of lightness is cut into equal
      // bands, one per colour. The layout of light and dark stays the picture's own; a little speckle
      // softens the borders between bands.
      if (cfg.tones) {
        var lums = [], ti, tcell;
        for (ti = 0; ti < cells.length; ti++) { tcell = cells[ti]; if (tcell.c3 && !tcell.c3[3]) lums.push(tcell.lum); }
        lums.sort(function (a, b) { return a - b; });
        var lo = lums[Math.floor(lums.length * 0.1)] || 0, hi = lums[Math.floor(lums.length * 0.9)] || 0;
        var TN = cfg.tones.map(function (c) { return [c[0], c[1], c[2], 1]; }), tn = TN.length;
        for (ti = 0; ti < cells.length; ti++) {
          tcell = cells[ti]; if (!tcell.c3 || tcell.c3[3]) continue;
          var band = clamp((tcell.lum + (tcell.r2 - 0.5) * (hi - lo) * 0.3 - lo) / Math.max(1, hi - lo), 0, 0.999);   // 0 = darkest
          tcell.c3 = TN[tn - 1 - Math.floor(band * tn)];
          tcell.col = rgb(tcell.c3[0], tcell.c3[1], tcell.c3[2]);
        }
      }
      // Contrast: push each leaf's lightness away from the tree's average, so light leaves get lighter and
      // dark leaves get darker. Where the light and dark leaves sit does not change, only how far apart they are.
      if (CONTRAST !== 1) {
        var lsum = 0, lcnt = 0, li, lc2;
        function lumOf(a) { return 0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]; }
        for (li = 0; li < cells.length; li++) { lc2 = cells[li]; if (lc2.c3 && !lc2.c3[3]) { lsum += lumOf(lc2.c3); lcnt++; } }
        var lmean = lsum / Math.max(1, lcnt);
        for (li = 0; li < cells.length; li++) {
          lc2 = cells[li]; if (!lc2.c3 || lc2.c3[3]) continue;           // a 4th value marks a colour to leave alone
          var l0 = Math.max(1, lumOf(lc2.c3)), l1 = clamp(lmean + (l0 - lmean) * CONTRAST, l0 * 0.5, 250);
          var cr2 = lc2.c3[0], cg2 = lc2.c3[1], cb2 = lc2.c3[2];
          if (l1 > l0) { var up = (l1 - l0) / Math.max(1, 255 - l0); cr2 += (255 - cr2) * up; cg2 += (255 - cg2) * up; cb2 += (255 - cb2) * up; }
          else { var dn = l1 / l0; cr2 *= dn; cg2 *= dn; cb2 *= dn; }
          lc2.col = rgb(cr2, cg2, cb2);
        }
      }
      // Fruit: each fruit is a small picture made of symbols (see FRUIT_SHAPE): a stem hanging down with a
      // round fruit on its end. Fruits replace leaves inside the crown, keep apart from each other, stay off
      // the crown's edge, sway with the tree and are never shaken off.
      if (cfg.fruit) {
        var FR = cfg.fruit, SHAPE = FR.shape || FRUIT_SHAPE, FH = SHAPE.length, FW = SHAPE[0].length;
        var fmap = {}, fleaves = [], fplaced = [], ftries = 0, fk, fcell, fa, fb;
        for (fk = 0; fk < cells.length; fk++) {
          fmap[cells[fk].row * COLS + cells[fk].col_i] = cells[fk];
          if (!cells[fk].brown) fleaves.push(cells[fk]);
        }
        var stemCol = FR.stem ? rgb(FR.stem[0], FR.stem[1], FR.stem[2]) : null;
        while (fplaced.length < (FR.count || 5) && ftries++ < 2500 && fleaves.length) {
          fcell = fleaves[(rand() * fleaves.length) | 0];        // top-left corner of the fruit's box
          var fits = true;
          for (fa = 0; fa <= FH && fits; fa++) for (fb = -1; fb <= FW; fb++) {   // the box plus a margin must all be leaves
            var fn = fmap[(fcell.row + fa) * COLS + fcell.col_i + fb];
            if (!fn || fn.brown || fn.fruit) { fits = false; break; }
          }
          if (!fits) continue;
          for (fk = 0; fk < fplaced.length; fk++) if (Math.abs(fplaced[fk].col_i - fcell.col_i) < FW + 3 && Math.abs(fplaced[fk].row - fcell.row) < FH + 1) { fits = false; break; }
          if (!fits) continue;
          var fc3 = FR.colours[(rand() * FR.colours.length) | 0], fcol = rgb(fc3[0], fc3[1], fc3[2]);
          for (fa = 0; fa < FH; fa++) for (fb = 0; fb < FW; fb++) {
            var mark = SHAPE[fa].charAt(fb);
            if (mark === " ") continue;                          // this spot stays a leaf
            var fq = fmap[(fcell.row + fa) * COLS + fcell.col_i + fb];
            fq.fruit = true;
            if (mark === "|") { fq.ch = "|"; fq.col = stemCol || fcol; }
            else { fq.ch = FR.symbol || "*"; fq.col = fcol; }
          }
          fplaced.push(fcell);
        }
      }
      grid = new Array(rows * COLS);                        // which cell sits at each grid spot (null = empty)
      for (var gi = 0; gi < grid.length; gi++) grid[gi] = null;
      for (var gk = 0; gk < cells.length; gk++) grid[cells[gk].row * COLS + cells[gk].col_i] = cells[gk];
      groundY = maxY + cellH * 0.6;
      pile = []; pileH = []; pileTotal = 0;
      for (var cc = 0; cc < COLS; cc++) { pile.push([]); pileH.push(0); }
    }

    function addLeaf(x, y, vx, vy, col) {
      parts.push({ x: x, y: y, vy: vy, vx: vx, ph: Math.random() * 6.283, age: 0, col: col, w: 0.7 + Math.random() * 0.6,
                   ch: LEAF_SET ? LEAF_SET.charAt((Math.random() * LEAF_SET.length) | 0) : SYM.fall });
    }
    function randLeafCell() {
      for (var tries = 0; tries < 40; tries++) {
        var c = cells[(Math.random() * cells.length) | 0];
        if (c && !c.brown && !c.fruit) return c;
      }
      return null;
    }
    function shedColour(c) { return Math.random() < FALL_CHANCE ? fallColour() : c.col; }
    function land(q) {
      var c = clamp(Math.floor(q.x / cellW), 0, COLS - 1), moved = 0;
      while (moved < 12) {                                  // roll to a lower neighbour, keeps the pile flat
        var l = c > 0 ? pileH[c - 1] : 99, r = c < COLS - 1 ? pileH[c + 1] : 99, h = pileH[c];
        var goL = l <= h - 1, goR = r <= h - 1;
        if (!goL && !goR) break;
        if (goL && goR) c += Math.random() < 0.5 ? -1 : 1; else c += goL ? -1 : 1;
        moved++;
      }
      if (pileH[c] >= MAXH) return;
      pile[c].push({ col: q.col, jx: (Math.random() - 0.5) * cellW * 0.7, ch: q.ch });
      pileH[c]++; pileTotal++;
    }
    function kick() { bendV += (Math.random() < 0.5 ? -1 : 1) * 30; }
    function spawn() {
      if (parts.length > MAX_PARTS) return;
      var vy = (46 + Math.random() * 34) * (S / 600);
      if (SKY) { addLeaf(Math.random() * S, -6, 0, vy * 0.7, fallColour()); return; }
      var c = randLeafCell(); if (!c) return;
      addLeaf(c.x, c.y, 0, vy, fallColour());
    }

    function frame(now) {
      if (!ready || !cells.length) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000, sc = S / 600;

      var dec = Math.exp(-dt * 3.5); pvx *= dec; pvy *= dec;
      var spd = Math.sqrt(pvx * pvx + pvy * pvy) / (1300 * sc);
      windX += (clamp(pvx / (1100 * sc), -1.6, 1.6) - windX) * Math.min(1, dt * 7);
      windMag += (clamp(spd, 0, 2) - windMag) * Math.min(1, dt * 6);
      bendV += (-60 * bend - 7 * bendV + 55 * (windX + ext)) * dt; bend += bendV * dt;   // springy sway
      acc += AMBIENT_RATE * dt;
      while (acc >= 1) { acc -= 1; spawn(); }

      // leaves come loose only while the tree itself is shaking
      var shake = (bendV / 7.7) * (bendV / 7.7);
      shedAcc += Math.max(0, shake - 0.15) * 55 * dt;
      while (shedAcc >= 1) {
        shedAcc -= 1;
        var sc2 = randLeafCell();
        if (sc2 && parts.length < MAX_PARTS) addLeaf(sc2.x, sc2.y, (Math.random() - 0.5) * 20 * sc, (10 + Math.random() * 25) * sc, shedColour(sc2));
      }
      decayAcc += dt;
      if (decayAcc > 0.35 && pileTotal > 50) {
        decayAcc = 0;
        for (var z = 0; z < 6; z++) { var dc = (Math.random() * COLS) | 0; if (pileH[dc]) { pile[dc].shift(); pileH[dc]--; pileTotal--; break; } }
      }

      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, S, S);
      lctx.font = "bold " + (cellW / 0.55).toFixed(1) + "px ui-monospace, Menlo, Consolas, monospace";
      lctx.textAlign = "center"; lctx.textBaseline = "middle";
      var gust = 0.65 + 0.35 * Math.sin(t * 0.37) * Math.sin(t * 0.91 + 1.3);
      var thick = cellW * 0.16;

      // The wind mainly swaps symbols: each grid spot shows the symbol that sits a few cells upwind,
      // so neighbouring symbols appear and disappear and the tree seems to move.
      var windAmp = 1 + windMag * 1.4;
      // Trees with bigger leaf symbols are drawn in two passes (wood first, then leaves in the bigger font).
      var passes = LEAF_SCALE !== 1 ? 2 : 1;
      for (var pass = 0; pass < passes; pass++) {
      if (pass === 1) lctx.font = "bold " + (cellW / 0.55 * LEAF_SCALE).toFixed(1) + "px ui-monospace, Menlo, Consolas, monospace";
      for (var r = 0; r < rows; r++) {
        var dy = (r + 0.5) * cellH;
        var lift = Math.pow(clamp(1 - dy / S - 0.12, 0, 1), 1.6);   // trunk base stays put, canopy moves most
        for (var c = 0; c < COLS; c++) {
          var dx = (c + 0.5) * cellW;
          var wave = Math.sin(t * 1.3 + dx * 0.012 + dy * 0.02) + 0.5 * Math.sin(t * 2.4 + dx * 0.03);
          var hsh = ((r * 73856093) ^ (c * 19349663)) >>> 0;
          var flutter = Math.sin(t * 2.3 + (hsh % 1000) * 0.00628) * 0.45;   // makes the moving edge flicker, not band
          var shift = (wave * SWAY * SWAY_CELLS * gust * windAmp + bend * BEND_CELLS + flutter * (0.3 + windMag)) * lift;
          var sc0 = c - Math.round(shift);
          if (sc0 < 0 || sc0 >= COLS) continue;
          var cell = grid[r * COLS + sc0];
          if (!cell) continue;
          if (passes === 2 && (pass === 1) === cell.brown) continue;
          var s = Math.sin(t * 3.2 + cell.phase * 3 + cell.x * 0.05) * Math.sin(t * 1.7 + cell.phase);
          lctx.globalAlpha = clamp(0.9 + s * SHIMMER * 0.35, 0.35, 1);
          lctx.fillStyle = cell.col;
          if (!hasFilter) { lctx.shadowColor = cell.col; lctx.shadowBlur = GLOW * 9 * dpr; }
          // on top of the grid swap, a small smooth sway so the movement and the shake read clearly
          var ox = wave * SWAY * 9 * lift * gust * sc * windAmp + bend * 6 * lift * sc
                 + (!cell.brown ? SHIMMER * 1.1 * s * (1 + windMag * 3.5) : 0);
          var oy = Math.cos(t * 1.1 + dx * 0.02) * SWAY * 2.2 * lift * sc;
          if (!cell.brown) oy += LEAF_DY * cellH;
          lctx.fillText(cell.ch, dx + ox, dy + oy);
          lctx.fillText(cell.ch, dx + ox + thick, dy + oy);
        }
      }
      }

      for (var pc = 0; pc < COLS; pc++) {                   // the little pile on the ground
        var stack = pile[pc];
        for (var k = 0; k < stack.length; k++) {
          var lf = stack[k], ly = groundY - (k + 0.4) * cellH * HALF, lx = (pc + 0.5) * cellW + lf.jx;
          lctx.globalAlpha = 1; lctx.fillStyle = lf.col;
          if (!hasFilter) { lctx.shadowColor = lf.col; lctx.shadowBlur = GLOW * 9 * dpr; }
          lctx.fillText(lf.ch, lx, ly); lctx.fillText(lf.ch, lx + thick, ly);
        }
      }

      for (var n = parts.length - 1; n >= 0; n--) {         // falling bits, calm drift only
        var q = parts[n];
        q.age += dt;
        q.vx -= q.vx * Math.min(1, dt * 2.5);
        q.vy += (60 * sc * q.w - q.vy) * Math.min(1, dt * 0.8);
        q.y += q.vy * dt;
        q.x += (Math.sin(t * 1.6 + q.ph) * 15 + gust * 9) * sc * dt + q.vx * dt;
        var pcol = clamp(Math.floor(q.x / cellW), 0, COLS - 1);
        var top = groundY - pileH[pcol] * cellH * HALF;
        if (q.x < -20 || q.x > S + 20) { parts.splice(n, 1); continue; }
        if (q.y >= top) { land(q); parts.splice(n, 1); continue; }
        lctx.globalAlpha = Math.min(1, q.age * 3);
        lctx.fillStyle = q.col;
        if (!hasFilter) { lctx.shadowColor = q.col; lctx.shadowBlur = GLOW * 9 * dpr; }
        lctx.fillText(q.ch, q.x, q.y);
        lctx.fillText(q.ch, q.x + thick, q.y);
      }
      lctx.globalAlpha = 1; lctx.shadowBlur = 0;

      drawGlow(ctx, layer, GLOW, dpr, hasFilter);
    }

    function resize(size) {
      S = size;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = layer.width = Math.round(S * dpr);
      canvas.height = layer.height = Math.round(S * dpr);
      parts.length = 0;
      if (ready) build();
    }

    // wind only while the pointer is held; pressing shakes the tree
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; pvx = 0; pvy = 0;
      lastPX = e.clientX; lastPY = e.clientY; lastPT = performance.now();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      kick();
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var now = performance.now(), x = e.clientX, y = e.clientY;
      if (lastPX !== null) {
        var dtp = Math.max(8, now - lastPT) / 1000;
        pvx = pvx * 0.45 + (x - lastPX) / dtp * 0.55; pvy = pvy * 0.45 + (y - lastPY) / dtp * 0.55;
      }
      lastPX = x; lastPY = y; lastPT = now;
    });
    function release() { dragging = false; lastPX = null; }
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    if (hasImage) { img.onload = function () { ready = true; build(); }; img.src = cfg.image; }

    return { resize: resize, frame: frame, drive: function (w) { ext = w; } };
  }

  register({ id: cfg.id, title: cfg.title, hint: cfg.hint || "hold + drag, press to shake", create: create });
}
