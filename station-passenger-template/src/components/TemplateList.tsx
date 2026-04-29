import { useState, useMemo } from 'react'
import { Search, RefreshCw, Plus, Trash2, Download, Upload } from 'lucide-react'
import { TemplateCard } from './TemplateCard'
import { EditDrawer } from './EditDrawer'
import { cn } from '@/lib/utils'
import type { TemplateData, FilterOptions } from '@/types'

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
  // 新增 20 条数据（已确认、已同步）
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
    station: '重庆东',
    fromStation: '重庆东',
    toStation: ['成都东', '贵阳北', '万州北', '襄阳东', '西安北', '达州', '郑州东', '武汉', '长沙南', '北京西', '上海虹桥', '昆明南', '广州南', '深圳北', '南宁东', '兰州西', '乌鲁木齐', '拉萨', '哈尔滨西', '长春西', '沈阳北'][i],
    trainType: i % 3 === 0 ? '始发' : i % 3 === 1 ? '途径' : '终到',
    cycle: 1,
    rule: 1,
    diagramNo: '1',
    landmarkColor: ['绿', '黄', '蓝', '紫'][i % 4],
    validStart: '2026-04-17',
    validEnd: '4000-01-31',
    isValid: true,
    statusFlag: '无',
    confirmed: true,
    synced: true,
    operator: 'Flink-Job-Auto',
    operateTime: '2026-04-17 11:33:05',
    exitBasis: '发点',
    hasWater: i % 2 === 0,
    hasSuction: i % 3 === 0,
  })),
]

export function TemplateList() {
  const [templates, setTemplates] = useState<TemplateData[]>(mockTemplates)
  const [filters, setFilters] = useState<FilterOptions>({
    station: '重庆东',
    trainNo: '',
    trainType: '',
    validity: '',
    status: '',
    sortBy: '',
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [isEditOpen, setIsEditOpen] = useState(true)
  const [currentEditTemplate, setCurrentEditTemplate] = useState<TemplateData | undefined>(templates[0])

  const filteredTemplates = useMemo(() => {
    let result = [...templates]

    // 状态筛选（去掉“已同步(未确认)”）
    if (filters.status === 'unconfirmed') {
      result = result.filter((t) => !t.confirmed)
    } else if (filters.status === 'pending') {
      result = result.filter((t) => t.confirmed && !t.synced)
    } else if (filters.status === 'completed') {
      result = result.filter((t) => t.confirmed && t.synced)
    }

    if (filters.trainNo) {
      result = result.filter((t) => t.trainNo.includes(filters.trainNo))
    }

    if (filters.trainType) {
      result = result.filter((t) => t.trainType === filters.trainType)
    }

    if (filters.sortBy === 'arrival-asc') {
      result.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime))
    } else if (filters.sortBy === 'arrival-desc') {
      result.sort((a, b) => b.arrivalTime.localeCompare(a.arrivalTime))
    }

    return result
  }, [templates, filters])

  const selectedTemplates = useMemo(
    () => templates.filter((t) => selectedIds.includes(t.id)),
    [templates, selectedIds]
  )

  const hasUnconfirmed = selectedTemplates.some((t) => !t.confirmed)
  const hasUnsynced = selectedTemplates.some((t) => !t.synced)
  const unsyncedCount = templates.filter((t) => !t.synced).length
  const unconfirmedCount = templates.filter((t) => !t.confirmed).length
  const pendingCount = templates.filter((t) => t.confirmed && !t.synced).length
  const completedCount = templates.filter((t) => t.confirmed && t.synced).length


  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleAction = (action: string, template: TemplateData) => {
    switch (action) {
      case 'confirm':
        if (window.confirm(`确认模板 ${template.trainNo}？`)) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === template.id ? { ...t, confirmed: true } : t))
          )
        }
        break
      case 'sync':
        if (!template.confirmed) {
          alert('未确认的模板不能同步！')
          return
        }
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, synced: true } : t))
        )
        break
      case 'edit':
        setCurrentEditTemplate(template)
        setIsEditOpen(true)
        break
      case 'detail':
        setExpandedIds((prev) => {
          const next = new Set(prev)
          if (next.has(template.id)) next.delete(template.id)
          else next.add(template.id)
          return next
        })
        break
      case 'delete':
        if (window.confirm(`确定删除模板 ${template.trainNo}？`)) {
          setTemplates((prev) => prev.filter((t) => t.id !== template.id))
        }
        break
    }
  }

  const handleSaveEdit = (data: TemplateData) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === data.id ? data : t))
    )
  }

  const handleBatchConfirm = () => {
    if (window.confirm(`确认选中 ${selectedIds.length} 条模板？`)) {
      setTemplates((prev) =>
        prev.map((t) => (selectedIds.includes(t.id) ? { ...t, confirmed: true } : t))
      )
      setSelectedIds([])
    }
  }

  const handleBatchSync = () => {
    const unconfirmed = selectedTemplates.filter(t => !t.confirmed)
    if (unconfirmed.length > 0) {
      alert(`选中数据中有 ${unconfirmed.length} 条未确认，无法同步！`)
      return
    }
    setTemplates((prev) =>
      prev.map((t) => (selectedIds.includes(t.id) ? { ...t, synced: true } : t))
    )
    setSelectedIds([])
  }

  const handleBatchDelete = () => {
    if (window.confirm(`确定删除选中 ${selectedIds.length} 条模板？`)) {
      setTemplates((prev) => prev.filter((t) => !selectedIds.includes(t.id)))
      setSelectedIds([])
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 筛选区 */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.station}
            onChange={(e) => setFilters((prev) => ({ ...prev, station: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="重庆东">重庆东</option>
            <option value="重庆西">重庆西</option>
          </select>
          <input
            type="text"
            placeholder="请输入车次"
            value={filters.trainNo}
            onChange={(e) => setFilters((prev) => ({ ...prev, trainNo: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] w-[120px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          />
          <select
            value={filters.trainType}
            onChange={(e) => setFilters((prev) => ({ ...prev, trainType: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white w-[100px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="">请选择类型</option>
            <option value="始发">始发</option>
            <option value="途径">途径</option>
            <option value="终到">终到</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white w-[120px] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20"
          >
            <option value="">默认排序</option>
            <option value="arrival-asc">到点升序</option>
            <option value="arrival-desc">到点降序</option>
          </select>
          <button className="h-9 px-4 rounded-md bg-[#5e6ad2] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#4F5AC0] transition-colors shadow-sm">
            <Search className="w-4 h-4" /> 查询
          </button>
          <button
            onClick={() => setFilters({ station: '重庆东', trainNo: '', trainType: '', validity: '', status: '', sortBy: '' })}
            className="h-9 px-4 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> 重置
          </button>
        </div>
      </div>

      {/* 快捷筛选 + 工具栏 */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[
              { value: '', label: '全部', count: templates.length, color: 'default' },
              { value: 'unconfirmed', label: '未确认', count: unconfirmedCount, color: 'warning' },
              { value: 'pending', label: '未同步', count: pendingCount, color: 'info' },
              { value: 'completed', label: '已完成', count: completedCount, color: 'default' },
            ].map((item) => {
              const getButtonClasses = () => {
                if (filters.status === item.value) {
                  if (item.color === 'warning') return 'bg-[#f59e0b] text-white shadow-sm';
                  if (item.color === 'info') return 'bg-[#3b82f6] text-white shadow-sm';
                  return 'bg-[#5e6ad2] text-white shadow-sm';
                }
                if (item.color === 'warning') return 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border border-[#FCD34D]';
                if (item.color === 'info') return 'bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#BFDBFE] border border-[#93C5FD]';
                return 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]';
              };

              const getCountClasses = () => {
                if (filters.status === item.value) {
                  return 'bg-white/20 text-white';
                }
                if (item.color === 'warning') return 'bg-[#FCD34D] text-[#92400E]';
                if (item.color === 'info') return 'bg-[#93C5FD] text-[#1E40AF]';
                return 'bg-[#E5E7EB] text-[#6B7280]';
              };

              return (
                <button
                  key={item.value}
                  onClick={() => setFilters((prev) => ({ ...prev, status: item.value }))}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5',
                    getButtonClasses()
                  )}
                >
                  {item.label}
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full text-[11px] font-semibold',
                    getCountClasses()
                  )}>{item.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <span className="text-[13px] text-[#5e6ad2] font-medium mr-2">
                已选 {selectedIds.length} 项
              </span>
            )}
            <button
              disabled={selectedIds.length === 0}
              className={cn(
                'h-9 px-4 rounded-md text-[13px] flex items-center gap-1.5 transition-colors',
                selectedIds.length > 0
                  ? 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm'
                  : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
              )}
              onClick={handleBatchDelete}
            >
              <Trash2 className="w-4 h-4" /> 批量删除
            </button>
            {hasUnconfirmed && (
              <button
                disabled={selectedIds.length === 0}
                className="h-9 px-4 rounded-md bg-[#10b981] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#059669] transition-colors shadow-sm"
                onClick={handleBatchConfirm}
              >
                ✓ 批量确认
              </button>
            )}
            {hasUnsynced && (
              <button
                disabled={selectedIds.length === 0}
                className="h-9 px-4 rounded-md bg-[#5e6ad2] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#4F5AC0] transition-colors shadow-sm"
                onClick={handleBatchSync}
              >
                🔄 批量同步
              </button>
            )}
            <button className="h-9 px-4 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors">
              <Upload className="w-4 h-4" /> 导入
            </button>
            <button className="h-9 px-4 rounded-md bg-white text-[#6B7280] text-[13px] border border-[#D1D5DB] flex items-center gap-1.5 hover:bg-[#F3F4F6] transition-colors">
              <Download className="w-4 h-4" /> 导出
            </button>
            <button className="h-9 px-4 rounded-md bg-[#5e6ad2] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#4F5AC0] transition-colors shadow-sm">
              🔄 同步 ({unsyncedCount} 待同步)
            </button>
            <button className="h-9 px-4 rounded-md bg-[#5e6ad2] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#4F5AC0] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> 添加
            </button>
          </div>
        </div>
      </div>


      {/* 卡片列表 */}
      <div className="px-0 py-2">
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
                  if (next.has(id)) next.delete(id)
                  else next.add(id)
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
            <div className="text-center py-12 text-[#9CA3AF]">暂无数据</div>
          )}
        </div>
      </div>

      {/* 编辑抽屉 */}
      <EditDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        template={currentEditTemplate}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
