import { useGame } from "@/game/state";

export default function WelcomeScreen() {
  const { dispatch, loadGame, hasSave, resetGame } = useGame();
  const canContinue = hasSave();

  const onContinue = () => {
    if (loadGame()) {
      dispatch({ type: "SET_SCREEN", screen: "adventure" });
    }
  };

  const onNewGame = () => {
    resetGame();
    dispatch({ type: "SET_SCREEN", screen: "trainerpick" });
  };

  return (
    <div className="pq-fade flex flex-col items-center gap-10 py-16 relative">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[.5em] mb-3" style={{ color: "#71717a" }}>
          Welcome to
        </div>
        <div
          className="font-pixel text-3xl sm:text-4xl"
          style={{
            background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 50%,#be123c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 28px rgba(244,63,94,0.40)",
          }}
        >
          POKÉMON QUEST
        </div>
        <div className="mt-3 text-sm" style={{ color: "#a1a1aa" }}>
          A turn-based browser adventure.
        </div>
      </div>

      <div
        className="text-7xl pq-float select-none grid place-items-center rounded-full"
        style={{
          width: 130,
          height: 130,
          background: "radial-gradient(closest-side, rgba(244,63,94,0.20), transparent 70%)",
          filter: "drop-shadow(0 0 24px rgba(244,63,94,0.30))",
        }}
        aria-hidden
      >
        ⚪
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        {canContinue && (
          <button
            className="pq-btn pq-btn-primary w-full pq-glow text-base"
            onClick={onContinue}
          >
            ⏵ CONTINUE
          </button>
        )}
        <button
          className={`pq-btn ${canContinue ? "pq-btn-violet" : "pq-btn-primary pq-glow"} w-full text-base`}
          onClick={onNewGame}
        >
          ✦ NEW GAME
        </button>
        <div className="text-center text-[11px] mt-1" style={{ color: "#71717a" }}>
          {canContinue
            ? "Continue resumes your saved team & progress."
            : "Tap NEW GAME to begin your journey"}
        </div>
      </div>
    </div>
  );
}
