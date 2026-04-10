import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { TrainSchedule, mockTrainSchedules } from './mock-data';
import { PlanFilterState } from './components/PlanFilterDrawer';
import { OperationType } from './OperationDrawer';
import { getStationColor } from './hooks/useMultiStation';
import { 
  TrainFront, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Users, 
  Volume2, 
  Monitor, 
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Minus,
  User,
  Droplets,
  Trash2
} from 'lucide-react';

interface TrainTableProps {
  viewMode: 'normal' | 'intervention';
  onViewModeChange: (mode: 'normal' | 'intervention') => void;
  selectedTrainId: string | null;
  onSelectTrain: (id: string | null) => void;
  onDataChange: () => void;
  searchTerm: string;
  planFilters: PlanFilterState;
  dataVersion: number;
  darkMode: boolean;
  operationDrawerVisible: boolean;
  onOperationDrawerClose: () => void;
  operationTrainId: string | null;
  operationType: OperationType;
  onOpenOperationDrawer: (trainId: string, type: OperationType) => void;
  simpleMode: boolean;
  passengerFlowThreshold: { boarding: number; alighting: number; transfer: number };
  trains: TrainSchedule[];
}

/**
 * 获取车次颜色（与V2保持一致）
 */
const getTrainTypeColor = (type: string) => {
  switch (type) {
    case 'cyan': return { bg: '#e0f2fe', text: '#0284c7' };
    case 'purple': return { bg: '#f3e8ff', text: '#9333ea' };
    case 'yellow': return { bg: '#fef9c3', text: '#a16207' };
    default: return { bg: '#dcfce7', text: '#16a34a' };
  }
};

const getStatusBadge = (status: string, darkMode: boolean) => {
  const styles: Record<string, { bg: string; text: string }> = {
    '正在候车': { bg: darkMode ? '#1e3a5f' : '#dbeafe', text: darkMode ? '#60a5fa' : '#1d4ed8' },
    '正在检票': { bg: darkMode ? '#064e3b' : '#d1fae5', text: darkMode ? '#34d399' : '#059669' },
    '停止检票': { bg: darkMode ? '#7f1d1d' : '#fee2e2', text: darkMode ? '#f87171' : '#dc2626' },
    '晚点未定': { bg: darkMode ? '#7c2d12' : '#fef3c7', text: darkMode ? '#fbbf24' : '#d97706' },
    '列车已到达': { bg: darkMode ? '#1e3a5f' : '#dbeafe', text: darkMode ? '#60a5fa' : '#1d4ed8' },
    '正点到达': { bg: darkMode ? '#064e3b' : '#d1fae5', text: darkMode ? '#34d399' : '#059669' },
    '停运': { bg: darkMode ? '#374151' : '#f3f4f6', text: darkMode ? '#9ca3af' : '#6b7280' }
  };
  return styles[status] || { bg: darkMode ? '#374151' : '#f3f4f6', text: darkMode ? '#9ca3af' : '#6b7280' };
};

const getOperationStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={14} color="#10b981" />;
    case 'active':
      return <Clock size={14} color="#3b82f6" />;
    case 'pending':
      return <Minus size={14} color="#9ca3af" />;
    case 'alarm':
      return <AlertCircle size={14} color="#ef4444" />;
    default:
      return <XCircle size={14} color="#6b7280" />;
  }
};

export const TrainTable: React.FC<TrainTableProps> = ({
  searchTerm,
  planFilters,
  darkMode,
  simpleMode,
  onSelectTrain,
  selectedTrainId,
  trains
}) => {
  const [expandedTrainId, setExpandedTrainId] = useState<string | null>(null);
  
  // 拖拽滚动相关状态
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const filteredTrains = useMemo(() => {
    let result = [...trains];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(train => 
        train.trainNo.toLowerCase().includes(term) ||
        train.location.track.includes(term) ||
        train.location.platform.includes(term)
      );
    }
    
    // 时间过滤
    if (planFilters.timeConfig > 0) {
      const now = new Date();
      const cutoff = new Date(now.getTime() + planFilters.timeConfig * 60 * 60 * 1000);
      result = result.filter(train => {
        const trainTime = new Date();
        const [hours, minutes] = train.arrival.time.split(':');
        trainTime.setHours(parseInt(hours), parseInt(minutes));
        return trainTime <= cutoff;
      });
    }
    
    // 按到达时间排序
    result.sort((a, b) => {
      const timeA = a.arrival.actualTime || a.arrival.time;
      const timeB = b.arrival.actualTime || b.arrival.time;
      return timeA.localeCompare(timeB);
    });
    
    return result;
  }, [searchTerm, planFilters, trains]);

  const toggleExpand = (trainId: string) => {
    setExpandedTrainId(expandedTrainId === trainId ? null : trainId);
    onSelectTrain(expandedTrainId === trainId ? null : trainId);
  };

  // 鼠标按下开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  // 鼠标移动时拖拽
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 拖拽速度系数
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  // 鼠标松开结束拖拽
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 鼠标离开容器结束拖拽
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 全局鼠标事件监听（防止拖拽时鼠标移出容器）
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove as any);
    } else {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [isDragging, handleMouseUp, handleMouseMove]);

  return (
    <div 
      ref={scrollContainerRef}
      style={{ 
        padding: '16px', 
        overflowX: 'auto', 
        overflowY: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '12px',
        width: 'max-content'
      }}>
        {filteredTrains.map((train, index) => (
          <TrainCard 
            key={train.id} 
            train={train} 
            index={index + 1}
            darkMode={darkMode}
            simpleMode={simpleMode}
            isExpanded={expandedTrainId === train.id}
            onToggle={() => toggleExpand(train.id)}
            isSelected={selectedTrainId === train.id}
          />
        ))}
      </div>
    </div>
  );
};

interface TrainCardProps {
  train: TrainSchedule;
  index: number;
  darkMode: boolean;
  simpleMode: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
}

// 作业状态配置 - 只保留用户要求的四项作业
const OPERATION_CONFIG = [
  { key: 'checkIn', label: '检票作业', icon: DoorOpen },
  { key: 'platform', label: '站台作业', icon: MapPin },
  { key: 'exit', label: '出站作业', icon: DoorOpen },
] as const;

// 获取作业状态样式
const getOperationStatusStyle = (status: string, darkMode: boolean) => {
  const styles: Record<string, { bg: string; text: string }> = {
    'completed': { bg: darkMode ? '#065f46' : '#d1fae5', text: darkMode ? '#34d399' : '#059669' },
    'active': { bg: darkMode ? '#1e3a5f' : '#dbeafe', text: darkMode ? '#60a5fa' : '#1d4ed8' },
    'pending': { bg: darkMode ? '#374151' : '#f3f4f6', text: darkMode ? '#9ca3af' : '#6b7280' },
    'absent': { bg: darkMode ? '#374151' : '#f3f4f6', text: darkMode ? '#9ca3af' : '#6b7280' },
    'alarm': { bg: '#ef4444', text: '#ffffff' }, // 异常状态红色背景
  };
  return styles[status] || styles['pending'];
};

const TrainCard: React.FC<TrainCardProps> = ({ 
  train, 
  index,
  darkMode, 
  simpleMode,
  isExpanded,
  onToggle,
  isSelected
}) => {
  const typeColor = getTrainTypeColor(train.trainType);
  const statusBadge = getStatusBadge(train.location.currentPos, darkMode);
  const stationColor = getStationColor(train.stationId);

  // 获取卡片边框颜色
  const getCardBorder = () => {
    if (isSelected) {
      return '2px solid #3b82f6';
    }
    const borderColor = darkMode ? stationColor.dark.border : stationColor.light.border;
    return `2px solid ${borderColor}`;
  };

  return (
    <div
      onClick={onToggle}
      style={{
        background: darkMode ? '#1e293b' : '#fff',
        borderRadius: '12px',
        border: getCardBorder(),
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected 
          ? '0 0 0 3px rgba(59, 130, 246, 0.2)' 
          : '0 1px 3px rgba(0,0,0,0.1)',
        width: '280px',
        flexShrink: 0
      }}
    >
      {/* 头部 - 重新设计布局 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: darkMode ? '1px solid #334155' : '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* 左侧：序号 + 车次号 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* 序号 */}
          <div style={{
            background: darkMode ? '#334155' : '#f3f4f6',
            color: darkMode ? '#94a3b8' : '#6b7280',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            minWidth: '24px',
            textAlign: 'center'
          }}>
            {index}
          </div>
          {/* 车次号 */}
          <div style={{
            background: typeColor.bg,
            color: typeColor.text,
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            {train.trainNo}
          </div>
        </div>
        
        {/* 中间：状态标签 */}
        <div style={{
          background: statusBadge.bg,
          color: statusBadge.text,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 500,
          flexShrink: 0
        }}>
          {train.location.currentPos}
        </div>
        
        {/* 右侧：站名标签 */}
        <div style={{
          background: darkMode ? stationColor.dark.bg : stationColor.light.bg,
          color: darkMode ? stationColor.dark.text : stationColor.light.text,
          border: `1px solid ${darkMode ? stationColor.dark.border : stationColor.light.border}`,
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          flexShrink: 0,
          maxWidth: '70px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {train.stationName}
        </div>
      </div>

      {/* 主体内容 */}
      <div style={{ padding: '12px 16px' }}>
        {/* 车长信息 */}
        {train.trainMasters && train.trainMasters.length > 0 && (
          <div style={{
            marginBottom: '12px',
            padding: '8px 12px',
            background: darkMode ? '#0f172a' : '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontSize: '11px', 
              color: darkMode ? '#94a3b8' : '#6b7280',
              marginBottom: '4px',
              fontWeight: 600
            }}>
              车长信息
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {train.trainMasters.map((master, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <Users size={12} color={darkMode ? '#60a5fa' : '#3b82f6'} />
                  <span style={{ color: darkMode ? '#e2e8f0' : '#374151', fontWeight: 500 }}>
                    {master.name}
                  </span>
                  <span style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                    {master.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 开检/停检时间 */}
        {train.checkInTimes && (
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '12px',
            padding: '8px 12px',
            background: darkMode ? '#0f172a' : '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#10b981" />
              <span style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280' }}>开检</span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 600,
                color: darkMode ? '#e2e8f0' : '#374151'
              }}>
                {train.checkInTimes.open}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#ef4444" />
              <span style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280' }}>停检</span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 600,
                color: darkMode ? '#e2e8f0' : '#374151'
              }}>
                {train.checkInTimes.close}
              </span>
            </div>
          </div>
        )}

        {/* 运行区间 */}
        {train.runningSection && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            color: darkMode ? '#e2e8f0' : '#374151',
            fontSize: '14px'
          }}>
            <span style={{ fontWeight: 600 }}>{train.runningSection?.from || '-'}</span>
            <ArrowRight size={16} color={darkMode ? '#64748b' : '#9ca3af'} />
            <span style={{ fontWeight: 600 }}>{train.runningSection?.to || '-'}</span>
          </div>
        )}

        {/* 作业状态盯控 - 核心功能 */}
        {!simpleMode && train.operations && (
          <div style={{
            marginBottom: '12px',
            border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: darkMode ? '#1e293b' : '#f9fafb',
              padding: '8px 12px',
              borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
              fontSize: '12px',
              fontWeight: 600,
              color: darkMode ? '#e2e8f0' : '#374151'
            }}>
              作业状态盯控
            </div>
            <div>
              {/* 检票作业 */}
              {(() => {
                const opData = train.operations.checkIn;
                if (!opData) return null;
                const statusStyle = getOperationStatusStyle(opData.status, darkMode);
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`,
                      background: opData.status === 'alarm' ? '#ef4444' : 'transparent',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                    }}>
                      <DoorOpen size={14} />
                      <span style={{ fontSize: '13px' }}>检票作业</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                      }}>
                        {opData.actualCount}/{opData.plannedCount}
                      </span>
                      <div
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {opData.status === 'completed' && '已完成'}
                        {opData.status === 'active' && '进行中'}
                        {opData.status === 'pending' && '待处理'}
                        {opData.status === 'absent' && '未开始'}
                        {opData.status === 'alarm' && '异常'}
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* 站台作业 */}
              {(() => {
                const opData = train.operations.platform;
                if (!opData) return null;
                const statusStyle = getOperationStatusStyle(opData.status, darkMode);
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`,
                      background: opData.status === 'alarm' ? '#ef4444' : 'transparent',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                    }}>
                      <MapPin size={14} />
                      <span style={{ fontSize: '13px' }}>站台作业</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                      }}>
                        {opData.actualCount}/{opData.plannedCount}
                      </span>
                      <div
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {opData.status === 'completed' && '已完成'}
                        {opData.status === 'active' && '进行中'}
                        {opData.status === 'pending' && '待处理'}
                        {opData.status === 'absent' && '未开始'}
                        {opData.status === 'alarm' && '异常'}
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* 出站作业 */}
              {(() => {
                const opData = train.operations.exit;
                if (!opData) return null;
                const statusStyle = getOperationStatusStyle(opData.status, darkMode);
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`,
                      background: opData.status === 'alarm' ? '#ef4444' : 'transparent',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                    }}>
                      <DoorOpen size={14} />
                      <span style={{ fontSize: '13px' }}>出站作业</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                      }}>
                        {opData.actualCount}/{opData.plannedCount}
                      </span>
                      <div
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {opData.status === 'completed' && '已完成'}
                        {opData.status === 'active' && '进行中'}
                        {opData.status === 'pending' && '待处理'}
                        {opData.status === 'absent' && '未开始'}
                        {opData.status === 'alarm' && '异常'}
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* 上水吸污作业 */}
              {(() => {
                const waterData = train.operations.water;
                const sewageData = train.operations.sewage;
                if (!waterData && !sewageData) return null;
                
                // 使用water或sewage的数据（假设它们状态一致）
                const opData = waterData || sewageData;
                const statusStyle = getOperationStatusStyle(opData.status, darkMode);
                
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${darkMode ? '#334155' : '#f3f4f6'}`,
                      background: opData.status === 'alarm' ? '#ef4444' : 'transparent',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                    }}>
                      <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>上水吸污</span>
                      {/* 图标显示 - 哪个作业有就显示哪个图标 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {waterData && (
                          <Droplets size={14} color={opData.status === 'alarm' ? '#ffffff' : '#3b82f6'} />
                        )}
                        {sewageData && (
                          <Trash2 size={14} color={opData.status === 'alarm' ? '#ffffff' : '#8b5cf6'} />
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: opData.status === 'alarm' ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151')
                      }}>
                        {opData.actualCount}/{opData.plannedCount}
                      </span>
                      <div
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {opData.status === 'completed' && '已完成'}
                        {opData.status === 'active' && '进行中'}
                        {opData.status === 'pending' && '待处理'}
                        {opData.status === 'absent' && '未开始'}
                        {opData.status === 'alarm' && '异常'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 时间信息 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '2px' }}>到达</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 700,
              color: train.arrival.lateEarly && train.arrival.lateEarly !== '0' 
                ? '#ef4444' 
                : (darkMode ? '#e2e8f0' : '#1f2937')
            }}>
              {train.arrival.actualTime || train.arrival.time}
            </div>
            {train.arrival.lateEarly && train.arrival.lateEarly !== '0' && (
              <div style={{ fontSize: '11px', color: '#ef4444' }}>
                {train.arrival.lateEarly.startsWith('+') ? `晚${train.arrival.lateEarly}分` : `早${Math.abs(parseInt(train.arrival.lateEarly))}分`}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '2px' }}>出发</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 700,
              color: train.departure.lateEarly && train.departure.lateEarly !== '0' 
                ? '#ef4444' 
                : (darkMode ? '#e2e8f0' : '#1f2937')
            }}>
              {train.departure.actualTime || train.departure.time}
            </div>
          </div>
        </div>

        {/* 位置信息 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '12px',
          fontSize: '13px',
          color: darkMode ? '#94a3b8' : '#6b7280'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrainFront size={14} />
            <span>{train.location.track}道</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} />
            <span>{train.location.platform}站台</span>
          </div>
        </div>

        {/* 非简洁模式显示更多信息 */}
        {!simpleMode && (
          <>
            {/* 检票口/出站口 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px',
              fontSize: '13px',
              color: darkMode ? '#94a3b8' : '#6b7280'
            }}>
              {train.location.checkInGate !== '-' && (
                <div>检票口: <span style={{ color: darkMode ? '#e2e8f0' : '#374151', fontWeight: 500 }}>{train.location.checkInGate}</span></div>
              )}
              {train.location.exitGate !== '-' && (
                <div>出站口: <span style={{ color: darkMode ? '#e2e8f0' : '#374151', fontWeight: 500 }}>{train.location.exitGate}</span></div>
              )}
            </div>

            {/* 旅服设备状态 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              padding: '8px',
              background: darkMode ? '#0f172a' : '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Volume2 size={14} color={train.devices.broadcast.state === 'normal' ? '#10b981' : '#ef4444'} />
                <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280' }}>{train.devices.broadcast.value}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Monitor size={14} color={train.devices.guide.state === 'normal' ? '#10b981' : '#ef4444'} />
                <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280' }}>{train.devices.guide.value}</span>
              </div>
              {train.devices.gate.state !== 'none' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoorOpen size={14} color={train.devices.gate.state === 'normal' ? '#10b981' : '#ef4444'} />
                  <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280' }}>{train.devices.gate.value}</span>
                </div>
              )}
            </div>

            {/* 客流信息 */}
            {train.passengerFlow && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: darkMode ? '#94a3b8' : '#6b7280' }}>
                  <Users size={14} />
                  <span>上车: <b style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>{train.passengerFlow.boarding}</b></span>
                </div>
                <div style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                  下车: <b style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>{train.passengerFlow.alighting}</b>
                </div>
                <div style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                  换乘: <b style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>{train.passengerFlow.transfer}</b>
                </div>
              </div>
            )}
          </>
        )}

        {/* 标签 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '12px'
        }}>
          {train.tags.water && (
            <span style={{
              background: darkMode ? '#1e3a5f' : '#dbeafe',
              color: darkMode ? '#60a5fa' : '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px'
            }}>上水</span>
          )}
          {train.tags.sewage && (
            <span style={{
              background: darkMode ? '#312e81' : '#e0e7ff',
              color: darkMode ? '#818cf8' : '#4338ca',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px'
            }}>吸污</span>
          )}
          {train.tags.parcel && (
            <span style={{
              background: darkMode ? '#3f2c22' : '#ffedd5',
              color: darkMode ? '#fb923c' : '#ea580c',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px'
            }}>行包</span>
          )}
          {train.tags.meal && (
            <span style={{
              background: darkMode ? '#14532d' : '#dcfce7',
              color: darkMode ? '#4ade80' : '#16a34a',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px'
            }}>送餐</span>
          )}
        </div>
      </div>
    </div>
  );
};
