import { useState } from "react";
import { Species } from "@/game/data";

export function spriteUrl(speciesId: number, variant: "pixel" | "art" = "pixel") {
  if (variant === "art") {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

export function backSpriteUrl(speciesId: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${speciesId}.png`;
}

interface Props {
  species: Species;
  size?: number;
  variant?: "pixel" | "art";
  back?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PokeSprite({ species, size = 96, variant = "pixel", back = false, className, style }: Props) {
  const [errored, setErrored] = useState(false);
  const url = back ? backSpriteUrl(species.id) : spriteUrl(species.id, variant);

  if (errored) {
    return (
      <span
        className={className}
        style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-block", ...style }}
      >
        {species.sprite}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={species.name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: variant === "pixel" ? "pixelated" : "auto",
        filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35))",
        userSelect: "none",
        ...style,
      }}
      draggable={false}
    />
  );
}
