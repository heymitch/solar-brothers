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

// Brand palette tokens (mirrors design-system/project/README.md, locked 2026-04-28).
// These hex values must stay in sync with the brand canvas+moss+solar trinity.

// Bramm Roke — Heavy Rusher (Captain Falcon source).
// High weight = hard to launch. Heavy ground speed, slower jumpsquat,
// huge knockback dealt. Numbers placeholder — Phase 2 ports Falcon frame data.
export const BRAMM: Archetype = {
  id: "bramm",
  name: "Bramm Roke",
  title: "The Skybreaker",
  color: 0xb85540, // sbm-clay (terracotta — heavy, kinetic, danger)
  walkSpeed: 140,
  runSpeed: 360,
  airSpeed: 220,
  jumpVelocity: 760,
  doubleJumpVelocity: 600,
  jumpSquatFrames: 6,
  weight: 110,
};

// Stubbed — populate in subsequent phases per implementation order.
export const CAEL: Archetype = {
  id: "cael",
  name: "Cael Solari",
  title: "The Skyburner Prince",
  color: 0xe97a1a, // sbm-solar (the sword-glow / hero accent)
};

export const KITE: Archetype = {
  id: "kite",
  name: "Kite Vox",
  title: "The Windrunner",
  color: 0x7cb6c4, // sbm-sky
};

export const LUMA: Archetype = {
  id: "luma",
  name: "Luma Mielle",
  title: "The Sunsong",
  color: 0xe8b547, // sbm-amber
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
