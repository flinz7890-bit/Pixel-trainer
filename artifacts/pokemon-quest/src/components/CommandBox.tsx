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
      className="mt-3 rounded-2xl"
      style={{
        background: "#14141f",
        border: "1px solid rgba(74,222,128,0.18)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.40)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-green-400/15">
        <div className="text-[9px] font-pixel text-green-400/90 tracking-widest">▾ COMMAND LOG</div>
        <button
          className="text-[10px] text-zinc-400 hover:text-green-300 font-mono-pq"
          onClick={() => dispatch({ type: "CLEAR_LOG" })}
        >
          clear
        </button>
      </div>
      <div ref={ref} className="px-3 py-2 max-h-28 overflow-y-auto font-mono-pq text-[12.5px] leading-relaxed">
        {lines.length === 0 && (
          <div className="text-zinc-500 italic">No commands yet…</div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="text-green-400">
            <span className="text-green-500 mr-1.5">•</span>{line}
          </div>
        ))}
      </div>
    </div>
  );
}
