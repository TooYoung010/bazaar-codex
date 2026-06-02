# 大巴扎图鉴 · Bazaar Codex

《大巴扎》(The Bazaar) 物品图鉴：按角色分类查询所有物品的获取来源、最早出现天数与吃鸡牌组。

## 功能

- ✅ **物品图鉴**：926 个物品按 8 个角色分类（Vanessa / Dooley / Pygmalien / Mak / Jules / Stelle / Karnok / 中立）
- ✅ **物品详情**：各品级效果、商店来源、最早出现天数、附魔变体、关联牌组
- ✅ **搜索筛选**：按品级、尺寸、关键词过滤
- ⏳ **吃鸡牌组库**：建设中（计划接入 mobalytics / bazaar-builds 数据）
- ⏳ **排位查询**：建设中（待对接游戏排行榜接口）

## 技术栈

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- 静态站点生成（SSG），部署到 Vercel 全球可访问

## 数据来源

- 物品 / 技能 / 商店：[howbazaar.gg](https://www.howbazaar.gg/)（公开 JSON API）
- 当前数据版本：见 `data/raw/items.json` 的 `version` 字段

## 开发命令

```bash
npm install                # 安装依赖
npm run data:fetch         # 拉取最新游戏数据
npm run data:transform     # 转换为站点用格式
npm run dev                # 本地开发 (http://localhost:3000)
npm run build              # 生产构建
npm start                  # 运行生产服务器
```

## 项目结构

```
.
├── data/raw/              # 从 howbazaar.gg 拉取的原始 JSON（gitignore）
├── scripts/
│   ├── fetch-data.mjs     # 拉取数据
│   └── transform-data.mjs # 转换 + 中文化
├── src/
│   ├── app/               # Next.js App Router 页面
│   ├── components/        # 复用组件
│   ├── data/              # 转换后的站点数据
│   └── lib/               # 数据访问层 + 类型
└── package.json
```

## 部署

推送到 GitHub 后导入 Vercel 即可一键部署，自动获得 `xxx.vercel.app` 公网域名，全球可访问。
