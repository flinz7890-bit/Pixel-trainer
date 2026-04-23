import { useEffect } from "react";
import { useGame } from "@/game/state";
import { LOCATIONS } from "@/game/data";

export default function BlackoutScreen() {
  const { state, dispatch } = useGame();
  const healLoc = LOCATIONS.find((l) => l.id === state.lastHealLocationId) || LOCATIONS[0];

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: "RESPAWN_AT_HEAL" });
      dispatch({ type: "TOAST", text: "Your Pokémon were healed at the Pokémon Center." });
      dispatch({ type: "LOG", lines: [`You were rushed to ${healLoc.name} PokéCenter.`, "Your Pokémon were fully healed."] });
      dispatch({ type: "SET_SCREEN", screen: "adventure" });
    }, 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="pq-fade flex flex-col items-center justify-center text-center py-20 gap-5 select-none"
      style={{ minHeight: 460 }}
    >
      <div
        className="font-pixel text-3xl"
        style={{
          background: "linear-gradient(180deg,#fb7185 0%,#f43f5e 50%,#7f1d1d 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 28px rgba(244,63,94,0.55)",
          letterSpacing: "0.10em",
        }}
      >
        BLACKED OUT!
      </div>

      <div
        className="text-7xl pq-float"
        aria-hidden
        style={{
          filter: "drop-shadow(0 0 22px rgba(244,63,94,0.55))",
        }}
      >
        💫
      </div>

      <div className="px-6 max-w-sm" style={{ color: "#d4d4d8" }}>
        <p className="text-sm">
          You have no Pokémon left to fight…<br />
          <span style={{ color: "#a1a1aa" }}>You blacked out!</span>
        </p>
        <p className="text-[12px] mt-3 font-mono-pq" style={{ color: "#71717a" }}>
          Rushing you back to {healLoc.emoji} {healLoc.name} PokéCenter…
        </p>
      </div>

      <div className="mt-2" style={{ width: 220 }}>
        <div className="rounded-full overflow-hidden"
          style={{ height: 6, background: "#2a2a3a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="pq-blackout-bar"
            style={{ height: "100%", background: "linear-gradient(90deg,#fb7185,#f43f5e)" }} />
        </div>
      </div>

      <style>{`
        @keyframes pq-blackout-bar { from { width: 0%; } to { width: 100%; } }
        .pq-blackout-bar { animation: pq-blackout-bar 3s linear forwards; }
      `}</style>
    </div>
  );
}
