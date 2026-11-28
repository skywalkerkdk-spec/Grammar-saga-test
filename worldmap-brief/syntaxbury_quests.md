# Syntaxbury (Syntaxbury / 신택스베리) quest brief - 4 new route quests

Syntaxbury is the new market town of the Syntax Kingdom (western region of the Grammar continent). Four retired towns moved their residents into it. Write ONE NEW improved quest for each of the four retired towns below, in the SAME JSON schema as the pilot route quests.

Schema example (copy its structure exactly - keys, chunks/direct_chunks on every line, step order accept -> route -> report):
https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/story/ROUTE_QUESTS.json

## Setting
Syntaxbury has a paved central square with a fountain, a Guild Hall, a pet/item shop, a blacksmith and a potion shop. Roads lead out WEST (old kingdom road), EAST (wooden bridge over the river) and SOUTH (gate to the field). Every quest starts with a resident in town (accept), sends the hero out through ONE of these exits (route: exit_west, exit_east or exit_south) to a clue, a gate and a monster that asks exactly 3 grammar questions, then returns to the same resident (report) with one kind-vs-clever choice question that sets a flag.

## Rules
- town_id for every quest: "sb" (Syntaxbury). Quest ids: sb_route_<short_name>. completion_flag: <id>_complete. reward_item: {"stone": 1} or {"cry": 150}.
- Use a different exit for each quest if possible (2 west, 1 east, 1 south).
- The 3 monster questions must test the theme grammar of the retired town (see below), at middle-school level, 3 options each, with a one-sentence Korean feedback (feedback_ko).
- Every line has en, ko, chunks and direct_chunks (same as the example file). Speaker "Narrator" or "Subject" (the hero) or the resident id. Korean must be natural 존댓말 for residents.
- Keep each quest to about the same length as the pilot quests. Tone: warm, funny, a little mysterious. No violence.
- The quest must make sense in Syntaxbury (market, guild, river bridge, kingdom roads) while keeping a nod to the retired town's original story.
- Output: ONE valid JSON file containing {"version":"0.1","status":"pilot","quests":[ ...4 quests... ]} and nothing else. Check that every npc id exists in the lists below.

## The four retired towns and their residents

### Queston (퀘스턴) - theme: question words and question forms (wh-questions, do/does/did questions)
Original episode: The Restaurant Without Questions 
Residents you may use as the quest giver (use these exact ids):
- g2_extra_1 : Mayor Quinn (마을 대표)
- g2_extra_2 : Grocer Olive (상점 주인)
- g2_extra_3 : Innkeeper Nell (여관 주인)
- g2_extra_4 : Guard Knox (경비병)

### Perfect Oasis (퍼펙트 오아시스) - theme: present perfect (have/has + past participle, for/since/ever/never/already/yet)
Original episode: A Letter After Ten Years 
Residents you may use as the quest giver (use these exact ids):
- pf_extra_1 : Mayor Dune (마을 대표)
- pf_extra_2 : Grocer Date (상점 주인)
- pf_extra_3 : Innkeeper Palm (여관 주인)
- pf_extra_4 : Guard Flintlock (경비병)

### Pronovia (프로노비아) - theme: pronouns (subject/object/possessive/reflexive, who/whose/whom)
Original episode: Whose Treasure Is It? 
Residents you may use as the quest giver (use these exact ids):
- pn_extra_1 : Mayor Proper (마을 대표)
- pn_extra_2 : Grocer Clementine (상점 주인)
- pn_extra_3 : Innkeeper Possy (여관 주인)
- pn_extra_4 : Guard Locke (경비병)

### Nounville (노운빌) - theme: nouns (countable/uncountable, plurals, articles, quantity words)
Original episode: The Festival of Hope 
Residents you may use as the quest giver (use these exact ids):
- ng_extra_1 : Mayor Cheer (마을 대표)
- ng_extra_2 : Grocer Honey (상점 주인)
- ng_extra_3 : Innkeeper Merry (여관 주인)
- ng_extra_4 : Guard Order (경비병)

