import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { CAMERA, STAGE1, TICK_DT } from "../engine/constants";
import { showHitboxesEnabled } from "../engine/input";
import { tickCamera } from "../engine/loop";
import { hitboxAt, MOVES } from "../engine/moves";
import { DUMMY, PLAYER, type Fighter, type HitEvent } from "../engine/state";
import { drawBramm, drawCael } from "./sprite";

// Pixi v8: Application is constructed empty, then init() runs async.
// Engine y is positive-up; Pixi y is positive-down. We invert at the camera
// layer so all engine code can keep math-natural orientation.

export interface PixiHandle {
  app: Application;
  destroy: () => void;
  spawnHitVfx: (events: HitEvent[]) => void;
}

interface Camera {
  x: number;
  y: number;
}

// VFX entities — short-lived. Tracked here so we can fade them per render frame.
interface Spark {
  gfx: Graphics;
  ttl: number;
  initialTtl: number;
}
interface DamagePop {
  txt: Text;
  ttl: number;
  initialTtl: number;
  vy: number;
}

export async function mountPixi(host: HTMLElement): Promise<PixiHandle> {
  const app = new Application();
  await app.init({
    background: 0x7cb6c4,
    resizeTo: host,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio,
  });
  host.appendChild(app.canvas);

  // World container — translated by camera. Children live in engine coords.
  // The world is scaled Y-flipped so positive-up math works.
  const world = new Container();
  app.stage.addChild(world);

  // Stage geometry (one platform for v0).
  const stageGfx = new Graphics();
  drawStage(stageGfx);
  world.addChild(stageGfx);

  // Fighter visuals.
  const playerGfx = new Graphics();
  const dummyGfx = new Graphics();
  world.addChild(dummyGfx);
  world.addChild(playerGfx);

  // Debug hitbox/hurtbox overlay (toggle via H key).
  const debugGfx = new Graphics();
  world.addChild(debugGfx);

  // VFX containers.
  // Sparks (Graphics) live in world space (move with camera).
  // Popups (Text) need un-flipped scale, so they live in a sub-container
  // with reversed Y so text reads normally.
  const sparksLayer = new Container();
  world.addChild(sparksLayer);

  // For popups: a separate stage-space overlay so text isn't mirrored
  // when the world flips Y. We project (worldX, worldY) → screen ourselves.
  const popupLayer = new Container();
  app.stage.addChild(popupLayer);

  const activeSparks: Spark[] = [];
  const activePops: { pop: DamagePop; worldX: number; worldY: number }[] = [];

  // Skybox — twin-sun band along the horizon, doesn't move with camera.
  const sky = new Graphics();
  paintSky(sky, app.screen.width, app.screen.height);
  app.stage.addChildAt(sky, 0);

  const cam: Camera = { x: 0, y: 0 };

  // Spawn-hit-VFX entry point — called by App via the hitHook.
  const spawnHitVfx = (events: HitEvent[]) => {
    for (const e of events) {
      // Hit spark — bright if tipper, dim if body.
      const spark = new Graphics();
      const color = e.flavor === "tipper" ? 0xe97a1a : 0x6faa4a;
      const radius = e.flavor === "tipper" ? 38 : 22;
      spark.circle(0, 0, radius).fill({ color, alpha: 0.85 });
      // Outer ring for extra punch on tipper hits.
      if (e.flavor === "tipper") {
        spark.circle(0, 0, radius + 18).stroke({ color: 0xffd76b, width: 4, alpha: 0.7 });
      }
      spark.position.set(e.x, e.y);
      sparksLayer.addChild(spark);
      const ttl = e.flavor === "tipper" ? 28 : 18;
      activeSparks.push({ gfx: spark, ttl, initialTtl: ttl });

      // Damage popup
      const style = new TextStyle({
        fontFamily: "DM Mono, monospace",
        fontSize: e.flavor === "tipper" ? 28 : 18,
        fontWeight: e.flavor === "tipper" ? "bold" : "normal",
        fill: e.flavor === "tipper" ? 0xffd76b : 0xf4ecd8,
        stroke: { color: 0x1f2a1c, width: 3 },
      });
      const label = e.flavor === "tipper" ? `TIPPER +${e.damage}` : `+${e.damage}`;
      const txt = new Text({ text: label, style });
      txt.anchor.set(0.5, 0.5);
      popupLayer.addChild(txt);
      activePops.push({
        pop: { txt, ttl: 50, initialTtl: 50, vy: 80 },
        worldX: e.x,
        worldY: e.y,
      });
    }
  };

  // Animation clock — wall-clock seconds, used for procedural anim cycles.
  let animT = 0;

  // Render hook — called once per animation frame from the loop.
  app.ticker.add((ticker) => {
    tickCamera(cam);
    animT += ticker.deltaMS / 1000;

    const cw = app.screen.width / 2;
    const ch = app.screen.height / 2;

    // World offset: center camera on screen, flip Y so positive-up maps
    // to up on screen.
    world.position.set(cw - cam.x * CAMERA.zoom, ch + cam.y * CAMERA.zoom);
    world.scale.set(CAMERA.zoom, -CAMERA.zoom);

    drawCael(playerGfx, PLAYER, animT);
    drawBramm(dummyGfx, DUMMY, animT);

    debugGfx.clear();
    if (showHitboxesEnabled()) {
      drawDebugBoxes(debugGfx, PLAYER);
      drawDebugBoxes(debugGfx, DUMMY);
    }

    // Tick + fade sparks.
    for (let i = activeSparks.length - 1; i >= 0; i--) {
      const s = activeSparks[i];
      s.ttl -= 1;
      s.gfx.alpha = Math.max(0, s.ttl / s.initialTtl);
      s.gfx.scale.set(1 + (1 - s.ttl / s.initialTtl) * 0.7);
      if (s.ttl <= 0) {
        sparksLayer.removeChild(s.gfx);
        s.gfx.destroy();
        activeSparks.splice(i, 1);
      }
    }

    // Tick + fade popups. Popups float up in screen space (so positive vy
    // translates to negative screen-y movement).
    for (let i = activePops.length - 1; i >= 0; i--) {
      const p = activePops[i];
      p.pop.ttl -= 1;
      p.worldY += p.pop.vy * TICK_DT;
      // Project worldX/Y → screen coords.
      const sx = cw + (p.worldX - cam.x) * CAMERA.zoom;
      const sy = ch - (p.worldY - cam.y) * CAMERA.zoom;
      p.pop.txt.position.set(sx, sy);
      p.pop.txt.alpha = Math.max(0, p.pop.ttl / p.pop.initialTtl);
      if (p.pop.ttl <= 0) {
        popupLayer.removeChild(p.pop.txt);
        p.pop.txt.destroy();
        activePops.splice(i, 1);
      }
    }

    // Resize sky if viewport changed.
    paintSky(sky, app.screen.width, app.screen.height);
  });

  return {
    app,
    spawnHitVfx,
    destroy: () => {
      app.destroy(true, { children: true });
    },
  };
}

function paintSky(g: Graphics, w: number, h: number) {
  g.clear();
  g.rect(0, 0, w, h).fill(0x7cb6c4);
  g.rect(0, h * 0.55, w, h * 0.04).fill(0xe8b547);
  g.circle(w * 0.18, h * 0.42, Math.min(w, h) * 0.06).fill(0xe97a1a);
  g.circle(w * 0.78, h * 0.36, Math.min(w, h) * 0.045).fill(0xe8b547);
}

function drawStage(g: Graphics) {
  const p = STAGE1.platform;
  g.clear();
  g.rect(p.x, p.y - p.h, p.w, p.h).fill(0x2f5d3a);
  g.rect(p.x, p.y - p.h, p.w, 8).fill(0x6faa4a);
}

function drawDebugBoxes(g: Graphics, f: Fighter) {
  // Hurtbox — blue outline.
  const w = 56;
  const h = 88;
  g.rect(f.x - w / 2, f.y, w, h).stroke({ color: 0x4d9ed1, width: 2, alpha: 0.7 });

  // Active hitboxes — colored by flavor.
  if (!f.activeMove) return;
  const move = MOVES[f.activeMove];
  for (const hb of move.hitboxes) {
    const box = hitboxAt(hb, f, f.attackFrame);
    if (!box) continue;
    const stroke = hb.flavor === "tipper" ? 0xe97a1a : 0xb85540;
    g.rect(box.x, box.y, box.w, box.h).stroke({ color: stroke, width: 2, alpha: 0.95 });
  }
}
