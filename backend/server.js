import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// Load data from JSON files
// ============================================

const liteData = JSON.parse(readFileSync(join(__dirname, "../database/lite.json"), "utf-8"));
const fullData = JSON.parse(readFileSync(join(__dirname, "../database/full.json"), "utf-8"));

let questions = liteData.questions;
let cities = liteData.cities;
let currentMode = 'lite'; // 追踪当前测试模式

// ============================================
// Cosine Similarity — explicit implementation
// ============================================

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// ============================================
// Helper function to shuffle array
// ============================================
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// Helper function to select balanced questions
// ============================================
function selectBalancedQuestions(allQuestions, count) {
  const traits = ['O', 'C', 'E', 'A', 'N'];
  const questionsPerTrait = Math.floor(count / 5);
  const selected = [];

  for (const trait of traits) {
    const traitQuestions = allQuestions.filter(q => q.trait === trait);
    const shuffled = shuffleArray(traitQuestions);
    selected.push(...shuffled.slice(0, questionsPerTrait));
  }

  return selected;
}

// ============================================
// Routes
// ============================================

// POST /api/set-mode — set test mode (lite, advanced, professional, full)
app.post("/api/set-mode", (req, res) => {
  const { mode } = req.body;

  if (mode === "lite") {
    questions = liteData.questions;
    cities = liteData.cities;
  } else if (mode === "advanced") {
    // 进阶版：30 道题目（每个特质 6 道）
    questions = selectBalancedQuestions(fullData.questions, 30);
    cities = fullData.cities;
  } else if (mode === "professional") {
    // 专业版：60 道题目（每个特质 12 道）
    questions = selectBalancedQuestions(fullData.questions, 60);
    cities = fullData.cities;
  } else if (mode === "full") {
    // 完整版：200 道题目随机顺序（每个特质 40 道）
    questions = selectBalancedQuestions(fullData.questions, 200);
    cities = fullData.cities;
  } else {
    return res.status(400).json({ error: "无效的模式。请选择 lite、advanced、professional 或 full。" });
  }

  currentMode = mode;
  res.json({ success: true, mode, questionCount: questions.length, cityCount: cities.length });
});

// GET /api/questions — return the quiz
app.get("/api/questions", (_req, res) => {
  // Return questions with is_reverse for frontend OCEAN calculation
  const payload = questions.map(({ id, text, trait, is_reverse }) => ({ id, text, trait, is_reverse }));
  res.json(payload);
});

// POST /api/match — receive answers, compute scores, return top 3 cities
app.post("/api/match", (req, res) => {
  const answers = req.body; // [{ question_id, answer_value }, ...]

  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return res.status(400).json({ error: `需要提交全部${questions.length}道题的答案。` });
  }

  // Build a map of raw scores per trait
  const traitScores = { O: [], C: [], E: [], A: [], N: [] };

  for (const { question_id, answer_value } of answers) {
    const question = questions.find((q) => q.id === question_id);
    if (!question) continue;

    const raw = question.is_reverse ? 6 - answer_value : answer_value;
    traitScores[question.trait].push(raw);
  }

  // Normalize each trait to 0.0–1.0
  const normalize = (scores) => {
    const sum = scores.reduce((a, b) => a + b, 0);
    const n = scores.length;
    const min = n * 1;
    const max = n * 5;
    return (sum - min) / (max - min);
  };

  const userVector = [
    normalize(traitScores.O),
    normalize(traitScores.C),
    normalize(traitScores.E),
    normalize(traitScores.A),
    normalize(traitScores.N),
  ];

  // Score every city
  const results = cities.map((city) => {
    const cityVector = [
      city.trait_o, city.trait_c, city.trait_e, city.trait_a, city.trait_n,
    ];
    const similarity = cosineSimilarity(userVector, cityVector);
    return {
      id: city.id,
      name: city.name,
      country: city.country,
      description: city.description,
      image_url: city.image_url,
      match_percent: Math.round(similarity * 100),
    };
  });

  // Sort descending and take top 3
  results.sort((a, b) => b.match_percent - a.match_percent);
  const top3 = results.slice(0, 3);

  // 计算用户与第一名城市在各维度的差距
  const topCity = cities.find(c => c.id === top3[0].id);
  const gaps = {
    O: Math.abs(userVector[0] - topCity.trait_o),
    C: Math.abs(userVector[1] - topCity.trait_c),
    E: Math.abs(userVector[2] - topCity.trait_e),
    A: Math.abs(userVector[3] - topCity.trait_a),
    N: Math.abs(userVector[4] - topCity.trait_n)
  };
  const sortedTraits = Object.entries(gaps).sort((a, b) => a[1] - b[1]);
  const dominantTrait = sortedTraits[0][0];
  const secondTrait = sortedTraits[1][0];

  res.json({
    user_vector: {
      O: +userVector[0].toFixed(2),
      C: +userVector[1].toFixed(2),
      E: +userVector[2].toFixed(2),
      A: +userVector[3].toFixed(2),
      N: +userVector[4].toFixed(2),
    },
    top_cities: top3,
    mode: currentMode,
    dominant_trait: dominantTrait,
    second_trait: secondTrait
  });
});

// ============================================
// Start
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
