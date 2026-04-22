import { useGame } from "@/game/state";
import { SPECIES } from "@/game/data";

export default function PokedexScreen() {
  const { state, dispatch } = useGame();
  const all = Object.values(SPECIES).sort((a, b) => a.id - b.id);
  const seen = all.filter((s) => state.pokedex[s.id]?.seen).length;
  const caught = all.filter((s) => state.pokedex[s.id]?.caught).length;

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">📖</div>
        <div className="flex-1">
          <div className="text-xl font-extrabold">Pokédex</div>
          <div className="text-xs opacity-80">Seen: {seen} • Caught: {caught} • Total: {all.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {all.map((sp) => {
          const e = state.pokedex[sp.id];
          const seen = !!e?.seen;
          const caught = !!e?.caught;
          return (
            <div
              key={sp.id}
              className="pq-card p-2 flex flex-col items-center gap-1"
              style={{ borderColor: caught ? sp.color : undefined, borderWidth: caught ? 2 : 1 }}
            >
              <div className="text-3xl" style={{ filter: seen ? "none" : "grayscale(1) brightness(0.4)" }}>
                {seen ? sp.sprite : "❓"}
              </div>
              <div className="text-xs font-bold">
                #{String(sp.id).padStart(3, "0")} {seen ? sp.name : "???"}
              </div>
              <div className="text-[10px] opacity-80">
                {caught ? "✓ Caught" : seen ? "Seen" : "Unknown"}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="pq-btn pq-btn-gray"
        onClick={() =>
          dispatch({ type: "SET_SCREEN", screen: state.team.length ? "adventure" : "home" })
        }
      >
        ← Back
      </button>
    </div>
  );
}
