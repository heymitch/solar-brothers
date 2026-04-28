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
        <div>
          <span className="name">Bramm</span> &middot; {damage}%
        </div>
        <div>stocks {stocks}</div>
        <div className="motion">{motion}</div>
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
      <h1 className="wordmark">
        Solar Brothers <span className="melee">melee.</span>
      </h1>
      <p className="headline">A platform fighting adventure that feels like 2001.</p>
      <p className="tech">Wavedash. L-cancel. Dash dance. By design.</p>
      <p className="controls">
        <kbd>A</kbd>/<kbd>D</kbd> move &middot; <kbd>Space</kbd> jump (&times;2) &middot;{" "}
        <kbd>S</kbd> fast-fall
      </p>
      <p className="start-cue">click anywhere to start</p>
    </div>
  );
}
