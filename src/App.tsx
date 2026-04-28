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
      startLoop(() => {});
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
  const motion = useHud((s) => s.motion);
  const damage = useHud((s) => s.damage);
  const stocks = useHud((s) => s.stocks);
  const fps = useHud((s) => s.fps);
  const ticks = useHud((s) => s.ticks);

  return (
    <>
      <div className="hud hud-tl">
        <div>BRAMM &middot; {damage}%</div>
        <div>stocks {stocks}</div>
        <div style={{ opacity: 0.55 }}>{motion}</div>
      </div>
      <div className="hud hud-tr">
        {fps} fps &middot; {ticks} ticks
      </div>
    </>
  );
}

function TitleCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-card" onClick={onStart}>
      <h1>Solar Brothers Melee</h1>
      <p>2D adventure with Melee engine. Build in public.</p>
      <p style={{ marginTop: 18, opacity: 0.7 }}>
        <kbd>A</kbd>/<kbd>D</kbd> move &middot; <kbd>Space</kbd> jump (x2) &middot;{" "}
        <kbd>S</kbd> fast-fall
      </p>
      <p style={{ marginTop: 24, fontSize: 13, opacity: 0.5 }}>click anywhere to start</p>
    </div>
  );
}
