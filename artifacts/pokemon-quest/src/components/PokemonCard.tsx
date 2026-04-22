import { OwnedPokemon, speciesOf, xpToNext } from "@/game/state";

interface Props {
  p: OwnedPokemon;
  showXp?: boolean;
  active?: boolean;
}

export default function PokemonCard({ p, showXp = true, active = false }: Props) {
  const sp = speciesOf(p);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  const xpPct = (p.xp / xpToNext(p.level)) * 100;
  const hpColor = hpPct > 50 ? "#22c55e" : hpPct > 20 ? "#facc15" : "#ef4444";
  return (
    <div
      className="pq-card p-3 flex flex-col items-stretch gap-2 pq-fade"
      style={active ? { outline: `2px solid ${sp.color}`, outlineOffset: 1 } : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 grid place-items-center rounded-xl w-16 h-16 text-4xl"
          style={{ background: sp.color + "33", border: `2px solid ${sp.color}` }}
        >
          <span>{sp.sprite}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-bold truncate text-base">
              {sp.name}
              <span className="ml-1" style={{ color: p.gender === "M" ? "#60a5fa" : "#f472b6" }}>
                {p.gender === "M" ? "♂" : "♀"}
              </span>
            </div>
            <div className="text-xs text-slate-300/80">Lv. {p.level}</div>
          </div>
          <div className="text-[11px] text-slate-300/80">{sp.type.join(" / ")}</div>
          {active && <div className="text-[10px] font-pixel text-orange-400 mt-0.5">▶ ACTIVE</div>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300/80">HP</span>
          <span className="text-slate-200">{p.hp}/{p.maxHp}</span>
        </div>
        <div className="pq-hp-bar">
          <div className="pq-hp-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
        {showXp && (
          <>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-slate-300/70">EXP</span>
              <span className="text-slate-300/80">{p.xp}/{xpToNext(p.level)}</span>
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
