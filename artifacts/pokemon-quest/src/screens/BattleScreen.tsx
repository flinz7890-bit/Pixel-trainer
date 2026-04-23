import { useEffect, useState } from "react";
import { useGame, speciesOf, OwnedPokemon, makePokemon } from "@/game/state";
import { Move, SPECIES, GYMS, LOCATIONS, PokeType } from "@/game/data";
import Toast from "@/components/Toast";
import { typeColor } from "@/components/TypeBadge";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function calcDamage(attacker: OwnedPokemon, move: Move) {
  const base = move.power + attacker.atk;
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance * 0.6));
}

function HpBar({ p, big }: { p: OwnedPokemon; big?: boolean }) {
  const pct = Math.max(0, (p.hp / p.maxHp) * 100);
  const color =
    pct > 50 ? "linear-gradient(180deg, #4ade80, #22c55e)"
      : pct > 20 ? "linear-gradient(180deg, #fde68a, #f59e0b)"
        : "linear-gradient(180deg, #fca5a5, #ef4444)";
  return (
    <div className={big ? "wb-hp-track wb-hp-big" : "wb-hp-track"}>
      <div className="wb-hp-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function TypeChip({ t }: { t: PokeType }) {
  const c = typeColor(t);
  return (
    <span
      className="wb-typechip"
      style={{
        background: `${c}33`,
        border: `1px solid ${c}88`,
        color: c,
      }}
    >
      {t}
    </span>
  );
}

export default function BattleScreen() {
  const { state, dispatch } = useGame();
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [menu, setMenu] = useState<"main" | "switch" | "bag">("main");
  const [turnNum, setTurnNum] = useState(1);

  const player = state.team[0];
  const battle = state.battle;
  const loc = LOCATIONS.find((l) => l.id === state.locationId);

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
      dispatch({ type: "SET_BATTLE", battle: null });
      dispatch({ type: "SET_SCREEN", screen: "blackout" });
      return;
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
      await sleep(500);
      const team = state.team;
      const altIdx = team.findIndex((p, i) => i !== 0 && p.hp > 0);
      if (altIdx > 0) {
        const inName = speciesOf(team[altIdx]).name.toUpperCase();
        log([`Go! ${inName}!`]);
        dispatch({ type: "SWAP_ACTIVE", withIndex: altIdx });
        await sleep(700);
        setTurnNum((n) => n + 1);
        dispatch({ type: "PATCH_BATTLE", patch: { turn: "player", busy: false } });
        return;
      }
      await endBattleAfter("lost");
      return;
    }
    setTurnNum((n) => n + 1);
    dispatch({ type: "PATCH_BATTLE", patch: { turn: "player", busy: false } });
  };

  const handleNextEnemyOrEnd = async () => {
    const isMulti = battle.isGym || battle.isTrainer;
    if (isMulti && battle.enemyTeamRemaining && battle.enemyTeamRemaining.length > 0) {
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
    if (battle.isTrainer && battle.trainerId) {
      const reward = battle.reward || 0;
      if (reward > 0) dispatch({ type: "ADD_MONEY", amount: reward });
      dispatch({ type: "MARK_TRAINER_DEFEATED", locationId: state.locationId, trainerId: battle.trainerId });
      log([`You defeated ${battle.trainerLabel || "the Trainer"}!`, `You got ₽${reward} for winning!`]);
      dispatch({ type: "TOAST", text: `Defeated ${battle.trainerLabel || "Trainer"}! +${reward}₽` });
    }
    await endBattleAfter("won");
  };

  const onFight = async (move: Move) => {
    if (battle.busy || battle.turn !== "player" || battle.outcome) return;
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
    if (battle.isGym || battle.isTrainer) {
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
    if (battle.isGym || battle.isTrainer) {
      dispatch({ type: "TOAST", text: "Can't run from a Trainer battle!" });
      return;
    }
    setBusy(true);
    log(["Got away safely!"]);
    await sleep(500);
    await endBattleAfter("fled");
  };

  const exitBattle = () => {
    if (battle.isGym || battle.isTrainer) {
      dispatch({ type: "TOAST", text: "Can't escape this battle!" });
      return;
    }
    dispatch({ type: "SET_BATTLE", battle: null });
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  // Last meaningful message for the message panel
  const battleLines = battle.log.slice(-3);
  const headerLabel = battle.isGym
    ? "GYM BATTLE"
    : battle.isTrainer
      ? "TRAINER BATTLE"
      : "WILD BATTLE";

  return (
    <div className="pq-fade flex flex-col gap-3 py-2 select-none">
      <Toast />

      {/* Header bar */}
      <div className="wb-header">
        <div className="flex items-center gap-2">
          <button className="wb-close" onClick={exitBattle} aria-label="Close battle">×</button>
          <span className="wb-header-title">{headerLabel}</span>
        </div>
        <div className="wb-header-turn">Turn {turnNum}</div>
      </div>
      <div className="wb-divider" />

      {/* Arena card */}
      <div className="wb-arena">
        {/* Enemy row: stat box left, sprite right */}
        <div className="wb-enemy-row">
          <div className="wb-statcard">
            <div className="wb-statcard-row">
              <span className="wb-name">{enemySp.name}</span>
              <span className="wb-lvl">Lv{enemy.level}</span>
            </div>
            <div className="wb-types">
              {enemySp.type.map((t) => <TypeChip key={t} t={t} />)}
            </div>
            <div className="wb-hp-num">{enemy.hp}/{enemy.maxHp}</div>
            <HpBar p={enemy} big />
          </div>
          <div className={`wb-enemy-sprite ${enemyShake ? "pq-shake" : ""}`}>
            <span style={{
              fontSize: 92,
              lineHeight: 1,
              color: typeColor(enemySp.type[0]),
              filter: "drop-shadow(0 5px 0 rgba(0,0,0,0.45))",
            }}>
              {enemySp.sprite}
            </span>
          </div>
        </div>

        {/* Player row: sprite left, stat box right */}
        <div className="wb-player-row">
          <div className={`wb-player-sprite ${playerShake ? "pq-shake" : "pq-bob"}`}>
            <span style={{
              fontSize: 96,
              lineHeight: 1,
              filter: "drop-shadow(0 5px 0 rgba(0,0,0,0.45))",
            }}>
              {playerSp.sprite}
            </span>
          </div>
          <div className="wb-statcard">
            <div className="wb-statcard-row">
              <span className="wb-name">{playerSp.name}</span>
              <span className="wb-lvl">Lv{player.level}</span>
            </div>
            <HpBar p={player} big />
            <div className="wb-statcard-row wb-statcard-bottom">
              <span className="wb-hp-num">{player.hp}/{player.maxHp}</span>
              <span className="wb-atk">ATK:{player.atk}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message panel */}
      <div className="wb-msg">
        {battleLines.length === 0
          ? <span>. A wild {enemySp.name} (Lv{enemy.level}) appeared in {loc?.name || "the wild"}!</span>
          : battleLines.map((line, i) => (
            <div key={i}>· {line}</div>
          ))}
      </div>

      {/* Choose a move */}
      {menu === "main" && (
        <>
          <div className="wb-section-label">CHOOSE A MOVE</div>
          <div className="wb-moves">
            {playerSp.moves.map((m) => (
              <button
                key={m.name}
                className="wb-move-btn"
                disabled={battle.busy || !!battle.outcome}
                onClick={() => onFight(m)}
              >
                <div className="wb-move-name">{m.name}</div>
                <div className="wb-move-pwr">PWR: {m.power}</div>
              </button>
            ))}
          </div>

          <div className="wb-bottom-row">
            <button
              className="wb-bottom-btn"
              disabled={battle.busy || !!battle.outcome}
              onClick={() => setMenu("switch")}
            >
              Switch
            </button>
            <button
              className="wb-bottom-btn"
              disabled={battle.busy || !!battle.outcome || !!battle.isGym || !!battle.isTrainer}
              onClick={onRun}
            >
              Run
            </button>
            <button
              className="wb-bottom-btn"
              disabled={battle.busy || !!battle.outcome || !!battle.isGym || !!battle.isTrainer}
              onClick={onCatch}
            >
              Pokeballs
            </button>
          </div>
          {state.potions > 0 && (
            <button
              className="wb-bottom-btn wb-potion-btn"
              disabled={battle.busy || !!battle.outcome}
              onClick={onPotion}
            >
              Use Potion ×{state.potions}
            </button>
          )}
        </>
      )}

      {menu === "switch" && (
        <>
          <div className="wb-section-label">SWITCH POKÉMON</div>
          <div className="wb-moves">
            {state.team.map((p, i) => {
              const isActive = i === 0;
              const fainted = p.hp <= 0;
              const sp = speciesOf(p);
              return (
                <button
                  key={p.uid}
                  className="wb-move-btn"
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
                  <div className="wb-move-name">
                    <span style={{ marginRight: 6 }}>{sp.sprite}</span>
                    {sp.name}
                  </div>
                  <div className="wb-move-pwr">
                    Lv{p.level} · {p.hp}/{p.maxHp}{fainted ? " (KO)" : ""}{isActive ? " (active)" : ""}
                  </div>
                </button>
              );
            })}
          </div>
          <button className="wb-bottom-btn" onClick={() => setMenu("main")}>← Back</button>
        </>
      )}
    </div>
  );
}
