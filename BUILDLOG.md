# Build Log

Newest entry on top. Each entry: date, what changed, anything to remember.

## Up next
- Better tree artwork (waiting on the owner's direction: pictures vs code).
- Make the Pine more Christmassy if wanted.
- Carousel layout: show several trees side by side in the stage.
- Decide on page title/intro wording and overall look of the grid.
- Per-piece tuning controls if wanted (shake strength, leaf count, pile size, wind sensitivity).

## 2026-11-15 — Leaf rustle on press
- Added the owner's leaf rustle sound (5 seconds, 120 KB) as `assets/sounds/leaf-rustle.mp3`. It plays whenever any tree is pressed (mouse or touch), over the background forest sound, which keeps looping underneath.
- It follows the Sound pill (silent on "Sound Off"). Presses closer together than 0.12 seconds do not start another one; otherwise rustles can overlap. Volume is `RUSTLE_VOLUME` in `js/sound.js` (first 0.8, then lowered to 0.4, 0.1 and finally 0.05 at the owner's request).
- Speed: the rustle first used a plain audio element, which lagged on a press. It is now decoded once at page load and played from memory with the Web Audio API, so it starts at once. (The very first press also has to wake the browser's audio, which can take a moment.) The background loop is unchanged.
- Cropped (owner's request): 0.5 seconds are cut off the start (first 1 second, then 0.05, then 0.5) and 1 second off the end of the clip, so about 3.6 seconds play, with a quick fade-in and a fade-out at the cuts. (First read wrongly as "keep the first 1s and last 2.5s"; the owner meant cut those, then asked to cut only 1 second at the end instead of 2.5.) This is done in the page (`crop()` in `js/sound.js`, `RUSTLE_CUT_START_S` / `RUSTLE_CUT_END_S`); the mp3 file itself is unchanged, so the full clip is still there to re-crop.
- The tree's own shake and falling leaves are unchanged. Checked: `npm run build` succeeds and bundles both sounds. Not checked in a browser (sound can only be judged by ear).

## 2026-11-15 — Background sound
- Added the owner's sound effect as a quiet loop in the background (`VOLUME` 0.5 in `js/sound.js`) to give the trees a natural feel. It is a local file: no new network call. First it was a recording of wind in tree branches; the owner then swapped it for an autumn forest atmosphere recording (30 seconds, 720 KB), now `assets/sounds/forest-ambience.mp3`.
- The Sound pill controls it: "Sound On" plays, "Sound Off" fades it out. Browsers do not allow sound before the visitor has interacted, so it starts on the first click, tap or key press (and at once if the browser allows). It fades in over 1.5 seconds, and pauses while the tab is hidden.
- A plain loop may have a tiny gap at the join (MP3 files have a little silence at their ends). If it is noticeable, the fix is to cross-fade two copies, or to trim the file.
- Checked: `npm run build` succeeds and bundles the file. Not checked in a browser (sound can only be judged by ear).

## 2026-11-15 — SOUND pill
- Added a white pill after Next in the bottom bar (`#sound` in `index.html`), in the same style as Back and Next. It reads "Sound On" (written like the other pills) and switches to "Sound Off" when clicked, and back again (`js/sound.js`). It starts on at every page load. (A version that always stayed on, and an all-capitals version, were tried first.)
- It sits in its own group, 36px from the Back/Next pills: the same gap as between the visitor pill and Back/Next (the `.bar` gap).
- The pill now controls real sound, see the Background sound entry above. Not in the Figma design: added at the owner's request.
- Checked: `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Smiley Tree border, Candy Tree trunk
- Smiley Tree: every ball now has a darker yellow border drawn with `\` (hatching against the `/` leaves). New `faceRim: { colour, symbol }` setting in `js/faces.js` / `js/tree.js`; it only touches the outer edge of each visible ball.
- Candy Tree: the whole trunk is now `|` (the base was `#`). This is the tree to the left of the Spring Tree ("summer tree", see the Pine entry) in the loop, since the loop wraps.
- Checked: `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Smiley Tree
- Added `js/pieces/smiley-tree.js` and `assets/logo-sheet.js` (a new sheet of nine green tree logos; this is the 8th, bottom row middle). Placed right after the Blue Tree in the carousel.
- The owner's twist: each round group of leaves becomes a big smiley. New `js/faces.js` and a `faces` setting: every ball is listed as [x, y, radius] (measured off the picture, nearest first), and two eyes and a smile are marked on it (first carved out as gaps, then changed to brown symbols). Eight balls, so eight smileys; the small pale ones behind the others only show the part of the face that is not covered.
- Colours (owner's change): leaves in the yellow range (pale yellow, yellow, golden); the eyes and smile are bright red (`faceColour`; brown and red leaves were tried), not gaps, drawn with the same `/` as the leaves (`@`/`0` were tried), and are never shaken loose. Leaves `/`, trunk `|`. Other trees are unaffected (no `faces` setting = unchanged).
- The trunk's base was ragged (the curved roots are thinner than a symbol): the piece now uses `minFill: 0.2` and a small root flare so the bottom is whole.
- Checked: printed the carved cell layout as text in Node (faces show), `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Candy Tree
- Added `js/pieces/candy-tree.js` and `assets/candy-tree.js` (the owner's candy tree: five swirly round crowns on a bendy brown trunk). Last in the carousel, after the Mushroom Tree.
- Exception to the three-leaf-colours rule (the owner chose a tree whose point is its colourful balls): each ball keeps its own hue (pink, orange, teal, yellow, purple) with the picture's light/dark shading, brightened. Leaves `/`, trunk `#`. Noted in `CLAUDE.md`.
- The grey backdrop and the faint "pngtree" watermark are dropped as background; the white shine spots on the balls are left as holes.
- Checked: printed the cell layout as text in Node (trunk and branches found, balls stay leaves), `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Mushroom Tree
- Added `js/pieces/mushroom-tree.js` and `assets/fantasy-sheet.js` (a new sheet of three painted trees; this is the bottom-left one). Last in the carousel, after the Coral Tree.
- Three leaf colours from the picture's areas: light pink dome, mid pink, dark purple stripes. The near-black trunk and branches are wood (lifted a little brighter). Leaves are a random mix of `(` and `)` (owner's choice; `^`, `x`, `+` and the double quote were tried first), trunk `#`. The grey backdrop and patch are dropped as background.
- New engine setting `minFill` (default 0.4 as before): how much of a cell the picture must cover to get a symbol. This tree uses 0.2 because its trunk and branches are thinner than a symbol and broke into pieces. Other trees are unaffected.
- The other two trees on that sheet (green bonsai-like, blue) are not used yet.
- Checked: printed the cell layout as text in Node, `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Even gaps between trees
- The gap between trees looked uneven (e.g. Blue Tree and Terracotta Tree): every tree sat in an equal square, but trees fill their square differently. Now the carousel spaces trees by what is actually drawn: the empty space between the drawn parts of any two neighbours is the same (`TREE_GAP` at the top of `js/main.js`, now 120px; it started at 40px, which was too tight).
- Each tree reports its drawn left and right edge (`bounds()` in `js/tree.js`); `js/main.js` places each tree's drawn middle along the loop. The slide still moves one tree at a time and wraps off-screen.
- This replaces the old `GAP` setting (a fixed distance between square centres). If the gaps feel too tight or too loose overall, change `TREE_GAP`.
- Checked: `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Blue Tree
- Added `js/pieces/blue-tree.js` and `assets/blue-tree.js` (the owner's blue blossom illustration). Placed right after the Pine (the Christmas tree) in the carousel.
- Three leaf colours from the picture's own areas: light blossom, bright blue crown, darker blue shade. Dark charcoal trunk (lifted a little brighter). Leaves are `0` (zero), trunk `|` (owner's choice). Falling blossom is light blue.
- The faded clouds and trees behind it are dropped as background; the blue blossom pile at the foot is cut out by height, the same way as on the Coral Tree.
- Checked: printed the cell layout as text in Node, `npm run build` succeeds. Not checked in a browser.

## 2026-11-15 — Coral Tree
- Added `js/pieces/coral-tree.js` and `assets/variety-sheet.js` (a new sheet of four flat trees; this is the top-left one). Last in the carousel, after the Golden Tree.
- Three coral leaf colours (light, coral, deep red-orange), warm brown trunk, `/` leaves, `#` trunk. The bushes at the foot are cut out (the owner asked): `paper` in the piece drops anything non-brown below a height. For that, `paper` now also gets the spot's position (`u`, `v`); other trees ignore it.
- Symbols (owner's choice): the leaves are slashes following the tiers for depth: front tier `/`, the tier behind `\`, the back edge `/` (`O`/`0` and `v`/`V` were tried and dropped; falling leaves keep their tier's symbol; new engine setting `leafChar`) and the whole trunk is `|`. (Digits and `*` were tried first.)
- Layers: the three leaf colours follow the picture's own tiers (front coral, deeper tier, deep red edge behind) instead of lightness bands, so the stacked crowns stay visible as separate levels.
- The other three trees on that sheet are not used yet.
- Checked: `npm run build` succeeds. Not checked in a browser.

## 2026-11-14 — Page load animation
- On load, in order: (1) the top bar and bottom bar fade in (0.45s), (2) the middle tree (Spring) at 0.28s, (3) the other on-screen trees in left-right pairs from 0.7s, 0.22s apart: the nearest left and right together, then the next pair. Anything off-screen is shown at the end.
- Waits for the Aileron font before starting. People who ask for reduced motion see everything at once.
- Not checked in a browser. Timing numbers are in `intro()` in `js/main.js` (`MIDDLE_AT`, `SIDES_AT`, `PAIR_GAP`).

## 2026-11-14 — Story card: how it's used and built
- Story card is two short paragraphs (tried a four-point list first, then shortened): how to play (drag for wind, press to shake, Back/Next), and how it was built (illustrations turned into symbols, plain HTML, CSS and JavaScript).
- Story text is left aligned (tried right aligned, reverted). Each paragraph has a black bold headline: "How to play:" and "How it's built:" (with a colon). The About card has no headlines yet.
- Owner to review the wording.

## 2026-11-14 — About text replaced
- About card now reads the owner's new copy: "Asciiland is a tiny digital forest made from nothing but text symbols. Just a small experiment in making things on the internet for the fun of it." then "Made by Imtiyaz Ahmed." (name still black, still links to imtiyazahmed.com). Story card unchanged.
- Assumed this text is for the About card.

## 2026-11-14 — Card text
- About: "Asciiland is a small playground of living trees made of text symbols. It's a fun experiment to showcase art using simple digital experimentation." then "Ideated and built by Imtiyaz Ahmed." The name is black and links to https://www.imtiyazahmed.com (opens in a new tab, underlines on hover).
- Story: now holds the "Hold and drag to blow wind through a tree. Press it to shake its leaves loose." line (was a placeholder).
- I tidied the owner's wording slightly ("It's a fun experiment") and added a full stop after the name. The other card text is still placeholder-quality; owner to review.

## 2026-11-14 — About and Story cards
- Hovering About or Story turns its text black and opens a white card below it. The card grows from the corner nearest its pill (top-left for About, top-right for Story so it stays on screen), scaling evenly along its diagonal with a small springy overshoot; it shrinks back quickly on exit.
- The text is not scaled with the card: the empty card grows first, the text shows right after (0.13s in, as the card reaches full size); on exit the text vanishes first, then the card shrinks.
- Card motion retuned to feel smoother but still springy: a true damped-spring curve over 0.6s (soft start, about 8% overshoot, gentle settle), smooth 0.22s exit. Text fades in at 0.14s.
- Touch: tap opens, tapping elsewhere closes. Escape closes. The pills are now buttons, not links.
- Card text is placeholder: About has a short description I wrote, Story says "Placeholder". Owner to supply the real words.
- Not checked in a browser.

## 2026-11-14 — Title hover: scramble to credit
- Hovering `/ ASCIILAND /` scrambles the name (not the slashes) through ASCII symbols and settles on `/ MADE BY IMTIYAZ /`; moving away scrambles it back. On touch screens a tap shows it and tapping elsewhere restores it.
- The text opens out from its centre and the letters lock in from the middle outwards (not left to right). One change takes about 0.38s.
- Text and timing are at the top of `js/brand.js`. People who ask their device for less motion get an instant swap.
- Not checked in a browser. The title is wider while the credit shows, but stays centred.

## 2026-11-14 — Favicon
- Added the owner's pink circle with a white slash as the browser-tab icon: `assets/icons/favicon.png` (renamed from `Group 2.png`).
- The image is small; a larger export (at least 180px) would look sharper on high-resolution screens and phone home screens.

## 2026-11-14 — Real visitor counter
- The visitor pill now shows a real count, starting from 0, using the free outside service abacus.jasoncameron.dev (`js/counter.js`). Owner's choices: outside service, every page load counts, start at 0.
- Live site: each page load adds 1. Localhost: reads only, so development doesn't inflate it. If the service fails, the pill shows a dash.
- Checked: the service answers and allows calls from web pages (tested with a throwaway key, not the real one). Not checked in a browser.
- Risks: the count lives on someone else's free service (could be slow, reset or shut down), and anyone can inflate it by calling the address. To restart from 0, change `KEY` in `js/counter.js`.

## 2026-11-14 — Visitor number bold
- In the visitor pill the number is now bold (700) and "Cuties Visited" is semibold (600), swapped from the Figma frame.

## 2026-11-14 — Single slashes, ASCII heart
- Top links now read `/ About` and `Story /` (one slash, not two).
- Visitor pill: the pink pixel image is replaced by an ASCII face `(^_^)` in bright pink monospace (tried a `<3` heart first). Its strokes are thickened beyond the font's bold so it reads clearly. The image file was deleted.

## 2026-11-14 — About and Story are pills
- The two top links now use the same white pill style as Back/Next (differs from the Figma frame, by the owner's choice). Their text stays where it was.
- Their text is now bold (700) instead of semibold, still grey.
- They still link nowhere.

## 2026-11-14 — Terracotta Tree leaves are +
- Swapped the numbers for `+` (leaves, falling leaves and ground pile; tried `~` first). The `leafSet` engine setting stays, unused.

## 2026-11-14 — Terracotta Tree leaves are numbers
- New engine setting `leafSet`: each leaf is a random symbol from a list. Terracotta Tree uses `0123456789`, so its crown, falling leaves and ground pile are all digits. Each leaf keeps its number (same on every load).
- Not checked in a browser.

## 2026-11-14 — Bigger * on the Pink Tree
- New engine settings `leafScale` and `leafDy`. Pink Tree's `*` leaves are drawn 45% bigger and nudged down a little so they sit centred; its falling leaves and pile follow.
- Not checked in a browser: stars may now overlap their neighbours a bit.

## 2026-11-14 — Pink Tree leaves are *
- Pink Tree's leaves, its falling leaves and its ground pile are now `*` instead of `/` (tried `@` first).

## 2026-11-14 — Golden Tree trunk uses |
- Golden Tree's trunk is now all `|` (no `#`), like the Terracotta Tree.

## 2026-11-14 — Fruit removed, tree renamed Golden Tree
- Owner didn't like the fruit. Removed it from the tree; the piece is now `js/pieces/golden-tree.js` (**Golden Tree**): cloud-shaped yellow crown, dark purple trunk.
- The engine's `fruit` setting is still there but unused.
- Carousel order: Spring, Maple, Pine, Terracotta, Pink Tree, Golden Tree.

## 2026-11-14 — Fruit redrawn: round, made of *, on blue stems
- Each fruit is now a small symbol picture (`FRUIT_SHAPE` in `js/tree.js`): a 2-symbol blue `|` stem with a round ball of red `*` hanging from it (3, 5, 3 symbols across). 5 fruits on the Fruit Tree.
- A tree can pass its own `shape`, `symbol`, `stem` colour and `count`.
- Not checked in a browser. If fewer than 5 show, the crown is too small for them at this size.

## 2026-11-14 — Fruit Tree reshaped, bigger fruit
- Fruit Tree's crown is now the cloud shape of tree 3 (top-right) on the illustrated sheet, instead of the square. Colours unchanged: three yellows, dark purple trunk. The square picture was deleted.
- The trunk is tree 3's own trunk (thin, with one side branch), recoloured purple: the old picture's trunk could not be kept with a different picture's crown. Say if the forked trunk should come back.
- Fruit is now big and round: clusters of `@` 3 wide and 2 tall, 6 of them, kept apart and inside the crown. Rule in `CLAUDE.md` updated.
- Not checked in a browser: check for purple specks at the crown's edge and that 6 fruits fit.

## 2026-11-14 — Fruit Tree, and fruit in the engine
- New piece **Fruit Tree** from the owner's picture (`assets/square-tree.js`): square yellow crown in three yellows, thin dark purple trunk, about 14 red `@` fruits.
- Engine: new `fruit` setting swaps a few leaf spots inside the crown for a fruit symbol. Fruits keep apart, stay off the crown's edge, sway with the tree and are never shaken off.
- Carousel order: Spring, Maple, Pine, Terracotta, Pink Tree, Fruit Tree.
- Not checked in a browser. Tune fruit with `count`, `symbol` (`@` or `*`) and `colours` in `js/pieces/fruit-tree.js`.

## 2026-11-14 — Pink Tree (from the green sheet)
- Added the owner's sheet of green trees and bushes as `assets/green-sheet.js`. New piece **Pink Tree** is tree 1 (top-left): tall and slim with separate leaf clumps, recoloured to three pinks; brown trunk.
- Carousel order: Spring, Maple, Pine, Terracotta, Pink Tree.
- Not checked in a browser. It is a narrow tree, so it has less detail than the others; the neighbouring big tree is very close on the sheet, so check for stray bits on the right.
- Open question: the sheet carries an Adobe Stock watermark; check the licence before the site goes public.

## 2026-11-14 — Maple moved in the carousel
- Order is now Spring, Maple, Pine, Terracotta (Maple sits between the Spring Tree and the Pine).

## 2026-11-14 — Maple a little thinner
- New `narrow` setting squeezes a tree's width. Maple is set to 0.85 (15% thinner). This thins the trunk slightly too.

## 2026-11-14 — Maple (from the crayon sheet)
- Added the owner's sheet of nine crayon trees as `assets/crayon-sheet.js`. New piece **Maple** is tree 1 (top-left): spiky crown in yellow, orange and red, thin maroon trunk, dark veins drawn as `|` branches.
- Three leaf colours follow the picture: yellow in the middle, orange, red at the edges.
- Carousel order: Spring, Pine, Terracotta, Maple.
- Not checked in a browser. Likely to need tuning: crop edges (grass under the tree), the veins, trunk height (`trunkTop`).
- Open question: is this sheet licensed for the public site? (It has a stock-site watermark in the corner.)

## 2026-11-14 — Rainbow Bonsai removed
- Owner didn't like it. Piece and its picture deleted; carousel is back to Spring, Pine, Terracotta. The `onePiece` engine setting stays.

## 2026-11-14 — Rainbow Bonsai
- New piece from the owner's bonsai picture (`assets/bonsai.js`): thick brown trunk, six leaf pads (red, pink, teal, purple, green, yellow). Each leaf snaps to its pad's colour, brightened, in three speckled tones.
- Dark shapes where branches cross the pads are drawn as branches (`|`); the lower trunk is `#`. No root flare (base is already wide).
- Carousel order: Spring, Pine, Terracotta, Rainbow Bonsai.
- Not checked in a browser. Likely to need tuning: trunk/leaf split at pad edges, the muted purple pad, where `|` turns into `#` (`trunkTop`), overall size (`fit`).
- Open question: is this picture licensed for the public site?

## 2026-11-14 — Orange slashes under the Terracotta trunk removed
- Cause: the soft grey edge pixels around the navy trunk were being read as leaves and coloured orange. Terracotta's trunk test is now "anything not clearly orange" (`isWood`).
- Engine safety net for all trees: leaf symbols level with or below the trunk's lowest row are dropped.
- Not checked in a browser.

## 2026-11-14 — Three leaf colours per tree
- Every tree now uses three leaf colours (light, middle, dark) instead of two. Spring: three greens plus pink blossom. Pine: three greens. Terracotta: light salmon, coral, deeper terracotta.
- `tones` takes any number of colours; `twoLeaf` became `stepLeaf`. Rule in `CLAUDE.md` updated.
- Not checked in a browser. On Terracotta the middle colour may be scarce, since its picture is mostly two flat colours.

## 2026-11-14 — Spring and Terracotta use two leaf colours too
- New `tones` setting: picture trees are limited to a light and a dark leaf colour, placed by the picture's own light and dark areas (split at the middle of the picture's range, with a little speckle at the border).
- Spring: two greens plus the untouched pink blossom. Terracotta: light salmon and deeper terracotta.
- Rule added to `CLAUDE.md`. Not checked in a browser: the split point or the two colours may need tuning per tree.

## 2026-11-14 — Pine uses exactly two greens
- Pine's leaves were a smooth range of greens (a 4-colour ramp). Now each needle is one of two greens, light or dark, in the same layout (`twoLeaf` in `js/tree.js`). Falling needles use the same two.
- Spring and Terracotta still take a range of shades from their pictures.

## 2026-11-14 — More leaf contrast, same layout
- On top of the restored leaf colours, the engine now pushes each leaf's lightness away from the tree's average (`contrast`, default 1.6): light leaves lighter, dark leaves darker. The layout of light and dark leaves is unchanged.
- Spring Tree's pink blossom is left out of it.
- Not checked in a browser. Tune per tree with `contrast` (1 = off, 2 = strong).

## 2026-11-14 — Leaf shading experiments undone
- Went back to the leaf colours from before the three shading experiments below (depth shading, two colours per tree, contrast changes). Leaves are coloured from the picture / colour ramp again, as they were right after the Terracotta trunk change.
- The two-colour rule was removed from `CLAUDE.md`. The three entries below are kept as history only.

## 2026-11-14 — Softer contrast, leaf layout follows the artwork again
- The two leaf colours on each tree were brought closer together (between the first two-colour version and the high-contrast one).
- Where light and dark leaves go now follows the picture's own shading (as before the two-colour change), plus a little clumping and speckle, instead of big blotches. About half the leaves get each colour.
- Assumption: "the layout before" meant the picture-based, speckled look. Not checked in a browser.

## 2026-11-14 — Two leaf colours per tree
- Each tree's leaves now use exactly two colours (`tones`: light and dark), placed in clumps and lit from the top-left. This replaces the multi-step shading below.
- Spring: two greens plus the pink blossom. Pine: two greens. Terracotta: light salmon and deeper terracotta.
- The two colours on each tree were then pushed further apart (lighter light, deeper dark) so the difference is easy to see.
- Rule in `CLAUDE.md` updated. Not checked in a browser.

## 2026-11-14 — Stronger leaf shading for depth
- Engine now shades every tree's leaves in clear tone steps: lit from the top-left, darker low and to the right, grouped in soft clumps. Lighter tones are tinted toward white, darker ones up to about 40% darker.
- Strength per tree with the `depth` setting (default 1, 0 = flat). `leafColour` now returns `[r,g,b]`.
- Rule added to `CLAUDE.md`. Not checked in a browser: say if it is too strong, too blotchy or still too subtle.

## 2026-11-14 — Terracotta trunk uses |
- Terracotta Tree's trunk is now all `|` (no `#`). Rule in `CLAUDE.md` updated: trunks are `#` by default but can be `|` per tree.

## 2026-11-14 — Brighter colours, stray slashes removed
- New rule in `CLAUDE.md`: always use bright, vivid colours. Added `bright()` in `js/engine.js`.
- Terracotta Tree: crown colours brightened, trunk is a brighter navy. Pine: brighter greens and trunk.
- Trees cut from a sheet now keep only their biggest connected shape, which removes stray symbols caught by the crop (the 7-8 extra slashes on the Terracotta Tree). I couldn't see where they were, so check they are gone.

## 2026-11-14 — Terracotta Tree (from the illustrated sheet)
- Added the owner's sheet of six trees as `assets/tree-sheet.js`. New piece **Terracotta Tree** is tree 6 (boxy salmon crowns, dark navy trunk), cropped from the sheet and converted with the normal engine.
- Engine got four new settings: `crop`, `fit`, `paper` (which pixels are background) and `isWood` (which pixels are trunk), so trunks no longer have to be brown.
- Carousel order: Spring, Pine, Terracotta.
- Open questions: is the sheet licensed for the public site? Should sheet trees replace Spring/Pine?
- Not checked in a browser: crop edges, trunk/branch split (`trunkTop`) and colours may need tuning.

## 2026-11-14 — Smoother, slower slide
- Slide is slower and softer: `STIFFNESS` 110 -> 60, `DAMPING` 13 -> 10 (about 0.8s per move, still a small overshoot).
- Smoother: the spring now steps in small fixed slices and uses real elapsed time, so a slow frame no longer makes the movement jump; positions are no longer rounded to whole pixels.
- Less lag: the glow blur now runs on half-size copies (about a quarter of the cost per tree). Looks the same, but compare the glow by eye.
- Not checked in a browser.

## 2026-11-14 — Endless loop sized to the window
- The loop now grows to fit the window (`ensureSlots` in `js/main.js`): the jump from one end to the other always happens off-screen, so no tree pops in or out on screen, even on very wide screens. `MIN_SLOTS` is the minimum.
- Every tree that is on screen (or half a tree away) keeps animating, so none look frozen at the edges. The old `ANIMATE_RADIUS` is gone.
- Many trees animating at once is heavier; if it feels slow on a wide screen, say so.
- Not checked in a browser.

## 2026-11-14 — Trees closer again
- `GAP` in `js/main.js` changed from -80 to -150. Not checked in a browser; if the trees' leaves overlap, raise it a little (e.g. -120).

## 2026-11-14 — Trees share one ground line
- The engine now slides each tree up or down (whole rows) so its lowest trunk cell sits on the same row for every tree. The ground pile uses the same line.
- Set by `GROUND_MARGIN` in `js/tree.js` (empty rows under the trunk bottom).
- Not checked in a browser. If the Spring Tree's top gets clipped, say so.

## 2026-11-14 — Pine: green needles only, clearer trunk
- Pine's falling needles are now only greens (the brown ones are gone).
- Trunk is taller (0.15 of the picture height, `trunkH`), wider (0.07) and a richer brown, so it shows clearly under the lowest tier.
- Not checked in a browser.

## 2026-11-14 — Down to two trees
- Kept **Spring Tree** (pink and green) and **Pine** (the Christmas tree). Deleted Cherry Blossom, Weeping Willow, Golden Ginkgo and Autumn Oak, and the unused painters.
- The carousel repeats the pieces until there are at least 6 slots (`MIN_SLOTS` in `js/main.js`), so the loop never looks empty: Spring, Pine, Spring, Pine, Spring, Pine.
- Assumption: "christmas" meant the Pine and "pink-green summer tree" meant the Spring Tree.

## 2026-11-14 — Leaves are slashes everywhere
- Cherry, Willow and Pine now use `/` for leaves and falling bits too (were `@`, `:` and `^`). Rule in `CLAUDE.md` updated: `/` for leaves on almost every tree.

## 2026-11-14 — Spring physics and closer trees
- Slide is now a spring (speeds up, overshoots slightly, settles) instead of a timed tween. Tune with `STIFFNESS` and `DAMPING` in `js/main.js`.
- While the row moves, every tree is pushed to lean and shake in the direction of movement (`SWAY_PUSH`); it springs back and settles by itself, and can shake a few leaves loose.
- Trees sit closer: `GAP` is now -80 (was 48). Trees' empty edges overlap, so a neighbour can catch a drag near the edge.
- `makeTree` instances got a `drive(wind)` method for outside wind.
- Not checked in a browser: bounce, lean and spacing may need tuning by eye.

## 2026-11-14 — Carousel, winter tree removed
- Trees are lined up side by side as a cyclic carousel: Back/Next slide the row so the chosen tree is in the middle, and the last tree is followed by the first in the same direction (no rewinding).
- Only the middle tree and its neighbours animate (`ANIMATE_RADIUS` in `js/main.js`). Gap is `GAP`.
- Winter Tree deleted: no snow themes. Owner also disliked the painted trees' look; the tree artwork is being reconsidered.

## 2026-11-14 — Six new trees
- Split the Spring Tree code into a shared engine (`js/tree.js`) so each tree is a small settings file in `js/pieces/`.
- New `js/painters.js` draws tree shapes in code (no extra pictures needed).
- New trees, in carousel order after Spring Tree: **Cherry Blossom** (pink, `@` flowers), **Weeping Willow** (yellow-green strands), **Golden Ginkgo** (yellow), **Autumn Oak** (orange/red), **Pine** (dark green `^`, slow needles), **Winter Tree** (bare, snow `*` falling from the sky).
- Back/Next now cycle through all seven.
- Not checked in a browser: tree shapes, sizes and colours may need tuning by eye. Each tree's numbers are at the top of its own file.

## 2026-11-14 — Thicker trunk base
- Spring Tree: the lowest 4 rows of the trunk now flare out with extra `#` cells (3, 2, 1, 1 cells each side, bottom first). Set by `FLARE` at the top of `js/pieces/spring-tree.js`. Not checked in a browser.

## 2026-11-14 — Glow tried off, then restored
- Glow was switched off briefly, then put back at 0.26. To switch it off again, set `GLOW = 0` at the top of `js/pieces/spring-tree.js`.

## 2026-11-14 — Wind moves symbols by swapping, not sliding
- Spring Tree: every symbol now sits exactly on the character grid. Wind, sway and shake work by each grid spot showing the symbol a few cells upwind, so neighbours appear and disappear and the tree seems to move.
- Added the old small smooth sway back on top (sub-cell drift, bend, leaf tremble) so motion and shakes stay clearly visible. Rule in `CLAUDE.md` updated to match.
- Strength is set by `SWAY_CELLS` (idle sway) and `BEND_CELLS` (drag/shake) at the top of `js/pieces/spring-tree.js`, measured in grid cells.
- Rule added to `CLAUDE.md`. Not checked in a browser: sway strength may need tuning by eye.

## 2026-11-14 — Smaller tree
- Trees are now capped at 600px (was 760px, briefly 420px) so there is room for a carousel of trees. Set by `MAX_ART_SIZE` at the top of `js/main.js`.

## 2026-11-14 — Moved to Vite
- Added Vite (only dependency): `npm run dev` for live reload, `npm run build` for the final site in `dist/`.
- Scripts converted to ES modules (`import`/`export`); the page no longer opens by double-clicking `index.html`, use `npm run dev`.
- `vercel.json` simplified: Vercel now detects Vite and builds it. Added `package.json`, `package-lock.json`; `.gitignore` now ignores `dist`.
- Checked: `npm run build` succeeds. Not checked in a browser.

## 2026-11-14 — Page shell built from Figma (node 4427:3)
- Page now matches the Figma design: grey `#f2f2f4` background, top bar (`// About`, `/ ASCIILAND /`, `Story //`), and bottom bar (visitor pill, Back and Next pills).
- Font is Aileron (600 and 700), self-hosted in `assets/fonts/`. Icons are in `assets/icons/` (Back reuses the same chevron, mirrored).
- The empty middle is the stage: it shows one ASCII piece at a time; Back/Next cycle through pieces (wraps around). Spring Tree is the only piece so far.
- "82,372 Cuties Visited" is a fixed placeholder number, not a real counter yet.
- About and Story links go nowhere yet.
- Not yet checked in a browser against the Figma screenshot (preview server was blocked). Check spacing by eye.
- Frame size in Figma is about 1925px wide; bottom-bar gaps (36px between pill and nav, 6px between Back/Next) were estimated from the screenshot.

## 2026-11-14 — Vercel hosting
- Added `vercel.json` (static site, no build step, two safe headers) and `.gitignore`.
- Added a Hosting section to `CLAUDE.md` and deploy steps to `README.md`.
- Not yet connected to Vercel: the repo still needs to be imported there (see README).

## 2026-11-14 — Project set up
- Repo scaffolded as plain HTML/CSS/JS (later moved to Vite, see above).
- Added `CLAUDE.md` (rules) and this log.
- Page is a responsive grid of cards; each card is one canvas piece, with a single shared animation loop that pauses off-screen pieces.
- Piece 1: **Spring Tree** ported from the earlier standalone page (spring look, blossom leaves, hold-and-drag wind, press to shake, falling leaves, small ground pile).
- Note: could not read feralui.dev/pixel-play (page renders client-side), so the grid layout is our own simple version.
