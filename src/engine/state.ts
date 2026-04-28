import { create } from "zustand";
import { BRAMM, resolveProfile, type Archetype, type FighterProfile } from "./characters";

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
  | "landing";

// Mutable engine values — read by the renderer every frame, mutated by the update loop.
// Lives outside zustand for hot-path performance (no React reactivity needed for these).
export interface FighterRuntime {
  archetype: Archetype;
  profile: FighterProfile;

  x: number;
  y: number; // engine-space: positive = up. Renderer flips for Pixi.
  vx: number;
  vy: number;

  facing: 1 | -1;
  motion: MotionState;
  motionFrames: number; // frames spent in current motion state

  grounded: boolean;
  jumpsLeft: number;

  // Damage % — Melee-style, for next-phase combat. Visible in HUD now (always 0).
  damage: number;
  stocks: number;
}

export const PLAYER: FighterRuntime = {
  archetype: BRAMM,
  profile: resolveProfile(BRAMM),
  x: 0,
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
};

// HUD state — what React subscribes to. Updated from the loop every render frame.
// We keep this minimal so we don't trigger re-renders for things React doesn't show.
interface HudState {
  motion: MotionState;
  damage: number;
  stocks: number;
  fps: number;
  ticks: number;
  paused: boolean;
  setHud: (patch: Partial<HudState>) => void;
}

export const useHud = create<HudState>((set) => ({
  motion: "falling",
  damage: 0,
  stocks: 4,
  fps: 0,
  ticks: 0,
  paused: false,
  setHud: (patch) => set(patch),
}));

export function resetPlayer(spawn: { x: number; y: number }) {
  PLAYER.x = spawn.x;
  PLAYER.y = spawn.y;
  PLAYER.vx = 0;
  PLAYER.vy = 0;
  PLAYER.motion = "falling";
  PLAYER.motionFrames = 0;
  PLAYER.grounded = false;
  PLAYER.jumpsLeft = 2;
  PLAYER.facing = 1;
}
