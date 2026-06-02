# 自动数据刷新（GitHub Actions）

每天北京时间 **9:00** 自动拉最新数据并部署，无需任何手动操作。

## 工作流程

```
GitHub 定时器（每天 9:00 UTC+8）
   ↓
Actions 服务器跑 npm run data:refresh
   ↓ (拉 4 个数据源 + 转换 + 反推)
对比 src/data/ 是否有变化
   ↓ (如有变化)
自动 commit + push 到 main
   ↓
Vercel 检测到 push → 自动重新部署
   ↓
2-3 分钟后 https://bazaarwinner.com 显示最新数据
```

## 三种触发方式

### ① 自动定时（默认）
每天北京时间 9:00 跑一次，不用管。

### ② 手动触发（紧急更新）
1. 打开 https://github.com/TooYoung010/bazaar-codex/actions
2. 左侧点 **"🔄 Refresh game data"**
3. 右上角 **"Run workflow"** → **"Run workflow"** 蓝色按钮
4. 等 2-3 分钟看绿色对勾

### ③ 本地手动跑（开发调试用）
```powershell
cd C:\Users\tooyoungli\WorkBuddy\20260529154336
npm run data:refresh
git add -A
git commit -m "data update"
git push
```

## 数据源覆盖

| 数据 | 来源 | 刷新方式 |
|------|------|---------|
| 物品（1043） | howbazaar.gg API | Actions 自动 |
| 中文翻译 | bazaarplusplus BPP 字典 | Actions 自动 |
| 历史牌组（3056） | bazaar-builds.net | Actions 自动（已停更） |
| 活跃牌组（3104+） | bazaarforge.gg | Actions 自动 |
| Karnok 物品（102） | 牌组反推 | Actions 自动 |
| 新闻（Steam 官方） | Steam API | 网站访问时实时拉 |
| 排位（35000） | mrmao API | 网站访问时实时拉 |

## 监控运行情况

打开：https://github.com/TooYoung010/bazaar-codex/actions

- 🟢 绿色对勾 = 成功
- 🔴 红色叉 = 失败（点进去看日志）
- 灰色圆点 = 没有数据变化（跳过 commit）

GitHub 会在失败时给你绑定的邮箱（`li941226@foxmail.com`）发提醒。

## 故障排查

### 失败常见原因

1. **数据源临时挂了**（howbazaar/bazaarforge/bazaar-builds 任一）
   - 处理：第二天会自动重试，一般不用管
   
2. **bazaarforge 的 Supabase anon key 过期**
   - 现象：`forge_*` 文件返回 401
   - 处理：去 bazaarforge.gg 抓新 key 更新 `scripts/fetch-forge.mjs`

3. **howbazaar 改 API 路径**
   - 现象：`items.json` 返回 404
   - 处理：抓他们 JS bundle 找新路径

任何失败把 Actions 日志截图发我，我直接修。
