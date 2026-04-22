import { useGame, speciesOf } from "@/game/state";
import { GYMS } from "@/game/data";
import Toast from "@/components/Toast";

const BADGE_COLORS = [
  "#a16207", "#06b6d4", "#facc15", "#fb7185",
  "#22c55e", "#fb923c", "#a78bfa", "#e11d48",
];

export default function TrainerCardScreen() {
  const { state, dispatch } = useGame();
  const team = state.team.slice(0, 6);
  const slots = [...team, ...Array(6 - team.length).fill(null)];
  const totalCaught = Object.values(state.pokedex).filter((e) => e.caught).length;

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />

      <div
        className="rounded-2xl border-4 p-3"
        style={{
          borderColor: "#0b1220",
          background:
            "linear-gradient(180deg, #d7f0c5 0%, #a4d870 40%, #5fa844 100%)",
          boxShadow: "inset 0 0 0 3px #2d5a1f, 0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {/* Title bar */}
        <div
          className="font-pixel text-center py-2 mb-3 rounded"
          style={{
            background: "linear-gradient(180deg, #fff8ec, #f0e3c1)",
            border: "3px solid #1b1b1b",
            boxShadow: "inset 0 0 0 2px #c89c5a",
            color: "#1b1b1b",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          ★ TRAINER CARD ★
        </div>

        <div className="flex gap-3 items-stretch">
          {/* Trainer sprite panel */}
          <div
            className="flex flex-col items-center justify-between p-2 rounded"
            style={{
              background: "linear-gradient(180deg, #fff8ec, #f0e3c1)",
              border: "3px solid #1b1b1b",
              boxShadow: "inset 0 0 0 2px #c89c5a",
              minWidth: 110,
            }}
          >
            <div style={{ fontSize: 64, lineHeight: 1 }} className="pq-float">🧑‍🎤</div>
            <div className="font-pixel text-[9px] text-center text-slate-800 mt-1 break-words">
              {(state.trainerName || "TRAINER").toUpperCase()}
            </div>
            <div className="text-[11px] text-slate-700 mt-1 font-gba">
              ID 0{Math.abs(hashCode(state.trainerName || "T")) % 9999}
            </div>
          </div>

          {/* Stats + Pokemon grid */}
          <div className="flex-1 flex flex-col gap-2">
            <div
              className="rounded p-2 text-[12px] text-slate-800 font-gba"
              style={{
                background: "linear-gradient(180deg, #fff8ec, #f0e3c1)",
                border: "3px solid #1b1b1b",
                boxShadow: "inset 0 0 0 2px #c89c5a",
                lineHeight: 1.2,
              }}
            >
              <div className="flex justify-between"><span>MONEY</span><span>₽{state.money}</span></div>
              <div className="flex justify-between"><span>POKÉDEX</span><span>{totalCaught} caught</span></div>
              <div className="flex justify-between"><span>BADGES</span><span>{state.badges.length}/8</span></div>
            </div>

            <div
              className="rounded p-2"
              style={{
                background: "linear-gradient(180deg, #fff8ec, #f0e3c1)",
                border: "3px solid #1b1b1b",
                boxShadow: "inset 0 0 0 2px #c89c5a",
              }}
            >
              <div className="font-pixel text-[8px] text-slate-700 mb-1 text-center">PARTY</div>
              <div className="grid grid-cols-3 gap-1.5">
                {slots.map((p, i) => (
                  <div
                    key={i}
                    className="grid place-items-center rounded"
                    style={{
                      aspectRatio: "1",
                      background: p ? speciesOf(p).color + "44" : "#e7e0c2",
                      border: "2px solid #1b1b1b",
                      boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.6)",
                      position: "relative",
                    }}
                  >
                    {p ? (
                      <>
                        <span style={{ fontSize: 28, lineHeight: 1 }}>{speciesOf(p).sprite}</span>
                        <span className="absolute bottom-0 right-0.5 font-gba text-[10px] text-slate-900 leading-none">L{p.level}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-xl">?</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div
          className="rounded p-2 mt-3"
          style={{
            background: "linear-gradient(180deg, #fff8ec, #f0e3c1)",
            border: "3px solid #1b1b1b",
            boxShadow: "inset 0 0 0 2px #c89c5a",
          }}
        >
          <div className="font-pixel text-[8px] text-slate-700 mb-1 text-center">GYM BADGES</div>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 8 }).map((_, i) => {
              const earned = i < state.badges.length;
              const gym = GYMS[i];
              const color = BADGE_COLORS[i];
              return (
                <div
                  key={i}
                  title={gym?.badge || "—"}
                  className="grid place-items-center rounded-full aspect-square"
                  style={{
                    background: earned ? color : "#cbc69e",
                    border: "2px solid #1b1b1b",
                    boxShadow: earned
                      ? `inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 8px ${color}88`
                      : "inset 0 0 0 2px rgba(0,0,0,0.15)",
                    opacity: earned ? 1 : 0.55,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{earned ? "★" : "·"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        className="pq-btn pq-btn-ghost"
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}
      >
        ← Back
      </button>
    </div>
  );
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}
