import { useEffect, useMemo, useState } from "react";
import { useGame, makePokemon, BattleState, isLocationCleared } from "@/game/state";
import { GYMS, LOCATIONS, SPECIES, TrainerNPC } from "@/game/data";
import { runRocketStoryFor } from "@/game/rocketStory";
import PokeSprite from "@/components/PokeSprite";
import Toast from "@/components/Toast";
import TrainerSprite, { spriteForRouteTrainer } from "@/components/TrainerSprite";
import { typeColor } from "@/components/TypeBadge";

const LOCATION_IMAGES: Record<string, string> = {
  "Pallet Town":    "https://archives.bulbagarden.net/media/upload/0/00/Pallet_Town_FRLG.png",
  "Route 1":        "https://archives.bulbagarden.net/media/upload/4/4c/Kanto_Route_1_Map.png",
  "Viridian City":  "https://archives.bulbagarden.net/media/upload/8/8d/Viridian_City_FRLG.png",
  "Route 2":        "https://archives.bulbagarden.net/media/upload/0/09/Kanto_Route_2_Map.png",
  "Pewter City":    "https://archives.bulbagarden.net/media/upload/e/e7/Pewter_City_FRLG.png",
  "Route 3":        "https://archives.bulbagarden.net/media/upload/8/80/Kanto_Route_3_Map.png",
  "Mt. Moon":       "https://archives.bulbagarden.net/media/upload/8/8a/Mt_Moon_1F_FRLG.png",
  "Route 4":        "https://archives.bulbagarden.net/media/upload/a/a8/Kanto_Route_4_Map.png",
  "Cerulean City":  "https://archives.bulbagarden.net/media/upload/5/53/Cerulean_City_FRLG.png",
  "Route 5":        "https://archives.bulbagarden.net/media/upload/4/45/Kanto_Route_5_Map.png",
  "Route 6":        "https://archives.bulbagarden.net/media/upload/4/45/Kanto_Route_5_Map.png",
  "Vermilion City": "https://archives.bulbagarden.net/media/upload/1/12/Vermilion_City_FRLG.png",
  "Route 7":        "https://archives.bulbagarden.net/media/upload/3/36/Kanto_Route_7_Map.png",
  "Route 8":        "https://archives.bulbagarden.net/media/upload/3/36/Kanto_Route_7_Map.png",
  "Lavender Town":  "https://archives.bulbagarden.net/media/upload/1/16/Lavender_Town_FRLG.png",
  "Route 9":        "https://archives.bulbagarden.net/media/upload/2/27/Kanto_Route_9_Map.png",
  "Route 10":       "https://archives.bulbagarden.net/media/upload/2/27/Kanto_Route_9_Map.png",
  "Celadon City":   "https://archives.bulbagarden.net/media/upload/a/a5/Celadon_City_FRLG.png",
  "Route 11":       "https://archives.bulbagarden.net/media/upload/0/05/Kanto_Route_13_Map.png",
  "Route 12":       "https://archives.bulbagarden.net/media/upload/0/05/Kanto_Route_13_Map.png",
  "Route 13":       "https://archives.bulbagarden.net/media/upload/0/05/Kanto_Route_13_Map.png",
  "Route 14":       "https://archives.bulbagarden.net/media/upload/0/05/Kanto_Route_13_Map.png",
  "Route 15":       "https://archives.bulbagarden.net/media/upload/0/05/Kanto_Route_13_Map.png",
  "Fuchsia City":   "https://archives.bulbagarden.net/media/upload/3/3b/Fuchsia_City_FRLG.png",
  "Route 19":       "https://archives.bulbagarden.net/media/upload/e/ed/Kanto_Route_19_Map.png",
  "Route 20":       "https://archives.bulbagarden.net/media/upload/e/ed/Kanto_Route_19_Map.png",
  "Cinnabar Island":"https://archives.bulbagarden.net/media/upload/3/31/Cinnabar_Island_FRLG.png",
  "Route 21":       "https://archives.bulbagarden.net/media/upload/e/ed/Kanto_Route_19_Map.png",
  "Route 22":       "https://archives.bulbagarden.net/media/upload/f/f8/Kanto_Route_22_Map.png",
  "Route 23":       "https://archives.bulbagarden.net/media/upload/f/f8/Kanto_Route_22_Map.png",
  "Indigo Plateau": "https://archives.bulbagarden.net/media/upload/6/6c/Indigo_Plateau_FRLG.png",
};

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

function shortMoney(n: number) {
  if (n >= 100000) return `${Math.floor(n / 1000)}k`;
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
function pad2(n: number) { return String(n).padStart(2, "0"); }

function dialogueFor(loc: ReturnType<typeof getLoc>, cleared: boolean, badges: number, hasGym: boolean): { speaker: string; text: string } {
  if (loc.isTown) {
    if (hasGym) return { speaker: "Prof. Oak", text: `Welcome to ${loc.name}!\nThe Gym Leader here awaits a worthy challenger.` };
    if (loc.id === "pallet") return { speaker: "Prof. Oak", text: `Your journey begins here in ${loc.name}.\nHead north when you're ready.` };
    return { speaker: "Prof. Oak", text: `Welcome to ${loc.name}.\nRest, restock, and head out when ready.` };
  }
  if (cleared) return { speaker: "Hiker", text: `${loc.name} is quiet now.\nMove on to the next area!` };
  if (badges === 0) return { speaker: "Prof. Oak", text: `Explore ${loc.name} and battle\nany trainers you find.` };
  return { speaker: "Trainer Tip", text: `Wild Pokémon roam ${loc.name}.\nKeep your team healthy!` };
}
function getLoc(id: string) { return LOCATIONS.find((l) => l.id === id)!; }

function CitySkyline({ isTown, locName, bgImage }: { isTown: boolean; locName: string; bgImage?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  // If a real-image background is configured AND it loads, render the photo
  // overlaid with a city-name badge. Otherwise fall back to the procedural
  // CSS skyline below.
  if (bgImage && !imgFailed) {
    return (
      <div className="ed-city-img-wrap ed-bg-image">
        <img
          src={bgImage}
          alt={locName}
          className="ed-bg-img"
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", borderRadius: "inherit" }}
          onError={() => setImgFailed(true)}
        />
        <div className="ed-bg-overlay" />
        <div className="ed-city-name-badge">
          <span className="pin">📍</span> {locName.toUpperCase()}
        </div>
      </div>
    );
  }
  return (
    <div className={`ed-city-img-wrap${isTown ? "" : " ed-day"}`}>
      <div className="ed-stars" />
      <div className="ed-aurora" />
      <div className="ed-moon" />
      <div className="ed-mountains-back">
        <div className="ed-mt" style={{ borderLeft: "55px solid transparent", borderRight: "55px solid transparent", borderBottom: `58px solid ${isTown ? "#091528" : "#5a8a4a"}`, marginLeft: 10 }} />
        <div className="ed-mt" style={{ borderLeft: "70px solid transparent", borderRight: "70px solid transparent", borderBottom: `72px solid ${isTown ? "#0b1a30" : "#4a7a3e"}`, marginLeft: -20 }} />
        <div className="ed-mt" style={{ borderLeft: "50px solid transparent", borderRight: "50px solid transparent", borderBottom: `52px solid ${isTown ? "#091528" : "#5a8a4a"}`, marginLeft: 40 }} />
        <div className="ed-mt" style={{ borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderBottom: `65px solid ${isTown ? "#0d1f38" : "#67a05a"}`, marginLeft: -10 }} />
      </div>
      {isTown && (
        <div className="ed-skyline">
          <div className="ed-bld ed-bld-tall" style={{ width: 18, height: 52 }} />
          <div className="ed-bld" style={{ width: 24, height: 64 }} />
          <div className="ed-bld ed-bld-tall" style={{ width: 14, height: 42 }} />
          <div className="ed-bld ed-bld-tall" style={{ width: 28, height: 70 }} />
          <div className="ed-bld" style={{ width: 16, height: 48 }} />
          <div style={{ flex: 1 }} />
          <div className="ed-bld" style={{ width: 16, height: 44 }} />
          <div className="ed-bld ed-bld-tall" style={{ width: 26, height: 68 }} />
          <div className="ed-bld" style={{ width: 20, height: 55 }} />
          <div className="ed-bld ed-bld-tall" style={{ width: 22, height: 60 }} />
          <div className="ed-bld" style={{ width: 14, height: 38 }} />
        </div>
      )}
      <div className="ed-ground" />
      <div className="ed-city-name-badge">
        <span className="pin">📍</span> {locName.toUpperCase()}
      </div>
    </div>
  );
}

export default function AdventureScreen() {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS.find((l) => l.id === state.locationId)!;
  const active = state.team[0];
  const inTown = !!loc.isTown;
  const gym = loc.gymId ? GYMS.find((g) => g.id === loc.gymId) : undefined;

  const progress = state.routeProgress[loc.id] || { trainersDefeated: [], explored: false, cleared: false };
  const trainers = loc.trainers || [];
  const remainingTrainers = trainers
    .filter((t) => !progress.trainersDefeated.includes(t.id))
    .filter((t) => !t.requiresPrevTrainerId || progress.trainersDefeated.includes(t.requiresPrevTrainerId));
  const cleared = isLocationCleared(loc.id, state.routeProgress);
  const nextLoc = loc.nextLocationId ? LOCATIONS.find((l) => l.id === loc.nextLocationId) : undefined;
  const prevLoc = loc.prevLocationId ? LOCATIONS.find((l) => l.id === loc.prevLocationId) : undefined;

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
    runRocketStoryFor(state, dispatch);
  }, [loc.id, state.badges.length, state.routeProgress[loc.id]?.cleared]); // eslint-disable-line react-hooks/exhaustive-deps

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
    dispatch({ type: "LOG", lines: [`You explored ${loc.name}.`, `A wild ${SPECIES[enc.speciesId].name.toUpperCase()} appeared!`] });
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
    const introTagged = t.isRocket ? `[Rocket] ${t.intro}` : t.intro;
    const battle: BattleState = {
      enemy,
      log: [`${t.title} ${t.name} wants to battle!`, introTagged, `${t.title} sent out ${SPECIES[first.speciesId].name}!`],
      busy: false,
      turn: "player",
      isTrainer: true,
      isRocket: !!t.isRocket,
      trainerId: t.id,
      trainerLabel: `${t.title} ${t.name}`,
      reward: t.reward,
      enemyTeamRemaining: rest,
    };
    dispatch({ type: "SET_BATTLE", battle });
    dispatch({ type: "LOG", lines: [
      t.isRocket ? `[Rocket] ${t.title} ${t.name} challenged you!` : `${t.title} ${t.name} challenged you!`,
      t.isRocket ? `[Rocket] "${t.intro}"` : `"${t.intro}"`,
    ]});
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

  const dlg = useMemo(() => dialogueFor(loc, cleared, state.badges.length, !!gym), [loc.id, cleared, state.badges.length, !!gym]);

  const slots = Array.from({ length: 6 });
  const balls = state.items?.pokeball ?? state.pokeballs ?? 0;
  const pots = state.items?.potion ?? state.potions ?? 0;

  const nextLocked = !nextLoc || (!inTown && !cleared) || (nextLoc && state.badges.length < (nextLoc.requiresBadges || 0));
  const travelLabel = nextLoc
    ? (state.badges.length < (nextLoc.requiresBadges || 0) ? `🔒 ${nextLoc.name}` :
       (!inTown && !cleared) ? `🔒 ${nextLoc.name}` :
       `▶ ${nextLoc.name}`)
    : "★ End";

  return (
    <div className="pq-fade flex flex-col gap-0 relative" style={{ paddingTop: 0 }}>
      <Toast />

      {/* TOP BAR */}
      <div className="ed-topbar">
        <div className="min-w-0">
          <div className="ed-game-title">POKÉMON — QUEST</div>
          <div className="ed-loc-line">
            <span style={{ color: "#f472b6", fontSize: 6 }}>●</span>
            KANTO <span className="sep">·</span> {loc.name} <span className="sep">·</span> {inTown ? "TOWN" : "ROUTE"}
          </div>
        </div>
        <div className="ed-coin-pill">
          <span style={{ fontSize: 12 }}>🪙</span> {state.money.toLocaleString()}
        </div>
      </div>

      {/* STAT ROW */}
      <div className="ed-stat-row">
        <div className="ed-stat-pill">
          <span className="s-label">₽ Money</span>
          <span className="s-value">{shortMoney(state.money)}</span>
        </div>
        <div className="ed-stat-pill">
          <span className="s-label">Balls</span>
          <span className="s-value">{pad2(balls)}</span>
        </div>
        <div className="ed-stat-pill">
          <span className="s-label">Pots</span>
          <span className="s-value">{pad2(pots)}</span>
        </div>
        <div className="ed-stat-pill">
          <span className="s-label">Badges</span>
          <span className="s-value" style={{ color: "#22d3ee", textShadow: "0 0 8px rgba(34,211,238,0.40)" }}>{pad2(state.badges.length)}</span>
        </div>
      </div>

      {/* CITY CARD */}
      <div className="ed-city-card">
        <CitySkyline isTown={inTown} locName={loc.name} bgImage={LOCATION_IMAGES[loc.name]} />
        <div className="ed-dialogue">
          <div className="speaker">{dlg.speaker}</div>
          <div className="text">
            {dlg.text.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
                {i === arr.length - 1 && <span className="ed-cursor" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* TEAM ROW */}
      <div className="ed-team-row">
        <span className="ed-team-label">Team:</span>
        {slots.map((_, i) => {
          const p = state.team[i];
          if (!p) return <div key={i} className="ed-sprite-slot empty">+</div>;
          const sp = SPECIES[p.speciesId];
          const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
          const hpColor = hpPct > 50 ? "#4ade80" : hpPct > 20 ? "#facc15" : "#f87171";
          const fainted = p.hp <= 0;
          return (
            <button
              key={p.uid}
              className={`ed-sprite-slot${i === 0 ? " active" : ""}${fainted ? " fainted" : ""}`}
              onClick={() => i !== 0 && dispatch({ type: "SWAP_ACTIVE", withIndex: i })}
              title={`${sp.name} Lv${p.level} · ${p.hp}/${p.maxHp} HP`}
            >
              <PokeSprite species={sp} size={40} />
              <div className="hp-strip">
                <span style={{ width: `${hpPct}%`, background: hpColor }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* TOWN MAP / ROUTE PROGRESS */}
      <div className="px-0">
        <div className="ed-section-label">{inTown ? "Town Map" : "Route Progress"}</div>

        {!inTown && (
          <div className="font-mono-pq text-[11px] mb-2" style={{ color: "#d4d4d8" }}>
            <div className="flex items-center justify-between">
              <span>Trainers: {trainers.length - remainingTrainers.length}/{trainers.length}</span>
              <span style={{ color: progress.explored ? "#4ade80" : "#71717a" }}>
                {progress.explored ? "✓ explored" : "not explored"}
              </span>
            </div>
            <div className="mt-1.5 rounded-full overflow-hidden" style={{ height: 6, background: "#2a2a3a" }}>
              <div style={{
                width: `${((trainers.length - remainingTrainers.length) / Math.max(1, trainers.length)) * 50 + (progress.explored ? 50 : 0)}%`,
                height: "100%",
                background: cleared ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#a855f7,#22d3ee)",
                transition: "width .4s",
              }} />
            </div>
          </div>
        )}

        {!inTown && remainingTrainers.length > 0 && (
          <div className="ed-trainer-list mb-2">
            <div className="font-mono-pq text-[10px]" style={{ color: "#facc15", letterSpacing: 1 }}>
              ⚔ TRAINER{remainingTrainers.length > 1 ? "S" : ""} ON THIS ROUTE
            </div>
            {remainingTrainers.map((t) => {
              const spriteUrl = spriteForRouteTrainer(`${t.title} ${t.name}`);
              return (
                <button key={t.id} onClick={() => challengeTrainer(t)} className="ed-trainer-row">
                  <div className="av">
                    <TrainerSprite url={spriteUrl || undefined} fallbackEmoji={t.sprite || "🧑"} size="sm" alt={t.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold truncate" style={{ color: "#facc15" }}>
                      {t.title} {t.name}
                    </div>
                    <div className="text-[10px] font-mono-pq" style={{ color: "#a1a1aa" }}>
                      {t.team.length} Pokémon · ₽{t.reward}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono-pq" style={{ color: "#facc15" }}>CHALLENGE ▶</div>
                </button>
              );
            })}
          </div>
        )}

        {!inTown && remainingTrainers.length === 0 && trainers.length > 0 && (
          <div className="font-mono-pq text-[11px] mb-2" style={{ color: "#4ade80" }}>
            ✓ All trainers on this route defeated.
          </div>
        )}

        <div className="ed-map-btns">
          <button className="ed-map-btn" disabled={!prevLoc} onClick={() => prevLoc && travelTo(prevLoc.id)}>
            ← BACK
          </button>
          <button className="ed-map-btn travel" disabled={nextLocked} onClick={() => nextLoc && travelTo(nextLoc.id)} title={nextLoc?.name}>
            {nextLoc ? "▶ TRAVEL" : "★ END"}
          </button>
          <button className="ed-map-btn fast" onClick={() => {
            if (!state.lastHealLocationId) {
              dispatch({ type: "TOAST", text: "Visit a Poké Center first to set fast-travel." });
              return;
            }
            const t = LOCATIONS.find((l) => l.id === state.lastHealLocationId);
            if (!t) return;
            dispatch({ type: "SET_LOCATION", id: t.id });
            dispatch({ type: "LOG", lines: [`Fast-traveled to ${t.name}.`] });
          }}>
            ⚡ FAST
          </button>
        </div>
        {nextLoc && (
          <div className="font-mono-pq text-[9px] text-center mt-1.5" style={{ color: "#71717a" }}>
            Next: {travelLabel}
          </div>
        )}
      </div>

      {/* ACTION GRID */}
      <div className="ed-section-label" style={{ paddingTop: 14 }}>Actions</div>
      <div className="ed-action-grid">
        <button className="ed-action-btn ed-act-hunt" onClick={explore} disabled={inTown} title={inTown ? "Leave town first" : "Hunt wild Pokémon"}>
          <span className="ico">🐲</span><span className="lbl">HUNT</span>
        </button>
        <button className="ed-action-btn ed-act-center" onClick={() => {
          if (!inTown) { dispatch({ type: "TOAST", text: "Find a town to visit the PokéCenter." }); return; }
          dispatch({ type: "LOG", lines: [`Entered ${loc.name} PokéCenter.`] });
          goTo("center");
        }}>
          <span className="ico">💗</span><span className="lbl">CENTER</span>
        </button>
        <button className="ed-action-btn ed-act-store" onClick={() => {
          if (!inTown) { dispatch({ type: "TOAST", text: "Find a town to visit the PokéMart." }); return; }
          dispatch({ type: "LOG", lines: [`Entered ${loc.name} PokéMart.`] });
          goTo("mart");
        }}>
          <span className="ico">🛒</span><span className="lbl">STORE</span>
        </button>
        <button className="ed-action-btn ed-act-dex" onClick={() => goTo("pokedex")}>
          <span className="ico">📖</span><span className="lbl">DEX</span>
        </button>
        <button className="ed-action-btn ed-act-gym" onClick={() => {
          if (!gym) { dispatch({ type: "TOAST", text: "No Gym in this location." }); return; }
          dispatch({ type: "LOG", lines: [`Approached ${gym.name}'s Gym.`] });
          goTo("gym");
        }} disabled={!gym}>
          <span className="ico">🏆</span><span className="lbl">GYM</span>
        </button>
        <button className="ed-action-btn ed-act-card" onClick={() => goTo("card")}>
          <span className="ico">🪪</span><span className="lbl">CARD</span>
        </button>
        <button className="ed-action-btn ed-act-pvp" onClick={() => goTo("pvp")}>
          <span className="ico">⚔</span><span className="lbl">PVP</span>
        </button>
        {active && (
          <button className="ed-action-btn ed-act-dex" onClick={() => dispatch({ type: "OPEN_SUMMARY", uid: active.uid })}>
            <span className="ico" style={{ color: typeColor(SPECIES[active.speciesId].type[0]) }}>★</span>
            <span className="lbl">SUMMARY</span>
          </button>
        )}
        <button className="ed-action-btn ed-act-center" onClick={() => goTo("settings")}>
          <span className="ico">⚙</span><span className="lbl">SETTINGS</span>
        </button>
      </div>

      <div className="font-mono-pq text-[10px] text-center px-2 mt-3" style={{ color: "#71717a" }}>
        BADGES: {state.badges.length === 0 ? "none yet" : state.badges.join(" • ")}
      </div>
    </div>
  );
}
