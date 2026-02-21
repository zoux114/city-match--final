import { motion } from "framer-motion";
import { useState } from "react";

export default function LandingPage({ onStart }) {
  const [loading, setLoading] = useState(false);

  const handleModeSelect = async (mode) => {
    setLoading(true);
    try {
      await fetch("/api/set-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      onStart();
    } catch {
      setLoading(false);
    }
  };

  const modes = [
    { id: "lite", name: "轻量版", desc: "10 道题 · 5 个城市", time: "2 分钟" },
    { id: "advanced", name: "进阶版", desc: "50 道题 · 75 个城市", time: "8 分钟" },
    { id: "full", name: "完整版", desc: "200 道题 · 75 个城市", time: "30 分钟" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <div className="mb-6 text-6xl">🌍</div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          找到属于你的城市
        </h1>

        <p className="mb-3 text-lg leading-relaxed text-indigo-200/80">
          每座城市都有自己的"性格"——节奏、氛围、价值观。
          <br />
          地理心理学（Geopsychology）研究发现，人格特质与居住环境之间存在深层匹配关系。
        </p>

        <p className="mb-10 text-base leading-relaxed text-slate-400">
          本测试基于大五人格模型（OCEAN）和人-环境匹配理论（P-E Fit），分析你的性格画像，并为你推荐最契合的城市。
        </p>

        <div className="mb-6 flex flex-col gap-3">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect(mode.id)}
              disabled={loading}
              className="rounded-xl border border-indigo-500/30 bg-slate-900/50 px-6 py-4 text-left backdrop-blur transition-all hover:border-indigo-500 hover:bg-slate-800/50 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{mode.name}</div>
                  <div className="text-sm text-slate-400">{mode.desc}</div>
                </div>
                <div className="text-xs text-indigo-400">{mode.time}</div>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-500">完全匿名 · 无需注册</p>
      </motion.div>
    </div>
  );
}
