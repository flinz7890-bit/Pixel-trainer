import { useGame } from "@/game/state";

export default function WelcomeScreen() {
  const { dispatch } = useGame();
  return (
    <div className="pq-fade flex flex-col items-center gap-10 py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[.4em] text-teal-300/80 mb-3">Welcome to</div>
        <div
          className="font-pixel text-3xl sm:text-4xl"
          style={{
            background: "linear-gradient(180deg,#5eead4 0%,#2dd4bf 50%,#0f766e 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            textShadow: "0 0 24px rgba(45,212,191,0.35)",
          }}
        >
          POKÉMON QUEST
        </div>
        <div className="mt-3 text-sm text-slate-300/80">A turn-based browser adventure.</div>
      </div>

      <div className="text-7xl pq-float select-none" aria-hidden>⚪</div>

      <div className="w-full max-w-xs">
        <button
          className="pq-btn pq-btn-primary w-full pq-glow text-base"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "menu" })}
        >
          ▶ START
        </button>
        <div className="text-center text-[11px] mt-3 text-slate-400">Tap START to begin your journey</div>
      </div>
    </div>
  );
}
