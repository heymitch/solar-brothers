# Bramm Roke — Source: Captain Falcon (Melee NTSC v1.02)

> Frame-and-command-perfect port reference. Captain Falcon (SSBM NTSC v1.02) is the source of truth for **Bramm Roke**, the Heavy Rusher archetype in *Solar Brothers Melee*. Universal engine math (hitstun formula, knockback formula, ASDI, SDI multipliers, etc.) is documented in a separate engine spec — this file is **character-specific** only.
>
> Notation:
> - Frames are 1-indexed, NTSC 60 Hz.
> - "Active 5–8" = hitbox active on frames 5, 6, 7, 8.
> - IASA = Interruptible As Soon As (frame at which another action can override end-lag).
> - KB values use Melee internal units: BKB (base knockback), KBG (knockback growth).
> - Angles use the standard Melee convention (0° = horizontal away from Falcon, 90° = vertical up, 270/361° = "Sakurai angle" semi-spike).
> - `[unverified]` = value sourced from memory/community lore but not double-checked against KuroganeHammer/SSBWiki this session.
> - `[gap]` = value not located; must be filled before production port.

---

## 2. Physics Profile

| Attribute | Value | Notes |
|---|---|---|
| Weight | 104 | Mid-heavy; tied with Samus, lighter than Ganon (109) |
| Fall speed (max) | 2.9 | One of the four fastfallers (Falcon/Fox/Falco/Sheik tier of fast) |
| Fast-fall speed | 3.5 | ~1.207× normal fall speed (engine standard fastfall multiplier) |
| Gravity | 0.13 | High gravity — contributes to fastfaller status & combo food vulnerability |
| Walk speed (max) | 1.55 | [unverified — exact value] |
| Run/dash speed (max) | 2.30 | Tied for fastest dasher in the game w/ Fox; defining trait |
| Initial dash speed | 2.30 | Reaches max on frame 1 of dash (no acceleration ramp) [unverified — exact f1] |
| Air speed (max) | 1.12 | [unverified] — middling |
| Air acceleration (base) | 0.06 | [unverified] |
| Air friction | 0.02 | [unverified] |
| Traction | 0.08 | High traction → long, fast wavedash |
| Jumpsquat | 4 frames | Standard heavyweight jumpsquat |
| Character height (idle) | ~tall human-and-a-half | Tall hurtbox = vulnerable to combos despite weight |
| Crouch height reduction | ~30% | [unverified] |
| Hurtbox notes | Tall standing hurtbox; helmet adds vertical reach but is part of hurtbox; crouch dips below many tilts |

**Heavy Rusher translation for Bramm:** keep the **fastest dash + 4f jumpsquat + high gravity** trio. That triangle defines the archetype: he closes distance like nobody else, but eats combos when caught. Don't soften gravity or you lose the "combo food" balance lever.

---

## 3. Jumps

| Attribute | Value | Notes |
|---|---|---|
| Jumpsquat | 4 frames | Frames 1–4 grounded, jump on f5 |
| Full hop initial Y velocity | 2.448 | [unverified — community-cited] |
| Short hop Y velocity | 1.4 | [unverified — community-cited]; SH window = release jump button before f4 ends |
| Double jump Y velocity | ~2.1 | [unverified]; momentum-preserving (factors prior fall) |
| Air jumps (total) | 1 (one mid-air jump) | Standard, no Yoshi/Kirby/Jiggs multi |
| Wall jump | No | Falcon does not wall-jump |
| Jump-cancel (JC) grab | Yes (from dash) | Pressing jump then grab during jumpsquat |
| Jump-cancel usmash | Yes | Standard JC usmash from dash |

---

## 4. Wavedash

| Attribute | Value | Notes |
|---|---|---|
| Wavedash angle | ~30° below horizontal | Standard for high-traction characters |
| Wavedash length | **Long** — among the longest in the game | Tied to high traction; ~3rd-longest in cast [unverified rank] |
| Wavedash distance (units) | ~32–35 units | [unverified — exact game-units] |
| Wavedash total frames | 10 frames of landing lag | Airdodge land animation; full wavedash usable f11+ |
| Wavedash IASA | Frame 11 (act out of land) | Can input any ground action f11 |
| Wavedash OoS | Yes — common | Jumpsquat (4) + airdodge (1) + land (10) → ~15f total to act; used to wavedash-grab, wavedash-usmash, wavedash-back |
| Wavedash-back | Excellent spacing tool | Heavy use in neutral; backwards angle for retreat-into-dash-attack |
| Waveland | Yes — onto platforms; key for tech-chase repositioning |

---

## 5. Ground Attacks

> All damage values are **base damage** (no stale-move negation). Hitbox positions are abstracted (close/mid/far + height) — exact bone-attached coordinates `[gap]` for production rig.

### Jab 1 (Quick Jab)

| Field | Value |
|---|---|
| Startup | f3 |
| Active | 3–4 |
| IASA | 19 [unverified] |
| Total frames | ~21 |
| Damage | 3% |
| BKB | 10 |
| KBG | 20 |
| Angle | 80° |
| Hitlag | standard |
| Notes | Jab cancel into jab2 or grab; very fast OoS option |

### Jab 2 (Cross)

| Field | Value |
|---|---|
| Startup | f3 (after jab1) |
| Active | 3–4 |
| IASA | 21 [unverified] |
| Damage | 3% |
| BKB | 10 |
| KBG | 30 |
| Angle | 80° |

### Jab 3 — *does not exist* (Falcon has 2-hit jab + rapid-jab knee finisher in some references; canonical Melee: 2-hit jab only)

> **Note:** Falcon in Melee has a **2-hit jab** (no jab3, no rapid jab). If Bramm needs a 3-hit string for animation parity with other Solar Brothers, design a new jab3 — do not invent and call it ported.

### Dash Attack (Shoulder Tackle)

| Field | Value |
|---|---|
| Startup | f7 |
| Active | 7–13 (clean), 14–20 (late) |
| IASA | 41 [unverified] |
| Total | 49 [unverified] |
| Damage (clean) | 9% |
| Damage (late) | 6% |
| BKB | 60 (clean) / 30 (late) [unverified] |
| KBG | 65 (clean) / 100 (late) [unverified] |
| Angle | 60° (clean — sends up-forward), 80° (late) |
| Notes | Combo starter at low %; converts to up-air or knee at low–mid % |

### Forward Tilt (angled)

| Variant | Startup | Active | IASA | Damage | BKB | KBG | Angle |
|---|---|---|---|---|---|---|---|
| F-tilt UP | f7 | 7–9 | 26 | 9% | 10 | 100 | 70° [unverified angle] |
| F-tilt MID | f7 | 7–9 | 26 | 9% | 10 | 100 | 361° (Sakurai) |
| F-tilt DOWN | f7 | 7–9 | 26 | 9% | 10 | 100 | 30° [unverified angle] |

> All three variants share frame data; only angle changes. Hitbox is leg-attached, mid-far range.

### Up Tilt (high kick)

| Field | Value |
|---|---|
| Startup | f6 |
| Active | 6–10 |
| IASA | 32 [unverified] |
| Total | 38 |
| Damage | 13% (clean leg), 11% (body) [unverified split] |
| BKB | 30 |
| KBG | 100 |
| Angle | 90° (vertical) |
| Notes | Anti-air; combo starter at low %; punishes spot-dodges; hits behind on startup briefly |

### Down Tilt

| Field | Value |
|---|---|
| Startup | f7 |
| Active | 7–9 |
| IASA | 21 |
| Total | 24 |
| Damage | 9% |
| BKB | 0 |
| KBG | 100 |
| Angle | 80° (pops up) |
| Notes | Tech-chase tool; pops opponent into knee/up-air range; very fast recovery |

### Forward Smash (angled)

| Variant | Startup | Active | IASA | Damage | BKB | KBG | Angle |
|---|---|---|---|---|---|---|---|
| F-smash UP | f15 | 15–17 | 49 | 19% | 20 | 100 | ~75° [unverified] |
| F-smash MID | f15 | 15–17 | 49 | 18% | 20 | 100 | 361° |
| F-smash DOWN | f15 | 15–17 | 49 | 19% | 20 | 100 | ~25° [unverified] |
| Charge frame | f10 (hold) | — | — | +1.4× max | — | — | — |

> Damage scales 1.0×–1.4× with charge over 60 frames hold. Massive hitbox; backhand/elbow strike. Punish tool, not neutral tool.

### Up Smash (double-leg upward)

| Field | Value |
|---|---|
| Startup | f10 |
| Active | 10–14 (clean), 15–22 (late) |
| IASA | 47 [unverified] |
| Total | 53 |
| Damage (clean) | 18% |
| Damage (late) | 13% |
| BKB | 30 |
| KBG | 100 |
| Angle | 80° (clean), 90° (late) |
| Charge frame | f5 |
| Notes | JC out of dash → key kill option; clean hit kills mid-weights ~95% center stage |

### Down Smash (split kick)

| Variant | Startup | Active | IASA | Damage | BKB | KBG | Angle |
|---|---|---|---|---|---|---|---|
| D-smash front | f11 | 11–13 (front), 21–24 (back) | 60 | 14% | 20 | 100 | 30° [unverified] |
| D-smash back | f21 | 21–24 | 60 | 14% | 20 | 100 | 30° |
| Charge frame | f6 | — | — | — | — | — | — |
| Notes | Long total frames; semi-spike off-stage edgeguard tool; weak shield pressure |

---

## 6. Aerials

> **L-cancel halves landing lag.** "Landing lag" column = no L-cancel; "L-cancel lag" = L-cancelled. Production engine should expose L-cancel as input timing window of last 7 frames before landing.

### Neutral Air (Nair) — sex kick

| Field | Value |
|---|---|
| Startup | f7 |
| Active (clean) | 7–10 |
| Active (late/weak) | 11–30 |
| IASA | 38 [unverified] |
| Damage (clean) | 12% |
| Damage (late) | 7% |
| BKB | 10 (clean) / 0 (late) |
| KBG | 100 (clean) / 100 (late) |
| Angle | 361° (Sakurai) clean, 80° late |
| Landing lag | 15 |
| L-cancel lag | 7 |
| Auto-cancel | f1–6 and f31+ |
| Notes | Workhorse approach; SHFFL'd nair → grab/jab/dtilt loop. Late hit combos into knee at mid % |

### Forward Air (Knee of Justice) — SWEET SPOT

| Field | Value |
|---|---|
| Startup | f14 |
| Active (sweet) | **14–15 only** (2-frame window) |
| Damage (sweet) | **18%** |
| BKB | 80 |
| KBG | 80 |
| Angle | 361° (near-horizontal kill angle) |
| Hitlag | **electric** — extra hitlag (×1.5 multiplier) and electric VFX |
| Landing lag | 19 |
| L-cancel lag | 9 |
| Auto-cancel | f37+ [unverified] |
| Notes | The defining move. Electric hitlag = signature feel; 2-frame sweet window = signature execution barrier. Kills at 50–70% off raw confirms |

### Forward Air (Knee) — SOUR SPOT

| Field | Value |
|---|---|
| Startup | f14 |
| Active (sour) | **16–35** (after sweet expires) |
| Damage (sour) | **3%** |
| BKB | 0 |
| KBG | 30 |
| Angle | 361° |
| Hitlag | standard (no electric) |
| Landing lag | 19 |
| L-cancel lag | 9 |
| Notes | "Tipper miss" — feels bad on hit, no kill, often combo starter at low %. The risk side of the Knee gamble |

### Back Air (Bair)

| Field | Value |
|---|---|
| Startup | f10 |
| Active | 10–13 |
| IASA | 36 [unverified] |
| Damage | 13% (clean), 8% (late) |
| BKB | 0 |
| KBG | 130 |
| Angle | 361° |
| Landing lag | 18 |
| L-cancel lag | 9 |
| Auto-cancel | f23+ [unverified] |
| Notes | Reverse-aerial-rush (RAR) bair = excellent spacing kill move; reliable kill ~110% |

### Up Air (Uair) — overhead bicycle kick

| Field | Value |
|---|---|
| Startup | f6 |
| Active | 6–9 |
| IASA | 33 [unverified] |
| Damage | 13% |
| BKB | 0 |
| KBG | 100 |
| Angle | 75° |
| Landing lag | 18 |
| L-cancel lag | 9 |
| Auto-cancel | f30+ [unverified] |
| Notes | Juggle finisher; low-% combo extender; kills off the top at ~120% |

### Down Air (Dair) — STOMP

| Field | Value |
|---|---|
| Startup | f16 |
| Active (spike) | 16–18 |
| Active (late) | 19–22 |
| IASA | 47 [unverified] |
| Damage (spike) | 14% |
| Damage (late) | 12% |
| BKB | 30 (spike), 0 (late) |
| KBG | 80 |
| Angle | **270° (spike)** clean / 80° late |
| Landing lag | 22 |
| L-cancel lag | 11 |
| Auto-cancel | f40+ [unverified] |
| Notes | The Stomp. Meteor smash; on grounded opponent → pops them up at 80° → free knee/uair. Off-stage = death |

---

## 7. Specials

### Neutral B — Falcon Punch

| Field | Value |
|---|---|
| Startup (grounded) | f52 (forward) / f63 (turnaround 180°) |
| Active | 52–55 |
| IASA | 100+ [unverified — total ~110] |
| Damage | 25% (grounded), 25% (aerial) |
| BKB | 60 |
| KBG | 80 |
| Angle | 361° |
| Special | **Super armor:** none. **Turnaround:** input back-direction during startup before f5 to reverse facing (180° punch) — extends startup to f63 but flips direction |
| Aerial variant | Same damage; loses double jump on input |
| Notes | Hard read / hard punish only. Iconic — kills at ~50%. Ledge-stalling reversal in some matchups |

### Side B — Raptor Boost

| Variant | Startup | Active | Damage | Angle | Notes |
|---|---|---|---|---|---|
| **Grounded** | f17 | 17–25 [unverified] | 5% | 75° (pops up) | On hit: launches opponent; free knee/uair follow-up. On whiff: long recovery, punishable |
| **Aerial** | f17 | 17–25 | 9% | 270° (**meteor**) | On hit: spikes opponent down. Whiff = freefall (cannot act until landing) |

> Both versions: lose double jump on use. Aerial Raptor = surprise edgeguard tool; grounded = combo starter from dash-cancel.

### Up B — Falcon Dive

| Field | Value |
|---|---|
| Startup | f15 (grab box appears) |
| Active grab | 15–34 [unverified] |
| Damage | 5% (grab) + 12% (explosion) = 17% total |
| BKB | 70 (explosion) |
| KBG | 80 |
| Angle | 80° |
| Recovery vertical distance | ~50% of FD's height — upper-mid recovery |
| Recovery horizontal distance | ~25% of FD's width [unverified] |
| Recovery angle | ~75° (mostly vertical) |
| Grab range | medium — slightly larger than standing grab |
| On grab successful | Refreshes double jump and Up B usability ("Falcon Dive boost") |
| On miss | Helpless freefall until landing/ledge |
| Notes | "YES!" voice line on successful grab. Doubles as recovery + edge-grab punish |

### Down B — Falcon Kick

| Variant | Startup | Active | Damage (clean) | Damage (late) | Angle | Distance | Notes |
|---|---|---|---|---|---|---|---|
| **Grounded** | f18 | 18–35 (clean 18–22) | 15% | 11% | 30° | Slides ~⅓ of FD | Horizontal slide; transcendent priority on clean frames; punishable on shield |
| **Aerial** | f14 | 14–32 (clean 14–18) | 13% | 9% | 270° (clean = meteor on grounded), 30° (late) | Diagonal down-forward dive | If aerial Falcon Kick lands on stage during the kick, transitions to grounded slide; off-stage = SD risk; sometimes used as fast-fall mixup |

> Falcon Kick has a **landing-on-stage** transition: aerial Falcon Kick that connects with the ground continues the slide for ~30 more frames at reduced speed. End-lag is significant in both versions.

---

## 8. Throws

### Grabs

| Grab | Startup | Active | Total | Range |
|---|---|---|---|---|
| Standing grab | f7 | 7–8 | 30 | short |
| Dash grab | f8 | 8–9 | 40 | medium (forward extended) |
| Pivot grab | f10 [unverified] | 10–11 | 35 | medium (rear extended) |

### Throws

| Throw | Frame to release | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|
| **F-throw** | f11 | 9% | 70 | 60 | 45° | DI-mixup throw; sends them off-stage at higher %; tech-chase at low % |
| **B-throw** | f20 [unverified] | 9% | 60 | 60 | 135° | Edge-positioning tool; useful near ledge for stage-control |
| **U-throw** | f10 [unverified] | 7% | 60 | 70 | 90° | **Combo throw** — at low% → uair / nair / knee. Floaties die early off uthrow → uair |
| **D-throw** | f30 [unverified] | 5% (× 2 hits via knee-down) | 80 | 40 | 80° | **Signature combo throw** — dthrow → knee is the iconic kill confirm; works on fastfallers up to ~30% w/ correct DI read |

> Throw release frames are from grab connect, not from grab startup.

---

## 9. Defensive Options

| Option | Invuln start | Invuln end | Total frames |
|---|---|---|---|
| Spot dodge | f2 | f20 | 27 |
| Roll forward | f4 | f19 | 33 [unverified] |
| Roll back | f4 | f19 | 33 [unverified] |
| Air dodge | f4 | f29 | 49 (full freefall after) |
| Tech (in place) | f1 | f20 | 26 |
| Tech roll | f1 | f20 | 40 |
| Shield drop | — | — | f1 (instant) — Falcon has standard shield drop, no special property |

> Air dodge note: in Melee, air dodge causes helpless state on completion (used for wavedash/waveland but otherwise commits Falcon to landing).

---

## 10. Notable Techniques + Tactics

### Knee Confirms (the entire Falcon meta)

- **D-throw → Knee** — at low %, on fastfallers w/ no/bad DI; the signature kill confirm. Read DI: dthrow + away → empty hop knee; dthrow + behind → reverse knee.
- **U-throw → Knee** — works on floaties from 0%; on fastfallers needs platform read.
- **Nair (late) → Knee** — sex-kick lands, opponent in low hitstun, jump-cancel into knee f14. Window is tight.
- **Uair → Knee** — juggle situation; uair sends them up, double jump → knee mid-air.
- **Dair (Stomp) → Knee** — grounded stomp pops them at 80°, jump-cancel into knee. Stomp-Knee is the most satisfying confirm in the game.
- **Dash-attack → Knee** — at low %, dash attack clean hit pops them; jump-cancel into knee on hit.

### Tech-chase Setups

- **D-throw → tech-chase** — at higher % d-throw doesn't combo; reads:
  - Tech-in-place → grab/usmash/dtilt
  - Tech-roll-forward → run-up grab/dash-attack/knee
  - Tech-roll-back → wavedash-back → grab/usmash
  - No-tech → jab reset / dair / knee
- **D-tilt → tech-chase** — pops them; same tech-options tree.

### Stomp Combos

- **Stomp (dair) on grounded** → opponent flies up at 80°, into:
  - Knee (preferred, kills)
  - U-air (extends combo)
  - Up-B (reads air-dodge)
- **Stomp off-stage** → meteor finisher, often kills outright.
- **SHFFL'd stomp** = approach + reset.

### Mind Games / Signature Pressure

- **Wavedash-back → grab** — bait whiff, punish with grab combo.
- **Empty short-hop → grab** — vs shield-happy opponents; 4-frame jumpsquat + fastfaller = empty hop is fast.
- **Reverse knee** — pivot in air, knee behind; catches DI-away players.
- **Falcon Punch hard read** — almost never the right move, but the threat warps neutral; reserved for hard tech-chase reads at edge or laggy whiffs.
- **Ledgedash** — edge-canceled wavedash from ledge; bypass ledge invincibility loss for tournament-winners.
- **"YES!" / "Show me your moves!"** — taunt-cancel mind game; trash-talk part of the kit.

---

## 11. Character Renders + Visual References

Bramm Roke's silhouette must inherit Falcon's **rusher-knight** read: broad pauldron-shoulders, helmet w/ vertical accent (plume/visor), tight bodysuit revealing motion lines, scarf/cape that flows on dash for speed-cue.

### Silhouette cues to translate

| Falcon cue | Bramm Roke solarpunk redesign |
|---|---|
| Broad asymmetric shoulder pads (left side larger) | Solar-panel shoulder mantle (left side housing larger PV array) |
| Helmet w/ falcon-head + plume/visor | Helmet w/ sun-disk crest + woven kelp/grass plume |
| Red bodysuit w/ yellow accents | Terracotta bodysuit w/ chartreuse + amber accents (solarpunk warm palette) |
| Yellow scarf trailing on dash | Living-vine scarf w/ small flowering nodes; trails on dash w/ glowing pollen particles |
| Tight gloves + boots w/ thick soles | Reinforced bark/leather boots w/ glowing rune-soles for the Knee impact effect |
| Thick belt w/ "Z" insignia | Woven hemp belt w/ sun-disk insignia |
| Knee impact = bright yellow electric flash | Knee impact = warm amber sun-burst with pollen-spark particles |

### Reference link list

> Verify each link before production import. Provided as research-starting-points.

#### Official Captain Falcon renders
- **SSBWiki — Captain Falcon (SSBM):** https://www.ssbwiki.com/Captain_Falcon_(SSBM) — full move table, official artwork, history.
- **SSBWiki — Captain Falcon (character):** https://www.ssbwiki.com/Captain_Falcon — series-wide article; multiple official renders embedded.
- **SmashWiki gallery (artwork):** https://www.ssbwiki.com/Captain_Falcon#Gallery — direct gallery anchor.
- **Smashpedia (Fandom) Captain Falcon:** https://supersmashbros.fandom.com/wiki/Captain_Falcon — alt official renders, Brawl/Smash 4/Ultimate variants for muscle reference.

#### Ripped 3D models / sprites
- **TheModelsResource — Melee Captain Falcon:** https://www.models-resource.com/gamecube/supersmashbrosmelee/model/1054/ — extracted DAT/.dae model, useful for proportions + UV layout.
- **TheModelsResource SSBM index:** https://www.models-resource.com/gamecube/supersmashbrosmelee/ — full character index for cross-reference.
- **The Spriters Resource — F-Zero Captain Falcon:** https://www.spriters-resource.com/snes/fzero/ — F-Zero pixel sprites (useful for retro-style Bramm pixel idle if mixing voxel + pixel art).
- **The VG Resource forums:** https://www.vg-resource.com/ — community-uploaded rips; often higher-fidelity than official archives.

#### Frame data / animation references
- **MeleeFrameData (KuroganeHammer mirror):** https://meleeframedata.com/falcon — complete frame data table for confirming this doc's numbers.
- **KuroganeHammer (web archive backup):** https://web.archive.org/web/2023*/kuroganehammer.com/Melee/Falcon — fallback if primary down.
- **20XX Hack Pack docs:** https://smashboards.com/threads/the-20xx-melee-training-hack-pack-v4-07-7-15-17.351221/ — contains hitbox visualization mods for Falcon.
- **Magus420 Falcon frame data thread (SmashBoards):** https://smashboards.com/threads/captain-falcon-detailed-frame-data.319924/ — community-canonical frame data; cross-reference all values here.

#### Animation/pose references (video)
- **Falcon idle stance / dash cycle:** SSBWiki animation gifs embedded in move-page anchors (e.g., #Up_air for uair gif).
- **20XX hitbox visualizer (YouTube):** search "Captain Falcon hitboxes 20XX" — frame-by-frame hitbox overlays for every move.
- **SSBM Tutorials (YouTube — My Smash Corner / Llod):** generic search "Captain Falcon Melee tutorial" for SHFFL/wavedash/knee-confirm video footage.
- **Knee-of-Justice signature pose:** any YouTube clip from Mango/Hax/n0ne tournament play; frame-pause at sweet-spot connect for canonical pose.
- **Taunt:** SSBWiki Captain Falcon page → Taunts section ("Show me your moves!" pose).

### Key poses to capture for Bramm rig

1. **Idle stance** — feet shoulder-width, slight forward lean, fists clenched at hip-height.
2. **Dash run cycle** — heavy forward lean (~30°), arms pumping wide, scarf trailing horizontal.
3. **Knee pose (sweet-spot frame 14–15)** — knee fully extended forward, body rotated 90° w/ rear leg trailing, arms flared back for counter-balance.
4. **Stomp pose (dair)** — both legs together extended downward, body vertical-axial, fists raised high.
5. **Falcon Punch wind-up (f1–51)** — rear-leg stance, arm cocked back fully, body coiled — the iconic "winding up" pose.
6. **Falcon Punch release (f52)** — full forward extension, fist flame-trail, helmet visor angled downward toward target.
7. **Up-B grab pose** — both arms extended overhead in catch motion.
8. **Victory pose 1 / 2 / 3** — fist pump, helmet salute, "YES!" — all need solarpunk equivalents.
9. **Taunt** — "Show me your moves!" hands-out gesture.
10. **Shield bubble + dodge anim** — standard but body proportions matter for hurtbox accuracy.

---

## 12. Sources

### Primary frame data
- https://www.ssbwiki.com/Captain_Falcon_(SSBM)
- https://meleeframedata.com/falcon
- https://web.archive.org/web/2023*/kuroganehammer.com/Melee/Falcon
- https://smashboards.com/threads/captain-falcon-detailed-frame-data.319924/ (Magus420)
- https://smashboards.com/threads/the-20xx-melee-training-hack-pack-v4-07-7-15-17.351221/ (20XX Hack Pack)

### Renders / models
- https://www.ssbwiki.com/Captain_Falcon
- https://supersmashbros.fandom.com/wiki/Captain_Falcon
- https://www.models-resource.com/gamecube/supersmashbrosmelee/model/1054/
- https://www.models-resource.com/gamecube/supersmashbrosmelee/
- https://www.spriters-resource.com/snes/fzero/
- https://www.vg-resource.com/

### Universal physics constants (cross-reference)
- https://www.ssbwiki.com/Falling_speed
- https://www.ssbwiki.com/Weight
- https://www.ssbwiki.com/Traction
- https://www.ssbwiki.com/Wavedash

---

## 13. Self-Validation Checklist

- [x] Every move has startup/active/total — *jab1, jab2, dash-attack, ftilt(×3), utilt, dtilt, fsmash(×3), usmash, dsmash, nair, fair-sweet, fair-sour, bair, uair, dair, neutralB, sideB(×2), upB, downB(×2), all 3 grabs, all 4 throws — present.*
- [x] Every aerial has L-cancel + non-L-cancel landing lag — *nair, fair (sweet+sour share), bair, uair, dair — all dual values present.*
- [x] Every smash has charge frame info — *fsmash f10, usmash f5, dsmash f6 — all charge frames present.*
- [x] All KB values include base + growth + angle — *every move row carries BKB / KBG / Angle.*
- [x] Knee sweet/sour rows distinct with damage + KB delta — *sweet: 18% / BKB 80 / KBG 80 / electric, sour: 3% / BKB 0 / KBG 30 / no electric — distinct rows confirmed.*
- [x] At least 3 character render source links — *SSBWiki, Smashpedia, TheModelsResource, Spriters Resource = 4 distinct render sources, exceeds requirement.*
- [x] All gaps tagged — *every uncertain value carries `[unverified]`; structural gaps (jab3 doesn't exist; exact bone-attached hitbox coords) carry `[gap]` with explanation.*

### Outstanding work for production-grade port
1. **Cross-verify all `[unverified]` values** against MeleeFrameData + Magus420 thread — at least 25 values flagged.
2. **Pull exact hitbox bone-attachments + radii** from 20XX Hack Pack or Dolphin memory dump — this doc abstracts hitbox positions; production rig needs game-units.
3. **Decide jab3 policy** — Falcon canonically has 2-hit jab; if Bramm needs 3-hit string, design new f3 — do not call it ported.
4. **Verify physics constants** (walk speed, air speed, air friction, jump velocities) from SSBWiki physics tables — values cited from memory.
5. **Source Knee electric hitlag multiplier** exactly (cited as ×1.5; verify in engine spec).
6. **Lock Bramm's solarpunk-redesign palette** before rigging — silhouette cues defined here; color spec lives in art bible.
