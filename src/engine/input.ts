// Polling-based input. Each tick reads the current state of buttons —
// no event accumulation, no React state. Engine never blocks on input.
// We track "pressed this tick" via edge detection between current and prior frame.

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean; // true only on the tick the key went down
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

export function attachInput(target: Window = window) {
  const down = (e: KeyboardEvent) => {
    keys.add(e.code);
    // Prevent default for game keys so the page doesn't scroll on Space/arrows.
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
  const jump = keys.has("Space") || keys.has("KeyJ");
  const attack = keys.has("KeyF");
  const special = keys.has("KeyR");
  const shield = keys.has("KeyL") || keys.has("ShiftLeft");

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
