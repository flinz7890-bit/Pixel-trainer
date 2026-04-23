import { useEffect, useState } from "react";
import { useGame, speciesOf, OwnedPokemon, makePokemon, xpToNext } from "@/game/state";
import { Move, SPECIES, GYMS, PokeType } from "@/game/data";
import Toast from "@/components/Toast";
import { typeColor } from "@/components/TypeBadge";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function calcDamage(attacker: OwnedPokemon, move: Move) {
  const base = move.power + attacker.atk;
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance * 0.6));
}

function GenderIcon({ g }: { g: "M" | "F" }) {
  return (
    <span style={{ color: g === "M" ? "#60a5fa" : "#f472b6", fontWeight: 800 }}>
      {g === "M" ? "♂" : "♀"}
    </span>
  );
}

function StatBox({
  p,
  side,
  showHpNumbers,
  showXp,
}: {
  p: OwnedPokemon;
  side: "enemy" | "player";
  showHpNumbers?: boolean;
  showXp?: boolean;
}) {
  const sp = speciesOf(p);
  const pct = Math.max(0, (p.hp / p.maxHp) * 100);
  const cls =
    side === "enemy"
      ? "enemy"
      : pct > 50
      ? ""
      : pct > 20
      ? "mid"
      : "low";
  return (
    <div className={`bt-statbox ${side}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="name uppercase">
          <span>{sp.name}</span>
          <GenderIcon g={p.gender} />
        </div>
        <div className="lvl">L{p.level}</div>
      </div>
      <div className="bt-hp-track">
        <div className={`bt-hp-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      {showHpNumbers && (
        <div className="bt-hp-num">
          {p.hp}/{p.maxHp}
        </div>
      )}
      {showXp && (
        <div className="bt-xp-track">
          <div
            className="bt-xp-fill"
            style={{ width: `${(p.xp / xpToNext(p.level)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function colorClass(line: string) {
  const l = line.toLowerCase();
  if (/(damage|fainted|hurt|hit|broke free)/.test(l)) return "dmg";
  if (/(potion|ball|received|caught|gained|heal|earned)/.test(l)) return "item";
  if (/(used|won|gotcha|begin|joined|evolved|appeared|safely)/.test(l)) return "ok";
  return "info";
}

export default function BattleScreen() {
  const { state, dispatch } = useGame();
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [menu, setMenu] = useState<"main" | "fight" | "bag" | "mon">("main");

  const player = state.team[0];
  const battle = state.battle;

  useEffect(() => {
    if (!battle || !player) {
      dispatch({ type: "SET_SCREEN", screen: "adventure" });
    }
  }, [battle, player, dispatch]);

  if (!battle || !player) return null;

  const enemy = battle.enemy;
  const playerSp = speciesOf(player);
  const enemySp = speciesOf(enemy);

  const log = (lines: string[]) => {
    dispatch({ type: "ADD_LOG", lines });
    dispatch({ type: "LOG", lines });
  };
  const setBusy = (busy: boolean) =>
    dispatch({ type: "PATCH_BATTLE", patch: { busy } });

  const endBattleAfter = async (outcome: "won" | "lost" | "fled" | "caught") => {
    dispatch({ type: "PATCH_BATTLE", patch: { outcome } });
    await sleep(900);
    if (outcome === "lost") {
      dispatch({ type: "TOAST", text: "You were defeated. Healed at PokéCenter." });
      dispatch({ type: "HEAL_ALL" });
    }
    dispatch({ type: "SET_BATTLE", battle: null });
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  useEffect(() => {
    if (!player || !battle || battle.outcome) return;
    const sp = SPECIES[player.speciesId];
    if (sp.evolvesAt && sp.evolvesTo && player.level >= sp.evolvesAt) {
      const targetId = sp.evolvesTo;
      const targetName = SPECIES[targetId].name;
      dispatch({
        type: "ADD_LOG",
        lines: [`What? ${sp.name} is evolving!`, `${sp.name} evolved into ${targetName}!`],
      });
      dispatch({ type: "EVOLVE_ACTIVE", toSpeciesId: targetId });
      dispatch({ type: "TOAST", text: `${sp.name} evolved into ${targetName}!` });
    }
  }, [player?.speciesId, player?.level]); // eslint-disable-line react-hooks/exhaustive-deps

  const enemyTurn = async () => {
    if (battle.outcome) return;
    setBusy(true);
    await sleep(700);
    const move = enemySp.moves[Math.floor(Math.random() * enemySp.moves.length)];
    const dmg = calcDamage(enemy, move);
    log([`Foe ${enemySp.name} used ${move.name}!`]);
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 500);
    await sleep(350);
    const newHp = Math.max(0, player.hp - dmg);
    dispatch({ type: "PATCH_PLAYER_ACTIVE", patch: { hp: newHp } });
    log([`It dealt ${dmg} damage!`]);
    await sleep(550);
    if (newHp <= 0) {
      log([`${playerSp.name} fainted!`]);
      await endBattleAfter("lost");
      return;
    }
    dispatch({ type: "PATCH_BATTLE", patch: { turn: "player", busy: false } });
  };

  const handleNextEnemyOrEnd = async () => {
    if (battle.isGym && battle.enemyTeamRemaining && battle.enemyTeamRemaining.length > 0) {
      const next = battle.enemyTeamRemaining[0];
      const rest = battle.enemyTeamRemaining.slice(1);
      const nextEnemy = makePokemon(next.speciesId, next.level);
      log([`${SPECIES[next.speciesId].name} was sent out!`]);
      dispatch({
        type: "PATCH_BATTLE",
        patch: { enemy: nextEnemy, enemyTeamRemaining: rest, turn: "player", busy: false },
      });
      return;
    }
    if (battle.isGym && battle.gymId) {
      const gym = GYMS.find((g) => g.id === battle.gymId)!;
      dispatch({ type: "ADD_BADGE", badge: gym.badge });
      dispatch({ type: "ADD_MONEY", amount: gym.reward });
      dispatch({ type: "TOAST", text: `Earned ${gym.badge}! +${gym.reward}₽` });
    }
    await endBattleAfter("won");
  };

  const onFight = async (move: Move) => {
    if (battle.busy || battle.turn !== "player" || battle.outcome) return;
    setMenu("main");
    setBusy(true);
    log([`${playerSp.name} used ${move.name}!`]);
    setEnemyShake(true);
    setTimeout(() => setEnemyShake(false), 500);
    await sleep(350);
    const dmg = calcDamage(player, move);
    const newEnemyHp = Math.max(0, enemy.hp - dmg);
    dispatch({ type: "PATCH_BATTLE", patch: { enemy: { ...enemy, hp: newEnemyHp } } });
    log([`It dealt ${dmg} damage!`]);
    await sleep(550);
    if (newEnemyHp <= 0) {
      log([`Foe ${enemySp.name} fainted!`]);
      const xpGain = enemySp.xpYield + enemy.level * 2;
      dispatch({ type: "GIVE_XP", xp: xpGain });
      log([`${playerSp.name} gained ${xpGain} XP!`]);
      await sleep(700);
      await handleNextEnemyOrEnd();
      return;
    }
    dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
    await enemyTurn();
  };

  const onCatch = async () => {
    if (battle.busy || battle.outcome) return;
    if (battle.isGym) {
      dispatch({ type: "TOAST", text: "You can't catch a Trainer's Pokémon!" });
      return;
    }
    if (state.pokeballs <= 0) {
      dispatch({ type: "TOAST", text: "No Pokéballs left!" });
      return;
    }
    setMenu("main");
    setBusy(true);
    dispatch({ type: "SPEND_BALL" });
    log([`You threw a Pokéball at ${enemySp.name}!`]);
    await sleep(700);
    const hpFactor = 1 - enemy.hp / enemy.maxHp;
    const chance = Math.min(0.95, enemySp.catchRate * (0.4 + hpFactor * 0.85));
    const success = Math.random() < chance;
    if (success) {
      log([`Gotcha! ${enemySp.name} was caught!`]);
      dispatch({ type: "CATCH_POKEMON", speciesId: enemy.speciesId });
      const captured = { ...enemy };
      dispatch({ type: "ADD_TO_TEAM", pokemon: captured });
      dispatch({ type: "TOAST", text: `Caught ${enemySp.name}!` });
      await endBattleAfter("caught");
    } else {
      log([`Oh no! The ${enemySp.name} broke free!`]);
      dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
      await enemyTurn();
    }
  };

  const onPotion = async () => {
    if (battle.busy || battle.outcome) return;
    if (state.potions === 0 || player.hp >= player.maxHp) {
      dispatch({
        type: "TOAST",
        text: state.potions === 0 ? "No Potions!" : "HP is already full.",
      });
      return;
    }
    setMenu("main");
    setBusy(true);
    dispatch({ type: "SPEND_POTION" });
    const heal = 25;
    const newHp = Math.min(player.maxHp, player.hp + heal);
    dispatch({ type: "PATCH_PLAYER_ACTIVE", patch: { hp: newHp } });
    log([`You used a Potion! +${newHp - player.hp} HP`]);
    await sleep(600);
    dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
    await enemyTurn();
  };

  const onRun = async () => {
    if (battle.busy || battle.outcome) return;
    if (battle.isGym) {
      dispatch({ type: "TOAST", text: "Can't run from a Gym battle!" });
      return;
    }
    setMenu("main");
    setBusy(true);
    log(["Got away safely!"]);
    await sleep(500);
    await endBattleAfter("fled");
  };

  const dialogText = battle.busy
    ? battle.log[battle.log.length - 1] || ""
    : `What will ${playerSp.name.toUpperCase()} do?`;

  const battleLines = battle.log.slice(-12);
  const turnLabel = battle.turn === "player" ? "YOUR TURN" : "ENEMY TURN";

  return (
    <div className="pq-fade flex flex-col gap-3 py-2 select-none">
      <Toast />

      {/* Turn indicator */}
      <div className="flex items-center justify-between px-1">
        <div
          className="font-mono-pq text-[10px] tracking-[.18em] uppercase px-2 py-1 rounded-full"
          style={{
            background:
              battle.turn === "player" ? "rgba(74,222,128,0.14)" : "rgba(244,63,94,0.14)",
            color: battle.turn === "player" ? "#4ade80" : "#f43f5e",
            border:
              battle.turn === "player"
                ? "1px solid rgba(74,222,128,0.40)"
                : "1px solid rgba(244,63,94,0.40)",
          }}
        >
          ▶ {turnLabel}
        </div>
        {battle.isGym && (
          <div
            className="font-mono-pq text-[10px] tracking-widest uppercase px-2 py-1 rounded-full"
            style={{
              background: "rgba(250,204,21,0.14)",
              color: "#facc15",
              border: "1px solid rgba(250,204,21,0.40)",
            }}
          >
            🏟 GYM BATTLE
          </div>
        )}
      </div>

      {/* Battle arena */}
      <div className="bt-arena bt-scanlines">
        {/* Enemy stat box: top-left */}
        <div className="absolute left-3 top-3 z-20 pq-slide-in-right">
          <StatBox p={enemy} side="enemy" />
        </div>

        {/* Enemy sprite: top-right */}
        <div
          className="absolute right-5 top-[24%] z-10 pq-slide-in-right"
          style={{ width: 130 }}
        >
          <div
            className="bt-platform"
            style={{ width: 160, height: 30, left: -15, bottom: -18, position: "absolute" }}
          />
          <div className={`relative ${enemyShake ? "pq-shake" : ""}`}>
            <span
              className="bt-sprite"
              style={{
                display: "block",
                textAlign: "center",
                color: typeColor((enemySp.type[0] as PokeType) || "Normal"),
              }}
            >
              {enemySp.sprite}
            </span>
          </div>
        </div>

        {/* Player sprite: bottom-left */}
        <div className="absolute left-5 bottom-[10%] z-10" style={{ width: 160 }}>
          <div
            className="bt-platform"
            style={{ width: 190, height: 34, left: -15, bottom: -20, position: "absolute" }}
          />
          <div className={`relative ${playerShake ? "pq-shake" : "pq-bob"}`}>
            <span
              className="bt-sprite-back"
              style={{ display: "block", textAlign: "center" }}
            >
              {playerSp.sprite}
            </span>
          </div>
        </div>

        {/* Player stat box: bottom-right */}
        <div className="absolute right-3 bottom-3 z-20">
          <StatBox p={player} side="player" showHpNumbers showXp />
        </div>
      </div>

      {/* Dialog */}
      <div className="bt-dialog">
        <span>
          {dialogText}
          {!battle.busy && <span className="pq-cursor">▍</span>}
        </span>
      </div>

      {/* Action menu */}
      <div>
        {menu === "main" && (
          <div className="bt-menu-grid">
            <button
              className="bt-menu-btn bt-menu-fight"
              disabled={battle.busy || !!battle.outcome}
              onClick={() => setMenu("fight")}
            >
              ⚔ Fight
            </button>
            <button
              className="bt-menu-btn bt-menu-bag"
              disabled={battle.busy || !!battle.outcome}
              onClick={() => setMenu("bag")}
            >
              🎒 Bag
            </button>
            <button
              className="bt-menu-btn bt-menu-mon"
              disabled={battle.busy || !!battle.outcome}
              onClick={() => setMenu("mon")}
            >
              🐾 Monster
            </button>
            <button
              className="bt-menu-btn bt-menu-run"
              disabled={battle.busy || !!battle.outcome || !!battle.isGym}
              onClick={onRun}
            >
              🏃 Run
            </button>
          </div>
        )}
        {menu === "mon" && (
          <div className="bt-menu-grid">
            {state.team.map((p, i) => {
              const isActive = i === 0;
              const fainted = p.hp <= 0;
              const sp = speciesOf(p);
              const tc = typeColor(sp.type[0]);
              return (
                <button
                  key={p.uid}
                  className="bt-menu-btn"
                  style={{
                    borderColor: isActive ? tc : undefined,
                    color: isActive ? tc : undefined,
                    boxShadow: isActive ? `inset 0 0 0 1px ${tc}55, 0 0 18px ${tc}30` : undefined,
                  }}
                  disabled={battle.busy || isActive || fainted}
                  onClick={async () => {
                    if (battle.busy || isActive || fainted) return;
                    setMenu("main");
                    setBusy(true);
                    const outName = speciesOf(state.team[0]).name.toUpperCase();
                    const inName = speciesOf(p).name.toUpperCase();
                    log([`${outName}, come back!`, `Go! ${inName}!`]);
                    dispatch({ type: "SWAP_ACTIVE", withIndex: i });
                    await sleep(800);
                    dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
                    await enemyTurn();
                  }}
                >
                  <span style={{ fontSize: 18, marginRight: 6 }}>{sp.sprite}</span>
                  {sp.name.toUpperCase()} L{p.level}
                  {fainted ? " (KO)" : ""}
                </button>
              );
            })}
            <button
              className="bt-menu-btn bt-menu-back col-span-2"
              onClick={() => setMenu("main")}
            >
              ← Back
            </button>
          </div>
        )}
        {menu === "fight" && (
          <div className="bt-menu-grid">
            {playerSp.moves.map((m) => {
              const tc = typeColor(m.type as PokeType);
              return (
                <button
                  key={m.name}
                  className="bt-menu-btn"
                  style={{
                    borderColor: `${tc}88`,
                    color: tc,
                    boxShadow: `inset 0 0 0 1px ${tc}33, 0 0 14px ${tc}22`,
                  }}
                  disabled={battle.busy}
                  onClick={() => onFight(m)}
                >
                  <div className="flex flex-col items-center">
                    <span>{m.name}</span>
                    <span
                      className="text-[10px] mt-1 font-mono-pq"
                      style={{ color: "#a1a1aa" }}
                    >
                      {m.type.toUpperCase()} · PWR {m.power} · PP ∞
                    </span>
                  </div>
                </button>
              );
            })}
            <button
              className="bt-menu-btn bt-menu-back col-span-2"
              onClick={() => setMenu("main")}
            >
              ← Back
            </button>
          </div>
        )}
        {menu === "bag" && (
          <div className="bt-menu-grid">
            <button
              className="bt-menu-btn bt-menu-bag"
              disabled={battle.busy}
              onClick={onPotion}
            >
              🧪 Potion ×{state.potions}
            </button>
            <button
              className="bt-menu-btn bt-menu-bag"
              disabled={battle.busy || !!battle.isGym}
              onClick={onCatch}
            >
              ⚪ Poké Ball ×{state.pokeballs}
            </button>
            <button
              className="bt-menu-btn bt-menu-back col-span-2"
              onClick={() => setMenu("main")}
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      {/* Battle command log */}
      <div className="cmd-log">
        <div className="font-mono-pq text-[10px] tracking-[.18em] uppercase mb-1.5" style={{ color: "#4ade80" }}>
          ▾ battle_log
        </div>
        {battleLines.length === 0 && <div className="empty">Waiting for action...</div>}
        {battleLines.map((line, i) => (
          <div key={i} className="row">
            <span className="prefix">&gt;</span>
            <span className={colorClass(line)}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
