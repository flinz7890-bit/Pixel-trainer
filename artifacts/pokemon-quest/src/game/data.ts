export type PokeType =
  | "Normal" | "Fire" | "Water" | "Grass" | "Electric" | "Bug" | "Flying"
  | "Poison" | "Rock" | "Ghost" | "Psychic" | "Ice" | "Fighting" | "Ground" | "Dragon";

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
  catchRate: number;
  xpYield: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  sprite: string;
  color: string;
}

export const MOVES: Record<string, Move> = {
  Tackle: { name: "Tackle", power: 8, type: "Normal" },
  Scratch: { name: "Scratch", power: 9, type: "Normal" },
  Ember: { name: "Ember", power: 12, type: "Fire" },
  Flamethrower: { name: "Flamethrower", power: 18, type: "Fire" },
  FireBlast: { name: "Fire Blast", power: 22, type: "Fire" },
  WaterGun: { name: "Water Gun", power: 12, type: "Water" },
  HydroPump: { name: "Hydro Pump", power: 22, type: "Water" },
  Bubble: { name: "Bubble", power: 9, type: "Water" },
  Surf: { name: "Surf", power: 18, type: "Water" },
  VineWhip: { name: "Vine Whip", power: 12, type: "Grass" },
  RazorLeaf: { name: "Razor Leaf", power: 16, type: "Grass" },
  SolarBeam: { name: "Solar Beam", power: 22, type: "Grass" },
  ThunderShock: { name: "Thunder Shock", power: 12, type: "Electric" },
  Thunderbolt: { name: "Thunderbolt", power: 18, type: "Electric" },
  Thunder: { name: "Thunder", power: 22, type: "Electric" },
  QuickAttack: { name: "Quick Attack", power: 10, type: "Normal" },
  Bite: { name: "Bite", power: 11, type: "Normal" },
  Slam: { name: "Slam", power: 14, type: "Normal" },
  HyperBeam: { name: "Hyper Beam", power: 22, type: "Normal" },
  Peck: { name: "Peck", power: 10, type: "Flying" },
  Gust: { name: "Gust", power: 11, type: "Flying" },
  WingAttack: { name: "Wing Attack", power: 14, type: "Flying" },
  PoisonSting: { name: "Poison Sting", power: 10, type: "Poison" },
  Sludge: { name: "Sludge", power: 14, type: "Poison" },
  Smog: { name: "Smog", power: 12, type: "Poison" },
  Acid: { name: "Acid", power: 12, type: "Poison" },
  RockThrow: { name: "Rock Throw", power: 13, type: "Rock" },
  RockSlide: { name: "Rock Slide", power: 18, type: "Rock" },
  Confusion: { name: "Confusion", power: 14, type: "Psychic" },
  Psybeam: { name: "Psybeam", power: 17, type: "Psychic" },
  Psychic: { name: "Psychic", power: 22, type: "Psychic" },
  Lick: { name: "Lick", power: 9, type: "Ghost" },
  ShadowBall: { name: "Shadow Ball", power: 18, type: "Ghost" },
  IceBeam: { name: "Ice Beam", power: 18, type: "Ice" },
  Blizzard: { name: "Blizzard", power: 22, type: "Ice" },
  KarateChop: { name: "Karate Chop", power: 11, type: "Fighting" },
  LowKick: { name: "Low Kick", power: 12, type: "Fighting" },
  Submission: { name: "Submission", power: 16, type: "Fighting" },
  EarthQuake: { name: "Earthquake", power: 22, type: "Ground" },
  DigMove: { name: "Dig", power: 16, type: "Ground" },
  DragonRage: { name: "Dragon Rage", power: 18, type: "Dragon" },
  HyperFang: { name: "Hyper Fang", power: 13, type: "Normal" },
  StringShot: { name: "String Shot", power: 6, type: "Bug" },
  BugBite: { name: "Bug Bite", power: 12, type: "Bug" },
  HornAttack: { name: "Horn Attack", power: 12, type: "Normal" },
  Pound: { name: "Pound", power: 9, type: "Normal" },
};

// ---------- Species (Kanto-focused) ----------
function s(
  id: number, name: string, type: PokeType[], baseHp: number, baseAtk: number,
  moves: Move[], opts: Partial<Species> & { sprite?: string; color?: string } = {}
): Species {
  return {
    id, name, type, baseHp, baseAtk, moves,
    catchRate: opts.catchRate ?? 0.4,
    xpYield: opts.xpYield ?? 22,
    rarity: opts.rarity ?? "uncommon",
    sprite: opts.sprite ?? "❓",
    color: opts.color ?? "#a3a3a3",
    evolvesAt: opts.evolvesAt,
    evolvesTo: opts.evolvesTo,
  };
}

const M = MOVES;

export const SPECIES: Record<number, Species> = {
  // Starters & evos
  1: s(1, "Bulbasaur", ["Grass","Poison"], 45, 12, [M.Tackle, M.VineWhip], { evolvesAt: 16, evolvesTo: 2, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🌱", color: "#65a30d" }),
  2: s(2, "Ivysaur", ["Grass","Poison"], 60, 16, [M.VineWhip, M.RazorLeaf], { evolvesAt: 32, evolvesTo: 3, catchRate: 0.25, xpYield: 35, rarity: "rare", sprite: "🌿", color: "#4d7c0f" }),
  3: s(3, "Venusaur", ["Grass","Poison"], 80, 20, [M.RazorLeaf, M.SolarBeam], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "🌳", color: "#3f6212" }),
  4: s(4, "Charmander", ["Fire"], 39, 13, [M.Scratch, M.Ember], { evolvesAt: 16, evolvesTo: 5, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🔥", color: "#ea580c" }),
  5: s(5, "Charmeleon", ["Fire"], 58, 17, [M.Ember, M.Flamethrower], { evolvesAt: 36, evolvesTo: 6, catchRate: 0.25, xpYield: 35, rarity: "rare", sprite: "🐉", color: "#c2410c" }),
  6: s(6, "Charizard", ["Fire","Flying"], 78, 21, [M.Flamethrower, M.WingAttack, M.FireBlast], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "🐲", color: "#9a3412" }),
  7: s(7, "Squirtle", ["Water"], 44, 12, [M.Tackle, M.WaterGun], { evolvesAt: 16, evolvesTo: 8, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🐢", color: "#0284c7" }),
  8: s(8, "Wartortle", ["Water"], 59, 16, [M.WaterGun, M.Bubble], { evolvesAt: 36, evolvesTo: 9, catchRate: 0.25, xpYield: 35, rarity: "rare", sprite: "🌊", color: "#0369a1" }),
  9: s(9, "Blastoise", ["Water"], 79, 20, [M.HydroPump, M.Surf], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "💦", color: "#0c4a6e" }),

  // Bug line
  10: s(10, "Caterpie", ["Bug"], 35, 8, [M.Tackle, M.StringShot], { evolvesAt: 7, evolvesTo: 11, catchRate: 0.85, xpYield: 10, rarity: "common", sprite: "🐛", color: "#84cc16" }),
  11: s(11, "Metapod", ["Bug"], 45, 9, [M.Tackle, M.StringShot], { evolvesAt: 10, evolvesTo: 12, catchRate: 0.75, xpYield: 14, rarity: "common", sprite: "🟢", color: "#65a30d" }),
  12: s(12, "Butterfree", ["Bug","Flying"], 60, 14, [M.Confusion, M.Gust], { catchRate: 0.4, xpYield: 28, rarity: "uncommon", sprite: "🦋", color: "#a16207" }),
  13: s(13, "Weedle", ["Bug","Poison"], 32, 9, [M.PoisonSting, M.StringShot], { evolvesAt: 7, evolvesTo: 14, catchRate: 0.8, xpYield: 11, rarity: "common", sprite: "🐝", color: "#ca8a04" }),
  14: s(14, "Kakuna", ["Bug","Poison"], 42, 10, [M.PoisonSting], { evolvesAt: 10, evolvesTo: 15, catchRate: 0.7, xpYield: 14, rarity: "common", sprite: "🟡", color: "#a16207" }),
  15: s(15, "Beedrill", ["Bug","Poison"], 58, 14, [M.PoisonSting, M.BugBite], { catchRate: 0.4, xpYield: 28, rarity: "uncommon", sprite: "🟨", color: "#854d0e" }),

  // Bird line
  16: s(16, "Pidgey", ["Normal","Flying"], 40, 10, [M.Tackle, M.Gust], { evolvesAt: 18, evolvesTo: 17, catchRate: 0.7, xpYield: 14, rarity: "common", sprite: "🐦", color: "#a3a3a3" }),
  17: s(17, "Pidgeotto", ["Normal","Flying"], 55, 14, [M.Gust, M.WingAttack], { evolvesAt: 36, evolvesTo: 18, catchRate: 0.4, xpYield: 28, rarity: "uncommon", sprite: "🕊️", color: "#737373" }),
  18: s(18, "Pidgeot", ["Normal","Flying"], 72, 18, [M.WingAttack, M.HyperBeam], { catchRate: 0.25, xpYield: 42, rarity: "uncommon", sprite: "🦅", color: "#525252" }),

  // Rat
  19: s(19, "Rattata", ["Normal"], 30, 11, [M.Tackle, M.QuickAttack], { evolvesAt: 20, evolvesTo: 20, catchRate: 0.75, xpYield: 12, rarity: "common", sprite: "🐭", color: "#a855f7" }),
  20: s(20, "Raticate", ["Normal"], 55, 16, [M.QuickAttack, M.HyperFang], { catchRate: 0.4, xpYield: 28, rarity: "uncommon", sprite: "🐀", color: "#7e22ce" }),

  // Spearow
  21: s(21, "Spearow", ["Normal","Flying"], 40, 12, [M.Peck, M.Gust], { evolvesAt: 20, evolvesTo: 22, catchRate: 0.65, xpYield: 16, rarity: "common", sprite: "🐤", color: "#b45309" }),
  22: s(22, "Fearow", ["Normal","Flying"], 65, 17, [M.Peck, M.WingAttack], { catchRate: 0.35, xpYield: 32, rarity: "uncommon", sprite: "🦅", color: "#92400e" }),

  // Snake
  23: s(23, "Ekans", ["Poison"], 35, 12, [M.PoisonSting, M.Bite], { evolvesAt: 22, evolvesTo: 24, catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🐍", color: "#7c3aed" }),
  24: s(24, "Arbok", ["Poison"], 60, 17, [M.Acid, M.Bite], { catchRate: 0.3, xpYield: 35, rarity: "uncommon", sprite: "🟣", color: "#6d28d9" }),

  // Pikachu
  25: s(25, "Pikachu", ["Electric"], 35, 14, [M.QuickAttack, M.ThunderShock], { evolvesAt: 22, evolvesTo: 26, catchRate: 0.35, xpYield: 24, rarity: "rare", sprite: "⚡", color: "#facc15" }),
  26: s(26, "Raichu", ["Electric"], 60, 18, [M.Thunderbolt, M.Thunder], { catchRate: 0.2, xpYield: 38, rarity: "rare", sprite: "⚡", color: "#eab308" }),

  // Sandshrew
  27: s(27, "Sandshrew", ["Ground"], 50, 13, [M.Scratch, M.DigMove], { evolvesAt: 22, evolvesTo: 28, catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🟫", color: "#a16207" }),
  28: s(28, "Sandslash", ["Ground"], 75, 18, [M.DigMove, M.Slam], { catchRate: 0.3, xpYield: 35, rarity: "uncommon", sprite: "🟧", color: "#854d0e" }),

  // Nido line
  31: s(31, "Nidoqueen", ["Poison","Ground"], 90, 19, [M.Sludge, M.EarthQuake], { catchRate: 0.2, xpYield: 45, rarity: "rare", sprite: "👸", color: "#9333ea" }),
  34: s(34, "Nidoking", ["Poison","Ground"], 81, 21, [M.PoisonSting, M.EarthQuake, M.HornAttack], { catchRate: 0.2, xpYield: 45, rarity: "rare", sprite: "🤴", color: "#7e22ce" }),

  // Cleffairy / Jigglypuff
  35: s(35, "Clefairy", ["Normal"], 70, 11, [M.Pound, M.Slam], { catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "🌸", color: "#f9a8d4" }),
  39: s(39, "Jigglypuff", ["Normal"], 115, 9, [M.Pound, M.Slam], { catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "🎀", color: "#f472b6" }),
  40: s(40, "Wigglytuff", ["Normal"], 140, 14, [M.Slam, M.HyperBeam], { catchRate: 0.25, xpYield: 38, rarity: "uncommon", sprite: "💗", color: "#ec4899" }),

  // Zubat
  41: s(41, "Zubat", ["Poison","Flying"], 36, 10, [M.Bite, M.Gust], { evolvesAt: 22, evolvesTo: 42, catchRate: 0.65, xpYield: 16, rarity: "uncommon", sprite: "🦇", color: "#7c3aed" }),
  42: s(42, "Golbat", ["Poison","Flying"], 60, 17, [M.Bite, M.WingAttack], { catchRate: 0.3, xpYield: 35, rarity: "uncommon", sprite: "🦇", color: "#6d28d9" }),

  // Gloom / Vileplume
  44: s(44, "Gloom", ["Grass","Poison"], 60, 15, [M.Acid, M.RazorLeaf], { catchRate: 0.3, xpYield: 28, rarity: "uncommon", sprite: "🌷", color: "#b91c1c" }),
  45: s(45, "Vileplume", ["Grass","Poison"], 75, 20, [M.SolarBeam, M.Sludge], { catchRate: 0.2, xpYield: 42, rarity: "rare", sprite: "🌺", color: "#dc2626" }),

  // Paras
  48: s(48, "Venonat", ["Bug","Poison"], 60, 12, [M.Tackle, M.Confusion], { evolvesAt: 31, evolvesTo: 49, catchRate: 0.45, xpYield: 22, rarity: "uncommon", sprite: "🪲", color: "#9333ea" }),
  49: s(49, "Venomoth", ["Bug","Poison"], 70, 17, [M.Confusion, M.PoisonSting], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🦋", color: "#7c3aed" }),

  // Diglett
  50: s(50, "Diglett", ["Ground"], 30, 14, [M.Scratch, M.DigMove], { evolvesAt: 26, evolvesTo: 51, catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🟤", color: "#92400e" }),
  51: s(51, "Dugtrio", ["Ground"], 55, 19, [M.DigMove, M.EarthQuake], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🟫", color: "#78350f" }),

  // Meowth
  52: s(52, "Meowth", ["Normal"], 40, 11, [M.Scratch, M.Bite], { evolvesAt: 28, evolvesTo: 53, catchRate: 0.6, xpYield: 16, rarity: "uncommon", sprite: "🐱", color: "#fbbf24" }),
  53: s(53, "Persian", ["Normal"], 65, 17, [M.Bite, M.Slam], { catchRate: 0.3, xpYield: 32, rarity: "uncommon", sprite: "🐈", color: "#d97706" }),

  // Mankey
  56: s(56, "Mankey", ["Fighting"], 40, 13, [M.Scratch, M.KarateChop], { evolvesAt: 28, evolvesTo: 57, catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🙈", color: "#b45309" }),
  57: s(57, "Primeape", ["Fighting"], 65, 18, [M.KarateChop, M.LowKick], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🦍", color: "#92400e" }),

  // Growlithe / Arcanine
  58: s(58, "Growlithe", ["Fire"], 55, 15, [M.Bite, M.Ember], { catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "🐶", color: "#ea580c" }),
  59: s(59, "Arcanine", ["Fire"], 90, 22, [M.Flamethrower, M.Bite], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "🐕", color: "#c2410c" }),

  // Poliwag
  60: s(60, "Poliwag", ["Water"], 40, 11, [M.Bubble, M.WaterGun], { evolvesAt: 25, evolvesTo: 61, catchRate: 0.6, xpYield: 18, rarity: "uncommon", sprite: "💧", color: "#0ea5e9" }),
  61: s(61, "Poliwhirl", ["Water"], 60, 16, [M.WaterGun, M.Bubble], { catchRate: 0.3, xpYield: 32, rarity: "uncommon", sprite: "🌀", color: "#0284c7" }),

  // Abra line
  63: s(63, "Abra", ["Psychic"], 30, 11, [M.Confusion], { evolvesAt: 16, evolvesTo: 64, catchRate: 0.45, xpYield: 20, rarity: "uncommon", sprite: "🔮", color: "#d97706" }),
  64: s(64, "Kadabra", ["Psychic"], 50, 17, [M.Confusion, M.Psybeam], { evolvesAt: 36, evolvesTo: 65, catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🥄", color: "#b45309" }),
  65: s(65, "Alakazam", ["Psychic"], 70, 22, [M.Psychic, M.Psybeam], { catchRate: 0.15, xpYield: 52, rarity: "rare", sprite: "🧙", color: "#92400e" }),

  // Machop
  66: s(66, "Machop", ["Fighting"], 55, 14, [M.KarateChop, M.LowKick], { evolvesAt: 28, evolvesTo: 67, catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "💪", color: "#a16207" }),
  67: s(67, "Machoke", ["Fighting"], 75, 18, [M.KarateChop, M.Submission], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🥊", color: "#854d0e" }),
  68: s(68, "Machamp", ["Fighting"], 90, 23, [M.Submission, M.LowKick], { catchRate: 0.15, xpYield: 52, rarity: "rare", sprite: "🤜", color: "#713f12" }),

  // Bell line
  69: s(69, "Bellsprout", ["Grass","Poison"], 50, 14, [M.VineWhip, M.Acid], { evolvesAt: 21, evolvesTo: 70, catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "🌱", color: "#65a30d" }),
  71: s(71, "Victreebel", ["Grass","Poison"], 80, 21, [M.RazorLeaf, M.Acid], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "🌿", color: "#4d7c0f" }),

  // Tentacool
  72: s(72, "Tentacool", ["Water","Poison"], 40, 12, [M.PoisonSting, M.Acid], { evolvesAt: 30, evolvesTo: 73, catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "🌊", color: "#0891b2" }),
  73: s(73, "Tentacruel", ["Water","Poison"], 70, 18, [M.HydroPump, M.Acid], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🪼", color: "#0e7490" }),

  // Geodude
  74: s(74, "Geodude", ["Rock","Ground"], 42, 13, [M.Tackle, M.RockThrow], { evolvesAt: 25, evolvesTo: 75, catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🪨", color: "#78716c" }),
  75: s(75, "Graveler", ["Rock","Ground"], 60, 17, [M.RockThrow, M.RockSlide], { catchRate: 0.3, xpYield: 35, rarity: "uncommon", sprite: "⛰️", color: "#57534e" }),
  76: s(76, "Golem", ["Rock","Ground"], 80, 22, [M.RockSlide, M.EarthQuake], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "🪨", color: "#44403c" }),

  // Ponyta
  77: s(77, "Ponyta", ["Fire"], 50, 14, [M.Ember, M.Tackle], { evolvesAt: 40, evolvesTo: 78, catchRate: 0.45, xpYield: 22, rarity: "uncommon", sprite: "🐎", color: "#f97316" }),
  78: s(78, "Rapidash", ["Fire"], 70, 20, [M.Flamethrower, M.QuickAttack], { catchRate: 0.2, xpYield: 42, rarity: "rare", sprite: "🦄", color: "#ea580c" }),

  // Magnemite
  81: s(81, "Magnemite", ["Electric"], 35, 14, [M.ThunderShock, M.Tackle], { evolvesAt: 30, evolvesTo: 82, catchRate: 0.5, xpYield: 20, rarity: "uncommon", sprite: "🔩", color: "#facc15" }),
  82: s(82, "Magneton", ["Electric"], 60, 19, [M.Thunderbolt, M.Thunder], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "⚙️", color: "#eab308" }),

  // Doduo
  84: s(84, "Doduo", ["Normal","Flying"], 35, 13, [M.Peck, M.QuickAttack], { evolvesAt: 31, evolvesTo: 85, catchRate: 0.55, xpYield: 18, rarity: "uncommon", sprite: "🐦", color: "#a16207" }),
  85: s(85, "Dodrio", ["Normal","Flying"], 60, 19, [M.Peck, M.WingAttack], { catchRate: 0.3, xpYield: 38, rarity: "rare", sprite: "🪶", color: "#854d0e" }),

  // Grimer / Muk
  88: s(88, "Grimer", ["Poison"], 80, 14, [M.PoisonSting, M.Sludge], { evolvesAt: 38, evolvesTo: 89, catchRate: 0.5, xpYield: 28, rarity: "uncommon", sprite: "🟣", color: "#7c3aed" }),
  89: s(89, "Muk", ["Poison"], 105, 20, [M.Sludge, M.Acid], { catchRate: 0.2, xpYield: 45, rarity: "rare", sprite: "🟪", color: "#6d28d9" }),

  // Ghost line
  92: s(92, "Gastly", ["Ghost","Poison"], 38, 12, [M.Lick, M.Confusion], { evolvesAt: 25, evolvesTo: 93, catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "👻", color: "#6b21a8" }),
  93: s(93, "Haunter", ["Ghost","Poison"], 50, 17, [M.ShadowBall, M.Confusion], { evolvesAt: 40, evolvesTo: 94, catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "💀", color: "#581c87" }),
  94: s(94, "Gengar", ["Ghost","Poison"], 75, 22, [M.ShadowBall, M.Sludge, M.Psychic], { catchRate: 0.15, xpYield: 52, rarity: "rare", sprite: "👹", color: "#4c1d95" }),

  // Onix
  95: s(95, "Onix", ["Rock","Ground"], 35, 16, [M.RockThrow, M.Slam, M.Bite], { catchRate: 0.3, xpYield: 32, rarity: "uncommon", sprite: "🐍", color: "#78716c" }),

  // Drowzee
  96: s(96, "Drowzee", ["Psychic"], 60, 12, [M.Pound, M.Confusion], { evolvesAt: 26, evolvesTo: 97, catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "💤", color: "#facc15" }),
  97: s(97, "Hypno", ["Psychic"], 85, 18, [M.Psychic, M.Psybeam], { catchRate: 0.25, xpYield: 42, rarity: "rare", sprite: "🌙", color: "#eab308" }),

  // Voltorb
  100: s(100, "Voltorb", ["Electric"], 40, 13, [M.Tackle, M.ThunderShock], { evolvesAt: 30, evolvesTo: 101, catchRate: 0.5, xpYield: 20, rarity: "uncommon", sprite: "🔴", color: "#dc2626" }),
  101: s(101, "Electrode", ["Electric"], 60, 19, [M.Thunderbolt, M.Thunder], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🔵", color: "#2563eb" }),

  // Koffing
  109: s(109, "Koffing", ["Poison"], 40, 14, [M.Smog, M.Sludge], { evolvesAt: 35, evolvesTo: 110, catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "🟫", color: "#6b21a8" }),
  110: s(110, "Weezing", ["Poison"], 65, 20, [M.Sludge, M.Smog], { catchRate: 0.2, xpYield: 42, rarity: "rare", sprite: "💨", color: "#581c87" }),

  // Rhyhorn / Rhydon
  111: s(111, "Rhyhorn", ["Ground","Rock"], 80, 16, [M.HornAttack, M.RockThrow], { evolvesAt: 42, evolvesTo: 112, catchRate: 0.4, xpYield: 28, rarity: "uncommon", sprite: "🦏", color: "#a16207" }),
  112: s(112, "Rhydon", ["Ground","Rock"], 105, 22, [M.HornAttack, M.EarthQuake, M.RockSlide], { catchRate: 0.15, xpYield: 50, rarity: "rare", sprite: "🦏", color: "#854d0e" }),

  // Tangela
  114: s(114, "Tangela", ["Grass"], 65, 17, [M.VineWhip, M.SolarBeam], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🌿", color: "#15803d" }),

  // Mr. Mime
  122: s(122, "Mr. Mime", ["Psychic"], 40, 17, [M.Confusion, M.Psybeam], { catchRate: 0.25, xpYield: 38, rarity: "rare", sprite: "🃏", color: "#ec4899" }),

  // Magikarp / Gyarados
  129: s(129, "Magikarp", ["Water"], 20, 5, [M.Tackle], { evolvesAt: 20, evolvesTo: 130, catchRate: 0.95, xpYield: 6, rarity: "common", sprite: "🐟", color: "#fb923c" }),
  130: s(130, "Gyarados", ["Water","Flying"], 95, 22, [M.HydroPump, M.Bite, M.HyperBeam], { catchRate: 0.15, xpYield: 55, rarity: "rare", sprite: "🐉", color: "#1d4ed8" }),

  // Lapras
  131: s(131, "Lapras", ["Water","Ice"], 130, 19, [M.IceBeam, M.HydroPump, M.Blizzard], { catchRate: 0.15, xpYield: 60, rarity: "rare", sprite: "🐳", color: "#0e7490" }),

  // Ditto
  132: s(132, "Ditto", ["Normal"], 48, 12, [M.Pound], { catchRate: 0.4, xpYield: 22, rarity: "rare", sprite: "🟪", color: "#a78bfa" }),

  // Staryu / Starmie
  120: s(120, "Staryu", ["Water"], 30, 13, [M.WaterGun, M.Tackle], { evolvesAt: 26, evolvesTo: 121, catchRate: 0.5, xpYield: 22, rarity: "uncommon", sprite: "⭐", color: "#f59e0b" }),
  121: s(121, "Starmie", ["Water","Psychic"], 60, 20, [M.HydroPump, M.Psybeam], { catchRate: 0.2, xpYield: 45, rarity: "rare", sprite: "🌟", color: "#d97706" }),

  // Vulpix / Ninetales
  37: s(37, "Vulpix", ["Fire"], 38, 12, [M.Ember, M.QuickAttack], { evolvesAt: 30, evolvesTo: 38, catchRate: 0.45, xpYield: 22, rarity: "uncommon", sprite: "🦊", color: "#f97316" }),
  38: s(38, "Ninetales", ["Fire"], 73, 19, [M.Flamethrower, M.FireBlast], { catchRate: 0.2, xpYield: 45, rarity: "rare", sprite: "🦊", color: "#ea580c" }),

  // Dragon line
  147: s(147, "Dratini", ["Dragon"], 41, 13, [M.Tackle, M.DragonRage], { evolvesAt: 30, evolvesTo: 148, catchRate: 0.4, xpYield: 25, rarity: "rare", sprite: "🐍", color: "#3b82f6" }),
  148: s(148, "Dragonair", ["Dragon"], 61, 18, [M.DragonRage, M.Slam], { evolvesAt: 55, evolvesTo: 149, catchRate: 0.2, xpYield: 42, rarity: "rare", sprite: "🐉", color: "#1d4ed8" }),
  149: s(149, "Dragonite", ["Dragon","Flying"], 91, 24, [M.DragonRage, M.WingAttack, M.HyperBeam], { catchRate: 0.1, xpYield: 60, rarity: "rare", sprite: "🐲", color: "#1e40af" }),
};

export const STARTERS = [4, 7, 1, 25];

// ---------- Type effectiveness ----------
type TypeChart = Partial<Record<PokeType, Partial<Record<PokeType, number>>>>;
const CHART: TypeChart = {
  Normal:   { Rock: 0.5, Ghost: 0 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice:      { Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Bug: 0.5, Rock: 0.5, Ghost: 0.5 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2 },
  Ghost:    { Normal: 0, Psychic: 0, Ghost: 2 },
  Dragon:   { Dragon: 2 },
};

export function effectiveness(moveType: PokeType, defenderTypes: PokeType[]): number {
  let mult = 1;
  for (const t of defenderTypes) {
    const m = CHART[moveType]?.[t];
    if (m !== undefined) mult *= m;
  }
  return mult;
}

export function effectivenessLabel(mult: number): string {
  if (mult === 0) return "It had no effect…";
  if (mult >= 2) return "It's super effective!";
  if (mult > 0 && mult < 1) return "It's not very effective…";
  return "";
}

// ---------- Trainers / Locations ----------
export interface TrainerNPC {
  id: string;
  title: string;
  name: string;
  sprite: string;
  team: { speciesId: number; level: number }[];
  reward: number;
  intro: string;
  postLoss?: string;
  requiresPrevTrainerId?: string;
  isRocket?: boolean;
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
  arrivalBadge?: string;
  arrivalMessage?: string;
  requiresBadges?: number;
}

const enc = (speciesId: number, weight: number, minLevel: number, maxLevel: number) =>
  ({ speciesId, weight, minLevel, maxLevel });

export const LOCATIONS: Location[] = [
  { id: "pallet", name: "Pallet Town", emoji: "🏡", isTown: true, encounters: [], nextLocationId: "route1" },

  { id: "route1", name: "Route 1", emoji: "🌾", encounters: [enc(16,4,2,4), enc(19,4,2,4)],
    trainers: [{ id: "r1-joey", title: "Youngster", name: "Joey", sprite: "🧒", team: [{speciesId:19,level:4}], reward: 80, intro: "My Rattata is in the top percentage!" }],
    prevLocationId: "pallet", nextLocationId: "viridian" },

  { id: "viridian", name: "Viridian City", emoji: "🌲", isTown: true, gymId: "giovanni", encounters: [],
    prevLocationId: "route1", nextLocationId: "route2" },

  { id: "route2", name: "Route 2", emoji: "🌳", encounters: [enc(16,3,3,5), enc(19,3,3,5), enc(10,3,3,5), enc(13,3,3,5)],
    trainers: [{ id: "r2-bug", title: "Bug Catcher", name: "Doug", sprite: "🪳", team: [{speciesId:10,level:6},{speciesId:13,level:6}], reward: 140, intro: "Bugs rule! Take this!" }],
    prevLocationId: "viridian", nextLocationId: "pewter" },

  { id: "pewter", name: "Pewter City", emoji: "🏛️", isTown: true, gymId: "brock", encounters: [],
    prevLocationId: "route2", nextLocationId: "route3" },

  { id: "route3", name: "Route 3", emoji: "⛰️", encounters: [enc(21,4,6,9), enc(39,2,6,8), enc(56,3,6,9), enc(74,2,6,9)],
    trainers: [{ id: "r3-hiker", title: "Hiker", name: "Marty", sprite: "🥾", team: [{speciesId:74,level:8},{speciesId:74,level:9}], reward: 220, intro: "These mountains are mine! Battle!" }],
    prevLocationId: "pewter", nextLocationId: "mtmoon" },

  { id: "mtmoon", name: "Mt. Moon", emoji: "🌑", encounters: [enc(41,5,7,10), enc(74,3,7,10), enc(35,2,7,9)],
    trainers: [
      { id: "mm-rocket1", title: "Team Rocket Grunt", name: "R", sprite: "🅁", isRocket: true,
        team: [{speciesId:19,level:9},{speciesId:23,level:9}], reward: 540,
        intro: "Prepare for trouble! Hand over your Pokémon!",
        postLoss: "Team Rocket never forgets a face, twerp!" },
      { id: "mm-rocket2", title: "Team Rocket Grunt", name: "R", sprite: "🅁", isRocket: true,
        team: [{speciesId:41,level:10},{speciesId:109,level:10}], reward: 540,
        intro: "Prepare for trouble! Hand over your Pokémon!",
        postLoss: "Team Rocket never forgets a face, twerp!" },
    ],
    prevLocationId: "route3", nextLocationId: "route4" },

  { id: "route4", name: "Route 4", emoji: "🏜️", encounters: [enc(21,3,8,11), enc(23,3,8,11), enc(27,3,8,11), enc(129,2,5,10)],
    trainers: [{ id: "r4-lass", title: "Lass", name: "Iris", sprite: "👧", team: [{speciesId:23,level:10}], reward: 200, intro: "I'll show you what I've got!" }],
    prevLocationId: "mtmoon", nextLocationId: "cerulean" },

  { id: "cerulean", name: "Cerulean City", emoji: "💧", isTown: true, gymId: "misty", encounters: [],
    trainers: [
      { id: "ce-rocket-bridge", title: "Team Rocket Grunt", name: "R", sprite: "🅁", isRocket: true,
        team: [{speciesId:88,level:13},{speciesId:19,level:12}], reward: 720,
        intro: "Prepare for trouble! Hand over your Pokémon!",
        postLoss: "Team Rocket never forgets a face, twerp!" },
    ],
    prevLocationId: "route4", nextLocationId: "route5" },

  { id: "route5", name: "Route 5", emoji: "🛤️", encounters: [enc(16,3,10,13), enc(52,3,10,13), enc(56,2,10,13), enc(63,2,10,13)],
    trainers: [{ id: "r5-jr", title: "Jr. Trainer♀", name: "Sally", sprite: "👩", team: [{speciesId:52,level:14}], reward: 280, intro: "I bet I can win!" }],
    prevLocationId: "cerulean", nextLocationId: "route6" },

  { id: "route6", name: "Route 6", emoji: "🌳", encounters: [enc(52,3,12,15), enc(56,2,12,15), enc(63,2,12,15), enc(16,3,12,15)],
    trainers: [{ id: "r6-camp", title: "Camper", name: "Liam", sprite: "🏕️", team: [{speciesId:21,level:14},{speciesId:74,level:14}], reward: 320, intro: "Wanna camp out and battle?" }],
    prevLocationId: "route5", nextLocationId: "vermilion" },

  { id: "vermilion", name: "Vermilion City", emoji: "⚓", isTown: true, gymId: "surge", encounters: [],
    prevLocationId: "route6", nextLocationId: "route7" },

  { id: "route7", name: "Route 7", emoji: "🌳", encounters: [enc(52,3,17,19), enc(16,2,17,19), enc(56,2,17,19), enc(63,3,17,19)],
    trainers: [{ id: "r7-lass", title: "Lass", name: "Robin", sprite: "👧", team: [{speciesId:39,level:18}], reward: 360, intro: "You look strong!" }],
    prevLocationId: "vermilion", nextLocationId: "route8" },

  { id: "route8", name: "Route 8", emoji: "🛣️", encounters: [enc(52,3,18,20), enc(56,2,18,20), enc(96,3,18,20), enc(23,2,18,20)],
    trainers: [{ id: "r8-gent", title: "Gentleman", name: "Hugh", sprite: "🎩", team: [{speciesId:39,level:19},{speciesId:35,level:19}], reward: 760, intro: "I've a fine team!" }],
    prevLocationId: "route7", nextLocationId: "lavender" },

  { id: "lavender", name: "Lavender Town", emoji: "🪦", isTown: true, encounters: [],
    trainers: [
      { id: "lav-rocket-tower", title: "Team Rocket Grunt", name: "R", sprite: "🅁", isRocket: true,
        team: [{speciesId:92,level:20},{speciesId:41,level:20}], reward: 1080,
        intro: "Prepare for trouble! Hand over your Pokémon!",
        postLoss: "Team Rocket never forgets a face, twerp!" },
    ],
    prevLocationId: "route8", nextLocationId: "route9" },

  { id: "route9", name: "Route 9", emoji: "🌾", encounters: [enc(100,3,16,18), enc(81,3,16,18), enc(84,3,16,18), enc(21,2,16,18)],
    trainers: [{ id: "r9-bug", title: "Bug Catcher", name: "Wade", sprite: "🪲", team: [{speciesId:48,level:18},{speciesId:11,level:18}], reward: 360, intro: "Bugs are best!" }],
    prevLocationId: "lavender", nextLocationId: "route10" },

  { id: "route10", name: "Route 10", emoji: "⚡", encounters: [enc(100,3,17,19), enc(81,3,17,19), enc(84,3,17,19)],
    trainers: [{ id: "r10-pkmnia", title: "Pokémaniac", name: "Steve", sprite: "🤓", team: [{speciesId:96,level:20},{speciesId:111,level:20}], reward: 800, intro: "I love rare ones!" }],
    prevLocationId: "route9", nextLocationId: "celadon" },

  { id: "celadon", name: "Celadon City", emoji: "🌷", isTown: true, gymId: "erika", encounters: [],
    prevLocationId: "route10", nextLocationId: "route11" },

  { id: "route11", name: "Route 11", emoji: "🌾", encounters: [enc(23,3,15,18), enc(96,3,15,18), enc(132,1,15,18), enc(21,3,15,18)],
    trainers: [{ id: "r11-eng", title: "Engineer", name: "Bernie", sprite: "👷", team: [{speciesId:81,level:21},{speciesId:100,level:21}], reward: 840, intro: "Electrifying!" }],
    prevLocationId: "celadon", nextLocationId: "route12" },

  { id: "route12", name: "Route 12", emoji: "🎣", encounters: [enc(43,3,24,26), enc(13,2,24,26), enc(132,1,24,26), enc(129,2,5,15)],
    trainers: [{ id: "r12-fish", title: "Fisherman", name: "Marc", sprite: "🎣", team: [{speciesId:129,level:24},{speciesId:60,level:24}], reward: 700, intro: "Reel them in!" }],
    prevLocationId: "route11", nextLocationId: "route13" },

  { id: "route13", name: "Route 13", emoji: "🌾", encounters: [enc(23,3,22,25), enc(132,1,22,25), enc(96,2,22,25), enc(21,3,22,25)],
    trainers: [{ id: "r13-bird", title: "Bird Keeper", name: "Perry", sprite: "🦅", team: [{speciesId:21,level:26},{speciesId:22,level:26}], reward: 780, intro: "Birds for the win!" }],
    prevLocationId: "route12", nextLocationId: "route14" },

  { id: "route14", name: "Route 14", emoji: "🌾", encounters: [enc(23,3,24,26), enc(132,1,24,26), enc(96,2,24,26), enc(84,3,24,26)],
    trainers: [{ id: "r14-bird", title: "Bird Keeper", name: "Chester", sprite: "🦅", team: [{speciesId:84,level:26}], reward: 624, intro: "Take wing!" }],
    prevLocationId: "route13", nextLocationId: "route15" },

  { id: "route15", name: "Route 15", emoji: "🌾", encounters: [enc(23,3,25,27), enc(132,1,25,27), enc(96,2,25,27), enc(85,2,25,27)],
    trainers: [{ id: "r15-jr", title: "Jr. Trainer♂", name: "Owen", sprite: "🧑", team: [{speciesId:81,level:28}], reward: 672, intro: "Spark battle!" }],
    prevLocationId: "route14", nextLocationId: "fuchsia" },

  { id: "fuchsia", name: "Fuchsia City", emoji: "🦒", isTown: true, gymId: "koga", encounters: [],
    trainers: [
      { id: "saffron-silph-exec", title: "Rocket Executive", name: "Archer", sprite: "🅁", isRocket: true,
        team: [{speciesId:42,level:38},{speciesId:24,level:38},{speciesId:53,level:39}], reward: 2400,
        intro: "Silph Co. is ours! You won't leave this place!",
        postLoss: "Giovanni will hear of this!" },
    ],
    prevLocationId: "route15", nextLocationId: "route19" },

  { id: "route19", name: "Route 19", emoji: "🌊", encounters: [enc(72,5,20,30), enc(73,1,28,32)],
    trainers: [{ id: "r19-swim", title: "Swimmer", name: "Luis", sprite: "🏊", team: [{speciesId:72,level:30},{speciesId:60,level:30}], reward: 720, intro: "Wave to wave!" }],
    prevLocationId: "fuchsia", nextLocationId: "route20" },

  { id: "route20", name: "Route 20", emoji: "🌊", encounters: [enc(72,5,25,30), enc(73,2,28,32)],
    trainers: [{ id: "r20-swim", title: "Swimmer", name: "Diana", sprite: "🏊‍♀️", team: [{speciesId:73,level:30}], reward: 720, intro: "Splash!" }],
    prevLocationId: "route19", nextLocationId: "cinnabar" },

  { id: "cinnabar", name: "Cinnabar Island", emoji: "🌋", isTown: true, gymId: "blaine", encounters: [],
    prevLocationId: "route20", nextLocationId: "route21" },

  { id: "route21", name: "Route 21", emoji: "🌊", encounters: [enc(72,4,30,35), enc(129,2,5,15), enc(73,2,30,35)],
    trainers: [{ id: "r21-fish", title: "Fisherman", name: "Murphy", sprite: "🎣", team: [{speciesId:129,level:33},{speciesId:60,level:33}], reward: 880, intro: "Big one bites!" }],
    prevLocationId: "cinnabar", nextLocationId: "route22" },

  { id: "route22", name: "Route 22", emoji: "🛤️", encounters: [enc(19,3,2,4), enc(21,3,2,4), enc(56,2,2,4)],
    trainers: [{ id: "r22-rival", title: "Rival", name: "Blue", sprite: "🧑‍🎤", team: [{speciesId:7,level:40},{speciesId:18,level:40}], reward: 2000, intro: "Hey loser!" }],
    prevLocationId: "route21", nextLocationId: "route23" },

  { id: "route23", name: "Route 23", emoji: "🚪", encounters: [enc(21,2,30,40), enc(22,2,30,40), enc(85,2,30,40)],
    trainers: [{ id: "r23-cooltrainer", title: "Cooltrainer", name: "Mary", sprite: "🧑‍🎓", team: [{speciesId:24,level:41},{speciesId:53,level:41}], reward: 1640, intro: "Ready?" }],
    prevLocationId: "route22", nextLocationId: "indigo", requiresBadges: 8 },

  { id: "indigo", name: "Indigo Plateau", emoji: "🏯", encounters: [], requiresBadges: 8,
    prevLocationId: "route23",
    arrivalMessage: "You've reached the Indigo Plateau! Face the Elite Four to become Champion.",
    trainers: [
      { id: "e4-lorelei", title: "Elite Four", name: "Lorelei", sprite: "❄️",
        team: [{speciesId:131,level:54},{speciesId:121,level:52},{speciesId:120,level:50}], reward: 5000,
        intro: "Welcome to my room! I never lose at ice!" },
      { id: "e4-bruno", title: "Elite Four", name: "Bruno", sprite: "🥋",
        team: [{speciesId:95,level:53},{speciesId:67,level:55},{speciesId:68,level:58}], reward: 5500,
        intro: "I make my Pokémon train to perfection!", requiresPrevTrainerId: "e4-lorelei" },
      { id: "e4-agatha", title: "Elite Four", name: "Agatha", sprite: "🧙‍♀️",
        team: [{speciesId:94,level:56},{speciesId:42,level:55},{speciesId:24,level:56},{speciesId:94,level:58}], reward: 6000,
        intro: "Hoo hoo! Frighten or be frightened!", requiresPrevTrainerId: "e4-bruno" },
      { id: "e4-lance", title: "Elite Four", name: "Lance", sprite: "🐲",
        team: [{speciesId:130,level:58},{speciesId:148,level:56},{speciesId:148,level:56},{speciesId:149,level:62}], reward: 7000,
        intro: "I am Lance, the Dragon master!", requiresPrevTrainerId: "e4-agatha" },
      { id: "champion-blue", title: "Champion", name: "Blue", sprite: "👑",
        team: [{speciesId:18,level:61},{speciesId:65,level:59},{speciesId:130,level:61},{speciesId:9,level:65}], reward: 10000,
        intro: "Hey! I'm the Champion! No one beats me!", requiresPrevTrainerId: "e4-lance" },
    ],
  },
];

// ---------- Gym Leaders ----------
export interface GymLeader {
  id: string;
  name: string;
  city: string;
  badge: string;
  type: PokeType;
  team: { speciesId: number; level: number }[];
  reward: number;
  unlockBadgeCount: number;
  quote: string;
}

export const GYMS: GymLeader[] = [
  { id: "brock", name: "Brock", city: "Pewter City", badge: "Boulder Badge", type: "Rock",
    team: [{speciesId:74,level:12},{speciesId:95,level:14}], reward: 700, unlockBadgeCount: 0,
    quote: "Take this — the Boulder Badge!" },
  { id: "misty", name: "Misty", city: "Cerulean City", badge: "Cascade Badge", type: "Water",
    team: [{speciesId:120,level:18},{speciesId:121,level:21}], reward: 1100, unlockBadgeCount: 1,
    quote: "Wow, you're too much! Here's the Cascade Badge!" },
  { id: "surge", name: "Lt. Surge", city: "Vermilion City", badge: "Thunder Badge", type: "Electric",
    team: [{speciesId:100,level:21},{speciesId:25,level:18},{speciesId:26,level:24}], reward: 1500, unlockBadgeCount: 2,
    quote: "You earned the Thunder Badge, soldier!" },
  { id: "erika", name: "Erika", city: "Celadon City", badge: "Rainbow Badge", type: "Grass",
    team: [{speciesId:71,level:29},{speciesId:114,level:24},{speciesId:45,level:29}], reward: 1900, unlockBadgeCount: 3,
    quote: "I have my pride as a gardener… please take the Rainbow Badge." },
  { id: "koga", name: "Koga", city: "Fuchsia City", badge: "Soul Badge", type: "Poison",
    team: [{speciesId:109,level:37},{speciesId:89,level:39},{speciesId:109,level:37},{speciesId:110,level:43}], reward: 2300, unlockBadgeCount: 4,
    quote: "Humph! Take the Soul Badge as proof of your win." },
  { id: "sabrina", name: "Sabrina", city: "Saffron City", badge: "Marsh Badge", type: "Psychic",
    team: [{speciesId:64,level:38},{speciesId:122,level:37},{speciesId:49,level:38},{speciesId:65,level:43}], reward: 2700, unlockBadgeCount: 5,
    quote: "I lost… you have the Marsh Badge." },
  { id: "blaine", name: "Blaine", city: "Cinnabar Island", badge: "Volcano Badge", type: "Fire",
    team: [{speciesId:58,level:42},{speciesId:77,level:40},{speciesId:78,level:42},{speciesId:59,level:47}], reward: 3100, unlockBadgeCount: 6,
    quote: "Hot! Take the Volcano Badge before I burn up!" },
  { id: "giovanni", name: "Giovanni", city: "Viridian City", badge: "Earth Badge", type: "Ground",
    team: [
      {speciesId:53,level:45},   // Persian
      {speciesId:51,level:42},   // Dugtrio
      {speciesId:31,level:44},   // Nidoqueen
      {speciesId:34,level:45},   // Nidoking
      {speciesId:111,level:43},  // Rhyhorn
    ], reward: 4000, unlockBadgeCount: 7,
    quote: "So! I must hand over the Earth Badge. Team Rocket… is no more!" },
];

// ---------- Elite Four + Champion ----------
export interface EliteMember {
  id: string;
  title: string;
  name: string;
  type: PokeType;
  sprite: string;
  team: { speciesId: number; level: number }[];
  reward: number;
  quote: string;
}

export const ELITE_FOUR: EliteMember[] = [
  { id: "lorelei", title: "Elite Four", name: "Lorelei", type: "Ice", sprite: "❄️",
    team: [{speciesId:131,level:54},{speciesId:121,level:52},{speciesId:120,level:50}], reward: 5000,
    quote: "I never lost… how did you defeat me?" },
  { id: "bruno", title: "Elite Four", name: "Bruno", type: "Fighting", sprite: "🥋",
    team: [{speciesId:95,level:53},{speciesId:67,level:55},{speciesId:68,level:58}], reward: 5500,
    quote: "Hwoooo! You really are strong!" },
  { id: "agatha", title: "Elite Four", name: "Agatha", type: "Ghost", sprite: "🧙‍♀️",
    team: [{speciesId:94,level:56},{speciesId:42,level:55},{speciesId:24,level:56},{speciesId:94,level:58}], reward: 6000,
    quote: "Hoo hoo! You'll be a fine challenge for the Champion!" },
  { id: "lance", title: "Elite Four", name: "Lance", type: "Dragon", sprite: "🐲",
    team: [{speciesId:130,level:58},{speciesId:148,level:56},{speciesId:148,level:56},{speciesId:149,level:62}], reward: 7000,
    quote: "I still can't believe my Dragons lost!" },
];

export const CHAMPION: EliteMember = {
  id: "blue", title: "Champion", name: "Blue", type: "Normal", sprite: "👑",
  team: [{speciesId:18,level:61},{speciesId:65,level:59},{speciesId:130,level:61},{speciesId:9,level:65}], reward: 10000,
  quote: "I am the most powerful trainer in the world! …Or, was. You won fairly!",
};
