import { useState } from "react";
import { useGame, speciesOf, makePokemon, BattleState, OwnedPokemon } from "@/game/state";
import { LOCATIONS, SPECIES } from "@/game/data";
import Toast from "@/components/Toast";
import { TypeBadges, typeColor } from "@/components/TypeBadge";

const RARITY_STYLES: Record<string, { color: string; label: string }> = {
  common: { color: "#a1a1aa", label: "COMMON" },
  uncommon: { color: "#4ade80", label: "UNCOMMON" },
  rare: { color: "#60a5fa", label: "RARE" },
  epic: { color: "#a855f7", label: "EPIC" },
  legendary: { color: "#facc15", label: "LEGENDARY" },
};

function pickEncounter(locId: string) {
  const loc = LOCATIONS.find((l) => l.id === locId)!;
  const total = loc.encounters.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const enc of loc.encounters) {
    r -= enc.weight;
    if (r <= 0) {
      const lvl = Math.floor(enc.minLevel + Math.random() * (enc.maxLevel - enc.minLevel + 1));
      return { speciesId: enc.speciesId, level: lvl };
    }
  }
  const last = loc.encounters[loc.encounters.length - 1];
  return { speciesId: last.speciesId, level: last.minLevel };
}

export default function EncounterScreen() {
  const { state, dispatch } = useGame();
  const enemy = state.battle?.enemy as OwnedPokemon | undefined;
  const [shake, setShake] = useState(false);
  const pushLog = (line: string) => dispatch({ type: "LOG", lines: [line] });

  if (!enemy) {
    return (
      <div className="pq-fade py-6 text-center">
        <div style={{ color: "#a1a1aa" }} className="mb-3">No wild Pokémon here.</div>
        <button className="pq-btn pq-btn-primary" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
          Back
        </button>
      </div>
    );
  }
  const sp = speciesOf(enemy);
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;
  const tColor = typeColor(sp.type[0]);
  const rar = RARITY_STYLES[sp.rarity] || RARITY_STYLES.common;

  const goBack = () => {
    pushLog("Got away safely!");
    setTimeout(() => {
      dispatch({ type: "SET_BATTLE", battle: null });
      dispatch({ type: "SET_SCREEN", screen: "adventure" });
    }, 250);
  };

  const exploreAgain = () => {
    const active = state.team[0];
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      return;
    }
    setShake(true);
    setTimeout(() => setShake(false), 350);
    const { speciesId, level } = pickEncounter(state.locationId);
    const next = makePokemon(speciesId, level);
    dispatch({ type: "SEE_POKEMON", speciesId });
    const battle: BattleState = {
      enemy: next,
      log: [`A wild ${SPECIES[speciesId].name} appeared!`],
      busy: false,
      turn: "player",
    };
    dispatch({ type: "SET_BATTLE", battle });
    pushLog("You searched the tall grass...");
    pushLog(`A wild ${SPECIES[speciesId].name.toUpperCase()} appeared!`);
  };

  const startBattle = () => {
    const active = state.team[0];
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      return;
    }
    pushLog(`Go! ${speciesOf(active).name.toUpperCase()}!`);
    setTimeout(() => dispatch({ type: "SET_SCREEN", screen: "battle" }), 200);
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />

      <div className="pq-card p-4" style={{ boxShadow: `0 12px 30px rgba(0,0,0,0.45), 0 0 26px ${tColor}33` }}>
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-[10px] font-mono-pq tracking-[.3em] uppercase"
            style={{ color: "#4ade80" }}
          >
            ▶ Wild Encounter
          </div>
          <div className="text-[11px] font-mono-pq" style={{ color: "#a1a1aa" }}>
            {loc.emoji} {loc.name}
          </div>
        </div>

        {/* Centered glowing sprite */}
        <div className="grid place-items-center mb-3">
          <div
            className={`relative ${shake ? "pq-shake" : "pq-pop"}`}
            style={{ width: 160, height: 160 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(closest-side, ${tColor}66, transparent 72%)`,
                filter: "blur(2px)",
              }}
            />
            <div
              className="absolute inset-3 rounded-full grid place-items-center"
              style={{
                background: `linear-gradient(180deg, ${tColor}33, rgba(0,0,0,0.30))`,
                border: `2px solid ${tColor}`,
                boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.08), 0 0 32px ${tColor}66`,
              }}
            >
              <span style={{ fontSize: 88, lineHeight: 1, filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.30))" }}>
                {sp.sprite}
              </span>
            </div>
          </div>
        </div>

        {/* Name + level + type */}
        <div className="text-center">
          <div className="font-pixel text-[15px] inline-flex items-center gap-2 justify-center">
            <span style={{ color: "#fff" }}>{sp.name.toUpperCase()}</span>
            <span style={{ color: enemy.gender === "M" ? "#60a5fa" : "#f472b6" }}>
              {enemy.gender === "M" ? "♂" : "♀"}
            </span>
            <span
              className="font-mono-pq text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", color: "#d4d4d8" }}
            >
              LV {enemy.level}
            </span>
          </div>
          <div className="mt-2 flex justify-center"><TypeBadges types={sp.type} /></div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="pq-card-2 px-2 py-2 text-center">
            <div className="text-[9px] font-mono-pq uppercase" style={{ color: "#71717a" }}>Catch %</div>
            <div className="font-mono-pq font-bold text-[15px]" style={{ color: "#4ade80" }}>
              {Math.round(sp.catchRate * 100)}%
            </div>
          </div>
          <div className="pq-card-2 px-2 py-2 text-center">
            <div className="text-[9px] font-mono-pq uppercase" style={{ color: "#71717a" }}>Balls</div>
            <div className="font-mono-pq font-bold text-[15px]" style={{ color: "#fff" }}>
              {state.pokeballs}
            </div>
          </div>
          <div className="pq-card-2 px-2 py-2 text-center">
            <div className="text-[9px] font-mono-pq uppercase" style={{ color: "#71717a" }}>Rarity</div>
            <div className="font-mono-pq font-bold text-[12px] mt-0.5" style={{ color: rar.color }}>
              {rar.label}
            </div>
          </div>
        </div>
      </div>

      {/* Stacked actions */}
      <div className="flex flex-col gap-2">
        <button className="pq-btn pq-btn-rose" onClick={startBattle}>
          ⚪ CAPTURE
        </button>
        <button className="pq-btn pq-btn-amber" onClick={exploreAgain}>
          🔄 EXPLORE AGAIN
        </button>
        <button className="pq-btn pq-btn-violet" onClick={goBack}>
          🏃 RUN
        </button>
      </div>
    </div>
  );
}
