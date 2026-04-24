import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ---------- In-memory store ----------

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

interface PvpPlayer {
  trainerId: string;
  trainerName: string;
  team: PvpPokemon[];
  lastSeen: number;
}

type ChallengeStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "completed";

interface Challenge {
  id: string;
  fromTrainerId: string;
  fromTrainerName: string;
  toTrainerId: string;
  fromTeam: PvpPokemon[];
  status: ChallengeStatus;
  createdAt: number;
  result?: {
    winnerTrainerId: string;
    log: string[];
    finishedAt: number;
  };
}

interface LeaderboardEntry {
  trainerId: string;
  trainerName: string;
  wins: number;
  losses: number;
}

const players = new Map<string, PvpPlayer>();
const challenges = new Map<string, Challenge>();
const leaderboard = new Map<string, LeaderboardEntry>();

const PLAYER_TTL_MS = 60_000;
const CHALLENGE_TTL_MS = 5 * 60_000;

function cleanup() {
  const now = Date.now();
  for (const [id, p] of players) {
    if (now - p.lastSeen > PLAYER_TTL_MS) players.delete(id);
  }
  for (const [id, c] of challenges) {
    if (c.status === "pending" && now - c.createdAt > CHALLENGE_TTL_MS) {
      c.status = "expired";
    }
    if (now - c.createdAt > CHALLENGE_TTL_MS * 4) challenges.delete(id);
  }
}

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function bumpLeaderboard(trainerId: string, trainerName: string, won: boolean) {
  const cur = leaderboard.get(trainerId) || { trainerId, trainerName, wins: 0, losses: 0 };
  cur.trainerName = trainerName || cur.trainerName;
  if (won) cur.wins += 1;
  else cur.losses += 1;
  leaderboard.set(trainerId, cur);
}

// ---------- Routes ----------

// Register / heartbeat
router.post("/pvp/register", (req, res) => {
  cleanup();
  const { trainerId, trainerName, team } = req.body || {};
  if (!trainerId || typeof trainerId !== "string") {
    return res.status(400).json({ error: "trainerId required" });
  }
  const player: PvpPlayer = {
    trainerId,
    trainerName: trainerName || "Trainer",
    team: Array.isArray(team) ? team : [],
    lastSeen: Date.now(),
  };
  players.set(trainerId, player);
  res.json({ ok: true });
});

// List online opponents (excluding self)
router.get("/pvp/players", (req, res) => {
  cleanup();
  const me = req.query.trainerId as string | undefined;
  const list = Array.from(players.values())
    .filter((p) => p.trainerId !== me)
    .map((p) => ({
      trainerId: p.trainerId,
      trainerName: p.trainerName,
      teamSize: p.team.length,
      avgLevel: p.team.length
        ? Math.round(p.team.reduce((s, x) => s + x.level, 0) / p.team.length)
        : 0,
    }));
  res.json({ players: list });
});

// Send a challenge
router.post("/pvp/challenge", (req, res) => {
  cleanup();
  const { fromTrainerId, fromTrainerName, toTrainerId, fromTeam } = req.body || {};
  if (!fromTrainerId || !toTrainerId || !Array.isArray(fromTeam)) {
    return res.status(400).json({ error: "missing fields" });
  }
  const id = genId();
  const ch: Challenge = {
    id,
    fromTrainerId,
    fromTrainerName: fromTrainerName || "Trainer",
    toTrainerId,
    fromTeam,
    status: "pending",
    createdAt: Date.now(),
  };
  challenges.set(id, ch);
  res.json({ id, challenge: ch });
});

// Get all challenges for a trainer (incoming + outgoing)
router.get("/pvp/challenges/:trainerId", (req, res) => {
  cleanup();
  const tid = req.params.trainerId;
  const incoming: Challenge[] = [];
  const outgoing: Challenge[] = [];
  for (const c of challenges.values()) {
    if (c.toTrainerId === tid) incoming.push(c);
    else if (c.fromTrainerId === tid) outgoing.push(c);
  }
  res.json({ incoming, outgoing });
});

// Get a specific challenge
router.get("/pvp/challenge/:id", (req, res) => {
  cleanup();
  const c = challenges.get(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(c);
});

// Accept a challenge
router.post("/pvp/challenge/:id/accept", (_req, res) => {
  const c = challenges.get(_req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  if (c.status !== "pending") return res.status(400).json({ error: `status is ${c.status}` });
  c.status = "accepted";
  res.json(c);
});

// Decline a challenge
router.post("/pvp/challenge/:id/decline", (_req, res) => {
  const c = challenges.get(_req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  if (c.status !== "pending") return res.status(400).json({ error: `status is ${c.status}` });
  c.status = "declined";
  res.json(c);
});

// Submit final result
router.post("/pvp/challenge/:id/result", (req, res) => {
  const c = challenges.get(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  const { winnerTrainerId, log } = req.body || {};
  if (!winnerTrainerId) return res.status(400).json({ error: "winnerTrainerId required" });
  c.status = "completed";
  c.result = {
    winnerTrainerId,
    log: Array.isArray(log) ? log : [],
    finishedAt: Date.now(),
  };
  const winnerName =
    winnerTrainerId === c.fromTrainerId
      ? c.fromTrainerName
      : (players.get(c.toTrainerId)?.trainerName || "Trainer");
  const loserName =
    winnerTrainerId === c.fromTrainerId
      ? (players.get(c.toTrainerId)?.trainerName || "Trainer")
      : c.fromTrainerName;
  const loserId = winnerTrainerId === c.fromTrainerId ? c.toTrainerId : c.fromTrainerId;
  bumpLeaderboard(winnerTrainerId, winnerName, true);
  bumpLeaderboard(loserId, loserName, false);
  res.json(c);
});

// Leaderboard
router.get("/pvp/leaderboard", (_req, res) => {
  cleanup();
  const list = Array.from(leaderboard.values())
    .map((e) => ({ ...e, score: e.wins * 3 - e.losses }))
    .sort((a, b) => b.score - a.score || b.wins - a.wins)
    .slice(0, 25);
  res.json({ leaderboard: list });
});

export default router;
