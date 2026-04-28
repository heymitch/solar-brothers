# Solar Brothers Melee — Frame Data + Port References

Canonical research, ported from Super Smash Bros. Melee (NTSC v1.02). These files are the **source of truth** the engine implements against — every frame count, hitbox, knockback value should match the source character.

## Files

| File | Source | Solar Brothers fighter | Archetype |
|---|---|---|---|
| `melee-engine.md` | Universal Melee mechanics | — | Knockback / hitstun / shield / tech / ledge / state graphs |
| `bramm-from-falcon.md` | Captain Falcon | Bramm Roke | Heavy Rusher |
| `cael-from-marth.md` | Marth | Cael Solari | Balanced Swordsman (tipper) |
| `kite-from-fox.md` | Fox | Kite Vox | Speedy Skirmisher |
| `luma-from-jigglypuff.md` | Jigglypuff | Luma Mielle | Floaty Zoner |

## How to read these

Each character file is structured the same way:
1. Physics profile (weight, fall speed, gravity, run speed, etc.)
2. Jumps (jumpsquat, full hop, short hop, double jump, air jumps)
3. Wavedash (angle + distance)
4. Ground attacks (jab, dash attack, tilts, smashes)
5. Aerials (nair/fair/bair/uair/dair with L-cancel landing lag)
6. Specials (B / side B / up B / down B)
7. Throws
8. Defensive options
9. Notable techniques + tactics
10. Character renders + visual references (for the solarpunk reskin)
11. Sources
12. Self-validation checklist

`melee-engine.md` covers the universal math and techniques every character inherits — knockback formula with worked examples, shieldstun formula, tech windows, L-cancel rules, ledge mechanics, ASCII state graphs.

## Gaps + verification

Every doc tags unverified values with `[unverified]` or `[gap]`. Before porting any move into `engine/` code, cross-check the flagged values against:

- **Magus420 frame data spreadsheets** (canonical tournament reference, on SmashBoards)
- **20XX Hack Pack** docs
- **Project Slippi** documentation
- **MeleeFrameData.com** (if accessible)
- The actual game (frame-stepping in Dolphin emulator with debug overlay)

## Code-gen path (Phase 2)

These markdown files become TypeScript constants:

```
data/melee-engine.md          → src/engine/melee/{knockback,shield,tech}.ts
data/bramm-from-falcon.md     → src/engine/movesets/bramm.ts
data/cael-from-marth.md       → src/engine/movesets/cael.ts
data/kite-from-fox.md         → src/engine/movesets/kite.ts
data/luma-from-jigglypuff.md  → src/engine/movesets/luma.ts
```

The markdown stays canonical. Code is regenerated when frame data is verified or tuned.

## Implementation order (locked, source-of-truth §12)

1. **Bramm first** — tests speed + heavy strikes + hitstop + knockback
2. **Cael** — tests sword disjoints + tipper sweet/sour + Counter
3. **Kite** — tests projectile pressure + multi-hit + 1-frame shine
4. **Luma** — tests multi-jump + air mobility + Rest punish

Don't add a character until the previous one feels right.
