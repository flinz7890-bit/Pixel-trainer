import { useState } from "react";
import { Species } from "@/game/data";

// Lowercase, replace spaces with hyphens, strip apostrophes/dots/punctuation
// e.g. "Mr. Mime" -> "mr-mime", "Farfetch'd" -> "farfetchd", "Nidoran♀" -> "nidoran"
function showdownName(name: string) {
  return name
    .toLowerCase()
    .replace(/['.:,!?]/g, "")
    .replace(/[♀♂]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function showdownAniUrl(name: string, back = false) {
  const folder = back ? "ani-back" : "ani";
  return `https://play.pokemonshowdown.com/sprites/${folder}/${showdownName(name)}.gif`;
}

export function pokeapiPngUrl(speciesId: number, back = false) {
  if (back) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${speciesId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

interface Props {
  species: Species;
  size?: number;
  back?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PokeSprite({ species, size = 96, back = false, className, style }: Props) {
  // 0 = animated GIF (Showdown), 1 = PokeAPI PNG, 2 = emoji
  const [stage, setStage] = useState(0);

  if (stage >= 2) {
    return (
      <span
        className={className}
        style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-block", ...style }}
      >
        {species.sprite}
      </span>
    );
  }

  const url = stage === 0 ? showdownAniUrl(species.name, back) : pokeapiPngUrl(species.id, back);
  const sizeClass =
    size <= 36 ? "poke-sprite poke-sprite-xs"
      : size <= 64 ? "poke-sprite poke-sprite-sm"
        : size >= 160 ? "poke-sprite poke-sprite-xl"
          : size >= 110 ? "poke-sprite poke-sprite-lg"
            : "poke-sprite";

  return (
    <img
      src={url}
      alt={species.name}
      onError={() => setStage((s) => s + 1)}
      className={`${sizeClass} ${className || ""}`}
      style={style}
      draggable={false}
    />
  );
}
