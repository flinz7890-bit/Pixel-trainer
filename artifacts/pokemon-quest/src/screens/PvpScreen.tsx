import { useEffect, useRef, useState } from "react";
import { useGame, speciesOf, type OwnedPokemon } from "@/game/state";
import Toast from "@/components/Toast";
import PokeSprite from "@/components/PokeSprite";
import { typeColor } from "@/components/TypeBadge";
import { isSpecialMove } from "@/game/stats";
import { SPECIES } from "@/game/data";

const API_BASE = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") || "";

interface RemotePlayer {
  trainerId: string;
  trainerName: string;
  teamSize: number;
  avgLevel: number;
}

interface PvpPokemon {
  speciesId: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
  moves: { name: string; power: number; type: string }[];
  type: string[];
}

interface Challenge {
  id: string;
  fromTrainerId: string;
  fromTrainerName: string;
  toTrainerId: string;
  fromTeam: PvpPokemon[];
  status: "pending" | "accepted" | "declined" | "expired" | "completed";
  createdAt: number;
  result?: { winnerTrainerId: string; log: string[]; finishedAt: number };
}

interface LeaderboardEntry {
  trainerId: string;
  trainerName: string;
  wins: number;
  losses: number;
  score: number;
}

function snapshot(team: OwnedPokemon[]): PvpPokemon[] {
  return team.map((p) => {
    const sp = speciesOf(p);
    return {
      speciesId: p.speciesId,
      name: sp.name,
      level: p.level,
      hp: p.maxHp,
      maxHp: p.maxHp,
      atk: p.atk,
      def: p.def,
      spa: p.spa,
      spd: p.spd,
      spe: p.spe,
      moves: sp.moves.map((m) => ({ name: m.name, power: m.power, type: m.type })),
      type: sp.type,
    };
  });
}

async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

type Tab = "lobby" | "battle" | "leaderboard";

export default function PvpScreen() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<Tab>("lobby");
  const [players, setPlayers] = useState<RemotePlayer[]>([]);
  const [incoming, setIncoming] = useState<Challenge[]>([]);
  const [outgoing, setOutgoing] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const tid = state.playerId;
  const tname = state.trainerName || "Trainer";

  // Refs to keep latest values without re-creating poll loop
  const teamRef = useRef(state.team);
  teamRef.current = state.team;
  const activeRef = useRef(activeChallenge);
  activeRef.current = activeChallenge;

  // Heartbeat & poll (single interval, lifetime of screen)
  useEffect(() => {
    let alive = true;
    const beat = async () => {
      try {
        await api(`/api/pvp/register`, {
          method: "POST",
          body: JSON.stringify({ trainerId: tid, trainerName: tname, team: snapshot(teamRef.current) }),
        });
        const p = await api<{ players: RemotePlayer[] }>(`/api/pvp/players?trainerId=${encodeURIComponent(tid)}`);
        const c = await api<{ incoming: Challenge[]; outgoing: Challenge[] }>(
          `/api/pvp/challenges/${encodeURIComponent(tid)}`
        );
        const lb = await api<{ leaderboard: LeaderboardEntry[] }>(`/api/pvp/leaderboard`);
        if (!alive) return;
        setPlayers(p.players);
        setIncoming(c.incoming);
        setOutgoing(c.outgoing);
        setLeaderboard(lb.leaderboard);
        setError(null);

        const cur = activeRef.current;
        const accepted = c.outgoing.find((x) => x.status === "accepted" && (!cur || cur.id !== x.id));
        if (accepted && !cur) {
          setActiveChallenge(accepted);
          setTab("battle");
        }
        if (cur && cur.status !== "completed") {
          const updated = [...c.incoming, ...c.outgoing].find((x) => x.id === cur.id);
          if (updated && updated.status !== cur.status) setActiveChallenge(updated);
        }
      } catch (e: any) {
        if (alive) setError(e?.message || "Network error");
      }
    };
    beat();
    const id = setInterval(beat, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [tid, tname]);

  const sendChallenge = async (toTrainerId: string) => {
    try {
      const res = await api<{ id: string; challenge: Challenge }>(`/api/pvp/challenge`, {
        method: "POST",
        body: JSON.stringify({
          fromTrainerId: tid,
          fromTrainerName: tname,
          toTrainerId,
          fromTeam: snapshot(state.team),
        }),
      });
      dispatch({ type: "TOAST", text: "Challenge sent!" });
      setOutgoing((prev) => [...prev, res.challenge]);
    } catch (e: any) {
      setError(e?.message || "Failed to send challenge");
    }
  };

  const accept = async (id: string) => {
    try {
      const c = await api<Challenge>(`/api/pvp/challenge/${id}/accept`, { method: "POST" });
      setActiveChallenge(c);
      setTab("battle");
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const decline = async (id: string) => {
    try {
      await api(`/api/pvp/challenge/${id}/decline`, { method: "POST" });
      setIncoming((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const back = () => {
    if (tab === "battle" && activeChallenge?.status !== "completed") {
      if (!confirm("Forfeit current PVP battle?")) return;
    }
    dispatch({ type: "SET_SCREEN", screen: "adventure" });
  };

  return (
    <div className="pq-fade flex flex-col gap-3 py-3 select-none">
      <Toast />
      <div className="flex items-center gap-2">
        <button className="pq-btn pq-btn-ghost" onClick={back}>← Back</button>
        <div className="flex-1 text-center font-pixel text-[12px]" style={{ color: "#22d3ee" }}>
          PVP · ONLINE
        </div>
        <div className="font-mono-pq text-[10px] px-2 py-1 rounded-full"
          style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}>
          {state.pvpWins || 0}W / {state.pvpLosses || 0}L
        </div>
      </div>

      <div className="pq-card p-3 flex items-center gap-3">
        <div>
          <div className="text-[10px] font-mono-pq" style={{ color: "#71717a" }}>YOUR TRAINER ID</div>
          <div className="font-mono-pq text-[13px]" style={{ color: "#22d3ee" }}>{tid}</div>
        </div>
        <div className="ml-auto text-[10px] font-mono-pq" style={{ color: "#a1a1aa" }}>
          {tname.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {(["lobby", "battle", "leaderboard"] as Tab[]).map((t) => {
          const active = tab === t;
          const label = t === "lobby" ? "Lobby" : t === "battle" ? "Battle" : "Leaders";
          return (
            <button
              key={t}
              className="pq-btn"
              onClick={() => setTab(t)}
              style={{
                background: active ? "linear-gradient(180deg,#22d3ee,#0891b2)" : "transparent",
                color: active ? "#0c1014" : "#a1a1aa",
                borderColor: active ? "#22d3ee" : "rgba(255,255,255,0.10)",
                fontSize: 11, padding: "6px 0",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="pq-card-2 p-2 text-[11px] font-mono-pq" style={{ color: "#fb7185", borderColor: "rgba(244,63,94,0.4)" }}>
          {error}
        </div>
      )}

      {tab === "lobby" && (
        <LobbyTab
          players={players}
          incoming={incoming}
          outgoing={outgoing}
          onChallenge={sendChallenge}
          onAccept={accept}
          onDecline={decline}
        />
      )}

      {tab === "battle" && (
        <BattleTab
          challenge={activeChallenge}
          onClose={() => { setActiveChallenge(null); setTab("lobby"); }}
        />
      )}

      {tab === "leaderboard" && <LeaderboardTab list={leaderboard} myId={tid} />}
    </div>
  );
}

// ---------------- Lobby ----------------

function LobbyTab({
  players, incoming, outgoing, onChallenge, onAccept, onDecline,
}: {
  players: RemotePlayer[];
  incoming: Challenge[];
  outgoing: Challenge[];
  onChallenge: (id: string) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const pending = incoming.filter((c) => c.status === "pending");
  return (
    <div className="flex flex-col gap-3">
      {pending.length > 0 && (
        <div className="pq-card p-3">
          <div className="text-[10px] font-mono-pq uppercase tracking-widest mb-2" style={{ color: "#facc15" }}>
            ⚡ Incoming Challenges ({pending.length})
          </div>
          <div className="flex flex-col gap-2">
            {pending.map((c) => (
              <div key={c.id} className="pq-card-2 p-2 flex items-center gap-2"
                style={{ borderColor: "rgba(250,204,21,0.4)" }}>
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[11px]">{c.fromTrainerName.toUpperCase()}</div>
                  <div className="text-[9px] font-mono-pq" style={{ color: "#71717a" }}>
                    {c.fromTeam.length} mons · avg lv{Math.round(c.fromTeam.reduce((s, p) => s + p.level, 0) / Math.max(1, c.fromTeam.length))}
                  </div>
                </div>
                <button className="pq-btn pq-btn-ghost" style={{ fontSize: 10, padding: "4px 8px", color: "#4ade80", borderColor: "rgba(74,222,128,0.4)" }}
                  onClick={() => onAccept(c.id)}>Fight</button>
                <button className="pq-btn pq-btn-ghost" style={{ fontSize: 10, padding: "4px 8px", color: "#a1a1aa" }}
                  onClick={() => onDecline(c.id)}>Pass</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pq-card p-3">
        <div className="text-[10px] font-mono-pq uppercase tracking-widest mb-2" style={{ color: "#22d3ee" }}>
          Trainers Online ({players.length})
        </div>
        {players.length === 0 ? (
          <div className="text-[11px] font-mono-pq italic text-center py-3" style={{ color: "#71717a" }}>
            No one else is here yet. Stay tuned…
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const out = outgoing.find((c) => c.toTrainerId === p.trainerId && c.status === "pending");
              return (
                <div key={p.trainerId} className="pq-card-2 p-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[11px] truncate">{p.trainerName.toUpperCase()}</div>
                    <div className="text-[9px] font-mono-pq" style={{ color: "#71717a" }}>
                      {p.trainerId} · {p.teamSize} mons · avg lv{p.avgLevel}
                    </div>
                  </div>
                  {out ? (
                    <span className="text-[10px] font-mono-pq" style={{ color: "#facc15" }}>Waiting…</span>
                  ) : (
                    <button className="pq-btn pq-btn-ghost"
                      style={{ fontSize: 10, padding: "4px 8px", color: "#22d3ee", borderColor: "rgba(34,211,238,0.4)" }}
                      onClick={() => onChallenge(p.trainerId)}>Challenge</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Battle ----------------

interface LiveMon {
  data: PvpPokemon;
  hp: number;
}

function BattleTab({ challenge, onClose }: { challenge: Challenge | null; onClose: () => void }) {
  const { state, dispatch } = useGame();
  const tid = state.playerId;

  const [myIdx, setMyIdx] = useState(0);
  const [oppIdx, setOppIdx] = useState(0);
  const [myTeam, setMyTeam] = useState<LiveMon[]>([]);
  const [oppTeam, setOppTeam] = useState<LiveMon[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<"me" | "opp" | "done">("me");
  const [timeLeft, setTimeLeft] = useState(30);
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null);
  const submittedRef = useRef(false);

  // Initialize from challenge
  useEffect(() => {
    if (!challenge) return;
    const isFromMe = challenge.fromTrainerId === tid;
    const mineSnap = isFromMe ? challenge.fromTeam : snapshot(state.team);
    const oppSnap = isFromMe
      ? snapshotPlaceholder(challenge.toTrainerId, challenge.fromTeam.length)
      : challenge.fromTeam;
    setMyTeam(mineSnap.map((p) => ({ data: p, hp: p.maxHp })));
    setOppTeam(oppSnap.map((p) => ({ data: p, hp: p.maxHp })));
    setMyIdx(0); setOppIdx(0);
    setLog([`Battle vs ${isFromMe ? "your opponent" : challenge.fromTrainerName}!`]);
    setTurn("me"); setTimeLeft(30); setOutcome(null);
    submittedRef.current = false;

    // If we're sender and challenge has result, show result
    if (challenge.status === "completed" && challenge.result) {
      setOutcome(challenge.result.winnerTrainerId === tid ? "won" : "lost");
      setLog(challenge.result.log);
      setTurn("done");
    }
  }, [challenge?.id, challenge?.status]);

  // Turn timer
  useEffect(() => {
    if (turn === "done" || outcome) return;
    setTimeLeft(30);
    const i = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(i);
          if (turn === "me") {
            // Auto-attack with first move
            performMyAttack(0);
          }
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, myIdx, oppIdx]);

  // Opp turn AI
  useEffect(() => {
    if (turn !== "opp" || outcome) return;
    const t = setTimeout(() => {
      const opp = oppTeam[oppIdx];
      const me = myTeam[myIdx];
      if (!opp || !me) return;
      const mv = opp.data.moves[Math.floor(Math.random() * opp.data.moves.length)];
      const dmg = computeDamage(opp.data, me.data, mv);
      const newHp = Math.max(0, me.hp - dmg);
      setMyTeam((prev) => prev.map((p, i) => i === myIdx ? { ...p, hp: newHp } : p));
      setLog((l) => [...l, `Opp ${opp.data.name} used ${mv.name}! (-${dmg})`]);
      if (newHp <= 0) {
        setLog((l) => [...l, `Your ${me.data.name} fainted!`]);
        // Find next
        const next = myTeam.findIndex((m, i) => i > myIdx && m.hp > 0);
        if (next === -1) finish("lost");
        else { setMyIdx(next); setTurn("me"); }
      } else {
        setTurn("me");
      }
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  const performMyAttack = (moveIdx: number) => {
    const me = myTeam[myIdx];
    const opp = oppTeam[oppIdx];
    if (!me || !opp || turn !== "me") return;
    const mv = me.data.moves[moveIdx] || me.data.moves[0];
    const dmg = computeDamage(me.data, opp.data, mv);
    const newHp = Math.max(0, opp.hp - dmg);
    setOppTeam((prev) => prev.map((p, i) => i === oppIdx ? { ...p, hp: newHp } : p));
    setLog((l) => [...l, `Your ${me.data.name} used ${mv.name}! (-${dmg})`]);
    if (newHp <= 0) {
      setLog((l) => [...l, `Foe ${opp.data.name} fainted!`]);
      const next = oppTeam.findIndex((m, i) => i > oppIdx && m.hp > 0);
      if (next === -1) finish("won");
      else { setOppIdx(next); setTurn("opp"); }
    } else {
      setTurn("opp");
    }
  };

  const finish = async (out: "won" | "lost") => {
    if (submittedRef.current || !challenge) return;
    submittedRef.current = true;
    setOutcome(out);
    setTurn("done");
    const winnerTrainerId =
      out === "won"
        ? tid
        : challenge.fromTrainerId === tid
          ? challenge.toTrainerId
          : challenge.fromTrainerId;
    if (out === "won") dispatch({ type: "INC_PVP_WIN" });
    else dispatch({ type: "INC_PVP_LOSS" });
    dispatch({ type: "TOAST", text: out === "won" ? "PVP Victory!" : "PVP Defeat" });
    try {
      await fetch(`${API_BASE}/api/pvp/challenge/${challenge.id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerTrainerId, log: [...log, out === "won" ? "Victory!" : "Defeat."] }),
      });
    } catch {}
  };

  if (!challenge) {
    return (
      <div className="pq-card p-4 text-center text-[12px] font-mono-pq" style={{ color: "#a1a1aa" }}>
        No active battle. Accept or send a challenge in the Lobby.
      </div>
    );
  }

  const me = myTeam[myIdx];
  const opp = oppTeam[oppIdx];

  return (
    <div className="flex flex-col gap-3">
      <div className="pq-card p-3 flex items-center justify-between">
        <div className="text-[10px] font-mono-pq" style={{ color: "#a1a1aa" }}>
          vs {challenge.fromTrainerId === tid ? "Opponent" : challenge.fromTrainerName.toUpperCase()}
        </div>
        <div
          className="text-[11px] font-mono-pq px-2 py-0.5 rounded"
          style={{
            background: timeLeft <= 5 ? "rgba(244,63,94,0.2)" : "rgba(34,211,238,0.15)",
            color: timeLeft <= 5 ? "#fb7185" : "#22d3ee",
          }}
        >
          {turn === "done" ? "—" : `${turn === "me" ? "Your" : "Opp"} turn · ${timeLeft}s`}
        </div>
      </div>

      {opp && (
        <div className="pq-card p-3 flex items-center gap-3">
          <PokeSpriteWrap p={opp.data} />
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[12px]">{opp.data.name.toUpperCase()} · Lv{opp.data.level}</div>
            <HpBar hp={opp.hp} max={opp.data.maxHp} />
            <div className="text-[9px] font-mono-pq mt-0.5" style={{ color: "#71717a" }}>
              {oppTeam.filter((m) => m.hp > 0).length}/{oppTeam.length} remaining
            </div>
          </div>
        </div>
      )}

      {me && (
        <div className="pq-card p-3 flex items-center gap-3">
          <PokeSpriteWrap p={me.data} />
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[12px]">{me.data.name.toUpperCase()} · Lv{me.data.level}</div>
            <HpBar hp={me.hp} max={me.data.maxHp} />
            <div className="text-[9px] font-mono-pq mt-0.5" style={{ color: "#71717a" }}>
              {myTeam.filter((m) => m.hp > 0).length}/{myTeam.length} remaining
            </div>
          </div>
        </div>
      )}

      {turn === "me" && me && (
        <div className="grid grid-cols-2 gap-2">
          {me.data.moves.map((m, i) => {
            const mc = typeColor(m.type);
            return (
              <button key={m.name + i} className="pq-btn"
                onClick={() => performMyAttack(i)}
                style={{ borderColor: `${mc}66`, color: mc, background: `${mc}11`, fontSize: 11 }}>
                {m.name} · {m.power}
              </button>
            );
          })}
        </div>
      )}

      <div className="pq-card-2 p-2 max-h-32 overflow-y-auto text-[10px] font-mono-pq flex flex-col gap-0.5"
        style={{ color: "#d4d4d8" }}>
        {log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {outcome && (
        <div className="pq-card p-3 text-center"
          style={{ borderColor: outcome === "won" ? "rgba(74,222,128,0.5)" : "rgba(244,63,94,0.5)" }}>
          <div className="font-pixel text-[14px]" style={{ color: outcome === "won" ? "#4ade80" : "#fb7185" }}>
            {outcome === "won" ? "VICTORY!" : "DEFEAT"}
          </div>
          <button className="pq-btn pq-btn-ghost mt-2" onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
}

function PokeSpriteWrap({ p }: { p: PvpPokemon }) {
  const sp = SPECIES[p.speciesId];
  if (!sp) {
    return <div className="grid place-items-center" style={{ width: 64, height: 64, fontSize: 32 }}>{"❓"}</div>;
  }
  return (
    <div className="grid place-items-center rounded-xl"
      style={{ width: 64, height: 64, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <PokeSprite species={sp} size={56} />
    </div>
  );
}

function HpBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / Math.max(1, max)) * 100);
  const color = pct > 50 ? "#4ade80" : pct > 20 ? "#facc15" : "#f43f5e";
  return (
    <div className="rounded-full overflow-hidden mt-1" style={{ height: 8, background: "#2a2a3a" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .3s" }} />
    </div>
  );
}

function snapshotPlaceholder(_oppId: string, n: number): PvpPokemon[] {
  // Placeholder if we initiated the challenge: opp not known yet, we wait for accepted result. Build basic stand-ins.
  const arr: PvpPokemon[] = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      speciesId: 19, name: "Rattata", level: 5, hp: 20, maxHp: 20, atk: 10,
      moves: [{ name: "Tackle", power: 35, type: "Normal" }], type: ["Normal"],
    });
  }
  return arr;
}

function computeDamage(att: PvpPokemon, def: PvpPokemon, mv: { name: string; power: number; type: string }) {
  const isSpecial = isSpecialMove(mv);
  const A = isSpecial ? (att.spa ?? att.atk) : att.atk;
  const D = isSpecial ? (def.spd ?? Math.floor(def.atk * 0.85)) : (def.def ?? Math.floor(def.atk * 0.8));
  const stab = att.type.includes(mv.type) ? 1.5 : 1.0;
  const lvlF = (2 * att.level) / 5 + 2;
  const base = ((lvlF * mv.power * (A / Math.max(1, D))) / 50 + 2) * stab;
  const rand = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor(base * rand));
}

// ---------------- Leaderboard ----------------

function LeaderboardTab({ list, myId }: { list: LeaderboardEntry[]; myId: string }) {
  return (
    <div className="pq-card p-3">
      <div className="text-[10px] font-mono-pq uppercase tracking-widest mb-2" style={{ color: "#facc15" }}>
        🏆 Top PVP Trainers
      </div>
      {list.length === 0 ? (
        <div className="text-[11px] font-mono-pq italic text-center py-3" style={{ color: "#71717a" }}>
          No matches recorded yet. Be the first!
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {list.map((e, i) => {
            const me = e.trainerId === myId;
            return (
              <div key={e.trainerId}
                className="pq-card-2 px-3 py-2 flex items-center gap-2"
                style={{ borderColor: me ? "rgba(34,211,238,0.6)" : undefined, background: me ? "rgba(34,211,238,0.08)" : undefined }}>
                <div className="font-mono-pq w-6 text-center" style={{ color: i === 0 ? "#facc15" : i === 1 ? "#d4d4d8" : i === 2 ? "#fb923c" : "#71717a" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[11px] truncate">{e.trainerName.toUpperCase()}{me ? " (YOU)" : ""}</div>
                  <div className="text-[9px] font-mono-pq" style={{ color: "#71717a" }}>{e.trainerId}</div>
                </div>
                <div className="text-[10px] font-mono-pq text-right">
                  <div style={{ color: "#4ade80" }}>{e.wins}W</div>
                  <div style={{ color: "#f43f5e" }}>{e.losses}L</div>
                </div>
                <div className="font-mono-pq text-[12px] w-10 text-right" style={{ color: "#22d3ee" }}>
                  {e.score}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
