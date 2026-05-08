import { X } from 'lucide-react'
import { cn } from '../lib/utils'
import { tagVariants, landmarkTagVariants } from './ui/variants'
import type { TemplateData } from '../types'

interface DetailViewProps {
  isOpen: boolean
  onClose: () => void
  template?: TemplateData
  onEdit: (template: TemplateData) => void
}

export function DetailView({ isOpen, onClose, template, onEdit }: DetailViewProps) {
  if (!isOpen || !template) return null

  const statusClass = getTemplateStatus(template)
  const statusLabel = getStatusLabel(template)

  const calcEntryCheck = calculateTime(template.departureTime, template.entryCheckOffset)
  const calcEntryStop = calculateTime(template.departureTime, template.entryStopOffset)
  const calcExitCheck = template.exitCheckOffset != null
    ? calculateTime(template.exitBasis === '发点' ? template.departureTime : template.arrivalTime, template.exitCheckOffset)
    : '-'
  const calcExitStop = template.exitStopOffset != null
    ? calculateTime(template.exitBasis === '发点' ? template.departureTime : template.arrivalTime, template.exitStopOffset)
    : '-'

  const identityFields = [
    { label: '出发车次', value: template.trainNo },
    { label: '到达车次', value: template.arrivalTrainNo || '-' },
    { label: '始发车次', value: template.departureTrainNo || '-' },
    { label: '接续车次', value: template.connectingTrain || '-' },
    { label: '列车类型', value: template.trainType },
  ]

  const timeFields = [
    { label: '到达时间', value: template.arrivalTime },
    { label: '发车时间', value: template.departureTime },
    { label: '始发时间', value: template.startTime || '-' },
    { label: '终到时间', value: template.endTime || '-' },
    { label: '站停时间', value: `${template.stopDuration} 分钟` },
  ]

  const spaceFields = [
    { label: '站台', value: template.platform },
    { label: '股道', value: template.track },
    { label: '停车位', value: template.parkingSpot },
    { label: '进站方向', value: template.entryDirection },
    { label: '出站方向', value: template.exitDirection },
  ]

  const checkFields = [
    { label: '进站开检基准', value: template.entryCheckBasis },
    { label: '进站开检偏移', value: `${template.entryCheckOffset} 分钟` },
    { label: '进站停检基准', value: template.entryStopBasis },
    { label: '进站停检偏移', value: `${template.entryStopOffset} 分钟` },
    { label: '出站基准', value: template.exitBasis },
    { label: '出站开检偏移', value: template.exitCheckOffset != null ? `${template.exitCheckOffset} 分钟` : '-' },
    { label: '出站停检偏移', value: template.exitStopOffset != null ? `${template.exitStopOffset} 分钟` : '-' },
    { label: '计算开检时间', value: calcEntryCheck },
    { label: '计算停检时间', value: calcEntryStop },
    { label: '计算出站开检', value: calcExitCheck },
    { label: '计算出站停检', value: calcExitStop },
  ]

  const formationFields = [
    { label: '列车编组', value: `${template.formation} 辆` },
    { label: '编组方向', value: template.formationDir },
    { label: '列车车型', value: template.model },
    { label: '车厢号', value: template.carriages || '-' },
    { label: '地标颜色', value: template.landmarkColor },
  ]

  const facilityFields = [
    { label: '检票口', value: template.gates },
    { label: '候车室', value: template.waitingRoom },
    { label: '出站口', value: template.exitGate },
  ]

  const routeFields = [
    { label: '车站', value: template.station },
    { label: '始发站', value: template.fromStation },
    { label: '终到站', value: template.toStation },
    { label: '闸机始发站', value: template.gateFromStation || template.fromStation },
    { label: '闸机终到站', value: template.gateToStation || template.toStation },
  ]

  const runFields = [
    { label: '运行周期', value: template.cycle != null ? `${template.cycle}` : '-' },
    { label: '运行规律', value: template.rule != null ? `${template.rule}` : '-' },
    { label: '基本图号', value: template.diagramNo || '-' },
    { label: '车次模式', value: template.trainNoMode || '自动' },
    { label: '列车等级', value: template.trainClass || '-' },
  ]

  const attrFields = [
    { label: '担当局', value: template.bureau || '-' },
    { label: '列车定员', value: template.capacity != null ? `${template.capacity} 人` : '-' },
    { label: '广播分组', value: template.broadcastGroup || '-' },
  ]

  const validityFields = [
    { label: '起始有效期', value: template.validStart },
    { label: '终止有效期', value: template.validEnd },
    { label: '是否有效', value: template.isValid ? '有效' : '无效' },
  ]

  const statusFields = [
    { label: '状态标识', value: template.statusFlag },
    { label: '确认状态', value: template.confirmed ? '已确认' : '未确认' },
    { label: '同步状态', value: template.synced ? '已同步' : '未同步' },
    { label: '操作人员', value: template.operator || '-' },
    { label: '操作时间', value: template.operateTime || '-' },
    { label: '始发站天数', value: template.fromStationDays != null ? `${template.fromStationDays} 天` : '-' },
    { label: '终到站天数', value: template.toStationDays != null ? `${template.toStationDays} 天` : '-' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[900px] bg-white shadow-xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold text-[#333333]">客运模板详情</h2>
            <span className={cn(
              'inline-flex items-center rounded px-2 py-0.5 text-[12px] font-medium',
              statusClass === 'red' ? 'bg-[#FFF1F0] text-[#FF4D4F] border border-[#FFCCC7]' :
              statusClass === 'blue' ? 'bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]' :
              'bg-[#F5F5F5] text-[#666666] border border-[#D9D9D9]'
            )}>
              {statusLabel}
            </span>
            <span className={cn(tagVariants({ variant: 'primary', size: 'md' }))}>
              {template.trainNo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(template)}
              className="px-4 py-2 bg-[#1890FF] text-white rounded-md text-[13px] font-medium hover:bg-[#40A9FF] transition-colors"
            >
              编辑
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-[#F3F4F6]">
              <X className="w-5 h-5 text-[#666666]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <div className="flex items-center gap-6">
                <div className="text-[28px] font-bold text-[#2563EB]">{template.trainNo}</div>
                <div className="flex items-center gap-2">
                  <span className={cn(tagVariants({ variant: getTrainTypeTag(template.trainType), size: 'md' }))}>
                    {template.trainType}
                  </span>
                  <span className={cn(tagVariants({ variant: template.synced ? 'success' : 'warning', size: 'md' }))}>
                    {template.synced ? '已同步' : '未同步'}
                  </span>
                  <span className={cn(landmarkTagVariants({ color: getLandmarkTagColor(template.landmarkColor) }))}>
                    {template.landmarkColor}地标
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-[13px] text-[#666666]">
                <span>{template.fromStation} → {template.toStation}</span>
                <span>{template.arrivalTime} → {template.departureTime} (停{template.stopDuration}分)</span>
                <span>{template.platform}站台 / {template.track}股道</span>
                <span>{template.formation}编{template.formationDir} / {template.model}</span>
              </div>
            </div>
            <DetailSection title="核心身份" fields={identityFields} />
            <DetailSection title="时间信息" fields={timeFields} />
            <DetailSection title="空间信息" fields={spaceFields} />
            <DetailSection title="检票信息" fields={checkFields} />
            <DetailSection title="编组信息" fields={formationFields} />
            <DetailSection title="设施信息" fields={facilityFields} />
            <DetailSection title="路由信息" fields={routeFields} />
            <DetailSection title="运行信息" fields={runFields} />
            <DetailSection title="属性信息" fields={attrFields} />
            <DetailSection title="有效期" fields={validityFields} />
            <DetailSection title="状态与审计" fields={statusFields} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailSection({ title, fields }: { title: string; fields: { label: string; value: string }[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-[#333333] mb-2 pb-1.5 border-b border-[#E5E7EB]">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-2">
            <span className="text-[12px] text-[#9CA3AF] min-w-[100px]">{field.label}</span>
            <span className="text-[13px] text-[#374151] font-medium">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getTemplateStatus(template: TemplateData): 'red' | 'blue' | 'white' {
  if (!template.confirmed && !template.synced) return 'red'
  if (template.confirmed && !template.synced) return 'blue'
  return 'white'
}

function getStatusLabel(template: TemplateData): string {
  if (!template.confirmed && !template.synced) return '未确认·未同步'
  if (!template.confirmed && template.synced) return '未确认·已同步'
  if (template.confirmed && !template.synced) return '已确认·未同步'
  return '已确认·已同步'
}

function getTrainTypeTag(type: string): 'originating' | 'terminating' | 'passing' {
  switch (type) {
    case '始发': return 'originating'
    case '终到': return 'terminating'
    default: return 'passing'
  }
}

function getLandmarkTagColor(color: string): 'green' | 'yellow' | 'blue' | 'purple' {
  switch (color) {
    case '绿': return 'green'
    case '黄': return 'yellow'
    case '蓝': return 'blue'
    case '紫': return 'purple'
    default: return 'green'
  }
}

function calculateTime(baseTime: string, offset: number): string {
  const parts = baseTime.split(':')
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  let totalMin = h * 60 + m + offset
  if (totalMin < 0) totalMin += 24 * 60
  const nh = Math.floor(totalMin / 60) % 24
  const nm = totalMin % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}
