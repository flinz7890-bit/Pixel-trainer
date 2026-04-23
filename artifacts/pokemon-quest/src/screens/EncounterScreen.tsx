import { useEffect, useState } from "react";
import { useGame, speciesOf, makePokemon, BattleState, OwnedPokemon } from "@/game/state";
import { LOCATIONS, SPECIES } from "@/game/data";
import Toast from "@/components/Toast";
import { typeColor } from "@/components/TypeBadge";

const HUNTS_PER_LEGENDARY = 32;

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

  // Increment hunt counter once per encounter
  useEffect(() => {
    if (enemy) dispatch({ type: "INC_HUNT" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy?.uid]);

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

  // Derive level range across all encounters in this location (fallback to enemy level)
  const lvls = loc.encounters.length
    ? loc.encounters.flatMap((e) => [e.minLevel, e.maxLevel])
    : [enemy.level];
  const lvMin = Math.min(...lvls);
  const lvMax = Math.max(...lvls);

  const huntsCur = ((state.wildEncounters - 1) % HUNTS_PER_LEGENDARY) + 1;

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

      {/* Region header */}
      <div className="text-center">
        <div className="enc-region">
          <span className="enc-dot" />
          <span className="enc-region-name">{loc.name}</span>
          <span className="enc-region-sep">•</span>
          <span className="enc-region-lv">Lv {lvMin}–{lvMax}</span>
        </div>
        <div className="enc-hunts">
          Hunts: {huntsCur}/{HUNTS_PER_LEGENDARY} until legendary
        </div>
      </div>

      {/* Scene panel */}
      <div className="enc-scene" style={{ boxShadow: `0 12px 30px rgba(0,0,0,0.55), 0 0 30px ${tColor}22` }}>
        <div className="enc-scene-stripes" />
        <div className="enc-scene-floor" />
        <div className={`enc-sprite ${shake ? "pq-shake" : "pq-bob"}`}>
          <span style={{ fontSize: 132, lineHeight: 1, filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.45))" }}>
            {sp.sprite}
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="enc-caption">
        <span className="enc-caption-text">A wild </span>
        <span className="enc-caption-name">{sp.name}</span>
        <span className="enc-caption-lv">Lv. {enemy.level}</span>
        <span className="enc-caption-text"> has appeared!</span>
      </div>

      {/* Action buttons */}
      <div className="enc-actions">
        <button className="enc-action-btn" onClick={exploreAgain} aria-label="Hunt again">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 5c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2z" />
            <path d="M16 5c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2z" />
            <path d="M7 14c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2z" />
            <path d="M17 14c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2z" />
          </svg>
          <span>HUNT</span>
        </button>
        <button className="enc-action-btn" onClick={startBattle} aria-label="Battle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L4.5 13.5h6L9 22l9.5-12h-6L13 2z" />
          </svg>
          <span>BATTLE</span>
        </button>
      </div>
    </div>
  );
}
