import { STAGE1, TICK_DT, WORLD } from "./constants";
import { type FighterRuntime } from "./state";

// One physics step (1/60s of motion). Mutates the fighter in place.
// Returns whether the fighter ring-outed below the stage this tick.
export function stepPhysics(f: FighterRuntime, fastFallHeld: boolean): { ringOut: boolean } {
  // Gravity (with fast-fall multiplier when down held in air)
  if (!f.grounded) {
    const g = WORLD.gravity * (fastFallHeld && f.vy < 0 ? WORLD.fastFallMul : 1);
    f.vy -= g * TICK_DT;
  }

  // Apply velocity
  f.x += f.vx * TICK_DT;
  f.y += f.vy * TICK_DT;

  // Collide with stage1 platform top.
  // Engine y is up. Platform top is at STAGE1.platform.y. Fighter origin is at feet.
  const p = STAGE1.platform;
  const overPlatformX = f.x >= p.x && f.x <= p.x + p.w;
  const wasAbove = f.y >= p.y;
  const wouldClip = f.y < p.y;

  if (overPlatformX && wasAbove === false && f.vy <= 0) {
    // Coming from below or already inside — leave alone, this means we ring-outed
    // off the side and fell back under. Don't snap to platform.
  }

  if (overPlatformX && f.y <= p.y && f.vy <= 0) {
    f.y = p.y;
    f.vy = 0;
    if (!f.grounded) {
      f.grounded = true;
      f.jumpsLeft = 2;
    }
  } else {
    f.grounded = false;
  }

  // Ring-out: dropped well below platform, or way off to the side.
  const ringOut = f.y < p.y - WORLD.ringOutMargin;

  return { ringOut };
}
