import type { GameState } from "./state";

type Dispatch = (a: any) => void;

interface Trigger {
  key: string;
  when: (s: GameState) => boolean;
  lines: string[]; // each line will be tagged "[Rocket] ..." for red coloring
  extraDispatch?: (dispatch: Dispatch) => void;
}

// Lines prefixed with "[Rocket]" are colored red by CommandBox.
const TRIGGERS: Trigger[] = [
  {
    key: "intro-route3",
    when: (s) => !!s.routeProgress["route3"]?.cleared,
    lines: [
      "[Rocket] A Team Rocket Grunt sneers from the shadows of Route 3…",
      "[Rocket] \"Hand over your Pokémon, twerp! Team Rocket needs strong ones!\"",
    ],
  },
  {
    key: "cerulean-bridge",
    when: (s) => s.locationId === "cerulean" || !!s.visited["cerulean"],
    lines: [
      "[Rocket] In Cerulean City, a Rocket Grunt is robbing the house by the bridge!",
    ],
  },
  {
    key: "mtmoon-fossil",
    when: (s) => s.locationId === "mtmoon" || !!s.visited["mtmoon"],
    lines: [
      "[Rocket] Team Rocket is digging through Mt. Moon for fossils!",
      "[Rocket] \"Get lost, kid! These fossils are Team Rocket property!\"",
    ],
  },
  {
    key: "lavender-tower",
    when: (s) => s.locationId === "lavender" || !!s.visited["lavender"],
    lines: [
      "[Rocket] Pokémon Tower is overrun by Team Rocket — they're after the ghosts of Cubone!",
    ],
  },
  {
    key: "mr-fuji-expshare",
    when: (s) =>
      !s.expShareOwned &&
      (s.routeProgress["lavender"]?.trainersDefeated || []).includes("lav-rocket-tower"),
    lines: [
      "Mr. Fuji: \"You've saved the Pokémon Tower from Team Rocket!\"",
      "Mr. Fuji: \"Please, take this — an EXP Share. Share your strength with all your team.\"",
      "▶ You received the EXP SHARE! (Key Item — always active)",
    ],
    extraDispatch: (dispatch) => dispatch({ type: "GIVE_EXP_SHARE" }),
  },
  {
    key: "after-koga-silph",
    when: (s) => s.badges.includes("Soul Badge"),
    lines: [
      "[Rocket] News: Team Rocket has seized Silph Co. in Saffron City!",
      "[Rocket] A Rocket Executive is leading the operation. Confront them in Fuchsia!",
    ],
  },
  {
    key: "after-e4-johto",
    when: (s) =>
      (s.routeProgress["indigo"]?.trainersDefeated || []).includes("champion-blue"),
    lines: [
      "[Rocket] Whispers from across the sea: Team Rocket has resurfaced in JOHTO…",
      "[Rocket] A new region beckons. Your legend grows.",
    ],
  },
  {
    key: "giovanni-revealed",
    when: (s) => s.locationId === "viridian" && s.badges.length >= 7 && !s.badges.includes("Earth Badge"),
    lines: [
      "[Rocket] The Viridian Gym Leader's identity is revealed: GIOVANNI, Boss of Team Rocket!",
      "[Rocket] He awaits with Persian, Dugtrio, Nidoqueen, Nidoking and Rhyhorn.",
    ],
  },
];

export function runRocketStoryFor(state: GameState, dispatch: Dispatch) {
  for (const t of TRIGGERS) {
    if (state.rocketFlags[t.key]) continue;
    if (!t.when(state)) continue;
    dispatch({ type: "SET_ROCKET_FLAG", key: t.key });
    dispatch({ type: "LOG", lines: t.lines });
    if (t.extraDispatch) t.extraDispatch(dispatch);
    if (t.key === "mr-fuji-expshare") {
      dispatch({ type: "TOAST", text: "Received EXP Share from Mr. Fuji!" });
    }
  }
}
