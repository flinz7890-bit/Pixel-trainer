import { useState } from "react";
import { useGame } from "@/game/state";
import { LOCATIONS, SPECIES } from "@/game/data";
import PokemonCard from "@/components/PokemonCard";
import PokeSprite from "@/components/PokeSprite";
import Toast from "@/components/Toast";

export default function PokeCenterScreen() {
  const { state, dispatch } = useGame();
  const [healing, setHealing] = useState(false);
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;
  const isRespawn = state.lastHealLocationId === loc.id;
  const needsHeal = state.team.some((p) => p.hp < p.maxHp);

  const heal = async () => {
    if (healing) return;
    setHealing(true);
    await new Promise((r) => setTimeout(r, 900));
    dispatch({ type: "HEAL_ALL" });
    dispatch({ type: "SET_LAST_HEAL", id: loc.id });
    dispatch({ type: "TOAST", text: "Your Pokémon are fully healed!" });
    dispatch({ type: "LOG", lines: [`Healed at ${loc.name} PokéCenter.`, `Respawn point set: ${loc.name}.`] });
    setHealing(false);
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />

      {/* Red roof header card */}
      <div
        className="pq-card relative overflow-hidden p-0"
        style={{ borderColor: "rgba(244,63,94,0.45)" }}
      >
        <div
          className="relative h-20"
          style={{
            background:
              "linear-gradient(180deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)",
            borderBottom: "3px solid rgba(0,0,0,0.45)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 8px, transparent 8px 16px)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="grid place-items-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: "#fff",
                border: "3px solid #b91c1c",
                boxShadow: "0 4px 0 rgba(0,0,0,0.30), 0 0 22px rgba(244,63,94,0.45)",
                color: "#dc2626",
                fontWeight: 900,
                fontFamily: "monospace",
                fontSize: 28,
              }}
            >
              H
            </div>
          </div>
        </div>

        <div className="p-4 flex items-start gap-3">
          <div
            className="shrink-0 grid place-items-center rounded-xl pq-bob"
            style={{
              width: 72,
              height: 72,
              background: "radial-gradient(closest-side, rgba(244,114,182,0.30), transparent 70%)",
              border: "1px solid rgba(244,114,182,0.40)",
            }}
            aria-label="Chansey"
          >
            {SPECIES[113] ? (
              <PokeSprite species={SPECIES[113]} size={64} />
            ) : (
              <span style={{ fontSize: 36 }}>🥚</span>
            )}
          </div>
          <div className="flex-1">
            <div
              className="font-pixel text-[14px]"
              style={{
                background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {loc.name.toUpperCase()} POKÉCENTER
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "#d4d4d8" }}>
              "Welcome! Would you like me to heal your Pokémon?"
            </div>
            <div className="text-[10px] mt-1 font-mono-pq" style={{ color: "#71717a" }}>
              — Nurse Joy
            </div>
          </div>
        </div>
      </div>

      {/* Team list */}
      <div className="flex flex-col gap-2">
        {state.team.map((p) => (
          <PokemonCard key={p.uid} p={p} showXp={false} />
        ))}
      </div>

      {/* Actions */}
      <button className="pq-btn pq-btn-primary" onClick={heal} disabled={healing || !needsHeal}>
        {healing ? "♥ Healing…" : needsHeal ? "💚 Heal Pokémon" : "✓ Already Full HP"}
      </button>

      <div
        className="text-[11px] text-center font-mono-pq"
        style={{ color: isRespawn ? "#4ade80" : "#71717a" }}
      >
        {isRespawn
          ? "✓ Set as your respawn point"
          : "Healing here will set this Center as your respawn point."}
      </div>

      <button
        className="pq-btn pq-btn-ghost"
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}
      >
        ← Leave
      </button>
    </div>
  );
}
