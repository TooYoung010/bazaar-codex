# MEMORY.md - 长期记忆

## 用户信息
- **GitHub 用户名**：`TooYoung010`
- **GitHub Profile**：https://github.com/TooYoung010
- **绑定邮箱**：li941226@foxmail.com
- 准备部署项目：bazaar-codex（大巴扎图鉴）

## 项目：大巴扎图鉴 Bazaar Codex
- **项目路径**：`c:/Users/tooyoungli/WorkBuddy/20260529154336/`
- **目标部署**：Vercel（仓库名预定 `bazaar-codex`）
- **公司可访问**：通过 Vercel 公网域名 `xxx.vercel.app`
- **数据源**：
  - howbazaar.gg API（物品/技能/商店）
  - bazaarplusplus.com BPP 字典（中文翻译，按 ID 匹配）
  - bazaar-builds.net WordPress REST API（3056 套牌组）
  - bazaar.mrmao.life API（35000 条传奇玩家排位）
- **图片 CDN**：`https://howbazaar-images.b-cdn.net/images/items/{id}.avif`

## 偏好
- 中文优先 + 英文原名作副标题
- 数据更新走 `npm run data:fetch && npm run data:transform`
