import { useState } from "react";

export interface TrainerOption {
  id: string;
  name: string;
  url: string;
  emoji: string;
  color: string;
}

const SHOWDOWN = "https://play.pokemonshowdown.com/sprites/trainers";

export const TRAINERS: TrainerOption[] = [
  { id: "hilbert", name: "Hilbert", url: `${SHOWDOWN}/hilbert.png`, emoji: "🧢",  color: "#ef4444" },
  { id: "hilda",   name: "Hilda",   url: `${SHOWDOWN}/hilda.png`,   emoji: "🎽",  color: "#f472b6" },
  { id: "nate",    name: "Nate",    url: `${SHOWDOWN}/nate.png`,    emoji: "🧑",  color: "#3b82f6" },
  { id: "rosa",    name: "Rosa",    url: `${SHOWDOWN}/rosa.png`,    emoji: "👧",  color: "#a855f7" },
  { id: "ethan",   name: "Ethan",   url: `${SHOWDOWN}/ethan.png`,   emoji: "🧑‍🎓", color: "#fb923c" },
  { id: "lyra",    name: "Lyra",    url: `${SHOWDOWN}/lyra.png`,    emoji: "👩",  color: "#22c55e" },
  { id: "brendan", name: "Brendan", url: `${SHOWDOWN}/brendan.png`, emoji: "🧒",  color: "#f59e0b" },
  { id: "may",     name: "May",     url: `${SHOWDOWN}/may.png`,     emoji: "👧",  color: "#06b6d4" },
  { id: "lucas",   name: "Lucas",   url: `${SHOWDOWN}/lucas.png`,   emoji: "🧑",  color: "#8b5cf6" },
];

export const GYM_LEADER_SPRITES: Record<string, { url: string; emoji: string }> = {
  brock:    { url: `${SHOWDOWN}/brock.png`,    emoji: "🪨" },
  misty:    { url: `${SHOWDOWN}/misty.png`,    emoji: "💧" },
  surge:    { url: `${SHOWDOWN}/ltsurge.png`,  emoji: "⚡" },
  erika:    { url: `${SHOWDOWN}/erika.png`,    emoji: "🌿" },
  koga:     { url: `${SHOWDOWN}/koga.png`,     emoji: "☠️" },
  sabrina:  { url: `${SHOWDOWN}/sabrina.png`,  emoji: "🔮" },
  blaine:   { url: `${SHOWDOWN}/blaine.png`,   emoji: "🔥" },
  giovanni: { url: `${SHOWDOWN}/giovanni.png`, emoji: "🦊" },
};

export const ROUTE_TRAINER_SPRITES: Record<string, string> = {
  youngster:  `${SHOWDOWN}/youngster.png`,
  lass:       `${SHOWDOWN}/lass.png`,
  bugcatcher: `${SHOWDOWN}/bugcatcher.png`,
  hiker:      `${SHOWDOWN}/hiker.png`,
  camper:     `${SHOWDOWN}/camper.png`,
  picnicker:  `${SHOWDOWN}/picnicker.png`,
};

export function getTrainerOption(id: string): TrainerOption {
  return TRAINERS.find((t) => t.id === id) || TRAINERS[0];
}

interface Props {
  url?: string;
  fallbackEmoji?: string;
  size?: "sm" | "md" | "lg";
  alt?: string;
}

export default function TrainerSprite({ url, fallbackEmoji = "🧑", size = "md", alt = "trainer" }: Props) {
  const [errored, setErrored] = useState(false);
  if (errored || !url) {
    const px = size === "sm" ? 48 : size === "lg" ? 70 : 56;
    return (
      <span
        style={{ fontSize: px, lineHeight: 1, display: "inline-block" }}
        role="img"
        aria-label={alt}
      >
        {fallbackEmoji}
      </span>
    );
  }
  const cls =
    size === "sm" ? "trainer-sprite trainer-sprite-sm"
      : size === "lg" ? "trainer-sprite trainer-sprite-lg"
        : "trainer-sprite";
  return (
    <img
      src={url}
      alt={alt}
      className={cls}
      onError={() => setErrored(true)}
      draggable={false}
    />
  );
}
