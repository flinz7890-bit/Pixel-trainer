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

function Particles() {
  const dots = Array.from({ length: 20 });
  return (
    <div className="particles">
      {dots.map((_, i) => (
        <span
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            background:
              ["#4ade80", "#a855f7", "#22d3ee", "#facc15", "#f43f5e"][i % 5],
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

export default function AdventureScreen() {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;
  const active = state.team[0];
  const inTown = !!loc.isTown;
  const gym = loc.gymId ? GYMS.find((g) => g.id === loc.gymId) : undefined;

  const totalCaught = Object.values(state.pokedex).filter((e) => e.caught).length;

  const explore = () => {
    if (inTown) {
      dispatch({ type: "TOAST", text: "Leave town to find wild Pokémon." });
      return;
    }
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
    dispatch({
      type: "LOG",
      lines: [
        `You explored ${loc.name}.`,
        `A wild ${SPECIES[enc.speciesId].name.toUpperCase()} appeared!`,
      ],
    });
    dispatch({ type: "SET_SCREEN", screen: "encounter" });
  };

  const goLoc = (id: string) => {
    dispatch({ type: "SET_LOCATION", id });
    const next = LOCATIONS.find((l) => l.id === id)!;
    dispatch({ type: "LOG", lines: [`You traveled to ${next.name}.`] });
  };

  const goTo = (screen: any) => dispatch({ type: "SET_SCREEN", screen });

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 relative">
      <Toast />

      {/* Header */}
      <div className="pq-card relative overflow-hidden p-3">
        <Particles />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div
              className="font-pixel text-[14px] sm:text-[16px] truncate"
              style={{
                background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 60%,#be123c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 0 18px rgba(244,63,94,0.30)",
              }}
            >
              POKÉMON — QUEST
            </div>
            <div className="text-[11px] mt-1 font-mono-pq" style={{ color: "#a1a1aa" }}>
              <span style={{ color: "#22d3ee" }}>KANTO</span> · {loc.emoji} {loc.name}
              {inTown ? " · TOWN" : " · ROUTE"}
            </div>
          </div>
          <div
            className="shrink-0 grid place-items-center px-3 py-1.5 rounded-full font-mono-pq text-[11px] font-bold"
            style={{
              background: "linear-gradient(180deg,#facc15,#eab308)",
              color: "#3b1d00",
              boxShadow: "0 0 18px rgba(250,204,21,0.40)",
            }}
            title="Caught"
          >
            ⓒ {totalCaught}
          </div>
        </div>

        <div
          className="relative grid grid-cols-4 gap-2 mt-3 text-[11px] font-mono-pq"
          style={{ color: "#d4d4d8" }}
        >
          <div className="pq-card-2 px-2 py-1.5 text-center">
            <div style={{ color: "#71717a" }} className="text-[9px] uppercase">₽</div>
            <div className="font-bold" style={{ color: "#facc15" }}>{state.money}</div>
          </div>
          <div className="pq-card-2 px-2 py-1.5 text-center">
            <div style={{ color: "#71717a" }} className="text-[9px] uppercase">Balls</div>
            <div className="font-bold">{state.pokeballs}</div>
          </div>
          <div className="pq-card-2 px-2 py-1.5 text-center">
            <div style={{ color: "#71717a" }} className="text-[9px] uppercase">Potions</div>
            <div className="font-bold">{state.potions}</div>
          </div>
          <div className="pq-card-2 px-2 py-1.5 text-center">
            <div style={{ color: "#71717a" }} className="text-[9px] uppercase">Badges</div>
            <div className="font-bold" style={{ color: "#eab308" }}>{state.badges.length}/8</div>
          </div>
        </div>
      </div>

      {/* Region selector */}
      <div className="pq-card p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono-pq tracking-widest uppercase" style={{ color: "#22d3ee" }}>
            Current Region
          </div>
          <select
            value={state.locationId}
            onChange={(e) => goLoc(e.target.value)}
            className="font-mono-pq text-[12px] rounded-lg px-2 py-1 outline-none"
            style={{
              background: "var(--panel-3)",
              border: "1px solid var(--border-2)",
              color: "var(--text)",
            }}
          >
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.emoji} {l.name}
                {l.isTown ? " 🏙" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team */}
      <div>
        <div
          className="text-[10px] font-mono-pq tracking-widest uppercase mb-1.5 px-1"
          style={{ color: "#4ade80" }}
        >
          Your Team ({state.team.length}/6)
        </div>
        <div className="flex flex-col gap-2">
          {state.team.length === 0 && (
            <div className="pq-card p-4 text-sm text-center" style={{ color: "#a1a1aa" }}>
              No Pokémon in your team.
            </div>
          )}
          {state.team.map((p, i) => (
            <PokemonCard key={p.uid} p={p} active={i === 0} />
          ))}
        </div>
      </div>

      {/* 3x3 nav grid */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        <button
          className="hub-btn c-green"
          onClick={explore}
          disabled={inTown}
          title={inTown ? "Leave town first" : "Hunt wild Pokémon"}
        >
          <span className="icon c-green">🌿</span>
          <span className="label">Hunt</span>
        </button>
        <button
          className="hub-btn c-pink"
          onClick={() => {
            if (!inTown) {
              dispatch({ type: "TOAST", text: "Find a town to visit the PokéCenter." });
              return;
            }
            dispatch({ type: "LOG", lines: [`Entered ${loc.name} PokéCenter.`] });
            goTo("center");
          }}
        >
          <span className="icon c-pink">🏥</span>
          <span className="label">Center</span>
        </button>
        <button
          className="hub-btn c-orange"
          onClick={() => {
            if (!inTown) {
              dispatch({ type: "TOAST", text: "Find a town to visit the PokéMart." });
              return;
            }
            dispatch({ type: "LOG", lines: [`Entered ${loc.name} PokéMart.`] });
            goTo("mart");
          }}
        >
          <span className="icon c-orange">🛒</span>
          <span className="label">Store</span>
        </button>

        <button className="hub-btn c-purple" onClick={() => goTo("pokedex")}>
          <span className="icon c-purple">📖</span>
          <span className="label">Dex</span>
        </button>
        <button
          className="hub-btn c-yellow"
          onClick={() => {
            if (!gym) {
              dispatch({ type: "TOAST", text: "No Gym in this location." });
              return;
            }
            dispatch({ type: "LOG", lines: [`Approached ${gym.name}'s Gym.`] });
            goTo("gym");
          }}
          disabled={!gym}
        >
          <span className="icon c-yellow">🏟</span>
          <span className="label">Gym</span>
        </button>
        <button className="hub-btn c-cyan" onClick={() => goTo("card")}>
          <span className="icon c-cyan">🚶</span>
          <span className="label">Walk</span>
        </button>

        <button className="hub-btn c-pink" onClick={() => goTo("card")}>
          <span className="icon c-pink">🪪</span>
          <span className="label">Card</span>
        </button>
        <button className="hub-btn c-gold" onClick={() => goTo("pokedex")}>
          <span className="icon c-gold">⭐</span>
          <span className="label">Caught</span>
        </button>
        <button className="hub-btn c-blue" onClick={() => goTo("settings")}>
          <span className="icon c-blue">⚙</span>
          <span className="label">Settings</span>
        </button>
      </div>

      <div
        className="text-[10px] font-mono-pq text-center px-2 mt-1"
        style={{ color: "#71717a" }}
      >
        BADGES: {state.badges.length === 0 ? "none yet" : state.badges.join(" • ")}
      </div>
    </div>
  );
}
