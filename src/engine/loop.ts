import { CAMERA, STAGE1, TICK_DT } from "./constants";
import { readInput } from "./input";
import { stepPhysics } from "./physics";
import { PLAYER, resetPlayer, useHud, type MotionState } from "./state";

// Fixed-timestep loop with render-time accumulator.
// Logical updates run at exactly 60Hz, regardless of monitor refresh. This is
// non-negotiable for Melee-feel — frame data is integer frames at 60Hz.

const MAX_STEPS_PER_FRAME = 5; // cap if tab was backgrounded
let accumulator = 0;
let lastNow = 0;
let tickCounter = 0;
let running = false;
let onTickRender: (() => void) | null = null;

// Smoothed FPS for HUD.
let frameTimes: number[] = [];

export function startLoop(renderHook: () => void) {
  if (running) return;
  running = true;
  lastNow = performance.now();
  onTickRender = renderHook;
  requestAnimationFrame(frame);
}

export function stopLoop() {
  running = false;
}

function frame(now: number) {
  if (!running) return;

  const dtMs = now - lastNow;
  lastNow = now;

  // FPS smoothing
  frameTimes.push(dtMs);
  if (frameTimes.length > 30) frameTimes.shift();
  const avgMs = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const fps = avgMs > 0 ? 1000 / avgMs : 0;

  accumulator += dtMs / 1000;

  let steps = 0;
  while (accumulator >= TICK_DT && steps < MAX_STEPS_PER_FRAME) {
    tick();
    accumulator -= TICK_DT;
    steps++;
    tickCounter++;
  }
  // If we hit cap, drop excess time (tab was backgrounded).
  if (steps >= MAX_STEPS_PER_FRAME) accumulator = 0;

  // Render hook runs once per animation frame, after all logical ticks for this frame.
  onTickRender?.();

  // Update HUD a few times a second to avoid React thrash.
  if (tickCounter % 6 === 0) {
    useHud.getState().setHud({
      motion: PLAYER.motion,
      damage: Math.round(PLAYER.damage),
      stocks: PLAYER.stocks,
      fps: Math.round(fps),
      ticks: tickCounter,
    });
  }

  requestAnimationFrame(frame);
}

// One logical tick — read input, mutate state machine, step physics.
function tick() {
  const input = readInput();
  const p = PLAYER;
  const prof = p.profile;

  // Facing follows horizontal input on the ground.
  if (p.grounded) {
    if (input.left) p.facing = -1;
    else if (input.right) p.facing = 1;
  }

  // === Horizontal motion ===
  const wantDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (p.grounded) {
    // Ground motion — instant accel to target speed (Melee doesn't ramp).
    if (wantDir !== 0) {
      p.vx = wantDir * prof.runSpeed;
    } else {
      // Friction
      const decel = prof.groundFriction * TICK_DT;
      if (Math.abs(p.vx) <= decel) p.vx = 0;
      else p.vx -= Math.sign(p.vx) * decel;
    }
  } else {
    // Aerial drift — accel toward target, capped at airSpeed.
    const target = wantDir * prof.airSpeed;
    const accel = prof.airAccel * TICK_DT;
    if (Math.abs(target - p.vx) <= accel) p.vx = target;
    else p.vx += Math.sign(target - p.vx) * accel;
  }

  // === Jump ===
  // Simple model for v0 — full hop on press, double jump in air on second press.
  // Short-hop tap-window (release jump within jumpSquatFrames) is a Phase 2 add.
  if (input.jumpPressed) {
    if (p.grounded) {
      p.vy = prof.jumpVelocity;
      p.grounded = false;
      p.jumpsLeft = 1;
      setMotion(p, "rising");
    } else if (p.jumpsLeft > 0) {
      p.vy = prof.doubleJumpVelocity;
      p.jumpsLeft -= 1;
      setMotion(p, "rising");
    }
  }

  // === Step physics ===
  const { ringOut } = stepPhysics(p, input.down);

  if (ringOut) {
    p.stocks = Math.max(0, p.stocks - 1);
    resetPlayer(STAGE1.spawn);
  }

  // === State machine (motion only — combat states are Phase 2) ===
  if (p.grounded) {
    if (Math.abs(p.vx) > prof.walkSpeed * 0.6) setMotion(p, "run");
    else if (Math.abs(p.vx) > 0.1) setMotion(p, "walk");
    else setMotion(p, "idle");
  } else {
    if (p.vy > 0) setMotion(p, "rising");
    else if (input.down) setMotion(p, "fastFalling");
    else setMotion(p, "falling");
  }

  p.motionFrames += 1;
}

function setMotion(p: typeof PLAYER, next: MotionState) {
  if (p.motion === next) return;
  p.motion = next;
  p.motionFrames = 0;
}

// Camera target tracking — smooth follow toward the player.
export function tickCamera(camera: { x: number; y: number }) {
  const targetX = PLAYER.x;
  const targetY = PLAYER.y + CAMERA.verticalBias;
  camera.x += (targetX - camera.x) * CAMERA.followLerp;
  camera.y += (targetY - camera.y) * CAMERA.followLerp;
}
