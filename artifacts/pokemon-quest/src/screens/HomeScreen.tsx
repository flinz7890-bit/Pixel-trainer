import { useGame } from "@/game/state";

export default function HomeScreen() {
  const { state, dispatch, loadGame, hasSave } = useGame();
  const canContinue = hasSave();

  const cont = () => {
    if (loadGame()) dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  return (
    <div className="pq-fade flex flex-col items-center gap-8 py-12">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[.5em] mb-2" style={{ color: "#71717a" }}>
          Main Menu
        </div>
        <div
          className="font-pixel text-2xl"
          style={{
            background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 60%,#be123c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 24px rgba(244,63,94,0.35)",
          }}
        >
          POKÉMON QUEST
        </div>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button className="pq-btn pq-btn-primary" onClick={cont} disabled={!canContinue}>
          ⏵ CONTINUE
        </button>
        <button
          className="pq-btn pq-btn-violet"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "starter" })}
        >
          ✦ NEW GAME
        </button>
        <button
          className="pq-btn pq-btn-ghost"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "settings" })}
        >
          ⚙ SETTINGS
        </button>
      </div>

      <div className="text-xs text-center" style={{ color: "#71717a" }}>
        {state.trainerName
          ? `Save belongs to ${state.trainerName}`
          : canContinue
          ? ""
          : "No save yet — start a new game."}
      </div>

      <button
        className="text-[11px] underline-offset-2 hover:underline transition"
        style={{ color: "#a1a1aa" }}
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "welcome" })}
      >
        ← back
      </button>
    </div>
  );
}
