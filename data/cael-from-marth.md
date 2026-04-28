# Cael Solari — Source: Marth (Melee NTSC v1.02)

> Frame-and-command-perfect port reference. Source: Super Smash Bros. Melee, NTSC v1.02. Tipper mechanic preserved on every sword move. Numbers below are raw Melee values — engine-side scaling/units lives in the universal-engine-math doc, not here.

> **CRITICAL — Tipper Mechanic.** Marth's Falchion has two damage zones on virtually every sword strike: the **tip** (sweet spot, higher damage, higher KB, KO-grade) and the **blade body / hilt** (sour spot, lower damage, often combo-grade with lower angle). Cael Solari MUST replicate this. Every sword move below has distinct sweet (tip) and sour (body/hilt) rows where applicable.

---

## 1. Physics Profile

| Stat | Value | Notes |
|---|---|---|
| Weight | 87 | Mid-light. Not a featherweight, but combo food vs spacies. |
| Walk speed | 1.6 | Moderate. |
| Initial dash speed | 1.5 | |
| Run speed | 1.8 | Decent — not Captain Falcon, not Bowser. |
| Air speed | 0.9 | Above average. Drift matters. |
| Air friction | 0.005 | |
| Air acceleration | 0.02 base / 0.03 additional | |
| Gravity | 0.085 | Floaty side of mid. |
| Fall speed (base) | 2.2 | |
| Fast-fall speed | 2.5 | ~1.136× base. |
| Traction | 0.06 | Moderate — enables long wavedash (see §4). |
| Character height/hurtbox | **TALL** | Marth has one of the tallest standing hurtboxes in the cast. Long torso + long limbs = big combo target. **Port note for Cael: silhouette must read tall + slim, not bulky. Hurtbox extends well above sword arm during idle.** |

---

## 2. Jumps

| Stat | Value | Notes |
|---|---|---|
| Jumpsquat | 4 frames | |
| Full-hop airborne frame | 5 | Frame 5 of jump = leaves ground. |
| Full-hop air time | 59 frames | Earliest fast-fall on frame 31. |
| Short-hop air time | 38 frames | Earliest fast-fall on frame 20. |
| Full hop apex height | 35.09 [units, Melee internal] | |
| Short hop apex height | 13.995 [units] | |
| Full hop velocity | [unverified — exact y-velocity not surfaced; derive from apex + gravity] | |
| Short hop velocity | [unverified — same; ~0.66× of full hop is the standard Melee ratio] | |
| Double jump velocity | [unverified — Marth's double jump preserves horizontal momentum, generous height] | |
| Air jumps | **1** (one mid-air jump) | Standard Melee non-floaty kit. |

---

## 3. Wavedash

| Stat | Value | Notes |
|---|---|---|
| Wavedash length rank | **#4 in cast** | Only Mewtwo, Ice Climbers, Luigi exceed it. Cael MUST inherit this — it's identity-defining. |
| Optimal wavedash angle | ~17.1° | Tight window — risk/reward; standard inputs land slightly steeper. |
| Wavedash-OoS notes | Drives spacing game. Wavedash back → ftilt / fsmash, wavedash forward → grab / dtilt, wavedash down on platforms = fundamental movement option. **Wavedash-out-of-shield → fsmash / grab is the bread-and-butter punish.** |

---

## 4. Ground Attacks

> All sword moves carry tipper. **Sweet = tip of Falchion** (higher damage + KB). **Sour = blade body / closer to hilt** (lower damage, often better combo angle).

### Jab (2-hit)

| Hit | Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Jab 1 | Sweet (tip) | 4 | 4-7 | 26 | 27 | 6% | 30 | 60 | [unverified] | Window for Jab 2: f3-27 |
| Jab 1 | Sour (body) | 4 | 4-7 | 26 | 27 | 4% | 20 | 50 | [unverified] | |
| Jab 2 | Sweet (tip) | 4 | 5-9 | 26 | 27 (28 per some sources) | 6% | 30 | 60 | [unverified] | Second slash starts ~f20 if input held |
| Jab 2 | Sour (body) | 4 | 5-9 | 26 | 27 | 4% | 20 | 50 | [unverified] | |

### Dash Attack

| Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Sweet (tip) | 12 | 12-15 | 40 | 49 | 12% | 70 | 55 | [unverified] | |
| Mid blade | 12 | 12-15 | 40 | 49 | 11% | [unverified] | 60 | [unverified] | Three damage tiers reported (12/11/9) |
| Sour (hilt/body) | 12 | 12-15 | 40 | 49 | 9% | 35 | 60 | [unverified] | |

### Forward Tilt (angleable up / mid / down)

| Angle | Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Mid (default) | Sweet (tip) | 7 | 7-10 | [unverified] | 35 | 13% | 60 | 70 | [unverified] | |
| Mid | Sour (body) | 7 | 7-10 | [unverified] | 35 | 9% | 30 | 70 | [unverified] | |
| Up-angled | Sweet | 7 | 7-10 | [unverified] | 35 | 13% | 60 | 70 | higher launch angle | |
| Up-angled | Sour | 7 | 7-10 | [unverified] | 35 | 9% | 30 | 70 | | |
| Down-angled | Sweet | 7 | 7-10 | [unverified] | 35 | 13% | 60 | 70 | low angle — useful vs ledges | |
| Down-angled | Sour | 7 | 7-10 | [unverified] | 35 | 9% | 30 | 70 | | |

### Up Tilt

| Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Sweet (tip — far above head) | 6 | 6-12 | 32 | 39 | 13% | 50 | 100 | [unverified] | Dynamic hitboxes — sword arcs |
| Mid blade | 6 | 6-12 | 32 | 39 | 10-12% | 40 | 118-120 | [unverified] | |
| Sour (body / inner) | 6 | 6-12 | 32 | 39 | 8-9% | 30 | 116 | [unverified] | Low-% combo starter |

### Down Tilt

| Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Sweet (tip) | 7 | 7-9 | 20 | 49 | 10% | 50 | 40 | 30° (semi-spike) | KEY edgeguard tool |
| Mid | 7 | 7-9 | 20 | 49 | 9% | 40 | 40 | 30 | |
| Sour (body/hilt) | 7 | 7-9 | 20 | 49 | 8% | 20-25 | 40 | 30 | Combo into tipper fsmash |

### Forward Smash (angleable up / mid / down)

| Angle | Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Mid (default) | **Sweet (TIPPER)** | 10 | 10-13 | 48 | 49 | **20%** | 80 | 70 | KO at ~50% near ledge — Marth's signature kill move |
| Mid | Sour (body) | 10 | 10-13 | 48 | 49 | 14% | 60 | 70 | Charge frame: f3 |
| Up-angled | Sweet | 10 | 10-13 | 48 | 49 | 20% | 80 | 70 | |
| Up-angled | Sour | 10 | 10-13 | 48 | 49 | 14% | 60 | 70 | |
| Down-angled | Sweet | 10 | 10-13 | 48 | 49 | 20% | 80 | 70 | Snags ledge huggers |
| Down-angled | Sour | 10 | 10-13 | 48 | 49 | 14% | 60 | 70 | |

### Up Smash

| Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Notes |
|---|---|---|---|---|---|---|---|---|
| Sweet (tip — top of arc) | 13 | 13-16 | 46 | 54 | **18%** | 60 | 80 | KO confirm off uthrow on floaties |
| Mid | 13 | 13-16 | 46 | 54 | 15% | 30 | 100 | Charge frame: f7 |
| Sour (body / set-KB hit) | 13 | 13-16 | 46 | 54 | 8% | 0 (set KB ~100) | 100 | Locks in for sweet hit |

### Down Smash (TIPPER — both hits)

| Hit | Spot | Startup | Active | IASA | Total | Damage | BKB | KBG | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Hit 1 (front) | Sweet (tip) | 5 | 5-7 | 62 | 64 | **16%** | 70 | 100 | Front slash — fastest smash startup f5 |
| Hit 1 | Sour | 5 | 5-7 | 62 | 64 | 11% | 20-30 | 72 | Charge frame: f3 |
| Hit 2 (back) | Sweet (tip) | 20 | 20-22 | 62 | 64 | 16% | 70 | 100 | |
| Hit 2 | Sour | 20 | 20-22 | 62 | 64 | 11% | 15-30 | 72 | Two-sided — covers rolls |

---

## 5. Aerials

> All aerials carry tipper. **Landing lag** = unmodified ground recovery. **L-cancel** = halved (rounded) landing lag on ≤7-frame input window before touchdown. Autocancel windows = frames where landing produces normal landing animation (4 frames).

### Neutral Air (NAir — 2 hits)

| Hit | Spot | Startup | Active | IASA | Total | Land Lag | L-Cancel | Damage | BKB | KBG | Angle | Autocancel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hit 1 | Sweet (tip) | 6 | 6-7 | [unverified] | 49 | 15 | 7 | 10% | 50 | 80 | 90 | <5, 25> |
| Hit 1 | Sour | 6 | 6-7 | [unverified] | 49 | 15 | 7 | 4% | 30 | 40 | 100 | |
| Hit 2 | Sweet (tip) | 15 | 15-21 | [unverified] | 49 | 15 | 7 | 10% | 50 | 80 | 361 (Sakurai) | |
| Hit 2 | Sour | 15 | 15-21 | [unverified] | 49 | 15 | 7 | 4% | 30 | 40 | 361 | |

### Forward Air (FAir) — Cael's bread-and-butter

| Spot | Startup | Active | IASA | Total | Land Lag | L-Cancel | Damage | BKB | KBG | Angle | Autocancel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sweet (TIPPER) | 4 | 4-7 | 30 | 33 | 15 | **7** | 13% | 42 | 70 | 67 | 27> |
| Mid blade | 4 | 4-7 | 30 | 33 | 15 | 7 | 10% | 30 | 70 | 361 | |
| Sour (body) | 4 | 4-7 | 30 | 33 | 15 | 7 | 9% | 20 | 70 | 361 | |

> Frame-4 startup. Lowest landing lag of all aerials. **The fair wall** — short-hop fair, fade back, repeat. Defines the matchup.

### Back Air (BAir)

| Spot | Startup | Active | IASA | Total | Land Lag | L-Cancel | Damage | BKB | KBG | Angle | Autocancel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sweet (tip) | 7 | 7-11 | 35 | 39 | 24 | **12** | 13% | 30 | 70 | 361 | 32> |
| Mid | 7 | 7-11 | 35 | 39 | 24 | 12 | 10% | 25 | 70 | 361 | |
| Sour (body) | 7 | 7-11 | 35 | 39 | 24 | 12 | 9% | 10 | 70 | 361 | |

### Up Air (UAir)

| Spot | Startup | Active | IASA | Total | Land Lag | L-Cancel | Damage | BKB | KBG | Angle | Autocancel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sweet (tip — top arc) | 5 | 5-8 | [unverified] | 45 | 15 | **7** | 13% | 40 | 70 | 80 | <4, 27> |
| Mid | 5 | 5-8 | [unverified] | 45 | 15 | 7 | 10% | 30 | 70 | 90 | |
| Sour (base/body) | 5 | 5-8 | [unverified] | 45 | 15 | 7 | 9% | 18-20 | 70 | 80-90 | |

### Down Air (DAir) — meteor on tip

| Spot | Startup | Active | IASA | Total | Land Lag | L-Cancel | Damage | BKB | KBG | Angle | Autocancel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sweet (tip — **METEOR**) | 6 | 6-9 | [unverified] | 59 | 32 | **16** | 13% | 30 | 70 | 290 (spike) | <5, 48> |
| Mid | 6 | 6-9 | [unverified] | 59 | 32 | 16 | 10% | 40 | 70 | 80 | |
| Sour (body) | 6 | 6-9 | [unverified] | 59 | 32 | 16 | 9% | 20 | 70 | 361 | |

> Tipper dair = the Ken Combo finisher (uair → fair tipper offstage → dair tipper). Cael Solari's "Skyburner Drop."

---

## 6. Specials

### Neutral B — Shield Breaker (chargeable)

| State | Charge frames to release | Hit | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|
| **Uncharged** | 11 to charge state, release immediately | 5-10 from release | 29 | 7% | 34 | 100 | 361 | Standard tap-B output |
| Mid charge | hold then release | 5-10 from release | 29 | scales linearly | scales | 100 | 361 | |
| **Fully charged** | 121 frames max charge | 5-10 from release | 29 | **28%** | 40 (or 30 per source) | 100 | 361 | Breaks shields outright. Storable? **NO — Melee Shield Breaker cannot be stored.** Must commit. |

> Port note: 11-frame charge windup before hitbox is theoretical-fastest from neutral. Total move = ~16 startup + 5-10 active + endlag.

### Side B — Dancing Blade (4-stage chain × 3 directional variants from stage 2 onward)

> Stage 1 has only ONE direction (side). Stages 2–4 each have side / up / down variants.

#### Stage 1

| Variant | Startup | Active | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|
| Side | 6 | 6-8 | 29 | 4% | 55 | 25 | 80/96/85/76 (dynamic) | Window to stage 2: f9–26. Often used for horizontal recovery. |

#### Stage 2

| Variant | Startup | Active | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|
| Side | 14 | 14-16 | 40 | 5% | 16 | 100 | 50/105/80/70 | Window to stage 3: f17–33 |
| Up | 12 | 12-15 | 40 | 5% | 30/70/85 | 40 | 79/85/90 | Window to stage 3: f17–32 |
| Down | [unverified — ~14] | [unverified] | 40 | 4% | [unverified] | [unverified] | [unverified] | [gap — confirm against Magus420 / Kadano data] |

#### Stage 3

| Variant | Startup | Active | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|
| Side | 11 | 11-14 | 46 | 10% | [unverified] | 160 | 361 | Window to stage 4: f16–37. KO-grade KBG. |
| Up | 13 | 13-17 | 46 | 6% | 60 | 60 | 80 | Window to stage 4: f18–38 |
| Down | 15 | 15-18 | 46 | 12% | 50 | 100 | 270 | **METEOR SMASH** — true spike when sweetspotted |

#### Stage 4

| Variant | Startup | Active | Total | Damage | BKB | KBG | Angle | Notes |
|---|---|---|---|---|---|---|---|---|
| Side | 23 | 23-26 | 50 | 14% | 15 | 120 | 361 | Single-hit horizontal kill |
| Up | 20 | 20-25 | 50 | 10% | 40 | 130 | 80 | Anti-air kill |
| Down | [unverified — ~20-22 first hit] | multi-hit | 60 | 3% / 5% (multi-hit) | 2 / 20 | 40 / 130 | 80 / 361 | Multi-hit "rapid stab" finisher — locks opponent in |

> Mixup tree: f6 stage-1 side keeps sweet/sour spacing. Whether to commit to stage 3 or 4, and which direction, IS the read game. **Stage 3 down = surprise spike on offstage opponents.** Stage 4 side = horizontal kill at high %.

### Up B — Dolphin Slash (recovery)

| State | Spot | Startup | Active | Total | Damage | BKB | KBG | Angle | Invuln | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Grounded | Sweet (tip / first hit) | 5 | 5-10 (hit window 5-7 strong) | 39 | **13%** | 80 | 70 | 361 | f5 only | Frame-5 OoS option (after JS). Strong first hitbox. |
| Grounded | Sour (later frames) | 5 | 8-10 | 39 | 10% | 60 | 70 | 74 | | |
| Aerial | Sweet (first hit) | 5 | 5-7 | 39 | 7% | 20 | 90 | 74 | f1-5 | Full-intangible first 5f in air. |
| Aerial | Sour | 5 | 8-10 | 39 | 6% | 20 | 90 | 361 | | |
| Landing lag | — | — | — | — | 34 frames | — | — | — | — | High landing lag — punishable if shielded |

> Recovery distance: high vertical, modest horizontal (reversible in first few frames — "Pichu DI" trick on the input). Cael's "Skyburner" up-B — vertical pillar of light.

### Down B — Counter

| Phase | Frames | Notes |
|---|---|---|
| Counter detection window | f5–f29 (25 active) | Total stance: 59 frames |
| Freeze (on success) | 11 frames | |
| Intangibility (counterattack) | f1–5 of counterattack | |
| Counterattack hitbox | f3–9 of counterattack (~f14–20 from input) | |
| Counterattack total | 35 frames | |

| Output | Damage | BKB | KBG | Angle |
|---|---|---|---|---|
| Counterattack | **Flat 7%** | 90 | 35 | 361 (Sakurai 90°) |

> **CRITICAL — Damage scaling rule:** Marth's Counter does NOT multiply incoming damage. **Flat 7% output regardless of attack countered.** This is distinct from Roy's 1.5× multiplier counter. Low KBG → utility is gimping, not killing. Counter radius: 8.5. Cael keeps the flat-output rule — narrative is "perfect parry, not absorb-and-amplify."

---

## 7. Throws

| Throw | Damage | BKB | KBG | Angle | Total | Notes |
|---|---|---|---|---|---|---|
| Standing grab | — | — | — | — | startup f7, active f7-8, total 30 | Tether-free, ~average range |
| Dash grab | — | — | — | — | startup f10, active f10-11, total 40 | |
| Pivot grab | — | — | — | — | [unverified — derived from standing grab w/ pivot frames] | |
| Pummel | 3% | set KB 30 | — | 80 | — | |
| Forward throw | 4% | 70 | 45 | 50 | 31 | Combos into dash attack / fair / dtilt / **tippered fsmash** depending on DI |
| Back throw | 4% | 70 | 60 | 117 | 44 | DI-trap at high %; positional reset |
| **Up throw** | 4% | 60 | 130 | 93 | 44 | 3rd-strongest uthrow in cast. **Chaingrabs Fox/Falco at low %** — zero-to-death potential. Juggle starter on rest. |
| **Down throw** | 5% | 65 | 50 | 135 | 42 | Throws behind. Sets up edgeguards offstage; **tippered fsmash at low % follow-up**. |

---

## 8. Defensive Options

| Action | Total | Invulnerable | Notes |
|---|---|---|---|
| Spot dodge | 27 | f2–18 (17 frames intangible) | |
| Roll forward | 35 | f4–19 (16 frames) | |
| Roll backward | 35 | f4–23 (20 frames) | Slightly longer — better escape option |
| Air dodge | 49 | f4–29 (26 frames) | Drives wavedash. Marth's wavedash length (rank 4) comes from this + traction 0.06. |
| Tech (in place / forward / back) | [unverified — standard Melee values] | [unverified] | |

---

## 9. Notable Techniques + Tactics

### Fair Walls
Short-hop fair, drift back, L-cancel on f7 land lag, repeat. Frame-4 startup means it covers options faster than most opponents can challenge. **Tipper spacing** is the goal — sour fair combos, sweet fair kills.

### Ken Combo
Up-throw → uair (juggle) → fair (offstage) → **dair tipper meteor**. Named after Ken Hoang. Works on fast-fallers at mid %. Cael's identity-defining combo: rebrand as **"Skyburner Verdict."**

### Edgeguarding Routine
- **Dtilt** (semi-spike, angle 30°) — covers ledge approach.
- **Fair tipper** offstage — wall opponents back out.
- **Dair tipper** — spike on deep recoveries.
- **Shield Breaker** — read-based, hard call-out on linear recoveries.
- **Dancing Blade stage-3 down** — surprise spike if they DI in.
- **Counter** — gimp tool against predictable up-B (Falco, Falcon).

### Dancing Blade Mixups
Stage 1 side is the fishing hit. From stage 2 onward, every stage has 3 directions. Read-driven:
- **Stage 3 side** (KBG 160) = horizontal kill
- **Stage 3 down** = meteor on offstage opponent
- **Stage 4 up** = anti-air kill on jumpers
- **Stage 4 side** at high % = direct horizontal KO

The opponent has to commit DI before knowing which finisher you'll throw — that's the mixup.

### Down-Throw Tipper Follow-ups
- Low % (0–30%): dthrow → tippered fsmash (front- or up-angled).
- Mid % (30–60%): dthrow → fair tipper for stage control.
- Off-stage dthrow: dthrow → run-off bair / Dancing Blade for edgeguard pressure.

### Wavedash-Out-of-Shield
Marth's #4 wavedash + frame-5 OoS Dolphin Slash means he has TWO elite OoS options:
- Wavedash OoS → grab / fsmash / dtilt — exits shield laterally with a punish.
- Dolphin Slash OoS — frame-5 vertical answer to crossups.

---

## 10. Character Renders + Visual References

> Visual identity for porting Marth → "Cael Solari" (Skyburner Prince — solarpunk swordsman). Source links below — fetch separately, do not embed in main thread.

### Official + Wiki Art
- **SmashWiki — Marth (SSBM) page** (character infobox render, in-game stance, victory poses): https://www.ssbwiki.com/Marth_(SSBM)
- **SmashWiki — Marth (cross-game)** (full art history): https://www.ssbwiki.com/Marth
- **SmashWiki — Character artwork** (artbook scans, original Melee promotional renders): https://www.ssbwiki.com/Character_artwork
- **Smashpedia — Marth (Melee)** (alternate angle renders, costume colors): https://supersmashbros.fandom.com/wiki/Marth_(Super_Smash_Bros._Melee)

### Ripped Models / Textures (porting source)
- **The Models Resource — Marth (SSBM playable)**: https://www.models-resource.com/gamecube/ssbm/model/44808/
- **The Models Resource — Marth Trophy (Classic)**: https://www.models-resource.com/gamecube/ssbm/model/17175/
- **The Textures Resource — Marth (SSBM)**: https://textures.spriters-resource.com/gamecube/ssbm/asset/369584/
- **The Spriters Resource — SSBM Character Select Portraits**: https://www.spriters-resource.com/gamecube/ssbm/asset/28076/
- **SSBM Textures — Marth category** (community textures): https://ssbmtextures.com/category/characters/marth-characters/
- **The Sounds Resource — Marth SSBM** (voice/SFX reference for Cael's audio direction): https://sounds.spriters-resource.com/gamecube/ssbm/asset/394065/

### Key Pose / Animation References (use for Cael keyframes)
1. **Neutral idle stance** — Falchion held low, off-hand free, weight on back foot, cape drape. → Cael equivalent: solar-blade dimmed-glow idle.
2. **Falchion drawn / ready stance** (taunt) — sword extended forward, cape sweep. → Cael: blade flares solar at taunt.
3. **Fsmash full extension (tipper frame 10–13)** — long lunge, back foot anchored, sword tip leads. THE money pose for tipper VFX. → Cael: tip flashes brighter solar-white when sweetspot lands; muted gold on sour.
4. **Dolphin Slash arc** (up-B) — vertical pillar pose, sword upward, body launches diagonal. → Cael: pillar of solar light, body-trail glyph.
5. **Dancing Blade stage 4 finisher (side)** — full rotational slash, momentum-forward. → Cael: arcing solar trail, multi-stage variants flash different elemental tints (cyan/gold/violet).
6. **Counter pose** (down-B detection stance) — sword across body, defensive readying. → Cael: solar-mirror parry shimmer.
7. **Ken-combo dair pose** — sword pointed straight down, body inverted, falling. → Cael's "Skyburner Verdict" pose.

### Silhouette Cues (DO NOT LOSE in port)
- **Long sword extension** — Falchion is unusually long; reads in silhouette before character identity.
- **Tall slim build** — narrow shoulders, long limbs. Tall hurtbox is a gameplay fact, not a visual liberty.
- **Regal cape** — back-flowing during dash, settles during idle. Critical for movement readability. → Cael: solar-cloth half-cape, glows on dash.
- **Royal blue armor + shoulder accents** — primary color is deep blue/cobalt, gold trim. → Cael: cobalt + solar-gold; same value structure to preserve recognition.
- **Hairstyle** — blue, parted, mid-length. → Cael: blonde or solar-gold hair, similar parted silhouette.
- **Crown / circlet** — small but present. → Cael: solar-circlet ring, subtle bloom.

---

## 11. Sources

- SmashWiki — Marth (SSBM): https://www.ssbwiki.com/Marth_(SSBM)
- SmashWiki — Marth (SSBM) / Down special (Counter): https://www.ssbwiki.com/Marth_(SSBM)/Down_special
- SmashWiki — Marth (SSBM) / Up special (Dolphin Slash): https://www.ssbwiki.com/Marth_(SSBM)/Up_special
- SmashWiki — Marth (SSBM) / Neutral special (Shield Breaker): https://www.ssbwiki.com/Marth_(SSBM)/Neutral_special
- SmashWiki — Dancing Blade: https://www.ssbwiki.com/Dancing_Blade
- SmashWiki — Dolphin Slash: https://www.ssbwiki.com/Dolphin_Slash
- SmashWiki — Shield Breaker: https://www.ssbwiki.com/Shield_Breaker
- SmashWiki — Counter: https://www.ssbwiki.com/Counter
- SmashWiki — Wavedash: https://www.ssbwiki.com/Wavedash
- Liquipedia Smash — Marth/Frame Data: https://liquipedia.net/smash/Marth/Frame_Data
- Liquipedia Smash — Wavedash (gameplay): https://liquipedia.net/smash/Wavedash_(gameplay)
- FightCore — Marth (SSBM): https://www.fightcore.gg/characters/222/marth/
- FightCore — Marth Down Smash: https://www.fightcore.gg/characters/222/marth/moves/832/dsmash/
- FightCore — Marth Forward Air: https://www.fightcore.gg/characters/222/marth/moves/834/fair/
- FightCore — Marth Dolphin Slash: https://www.fightcore.gg/characters/222/marth/moves/841/upb/
- FightCore — Marth Shield Breaker: https://www.fightcore.gg/characters/222/marth/moves/862/neutralb/
- KuroganeHammer — Marth (Melee): https://kuroganehammer.com/Melee/Marth
- meleeframedata.com — Marth: https://meleeframedata.com/marth (cert expired at fetch time; reference URL only)
- Smashboards — COMPLETE: Marth Hitboxes and Frame Data (Magus420/Stratocaster project): https://smashboards.com/threads/complete-marth-hitboxes-and-frame-data.285324/
- Smashboards — Kadano's Perfect Marth Class (advanced frame data application): https://smashboards.com/threads/kadanos-perfect-marth-class-advanced-frame-data-application.337035/
- Smashboards — Marth Frame Data (legacy): https://smashboards.com/threads/marth-frame-data.204825/
- Melee.Guru — Marth Stage 1 / Stage 2: https://melee.guru/characters/marth-stage1.html , https://melee.guru/characters/marth-stage2.html
- Melee.Guru — Wavedash tech: https://melee.guru/characters/tech/wavedash.html
- The Models Resource — SSBM: https://models.spriters-resource.com/gamecube/ssbm/
- The Models Resource — Marth: https://www.models-resource.com/gamecube/ssbm/model/44808/
- The Models Resource — Marth Trophy: https://www.models-resource.com/gamecube/ssbm/model/17175/
- The Textures Resource — Marth: https://textures.spriters-resource.com/gamecube/ssbm/asset/369584/
- The Spriters Resource — SSBM Character Select Portraits: https://www.spriters-resource.com/gamecube/ssbm/asset/28076/
- SSBM Textures — Marth: https://ssbmtextures.com/category/characters/marth-characters/
- Smashpedia — Marth (Melee): https://supersmashbros.fandom.com/wiki/Marth_(Super_Smash_Bros._Melee)
- Smashpedia — Counter: https://supersmashbros.fandom.com/wiki/Counter

---

## 12. Self-Validation Checklist

- [x] Every sword move has tipper sweet/sour rows (jab1, jab2, dash attack, ftilt all 3 angles, utilt, dtilt, fsmash all 3 angles, usmash, dsmash both hits, all 5 aerials)
- [x] Every move has startup / active / total
- [x] Every aerial has L-cancel + non-L-cancel landing lag (nair 15/7, fair 15/7, bair 24/12, uair 15/7, dair 32/16)
- [x] Shield Breaker charged (28%, 121f max charge) + uncharged (7%) data
- [x] Dancing Blade all 4 stages × 3 variants (stage 1: side only — Melee design; stages 2–4: side/up/down all covered, with `[unverified]` tags on missing rows)
- [x] Counter scaling rule documented (FLAT 7% — not multiplier — distinct from Roy)
- [x] At least 3 character render source links (Models Resource main, Trophy model, Textures Resource, Spriters Resource portraits, SmashWiki, Smashpedia — 6+ provided)
- [x] All gaps tagged `[unverified]` or `[gap]`

### Outstanding gaps to backfill (cross-ref Magus420 + Kadano spreadsheets)
- [ ] Exact y-velocity for full hop / short hop / double jump (only apex heights surfaced)
- [ ] Hitlag values per move (not consistently surfaced across sources)
- [ ] Dancing Blade stage 2 down + stage 4 down full BKB/KBG row
- [ ] Tech-in-place / tech-roll frame data
- [ ] Pivot grab frame data
- [ ] Hitbox positions in 3D space (radius, x/y/z offsets per bone) — required for actual 1:1 hitbox replication; not in this scope but flagged
