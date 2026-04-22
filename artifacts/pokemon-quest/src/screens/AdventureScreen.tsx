import { useGame, makePokemon, BattleState } from "@/game/state";
import { GYMS, LOCATIONS, SPECIES } from "@/game/data";
import PokemonCard from "@/components/PokemonCard";
import Toast from "@/components/Toast";

function pickEncounter(locId: string) {
  const loc = LOCATIONS.find((l) => l.id === locId)!;
  if (!loc.encounters.length) return null;
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

export default function AdventureScreen() {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;
  const active = state.team[0];
  const inTown = !!loc.isTown;
  const gym = loc.gymId ? GYMS.find((g) => g.id === loc.gymId) : undefined;

  const explore = () => {
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      return;
    }
    const enc = pickEncounter(loc.id);
    if (!enc) {
      dispatch({ type: "TOAST", text: "No wild Pokémon here." });
      return;
    }
    const enemy = makePokemon(enc.speciesId, enc.level);
    dispatch({ type: "SEE_POKEMON", speciesId: enc.speciesId });
    const battle: BattleState = {
      enemy,
      log: [`A wild ${SPECIES[enc.speciesId].name} appeared!`],
      busy: false,
      turn: "player",
    };
    dispatch({ type: "SET_BATTLE", battle });
    dispatch({ type: "LOG", lines: [`You explored ${loc.name}.`, `A wild ${SPECIES[enc.speciesId].name.toUpperCase()} appeared!`] });
    dispatch({ type: "SET_SCREEN", screen: "encounter" });
  };

  const goLoc = (id: string) => {
    dispatch({ type: "SET_LOCATION", id });
    const next = LOCATIONS.find((l) => l.id === id)!;
    dispatch({ type: "LOG", lines: [`You traveled to ${next.name}.`] });
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <Toast />
      <div className="pq-card p-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-orange-400/80">Trainer</div>
          <div className="font-bold text-slate-100">{state.trainerName || "Trainer"}</div>
        </div>
        <div className="flex gap-3 text-sm text-slate-200">
          <span title="Money">💰 {state.money}</span>
          <span title="Pokéballs">⚪ {state.pokeballs}</span>
          <span title="Potions">🧪 {state.potions}</span>
          <span title="Badges">🏅 {state.badges.length}</span>
        </div>
      </div>

      <div className="pq-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-orange-400/80">
              {inTown ? "Town" : "Route"}
            </div>
            <div className="font-bold text-slate-100">{loc.emoji} {loc.name}</div>
          </div>
          <select
            value={state.locationId}
            onChange={(e) => goLoc(e.target.value)}
            className="bg-slate-900/60 border border-orange-400/30 text-slate-100 rounded-lg px-2 py-1 text-sm"
          >
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id} className="text-slate-900">
                {l.emoji} {l.name}{l.isTown ? " 🏙" : ""}
              </option>
            ))}
          </select>
        </div>

        {inTown ? (
          <div className="grid grid-cols-2 gap-2">
            <button className="pq-btn pq-btn-secondary" onClick={() => { dispatch({ type: "LOG", lines: [`Entered ${loc.name} PokéCenter.`] }); dispatch({ type: "SET_SCREEN", screen: "center" }); }}>
              🏥 PokéCenter
            </button>
            <button className="pq-btn pq-btn-secondary" onClick={() => { dispatch({ type: "LOG", lines: [`Entered ${loc.name} PokéMart.`] }); dispatch({ type: "SET_SCREEN", screen: "mart" }); }}>
              🛒 PokéMart
            </button>
            {gym && (
              <button className="pq-btn pq-btn-amber col-span-2" onClick={() => { dispatch({ type: "LOG", lines: [`Approached ${gym.name}'s Gym.`] }); dispatch({ type: "SET_SCREEN", screen: "gym" }); }}>
                🏟 Challenge {gym.name}'s Gym
              </button>
            )}
          </div>
        ) : (
          <button className="pq-btn pq-btn-primary w-full" onClick={explore}>
            🌿 Explore — Find Wild Pokémon
          </button>
        )}
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-orange-400/80 mb-1 px-1">Your Team ({state.team.length}/6)</div>
        <div className="flex flex-col gap-2">
          {state.team.length === 0 && (
            <div className="pq-card p-4 text-sm text-center text-slate-300/80">No Pokémon in your team.</div>
          )}
          {state.team.map((p, i) => <PokemonCard key={p.uid} p={p} active={i === 0} />)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        <button className="pq-btn pq-btn-violet" onClick={() => dispatch({ type: "SET_SCREEN", screen: "pokedex" })}>
          📖 Pokédex
        </button>
        <button className="pq-btn pq-btn-ghost" onClick={() => dispatch({ type: "SET_SCREEN", screen: "card" })}>
          🚶 Follow
        </button>
        <button className="pq-btn pq-btn-ghost" onClick={() => dispatch({ type: "SET_SCREEN", screen: "settings" })}>
          ⚙ Settings
        </button>
      </div>

      <div className="text-[11px] text-slate-400 text-center px-2">
        Badges: {state.badges.length === 0 ? "none yet" : state.badges.join(" • ")}
      </div>
    </div>
  );
}
