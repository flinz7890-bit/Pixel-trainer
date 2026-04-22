import { useGame } from "@/game/state";

export default function Toast() {
  const { state } = useGame();
  if (!state.toast) return null;
  return (
    <div className="fixed inset-x-0 top-4 flex justify-center pointer-events-none z-50">
      <div className="pq-card pq-pop px-4 py-2 text-sm font-medium pointer-events-auto">
        {state.toast}
      </div>
    </div>
  );
}
