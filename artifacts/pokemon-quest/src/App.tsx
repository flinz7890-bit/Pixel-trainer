import { useEffect, useState } from "react";
import WelcomeScreen from "@/screens/WelcomeScreen";
import HomeScreen from "@/screens/HomeScreen";
import StarterScreen from "@/screens/StarterScreen";
import AdventureScreen from "@/screens/AdventureScreen";
import BattleScreen from "@/screens/BattleScreen";
import EncounterScreen from "@/screens/EncounterScreen";
import TrainerCardScreen from "@/screens/TrainerCardScreen";
import CommandBox from "@/components/CommandBox";
import PokeCenterScreen from "@/screens/PokeCenterScreen";
import PokeMartScreen from "@/screens/PokeMartScreen";
import GymScreen from "@/screens/GymScreen";
import PokedexScreen from "@/screens/PokedexScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { GameProvider, useGame } from "@/game/state";

function ScreenRouter() {
  const { state } = useGame();
  const showLog = !["welcome", "menu", "starter"].includes(state.screen);
  let screen;
  switch (state.screen) {
    case "welcome": screen = <WelcomeScreen />; break;
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
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <GameProvider>
      <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-xl">
          <ScreenRouter />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
