# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

城市性格匹配应用 - 基于 Big Five 人格测试（OCEAN 模型）为用户推荐最匹配的城市。

**核心概念**: 用户完成 10 道性格测试题，系统计算用户的五维人格向量（Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism），通过余弦相似度算法与预设的城市性格向量进行匹配，返回匹配度最高的前 3 个城市。

## 项目结构

Monorepo 结构，包含三个独立子项目：

- **backend/**: Express.js API 服务器（端口 3001）
- **frontend/**: React + Vite 前端应用
- **database/**: PostgreSQL 初始化脚本（注意：当前后端使用内存数据，未连接数据库）

## 开发命令

### Backend
```bash
cd backend
npm install
npm run dev    # 开发模式（带 --watch）
npm start      # 生产模式
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # 开发服务器（默认端口 5173）
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

### Database
```bash
# 初始化 PostgreSQL 数据库（如需切换到数据库模式）
psql -U <username> -d <database> -f database/init.sql
```

## 架构要点

### Backend (backend/server.js)

**当前实现**: 使用内存数据（mocked data），虽然安装了 `pg` 依赖但未实际连接数据库。

**API 端点**:
- `GET /api/questions` - 返回 10 道测试题（隐藏 is_reverse 字段）
- `POST /api/match` - 接收答案数组，返回用户性格向量和匹配的前 3 个城市

**匹配算法** (server.js:82-95):
- 使用余弦相似度（cosine similarity）计算用户向量与城市向量的相似度
- 每个特质有 2 道题（1 正向 + 1 反向），答案范围 1-5
- 反向题需要转换：`6 - answer_value`
- 归一化公式：`(sum - 2) / 8` 将 [2, 10] 映射到 [0, 1]

### Frontend (frontend/src/)

**状态机**: App.jsx 管理三个屏幕状态：`landing` → `quiz` → `result`

**组件**:
- `LandingPage.jsx` - 欢迎页面
- `QuizComponent.jsx` - 测试问卷（10 题，1-5 分量表）
- `ResultDashboard.jsx` - 结果展示（使用 Recharts 可视化性格向量）

**技术栈**:
- Tailwind CSS - 样式
- Framer Motion - 动画效果
- Recharts - 数据可视化（雷达图展示 OCEAN 向量）

### Database (database/init.sql)

定义了完整的 PostgreSQL schema：
- `trait_type` ENUM: 'O', 'C', 'E', 'A', 'N'
- `questions` 表: 10 道 BFI-10 简化中文题目
- `cities` 表: 5 个城市及其 OCEAN 特质向量

**注意**: 如需切换到数据库模式，需要修改 backend/server.js 以使用 `pg` 连接池替换内存数据。

## 数据模型

### OCEAN 五维人格模型
- **O** (Openness): 开放性 - 对新体验和抽象思维的接受度
- **C** (Conscientiousness): 尽责性 - 自律、有条理、注重细节
- **E** (Extraversion): 外向性 - 社交倾向和能量来源
- **A** (Agreeableness): 宜人性 - 信任他人、合作倾向
- **N** (Neuroticism): 神经质 - 情绪稳定性（分数越高越不稳定）

### 答案提交格式
```json
[
  { "question_id": 1, "answer_value": 4 },
  { "question_id": 2, "answer_value": 2 },
  ...
]
```

### 匹配结果格式
```json
{
  "user_vector": { "O": 0.75, "C": 0.50, "E": 0.88, "A": 0.63, "N": 0.25 },
  "top_cities": [
    {
      "id": 3,
      "name": "纽约",
      "country": "美国",
      "description": "...",
      "image_url": "...",
      "match_percent": 92
    },
    ...
  ]
}
```

## 关键实现细节

1. **反向计分**: questions 中 `is_reverse: true` 的题目需要反向计分（6 - answer_value）
2. **向量归一化**: 每个特质的原始分数范围 [2, 10]，归一化到 [0, 1]
3. **CORS 配置**: backend 已启用 CORS，允许跨域请求
4. **图片资源**: 城市图片使用 Unsplash CDN
5. **端口配置**: backend 默认 3001，可通过 `PORT` 环境变量修改
