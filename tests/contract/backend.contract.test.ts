import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  defaultConfigSchema,
  dockerDataSchema,
  dockerStatsResponseSchema,
  luckyServicesDataSchema,
  luckyServicesStatsResponseSchema,
  navConfigSchema,
  sitesDataSchema,
  unknownKeys
} from './schemas'

// 阶段 0 契约测试：后端 7 个 GET 接口的响应必须始终满足这些 schema。
// 后端是 Lucky 提供的、不可改；这里一旦变红，说明后端改了字段，前端必须先跟进类型再改 UI。
// 同时校验顶层字段集合：后端新增字段也会红，避免新字段静默丢在 UI 外。

const backendDir = resolve(process.cwd(), 'public/backend')

function load(file: string): Record<string, unknown> {
  const path = resolve(backendDir, file)
  if (!existsSync(path)) throw new Error(`missing fixture: ${path}`)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

const cases = [
  ['nav', 'nav.json', navConfigSchema],
  ['sites', 'sites.json', sitesDataSchema],
  ['docker', 'docker.json', dockerDataSchema],
  ['luckyservices', 'luckyservices.json', luckyServicesDataSchema],
  ['docker-stats', 'docker-stats.json', dockerStatsResponseSchema],
  ['luckyservices-stats', 'luckyservices-stats.json', luckyServicesStatsResponseSchema],
  ['default-config', 'default-config.json', defaultConfigSchema]
] as const

describe('backend contract', () => {
  for (const [endpoint, file, schema] of cases) {
    it(`${file} 满足 schema`, () => {
      expect(schema.parse(load(file))).toBeTruthy()
    })

    it(`${file} 无未知顶层字段`, () => {
      expect(unknownKeys(load(file), endpoint)).toEqual([])
    })
  }
})
