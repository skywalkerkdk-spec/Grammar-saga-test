# Panel 1: CENTER

Layout guide image (use it as the placement reference, do NOT draw its text): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/1_CENTER_guide.png

No neighbor image is needed.


--- 1단계: 지도 ---
IMPORTANT — WHAT THIS IS: a classic Final Fantasy / Dragon Quest style OVERWORLD map: one huge illustrated continent seen from above. Towns and dungeons appear ONLY as small icons (like world-map sprites). Do NOT draw detailed towns: no streets, plazas, many buildings, interiors or town layouts. A separate screen handles what is inside a town; here a town is just a tiny recognizable cluster you step onto. Everything else is landscape: terrain, roads, rivers, forests, mountains, coast.

Create ONE panel of a seamless 3-panel top-down overworld map for a JRPG ("Grammar Saga"). Painted pixel-art-like fantasy style, rich detail, same painterly palette and lighting as the rest of the game (warm daylight from the upper left, saturated greens, sandy road beige).
Technical rules:
- Output 3072x2048 px. Strictly top-down (3/4 JRPG view like SNES-era Final Fantasy overworld, but high resolution), no perspective tilt, no vignette, no border or frame.
- NO text, NO labels, NO numbers, NO UI, NO characters, NO monsters, NO map icons or markers. The attached layout guide image contains text labels only to tell you what goes where: do not draw any of it.
- Follow the attached layout guide: each town/dungeon must be centered within +-100 px of its coordinates (given at 3072x2048 scale below; the guide is at 1/2 scale). Colored ellipses on the guide only hint at terrain.
- Towns: a TOWN ICON only, about 200x160 px: 4-6 tiny roofs, perhaps a small wall, ONE clear entry spot on the south side where the road touches it. Each town gets one unmistakable signature silhouette (see its description). Never larger than 240x200 px.
- Dungeon entrances: a DUNGEON ICON only, about 150x150 px (cave mouth, stone gate, tower, ruin arch...), each clearly different and readable, with a worn path of at least 90 px width leading to the nearest road. Never larger than 180x180 px.
- Main road: a dirt/cobble road about 160 px wide that links all towns and the main dungeons. Side paths at least 110 px wide. Everything walkable must read as clearly walkable (road, grass, sand, shallow ground, bridges).
- Blocked terrain (deep water, cliffs, tree walls, mountain ridges, fences, lava) must be clearly distinguishable from walkable terrain with crisp edges, and the player must be able to walk from the start road to EVERY site without crossing blocked terrain.
- Between sites leave open walkable terrain areas of at least 900x700 px so the player can wander and meet monsters; vary terrain by region (see zones).
- Seams (all panels share the same widths): the dirt main road crosses the WEST|CENTER seam at y=1100 and the CENTER|EAST seam at y=950, both 160 px wide, with identical ground texture, grass color and lighting on both sides; a river crosses the WEST|CENTER seam at y=420 (about 120 px wide). Nothing else may touch the seam edges (keep 150 px clear of the left/right edges except the road and that river).
- The top and bottom 100 px of every panel are ocean or sheer cliff (impassable).

PANEL: CENTER — Grammar Continent, west half: four chapter-2 towns and the northern scholar highlands.
This is the first panel: no neighbor reference. Make the left and right edges clean open grassland around the two road crossings so that the neighbors can join.
Geography: North and south edges are ocean/cliff (south coast has a bay near d15). A river runs west from the highlands to the seam at y=420; another river comes from the north edge at x~2900, passes under the Conjunction Bridge and flows into Passive Lake (lake roughly x2100-2900, y1400-1900).

Sites (center coordinates in px at 3072x2048):
| id | place | type | x,y (px) | description / terrain |
|---|---|---|---|---|
| g1 | Be Meadow / 비 초원 | DUNGEON ICON (~150x150 px) | 400,1100 | Open meadow with a stone arch gate, flowers, gentle |
| g2 | Question Cave / 퀘스천 동굴 | DUNGEON ICON (~150x150 px) | 500,1700 | Cave mouth in a rocky hill, question-mark-like twisting roots around the entrance |
| tn | Tense Plain ruin / 텐스 평원 | DUNGEON ICON (~150x150 px) | 1290,1800 | Ancient stone clock-tower ruin standing in the wheat plain (sundial circle around it) |
| md(town) | Modalvale / 모달밸리 | TOWN ICON (~200x160 px) | 1650,1250 | Tiny icon, Modalvale: signature look = alpine pine-forest valley, timber and stone cottages, a wooden hall with stairs and a small watchtower, snowy peaks behind |
| rp(town) | Relawood / 릴러우드 | TOWN ICON (~200x160 px) | 2250,800 | Tiny icon, Relawood: signature look = dense forest clearing with one giant tree in the middle, treehouses, mossy cottages, waterwheel, streams |
| rp | Relative Forest ruin / 렐러티브 숲 | DUNGEON ICON (~150x150 px) | 2800,330 | Overgrown ruin with huge tree roots deep in the forest |
| ps(town) | Passive Lake / 패시브 레이크 | TOWN ICON (~200x160 px) | 2150,1380 | Tiny icon, Passive Lake: signature look = lakeside cobbled plaza, pink cherry trees, wooden docks and rowboats, turquoise water |
| ps | Passive Lake sunken gate / 패시브 호수 | DUNGEON ICON (~150x150 px) | 2800,1750 | Sunken-looking stone gate on a small peninsula in the lake, reachable by a shore path |
| cj | Conjunction Bridge / 컨정션 다리 | DUNGEON ICON (~150x150 px) | 2850,1000 | Huge stone bridge over a river gorge with a gatehouse tower at its north end; main road crosses it |
| tn(town) | Tensefield / 텐스필드 | TOWN ICON (~200x160 px) | 1100,1150 | Tiny icon, Tensefield: signature look = Mediterranean terracotta roofs, a domed hall, market stalls, pink blossoms, vines, cobbled streets; surrounded by golden wheat fields |
| d17 | Construction Nest / 컨스트럭션 둥지 | DUNGEON ICON (~150x150 px) | 800,780 | Rocky eyrie with giant nests and glowing embers (wyvern nest) |
| md | Modal Valley gate / 모달 계곡 | DUNGEON ICON (~150x150 px) | 1650,560 | Stone gate set into a high cliff at the end of a mountain pass |
| d14 | Structure Fortress / 스트럭처 성채 | DUNGEON ICON (~150x150 px) | 2050,260 | Ice-blue stone fortress on a snowy rise |
| d15 | Pattern Harbor / 패턴 항구 | DUNGEON ICON (~150x150 px) | 1760,1850 | Pirate-style harbor town on the SOUTH coast, piers, galleons, crates |
| d18 | Sequence Tower / 시퀀스 탑 | DUNGEON ICON (~150x150 px) | 1260,300 | Very tall slender tower with spiral stairs outside |
| d16 | Grammar Library / 그래머 도서관 | DUNGEON ICON (~150x150 px) | 790,300 | Domed library with scholars' garden and hedge maze |
| d13 | Syntax Pyramid / 신택스 피라미드 | DUNGEON ICON (~150x150 px) | 350,550 | Sandstone pyramid in a small desert patch |

--- 2단계: 마스크와 지형 구역도 (완성된 CENTER 이미지를 첨부하고 아래를 붙여넣기) ---
PANEL: CENTER.
Using the finished panel as reference, output two flat 3072x2048 images, no anti-aliasing, no text, pixel-exact alignment with the panel:
(A) WALK MASK: pure white = walkable (roads, grass, sand, shallow ground, bridges, causeways, town gates, dungeon entrance tiles, shore paths), pure black = blocked (deep water, lava, cliffs, mountain ridges, tree walls, buildings, castle walls, fences). Every site must be reachable from the main road through white pixels only.
(B) ZONE MAP: flat colors, one per terrain zone, used to decide random monster encounters:
  #2e8b3a grassland   #145a28 forest   #d8c060 desert   #e8d890 coast/sand   #7aa8c8 lakeshore   #b08a5a hills/rock   #90a8b8 snow/ice   #c85030 volcanic   #6a5a7a swamp/corrupted   #b8a060 wheat/farmland
Towns, dungeon entrances and a 150 px ring around them are marked with pure #ffffff (safe zone, no encounters).
