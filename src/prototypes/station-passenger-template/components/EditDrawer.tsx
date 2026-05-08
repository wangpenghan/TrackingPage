import { useState, useEffect } from 'react'
import { X, Plus, Minus, Train, ChevronLeft, ChevronRight, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import type { TemplateData } from '../types'
import { detectSyncSensitiveChanges, FIELD_DISPLAY_NAMES } from './sync-utils'

interface EditDrawerProps {
  isOpen: boolean
  onClose: () => void
  template?: TemplateData
  onSave: (data: TemplateData) => void
  isConfirmed?: boolean
}

const initialData: TemplateData = {
  id: '', trainNo: '', arrivalTrainNo: 'D3709', departureTrainNo: 'D3709', connectingTrain: '',
  arrivalTime: '', departureTime: '', startTime: '', endTime: '', stopDuration: 0,
  platform: '', track: '', parkingSpot: '北', entryDirection: '南', exitDirection: '南',
  entryCheckBasis: '发点', entryCheckOffset: -25, entryStopBasis: '发点', entryStopOffset: -5,
  exitCheckOffset: 0, exitStopOffset: 0, exitBasis: '发点',
  gates: '', waitingRoom: '', exitGate: '',
  formation: 8, formationDir: '正序', model: 'CR400AF', carriages: '',
  station: '重庆东', fromStation: '', toStation: '',
  gateFromStation: '', gateToStation: '',
  trainType: '始发', cycle: 1, rule: 1, diagramNo: '',
  trainNoMode: '自动', trainClass: '高铁', bureau: '', capacity: 0,
  broadcastGroup: '', landmarkColor: '绿', hasWater: false, hasSuction: false,
  validStart: '', validEnd: '', statusFlag: '无',
  confirmed: false, synced: false, operator: '', operateTime: '',
  fromStationDays: 0, toStationDays: 0,
}

export function EditDrawer({ isOpen, onClose, template, onSave, isConfirmed = false }: EditDrawerProps) {
  const [formData, setFormData] = useState<TemplateData>(template || initialData)
  const [originalData, setOriginalData] = useState<TemplateData | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [editingTimeField, setEditingTimeField] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [changedFields, setChangedFields] = useState<Array<{ field: keyof TemplateData; oldVal: any; newVal: any }>>([])
  const isReadonly = isConfirmed

  const uf = (field: keyof TemplateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const isFreightTrain = (trainNo: string) => {
    const freightPrefixes = ['0G', 'DJ', '0D', '动检', '出库', '货运', '调车', '检修', '救援', '路用']
    return freightPrefixes.some(prefix => trainNo.startsWith(prefix) || trainNo.includes(prefix))
  }

  const isFreightMode = isFreightTrain(formData.trainNo)

  const clickHandler = (handler: () => void) => {
    if (isReadonly) return
    handler()
  }

  const parseOffset = (baseTime: string, targetTime: string): number => {
    if (!baseTime || !targetTime) return 0
    const [baseH, baseM] = baseTime.split(':').map(Number)
    const [targetH, targetM] = targetTime.split(':').map(Number)
    return (targetH - baseH) * 60 + (targetM - baseM)
  }

  useEffect(() => {
    if (template) {
      setFormData({ ...template })
      setOriginalData({ ...template })
      setIsDirty(false)
    }
  }, [template?.id])

  const handleModelChange = (v: any) => {
    uf('model', v)
    uf('formation', v.includes('重联') ? 16 : 8)
  }

  const handleTrackChange = (v: any) => {
    uf('track', v)
    uf('platform', v)
    if (!isFreightMode) {
      uf('gates', `${v}A,${v}B`)
      uf('waitingRoom', '候车大厅')
      uf('exitGate', v <= 4 ? '渝厦场南侧出站口' : '渝厦场北侧出站口')
    }
  }

  const handleParkingSpotChange = (v: any) => {
    uf('parkingSpot', v)
    uf('entryDirection', v === '北' ? '南' : v === '南' ? '北' : '')
  }

  const calcLandmarkColor = (formation: number, formationDir: string, parkingSpot: string) => {
    if (formation === 16 && formationDir === '正序' && parkingSpot === '北') return '绿'
    if (formation === 16 && formationDir === '倒序' && parkingSpot === '北') return '黄'
    if (formation === 8 && formationDir === '正序' && parkingSpot === '北') return '蓝'
    if (formation === 8 && formationDir === '倒序' && parkingSpot === '北') return '紫'
    if (formation === 16 && formationDir === '正序' && parkingSpot === '南') return '蓝'
    if (formation === 16 && formationDir === '倒序' && parkingSpot === '南') return '紫'
    if (formation === 8 && formationDir === '正序' && parkingSpot === '南') return '绿'
    if (formation === 8 && formationDir === '倒序' && parkingSpot === '南') return '黄'
    return '绿'
  }

  useEffect(() => {
    const color = calcLandmarkColor(formData.formation, formData.formationDir, formData.parkingSpot)
    if (formData.landmarkColor !== color) {
      uf('landmarkColor', color)
    }
  }, [formData.formation, formData.formationDir, formData.parkingSpot])

  const handleTrainNoChange = (newTrainNo: string) => {
    const wasFreight = isFreightMode
    uf('trainNo', newTrainNo)
    const isNowFreight = isFreightTrain(newTrainNo)

    if (isNowFreight && !wasFreight) {
      uf('entryCheckOffset', 0)
      uf('entryStopOffset', 0)
      uf('exitCheckOffset', 0)
      uf('exitStopOffset', 0)
      uf('gates', '')
      uf('exitGate', '')
      uf('waitingRoom', '')
    }
  }

  const isPassengerTrain = ['始发', '途径', '终到'].includes(formData.trainType)

  const handleSave = () => {
    if (!originalData) {
      onSave(formData)
      onClose()
      return
    }

    if (originalData.synced) {
      const changes = detectSyncSensitiveChanges(originalData, formData, isPassengerTrain)
      if (changes.length > 0) {
        setChangedFields(changes)
        setShowResetConfirm(true)
        return
      }
    }

    onSave(formData)
    onClose()
  }

  const confirmSaveWithReset = () => {
    const updatedData = { ...formData, synced: false }
    onSave(updatedData)
    setShowResetConfirm(false)
    onClose()
  }

  const cancelResetConfirm = () => {
    setShowResetConfirm(false)
    setChangedFields([])
  }

  const handleConfirm = () => {
    const issues: string[] = []
    if (!formData.trainNo?.trim()) issues.push('出发车次不能为空')
    if (!formData.trainType?.trim()) issues.push('列车类型不能为空')
    if (!formData.fromStation?.trim()) issues.push('始发站不能为空')
    if (!formData.toStation?.trim()) issues.push('终到站不能为空')
    if (!formData.arrivalTime?.trim() && isFreightMode) issues.push('到达时间不能为空')
    if (!formData.departureTime?.trim() && isFreightMode) issues.push('发车时间不能为空')
    if (!formData.track?.trim() && isFreightMode) issues.push('股道不能为空')

    if (issues.length > 0) {
      alert(`数据验证失败：\n${issues.join('\n')}`)
      return
    }
    handleSave()
  }

  const calcTime = (base: string, off: number) => {
    if (!base) return '--:--'
    const [h, m] = base.split(':').map(Number)
    const t = ((h * 60 + m + off) % 1440 + 1440) % 1440
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
  }

  const getBase = (basis: string) => basis === '发点' ? formData.departureTime : formData.arrivalTime

  const chk = (list: string | undefined, item: string) => (list || '').split(',').includes(item)
  const toggleChk = (list: string | undefined, item: string, on: boolean) => {
    const cur = (list || '').split(',').filter(Boolean)
    return on ? [...cur, item].join(',') : cur.filter(g => g !== item).join(',')
  }

  const getLandmarkColorClass = (color: string) => {
    switch (color) {
      case '绿': return 'bg-[#10B981]'
      case '黄': return 'bg-[#F59E0B]'
      case '蓝': return 'bg-[#3B82F6]'
      case '紫': return 'bg-[#8B5CF6]'
      default: return 'bg-[#10B981]'
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <div
      className={cn('w-10 h-5 rounded-full relative cursor-pointer transition-colors', checked ? 'bg-[#10B981]' : 'bg-[#D1D5DB]')}
      onClick={() => onChange(!checked)}
    >
      <div className={cn('w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm', checked ? 'left-5' : 'left-0.5')} />
    </div>
  )

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)
    return days
  }

  const isDayHighlighted = (day: number | null): 'active' | 'inactive' | 'none' => {
    if (day === null) return 'none'
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    const meetsRule = () => {
      const dayOfWeek = date.getDay()
      if (formData.cycle === 1) return true
      if (formData.cycle === 2) {
        const validStart = formData.validStart ? new Date(formData.validStart) : null
        if (!validStart) return (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)
        const offset = (formData.alternateStartOffset ?? 0) === 0 ? 0 : 1
        const diffDays = Math.floor((date.getTime() - validStart.getTime()) / 86400000)
        return (diffDays + offset) % 2 === 0
      }
      if (formData.cycle === 0) {
        const rule = formData.rule ?? 0
        const bit = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        const dayBit = 1 << bit
        return (rule & dayBit) !== 0
      }
      return false
    }

    if (!meetsRule()) return 'none'

    const validStart = formData.validStart ? new Date(formData.validStart) : null
    const validEnd = formData.validEnd ? new Date(formData.validEnd) : null
    const inRange =
      (!validStart || date >= validStart) &&
      (!validEnd || date <= validEnd)

    return inRange ? 'active' : 'inactive'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className={cn(
        'relative bg-[#F9FAFB] shadow-2xl flex flex-col h-full overflow-hidden rounded-l-xl',
        isFreightMode ? 'w-full max-w-[780px]' : 'w-full max-w-[1040px]'
      )}>
        <div className={cn('flex items-center justify-between px-4 py-3 border-b flex-shrink-0', isFreightMode ? 'bg-[#FEF3C7] border-[#F59E0B]/30' : 'bg-white border-[#E5E7EB]')}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Train className={cn('w-4 h-4', isFreightMode ? 'text-[#D97706]' : 'text-[#5e6ad2]')} />
              <h2 className={cn('text-[15px] font-bold', isFreightMode ? 'text-[#D97706]' : 'text-[#111827]')}>
                {isFreightMode ? '⚠️ 编辑非客运模板' : '编辑客运模板'}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={cn('text-[11px] font-medium', formData.synced ? 'text-[#059669]' : 'text-[#D97706]')}>
                  {formData.synced ? '已同步' : '未同步'}
                </span>
                <Toggle checked={formData.synced} onChange={(v) => uf('synced', v)} />
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-[11px] font-medium', formData.isValid !== false ? 'text-[#059669]' : 'text-[#DC2626]')}>
                  {formData.isValid !== false ? '有效' : '无效'}
                </span>
                <Toggle checked={formData.isValid !== false} onChange={(v) => uf('isValid', v)} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-[#6B7280] text-white rounded-lg text-[13px] font-medium hover:bg-[#4B5563] transition-colors shadow-sm">保存</button>
            <button onClick={handleConfirm} disabled={isReadonly} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-[13px] font-medium hover:bg-[#0DA071] transition-colors shadow-sm disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed disabled:hover:bg-[#D1D5DB]">确认信息</button>
            <button onClick={onClose} className="px-4 py-2 bg-white text-[#6B7280] rounded-lg text-[13px] font-medium border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors">关闭</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
            {isFreightMode ? (
              <>
                <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-2">基础信息</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>车次号</label>
                      <div className="flex items-center gap-2">
                        <input value={formData.trainNo} onChange={e => handleTrainNoChange(e.target.value)} placeholder="请输入车次号"
                          className="flex-1 h-7 px-2 rounded-md border-2 border-[#D97706] text-[14px] font-bold text-[#111827] bg-[#FEF3C7] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>列车类型</label>
                      <select value={formData.trainType ?? ''} onChange={e => uf('trainType', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        {['始发', '途径', '终到', '货运', '调车', '检修', '救援', '路用'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>始发站</label>
                      <input type="text" value={formData.fromStation ?? ''} onChange={e => uf('fromStation', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>终到站</label>
                      <input type="text" value={formData.toStation ?? ''} onChange={e => uf('toStation', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>到达时间</label>
                      <input type="time" value={formData.arrivalTime} onChange={e => uf('arrivalTime', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D97706] text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#D97706]/20" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>发车时间</label>
                      <input type="time" value={formData.departureTime} onChange={e => uf('departureTime', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D97706] text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#D97706]/20" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-2">编组配置</div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>车型</label>
                      <select value={formData.model ?? ''} onChange={e => handleModelChange(e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        {['CR400AF', 'CR400AF重联', 'CRH380A'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>编组</label>
                      <select value={String(formData.formation)} onChange={e => uf('formation', Number(e.target.value))}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        {['8', '16'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>编组方向</label>
                      <select value={formData.formationDir ?? ''} onChange={e => uf('formationDir', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        {['正序', '倒序'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>担当局</label>
                      <select value={formData.bureau ?? ''} onChange={e => uf('bureau', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        {['', '成局重段', '京局京段', '上局沪段', '广铁广段', '郑局郑段', '西局西段'].map(o => <option key={o} value={o}>{o || '请选择'}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>列车等级</label>
                      <select value={formData.trainClass ?? ''} onChange={e => uf('trainClass', e.target.value)}
                        className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        {['高铁', '动车', '普速'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-2">作业配置</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={cn('flex items-center justify-between p-2 rounded border cursor-pointer',
                      formData.hasWater ? 'bg-[#ECFDF5] border-[#10B981]' : 'bg-[#F9FAFB] border-[#E5E7EB]')}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.hasWater ?? false} onChange={e => uf('hasWater', e.target.checked)}
                          className="w-4 h-4 rounded border-[#D97706] text-[#D97706] accent-[#D97706]" />
                        <span className="text-[12px] font-medium text-[#374151]">上水作业</span>
                      </div>
                      <span className={cn('text-[11px] px-1.5 py-0.5 rounded',
                        formData.hasWater ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
                        {formData.hasWater ? '需要' : '不需要'}
                      </span>
                    </label>
                    <label className={cn('flex items-center justify-between p-2 rounded border cursor-pointer',
                      formData.hasSuction ? 'bg-[#ECFDF5] border-[#10B981]' : 'bg-[#F9FAFB] border-[#E5E7EB]')}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.hasSuction ?? false} onChange={e => uf('hasSuction', e.target.checked)}
                          className="w-4 h-4 rounded border-[#D97706] text-[#D97706] accent-[#D97706]" />
                        <span className="text-[12px] font-medium text-[#374151]">吸污作业</span>
                      </div>
                      <span className={cn('text-[11px] px-1.5 py-0.5 rounded',
                        formData.hasSuction ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
                        {formData.hasSuction ? '需要' : '不需要'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-1">运行规律</div>
                  <div className="flex gap-2">
                    <div className="w-[180px] flex-shrink-0">
                      <div className="grid grid-cols-1 gap-y-1">
                        <div className="flex flex-col gap-0">
                          <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>运行类型</label>
                          <select value={formData.cycle === 1 ? '每日开行' : formData.cycle === 2 ? '隔日开行' : '规律开行'}
                            onChange={e => {
                              const value = e.target.value
                              if (value === '每日开行') { uf('cycle', 1); uf('rule', 0b1111111) }
                              else if (value === '隔日开行') { uf('cycle', 2); uf('rule', 0b0101010) }
                              else { uf('cycle', 0); uf('rule', 0b1111100) }
                            }}
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                            {['每日开行', '隔日开行', '规律开行'].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-0">
                          <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">起始有效期</label>
                          <input type="date" value={formData.validStart ?? ''} onChange={e => uf('validStart', e.target.value)}
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-0">
                          <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">终止有效期</label>
                          <input type="date" value={formData.validEnd ?? ''} onChange={e => uf('validEnd', e.target.value)}
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">按周规律</label>
                      <div className="grid grid-cols-7 gap-0.5">
                        {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => {
                          const bit = idx
                          const dayBit = 1 << bit
                          const isChecked = ((formData.rule ?? 0) & dayBit) !== 0
                          return (
                            <button
                              key={day}
                              onClick={() => {
                                const newRule = isChecked
                                  ? (formData.rule ?? 0) & ~dayBit
                                  : (formData.rule ?? 0) | dayBit
                                uf('rule', newRule)
                              }}
                              className={cn(
                                'h-6 text-[10px] rounded border transition-colors',
                                isChecked ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-white text-[#6B7280] border-[#D1D5DB] hover:bg-[#F3F4F6]'
                              )}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded mb-1">其他信息</div>
                  <div className="grid grid-cols-4 gap-x-2 gap-y-1">
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">闸机始发</label>
                      <input type="text" value={formData.gateFromStation ?? ''} onChange={e => uf('gateFromStation', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" placeholder="请输入" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">闸机终到</label>
                      <input type="text" value={formData.gateToStation ?? ''} onChange={e => uf('gateToStation', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" placeholder="请输入" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">基本图号</label>
                      <input type="text" value={formData.diagramNo ?? ''} onChange={e => uf('diagramNo', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full" placeholder="请输入" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">广播模板</label>
                      <select value={formData.broadcastGroup ?? ''} onChange={e => uf('broadcastGroup', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 w-full">
                        <option value="">请选择</option>
                        <option value="normal">正常广播</option>
                        <option value="express">快速广播</option>
                        <option value="delay">晚点广播</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-2">
                    <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">车次信息</div>
                    <div className="mb-1">
                      <label className="text-[11px] font-medium text-[#6B7280] block mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>车次号</label>
                      <div className="flex items-center gap-2">
                        <input value={formData.trainNo} onChange={e => handleTrainNoChange(e.target.value)} placeholder="请输入车次号"
                          className="flex-1 h-8 px-2 rounded-md border-2 border-[#5e6ad2] text-[16px] font-bold text-[#111827] bg-[#FAFBFF] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>列车类型</label>
                        <select value={formData.trainType ?? ''} onChange={e => uf('trainType', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['始发', '途径', '终到'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>到达时间</label>
                        <input type="time" value={formData.arrivalTime} onChange={e => uf('arrivalTime', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#5e6ad2] text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>始发站</label>
                        <input type="text" value={formData.fromStation ?? ''} onChange={e => uf('fromStation', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>出发时间</label>
                        <input type="time" value={formData.departureTime} onChange={e => uf('departureTime', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#5e6ad2] text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>终到站</label>
                        <input type="text" value={formData.toStation ?? ''} onChange={e => uf('toStation', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5">到达车次</label>
                        <input type="text" value={formData.arrivalTrainNo ?? ''} onChange={e => uf('arrivalTrainNo', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5">始发车次</label>
                        <input type="text" value={formData.departureTrainNo ?? ''} onChange={e => uf('departureTrainNo', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="font-medium text-[#6B7280] mb-0.5">接续车次</label>
                        <input type="text" value={formData.connectingTrain ?? ''} onChange={e => uf('connectingTrain', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-2">
                    <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">列车信息</div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>车型</label>
                        <select value={formData.model ?? ''} onChange={e => handleModelChange(e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['CR400AF', 'CR400AF重联', 'CRH380A'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>编组</label>
                        <select value={String(formData.formation)} onChange={e => uf('formation', Number(e.target.value))}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['8', '16'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>方向</label>
                        <select value={formData.formationDir ?? ''} onChange={e => uf('formationDir', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['正序', '倒序'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>担当局</label>
                        <select value={formData.bureau ?? ''} onChange={e => uf('bureau', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['', '成局重段', '京局京段', '上局沪段'].map(o => <option key={o} value={o}>{o || '请选择'}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>等级</label>
                        <select value={formData.trainClass ?? ''} onChange={e => uf('trainClass', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['高铁', '动车', '普速'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>停车位</label>
                        <select value={formData.parkingSpot ?? ''} onChange={e => handleParkingSpotChange(e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2]">
                          {['北', '南'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">进站方向</label>
                        <select value={formData.entryDirection ?? ''} onChange={e => uf('entryDirection', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['北', '南'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">出站方向</label>
                        <select value={formData.exitDirection ?? ''} onChange={e => uf('exitDirection', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                          {['北', '南'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">地标颜色</label>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F9FAFB] text-[12px] flex items-center text-[#6B7280] cursor-not-allowed">
                            {formData.landmarkColor}
                          </div>
                          <div className={cn('w-4 h-4 rounded flex-shrink-0', getLandmarkColorClass(formData.landmarkColor))} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-0 col-span-3">
                        <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">列车车底</label>
                        <input type="text" value={formData.carriages ?? ''} onChange={e => uf('carriages', e.target.value)}
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">检票时间</div>
                  <div className="flex flex-col gap-1">
                    <div className="bg-[#EFF6FF] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]"><span className="text-[#EF4444] mr-0.5">*</span>进站开检</label>
                      <select value={formData.entryCheckBasis} onChange={e => uf('entryCheckBasis', e.target.value)}
                        className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-shrink-0 w-[120px]">
                        <option value="发点">发点 ({formData.departureTime || '--:--'})</option>
                        <option value="到点">到点 ({formData.arrivalTime || '--:--'})</option>
                      </select>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('entryCheckOffset', formData.entryCheckOffset - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', formData.entryCheckOffset > 0 ? 'text-[#16A34A]' : formData.entryCheckOffset < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {formData.entryCheckOffset > 0 ? `+${formData.entryCheckOffset}` : formData.entryCheckOffset}
                        </span>
                        <button onClick={() => uf('entryCheckOffset', formData.entryCheckOffset + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'entryCheck' ? (
                          <input
                            type="time"
                            value={calcTime(getBase(formData.entryCheckBasis), formData.entryCheckOffset)}
                            onChange={(e) => uf('entryCheckOffset', parseOffset(getBase(formData.entryCheckBasis), e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#5e6ad2] bg-[#EFF6FF] text-[#5e6ad2] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#EFF6FF] text-[#5e6ad2] text-[13px] font-semibold rounded border border-[#5e6ad2]/30 cursor-pointer hover:bg-[#DCEBFF]"
                            onClick={() => setEditingTimeField('entryCheck')}
                          >
                            {calcTime(getBase(formData.entryCheckBasis), formData.entryCheckOffset)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#FEF3C7] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]"><span className="text-[#EF4444] mr-0.5">*</span>进站停检</label>
                      <select value={formData.entryStopBasis} onChange={e => uf('entryStopBasis', e.target.value)}
                        className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-shrink-0 w-[120px]">
                        <option value="发点">发点 ({formData.departureTime || '--:--'})</option>
                        <option value="到点">到点 ({formData.arrivalTime || '--:--'})</option>
                      </select>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('entryStopOffset', formData.entryStopOffset - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', formData.entryStopOffset > 0 ? 'text-[#16A34A]' : formData.entryStopOffset < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {formData.entryStopOffset > 0 ? `+${formData.entryStopOffset}` : formData.entryStopOffset}
                        </span>
                        <button onClick={() => uf('entryStopOffset', formData.entryStopOffset + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'entryStop' ? (
                          <input
                            type="time"
                            value={calcTime(getBase(formData.entryStopBasis), formData.entryStopOffset)}
                            onChange={(e) => uf('entryStopOffset', parseOffset(getBase(formData.entryStopBasis), e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#D97706] bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold rounded border border-[#D97706]/30 cursor-pointer hover:bg-[#FDEAC9]"
                            onClick={() => setEditingTimeField('entryStop')}
                          >
                            {calcTime(getBase(formData.entryStopBasis), formData.entryStopOffset)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F3F4F6] rounded p-1.5 flex items-center gap-1 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]">出站开检</label>
                      <div className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[11px] bg-white flex items-center text-[#6B7280] flex-shrink-0 whitespace-nowrap">
                        发点 ({formData.departureTime || '--:--'})
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('exitCheckOffset', (formData.exitCheckOffset || 0) - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', (formData.exitCheckOffset || 0) > 0 ? 'text-[#16A34A]' : (formData.exitCheckOffset || 0) < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {(formData.exitCheckOffset || 0) > 0 ? `+${(formData.exitCheckOffset || 0)}` : (formData.exitCheckOffset || 0)}
                        </span>
                        <button onClick={() => uf('exitCheckOffset', (formData.exitCheckOffset || 0) + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'exitCheck' ? (
                          <input
                            type="time"
                            value={calcTime(formData.departureTime, formData.exitCheckOffset || 0)}
                            onChange={(e) => uf('exitCheckOffset', parseOffset(formData.departureTime, e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold rounded border border-[#D1D5DB] cursor-pointer hover:bg-[#E5E7EB]"
                            onClick={() => setEditingTimeField('exitCheck')}
                          >
                            {calcTime(formData.departureTime, formData.exitCheckOffset || 0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F3F4F6] rounded p-1.5 flex items-center gap-1 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]">出站停检</label>
                      <div className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[11px] bg-white flex items-center text-[#6B7280] flex-shrink-0 whitespace-nowrap">
                        发点 ({formData.departureTime || '--:--'})
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('exitStopOffset', (formData.exitStopOffset || 0) - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', (formData.exitStopOffset || 0) > 0 ? 'text-[#16A34A]' : (formData.exitStopOffset || 0) < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {(formData.exitStopOffset || 0) > 0 ? `+${(formData.exitStopOffset || 0)}` : (formData.exitStopOffset || 0)}
                        </span>
                        <button onClick={() => uf('exitStopOffset', (formData.exitStopOffset || 0) + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'exitStop' ? (
                          <input
                            type="time"
                            value={calcTime(formData.departureTime, formData.exitStopOffset || 0)}
                            onChange={(e) => uf('exitStopOffset', parseOffset(formData.departureTime, e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold rounded border border-[#D1D5DB] cursor-pointer hover:bg-[#E5E7EB]"
                            onClick={() => setEditingTimeField('exitStop')}
                          >
                            {calcTime(formData.departureTime, formData.exitStopOffset || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isFreightMode && (
              <div className="flex gap-2">
                <div className="w-1/2 bg-white rounded-lg border border-[#E5E7EB] p-2">
                  <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">列车信息</div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>车型</label>
                      <select value={formData.model ?? ''} onChange={e => handleModelChange(e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['CR400AF', 'CR400AF重联', 'CRH380A'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>编组</label>
                      <select value={String(formData.formation)} onChange={e => uf('formation', Number(e.target.value))}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['8', '16'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>编组方向</label>
                      <select value={formData.formationDir ?? ''} onChange={e => uf('formationDir', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['正序', '倒序'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>担当局</label>
                      <select value={formData.bureau ?? ''} onChange={e => uf('bureau', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['', '成局重段', '京局京段', '上局沪段', '广铁广段', '郑局郑段', '西局西段'].map(o => <option key={o} value={o}>{o || '请选择'}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>列车等级</label>
                      <select value={formData.trainClass ?? ''} onChange={e => uf('trainClass', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['高铁', '动车', '普速'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">地标颜色</label>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F9FAFB] text-[12px] flex items-center text-[#6B7280] cursor-not-allowed">
                          {formData.landmarkColor}
                        </div>
                        <div className={cn('w-4 h-4 rounded flex-shrink-0', getLandmarkColorClass(formData.landmarkColor))} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0 col-span-3">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">列车车底</label>
                      <input type="text" value={formData.carriages ?? ''} onChange={e => uf('carriages', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                    </div>
                  </div>
                </div>

                <div className="w-1/2 bg-white rounded-lg border border-[#E5E7EB] p-2 flex flex-col">
                  <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">检票时间</div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="bg-[#EFF6FF] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]"><span className="text-[#EF4444] mr-0.5">*</span>进站开检</label>
                      <select value={formData.entryCheckBasis} onChange={e => uf('entryCheckBasis', e.target.value)}
                        className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-shrink-0 w-[120px]">
                        <option value="发点">发点 ({formData.departureTime || '--:--'})</option>
                        <option value="到点">到点 ({formData.arrivalTime || '--:--'})</option>
                      </select>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('entryCheckOffset', formData.entryCheckOffset - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', formData.entryCheckOffset > 0 ? 'text-[#16A34A]' : formData.entryCheckOffset < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {formData.entryCheckOffset > 0 ? `+${formData.entryCheckOffset}` : formData.entryCheckOffset}
                        </span>
                        <button onClick={() => uf('entryCheckOffset', formData.entryCheckOffset + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'entryCheck' ? (
                          <input
                            type="time"
                            value={calcTime(getBase(formData.entryCheckBasis), formData.entryCheckOffset)}
                            onChange={(e) => uf('entryCheckOffset', parseOffset(getBase(formData.entryCheckBasis), e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#5e6ad2] bg-[#EFF6FF] text-[#5e6ad2] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#EFF6FF] text-[#5e6ad2] text-[13px] font-semibold rounded border border-[#5e6ad2]/30 cursor-pointer hover:bg-[#DCEBFF]"
                            onClick={() => setEditingTimeField('entryCheck')}
                          >
                            {calcTime(getBase(formData.entryCheckBasis), formData.entryCheckOffset)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#FEF3C7] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]"><span className="text-[#EF4444] mr-0.5">*</span>进站停检</label>
                      <select value={formData.entryStopBasis} onChange={e => uf('entryStopBasis', e.target.value)}
                        className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-shrink-0 w-[120px]">
                        <option value="发点">发点 ({formData.departureTime || '--:--'})</option>
                        <option value="到点">到点 ({formData.arrivalTime || '--:--'})</option>
                      </select>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('entryStopOffset', formData.entryStopOffset - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', formData.entryStopOffset > 0 ? 'text-[#16A34A]' : formData.entryStopOffset < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {formData.entryStopOffset > 0 ? `+${formData.entryStopOffset}` : formData.entryStopOffset}
                        </span>
                        <button onClick={() => uf('entryStopOffset', formData.entryStopOffset + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'entryStop' ? (
                          <input
                            type="time"
                            value={calcTime(getBase(formData.entryStopBasis), formData.entryStopOffset)}
                            onChange={(e) => uf('entryStopOffset', parseOffset(getBase(formData.entryStopBasis), e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#D97706] bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold rounded border border-[#D97706]/30 cursor-pointer hover:bg-[#FDEAC9]"
                            onClick={() => setEditingTimeField('entryStop')}
                          >
                            {calcTime(getBase(formData.entryStopBasis), formData.entryStopOffset)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F3F4F6] rounded p-1.5 flex items-center gap-1 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]">出站开检</label>
                      <div className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[11px] bg-white flex items-center text-[#6B7280] flex-shrink-0 whitespace-nowrap">
                        发点 ({formData.departureTime || '--:--'})
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('exitCheckOffset', (formData.exitCheckOffset || 0) - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', (formData.exitCheckOffset || 0) > 0 ? 'text-[#16A34A]' : (formData.exitCheckOffset || 0) < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {(formData.exitCheckOffset || 0) > 0 ? `+${(formData.exitCheckOffset || 0)}` : (formData.exitCheckOffset || 0)}
                        </span>
                        <button onClick={() => uf('exitCheckOffset', (formData.exitCheckOffset || 0) + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'exitCheck' ? (
                          <input
                            type="time"
                            value={calcTime(formData.departureTime, formData.exitCheckOffset || 0)}
                            onChange={(e) => uf('exitCheckOffset', parseOffset(formData.departureTime, e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold rounded border border-[#D1D5DB] cursor-pointer hover:bg-[#E5E7EB]"
                            onClick={() => setEditingTimeField('exitCheck')}
                          >
                            {calcTime(formData.departureTime, formData.exitCheckOffset || 0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F3F4F6] rounded p-1.5 flex items-center gap-1 flex-1 min-h-0">
                      <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]">出站停检</label>
                      <div className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[11px] bg-white flex items-center text-[#6B7280] flex-shrink-0 whitespace-nowrap">
                        发点 ({formData.departureTime || '--:--'})
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => uf('exitStopOffset', (formData.exitStopOffset || 0) - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                        <span className={cn('w-6 text-center text-[11px] font-medium', (formData.exitStopOffset || 0) > 0 ? 'text-[#16A34A]' : (formData.exitStopOffset || 0) < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                          {(formData.exitStopOffset || 0) > 0 ? `+${(formData.exitStopOffset || 0)}` : (formData.exitStopOffset || 0)}
                        </span>
                        <button onClick={() => uf('exitStopOffset', (formData.exitStopOffset || 0) + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        {editingTimeField === 'exitStop' ? (
                          <input
                            type="time"
                            value={calcTime(formData.departureTime, formData.exitStopOffset || 0)}
                            onChange={(e) => uf('exitStopOffset', parseOffset(formData.departureTime, e.target.value))}
                            onBlur={() => setEditingTimeField(null)}
                            autoFocus
                            className="h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold focus:outline-none w-[100px] text-center"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-6 px-2 bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold rounded border border-[#D1D5DB] cursor-pointer hover:bg-[#E5E7EB]"
                            onClick={() => setEditingTimeField('exitStop')}
                          >
                            {calcTime(formData.departureTime, formData.exitStopOffset || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isFreightMode && (
              <>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
              <div className={cn('text-[12px] font-bold px-1.5 py-0.5 rounded mb-1', isFreightMode ? 'text-[#D97706] bg-[#FEF3C7]' : 'text-[#5e6ad2] bg-[#EFF6FF]')}>运行规律</div>
              <div className="flex gap-2">
                <div className="w-[220px] flex-shrink-0">
                  <div className="grid grid-cols-1 gap-y-1">
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>运行类型</label>
                      <select value={formData.cycle === 1 ? '每日开行' : formData.cycle === 2 ? '隔日开行' : '规律开行'}
                        onChange={e => {
                          const value = e.target.value
                          if (value === '每日开行') { uf('cycle', 1); uf('rule', 0b1111111) }
                          else if (value === '隔日开行') { uf('cycle', 2); uf('rule', 0b0101010) }
                          else { uf('cycle', 0); uf('rule', 0b1111100) }
                        }}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['每日开行', '隔日开行', '规律开行'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    {formData.cycle === 2 && (
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5">起算基准</label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="alternateStartOffset"
                              checked={(formData.alternateStartOffset ?? 0) === 0}
                              onChange={() => uf('alternateStartOffset', 0)}
                              className="w-3 h-3 text-[#5e6ad2] accent-[#5e6ad2]"
                            />
                            <span className="text-[11px] text-[#374151]">从起始日</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="alternateStartOffset"
                              checked={(formData.alternateStartOffset ?? 0) === 1}
                              onChange={() => uf('alternateStartOffset', 1)}
                              className="w-3 h-3 text-[#5e6ad2] accent-[#5e6ad2]"
                            />
                            <span className="text-[11px] text-[#374151]">从次日</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {formData.cycle === 0 && (
                      <div className="flex flex-col gap-0">
                        <label className="text-[11px] font-medium text-[#6B7280] mb-0.5">按周规律</label>
                        <div className="grid grid-cols-7 gap-0.5">
                          {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => {
                            const bit = idx
                            const dayBit = 1 << bit
                            const isChecked = ((formData.rule ?? 0) & dayBit) !== 0
                            return (
                              <button
                                key={day}
                                onClick={() => {
                                  const newRule = isChecked
                                    ? (formData.rule ?? 0) & ~dayBit
                                    : (formData.rule ?? 0) | dayBit
                                  uf('rule', newRule)
                                }}
                                className={cn(
                                  'h-6 text-[10px] rounded border transition-colors',
                                  isChecked ? 'bg-[#5e6ad2] text-white border-[#5e6ad2]' : 'bg-white text-[#6B7280] border-[#D1D5DB] hover:bg-[#F3F4F6]'
                                )}
                              >
                                {day}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">起始有效期</label>
                      <input type="date" value={formData.validStart ?? ''} onChange={e => uf('validStart', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">终止有效期</label>
                      <input type="date" value={formData.validEnd ?? ''} onChange={e => uf('validEnd', e.target.value)}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-[#F9FAFB] rounded border border-[#E5E7EB] p-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-0.5 hover:bg-[#E5E7EB] rounded">
                        <ChevronLeft className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                      <span className="text-[11px] font-medium text-[#111827]">
                        {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                      </span>
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-0.5 hover:bg-[#E5E7EB] rounded">
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                      {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                        <div key={day} className="text-[10px] text-[#9CA3AF] text-center py-0.5">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {renderCalendar().map((day, index) => {
                        const highlightStatus = isDayHighlighted(day)
                        const today = new Date()
                        const isToday = day !== null &&
                          today.getFullYear() === currentDate.getFullYear() &&
                          today.getMonth() === currentDate.getMonth() &&
                          today.getDate() === day
                        return (
                          <div
                            key={index}
                            className={cn(
                              'h-7 flex items-center justify-center text-[11px] rounded cursor-pointer relative',
                              day === null ? 'bg-transparent' : '',
                              highlightStatus === 'active' && 'bg-[#5e6ad2] text-white',
                              highlightStatus === 'inactive' && 'bg-[#E5E7EB] text-[#9CA3AF] line-through',
                              highlightStatus === 'none' && 'bg-white text-[#111827] hover:bg-[#F3F4F6]',
                              isToday && 'ring-2 ring-[#F59E0B] ring-offset-1'
                            )}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
              <div className="text-[12px] font-bold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded mb-1">其他信息</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">闸机始发</label>
                  <input type="text" value={formData.gateFromStation ?? ''} onChange={e => uf('gateFromStation', e.target.value)}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" placeholder="请输入" />
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">闸机终到</label>
                  <input type="text" value={formData.gateToStation ?? ''} onChange={e => uf('gateToStation', e.target.value)}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" placeholder="请输入" />
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">始发时间</label>
                  <input type="time" value={formData.startTime ?? ''} onChange={e => uf('startTime', e.target.value)}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">终到时间</label>
                  <input type="time" value={formData.endTime ?? ''} onChange={e => uf('endTime', e.target.value)}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">广播模板</label>
                  <select value={formData.broadcastGroup ?? ''} onChange={e => uf('broadcastGroup', e.target.value)}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                    <option value="">请选择</option>
                    <option value="normal">正常广播</option>
                    <option value="express">快速广播</option>
                    <option value="delay">晚点广播</option>
                  </select>
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">基本图号</label>
                  <input type="text" value={formData.diagramNo ?? ''} onChange={e => uf('diagramNo', e.target.value)}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" placeholder="请输入" />
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">到站天数</label>
                  <input type="number" value={formData.fromStationDays ?? ''} onChange={e => uf('fromStationDays', Number(e.target.value))}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" placeholder="0" min="0" max="3" />
                </div>
                <div className="flex flex-col gap-0">
                  <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">终到天数</label>
                  <input type="number" value={formData.toStationDays ?? ''} onChange={e => uf('toStationDays', Number(e.target.value))}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" placeholder="0" min="0" max="3" />
                </div>
              </div>
            </div>

            </>
            )}

          </div>

          {!isFreightMode && (
            <div className="w-60 overflow-y-auto border-l border-[#E5E7EB] bg-white flex-shrink-0">
              <div className="p-1.5 space-y-1.5">
                <div className="bg-[#F9FAFB] rounded-lg p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-medium text-[#6B7280]">股道</label>
                      <select value={formData.track} onChange={e => handleTrackChange(e.target.value)}
                        className="h-8 px-2 rounded-md border border-[#D1D5DB] text-[12px] font-bold text-[#5e6ad2] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((v: any) => <option key={v} value={v}>{v || '请选择'}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-medium text-[#6B7280]">站台</label>
                      <select value={formData.platform} onChange={e => uf('platform', e.target.value)}
                        className="h-8 px-2 rounded-md border border-[#D1D5DB] text-[12px] font-bold text-[#374151] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                        {['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((v: any) => <option key={v} value={v}>{v || '请选择'}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] rounded-lg p-2 border border-[#E5E7EB]">
                  <h3 className="text-[11px] font-bold text-[#111827] mb-1">检票口</h3>
                  <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                    {['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'].map(g => (
                      <label key={g} className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={chk(formData.gates, g)} onChange={e => uf('gates', toggleChk(formData.gates, g, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                        <span className="text-[11px] text-[#374151]">{g}</span>
                      </label>
                    ))}
                    {['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'].map(g => (
                      <label key={g} className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={chk(formData.gates, g)} onChange={e => uf('gates', toggleChk(formData.gates, g, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                        <span className="text-[11px] text-[#374151]">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F9FAFB] rounded-lg p-2 border border-[#E5E7EB]">
                  <h3 className="text-[11px] font-bold text-[#111827] mb-1">候车室</h3>
                  {['候车大厅', '商务候车室'].map(r => (
                    <label key={r} className="flex items-center gap-1 cursor-pointer mb-0.5">
                      <input type="checkbox" checked={chk(formData.waitingRoom, r)} onChange={e => uf('waitingRoom', toggleChk(formData.waitingRoom, r, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                      <span className="text-[11px] text-[#374151]">{r}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-[#F9FAFB] rounded-lg p-2 border border-[#E5E7EB]">
                  <h3 className="text-[11px] font-bold text-[#111827] mb-1">出站口</h3>
                  {['渝厦场南侧出站口', '渝厦场北侧出站口', '东场南侧出站口'].map(g => (
                    <label key={g} className="flex items-center gap-1 cursor-pointer mb-0.5">
                      <input type="checkbox" checked={chk(formData.exitGate, g)} onChange={e => uf('exitGate', toggleChk(formData.exitGate, g, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                      <span className="text-[11px] text-[#374151]">{g}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-[#FEF3C7] rounded-lg p-2 border border-[#D97706]/50">
                  <h3 className="text-[11px] font-bold text-[#D97706] mb-1">⚙️ 作业配置</h3>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 p-1.5 bg-white rounded cursor-pointer hover:bg-[#F9F9F9]">
                      <input type="checkbox" checked={formData.hasWater ?? false} onChange={e => uf('hasWater', e.target.checked)}
                        className="w-3 h-3 rounded border-[#5e6ad2] text-[#5e6ad2] accent-[#5e6ad2]" />
                      <span className="text-[11px] font-medium text-[#374151] flex-1">上水作业</span>
                      <span className={cn('text-[9px] px-1 py-0.5 rounded', formData.hasWater ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
                        {formData.hasWater ? '需要' : '不需要'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-white rounded cursor-pointer hover:bg-[#F9F9F9]">
                      <input type="checkbox" checked={formData.hasSuction ?? false} onChange={e => uf('hasSuction', e.target.checked)}
                        className="w-3 h-3 rounded border-[#D97706] text-[#D97706] accent-[#D97706]" />
                      <span className="text-[11px] font-medium text-[#374151] flex-1">吸污作业</span>
                      <span className={cn('text-[9px] px-1 py-0.5 rounded', formData.hasSuction ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
                        {formData.hasSuction ? '需要' : '不需要'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={cancelResetConfirm} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#111827]">关键字段已修改</h3>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">将重置同步状态，请确认</p>
                </div>
                <button onClick={cancelResetConfirm} className="ml-auto p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                  <XCircle className="w-5 h-5 text-[#9CA3AF]" />
                </button>
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4">
                <p className="text-[13px] text-[#6B7280] mb-3">以下字段的修改将导致模板被标记为「未同步」：</p>
                <div className="space-y-1.5">
                  {changedFields.map((change, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[13px]">
                      <span className="text-[#374151]">{FIELD_DISPLAY_NAMES[change.field] || change.field}</span>
                      <span className="text-[#6B7280]">{String(change.oldVal || '--')} → <span className="text-[#5e6ad2] font-medium">{String(change.newVal || '--')}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[13px] text-[#6B7280] mb-4">保存后需重新执行同步操作，目标系统数据才会更新。</p>

              <div className="flex items-center justify-end gap-3">
                <button onClick={cancelResetConfirm} className="px-4 py-2 bg-white border border-[#D1D5DB] text-[#6B7280] rounded-lg text-[13px] font-medium hover:bg-[#F3F4F6] transition-colors">取消修改</button>
                <button onClick={confirmSaveWithReset} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-[13px] font-medium hover:bg-[#D97706] transition-colors shadow-sm">确认保存并重置同步</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}