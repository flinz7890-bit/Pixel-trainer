export type ItemTier = "early" | "mid" | "late";

export interface ItemDef {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
  tier: ItemTier;
  category: "ball" | "heal" | "revive" | "status" | "boost" | "special";
  // gameplay hints
  catchMult?: number;
  healAmount?: number;
  fullHeal?: boolean;
  reviveHalf?: boolean;
  rareCandy?: boolean;
  curesStatus?: boolean;
}

export const ITEMS: ItemDef[] = [
  { id: "pokeball",   name: "Poké Ball",   price: 200,  icon: "⚪", desc: "A device for catching wild Pokémon.",                tier: "early", category: "ball",   catchMult: 1.0 },
  { id: "greatball",  name: "Great Ball",  price: 600,  icon: "🔵", desc: "A higher-grade ball with a better catch rate.",       tier: "mid",   category: "ball",   catchMult: 1.5 },
  { id: "ultraball",  name: "Ultra Ball",  price: 1200, icon: "🟡", desc: "An ultra-performance ball with the best catch rate.", tier: "late",  category: "ball",   catchMult: 2.0 },

  { id: "potion",      name: "Potion",       price: 300,  icon: "🧪", desc: "Restores 20 HP to one Pokémon.",          tier: "early", category: "heal",   healAmount: 20 },
  { id: "superpotion", name: "Super Potion", price: 700,  icon: "🧴", desc: "Restores 50 HP to one Pokémon.",          tier: "mid",   category: "heal",   healAmount: 50 },
  { id: "hyperpotion", name: "Hyper Potion", price: 1200, icon: "🧫", desc: "Restores 200 HP to one Pokémon.",         tier: "mid",   category: "heal",   healAmount: 200 },
  { id: "fullrestore", name: "Full Restore", price: 3000, icon: "💎", desc: "Fully restores HP and cures any status.", tier: "late",  category: "heal",   fullHeal: true, curesStatus: true },

  { id: "antidote",   name: "Antidote",     price: 100, icon: "🟢", desc: "Cures a poisoned Pokémon.",          tier: "early", category: "status", curesStatus: true },
  { id: "parlyzheal", name: "Parlyz Heal",  price: 200, icon: "🟠", desc: "Cures a paralyzed Pokémon.",         tier: "early", category: "status", curesStatus: true },
  { id: "awakening",  name: "Awakening",    price: 250, icon: "🔵", desc: "Wakes a sleeping Pokémon.",          tier: "early", category: "status", curesStatus: true },
  { id: "iceheal",    name: "Ice Heal",     price: 250, icon: "🧊", desc: "Thaws a frozen Pokémon.",            tier: "mid",   category: "status", curesStatus: true },
  { id: "burnheal",   name: "Burn Heal",    price: 250, icon: "🔥", desc: "Heals a burned Pokémon.",            tier: "mid",   category: "status", curesStatus: true },
  { id: "fullheal",   name: "Full Heal",    price: 600, icon: "💖", desc: "Cures all status conditions.",       tier: "mid",   category: "status", curesStatus: true },

  { id: "revive",     name: "Revive",       price: 1500, icon: "✨", desc: "Revives a fainted Pokémon to half HP.", tier: "mid",  category: "revive", reviveHalf: true },
  { id: "rarecandy",  name: "Rare Candy",   price: 4800, icon: "🍬", desc: "Raises a Pokémon's level by 1.",        tier: "late", category: "special", rareCandy: true },

  { id: "xattack",   name: "X Attack",   price: 500, icon: "⚔️", desc: "Raises Attack in battle.",  tier: "mid", category: "boost" },
  { id: "xspeed",    name: "X Speed",    price: 350, icon: "💨", desc: "Raises Speed in battle.",   tier: "mid", category: "boost" },
  { id: "xdefense",  name: "X Defense",  price: 550, icon: "🛡️", desc: "Raises Defense in battle.", tier: "mid", category: "boost" },

  { id: "repel",     name: "Repel",      price: 350, icon: "🚫", desc: "Prevents wild encounters for 100 steps.", tier: "early", category: "special" },
];

export function getItem(id: string) {
  return ITEMS.find((i) => i.id === id);
}

// Each city's mart unlocks items up to a given tier (later cities = more stock)
export function tiersAvailableForLocation(locationId: string): ItemTier[] {
  const lateCities = new Set(["fuchsia", "saffron", "cinnabar", "indigo"]);
  const midCities = new Set(["vermilion", "celadon", "lavender"]);
  if (lateCities.has(locationId)) return ["early", "mid", "late"];
  if (midCities.has(locationId)) return ["early", "mid"];
  return ["early"];
}

export function itemsForLocation(locationId: string): ItemDef[] {
  const tiers = new Set(tiersAvailableForLocation(locationId));
  return ITEMS.filter((i) => tiers.has(i.tier));
}
