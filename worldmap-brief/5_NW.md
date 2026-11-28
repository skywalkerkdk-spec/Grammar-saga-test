# Panel 5: NORTH-WEST

Layout guide image (use it as the placement reference, do NOT draw its text): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/NW_guide.png

Also use the finished neighbor panel image(s) the person will attach and CONTINUE their touching edge exactly: this panel's RIGHT edge continues the NORTH-CENTER panel's LEFT edge; this panel's BOTTOM edge continues the SOUTH-WEST panel's TOP edge.

--- 1단계: 지도 ---
IMPORTANT — WHAT THIS IS: a classic Final Fantasy / Dragon Quest style OVERWORLD map: one huge illustrated continent seen from above. The hero walking on it is only about 40 px tall, so EVERYTHING must be drawn SMALL: towns and dungeons appear ONLY as tiny icons (world-map sprites, like a 2-tile-wide FF town). Do NOT draw detailed towns: no streets, plazas, many buildings, interiors or town layouts. A separate screen handles what is inside a town; here a town is just a tiny recognizable cluster you step onto. Everything else is landscape: terrain, roads, rivers, forests, mountains, coast. The world should feel VAST and mostly empty between sites.

Create ONE panel of a seamless 6-panel (3 columns x 2 rows) top-down overworld map for a JRPG ("Grammar Saga"). HIGH-RESOLUTION HAND-PAINTED fantasy illustration (like a modern HD JRPG world map or a painted game-art map), NOT pixel art: smooth anti-aliased brush detail, no chunky or visible large pixels, no dithering, no upscaled/blurry look. Same painterly palette and lighting as the rest of the game (warm daylight from the upper left, saturated greens, sandy road beige).
- RESOLUTION AND DETAIL: render at the highest native resolution you can (3072x2048); do not upscale a small image. Fine detail everywhere: the smallest visible details (grass tufts, pebbles, leaves, flowers) should be only about 3-5 px; a single tree is about 50-70 px wide; rocks 30-80 px. Texture should stay crisp when viewed at 100%.
Technical rules:
- Output 3072x2048 px. Strictly top-down (3/4 JRPG view like SNES-era Final Fantasy overworld, but high resolution), no perspective tilt, no vignette, no border or frame.
- NO text, NO labels, NO numbers, NO UI, NO characters, NO monsters, NO map icons or markers. The attached layout guide image contains text labels only to tell you what goes where: do not draw any of it.
- Follow the attached layout guide: each town/dungeon must be centered within +-100 px of its coordinates (given at 3072x2048 scale below; the guide is at 1/2 scale). Colored ellipses on the guide only hint at terrain. Yellow lines on the guide are side paths from the main road to a site; follow them loosely (paths may curve).
- Towns: a TOWN ICON only, about 110x90 px: 3-5 tiny roofs, perhaps a small wall, ONE clear entry spot on the south side where the road touches it. Each town gets one unmistakable silhouette (see its description). NEVER larger than 130x110 px.
- Dungeon entrances: a DUNGEON ICON only, about 90x90 px (cave mouth, stone gate, tower, ruin arch...), each clearly different and readable, with a worn path at least 70 px wide leading to the road. NEVER larger than 110x110 px.
- Main road: a clearly visible worn dirt/cobble band, 90-110 px wide (NOT a thin trail; the hero is only 40 px tall, so the road must look about 2-3 hero-widths wide), winding naturally, that links all towns. Side paths at least 70 px wide. Everything walkable must read as clearly walkable (road, grass, sand, shallow ground, bridges).
- Blocked terrain (deep water, cliffs, tree walls, mountain ridges, fences, lava) must be clearly distinguishable from walkable terrain with crisp edges, and the player must be able to walk from the road to EVERY site on this panel without crossing blocked terrain.
- Between sites leave large open walkable terrain (at least 700x600 px) so the player can wander and meet monsters; vary terrain by region (see zones).
- Panel edges: only the roads listed below may touch an inner seam; at every inner seam the ground texture, grass color and lighting must be identical on both sides so the panels stitch seamlessly. Terrain features (hills, forest, rivers) may continue across seams. The outer edges of the continent (top of the top row, bottom of the bottom row, left of the left column, right of the right column) have a 150 px band of ocean or sheer cliff (impassable).

PANEL: NORTH-WEST (grid position: column 1 of 3, row 1 of 2; the whole continent is 3 x 2 panels = 9216x4096 px).
Geography: Left and top edges are ocean; the Isle of Proverbs sits in a bay in the north-west corner, joined by a causeway. West: foggy swamp (d9). Centre: ice cave in a snowfield (d10), volcanic canyon (d11). South and east: hills with Ifhaven and Compare Hills towns and their caves. The main road enters from the RIGHT edge, goes past Ifhaven and ends at Compare Hills near the bottom-left.
Road crossings on this panel's seams (keep exactly): RIGHT edge: the main road crosses at y=900. Edges not listed have NO road: keep them open grass/forest/rock continuing the terrain, with no sites within 250 px.

Sites (center coordinates in px at 3072x2048):
| id | place | type | x,y (px) | description / terrain |
|---|---|---|---|---|
| sj(town) | Ifhaven / 이프헤이븐 | TOWN ICON (~110x90 px) | 2400,800 | Tiny icon, Ifhaven: signature look = cliffside terraced town with a waterfall, arched aqueduct, red-roofed hall, mountain peaks |
| sj | Subjunctive Citadel / 서브정티브 성채 | DUNGEON ICON (~90x90 px) | 2504,1668 | Citadel on a high misty crag, long stairway up |
| cp(town) | Compare Hills / 컴페어힐스 | TOWN ICON (~110x90 px) | 700,1750 | Tiny icon, Compare Hills: signature look = green grassy plaza on terraced golden hills, red and blue roofs, small stream with a wooden bridge |
| cp | Comparative Hills cave / 컴패러티브 언덕 | DUNGEON ICON (~90x90 px) | 1623,1477 | Cave in a terraced hill |
| pv | Isle of Proverbs / 이디엄·속담 섬 | DUNGEON ICON (~90x90 px) | 330,330 | Small island with a sage's stone hall and a lighthouse, joined to the mainland by a stone causeway (walkable, ~140 px wide) |
| d9 | Clause Swamp / 클로즈 늪지 | DUNGEON ICON (~90x90 px) | 330,1148 | Foggy swamp with a rotting boardwalk leading to a sunken wooden gate, hanging moss |
| d10 | Phrase Ice Cave / 프레이즈 얼음 동굴 | DUNGEON ICON (~90x90 px) | 1090,786 | Snowfield; ice-cave mouth under a frozen waterfall |
| d11 | Predicate Volcano Canyon / 프레디킷 화산 협곡 | DUNGEON ICON (~90x90 px) | 1752,330 | Volcanic canyon, glowing lava streams, smoking crater, cave gate in black rock |

--- 2단계: 마스크와 지형 구역도 (완성된 이 패널 이미지를 첨부하고 아래를 붙여넣기) ---
PANEL: NORTH-WEST.
Using the finished panel as reference, output two flat 3072x2048 images, no anti-aliasing, no text, pixel-exact alignment with the panel:
(A) WALK MASK: pure white = walkable (roads, grass, sand, shallow ground, bridges, causeways, town gates, dungeon entrance tiles, shore paths), pure black = blocked (deep water, lava, cliffs, mountain ridges, tree walls, buildings, castle walls, fences). Every site must be reachable from the main road through white pixels only.
(B) ZONE MAP: flat colors, one per terrain zone, used to decide random monster encounters:
  #2e8b3a grassland   #145a28 forest   #d8c060 desert   #e8d890 coast/sand   #7aa8c8 lakeshore   #b08a5a hills/rock   #90a8b8 snow/ice   #c85030 volcanic   #6a5a7a swamp/corrupted   #b8a060 wheat/farmland
Towns, dungeon entrances and a 100 px ring around them are marked with pure #ffffff (safe zone, no encounters).
