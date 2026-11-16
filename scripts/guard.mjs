// 架构守卫：node scripts/guard.mjs [--warn-only] [--update-baseline]
//
// 目标不变量（Phase 1 完成后应全绿）：
//   1. 任何 .vue 的 <style> 里不允许出现 [data-theme  —— 组件不按主题写皮肤
//   2. 主题目录之外不允许出现 [data-theme="x"] 某class 选择器 —— 主题不碰组件内部 class
//
// 存量清零不可能一步到位，所以用"棘轮"：scripts/guard-baseline.json 记录每个文件
// 当前的违规数，只拦新增；数字只会往下调（--update-baseline 收紧闸门）。
//
// 退出码 1 = 有文件新增违规

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = path.join(ROOT, 'src')
const THEME_DIR = path.join(SRC, 'assets/styles/themes')
const BASELINE_FILE = path.join(ROOT, 'scripts/guard-baseline.json')

const WARN_ONLY = process.argv.includes('--warn-only')
const UPDATE_BASELINE = process.argv.includes('--update-baseline')

const violations = []

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

if (!existsSync(SRC)) {
  console.error('src/ 不存在')
  process.exit(1)
}

for (const file of await walk(SRC)) {
  const rel = path.relative(ROOT, file).split(String.fromCharCode(92)).join('/')
  const isVue = file.endsWith('.vue')
  const isCss = file.endsWith('.css')
  if (!isVue && !isCss) continue

  const text = await readFile(file, 'utf8')

  if (isVue) {
    // 只看 <style> 段；模板里用 data-theme 做逻辑判断是允许的
    for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      const css = m[1]
      const base = m.index + m[0].indexOf(css)
      // 按出现次数计，不按 style 块计——否则往已有违规的文件里再加一条会漏掉
      for (const hit of css.matchAll(/\[data-theme/g)) {
        const idx = hit.index
        const line = text.slice(0, base + idx).split('\n').length
        violations.push({
          rel,
          line,
          rule: '组件样式不得按主题分支',
          detail: css.slice(Math.max(0, idx - 30), idx + 50).replace(/\s+/g, ' ').trim()
        })
      }
    }
    continue
  }

  // CSS：主题目录之外禁止 [data-theme="x"] .某类 这种后代选择器
  if (file.startsWith(THEME_DIR)) continue
  for (const m of text.matchAll(/\[data-theme[^\]]*\][^{,]*\.[A-Za-z_][\w-]*/g)) {
    const line = text.slice(0, m.index).split('\n').length
    violations.push({ rel, line, rule: '主题目录外不得用 [data-theme] 覆盖组件 class', detail: m[0].trim() })
  }
}

const byFile = new Map()
for (const v of violations) {
  if (!byFile.has(v.rel)) byFile.set(v.rel, [])
  byFile.get(v.rel).push(v)
}
const counts = Object.fromEntries(
  [...byFile.entries()].map(([rel, list]) => [rel, list.length]).sort((a, b) => a[0].localeCompare(b[0]))
)

if (UPDATE_BASELINE) {
  await writeFile(BASELINE_FILE, JSON.stringify(counts, null, 2) + '\n')
  console.log(`已更新基线：${violations.length} 处 / ${byFile.size} 文件 → scripts/guard-baseline.json`)
  process.exit(0)
}

let baseline = {}
try {
  baseline = JSON.parse(await readFile(BASELINE_FILE, 'utf8'))
} catch {
  // 没有基线文件时，任何违规都算新增
}

const regressions = []
let improved = 0
for (const [rel, list] of byFile) {
  const allowed = baseline[rel] ?? 0
  if (list.length > allowed) regressions.push({ rel, list, allowed, actual: list.length })
}
for (const [rel, allowed] of Object.entries(baseline)) {
  const actual = counts[rel] ?? 0
  if (actual < allowed) improved += allowed - actual
}

if (regressions.length === 0) {
  console.log(
    violations.length === 0
      ? '架构守卫通过：无主题硬编码'
      : `架构守卫通过：存量 ${violations.length} 处未增加`
  )
  if (improved > 0) {
    console.log(`比基线少 ${improved} 处 —— 跑 node scripts/guard.mjs --update-baseline 收紧`)
  }
  process.exit(0)
}

console.log(`架构守卫发现 ${regressions.length} 个文件新增违规：\n`)
for (const { rel, list, allowed, actual } of regressions) {
  console.log(`  ${rel}  ${allowed} → ${actual}`)
  for (const v of list.slice(0, 3)) {
    console.log(`    L${v.line}  ${v.rule}`)
    console.log(`          ${v.detail.slice(0, 110)}`)
  }
}

if (WARN_ONLY) {
  console.log('\n(--warn-only：不阻断)')
  process.exit(0)
}
process.exit(1)
