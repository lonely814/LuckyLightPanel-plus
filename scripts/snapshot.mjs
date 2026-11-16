// 视觉基线截图：node scripts/snapshot.mjs [输出目录]
// 依赖：先 npm run build（本脚本自己起静态服务读 dist/）

import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, process.argv[2] || 'docs/baseline')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp'
}

const THEMES = ['light', 'dark', 'blueprint', 'bauhaus', 'crt-terminal', 'light-panel', 'console', 'receipt', 'arctic-aurora']

// 三类实体各自支持的布局（与 LayoutSwitcher / DataLayoutSwitcher 保持一致）
const TABS = {
  sites: ['normal', 'compact', 'list', 'minimal', 'rack', 'map'],
  docker: ['list', 'normal', 'compact', 'minimal', 'rack'],
  luckyServices: ['list', 'normal', 'compact', 'minimal', 'rack']
}

// 移动端只截主布局，否则图量翻倍
const MOBILE_LAYOUT = { sites: 'normal', docker: 'list', luckyServices: 'normal' }

// 视口够高让内容一屏装下（不用 fullPage：页面高度随异步数据浮动，截图就不可比）
const VIEWPORTS = {
  desktop: { width: 1440, height: 1400, tag: 'd' },
  mobile: { width: 390, height: 1400, tag: 'm' }
}

// 截图前注入：隐藏滚动条 + 把动画/过渡钉死在终态
const STABLE_CSS = `
  html, body { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .animate-fade-in-up { opacity: 1 !important; transform: none !important; }
`

function serveStatic() {
  return new Promise(resolve => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
      let file = path.join(DIST, urlPath)
      if (!file.startsWith(DIST)) { res.statusCode = 403; return res.end() }
      if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')
      if (!existsSync(file)) file = path.join(DIST, 'index.html') // SPA 回退
      try {
        const body = await readFile(file)
        res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream')
        res.end(body)
      } catch (e) {
        res.statusCode = 500
        res.end(String(e))
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

function baseConfig(theme, tab, layout) {
  return {
    theme,
    background: 'cyber',
    customBgUrl: '',
    layout: tab === 'sites' ? layout : 'normal',
    dockerLayout: tab === 'docker' ? layout : 'list',
    luckyServicesLayout: tab === 'luckyServices' ? layout : 'normal',
    layoutScale: 1,
    siteCardSize: 100,
    siteCardShape: 'square',
    showDescription: true,
    showTime: true,
    showSearch: true,
    showHeader: true,
    searchEngine: 'bing',
    customSearchUrl: '',
    tabGroups: { sites: 'all', docker: 'all', luckyServices: 'all' },
    networkMode: 'hybrid',
    currentTab: tab,
    detailTextContrast: 100,
    detailRadiusScale: 100,
    detailGlassBlurScale: 100,
    detailGlassOpacityScale: 100,
    detailReduceMotion: false
  }
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.error('dist/index.html 不存在，先跑 npm run build')
    process.exit(1)
  }

  await mkdir(OUT, { recursive: true })

  const server = await serveStatic()
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()

  const shots = []
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce'
    })

    // 外网全部拒绝：图标推导必定失败 → 稳定走首字母占位，消除网络抖动
    await ctx.route('**/*', route => {
      const u = route.request().url()
      if (u.startsWith(origin)) return route.continue()
      return route.abort()
    })

    const page = await ctx.newPage()

    // 冻结"当前时间"的读取：页头时钟、分组时间戳按 now 渲染，不冻结就没有可比性。
    // 只替换 Date，不动 setTimeout/Interval——否则加载屏的兜底定时器不会触发。
    await page.addInitScript(() => {
      const FIXED = new Date('2026-01-01T12:00:00+08:00').getTime()
      const RealDate = Date
      // @ts-ignore - 测试注入
      function FakeDate(...args) {
        if (args.length === 0) return new RealDate(FIXED)
        return new RealDate(...args)
      }
      FakeDate.prototype = RealDate.prototype
      FakeDate.now = () => FIXED
      FakeDate.parse = RealDate.parse
      FakeDate.UTC = RealDate.UTC
      // @ts-ignore
      window.Date = FakeDate

      // 冻结 5s 轮询：stats 每次到达都往走势图历史 push 一个采样点，
      // 跑得快是 1 个点、跑得慢是 2 个点，图和数字就不可比。
      const realSetInterval = window.setInterval
      window.setInterval = function (fn, delay, ...rest) {
        if (typeof delay === 'number' && delay >= 5000) return 0
        return realSetInterval(fn, delay, ...rest)
      }

      // 配置在应用启动之前就写好。若走"先进页面再 setItem 再 reload"，
      // 首屏的 saveConfig() 会把刚写的配置覆盖回默认值（实测 1/4 概率）。
      const raw = new URLSearchParams(location.search).get('__cfg')
      if (raw) {
        try {
          localStorage.setItem('lightpanel_config', decodeURIComponent(raw))
        } catch {
          // 配置写不进去时页面会用默认值，截图会明显错乱，交给断言失败即可
        }
      }
    })

    const themes = process.env.SUBSET ? THEMES.slice(0, Number(process.env.SUBSET)) : THEMES
    for (const theme of themes) {
      for (const [tab, layouts] of Object.entries(TABS)) {
        const list = vpName === 'mobile' ? [MOBILE_LAYOUT[tab]] : layouts
        for (const layout of list) {
          const cfg = baseConfig(theme, tab, layout)
          const url = `${origin}/?__cfg=${encodeURIComponent(JSON.stringify(cfg))}`
          await page.goto(url, { waitUntil: 'networkidle' })
          await page.addStyleTag({ content: STABLE_CSS })
          await page.waitForSelector('.app-main', { timeout: 15000 })
          // 等实体卡片真正渲染出来，否则截到空网格
          await page.waitForFunction(
            () => document.querySelectorAll('.cyber-card, .docker-card, .service-card').length > 0,
            { timeout: 15000 }
          )
          await page.waitForTimeout(400)
          const name = `${theme}__${tab}__${layout}__${vp.tag}.png`
          await page.screenshot({
            path: path.join(OUT, name),
            fullPage: false,
            animations: 'disabled',
            caret: 'hide'
          })
          shots.push(name)
          process.stdout.write(`  ${name}\n`)
        }
      }
    }

    await ctx.close()
  }

  await browser.close()
  server.close()

  await writeFile(
    path.join(OUT, '_manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), count: shots.length, shots }, null, 2)
  )
  console.log(`\n完成：${shots.length} 张 → ${path.relative(ROOT, OUT)}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
