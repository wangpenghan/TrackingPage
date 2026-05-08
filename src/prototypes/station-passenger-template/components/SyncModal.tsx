import { useState, useMemo } from 'react'
import {
  X, ArrowUpFromLine, Check, AlertTriangle, Loader2,
  Edit, RotateCcw, Download, CheckCircle2
} from 'lucide-react'
import { cn } from '../lib/utils'
import type { TemplateData } from '../types'
import type { SyncItem, SyncPhase, SyncResult, SyncPreview } from './sync-types'
import { getSyncPreview, simulateSync } from './sync-types'

interface SyncModalProps {
  isOpen: boolean
  onClose: () => void
  templates: TemplateData[]
  onSyncSuccess: (ids: string[]) => void
  onEditTemplate: (template: TemplateData) => void
}

export function SyncModal({
  isOpen,
  onClose,
  templates,
  onSyncSuccess,
  onEditTemplate,
}: SyncModalProps) {
  const [phase, setPhase] = useState<SyncPhase>('preview')
  const [syncItems, setSyncItems] = useState<SyncItem[]>([])
  const [results, setResults] = useState<SyncResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const previewData = useMemo(() => {
    return getSyncPreview(templates)
  }, [templates])

  const canSyncCount = previewData.canSync.length

  const handleStartSync = () => {
    setSyncItems(previewData.canSync)
    setPhase('executing')
    setIsExecuting(true)

    simulateSync(
      previewData.canSync,
      (items) => {
        setSyncItems([...items])
      },
      (result, total) => {
        setResults(result)
        setPhase('result')
        setIsExecuting(false)
        if (result.success > 0) {
          onSyncSuccess(result.items.filter((i) => i.status === 'success').map((i) => i.id))
        }
      }
    )
  }

  const handleRetryFailed = () => {
    const failedItems = syncItems.filter((i) => i.status === 'failed')
    setSyncItems([...failedItems])
    setPhase('executing')
    setIsExecuting(true)

    simulateSync(
      failedItems,
      (items) => {
        setSyncItems([...items])
      },
      (result) => {
        setResults({
          total: syncItems.length,
          success: syncItems.filter((i) => i.status === 'success').length + result.success,
          failed: syncItems.filter((i) => i.status === 'failed').length,
          skipped: 0,
          items: syncItems,
        })
        setPhase('result')
        setIsExecuting(false)
        if (result.success > 0) {
          onSyncSuccess(result.items.filter((i) => i.status === 'success').map((i) => i.id))
        }
      }
    )
  }

  const handleExportFailed = () => {
    const failedItems = syncItems.filter((i) => i.status === 'failed')
    const csvContent = [
      ['车次', '类型', '失败原因'].join(','),
      ...failedItems.map((i) =>
        [i.template.trainNo, i.template.trainType, i.reason || '未知错误'].join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `同步失败记录_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleClose = () => {
    if (!isExecuting) {
      setPhase('preview')
      setSyncItems([])
      setResults(null)
      onClose()
    }
  }

  const handleRetrySingle = (item: SyncItem) => {
    setSyncItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: 'syncing' as const } : i
      )
    )

    setTimeout(() => {
      const success = Math.random() > 0.2
      setSyncItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: success ? ('success' as const) : ('failed' as const),
                reason: success ? undefined : '接口超时',
                syncedAt: success ? new Date().toLocaleTimeString() : undefined,
              }
            : i
        )
      )
      if (success) {
        onSyncSuccess([item.id])
      }
    }, 500)
  }

  if (!isOpen) return null

  const progress = syncItems.length > 0
    ? Math.round(
        (syncItems.filter((i) => i.status === 'success' || i.status === 'failed').length /
          syncItems.length) *
          100
      )
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5e6ad2]/10 flex items-center justify-center">
              <ArrowUpFromLine className="w-5 h-5 text-[#5e6ad2]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#111827]">
                {phase === 'preview' && '同步客运模板'}
                {phase === 'executing' && '正在同步...'}
                {phase === 'result' && '同步完成'}
              </h2>
              {phase === 'executing' && (
                <p className="text-[13px] text-[#6B7280]">
                  正在处理 {syncItems.find((i) => i.status === 'syncing')?.template.trainNo || '...'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isExecuting}
            className={cn(
              'p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors',
              isExecuting && 'opacity-50 cursor-not-allowed'
            )}
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {phase === 'preview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-[#10B981] rounded-lg p-4 bg-[#F0FDF4]">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <h3 className="text-[14px] font-semibold text-[#065F46]">本次可同步车次</h3>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-3">
                    共 <span className="font-bold text-[#10B981]">{previewData.canSync.length}</span> 条车次将被同步
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {previewData.canSync.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#D1FAE5]">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center rounded-md text-[11px] font-medium h-[20px] px-1.5',
                            item.template.trainType === '始发' && 'bg-[#FEF3C7] text-[#92400E]',
                            item.template.trainType === '途径' && 'bg-[#F3E8FF] text-[#6B21A8]',
                            item.template.trainType === '终到' && 'bg-[#D1FAE5] text-[#065F46]'
                          )}>{item.template.trainType}</span>
                          <span className="text-[14px] font-bold text-[#111827]">{item.template.trainNo}</span>
                        </div>
                        <span className="text-[12px] text-[#6B7280]">
                          {item.template.arrivalTime}/{item.template.departureTime} · {item.template.track}股道
                        </span>
                      </div>
                    ))}
                    {previewData.canSync.length === 0 && (
                      <p className="text-[13px] text-[#9CA3AF] text-center py-4">暂无可同步的车次</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-[#9CA3AF] rounded-lg p-4 bg-[#F9FAFB]">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-[#9CA3AF]" />
                    <h3 className="text-[14px] font-semibold text-[#374151]">本次不可同步车次</h3>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-3">
                    共 <span className="font-bold text-[#6B7280]">{previewData.cannotSync.length}</span> 条车次被跳过
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {previewData.cannotSync.map((item) => (
                      <div key={item.template.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center rounded-md text-[11px] font-medium h-[20px] px-1.5',
                            item.reason === 'unconfirmed' && 'bg-[#FEE2E2] text-[#DC2626]',
                            item.reason === 'synced' && 'bg-[#D1FAE5] text-[#065F46]',
                            item.reason === 'invalid' && 'bg-[#F3F4F6] text-[#6B7280]'
                          )}>
                            {item.reason === 'unconfirmed' && '未确认'}
                            {item.reason === 'synced' && '已同步'}
                            {item.reason === 'invalid' && '数据无效'}
                          </span>
                          <span className="text-[14px] font-medium text-[#374151]">{item.template.trainNo}</span>
                        </div>
                      </div>
                    ))}
                    {previewData.cannotSync.length === 0 && (
                      <p className="text-[13px] text-[#9CA3AF] text-center py-4">所有车次均可同步</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'executing' && (
            <div className="space-y-4">
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#6B7280]">同步进度</span>
                  <span className="text-[14px] font-semibold text-[#5e6ad2]">{progress}%</span>
                </div>
                <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5e6ad2] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {syncItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      {item.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                        </div>
                      )}
                      {item.status === 'syncing' && (
                        <div className="w-5 h-5 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                          <Loader2 className="w-3 h-3 text-[#3B82F6] animate-spin" />
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div className="w-5 h-5 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#10B981]" />
                        </div>
                      )}
                      {item.status === 'failed' && (
                        <div className="w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                          <X className="w-3 h-3 text-[#EF4444]" />
                        </div>
                      )}
                      <span className="text-[14px] font-medium text-[#111827]">{item.template.trainNo}</span>
                      {item.status === 'failed' && item.reason && (
                        <span className="text-[12px] text-[#EF4444]">({item.reason})</span>
                      )}
                    </div>
                    {item.syncedAt && (
                      <span className="text-[12px] text-[#9CA3AF]">{item.syncedAt}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'result' && results && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#D1FAE5] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#065F46]">{results.success}</div>
                  <div className="text-[13px] text-[#065F46] mt-1">成功</div>
                </div>
                <div className="bg-[#FEE2E2] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#DC2626]">{results.failed}</div>
                  <div className="text-[13px] text-[#DC2626] mt-1">失败</div>
                </div>
                <div className="bg-[#F3F4F6] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#6B7280]">{results.skipped}</div>
                  <div className="text-[13px] text-[#6B7280] mt-1">跳过</div>
                </div>
              </div>

              {results.failed > 0 && (
                <div className="border-2 border-[#EF4444] rounded-lg p-4 bg-[#FEF2F2]">
                  <h3 className="text-[14px] font-semibold text-[#DC2626] mb-3">失败车次</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {syncItems.filter((i) => i.status === 'failed').map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#FECACA]">
                        <div>
                          <span className="text-[14px] font-medium text-[#111827]">{item.template.trainNo}</span>
                          {item.reason && (
                            <span className="text-[12px] text-[#EF4444] ml-2">({item.reason})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRetrySingle(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#3B82F6] text-white text-[12px] hover:bg-[#2563EB] transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> 重试
                          </button>
                          <button
                            onClick={() => {
                              onEditTemplate(item.template)
                              handleClose()
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-[#D1D5DB] text-[#374151] text-[12px] hover:bg-[#F3F4F6] transition-colors"
                          >
                            <Edit className="w-3 h-3" /> 编辑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <div>
            {phase === 'result' && results && results.failed > 0 && (
              <button
                onClick={handleExportFailed}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#D1D5DB] text-[#6B7280] text-[13px] hover:bg-[#F3F4F6] transition-colors"
              >
                <Download className="w-4 h-4" /> 导出失败记录
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isExecuting}
              className={cn(
                'px-4 py-2 rounded-lg text-[13px] transition-colors',
                isExecuting
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-white border border-[#D1D5DB] text-[#6B7280] hover:bg-[#F3F4F6]'
              )}
            >
              关闭
            </button>
            {phase === 'preview' && (
              <button
                onClick={handleStartSync}
                disabled={canSyncCount === 0}
                className={cn(
                  'px-4 py-2 rounded-lg text-[13px] font-medium transition-colors',
                  canSyncCount > 0
                    ? 'bg-[#5e6ad2] text-white hover:bg-[#4F5AC0] shadow-sm'
                    : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                )}
              >
                仅同步可用车次（{canSyncCount} 条）
              </button>
            )}
            {phase === 'result' && results && results.failed > 0 && (
              <button
                onClick={handleRetryFailed}
                className="px-4 py-2 rounded-lg bg-[#EF4444] text-white text-[13px] font-medium hover:bg-[#DC2626] transition-colors shadow-sm"
              >
                重试所有失败（{results.failed} 条）
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SyncButtonProps {
  canSyncCount: number
  onClick: () => void
}

export function SyncButton({ canSyncCount, onClick }: SyncButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-9 px-4 rounded-md bg-[#5e6ad2] text-white text-[13px] font-medium flex items-center gap-1.5 hover:bg-[#4F5AC0] transition-colors shadow-sm"
    >
      <ArrowUpFromLine className="w-4 h-4" /> 同步客运模板
      {canSyncCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center">
          {canSyncCount > 99 ? '99+' : canSyncCount}
        </span>
      )}
    </button>
  )
}
