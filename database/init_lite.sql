-- ============================================
-- City-Personality Match: Lite Version
-- 包含 10 道题目和 5 个城市
-- ============================================

-- Trait enum
CREATE TYPE trait_type AS ENUM ('O', 'C', 'E', 'A', 'N');

-- Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  trait trait_type NOT NULL,
  is_reverse BOOLEAN NOT NULL DEFAULT FALSE
);

-- Cities table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  trait_o FLOAT NOT NULL,
  trait_c FLOAT NOT NULL,
  trait_e FLOAT NOT NULL,
  trait_a FLOAT NOT NULL,
  trait_n FLOAT NOT NULL
);

-- ============================================
-- Seed: 10 BFI-10 Questions
-- ============================================
INSERT INTO questions (text, trait, is_reverse) VALUES
  ('我对抽象的概念和想法很感兴趣。', 'O', FALSE),
  ('我觉得自己缺乏想象力。', 'O', TRUE),
  ('我做事有条理，注重细节。', 'C', FALSE),
  ('我有时会比较懒散，不够自律。', 'C', TRUE),
  ('我喜欢社交，容易与人打成一片。', 'E', FALSE),
  ('我倾向于安静，不太爱说话。', 'E', TRUE),
  ('我通常信任他人，愿意看到别人好的一面。', 'A', FALSE),
  ('我有时会对别人挑剔、找毛病。', 'A', TRUE),
  ('我容易感到紧张和焦虑。', 'N', FALSE),
  ('我情绪稳定，很少感到沮丧。', 'N', TRUE);

-- ============================================
-- Seed: 5 Cities with OCEAN Vectors
-- ============================================
INSERT INTO cities (name, country, description, image_url, trait_o, trait_c, trait_e, trait_a, trait_n) VALUES
('阿姆斯特丹', '荷兰',
 '这座城市以极高的包容性和创意文化闻名。运河边的自由氛围吸引着思想开放、富有好奇心的灵魂。如果你热爱艺术、多元文化和非传统的生活方式，这里就是你的精神家园。',
 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
 0.95, 0.50, 0.70, 0.80, 0.30),
('东京', '日本',
 '秩序与效率的极致体现。这座城市奖励自律、守时和对细节的执着追求。在这里，传统与未来科技完美融合，适合内心有条理、追求卓越的你。',
 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
 0.65, 0.95, 0.60, 0.70, 0.55),
('纽约', '美国',
 '永不停歇的能量之都。这里是外向者的天堂——无尽的社交场景、激烈的竞争和令人窒息的节奏。如果你渴望站在世界舞台的中心，纽约会回应你的野心。',
 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
 0.75, 0.60, 0.95, 0.40, 0.70),
('雷克雅未克', '冰岛',
 '世界尽头的宁静港湾。极光下的小城拥有极高的社会信任度和安全感。人们彼此关照，生活节奏舒缓。适合内心柔软、重视人际和谐、不喜欢冲突的你。',
 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800',
 0.60, 0.65, 0.35, 0.95, 0.20),
('维也纳', '奥地利',
 '古典与优雅的化身。这座音乐之都节奏从容，文化底蕴深厚，生活品质极高。维也纳适合情绪稳定、内心平和、享受慢生活与深度思考的人。',
 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
 0.80, 0.75, 0.45, 0.70, 0.15);
