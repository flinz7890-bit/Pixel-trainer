import { useState } from "react";
import { useGame } from "@/game/state";
import { LOCATIONS } from "@/game/data";
import { ItemDef, itemsForLocation, tiersAvailableForLocation } from "@/game/items";
import ItemIcon from "@/components/ItemIcon";
import Toast from "@/components/Toast";

const TIER_LABEL: Record<string, string> = { early: "Basic", mid: "Advanced", late: "Premium" };
const TIER_COLOR: Record<string, string> = { early: "#4ade80", mid: "#22d3ee", late: "#facc15" };

export default function PokeMartScreen() {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS.find((l) => l.id === state.locationId);
  const items = itemsForLocation(state.locationId);
  const tiers = tiersAvailableForLocation(state.locationId);
  const [tab, setTab] = useState<"all" | "ball" | "heal" | "status" | "boost" | "special" | "revive">("all");

  const buy = (item: ItemDef) => {
    if (state.money < item.price) {
      dispatch({ type: "TOAST", text: "Not enough Poké Dollars!" });
      return;
    }
    dispatch({ type: "BUY_ITEM", itemId: item.id, qty: 1, cost: item.price });
    dispatch({ type: "TOAST", text: `Bought 1 ${item.name}` });
  };

  const filtered = tab === "all" ? items : items.filter((i) => i.category === tab);

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <Toast />
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">🛒</div>
        <div className="flex-1">
          <div className="text-xl font-extrabold">{loc?.name || ""} PokéMart</div>
          <div className="text-[11px] opacity-80 font-mono-pq">
            Stock:&nbsp;
            {tiers.map((t, i) => (
              <span key={t}>
                <span style={{ color: TIER_COLOR[t] }}>{TIER_LABEL[t]}</span>
                {i < tiers.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>
        </div>
        <div className="font-bold text-[#facc15]">₽ {state.money}</div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {(["all", "ball", "heal", "status", "revive", "boost", "special"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className="px-3 py-1.5 rounded-full text-[10px] font-mono-pq uppercase tracking-wider transition"
            style={{
              background: tab === c ? "rgba(244,63,94,0.18)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === c ? "#f43f5e" : "var(--border)"}`,
              color: tab === c ? "#fb7185" : "#d4d4d8",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((item) => {
          const have = state.items[item.id] || 0;
          const cant = state.money < item.price;
          return (
            <div key={item.id} className="pq-card p-3 flex items-center gap-3">
              <div className="shrink-0 grid place-items-center rounded-xl" style={{ width: 48, height: 48, background: "rgba(255,255,255,0.05)" }}>
                <ItemIcon item={item} size={36} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13px] flex items-center gap-2">
                  <span>{item.name}</span>
                  <span
                    className="text-[9px] font-mono-pq px-1.5 py-0.5 rounded-full"
                    style={{ background: `${TIER_COLOR[item.tier]}22`, color: TIER_COLOR[item.tier], border: `1px solid ${TIER_COLOR[item.tier]}55` }}
                  >
                    {TIER_LABEL[item.tier]}
                  </span>
                  {have > 0 && <span className="text-[10px] opacity-70 font-mono-pq">×{have}</span>}
                </div>
                <div className="text-[11px] opacity-80">{item.desc}</div>
              </div>
              <button
                className="pq-btn pq-btn-blue shrink-0"
                onClick={() => buy(item)}
                disabled={cant}
                title={cant ? "Not enough money" : `Buy for ₽${item.price}`}
              >
                ₽{item.price}
              </button>
            </div>
          );
        })}
      </div>

      <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
        ← Leave
      </button>
    </div>
  );
}
