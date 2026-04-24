import { PokeType, Species, SPECIES, Move } from "./data";

export type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP",
  atk: "Attack",
  def: "Defense",
  spa: "Sp. Atk",
  spd: "Sp. Def",
  spe: "Speed",
};

export const STAT_LABELS_SHORT: Record<StatKey, string> = {
  hp: "HP",
  atk: "ATK",
  def: "DEF",
  spa: "SPA",
  spd: "SPD",
  spe: "SPE",
};

export const STAT_COLORS: Record<StatKey, string> = {
  hp: "#4ade80",
  atk: "#f43f5e",
  def: "#60a5fa",
  spa: "#a855f7",
  spd: "#22d3ee",
  spe: "#facc15",
};

export interface StatBlock {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

// ---------- Natures ----------
export interface NatureDef {
  name: string;
  up: StatKey | null;
  down: StatKey | null;
}

export const NATURES: NatureDef[] = [
  { name: "Hardy",   up: null,  down: null },
  { name: "Lonely",  up: "atk", down: "def" },
  { name: "Brave",   up: "atk", down: "spe" },
  { name: "Adamant", up: "atk", down: "spa" },
  { name: "Naughty", up: "atk", down: "spd" },
  { name: "Bold",    up: "def", down: "atk" },
  { name: "Docile",  up: null,  down: null },
  { name: "Relaxed", up: "def", down: "spe" },
  { name: "Impish",  up: "def", down: "spa" },
  { name: "Lax",     up: "def", down: "spd" },
  { name: "Timid",   up: "spe", down: "atk" },
  { name: "Hasty",   up: "spe", down: "def" },
  { name: "Serious", up: null,  down: null },
  { name: "Jolly",   up: "spe", down: "spa" },
  { name: "Naive",   up: "spe", down: "spd" },
  { name: "Modest",  up: "spa", down: "atk" },
  { name: "Mild",    up: "spa", down: "def" },
  { name: "Quiet",   up: "spa", down: "spe" },
  { name: "Bashful", up: null,  down: null },
  { name: "Rash",    up: "spa", down: "spd" },
  { name: "Calm",    up: "spd", down: "atk" },
  { name: "Gentle",  up: "spd", down: "def" },
  { name: "Sassy",   up: "spd", down: "spe" },
  { name: "Careful", up: "spd", down: "spa" },
  { name: "Quirky",  up: null,  down: null },
];

export function getNature(name: string): NatureDef {
  return NATURES.find((n) => n.name === name) || NATURES[0];
}

export function randomNatureName(): string {
  return NATURES[Math.floor(Math.random() * NATURES.length)].name;
}

export function natureMultiplier(nature: string, stat: StatKey): number {
  if (stat === "hp") return 1.0;
  const n = getNature(nature);
  if (n.up === stat) return 1.1;
  if (n.down === stat) return 0.9;
  return 1.0;
}

// ---------- IVs / EVs ----------
export const MAX_IV = 31;
export const MAX_EV_PER_STAT = 252;
export const MAX_EV_TOTAL = 510;

export function generateIVs(): StatBlock {
  return {
    hp: Math.floor(Math.random() * (MAX_IV + 1)),
    atk: Math.floor(Math.random() * (MAX_IV + 1)),
    def: Math.floor(Math.random() * (MAX_IV + 1)),
    spa: Math.floor(Math.random() * (MAX_IV + 1)),
    spd: Math.floor(Math.random() * (MAX_IV + 1)),
    spe: Math.floor(Math.random() * (MAX_IV + 1)),
  };
}

export function emptyEVs(): StatBlock {
  return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

export function totalEVs(evs: StatBlock): number {
  return evs.hp + evs.atk + evs.def + evs.spa + evs.spd + evs.spe;
}

// Add EVs gained from defeating a Pokémon, capped per-stat (252) and total (510)
export function addEVs(current: StatBlock, yieldEVs: Partial<StatBlock>): StatBlock {
  const out: StatBlock = { ...current };
  let total = totalEVs(out);
  const keys: StatKey[] = ["hp", "atk", "def", "spa", "spd", "spe"];
  for (const k of keys) {
    const gain = yieldEVs[k] || 0;
    if (gain <= 0) continue;
    if (total >= MAX_EV_TOTAL) break;
    const room = Math.min(MAX_EV_PER_STAT - out[k], MAX_EV_TOTAL - total);
    if (room <= 0) continue;
    const add = Math.min(gain, room);
    out[k] += add;
    total += add;
  }
  return out;
}

// ---------- Base stat derivation ----------
// Many species in data.ts only declare baseHp & baseAtk. Derive a sensible
// full 6-stat block deterministically from speciesId so the same species
// always has the same base stats across the game.
function seededRand(seed: number) {
  // Simple deterministic LCG
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const SPECIAL_TYPES = new Set<PokeType>([
  "Fire", "Water", "Electric", "Grass", "Psychic", "Ice", "Dragon", "Ghost",
]);

export function isSpecialMove(move: Move): boolean {
  return SPECIAL_TYPES.has(move.type);
}

export function baseStats(sp: Species): StatBlock {
  // Allow per-species overrides by reading optional fields
  const overrides = (sp as unknown as { baseStats?: Partial<StatBlock> }).baseStats;
  if (overrides && typeof overrides.def === "number") {
    return {
      hp: sp.baseHp,
      atk: sp.baseAtk,
      def: overrides.def!,
      spa: overrides.spa!,
      spd: overrides.spd!,
      spe: overrides.spe!,
    };
  }
  const r = seededRand(sp.id + 1);
  // Special-leaning types favor SpAtk over Atk
  const leansSpecial = sp.type.some((t) => SPECIAL_TYPES.has(t));
  const atkLevel = sp.baseAtk;
  const defBase = Math.round(atkLevel * (0.75 + r() * 0.5));
  const spaBase = leansSpecial
    ? Math.round(atkLevel * (0.95 + r() * 0.4))
    : Math.round(atkLevel * (0.55 + r() * 0.4));
  const spdBase = Math.round(atkLevel * (0.7 + r() * 0.45));
  const speBase = Math.round(atkLevel * (0.65 + r() * 0.7));
  return {
    hp: sp.baseHp,
    atk: sp.baseAtk,
    def: Math.max(20, defBase),
    spa: Math.max(20, spaBase),
    spd: Math.max(20, spdBase),
    spe: Math.max(20, speBase),
  };
}

// ---------- Stat calculation ----------
// Standard formulas:
//   HP    = floor(((2*Base + IV + floor(EV/4)) * Level / 100) + Level + 10)
//   Other = floor((floor(((2*Base+IV+floor(EV/4))*Level/100)+5) * NatureMult))
export function calcStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  isHp: boolean,
  natureMult: number,
): number {
  const inner = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  if (isHp) return Math.floor(inner + level + 10);
  return Math.floor((inner + 5) * natureMult);
}

export function computeAllStats(
  sp: Species,
  level: number,
  ivs: StatBlock,
  evs: StatBlock,
  nature: string,
): StatBlock {
  const b = baseStats(sp);
  return {
    hp:  calcStat(b.hp,  ivs.hp,  evs.hp,  level, true,  1.0),
    atk: calcStat(b.atk, ivs.atk, evs.atk, level, false, natureMultiplier(nature, "atk")),
    def: calcStat(b.def, ivs.def, evs.def, level, false, natureMultiplier(nature, "def")),
    spa: calcStat(b.spa, ivs.spa, evs.spa, level, false, natureMultiplier(nature, "spa")),
    spd: calcStat(b.spd, ivs.spd, evs.spd, level, false, natureMultiplier(nature, "spd")),
    spe: calcStat(b.spe, ivs.spe, evs.spe, level, false, natureMultiplier(nature, "spe")),
  };
}

// ---------- EV yield from defeated Pokémon ----------
// Approximate official Pokémon EV yields per species using rarity and base stats.
// Rare/legendary mons grant more.
export function evYieldOf(sp: Species): Partial<StatBlock> {
  // Per-species override if present
  const override = (sp as unknown as { evYield?: Partial<StatBlock> }).evYield;
  if (override) return override;

  const b = baseStats(sp);
  // Find the highest base stat and award 1-3 EVs in that stat by rarity.
  const ranked: { k: StatKey; v: number }[] = [
    { k: "hp", v: b.hp },
    { k: "atk", v: b.atk },
    { k: "def", v: b.def },
    { k: "spa", v: b.spa },
    { k: "spd", v: b.spd },
    { k: "spe", v: b.spe },
  ].sort((a, b) => b.v - a.v);

  const amount = sp.rarity === "legendary" ? 3 : sp.rarity === "rare" ? 2 : 1;
  return { [ranked[0].k]: amount } as Partial<StatBlock>;
}

// ---------- Helpers ----------
export function statColor(k: StatKey): string {
  return STAT_COLORS[k];
}

// Find species by id helper, exported for screens that already import from stats.ts
export function speciesById(id: number): Species | undefined {
  return SPECIES[id];
}
