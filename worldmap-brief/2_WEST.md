# Panel 2: WEST

Layout guide image (use it as the placement reference, do NOT draw its text): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/2_WEST_guide.png

Also use the finished CENTER panel image (the person will attach it): continue its LEFT edge.


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

PANEL: WEST — Syntax Kingdom (beginner lands) + the north-western wilds.
Progression order along the main road from the start: d1 Quiet Wood -> d2 Slime Cave -> d3 Golem Canyon -> d4 Merchants' Row -> d5 Alchemist's Workshop -> d6 Dark Knight's Castle (then locked d7, d8 to the south).
Use the attached finished CENTER panel image (its LEFT edge): this panel's RIGHT edge must continue it exactly (road y=1100, river y=420).
Geography: Ocean along the left 220 px and top-left bay (island Isle of Proverbs). A river enters at the seam y=420 and runs west to the sea (estuary swamp near d9).

Sites (center coordinates in px at 3072x2048):
| id | place | type | x,y (px) | description / terrain |
|---|---|---|---|---|
| pv | Isle of Proverbs / 이디엄·속담 섬 | DUNGEON ICON (~150x150 px) | 480,380 | Small island with a sage's stone hall and a lighthouse, joined to the mainland by a stone causeway (walkable, ~140 px wide) |
| d9 | Clause Swamp / 클로즈 늪지 | DUNGEON ICON (~150x150 px) | 500,900 | Foggy swamp with a rotting boardwalk leading to a sunken wooden gate, hanging moss |
| d10 | Phrase Ice Cave / 프레이즈 얼음 동굴 | DUNGEON ICON (~150x150 px) | 1050,650 | Snowfield; ice-cave mouth under a frozen waterfall |
| d11 | Predicate Volcano Canyon / 프레디킷 화산 협곡 | DUNGEON ICON (~150x150 px) | 1650,430 | Volcanic canyon, glowing lava streams, smoking crater, cave gate in black rock |
| d12 | Sentence Manor / 센텐스 저택 | DUNGEON ICON (~150x150 px) | 2350,420 | Big gothic manor on a low hill, iron gate, dead garden, crows |
| d5 | Alchemist's Workshop / 연금술사의 공방 | DUNGEON ICON (~150x150 px) | 2050,1750 | Tall crooked stone tower with colorful smoking chimneys and glass domes (workshop) |
| d4 | Merchants' Row / 상인의 상점가 | DUNGEON ICON (~150x150 px) | 1950,1250 | Walled market quarter with striped awnings and stalls right beside the main road; one open gate toward the road |
| d3 | Golem Canyon / 골렘의 협곡 | DUNGEON ICON (~150x150 px) | 1450,900 | Narrow red-rock canyon; giant stone golem statue at its mouth |
| d1 | The Quiet Wood / 고요한 숲 | DUNGEON ICON (~150x150 px) | 450,1400 | Sleepy forest clearing, mossy stone arch, player's starting area, gentle and bright |
| d8 | Corrupted Gerund Wood / 타락한 제룬드 숲 | DUNGEON ICON (~150x150 px) | 700,1800 | Twisted dead forest with purple glowing fungi, corruption mist (dungeon locked at first) |
| d7 | Corrupted Infinitive Temple / 타락한 인피니티브 신전 | DUNGEON ICON (~150x150 px) | 1400,1800 | Ruined temple, broken columns, purple corruption mist (locked at first) |
| d2 | Slime Cave / 슬라임 떼의 동굴 | DUNGEON ICON (~150x150 px) | 1000,1300 | Cave mouth in a green hillside, glistening slime puddles |
| d6 | Dark Knight's Castle / 다크나이트성 | DUNGEON ICON (~150x150 px) | 2550,880 | Black-stone castle on a rocky plateau, drawbridge gate facing SOUTH toward the main road, ominous (locked at first) |

--- 2단계: 마스크와 지형 구역도 (완성된 WEST 이미지를 첨부하고 아래를 붙여넣기) ---
PANEL: WEST.
Using the finished panel as reference, output two flat 3072x2048 images, no anti-aliasing, no text, pixel-exact alignment with the panel:
(A) WALK MASK: pure white = walkable (roads, grass, sand, shallow ground, bridges, causeways, town gates, dungeon entrance tiles, shore paths), pure black = blocked (deep water, lava, cliffs, mountain ridges, tree walls, buildings, castle walls, fences). Every site must be reachable from the main road through white pixels only.
(B) ZONE MAP: flat colors, one per terrain zone, used to decide random monster encounters:
  #2e8b3a grassland   #145a28 forest   #d8c060 desert   #e8d890 coast/sand   #7aa8c8 lakeshore   #b08a5a hills/rock   #90a8b8 snow/ice   #c85030 volcanic   #6a5a7a swamp/corrupted   #b8a060 wheat/farmland
Towns, dungeon entrances and a 150 px ring around them are marked with pure #ffffff (safe zone, no encounters).
