import { useState } from "react";
import { useGame, speciesOf, makePokemon, OwnedPokemon } from "@/game/state";
import { SPECIES } from "@/game/data";
import Toast from "@/components/Toast";

export default function EncounterScreen() {
  const { state, dispatch } = useGame();
  const enemy = state.battle?.enemy as OwnedPokemon | undefined;
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!enemy) {
    return (
      <div className="pq-fade py-6 text-center">
        <div className="text-slate-300/80 mb-3">No wild Pokémon here.</div>
        <button className="pq-btn pq-btn-primary" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
          Back
        </button>
      </div>
    );
  }
  const sp = speciesOf(enemy);

  const goBack = () => {
    dispatch({ type: "SET_BATTLE", battle: null });
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  const tryCatch = async () => {
    if (busy) return;
    if (state.pokeballs <= 0) {
      setMsg("No Pokéballs left! Visit the Mart.");
      return;
    }
    setBusy(true);
    setMsg(`You threw a Pokéball at ${sp.name}!`);
    dispatch({ type: "SPEND_BALL" });
    setShake(true);
    await new Promise((r) => setTimeout(r, 900));
    setShake(false);
    const chance = Math.min(0.85, sp.catchRate + 0.15);
    const success = Math.random() < chance;
    if (success) {
      const captured = makePokemon(enemy.speciesId, enemy.level);
      captured.gender = enemy.gender;
      dispatch({ type: "CATCH_POKEMON", speciesId: enemy.speciesId });
      dispatch({ type: "ADD_TO_TEAM", pokemon: captured });
      const xp = sp.xpYield + enemy.level;
      dispatch({ type: "GIVE_XP", xp });
      dispatch({ type: "TOAST", text: `Gotcha! ${sp.name} was caught! +${xp} XP` });
      setMsg(`Gotcha! ${sp.name} was caught!`);
      await new Promise((r) => setTimeout(r, 900));
      goBack();
    } else {
      setMsg(`Oh no! The ${sp.name} broke free!`);
      setBusy(false);
    }
  };

  return (
    <div className="pq-fade flex flex-col gap-4 py-3">
      <Toast />

      <div
        className="rounded-2xl p-5 border-4 relative overflow-hidden"
        style={{
          borderColor: "#0b1220",
          background:
            "radial-gradient(120% 80% at 50% 30%, #cfeed4 0%, #8fcf9f 35%, #3d8b56 75%, #1f4a2c 100%)",
          boxShadow: "inset 0 0 0 3px #1f3b27, 0 8px 24px rgba(0,0,0,0.45)",
          minHeight: 320,
        }}
      >
        <div className="font-pixel text-[10px] text-emerald-100 drop-shadow text-center mb-2">
          A WILD POKÉMON APPEARED!
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="gba-status" style={{ minWidth: 200 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="gba-name uppercase">{sp.name}</span>
                <span style={{ color: enemy.gender === "M" ? "#1d4ed8" : "#be185d", fontWeight: 800 }}>
                  {enemy.gender === "M" ? "♂" : "♀"}
                </span>
              </div>
              <div className="gba-lvl">:L{enemy.level}</div>
            </div>
            <div className="text-[12px] text-slate-700 mt-0.5">
              {sp.type.join(" / ")} • Catch {Math.round(sp.catchRate * 100)}%
            </div>
          </div>

          <div
            className={`gba-pixel-shadow ${shake ? "pq-shake" : "pq-pop"}`}
            style={{ marginTop: 8 }}
          >
            <div
              className="grid place-items-center rounded-full"
              style={{
                width: 150, height: 150,
                background: sp.color + "33",
                border: `4px solid ${sp.color}`,
                boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.5)",
              }}
            >
              <span style={{ fontSize: 110, lineHeight: 1 }}>{sp.sprite}</span>
            </div>
          </div>

          <div className="flex gap-2 text-emerald-50 font-pixel text-[10px] mt-2">
            <span>⚪ {state.pokeballs}</span>
            <span>•</span>
            <span>📍 {state.locationId}</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className="gba-dialog">{msg}</div>
      )}

      <div className="flex flex-col gap-3">
        <button
          className="pq-btn pq-btn-primary text-lg py-4"
          disabled={busy}
          onClick={tryCatch}
        >
          🎯 CAPTURE
        </button>
        <button
          className="pq-btn pq-btn-rose text-lg py-4"
          disabled={busy}
          onClick={goBack}
        >
          🏃 RUN
        </button>
      </div>
    </div>
  );
}
