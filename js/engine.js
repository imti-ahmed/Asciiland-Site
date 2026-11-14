// Shared helpers used by every piece.

export const pieces = [];

export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function mix(a, b, f) { return a + (b - a) * f; }
export function rgb(r, g, b) { return "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")"; }

// Make a colour brighter and more vivid: boost its saturation, then lift it so its strongest channel is near full.
export function bright(r, g, b, floor) {
  var lum = 0.299 * r + 0.587 * g + 0.114 * b;
  r = clamp(lum + (r - lum) * 1.35, 0, 255); g = clamp(lum + (g - lum) * 1.35, 0, 255); b = clamp(lum + (b - lum) * 1.35, 0, 255);
  var mx = Math.max(r, g, b, 1), k = Math.max(1, (floor || 245) / mx);
  return [Math.min(255, r * k), Math.min(255, g * k), Math.min(255, b * k)];
}

// Small seeded random generator, so a tree looks the same on every load.
export function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const hasFilter = "filter" in CanvasRenderingContext2D.prototype;

// Draw the crisp symbol layer onto the visible canvas with a soft glow behind it.
// The blur is done on half-size copies: it looks the same but costs about a quarter, which keeps
// the carousel smooth with several trees on screen.
export function drawGlow(ctx, layer, glow, dpr, withFilter) {
  var W = layer.width, H = layer.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (withFilter && glow > 0) {     // glow 0 = glow switched off
    var g = layer._glow || (layer._glow = { a: document.createElement("canvas"), b: document.createElement("canvas") });
    var hw = W >> 1, hh = H >> 1;
    glowPass(ctx, layer, g.a, hw, hh, W, H, glow * 14 * dpr / 2, 1.5, 0.55 + glow * 0.4);
    glowPass(ctx, layer, g.b, hw, hh, W, H, glow * 4.5 * dpr / 2, 1.4, 0.6 + glow * 0.3);
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(layer, 0, 0);
}

function glowPass(ctx, layer, half, hw, hh, W, H, blurPx, sat, alpha) {
  if (half.width !== hw || half.height !== hh) { half.width = hw; half.height = hh; }
  var h = half.getContext("2d");
  h.clearRect(0, 0, hw, hh);
  h.filter = "blur(" + blurPx.toFixed(1) + "px) saturate(" + sat + ")";
  h.drawImage(layer, 0, 0, hw, hh);
  h.filter = "none";
  ctx.globalAlpha = alpha;
  ctx.drawImage(half, 0, 0, W, H);
}

// A piece = { id, title, hint, create(canvas) -> { resize(size), frame(now) } }
export function register(piece) { pieces.push(piece); }
