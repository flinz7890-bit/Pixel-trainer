import { useGame } from "@/game/state";

export default function WelcomeScreen() {
  const { dispatch } = useGame();
  return (
    <div className="pq-fade flex flex-col items-center gap-10 py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[.4em] text-orange-400/80 mb-3">Welcome to</div>
        <div
          className="font-pixel text-3xl sm:text-4xl"
          style={{
            background: "linear-gradient(180deg,#FFB07A 0%,#FF7A45 50%,#F26207 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            textShadow: "0 0 24px rgba(242,98,7,0.45)",
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
