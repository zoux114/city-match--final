import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const TRAIT_LABELS = {
  O: "开放性",
  C: "尽责性",
  E: "外向性",
  A: "宜人性",
  N: "神经质",
};

/**
 * ResultDashboard — radar chart of OCEAN profile + top 3 city cards.
 */
export default function ResultDashboard({ result, onRestart }) {
  const { user_vector, top_cities } = result;

  // Prepare radar chart data
  const radarData = Object.entries(TRAIT_LABELS).map(([key, label]) => ({
    trait: label,
    value: user_vector[key],
    fullMark: 1,
  }));

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          你的性格画像
        </h2>
        <p className="mb-10 text-center text-slate-400">
          基于大五人格模型的分析结果
        </p>

        {/* Radar Chart */}
        <div className="mx-auto mb-12 h-80 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="trait"
                tick={{ fill: "#c7d2fe", fontSize: 14 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickCount={5}
              />
              <Radar
                name="你的性格"
                dataKey="value"
                stroke="#818cf8"
                fill="#6366f1"
                fillOpacity={0.35}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Trait scores summary */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {Object.entries(TRAIT_LABELS).map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-center"
            >
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-bold text-indigo-400">
                {Math.round(user_vector[key] * 100)}
                <span className="text-sm font-normal text-slate-500">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top 3 Cities */}
        <h3 className="mb-6 text-center text-2xl font-bold text-white">
          最适合你的城市
        </h3>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          {top_cities.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-sm font-semibold text-white">
                    匹配度 {city.match_percent}%
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="mb-1 text-lg font-bold text-white">
                  {city.name}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    {city.country}
                  </span>
                </h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  {city.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Restart */}
        <div className="mt-12 text-center">
          <button
            onClick={onRestart}
            className="rounded-full border border-slate-700 px-8 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500 hover:text-white"
          >
            重新测试
          </button>
        </div>
      </motion.div>
    </div>
  );
}
