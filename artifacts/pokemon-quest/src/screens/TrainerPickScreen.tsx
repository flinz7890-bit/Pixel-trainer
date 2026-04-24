import { useState } from "react";
import { useGame } from "@/game/state";
import TrainerSprite, { TRAINERS } from "@/components/TrainerSprite";

export default function TrainerPickScreen() {
  const { state, dispatch } = useGame();
  const [selected, setSelected] = useState(state.trainerSpriteId || "red");
  const [name, setName] = useState(state.trainerName || "");

  const confirm = () => {
    const trimmed = name.trim() || "Trainer";
    dispatch({ type: "SET_NAME", name: trimmed });
    dispatch({ type: "SET_TRAINER_SPRITE", id: selected });
    dispatch({ type: "SET_SCREEN", screen: "menu" });
  };

  return (
    <div className="pq-fade flex flex-col gap-4 py-4 select-none">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[.4em]" style={{ color: "#71717a" }}>
          Step 1 of 2
        </div>
        <div
          className="font-pixel text-2xl mt-2"
          style={{
            background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          CHOOSE YOUR TRAINER
        </div>
        <div className="text-xs mt-1" style={{ color: "#a1a1aa" }}>
          Pick a sprite that represents you in Kanto.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TRAINERS.map((t) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="pq-card p-2 flex flex-col items-center gap-1 transition"
              style={{
                borderColor: active ? t.color : "var(--border)",
                boxShadow: active ? `0 0 18px ${t.color}66, inset 0 0 0 1px ${t.color}aa` : undefined,
                background: active ? `linear-gradient(180deg, ${t.color}22, var(--panel-2))` : undefined,
              }}
            >
              <div
                className="grid place-items-center rounded-xl"
                style={{
                  width: 96,
                  height: 96,
                  background: `radial-gradient(closest-side, ${t.color}33, transparent 70%)`,
                  border: `1px solid ${t.color}66`,
                }}
              >
                <TrainerSprite url={t.url} fallbackEmoji={t.emoji} size="lg" alt={t.name} />
              </div>
              <div className="font-pixel text-[10px] mt-1" style={{ color: active ? t.color : "#d4d4d8" }}>
                {t.name.toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pq-card p-3">
        <label className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#71717a" }}>
          Trainer Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 12))}
          placeholder="ASH"
          className="w-full mt-1 px-3 py-2 rounded-lg font-pixel text-[14px] bg-transparent outline-none"
          style={{ border: "1px solid var(--border)", color: "#f5f5f7" }}
        />
        <div className="text-[10px] mt-1 font-mono-pq" style={{ color: "#71717a" }}>
          Up to 12 characters.
        </div>
      </div>

      <button className="pq-btn pq-btn-primary pq-glow" onClick={confirm}>
        ▶ CONTINUE
      </button>
    </div>
  );
}
