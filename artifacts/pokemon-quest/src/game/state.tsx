import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { SPECIES, Species } from "./data";

export type Screen = "welcome" | "menu" | "starter" | "adventure" | "encounter" | "battle" | "center" | "mart" | "gym" | "pokedex" | "card" | "settings";

export interface OwnedPokemon {
  uid: string;
  speciesId: number;
  nickname?: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  atk: number;
  gender: "M" | "F";
}

export interface BattleState {
  enemy: OwnedPokemon;
  log: string[];
  busy: boolean;
  turn: "player" | "enemy" | "done";
  outcome?: "won" | "lost" | "fled" | "caught";
  isGym?: boolean;
  gymId?: string;
  enemyTeamRemaining?: { speciesId: number; level: number }[];
}

export interface PokedexEntry {
  seen: boolean;
  caught: boolean;
}

export interface GameState {
  screen: Screen;
  trainerName: string;
  money: number;
  pokeballs: number;
  potions: number;
  badges: string[];
  team: OwnedPokemon[];
  storage: OwnedPokemon[];
  pokedex: Record<number, PokedexEntry>;
  locationId: string;
  battle: BattleState | null;
  toast: string | null;
  audioOn: boolean;
}

const SAVE_KEY = "pokemon-quest-save-v1";

function newUid() {
  return Math.random().toString(36).slice(2, 10);
}

function randGender(): "M" | "F" {
  return Math.random() < 0.5 ? "M" : "F";
}

export function xpToNext(level: number) {
  return 20 + level * 15;
}

export function makePokemon(speciesId: number, level: number): OwnedPokemon {
  const sp = SPECIES[speciesId];
  const maxHp = Math.floor(sp.baseHp + level * 3);
  const atk = Math.floor(sp.baseAtk + level * 1.5);
  return { uid: newUid(), speciesId, level, xp: 0, hp: maxHp, maxHp, atk, gender: randGender() };
}

export function speciesOf(p: OwnedPokemon): Species {
  return SPECIES[p.speciesId];
}

const initialState: GameState = {
  screen: "welcome",
  trainerName: "",
  money: 500,
  pokeballs: 5,
  potions: 2,
  badges: [],
  team: [],
  storage: [],
  pokedex: {},
  locationId: "route1",
  battle: null,
  toast: null,
  audioOn: true,
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
  | { type: "EVOLVE_ACTIVE"; toSpeciesId: number }
  | { type: "ADD_TO_TEAM"; pokemon: OwnedPokemon }
  | { type: "HEAL_ALL" }
  | { type: "SPEND_MONEY"; amount: number }
  | { type: "ADD_MONEY"; amount: number }
  | { type: "SPEND_BALL" }
  | { type: "SPEND_POTION" }
  | { type: "ADD_ITEM"; item: "ball" | "potion"; qty: number }
  | { type: "ADD_BADGE"; badge: string }
  | { type: "SEE_POKEMON"; speciesId: number }
  | { type: "CATCH_POKEMON"; speciesId: number }
  | { type: "TOAST"; text: string | null }
  | { type: "TOGGLE_AUDIO" };

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
      return { ...state, team: [p], pokedex: dex };
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
      const team = [...state.team];
      const p = { ...team[0] };
      p.xp += action.xp;
      while (p.xp >= xpToNext(p.level)) {
        p.xp -= xpToNext(p.level);
        p.level += 1;
        const sp = SPECIES[p.speciesId];
        p.maxHp = Math.floor(sp.baseHp + p.level * 3);
        p.atk = Math.floor(sp.baseAtk + p.level * 1.5);
        p.hp = p.maxHp;
      }
      team[0] = p;
      return { ...state, team };
    }
    case "EVOLVE_ACTIVE": {
      if (state.team.length === 0) return state;
      const team = [...state.team];
      const p = { ...team[0] };
      p.speciesId = action.toSpeciesId;
      const sp = SPECIES[action.toSpeciesId];
      p.maxHp = Math.floor(sp.baseHp + p.level * 3);
      p.atk = Math.floor(sp.baseAtk + p.level * 1.5);
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
      const team = state.team.map((p) => ({ ...p, hp: p.maxHp }));
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
    case "ADD_ITEM":
      return action.item === "ball"
        ? { ...state, pokeballs: state.pokeballs + action.qty }
        : { ...state, potions: state.potions + action.qty };
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
      const parsed = JSON.parse(raw) as GameState;
      // back-compat: ensure gender exists
      const team = (parsed.team || []).map((p) => ({ ...p, gender: p.gender || randGender() }));
      const storage = (parsed.storage || []).map((p) => ({ ...p, gender: p.gender || randGender() }));
      dispatch({ type: "LOAD", payload: { ...parsed, team, storage } });
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

  // Auto-save when key state changes (skip welcome/menu/starter/active battle)
  useEffect(() => {
    if (["welcome","menu","starter"].includes(state.screen)) return;
    if (state.battle) return;
    try {
      const toSave = { ...state, battle: null, toast: null };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch { /* ignore */ }
  }, [state.team, state.money, state.pokeballs, state.potions, state.badges, state.locationId, state.pokedex, state.screen]);

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
