# LightPanel Vue（二创版）

基于 [LuckyLightPanel](https://github.com/gdy666/LuckyLightPanel)（Lucky Web 服务轻面板前端）二次创作的个人导航面板。保留与原版完全兼容的 Lucky 后端数据契约（`/backend/*.json`），前端整体重写：2 套主题、2 种布局、单一 CSS 令牌层。

## 特性

- 🎨 **2 套主题**：浅色 / 深色，纯 HSL 变量，主题文件不写任何组件选择器
- 🧊 **2 种布局**：卡片（`card`）/ 紧凑（`compact`），由密度令牌驱动，三个数据域共用同一套 Grid 原语
- ✨ **液态玻璃**：可选的玻璃质感卡片（斜向高光 + 1px 渐变描边 + 颗粒噪点），默认关闭
- 🗂️ **站点导航**：分组多选、内外网链接自动降级、多链接下拉、图标回落首字母
- 🐳 **Docker**：实时 CPU / 内存 / 网络速度、60 点走势、资源 TOP5 总览
- 🚀 **Lucky 服务**：端口转发 / STUN / Web 服务状态、流量与连接数、地址一键复制
- ⚙️ **设置持久化**：localStorage，旧配置自动迁移；支持服务器下发默认配置

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Vue 3.5 Composition API + TypeScript 5.7 strict |
| 构建 | Vite 6（`base: './'`，可部署任意子路径） |
| 状态 | Pinia |
| 样式 | Tailwind CSS 4 + `src/styles/tokens.css` 单文件令牌 |
| 交互原语 | reka-ui（下拉 / 对话框 / 复选框） |
| 图标 | lucide-vue-next |
| 测试 | Vitest 4 + happy-dom + zod 契约校验 |

运行时依赖只有 4 个：`vue`、`pinia`、`reka-ui`、`lucide-vue-next`。

## 快速开始

```bash
# Node.js >= 20
npm install
npm run dev            # http://localhost:5173，/backend 代理到 Lucky 127.0.0.1:16666
npm run build          # vue-tsc -b && vite build → dist/
npm run test           # 全部单测
npm run test:contract  # 只跑后端 API 契约测试
npm run lint
```

开发模式下后端不可达时，`vite.config.ts` 的中间件回退到 `public/backend/` 的 mock JSON。

## 目录结构

```
src/
├─ types/index.ts          后端契约类型 + ThemeMode/LayoutMode/TabType 常量
├─ styles/tokens.css       全部设计令牌（主题、密度、玻璃、圆角、细节比例）
├─ stores/
│  ├─ config.ts            localStorage 配置 + 旧值迁移（normalizeConfig）
│  └─ nav.ts               8 个后端接口 + 5s 轮询 + 60 点历史
├─ utils/
│  ├─ siteLinks.ts         内外网链接选择、图标推导
│  ├─ groups.ts            分组多选规整
│  └─ format.ts            速度/流量/时长/内存格式化
├─ composables/
│  └─ useFilteredGroups.ts 三域共用的搜索+分组+剪枝
├─ components/
│  ├─ common/              IconTile · Sparkline · GridToolbar · LoadingScreen · BackToTop
│  ├─ layout/              AppHeader · ContentTabs · GreetingClock
│  ├─ sites/               SiteCard · SiteGrid
│  ├─ docker/              DockerCard · DockerGrid · DockerOverview
│  ├─ luckyServices/       ServiceCard · ServiceGrid
│  └─ settings/            SettingsPanel
└─ App.vue                 启动编排、主题/布局属性、轮询调度
```

## 设计约束

这几条是重写时定下的不变量，改代码前先看：

1. **主题只改变量**。`tokens.css` 里 `[data-theme='dark']` / `[data-theme='light']` 两块只允许出现变量声明，禁止 `[data-theme=x] .某类名` 这种跨层覆盖。
2. **卡片外观唯一来源**是 `@utility glass`。组件不再各写一套背景/边框/圆角/阴影。
3. **布局靠令牌，不靠组件**。`--density-gap/min/pad/icon` 由 `[data-layout='compact']` 覆盖，新增布局只需在 `src/types/index.ts` 的 `LAYOUT_IDS` 加一项 + 一段变量覆盖 + `GridToolbar.vue` 的 `LAYOUT_META` 加一条。
4. **细节调整走 CSS `calc()`**。`--text-factor` / `--radius-scale` / `--blur-scale` / `--alpha-scale` 由设置面板写入，不再像旧版那样快照主题颜色再算。
5. **禁 `rgba()` 硬编码**。颜色一律 `hsl(var(--x) / α)`，否则明暗主题无法共用。
6. **后端类型字段不可改名**。`src/types/index.ts` 中与 Lucky 契约相关的字段动一个字母就断联；契约由 `tests/contract/` 的 zod schema 守着。

## 配置迁移

localStorage key 仍是 `lightpanel_config`。旧版 9 套主题 / 8 种布局按下表收敛，用户不需要手动清缓存：

| 旧值 | 新值 |
|---|---|
| `blueprint` `bauhaus` `crt-terminal` `console` `arctic-aurora` | `dark` |
| `light-panel` `receipt` | `light` |
| `normal` `large` `card` | `card` |
| `compact` `list` `minimal` `rack` `map` | `compact` |

映射表在 `src/stores/config.ts` 的 `LEGACY_THEME` / `LEGACY_LAYOUT`，由 `src/stores/config.test.ts` 覆盖。

## 测试

```
tests/contract/          zod 校验 7 个后端接口的真实 fixture + 未知字段检测
tests/combos.test.ts     3 tab × 2 布局 × 2 主题 = 12 组合挂载冒烟
tests/App.smoke.test.ts  挂载后断言 data-theme / data-layout / --text-factor 生效
src/**/*.test.ts         纯函数与配置迁移
```

## 部署

把 `dist/` 放到任意 HTTP 服务器，或在 Lucky Web 服务子规则里配置静态源（HTTP / 本地 / Rclone / 存储管理均可）。`base: './'`，支持任意子路径。

发布：打 `v*` tag 触发 `.github/workflows/release.yml`，先跑 `eslint` + `vitest`，再构建并 zip 出包。

## 体积基线

| 产物 | 大小 | gzip |
|---|---|---|
| `index-*.css` | 26 kB | 6.2 kB |
| `index-*.js` | 228 kB | 76.6 kB |

JS 里约 30 kB gzip 是 reka-ui。要再压可以把下拉/对话框换回手写原语。

## 文档

- [后端 API 契约](./API.md) — Lucky 后端数据接口说明
- [开发交接文档](./docs/开发交接文档.md) — 启动流程、属性驱动清单、踩坑记录
- [功能盘点](./docs/feature-inventory.md) — 重写前逐项记录的行为，作为对齐基准

## 开源协议

[MIT License](./LICENSE)

## 相关链接

- [Lucky 官网](https://lucky666.cn) · [原版仓库](https://github.com/gdy666/LuckyLightPanel)
