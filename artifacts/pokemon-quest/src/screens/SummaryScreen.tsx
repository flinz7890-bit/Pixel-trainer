import { useState } from "react";
import { useGame, speciesOf, xpToNext } from "@/game/state";
import PokeSprite from "@/components/PokeSprite";
import TypeBadge, { typeColor } from "@/components/TypeBadge";
import Toast from "@/components/Toast";
import {
  StatBlock, StatKey, STAT_LABELS_SHORT, STAT_COLORS,
  baseStats, getNature, isSpecialMove, totalEVs, MAX_EV_TOTAL, MAX_EV_PER_STAT, MAX_IV,
} from "@/game/stats";
import { SPECIES } from "@/game/data";

type Page = 1 | 2 | 3 | 4;

const STAT_KEYS: StatKey[] = ["hp", "atk", "def", "spa", "spd", "spe"];

function StackedStatBar({
  k, base, iv, ev, total, natureUp, natureDown,
}: {
  k: StatKey; base: number; iv: number; ev: number; total: number;
  natureUp?: boolean; natureDown?: boolean;
}) {
  // Show three segments: base / IV bonus / EV bonus, scaled to a visual max
  const visualMax = 200;
  const basePct = Math.min(100, (base / visualMax) * 100);
  const ivPct = Math.min(100 - basePct, (iv / visualMax) * 100);
  const evPctRaw = (ev / 4) / visualMax * 100; // EV is /4 in formula
  const evPct = Math.min(100 - basePct - ivPct, evPctRaw);
  const color = STAT_COLORS[k];
  const natureMark = natureUp ? "▲" : natureDown ? "▼" : "";
  const natureColor = natureUp ? "#fb923c" : natureDown ? "#60a5fa" : "transparent";
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono-pq">
      <div className="w-12 uppercase flex items-center gap-0.5" style={{ color: "#a1a1aa" }}>
        {STAT_LABELS_SHORT[k]}
        <span style={{ color: natureColor, fontSize: 10, lineHeight: 1 }}>{natureMark}</span>
      </div>
      <div className="w-9 text-right font-bold" style={{ color: "#f5f5f7" }}>{total}</div>
      <div className="flex-1 rounded-full overflow-hidden flex" style={{ height: 9, background: "#2a2a3a" }}>
        <div style={{ width: `${basePct}%`, background: color, opacity: 0.9 }} />
        <div style={{ width: `${ivPct}%`, background: color, opacity: 0.6 }} />
        <div style={{ width: `${evPct}%`, background: color, opacity: 0.35 }} />
      </div>
      <div className="text-[9px] tabular-nums w-[78px] text-right" style={{ color: "#71717a" }}>
        B{base}·I{iv}·E{ev}
      </div>
    </div>
  );
}

function chainOf(speciesId: number): number[] {
  const chain: number[] = [];
  // walk back to root
  let rootId = speciesId;
  let safety = 8;
  while (safety-- > 0) {
    const prev = (Object.values(SPECIES) as any[]).find((sp: any) => sp?.evolvesTo === rootId);
    if (!prev) break;
    rootId = prev.id;
  }
  // walk forward
  let cur: number | undefined = rootId;
  safety = 8;
  while (cur && safety-- > 0) {
    chain.push(cur);
    cur = SPECIES[cur]?.evolvesTo;
  }
  return chain;
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

  const ivs: StatBlock = p.ivs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const evs: StatBlock = p.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const nature = p.nature || "Hardy";
  const ndef = getNature(nature);
  const base = baseStats(sp);
  const totals: Record<StatKey, number> = {
    hp: p.maxHp,
    atk: p.atk,
    def: p.def ?? Math.floor(p.atk * 0.8),
    spa: p.spa ?? Math.floor(p.atk * 0.95),
    spd: p.spd ?? Math.floor(p.atk * 0.85),
    spe: p.spe ?? Math.floor(p.atk * 0.9),
  };

  const evTotal = totalEVs(evs);
  const evolutions = chainOf(sp.id);

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
          {page}/4
        </div>
      </div>

      {/* Hero header */}
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
            width: 120, height: 120,
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
          <div className="text-[10px] font-mono-pq mt-0.5" style={{ color: "#facc15" }}>
            {nature} nature
            {ndef.up && ndef.down ? ` (+${STAT_LABELS_SHORT[ndef.up]}, −${STAT_LABELS_SHORT[ndef.down]})` : " (neutral)"}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-4 gap-1">
        {(["Info", "Stats", "Moves", "Bio"] as const).map((label, i) => {
          const idx = (i + 1) as Page;
          const active = page === idx;
          return (
            <button
              key={label}
              className="pq-btn"
              onClick={() => setPage(idx)}
              style={{
                background: active ? "linear-gradient(180deg,#f43f5e,#be123c)" : "transparent",
                color: active ? "#fff" : "#a1a1aa",
                borderColor: active ? "#f43f5e" : "rgba(255,255,255,0.10)",
                fontSize: 11,
                padding: "6px 0",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* INFO */}
      {page === 1 && (
        <div className="pq-card p-4 flex flex-col gap-2 text-[12px] font-mono-pq">
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Pokédex No.</span><span>#{String(sp.id).padStart(3, "0")}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Species</span><span>{sp.name}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Type</span><span>{sp.type.join(" / ")}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Original Trainer</span><span>{state.trainerName || "TRAINER"}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Trainer ID</span><span>{state.playerId || "—"}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Gender</span><span>{p.gender === "M" ? "Male ♂" : "Female ♀"}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Nature</span><span style={{ color: "#facc15" }}>{nature}</span></div>
          <div className="flex justify-between"><span style={{ color: "#a1a1aa" }}>Ability</span><span>{sp.type.includes("Electric") ? "Static" : sp.type.includes("Fire") ? "Blaze" : sp.type.includes("Water") ? "Torrent" : sp.type.includes("Grass") ? "Overgrow" : "Run Away"}</span></div>
          <div className="mt-2">
            <div className="flex justify-between mb-1"><span style={{ color: "#a1a1aa" }}>EXP to Next Lv</span><span>{p.xp}/{xpNext}</span></div>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#2a2a3a" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: "linear-gradient(90deg,#60a5fa,#22d3ee)", transition: "width .4s" }} />
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      {page === 2 && (
        <div className="pq-card p-4 flex flex-col gap-3">
          <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>
            Stats — Base ▮ IV ▮ EV
          </div>
          <div className="flex flex-col gap-1.5">
            {STAT_KEYS.map((k) => (
              <StackedStatBar
                key={k}
                k={k}
                base={base[k]}
                iv={ivs[k]}
                ev={evs[k]}
                total={totals[k]}
                natureUp={ndef.up === k}
                natureDown={ndef.down === k}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono-pq">
            <div className="pq-card-2 px-3 py-2">
              <div style={{ color: "#71717a" }}>EV TOTAL</div>
              <div style={{ color: evTotal >= MAX_EV_TOTAL ? "#fb923c" : "#4ade80" }}>
                {evTotal} / {MAX_EV_TOTAL}
              </div>
              <div className="rounded-full overflow-hidden mt-1" style={{ height: 4, background: "#2a2a3a" }}>
                <div style={{ width: `${(evTotal / MAX_EV_TOTAL) * 100}%`, height: "100%", background: "#4ade80" }} />
              </div>
            </div>
            <div className="pq-card-2 px-3 py-2">
              <div style={{ color: "#71717a" }}>IV TOTAL (Avg)</div>
              <div style={{ color: "#a855f7" }}>
                {Math.round((ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe) / 6)} / {MAX_IV}
              </div>
              <div className="rounded-full overflow-hidden mt-1" style={{ height: 4, background: "#2a2a3a" }}>
                <div style={{ width: `${((ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe) / (6 * MAX_IV)) * 100}%`, height: "100%", background: "#a855f7" }} />
              </div>
            </div>
          </div>
          <div className="text-[9px] font-mono-pq italic mt-1" style={{ color: "#71717a" }}>
            Nature: <span style={{ color: "#fb923c" }}>▲</span> boosts +10%, <span style={{ color: "#60a5fa" }}>▼</span> reduces −10%. Cap is {MAX_EV_PER_STAT}/stat, {MAX_EV_TOTAL} total.
          </div>
        </div>
      )}

      {/* MOVES */}
      {page === 3 && (
        <div className="pq-card p-4 flex flex-col gap-2">
          <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>Moves</div>
          {sp.moves.map((m) => {
            const mc = typeColor(m.type);
            const cat = isSpecialMove(m) ? "Special" : "Physical";
            return (
              <div
                key={m.name}
                className="pq-card-2 px-3 py-2 flex items-center gap-3"
                style={{ borderColor: `${mc}66` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[12px]">{m.name.toUpperCase()}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div
                      className="text-[10px] font-mono-pq inline-block px-2 py-0.5 rounded-full"
                      style={{ background: `${mc}33`, color: mc, border: `1px solid ${mc}88` }}
                    >
                      {m.type}
                    </div>
                    <div
                      className="text-[10px] font-mono-pq inline-block px-2 py-0.5 rounded-full"
                      style={{
                        background: cat === "Special" ? "rgba(168,85,247,0.18)" : "rgba(244,63,94,0.18)",
                        color: cat === "Special" ? "#c084fc" : "#fb7185",
                        border: cat === "Special" ? "1px solid rgba(168,85,247,0.40)" : "1px solid rgba(244,63,94,0.40)",
                      }}
                    >
                      {cat}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-mono-pq text-right" style={{ color: "#d4d4d8" }}>
                  <div>PWR {m.power}</div>
                  <div style={{ color: "#71717a" }}>STAB: {sp.type.includes(m.type) ? "1.5×" : "1.0×"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BIO / EVOLUTION */}
      {page === 4 && (
        <div className="pq-card p-4 flex flex-col gap-3 text-[12px] font-mono-pq">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#a1a1aa" }}>
            Evolution Chain
          </div>
          <div className="flex items-center justify-around flex-wrap gap-2">
            {evolutions.map((id, i) => {
              const esp = SPECIES[id];
              if (!esp) return null;
              const isCurrent = id === sp.id;
              return (
                <div key={id} className="flex items-center gap-1">
                  <div
                    className="grid place-items-center rounded-xl"
                    style={{
                      width: 70, height: 70,
                      border: isCurrent ? `2px solid ${tColor}` : "1px solid rgba(255,255,255,0.08)",
                      background: isCurrent ? `${tColor}22` : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <PokeSprite species={esp} size={56} />
                  </div>
                  <div className="flex flex-col items-center text-[10px]">
                    <span style={{ color: isCurrent ? tColor : "#a1a1aa" }}>{esp.name}</span>
                    <span style={{ color: "#71717a" }}>#{String(esp.id).padStart(3, "0")}</span>
                  </div>
                  {i < evolutions.length - 1 && SPECIES[evolutions[i]]?.evolvesAt && (
                    <div className="text-[10px]" style={{ color: "#facc15" }}>
                      → Lv{SPECIES[evolutions[i]].evolvesAt}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[10px] uppercase tracking-widest mt-2" style={{ color: "#a1a1aa" }}>
            Description
          </div>
          <div className="text-[11px] leading-relaxed" style={{ color: "#d4d4d8" }}>
            A {sp.type.join("/")}-type Pokémon. {sp.evolvesAt && sp.evolvesTo
              ? `Evolves into ${SPECIES[sp.evolvesTo]?.name} at level ${sp.evolvesAt}.`
              : "Has reached its final form."}
            {" "}Catch rate is {Math.round((sp.catchRate || 0.3) * 100)}% baseline.
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="pq-card-2 px-3 py-2">
              <div style={{ color: "#71717a", fontSize: 10 }}>RARITY</div>
              <div style={{ color: sp.rarity === "legendary" ? "#facc15" : sp.rarity === "rare" ? "#a855f7" : "#d4d4d8" }}>
                {(sp.rarity || "common").toUpperCase()}
              </div>
            </div>
            <div className="pq-card-2 px-3 py-2">
              <div style={{ color: "#71717a", fontSize: 10 }}>XP YIELD</div>
              <div style={{ color: "#22d3ee" }}>{sp.xpYield}</div>
            </div>
          </div>
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
          disabled={page === 4}
          onClick={() => setPage((p) => (p < 4 ? ((p + 1) as Page) : p))}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
