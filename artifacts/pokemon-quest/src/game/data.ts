export type PokeType = "Normal" | "Fire" | "Water" | "Grass" | "Electric" | "Bug" | "Flying" | "Poison" | "Rock" | "Ghost" | "Psychic";

export interface Move {
  name: string;
  power: number;
  type: PokeType;
}

export interface Species {
  id: number;
  name: string;
  type: PokeType[];
  baseHp: number;
  baseAtk: number;
  moves: Move[];
  evolvesAt?: number;
  evolvesTo?: number;
  catchRate: number; // 0..1 base difficulty (higher = easier)
  xpYield: number;
  rarity: "common" | "uncommon" | "rare";
  sprite: string; // emoji-style icon
  color: string; // accent
}

export const MOVES: Record<string, Move> = {
  Tackle: { name: "Tackle", power: 8, type: "Normal" },
  Scratch: { name: "Scratch", power: 9, type: "Normal" },
  Ember: { name: "Ember", power: 12, type: "Fire" },
  Flamethrower: { name: "Flamethrower", power: 18, type: "Fire" },
  WaterGun: { name: "Water Gun", power: 12, type: "Water" },
  HydroPump: { name: "Hydro Pump", power: 18, type: "Water" },
  VineWhip: { name: "Vine Whip", power: 12, type: "Grass" },
  RazorLeaf: { name: "Razor Leaf", power: 16, type: "Grass" },
  ThunderShock: { name: "Thunder Shock", power: 12, type: "Electric" },
  Thunderbolt: { name: "Thunderbolt", power: 18, type: "Electric" },
  QuickAttack: { name: "Quick Attack", power: 10, type: "Normal" },
  Bite: { name: "Bite", power: 11, type: "Normal" },
  Peck: { name: "Peck", power: 10, type: "Flying" },
  Gust: { name: "Gust", power: 11, type: "Flying" },
  PoisonSting: { name: "Poison Sting", power: 10, type: "Poison" },
  RockThrow: { name: "Rock Throw", power: 13, type: "Rock" },
  Confusion: { name: "Confusion", power: 14, type: "Psychic" },
  Lick: { name: "Lick", power: 9, type: "Ghost" },
};

export const SPECIES: Record<number, Species> = {
  1: { id: 1, name: "Bulbasaur", type: ["Grass", "Poison"], baseHp: 45, baseAtk: 12, moves: [MOVES.Tackle, MOVES.VineWhip], evolvesAt: 12, evolvesTo: 2, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🌱", color: "#65a30d" },
  2: { id: 2, name: "Ivysaur", type: ["Grass", "Poison"], baseHp: 60, baseAtk: 16, moves: [MOVES.VineWhip, MOVES.RazorLeaf], catchRate: 0.25, xpYield: 35, rarity: "rare", sprite: "🌿", color: "#4d7c0f" },
  4: { id: 4, name: "Charmander", type: ["Fire"], baseHp: 39, baseAtk: 13, moves: [MOVES.Scratch, MOVES.Ember], evolvesAt: 12, evolvesTo: 5, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🔥", color: "#ea580c" },
  5: { id: 5, name: "Charmeleon", type: ["Fire"], baseHp: 58, baseAtk: 17, moves: [MOVES.Ember, MOVES.Flamethrower], catchRate: 0.25, xpYield: 35, rarity: "rare", sprite: "🐉", color: "#c2410c" },
  7: { id: 7, name: "Squirtle", type: ["Water"], baseHp: 44, baseAtk: 12, moves: [MOVES.Tackle, MOVES.WaterGun], evolvesAt: 12, evolvesTo: 8, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🐢", color: "#0284c7" },
  8: { id: 8, name: "Wartortle", type: ["Water"], baseHp: 59, baseAtk: 16, moves: [MOVES.WaterGun, MOVES.HydroPump], catchRate: 0.25, xpYield: 35, rarity: "rare", sprite: "🌊", color: "#0369a1" },
  25: { id: 25, name: "Pikachu", type: ["Electric"], baseHp: 35, baseAtk: 14, moves: [MOVES.QuickAttack, MOVES.ThunderShock], evolvesAt: 14, evolvesTo: 26, catchRate: 0.35, xpYield: 24, rarity: "rare", sprite: "⚡", color: "#facc15" },
  26: { id: 26, name: "Raichu", type: ["Electric"], baseHp: 60, baseAtk: 18, moves: [MOVES.ThunderShock, MOVES.Thunderbolt], catchRate: 0.2, xpYield: 38, rarity: "rare", sprite: "⚡", color: "#eab308" },
  16: { id: 16, name: "Pidgey", type: ["Normal", "Flying"], baseHp: 40, baseAtk: 10, moves: [MOVES.Tackle, MOVES.Gust], catchRate: 0.7, xpYield: 14, rarity: "common", sprite: "🐦", color: "#a3a3a3" },
  19: { id: 19, name: "Rattata", type: ["Normal"], baseHp: 30, baseAtk: 11, moves: [MOVES.Tackle, MOVES.QuickAttack], catchRate: 0.75, xpYield: 12, rarity: "common", sprite: "🐭", color: "#a855f7" },
  10: { id: 10, name: "Caterpie", type: ["Bug"], baseHp: 35, baseAtk: 8, moves: [MOVES.Tackle], catchRate: 0.85, xpYield: 10, rarity: "common", sprite: "🐛", color: "#84cc16" },
  13: { id: 13, name: "Weedle", type: ["Bug", "Poison"], baseHp: 32, baseAtk: 9, moves: [MOVES.PoisonSting], catchRate: 0.8, xpYield: 11, rarity: "common", sprite: "🐝", color: "#ca8a04" },
  41: { id: 41, name: "Zubat", type: ["Poison", "Flying"], baseHp: 36, baseAtk: 10, moves: [MOVES.Bite, MOVES.Gust], catchRate: 0.65, xpYield: 16, rarity: "uncommon", sprite: "🦇", color: "#7c3aed" },
  74: { id: 74, name: "Geodude", type: ["Rock"], baseHp: 42, baseAtk: 13, moves: [MOVES.Tackle, MOVES.RockThrow], catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🪨", color: "#78716c" },
  92: { id: 92, name: "Gastly", type: ["Ghost", "Poison"], baseHp: 38, baseAtk: 12, moves: [MOVES.Lick, MOVES.Confusion], catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "👻", color: "#6b21a8" },
  63: { id: 63, name: "Abra", type: ["Psychic"], baseHp: 30, baseAtk: 11, moves: [MOVES.Confusion], catchRate: 0.45, xpYield: 20, rarity: "uncommon", sprite: "🔮", color: "#d97706" },
};

export const STARTERS = [4, 7, 1, 25];

export interface TrainerNPC {
  id: string;
  title: string;
  name: string;
  sprite: string;
  team: { speciesId: number; level: number }[];
  reward: number;
  intro: string;
}

export interface Location {
  id: string;
  name: string;
  emoji: string;
  isTown?: boolean;
  gymId?: string;
  encounters: { speciesId: number; weight: number; minLevel: number; maxLevel: number }[];
  trainers?: TrainerNPC[];
  nextLocationId?: string;
  prevLocationId?: string;
  arrivalBadge?: string; // auto-awarded badge on first arrival
  arrivalMessage?: string;
}

export const LOCATIONS: Location[] = [
  {
    id: "pallet",
    name: "Pallet Town",
    emoji: "🏡",
    isTown: true,
    encounters: [],
    nextLocationId: "route1",
  },
  {
    id: "route1",
    name: "Route 1",
    emoji: "🌾",
    encounters: [
      { speciesId: 16, weight: 4, minLevel: 2, maxLevel: 4 },
      { speciesId: 19, weight: 4, minLevel: 2, maxLevel: 4 },
      { speciesId: 10, weight: 2, minLevel: 2, maxLevel: 3 },
      { speciesId: 13, weight: 2, minLevel: 2, maxLevel: 3 },
    ],
    trainers: [
      {
        id: "r1-joey",
        title: "Youngster",
        name: "Joey",
        sprite: "🧒",
        team: [{ speciesId: 19, level: 4 }],
        reward: 80,
        intro: "Hey! My Rattata is in the top percentage!",
      },
      {
        id: "r1-bug",
        title: "Bug Catcher",
        name: "Rick",
        sprite: "🪲",
        team: [
          { speciesId: 10, level: 3 },
          { speciesId: 13, level: 4 },
        ],
        reward: 100,
        intro: "I caught a bunch of bugs — wanna battle?",
      },
    ],
    prevLocationId: "pallet",
    nextLocationId: "route2",
  },
  {
    id: "route2",
    name: "Route 2",
    emoji: "🌳",
    encounters: [
      { speciesId: 16, weight: 3, minLevel: 4, maxLevel: 6 },
      { speciesId: 10, weight: 3, minLevel: 4, maxLevel: 6 },
      { speciesId: 13, weight: 3, minLevel: 4, maxLevel: 6 },
      { speciesId: 25, weight: 1, minLevel: 5, maxLevel: 7 },
    ],
    trainers: [
      {
        id: "r2-bug",
        title: "Bug Catcher",
        name: "Doug",
        sprite: "🪳",
        team: [
          { speciesId: 10, level: 6 },
          { speciesId: 13, level: 6 },
        ],
        reward: 140,
        intro: "Bugs rule! Take this!",
      },
    ],
    prevLocationId: "route1",
    nextLocationId: "route3",
  },
  {
    id: "route3",
    name: "Route 3",
    emoji: "⛰️",
    encounters: [
      { speciesId: 74, weight: 4, minLevel: 6, maxLevel: 9 },
      { speciesId: 41, weight: 3, minLevel: 6, maxLevel: 9 },
      { speciesId: 19, weight: 2, minLevel: 6, maxLevel: 8 },
      { speciesId: 16, weight: 2, minLevel: 6, maxLevel: 8 },
    ],
    trainers: [
      {
        id: "r3-hiker",
        title: "Hiker",
        name: "Marty",
        sprite: "🥾",
        team: [
          { speciesId: 74, level: 8 },
          { speciesId: 74, level: 9 },
        ],
        reward: 220,
        intro: "These mountains are mine! Battle!",
      },
      {
        id: "r3-lass",
        title: "Lass",
        name: "Janie",
        sprite: "👧",
        team: [
          { speciesId: 41, level: 8 },
          { speciesId: 19, level: 9 },
        ],
        reward: 200,
        intro: "Hi! Want to play with my Pokémon?",
      },
    ],
    prevLocationId: "route2",
    nextLocationId: "pewter",
  },
  {
    id: "pewter",
    name: "Pewter City",
    emoji: "🏛️",
    isTown: true,
    gymId: "brock",
    encounters: [],
    prevLocationId: "route3",
    arrivalBadge: "Boulder Badge",
    arrivalMessage: "You arrived at Pewter City! The Pewter Gym leader gifted you the Boulder Badge for your journey.",
  },
];

export interface GymLeader {
  id: string;
  name: string;
  city: string;
  badge: string;
  team: { speciesId: number; level: number }[];
  reward: number;
  unlockBadgeCount: number;
}

export const GYMS: GymLeader[] = [
  {
    id: "brock",
    name: "Brock",
    city: "Pewter City",
    badge: "Boulder Badge",
    team: [
      { speciesId: 74, level: 10 },
      { speciesId: 74, level: 12 },
    ],
    reward: 500,
    unlockBadgeCount: 0,
  },
];
