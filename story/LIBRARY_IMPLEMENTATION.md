# Grammar Grand Library — implementation proposal

Use LIBRARY_DATA.json v0.1 with STORY_DATA.json v1.1, NAMING_REGISTRY.json and SPECIAL_QUESTS.json. The library is a new safe hub, not a replacement for d16 or Nova. Lexion is the hub librarian. Reuse the existing continent unlock condition; no new dungeon prerequisites. Initially implement six accessible menu rooms; a walkable map is optional and not supplied.

## Rooms
- Grammatica Chamber: show 18 page slots, collected versus registered state, register each once, count unique registered IDs, allow reviewing recovered pages. Reuse existing story reward flags; no new duplicate items or crystals.
- Grammar Archive: all 18 topics available on arrival; show rule, two aligned bilingual examples and one review question. Unlimited practice without economic rewards. Preserve existing grammar question banks. English examples use shared palette; direct gloss is not a natural translation. Add reviewed natural Korean translations before enabling that mode for these records.
- World Encyclopedia: use 18 town records and 72 residents by stable town ID and resident index. Show quest title; reveal plot details only after relevant visits. Existing character names come from NAMING_REGISTRY.
- Monster Encyclopedia: 18 boss index entries, reveal after existing dungeon clear. Obtain real sprites, species, stats and ordinary monster records from current game source; never invent IDs or stats. No ordinary monster catalog or boss descriptions supplied yet.
- Adventure Journal: read collected clues and completed tasks from SPECIAL_QUESTS progress; allow replay without reward duplication. Do not reveal uncollected clues by default.
- Secret Archive: unlock records at unique registered counts 3/6/9/12/15/18. Reuse STORY_DATA milestone events, not duplicate scenes. If several thresholds crossed, queue in ascending order; allow rereading. Records are new lore drafts consistent with existing milestones. Do not identify final villain early. At 18 show final dungeon invitation only if implemented; otherwise show a clear coming-soon state. Nova's optional d16 card bonus is separate and never gates core records; use verified existing d16 clear as proxy only if card inventory does not exist.

## Save and tests
Keep existing SV.town and dungeon keys untouched. Reuse story registration and seen-event state; derive counts, avoid duplicate sources of truth. Existing cleared players can claim unclaimed story pages without replaying battles. Test 0/3/6/9/12/15/18, out-of-order registration, repeated visits, save reload, legacy clear, mobile readability, translation modes, journal spoilers, d16 access and missing final dungeon. Do not merge or deploy without review. No actual game implementation or artwork is included in this commit.
