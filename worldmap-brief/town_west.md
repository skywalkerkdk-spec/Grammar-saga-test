# Town map brief: Syntax Kingdom Market Town (상인의 상점가 마을)

Draw ONE town map image in the EXACT same style, camera and layout logic as the sample.
Sample art (look at it first): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/sample_town_art.webp
Sample walk mask (Step 2): https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/sample_town_mask.png

## Step 1 - the town art
- Size exactly 1536x1024 px, top-down 2D RPG pixel-art, same pixel density, outline and colour style as the sample. No text, no UI, no characters.
- A busy market town of the "Syntax Kingdom": warm, lively, slightly more crowded than the sample (market stalls with striped awnings, barrels, crates, flower pots).
- Layout (same logic as the sample): one big flat paved central square in the middle with a small fountain or statue at its centre; roads leave the square to the WEST (left edge), EAST (right edge) and SOUTH (bottom edge, with two gate pillars). Everything else outside the roads/square is trees, cliffs, fences or houses (not walkable).
- Exactly 4 enterable key buildings, each with a clear front door facing the square, spaced like the sample (two at the top, two at the bottom):
  1. top-left: Guild Hall (big wooden sign, banner)
  2. top-right: Item and Pet Shop (striped awning, sack sign)
  3. bottom-left: Blacksmith (anvil, chimney glow)
  4. bottom-right: Potion and Alchemist shop (green bottle sign)
- Plus 2-3 small decorative houses and market stalls on the edges that are NOT doors.
- Keep the road/square edge clean and clearly separated from trees and walls, so a walk mask can be traced exactly.

## Step 2 - walk mask (ask for it only after I confirm the art)
Same size 1536x1024 PNG, black = not walkable, white = walkable (square + roads + the strip in front of each door), pure red (#ff0000) 24px-thick strips at the very edge of the three exits (west, east, south). Match the art exactly pixel for pixel.
