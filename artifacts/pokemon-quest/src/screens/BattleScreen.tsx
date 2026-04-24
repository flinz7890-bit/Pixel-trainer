import PokeSprite from "@/components/PokeSprite";
import { useEffect, useRef, useState } from "react";
import { useGame, speciesOf, OwnedPokemon, makePokemon } from "@/game/state";
import { Move, SPECIES, GYMS, LOCATIONS, PokeType, effectiveness, effectivenessLabel } from "@/game/data";
import { ITEMS as ITEM_DEFS, getItem } from "@/game/items";
import Toast from "@/components/Toast";
import ItemIcon from "@/components/ItemIcon";
import { typeColor } from "@/components/TypeBadge";

const SPECIAL_TYPES = new Set<string>(["fire","water","electric","grass","psychic","ice","dragon","ghost","dark","fairy"]);

// Move type → CSS animation name + duration (ms)
const MOVE_ANIM: Record<string, { name: string; dur: number }> = {
  fire:     { name: "fireAnim",     dur: 600 },
  water:    { name: "waterAnim",    dur: 500 },
  electric: { name: "electricAnim", dur: 600 },
  grass:    { name: "grassAnim",    dur: 700 },
  psychic:  { name: "psychicAnim",  dur: 700 },
  ice:      { name: "iceAnim",      dur: 500 },
  ground:   { name: "groundAnim",   dur: 500 },
  normal:   { name: "normalAnim",   dur: 400 },
  fighting: { name: "normalAnim",   dur: 400 },
  poison:   { name: "poisonAnim",   dur: 600 },
  ghost:    { name: "ghostAnim",    dur: 700 },
  rock:     { name: "rockAnim",     dur: 600 },
  flying:   { name: "flyingAnim",   dur: 700 },
  dragon:   { name: "dragonAnim",   dur: 800 },
  bug:      { name: "grassAnim",    dur: 600 },
  steel:    { name: "rockAnim",     dur: 600 },
  dark:     { name: "ghostAnim",    dur: 700 },
  fairy:    { name: "psychicAnim",  dur: 700 },
};

const POKEBALL_IMG: Record<string, string> = {
  pokeball:  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
  greatball: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",
  ultraball: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png",
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function calcDamage(attacker: OwnedPokemon, move: Move, defenderTypes: PokeType[]) {
  const base = move.power + attacker.atk;
  const variance = 0.85 + Math.random() * 0.3;
  const mult = effectiveness(move.type, defenderTypes);
  const raw = base * variance * 0.6 * mult;
  return { dmg: mult === 0 ? 0 : Math.max(1, Math.floor(raw)), mult };
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
  const [throwing, setThrowing] = useState<null | { ball: string; phase: "throw" | "wobble" | "burst" | "captured" }>(null);
  const [enemyCapture, setEnemyCapture] = useState(false);
  const enemySpriteRef = useRef<HTMLDivElement>(null);
  const playerSpriteRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  const playMoveAnimation = async (moveType: PokeType, attackerSide: "player" | "enemy") => {
    const attackerEl = attackerSide === "player" ? playerSpriteRef.current : enemySpriteRef.current;
    const defenderEl = attackerSide === "player" ? enemySpriteRef.current : playerSpriteRef.current;
    const cfg = MOVE_ANIM[moveType.toLowerCase()] || MOVE_ANIM.normal;
    const isSpecial = SPECIAL_TYPES.has(moveType.toLowerCase());

    // Phase 1: attacker lunges forward (~180ms)
    if (attackerEl) {
      attackerEl.classList.remove("pq-bob");
      attackerEl.classList.add(attackerSide === "player" ? "pq-lunge-right" : "pq-lunge-left");
      await new Promise<void>((r) => setTimeout(r, 180));
      attackerEl.classList.remove("pq-lunge-right", "pq-lunge-left");
      if (attackerSide === "player") attackerEl.classList.add("pq-bob");
    }

    // Phase 2: type FX overlay travels toward / hits the defender
    if (defenderEl) {
      const fx = document.createElement("div");
      fx.className = "pq-move-fx";
      fx.style.top = "30%";
      if (isSpecial) {
        // Projectile-style: enter from attacker's side
        if (attackerSide === "player") fx.style.left = "-90px";
        else { fx.style.right = "-90px"; fx.style.transform = "scaleX(-1)"; }
      } else {
        // Physical: contact-only, centered on defender
        fx.style.left = "10%";
        fx.style.right = "10%";
      }
      fx.style.animation = `${cfg.name} ${cfg.dur}ms ease-out forwards`;
      defenderEl.appendChild(fx);
      if (cfg.name === "groundAnim" && arenaRef.current) {
        arenaRef.current.classList.add("pq-shake");
        setTimeout(() => arenaRef.current?.classList.remove("pq-shake"), cfg.dur);
      }
      // Phase 3: impact — flash defender red + screen shake (just before FX ends)
      const impactDelay = Math.max(0, cfg.dur - 200);
      setTimeout(() => {
        defenderEl.classList.add("pq-flash-red");
        setTimeout(() => defenderEl.classList.remove("pq-flash-red"), 320);
        if (arenaRef.current) {
          arenaRef.current.classList.add("pq-arena-hit");
          setTimeout(() => arenaRef.current?.classList.remove("pq-arena-hit"), 260);
        }
      }, impactDelay);
      await new Promise<void>((r) => setTimeout(r, cfg.dur + 80));
      fx.remove();
    }
  };

  const showFloatingDamage = (side: "enemy" | "player", dmg: number, mult: number) => {
    const target = side === "enemy" ? enemySpriteRef.current : playerSpriteRef.current;
    if (!target) return;
    const dmgDiv = document.createElement("div");
    dmgDiv.className = "pq-dmg-float";
    dmgDiv.textContent = `-${dmg}`;
    target.appendChild(dmgDiv);
    setTimeout(() => dmgDiv.remove(), 1100);
    if (mult > 1 || (mult > 0 && mult < 1)) {
      const eff = document.createElement("div");
      eff.className = "pq-dmg-eff";
      eff.textContent = mult > 1 ? "Super effective!" : "Not very effective...";
      eff.style.color = mult > 1 ? "#fb923c" : "#9ca3af";
      target.appendChild(eff);
      setTimeout(() => eff.remove(), 1100);
    }
  };

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
    await sleep(500);
    const move = enemySp.moves[Math.floor(Math.random() * enemySp.moves.length)];
    log([`Foe ${enemySp.name} used ${move.name}!`]);
    // Play move animation BEFORE damage
    await playMoveAnimation(move.type, "enemy");
    const { dmg, mult } = calcDamage(enemy, move, playerSp.type);
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 500);
    showFloatingDamage("player", dmg, mult);
    const newHp = Math.max(0, player.hp - dmg);
    dispatch({ type: "PATCH_PLAYER_ACTIVE", patch: { hp: newHp } });
    const effMsg = effectivenessLabel(mult);
    log([`It dealt ${dmg} damage!`, ...(effMsg ? [effMsg] : [])]);
    await sleep(900);
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
    // Play move animation BEFORE damage applies
    await playMoveAnimation(move.type, "player");
    const { dmg, mult } = calcDamage(player, move, enemySp.type);
    setEnemyShake(true);
    setTimeout(() => setEnemyShake(false), 500);
    showFloatingDamage("enemy", dmg, mult);
    const newEnemyHp = Math.max(0, enemy.hp - dmg);
    dispatch({ type: "PATCH_BATTLE", patch: { enemy: { ...enemy, hp: newEnemyHp } } });
    const effMsg = effectivenessLabel(mult);
    log([`It dealt ${dmg} damage!`, ...(effMsg ? [effMsg] : [])]);
    await sleep(900);
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

  const throwBall = async (ballId: string) => {
    if (battle.busy || battle.outcome) return;
    if (battle.isGym || battle.isTrainer) {
      dispatch({ type: "TOAST", text: "You can't catch a Trainer's Pokémon!" });
      return;
    }
    const have = state.items[ballId] || (ballId === "pokeball" ? state.pokeballs : 0);
    if (have <= 0) {
      dispatch({ type: "TOAST", text: "None left!" });
      return;
    }
    const ballDef = getItem(ballId);
    const ballName = ballDef?.name || "Poké Ball";
    const mult = ballDef?.catchMult || 1;

    setMenu("main");
    setBusy(true);
    if (ballId === "pokeball") dispatch({ type: "SPEND_BALL" });
    else dispatch({ type: "BUY_ITEM", itemId: ballId, qty: -1, cost: 0 });
    log([`You threw a ${ballName} at ${enemySp.name}!`]);

    // Phase 1: throwBall — ball flies to center (0.5s)
    setThrowing({ ball: ballId, phase: "throw" });
    await sleep(500);

    // Phase 2: shrinkPokemon — Pokémon shrinks into ball (0.3s)
    setEnemyCapture(true);
    await sleep(300);

    // Phase 3: wobbleBall — ball wobbles 3 times (1.2s)
    setThrowing({ ball: ballId, phase: "wobble" });
    const hpFactor = 1 - enemy.hp / enemy.maxHp;
    const chance = Math.min(0.95, enemySp.catchRate * mult * (0.4 + hpFactor * 0.85));
    const success = Math.random() < chance;
    await sleep(1200);

    if (success) {
      // Sparkle + Gotcha! — KEEP enemyCapture true and ball visible through transition
      // so the Pokémon never re-pops out of the ball before the battle ends.
      setThrowing({ ball: ballId, phase: "captured" });
      log([`Gotcha! ${enemySp.name} was caught!`]);
      dispatch({ type: "CATCH_POKEMON", speciesId: enemy.speciesId });
      dispatch({ type: "ADD_TO_TEAM", pokemon: { ...enemy } });
      dispatch({ type: "TOAST", text: `Caught ${enemySp.name}!` });
      await sleep(700);
      // Don't reset enemyCapture/throwing — endBattleAfter changes screen
      await endBattleAfter("caught");
    } else {
      // burstOpen — ball bursts and Pokémon reappears
      setThrowing({ ball: ballId, phase: "burst" });
      await sleep(400);
      setThrowing(null);
      setEnemyCapture(false);
      log([`Oh no! ${enemySp.name} broke free!`]);
      dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
      await enemyTurn();
    }
  };

  const onCatch = () => throwBall("pokeball");

  const onUseItem = async (itemId: string) => {
    const def = getItem(itemId);
    if (!def) return;
    if (def.category === "ball") {
      await throwBall(itemId);
      return;
    }
    if (def.healAmount || def.fullHeal) {
      if (player.hp >= player.maxHp && !def.curesStatus) {
        dispatch({ type: "TOAST", text: "HP is already full." });
        return;
      }
      const have = state.items[itemId] || 0;
      if (have <= 0) { dispatch({ type: "TOAST", text: "None left!" }); return; }
      setMenu("main");
      setBusy(true);
      const before = player.hp;
      dispatch({ type: "USE_ITEM", itemId, targetUid: player.uid });
      const heal = def.fullHeal ? player.maxHp - before : Math.min(player.maxHp - before, def.healAmount || 0);
      log([`You used a ${def.name}!`, `${playerSp.name} recovered ${heal} HP.`]);
      await sleep(700);
      dispatch({ type: "PATCH_BATTLE", patch: { turn: "enemy" } });
      await enemyTurn();
      return;
    }
    dispatch({ type: "TOAST", text: `${def.name} can't be used in battle yet.` });
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
      <div className="wb-arena" ref={arenaRef}>
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
          <div ref={enemySpriteRef} className={`wb-enemy-sprite ${enemyShake ? "pq-shake" : ""}`} style={{ position: "relative" }}>
            <div className={enemyCapture ? "pq-shrink" : ""}>
              <PokeSprite species={enemySp} size={110} />
            </div>
            {throwing && (
              <img
                src={POKEBALL_IMG[throwing.ball] || POKEBALL_IMG.pokeball}
                alt="ball"
                className={
                  throwing.phase === "throw" ? "pq-ball-throw"
                  : throwing.phase === "wobble" ? "pq-ball-wobble"
                  : throwing.phase === "burst" ? "pq-ball-burst"
                  : ""
                }
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "35%",
                  width: 36,
                  height: 36,
                  marginLeft: -18,
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
                  zIndex: 13,
                }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            {throwing?.phase === "captured" && (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 32, zIndex: 14, animation: "burstOpen 700ms ease-out forwards" }}>✨</div>
            )}
          </div>
        </div>

        {/* Player row: sprite left, stat box right */}
        <div className="wb-player-row">
          <div ref={playerSpriteRef} className={`wb-player-sprite ${playerShake ? "pq-shake" : "pq-bob"}`} style={{ position: "relative" }}>
            <PokeSprite species={playerSp} size={120} back />
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
              onClick={() => setMenu("bag")}
            >
              Bag
            </button>
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
          </div>
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
                  <div className="wb-move-name flex items-center gap-2">
                    <PokeSprite species={sp} size={28} />
                    <span>{sp.name}</span>
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

      {menu === "bag" && (
        <>
          <div className="wb-section-label">BAG</div>
          <div className="wb-moves" style={{ maxHeight: 320, overflowY: "auto" }}>
            {ITEM_DEFS
              .filter((it) => it.category === "ball" || it.category === "heal" || it.category === "revive")
              .map((it) => {
                const have = state.items[it.id] || (it.id === "pokeball" ? state.pokeballs : it.id === "potion" ? state.potions : 0);
                const trainerLock = (it.category === "ball") && (battle.isGym || battle.isTrainer);
                const disabled = have <= 0 || trainerLock || battle.busy;
                return (
                  <button
                    key={it.id}
                    className="wb-move-btn"
                    disabled={disabled}
                    onClick={() => onUseItem(it.id)}
                  >
                    <div className="wb-move-name flex items-center gap-2">
                      <ItemIcon item={it} size={22} />
                      <span>{it.name}</span>
                    </div>
                    <div className="wb-move-pwr">×{have}{trainerLock ? " · trainer" : ""}</div>
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
