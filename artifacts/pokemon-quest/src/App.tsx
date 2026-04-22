import { useEffect, useState } from "react";
import WelcomeScreen from "@/screens/WelcomeScreen";
import HomeScreen from "@/screens/HomeScreen";
import StarterScreen from "@/screens/StarterScreen";
import AdventureScreen from "@/screens/AdventureScreen";
import BattleScreen from "@/screens/BattleScreen";
import EncounterScreen from "@/screens/EncounterScreen";
import TrainerCardScreen from "@/screens/TrainerCardScreen";
import PokeCenterScreen from "@/screens/PokeCenterScreen";
import PokeMartScreen from "@/screens/PokeMartScreen";
import GymScreen from "@/screens/GymScreen";
import PokedexScreen from "@/screens/PokedexScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { GameProvider, useGame } from "@/game/state";

function ScreenRouter() {
  const { state } = useGame();
  switch (state.screen) {
    case "welcome": return <WelcomeScreen />;
    case "menu": return <HomeScreen />;
    case "starter": return <StarterScreen />;
    case "adventure": return <AdventureScreen />;
    case "encounter": return <EncounterScreen />;
    case "battle": return <BattleScreen />;
    case "card": return <TrainerCardScreen />;
    case "center": return <PokeCenterScreen />;
    case "mart": return <PokeMartScreen />;
    case "gym": return <GymScreen />;
    case "pokedex": return <PokedexScreen />;
    case "settings": return <SettingsScreen />;
    default: return <WelcomeScreen />;
  }
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
