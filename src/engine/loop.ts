import { resolveHits } from "./combat";
import { CAMERA, STAGE1, TICK_DT } from "./constants";
import { readInput, type InputFrame } from "./input";
import { MOVES, selectAerial } from "./moves";
import { stepPhysics } from "./physics";
import {
  DUMMY,
  PLAYER,
  consumeHitEvents,
  nextAttackInstanceId,
  pushHitEvent,
  resetDummy,
  resetFighter,
  useHud,
  type Fighter,
  type HitEvent,
  type MotionState,
} from "./state";
import { recordFrame, snapshotFighter, getReplayLength } from "./replay";

// Fixed-timestep loop at 60Hz. See module header in v0 for rationale.

const MAX_STEPS_PER_FRAME = 5;
let accumulator = 0;
let lastNow = 0;
let tickCounter = 0;
let running = false;
let onTickRender: (() => void) | null = null;
let onHitEvents: ((events: HitEvent[]) => void) | null = null;

let frameTimes: number[] = [];

export function startLoop(renderHook: () => void, hitHook?: (e: HitEvent[]) => void) {
  if (running) return;
  running = true;
  lastNow = performance.now();
  onTickRender = renderHook;
  onHitEvents = hitHook ?? null;
  requestAnimationFrame(frame);
}

export function stopLoop() {
  running = false;
}

function frame(now: number) {
  if (!running) return;

  const dtMs = now - lastNow;
  lastNow = now;

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
  if (steps >= MAX_STEPS_PER_FRAME) accumulator = 0;

  onTickRender?.();

  // Drain hit-event queue to the render layer (VFX) once per animation frame.
  const events = consumeHitEvents();
  if (events.length > 0 && onHitEvents) onHitEvents(events);

  if (tickCounter % 6 === 0) {
    const last = events[events.length - 1];
    useHud.getState().setHud({
      playerName: PLAYER.archetype.name,
      playerMotion: PLAYER.motion,
      playerDamage: Math.round(PLAYER.damage),
      playerStocks: PLAYER.stocks,
      dummyDamage: Math.round(DUMMY.damage),
      fps: Math.round(fps),
      ticks: tickCounter,
      replayFrames: getReplayLength(),
      ...(last
        ? {
            lastHitFlavor: last.flavor,
            lastHitDamage: last.damage,
            lastHitKb: Math.round(last.kbUnits),
          }
        : {}),
    });
  }

  requestAnimationFrame(frame);
}

/**
 * One logical tick:
 *   1. Read input
 *   2. Tick attack state machine (and dispatch new attacks on input edge)
 *   3. Handle hitstun (skip movement input if stunned)
 *   4. Apply horizontal/vertical motion
 *   5. Step physics
 *   6. Resolve hits (attackers vs defenders)
 *   7. Recompute motion state
 *   8. Record replay frame
 */
function tick() {
  const input = readInput();
  const p = PLAYER;
  const d = DUMMY;

  // ------------------------------------------------------------------
  // Tick attack state machine first — frames advance regardless of input.
  // ------------------------------------------------------------------
  tickAttack(p);
  tickAttack(d);

  // ------------------------------------------------------------------
  // Handle hitstun BEFORE input. Hitstunned fighters cannot act.
  // ------------------------------------------------------------------
  if (p.hitstun > 0) {
    p.hitstun -= 1;
    // Still apply physics + drift, but ignore input for movement/attack.
    handleHitstunFighter(p, input.down);
  } else {
    // Facing follows horizontal input on the ground.
    if (p.grounded) {
      if (input.left) p.facing = -1;
      else if (input.right) p.facing = 1;
    }

    // ----------------------------------------------------------------
    // Attack input — only consumable when not already in an attack.
    //
    // v1 simplification: attacks fire from BOTH ground and air. That's
    // not Smash-faithful (real Smash separates grounded jabs/tilts from
    // aerials), but it makes the demo discoverable — you can stand still,
    // press K, and see the move. Refining into separate ground/air move
    // lists is a v2 concern.
    // ----------------------------------------------------------------
    if (input.attackPressed && !p.activeMove) {
      const moveId = selectAerial(input.down);
      startMove(p, moveId);
    }

    // Movement input is suppressed during an attack — no DI-style control
    // until v2. (Aerial drift continues via physics inertia.)
    if (!p.activeMove) {
      const wantDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      applyMovement(p, wantDir);
      handleJump(p, input.jumpPressed);
    } else {
      // While attacking in the air, allow small aerial drift toward input.
      const wantDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      if (!p.grounded && wantDir !== 0) {
        const target = wantDir * p.profile.airSpeed * 0.6;
        const accel = p.profile.airAccel * 0.5 * TICK_DT;
        if (Math.abs(target - p.vx) <= accel) p.vx = target;
        else p.vx += Math.sign(target - p.vx) * accel;
      }
    }
  }

  // Dummy hitstun ticks down too. No input — pure physics.
  if (d.hitstun > 0) {
    d.hitstun -= 1;
  }

  // ------------------------------------------------------------------
  // Physics step for both fighters.
  // ------------------------------------------------------------------
  const playerResult = stepPhysics(p, input.down && p.hitstun === 0);
  const dummyResult = stepPhysics(d, false);

  if (playerResult.ringOut) {
    p.stocks = Math.max(0, p.stocks - 1);
    resetFighter(p, STAGE1.spawn);
  }
  if (dummyResult.ringOut) {
    resetDummy({ x: 220, y: 0 });
  }

  // ------------------------------------------------------------------
  // Hit resolution — player can hit dummy, dummy can hit player
  // (currently dummy has no moves, so this is one-directional).
  // ------------------------------------------------------------------
  const events = resolveHits([p, d], [p, d]);
  for (const e of events) pushHitEvent(e);

  // ------------------------------------------------------------------
  // Motion state inference — only when not in an attack/hitstun.
  // ------------------------------------------------------------------
  inferMotionState(p);
  inferMotionState(d);

  p.motionFrames += 1;
  d.motionFrames += 1;

  // ------------------------------------------------------------------
  // Replay record — append (input bits + both fighter snapshots).
  // ------------------------------------------------------------------
  recordFrame({
    t: tickCounter,
    in: {
      L: input.left ? 1 : 0,
      R: input.right ? 1 : 0,
      U: input.up ? 1 : 0,
      D: input.down ? 1 : 0,
      J: input.jump ? 1 : 0,
      Jp: input.jumpPressed ? 1 : 0,
      A: input.attack ? 1 : 0,
      Ap: input.attackPressed ? 1 : 0,
    },
    p: snapshotFighter(p),
    d: snapshotFighter(d),
  });
}

function applyMovement(p: Fighter, wantDir: number) {
  const prof = p.profile;
  if (p.grounded) {
    if (wantDir !== 0) {
      p.vx = wantDir * prof.runSpeed;
    } else {
      const decel = prof.groundFriction * TICK_DT;
      if (Math.abs(p.vx) <= decel) p.vx = 0;
      else p.vx -= Math.sign(p.vx) * decel;
    }
  } else {
    const target = wantDir * prof.airSpeed;
    const accel = prof.airAccel * TICK_DT;
    if (Math.abs(target - p.vx) <= accel) p.vx = target;
    else p.vx += Math.sign(target - p.vx) * accel;
  }
}

function handleJump(p: Fighter, jumpPressed: boolean) {
  if (!jumpPressed) return;
  const prof = p.profile;
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

/**
 * Start a new move on this fighter. Sets activeMove, resets attackFrame
 * to 1 (frame 1 is the first frame of the move), assigns a fresh
 * attackInstanceId, and locks motion to "attackAir".
 *
 * Currently only used for aerial moves. Grounded moves are a v2 concern.
 */
function startMove(p: Fighter, moveId: ReturnType<typeof selectAerial>) {
  p.activeMove = moveId;
  p.attackFrame = 1;
  p.attackInstanceId = nextAttackInstanceId();
  setMotion(p, "attackAir");
}

/**
 * Advance the attack state machine by one frame. Ends the move when
 * total frames are reached, OR when an aerial move's owner touches the
 * ground (apply landingLag, end move).
 */
function tickAttack(p: Fighter) {
  if (!p.activeMove) return;
  const move = MOVES[p.activeMove];
  if (!move) {
    p.activeMove = null;
    p.attackFrame = 0;
    return;
  }
  p.attackFrame += 1;

  // Landing during an aerial move — end with landing-lag freeze.
  // (Landing-lag is currently just an immediate move-end; cancelling it
  // is the L-cancel hook for v2.)
  if (move.isAerial && p.grounded) {
    p.activeMove = null;
    p.attackFrame = 0;
    // Hijack motion to "landing" with frame counter spent in lag.
    setMotion(p, "landing");
    return;
  }

  if (p.attackFrame > move.totalFrames) {
    p.activeMove = null;
    p.attackFrame = 0;
  }
}

/**
 * Hitstunned fighter — apply gravity + slight air-friction. No input.
 * Below threshold velocity, drop to tumble (still no input). Returns to
 * normal control once hitstun hits 0 (handled in tick()).
 */
function handleHitstunFighter(p: Fighter, _fastFallHeld: boolean) {
  // Tiny air decel so launched fighters don't slide forever.
  const airFric = 60 * TICK_DT;
  if (Math.abs(p.vx) <= airFric) p.vx = 0;
  else p.vx -= Math.sign(p.vx) * airFric;
}

function inferMotionState(p: Fighter) {
  // Don't override attack/hitstun states.
  if (p.activeMove) {
    setMotion(p, "attackAir");
    return;
  }
  if (p.hitstun > 0) {
    setMotion(p, "hitstun");
    return;
  }
  if (p.grounded) {
    const wakingVx = Math.abs(p.vx);
    if (wakingVx > p.profile.walkSpeed * 0.6) setMotion(p, "run");
    else if (wakingVx > 0.1) setMotion(p, "walk");
    else setMotion(p, "idle");
  } else {
    if (p.vy > 0) setMotion(p, "rising");
    else setMotion(p, "falling");
  }
}

function setMotion(p: Fighter, next: MotionState) {
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
