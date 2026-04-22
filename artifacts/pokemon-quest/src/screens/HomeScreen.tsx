import { useGame } from "@/game/state";
import Logo from "@/components/Logo";

export default function HomeScreen() {
  const { state, dispatch, loadGame, hasSave } = useGame();
  const canContinue = hasSave();

  const startNew = () => dispatch({ type: "SET_SCREEN", screen: "starter" });
  const cont = () => {
    if (loadGame()) dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  return (
    <div className="pq-fade flex flex-col items-center gap-8 py-10">
      <Logo />
      <div className="w-full max-w-xs flex flex-col gap-3">
        <button className="pq-btn pq-btn-red" onClick={startNew}>▶ Start New Game</button>
        <button className="pq-btn pq-btn-blue" onClick={cont} disabled={!canContinue}>
          ⏵ Continue
        </button>
        <button className="pq-btn pq-btn-yellow" onClick={() => dispatch({ type: "SET_SCREEN", screen: "pokedex" })}>
          📖 Pokédex
        </button>
        <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "settings" })}>
          ⚙ Settings
        </button>
      </div>
      <div className="text-xs opacity-70 text-center max-w-xs">
        {state.trainerName ? `Welcome back, ${state.trainerName}!` : "A turn-based browser adventure"}
      </div>
    </div>
  );
}
