import type { TemplateData } from '../types'

export type SyncStatus = 'pending' | 'syncing' | 'success' | 'failed' | 'skipped'

export type SyncPhase = 'preview' | 'executing' | 'result'

export interface SyncItem {
  id: string
  template: TemplateData
  status: SyncStatus
  reason?: string
  syncedAt?: string
}

export interface SyncResult {
  total: number
  success: number
  failed: number
  skipped: number
  items: SyncItem[]
}

export interface SyncHistory {
  id: string
  timestamp: string
  operator: string
  total: number
  success: number
  failed: number
  skipped: number
}

export interface SyncPreview {
  canSync: SyncItem[]
  cannotSync: { template: TemplateData; reason: 'unconfirmed' | 'synced' | 'invalid' }[]
}

export function getSyncPreview(templates: TemplateData[]): SyncPreview {
  const canSync: SyncItem[] = []
  const cannotSync: { template: TemplateData; reason: 'unconfirmed' | 'synced' | 'invalid' }[] = []

  templates.forEach((template) => {
    if (template.isValid === false) {
      cannotSync.push({ template, reason: 'invalid' })
    } else if (template.synced) {
      cannotSync.push({ template, reason: 'synced' })
    } else if (!template.confirmed) {
      cannotSync.push({ template, reason: 'unconfirmed' })
    } else {
      canSync.push({
        id: template.id,
        template,
        status: 'pending',
      })
    }
  })

  return { canSync, cannotSync }
}

export function simulateSync(
  items: SyncItem[],
  onProgress: (items: SyncItem[]) => void,
  onComplete: (results: SyncResult, total: number) => void
) {
  const updatedItems = [...items]
  let completed = 0

  const processNext = (index: number) => {
    if (index >= updatedItems.length) {
      const result: SyncResult = {
        total: updatedItems.length,
        success: updatedItems.filter((i) => i.status === 'success').length,
        failed: updatedItems.filter((i) => i.status === 'failed').length,
        skipped: updatedItems.filter((i) => i.status === 'skipped').length,
        items: updatedItems,
      }
      onComplete(result, updatedItems.length)
      return
    }

    updatedItems[index] = {
      ...updatedItems[index],
      status: 'syncing',
    }
    onProgress([...updatedItems])

    setTimeout(() => {
      const random = Math.random()
      if (random > 0.15) {
        updatedItems[index] = {
          ...updatedItems[index],
          status: 'success',
          syncedAt: new Date().toLocaleTimeString(),
        }
      } else {
        const errors = ['接口超时', '字段校验失败', '服务器错误', '数据冲突']
        updatedItems[index] = {
          ...updatedItems[index],
          status: 'failed',
          reason: errors[Math.floor(Math.random() * errors.length)],
        }
      }
      completed++
      onProgress([...updatedItems])
      processNext(index + 1)
    }, 300 + Math.random() * 500)
  }

  processNext(0)
}
