import { useState } from "react";
import { useGame, makePokemon, BattleState } from "@/game/state";
import { GYMS, GymLeader, SPECIES } from "@/game/data";
import { typeColor } from "@/components/TypeBadge";
import Toast from "@/components/Toast";

export default function GymScreen() {
  const { state, dispatch } = useGame();
  // Pre-battle intro modal state — null when no intro is open
  const [intro, setIntro] = useState<GymLeader | null>(null);

  const tryOpenIntro = (gym: GymLeader) => {
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
    setIntro(gym);
  };

  const acceptChallenge = () => {
    if (!intro) return;
    const gym = intro;
    const first = gym.team[0];
    const enemy = makePokemon(first.speciesId, first.level);
    const battle: BattleState = {
      enemy,
      log: [
        `${gym.name}: "I am ${gym.name}, the ${gym.city} Gym Leader!"`,
        `${gym.name} sent out ${SPECIES[first.speciesId].name}!`,
      ],
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
              onClick={() => tryOpenIntro(g)}
            >
              {beaten ? "✓ Won" : locked ? "Locked" : "Battle"}
            </button>
          </div>
        );
      })}

      <button className="pq-btn pq-btn-gray" onClick={() => dispatch({ type: "SET_SCREEN", screen: "adventure" })}>
        ← Leave
      </button>

      {/* Pre-battle intro modal */}
      {intro && (
        <div
          className="pq-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setIntro(null); }}
        >
          <div className="pq-gym-intro" style={{ borderColor: typeColor(intro.type) }}>
            <div
              className="pq-gym-intro-header"
              style={{ background: `linear-gradient(135deg, ${typeColor(intro.type)} 0%, ${typeColor(intro.type)}88 100%)` }}
            >
              <div className="pq-gym-intro-leader">
                <div className="pq-gym-intro-leader-name">LEADER {intro.name.toUpperCase()}</div>
                <div className="pq-gym-intro-leader-city">{intro.city.toUpperCase()} GYM</div>
              </div>
              <div className="pq-gym-intro-type-pill">{intro.type.toUpperCase()}</div>
            </div>

            <div className="pq-gym-intro-body">
              <div className="pq-gym-intro-badge">
                <div className="pq-gym-intro-badge-icon">🏅</div>
                <div className="pq-gym-intro-badge-info">
                  <div className="pq-gym-intro-badge-label">PRIZE BADGE</div>
                  <div className="pq-gym-intro-badge-name">{intro.badge}</div>
                  <div className="pq-gym-intro-reward">+ ₽{intro.reward.toLocaleString()}</div>
                </div>
              </div>

              <div className="pq-gym-intro-quote">
                <div className="pq-gym-intro-quote-mark">"</div>
                <div className="pq-gym-intro-quote-text">{intro.quote}</div>
              </div>

              <div className="pq-gym-intro-team">
                <div className="pq-gym-intro-team-label">TEAM</div>
                <div className="pq-gym-intro-team-list">
                  {intro.team.map((m, i) => (
                    <span key={i} className="pq-gym-intro-team-chip">
                      {SPECIES[m.speciesId].name} <b>Lv{m.level}</b>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pq-gym-intro-footer">
              <button className="pq-btn pq-btn-gray" onClick={() => setIntro(null)}>
                ← Back Out
              </button>
              <button
                className="pq-btn pq-btn-yellow"
                style={{ background: typeColor(intro.type), borderColor: typeColor(intro.type) }}
                onClick={acceptChallenge}
              >
                ⚔ Accept Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
