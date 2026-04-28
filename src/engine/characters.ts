import { FIGHTER_DEFAULTS } from "./constants";

export type ArchetypeId = "bramm" | "cael" | "kite" | "luma";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  title: string;
  // Visual
  color: number; // pixi hex (no alpha)
  // Physics overrides — undefined = use FIGHTER_DEFAULTS
  walkSpeed?: number;
  runSpeed?: number;
  airSpeed?: number;
  jumpVelocity?: number;
  doubleJumpVelocity?: number;
  jumpSquatFrames?: number;
  weight?: number;
}

// Bramm Roke — Heavy Rusher (Captain Falcon archetype).
// High weight = hard to launch. Heavy ground speed, slower jumpsquat,
// huge knockback dealt. Implementation lead per source-of-truth §12.
export const BRAMM: Archetype = {
  id: "bramm",
  name: "Bramm Roke",
  title: "The Skybreaker",
  color: 0xc8542e, // ember orange-red
  walkSpeed: 140,
  runSpeed: 360, // fast, but recovers slow
  airSpeed: 220,
  jumpVelocity: 760,
  doubleJumpVelocity: 600,
  jumpSquatFrames: 6, // heavy = longer jumpsquat
  weight: 110,
};

// Stubbed — populate in subsequent phases per implementation order.
export const CAEL: Archetype = {
  id: "cael",
  name: "Cael Solari",
  title: "The Skyburner Prince",
  color: 0xf6c66b, // amber
};

export const KITE: Archetype = {
  id: "kite",
  name: "Kite Vox",
  title: "The Windrunner",
  color: 0x6fb1d9, // sky
};

export const LUMA: Archetype = {
  id: "luma",
  name: "Luma Mielle",
  title: "The Sunsong",
  color: 0xfde88a, // pale gold
};

export const ROSTER: Record<ArchetypeId, Archetype> = {
  bramm: BRAMM,
  cael: CAEL,
  kite: KITE,
  luma: LUMA,
};

// Resolve archetype + defaults into a flat physics profile for the engine.
export function resolveProfile(a: Archetype) {
  return {
    walkSpeed: a.walkSpeed ?? FIGHTER_DEFAULTS.walkSpeed,
    runSpeed: a.runSpeed ?? FIGHTER_DEFAULTS.runSpeed,
    airSpeed: a.airSpeed ?? FIGHTER_DEFAULTS.airSpeed,
    airAccel: FIGHTER_DEFAULTS.airAccel,
    groundFriction: FIGHTER_DEFAULTS.groundFriction,
    jumpVelocity: a.jumpVelocity ?? FIGHTER_DEFAULTS.jumpVelocity,
    doubleJumpVelocity: a.doubleJumpVelocity ?? FIGHTER_DEFAULTS.doubleJumpVelocity,
    shortHopMul: FIGHTER_DEFAULTS.shortHopMul,
    jumpSquatFrames: a.jumpSquatFrames ?? FIGHTER_DEFAULTS.jumpSquatFrames,
    weight: a.weight ?? FIGHTER_DEFAULTS.weight,
  };
}

export type FighterProfile = ReturnType<typeof resolveProfile>;
