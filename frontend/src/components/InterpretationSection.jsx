import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TAG_MATRIX, TRAIT_NAMES, ALIGNMENT_TEXT, TEMPLATES } from "../utils/interpretationData.js";

export default function InterpretationSection({ result }) {
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    // 随机选择模板（仅执行一次）
    const templates = ['A', 'B', 'C'];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setTemplate(randomTemplate);
  }, []);

  // 提取数据
  const { user_vector, top_cities, dominant_trait, second_trait } = result;

  // 安全检查：如果没有second_trait，不显示解读
  if (!second_trait) return null;

  // 如果模板还未加载，返回 null
  if (!template) return null;

  const topCity = top_cities[0];

  // 第一维度标签
  const userScore1 = user_vector[dominant_trait];
  let scoreLevel1;
  if (userScore1 >= 0.7) scoreLevel1 = 'high';
  else if (userScore1 >= 0.4) scoreLevel1 = 'mid';
  else scoreLevel1 = 'low';
  const userTag1 = TAG_MATRIX[dominant_trait][scoreLevel1].user;
  const cityTag1 = TAG_MATRIX[dominant_trait][scoreLevel1].city;

  // 第二维度标签
  const userScore2 = user_vector[second_trait];
  let scoreLevel2;
  if (userScore2 >= 0.7) scoreLevel2 = 'high';
  else if (userScore2 >= 0.4) scoreLevel2 = 'mid';
  else scoreLevel2 = 'low';
  const userTag2 = TAG_MATRIX[second_trait][scoreLevel2].user;

  // 构建模板数据
  const templateData = {
    cityName: topCity.name,
    matchPercent: topCity.match_percent,
    userTag1,
    cityTag1,
    userTag2,
    traitName: TRAIT_NAMES[dominant_trait],
    alignmentText: ALIGNMENT_TEXT[dominant_trait]
  };

  // 渲染模板
  const content = TEMPLATES[template](templateData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur"
    >
      <h3 className="mb-4 text-2xl font-bold text-white">{content.title}</h3>
      <div className="whitespace-pre-line text-slate-300 leading-relaxed">
        {content.content}
      </div>
    </motion.div>
  );
}
