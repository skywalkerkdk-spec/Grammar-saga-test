# Grammar Saga world map brief (6 panels, 3 columns x 2 rows)

The whole continent is 3 x 2 panels (each 3072x2048, total 9216x4096). Towns and dungeons are TINY icons; long roads and wide open land between them. Overview of the layout: https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/ALL_guide.png

Read the panel file for the panel you are asked to draw and follow it exactly. Each file holds the full instructions and a link to its layout guide image. Each file has Step 1 (the map) and Step 2 (walk mask and terrain zone map, requested after the map is finished).

Draw in this order (later panels continue the finished neighbors' touching edges):
1. SOUTH-CENTER (no neighbor): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/1_SC.md
2. SOUTH-WEST (continues SOUTH-CENTER's left edge): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/2_SW.md
3. SOUTH-EAST (continues SOUTH-CENTER's right edge): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/3_SE.md
4. NORTH-CENTER (continues SOUTH-CENTER's top edge): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/4_NC.md
5. NORTH-WEST (continues NORTH-CENTER's left edge and SOUTH-WEST's top edge): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/5_NW.md
6. NORTH-EAST (continues NORTH-CENTER's right edge and SOUTH-EAST's top edge): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/6_NE.md
