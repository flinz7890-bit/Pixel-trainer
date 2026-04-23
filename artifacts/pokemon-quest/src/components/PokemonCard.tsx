import PokeSprite from "@/components/PokeSprite";
import { OwnedPokemon, speciesOf, xpToNext } from "@/game/state";
import TypeBadge, { TypeBadges, typeColor } from "@/components/TypeBadge";

interface Props {
  p: OwnedPokemon;
  showXp?: boolean;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function PokemonCard({ p, showXp = true, active = false, compact = false, onClick }: Props) {
  const sp = speciesOf(p);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  const xpPct = (p.xp / xpToNext(p.level)) * 100;
  const hpColor = hpPct > 50 ? "#4ade80" : hpPct > 20 ? "#facc15" : "#f43f5e";
  const tColor = typeColor(sp.type[0]);

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="pq-card pq-fade shrink-0 text-left"
        style={{
          width: 140,
          padding: 10,
          borderColor: active ? tColor : "var(--border)",
          boxShadow: active
            ? `0 8px 22px rgba(0,0,0,0.45), 0 0 18px ${tColor}88, inset 0 0 0 1px ${tColor}66`
            : undefined,
          background:
            active
              ? `linear-gradient(180deg, ${tColor}1a, var(--panel-2))`
              : undefined,
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="text-[9px] font-mono-pq px-1.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#d4d4d8",
              letterSpacing: "0.06em",
            }}
          >
            LV {p.level}
          </div>
          {active && (
            <span
              title="Active"
              style={{ width: 8, height: 8, borderRadius: 999, background: tColor, boxShadow: `0 0 10px ${tColor}` }}
            />
          )}
        </div>

        <div
          className="grid place-items-center mt-1.5 mx-auto rounded-2xl"
          style={{
            width: 64,
            height: 64,
            background: `radial-gradient(closest-side, ${tColor}33, transparent 75%)`,
            border: `1px solid ${tColor}77`,
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 14px ${tColor}33`,
          }}
        >
          <PokeSprite species={sp} size={56} />
        </div>

        <div className="font-pixel text-[11px] mt-1.5 truncate flex items-center gap-1">
          <span>{sp.name.toUpperCase()}</span>
          <span style={{ color: p.gender === "M" ? "#60a5fa" : "#f472b6" }}>
            {p.gender === "M" ? "♂" : "♀"}
          </span>
        </div>

        <div className="mt-1">
          <TypeBadge type={sp.type[0]} />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono-pq">
          <span style={{ color: "#a1a1aa" }}>HP</span>
          <span style={{ color: "#e5e7eb" }}>
            {p.hp}/{p.maxHp}
          </span>
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{ height: 6, background: "#2a2a3a", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div style={{ width: `${hpPct}%`, height: "100%", background: hpColor, transition: "width .35s" }} />
        </div>
      </button>
    );
  }

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
          <PokeSprite species={sp} size={60} />
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
