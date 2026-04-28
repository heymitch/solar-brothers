# Melee Universal Engine Reference (NTSC v1.02)

Scope: universal engine math + universal techniques shared across all characters. Per-character move/frame data is OUT of scope (handled by per-character agents).

Game runs at 60 FPS NTSC. All formulas below assume integer-frame discipline — every duration (hitlag, hitstun, shieldstun, jumpsquat, etc.) is a discrete frame count, computed by `floor(...)` on the real-valued formula. Fractional frames do not exist in the simulation.

---

## 1. Frame rate + integer-frame discipline

- Simulation tick: **60 FPS NTSC** (v1.02). One frame = 1/60 s = ~16.667 ms.
- All durations are **integer frames**, produced by `floor(...)` on the real-valued formula. There is no sub-frame state.
- Inputs are sampled once per frame. SDI / DI / ASDI all read the analog stick on a specific frame (see DI section).
- `hitlag`, `hitstun`, `shieldstun`, `jumpsquat`, `landing lag`, `tech window` — all integer frames.
- Hitlag is a **mutual freeze** (attacker + defender both pause for the same count, modulo electric multiplier on victim only).
- Port a frame counter, not a delta-time accumulator. If you must use delta-time, snap to 60 Hz fixed steps — variable timestep will break combos.

Sources:
- [Knockback — SmashWiki](https://www.ssbwiki.com/Knockback)
- [Hitlag — SmashWiki](https://www.ssbwiki.com/Hitlag)

---

## 2. Universal physics defaults

Melee uses **per-character** physics constants — there is no single "universal default." But the engine math is uniform; only the constants change per character. Below are the engine ranges and the math they feed.

| Quantity | Units | Range across cast | Engine role |
|---|---|---|---|
| Gravity | units/frame² | ~0.064 (Jigglypuff) — 0.23 (Fox) | Vertical accel per frame while airborne, until terminal velocity |
| Fall speed (terminal velocity) | units/frame | ~1.3 (Jigglypuff) — 3.1 (Falco) | Cap on downward velocity from gravity |
| Fast-fall speed | units/frame | character-specific, **set value** (not multiplier) | Overrides downward velocity when fast-fall input |
| Fast-fall ratio (fastfall / fall) | dimensionless | ~1.13× (Falco) — ~1.64× (Samus) | Observed ratio, NOT a universal multiplier |
| Jumpsquat | frames | 3 — 6 | Pre-jump ground crouch; jump velocity applies on first airborne frame after jumpsquat ends |

**Falling-speed formula (per frame, while airborne, not in fast-fall, not in knockback):**

```
fallVelocityThisFrame = min(airborneFrame * gravity, terminalVelocity)
```

**Fast-fall behavior:** input down on the stick while airborne and not tumbling → downward velocity is **set** to `fastFallSpeed` (does not accumulate from gravity, does not decelerate). Fast-fall persists until landing, taking knockback, or jumping. Some characters (Peach, Yoshi, Ness, Mewtwo, Jigglypuff, Kirby, Ice Climbers) cannot double-fastfall after a delayed/multi jump.

**Knockback physics override:** while in tumble/knockback, air friction is disabled. Gravity and fall speed still apply (so fast-fallers endure vertical knockback better). Launch speed decay is `0.051 units/frame` applied along the launch vector (see knockback section).

Sources:
- [Gravity — SmashWiki](https://www.ssbwiki.com/Gravity)
- [Falling speed — SmashWiki](https://www.ssbwiki.com/Falling_speed)
- [Fast fall — SmashWiki](https://www.ssbwiki.com/Fast_fall)
- [Jumpsquat — SmashWiki](https://www.ssbwiki.com/Jumpsquat)

---

## 3. Knockback formula — full math

The canonical Melee knockback formula (SmashWiki):

```
KB = ( ( ( ( ( p/10 + p*d/20 ) * 200 / (w + 100) * 1.4 ) + 18 ) * s ) + b ) * r
```

Where:
- `p` = target's percent **after this hit's damage is added** (Melee floors `p` to integer percent; see notes below)
- `d` = damage dealt by this hit (raw, pre-stale; projectiles use staled damage)
- `w` = target's weight
- `s` = knockback growth (KBG) / 100
- `b` = base knockback (BKB)
- `r` = misc multipliers (handicap, launch-rate, charge bonus ×1.2 on full smash charge, crouch-cancel ×0.666667 on victim, frozen ×0.25). Default `r = 1`.

Notes:
- In Melee, `p` is **floored pre-hit percent + sum of hitbox damage(s) dealt this frame**. Integer-clean.
- The `200/(w+100)` term is Melee's weight scaling. Lighter chars (low `w`) take more knockback; heavier chars take less. Different from later games.
- The `+18` constant is the Melee additive applied after weight scaling but before KBG/BKB combine.

### Launch speed conversion

```
launchSpeed = KB * 0.03            // initial speed in units/frame
decayPerFrame = 0.051              // applied along the launch vector each airborne frame
horizontalDecay = 0.051 * cos(launchAngle)
verticalDecay   = 0.051 * sin(launchAngle)
```

Each frame in knockback:
- Subtract `0.051` from the launch-speed magnitude (split per-axis by the angle).
- Apply gravity to the vertical component (capped by fall speed).
- Air friction is **disabled** during knockback.

When `launchSpeed <= 0` (or magnitude crosses 0), knockback ends and the character either lands (if grounded), enters tumble (if still airborne and below tumble threshold), or returns to a normal airborne state.

### Worked example A — 0% damage hit

Setup: Marth Forward Smash (mid hitbox), `b ≈ 50`, `s ≈ 80` ([gap] — exact per-move values are character-data, not engine math). Target = Fox, `w = 75`. Damage `d = 13`. Pre-hit percent `p_pre = 0`. After hit: `p = 0 + 13 = 13`.

```
inner1 = p/10 + p*d/20
       = 13/10 + 13*13/20
       = 1.3 + 8.45
       = 9.75

inner2 = inner1 * 200 / (w + 100) * 1.4
       = 9.75 * 200 / 175 * 1.4
       = 9.75 * 1.142857 * 1.4
       = 15.6

inner3 = inner2 + 18
       = 33.6

inner4 = inner3 * s
       = 33.6 * 0.80
       = 26.88

KB     = inner4 + b
       = 26.88 + 50
       = 76.88
```

→ launch speed `≈ 76.88 * 0.03 ≈ 2.31 units/frame`. Hitstun `= floor(76.88 * 0.4) = 30 frames`.

### Worked example B — 80% damage on the same setup

Same move, same target. Pre-hit `p_pre = 80`, `d = 13`. After hit `p = 93`.

```
inner1 = 93/10 + 93*13/20
       = 9.3 + 60.45
       = 69.75

inner2 = 69.75 * 200 / 175 * 1.4
       = 69.75 * 1.142857 * 1.4
       = 111.6

inner3 = 111.6 + 18
       = 129.6

inner4 = 129.6 * 0.80
       = 103.68

KB     = 103.68 + 50
       = 153.68
```

→ launch speed `≈ 153.68 * 0.03 ≈ 4.61 units/frame`. Hitstun `= floor(153.68 * 0.4) = 61 frames`.

(BKB/KBG values for Marth fsmash above are illustrative; treat exact per-move constants as `[unverified]` until pulled from per-character data files.)

Sources:
- [Knockback — SmashWiki](https://www.ssbwiki.com/Knockback)
- [Knockback Talk page (decay constants 0.03 / 0.051)](https://www.ssbwiki.com/Talk:Knockback)
- [Melee Knockback Formula — Desmos](https://www.desmos.com/calculator/6zpapi7ur5)

---

## 4. Hitstun + hitlag formulas

### Hitlag (frames both attacker and defender freeze on hit)

```
hitlag = floor( floor( floor(d/3 + 3) * e ) * c )
```

Where:
- `d` = damage dealt
- `e` = electric multiplier — `1.5` for victim only if the move has the electric flag, else `1.0`. Attacker always uses `1.0`.
- `c` = crouch-cancel multiplier — `0.666667` for victim only when crouch-cancelling, else `1.0`.

**Cap:** Melee hitlag is capped at **20 frames**.

Worked example: 15% damage move, no electric, no CC.
```
floor(15/3 + 3) = floor(8) = 8 frames hitlag
```
SmashWiki cites 8 frames for this exact case. ✓

Worked example: 15% electric move on victim:
```
victim:   floor( floor(8) * 1.5 ) = floor(12) = 12 frames
attacker: floor( floor(8) * 1.0 ) = 8 frames
```

### Hitstun (frames defender is locked into knockback animation, no actions)

```
hitstun = floor( KB * 0.4 )
```

Where `KB` is the knockback value from §3 (NOT launch speed — the raw KB value).

**Landing override:** if the defender lands during knockback while their launch speed is `> 0.5` (equivalent to `KB > ~16.67`), they enter a 4-frame landing animation instead of the remainder of hitstun. This is the basis for crouch-cancel punishes.

Worked example: KB = 76.88 (Example A above) → `hitstun = floor(76.88 * 0.4) = 30 frames`.
Worked example: KB = 153.68 (Example B) → `hitstun = floor(153.68 * 0.4) = 61 frames`.

**No tumble threshold in Melee** — hitstun is always `KB * 0.4`. (Brawl/Sm4/Ult use different multipliers and tumble thresholds. Don't port those.)

Sources:
- [Hitstun — SmashWiki](https://www.ssbwiki.com/Hitstun)
- [Hitlag — SmashWiki](https://www.ssbwiki.com/Hitlag)

---

## 5. DI (directional influence), SDI, ASDI

### Trajectory DI (the survival-DI / combo-DI)

**Read window:** stick position is sampled on the **last frame of hitlag**.

**Magnitude cap:** trajectory DI rotates the launch angle by **up to ~18°**. The maximum rotation occurs when the stick is held perpendicular to the original knockback vector. Stick parallel to knockback → **0° change**. Stick at intermediate angles → proportional rotation between 0 and 18°.

**Formal model:** project the stick vector onto the perpendicular of the knockback vector. The perpendicular component (signed, magnitude 0–1) scales the rotation:
```
rotation = 18° * perpendicular_component(stick, knockbackAngle)
newAngle = knockbackAngle + rotation   // sign by which perpendicular the stick lies on
```
Note: knockback angles within ~17° of pure horizontal/vertical can only be DI'd partially (no perfect perpendicular available within stick range).

### SDI (Smash directional influence)

Applied **during hitlag** (starting frame 2 of hitlag). Each distinct stick "tap" into a new region produces one **SDI pulse** = **6 units** of position shift in the stick direction. Repeated taps stack; holding does not (you must re-enter the input region for each pulse).

### ASDI (automatic smash DI)

Read on the **last frame of hitlag** (same frame as trajectory DI is read). Produces **one 3-unit position pulse** in the stick direction, automatically — no extra input needed. C-stick can override A-stick for ASDI.

**ASDI-down** is the most important Melee variant: holding down on the stick (or C-stick) at end of hitlag shifts the character down by 3 units. If this puts them on the ground while launch speed is below the landing threshold, they immediately land and skip remaining hitstun. This is the foundation of crouch-cancel and ASDI-down tech.

Sources:
- [DI — SmashWiki](https://www.ssbwiki.com/DI)
- [Smash directional influence — SmashWiki](https://www.ssbwiki.com/Smash_directional_influence)

---

## 6. Shield mechanics

### Shield HP and depletion

| Quantity | Value | Notes |
|---|---|---|
| Max shield HP | 60 | Effective ~85.71 because incoming damage is multiplied by 0.7 before shield-HP subtraction |
| Damage multiplier on shield | 0.7× | Damage to shield = `0.7 * moveDamage` |
| Hold depletion | 0.28 / frame (16.8 / s) | When holding hard shield, no hits |
| Regen | 0.07 / frame (4.2 / s) | When not shielding |
| Shield break | when HP ≤ 0 | Long stun + airborne (~360 frame stun, [unverified] exact) |

### Shieldstun (frames defender frozen in shield after blocking)

Full Melee shieldstun formula:
```
shieldstun = floor( (200/201) * ( ( d * (a + 0.3) ) * 1.5 + 2 ) )

where a = 0.65 * (1 - (s - 0.3)/0.7),  s = analog shield level (0.3 lightest, 1.0 hard)
```

Practical simplifications:
- **Hard shield (s = 1.0):** `shieldstun ≈ floor(0.45*d + 1.99)`. The widely-cited approximation `floor((d + 4.45) * 0.4725)` is a very close fit and matches the same curve. SmashWiki gives `floor((d + 4.45)/2.235)` as another equivalent form.
- **Lightest shield (s = 0.30714):** `shieldstun ≈ floor(1.4*d + 2)`. Light shield takes more shieldstun and pushback than hard shield (this is why high-level Melee uses hard shield).

Worked example: 13% damage hit blocked on hard shield.
```
shieldstun ≈ floor((13 + 4.45) * 0.4725) = floor(8.245) = 8 frames
```
SmashWiki cites 7 frames for 13% on hard shield using the canonical formula — the difference is rounding artifacts of the simplification. **Use the canonical formula in code.** The 8-frame result from the simplified version is within ±1 of canonical across the practical damage range.

### Powershield window

| Mechanic | Window | Notes |
|---|---|---|
| Powershield (physical attack) | First **4 frames** of shield raise | Reduced shieldstun + special properties |
| Powershield (projectile) | First **2 frames** of shield raise | Reflects projectile back at **0.5× damage** |

### Shield drop and shield-related actions

| Action | Frame data |
|---|---|
| Shield drop (release shield → actionable) | **15 frames** |
| Jump out of shield | jumpsquat frames (3–6) — character can jump on frame 1 of shield release |
| Up-B / Up-Smash out of shield | 1 frame (cancels shield directly) |
| Roll / Spotdodge / Grab out of shield | 1 frame (special inputs cancel shield) |
| Shield grab | grab can be input directly from shield; total = grab startup (per-character) |

### Light shield vs hard shield

- **Light shield:** triggered by analog L/R partial press. Shield bubble is **larger** (covers more), depletes slower. **Costs more shieldstun** when hit, and the defender experiences greater pushback. Useful for ledge-camping shielding.
- **Hard shield:** full L/R press. Standard size, faster depletion under hold, less shieldstun. Default competitive shield.

### Shield tilt

Tilting the analog stick while shielding shifts the shield bubble in that direction (up to a small offset). Used to cover specific limbs (e.g. shield-tilt-down to protect feet against low aerials).

### Yoshi exception

Yoshi does NOT take normal shieldstun. Yoshi only takes shieldstun on the first 4 frames of shield startup, with stun = `5 - shieldFrame#`. After that he is shieldstun-immune (but his shield HP still depletes).

Sources:
- [Shield — SmashWiki](https://www.ssbwiki.com/Shield)
- [Shieldstun — SmashWiki](https://www.ssbwiki.com/Shieldstun)
- [Power shield — SmashWiki](https://www.ssbwiki.com/Power_shield)

---

## 7. Air dodge / wavedash math

### Air dodge frame data

| Property | Value |
|---|---|
| Intangibility | frames **4–29** (26 frames intangible) for most characters |
| Total animation | 48 or 49 frames (varies) |
| Bowser | intangible 3–29 |
| Peach, Zelda | intangible 4–19 (only 16 frames) |
| Mewtwo | intangible 4–29 / 39 total frames |
| Direction | 8-way analog (full directional) |
| Post-state | **Helpless** — character falls to ground, no further actions until landing |
| Momentum | If stick neutral, halts momentum and hovers ~most of duration. If tilted, applies a directional impulse. |

### Wavedash derivation

A wavedash is a frame-perfect input of jump (jumpsquat starts) followed by an air dodge with the stick angled near-horizontal-down, performed during jumpsquat or on the very first airborne frame. The character air-dodges into the ground, and on landing the lateral impulse converts into a sliding ground-state movement.

**Formula sketch (engine-level):**
```
1. Jump input → enter jumpsquat (3–6 frames per character)
2. On airborne frame 1: air-dodge input with stick at angle θ (degrees from horizontal, downward)
3. Air dodge applies impulse vector V at angle θ (magnitude is a fixed engine constant per air dodge)
4. Character traces V for one frame; intersects ground; lands
5. Landing converts horizontal component of V into ground velocity
6. Ground friction (per-character traction) decelerates over subsequent frames
```

**Optimal angle:** θ ≈ **17.1°** below horizontal yields maximum lateral distance (low enough to maximize cos(θ), high enough to actually clip the ground).

**Distance factors:**
- Air dodge angle (lower = longer wavedash, but must clip ground)
- Height above ground when air-dodge fires (closer = more horizontal, less wasted on vertical clipping)
- Character traction (lower = longer slide; per-character)
- Air dodge impulse magnitude (engine constant)

Per-character wavedash lengths are out of scope for this file (handled in per-character data).

Sources:
- [Air dodge — SmashWiki](https://www.ssbwiki.com/Air_dodge)
- [Wavedash — SmashWiki](https://www.ssbwiki.com/Wavedash)

---

## 8. L-cancel

| Property | Value |
|---|---|
| Effect | **50%** reduction of aerial landing lag (rounded down) |
| Input | press L, R, or Z |
| Window | **up to 7 frames before landing** |
| Hitlag-extended window | If pressed during hitlag, the L-cancel still applies if landing occurs **up to 6 frames after hitlag ends** |

**What L-cancel reduces:**
- Aerial-attack landing lag (Nair, Fair, Bair, Uair, Dair).

**What L-cancel does NOT reduce:**
- Special-move landing lag (e.g., Falcon Knee's special-fall, Shine landing).
- Auto-cancel landing — auto-cancelled aerials already use the standard `landFrames` (~4 frames), and L-cancel does not stack.
- Hitstun, shieldstun, hitlag — unrelated.
- Ground-attack endlag.

Worked example: Falcon Nair lands with 18 frames of landing lag uncancelled. L-cancelled: `floor(18 / 2) = 9 frames`.

Source:
- [L-canceling — SmashWiki](https://www.ssbwiki.com/L-canceling)

---

## 9. Tech mechanics

### Tech window and lockout

| Property | Value |
|---|---|
| Tech input window | press shield (L/R) within **20 frames before impact** |
| Tech lockout (after a failed L/R press) | **40 frames** lockout from end of hitlag — can't tech during lockout |

If you press shield during hitlag and the timing puts your tech press inside the 20-frame pre-impact window, you tech successfully. If you press shield outside the window, you eat a 40-frame lockout — no tech possible during lockout even if you'd otherwise be in window.

### Successful tech options

| Option | Total frames | Intangibility frames | Notes |
|---|---|---|---|
| Tech-in-place | **26** | **1–20** | Vulnerable frames 21–26 (6 frames). Pichu/Pikachu: intangible 1–24 (only 2 vulnerable). |
| Tech-roll forward | **40** | **1–20** | Moves forward; same intangibility window as tech-in-place |
| Tech-roll backward | **40** | **1–20** | Moves backward; mirror of forward |

### Missed-tech (floor) getup options

After a missed tech, the character lies on the ground and can choose:

| Option | Approximate total | Approximate intangibility | Notes |
|---|---|---|---|
| Get-up neutral (stand) | ~30 frames [unverified] | first ~half intangible [unverified] | Just stands up |
| Get-up roll forward (face-up / face-down) | ~35 frames [unverified] | ~1–19 (face-down) [unverified] | Face-down stomach roll cited as 35/19 |
| Get-up roll backward | ~35 frames [unverified] | ~1–19 [unverified] | |
| Get-up attack | ~49 frames [unverified] | invuln during active hitbox, then vuln [unverified] | Hits both sides |

[gap] — exact universal frame counts for missed-tech getup options are not surfaced clearly on SmashWiki; canonical numbers live in Magus420's Smashboards thread (403's the WebFetch). Pull from `https://smashboards.com/threads/detailed-throws-techs-and-getups-frame-data.206469/` manually for production.

### ASDI-down tech (notable variant)

Holding down + shield before hitlag → on a low-knockback hit, ASDI-down sends the character to the ground while the shield press buffers a tech, resulting in a standing tech. Powerful at low percents against weak combo starters.

Sources:
- [Tech — SmashWiki](https://www.ssbwiki.com/Tech)
- [Floor recovery — SmashWiki](https://www.ssbwiki.com/Floor_recovery) (general info, no Melee-specific frame counts)
- [Detailed Throws, Techs, and Getups Frame Data — Smashboards (Magus420)](https://smashboards.com/threads/detailed-throws-techs-and-getups-frame-data.206469/) [unverified — 403 to scraper]

---

## 10. Ledge mechanics

### Ledge grab

| Property | Value |
|---|---|
| Ledge-grab animation | **7 frames** (most chars), **3 frames** (Link) |
| Ledge intangibility on first grab | **30 frames** |
| Total invuln on initial grab | grab animation (7) + 30 = ~**37 frames** |
| Re-grab cooldown | **none** — Melee allows infinite re-grabs (unlike Ult's 6-grab limit) |
| Ledgestall intangibility | persists if you drop the ledge during invuln frames; foundation of indefinite ledgestalling |
| Direction restriction | character must face the ledge to grab it (Melee + 64 only). Exceptions: moves with auto-snap reverse (Falcon Dive, Spinning Kong) |

### Ledge action frame data (universal pattern)

Below 100% ("fresh"): faster animations. At 100%+ ("tired"): slower animations with slightly more invuln frames on attacks.

Universal/typical numbers (Marth used as reference; varies slightly per character):

| Action | Under 100% (invuln / total) | Notes |
|---|---|---|
| Ledge get-up (stand) | **1–31 / 32** | Climb back to stage standing |
| Ledge roll | **1–27 / 49** | Roll onto stage with ground travel |
| Ledge jump | **1–12 / 12** | Jump from ledge onto stage; actionable on frame 12+ |
| Ledge attack | **1–20 (invuln) / 23–25 (active hitbox) / 54 (total)** | Slow attack, hits both sides of ledge |

| Action | Over 100% (invuln / total) | Notes |
|---|---|---|
| Ledge get-up | significantly slower [unverified — varies per char] | All "tired" variants drop animation speed |
| Ledge roll | slower, slightly more distance [unverified] | |
| Ledge jump | same as fresh in many cases [unverified] | |
| Ledge attack | slower, slightly more invuln [unverified] | |

[gap] — exact "tired" universal frame counts not on SmashWiki. Pull per-character from melee.guru or Smashboards thread `lets-collect-ledge-option-frame-data.409945`.

### Sweetspot / ledge contest

- A character grabs the ledge if their character-specific ledge-grab box overlaps the ledge while moving toward it. Only one character per ledge (later grabs steal the ledge if priority conditions met — generally airborne > grounded, or freshly-grabbed > stale-grab).
- "Sweetspot" = a recovery move whose final ledge-grab box positions overlap the ledge → grabs ledge instead of finishing animation onstage. Per-move (out of scope).

Sources:
- [Edge — SmashWiki](https://www.ssbwiki.com/Edge)
- [Edge attack — SmashWiki](https://www.ssbwiki.com/Edge_attack) [thin]
- [Edge recovery — SmashWiki](https://www.ssbwiki.com/Edge_recovery) [thin]
- [Smash Melee Ledge Occupancy Frame Data — Smashboards](https://smashboards.com/threads/smash-melee-ledge-occupancy-frame-data.513409/) [403 to scraper]
- Marth ledge data cross-referenced from melee.guru / Smashboards excerpts

---

## 11. Hit interaction — clank, priority, trade

### Damage difference rule

When two **ground attack** hitboxes collide on the same frame:

| Damage delta (|d_A − d_B|) | Result |
|---|---|
| ≤ **9%** | Both attacks **clank** — both moves end, both characters enter rebound animation |
| > 9%, A stronger | Stronger move (A) continues; weaker move (B) ends in rebound |
| > 9%, B stronger | Mirror |

**Clank effects:**
- White "ting" bubble + sound effect at collision point.
- Both characters freeze for hitlag frames equal to the **stronger** hit's hitlag.
- After freeze, rebound animation plays. Rebound duration scales with hitbox damage.
- Even if a weaker move clanks (gets cancelled), the stronger attacker can still hit the user of the weaker move on the same or following frames if its hitbox persists. Clank only nullifies the weaker hit, not the attacker.

### Aerial attacks

**Aerial attacks do not clank with each other.** Aerial vs aerial → both connect (trade). Aerial vs ground → behaves like ground vs ground for clank purposes (depending on engine flag — generally projectiles + grounded hitboxes clank, aerials trade). [unverified — exact aerial-vs-aerial vs aerial-vs-ground rule]

### Projectile clank

When a ground move collides with a projectile:
- Ground move ≥ 9% stronger → projectile destroyed, ground move continues.
- Within ±9% → both cancel.
- Projectile ≥ 9% stronger → ground move rebounds, projectile continues.

### Transcendent priority

Some hitboxes have the **transcendent** flag → they cannot clank at all. They pass through other hitboxes without rebound and always connect. Examples include certain projectiles and disjoint weapon hits (sword swipes are often transcendent or disjoint). Disjoint = hitbox extends beyond character's hurtbox so the wielder isn't simultaneously vulnerable, but disjoint and transcendent are separate flags.

Source:
- [Priority — SmashWiki](https://www.ssbwiki.com/Priority)

---

## 12. Universal state graph

```
                              ┌──────────────────────────────────────────────────────┐
                              │                                                       │
                              ▼                                                       │
     ┌─────────┐  walk    ┌─────────┐  smash stick   ┌──────────────┐  initDash done ┌─────────┐
     │ STAND   │─────────▶│  WALK   │───────────────▶│ INITIAL_DASH │───────────────▶│   RUN   │
     │ (idle)  │◀─────────│         │                │  (frames 1-N)│                │         │
     └─────────┘          └─────────┘                └──────────────┘                └─────────┘
        ▲ │                                                  │                            │
        │ │ jump input                                       │ stick reverse              │ stick neutral
        │ │                                                  ▼                            ▼
        │ │                                          ┌──────────────┐             ┌─────────────┐
        │ │                                          │     TURN     │             │  RUN_STOP   │
        │ │                                          │ (skid/pivot) │             │   (skid)    │
        │ ▼                                          └──────────────┘             └─────────────┘
   ┌──────────────┐  jumpsquat ends (3-6f)   ┌──────────────────┐
   │  JUMPSQUAT   │─────────────────────────▶│      RISING      │
   │  (3-6 frames)│                          │  (vy < 0, in air)│
   └──────────────┘                          └──────────────────┘
                                                       │ vy crosses 0
                                                       ▼
                                              ┌──────────────────┐  down-stick   ┌─────────────────┐
                                              │     FALLING      │──────────────▶│    FASTFALL     │
                                              │ vy = min(t*g, FT)│               │ vy = ffSpeed    │
                                              └──────────────────┘               └─────────────────┘
                                                       │                                  │
                                                       │  ground contact                  │  ground contact
                                                       ▼                                  ▼
                                                ┌──────────────────────────────────────────────┐
                                                │                  LAND                         │
                                                │  landFrames (universal ~4f, or aerial-       │
                                                │  attack landing lag, possibly L-cancelled)   │
                                                └──────────────────────────────────────────────┘
                                                                  │  land frames done
                                                                  ▼
                                                              (back to STAND)
```

### Attack subgraph

Attacks can be initiated from STAND, WALK, RUN, RISING, FALLING, FASTFALL.

```
   ┌──────────┐  attack input   ┌──────────┐  startup ends  ┌──────────┐  active ends  ┌─────────┐
   │  source  │────────────────▶│ STARTUP  │───────────────▶│  ACTIVE  │──────────────▶│ ENDLAG  │
   │  state   │                 │ (no hits)│                │ (hitbox) │               │ (no hits)│
   └──────────┘                 └──────────┘                └──────────┘               └─────────┘
                                                                  │                        │
                                                                  │ on hit                 │ end → STAND/AIR
                                                                  ▼                        ▼
                                                            ┌──────────┐
                                                            │  HITLAG  │  (both attacker + defender freeze)
                                                            └──────────┘

   Aerial attack lands during ENDLAG → enters LANDLAG (per-aerial); L-cancel halves it (§8).
```

### Defender (on-hit) subgraph

```
   incoming hit
        │
        ▼
   ┌──────────┐  hitlag ends   ┌──────────┐  hitstun ends  ┌──────────┐
   │  HITLAG  │───────────────▶│ HITSTUN  │───────────────▶│  TUMBLE  │  (if airborne, KB high)
   │ (frozen) │   ── DI read   │ (locked) │                │          │
   └──────────┘                └──────────┘                └──────────┘
                                     │                            │
                                     │ ground contact             │ tech window 20f
                                     │ + KB > 16.67               ▼
                                     ▼                      ┌──────────┐  press shield  ┌──────────┐
                              ┌──────────────┐              │  ABOUT   │───────────────▶│   TECH   │
                              │ LANDING (4f) │              │   TO     │                │ (26-40f) │
                              └──────────────┘              │  IMPACT  │                └──────────┘
                                     │                      └──────────┘
                                     ▼                            │ no tech
                                   STAND                          ▼
                                                            ┌──────────────┐
                                                            │  PRONE       │
                                                            │ (missed tech)│
                                                            └──────────────┘
                                                                  │
                                                                  ▼
                                                       getup options (§9)
```

### Shield subgraph

```
   STAND ──L/R──▶ ┌──────────┐  release L/R  ┌────────────────┐
                  │  SHIELD  │──────────────▶│ SHIELD_DROP 15f│──▶ STAND
                  └──────────┘                └────────────────┘
                       │
                       ├── jump input ──▶ JUMPSQUAT (out of shield)
                       ├── grab input ──▶ GRAB (out of shield, 1f cancel)
                       ├── upB / upSmash ▶ UP_B / UP_SMASH (1f cancel)
                       ├── roll input  ──▶ ROLL (1f cancel)
                       ├── spotdodge   ──▶ SPOTDODGE (1f cancel)
                       │
                       └── hit while shielding ──▶ SHIELDSTUN (§6) ──▶ back to SHIELD
```

### Ledge subgraph

```
   AIR (near ledge, facing it, in valid recovery state)
          │
          ▼
   ┌─────────────────┐  7f (3f Link)  ┌─────────────────┐
   │ LEDGE_GRAB_ANIM │───────────────▶│  LEDGE_HANG     │  30f intangible
   └─────────────────┘                └─────────────────┘
                                              │
                              ┌───────┬───────┼───────┬─────────────┐
                              ▼       ▼       ▼       ▼             ▼
                          GETUP    ROLL    JUMP   ATTACK     DROP→AIR
                          (1-31    (1-27   (1-12  (1-20 inv  (re-grab
                          /32)     /49)    /12)   23-25 act  allowed,
                                                  /54)        no cooldown)
```

---

## Self-validation

- [x] Knockback formula has worked example — TWO worked examples (0% and 80% damage on Marth fsmash @ Fox)
- [x] Shieldstun formula present — canonical `floor((200/201) * (d*(a+0.3)*1.5 + 2))` + practical hard-shield approximation `floor((d+4.45)*0.4725)` documented
- [x] Tech windows numerical — 20f input window, 40f lockout, tech-in-place 26f (1-20 intangible), tech-roll 40f (1-20 intangible)
- [x] L-cancel percent + window — 50% reduction, 7-frame pre-landing window, 6-frame post-hitlag extension
- [x] All sections cite sources — every section has Sources block with SmashWiki / Smashboards URLs
- [x] All gaps marked "[gap]" or "[unverified]" — yes (per-character constants in §3 example, missed-tech getup specifics in §9, "tired" ledge action specifics in §10, aerial-vs-aerial clank rule in §11, shield break stun duration in §6)

### Known gaps requiring per-character data files (out of scope)

- Per-character gravity, fall speed, fast-fall speed, weight, traction, jumpsquat frames
- Per-move BKB, KBG, base damage, hitlag-mod, hit angle
- Per-character ledge action exact frames (universal pattern documented, character-specific numbers vary)
- Wavedash distance per character (depends on traction, air-dodge angle, jump-squat)

### Known gaps requiring deeper sourcing

- Missed-tech getup-attack/roll exact universal frames — Smashboards Magus420 thread is the canonical source but blocks scrapers. Pull manually.
- "Tired" (>100%) ledge action exact frames per character — same source.
- Aerial-vs-aerial clank rule — SmashWiki priority page is general, not Melee-specific on aerial trades.
- Shield break stun duration — well known to be very long but not surfaced on the SmashWiki Shield page in the fetch.
