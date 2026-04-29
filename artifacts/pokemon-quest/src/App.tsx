import { useEffect, useState } from "react";
import WelcomeScreen from "@/screens/WelcomeScreen";
import HomeScreen from "@/screens/HomeScreen";
import StarterScreen from "@/screens/StarterScreen";
import AdventureScreen from "@/screens/AdventureScreen";
import BattleScreen from "@/screens/BattleScreen";
import EncounterScreen from "@/screens/EncounterScreen";
import TrainerCardScreen from "@/screens/TrainerCardScreen";
import TrainerPickScreen from "@/screens/TrainerPickScreen";
import SummaryScreen from "@/screens/SummaryScreen";
import CommandBox from "@/components/CommandBox";
import PokeCenterScreen from "@/screens/PokeCenterScreen";
import PokeMartScreen from "@/screens/PokeMartScreen";
import GymScreen from "@/screens/GymScreen";
import PokedexScreen from "@/screens/PokedexScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import BlackoutScreen from "@/screens/BlackoutScreen";
import PvpScreen from "@/screens/PvpScreen";
import { GameProvider, useGame } from "@/game/state";

const STARS = [
  { top: "10%", left: "7%",  delay: "0s"   },
  { top: "6%",  left: "21%", delay: "0.4s" },
  { top: "14%", left: "71%", delay: "0.8s" },
  { top: "4%",  left: "54%", delay: "1.2s" },
  { top: "19%", left: "87%", delay: "0.6s" },
  { top: "8%",  left: "39%", delay: "1.6s" },
  { top: "17%", left: "34%", delay: "0.2s" },
  { top: "5%",  left: "64%", delay: "1.0s" },
];

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onDone, 500);
  };

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`pq-loading-screen${fading ? " pq-loading-fade" : ""}`}
      onClick={done ? dismiss : undefined}
    >
      <div className="pq-loading-moon" />

      {STARS.map((s, i) => (
        <div
          key={i}
          className="pq-loading-star"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}

      <div className="pq-loading-mountains">
        <div className="pq-loading-mt" style={{ borderLeft: "70px solid transparent", borderRight: "70px solid transparent", borderBottom: "65px solid #1a1a2e", marginLeft: 20 }} />
        <div className="pq-loading-mt" style={{ borderLeft: "90px solid transparent", borderRight: "90px solid transparent", borderBottom: "80px solid #141424", marginLeft: -30 }} />
        <div className="pq-loading-mt" style={{ borderLeft: "65px solid transparent", borderRight: "65px solid transparent", borderBottom: "60px solid #1a1a2e", marginLeft: 10 }} />
        <div className="pq-loading-mt" style={{ borderLeft: "80px solid transparent", borderRight: "80px solid transparent", borderBottom: "72px solid #0f0f1e", marginLeft: -20 }} />
        <div className="pq-loading-mt" style={{ borderLeft: "55px solid transparent", borderRight: "55px solid transparent", borderBottom: "52px solid #1a1a2e", marginLeft: 15 }} />
      </div>

      <div className="pq-loading-logo">
        <div className="pq-loading-logo-top">POKÉMON</div>
        <div className="pq-loading-logo-bottom">— QUEST —</div>
      </div>

      <div className="pq-loading-starters">
        {[4, 7, 1, 25].map((id) => (
          <img
            key={id}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
            alt=""
            className="pq-loading-sprite"
          />
        ))}
      </div>

      <div className="pq-loading-bottom">
        <div className={`pq-loading-label${done ? " pq-blink" : ""}`}>
          {done ? "TAP TO CONTINUE" : "LOADING..."}
        </div>
        <div className="pq-loading-bar-wrap">
          <div className="pq-loading-bar-fill" />
        </div>
      </div>
    </div>
  );
}

function ScreenRouter() {
  const { state } = useGame();
  const showLog = !["welcome", "trainerpick", "menu", "starter", "blackout"].includes(state.screen);
  let screen;
  switch (state.screen) {
    case "welcome": screen = <WelcomeScreen />; break;
    case "trainerpick": screen = <TrainerPickScreen />; break;
    case "summary": screen = <SummaryScreen />; break;
    case "menu": screen = <HomeScreen />; break;
    case "starter": screen = <StarterScreen />; break;
    case "adventure": screen = <AdventureScreen />; break;
    case "encounter": screen = <EncounterScreen />; break;
    case "battle": screen = <BattleScreen />; break;
    case "card": screen = <TrainerCardScreen />; break;
    case "center": screen = <PokeCenterScreen />; break;
    case "mart": screen = <PokeMartScreen />; break;
    case "gym": screen = <GymScreen />; break;
    case "pokedex": screen = <PokedexScreen />; break;
    case "settings": screen = <SettingsScreen />; break;
    case "blackout": screen = <BlackoutScreen />; break;
    case "pvp": screen = <PvpScreen />; break;
    default: screen = <WelcomeScreen />;
  }
  return (
    <>
      {screen}
      {showLog && <CommandBox />}
    </>
  );
}

function App() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <GameProvider>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-xl">
          <ScreenRouter />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
