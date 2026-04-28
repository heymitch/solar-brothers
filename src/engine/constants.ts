// Fixed timestep — Melee runs at 60Hz, frame data is integer frames.
export const TICK_HZ = 60;
export const TICK_DT = 1 / TICK_HZ;

// World scale — 1 world unit = 1 pixel at default camera zoom.
// Fighter is ~80px tall, jump apex ~1.5 char heights, run speed ~4 char heights/sec.
export const WORLD = {
  gravity: 2400, // px/s²
  fastFallMul: 1.6, // gravity multiplier when down held in air
  groundY: 0, // floor of stage1 (anything below is ring-out)
  ringOutMargin: 600, // y below groundY before despawn
} as const;

// Default fighter physics (overridden per archetype).
// Run/walk speeds, jump velocities, frame counts. Numbers carried forward from
// the 3D archive's tuning (scaled to pixel space). Tune from here, don't guess.
export const FIGHTER_DEFAULTS = {
  walkSpeed: 120, // px/s ground move (light input)
  runSpeed: 320, // px/s ground move (full input)
  airSpeed: 240, // px/s lateral aerial move
  airAccel: 1800, // px/s² aerial drift
  groundFriction: 1600, // px/s² ground decel when no input
  jumpVelocity: 720, // px/s — short hop = 0.5x, full = 1.0x
  doubleJumpVelocity: 640, // px/s
  shortHopMul: 0.55,

  // Frame counts (at 60Hz — these are Melee-canon for Marth-class)
  jumpSquatFrames: 4, // input → liftoff window; release in this window = short hop
  initialDashFrames: 14, // Marth's initial-dash window before transitioning to run
  dashDanceWindowFrames: 18, // 300ms — direction reversal that re-enters initial dash
  landingLagFrames: 4, // generic land lag (per-attack values override)

  // Combat (placeholder, used in next phase)
  weight: 90, // knockback resistance — heavier = harder to launch
} as const;

// Camera — follows fighter, with vertical bias so platform sits in lower 2/3.
export const CAMERA = {
  followLerp: 0.12, // 0..1 lerp factor per render frame
  verticalBias: -120, // camera Y target = fighter.y + this (negative = camera looks up)
  zoom: 1.0,
} as const;

// Stage1 — "Glasswheat Plain" placeholder (one solid platform, ring-out off the edges).
export const STAGE1 = {
  name: "Glasswheat Plain",
  // Platform AABB in world coords. Fighter's feet sit on top.
  platform: {
    x: -480,
    y: 0, // top of platform (fighter ground line)
    w: 960,
    h: 80,
  },
  // Spawn point
  spawn: { x: 0, y: 200 },
} as const;
