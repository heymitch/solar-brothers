import { useEffect, useRef, useState } from "react";
import { attachInput } from "./engine/input";
import { startLoop, stopLoop } from "./engine/loop";
import { useHud } from "./engine/state";
import { mountPixi, type PixiHandle } from "./render/pixi";

export function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!stageRef.current) return;
    let handle: PixiHandle | null = null;
    let detachInput: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      handle = await mountPixi(stageRef.current!);
      if (cancelled) {
        handle.destroy();
        return;
      }
      detachInput = attachInput(window);
      // Pass the hit-VFX hook so the engine can route hit events here.
      startLoop(
        () => {},
        (events) => handle?.spawnHitVfx(events)
      );
    })();

    return () => {
      cancelled = true;
      stopLoop();
      detachInput?.();
      handle?.destroy();
    };
  }, []);

  return (
    <>
      <div id="stage" ref={stageRef} />
      <Hud />
      {!started && <TitleCard onStart={() => setStarted(true)} />}
    </>
  );
}

function Hud() {
  const playerName = useHud((s) => s.playerName);
  const playerDamage = useHud((s) => s.playerDamage);
  const playerStocks = useHud((s) => s.playerStocks);
  const playerMotion = useHud((s) => s.playerMotion);
  const dummyDamage = useHud((s) => s.dummyDamage);
  const fps = useHud((s) => s.fps);
  const ticks = useHud((s) => s.ticks);
  const replayFrames = useHud((s) => s.replayFrames);
  const lastHitFlavor = useHud((s) => s.lastHitFlavor);
  const lastHitDamage = useHud((s) => s.lastHitDamage);
  const lastHitKb = useHud((s) => s.lastHitKb);

  return (
    <>
      <div className="hud hud-tl">
        <div>
          <span className="name">{playerName}</span> &middot; {playerDamage}%
        </div>
        <div>stocks {playerStocks}</div>
        <div className="motion">{playerMotion}</div>
      </div>
      <div className="hud hud-tc">
        <div className="dummy-label">DUMMY</div>
        <div className={"dummy-pct" + (dummyDamage > 100 ? " hot" : "")}>{dummyDamage}%</div>
      </div>
      <div className="hud hud-tr">
        {fps} fps &middot; {ticks} ticks
        <div className="replay-line">rec {replayFrames}f</div>
      </div>
      {lastHitFlavor && (
        <div className={"hud hud-bl " + (lastHitFlavor === "tipper" ? "tipper" : "")}>
          <div>{lastHitFlavor === "tipper" ? "★ TIPPER" : "body"}</div>
          <div>
            +{lastHitDamage}% &middot; KB {lastHitKb}
          </div>
        </div>
      )}
      <div className="hud hud-br">
        <div>
          <kbd>A</kbd>/<kbd>D</kbd> or <kbd>←</kbd>/<kbd>→</kbd> move
        </div>
        <div>
          <kbd>Space</kbd> / <kbd>W</kbd> / <kbd>↑</kbd> jump (&times;2) &middot;{" "}
          <kbd>S</kbd> / <kbd>↓</kbd> fast-fall
        </div>
        <div>
          <kbd>K</kbd> or <kbd>F</kbd> attack
        </div>
        <div className="muted">
          air + <kbd>K</kbd> &middot;{" "}
          <kbd>S</kbd> + <kbd>K</kbd> = Sundown spike
        </div>
        <div className="muted">
          <kbd>H</kbd> hitboxes &middot; <kbd>R</kbd> reset dummy &middot; <kbd>M</kbd> download
          replay &middot; <kbd>C</kbd> clear replay
        </div>
      </div>
    </>
  );
}

function TitleCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-card" onClick={onStart}>
      <h1 className="wordmark">
        Solar Brothers <span className="melee">melee.</span>
      </h1>
      <p className="headline">Cael training room.</p>
      <p className="tech">Tipper or die. Land the Sundown spike.</p>
      <p className="controls">
        <kbd>A</kbd>/<kbd>D</kbd> move &middot; <kbd>Space</kbd> jump (&times;2) &middot;{" "}
        <kbd>S</kbd> fast-fall &middot; <kbd>K</kbd> attack
      </p>
      <p className="controls">
        <kbd>K</kbd> while airborne + <kbd>S</kbd> = <strong>Sundown</strong> (tipper spike)
      </p>
      <p className="controls">
        <kbd>K</kbd> while airborne = <strong>Tempered Edge</strong> (forward air)
      </p>
      <p className="start-cue">click anywhere to start</p>
    </div>
  );
}
