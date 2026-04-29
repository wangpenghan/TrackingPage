import { useState } from 'react'
import {
  ChevronDown, ChevronUp, Edit, Eye, Check, RefreshCw, Trash2,
  Train, Clock, MapPin, Ticket, Building2, Link, RotateCcw, Droplets, WashingMachine, ShieldCheck, CircleCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  statusCardVariants,
  statusBarVariants,
  tagVariants,
  buttonVariants,
} from './ui/variants'
import type { TemplateData } from '@/types'

interface TemplateCardProps {
  template: TemplateData
  onSelect: (id: string) => void
  onAction: (action: string, template: TemplateData) => void
  onToggleExpand: (id: string) => void
  onViewDetail: (template: TemplateData) => void
  isSelected: boolean
  isExpanded: boolean
}

const flexMap = {
  checkbox: 'w-[48px] flex-shrink-0',
  facility: 'flex-[0.8]',
  train: 'flex-[1.5]',
  time: 'flex-[1.2]',
  check: 'flex-[1.2]',
  platform: 'flex-[2.0]',
  model: 'flex-[1.5]',
  formation: 'flex-[1.2]',
  status: 'w-[88px] flex-shrink-0',
  action: 'w-[100px] flex-shrink-0',
  expand: 'w-[48px] flex-shrink-0',
}

export function TemplateCard({
  template,
  onSelect,
  onAction,
  onToggleExpand,
  onViewDetail,
  isSelected,
  isExpanded,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const statusClass = getTemplateStatus(template)
  const syncTagType = template.synced ? 'success' : 'warning'
  const landmarkTagColor = getLandmarkTagColor(template.landmarkColor)

  const calcEntryCheck = calculateTime(template.departureTime, template.entryCheckOffset)
  const calcEntryStop = calculateTime(template.departureTime, template.entryStopOffset)

  const canSync = template.confirmed && !template.synced
  const showGates = template.trainType === '始发' || template.trainType === '途径'
  const showExit = template.trainType === '终到' || template.trainType === '途径'
  
  const directionMatch = template.entryDirection.match(/\(([^)]+)\)/)
  const nsDirection = directionMatch ? directionMatch[1] : template.entryDirection.charAt(0)

  const showActions = isHovered || isSelected

  // 接续关系：终到车显示接续车次（我接续谁），始发车显示立折车次（我由谁立折而来）
  const continuationInfo = getContinuationInfo(template)

  return (
    <div
      className={cn(
        statusCardVariants({
          status: statusClass,
          selected: isSelected,
          expanded: isExpanded,
          hovered: isHovered,
        })
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(statusBarVariants({ status: statusClass }))} />

      <div className="flex items-stretch flex-1 min-h-0">
        {/* 复选框 */}
        <div className={cn('flex items-center justify-center border-r border-[#E5E7EB]', flexMap.checkbox)}>
          <input type="checkbox" checked={isSelected} onChange={() => onSelect(template.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
        </div>

        {/* ===== 主信息区 — 点击切换选中状态 + 展开/折叠 ===== */}
        <div className="flex-1 flex items-center gap-0 min-w-0 cursor-pointer" onClick={() => { onSelect(template.id); onToggleExpand(template.id); }}>
          {/* 1. 上水/吸污 */}
          <div className={cn('flex flex-col justify-center items-center gap-1 px-3 border-r border-[#E5E7EB] min-w-0', flexMap.facility)}>
            <div className="flex items-center gap-1">
              <Droplets className={cn("w-4 h-4", template.hasWater ? "text-[#3B82F6]" : "text-[#D1D5DB]")} />
              <span className="text-[13px] text-[#6B7280]">上水</span>
            </div>
            <div className="flex items-center gap-1">
              <WashingMachine className={cn("w-4 h-4", template.hasSuction ? "text-[#8B5CF6]" : "text-[#D1D5DB]")} />
              <span className="text-[13px] text-[#6B7280]">吸污</span>
            </div>
          </div>

          {/* 2. 车次+类型+接续/立折+发到站 */}
          <div className={cn('flex flex-col justify-center gap-1 px-3 border-r border-[#E5E7EB] min-w-0', flexMap.train)}>
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-[#5e6ad2] flex-shrink-0" />
              <span className={cn(
                'text-[16px] font-bold tracking-tight',
                template.trainType === '终到' ? 'text-[#065F46]' : template.trainType === '途径' ? 'text-[#6B21A8]' : 'text-[#92400E]'
              )}>{template.trainNo}</span>
              <span className={cn(
                'inline-flex items-center justify-center rounded-md font-medium h-[20px] text-[11px] px-1.5',
                template.trainType === '终到' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7]' : template.trainType === '途径' ? 'bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE]' : 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
              )}>{template.trainType}</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[#6B7280] pl-5">
              {continuationInfo && (
                <span className="flex items-center gap-0.5">
                  {continuationInfo.isJiXu ? (
                    <>
                      <Link className="w-3 h-3 text-[#5e6ad2]" />
                      <span className="text-[#5e6ad2]">接续{continuationInfo.trainNo}</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3 text-[#f59e0b]" />
                      <span className="text-[#f59e0b]">{continuationInfo.trainNo}立折</span>
                    </>
                  )}
                </span>
              )}
              <span className="ml-1 truncate">{template.fromStation}→{template.toStation}</span>
            </div>
          </div>

          {/* 3. 到发/站停时间 — 图标+文字水平排列，用/分隔 */}
          <div className={cn('flex items-center gap-1.5 px-3 border-r border-[#E5E7EB] min-w-0', flexMap.time)}>
            <Clock className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
            {renderTimeDisplay(template)}
          </div>

          {/* 4. 开检/停检时间 — 图标+文字水平排列；终到车显示 --/-- */}
          <div className={cn('flex items-center gap-1.5 px-3 border-r border-[#E5E7EB] min-w-0', flexMap.check)}>
            <Ticket className="w-4 h-4 text-[#1E40AF] flex-shrink-0" />
            {template.trainType === '终到' ? (
              <span className="text-[16px] font-bold text-[#D1D5DB] font-mono">--:-- / --:--</span>
            ) : (
              <>
                <span className="text-[16px] font-bold text-[#16A34A] font-mono">{calcEntryCheck}</span>
                <span className="text-[#D1D5DB]">/</span>
                <span className="text-[16px] font-bold text-[#DC2626] font-mono">{calcEntryStop}</span>
              </>
            )}
          </div>

          {/* 5. 股道/站台/检票口/出站口 — 股道在前突出显示 */}
          <div className={cn('flex flex-col justify-center gap-1 px-3 border-r border-[#E5E7EB] min-w-0', flexMap.platform)}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
              <span className="text-[16px] font-bold text-[#374151]">{template.track}股道</span>
              <span className={cn(tagVariants({ variant: 'primary', size: 'md' }))}>{template.platform}站台</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#4B5563]">
              {showGates && <span className="flex items-center gap-0.5"><Ticket className="w-3 h-3" />{template.gates}</span>}
              {showExit && <span className="flex items-center gap-0.5"><Building2 className="w-3 h-3" />{template.exitGate}</span>}
            </div>
          </div>

          {/* 6. 车型/担当局 */}
          <div className={cn('flex flex-col justify-center items-center gap-1 px-3 border-r border-[#E5E7EB] min-w-0', flexMap.model)}>
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
              <span className="text-[16px] font-bold text-[#374151]">{template.model}</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] text-[#6B7280]">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[#4B5563]">{template.bureau || '—'}</span>
            </div>
          </div>

          {/* 7. 编组/地标 */}
          <div className={cn('flex flex-col justify-center items-center gap-1 px-3 min-w-0', flexMap.formation)}>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
              <span className="text-[16px] font-bold text-[#374151] tracking-tight font-mono">{nsDirection}{template.formation}{template.formationDir}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(tagVariants({ variant: 'info', size: 'xs' }))}>{template.landmarkColor}</span>
              <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: getLandmarkColorHex(landmarkTagColor) }} />
            </div>
          </div>
        </div>

        {/* ===== 右侧状态区 ===== */}
        <div className={cn('flex flex-col items-center justify-center gap-1 py-2 px-2 border-l border-[#E5E7EB] bg-[#F9FAFB] min-w-0', flexMap.status)}>
          <span className={cn(tagVariants({ variant: syncTagType, size: 'md' }))}>{template.synced ? '已同步' : '未同步'}</span>
          {!template.confirmed && (
            <span className="text-[11px] text-[#FF4D4F] font-medium flex items-center gap-0.5">
              <CircleCheck className="w-3 h-3" /> 未确认
            </span>
          )}
          {template.confirmed && (
            <span className="text-[11px] text-[#16A34A] font-medium flex items-center gap-0.5">
              <CircleCheck className="w-3 h-3" /> 已确认
            </span>
          )}
        </div>

        {/* ===== 操作按钮区 (4个按钮, 2x2 网格) ===== */}
        <div className={cn(
          'grid grid-cols-2 grid-rows-2 gap-1 items-center justify-center py-2 px-2 border-l border-[#E5E7EB] bg-[#F9FAFB] transition-opacity duration-150 min-w-0',
          flexMap.action,
          showActions ? 'opacity-100' : 'opacity-40'
        )}>
          <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title="查看" onClick={(e) => { e.stopPropagation(); onViewDetail(template); }}><Eye className="w-4 h-4 text-[#6B7280]" /></button>
          <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title="编辑" onClick={(e) => { e.stopPropagation(); onAction('edit', template); }}><Edit className="w-4 h-4 text-[#6B7280]" /></button>
          {canSync ? (
            <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title="同步" onClick={(e) => { e.stopPropagation(); onAction('sync', template); }}><RefreshCw className="w-4 h-4 text-[#10b981]" /></button>
          ) : !template.confirmed ? (
            <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title="确认" onClick={(e) => { e.stopPropagation(); onAction('confirm', template); }}><Check className="w-4 h-4 text-[#5e6ad2]" /></button>
          ) : (
            <div className="w-[32px] h-[32px]" />
          )}
          <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title="删除" onClick={(e) => { e.stopPropagation(); onAction('delete', template); }}><Trash2 className="w-4 h-4 text-[#EF4444]" /></button>
        </div>

        {/* ===== 展开按钮 (单独一列, 垂直居中) ===== */}
        <div className={cn(
          'flex items-center justify-center py-2 px-2 border-l border-[#E5E7EB] bg-[#F9FAFB] transition-opacity duration-150 min-w-0',
          flexMap.expand,
          showActions ? 'opacity-100' : 'opacity-40'
        )}>
          <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title={isExpanded ? '收起' : '展开'} onClick={(e) => { e.stopPropagation(); onToggleExpand(template.id); }}>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
          </button>
        </div>
      </div>

      {/* ===== 展开详情区 ===== */}
      {isExpanded && (
        <div className="px-6 pb-3 pt-2 border-t border-dashed border-[#E5E7EB] bg-[#F3F4F6]">
          <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-[13px]">
            <DetailItem label="运行周期" value={template.cycle ?? '-'} />
            <DetailItem label="运行规律" value={template.rule ?? '-'} />
            <DetailItem label="基本图号" value={template.diagramNo ?? '-'} />
            <DetailItem label="列车定员" value={template.capacity ?? '-'} />
            <DetailItem label="广播分组" value={template.broadcastGroup || '-'} />
            <DetailItem label="车次模式" value={template.trainNoMode || '自动'} />
            <DetailItem label="列车等级" value={template.trainClass || '-'} />
            <DetailItem label="起始有效期" value={template.validStart} />
            <DetailItem label="终止有效期" value={template.validEnd} />
            <DetailItem label="操作人员" value={template.operator || '-'} />
            <DetailItem label="操作时间" value={template.operateTime || '-'} />
            <DetailItem label="闸机始发站" value={template.gateFromStation || '-'} />
            <DetailItem label="闸机终到站" value={template.gateToStation || '-'} />
            <DetailItem label="始发时间" value={template.startTime || '-'} />
            <DetailItem label="终到时间" value={template.endTime || '-'} />
            <DetailItem label="停车位" value={template.parkingSpot || '-'} />
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-[#9CA3AF]">{label}:</span>
      <span className="text-[13px] text-[#374151]">{value}</span>
    </div>
  )
}

// 接续关系：终到车显示"我接续谁"（接续→），始发车显示"我由谁立折而来"（立折←）
function getContinuationInfo(template: TemplateData): { trainNo: string; isJiXu: boolean } | null {
  if (!template.arrivalTrainNo || template.arrivalTrainNo === template.trainNo) return null
  
  if (template.trainType === '终到') {
    // 终到车：显示接续车次（我接续谁）
    return { trainNo: template.arrivalTrainNo, isJiXu: true }
  }
  if (template.trainType === '始发') {
    // 始发车：显示立折车次（我由谁立折而来）
    return { trainNo: template.arrivalTrainNo, isJiXu: false }
  }
  return null
}

// 时间显示 — 水平排列，用/分隔
function renderTimeDisplay(template: TemplateData): JSX.Element {
  switch (template.trainType) {
    case '始发':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[16px] font-bold text-[#374151] font-mono">{template.departureTime}</span>
          <span className={cn('inline-flex items-center justify-center rounded-md font-medium h-[20px] text-[11px] px-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]')}>发</span>
        </div>
      )
    case '终到':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[16px] font-bold text-[#374151] font-mono">{template.arrivalTime}</span>
          <span className={cn('inline-flex items-center justify-center rounded-md font-medium h-[20px] text-[11px] px-1.5 bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7]')}>到</span>
        </div>
      )
    case '途径':
      const arr = template.arrivalTime.split(':').map(Number)
      const dep = template.departureTime.split(':').map(Number)
      let stopMin = (dep[0] * 60 + dep[1]) - (arr[0] * 60 + arr[1])
      if (stopMin < 0) stopMin += 24 * 60
      const stopH = Math.floor(stopMin / 60)
      const stopM = stopMin % 60
      const stopStr = stopH > 0 ? `${stopH}时${stopM}分` : `${stopM}分`
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[16px] font-bold text-[#374151] font-mono">{template.arrivalTime}/{template.departureTime}</span>
          <span className={cn('inline-flex items-center justify-center rounded-md font-medium h-[20px] text-[11px] px-1.5 bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE]')}>{stopStr}</span>
        </div>
      )
    default:
      return <span className="text-[14px] font-semibold text-[#374151] font-mono">{template.arrivalTime}/{template.departureTime}</span>
  }
}

function getTemplateStatus(template: TemplateData): 'red' | 'blue' | 'white' {
  if (!template.confirmed && !template.synced) return 'red'
  if (template.confirmed && !template.synced) return 'blue'
  return 'white'
}
function getLandmarkTagColor(color: string): 'green' | 'yellow' | 'blue' | 'purple' {
  switch (color) { case '绿': return 'green'; case '黄': return 'yellow'; case '蓝': return 'blue'; case '紫': return 'purple'; default: return 'green'; }
}
function getLandmarkColorHex(color: 'green' | 'yellow' | 'blue' | 'purple'): string {
  switch (color) { case 'green': return '#10b981'; case 'yellow': return '#f59e0b'; case 'blue': return '#3b82f6'; case 'purple': return '#8b5cf6'; default: return '#10b981'; }
}
function calculateTime(baseTime: string, offset: number): string {
  const parts = baseTime.split(':'); const h = parseInt(parts[0], 10); const m = parseInt(parts[1], 10);
  let totalMin = h * 60 + m + offset; if (totalMin < 0) totalMin += 24 * 60;
  const nh = Math.floor(totalMin / 60) % 24; const nm = totalMin % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}
