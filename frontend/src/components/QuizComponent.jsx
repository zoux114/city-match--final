import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config.js";

const LIKERT_OPTIONS = [
  { value: 1, label: "非常不同意" },
  { value: 2, label: "比较不同意" },
  { value: 3, label: "中立" },
  { value: 4, label: "比较同意" },
  { value: 5, label: "非常同意" },
];

/**
 * QuizComponent — one question at a time with framer-motion slide transitions.
 */
export default function QuizComponent({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: value }));
  };

  const goNext = () => {
    if (current < questions.length - 1) {
      setDirection(1);
      setCurrent((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = questions.map((q) => ({
      question_id: q.id,
      answer_value: answers[q.id],
    }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onComplete(data);
    } catch {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-400">加载题目中…</p>
      </div>
    );
  }

  const q = questions[current];
  const selected = answers[q?.id];
  const isLast = current === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  // Slide animation variants
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Progress bar */}
      <div className="mb-8 w-full max-w-lg">
        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>第 {current + 1} / {questions.length} 题</span>
          <span>{Math.round(((current + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="relative w-full max-w-lg" style={{ minHeight: 320 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={q.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-8 backdrop-blur"
          >
            <p className="mb-8 text-xl font-medium leading-relaxed text-white">
              {q.text}
            </p>

            <div className="flex flex-col gap-3">
              {LIKERT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`rounded-xl border px-5 py-3 text-left text-sm font-medium transition-all ${
                    selected === opt.value
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                      : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex w-full max-w-lg justify-between">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-30"
        >
          上一题
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500 disabled:opacity-40"
          >
            {submitting ? "分析中…" : "查看结果"}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={selected === undefined}
            className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500 disabled:opacity-40"
          >
            下一题
          </button>
        )}
      </div>
    </div>
  );
}
