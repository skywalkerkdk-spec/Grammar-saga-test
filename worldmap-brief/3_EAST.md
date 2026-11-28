# Panel 3: EAST

Layout guide image (use it as the placement reference, do NOT draw its text): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/3_EAST_guide.png

Also use the finished CENTER panel image (the person will attach it): continue its RIGHT edge.


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

PANEL: EAST — Grammar Continent, east half: three chapter-2 towns, desert, plateau and coast.
Use the attached finished CENTER panel image (its RIGHT edge): this panel's LEFT edge must continue it exactly (road y=950).
Geography: Ocean along the whole right edge (x>2980) and the south edge; north edge is cliff/sea with the island chain Preposition Isles.

Sites (center coordinates in px at 3072x2048):
| id | place | type | x,y (px) | description / terrain |
|---|---|---|---|---|
| pf | Perfect Desert / 퍼펙트 사막 | DUNGEON ICON (~150x150 px) | 450,800 | Ruined desert gate by a small oasis |
| pc | Participle Canyon / 파티서플 협곡 | DUNGEON ICON (~150x150 px) | 850,280 | Deep canyon with rope bridges, gate carved in the canyon wall |
| pn | Pronoun Village / 프로나운 마을 | DUNGEON ICON (~150x150 px) | 950,1150 | Small ruined hamlet with a stone gate (a dungeon, not an enterable town) |
| rv(town) | Whereport / 웨어포트 | TOWN ICON (~200x160 px) | 900,1750 | Tiny icon, Whereport: signature look = harbor with a lighthouse, wooden piers, sailboats, red-roofed stone buildings |
| rv | Sea cave & lighthouse / 관계부사 항구 | DUNGEON ICON (~150x150 px) | 1700,1850 | Lighthouse and sea cave on a cliff east of the port |
| sj(town) | Ifhaven / 이프헤이븐 | TOWN ICON (~200x160 px) | 1540,1060 | Tiny icon, Ifhaven: signature look = cliffside terraced town with a waterfall, arched aqueduct, red-roofed hall, mountain peaks |
| sj | Subjunctive Citadel / 서브정티브 성채 | DUNGEON ICON (~150x150 px) | 1500,300 | Citadel on a high misty crag, long stairway up |
| cp(town) | Compare Hills / 컴페어힐스 | TOWN ICON (~200x160 px) | 2210,1460 | Tiny icon, Compare Hills: signature look = green grassy plaza on terraced golden hills, red and blue roofs, small stream with a wooden bridge |
| cp | Comparative Hills cave / 컴패러티브 언덕 | DUNGEON ICON (~150x150 px) | 2820,1690 | Cave in a terraced hill |
| ot | Preposition Isles / 프리포지션 섬길 | DUNGEON ICON (~150x150 px) | 2150,250 | Chain of small islands joined by stepping-stone bridges (walkable), gate on the largest isle |
| iv | Verbal Plateau / 버벌 고원 | DUNGEON ICON (~150x150 px) | 1820,680 | High flat plateau with a standing-stone gate, wind-swept |
| pe | Causative Wood / 코저티브 숲 | DUNGEON ICON (~150x150 px) | 2800,260 | Dense ancient forest with a glowing gate between two giant trees |
| rs | Reported Speech Harbor / 화법 항구 | DUNGEON ICON (~150x150 px) | 2850,1000 | Harbor on the EAST coast with a stone pier and signal tower |
| sx | Inversion Castle / 인버전 성 | DUNGEON ICON (~150x150 px) | 2470,630 | Upside-down-looking dark castle on a crag (towers narrower at the top) |
| TEMPLE | Job-Change Temple / 전직의 신전 | TEMPLE ICON (~180x160 px) | 2170,990 | White marble Job-Change Temple with golden dome, small plaza (not a dungeon, an enterable temple) |
| ng | Noun Village / 노운 마을 | DUNGEON ICON (~150x150 px) | 1350,1500 | Small ruined hamlet, collapsed notice board, stone gate (a dungeon, not an enterable town) |
| id | Idiom Harbor / 이디엄 항구 | DUNGEON ICON (~150x150 px) | 2400,1900 | Idiom Harbor: a pirate cove on the south coast, skull flag, caves |

--- 2단계: 마스크와 지형 구역도 (완성된 EAST 이미지를 첨부하고 아래를 붙여넣기) ---
PANEL: EAST.
Using the finished panel as reference, output two flat 3072x2048 images, no anti-aliasing, no text, pixel-exact alignment with the panel:
(A) WALK MASK: pure white = walkable (roads, grass, sand, shallow ground, bridges, causeways, town gates, dungeon entrance tiles, shore paths), pure black = blocked (deep water, lava, cliffs, mountain ridges, tree walls, buildings, castle walls, fences). Every site must be reachable from the main road through white pixels only.
(B) ZONE MAP: flat colors, one per terrain zone, used to decide random monster encounters:
  #2e8b3a grassland   #145a28 forest   #d8c060 desert   #e8d890 coast/sand   #7aa8c8 lakeshore   #b08a5a hills/rock   #90a8b8 snow/ice   #c85030 volcanic   #6a5a7a swamp/corrupted   #b8a060 wheat/farmland
Towns, dungeon entrances and a 150 px ring around them are marked with pure #ffffff (safe zone, no encounters).
