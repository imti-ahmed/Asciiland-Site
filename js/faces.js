// Smiley faces for round crowns of leaves: each ball of leaves becomes a big smiley, with two eyes and a smile.
//
// A piece lists its balls in `faces` as [x, y, radius], all as fractions of the cropped picture (x and y across and
// down, radius as a share of the picture's width). List the balls nearest the viewer first: a leaf belongs to the first
// ball it sits in, so a ball hidden behind another only shows the part of its face that is not covered.
//
// The face is either drawn in its own colour (`colour` given: the eye and smile cells are recoloured, and are never
// shaken loose) or carved out of the ball (no colour: those cells are left empty). `symbols` = [eye, smile] gives them
// their own symbols instead of the leaf symbol. `rim` = {colour, symbol} also draws a border: the leaves along the
// outer edge of each ball get that colour and symbol.

// cells: the tree's cells ({x, y, brown, col}, in pixels). S: the square's size in pixels. fw, fh: how much of the
// square the picture covers across and down. cellW, cellH: size of one symbol cell. colour: css colour or null.
// symbols: [eye symbol, smile symbol] or null. rim: { colour (css), symbol } or null.
// Returns the cells (without the face parts, if there is no colour).
export function paintFaces(cells, faces, S, fw, fh, cellW, cellH, colour, symbols, rim) {
  var balls = faces.map(function (f) {
    return { x: (0.5 - fw / 2 + fw * f[0]) * S, y: (0.5 - fh / 2 + fh * f[1]) * S, r: fw * f[2] * S };
  });
  var kept = [];
  for (var i = 0; i < cells.length; i++) {
    var c = cells[i], ball = null;
    if (!c.brown) for (var b = 0; b < balls.length; b++) {
      if (Math.hypot(c.x - balls[b].x, c.y - balls[b].y) <= balls[b].r) { ball = balls[b]; break; }
    }
    var face = ball ? onFace(c.x - ball.x, c.y - ball.y, ball.r, cellW, cellH) : 0;
    if (rim && ball && !face && Math.hypot(c.x - ball.x, c.y - ball.y) >= ball.r - Math.max(0.12 * ball.r, cellW * 1.2)) {
      c.col = rim.colour; c.ch = rim.symbol;                    // the border: the outer edge of the ball
    }
    if (face && colour) {
      c.col = colour; c.fruit = true;                           // `fruit` keeps it from being shaken off like a leaf
      if (symbols) c.ch = symbols[face - 1];
    }
    if (!face || colour) kept.push(c);
  }
  return kept;
}

// Is the spot (dx, dy) from the ball's middle part of an eye (1) or the smile (2), or neither (0)? Every part is at least one cell big,
// so even a small ball keeps a readable face.
function onFace(dx, dy, r, cellW, cellH) {
  var ew = Math.max(0.17 * r, cellW * 0.9), eh = Math.max(0.2 * r, cellH * 0.55);   // each eye: a small oval
  for (var side = -1; side <= 1; side += 2) {
    var ex = (dx - side * 0.38 * r) / ew, ey = (dy + 0.2 * r) / eh;
    if (ex * ex + ey * ey <= 1) return 1;
  }
  var mouthY = dy + 0.05 * r, ring = Math.hypot(dx, mouthY), thick = Math.max(0.18 * r, cellH * 0.9);   // the smile: the bottom of a ring
  return mouthY > 0.15 * r && Math.abs(dx) <= 0.55 * r && Math.abs(ring - 0.5 * r) <= thick / 2 ? 2 : 0;
}
