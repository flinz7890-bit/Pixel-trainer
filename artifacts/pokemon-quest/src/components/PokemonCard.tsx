import { useEffect, useRef, useState } from "react";
import PokeSprite from "@/components/PokeSprite";
import { OwnedPokemon, speciesOf, xpToNext, useGame } from "@/game/state";
import TypeBadge, { TypeBadges, typeColor } from "@/components/TypeBadge";

interface Props {
  p: OwnedPokemon;
  showXp?: boolean;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
  index?: number;
  total?: number;
  showMenu?: boolean;
}

export default function PokemonCard({ p, showXp = true, active = false, compact = false, onClick, index, total, showMenu = false }: Props) {
  const sp = speciesOf(p);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  const xpPct = (p.xp / xpToNext(p.level)) * 100;
  const hpColor = hpPct > 50 ? "#4ade80" : hpPct > 20 ? "#facc15" : "#f43f5e";
  const tColor = typeColor(sp.type[0]);

  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const idx = typeof index === "number" ? index : state.team.findIndex((x) => x.uid === p.uid);
  const last = (typeof total === "number" ? total : state.team.length) - 1;
  const canUp = idx > 0;
  const canDown = idx >= 0 && idx < last;
  const canRelease = state.team.length > 1;
  const isActive = idx === 0;

  const release = () => {
    dispatch({ type: "RELEASE_POKEMON", uid: p.uid });
    dispatch({ type: "TOAST", text: `${sp.name} was released.` });
    setConfirm(false);
    setOpen(false);
  };

  const Menu = () => (
    <div
      className="pq-card absolute z-30 right-0 top-9 w-44 p-1 text-[12px] font-mono-pq"
      style={{ background: "var(--panel-2)", boxShadow: "0 12px 30px rgba(0,0,0,0.55)" }}
    >
      <button
        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5"
        onClick={() => { setOpen(false); dispatch({ type: "OPEN_SUMMARY", uid: p.uid }); }}
      >📋 Summary</button>
      <button
        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 disabled:opacity-40"
        disabled={isActive || idx < 0}
        onClick={() => { setOpen(false); if (idx > 0) dispatch({ type: "SWAP_ACTIVE", withIndex: idx }); }}
      >🔄 Set as Active</button>
      <button
        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 disabled:opacity-40"
        disabled={!canUp}
        onClick={() => { setOpen(false); dispatch({ type: "REORDER_TEAM", uid: p.uid, direction: "up" }); }}
      >⬆️ Move Up</button>
      <button
        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 disabled:opacity-40"
        disabled={!canDown}
        onClick={() => { setOpen(false); dispatch({ type: "REORDER_TEAM", uid: p.uid, direction: "down" }); }}
      >⬇️ Move Down</button>
      <button
        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 disabled:opacity-40"
        style={{ color: "#fb7185" }}
        disabled={!canRelease}
        onClick={() => { setConfirm(true); setOpen(false); }}
      >🗑️ Release</button>
    </div>
  );

  const ConfirmDialog = () => (
    <div
      className="fixed inset-0 z-40 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={() => setConfirm(false)}
    >
      <div
        className="pq-card p-4 w-full max-w-xs"
        style={{ background: "var(--panel-2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-pixel text-[12px] mb-2" style={{ color: "#fb7185" }}>RELEASE POKÉMON?</div>
        <div className="text-[12px] mb-3">
          Are you sure you want to release <b>{sp.name}</b>? This cannot be undone.
        </div>
        <div className="flex gap-2">
          <button className="pq-btn pq-btn-gray flex-1" onClick={() => setConfirm(false)}>Cancel</button>
          <button
            className="pq-btn flex-1"
            style={{ background: "linear-gradient(180deg,#fb7185,#e11d48)", color: "#fff" }}
            onClick={release}
          >Release</button>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="relative" ref={ref}>
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
            background: active ? `linear-gradient(180deg, ${tColor}1a, var(--panel-2))` : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-[9px] font-mono-pq px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", color: "#d4d4d8", letterSpacing: "0.06em" }}
            >
              LV {p.level}
            </div>
            {active && (
              <span title="Active" style={{ width: 8, height: 8, borderRadius: 999, background: tColor, boxShadow: `0 0 10px ${tColor}` }} />
            )}
          </div>
          <div
            className="grid place-items-center mt-1.5 mx-auto rounded-2xl"
            style={{
              width: 64, height: 64,
              background: `radial-gradient(closest-side, ${tColor}33, transparent 75%)`,
              border: `1px solid ${tColor}77`,
            }}
          >
            <PokeSprite species={sp} size={56} />
          </div>
          <div className="font-pixel text-[11px] mt-1.5 truncate flex items-center gap-1">
            <span>{sp.name.toUpperCase()}</span>
            <span style={{ color: p.gender === "M" ? "#60a5fa" : "#f472b6" }}>{p.gender === "M" ? "♂" : "♀"}</span>
          </div>
          <div className="mt-1"><TypeBadge type={sp.type[0]} /></div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono-pq">
            <span style={{ color: "#a1a1aa" }}>HP</span>
            <span style={{ color: "#e5e7eb" }}>{p.hp}/{p.maxHp}</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#2a2a3a" }}>
            <div style={{ width: `${hpPct}%`, height: "100%", background: hpColor, transition: "width .35s" }} />
          </div>
        </button>
        {showMenu && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            className="absolute top-1.5 right-1.5 w-6 h-6 grid place-items-center rounded-full text-[14px] leading-none"
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
            aria-label="Menu"
          >⋯</button>
        )}
        {showMenu && open && <Menu />}
        {confirm && <ConfirmDialog />}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="pq-card pq-fade p-3 flex flex-col gap-2 relative"
      style={
        active
          ? { borderColor: tColor, boxShadow: `0 12px 30px rgba(0,0,0,0.45), 0 0 22px ${tColor}55` }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        {showMenu && (
          <div className="text-[18px] opacity-50 cursor-grab select-none" title="Drag handle (use menu to reorder)">≡</div>
        )}
        <div
          className="shrink-0 grid place-items-center rounded-2xl w-16 h-16 text-4xl"
          style={{
            background: `linear-gradient(180deg, ${tColor}33, ${tColor}11)`,
            border: `2px solid ${tColor}aa`,
          }}
        >
          <PokeSprite species={sp} size={60} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-pixel text-[12px] truncate flex items-center gap-1">
              <span>{sp.name.toUpperCase()}</span>
              <span style={{ color: p.gender === "M" ? "#60a5fa" : "#f472b6" }}>{p.gender === "M" ? "♂" : "♀"}</span>
            </div>
            <div className="text-[10px] font-mono-pq px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#d4d4d8" }}>
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
        {showMenu && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-7 h-7 grid place-items-center rounded-full text-[16px]"
            style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}
            aria-label="Menu"
          >⋯</button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10.5px] font-mono-pq">
          <span style={{ color: "#a1a1aa" }}>HP</span>
          <span style={{ color: "#e5e7eb" }}>{p.hp}/{p.maxHp}</span>
        </div>
        <div className="pq-hp-bar"><div className="pq-hp-fill" style={{ width: `${hpPct}%`, background: hpColor }} /></div>
        {showXp && (
          <>
            <div className="flex items-center justify-between text-[10px] font-mono-pq mt-1">
              <span style={{ color: "#a1a1aa" }}>EXP</span>
              <span style={{ color: "#a1a1aa" }}>{p.xp}/{xpToNext(p.level)}</span>
            </div>
            <div className="pq-xp-bar"><div className="pq-xp-fill" style={{ width: `${xpPct}%` }} /></div>
          </>
        )}
      </div>

      {showMenu && open && <Menu />}
      {confirm && <ConfirmDialog />}
    </div>
  );
}
