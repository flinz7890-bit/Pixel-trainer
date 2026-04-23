import { OwnedPokemon, speciesOf, xpToNext } from "@/game/state";
import { TypeBadges, typeColor } from "@/components/TypeBadge";

interface Props {
  p: OwnedPokemon;
  showXp?: boolean;
  active?: boolean;
}

export default function PokemonCard({ p, showXp = true, active = false }: Props) {
  const sp = speciesOf(p);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  const xpPct = (p.xp / xpToNext(p.level)) * 100;
  const hpColor = hpPct > 50 ? "#4ade80" : hpPct > 20 ? "#facc15" : "#f43f5e";
  const tColor = typeColor(sp.type[0]);
  return (
    <div
      className="pq-card pq-fade p-3 flex flex-col gap-2"
      style={
        active
          ? {
              borderColor: tColor,
              boxShadow: `0 12px 30px rgba(0,0,0,0.45), 0 0 22px ${tColor}55`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 grid place-items-center rounded-2xl w-16 h-16 text-4xl"
          style={{
            background: `linear-gradient(180deg, ${tColor}33, ${tColor}11)`,
            border: `2px solid ${tColor}aa`,
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 18px ${tColor}33`,
          }}
        >
          <span style={{ filter: `drop-shadow(0 2px 0 rgba(0,0,0,0.30))` }}>{sp.sprite}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-pixel text-[12px] truncate flex items-center gap-1">
              <span>{sp.name.toUpperCase()}</span>
              <span style={{ color: p.gender === "M" ? "#60a5fa" : "#f472b6" }}>
                {p.gender === "M" ? "♂" : "♀"}
              </span>
            </div>
            <div
              className="text-[10px] font-mono-pq px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", color: "#d4d4d8" }}
            >
              LV {p.level}
            </div>
          </div>
          <div className="mt-1.5"><TypeBadges types={sp.type} /></div>
          {active && (
            <div className="text-[9px] font-mono-pq mt-1 inline-flex items-center gap-1" style={{ color: "#4ade80" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
              ACTIVE
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10.5px] font-mono-pq">
          <span style={{ color: "#a1a1aa" }}>HP</span>
          <span style={{ color: "#e5e7eb" }}>{p.hp}/{p.maxHp}</span>
        </div>
        <div className="pq-hp-bar">
          <div className="pq-hp-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
        {showXp && (
          <>
            <div className="flex items-center justify-between text-[10px] font-mono-pq mt-1">
              <span style={{ color: "#a1a1aa" }}>EXP</span>
              <span style={{ color: "#a1a1aa" }}>{p.xp}/{xpToNext(p.level)}</span>
            </div>
            <div className="pq-xp-bar">
              <div className="pq-xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
