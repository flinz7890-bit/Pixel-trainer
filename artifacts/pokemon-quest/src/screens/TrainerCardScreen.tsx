import { useGame, speciesOf } from "@/game/state";
import Toast from "@/components/Toast";
import trainerGif from "@assets/dai420w-1ec74242-2aad-47a3-8cf3-6c6f0f7c297b_1776838730939.gif";

export default function TrainerCardScreen() {
  const { state, dispatch } = useGame();
  const team = state.team.slice(0, 6);

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />

      <div className="pq-card p-3 text-center">
        <div className="text-[10px] uppercase tracking-[.4em] text-green-400/80">
          Following You
        </div>
        <div className="font-pixel text-base text-green-300 mt-1">
          {(state.trainerName || "TRAINER").toUpperCase()}
        </div>
        <div className="text-[11px] text-slate-400 font-gba mt-0.5">
          A wild walk through the tall grass...
        </div>
      </div>

      <div
        className="pq-card relative overflow-hidden"
        style={{
          height: 280,
          background:
            "linear-gradient(180deg, #5fa844 0%, #8fd66a 55%, #c8f0a3 100%)",
        }}
      >
        {/* ground stripes */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "55%",
            background:
              "repeating-linear-gradient(90deg, rgba(34,80,30,0.18) 0 6px, transparent 6px 14px)",
          }}
        />
        {/* horizon highlight */}
        <div
          aria-hidden
          className="absolute inset-x-0"
          style={{
            top: "40%",
            height: 2,
            background: "rgba(255,255,255,0.35)",
            filter: "blur(1px)",
          }}
        />

        {/* trainer + party trail */}
        <div className="absolute inset-x-0 bottom-6 flex items-end justify-center gap-3 pointer-events-none">
          <img
            src={trainerGif}
            alt="trainer"
            className="pq-trail"
            style={{
              height: 140,
              imageRendering: "pixelated",
              filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.30))",
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
                    fontSize: 44,
                    lineHeight: 1,
                    filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.30))",
                  }}
                >
                  {sp.sprite}
                </span>
                <div
                  className="font-pixel text-[8px] mt-0.5 px-1 rounded"
                  style={{
                    background: "rgba(0,0,0,0.45)",
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

        {team.length === 0 && (
          <div className="absolute inset-x-0 bottom-2 text-center font-gba text-[14px] text-slate-900/80">
            No Pokémon following you yet.
          </div>
        )}
      </div>

      <div className="pq-card p-3 text-center">
        <div className="font-gba text-[15px] text-slate-200 leading-snug">
          {team.length > 0
            ? `${(state.trainerName || "Trainer")} and ${team.length} Pokémon are out for a stroll!`
            : `${(state.trainerName || "Trainer")} walks alone... catch a Pokémon!`}
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
