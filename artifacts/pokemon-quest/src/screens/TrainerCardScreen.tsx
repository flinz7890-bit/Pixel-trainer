import { useGame, speciesOf, xpToNext } from "@/game/state";
import Toast from "@/components/Toast";
import trainerGif from "@assets/dai420w-1ec74242-2aad-47a3-8cf3-6c6f0f7c297b_1776838730939.gif";

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}

export default function TrainerCardScreen() {
  const { state, dispatch } = useGame();
  const team = state.team.slice(0, 6);
  const totalCaught = Object.values(state.pokedex).filter((e) => e.caught).length;
  const totalSeen = Object.values(state.pokedex).filter((e) => e.seen).length;

  // Aggregate stats
  const totalXp = team.reduce((s, p) => s + p.xp + (p.level - 1) * 30, 0);
  const rankIdx = Math.min(5, Math.floor(totalCaught / 3) + state.badges.length);
  const ranks = ["Rookie", "Novice", "Trainer", "Veteran", "Elite", "Champion"];
  const rank = ranks[rankIdx];
  const nextRankAt = (rankIdx + 1) * 90;
  const rankPct = Math.min(100, (totalXp / nextRankAt) * 100);

  const id = String(Math.abs(hashCode(state.trainerName || "T")) % 99999).padStart(5, "0");
  const startedDate = new Date().toLocaleDateString();

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />

      {/* Trainer Card */}
      <div
        className="pq-card glow-pink p-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #14141f 0%, #16161f 60%, #1a1a2e 100%)",
        }}
      >
        {/* Pokéball watermark */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: -40,
            bottom: -40,
            width: 220,
            height: 220,
            opacity: 0.06,
            background:
              "radial-gradient(circle at center, #fff 0 30%, transparent 31%, transparent 38%, #fff 39% 41%, transparent 42%, #fff 0 48%, transparent 49%)",
            borderRadius: "50%",
          }}
        />

        <div className="flex items-center gap-4 relative">
          {/* Avatar */}
          <div
            className="shrink-0 grid place-items-center rounded-2xl overflow-hidden"
            style={{
              width: 96,
              height: 96,
              background: "linear-gradient(180deg, rgba(244,63,94,0.18), rgba(244,63,94,0.04))",
              border: "1px solid rgba(244,63,94,0.40)",
              boxShadow: "0 0 24px rgba(244,63,94,0.30), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <img
              src={trainerGif}
              alt="trainer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.30))",
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] font-mono-pq tracking-[.3em] uppercase"
              style={{ color: "#71717a" }}
            >
              Trainer ID #{id}
            </div>
            <div
              className="font-pixel text-[15px] mt-0.5 truncate"
              style={{
                background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {(state.trainerName || "TRAINER").toUpperCase()}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5">
              <span
                className="font-mono-pq text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(168,85,247,0.18)",
                  color: "#c084fc",
                  border: "1px solid rgba(168,85,247,0.40)",
                }}
              >
                {rank.toUpperCase()}
              </span>
              <span
                className="font-mono-pq text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(34,211,238,0.15)",
                  color: "#22d3ee",
                  border: "1px solid rgba(34,211,238,0.35)",
                }}
              >
                KANTO
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid 2x2 */}
        <div className="grid grid-cols-2 gap-2 mt-4 relative">
          <StatCard label="PokéDollars" value={`₽${state.money}`} color="#facc15" />
          <StatCard label="Wins" value={String(state.badges.length)} color="#4ade80" />
          <StatCard label="Items" value={String(state.pokeballs + state.potions)} color="#fb923c" />
          <StatCard label="Pokédex" value={`${totalCaught}/${totalSeen}`} color="#a855f7" />
        </div>

        {/* EXP / Rank progress */}
        <div className="mt-4 relative">
          <div className="flex items-center justify-between text-[10px] font-mono-pq mb-1">
            <span style={{ color: "#a1a1aa" }}>NEXT RANK</span>
            <span style={{ color: "#a1a1aa" }}>
              {totalXp}/{nextRankAt} XP
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{
              height: 10,
              background: "#2a2a3a",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                width: `${rankPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #4ade80, #22c55e)",
                boxShadow: "0 0 16px rgba(74,222,128,0.55)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <div
          className="mt-4 text-[10px] italic font-mono-pq relative"
          style={{ color: "#71717a" }}
        >
          Adventure started {startedDate}
        </div>
      </div>

      {/* Following you - mini scene */}
      <div
        className="pq-card relative overflow-hidden"
        style={{
          height: 200,
          background: "linear-gradient(180deg, #1a3050 0%, #1f3a2e 60%, #142a1c 100%)",
          borderColor: "var(--border)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "55%",
            background:
              "repeating-linear-gradient(90deg, rgba(34,80,30,0.22) 0 6px, transparent 6px 14px)",
          }}
        />
        <div className="absolute inset-x-0 bottom-4 flex items-end justify-center gap-2 pointer-events-none px-3">
          <img
            src={trainerGif}
            alt="trainer walking"
            className="pq-trail"
            style={{
              height: 110,
              imageRendering: "pixelated",
              filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.35))",
            }}
          />
          {team.map((p, i) => {
            const sp = speciesOf(p);
            return (
              <div
                key={p.uid}
                className="pq-trail flex flex-col items-center"
                style={{ animationDelay: `${(i + 1) * 0.18}s` }}
              >
                <span
                  style={{
                    fontSize: 36,
                    lineHeight: 1,
                    filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35))",
                  }}
                >
                  {sp.sprite}
                </span>
                <div
                  className="font-mono-pq text-[8px] mt-0.5 px-1 rounded"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    letterSpacing: 0.5,
                  }}
                >
                  L{p.level}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="pq-btn pq-btn-ghost"
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}
      >
        ← Back
      </button>

      {/* helper to keep xpToNext referenced if tree-shaken */}
      <span hidden>{xpToNext(1)}</span>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="pq-card-2 px-3 py-2.5"
      style={{
        borderColor: "var(--border)",
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.02), 0 0 14px ${color}22`,
      }}
    >
      <div
        className="text-[9.5px] font-mono-pq tracking-[.18em] uppercase"
        style={{ color: "#71717a" }}
      >
        {label}
      </div>
      <div
        className="font-mono-pq font-bold text-[18px] mt-0.5"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
