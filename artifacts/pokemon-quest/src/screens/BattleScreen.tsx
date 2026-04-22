import { useEffect, useState } from "react";
import { useGame, speciesOf, OwnedPokemon, makePokemon } from "@/game/state";
import { Move, SPECIES, GYMS } from "@/game/data";
import Toast from "@/components/Toast";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function calcDamage(attacker: OwnedPokemon, move: Move) {
  const base = move.power + attacker.atk;
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance * 0.6));
}

export default function BattleScreen() {
  const { state, dispatch } = useGame();
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [showMoves, setShowMoves] = useState(false);

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

  const log = (lines: string[]) => dispatch({ type: "ADD_LOG", lines });

  const setBusy = (busy: boolean) => dispatch({ type: "PATCH_BATTLE", patch: { busy } });

  const endBattleAfter = async (outcome: "won" | "lost" | "fled" | "caught") => {
    dispatch({ type: "PATCH_BATTLE", patch: { outcome } });
    await sleep(900);
    if (outcome === "lost") {
      dispatch({ type: "TOAST", text: "You were defeated. Healed at PokéCenter." });
      dispatch({ type: "HEAL_ALL" });
    }
    dispatch({ type: "SET_BATTLE", battle: null });
    dispatch({ type: "SET_SCREEN", screen: battle.isGym && outcome === "won" ? "adventure" : "adventure" });
  };

  const handleEvolutionAndXp = async (xpGain: number) => {
    const before = state.team[0];
    if (!before) return;
    const beforeLevel = before.level;
    dispatch({ type: "GIVE_XP", xp: xpGain });
    log([`${playerSp.name} gained ${xpGain} XP!`]);
    await sleep(550);
    // Read updated value via setTimeout — in dispatch we can't read state.
    // Use a small trick: schedule check after state update by using setTimeout to next tick.
    setTimeout(() => {
      // We need to access the latest state via a new render cycle; use a custom check
      // by listening to team[0] level vs before level via a separate effect would be easier.
      // We'll do a simple inline by reading from window via a queued message.
    }, 0);
    // We'll handle level-up & evolution detection in an effect below.
    void beforeLevel;
  };

  // Detect level up & evolution
  useEffect(() => {
    if (!player || !battle || battle.outcome) return;
    const sp = SPECIES[player.speciesId];
    if (sp.evolvesAt && sp.evolvesTo && player.level >= sp.evolvesAt) {
      const targetId = sp.evolvesTo;
      const targetName = SPECIES[targetId].name;
      dispatch({ type: "ADD_LOG", lines: [`What? ${sp.name} is evolving!`, `${sp.name} evolved into ${targetName}!`] });
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
    log([`Enemy ${enemySp.name} used ${move.name}!`]);
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
      dispatch({ type: "PATCH_BATTLE", patch: { enemy: nextEnemy, enemyTeamRemaining: rest, turn: "player" } });
      return;
    }
    // Won the battle entirely
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
    setShowMoves(false);
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
      log([`Enemy ${enemySp.name} fainted!`]);
      const xpGain = enemySp.xpYield + enemy.level * 2;
      await handleEvolutionAndXp(xpGain);
      await sleep(400);
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
    setBusy(true);
    dispatch({ type: "SPEND_BALL" });
    log([`You threw a Pokéball at ${enemySp.name}!`]);
    await sleep(700);
    const hpFactor = 1 - enemy.hp / enemy.maxHp; // 0..1
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

  const onRun = async () => {
    if (battle.busy || battle.outcome) return;
    if (battle.isGym) {
      dispatch({ type: "TOAST", text: "Can't run from a Gym battle!" });
      return;
    }
    setBusy(true);
    log(["You fled the battle!"]);
    await sleep(500);
    await endBattleAfter("fled");
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />
      {/* Enemy */}
      <div className="pq-card p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <div className="font-bold truncate">{enemySp.name}</div>
            <div className="text-xs opacity-80">Lv. {enemy.level}</div>
          </div>
          <div className="text-[11px] opacity-75 mb-1">{enemySp.type.join(" / ")}</div>
          <div className="pq-hp-bar">
            <div className="pq-hp-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%`, background: enemy.hp / enemy.maxHp > 0.5 ? "#22c55e" : enemy.hp / enemy.maxHp > 0.2 ? "#facc15" : "#ef4444" }} />
          </div>
          <div className="text-[11px] opacity-80 mt-1">HP {enemy.hp}/{enemy.maxHp}</div>
        </div>
        <div
          className={`grid place-items-center rounded-xl w-20 h-20 text-5xl ${enemyShake ? "pq-shake" : ""}`}
          style={{ background: enemySp.color + "33", border: `2px solid ${enemySp.color}` }}
        >
          {enemySp.sprite}
        </div>
      </div>

      {/* Battlefield divider */}
      <div className="text-center text-xs opacity-60">— Battle —</div>

      {/* Player */}
      <div className="pq-card p-3 flex items-center gap-3">
        <div
          className={`grid place-items-center rounded-xl w-20 h-20 text-5xl ${playerShake ? "pq-shake" : ""}`}
          style={{ background: playerSp.color + "33", border: `2px solid ${playerSp.color}` }}
        >
          {playerSp.sprite}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <div className="font-bold truncate">{playerSp.name}</div>
            <div className="text-xs opacity-80">Lv. {player.level}</div>
          </div>
          <div className="text-[11px] opacity-75 mb-1">{playerSp.type.join(" / ")}</div>
          <div className="pq-hp-bar">
            <div className="pq-hp-fill" style={{ width: `${(player.hp / player.maxHp) * 100}%`, background: player.hp / player.maxHp > 0.5 ? "#22c55e" : player.hp / player.maxHp > 0.2 ? "#facc15" : "#ef4444" }} />
          </div>
          <div className="text-[11px] opacity-80 mt-1">HP {player.hp}/{player.maxHp}</div>
        </div>
      </div>

      {/* Log */}
      <div className="pq-card p-3 h-28 overflow-y-auto text-sm">
        {battle.log.slice(-6).map((l, i) => (
          <div key={i} className="opacity-90">{l}</div>
        ))}
      </div>

      {/* Actions */}
      {!showMoves ? (
        <div className="grid grid-cols-2 gap-2">
          <button className="pq-btn pq-btn-red" disabled={battle.busy || !!battle.outcome} onClick={() => setShowMoves(true)}>⚔ Fight</button>
          <button className="pq-btn pq-btn-yellow" disabled={battle.busy || !!battle.outcome || !!battle.isGym} onClick={onCatch}>⚪ Catch ({state.pokeballs})</button>
          <button className="pq-btn pq-btn-blue" disabled={battle.busy || !!battle.outcome || state.potions === 0 || player.hp >= player.maxHp} onClick={async () => {
            setBusy(true);
            dispatch({ type: "SPEND_POTION" });
            const heal = 25;
            const newHp = Math.min(player.maxHp, player.hp + heal);
            dispatch({ type: "PATCH_PLAYER_ACTIVE", patch: { hp: newHp } });
            log([`You used a Potion! +${newHp - player.hp} HP`]);
            await sleep(600);
            dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
            await enemyTurn();
          }}>🧪 Potion ({state.potions})</button>
          <button className="pq-btn pq-btn-gray" disabled={battle.busy || !!battle.outcome || !!battle.isGym} onClick={onRun}>🏃 Run</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {playerSp.moves.map((m) => (
            <button key={m.name} className="pq-btn pq-btn-red" disabled={battle.busy} onClick={() => onFight(m)}>
              {m.name}
              <span className="opacity-75 text-[11px] ml-1">{m.type}</span>
            </button>
          ))}
          <button className="pq-btn pq-btn-gray col-span-2" onClick={() => setShowMoves(false)}>← Back</button>
        </div>
      )}
    </div>
  );
}
