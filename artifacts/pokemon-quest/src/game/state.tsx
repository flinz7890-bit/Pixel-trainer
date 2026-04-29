import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { LOCATIONS, SPECIES, Species } from "./data";
import { getItem } from "./items";
import {
  StatBlock,
  generateIVs,
  emptyEVs,
  randomNatureName,
  computeAllStats,
  addEVs,
} from "./stats";

export type Screen = "welcome" | "trainerpick" | "menu" | "starter" | "adventure" | "encounter" | "battle" | "blackout" | "center" | "mart" | "gym" | "pokedex" | "card" | "settings" | "summary" | "pvp";

export type StatusCondition = "BRN" | "PAR" | "PSN" | "SLP" | "FRZ";

export interface OwnedPokemon {
  uid: string;
  speciesId: number;
  nickname?: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  atk: number;
  // Legacy + new full stat block
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
  ivs?: StatBlock;
  evs?: StatBlock;
  nature?: string;
  gender: "M" | "F";
  status?: StatusCondition;
  statusTurns?: number; // for SLP countdown
}

export interface BattleState {
  enemy: OwnedPokemon;
  log: string[];
  busy: boolean;
  turn: "player" | "enemy" | "done";
  outcome?: "won" | "lost" | "fled" | "caught";
  isGym?: boolean;
  gymId?: string;
  isTrainer?: boolean;
  trainerId?: string;
  trainerLabel?: string;
  isRocket?: boolean;
  reward?: number;
  enemyTeamRemaining?: { speciesId: number; level: number }[];
}

export interface PokedexEntry {
  seen: boolean;
  caught: boolean;
}

export interface RouteState {
  trainersDefeated: string[];
  explored: boolean;
  cleared: boolean;
}

export interface GameState {
  screen: Screen;
  trainerName: string;
  trainerSpriteId: string;
  playerId: string;
  money: number;
  pokeballs: number;
  potions: number;
  items: Record<string, number>;
  badges: string[];
  team: OwnedPokemon[];
  storage: OwnedPokemon[];
  pokedex: Record<number, PokedexEntry>;
  locationId: string;
  lastHealLocationId: string;
  routeProgress: Record<string, RouteState>;
  visited: Record<string, boolean>;
  battle: BattleState | null;
  toast: string | null;
  audioOn: boolean;
  commandLog: string[];
  wildEncounters: number;
  summaryUid: string | null;
  rocketFlags: Record<string, boolean>;
  pvpWins: number;
  pvpLosses: number;
  expShareOwned: boolean;
  expShareActive: boolean;
}

const SAVE_KEY = "pokemon-quest-save-v1";

function newUid() {
  return Math.random().toString(36).slice(2, 10);
}

export function newPlayerId() {
  // TRN- + 5 char alphanumeric (no confusing 0/O/I/1)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TRN-";
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function randGender(): "M" | "F" {
  return Math.random() < 0.5 ? "M" : "F";
}

export function xpToNext(level: number) {
  return 20 + level * 15;
}

function applyStats(p: OwnedPokemon): OwnedPokemon {
  const sp = SPECIES[p.speciesId];
  const ivs = p.ivs || generateIVs();
  const evs = p.evs || emptyEVs();
  const nature = p.nature || randomNatureName();
  const stats = computeAllStats(sp, p.level, ivs, evs, nature);
  return {
    ...p,
    ivs, evs, nature,
    maxHp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    spa: stats.spa,
    spd: stats.spd,
    spe: stats.spe,
  };
}

export function makePokemon(speciesId: number, level: number): OwnedPokemon {
  const ivs = generateIVs();
  const evs = emptyEVs();
  const nature = randomNatureName();
  const sp = SPECIES[speciesId];
  const stats = computeAllStats(sp, level, ivs, evs, nature);
  return {
    uid: newUid(),
    speciesId, level, xp: 0,
    hp: stats.hp,
    maxHp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    spa: stats.spa,
    spd: stats.spd,
    spe: stats.spe,
    ivs, evs, nature,
    gender: randGender(),
  };
}

export function speciesOf(p: OwnedPokemon): Species {
  return SPECIES[p.speciesId];
}

export function isLocationCleared(locId: string, progress: Record<string, RouteState>): boolean {
  const loc = LOCATIONS.find((l) => l.id === locId);
  if (!loc) return false;
  if (loc.isTown) return true;
  const trainers = loc.trainers || [];
  const r = progress[locId] || { trainersDefeated: [], explored: false, cleared: false };
  if (r.cleared) return true;
  const trainersDone = trainers.length === 0 || trainers.every((t) => r.trainersDefeated.includes(t.id));
  return trainersDone && r.explored;
}

const initialState: GameState = {
  screen: "welcome",
  trainerName: "",
  trainerSpriteId: "red",
  playerId: "",
  money: 500,
  pokeballs: 5,
  potions: 2,
  items: { pokeball: 5, potion: 2 },
  badges: [],
  team: [],
  storage: [],
  pokedex: {},
  locationId: "pallet",
  lastHealLocationId: "pallet",
  routeProgress: {},
  visited: { pallet: true },
  battle: null,
  toast: null,
  audioOn: true,
  commandLog: [],
  wildEncounters: 0,
  summaryUid: null,
  rocketFlags: {},
  pvpWins: 0,
  pvpLosses: 0,
  expShareOwned: false,
  expShareActive: false,
};

type Action =
  | { type: "RESET" }
  | { type: "LOAD"; payload: GameState }
  | { type: "SET_SCREEN"; screen: Screen }
  | { type: "SET_NAME"; name: string }
  | { type: "PICK_STARTER"; speciesId: number }
  | { type: "SET_LOCATION"; id: string }
  | { type: "SET_BATTLE"; battle: BattleState | null }
  | { type: "PATCH_BATTLE"; patch: Partial<BattleState> }
  | { type: "PATCH_PLAYER_ACTIVE"; patch: Partial<OwnedPokemon> }
  | { type: "ADD_LOG"; lines: string[] }
  | { type: "GIVE_XP"; xp: number }
  | { type: "GAIN_EVS"; yieldEVs: Partial<StatBlock> }
  | { type: "EVOLVE_ACTIVE"; toSpeciesId: number }
  | { type: "ADD_TO_TEAM"; pokemon: OwnedPokemon }
  | { type: "HEAL_ALL" }
  | { type: "SPEND_MONEY"; amount: number }
  | { type: "ADD_MONEY"; amount: number }
  | { type: "SPEND_BALL" }
  | { type: "SPEND_POTION" }
  | { type: "ADD_ITEM"; item: "ball" | "potion"; qty: number }
  | { type: "BUY_ITEM"; itemId: string; qty: number; cost: number }
  | { type: "USE_ITEM"; itemId: string; targetUid?: string }
  | { type: "REORDER_TEAM"; uid: string; direction: "up" | "down" }
  | { type: "RELEASE_POKEMON"; uid: string }
  | { type: "SET_TRAINER_SPRITE"; id: string }
  | { type: "OPEN_SUMMARY"; uid: string }
  | { type: "ADD_BADGE"; badge: string }
  | { type: "SEE_POKEMON"; speciesId: number }
  | { type: "CATCH_POKEMON"; speciesId: number }
  | { type: "TOAST"; text: string | null }
  | { type: "TOGGLE_AUDIO" }
  | { type: "LOG"; lines: string[] }
  | { type: "CLEAR_LOG" }
  | { type: "SWAP_ACTIVE"; withIndex: number }
  | { type: "SET_LAST_HEAL"; id: string }
  | { type: "MARK_TRAINER_DEFEATED"; locationId: string; trainerId: string }
  | { type: "MARK_EXPLORED"; locationId: string }
  | { type: "MARK_CLEARED"; locationId: string }
  | { type: "MARK_VISITED"; locationId: string }
  | { type: "SET_ROCKET_FLAG"; key: string }
  | { type: "INC_PVP_WIN" }
  | { type: "INC_PVP_LOSS" }
  | { type: "TOGGLE_EXP_SHARE" }
  | { type: "GIVE_EXP_SHARE" }
  | { type: "SET_STATUS"; uid: string; status?: StatusCondition; turns?: number }
  | { type: "CLEAR_STATUS"; uid: string }
  | { type: "PATCH_TEAM_MEMBER"; uid: string; patch: Partial<OwnedPokemon> }
  | { type: "INC_HUNT" }
  | { type: "RESPAWN_AT_HEAL" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESET":
      return { ...initialState };
    case "LOAD":
      return { ...action.payload, battle: null, toast: null };
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "SET_NAME":
      return { ...state, trainerName: action.name };
    case "PICK_STARTER": {
      const p = makePokemon(action.speciesId, 5);
      const dex = { ...state.pokedex, [action.speciesId]: { seen: true, caught: true } };
      const playerId = state.playerId || newPlayerId();
      return { ...state, team: [p], pokedex: dex, playerId };
    }
    case "SET_LOCATION":
      return { ...state, locationId: action.id };
    case "SET_BATTLE":
      return { ...state, battle: action.battle };
    case "PATCH_BATTLE":
      if (!state.battle) return state;
      return { ...state, battle: { ...state.battle, ...action.patch } };
    case "PATCH_PLAYER_ACTIVE": {
      if (state.team.length === 0) return state;
      const team = [...state.team];
      team[0] = { ...team[0], ...action.patch };
      return { ...state, team };
    }
    case "ADD_LOG":
      if (!state.battle) return state;
      return { ...state, battle: { ...state.battle, log: [...state.battle.log, ...action.lines].slice(-30) } };
    case "GIVE_XP": {
      if (state.team.length === 0) return state;
      const grantXp = (mon: OwnedPokemon, amount: number): OwnedPokemon => {
        let p = { ...mon };
        p.xp += amount;
        while (p.xp >= xpToNext(p.level)) {
          p.xp -= xpToNext(p.level);
          p.level += 1;
          const oldMax = p.maxHp;
          p = applyStats(p);
          p.hp = Math.min(p.maxHp, p.hp + (p.maxHp - oldMax));
        }
        return p;
      };
      const shareActive = !!state.expShareActive && state.expShareOwned;
      const team = state.team.map((mon, i) => {
        // Fainted Pokémon NEVER receive XP (per spec, even the active slot)
        if (mon.hp <= 0) return mon;
        if (i === 0) return grantXp(mon, action.xp);
        if (!shareActive) return mon;
        return grantXp(mon, Math.max(1, Math.floor(action.xp * 0.5)));
      });
      return { ...state, team };
    }
    case "GAIN_EVS": {
      if (state.team.length === 0) return state;
      const shareActive = !!state.expShareActive && state.expShareOwned;
      const team = state.team.map((mon, i) => {
        if (mon.hp <= 0) return mon;
        if (i !== 0 && !shareActive) return mon;
        let p = { ...mon };
        p.evs = addEVs(p.evs || emptyEVs(), action.yieldEVs);
        p = applyStats(p);
        return p;
      });
      return { ...state, team };
    }
    case "GIVE_EXP_SHARE":
      if (state.expShareOwned) return state;
      return { ...state, expShareOwned: true, expShareActive: true };
    case "SET_STATUS": {
      const idx = state.team.findIndex((p) => p.uid === action.uid);
      if (idx < 0) return state;
      const team = [...state.team];
      team[idx] = { ...team[idx], status: action.status, statusTurns: action.turns };
      return { ...state, team };
    }
    case "CLEAR_STATUS": {
      const idx = state.team.findIndex((p) => p.uid === action.uid);
      if (idx < 0) return state;
      const team = [...state.team];
      team[idx] = { ...team[idx], status: undefined, statusTurns: undefined };
      return { ...state, team };
    }
    case "PATCH_TEAM_MEMBER": {
      const idx = state.team.findIndex((p) => p.uid === action.uid);
      if (idx < 0) return state;
      const team = [...state.team];
      team[idx] = { ...team[idx], ...action.patch };
      return { ...state, team };
    }
    case "EVOLVE_ACTIVE": {
      if (state.team.length === 0) return state;
      const team = [...state.team];
      let p = { ...team[0], speciesId: action.toSpeciesId };
      p = applyStats(p);
      p.hp = p.maxHp;
      team[0] = p;
      const dex = { ...state.pokedex, [action.toSpeciesId]: { seen: true, caught: true } };
      return { ...state, team, pokedex: dex };
    }
    case "ADD_TO_TEAM": {
      if (state.team.length < 6) {
        return { ...state, team: [...state.team, action.pokemon] };
      }
      return { ...state, storage: [...state.storage, action.pokemon] };
    }
    case "HEAL_ALL": {
      // Restore HP, status conditions, AND PP (PP is tracked per-battle, but
      // clearing status here is the persistent effect).
      const team = state.team.map((p) => ({ ...p, hp: p.maxHp, status: undefined, statusTurns: undefined }));
      return { ...state, team };
    }
    case "SPEND_MONEY":
      return { ...state, money: Math.max(0, state.money - action.amount) };
    case "ADD_MONEY":
      return { ...state, money: state.money + action.amount };
    case "SPEND_BALL":
      return { ...state, pokeballs: Math.max(0, state.pokeballs - 1) };
    case "SPEND_POTION":
      return { ...state, potions: Math.max(0, state.potions - 1) };
    case "ADD_ITEM": {
      const itemId = action.item === "ball" ? "pokeball" : "potion";
      const items = { ...state.items, [itemId]: (state.items[itemId] || 0) + action.qty };
      return action.item === "ball"
        ? { ...state, pokeballs: state.pokeballs + action.qty, items }
        : { ...state, potions: state.potions + action.qty, items };
    }
    case "BUY_ITEM": {
      if (state.money < action.cost) return state;
      // EXP Share is a one-time purchase that flips a flag instead of stacking
      if (action.itemId === "expshare") {
        if (state.expShareOwned) return state;
        return {
          ...state,
          money: state.money - action.cost,
          expShareOwned: true,
          expShareActive: true,
        };
      }
      const items = { ...state.items, [action.itemId]: (state.items[action.itemId] || 0) + action.qty };
      let pokeballs = state.pokeballs, potions = state.potions;
      if (action.itemId === "pokeball") pokeballs += action.qty;
      if (action.itemId === "potion") potions += action.qty;
      return { ...state, items, pokeballs, potions, money: state.money - action.cost };
    }
    case "USE_ITEM": {
      const def = getItem(action.itemId);
      if (!def) return state;
      const have = state.items[action.itemId] || 0;
      if (have <= 0) return state;
      let team = state.team;
      const targetIdx = action.targetUid ? team.findIndex((p) => p.uid === action.targetUid) : 0;
      if (targetIdx < 0) return state;
      let target = { ...team[targetIdx] };

      if (def.healAmount || def.fullHeal) {
        if (target.hp <= 0 && !def.fullHeal) return state;
        if (def.fullHeal) {
          target.hp = target.maxHp;
          target.status = undefined;
          target.statusTurns = undefined;
        } else target.hp = Math.min(target.maxHp, target.hp + (def.healAmount || 0));
      } else if (def.curesStatus) {
        // Antidote / Parlyz Heal / etc — must match the current status.
        const curesMap: Record<string, string> = {
          antidote: "PSN",
          parlyzheal: "PAR",
          awakening: "SLP",
          iceheal: "FRZ",
          burnheal: "BRN",
        };
        const required = curesMap[def.id];
        if (required && target.status !== required) return state;
        if (!target.status) return state;
        target.status = undefined;
        target.statusTurns = undefined;
      } else if (def.reviveHalf) {
        if (target.hp > 0) return state;
        target.hp = Math.max(1, Math.floor(target.maxHp / 2));
      } else if (def.rareCandy) {
        target.level += 1;
        target = applyStats(target);
        target.hp = target.maxHp;
        const sp = SPECIES[target.speciesId];
        if (sp.evolvesAt && sp.evolvesTo && target.level >= sp.evolvesAt) {
          target.speciesId = sp.evolvesTo;
          target = applyStats(target);
          target.hp = target.maxHp;
        }
      } else {
        return state;
      }

      team = [...team];
      team[targetIdx] = target;
      const items = { ...state.items, [action.itemId]: have - 1 };
      let potions = state.potions;
      if (action.itemId === "potion") potions = Math.max(0, state.potions - 1);
      return { ...state, team, items, potions };
    }
    case "REORDER_TEAM": {
      const idx = state.team.findIndex((p) => p.uid === action.uid);
      if (idx < 0) return state;
      const target = action.direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= state.team.length) return state;
      const team = [...state.team];
      [team[idx], team[target]] = [team[target], team[idx]];
      return { ...state, team };
    }
    case "RELEASE_POKEMON": {
      if (state.team.length <= 1) return state;
      const team = state.team.filter((p) => p.uid !== action.uid);
      return { ...state, team };
    }
    case "SET_TRAINER_SPRITE":
      return { ...state, trainerSpriteId: action.id };
    case "OPEN_SUMMARY":
      return { ...state, summaryUid: action.uid, screen: "summary" };
    case "ADD_BADGE":
      if (state.badges.includes(action.badge)) return state;
      return { ...state, badges: [...state.badges, action.badge] };
    case "SEE_POKEMON": {
      const cur = state.pokedex[action.speciesId] || { seen: false, caught: false };
      return { ...state, pokedex: { ...state.pokedex, [action.speciesId]: { ...cur, seen: true } } };
    }
    case "CATCH_POKEMON": {
      return { ...state, pokedex: { ...state.pokedex, [action.speciesId]: { seen: true, caught: true } } };
    }
    case "TOAST":
      return { ...state, toast: action.text };
    case "TOGGLE_AUDIO":
      return { ...state, audioOn: !state.audioOn };
    case "LOG":
      return { ...state, commandLog: [...state.commandLog, ...action.lines].slice(-60) };
    case "CLEAR_LOG":
      return { ...state, commandLog: [] };
    case "SWAP_ACTIVE": {
      const i = action.withIndex;
      if (i <= 0 || i >= state.team.length) return state;
      const team = [...state.team];
      [team[0], team[i]] = [team[i], team[0]];
      return { ...state, team };
    }
    case "SET_LAST_HEAL":
      return { ...state, lastHealLocationId: action.id };
    case "MARK_TRAINER_DEFEATED": {
      const cur = state.routeProgress[action.locationId] || { trainersDefeated: [], explored: false, cleared: false };
      if (cur.trainersDefeated.includes(action.trainerId)) return state;
      return {
        ...state,
        routeProgress: {
          ...state.routeProgress,
          [action.locationId]: { ...cur, trainersDefeated: [...cur.trainersDefeated, action.trainerId] },
        },
      };
    }
    case "MARK_EXPLORED": {
      const cur = state.routeProgress[action.locationId] || { trainersDefeated: [], explored: false, cleared: false };
      if (cur.explored) return state;
      return {
        ...state,
        routeProgress: { ...state.routeProgress, [action.locationId]: { ...cur, explored: true } },
      };
    }
    case "MARK_CLEARED": {
      const cur = state.routeProgress[action.locationId] || { trainersDefeated: [], explored: false, cleared: false };
      return {
        ...state,
        routeProgress: { ...state.routeProgress, [action.locationId]: { ...cur, cleared: true } },
      };
    }
    case "MARK_VISITED":
      return { ...state, visited: { ...state.visited, [action.locationId]: true } };
    case "SET_ROCKET_FLAG":
      if (state.rocketFlags[action.key]) return state;
      return { ...state, rocketFlags: { ...state.rocketFlags, [action.key]: true } };
    case "INC_PVP_WIN":
      return { ...state, pvpWins: (state.pvpWins || 0) + 1 };
    case "INC_PVP_LOSS":
      return { ...state, pvpLosses: (state.pvpLosses || 0) + 1 };
    case "TOGGLE_EXP_SHARE":
      if (!state.expShareOwned) return state;
      return { ...state, expShareActive: !state.expShareActive };
    case "INC_HUNT":
      return { ...state, wildEncounters: (state.wildEncounters || 0) + 1 };
    case "RESPAWN_AT_HEAL": {
      const team = state.team.map((p) => ({ ...p, hp: p.maxHp }));
      return { ...state, team, locationId: state.lastHealLocationId, battle: null };
    }
    default:
      return state;
  }
}

interface Ctx {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  saveGame: () => void;
  loadGame: () => boolean;
  hasSave: () => boolean;
  resetGame: () => void;
}

const GameContext = createContext<Ctx | null>(null);

function migratePokemon(p: OwnedPokemon): OwnedPokemon {
  if (p.ivs && p.evs && p.nature && typeof p.def === "number") return p;
  return applyStats({
    ...p,
    ivs: p.ivs || generateIVs(),
    evs: p.evs || emptyEVs(),
    nature: p.nature || randomNatureName(),
  });
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const saveGame = () => {
    try {
      const toSave = { ...state, battle: null, toast: null };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch (_e) { /* ignore */ }
  };

  const loadGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<GameState>;
      const team = (parsed.team || []).map((p) => migratePokemon({ ...p, gender: p.gender || randGender() }));
      const storage = (parsed.storage || []).map((p) => migratePokemon({ ...p, gender: p.gender || randGender() }));
      // Migrate locationId — if old id no longer exists, fall back to pallet
      const validLoc = LOCATIONS.some((l) => l.id === parsed.locationId);
      const locationId = validLoc ? parsed.locationId! : "pallet";
      const lastHeal = parsed.lastHealLocationId && LOCATIONS.some((l) => l.id === parsed.lastHealLocationId)
        ? parsed.lastHealLocationId
        : "pallet";
      const merged: GameState = {
        ...initialState,
        ...parsed,
        team,
        storage,
        locationId,
        lastHealLocationId: lastHeal,
        routeProgress: parsed.routeProgress || {},
        visited: parsed.visited || { pallet: true },
        commandLog: parsed.commandLog || [],
        items: parsed.items || { pokeball: parsed.pokeballs || 0, potion: parsed.potions || 0 },
        trainerSpriteId: parsed.trainerSpriteId || "red",
        playerId: parsed.playerId || newPlayerId(),
        rocketFlags: parsed.rocketFlags || {},
        pvpWins: parsed.pvpWins || 0,
        pvpLosses: parsed.pvpLosses || 0,
        expShareOwned: !!parsed.expShareOwned,
        expShareActive: !!parsed.expShareActive,
        summaryUid: null,
      } as GameState;
      dispatch({ type: "LOAD", payload: merged });
      return true;
    } catch { return false; }
  };

  const hasSave = () => {
    try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
  };

  const resetGame = () => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    dispatch({ type: "RESET" });
  };

  // Auto-save when key state changes (skip pre-game screens & active battle)
  useEffect(() => {
    if (["welcome","menu","starter","trainerpick"].includes(state.screen)) return;
    if (state.battle) return;
    // Critical guard: never overwrite a real save with an empty-team state
    if (state.team.length === 0) return;
    try {
      const toSave = { ...state, battle: null, toast: null };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch { /* ignore */ }
  }, [state.team, state.money, state.pokeballs, state.potions, state.badges, state.locationId, state.pokedex, state.screen, state.lastHealLocationId, state.routeProgress, state.visited, state.rocketFlags, state.pvpWins, state.pvpLosses, state.expShareOwned, state.expShareActive]);

  // Auto clear toast
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "TOAST", text: null }), 2200);
    return () => clearTimeout(t);
  }, [state.toast]);

  return (
    <GameContext.Provider value={{ state, dispatch, saveGame, loadGame, hasSave, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
