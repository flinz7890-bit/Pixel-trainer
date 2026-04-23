import { useState } from "react";
import { Species } from "@/game/data";

// Showdown uses lowercase + alphanumerics only (e.g. "Mr. Mime" -> "mrmime")
function showdownName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
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
  const pixelated = stage === 1;

  return (
    <img
      src={url}
      alt={species.name}
      width={size}
      height={size}
      onError={() => setStage((s) => s + 1)}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: pixelated ? "pixelated" : "auto",
        filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35))",
        userSelect: "none",
        ...style,
      }}
      draggable={false}
    />
  );
}
