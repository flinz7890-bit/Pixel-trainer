import { useState } from "react";
import { useGame } from "@/game/state";
import { SPECIES, STARTERS } from "@/game/data";

export default function StarterScreen() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState(state.trainerName || "");
  const [picked, setPicked] = useState<number | null>(null);
  const trimmed = name.trim();

  const confirm = () => {
    if (!trimmed || picked == null) return;
    dispatch({ type: "SET_NAME", name: trimmed });
    dispatch({ type: "PICK_STARTER", speciesId: picked });
    dispatch({ type: "TOAST", text: `${SPECIES[picked].name}, I choose you!` });
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  return (
    <div className="pq-fade flex flex-col gap-6 py-6">
      <div className="text-center">
        <div className="text-2xl font-extrabold">Welcome, Trainer</div>
        <div className="text-sm opacity-80 mt-1">First, what's your name?</div>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 18))}
        placeholder="Trainer name"
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-yellow-300 text-base"
      />
      <div className="text-center text-sm opacity-80">Now choose your first partner:</div>
      <div className="grid grid-cols-2 gap-3">
        {STARTERS.map((id) => {
          const sp = SPECIES[id];
          const sel = picked === id;
          return (
            <button
              key={id}
              onClick={() => setPicked(id)}
              className="pq-card p-4 flex flex-col items-center gap-2 transition"
              style={{
                outline: sel ? `3px solid ${sp.color}` : "none",
                background: sel ? sp.color + "33" : undefined,
              }}
            >
              <div className="text-5xl">{sp.sprite}</div>
              <div className="font-bold">{sp.name}</div>
              <div className="text-[11px] opacity-75">{sp.type.join(" / ")}</div>
            </button>
          );
        })}
      </div>
      <button
        className="pq-btn pq-btn-red"
        disabled={!trimmed || picked == null}
        onClick={confirm}
      >
        Begin Adventure
      </button>
      <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}>
        ← Back
      </button>
    </div>
  );
}
