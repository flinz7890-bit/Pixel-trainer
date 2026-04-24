import { useEffect } from "react";
import { useGame, makePokemon, BattleState, isLocationCleared } from "@/game/state";
import { GYMS, LOCATIONS, SPECIES, TrainerNPC } from "@/game/data";
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
  const dots = Array.from({ length: 18 });
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
            background: ["#4ade80", "#a855f7", "#22d3ee", "#facc15", "#f43f5e"][i % 5],
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
  const progress = state.routeProgress[loc.id] || { trainersDefeated: [], explored: false, cleared: false };
  const trainers = loc.trainers || [];
  const remainingTrainers = trainers
    .filter((t) => !progress.trainersDefeated.includes(t.id))
    .filter((t) => !t.requiresPrevTrainerId || progress.trainersDefeated.includes(t.requiresPrevTrainerId));
  const cleared = isLocationCleared(loc.id, state.routeProgress);
  const nextLoc = loc.nextLocationId ? LOCATIONS.find((l) => l.id === loc.nextLocationId) : undefined;
  const prevLoc = loc.prevLocationId ? LOCATIONS.find((l) => l.id === loc.prevLocationId) : undefined;

  // Auto-award arrival badge for terminal cities (e.g., Pewter)
  useEffect(() => {
    if (loc.arrivalBadge && !state.badges.includes(loc.arrivalBadge) && !state.visited[loc.id]) {
      dispatch({ type: "ADD_BADGE", badge: loc.arrivalBadge });
      dispatch({ type: "ADD_MONEY", amount: 500 });
      dispatch({ type: "MARK_VISITED", locationId: loc.id });
      dispatch({ type: "TOAST", text: `Earned ${loc.arrivalBadge}! +500₽` });
      const msg = loc.arrivalMessage || `You arrived at ${loc.name}!`;
      dispatch({ type: "LOG", lines: [msg] });
    } else if (!state.visited[loc.id]) {
      dispatch({ type: "MARK_VISITED", locationId: loc.id });
    }
  }, [loc.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    dispatch({ type: "MARK_EXPLORED", locationId: loc.id });
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

  const challengeTrainer = (t: TrainerNPC) => {
    if (!active || active.hp <= 0) {
      dispatch({ type: "TOAST", text: "Your Pokémon needs healing first!" });
      return;
    }
    if (state.team.every((p) => p.hp <= 0)) {
      dispatch({ type: "TOAST", text: "All your Pokémon have fainted!" });
      return;
    }
    const first = t.team[0];
    const enemy = makePokemon(first.speciesId, first.level);
    const rest = t.team.slice(1);
    const battle: BattleState = {
      enemy,
      log: [`${t.title} ${t.name} wants to battle!`, t.intro, `${t.title} sent out ${SPECIES[first.speciesId].name}!`],
      busy: false,
      turn: "player",
      isTrainer: true,
      trainerId: t.id,
      trainerLabel: `${t.title} ${t.name}`,
      reward: t.reward,
      enemyTeamRemaining: rest,
    };
    dispatch({ type: "SET_BATTLE", battle });
    dispatch({
      type: "LOG",
      lines: [`${t.title} ${t.name} challenged you!`, `"${t.intro}"`],
    });
    dispatch({ type: "SET_SCREEN", screen: "battle" });
  };

  const travelTo = (id: string) => {
    const next = LOCATIONS.find((l) => l.id === id)!;
    if (next.requiresBadges && state.badges.length < next.requiresBadges) {
      dispatch({ type: "TOAST", text: `Need ${next.requiresBadges} badges (have ${state.badges.length}).` });
      return;
    }
    dispatch({ type: "SET_LOCATION", id });
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
            <div className="font-bold" style={{ color: "#eab308" }}>{state.badges.length}</div>
          </div>
        </div>
      </div>

      {/* Team — horizontal scroll */}
      <div>
        <div className="flex items-center justify-between px-1 mb-1.5">
          <div
            className="text-[10px] font-mono-pq tracking-widest uppercase"
            style={{ color: "#4ade80" }}
          >
            Team ({state.team.length}/6)
          </div>
          <div className="text-[9px] font-mono-pq" style={{ color: "#71717a" }}>
            ← swipe →
          </div>
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1 px-0.5"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
        >
          {state.team.length === 0 && (
            <div className="pq-card p-4 text-sm text-center w-full" style={{ color: "#a1a1aa" }}>
              No Pokémon in your team.
            </div>
          )}
          {state.team.map((p, i) => (
            <div key={p.uid} style={{ scrollSnapAlign: "start" }}>
              <PokemonCard p={p} active={i === 0} compact showMenu index={i} total={state.team.length} />
            </div>
          ))}
        </div>
        {state.team.length > 1 && (
          <div className="text-[9px] font-mono-pq text-center mt-1" style={{ color: "#71717a" }}>
            Tap ⋯ on a card to view summary, set active, reorder, or release.
          </div>
        )}
        <div style={{ display: "none" }}>
        </div>
      </div>

      {/* Travel / Progression */}
      <div className="pq-card p-3 flex flex-col gap-2">
        <div
          className="text-[10px] font-mono-pq tracking-widest uppercase"
          style={{ color: "#22d3ee" }}
        >
          {inTown ? "Town Map" : "Route Progress"}
        </div>

        {/* Route progress detail */}
        {!inTown && (
          <div className="text-[11px] font-mono-pq" style={{ color: "#d4d4d8" }}>
            <div className="flex items-center justify-between">
              <span>
                Trainers: {trainers.length - remainingTrainers.length}/{trainers.length}
              </span>
              <span>{progress.explored ? "✓ explored" : "not explored"}</span>
            </div>
            <div className="mt-1 rounded-full overflow-hidden" style={{ height: 6, background: "#2a2a3a" }}>
              <div
                style={{
                  width: `${
                    ((trainers.length - remainingTrainers.length) / Math.max(1, trainers.length)) * 50 +
                    (progress.explored ? 50 : 0)
                  }%`,
                  height: "100%",
                  background: cleared ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#a855f7,#22d3ee)",
                  transition: "width .4s",
                }}
              />
            </div>
          </div>
        )}

        {/* Trainer challenges (routes only) */}
        {!inTown && remainingTrainers.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="text-[10px] font-mono-pq" style={{ color: "#facc15" }}>
              ⚔ TRAINER{remainingTrainers.length > 1 ? "S" : ""} ON THIS ROUTE
            </div>
            {remainingTrainers.map((t) => (
              <button
                key={t.id}
                onClick={() => challengeTrainer(t)}
                className="pq-card-2 flex items-center gap-3 p-2 text-left hover:brightness-110 transition"
                style={{ borderColor: "rgba(250,204,21,0.40)" }}
              >
                <div className="text-2xl">{t.sprite}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate" style={{ color: "#facc15" }}>
                    {t.title} {t.name}
                  </div>
                  <div className="text-[10px] font-mono-pq" style={{ color: "#a1a1aa" }}>
                    {t.team.length} Pokémon · ₽{t.reward}
                  </div>
                </div>
                <div className="text-[10px] font-mono-pq" style={{ color: "#facc15" }}>
                  CHALLENGE ▶
                </div>
              </button>
            ))}
          </div>
        )}

        {!inTown && remainingTrainers.length === 0 && trainers.length > 0 && (
          <div
            className="text-[11px] font-mono-pq mt-1"
            style={{ color: "#4ade80" }}
          >
            ✓ All trainers on this route defeated.
          </div>
        )}

        {/* Travel buttons */}
        <div className="flex flex-col gap-1.5 mt-1">
          {prevLoc && (
            <button className="pq-btn pq-btn-ghost" onClick={() => travelTo(prevLoc.id)}>
              ← Back to {prevLoc.name}
            </button>
          )}
          {nextLoc && (() => {
            const needBadges = nextLoc.requiresBadges || 0;
            const badgeOk = state.badges.length >= needBadges;
            const locked = (!inTown && !cleared) || !badgeOk;
            const label =
              !badgeOk ? `🔒 ${nextLoc.name} (${needBadges} badges required)` :
              (!inTown && !cleared) ? `🔒 ${nextLoc.name} (clear route first)` :
              inTown ? `▶ Travel to ${nextLoc.name}` : `▶ Continue to ${nextLoc.name}`;
            return (
              <button
                className="pq-btn pq-btn-primary"
                onClick={() => travelTo(nextLoc.id)}
                disabled={locked}
                title={locked ? "Locked" : undefined}
              >
                {label}
              </button>
            );
          })()}
          {!nextLoc && (
            <div
              className="text-[11px] text-center font-mono-pq"
              style={{ color: "#facc15" }}
            >
              ★ End of journey for now
            </div>
          )}
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
          <span className="icon c-cyan">🪪</span>
          <span className="label">Card</span>
        </button>

        <button className="hub-btn c-pink" onClick={() => goTo("pokedex")}>
          <span className="icon c-pink">⭐</span>
          <span className="label">Caught</span>
        </button>
        <button className="hub-btn c-blue" onClick={() => goTo("settings")}>
          <span className="icon c-blue">⚙</span>
          <span className="label">Settings</span>
        </button>
        <button className="hub-btn c-gold" onClick={() => goTo("card")}>
          <span className="icon c-gold">👤</span>
          <span className="label">Trainer</span>
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
