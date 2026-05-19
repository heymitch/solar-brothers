// Replay recording — Phase 0 of the ML pipeline.
//
// Records (tick, p1_input, p1_state, dummy_state) every logical tick.
// Buffer is capped at 60s of recording (3600 frames) to bound memory.
//
// The schema is intentionally minimal and flat — this is the format the
// ML pipeline will eventually consume as supervised-learning input. Adding
// fields later requires schema versioning, so we version from day 0.
//
// Determinism property: because the engine is fixed-timestep at 60Hz and
// uses no real-time randomness in the logic tick, the (input) sequence
// alone is sufficient to reproduce the (state) sequence. We log both for
// debugging — if a future replay-player produces different states than
// what's recorded here, there's a determinism bug.

import type { Fighter } from "./state";

const REPLAY_VERSION = 1;
const MAX_FRAMES = 60 * 60; // 60 seconds at 60Hz

export interface InputBits {
  L: 0 | 1;
  R: 0 | 1;
  U: 0 | 1;
  D: 0 | 1;
  J: 0 | 1; // jump held
  Jp: 0 | 1; // jump pressed (edge)
  A: 0 | 1; // attack held
  Ap: 0 | 1; // attack pressed (edge)
}

export interface FighterSnapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  motion: string;
  facing: 1 | -1;
  damage: number;
  stocks: number;
  activeMove: string | null;
  attackFrame: number;
  hitstun: number;
}

export interface ReplayFrame {
  t: number;
  in: InputBits;
  p: FighterSnapshot;
  d: FighterSnapshot;
}

const buffer: ReplayFrame[] = [];
let recording = true;

export function isRecording() {
  return recording;
}

export function setRecording(on: boolean) {
  recording = on;
}

export function clearReplay() {
  buffer.length = 0;
}

export function recordFrame(frame: ReplayFrame) {
  if (!recording) return;
  buffer.push(frame);
  if (buffer.length > MAX_FRAMES) buffer.shift(); // drop oldest
}

export function snapshotFighter(f: Fighter): FighterSnapshot {
  return {
    x: f.x,
    y: f.y,
    vx: f.vx,
    vy: f.vy,
    motion: f.motion,
    facing: f.facing,
    damage: f.damage,
    stocks: f.stocks,
    activeMove: f.activeMove,
    attackFrame: f.attackFrame,
    hitstun: f.hitstun,
  };
}

export interface ReplayBlob {
  version: number;
  recordedAt: string;
  tickHz: 60;
  frameCount: number;
  characters: {
    player: { id: string };
    dummy: { id: string };
  };
  frames: ReplayFrame[];
}

export function downloadReplay(playerId: string, dummyId: string) {
  const blob: ReplayBlob = {
    version: REPLAY_VERSION,
    recordedAt: new Date().toISOString(),
    tickHz: 60,
    frameCount: buffer.length,
    characters: { player: { id: playerId }, dummy: { id: dummyId } },
    frames: buffer.slice(), // snapshot
  };
  const json = JSON.stringify(blob);
  const a = document.createElement("a");
  const file = new Blob([json], { type: "application/json" });
  a.href = URL.createObjectURL(file);
  a.download = `solar-bros-replay-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export function getReplayLength() {
  return buffer.length;
}
