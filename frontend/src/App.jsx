import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage.jsx";
import QuizComponent from "./components/QuizComponent.jsx";
import ResultDashboard from "./components/ResultDashboard.jsx";
import PaymentPage from "./components/PaymentPage.jsx";
import { API_BASE_URL } from "./config.js";

/**
 * App — top-level state machine.
 * Screens: "landing" → "quiz" → "payment" → "result"
 */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [modeInitialized, setModeInitialized] = useState(false);

  // 初始化时恢复已付费的结果
  useEffect(() => {
    try {
      const savedPaidResult = localStorage.getItem('city-match-paid-result');
      if (savedPaidResult) {
        const data = JSON.parse(savedPaidResult);
        setResult(data.result);
        setSessionId(data.sessionId);
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
      // 检查是否有保存的结果，如果有则不覆盖
      const savedResult = localStorage.getItem('city-match-paid-result');
      if (savedResult) {
        setModeInitialized(true);
        return;
      }

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
    // 轻量版直接显示结果，其他版本显示打赏页面
    if (data.result && data.result.mode === 'lite') {
      setResult(data.result);
      setScreen("result");
      localStorage.setItem('city-match-paid-result', JSON.stringify({
        sessionId: data.sessionId,
        result: data.result,
        timestamp: Date.now()
      }));
    } else if (data.needPayment && data.result) {
      setSessionId(data.sessionId);
      setResult(data.result);
      setScreen("payment");
    } else {
      setResult(data);
      setScreen("result");
    }
  };

  const handlePaymentSuccess = (resultData) => {
    setResult(resultData);
    setScreen("result");
  };

  const handleRestart = () => {
    localStorage.removeItem('city-match-session');
    localStorage.removeItem('city-match-paid-result');
    setResult(null);
    setSessionId(null);
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
          {screen === "payment" && sessionId && result && (
            <PaymentPage
              sessionId={sessionId}
              result={result}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
          {screen === "result" && result && (
            <ResultDashboard result={result} onRestart={handleRestart} />
          )}
        </>
      )}
    </div>
  );
}
