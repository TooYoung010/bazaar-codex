# 🌐 阶段 2：绑定 bzz.gg + Cloudflare 加速（30 分钟）

> **目标**：让国内手机也能畅通访问 `https://bzz.gg`（不挂 VPN）
> **预算**：约 70-100 元/年（域名）+ Cloudflare 免费

---

## 流程总览

```
腾讯云买域名  →  Vercel 添加自定义域名  →  接入 Cloudflare（加速）  →  完成
   ~10 分钟          ~5 分钟                 ~10 分钟              5 分钟生效
```

---

## Part 1：腾讯云买 bzz.gg（10 分钟）

### Step 1.1：搜索并加购

打开 👉 https://buy.cloud.tencent.com/domain

1. 搜索框输入 **`bzz.gg`** → 回车
2. 应该会显示"可注册"+ 价格（`.gg` 域名约 90-150 元/年）
3. 点 **加入清单**

> 💡 如果界面里显示找不到，可能腾讯云不卖 `.gg`。备用渠道：
> - **Namecheap**：https://www.namecheap.com/domains/registration/results/?domain=bzz.gg （海外，约 $40 = 280 元/年，但服务好）
> - **Cloudflare Registrar**（最便宜但要海外卡）
>
> 如果腾讯云不能买 `.gg`，回来告诉我，我们换 **dabazha.gg** 或 **dabazha.com**（35-75 元/年），都已确认可注册。

### Step 1.2：填注册信息

- **域名持有者类型**：个人
- **真实姓名 / 身份证号 / 邮箱 / 手机号**：照填即可（`.gg` 域名**不需要备案**，但要实名）
- **邮箱**：用你常用的，会收到激活邮件

### Step 1.3：付款 → 完成

付款后等 5-10 分钟，邮箱会收到一封确认邮件。
然后回到 👉 https://console.cloud.tencent.com/domain/all-domain/all
看到 `bzz.gg` 出现在列表里 → 域名到手 ✅

---

## Part 2：在 Vercel 加自定义域名（5 分钟）

### Step 2.1：进入项目设置

1. 打开 https://vercel.com/dashboard
2. 点 `bazaar-codex` 项目
3. 顶部菜单点 **Settings** → 左侧点 **Domains**

### Step 2.2：添加 bzz.gg

1. 点 **Add Domain** 按钮
2. 输入 `bzz.gg`（不要带 https://）→ Add
3. Vercel 会让你二选一：
   - **Add bzz.gg**（顶级域名）
   - **Add www.bzz.gg**（带 www）
4. 选 **bzz.gg**（顶级最干净）

Vercel 会显示**两条 DNS 记录需要你配置**，类似：

```
Type: A
Name: @
Value: 76.76.21.21
```

或者：

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**不要关闭这个页面**，下面 Step 3 要用到这两条记录。

---

## Part 3：接入 Cloudflare（10 分钟，关键！）

> **为什么用 Cloudflare**：直接把 DNS 解析到 Vercel，国内手机仍可能不稳。
> **绕过这个问题最有效的方法**就是用 Cloudflare 当 DNS 中间层 + CDN。
> Cloudflare 国内有不少边缘节点（CN2、移动 CDN、阿里云加速），稳定性显著好于 vercel.app 直连。

### Step 3.1：注册 Cloudflare（免费）

打开 👉 https://dash.cloudflare.com/sign-up

- 邮箱 + 密码注册
- 验证邮箱

### Step 3.2：添加你的域名

1. 登录后进 Dashboard → 点 **+ Add a Site**
2. 输入 `bzz.gg` → Continue
3. 选 **Free 套餐**（全免费够用）→ Continue

### Step 3.3：Cloudflare 自动扫描（10秒）

- 它会扫你域名当前的 DNS 配置（应该是空的，因为你刚买）
- **重点**：Cloudflare 会显示**两个 Cloudflare Nameservers**，类似：
  ```
  alex.ns.cloudflare.com
  jenny.ns.cloudflare.com
  ```
- **复制这两个 nameserver**（它们会决定你下一步要做什么）

### Step 3.4：把 bzz.gg 的 DNS 服务器改到 Cloudflare

回到腾讯云：
1. 打开 https://console.cloud.tencent.com/domain/all-domain/all
2. 找到 `bzz.gg` → 点 **管理**
3. 左侧菜单点 **DNS 服务器**（或 "DNS Servers"）
4. 选 **使用我自己的 DNS 服务器**
5. 把刚才 Cloudflare 给的两个 nameserver 填进去：
   ```
   alex.ns.cloudflare.com
   jenny.ns.cloudflare.com
   ```
6. 保存

> ⏰ 这一步生效需要 5-30 分钟（很少超过 1 小时）。

### Step 3.5：在 Cloudflare 添加 Vercel 给的 DNS 记录

回到 Cloudflare → 你的域名 `bzz.gg` → 左侧 **DNS** → **Records**

点 **+ Add record**，把 Vercel 给的两条记录加进来：

如果 Vercel 给的是 **A 记录**：
```
Type:    A
Name:    @
IPv4:    76.76.21.21      (用 Vercel 给的实际 IP)
Proxy:   ✅ Proxied (橙色云朵)
TTL:     Auto
```

如果 Vercel 给的是 **CNAME 记录**：
```
Type:    CNAME
Name:    @
Target:  cname.vercel-dns.com
Proxy:   ✅ Proxied (橙色云朵)
TTL:     Auto
```

> 🔥 **关键点**：**Proxy status 一定要点亮"橙色云朵"**！这才能让 Cloudflare 帮你国内加速。灰色云朵就是普通 DNS 没加速。

---

## Part 4：等 DNS 生效（5-30 分钟）

完成上面所有步骤后：

1. **回到 Vercel Domains 页面**：等 1-5 分钟，那两条记录的状态会从 ❌ 变成 ✅
2. **手机网络测试**：关 WiFi 切 4G/5G，浏览器打开 `https://bzz.gg`
3. **不挂 VPN，国内直接通**

---

## 🆘 故障排查

| 问题 | 排查 |
|------|------|
| Cloudflare 一直 "Pending Nameserver Update" | 等久点（最多 24h）；或者你腾讯云改 nameserver 没保存成功 |
| 打开是个 Vercel 错误页 | DNS 还没生效，再等 5-10 分钟 |
| 手机仍然慢 | Cloudflare 节点选错，去 SSL/TLS → Edge Certificates → 把 SSL 模式从 Flexible 改 Full |
| `Error 521` | Vercel 那边 IP 没配对，回 Vercel 检查 Domains 页面是否两条记录都 ✅ |

---

## 完成后告诉我

- ✅ `https://bzz.gg` 在你电脑能开
- ✅ 手机不挂 VPN 能开

我做最后烟雾测试，确认每个页面都正常。

如果遇到哪一步卡住，**截图发我**，我帮你定位。
