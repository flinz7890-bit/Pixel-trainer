import { useGame, makePokemon, BattleState } from "@/game/state";
import { LOCATIONS, GYMS, SPECIES } from "@/game/data";
import PokemonCard from "@/components/PokemonCard";
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

export default function AdventureScreen() {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;
  const active = state.team[0];

  const explore = () => {
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      return;
    }
    const { speciesId, level } = pickEncounter(loc.id);
    const enemy = makePokemon(speciesId, level);
    dispatch({ type: "SEE_POKEMON", speciesId });
    const battle: BattleState = {
      enemy,
      log: [`A wild ${SPECIES[speciesId].name} appeared!`],
      busy: false,
      turn: "player",
    };
    dispatch({ type: "SET_BATTLE", battle });
    dispatch({ type: "SET_SCREEN", screen: "battle" });
  };

  const goLoc = (id: string) => dispatch({ type: "SET_LOCATION", id });

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <Toast />
      <div className="pq-card p-3 flex items-center justify-between">
        <div>
          <div className="text-xs opacity-70">Trainer</div>
          <div className="font-bold">{state.trainerName || "Trainer"}</div>
        </div>
        <div className="flex gap-3 text-sm">
          <span title="Money">💰 {state.money}</span>
          <span title="Pokéballs">⚪ {state.pokeballs}</span>
          <span title="Potions">🧪 {state.potions}</span>
          <span title="Badges">🏅 {state.badges.length}</span>
        </div>
      </div>

      <div className="pq-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs opacity-70">Current Location</div>
            <div className="font-bold">{loc.emoji} {loc.name}</div>
          </div>
          <select
            value={state.locationId}
            onChange={(e) => goLoc(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm"
          >
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id} className="text-gray-900">
                {l.emoji} {l.name}
              </option>
            ))}
          </select>
        </div>
        <button className="pq-btn pq-btn-red w-full" onClick={explore}>
          🌿 Explore — Find Wild Pokémon
        </button>
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1 px-1">Your Team ({state.team.length}/6)</div>
        <div className="flex flex-col gap-2">
          {state.team.length === 0 && (
            <div className="pq-card p-4 text-sm text-center opacity-80">No Pokémon in your team.</div>
          )}
          {state.team.map((p) => <PokemonCard key={p.uid} p={p} />)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="pq-btn pq-btn-green" onClick={() => dispatch({ type: "SET_SCREEN", screen: "center" })}>
          🏥 PokéCenter
        </button>
        <button className="pq-btn pq-btn-blue" onClick={() => dispatch({ type: "SET_SCREEN", screen: "mart" })}>
          🛒 PokéMart
        </button>
        <button className="pq-btn pq-btn-yellow" onClick={() => dispatch({ type: "SET_SCREEN", screen: "gym" })}>
          🏟 Gym
        </button>
        <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "pokedex" })}>
          📖 Pokédex
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "settings" })}>
          ⚙ Settings
        </button>
        <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}>
          🏠 Home
        </button>
      </div>

      <div className="text-[11px] opacity-60 text-center px-2">
        Badges: {state.badges.length === 0 ? "none yet" : state.badges.join(" • ")}
      </div>
    </div>
  );
}
