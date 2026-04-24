import { useState } from "react";
import { ItemDef } from "@/game/items";

interface Props {
  item: ItemDef;
  size?: number;
}

export default function ItemIcon({ item, size = 32 }: Props) {
  const [errored, setErrored] = useState(false);
  if (!item.spriteUrl || errored) {
    return (
      <span style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-block" }}>
        {item.icon}
      </span>
    );
  }
  return (
    <img
      src={item.spriteUrl}
      alt={item.name}
      onError={() => setErrored(true)}
      className="item-sprite"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
