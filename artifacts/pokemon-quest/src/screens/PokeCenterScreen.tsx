import { useState } from "react";
import { useGame } from "@/game/state";
import PokemonCard from "@/components/PokemonCard";
import Toast from "@/components/Toast";

export default function PokeCenterScreen() {
  const { state, dispatch } = useGame();
  const [healing, setHealing] = useState(false);

  const heal = async () => {
    setHealing(true);
    await new Promise((r) => setTimeout(r, 900));
    dispatch({ type: "HEAL_ALL" });
    dispatch({ type: "TOAST", text: "Your Pokémon are fully healed!" });
    setHealing(false);
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <Toast />
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">🏥</div>
        <div>
          <div className="text-xl font-extrabold">PokéCenter</div>
          <div className="text-xs opacity-80">Nurse Joy will heal your Pokémon to full health.</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {state.team.map((p) => <PokemonCard key={p.uid} p={p} showXp={false} />)}
      </div>
      <button className="pq-btn pq-btn-green" onClick={heal} disabled={healing}>
        {healing ? "Healing..." : "💚 Heal Team"}
      </button>
      <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
        ← Leave
      </button>
    </div>
  );
}
