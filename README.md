# 城市性格匹配 City Match

基于 Big Five 人格测试的城市性格匹配应用。通过 10 道简短的性格测试题，为你找到最匹配的城市。

## ✨ 功能特性

- 🧠 基于科学的 Big Five (OCEAN) 人格模型
- 🎯 智能匹配算法（余弦相似度）
- 📊 可视化性格分析（雷达图）
- 🌍 精选 5 个特色城市
- 🎨 现代化 UI 设计（Tailwind CSS + Framer Motion）

## 🛠 技术栈

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Node.js
- Express.js
- CORS

### Database
- PostgreSQL（Schema 已定义，当前使用内存数据）

## 🚀 快速开始

### 前置要求
- Node.js 16+
- npm 或 yarn

### 安装与运行

#### 1. 启动后端服务
```bash
cd backend
npm install
npm run dev
```
后端服务将运行在 `http://localhost:3001`

#### 2. 启动前端应用
```bash
cd frontend
npm install
npm run dev
```
前端应用将运行在 `http://localhost:5173`

#### 3. 访问应用
打开浏览器访问 `http://localhost:5173`

## 📁 项目结构

```
city-match/
├── backend/           # Express API 服务器
│   ├── server.js     # 主服务文件（包含匹配算法）
│   └── package.json
├── frontend/          # React 前端应用
│   ├── src/
│   │   ├── App.jsx              # 主应用组件（状态机）
│   │   ├── components/
│   │   │   ├── LandingPage.jsx      # 欢迎页
│   │   │   ├── QuizComponent.jsx    # 测试问卷
│   │   │   └── ResultDashboard.jsx  # 结果展示
│   │   └── main.jsx
│   └── package.json
├── database/          # 数据库脚本
│   └── init.sql      # PostgreSQL 初始化脚本
└── CLAUDE.md         # AI 开发助手指南
```

## 🔌 API 接口

### GET /api/questions
获取测试问题列表

**响应示例:**
```json
[
  {
    "id": 1,
    "text": "我对抽象的概念和想法很感兴趣。",
    "trait": "O"
  },
  ...
]
```

### POST /api/match
提交答案并获取匹配结果

**请求体:**
```json
[
  { "question_id": 1, "answer_value": 4 },
  { "question_id": 2, "answer_value": 2 },
  ...
]
```

**响应示例:**
```json
{
  "user_vector": {
    "O": 0.75,
    "C": 0.50,
    "E": 0.88,
    "A": 0.63,
    "N": 0.25
  },
  "top_cities": [
    {
      "id": 3,
      "name": "纽约",
      "country": "美国",
      "description": "永不停歇的能量之都...",
      "image_url": "https://...",
      "match_percent": 92
    },
    ...
  ]
}
```

## 🧪 OCEAN 人格模型

- **O (Openness)** - 开放性：对新体验和抽象思维的接受度
- **C (Conscientiousness)** - 尽责性：自律、有条理、注重细节
- **E (Extraversion)** - 外向性：社交倾向和能量来源
- **A (Agreeableness)** - 宜人性：信任他人、合作倾向
- **N (Neuroticism)** - 神经质：情绪稳定性（分数越高越不稳定）

## 🎯 匹配算法

1. 用户完成 10 道题（每个特质 2 题，包含正向和反向题）
2. 反向题进行转换：`6 - answer_value`
3. 每个特质归一化到 [0, 1]：`(sum - 2) / 8`
4. 使用余弦相似度计算用户向量与城市向量的匹配度
5. 返回匹配度最高的前 3 个城市

## 📝 开发说明

### 环境变量
后端支持通过 `PORT` 环境变量自定义端口：
```bash
PORT=4000 npm start
```

### 数据库集成
当前使用内存数据。如需切换到 PostgreSQL：
1. 运行 `database/init.sql` 初始化数据库
2. 修改 `backend/server.js` 使用 `pg` 连接池
3. 配置数据库连接字符串

### 构建生产版本
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 📄 许可证

MIT
