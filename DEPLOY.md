# 🚀 部署到 Vercel 全流程

本地仓库已就绪：86 个文件、7085 行已 commit。下面 3 步就能让你公司也能访问。

---

## Step 1：在 GitHub 创建空仓库（30 秒）

1. 打开 <https://github.com/new>
2. **Repository name** 填：`bazaar-codex`
3. **Description**（可选）：`大巴扎图鉴 · The Bazaar 中文物品/牌组/排位查询站`
4. 选 **Public**（Public 才能用 Vercel 免费版的最佳功能）
5. **不要勾任何"Initialize this repository"选项**（README、.gitignore、license 都不要勾）
6. 点 **Create repository**

---

## Step 2：在工程目录推送代码（1 分钟）

把下面三行命令贴到 PowerShell 里跑（在工程根目录 `c:\Users\tooyoungli\WorkBuddy\20260529154336`）：

```powershell
git remote add origin https://github.com/TooYoung010/bazaar-codex.git
git branch -M main
git push -u origin main
```

第一次 push 会让你登录 GitHub。如果电脑装了 GitHub Desktop 或浏览器登录过，会弹一个窗口让你授权；如果没装，建议先装一下 [GitHub CLI](https://cli.github.com/) 或 [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager/releases)，能自动处理认证。

> 不想装额外工具？也可以用 **Personal Access Token**：在 <https://github.com/settings/tokens/new> 创建一个有 `repo` 权限的 token，push 时把 token 当密码贴进去。

---

## Step 3：导入到 Vercel（2 分钟）

1. 打开 <https://vercel.com/signup>，**用 GitHub 账号登录**（点 "Continue with GitHub"）
2. 登录后到 <https://vercel.com/new>
3. 在 **Import Git Repository** 列表里找到 `TooYoung010/bazaar-codex`，点 **Import**
4. **Configure Project** 这页**保持默认即可**：
   - Framework Preset：自动识别为 Next.js ✅
   - Root Directory：`./`（不动）
   - Build Command：`npm run build`（不动）
   - Output Directory：`.next`（不动）
   - Environment Variables：**不需要任何**（项目只用公开 API）
5. 点 **Deploy**

等约 3-5 分钟，构建完成后你会看到一个公网地址，类似：
```
https://bazaar-codex.vercel.app
https://bazaar-codex-tooyoung010.vercel.app
```

**这个地址全球可访问，公司也能开**（除非公司有特别封锁 vercel.app 域名，但很少见）。

---

## 后续：数据更新（可选）

数据现在是**部分静态、部分实时**：

| 数据 | 类型 | 更新方式 |
|------|------|---------|
| 物品图鉴（926+117） | 静态 JSON | 跑 `npm run data:fetch && npm run data:transform` 后 push |
| 牌组（6156 套） | 静态 JSON | 跑 `node scripts/fetch-builds.mjs && node scripts/fetch-forge.mjs && node scripts/transform-builds.mjs` 后 push |
| 排位榜单 | 实时 + 5 分钟缓存 | 自动，无需手动 |
| **新闻（含 Steam 官方）** | **实时 + 1 小时缓存** | **自动！每小时刷新** |

最常看的「新闻」和「排位」都是自动的。物品和牌组数据如果想更新，跑两条命令再 push 即可（或者也可以做成 Vercel 定时任务，后续再加）。

---

## 如果遇到问题

1. **`git push` 报 403 / 认证失败**：用 PAT（Personal Access Token）方式，详见 Step 2 末尾
2. **Vercel build 失败**：把构建日志最后 30 行发给我，多半是依赖安装问题
3. **域名打不开**：等 1-2 分钟（CDN 全球同步），或换个浏览器试

---

舰长按 1→2→3 操作完，告诉我"部署完成"，我会再做最后的烟雾测试 + 确认每个功能都正常。
