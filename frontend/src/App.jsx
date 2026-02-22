import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage.jsx";
import QuizComponent from "./components/QuizComponent.jsx";
import ResultDashboard from "./components/ResultDashboard.jsx";
import { API_BASE_URL } from "./config.js";

/**
 * App — top-level state machine.
 * Screens: "landing" → "quiz" → "result"
 */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [result, setResult] = useState(null);
  const [modeInitialized, setModeInitialized] = useState(false);

  // 初始化时恢复保存的结果
  useEffect(() => {
    try {
      const savedResult = localStorage.getItem('city-match-result');
      if (savedResult) {
        const data = JSON.parse(savedResult);
        setResult(data);
        setScreen("result");
      }
    } catch (err) {
      console.error('Failed to restore result:', err);
    }
  }, []);

  // URL参数解析 - 自动初始化测试模式
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    const validModes = ['lite', 'advanced', 'professional', 'full'];

    if (mode && validModes.includes(mode.toLowerCase())) {
      fetch(`${API_BASE_URL}/api/set-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode.toLowerCase() })
      })
      .then(res => res.json())
      .then(() => {
        setScreen('quiz');
        setModeInitialized(true);
      })
      .catch(() => {
        setModeInitialized(true);
      });
    } else {
      setModeInitialized(true);
    }
  }, []);

  // 浏览器导航处理
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('mode')) {
        setScreen('landing');
        setResult(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleQuizComplete = (data) => {
    setResult(data);
    setScreen("result");
    localStorage.setItem('city-match-result', JSON.stringify(data));
  };

  const handleRestart = () => {
    localStorage.removeItem('city-match-session');
    localStorage.removeItem('city-match-result');
    setResult(null);
    setScreen("landing");
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {!modeInitialized ? (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-slate-400">加载中…</p>
        </div>
      ) : (
        <>
          {screen === "landing" && (
            <LandingPage onStart={() => setScreen("quiz")} />
          )}
          {screen === "quiz" && (
            <QuizComponent onComplete={handleQuizComplete} />
          )}
          {screen === "result" && result && (
            <ResultDashboard result={result} onRestart={handleRestart} />
          )}
        </>
      )}
    </div>
  );
}
