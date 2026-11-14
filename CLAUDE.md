# Asciiland

A small website of living ASCII-art trees you can interact with. Pure digital-art experimentation. Inspired by feralui.dev/pixel-play: a grid of small interactive pieces.

## Stack (keep it this simple)
- Plain HTML, CSS and JavaScript (ES modules), bundled and served by **Vite**. Vite is the only dependency. No framework, no other libraries. The only network call is the visitor counter (`js/counter.js`), which uses the free outside service abacus.jasoncameron.dev; add no others without asking.
- Run it: `npm install` once, then `npm run dev` (live reload). Build check: `npm run build` (output goes to `dist/`, never edit it).
- Use `import` / `export` between files. Images are embedded as base64 in a `.js` file under `assets/` (exporting a string) so the tree image loads without extra files.
- Ask before adding any other dependency or tool. The default answer is no.

## Hosting (Vercel)
- Hosted on Vercel. It detects Vite and runs `npm run build`, then serves `dist/`. `index.html` must stay at the repo root (it is Vite's entry).
- `vercel.json` only adds two safe headers. Keep it minimal.
- Everything committed to the repo is public. Never put private notes, keys or secrets in it.
- Deploys: pushing to `main` deploys to production; other branches get preview links.

## Design source
- The page design is in Figma: file `AxDa8ufIKOyEqjGs8JDqmL`, node `4427:3` ("Main Page"). Match it exactly: grey `#f2f2f4` background, Aileron font (600 and 700), 14px text, white pill buttons with the shadow from the design. Changes from Figma (owner's choice): the About and Story links are white pills, written `/ About` and `Story /` with a single slash; the visitor pill's icon is an ASCII face `(^_^)` instead of the pixel image, and in that pill the number is bold and "Cuties Visited" is semibold (the reverse of Figma).
- The empty middle of the page is reserved for the ASCII art. Don't add other content there.
- Art size: every piece is drawn in a square no bigger than `MAX_ART_SIZE` (top of `js/main.js`). Change the size there, not inside pieces.

## Layout
- `index.html` — the page (Vite entry); loads `js/main.js`.
- `css/style.css` — page styles and the Aileron font-face.
- `js/engine.js` — shared helpers (`clamp`, `mix`, `rgb`, `rng`, `drawGlow`) and `register`.
- `js/main.js` — a cyclic (endless loop) carousel: pieces sit side by side, Back/Next always slide the row one tree and the last tree is followed by the first. Trees on screen are animated; the loop grows with the window width.
- `js/tree.js` — the shared tree engine (`makeTree(settings)`): turns a picture or painted shape into symbols, wind, shaking, falling bits and the ground pile. The settings are documented at the top of the file.
- `js/painters.js` — draws tree shapes in code (currently the conifer) for trees that have no picture.
- `js/counter.js` — the visitor pill: adds 1 per page load on the live site, only reads the number on localhost.
- `js/pieces/<name>.js` — one small file per tree: just its settings (symbols, colours, falling bits) passed to `makeTree`.
- `assets/` — embedded images. `assets/tree-sheet.js` (six flat trees), `assets/crayon-sheet.js` (nine crayon trees) and `assets/green-sheet.js` (green outlined trees and bushes) are sheets; a piece picks one tree with `crop`.

## Adding a new piece
1. Create `js/pieces/<name>.js` calling `makeTree({...})` (copy a similar piece). Use a picture (`image`) or a painter from `js/painters.js` (`paint`).
2. Add `import "./pieces/<name>.js";` to `js/main.js`; the order there is the order of the carousel.
3. Add an entry to `BUILDLOG.md`.
4. Only write a new engine/painter when settings can't express the tree. Never copy the engine into a piece.

## Look and feel rules
- Carousel movement is spring-based (speeds up, overshoots slightly, settles), and the trees lean and shake in the direction it moves.
- All trees stand on the same ground line: the engine shifts each tree so its lowest wood cell lands on the same row (`GROUND_MARGIN` in `js/tree.js`). New trees get this automatically; don't position trees by hand.
- The carousel is cyclic and infinite: it never rewinds or stops at an end, it keeps sliding in the same direction. Trees must never pop in or out on screen: the loop is always long enough that the wrap-around jump happens off-screen, and every tree that is on screen keeps animating.
- Colours: always lean bright and vivid, never dull or muddy. When taking colours from a picture, brighten them (`bright()` in `js/engine.js`). This goes for trunks too.
- Three leaf colours: every tree's leaves use exactly three colours, light, middle and dark (`tones` for picture trees, `stepLeaf` for painted ones), laid out by the artwork's own light and dark areas. Exception: the Spring Tree also has pink blossom.
- Leaf contrast: light and dark leaves should be clearly different but not harsh. The engine widens the difference automatically (`contrast` in a tree's settings, default 1.6); it must not change where the light and dark leaves sit.
- No snow or winter themes. No bare trees.
- Grey page (`#f2f2f4`). Everything is symbols in their true colour with a soft glow. No background blocks or tinted rectangles.
- Symbol families: leaves are `/` on (almost) every tree, and falling leaves and petals are `/` too. Exceptions: the Pink Tree's leaves are `*`, and the Terracotta Tree's leaves are `+`. Branches are `|`. Trunks are `#` by default, but a tree can use `|` for its trunk when that suits it better (the Terracotta Tree and the Golden Tree do). Only change a tree's leaf symbol if the owner asks for that specific tree. No fruit on trees for now (the engine's `fruit` setting exists but is unused; the owner didn't like how fruit looked).
- Pieces contain no text on the canvas. Nothing else is drawn on the art itself.
- ASCII motion rule: movement (wind, sway, shake) is mainly neighbouring symbols appearing and disappearing on the character grid. On top of that, a small smooth sub-cell sway is layered in so the motion and shakes stay clearly visible. Don't rely on smooth sliding alone.
- Interaction must work with mouse and touch (pointer events, `touch-action: none`).

## Code rules
- Small, readable files. One piece per file, no piece depends on another piece.
- No per-frame allocations beyond particles. Cap particle counts.
- Clamp `dt` (max 0.05s). Respect `devicePixelRatio` (max 2). Rebuild on resize, debounced.
- Comments explain why, not what.

## Working with the owner
- The owner is not technical: explain changes in plain language, keep answers short.
- Ask before adding any dependency or tooling beyond Vite. The default answer is no.
- Update `BUILDLOG.md` with every meaningful change.
- Commit only when asked. Work directly on the `main` branch (owner's choice); no feature branches unless asked. Remember that pushing `main` deploys the live site.
- Never open Claude in Chrome, a browser, a preview, or a local server (that includes `npm run dev` and `npm run preview`) yourself. The owner checks the page by hand. Don't use the browser tools at all, even to verify your own work.
