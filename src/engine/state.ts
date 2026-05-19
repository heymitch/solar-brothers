import { create } from "zustand";
import { BRAMM, CAEL, resolveProfile, type Archetype, type FighterProfile } from "./characters";
import type { HitFlavor, MoveId } from "./moves";

// Engine motion states — the state machine the update loop traverses each tick.
export type MotionState =
  | "idle"
  | "walk"
  | "initialDash"
  | "run"
  | "runStop"
  | "jumpSquat"
  | "rising"
  | "falling"
  | "fastFalling"
  | "landing"
  // Combat states (v1 — Cael's two moves)
  | "attackAir"
  | "hitstun"
  | "tumble";

/**
 * Mutable engine values — read by the renderer every frame, mutated by
 * the update loop. Lives outside zustand for hot-path performance.
 *
 * `activeMove`/`attackFrame` form the per-fighter attack state machine.
 * `attackInstanceId` is a monotonic counter — every new attack gets a
 * fresh ID so the defender can remember "I was hit by THIS attack" and
 * prevent multi-hits when a hitbox is active for multiple frames.
 *
 * `hitstun` counts down each tick. While > 0, the fighter cannot act
 * (no input processing, no movement choice — only physics).
 */
export interface Fighter {
  archetype: Archetype;
  profile: FighterProfile;

  x: number;
  y: number;
  vx: number;
  vy: number;

  facing: 1 | -1;
  motion: MotionState;
  motionFrames: number;

  grounded: boolean;
  jumpsLeft: number;

  damage: number;
  stocks: number;

  // Combat state
  activeMove: MoveId | null;
  attackFrame: number; // 1-indexed once a move starts; 0 when idle
  attackInstanceId: number; // monotonic — unique per attack invocation
  hitstun: number; // frames remaining — when > 0, input is ignored
  lastHitInstance: number; // attackInstanceId of the attack that last hit me
}

// Backwards-compat alias for the previous code.
export type FighterRuntime = Fighter;

// Player — controlled by input.
export const PLAYER: Fighter = {
  archetype: CAEL,
  profile: resolveProfile(CAEL),
  x: -180,
  y: 200,
  vx: 0,
  vy: 0,
  facing: 1,
  motion: "falling",
  motionFrames: 0,
  grounded: false,
  jumpsLeft: 2,
  damage: 0,
  stocks: 4,
  activeMove: null,
  attackFrame: 0,
  attackInstanceId: 0,
  hitstun: 0,
  lastHitInstance: -1,
};

// Dummy — stationary target. Uses Bramm's stat profile (heavyweight tank)
// so launches feel weighty without being trivial. Doesn't read input.
export const DUMMY: Fighter = {
  archetype: BRAMM,
  profile: resolveProfile(BRAMM),
  x: 220,
  y: 0,
  vx: 0,
  vy: 0,
  facing: -1, // faces the player
  motion: "idle",
  motionFrames: 0,
  grounded: true,
  jumpsLeft: 2,
  damage: 0,
  stocks: 99, // effectively infinite — dummies don't lose stocks
  activeMove: null,
  attackFrame: 0,
  attackInstanceId: 0,
  hitstun: 0,
  lastHitInstance: -1,
};

/**
 * A hit registered this tick — used to spawn VFX and append to the replay
 * log. The render layer subscribes to a queue of these via `consumeHitEvents`.
 */
export interface HitEvent {
  attackerMoveId: MoveId;
  flavor: HitFlavor;
  x: number; // world-space hit position (for VFX)
  y: number;
  damage: number;
  kbUnits: number;
}

// Hit event queue — produced by combat resolver, drained by the renderer.
const hitEventQueue: HitEvent[] = [];

export function pushHitEvent(e: HitEvent) {
  hitEventQueue.push(e);
}

export function consumeHitEvents(): HitEvent[] {
  if (hitEventQueue.length === 0) return [];
  const out = hitEventQueue.slice();
  hitEventQueue.length = 0;
  return out;
}

// HUD state — what React subscribes to. Two-fighter version.
interface HudState {
  playerName: string;
  playerMotion: MotionState;
  playerDamage: number;
  playerStocks: number;
  dummyDamage: number;
  fps: number;
  ticks: number;
  replayFrames: number;
  lastHitFlavor: HitFlavor | null;
  lastHitDamage: number;
  lastHitKb: number;
  setHud: (patch: Partial<HudState>) => void;
}

export const useHud = create<HudState>((set) => ({
  playerName: PLAYER.archetype.name,
  playerMotion: "falling",
  playerDamage: 0,
  playerStocks: 4,
  dummyDamage: 0,
  fps: 0,
  ticks: 0,
  replayFrames: 0,
  lastHitFlavor: null,
  lastHitDamage: 0,
  lastHitKb: 0,
  setHud: (patch) => set(patch),
}));

export function resetFighter(f: Fighter, spawn: { x: number; y: number }) {
  f.x = spawn.x;
  f.y = spawn.y;
  f.vx = 0;
  f.vy = 0;
  f.motion = "falling";
  f.motionFrames = 0;
  f.grounded = false;
  f.jumpsLeft = 2;
  f.activeMove = null;
  f.attackFrame = 0;
  f.hitstun = 0;
  f.lastHitInstance = -1;
}

// Reset dummy fully — including damage, since dummies don't lose stocks
// the way players do. Used when the dummy gets KO'd off-stage.
export function resetDummy(spawn: { x: number; y: number }) {
  DUMMY.x = spawn.x;
  DUMMY.y = spawn.y;
  DUMMY.vx = 0;
  DUMMY.vy = 0;
  DUMMY.facing = -1;
  DUMMY.motion = "idle";
  DUMMY.motionFrames = 0;
  DUMMY.grounded = true;
  DUMMY.damage = 0;
  DUMMY.activeMove = null;
  DUMMY.attackFrame = 0;
  DUMMY.hitstun = 0;
  DUMMY.lastHitInstance = -1;
}

// Legacy alias to keep existing call sites compiling.
export function resetPlayer(spawn: { x: number; y: number }) {
  resetFighter(PLAYER, spawn);
}

// Monotonic attack-instance counter. Every new attack increments this so
// the defender can remember which attack already hit it.
let _attackInstanceCounter = 0;
export function nextAttackInstanceId(): number {
  _attackInstanceCounter += 1;
  return _attackInstanceCounter;
}
