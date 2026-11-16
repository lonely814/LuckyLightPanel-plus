// 视觉回归对比：node scripts/compare.mjs <基线目录> <当前目录>
// 输出：控制台报告 + 差异图目录（默认 docs/.diff/）
// 依赖像素比对，不做感知哈希——重构期要的是"看起来没变"，逐像素最严格

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASE = path.join(ROOT, process.argv[2] || 'docs/baseline')
const CURR = path.join(ROOT, process.argv[3] || 'docs/current')
const OUT = path.join(ROOT, 'docs/.diff')

// 单图差异像素占比阈值（%）：超过即失败
const THRESHOLD = Number(process.env.DIFF_THRESHOLD || 2)

async function loadPng(p) {
  return PNG.sync.read(await readFile(p))
}

async function main() {
  if (!existsSync(BASE) || !existsSync(CURR)) {
    console.error('缺少目录：', !existsSync(BASE) ? BASE : CURR)
    process.exit(1)
  }

  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const files = (await readdir(BASE)).filter(f => f.endsWith('.png')).sort()
  const rows = []
  let failed = 0

  for (const file of files) {
    const a = path.join(BASE, file)
    const b = path.join(CURR, file)
    if (!existsSync(b)) {
      rows.push({ file, status: '缺失', pct: 100 })
      failed++
      continue
    }

    const imgA = await loadPng(a)
    const imgB = await loadPng(b)

    // 尺寸变了说明布局结构变了，本身就是回归信号
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      rows.push({ file, status: `尺寸 ${imgA.width}x${imgA.height} → ${imgB.width}x${imgB.height}`, pct: 100 })
      failed++
      continue
    }

    const diff = new PNG({ width: imgA.width, height: imgA.height })
    const n = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, {
      threshold: 0.1,
      includeAA: false
    })
    const pct = (n / (imgA.width * imgA.height)) * 100

    if (pct > 0.01) {
      await writeFile(path.join(OUT, file), PNG.sync.write(diff))
    }

    const status = pct > THRESHOLD ? '差异超标' : pct > 0.01 ? '轻微差异' : '一致'
    if (pct > THRESHOLD) failed++
    rows.push({ file, status, pct })
  }

  const changed = rows.filter(r => r.status !== '一致')
  for (const r of changed) {
    console.log(`${r.status.padEnd(6)} ${r.pct.toFixed(3).padStart(8)}%  ${r.file}`)
  }

  await writeFile(
    path.join(OUT, '_report.json'),
    JSON.stringify({ threshold: THRESHOLD, total: rows.length, failed, rows }, null, 2)
  )

  console.log(`\n共 ${rows.length} 张，变动 ${changed.length} 张，超标 ${failed} 张（阈值 ${THRESHOLD}%）`)
  if (failed > 0) {
    console.log(`差异图：${path.relative(ROOT, OUT)}`)
    process.exit(1)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
