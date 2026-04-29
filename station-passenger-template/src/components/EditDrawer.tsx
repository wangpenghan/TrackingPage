import { useState, useEffect } from 'react'
import { X, Plus, Minus, Train, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TemplateData } from '@/types'

interface EditDrawerProps {
  isOpen: boolean
  onClose: () => void
  template?: TemplateData
  onSave: (data: TemplateData) => void
}

const initialData: TemplateData = {
  id: '', trainNo: '', arrivalTrainNo: '', departureTrainNo: '', connectingTrain: '',
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

const checkTemplates = [
  { name: '默认模板', entryCheckBasis: '发点', entryCheckOffset: -25, entryStopBasis: '发点', entryStopOffset: -5, exitCheckOffset: 0, exitStopOffset: 0 },
  { name: '始发模板', entryCheckBasis: '发点', entryCheckOffset: -30, entryStopBasis: '发点', entryStopOffset: -5, exitCheckOffset: 0, exitStopOffset: 0 },
  { name: '途径模板', entryCheckBasis: '到点', entryCheckOffset: -10, entryStopBasis: '发点', entryStopOffset: -3, exitCheckOffset: 5, exitStopOffset: 10 },
  { name: '终到模板', entryCheckBasis: '到点', entryCheckOffset: -5, entryStopBasis: '到点', entryStopOffset: 0, exitCheckOffset: 2, exitStopOffset: 10 },
]

export function EditDrawer({ isOpen, onClose, template, onSave }: EditDrawerProps) {
  const [formData, setFormData] = useState<TemplateData>(template || initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [editingTimeField, setEditingTimeField] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const parseOffset = (baseTime: string, targetTime: string): number => {
    if (!baseTime || !targetTime) return 0
    const [baseH, baseM] = baseTime.split(':').map(Number)
    const [targetH, targetM] = targetTime.split(':').map(Number)
    return (targetH - baseH) * 60 + (targetM - baseM)
  }

  useEffect(() => { if (template) { setFormData({ ...template }); setIsDirty(false) } }, [template?.id])

  const uf = (f: keyof TemplateData, v: any) => { setFormData(p => ({ ...p, [f]: v })); setIsDirty(true) }

  const handleModelChange = (v: any) => {
    uf('model', v)
    uf('formation', v.includes('重联') ? 16 : 8)
  }

  const handleTrackChange = (v: any) => { uf('track', v); uf('platform', v) }

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

  const handleSave = () => { onSave(formData); onClose() }

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

  const applyCheckTemplate = (templateName: string) => {
    const tpl = checkTemplates.find(t => t.name === templateName)
    if (tpl) {
      uf('entryCheckBasis', tpl.entryCheckBasis)
      uf('entryCheckOffset', tpl.entryCheckOffset)
      uf('entryStopBasis', tpl.entryStopBasis)
      uf('entryStopOffset', tpl.entryStopOffset)
      uf('exitCheckOffset', tpl.exitCheckOffset)
      uf('exitStopOffset', tpl.exitStopOffset)
    }
  }

  const handleSaveAsTemplate = () => {
    if (newTemplateName.trim()) {
      setShowSaveTemplate(false)
      setNewTemplateName('')
    }
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

  // 月历组件相关函数
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

    // 空白天数
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // 月份天数
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const isDayHighlighted = (day: number | null) => {
    if (day === null) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayOfWeek = date.getDay() // 0=周日, 1=周一, ..., 6=周六
    return (formData.rule! & (1 << (dayOfWeek === 0 ? 6 : dayOfWeek - 1))) !== 0
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[1200px] bg-[#F9FAFB] shadow-2xl flex flex-col h-full overflow-hidden rounded-l-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-[#5e6ad2]" />
              <h2 className="text-[15px] font-bold text-[#111827]">编辑客运模板</h2>
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
            <button onClick={handleSave} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-[13px] font-medium hover:bg-[#0DA071] transition-colors shadow-sm">确认信息</button>
            <button onClick={onClose} className="px-4 py-2 bg-white text-[#6B7280] rounded-lg text-[13px] font-medium border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors">关闭</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left form grid */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">

            {/* Row 1: 车次信息 + 列车信息 */}
            <div className="flex gap-2">
              {/* 车次信息 - 左50% */}
              <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-2">
                <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">车次信息</div>
                {/* 出发车次 - 突出显示 */}
                <div className="mb-1">
                  <label className="text-[11px] font-medium text-[#6B7280] block mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>出发车次</label>
                  <input value={formData.trainNo} onChange={e => uf('trainNo', e.target.value)} placeholder="请输入车次号"
                    className="h-8 px-2 rounded-md border-2 border-[#5e6ad2] text-[16px] font-bold text-[#111827] bg-[#FAFBFF] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/20 w-full" />
                </div>
                {/* Grid */}
                <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                  <div className="flex flex-col gap-0">
                    <label className={cn("text-[11px] font-medium mb-0.5",
                      formData.trainType === '始发' ? 'text-[#3B82F6]' :
                      formData.trainType === '途径' ? 'text-[#F59E0B]' :
                      formData.trainType === '终到' ? 'text-[#10B981]' : 'text-[#6B7280]'
                    )}>
                      <span className="text-[#EF4444] mr-0.5">*</span>列车类型
                    </label>
                    <select value={formData.trainType ?? ''} onChange={e => uf('trainType', e.target.value)}
                      className={cn("h-6 px-2 rounded-md border text-[12px] bg-white focus:outline-none focus:ring-1 w-full",
                        formData.trainType === '始发' ? 'border-[#3B82F6] text-[#3B82F6] focus:border-[#3B82F6] focus:ring-[#3B82F6]/20' :
                        formData.trainType === '途径' ? 'border-[#F59E0B] text-[#F59E0B] focus:border-[#F59E0B] focus:ring-[#F59E0B]/20' :
                        formData.trainType === '终到' ? 'border-[#10B981] text-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20' :
                        'border-[#D1D5DB] text-[#6B7280] focus:border-[#5e6ad2] focus:ring-[#5e6ad2]/20'
                      )}>
                      {['始发', '途径', '终到'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>始发站</label>
                    <input type="text" value={formData.fromStation ?? ''} onChange={e => uf('fromStation', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>终到站</label>
                    <input type="text" value={formData.toStation ?? ''} onChange={e => uf('toStation', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>到达车次</label>
                    <input type="text" value={formData.arrivalTrainNo ?? ''} onChange={e => uf('arrivalTrainNo', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>始发车次</label>
                    <input type="text" value={formData.departureTrainNo ?? ''} onChange={e => uf('departureTrainNo', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5">接续车次</label>
                    <input type="text" value={formData.connectingTrain ?? ''} onChange={e => uf('connectingTrain', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                </div>
              </div>

              {/* 列车信息 - 右50% */}
              <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-2">
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
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>停车位</label>
                    <select value={formData.parkingSpot ?? ''} onChange={e => handleParkingSpotChange(e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
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
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">地标颜色</label>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F9FAFB] text-[12px] flex items-center text-[#6B7280] cursor-not-allowed">
                        {formData.landmarkColor}
                      </div>
                      <div className={cn('w-4 h-4 rounded flex-shrink-0', getLandmarkColorClass(formData.landmarkColor))} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#6B7280] mb-0.5"><span className="text-[#EF4444] mr-0.5">*</span>担当局</label>
                    <select value={formData.bureau ?? ''} onChange={e => uf('bureau', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full">
                      {['', '成局重段', '京局京段', '上局沪段', '广铁广段', '郑局郑段', '西局西段', '沈局沈段', '哈局哈段', '济局济段', '昆局昆段'].map(o => <option key={o} value={o}>{o || '请选择'}</option>)}
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
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">列车车底</label>
                    <input type="text" value={formData.carriages ?? ''} onChange={e => uf('carriages', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: 检票时间 + 有效期与设置 */}
            <div className="flex gap-2">
              {/* 检票时间 - 左50% */}
              <div className="w-1/2 bg-white rounded-lg border border-[#E5E7EB] p-2 flex flex-col">
                <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">检票时间</div>

                {/* 模板选择 */}
                <div className="flex items-center gap-1.5 mb-1">
                  <select value={selectedTemplate} onChange={(e) => { setSelectedTemplate(e.target.value); applyCheckTemplate(e.target.value) }}
                    className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-1">
                    <option value="">选择检票模板</option>
                    {checkTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                  <button onClick={() => setShowSaveTemplate(true)} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded text-[11px] hover:bg-[#E5E7EB] whitespace-nowrap">
                    另存为
                  </button>
                </div>

                {/* 4行时间设置 - 等分高度填充 */}
                <div className="flex flex-col gap-1 flex-1">
                  {/* 进站开检 */}
                  <div className="bg-[#EFF6FF] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0 overflow-visible">
                    <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]"><span className="text-[#EF4444] mr-0.5">*</span>进站开检</label>
                    <select value={formData.entryCheckBasis} onChange={e => uf('entryCheckBasis', e.target.value)}
                      className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-shrink-0 w-[90px]">
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
                          onChange={(e) => {
                            const newOffset = parseOffset(getBase(formData.entryCheckBasis), e.target.value)
                            uf('entryCheckOffset', newOffset)
                          }}
                          onBlur={() => setEditingTimeField(null)}
                          autoFocus
                          className="h-6 px-2 rounded-md border border-[#5e6ad2] bg-[#EFF6FF] text-[#5e6ad2] text-[13px] font-semibold focus:outline-none w-[80px] text-center"
                        />
                      ) : (
                        <span
                          className="inline-flex items-center justify-center h-6 px-2 bg-[#EFF6FF] text-[#5e6ad2] text-[13px] font-semibold rounded border border-[#5e6ad2]/30 cursor-pointer hover:bg-[#DCEBFF] whitespace-nowrap"
                          onClick={() => setEditingTimeField('entryCheck')}
                        >
                          {calcTime(getBase(formData.entryCheckBasis), formData.entryCheckOffset)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 进站停检 */}
                  <div className="bg-[#FEF3C7] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0 overflow-visible">
                    <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]"><span className="text-[#EF4444] mr-0.5">*</span>进站停检</label>
                    <select value={formData.entryStopBasis} onChange={e => uf('entryStopBasis', e.target.value)}
                      className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 flex-shrink-0 w-[90px]">
                      <option value="发点">发点 ({formData.departureTime || '--:--'})</option>
                      <option value="到点">到点 ({formData.arrivalTime || '--:--'})</option>
                    </select>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => uf('entryStopOffset', formData.entryStopOffset - 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Minus className="w-2 h-2" /></button>
                      <span className={cn('w-6 text-center text-[11px] font-medium', formData.entryStopOffset > 0 ? 'text-[#16A34A]' : formData.entryStopOffset < 0 ? 'text-[#DC2626]' : 'text-[#374151]')}>
                        {formData.entryStopOffset > 0 ? `+${formData.entryStopOffset}` : formData.entryStopOffset}
                      </span>
                      <button onClick={() => uf('entryStopOffset', formData.entryStopOffset + 1)} className="w-4 h-4 flex items-center justify-center rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#6B7280]"><Plus className="w-2 h-2" /></button>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      {editingTimeField === 'entryStop' ? (
                        <input
                          type="time"
                          value={calcTime(getBase(formData.entryStopBasis), formData.entryStopOffset)}
                          onChange={(e) => {
                            const newOffset = parseOffset(getBase(formData.entryStopBasis), e.target.value)
                            uf('entryStopOffset', newOffset)
                          }}
                          onBlur={() => setEditingTimeField(null)}
                          autoFocus
                          className="h-6 px-2 rounded-md border border-[#D97706] bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold focus:outline-none w-[80px] text-center"
                        />
                      ) : (
                        <span
                          className="inline-flex items-center justify-center h-6 px-2 bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold rounded border border-[#D97706]/30 cursor-pointer hover:bg-[#FDEAC9] whitespace-nowrap"
                          onClick={() => setEditingTimeField('entryStop')}
                        >
                          {calcTime(getBase(formData.entryStopBasis), formData.entryStopOffset)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 出站开检 */}
                  <div className="bg-[#F3F4F6] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0 overflow-visible">
                    <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]">出站开检</label>
                    <div className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[11px] bg-white flex items-center text-[#6B7280] flex-shrink-0 w-[95px] truncate">
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
                          onChange={(e) => {
                            const newOffset = parseOffset(formData.departureTime, e.target.value)
                            uf('exitCheckOffset', newOffset)
                          }}
                          onBlur={() => setEditingTimeField(null)}
                          autoFocus
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold focus:outline-none w-[80px] text-center"
                        />
                      ) : (
                        <span
                          className="inline-flex items-center justify-center h-6 px-2 bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold rounded border border-[#D1D5DB] cursor-pointer hover:bg-[#E5E7EB] whitespace-nowrap"
                          onClick={() => setEditingTimeField('exitCheck')}
                        >
                          {calcTime(formData.departureTime, formData.exitCheckOffset || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 出站停检 */}
                  <div className="bg-[#F3F4F6] rounded p-1.5 flex items-center gap-1.5 flex-1 min-h-0 overflow-visible">
                    <label className="text-[11px] font-medium text-[#6B7280] flex-shrink-0 w-[56px]">出站停检</label>
                    <div className="h-6 px-1.5 rounded-md border border-[#D1D5DB] text-[11px] bg-white flex items-center text-[#6B7280] flex-shrink-0 w-[95px] truncate">
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
                          onChange={(e) => {
                            const newOffset = parseOffset(formData.departureTime, e.target.value)
                            uf('exitStopOffset', newOffset)
                          }}
                          onBlur={() => setEditingTimeField(null)}
                          autoFocus
                          className="h-6 px-2 rounded-md border border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold focus:outline-none w-[80px] text-center"
                        />
                      ) : (
                        <span
                          className="inline-flex items-center justify-center h-6 px-2 bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold rounded border border-[#D1D5DB] cursor-pointer hover:bg-[#E5E7EB] whitespace-nowrap"
                          onClick={() => setEditingTimeField('exitStop')}
                        >
                          {calcTime(formData.departureTime, formData.exitStopOffset || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 其他信息 */}
              <div className="w-1/2 bg-white rounded-lg border border-[#E5E7EB] p-2">
                <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">其他信息</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">闸机始发</label>
                    <input type="text" value={formData.gateFromStation ?? ''} onChange={e => uf('gateFromStation', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">闸机终到</label>
                    <input type="text" value={formData.gateToStation ?? ''} onChange={e => uf('gateToStation', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
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
                      {['', '分组1', '分组2', '分组3'].map(o => <option key={o} value={o}>{o || '请选择'}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">基本图号</label>
                    <input type="text" value={formData.diagramNo ?? ''} onChange={e => uf('diagramNo', e.target.value)}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">到站天数</label>
                    <input type="number" value={formData.fromStationDays ?? ''} onChange={e => uf('fromStationDays', Number(e.target.value))}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">终到天数</label>
                    <input type="number" value={formData.toStationDays ?? ''} onChange={e => uf('toStationDays', Number(e.target.value))}
                      className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: 运行规律 - 全宽 */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
              <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">运行规律</div>
              <div className="flex gap-2">
                {/* 左侧控制 */}
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
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">运行周期</label>
                      <input type="number" value={formData.cycle ?? ''} onChange={e => uf('cycle', Number(e.target.value))}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">运行规律</label>
                      <input type="number" value={formData.rule ?? ''} onChange={e => uf('rule', Number(e.target.value))}
                        className="h-6 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full" />
                    </div>
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
                {/* 右侧月历 */}
                <div className="flex-1">
                  <div className="bg-[#F9FAFB] rounded border border-[#E5E7EB] p-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <button onClick={handlePrevMonth} className="p-0.5 hover:bg-[#E5E7EB] rounded">
                        <ChevronLeft className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                      <span className="text-[11px] font-medium text-[#111827]">
                        {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                      </span>
                      <button onClick={handleNextMonth} className="p-0.5 hover:bg-[#E5E7EB] rounded">
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
                      {renderCalendar().map((day, index) => (
                        <div
                          key={index}
                          className={cn(
                            'h-7 flex items-center justify-center text-[11px] rounded cursor-pointer',
                            day === null ? 'bg-transparent' : isDayHighlighted(day) ? 'bg-[#5e6ad2] text-white' : 'bg-white text-[#111827] hover:bg-[#F3F4F6]'
                          )}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right sidebar w-72 */}
          <div className="w-72 overflow-y-auto border-l border-[#E5E7EB] bg-white flex-shrink-0">
            <div className="p-1.5 space-y-1.5">
              <div className="bg-[#F9FAFB] rounded-lg p-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-[#9CA3AF] block mb-0.5">股道</label>
                    <select value={formData.track} onChange={e => handleTrackChange(e.target.value)}
                      className="w-full px-2 rounded-md border border-[#D1D5DB] bg-white text-[24px] font-bold text-[#5e6ad2] h-9 text-center focus:outline-none focus:border-[#5e6ad2]">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((v: any) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[#9CA3AF] block mb-0.5">站台</label>
                    <select value={formData.platform} onChange={e => uf('platform', e.target.value)}
                      className="w-full px-2 rounded-md border border-[#D1D5DB] bg-white text-[18px] font-bold text-[#374151] h-9 text-center focus:outline-none focus:border-[#5e6ad2]">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((v: any) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="h-px bg-[#E5E7EB]" />
              <div>
                <h3 className="text-[11px] font-bold text-[#111827] mb-1">检票口</h3>
                <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                  {['1A', '2A_3A', '4A_5A', '6A_7A', '8A_9A', '10A_11A', '12A_13A', '14A_15A', '16A_17A', '18A_19A', '20A_21A', '22A_23A', '24A_25A', '26A_27A', '28A_29A'].map(g => (
                    <label key={g} className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={chk(formData.gates, g)} onChange={e => uf('gates', toggleChk(formData.gates, g, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                      <span className="text-[11px] text-[#374151]">{g}</span>
                    </label>
                  ))}
                  {['1B', '2B_3B', '4B_5B', '6B_7B', '8B_9B', '10B_11B', '12B_13B', '14B_15B', '16B_17B', '18B_19B', '20B_21B', '22B_23B', '24B_25B', '26B_27B', '28B_29B'].map(g => (
                    <label key={g} className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={chk(formData.gates, g)} onChange={e => uf('gates', toggleChk(formData.gates, g, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                      <span className="text-[11px] text-[#374151]">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="h-px bg-[#E5E7EB]" />
              <div>
                <h3 className="text-[11px] font-bold text-[#111827] mb-1">候车室</h3>
                {['候车大厅', '商务候车室'].map(r => (
                  <label key={r} className="flex items-center gap-1 cursor-pointer mb-0.5">
                    <input type="checkbox" checked={chk(formData.waitingRoom, r)} onChange={e => uf('waitingRoom', toggleChk(formData.waitingRoom, r, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                    <span className="text-[11px] text-[#374151]">{r}</span>
                  </label>
                ))}
              </div>
              <div className="h-px bg-[#E5E7EB]" />
              <div>
                <h3 className="text-[11px] font-bold text-[#111827] mb-1">出站口</h3>
                {['渝厦场南侧出站口', '渝万场南侧出站口', '东环场南侧出站口', '渝厦场北侧出站口', '渝万场北侧出站口', '东环场北侧出站口'].map(g => (
                  <label key={g} className="flex items-center gap-1 cursor-pointer mb-0.5">
                    <input type="checkbox" checked={chk(formData.exitGate, g)} onChange={e => uf('exitGate', toggleChk(formData.exitGate, g, e.target.checked))} className="w-3 h-3 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
                    <span className="text-[11px] text-[#374151]">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* 另存为新模板弹窗 */}
        {showSaveTemplate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowSaveTemplate(false)} />
            <div className="relative bg-white rounded-lg shadow-xl p-4 w-[350px]">
              <h3 className="text-[14px] font-bold text-[#111827] mb-3">另存为新模板</h3>
              <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="请输入模板名称"
                className="h-9 px-3 rounded-md border border-[#D1D5DB] text-[13px] bg-white focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/20 w-full mb-4" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSaveTemplate(false)} className="px-4 py-2 bg-white text-[#6B7280] rounded text-[13px] border border-[#E5E7EB] hover:bg-[#F3F4F6]">取消</button>
                <button onClick={handleSaveAsTemplate} className="px-4 py-2 bg-[#5e6ad2] text-white rounded text-[13px] hover:bg-[#4F5AC0]">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}