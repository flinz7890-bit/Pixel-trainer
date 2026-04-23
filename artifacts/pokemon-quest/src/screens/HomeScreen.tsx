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
        <div className="text-[11px] uppercase tracking-[.4em] text-green-400/80 mb-2">Main Menu</div>
        <div
          className="font-pixel text-2xl"
          style={{
            background: "linear-gradient(180deg,#86efac 0%,#4ade80 60%,#16a34a 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}
        >
          POKÉMON QUEST
        </div>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          className="pq-btn pq-btn-primary"
          onClick={cont}
          disabled={!canContinue}
        >
          ⏵ CONTINUE
        </button>
        <button
          className="pq-btn pq-btn-secondary"
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

      <div className="text-xs text-slate-400 text-center">
        {state.trainerName ? `Save belongs to ${state.trainerName}` : canContinue ? "" : "No save yet — start a new game."}
      </div>

      <button
        className="text-[11px] text-green-400/70 underline-offset-2 hover:underline"
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "welcome" })}
      >
        ← back
      </button>
    </div>
  );
}
