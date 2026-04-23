import { PokeType } from "@/game/data";

export const TYPE_COLORS: Record<PokeType, string> = {
  Normal: "#a8a878",
  Fire: "#f08030",
  Water: "#6890f0",
  Grass: "#78c850",
  Electric: "#f8d030",
  Bug: "#a8b820",
  Flying: "#a890f0",
  Poison: "#a040a0",
  Rock: "#b8a038",
  Ghost: "#705898",
  Psychic: "#f85888",
  Ice: "#98d8d8",
  Fighting: "#c03028",
  Ground: "#e0c068",
  Dragon: "#7038f8",
};

export function typeColor(t: PokeType) {
  return TYPE_COLORS[t] || "#a8a878";
}

export default function TypeBadge({ type }: { type: PokeType }) {
  const bg = typeColor(type);
  return (
    <span
      className="type-pill"
      style={{ background: `linear-gradient(180deg, ${bg}, ${shade(bg, -18)})` }}
    >
      {type}
    </span>
  );
}

export function TypeBadges({ types }: { types: PokeType[] }) {
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {types.map((t) => <TypeBadge key={t} type={t} />)}
    </span>
  );
}

function shade(hex: string, percent: number) {
  const m = hex.replace("#", "");
  const num = parseInt(m, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0xff) + percent;
  let b = (num & 0xff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
