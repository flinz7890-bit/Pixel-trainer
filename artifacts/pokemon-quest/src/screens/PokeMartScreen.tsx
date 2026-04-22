import { useGame } from "@/game/state";
import Toast from "@/components/Toast";

const ITEMS = [
  { id: "ball" as const, name: "Pokéball", price: 200, icon: "⚪", desc: "Catch wild Pokémon." },
  { id: "potion" as const, name: "Potion", price: 150, icon: "🧪", desc: "Restore 25 HP in battle." },
];

export default function PokeMartScreen() {
  const { state, dispatch } = useGame();

  const buy = (item: typeof ITEMS[number]) => {
    if (state.money < item.price) {
      dispatch({ type: "TOAST", text: "Not enough money!" });
      return;
    }
    dispatch({ type: "SPEND_MONEY", amount: item.price });
    dispatch({ type: "ADD_ITEM", item: item.id, qty: 1 });
    dispatch({ type: "TOAST", text: `Bought 1 ${item.name}` });
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <Toast />
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">🛒</div>
        <div className="flex-1">
          <div className="text-xl font-extrabold">PokéMart</div>
          <div className="text-xs opacity-80">Buy supplies for your journey.</div>
        </div>
        <div className="font-bold">💰 {state.money}</div>
      </div>

      <div className="flex flex-col gap-2">
        {ITEMS.map((item) => (
          <div key={item.id} className="pq-card p-3 flex items-center gap-3">
            <div className="text-3xl">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{item.name} <span className="opacity-70 text-xs">(have {item.id === "ball" ? state.pokeballs : state.potions})</span></div>
              <div className="text-xs opacity-80">{item.desc}</div>
            </div>
            <button className="pq-btn pq-btn-blue" onClick={() => buy(item)} disabled={state.money < item.price}>
              💰 {item.price}
            </button>
          </div>
        ))}
      </div>

      <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
        ← Leave
      </button>
    </div>
  );
}
