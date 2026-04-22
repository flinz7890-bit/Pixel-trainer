import { useEffect, useState } from "react";
import { useGame, speciesOf, OwnedPokemon, makePokemon, xpToNext } from "@/game/state";
import { Move, SPECIES, GYMS } from "@/game/data";
import Toast from "@/components/Toast";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function calcDamage(attacker: OwnedPokemon, move: Move) {
  const base = move.power + attacker.atk;
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance * 0.6));
}

function HpDisplay({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  const cls = pct > 50 ? "" : pct > 20 ? "mid" : "low";
  return (
    <div className="gba-hp-track w-full">
      <div className={`gba-hp-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function GenderIcon({ g }: { g: "M" | "F" }) {
  return (
    <span style={{ color: g === "M" ? "#1d4ed8" : "#be185d", fontWeight: 800 }}>
      {g === "M" ? "♂" : "♀"}
    </span>
  );
}

function StatusBox({
  p, showHpNumbers, showXp,
}: {
  p: OwnedPokemon; showHpNumbers?: boolean; showXp?: boolean;
}) {
  const sp = speciesOf(p);
  return (
    <div className="gba-status">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="gba-name uppercase">{sp.name}</span>
          <GenderIcon g={p.gender} />
        </div>
        <div className="gba-lvl">:L{p.level}</div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[12px] font-bold text-yellow-700">HP</span>
        <HpDisplay hp={p.hp} max={p.maxHp} />
      </div>
      {showHpNumbers && (
        <div className="text-right text-[14px] mt-0.5 leading-none">{p.hp}/{p.maxHp}</div>
      )}
      {showXp && (
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-800">EXP</span>
            <div className="gba-xp-track flex-1">
              <div className="gba-xp-fill" style={{ width: `${(p.xp / xpToNext(p.level)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BattleScreen() {
  const { state, dispatch } = useGame();
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [menu, setMenu] = useState<"main" | "fight" | "bag">("main");

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
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  // Detect evolution after level up
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
      dispatch({ type: "PATCH_BATTLE", patch: { enemy: nextEnemy, enemyTeamRemaining: rest, turn: "player", busy: false } });
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
      dispatch({ type: "TOAST", text: state.potions === 0 ? "No Potions!" : "HP is already full." });
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
    ? (battle.log[battle.log.length - 1] || "")
    : `What will ${playerSp.name.toUpperCase()} do?`;

  return (
    <div className="pq-fade flex flex-col gap-3 py-2 select-none">
      <Toast />

      <div className="gba-screen" style={{ aspectRatio: "3 / 2", minHeight: 320 }}>
        {/* Background platforms */}
        <div className="gba-platform" style={{ width: 130, height: 28, top: "26%", right: "8%" }} />
        <div className="gba-platform" style={{ width: 160, height: 32, bottom: "18%", left: "6%" }} />

        {/* Top: enemy status (left) + sprite (right) */}
        <div className="absolute left-3 top-3 right-3 flex items-start justify-between">
          <StatusBox p={enemy} />
          <div
            className={`gba-pixel-shadow ${enemyShake ? "pq-shake" : ""}`}
            style={{ marginRight: 6, marginTop: 2 }}
          >
            <div
              className="grid place-items-center rounded-full"
              style={{
                width: 92, height: 92,
                background: enemySp.color + "33",
                border: `3px solid ${enemySp.color}`,
                boxShadow: `inset 0 0 0 3px rgba(255,255,255,0.5)`,
              }}
            >
              <span className="gba-sprite-emoji">{enemySp.sprite}</span>
            </div>
          </div>
        </div>

        {/* Bottom: player sprite (left) + status (right) */}
        <div className="absolute left-3 bottom-3 right-3 flex items-end justify-between">
          <div
            className={`gba-pixel-shadow ${playerShake ? "pq-shake" : ""}`}
            style={{ marginBottom: 4 }}
          >
            <div
              className="grid place-items-center rounded-full"
              style={{
                width: 110, height: 110,
                background: playerSp.color + "33",
                border: `3px solid ${playerSp.color}`,
                boxShadow: `inset 0 0 0 3px rgba(255,255,255,0.5)`,
              }}
            >
              <span className="gba-sprite-back">{playerSp.sprite}</span>
            </div>
          </div>
          <StatusBox p={player} showHpNumbers showXp />
        </div>
      </div>

      {/* Dialog + menu (outside the GBA screen for mobile-friendliness) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        <div className="gba-dialog sm:col-span-3 flex items-center">
          <span>{dialogText}</span>
        </div>

        <div className="sm:col-span-2">
          {menu === "main" && (
            <div className="gba-menu-grid">
              <button className="gba-menu-btn has-arrow is-selected" disabled={battle.busy || !!battle.outcome} onClick={() => setMenu("fight")}>FIGHT</button>
              <button className="gba-menu-btn has-arrow" disabled={battle.busy || !!battle.outcome} onClick={() => setMenu("bag")}>BAG</button>
              <button className="gba-menu-btn has-arrow" disabled={battle.busy || !!battle.outcome || !!battle.isGym} onClick={onCatch}>POKÉ&shy;BALL</button>
              <button className="gba-menu-btn has-arrow" disabled={battle.busy || !!battle.outcome || !!battle.isGym} onClick={onRun}>RUN</button>
            </div>
          )}
          {menu === "fight" && (
            <div className="gba-menu-grid">
              {playerSp.moves.map((m) => (
                <button key={m.name} className="gba-menu-btn has-arrow" disabled={battle.busy} onClick={() => onFight(m)}>
                  {m.name.toUpperCase()}
                </button>
              ))}
              <button className="gba-menu-btn has-arrow col-span-2" onClick={() => setMenu("main")}>← BACK</button>
            </div>
          )}
          {menu === "bag" && (
            <div className="gba-menu-grid">
              <button className="gba-menu-btn has-arrow" disabled={battle.busy} onClick={onPotion}>POTION ×{state.potions}</button>
              <button className="gba-menu-btn has-arrow" disabled={battle.busy || !!battle.isGym} onClick={onCatch}>POKÉ BALL ×{state.pokeballs}</button>
              <button className="gba-menu-btn has-arrow col-span-2" onClick={() => setMenu("main")}>← BACK</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
