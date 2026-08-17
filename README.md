# LightPanel Vue（二创版）

基于 [LuckyLightPanel](https://github.com/gdy666/LuckyLightPanel)（Lucky Web服务轻面板前端）二次创作的个人导航面板，保留与原版完全兼容的 Lucky 后端数据契约，重做了主题系统、布局系统与使用体验。

## 与原版的主要差异

### 主题系统（核心差异）

| 对比项 | 原版 | 二创版 |
|--------|------|--------|
| 主题数量 | 浅色 / 深色 | 浅色、深色 + **包豪斯、复古终端、光牌点阵、调光控制台、运维小票、冰川极光** 共 8 个 |
| 背景表现 | 通用渐变 | 每个主题带**独立动态背景组件**（几何图形 / CRT 扫描线 / 点阵 / 调光台 / 打印纸 / 极光绸带 + 飘雪） |
| 维护方式 | 主题散落 5 处维护 | 新增 `src/themes/registry.ts` **主题注册表**，元数据单一来源；跨主题公共规则收敛到 `themes/_shared.css` |

### 布局系统

- 站点区 **6 种布局**：卡片 / 紧凑 / 列表 / 极简 / **机柜**（1U 前面板 + LED）/ **地铁线路图**（换乘站 + 彩色线路）
- Docker / Lucky 服务区 **5 种布局**，含机柜布局
- 布局切换器合并：Docker 与 Lucky 两个几乎相同的切换器收敛为通用 `DataLayoutSwitcher`（props 参数化，少 600+ 行重复代码）

### 设置面板

- **布局比例**：内容区整体缩放（CSS zoom），默认偏小费眼的问题可一键放大
- **站点卡片尺寸**：站点卡片最小列宽滑杆（70%–150%）
- **卡片形状**：方形（图标在上）/ 矩形（**左侧图标 + 右侧详情**）
- **细节调整**：文字对比度 / 圆角大小 / 玻璃模糊 / 卡片不透明度（滑杆，100% = 跟随主题）+ 减弱动效开关
- 细节调整通过运行时快照主题 CSS 变量并换算覆盖实现，**换主题自动重算，不叠乘**

### 使用体验修复

- 修复启动黑屏：移除 Google Fonts 渲染阻塞 `@import`、FontAwesome CDN 改非阻塞加载、初始化并行化、加载屏 3 秒兜底 + 淡出
- 默认主题（light/dark）文字对比度优化，次要文字不再看不清
- 默认深色主题 `--text-muted` 亮度 52% → 60%

### 工程清理

- 修复 ESLint（eslint 9 flat config，`npm run lint` 可用）
- 移除 4 个无引用的依赖：`radix-vue`、`motion-v`、`vue-router`、`@vueuse/core`
- 删除孤儿组件 `GroupTabs` 与残留的 `sketch-dark/sketch-light` 主题
- **新增 vitest 单测**（`npm run test`）：站点链接选择纯函数 17 个用例
- **卡片组件重构**：三大卡片（site / docker / service）按布局拆分为子组件 + `composables/`，单文件体积大幅下降
- **图标占位回退**：`common/CardIcon.vue` 图标加载失败时回退到首字母占位，不再空白

## 功能总览

- 🎨 8 套主题，各带独立动态背景
- 🗂️ 站点导航：分组管理、内/外网链接自动切换、多链接选择、卡片尺寸与方形/矩形切换
- 🐳 Docker 容器：实时 CPU / 内存 / 网络 / 磁盘，走势图
- 🚀 Lucky 服务：端口转发 / STUN / Web 服务状态与流量
- 🔍 站内快速搜索（分站点 / Docker / Lucky 三区）
- 📱 响应式布局（机柜布局在 ≥1600px 双列）
- ⚙️ 设置持久化到 localStorage，支持服务器下发默认配置

## 技术栈

- **框架**: Vue 3.5+ (Composition API) · **构建**: Vite 6 · **语言**: TypeScript 5.7
- **状态**: Pinia · **图标**: lucide-vue-next
- **样式**: 原生 CSS + CSS 变量主题系统（无 UI 框架）

## 快速开始

```bash
# 环境要求 Node.js >= 20

npm install      # 安装依赖
npm run dev      # 开发模式 http://localhost:5173（/backend 代理到 Lucky 16666）
npm run build    # 生产构建 → dist/
npm run lint     # ESLint 检查
npm run test     # vitest 单测
```

## 部署

将 `dist/` 部署到任意 HTTP 服务器，或在 Lucky Web服务子规则中配置为静态源（HTTP / 本地 / Rclone / 存储管理均可）。`base: './'` 相对路径，支持任意子路径部署。

开发模式后端不可达时，`public/backend/` 下的 mock JSON 会自动回退使用（`vite.config.ts` 中间件）。

## 文档

- [后端 API 契约](./API.md) — Lucky 后端数据接口说明
- [开发交接文档](./docs/开发交接文档.md) — 架构、主题/布局扩展步骤、注意事项

## 开源协议

[MIT License](./LICENSE)

## 相关链接

- [Lucky 官网](https://lucky666.cn) · [原版仓库](https://github.com/gdy666/LuckyLightPanel)
