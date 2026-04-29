# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **pokemon-quest** — Pokémon-style turn-based browser game (React + Vite). Save data persists to `localStorage` under key `pokemon-quest-save-v1`. Game systems live in `artifacts/pokemon-quest/src/game/` (`data.ts` species/moves/locations/gyms + `LOCATION_BG` Bulbapedia thumbnails, `state.tsx` reducer + provider with `StatusCondition` BRN/PSN/PAR/SLP/FRZ on `OwnedPokemon`, `stats.ts` IV/EV/nature math, `rocketStory.ts` Team Rocket triggers including the Mr. Fuji `GIVE_EXP_SHARE` gift). Screens are in `src/screens/`. Battle features: PP per move (per-battle in BattleScreen state), in-battle EXP bar, type-tinted move buttons with effectiveness hints, status-condition badges + end-of-turn ticks, level-up banner overlay. EXP Share is a Key Item (no longer purchasable) — gifted by Mr. Fuji after defeating the Lavender Tower Rocket. Gym battles open a pre-battle intro modal (leader, badge, quote, Accept Challenge). Uses `api-server` for online PVP only.
- **api-server** — Express 5 API at `/api`. Endpoints: `/healthz`, `/pvp/register`, `/pvp/players`, `/pvp/challenge*`, `/pvp/leaderboard`. PVP state is in-memory (resets on redeploy).

## Pokémon Quest Features

- **Stats**: Each owned Pokémon stores `nature` (25), `ivs` (0–31), `evs` (≤252/stat, ≤510 total), full stat block (def/spa/spd/spe). Battle damage uses physical/special split + STAB; EV gains on faint. Summary screen has Info/Stats/Moves/Bio tabs with stacked stat bars and nature ▲/▼ highlights.
- **Team Rocket storyline**: Rocket grunts in Cerulean/Mt.Moon/Lavender/Fuchsia, Silph Co. Executive in Saffron, Giovanni rematch in Viridian (Persian L45, Dugtrio L42, Nidoqueen L44, Nidoking L45, Rhyhorn L43). 7 story triggers in `rocketStory.ts`. Rocket lines tagged `[Rocket]` in logs and rendered red by `CommandBox`.
- **Online PVP**: AdventureScreen has PVP button (Settings moved to bottom of TrainerCard). PvpScreen has Lobby (challenge online players) / Battle (turn-based, 30s timer) / Leaderboard tabs. Polls `/api/pvp/*` every 5s.
