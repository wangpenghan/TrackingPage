import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, RefreshCw, Plus, Trash2, Download, Upload, X } from 'lucide-react'
import { TemplateCard } from './TemplateCard'
import { EditDrawer } from './EditDrawer'
import { SyncModal, SyncButton } from './SyncModal'
import { cn } from '../lib/utils'
import type { TemplateData, FilterOptions } from '../types'

const mockTemplates: TemplateData[] = [
  {
    id: '1',
    trainNo: 'D3710',
    arrivalTrainNo: 'D3709',
    arrivalTime: '09:10',
    departureTime: '09:10',
    stopDuration: 0,
    platform: '4',
    track: '4',
    parkingSpot: '北',
    entryDirection: '南',
    exitDirection: '南',
    entryCheckBasis: '发点',
    entryCheckOffset: -25,
    entryStopBasis: '发点',
    entryStopOffset: -5,
    gates: '4A、5A、4B、5B',
    waitingRoom: '候车大厅',
    exitGate: '渝厦场南侧出站口',
    formation: 16,
    formationDir: '正',
    model: 'CR400AF重联',
    bureau: '成局重段',
    station: '重庆东',
    fromStation: '重庆东',
    toStation: '北海',
    trainType: '始发',
    cycle: 1,
    rule: 1,
    diagramNo: '0',
    landmarkColor: '绿',
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: true,
    statusFlag: '无',
    confirmed: false,
    synced: false,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '发点',
    hasWater: true,
    hasSuction: true,
  },
  {
    id: '2',
    trainNo: 'G473',
    arrivalTrainNo: 'G472',
    arrivalTime: '11:56',
    departureTime: '11:56',
    stopDuration: 0,
    platform: '4',
    track: '4',
    parkingSpot: '北',
    entryDirection: '南',
    exitDirection: '南',
    entryCheckBasis: '发点',
    entryCheckOffset: 15,
    entryStopBasis: '发点',
    entryStopOffset: 0,
    gates: '4A、5A、4B、5B',
    waitingRoom: '候车大厅',
    exitGate: '渝厦场南侧出站口',
    formation: 16,
    formationDir: '正',
    model: 'CR400AF重联',
    bureau: '京局京段',
    station: '重庆东',
    fromStation: '重庆东',
    toStation: '重庆西',
    trainType: '始发',
    cycle: 1,
    rule: 1,
    diagramNo: '0',
    landmarkColor: '绿',
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: false,
    statusFlag: '无',
    confirmed: false,
    synced: false,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '发点',
    hasWater: false,
    hasSuction: false,
  },
  {
    id: '3',
    trainNo: 'G7181',
    arrivalTrainNo: 'G7180',
    arrivalTime: '12:46',
    departureTime: '12:46',
    stopDuration: 0,
    platform: '4',
    track: '4',
    parkingSpot: '南',
    entryDirection: '北',
    exitDirection: '北',
    entryCheckBasis: '到点',
    entryCheckOffset: 0,
    entryStopBasis: '到点',
    entryStopOffset: 0,
    gates: '4A、5A、4B、5B',
    waitingRoom: '候车大厅',
    exitGate: '渝厦场南侧出站口',
    formation: 16,
    formationDir: '正',
    model: 'CR400AF重联',
    bureau: '上局沪段',
    station: '重庆东',
    fromStation: '亳州南',
    toStation: '重庆东',
    trainType: '终到',
    cycle: 1,
    rule: 1,
    diagramNo: '0',
    landmarkColor: '黄',
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: true,
    statusFlag: '无',
    confirmed: true,
    synced: false,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '到点',
    hasWater: true,
    hasSuction: false,
  },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 4),
    trainNo: `G${1001 + i * 100}`,
    arrivalTime: `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${String(30 + (i % 2) * 15).padStart(2, '0')}`,
    departureTime: `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${String(35 + (i % 2) * 15).padStart(2, '0')}`,
    stopDuration: 5,
    platform: String((i % 10) + 1),
    track: String((i % 10) + 1),
    parkingSpot: i % 2 === 0 ? '东' : '西',
    entryDirection: i % 2 === 0 ? '东 (北)' : '西 (南)',
    exitDirection: i % 2 === 0 ? '东 (北)' : '西 (南)',
    entryCheckBasis: '发点',
    entryCheckOffset: -15,
    entryStopBasis: '发点',
    entryStopOffset: -5,
    gates: `${String((i % 10) + 1)}A`,
    waitingRoom: '候车大厅',
    exitGate: i % 2 === 0 ? '渝厦场南侧出站口' : '渝厦场北侧出站口',
    formation: i % 3 === 0 ? 16 : 8,
    formationDir: i % 2 === 0 ? '正' : '倒',
    model: i % 3 === 0 ? 'CR400AF重联' : 'CR400AF',
    bureau: ['成局重段', '京局京段', '上局沪段', '广铁广段', '郑局郑段', '西局西段', '沈局沈段', '哈局哈段', '济局济段', '昆局昆段'][i % 10],
    station: i % 5 === 0 ? '重庆西' : '重庆东',
    fromStation: i % 5 === 0 ? '重庆西' : '重庆东',
    toStation: ['成都东', '贵阳北', '万州北', '襄阳东', '西安北', '达州', '郑州东', '武汉', '长沙南', '北京西', '上海虹桥', '昆明南', '广州南', '深圳北', '南宁东', '兰州西', '乌鲁木齐', '拉萨', '哈尔滨西', '长春西', '沈阳北'][i],
    trainType: i % 3 === 0 ? '始发' : i % 3 === 1 ? '途径' : '终到',
    cycle: 1,
    rule: 1,
    diagramNo: '1',
    landmarkColor: ['绿', '黄', '蓝', '紫'][i % 4],
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: i % 7 === 0 ? false : true,
    statusFlag: '无',
    confirmed: true,
    synced: true,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '发点',
    hasWater: i % 2 === 0,
    hasSuction: i % 3 === 0,
  })),
  {
    id: 'dj1',
    trainNo: 'DJ7873',
    arrivalTrainNo: '',
    arrivalTime: '05:30',
    departureTime: '06:00',
    stopDuration: 30,
    platform: '2',
    track: '2',
    parkingSpot: '北',
    entryDirection: '南',
    exitDirection: '南',
    entryCheckBasis: '发点',
    entryCheckOffset: 0,
    entryStopBasis: '发点',
    entryStopOffset: 0,
    gates: '',
    waitingRoom: '',
    exitGate: '',
    formation: 8,
    formationDir: '正',
    model: 'CRH380A',
    bureau: '',
    station: '重庆东',
    fromStation: '重庆东',
    toStation: '贵阳北',
    trainType: '动检',
    cycle: 1,
    rule: 1,
    diagramNo: '0',
    landmarkColor: '蓝',
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: true,
    statusFlag: '无',
    confirmed: false,
    synced: false,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '发点',
    hasWater: false,
    hasSuction: false,
  },
  {
    id: 'ck1',
    trainNo: '0G1301',
    arrivalTrainNo: '',
    arrivalTime: '06:15',
    departureTime: '06:45',
    stopDuration: 30,
    platform: '3',
    track: '3',
    parkingSpot: '南',
    entryDirection: '北',
    exitDirection: '北',
    entryCheckBasis: '发点',
    entryCheckOffset: 0,
    entryStopBasis: '发点',
    entryStopOffset: 0,
    gates: '',
    waitingRoom: '',
    exitGate: '',
    formation: 8,
    formationDir: '正',
    model: 'CR400AF',
    bureau: '',
    station: '重庆东',
    fromStation: '重庆东库',
    toStation: '重庆东',
    trainType: '出库',
    cycle: 1,
    rule: 1,
    diagramNo: '0',
    landmarkColor: '黄',
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: true,
    statusFlag: '无',
    confirmed: false,
    synced: false,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '发点',
    hasWater: true,
    hasSuction: true,
  },
]

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

function Toast({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom duration-300',
      toast.type === 'success' && 'bg-[#10B981] text-white',
      toast.type === 'error' && 'bg-[#EF4444] text-white',
      toast.type === 'info' && 'bg-[#3B82F6] text-white',
    )}>
      <span className="text-[14px]">{toast.message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function TemplateList() {
  const [templates, setTemplates] = useState<TemplateData[]>(mockTemplates)
  const [filters, setFilters] = useState<FilterOptions>({
    station: '',
    trainNo: '',
    trainType: '',
    validity: 'valid',
    status: '',
    sortBy: 'arrival-asc',
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentEditTemplate, setCurrentEditTemplate] = useState<TemplateData | undefined>()
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToast({ id: Date.now().toString(), type, message })
  }, [])

  const filteredTemplates = useMemo(() => {
    let result = [...templates]

    if (filters.station) {
      result = result.filter((t) => t.station === filters.station)
    }

    if (filters.trainNo) {
      result = result.filter((t) =>
        t.trainNo.toLowerCase().includes(filters.trainNo.toLowerCase()) ||
        t.fromStation.toLowerCase().includes(filters.trainNo.toLowerCase()) ||
        t.toStation.toLowerCase().includes(filters.trainNo.toLowerCase())
      )
    }

    if (filters.trainType) {
      result = result.filter((t) => t.trainType === filters.trainType)
    }

    if (filters.validity === 'valid') {
      result = result.filter((t) => t.isValid === true)
    } else if (filters.validity === 'invalid') {
      result = result.filter((t) => t.isValid === false)
    }

    if (filters.status === 'unconfirmed') {
      result = result.filter((t) => !t.confirmed)
    } else if (filters.status === 'pending') {
      result = result.filter((t) => t.confirmed && !t.synced)
    } else if (filters.status === 'completed') {
      result = result.filter((t) => t.confirmed && t.synced)
    }

    switch (filters.sortBy) {
      case 'arrival-asc':
        result.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime))
        break
      case 'arrival-desc':
        result.sort((a, b) => b.arrivalTime.localeCompare(a.arrivalTime))
        break
      case 'trainNo-asc':
        result.sort((a, b) => a.trainNo.localeCompare(b.trainNo))
        break
      case 'trainNo-desc':
        result.sort((a, b) => b.trainNo.localeCompare(a.trainNo))
        break
      case 'type':
        const typeOrder: Record<string, number> = { '始发': 1, '途径': 2, '终到': 3 }
        result.sort((a, b) => (typeOrder[a.trainType] || 0) - (typeOrder[b.trainType] || 0))
        break
      case 'platform':
        result.sort((a, b) => parseInt(a.track) - parseInt(b.track))
        break
    }

    return result
  }, [templates, filters])

  const selectedTemplates = useMemo(
    () => templates.filter((t) => selectedIds.includes(t.id)),
    [templates, selectedIds]
  )

  const stats = useMemo(() => ({
    total: templates.length,
    unconfirmed: templates.filter((t) => !t.confirmed).length,
    pending: templates.filter((t) => t.confirmed && !t.synced).length,
    completed: templates.filter((t) => t.confirmed && t.synced).length,
    invalid: templates.filter((t) => !t.isValid).length,
  }), [templates])

  const hasUnconfirmed = selectedTemplates.some((t) => !t.confirmed)
  const hasUnsynced = selectedTemplates.some((t) => !t.synced)

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTemplates.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTemplates.map((t) => t.id))
    }
  }

  const handleAction = (action: string, template: TemplateData) => {
    switch (action) {
      case 'confirm':
        if (window.confirm(`确认模板 ${template.trainNo}？`)) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === template.id ? { ...t, confirmed: true } : t))
          )
          showToast('success', `模板 ${template.trainNo} 已确认`)
        }
        break
      case 'sync':
        if (!template.confirmed) {
          showToast('error', '未确认的模板不能同步')
          return
        }
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, synced: true } : t))
        )
        showToast('success', `模板 ${template.trainNo} 已同步`)
        break
      case 'edit':
        setCurrentEditTemplate(template)
        setIsEditOpen(true)
        break
      case 'detail':
        setExpandedIds((prev) => {
          const next = new Set(prev)
          if (next.has(template.id)) {
            next.delete(template.id)
          } else {
            next.add(template.id)
          }
          return next
        })
        break
      case 'delete':
        if (window.confirm(`确定删除模板 ${template.trainNo}？`)) {
          setTemplates((prev) => prev.filter((t) => t.id !== template.id))
          showToast('success', `模板 ${template.trainNo} 已删除`)
        }
        break
    }
  }

  const handleSaveEdit = (data: TemplateData) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === data.id ? data : t))
    )
    showToast('success', `模板 ${data.trainNo} 已保存`)
  }

  const handleBatchConfirm = () => {
    if (window.confirm(`确认选中 ${selectedIds.length} 条模板？`)) {
      setTemplates((prev) =>
        prev.map((t) => (selectedIds.includes(t.id) ? { ...t, confirmed: true } : t))
      )
      showToast('success', `成功确认 ${selectedIds.length} 条模板`)
      setSelectedIds([])
    }
  }

  const handleBatchSync = () => {
    const unconfirmed = selectedTemplates.filter((t) => !t.confirmed)
    if (unconfirmed.length > 0) {
      showToast('error', `选中数据中有 ${unconfirmed.length} 条未确认，无法同步`)
      return
    }
    setTemplates((prev) =>
      prev.map((t) => (selectedIds.includes(t.id) ? { ...t, synced: true } : t))
    )
    showToast('success', `成功同步 ${selectedIds.length} 条模板`)
    setSelectedIds([])
  }

  const handleBatchDelete = () => {
    if (window.confirm(`确定删除选中 ${selectedIds.length} 条模板？`)) {
      setTemplates((prev) => prev.filter((t) => !selectedIds.includes(t.id)))
      showToast('success', `成功删除 ${selectedIds.length} 条模板`)
      setSelectedIds([])
    }
  }

  const handleExport = () => {
    const dataToExport = selectedIds.length > 0 ? selectedTemplates : filteredTemplates
    const csvContent = [
      ['车次', '类型', '到点', '发点', '车站', '始发站', '终到站', '站台', '股道', '车型', '编组', '确认状态', '同步状态', '有效性'].join(','),
      ...dataToExport.map((t) =>
        [t.trainNo, t.trainType, t.arrivalTime, t.departureTime, t.station, t.fromStation, t.toStation, t.platform, t.track, t.model, t.formation, t.confirmed ? '已确认' : '未确认', t.synced ? '已同步' : '未同步', t.isValid ? '有效' : '无效'].join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `客运模板_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    showToast('success', `已导出 ${dataToExport.length} 条数据`)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          const lines = content.split('\n').slice(1)
          const imported = lines.filter((line) => line.trim()).length
          if (imported > 0) {
            showToast('success', `成功导入 ${imported} 条数据`)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleAdd = () => {
    const newId = String(Date.now())
    const newTemplate: TemplateData = {
      id: newId,
      trainNo: '',
      arrivalTrainNo: '',
      arrivalTime: '',
      departureTime: '',
      stopDuration: 0,
      platform: '',
      track: '',
      parkingSpot: '北',
      entryDirection: '南',
      exitDirection: '南',
      entryCheckBasis: '发点',
      entryCheckOffset: -25,
      entryStopBasis: '发点',
      entryStopOffset: -5,
      gates: '',
      waitingRoom: '',
      exitGate: '',
      formation: 8,
      formationDir: '正序',
      model: 'CR400AF',
      bureau: '',
      station: filters.station || '重庆东',
      fromStation: '',
      toStation: '',
      trainType: '始发',
      cycle: 1,
      rule: 1,
      diagramNo: '',
      landmarkColor: '绿',
      validStart: new Date().toISOString().split('T')[0],
      validEnd: '4000-01-31',
      isValid: true,
      statusFlag: '无',
      confirmed: false,
      synced: false,
      operator: '',
      operateTime: '',
      exitBasis: '发点',
      hasWater: false,
      hasSuction: false,
    }
    setCurrentEditTemplate(newTemplate)
    setIsEditOpen(true)
  }

  const handleSyncSuccess = useCallback((ids: string[]) => {
    setTemplates((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, synced: true } : t))
    )
    showToast('success', `成功同步 ${ids.length} 条模板`)
  }, [showToast])

  const handleEditTemplate = useCallback((template: TemplateData) => {
    setCurrentEditTemplate(template)
    setIsEditOpen(true)
  }, [])

  const getSortLabel = (sortBy: string) => {
    const labels: Record<string, string> = {
      'arrival-asc': '到点升序',
      'arrival-desc': '到点降序',
      'trainNo-asc': '车次升序',
      'trainNo-desc': '车次降序',
      'type': '按类型',
      'platform': '按站台',
    }
    return labels[sortBy] || sortBy
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.station}
            onChange={(e) => setFilters((prev) => ({ ...prev, station: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="">全部站点</option>
            <option value="重庆东">重庆东</option>
            <option value="重庆西">重庆西</option>
          </select>
          <input
            type="text"
            placeholder="搜索车次/站点"
            value={filters.trainNo}
            onChange={(e) => setFilters((prev) => ({ ...prev, trainNo: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] w-[140px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          />
          <select
            value={filters.trainType}
            onChange={(e) => setFilters((prev) => ({ ...prev, trainType: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white w-[100px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="">全部类型</option>
            <option value="始发">始发</option>
            <option value="途径">途径</option>
            <option value="终到">终到</option>
          </select>
          <select
            value={filters.validity}
            onChange={(e) => setFilters((prev) => ({ ...prev, validity: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white w-[100px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="">全部有效期</option>
            <option value="valid">有效</option>
            <option value="invalid">无效</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white w-[120px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="arrival-asc">到点升序</option>
            <option value="arrival-desc">到点降序</option>
            <option value="trainNo-asc">车次升序</option>
            <option value="trainNo-desc">车次降序</option>
            <option value="type">按类型</option>
            <option value="platform">按站台</option>
          </select>
          <button
            onClick={() => setFilters({ station: '', trainNo: '', trainType: '', validity: 'valid', status: '', sortBy: 'arrival-asc' })}
            className="h-9 px-4 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> 重置
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#E5E7EB] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {[
                { value: '', label: '全部', count: stats.total },
                { value: 'unconfirmed', label: '未确认', count: stats.unconfirmed, color: 'danger' },
                { value: 'pending', label: '未同步', count: stats.pending, color: 'warning' },
                { value: 'completed', label: '已完成', count: stats.completed, color: 'success' },
              ].map((item) => {
                const isActive = filters.status === item.value
                return (
                  <button
                    key={item.value}
                    onClick={() => setFilters((prev) => ({ ...prev, status: item.value }))}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5',
                      isActive && item.color === 'danger' && 'bg-[#EF4444] text-white shadow-sm',
                      isActive && item.color === 'warning' && 'bg-[#F59E0B] text-white shadow-sm',
                      isActive && item.color === 'success' && 'bg-[#10B981] text-white shadow-sm',
                      isActive && !item.color && 'bg-[#5e6ad2] text-white shadow-sm',
                      !isActive && item.color === 'danger' && 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] border border-[#FCA5A5]',
                      !isActive && item.color === 'warning' && 'bg-[#FEF3C7] text-[#92400e] hover:bg-[#FDE68A] border border-[#FCD34D]',
                      !isActive && item.color === 'success' && 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0] border border-[#6EE7B7]',
                      !isActive && !item.color && 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                    )}
                  >
                    {item.label}
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full text-[11px] font-semibold',
                      isActive && 'bg-white/20 text-white',
                      !isActive && item.color === 'danger' && 'bg-[#FCA5A5] text-[#DC2626]',
                      !isActive && item.color === 'warning' && 'bg-[#FCD34D] text-[#92400e]',
                      !isActive && item.color === 'success' && 'bg-[#6EE7B7] text-[#065F46]',
                      !isActive && !item.color && 'bg-[#E5E7EB] text-[#6B7280]'
                    )}>{item.count}</span>
                  </button>
                )
              })}
            </div>
            {stats.invalid > 0 && (
              <span className="text-[13px] text-[#EF4444] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                {stats.invalid} 条无效数据
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <span className="text-[13px] text-[#5e6ad2] font-medium mr-2">
                已选 {selectedIds.length} 项
                <button onClick={() => setSelectedIds([])} className="ml-2 underline hover:no-underline">取消</button>
              </span>
            )}
            <button
              onClick={handleSelectAll}
              className="h-9 px-3 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors"
            >
              {selectedIds.length === filteredTemplates.length && filteredTemplates.length > 0 ? '取消全选' : '全选'}
            </button>
            <button
              disabled={selectedIds.length === 0}
              className={cn('h-9 px-4 rounded-md text-[13px] flex items-center gap-1.5 transition-colors', selectedIds.length > 0 ? 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm' : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed')}
              onClick={handleBatchDelete}
            >
              <Trash2 className="w-4 h-4" /> 批量删除
            </button>
            {hasUnconfirmed && (
              <button
                disabled={selectedIds.length === 0}
                className="h-9 px-4 rounded-md bg-[#10B981] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#059669] transition-colors shadow-sm"
                onClick={handleBatchConfirm}
              >
                批量确认
              </button>
            )}
            {hasUnsynced && (
              <button
                disabled={selectedIds.length === 0}
                className="h-9 px-4 rounded-md bg-[#3B82F6] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#2563EB] transition-colors shadow-sm"
                onClick={handleBatchSync}
              >
                批量同步
              </button>
            )}
            <div className="h-6 w-px bg-[#E5E7EB]" />
            <button
              onClick={handleImport}
              className="h-9 px-4 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors"
            >
              <Upload className="w-4 h-4" /> 导入
            </button>
            <button
              onClick={handleExport}
              className="h-9 px-4 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors"
            >
              <Download className="w-4 h-4" /> 导出
            </button>
            <button
              onClick={handleAdd}
              className="h-9 px-4 rounded-md bg-[#5e6ad2] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#4F5AC0] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> 添加
            </button>
            <SyncButton
              canSyncCount={stats.pending}
              onClick={() => setIsSyncModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        <div className="flex items-center justify-between text-[13px] text-[#6B7280] mb-2">
          <span>共 {filteredTemplates.length} 条数据</span>
          <span>
            {selectedIds.length > 0 && `已选择 ${selectedIds.length} 项 | `}
            {filters.station && `站点: ${filters.station} | `}
            {filters.trainType && `类型: ${filters.trainType} | `}
            {filters.validity === 'valid' && '有效期: 有效 | '}
            {filters.validity === 'invalid' && '有效期: 无效 | '}
            {filters.sortBy && `排序: ${getSortLabel(filters.sortBy)}`}
          </span>
        </div>
        <div className="space-y-1">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedIds.includes(template.id)}
              isExpanded={expandedIds.has(template.id)}
              onSelect={handleSelect}
              onAction={handleAction}
              onToggleExpand={(id) => {
                setExpandedIds((prev) => {
                  const next = new Set(prev)
                  if (next.has(id)) {
                    next.delete(id)
                  } else {
                    next.add(id)
                  }
                  return next
                })
              }}
              onViewDetail={(t) => {
                setCurrentEditTemplate(t)
                setIsEditOpen(true)
              }}
            />
          ))}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#9CA3AF] text-[14px]">暂无数据</div>
              <div className="text-[#D1D5DB] text-[13px] mt-2">请尝试调整筛选条件</div>
            </div>
          )}
        </div>
      </div>

      <EditDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        template={currentEditTemplate}
        onSave={handleSaveEdit}
        isConfirmed={currentEditTemplate?.confirmed ?? false}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        templates={templates}
        onSyncSuccess={handleSyncSuccess}
        onEditTemplate={handleEditTemplate}
      />

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}