// Move definitions — per-character attacks expressed as data.
//
// Each move is a sequence of frames. Within those frames, zero or more
// hitboxes are *active*. Active hitboxes attempt to overlap with the
// defender's hurtbox each tick.
//
// The DEFINING DESIGN PATTERN for Cael:
//   Most moves have ONE hitbox. Sundown has TWO: a body hitbox covering
//   most of the active window with weak knockback, and a tipper hitbox
//   covering a smaller frame window at the SWORD TIP only with crushing
//   knockback. When both overlap, the tipper wins via `priority`.
//
//   This is what "Marth tipper" means as a mechanic. Positioning inside
//   the hitbox matters. Hit/miss is binary; hit-quality is analog.

import type { Fighter } from "./state";

export type MoveId = "sundown_dair" | "tempered_edge_fair";

export type HitFlavor = "body" | "tipper";

/**
 * A single hitbox active during a frame window of a move.
 * Position is offset from the fighter's feet-center origin in engine space
 * (positive y = up, positive x = facing direction).
 */
export interface Hitbox {
  startFrame: number; // inclusive — frame within the move when this becomes active
  endFrame: number; // inclusive
  ox: number; // offset x from fighter origin, in facing-relative coords
  oy: number; // offset y from fighter origin (positive = above feet)
  w: number; // width
  h: number; // height
  damage: number; // % to add to target
  bkb: number; // base knockback (Melee units)
  kbg: number; // knockback growth (Melee units, 0-200ish typical)
  angle: number; // degrees, 0 = horizontal right, 90 = straight up, 270 = straight down (spike)
  priority: number; // higher wins overlap arbitration (tipper > body)
  flavor: HitFlavor; // VFX/feedback tag
}

/**
 * A complete attack definition.
 *
 * `totalFrames` = startup + active + recovery. Once attackFrame reaches this,
 * the move ends and the fighter returns to neutral.
 *
 * `landingLagFrames` = if the move ends because the fighter touched ground
 * mid-move, this many frames of recovery instead. (Melee-style L-canceling
 * cuts this in half — not implemented in v1, but the hook is here.)
 */
export interface Move {
  id: MoveId;
  name: string;
  role: string; // PMBR-style "move job" — kept as design intent, not used by engine
  isAerial: boolean;
  totalFrames: number;
  landingLagFrames: number;
  hitboxes: Hitbox[];
}

// ---------------------------------------------------------------------------
// Cael — Sundown (down-air tipper)
// ---------------------------------------------------------------------------
//
// THE move. Win condition. Whole identity in one attack.
//
// Frames 1-12  : startup (sword raises overhead, comes down)
// Frames 13-17 : ACTIVE — body hitbox the whole time, tipper window 14-15
// Frames 18-32 : recovery (sword settles back, vulnerable)
// Landing lag  : 18 frames (heavy — punishes whiffing onto stage)
//
// Body hit  : 6%, low KB, light upward angle — does NOT spike, no kill.
// Tipper hit: 18%, high KB, 270° angle (straight DOWN) — spikes hard, kills
//             at 60% off-stage. Two-frame window. Tipper hitbox sits 50px
//             BELOW the body hitbox (i.e. at the sword tip).
export const SUNDOWN: Move = {
  id: "sundown_dair",
  name: "Sundown",
  role: "Hard-read spike. Win condition. Tipper distinguishes Cael.",
  isAerial: true,
  totalFrames: 33,
  landingLagFrames: 18,
  hitboxes: [
    // Body — sword body. Wide, weak, active most of the active window.
    {
      startFrame: 13,
      endFrame: 17,
      ox: 18,
      oy: 24,
      w: 60,
      h: 52,
      damage: 6,
      bkb: 30,
      kbg: 50,
      angle: 80, // weak upward — keeps the opponent close but doesn't kill
      priority: 1,
      flavor: "body",
    },
    // Tipper — sword TIP. Smaller, deeper below, two-frame window.
    // Spike angle (270°) + high KBG = the kill move.
    {
      startFrame: 14,
      endFrame: 15,
      ox: 32,
      oy: -8, // below feet line — sword tip extends past the body
      w: 28,
      h: 28,
      damage: 18,
      bkb: 30,
      kbg: 95,
      angle: 270, // straight DOWN — spike
      priority: 10,
      flavor: "tipper",
    },
  ],
};

// ---------------------------------------------------------------------------
// Cael — Tempered Edge (forward air)
// ---------------------------------------------------------------------------
//
// Marth-fair-shaped disjoint spacing tool. The move Cael uses to CONDITION
// opponents into Sundown range. Faster than Sundown but lower payoff.
//
// Frames 1-7   : startup
// Frames 8-10  : ACTIVE — body whole window, tipper on frame 9 only
// Frames 11-30 : recovery
// Landing lag  : 10 frames
//
// Body hit  : 9%, mid KB, 45° angle — sends opponent up-and-out at mid %.
// Tipper hit: 13%, high KB, 45° — kill move at high % off the side blast.
export const TEMPERED_EDGE: Move = {
  id: "tempered_edge_fair",
  name: "Tempered Edge",
  role: "Disjoint air spacing. Conditions opponent into Sundown range.",
  isAerial: true,
  totalFrames: 31,
  landingLagFrames: 10,
  hitboxes: [
    {
      // Body — large sword-arc covering most of opponent height so the
      // fair lands reliably on grounded targets when used as a falling
      // aerial (the standard Marth-style "short-hop fair" approach).
      startFrame: 8,
      endFrame: 10,
      ox: 52,
      oy: 38,
      w: 64,
      h: 76,
      damage: 9,
      bkb: 25,
      kbg: 70,
      angle: 45,
      priority: 1,
      flavor: "body",
    },
    {
      // Tipper — sword-tip only. Smaller, deeper out, single-frame.
      startFrame: 9,
      endFrame: 9,
      ox: 88,
      oy: 50,
      w: 26,
      h: 36,
      damage: 13,
      bkb: 25,
      kbg: 100,
      angle: 45,
      priority: 10,
      flavor: "tipper",
    },
  ],
};

export const MOVES: Record<MoveId, Move> = {
  sundown_dair: SUNDOWN,
  tempered_edge_fair: TEMPERED_EDGE,
};

/**
 * Pick the appropriate aerial for Cael based on input direction.
 * Down held → Sundown. Otherwise → Tempered Edge (the neutral default).
 *
 * This matches Smash's stick-direction → aerial mapping but collapsed to
 * what Cael actually has access to in v1.
 */
export function selectAerial(downHeld: boolean): MoveId {
  return downHeld ? "sundown_dair" : "tempered_edge_fair";
}

/**
 * Get the world-space AABB of a hitbox at this frame, given the fighter
 * that owns the move. Returns null if the hitbox is not currently active.
 *
 * Facing direction flips the x-offset so moves work in both directions.
 */
export function hitboxAt(
  hb: Hitbox,
  fighter: Fighter,
  attackFrame: number
): { x: number; y: number; w: number; h: number } | null {
  // attackFrame is 1-indexed (frame 1 is first frame after move start).
  if (attackFrame < hb.startFrame || attackFrame > hb.endFrame) return null;

  // Facing-relative offset: facing -1 mirrors the ox.
  const wx = fighter.x + hb.ox * fighter.facing - hb.w / 2;
  const wy = fighter.y + hb.oy - hb.h / 2;
  return { x: wx, y: wy, w: hb.w, h: hb.h };
}
