import { z } from 'zod'

// 后端契约的唯一可执行描述。字段对齐 API.md（Lucky 提供的 7 个 GET 接口）。
// 改动这里等于改契约：先改 API.md，再改这里，再改 src/types/index.ts。

const nullableStr = z.string().nullable().optional()

export const groupSchema = z.object({
  key: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  order: z.number().optional(),
  count: z.number().optional()
})

export const siteSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: nullableStr,
  iconUrl: nullableStr,
  frontendUrls: z.array(z.string()).optional(),
  backendUrls: z.array(z.string()).optional(),
  groupKey: z.string().optional(),
  order: z.number().optional(),
  enable: z.boolean().optional(),
  target: z.string().optional()
})

export const dockerContainerSchema = z.object({
  key: z.string(),
  containerName: z.string(),
  containerId: z.string().optional(),
  displayName: nullableStr,
  description: nullableStr,
  iconUrl: nullableStr,
  state: z.string().optional(),
  status: nullableStr,
  groupKey: z.string().optional(),
  order: z.number().optional(),
  enable: z.boolean().optional(),
  showStatus: z.boolean().optional(),
  composeProject: nullableStr
})

export const luckyServiceSchema = z.object({
  key: z.string(),
  name: z.string(),
  displayName: nullableStr,
  description: nullableStr,
  iconUrl: nullableStr,
  serviceType: z.string(),
  state: z.string().optional(),
  groupKey: z.string().optional(),
  order: z.number().optional(),
  enable: z.boolean().optional(),
  showStatus: z.boolean().optional(),
  publicAddr: nullableStr
})

// API.md 声明了 memoryPercent/networkRx/networkTx/displayName/status/iconUrl，但实测
// public/backend/docker-stats.json 不提供它们（nav.ts:257 用 `parseFloat(stat.memoryPercent) || 0` 兜底）。
// 所以只有代码硬依赖的字段是必需的，其余按 optional 描述「后端可能给」的集合。
export const dockerStatSchema = z.object({
  key: z.string().optional(),
  containerName: z.string(),
  displayName: nullableStr,
  iconUrl: nullableStr,
  state: z.string(),
  status: nullableStr,
  cpuPercent: z.string(),
  memoryUsage: z.string(),
  memoryPercent: z.string().optional(),
  networkRx: z.string().optional(),
  networkTx: z.string().optional(),
  networkRxSpeed: z.number(),
  networkTxSpeed: z.number(),
  diskReadSpeed: z.number().optional(),
  diskWriteSpeed: z.number().optional()
})

export const luckyServiceStatSchema = z.object({
  key: z.string(),
  state: z.string(),
  displayName: nullableStr,
  iconUrl: nullableStr,
  tcpCurrentConnections: z.number(),
  udpCurrentConnections: z.number(),
  trafficIn: z.number(),
  trafficOut: z.number(),
  inSpeed: z.number(),
  outSpeed: z.number(),
  publicAddr: nullableStr
})

export const navConfigSchema = z.object({
  version: z.string().optional(),
  settings: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    backgroundImages: z.array(z.string()).optional(),
    custom: z.record(z.unknown()).optional()
  }),
  sitesEnabled: z.boolean().optional(),
  dockerEnabled: z.boolean().optional(),
  luckyServicesEnabled: z.boolean().optional()
})

export const sitesDataSchema = z.object({
  networkType: z.enum(['internal', 'external']),
  clientIP: z.string(),
  groups: z.array(groupSchema),
  sites: z.array(siteSchema)
})

export const dockerDataSchema = z.object({
  groups: z.array(groupSchema),
  containers: z.array(dockerContainerSchema)
})

export const luckyServicesDataSchema = z.object({
  groups: z.array(groupSchema),
  services: z.array(luckyServiceSchema)
})

export const dockerStatsResponseSchema = z.object({
  ret: z.number(),
  stats: z.array(dockerStatSchema)
})

export const luckyServicesStatsResponseSchema = z.object({
  ret: z.number(),
  stats: z.array(luckyServiceStatSchema)
})

export const defaultConfigSchema = z.object({
  ret: z.number(),
  config: z.record(z.unknown())
})

export const networkTypeSchema = z.object({
  networkType: z.enum(['internal', 'external']),
  clientIP: z.string()
})

// 已知字段表：用于发现后端「新增了前端还不知道的字段」。
// 后端加字段 -> 这里红 -> 更新 src/types/index.ts + 本文件，而不是让新字段静默丢在 UI 外。
export const KNOWN_KEYS: Record<string, string[]> = {
  nav: Object.keys(navConfigSchema.shape),
  sites: Object.keys(sitesDataSchema.shape),
  docker: Object.keys(dockerDataSchema.shape),
  luckyservices: Object.keys(luckyServicesDataSchema.shape),
  'docker-stats': Object.keys(dockerStatsResponseSchema.shape),
  'luckyservices-stats': Object.keys(luckyServicesStatsResponseSchema.shape),
  'default-config': Object.keys(defaultConfigSchema.shape)
}

export function unknownKeys(payload: Record<string, unknown>, endpoint: keyof typeof KNOWN_KEYS): string[] {
  const known = new Set(KNOWN_KEYS[endpoint])
  return Object.keys(payload).filter((k) => !known.has(k))
}
