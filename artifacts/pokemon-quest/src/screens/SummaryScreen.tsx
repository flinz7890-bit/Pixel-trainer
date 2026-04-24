import { useState } from "react";
import { useGame, speciesOf, xpToNext } from "@/game/state";
import PokeSprite from "@/components/PokeSprite";
import TypeBadge, { typeColor } from "@/components/TypeBadge";
import Toast from "@/components/Toast";

type Page = 1 | 2 | 3;

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono-pq">
      <div className="w-16 uppercase" style={{ color: "#a1a1aa" }}>{label}</div>
      <div className="w-10 text-right" style={{ color: "#f5f5f7" }}>{value}</div>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: "#2a2a3a" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .4s" }} />
      </div>
    </div>
  );
}

export default function SummaryScreen() {
  const { state, dispatch } = useGame();
  const [page, setPage] = useState<Page>(1);
  const uid = state.summaryUid;
  const p = state.team.find((x) => x.uid === uid) || state.team[0];

  if (!p) {
    return (
      <div className="pq-fade py-6 text-center">
        <div className="opacity-70 mb-3">No Pokémon selected.</div>
        <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
          ← Back
        </button>
      </div>
    );
  }

  const sp = speciesOf(p);
  const tColor = typeColor(sp.type[0]);
  const xpNext = xpToNext(p.level);
  const xpPct = (p.xp / xpNext) * 100;

  // Derived stat lines (HP / ATK + estimates for the others — full IV/EV system deferred)
  const stats = [
    { key: "HP",      value: p.maxHp, max: 250, color: "#4ade80" },
    { key: "ATTACK",  value: p.atk,   max: 200, color: "#f43f5e" },
    { key: "DEFENSE", value: Math.floor(p.atk * 0.8),  max: 200, color: "#60a5fa" },
    { key: "SP.ATK",  value: Math.floor(p.atk * 0.95), max: 200, color: "#a855f7" },
    { key: "SP.DEF",  value: Math.floor(p.atk * 0.85), max: 200, color: "#22d3ee" },
    { key: "SPEED",   value: Math.floor(p.atk * 0.9),  max: 200, color: "#facc15" },
  ];

  const back = () => dispatch({ type: "SET_SCREEN", screen: "adventure" });

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />
      <div className="flex items-center gap-2">
        <button className="pq-btn pq-btn-ghost" onClick={back}>← Back</button>
        <div className="flex-1 text-center font-pixel text-[12px]" style={{ color: tColor }}>
          SUMMARY · {sp.name.toUpperCase()}
        </div>
        <div
          className="font-mono-pq text-[11px] px-2 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", color: "#d4d4d8" }}
        >
          {page}/3
        </div>
      </div>

      {/* Hero header (always visible) */}
      <div
        className="pq-card p-4 flex items-center gap-4"
        style={{
          background: `linear-gradient(180deg, ${tColor}1a, var(--panel-2))`,
          borderColor: `${tColor}66`,
        }}
      >
        <div
          className="grid place-items-center rounded-2xl"
          style={{
            width: 120,
            height: 120,
            background: `radial-gradient(closest-side, ${tColor}33, transparent 70%)`,
            border: `1px solid ${tColor}77`,
          }}
        >
          <PokeSprite species={sp} size={108} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono-pq" style={{ color: "#71717a" }}>
            #{String(sp.id).padStart(3, "0")}
          </div>
          <div className="font-pixel text-[16px] flex items-center gap-1.5">
            <span>{sp.name.toUpperCase()}</span>
            <span style={{ color: p.gender === "M" ? "#60a5fa" : "#f472b6" }}>
              {p.gender === "M" ? "♂" : "♀"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {sp.type.map((t) => <TypeBadge key={t} type={t} />)}
          </div>
          <div className="text-[11px] font-mono-pq mt-1" style={{ color: "#d4d4d8" }}>
            LV {p.level} · OT {state.trainerName || "TRAINER"}
          </div>
        </div>
      </div>

      {/* Page content */}
      {page === 1 && (
        <div className="pq-card p-4 flex flex-col gap-2 text-[12px] font-mono-pq">
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Pokédex No.</span><span>#{String(sp.id).padStart(3, "0")}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Species</span><span>{sp.name}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Type</span><span>{sp.type.join(" / ")}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Original Trainer</span><span>{state.trainerName || "TRAINER"}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Gender</span><span>{p.gender === "M" ? "Male ♂" : "Female ♀"}</span></div>
          <div className="mt-2">
            <div className="flex justify-between mb-1"><span style={{ color: "#a1a1aa" }}>EXP to Next Lv</span><span>{p.xp}/{xpNext}</span></div>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#2a2a3a" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: "linear-gradient(90deg,#60a5fa,#22d3ee)", transition: "width .4s" }} />
            </div>
          </div>
        </div>
      )}

      {page === 2 && (
        <div className="pq-card p-4 flex flex-col gap-2.5">
          <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>Base Stats</div>
          {stats.map((s) => <StatBar key={s.key} label={s.key} value={s.value} max={s.max} color={s.color} />)}
          <div className="text-[10px] font-mono-pq mt-2 italic" style={{ color: "#71717a" }}>
            Full IV/EV/Nature tracking coming soon.
          </div>
        </div>
      )}

      {page === 3 && (
        <div className="pq-card p-4 flex flex-col gap-2">
          <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>Moves</div>
          {sp.moves.map((m) => {
            const mc = typeColor(m.type);
            return (
              <div
                key={m.name}
                className="pq-card-2 px-3 py-2 flex items-center gap-3"
                style={{ borderColor: `${mc}66` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[12px]">{m.name.toUpperCase()}</div>
                  <div
                    className="text-[10px] font-mono-pq inline-block px-2 py-0.5 rounded-full mt-1"
                    style={{ background: `${mc}33`, color: mc, border: `1px solid ${mc}88` }}
                  >
                    {m.type}
                  </div>
                </div>
                <div className="text-[11px] font-mono-pq text-right" style={{ color: "#d4d4d8" }}>
                  <div>PWR {m.power}</div>
                  <div style={{ color: "#71717a" }}>PP —/—</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          className="pq-btn pq-btn-ghost flex-1"
          disabled={page === 1}
          onClick={() => setPage((p) => (p > 1 ? ((p - 1) as Page) : p))}
        >
          ← Prev
        </button>
        <button
          className="pq-btn pq-btn-ghost flex-1"
          disabled={page === 3}
          onClick={() => setPage((p) => (p < 3 ? ((p + 1) as Page) : p))}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
