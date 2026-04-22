import { OwnedPokemon, speciesOf, xpToNext } from "@/game/state";

interface Props {
  p: OwnedPokemon;
  showXp?: boolean;
  large?: boolean;
}

export default function PokemonCard({ p, showXp = true, large = false }: Props) {
  const sp = speciesOf(p);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  const xpPct = (p.xp / xpToNext(p.level)) * 100;
  const hpColor = hpPct > 50 ? "#22c55e" : hpPct > 20 ? "#facc15" : "#ef4444";
  return (
    <div className="pq-card p-3 flex items-center gap-3 pq-fade">
      <div
        className={`shrink-0 grid place-items-center rounded-xl ${large ? "w-20 h-20 text-5xl" : "w-14 h-14 text-3xl"}`}
        style={{ background: sp.color + "33", border: `2px solid ${sp.color}` }}
      >
        <span>{sp.sprite}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="font-bold truncate">{sp.name}</div>
          <div className="text-xs opacity-80">Lv. {p.level}</div>
        </div>
        <div className="text-[11px] opacity-75 mb-1">{sp.type.join(" / ")}</div>
        <div className="pq-hp-bar mb-1">
          <div className="pq-hp-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
        <div className="text-[11px] opacity-80 flex justify-between">
          <span>HP {p.hp}/{p.maxHp}</span>
          {showXp && <span>XP {p.xp}/{xpToNext(p.level)}</span>}
        </div>
        {showXp && (
          <div className="pq-xp-bar mt-1">
            <div className="pq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
