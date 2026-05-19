// Hitbox/hurtbox resolution + Melee knockback formula.
//
// Called once per logical tick from loop.ts. Walks all active hitboxes on
// attackers, tests AABB overlap against defender hurtboxes, applies the
// highest-priority hit, and computes knockback using the canonical Melee
// formula scaled to engine pixel-space.

import type { Hitbox } from "./moves";
import { hitboxAt, MOVES } from "./moves";
import type { Fighter, HitEvent } from "./state";

/**
 * Hurtbox in world space — for v1, a single AABB around the fighter body.
 * Origin is feet-center; body extends upward.
 */
export function hurtboxOf(f: Fighter): { x: number; y: number; w: number; h: number } {
  const w = 56;
  const h = 88;
  return { x: f.x - w / 2, y: f.y, w, h };
}

function aabbOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Melee knockback formula, ported.
 *
 * KB = ((((d+p)*1.4*0.05 + (d+p)*0.1) * (200/(weight+100)) * 1.4) + 18) * KBG/100 + BKB
 *
 * This is the actual formula competitive Smash uses to compute launch
 * speed from damage, target weight, and the move's KBG/BKB params. Using
 * the real formula (not a heuristic) means tipper-vs-body knockback ratios
 * feel correct without retuning — Cael's tipper kills at 60% because the
 * math is the same math Marth's tipper uses.
 *
 * Returns launch velocity in engine units (px/s) plus hitstun frames.
 */
export function computeKnockback(
  damageDealt: number,
  targetCurrentPct: number,
  targetWeight: number,
  bkb: number,
  kbg: number,
  angleDeg: number,
  attackerFacing: 1 | -1
): { vx: number; vy: number; hitstun: number; kbUnits: number } {
  // Canonical Melee KB formula (per SmashWiki):
  //   S = ((((p+d)*1.4*0.05) + ((p+d)*0.1) + d*0.476) * (200/(w+100)) * 1.4 + 18) * G/100 + B
  // where p = target % BEFORE the hit, d = damage dealt, w = target weight,
  // G = KBG, B = BKB. The d*0.476 term (≈ d/2.1) is the "fresh damage"
  // contribution that makes high-damage moves hit harder at low %.
  const pd = targetCurrentPct + damageDealt;
  const base =
    ((pd * 1.4 * 0.05 + pd * 0.1 + damageDealt * 0.476) *
      (200 / (targetWeight + 100)) *
      1.4 +
      18) *
      (kbg / 100) +
    bkb;

  // Convert "knockback units" to px/s. 6 is the tuning constant — 80 KB
  // becomes 480 px/s launch, which feels like a stock-taking blow when
  // off-stage. Tune from here if it feels off.
  const speed = base * 6;

  // Angle is measured CCW from +x. Attacker facing flips horizontal.
  const rad = (angleDeg * Math.PI) / 180;
  const vx = Math.cos(rad) * speed * attackerFacing;
  const vy = Math.sin(rad) * speed;

  // Hitstun (frames) — Melee uses KB * 0.4, clamped.
  const hitstun = Math.max(4, Math.min(60, Math.floor(base * 0.4)));

  return { vx, vy, hitstun, kbUnits: base };
}

/**
 * Resolve attacks for one tick.
 *
 * For each attacker with an active move + active hitbox(es) this frame,
 * check overlap against each defender's hurtbox. If overlap and the
 * defender hasn't yet been hit by this attack instance, apply the
 * highest-priority hitbox's effect.
 *
 * Returns a list of HitEvents emitted this tick (for VFX + replay logging).
 */
export function resolveHits(attackers: Fighter[], defenders: Fighter[]): HitEvent[] {
  const events: HitEvent[] = [];

  for (const atk of attackers) {
    if (!atk.activeMove || atk.attackFrame <= 0) continue;
    const move = MOVES[atk.activeMove];
    if (!move) continue;

    for (const def of defenders) {
      if (def === atk) continue;
      // Already hit by this attack instance? Skip.
      if (def.lastHitInstance === atk.attackInstanceId) continue;

      const hurt = hurtboxOf(def);

      // Find the highest-priority active hitbox that overlaps the hurtbox.
      let chosen: Hitbox | null = null;
      for (const hb of move.hitboxes) {
        const box = hitboxAt(hb, atk, atk.attackFrame);
        if (!box) continue;
        if (!aabbOverlap(box, hurt)) continue;
        if (!chosen || hb.priority > chosen.priority) chosen = hb;
      }

      if (!chosen) continue;

      // Apply hit.
      const kb = computeKnockback(
        chosen.damage,
        def.damage,
        def.profile.weight,
        chosen.bkb,
        chosen.kbg,
        chosen.angle,
        atk.facing
      );

      def.damage += chosen.damage;
      def.vx = kb.vx;
      def.vy = kb.vy;
      def.hitstun = kb.hitstun;
      def.grounded = false;
      def.lastHitInstance = atk.attackInstanceId;

      events.push({
        attackerMoveId: move.id,
        flavor: chosen.flavor,
        x: def.x,
        y: def.y + 40,
        damage: chosen.damage,
        kbUnits: kb.kbUnits,
      });
    }
  }

  return events;
}
