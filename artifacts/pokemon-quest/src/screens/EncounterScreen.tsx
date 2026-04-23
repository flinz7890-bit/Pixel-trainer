import { useState } from "react";
import { useGame, speciesOf, makePokemon, BattleState, OwnedPokemon } from "@/game/state";
import { LOCATIONS, SPECIES } from "@/game/data";
import Toast from "@/components/Toast";

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
        <div className="text-slate-300/80 mb-3">No wild Pokémon here.</div>
        <button className="pq-btn pq-btn-primary" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
          Back
        </button>
      </div>
    );
  }
  const sp = speciesOf(enemy);
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;

  const goBack = () => {
    pushLog("Got away safely!");
    setTimeout(() => {
      dispatch({ type: "SET_BATTLE", battle: null });
      dispatch({ type: "SET_SCREEN", screen: "adventure" });
    }, 350);
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

      {/* Compact dark themed encounter card */}
      <div className="pq-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[.3em] text-green-400/80">Wild Encounter</div>
          <div className="text-[11px] text-slate-300/80">{loc.emoji} {loc.name}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sprite */}
          <div
            className={`relative shrink-0 ${shake ? "pq-shake" : "pq-pop"}`}
            style={{ width: 96, height: 96 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(closest-side, ${sp.color}55, transparent 70%)`,
              }}
            />
            <div
              className="absolute inset-2 rounded-full grid place-items-center"
              style={{
                background: `linear-gradient(180deg, ${sp.color}33, rgba(0,0,0,0.25))`,
                border: `2px solid ${sp.color}aa`,
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.10)",
              }}
            >
              <span style={{ fontSize: 56, lineHeight: 1 }}>{sp.sprite}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-[12px] text-green-300 truncate">{sp.name.toUpperCase()}</span>
              <span style={{ color: enemy.gender === "M" ? "#60a5fa" : "#f472b6", fontWeight: 800 }}>
                {enemy.gender === "M" ? "♂" : "♀"}
              </span>
              <span className="text-[11px] text-slate-300/80">Lv.{enemy.level}</span>
            </div>
            <div className="text-[11px] text-slate-300/80 mt-0.5">{sp.type.join(" / ")}</div>
            <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
              <div className="rounded-md px-2 py-1 bg-white/5 border border-green-400/15 text-center">
                <div className="text-slate-400">Catch</div>
                <div className="text-green-300 font-bold">{Math.round(sp.catchRate * 100)}%</div>
              </div>
              <div className="rounded-md px-2 py-1 bg-white/5 border border-green-400/15 text-center">
                <div className="text-slate-400">Balls</div>
                <div className="text-green-300 font-bold">{state.pokeballs}</div>
              </div>
              <div className="rounded-md px-2 py-1 bg-white/5 border border-green-400/15 text-center">
                <div className="text-slate-400">Rarity</div>
                <div className="text-green-300 font-bold capitalize">{sp.rarity}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button className="pq-btn pq-btn-primary" onClick={startBattle}>
          🎯 CAPTURE
        </button>
        <button className="pq-btn pq-btn-amber" onClick={exploreAgain}>
          🔄 EXPLORE AGAIN
        </button>
        <button className="pq-btn pq-btn-rose" onClick={goBack}>
          🏃 RUN
        </button>
      </div>

    </div>
  );
}
