// Polling-based input. Each tick reads the current state of buttons —
// no event accumulation, no React state. Engine never blocks on input.
// We track "pressed this tick" via edge detection between current and prior frame.
//
// Edge-triggered global commands (replay download, dummy reset, debug
// hitbox toggle) are wired here as side-effects of their own keys so that
// they don't pollute the per-tick InputFrame consumed by the engine.

import { downloadReplay, clearReplay } from "./replay";
import { DUMMY, PLAYER, resetDummy } from "./state";

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  special: boolean;
  specialPressed: boolean;
  shield: boolean;
}

const keys = new Set<string>();
let prevJump = false;
let prevAttack = false;
let prevSpecial = false;

// Debug toggle — when true, the renderer draws hitboxes for active moves.
let _showHitboxes = false;
export function showHitboxesEnabled() {
  return _showHitboxes;
}

export function attachInput(target: Window = window) {
  const down = (e: KeyboardEvent) => {
    keys.add(e.code);
    // Global one-shot commands — handled here, not via InputFrame.
    if (e.code === "KeyM") {
      downloadReplay(PLAYER.archetype.id, DUMMY.archetype.id);
    } else if (e.code === "KeyR") {
      // Reset dummy to neutral. Useful when it gets KO'd or stuck.
      resetDummy({ x: 220, y: 0 });
    } else if (e.code === "KeyH") {
      _showHitboxes = !_showHitboxes;
    } else if (e.code === "KeyC") {
      // Clear the replay buffer (start fresh recording from now).
      clearReplay();
    }
    if (
      e.code === "Space" ||
      e.code.startsWith("Arrow") ||
      e.code === "KeyW" ||
      e.code === "KeyA" ||
      e.code === "KeyS" ||
      e.code === "KeyD"
    ) {
      e.preventDefault();
    }
  };
  const up = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };
  target.addEventListener("keydown", down);
  target.addEventListener("keyup", up);
  return () => {
    target.removeEventListener("keydown", down);
    target.removeEventListener("keyup", up);
  };
}

export function readInput(): InputFrame {
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const up = keys.has("ArrowUp") || keys.has("KeyW");
  const down = keys.has("ArrowDown") || keys.has("KeyS");
  // Jump on Space, J, W, or Up — all common platform-fighter conventions.
  const jump =
    keys.has("Space") ||
    keys.has("KeyJ") ||
    keys.has("KeyW") ||
    keys.has("ArrowUp");
  // Attack: F (legacy) or K (matches Smash-friendly right-hand layout)
  const attack = keys.has("KeyF") || keys.has("KeyK");
  const special = keys.has("KeyG") || keys.has("KeyL");
  const shield = keys.has("ShiftLeft");

  const jumpPressed = jump && !prevJump;
  const attackPressed = attack && !prevAttack;
  const specialPressed = special && !prevSpecial;
  prevJump = jump;
  prevAttack = attack;
  prevSpecial = special;

  return {
    left,
    right,
    up,
    down,
    jump,
    jumpPressed,
    attack,
    attackPressed,
    special,
    specialPressed,
    shield,
  };
}
