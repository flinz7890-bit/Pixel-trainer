import { useState } from "react";
import PokeSprite from "@/components/PokeSprite";
import TypeBadge, { typeColor } from "@/components/TypeBadge";
import { useGame } from "@/game/state";
import { SPECIES, LOCATIONS, type Species } from "@/game/data";
import { baseStats, STAT_LABELS_SHORT, STAT_COLORS, isSpecialMove, type StatKey } from "@/game/stats";

const STAT_KEYS: StatKey[] = ["hp", "atk", "def", "spa", "spd", "spe"];

function chainOf(speciesId: number): number[] {
  const chain: number[] = [];
  let rootId = speciesId;
  let safety = 8;
  while (safety-- > 0) {
    const prev = (Object.values(SPECIES) as Species[]).find((sp) => sp?.evolvesTo === rootId);
    if (!prev) break;
    rootId = prev.id;
  }
  let cur: number | undefined = rootId;
  safety = 8;
  while (cur && safety-- > 0) {
    chain.push(cur);
    cur = SPECIES[cur]?.evolvesTo;
  }
  return chain;
}

function locationsForSpecies(speciesId: number): { id: string; name: string; emoji: string; range: string }[] {
  return LOCATIONS
    .filter((l) => l.encounters.some((e) => e.speciesId === speciesId))
    .map((l) => {
      const e = l.encounters.find((x) => x.speciesId === speciesId)!;
      return {
        id: l.id,
        name: l.name,
        emoji: l.emoji,
        range: e.minLevel === e.maxLevel ? `Lv${e.minLevel}` : `Lv${e.minLevel}–${e.maxLevel}`,
      };
    });
}

function MiniBar({ k, value }: { k: StatKey; value: number }) {
  const pct = Math.min(100, (value / 200) * 100);
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono-pq">
      <div className="w-10 uppercase" style={{ color: "#a1a1aa" }}>{STAT_LABELS_SHORT[k]}</div>
      <div className="w-9 text-right" style={{ color: "#f5f5f7" }}>{value}</div>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: "#2a2a3a" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: STAT_COLORS[k], transition: "width .4s" }} />
      </div>
    </div>
  );
}

export default function PokedexScreen() {
  const { state, dispatch } = useGame();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const all = Object.values(SPECIES).sort((a, b) => a.id - b.id);
  const seen = all.filter((s) => state.pokedex[s.id]?.seen).length;
  const caught = all.filter((s) => state.pokedex[s.id]?.caught).length;

  if (selectedId !== null) {
    const sp = SPECIES[selectedId];
    const entry = state.pokedex[selectedId];
    const isSeen = !!entry?.seen;
    const isCaught = !!entry?.caught;
    const tColor = typeColor(sp.type[0]);
    const stats = baseStats(sp);
    const locs = locationsForSpecies(selectedId);
    const evos = chainOf(selectedId);

    return (
      <div className="pq-fade flex flex-col gap-3 py-3 select-none">
        <div className="flex items-center gap-2">
          <button className="pq-btn pq-btn-ghost" onClick={() => setSelectedId(null)}>← Pokédex</button>
          <div className="flex-1 text-center font-pixel text-[12px]" style={{ color: tColor }}>
            #{String(sp.id).padStart(3, "0")} · {isSeen ? sp.name.toUpperCase() : "???"}
          </div>
          <div
            className="font-mono-pq text-[10px] px-2 py-1 rounded-full"
            style={{
              background: isCaught ? "rgba(74,222,128,0.15)" : isSeen ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.06)",
              color: isCaught ? "#4ade80" : isSeen ? "#facc15" : "#a1a1aa",
            }}
          >
            {isCaught ? "✓ CAUGHT" : isSeen ? "SEEN" : "UNKNOWN"}
          </div>
        </div>

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
              width: 130, height: 130,
              background: `radial-gradient(closest-side, ${tColor}33, transparent 70%)`,
              border: `1px solid ${tColor}77`,
              filter: isSeen ? "none" : "grayscale(1) brightness(0.3)",
            }}
          >
            {isSeen
              ? <PokeSprite species={sp} size={120} />
              : <span style={{ fontSize: 64 }}>❓</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono-pq" style={{ color: "#71717a" }}>
              #{String(sp.id).padStart(3, "0")}
            </div>
            <div className="font-pixel text-[16px]">
              {isSeen ? sp.name.toUpperCase() : "??????"}
            </div>
            {isSeen && (
              <div className="mt-1 flex items-center gap-1 flex-wrap">
                {sp.type.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            )}
            <div className="text-[11px] font-mono-pq mt-2" style={{ color: "#d4d4d8" }}>
              {isSeen ? `${(sp.rarity || "common").toUpperCase()} · XP yield ${sp.xpYield}` : "No data."}
            </div>
            <div className="text-[10px] font-mono-pq" style={{ color: "#71717a" }}>
              Catch rate baseline: {Math.round((sp.catchRate || 0.3) * 100)}%
            </div>
          </div>
        </div>

        {!isSeen ? (
          <div className="pq-card p-4 text-center text-[12px] font-mono-pq" style={{ color: "#a1a1aa" }}>
            No data on this Pokémon yet. Encounter one to fill its Pokédex entry.
          </div>
        ) : (
          <>
            <div className="pq-card p-4 flex flex-col gap-1.5">
              <div className="text-[10px] font-mono-pq uppercase tracking-widest mb-1" style={{ color: "#a1a1aa" }}>
                Base Stats (Lv 50 reference)
              </div>
              {STAT_KEYS.map((k) => <MiniBar key={k} k={k} value={stats[k]} />)}
              <div className="text-[10px] font-mono-pq mt-1 text-right" style={{ color: "#71717a" }}>
                BST: {STAT_KEYS.reduce((s, k) => s + stats[k], 0)}
              </div>
            </div>

            <div className="pq-card p-4 flex flex-col gap-2">
              <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>
                Moves
              </div>
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
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pq-card p-4 flex flex-col gap-3">
              <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>
                Evolution Chain
              </div>
              <div className="flex items-center justify-around flex-wrap gap-2">
                {evos.map((id, i) => {
                  const esp = SPECIES[id];
                  if (!esp) return null;
                  const isCurrent = id === sp.id;
                  const eEntry = state.pokedex[id];
                  const eSeen = !!eEntry?.seen;
                  return (
                    <div key={id} className="flex items-center gap-1">
                      <button
                        className="grid place-items-center rounded-xl"
                        onClick={() => setSelectedId(id)}
                        style={{
                          width: 70, height: 70,
                          border: isCurrent ? `2px solid ${tColor}` : "1px solid rgba(255,255,255,0.08)",
                          background: isCurrent ? `${tColor}22` : "rgba(255,255,255,0.03)",
                          filter: eSeen ? "none" : "grayscale(1) brightness(0.4)",
                          cursor: "pointer",
                        }}
                      >
                        {eSeen ? <PokeSprite species={esp} size={56} /> : <span style={{ fontSize: 28 }}>❓</span>}
                      </button>
                      <div className="flex flex-col items-center text-[10px]">
                        <span style={{ color: isCurrent ? tColor : "#a1a1aa" }}>{eSeen ? esp.name : "???"}</span>
                        <span style={{ color: "#71717a" }}>#{String(esp.id).padStart(3, "0")}</span>
                      </div>
                      {i < evos.length - 1 && SPECIES[evos[i]]?.evolvesAt && (
                        <div className="text-[10px]" style={{ color: "#facc15" }}>
                          → Lv{SPECIES[evos[i]].evolvesAt}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pq-card p-4 flex flex-col gap-2">
              <div className="text-[10px] font-mono-pq uppercase tracking-widest" style={{ color: "#a1a1aa" }}>
                Where to Find
              </div>
              {locs.length === 0 ? (
                <div className="text-[11px] font-mono-pq italic" style={{ color: "#71717a" }}>
                  Not found in the wild — obtained by evolution, gift, or special encounter.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {locs.map((l) => (
                    <div key={l.id} className="pq-card-2 px-3 py-2 flex items-center gap-2 text-[11px] font-mono-pq">
                      <span style={{ fontSize: 18 }}>{l.emoji}</span>
                      <span className="flex-1" style={{ color: "#d4d4d8" }}>{l.name}</span>
                      <span style={{ color: "#facc15" }}>{l.range}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">📖</div>
        <div className="flex-1">
          <div className="text-xl font-extrabold">Pokédex</div>
          <div className="text-xs opacity-80">Seen: {seen} • Caught: {caught} • Total: {all.length}</div>
          <div className="text-[10px] opacity-60 mt-0.5">Tap any entry to see its details.</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {all.map((sp) => {
          const e = state.pokedex[sp.id];
          const wasSeen = !!e?.seen;
          const wasCaught = !!e?.caught;
          return (
            <button
              key={sp.id}
              className="pq-card p-2 flex flex-col items-center gap-1"
              onClick={() => setSelectedId(sp.id)}
              style={{
                borderColor: wasCaught ? sp.color : undefined,
                borderWidth: wasCaught ? 2 : 1,
                cursor: "pointer",
                transition: "transform .12s",
              }}
              onMouseDown={(ev) => (ev.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(ev) => (ev.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(ev) => (ev.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ filter: wasSeen ? "none" : "grayscale(1) brightness(0.4)" }}>
                {wasSeen
                  ? <PokeSprite species={sp} size={56} />
                  : <span style={{ fontSize: 30 }}>❓</span>}
              </div>
              <div className="text-xs font-bold">
                #{String(sp.id).padStart(3, "0")} {wasSeen ? sp.name : "???"}
              </div>
              <div className="text-[10px] opacity-80">
                {wasCaught ? "✓ Caught" : wasSeen ? "Seen" : "Unknown"}
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="pq-btn pq-btn-gray"
        onClick={() =>
          dispatch({ type: "SET_SCREEN", screen: state.team.length ? "adventure" : "menu" })
        }
      >
        ← Back
      </button>
    </div>
  );
}
