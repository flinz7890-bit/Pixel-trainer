import { useGame } from "@/game/state";
import Toast from "@/components/Toast";

export default function SettingsScreen() {
  const { state, dispatch, saveGame, resetGame, hasSave } = useGame();

  const onSave = () => {
    saveGame();
    dispatch({ type: "TOAST", text: "Game saved!" });
  };

  const onReset = () => {
    if (!confirm("Erase your save and start over? This cannot be undone.")) return;
    resetGame();
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-6">
      <Toast />
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">⚙</div>
        <div>
          <div className="text-xl font-extrabold">Settings</div>
          <div className="text-xs opacity-80">Manage your game data.</div>
        </div>
      </div>

      <div className="pq-card p-3 flex items-center justify-between">
        <div>
          <div className="font-bold">Sound effects</div>
          <div className="text-xs opacity-70">(Cosmetic — no audio in v1)</div>
        </div>
        <button
          className={`pq-btn ${state.audioOn ? "pq-btn-green" : "pq-btn-gray"}`}
          onClick={() => dispatch({ type: "TOGGLE_AUDIO" })}
        >
          {state.audioOn ? "ON" : "OFF"}
        </button>
      </div>

      <div className="pq-card p-3">
        <div className="font-bold mb-1">Save Data</div>
        <div className="text-xs opacity-80 mb-2">
          Progress is saved automatically to this browser. {hasSave() ? "A save exists." : "No save yet."}
        </div>
        <div className="flex gap-2">
          <button className="pq-btn pq-btn-blue flex-1" onClick={onSave}>💾 Save Now</button>
          <button className="pq-btn pq-btn-red flex-1" onClick={onReset}>🗑 Reset</button>
        </div>
      </div>

      <button
        className="pq-btn pq-btn-gray"
        onClick={() =>
          dispatch({ type: "SET_SCREEN", screen: state.team.length ? "adventure" : "home" })
        }
      >
        ← Back
      </button>
    </div>
  );
}
