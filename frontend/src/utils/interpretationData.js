// 维度名称映射
export const TRAIT_NAMES = {
  O: '开放性',
  C: '尽责性',
  E: '外向性',
  A: '宜人性',
  N: '神经质'
};

// 标签矩阵
export const TAG_MATRIX = {
  O: {
    high: { user: '思想游侠', city: '创意熔炉' },
    mid: { user: '理性探索者', city: '多元平衡都市' },
    low: { user: '传统守望者', city: '历史基石' }
  },
  C: {
    high: { user: '精准节拍器', city: '律法之城' },
    mid: { user: '稳健行动派', city: '高效协作中心' },
    low: { user: '自由灵魂', city: '慢节奏天堂' }
  },
  E: {
    high: { user: '能量泵', city: '不夜城' },
    mid: { user: '间歇性活跃者', city: '社区友好型城市' },
    low: { user: '深度观察者', city: '沉思之谷' }
  },
  A: {
    high: { user: '治愈系光源', city: '温柔乡' },
    mid: { user: '协作先行者', city: '秩序与人情的交界' },
    low: { user: '锋利独行侠', city: '丛林法则中心' }
  },
  N: {
    high: { user: '敏感诗人', city: '灵感震中' },
    mid: { user: '真实体验者', city: '动态张力城市' },
    low: { user: '情绪磐石', city: '避风港' }
  }
};

// 契合文案
export const ALIGNMENT_TEXT = {
  O: '你们都拥有一颗不安分的灵魂，对未知的渴望让你们的角度完美重合。',
  C: '对秩序的极度尊重，让你们在精密运行的世界里找到了彼此。',
  E: '那种向外迸发的生命力，是你们之间最短的连接线。',
  A: '对世界的温柔善意，让你们的灵魂在空间中紧紧贴合。',
  N: '那些细腻而敏感的情绪，只有在这座城市的空气里才能得到最轻柔的安放。'
};

// 3种文案模板
export const TEMPLATES = {
  A: (data) => ({
    title: `🛰️ 全球坐标定位成功:我与 ${data.cityName} 的夹角趋近于 0°`,
    content: `世界上有成千上万座城市，但只有在这里，我不需要调整自己的步调。

测评显示，我与 ${data.cityName} 的性格夹角极小。这意味着，当我作为一名【${data.userTag1}】在思考人生时，这座城市作为【${data.cityTag1}】正以同样的频率给予我回应。同时，我的【${data.userTag2}】特质也在这里找到了共鸣。

心动契合点: ${data.alignmentText}

结论: 算法帮我找到了那个"望向同一个方向"的灵魂栖息地。`
  }),
  B: (data) => ({
    title: `🎬 这里的节奏，刚好是我心跳的"同位角"`,
    content: `找城市就像找舞伴，角度对了，才不会踩到脚。

在 ${data.cityName}，我发现自己与这里的性格走势达到了 ${data.matchPercent}% 的神同步。

- 我的底色: ${data.userTag1} × ${data.userTag2}
- 城市的气质: ${data.cityTag1}

为什么是这里？ ${data.alignmentText}

宣言: 别处是风景，这里是共鸣。`
  }),
  C: (data) => ({
    title: `📍 锁定目的地:${data.cityName}`,
    content: `测评档案:

- 契合深度: ${'★'.repeat(Math.ceil(data.matchPercent / 20))}
- 核心共振维度: ${data.traitName}

专家视点: 作为一个【${data.userTag1}】，你的一举一动都散发着对 ${data.traitName} 的追求。而在全球性格地图中，${data.cityName} 正是那个为你预留了坐标的【${data.cityTag1}】。你们的夹角如此之小，以至于你跨入这座城的第一秒，就会有"久别重逢"的错觉。你的【${data.userTag2}】特质也将在这里得到滋养。

出发建议: 你的向量已锁定，下一站，回家。`
  })
};
