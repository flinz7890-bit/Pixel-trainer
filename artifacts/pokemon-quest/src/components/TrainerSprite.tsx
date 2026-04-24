import { useState } from "react";

export interface TrainerOption {
  id: string;
  name: string;
  url: string;
  emoji: string;
  color: string;
}

export const TRAINERS: TrainerOption[] = [
  { id: "red",    name: "Red",    url: "https://archives.bulbagarden.net/media/upload/6/6f/Spr_B2W2_Hilbert.png", emoji: "🧢", color: "#ef4444" },
  { id: "hilda",  name: "Hilda",  url: "https://archives.bulbagarden.net/media/upload/a/a8/Spr_B2W2_Hilda.png",   emoji: "🎽", color: "#f472b6" },
  { id: "nate",   name: "Nate",   url: "https://archives.bulbagarden.net/media/upload/0/0b/Spr_B2W2_Nate.png",    emoji: "🧑", color: "#3b82f6" },
  { id: "rosa",   name: "Rosa",   url: "https://archives.bulbagarden.net/media/upload/c/c8/Spr_B2W2_Rosa.png",    emoji: "👧", color: "#a855f7" },
  { id: "ethan",  name: "Ethan",  url: "https://archives.bulbagarden.net/media/upload/0/0b/Spr_HGSS_Ethan.png",   emoji: "🧑‍🎓", color: "#fb923c" },
  { id: "lyra",   name: "Lyra",   url: "https://archives.bulbagarden.net/media/upload/e/e2/Spr_HGSS_Lyra.png",    emoji: "👩", color: "#22c55e" },
];

export const GYM_LEADER_SPRITES: Record<string, { url: string; emoji: string }> = {
  brock:    { url: "https://archives.bulbagarden.net/media/upload/1/1c/Spr_HGSS_Brock.png",     emoji: "🪨" },
  misty:    { url: "https://archives.bulbagarden.net/media/upload/0/00/Spr_HGSS_Misty.png",     emoji: "💧" },
  surge:    { url: "https://archives.bulbagarden.net/media/upload/b/b8/Spr_HGSS_Lt_Surge.png",  emoji: "⚡" },
  erika:    { url: "https://archives.bulbagarden.net/media/upload/6/sixty/Spr_HGSS_Erika.png",  emoji: "🌿" },
  koga:     { url: "https://archives.bulbagarden.net/media/upload/d/d4/Spr_HGSS_Koga.png",      emoji: "☠️" },
  sabrina:  { url: "https://archives.bulbagarden.net/media/upload/a/a1/Spr_HGSS_Sabrina.png",   emoji: "🔮" },
  blaine:   { url: "https://archives.bulbagarden.net/media/upload/b/b1/Spr_HGSS_Blaine.png",    emoji: "🔥" },
  giovanni: { url: "https://archives.bulbagarden.net/media/upload/f/f8/Spr_HGSS_Giovanni.png",  emoji: "🦊" },
};

export function getTrainerOption(id: string): TrainerOption {
  return TRAINERS.find((t) => t.id === id) || TRAINERS[0];
}

interface Props {
  url?: string;
  fallbackEmoji?: string;
  size?: number;
  alt?: string;
}

export default function TrainerSprite({ url, fallbackEmoji = "🧑", size = 96, alt = "trainer" }: Props) {
  const [errored, setErrored] = useState(false);
  if (errored || !url) {
    return (
      <span
        style={{ fontSize: size * 0.7, lineHeight: 1, display: "inline-block" }}
        role="img"
        aria-label={alt}
      >
        {fallbackEmoji}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="trainer-sprite"
      onError={() => setErrored(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.35))",
        userSelect: "none",
      }}
      draggable={false}
    />
  );
}
