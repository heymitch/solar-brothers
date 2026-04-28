# Solar Brothers Melee — Prototype

**A platform fighting adventure that feels like 2001.**

Wavedash. L-cancel. Dash dance. By design.

Two modes, one engine:

- **Versus** — *Skill scales. You don't.* Stocks, ring-outs, wall and floor KOs. No skill trees. Where the floor and the wall can KO you.
- **Adventure** — Build your fighter in Adventure. Drop the build in Versus. (Adventure progression does NOT carry into Versus — that's the firewall.)

> Four fighters. One platform. No mercy.

**Live demo:** https://solar-brothers-prototype.vercel.app
**Brand canon:** `../design-system/project/README.md`

## What's playable today (v0.1)

- **Bramm Roke**, the Skybreaker — heavy-rusher archetype
- One platform stage (Glasswheat Plain placeholder)
- Run, full hop, double jump, fast-fall, ring-out, stocks
- Frame-locked 60Hz logical update with render-time interpolation cap
- Damage % HUD (always 0 until Phase 2 hitboxes land)

## What's *not* yet

- Attacks, hitboxes, hitstun, knockback
- Cael, Kite, Luma
- Multiple stages, NPCs, adventure-mode level scripting
- Sprite art (placeholder rectangles for now)

## Stack

- Vite + React (HUD only) + TypeScript
- Pixi.js v8 for 2D rendering
- Zustand for HUD state; plain mutable objects for hot-path engine state
- No physics library — Melee feel is custom math, not physically realistic

## Run it

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Structure

```
src/
  engine/        # dimension-agnostic game logic (60Hz, deterministic)
    constants.ts   # frame data, gravity, stage geometry
    characters.ts  # archetype definitions (Bramm + stubs)
    state.ts       # mutable runtime + zustand HUD store
    input.ts       # keyboard polling with edge detection
    physics.ts     # gravity, ground collision, ring-out
    loop.ts        # fixed-timestep update loop
  render/        # everything visual lives here, only consumes engine state
    pixi.ts        # Pixi app + camera + drawing
  App.tsx        # mounts Pixi + HUD overlay
```

The engine never imports from `render/`. Tests + future agent fights can drive
the engine headless.

## Controls

| Key | Action |
|---|---|
| `A` / `D` (or arrows) | Move |
| `Space` | Jump (double-jump in air) |
| `S` (or down) | Fast-fall |
| `F` | Light attack (Phase 2) |
| `R` | Special (Phase 2) |
| `L` / `Shift` | Shield (Phase 2) |

## Roadmap

1. **Phase 1 (now)**: bare metal — Bramm runs and jumps, ring-out works, deploys to Vercel
2. **Phase 2**: hitboxes + attack frame data + Cael as second fighter (1v1 training mode)
3. **Phase 3**: Kite, Luma; basic NPC AI
4. **Phase 4**: adventure-mode scene system, multi-stage levels, set pieces
5. **Phase 5**: sprite art replaces rectangles

Per source-of-truth §12 implementation order: **Bramm → Cael → Kite → Luma**, locked.

## Archived 3D prototype

Lives at `../prototype-3d-archive/` (own git repo, branch `archive-3d` on the GitHub remote).
Use it as engine reference for frame numbers + state machine ideas, not as a base to refactor.
