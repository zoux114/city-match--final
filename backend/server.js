import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// Data persistence setup
// ============================================

// 确保 data 目录存在
const dataDir = join(__dirname, "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// 初始化数据文件
const sessionsFile = join(dataDir, "sessions.json");
const codesFile = join(dataDir, "payment-codes.json");

if (!existsSync(sessionsFile)) {
  writeFileSync(sessionsFile, JSON.stringify({ sessions: [] }, null, 2));
}
if (!existsSync(codesFile)) {
  writeFileSync(codesFile, JSON.stringify({ codes: [] }, null, 2));
}

// 读取和保存数据的工具函数
function loadSessions() {
  return JSON.parse(readFileSync(sessionsFile, "utf-8"));
}

function saveSessions(data) {
  writeFileSync(sessionsFile, JSON.stringify(data, null, 2));
}

function loadPaymentCodes() {
  return JSON.parse(readFileSync(codesFile, "utf-8"));
}

function savePaymentCodes(data) {
  writeFileSync(codesFile, JSON.stringify(data, null, 2));
}

// 生成访问令牌
function generateAccessToken() {
  return 'tk_' + Array.from({ length: 32 }, () =>
    Math.random().toString(36)[2] || '0'
  ).join('');
}

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
    console.log(`${city.name}: 原始相似度 = ${similarity.toFixed(4)}, 百分比 = ${(similarity * 100).toFixed(2)}%`);
    return {
      id: city.id,
      name: city.name,
      country: city.country,
      description: city.description,
      image_url: city.image_url,
      match_percent: +(similarity * 100).toFixed(1), // 保留一位小数
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

  const result = {
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
  };

  // 生成 sessionId 并保存会话数据
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const sessionsData = loadSessions();
  sessionsData.sessions.push({
    sessionId,
    createdAt: new Date().toISOString(),
    mode: currentMode,
    answers,
    result,
    isPaid: false,
    paymentCode: null,
    accessToken: null,
    paidAt: null
  });
  saveSessions(sessionsData);

  // 返回 sessionId 和结果（改为打赏模式）
  res.json({
    sessionId,
    needPayment: true,
    result  // 直接返回结果，让前端决定是否显示打赏页面
  });
});

// POST /api/verify-payment — 验证兑换码并返回结果
app.post("/api/verify-payment", (req, res) => {
  const { sessionId, paymentCode } = req.body;

  if (!sessionId || !paymentCode) {
    return res.status(400).json({ error: "缺少 sessionId 或 paymentCode" });
  }

  // 查找 session
  const sessionsData = loadSessions();
  const session = sessionsData.sessions.find(s => s.sessionId === sessionId);

  if (!session) {
    return res.status(404).json({ error: "会话不存在" });
  }

  if (session.isPaid) {
    return res.status(400).json({ error: "该会话已经验证过付款" });
  }

  // 验证兑换码
  const codesData = loadPaymentCodes();
  const code = codesData.codes.find(c => c.code === paymentCode && !c.isUsed);

  if (!code) {
    return res.status(400).json({ error: "兑换码无效或已被使用" });
  }

  // 标记兑换码为已使用
  code.isUsed = true;
  code.usedBy = sessionId;
  code.usedAt = new Date().toISOString();
  savePaymentCodes(codesData);

  // 更新 session
  const accessToken = generateAccessToken();
  session.isPaid = true;
  session.paymentCode = paymentCode;
  session.accessToken = accessToken;
  session.paidAt = new Date().toISOString();
  saveSessions(sessionsData);

  // 返回结果和 token
  res.json({
    success: true,
    accessToken,
    result: session.result
  });
});

// POST /api/verify-token — 验证访问令牌（可选，用于刷新后恢复）
app.post("/api/verify-token", (req, res) => {
  const { sessionId, accessToken } = req.body;

  if (!sessionId || !accessToken) {
    return res.status(400).json({ error: "缺少 sessionId 或 accessToken" });
  }

  const sessionsData = loadSessions();
  const session = sessionsData.sessions.find(
    s => s.sessionId === sessionId && s.accessToken === accessToken && s.isPaid
  );

  if (!session) {
    return res.status(401).json({ error: "无效的访问令牌" });
  }

  res.json({
    success: true,
    result: session.result
  });
});

// ============================================
// Start
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
