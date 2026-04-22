import { useEffect, useRef } from "react";
import { useGame } from "@/game/state";

export default function CommandBox() {
  const { state, dispatch } = useGame();
  const ref = useRef<HTMLDivElement | null>(null);
  const lines = state.commandLog;

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);

  return (
    <div
      className="pq-card mt-3"
      style={{ borderColor: "rgba(242,98,7,0.30)" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-orange-400/15">
        <div className="text-[9px] font-pixel text-orange-400/80 tracking-widest">▾ COMMAND LOG</div>
        <button
          className="text-[10px] text-slate-400 hover:text-orange-300"
          onClick={() => dispatch({ type: "CLEAR_LOG" })}
        >
          clear
        </button>
      </div>
      <div ref={ref} className="px-3 py-2 max-h-28 overflow-y-auto font-gba text-[15px] leading-tight">
        {lines.length === 0 && (
          <div className="text-slate-500 italic">No commands yet…</div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="text-slate-100/90">
            <span className="text-orange-400/70 mr-1">›</span>{line}
          </div>
        ))}
      </div>
    </div>
  );
}
