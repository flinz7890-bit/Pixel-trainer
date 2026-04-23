import { useState } from "react";
import { useGame } from "@/game/state";
import { SPECIES, STARTERS } from "@/game/data";

export default function StarterScreen() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState(state.trainerName || "");
  const [picked, setPicked] = useState<number | null>(null);
  const [intro, setIntro] = useState<{ name: string; sp: number } | null>(null);
  const trimmed = name.trim();

  const confirm = () => {
    if (!trimmed || picked == null) return;
    dispatch({ type: "SET_NAME", name: trimmed });
    dispatch({ type: "PICK_STARTER", speciesId: picked });
    dispatch({ type: "LOG", lines: [
      `${trimmed} began the adventure.`,
      `${trimmed} chose ${SPECIES[picked].name.toUpperCase()}!`,
      `Received the POKÉDEX!`,
      `Received 5 POKÉ BALLS!`,
    ]});
    setIntro({ name: trimmed, sp: picked });
  };

  const begin = () => {
    dispatch({ type: "TOAST", text: `${SPECIES[picked!].name}, I choose you!` });
    dispatch({ type: "LOG", lines: ["Begin your journey!"] });
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  if (intro) {
    const sp = SPECIES[intro.sp];
    return (
      <div className="pq-fade flex flex-col items-center gap-4 py-10 text-center">
        <div className="text-[10px] uppercase tracking-[.4em] text-green-400/80">Welcome, {intro.name}</div>
        <div
          className="grid place-items-center rounded-2xl pq-pop"
          style={{
            width: 140, height: 140,
            background: sp.color + "33",
            border: `3px solid ${sp.color}`,
          }}
        >
          <span style={{ fontSize: 96 }}>{sp.sprite}</span>
        </div>
        <div className="font-pixel text-base text-green-300">{sp.name.toUpperCase()} joined your team!</div>
        <div className="pq-card p-4 max-w-sm w-full text-left text-sm text-slate-100/90 font-gba" style={{ fontSize: 17, lineHeight: 1.25 }}>
          <div>You received the <span className="text-green-400 font-bold">POKÉDEX</span>!</div>
          <div>You received <span className="text-green-400 font-bold">5 POKÉ BALLS</span>!</div>
          <div className="mt-2 text-slate-300/90">Your adventure begins now. Catch them all!</div>
        </div>
        <button className="pq-btn pq-btn-primary w-full max-w-xs pq-glow" onClick={begin}>
          ▶ BEGIN YOUR JOURNEY
        </button>
      </div>
    );
  }

  return (
    <div className="pq-fade flex flex-col gap-6 py-6">
      <div className="text-center">
        <div className="text-2xl font-extrabold text-green-300">Welcome, Trainer</div>
        <div className="text-sm text-slate-300/80 mt-1">First, what's your name?</div>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 18))}
        placeholder="Trainer name"
        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-green-400/30 outline-none focus:border-green-400 text-base text-slate-100 placeholder:text-slate-500"
      />
      <div className="text-center text-sm text-slate-300/80">Now choose your first partner:</div>
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
                background: sel ? sp.color + "22" : undefined,
              }}
            >
              <div className="text-5xl">{sp.sprite}</div>
              <div className="font-bold text-slate-100">{sp.name}</div>
              <div className="text-[11px] text-slate-300/80">{sp.type.join(" / ")}</div>
            </button>
          );
        })}
      </div>
      <button
        className="pq-btn pq-btn-primary"
        disabled={!trimmed || picked == null}
        onClick={confirm}
      >
        Begin Adventure
      </button>
      <button className="pq-btn pq-btn-ghost" onClick={() => dispatch({ type: "SET_SCREEN", screen: "menu" })}>
        ← Back
      </button>
    </div>
  );
}
