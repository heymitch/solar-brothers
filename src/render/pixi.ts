import { Application, Container, Graphics } from "pixi.js";
import { CAMERA, STAGE1 } from "../engine/constants";
import { PLAYER } from "../engine/state";
import { tickCamera } from "../engine/loop";

// Pixi v8: Application is constructed empty, then init() runs async.
// Engine y is positive-up; Pixi y is positive-down. We invert at the camera layer
// so all engine code can keep math-natural orientation.

export interface PixiHandle {
  app: Application;
  destroy: () => void;
}

interface Camera {
  x: number;
  y: number;
}

export async function mountPixi(host: HTMLElement): Promise<PixiHandle> {
  const app = new Application();
  await app.init({
    // sbm-sky teal as the daytime backdrop
    background: 0x7cb6c4,
    resizeTo: host,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio,
  });
  host.appendChild(app.canvas);

  // World container — translated by camera. Children live in engine coords.
  const world = new Container();
  app.stage.addChild(world);

  // Stage geometry (one platform for v0).
  const stageGfx = new Graphics();
  drawStage(stageGfx);
  world.addChild(stageGfx);

  // Player rectangle (placeholder for sprite).
  const playerGfx = new Graphics();
  world.addChild(playerGfx);

  // Skybox — twin-sun band along the horizon, doesn't move with camera.
  // sbm-sky base, sbm-amber sun band, sbm-solar accent stripe.
  const sky = new Graphics();
  paintSky(sky, app.screen.width, app.screen.height);
  app.stage.addChildAt(sky, 0);

  const cam: Camera = { x: 0, y: 0 };

  // Render hook — called once per animation frame from the loop.
  app.ticker.add(() => {
    tickCamera(cam);

    const cw = app.screen.width / 2;
    const ch = app.screen.height / 2;

    // World offset: center camera on screen, flip Y so positive-up maps to up on screen.
    world.position.set(cw - cam.x * CAMERA.zoom, ch + cam.y * CAMERA.zoom);
    world.scale.set(CAMERA.zoom, -CAMERA.zoom);

    // Update player visual to match engine state.
    drawFighter(playerGfx);

    // Resize sky if viewport changed.
    paintSky(sky, app.screen.width, app.screen.height);
  });

  return {
    app,
    destroy: () => {
      app.destroy(true, { children: true });
    },
  };
}

function paintSky(g: Graphics, w: number, h: number) {
  g.clear();
  // sbm-sky base
  g.rect(0, 0, w, h).fill(0x7cb6c4);
  // sbm-amber sun band along the horizon
  g.rect(0, h * 0.55, w, h * 0.04).fill(0xe8b547);
  // Two suns silhouettes (placeholder discs)
  g.circle(w * 0.18, h * 0.42, Math.min(w, h) * 0.06).fill(0xe97a1a);
  g.circle(w * 0.78, h * 0.36, Math.min(w, h) * 0.045).fill(0xe8b547);
}

function drawStage(g: Graphics) {
  const p = STAGE1.platform;
  g.clear();
  // Platform body = sbm-moss (the field), grass strip = sbm-leaf.
  g.rect(p.x, p.y - p.h, p.w, p.h).fill(0x2f5d3a);
  g.rect(p.x, p.y - p.h, p.w, 8).fill(0x6faa4a);
}

function drawFighter(g: Graphics) {
  const p = PLAYER;
  const w = 56;
  const h = 88;
  // Origin = feet center.
  const x = p.x - w / 2;
  const y = p.y; // engine: feet at p.y, body extends up
  g.clear();
  g.rect(x, y, w, h).fill(p.archetype.color);
  // Eye marker — shows facing.
  const eyeX = p.facing > 0 ? x + w * 0.7 : x + w * 0.3;
  g.rect(eyeX - 4, y + h * 0.7, 8, 8).fill(0x0e1a0e);
}
