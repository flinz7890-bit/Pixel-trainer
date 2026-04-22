import { useGame, makePokemon, BattleState } from "@/game/state";
import { GYMS, SPECIES } from "@/game/data";
import Toast from "@/components/Toast";

export default function GymScreen() {
  const { state, dispatch } = useGame();

  const challenge = (gymId: string) => {
    const gym = GYMS.find((g) => g.id === gymId)!;
    if (state.badges.length < gym.unlockBadgeCount) {
      dispatch({ type: "TOAST", text: `Need ${gym.unlockBadgeCount} badge${gym.unlockBadgeCount > 1 ? "s" : ""} first.` });
      return;
    }
    if (state.badges.includes(gym.badge)) {
      dispatch({ type: "TOAST", text: `${gym.name} already defeated.` });
      return;
    }
    if (!state.team[0] || state.team[0].hp <= 0) {
      dispatch({ type: "TOAST", text: "Heal your team first!" });
      return;
    }
    const first = gym.team[0];
    const enemy = makePokemon(first.speciesId, first.level);
    const battle: BattleState = {
      enemy,
      log: [`${gym.name} sent out ${SPECIES[first.speciesId].name}!`],
      busy: false,
      turn: "player",
      isGym: true,
      gymId: gym.id,
      enemyTeamRemaining: gym.team.slice(1),
    };
    dispatch({ type: "SEE_POKEMON", speciesId: first.speciesId });
    dispatch({ type: "SET_BATTLE", battle });
    dispatch({ type: "SET_SCREEN", screen: "battle" });
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3">
      <Toast />
      <div className="pq-card p-4 flex items-center gap-3">
        <div className="text-4xl">🏟</div>
        <div className="flex-1">
          <div className="text-xl font-extrabold">Gym Hall</div>
          <div className="text-xs opacity-80">Challenge Gym Leaders to earn badges.</div>
        </div>
        <div className="text-sm">🏅 {state.badges.length}/{GYMS.length}</div>
      </div>

      {GYMS.map((g) => {
        const beaten = state.badges.includes(g.badge);
        const locked = state.badges.length < g.unlockBadgeCount;
        return (
          <div key={g.id} className="pq-card p-3 flex items-center gap-3">
            <div className="text-3xl">{beaten ? "🏅" : locked ? "🔒" : "⚔"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{g.name} — {g.city}</div>
              <div className="text-xs opacity-80">{g.badge} • Reward 💰 {g.reward}</div>
              <div className="text-[11px] opacity-70 mt-1">
                Team: {g.team.map((m) => `${SPECIES[m.speciesId].name} Lv.${m.level}`).join(", ")}
              </div>
            </div>
            <button
              className={`pq-btn ${beaten ? "pq-btn-gray" : "pq-btn-yellow"}`}
              disabled={beaten || locked}
              onClick={() => challenge(g.id)}
            >
              {beaten ? "✓ Won" : locked ? "Locked" : "Battle"}
            </button>
          </div>
        );
      })}

      <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
        ← Leave
      </button>
    </div>
  );
}
