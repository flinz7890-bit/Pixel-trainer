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

  const goBack = () => {
    dispatch({ type: "SET_BATTLE", battle: null });
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  const exploreAgain = () => {
    const active = state.team[0];
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      goBack();
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
    dispatch({ type: "TOAST", text: `A wild ${SPECIES[speciesId].name} appeared!` });
  };

  const startBattle = () => {
    const active = state.team[0];
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      return;
    }
    dispatch({ type: "SET_SCREEN", screen: "battle" });
  };

  return (
    <div className="pq-fade flex flex-col gap-4 py-3">
      <Toast />

      <div
        className="rounded-2xl p-5 border-4 relative overflow-hidden"
        style={{
          borderColor: "#0b1220",
          background:
            "radial-gradient(120% 80% at 50% 30%, #cfeed4 0%, #8fcf9f 35%, #3d8b56 75%, #1f4a2c 100%)",
          boxShadow: "inset 0 0 0 3px #1f3b27, 0 8px 24px rgba(0,0,0,0.45)",
          minHeight: 320,
        }}
      >
        <div className="font-pixel text-[10px] text-emerald-100 drop-shadow text-center mb-2">
          A WILD POKÉMON APPEARED!
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="gba-status" style={{ minWidth: 200 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="gba-name uppercase">{sp.name}</span>
                <span style={{ color: enemy.gender === "M" ? "#1d4ed8" : "#be185d", fontWeight: 800 }}>
                  {enemy.gender === "M" ? "♂" : "♀"}
                </span>
              </div>
              <div className="gba-lvl">:L{enemy.level}</div>
            </div>
            <div className="text-[12px] text-slate-700 mt-0.5">
              {sp.type.join(" / ")} • Catch {Math.round(sp.catchRate * 100)}%
            </div>
          </div>

          <div
            className={`gba-pixel-shadow ${shake ? "pq-shake" : "pq-pop"}`}
            style={{ marginTop: 8 }}
          >
            <div
              className="grid place-items-center rounded-full"
              style={{
                width: 150, height: 150,
                background: sp.color + "33",
                border: `4px solid ${sp.color}`,
                boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.5)",
              }}
            >
              <span style={{ fontSize: 110, lineHeight: 1 }}>{sp.sprite}</span>
            </div>
          </div>

          <div className="flex gap-2 text-emerald-50 font-pixel text-[10px] mt-2">
            <span>⚪ {state.pokeballs}</span>
            <span>•</span>
            <span>📍 {state.locationId}</span>
          </div>
        </div>
      </div>

      <div className="gba-dialog">A wild {sp.name.toUpperCase()} appeared! What will you do?</div>

      <div className="flex flex-col gap-3">
        <button
          className="pq-btn pq-btn-primary text-lg py-4"
          onClick={startBattle}
        >
          🎯 CAPTURE
        </button>
        <button
          className="pq-btn pq-btn-amber text-lg py-4"
          onClick={exploreAgain}
        >
          🔄 EXPLORE AGAIN
        </button>
        <button
          className="pq-btn pq-btn-rose text-lg py-4"
          onClick={goBack}
        >
          🏃 RUN
        </button>
      </div>
    </div>
  );
}
