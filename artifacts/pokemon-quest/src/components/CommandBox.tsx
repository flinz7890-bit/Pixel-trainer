import { useEffect, useRef } from "react";
import { useGame } from "@/game/state";

function colorClass(line: string) {
  const l = line.toLowerCase();
  if (l.startsWith("[rocket]") || /team rocket|rocket grunt|rocket executive|giovanni/.test(l)) return "rocket";
  if (/(damage|fainted|hurt|hit|broke free)/.test(l)) return "dmg";
  if (/(potion|ball|received|caught|gained|heal|earned)/.test(l)) return "item";
  if (/(used|won|gotcha|begin|joined|evolved|appeared|safely)/.test(l)) return "ok";
  return "info";
}

function cleanLine(line: string) {
  return line.replace(/^\[Rocket\]\s*/, "");
}

export default function CommandBox() {
  const { state, dispatch } = useGame();
  const ref = useRef<HTMLDivElement | null>(null);
  const lines = state.commandLog;

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);

  return (
    <div className="cmd-log mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="font-mono-pq text-[10px] tracking-[.18em] uppercase"
          style={{ color: "#4ade80" }}
        >
          ▾ command_log
        </div>
        <button
          className="text-[10px] font-mono-pq hover:text-zinc-200 transition"
          style={{ color: "#71717a" }}
          onClick={() => dispatch({ type: "CLEAR_LOG" })}
        >
          clear
        </button>
      </div>
      <div ref={ref} className="overflow-y-auto" style={{ maxHeight: 110 }}>
        {lines.length === 0 && <div className="empty">No commands yet…</div>}
        {lines.map((line, i) => {
          const cls = colorClass(line);
          return (
            <div key={i} className="row">
              <span className="prefix">&gt;</span>
              <span
                className={cls}
                style={cls === "rocket" ? { color: "#f43f5e", fontWeight: 700 } : undefined}
              >
                {cleanLine(line)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
