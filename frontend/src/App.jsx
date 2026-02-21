import { useState } from "react";
import LandingPage from "./components/LandingPage.jsx";
import QuizComponent from "./components/QuizComponent.jsx";
import ResultDashboard from "./components/ResultDashboard.jsx";

/**
 * App — top-level state machine.
 * Screens: "landing" → "quiz" → "result"
 */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [result, setResult] = useState(null);

  const handleQuizComplete = (data) => {
    setResult(data);
    setScreen("result");
  };

  const handleRestart = () => {
    setResult(null);
    setScreen("landing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {screen === "landing" && (
        <LandingPage onStart={() => setScreen("quiz")} />
      )}
      {screen === "quiz" && (
        <QuizComponent onComplete={handleQuizComplete} />
      )}
      {screen === "result" && result && (
        <ResultDashboard result={result} onRestart={handleRestart} />
      )}
    </div>
  );
}
