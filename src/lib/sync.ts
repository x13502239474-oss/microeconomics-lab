import type { Persisted } from '../types'

/**
 * 云端同步预留接口。
 * 当前默认使用本地存储；接入 Supabase / 自建 API 时，实现 CloudAdapter
 * 并在应用启动时调用 registerCloudAdapter() 即可，业务代码无需改动。
 */
export type CloudAdapter = {
  name: string
  pull: () => Promise<Partial<Persisted> | null>
  push: (state: Persisted) => Promise<void>
}

let adapter: CloudAdapter | null = null

export function registerCloudAdapter(a: CloudAdapter | null) {
  adapter = a
}

export function cloudStatus() {
  return adapter ? { connected: true, name: adapter.name } : { connected: false, name: '本地存储' }
}

export async function pullFromCloud() {
  if (!adapter) return null
  return adapter.pull()
}

export async function pushToCloud(state: Persisted) {
  if (!adapter) return false
  await adapter.push(state)
  return true
}
