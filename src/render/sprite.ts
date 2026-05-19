// Procedural fighter sprites — no asset loading required.
//
// Each fighter is drawn as a layered Graphics: cape → legs → body → arms →
// head → weapon. Animation is parameter-driven by `motion`, `activeMove`,
// `attackFrame`, `hitstun`, `vy`, and a free-running `t` (seconds).
//
// Why procedural: zero asset pipeline, instant iteration, and the tipper
// pose is a parameter, not a sprite frame — when we tune Sundown's active
// window or hitbox shape, the silhouette updates with it.
//
// All coordinates are engine-space (positive Y = up). The world container
// already applies a Y-flip so the math reads naturally.

import { Graphics } from "pixi.js";
import type { Fighter } from "../engine/state";

// ---------------------------------------------------------------------------
// Pose — per-state animation parameters. Angles are in degrees.
//
// Convention (validated by drawLimb's math):
//   For LIMBS — angle is measured from "hanging straight down":
//     0   = limb DOWN
//     90  = limb FORWARD (in facing direction)
//     180 = limb UP overhead
//     -90 = limb BACK
//
//   For SWORD — angle measured from "blade pointing UP":
//     0   = blade UP
//     -90 = blade FORWARD (in facing direction)
//     +90 = blade BACK over shoulder
//     180 = blade DOWN (the Sundown plunge)
//
// Facing flips horizontal half of the rotation automatically.
// ---------------------------------------------------------------------------
interface Pose {
  bobY: number;
  bodyTilt: number; // body lean in degrees, signed toward facing
  legL: number; // hip angle, degrees
  legR: number;
  armL: number; // shoulder angle of the BACK arm (non-sword)
  armR: number; // shoulder angle of the SWORD arm
  sword: number; // sword rotation
  capeFlare: number; // 0..1 — how much the cape billows outward
  glow: number; // 0..1 — sword glow intensity (spikes on active frames)
}

const REST: Pose = {
  bobY: 0,
  bodyTilt: 0,
  legL: -4,
  legR: 4,
  armL: 10, // back arm slightly forward-down
  armR: 20, // sword arm dangles a bit forward
  sword: 30, // blade up-and-back over the shoulder (rest stance)
  capeFlare: 0.4,
  glow: 0.2,
};

function poseForFighter(f: Fighter, t: number): Pose {
  const out: Pose = { ...REST };
  const af = f.attackFrame;

  if (f.activeMove === "sundown_dair") {
    if (af <= 12) {
      // Startup — sword arcs UP-AND-OVER from shoulder rest to overhead-front.
      // Sword: 30 → 170 (CCW arc through behind-up-front). Arm rises.
      const u = Math.max(0, af - 1) / 12;
      out.sword = 30 + 140 * u;
      out.armR = 20 + 155 * u; // 20 → 175 (arm climbing overhead)
      out.armL = 10 + 40 * u;
      out.bobY = -1 * u;
      out.bodyTilt = -3 * u; // slight backward coil
      out.glow = 0.2 + 0.5 * u;
    } else if (af <= 17) {
      // Active — sword PLUNGES straight down. Body extends forward.
      out.sword = 185; // a hair past 180 so it reads as committed downswing
      out.armR = 140; // arm forward-and-up holding sword high
      out.armL = 70; // off arm out for balance
      out.bodyTilt = 10;
      out.bobY = -3;
      out.glow = 1.0;
    } else {
      // Recovery — return toward rest.
      const u = (af - 17) / 16;
      out.sword = 185 - 155 * u;
      out.armR = 140 - 120 * u;
      out.armL = 70 - 60 * u;
      out.bobY = -3 + 3 * u;
      out.bodyTilt = 10 - 10 * u;
      out.glow = 1.0 - u;
    }
  } else if (f.activeMove === "tempered_edge_fair") {
    if (af <= 7) {
      // Wind-up: sword rotates BACK (gathering), arm cocks back too.
      const u = Math.max(0, af - 1) / 7;
      out.sword = 30 + 30 * u; // 30 → 60 (further behind)
      out.armR = 20 - 20 * u; // 20 → 0 (arm cocking)
      out.bodyTilt = -3 * u;
      out.glow = 0.2 + 0.3 * u;
    } else if (af <= 10) {
      // Active — sword swings FORWARD, blade horizontal in front of body.
      out.sword = -90; // blade horizontal forward
      out.armR = 90; // arm horizontal forward
      out.bodyTilt = 6;
      out.glow = 1.0;
    } else {
      // Recovery — sword returns to rest.
      const u = (af - 10) / 21;
      out.sword = -90 + 120 * u; // -90 → 30
      out.armR = 90 - 70 * u; // 90 → 20
      out.bodyTilt = 6 - 6 * u;
      out.glow = 1.0 - 0.8 * u;
    }
  } else if (f.hitstun > 0) {
    // Limp. Alternate sway each ~4 frames so it reads as flailing.
    const sway = f.hitstun % 8 < 4 ? -1 : 1;
    out.bodyTilt = 18 * sway;
    out.bobY = 2;
    out.armL = 70;
    out.armR = 70;
    out.legL = 25;
    out.legR = -25;
    out.sword = 60;
    out.glow = 0.1;
  } else if (!f.grounded) {
    if (f.vy > 0) {
      // Rising — legs tucked up, slight forward lean.
      out.legL = 30;
      out.legR = -30;
      out.bodyTilt = 4;
      out.armR = -25;
      out.armL = 30;
      out.sword = -25;
    } else {
      // Falling.
      out.legL = -18;
      out.legR = 14;
      out.bodyTilt = -2;
      out.armR = 8;
      out.armL = 25;
    }
    out.capeFlare = 0.9; // cape catches air
  } else if (f.motion === "walk" || f.motion === "run") {
    const speedHz = f.motion === "run" ? 5.5 : 3.2;
    const swing = f.motion === "run" ? 32 : 20;
    const phase = (t + f.x * 0.002) * speedHz * Math.PI * 2;
    const s = Math.sin(phase);
    out.legL = s * swing;
    out.legR = -s * swing;
    out.armR = -10 - s * (swing * 0.6);
    out.armL = 15 + s * (swing * 0.6);
    out.bobY = Math.abs(Math.sin(phase * 2)) * 1.6;
    out.bodyTilt = f.motion === "run" ? 6 : 3;
    out.capeFlare = f.motion === "run" ? 0.7 : 0.5;
  } else {
    // Idle — gentle breathing.
    out.bobY = Math.sin(t * 2.2) * 1.1;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function rotPoint(x: number, y: number, deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

/**
 * Draw a tapered limb from a joint at (px, py), extending `len` pixels at
 * `angle` degrees (0 = down, positive = forward in facing).
 * Limbs taper so they have visual weight without being rectangles.
 */
function drawLimb(
  g: Graphics,
  px: number,
  py: number,
  len: number,
  angleDeg: number,
  wTop: number,
  wBot: number,
  facing: 1 | -1,
  color: number,
  outline: number
) {
  // Limb hangs DOWN at angle 0. Positive angle rotates the limb forward in
  // facing direction. We compute the bottom endpoint in world coords.
  const a = angleDeg * facing;
  const [dx, dy] = rotPoint(0, -len, a); // down is -y in engine coords
  const bx = px + dx;
  const by = py + dy;

  // Perpendicular for thickness.
  const perp = a + 90;
  const [pxw0, pyw0] = rotPoint(wTop / 2, 0, perp);
  const [pxw1, pyw1] = rotPoint(wBot / 2, 0, perp);

  g.poly([
    px - pxw0,
    py - pyw0,
    px + pxw0,
    py + pyw0,
    bx + pxw1,
    by + pyw1,
    bx - pxw1,
    by - pyw1,
  ]).fill(color);
  // Outline stroke for definition.
  g.poly([
    px - pxw0,
    py - pyw0,
    px + pxw0,
    py + pyw0,
    bx + pxw1,
    by + pyw1,
    bx - pxw1,
    by - pyw1,
  ]).stroke({ color: outline, width: 1.5, alpha: 0.65 });

  return { tipX: bx, tipY: by };
}

// ---------------------------------------------------------------------------
// CAEL — Hooded swordwarrior. Bronze + clay-orange. Solar-glow sword.
// ---------------------------------------------------------------------------
const CAEL_COLORS = {
  cape: 0xb85540, // sbm-clay
  capeTrim: 0xe97a1a, // sbm-solar
  body: 0x3d2818, // dark leather
  bodyAccent: 0xe8b547, // amber buckles
  pants: 0x2a1f15,
  skin: 0xc09660,
  hood: 0x1f2a1c, // sbm-ink (shadow under hood)
  swordBlade: 0xffe7a3,
  swordEdge: 0xe97a1a,
  swordGlow: 0xffd76b,
  outline: 0x130b07,
};

export function drawCael(g: Graphics, f: Fighter, t: number) {
  g.clear();
  const fx = f.facing;
  const cx = f.x;
  const cy = f.y; // engine y of fighter's feet — body extends UPWARD from here
  const C = CAEL_COLORS;
  const p = poseForFighter(f, t);

  // Body anchor points relative to feet — must all be offset by `cy` so the
  // sprite tracks the fighter's vertical position (jumping, falling, etc.).
  const hipY = cy + 38 + p.bobY;
  const shY = cy + 64 + p.bobY;
  const headY = cy + 80 + p.bobY;
  const tilt = p.bodyTilt * fx; // signed by facing

  // ---- CAPE (back layer) ----
  // Trapezoidal cape that flares wider when in motion. Cape origin is the
  // feet line (cy) — it hangs from shoulders down to just above the ground.
  const capeBase = 12 + p.capeFlare * 18;
  const capeY = cy + 6;
  g.poly([
    cx - 8 - tilt * 0.1,
    shY,
    cx + 8 - tilt * 0.1,
    shY,
    cx + capeBase,
    capeY,
    cx - capeBase,
    capeY,
  ]).fill(C.cape);
  // Cape trim
  g.poly([
    cx - capeBase,
    capeY,
    cx + capeBase,
    capeY,
    cx + capeBase - 2,
    capeY + 4,
    cx - capeBase + 2,
    capeY + 4,
  ]).fill(C.capeTrim);

  // ---- LEGS ----
  // Hips slightly forward in facing direction
  const hipL = { x: cx - 5, y: hipY };
  const hipR = { x: cx + 5, y: hipY };
  drawLimb(g, hipL.x, hipL.y, 36, p.legL, 9, 7, fx, C.pants, C.outline);
  drawLimb(g, hipR.x, hipR.y, 36, p.legR, 9, 7, fx, C.pants, C.outline);
  // Boots — small dark trapezoids at limb tip would be nice but skip for v1.

  // ---- BODY / TORSO ----
  // Slim leather body with a slight tilt.
  const [tlx, tly] = rotPoint(-9, 0, tilt);
  const [trx, try_] = rotPoint(9, 0, tilt);
  const [blx, bly] = rotPoint(-7, -(shY - hipY), tilt);
  const [brx, bry] = rotPoint(7, -(shY - hipY), tilt);
  g.poly([
    cx + tlx,
    shY + tly,
    cx + trx,
    shY + try_,
    cx + brx,
    shY + bry,
    cx + blx,
    shY + bly,
  ]).fill(C.body);
  g.poly([
    cx + tlx,
    shY + tly,
    cx + trx,
    shY + try_,
    cx + brx,
    shY + bry,
    cx + blx,
    shY + bly,
  ]).stroke({ color: C.outline, width: 1.5, alpha: 0.7 });

  // Amber sash diagonal across torso.
  g.poly([
    cx + tlx,
    shY + tly,
    cx + trx,
    shY + try_,
    cx + brx * 0.7,
    shY + bry * 0.8,
    cx + blx * 0.4,
    shY + bly * 0.5,
  ]).fill({ color: C.bodyAccent, alpha: 0.7 });

  // ---- ARMS ----
  // Left arm = behind. Right arm = sword arm in facing direction.
  // Shoulders are at (cx ± 9, shY)
  const shL = { x: cx + (fx > 0 ? -9 : 9), y: shY };
  const shR = { x: cx + (fx > 0 ? 9 : -9), y: shY };
  drawLimb(g, shL.x, shL.y, 28, p.armL, 7, 5, fx, C.body, C.outline);
  const armRTip = drawLimb(g, shR.x, shR.y, 28, p.armR, 7, 5, fx, C.body, C.outline);

  // ---- HEAD + HOOD ----
  // Head is a slightly forward-tilted oval at headY.
  const [hdx, hdy] = rotPoint(2 * fx, headY - shY, tilt);
  const hcx = cx + hdx;
  const hcy = shY + hdy;
  // Hood (large shadow behind face)
  g.circle(hcx - fx * 3, hcy + 1, 12).fill(C.hood);
  // Face — skin tone, smaller, offset forward.
  g.circle(hcx + fx * 2, hcy, 8).fill(C.skin);
  // Eye band (the dark shadow under hood that reads as eyes)
  g.rect(hcx + fx * 1 - 5, hcy + 2, 10, 3).fill(C.outline);
  // Tiny glint
  g.circle(hcx + fx * 3, hcy + 3, 1).fill(C.swordGlow);

  // ---- SWORD ----
  // Hand position = tip of right arm.
  const hand = { x: armRTip.tipX, y: armRTip.tipY };
  // Sword length
  const bladeLen = 58;
  const guardLen = 12;
  const handleLen = 10;

  // Sword angle interpretation: 0° = blade pointing UP, positive = blade
  // rotates toward facing direction. We flip the rotation by facing.
  const sa = p.sword * fx;

  // Compute blade endpoints.
  const [bdx, bdy] = rotPoint(0, bladeLen, sa);
  const tip = { x: hand.x + bdx, y: hand.y + bdy };
  // Handle goes the other way from the hand.
  const [hxd, hyd] = rotPoint(0, -handleLen, sa);
  const handleEnd = { x: hand.x + hxd, y: hand.y + hyd };
  // Guard perpendicular to blade
  const [g1x, g1y] = rotPoint(guardLen / 2, 0, sa);
  const guardA = { x: hand.x + g1x, y: hand.y + g1y };
  const guardB = { x: hand.x - g1x, y: hand.y - g1y };

  // Glow halo around blade (more glow when attacking — p.glow ∈ [0,1])
  if (p.glow > 0.3) {
    g.poly([
      guardA.x,
      guardA.y,
      guardB.x,
      guardB.y,
      tip.x - g1x * 0.2,
      tip.y - g1y * 0.2,
      tip.x + g1x * 0.2,
      tip.y + g1y * 0.2,
    ]).fill({ color: C.swordGlow, alpha: Math.min(0.7, p.glow * 0.7) });
    // Outer halo
    g.poly([
      hand.x + g1x * 1.5,
      hand.y + g1y * 1.5,
      hand.x - g1x * 1.5,
      hand.y - g1y * 1.5,
      tip.x - g1x * 0.5,
      tip.y - g1y * 0.5,
      tip.x + g1x * 0.5,
      tip.y + g1y * 0.5,
    ]).fill({ color: C.swordGlow, alpha: Math.min(0.4, p.glow * 0.4) });
  }
  // Blade
  g.poly([
    guardA.x,
    guardA.y,
    guardB.x,
    guardB.y,
    tip.x,
    tip.y,
  ]).fill(C.swordBlade);
  // Blade edge highlight
  g.poly([
    guardA.x,
    guardA.y,
    guardB.x,
    guardB.y,
    tip.x,
    tip.y,
  ]).stroke({ color: C.swordEdge, width: 1.5 });
  // Handle (a thin rect-ish)
  g.poly([
    guardA.x,
    guardA.y,
    guardB.x,
    guardB.y,
    handleEnd.x + (g1x * 0.7),
    handleEnd.y + (g1y * 0.7),
    handleEnd.x - (g1x * 0.7),
    handleEnd.y - (g1y * 0.7),
  ]).fill(C.bodyAccent);
}

// ---------------------------------------------------------------------------
// BRAMM — Heavy unarmed brawler. Wide, terracotta, bare-handed.
// ---------------------------------------------------------------------------
const BRAMM_COLORS = {
  body: 0xb85540, // sbm-clay
  bodyDark: 0x7a3527,
  gauntlets: 0x2a1f15,
  gauntletTrim: 0xe8b547,
  pants: 0x2a1f15,
  skin: 0xd9a06a,
  hair: 0x1f2a1c,
  outline: 0x130b07,
};

export function drawBramm(g: Graphics, f: Fighter, t: number) {
  g.clear();
  const fx = f.facing;
  const cx = f.x;
  const cy = f.y; // engine y of fighter's feet
  const C = BRAMM_COLORS;
  const p = poseForFighter(f, t);

  // All body Y positions offset by cy so sprite tracks fighter vertically.
  const hipY = cy + 38 + p.bobY;
  const shY = cy + 62 + p.bobY;
  const headY = cy + 80 + p.bobY;
  const tilt = p.bodyTilt * fx;

  // ---- LEGS (thicker than Cael) ----
  drawLimb(g, cx - 7, hipY, 34, p.legL, 13, 11, fx, C.pants, C.outline);
  drawLimb(g, cx + 7, hipY, 34, p.legR, 13, 11, fx, C.pants, C.outline);

  // ---- BODY — wider trapezoid, broad shoulders ----
  const [tlx, tly] = rotPoint(-15, 0, tilt);
  const [trx, try_] = rotPoint(15, 0, tilt);
  const [blx, bly] = rotPoint(-10, -(shY - hipY), tilt);
  const [brx, bry] = rotPoint(10, -(shY - hipY), tilt);
  g.poly([
    cx + tlx,
    shY + tly,
    cx + trx,
    shY + try_,
    cx + brx,
    shY + bry,
    cx + blx,
    shY + bly,
  ]).fill(C.body);
  g.poly([
    cx + tlx,
    shY + tly,
    cx + trx,
    shY + try_,
    cx + brx,
    shY + bry,
    cx + blx,
    shY + bly,
  ]).stroke({ color: C.outline, width: 1.5, alpha: 0.7 });
  // Chest shadow
  g.poly([
    cx + tlx * 0.6,
    shY + tly,
    cx + trx * 0.6,
    shY + try_,
    cx + 4,
    shY - 8,
    cx - 4,
    shY - 8,
  ]).fill({ color: C.bodyDark, alpha: 0.6 });

  // ---- ARMS (chunky) ----
  const shL = { x: cx + (fx > 0 ? -15 : 15), y: shY };
  const shR = { x: cx + (fx > 0 ? 15 : -15), y: shY };
  const armLTip = drawLimb(g, shL.x, shL.y, 30, p.armL, 11, 9, fx, C.body, C.outline);
  const armRTip = drawLimb(g, shR.x, shR.y, 30, p.armR, 11, 9, fx, C.body, C.outline);

  // Gauntlets (fists)
  for (const tip of [armLTip, armRTip]) {
    g.circle(tip.tipX, tip.tipY, 8).fill(C.gauntlets);
    g.circle(tip.tipX, tip.tipY, 8).stroke({ color: C.gauntletTrim, width: 1.5 });
    g.circle(tip.tipX, tip.tipY, 3).fill(C.gauntletTrim);
  }

  // ---- HEAD ----
  const [hdx, hdy] = rotPoint(2 * fx, headY - shY, tilt);
  const hcx = cx + hdx;
  const hcy = shY + hdy;
  // Hair (spiky)
  for (let i = -1; i <= 1; i++) {
    g.poly([
      hcx + i * 5,
      hcy + 8,
      hcx + i * 5 - 4,
      hcy + 14,
      hcx + i * 5 + 4,
      hcy + 14,
    ]).fill(C.hair);
  }
  // Head
  g.circle(hcx + fx * 1, hcy, 10).fill(C.skin);
  g.circle(hcx + fx * 1, hcy, 10).stroke({ color: C.outline, width: 1, alpha: 0.6 });
  // Eye
  g.circle(hcx + fx * 4, hcy + 1, 1.6).fill(C.outline);
  // Frown line
  g.rect(hcx + fx * 1 - 3, hcy - 3, 6, 1).fill(C.outline);
}
