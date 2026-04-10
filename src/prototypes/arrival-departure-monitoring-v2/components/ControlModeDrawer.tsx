import React, { useState, useRef, useEffect } from 'react';
import { Radio, Button, Select, message, InputNumber, Checkbox } from 'antd';
import { Save, Plus, GripVertical, ChevronUp, ChevronDown, X, Settings } from 'lucide-react';

const DRAWER_WIDTH = 560;
const HEADER_PADDING = '14px 20px';
const CONTENT_PADDING = '16px 20px';

interface Station {
  id: string;
  name: string;
}

interface PassengerFlowConfig {
  boarding: number;
  alighting: number;
  transfer: number;
  total: number;
}

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

interface ControlModeDrawerProps {
  visible: boolean;
  onClose: () => void;
  darkMode?: boolean;
  onSave: (config: {
    controlMode: 'single' | '代管';
    stations: Station[];
    timeConfig: number;
    passengerFlowThreshold: {
      highSpeed8: PassengerFlowConfig;
      highSpeed16: PassengerFlowConfig;
      normalSpeed: PassengerFlowConfig;
    };
    columnOrder: string[];
  }) => void;
  initialPassengerFlowThreshold?: {
    highSpeed8: PassengerFlowConfig;
    highSpeed16: PassengerFlowConfig;
    normalSpeed: PassengerFlowConfig;
  };
  initialColumnOrder?: string[];
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'trainNo', label: '车次', visible: true },
  { id: 'arrival', label: '到点', visible: true },
  { id: 'departure', label: '发点', visible: true },
  { id: 'checkTime', label: '开停检时间', visible: true },
  { id: 'trackPlatform', label: '股道/站台', visible: true },
  { id: 'gates', label: '检票口/出站口', visible: true },
  { id: 'passengerFlow', label: '客流信息', visible: true },
  { id: 'service', label: '旅服作业', visible: true },
  { id: 'checkIn', label: '检票作业', visible: true },
  { id: 'platform', label: '站台作业', visible: true },
  { id: 'exit', label: '出站作业', visible: true },
  { id: 'joint', label: '结合部作业', visible: true },
  { id: 'planStatus', label: '计划状态', visible: true },
  { id: 'details', label: '详情', visible: true }
];

export const ControlModeDrawer: React.FC<ControlModeDrawerProps> = ({
  visible,
  onClose,
  darkMode = false,
  onSave,
  initialPassengerFlowThreshold = {
    highSpeed8: { boarding: 500, alighting: 500, transfer: 200, total: 1200 },
    highSpeed16: { boarding: 800, alighting: 800, transfer: 400, total: 2000 },
    normalSpeed: { boarding: 300, alighting: 300, transfer: 100, total: 700 }
  },
  initialColumnOrder
}) => {
  const [controlMode, setControlMode] = useState<'single' | '代管'>('代管');
  const [stations, setStations] = useState<any[]>([
    { id: '1', name: '重庆东', trainCount: 45, abnormalCount: 2, alarmCount: 8, delayCount: 1 },
    { id: '2', name: '巴南', trainCount: 28, abnormalCount: 1, alarmCount: 5, delayCount: 0 },
    { id: '3', name: '南川北', trainCount: 15, abnormalCount: 0, alarmCount: 3, delayCount: 0 },
    { id: '4', name: '水江西', trainCount: 10, abnormalCount: 0, alarmCount: 1, delayCount: 0 }
  ]);
  const [selectedStation, setSelectedStation] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [timeConfig, setTimeConfig] = useState(4);
  const [passengerFlowThreshold, setPassengerFlowThreshold] = useState(initialPassengerFlowThreshold);
  const [selectedFlowConfig, setSelectedFlowConfig] = useState<'highSpeed8' | 'highSpeed16' | 'normalSpeed'>('highSpeed8');
  const [columns, setColumns] = useState<ColumnConfig[]>([...DEFAULT_COLUMNS]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const dragOverColumn = useRef<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 抽屉打开时重新初始化状态
  useEffect(() => {
    if (visible) {
      // 重置客流阈值
      setPassengerFlowThreshold(initialPassengerFlowThreshold);
      // 重置列配置
      if (initialColumnOrder) {
        setColumns(initialColumnOrder.map(id => {
          const defaultCol = DEFAULT_COLUMNS.find(c => c.id === id);
          return defaultCol || { id, label: id, visible: true };
        }));
      } else {
        setColumns([...DEFAULT_COLUMNS]);
      }
    }
  }, [visible, initialPassengerFlowThreshold, initialColumnOrder]);

  // 点击外部关闭抽屉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  const handleModeChange = (e: any) => {
    setControlMode(e.target.value);
  };

  const handleAddStation = () => {
    if (!selectedStation) {
      message.error('请选择要添加的站点');
      return;
    }

    const newStation: any = {
      id: Date.now().toString(),
      name: selectedStation,
      description: '双向 · 8 股道',
      trainCount: Math.floor(Math.random() * 50) + 1,
      abnormalCount: Math.floor(Math.random() * 5),
      alarmCount: Math.floor(Math.random() * 10),
      delayCount: Math.floor(Math.random() * 3)
    };

    setStations([...stations, newStation]);
    setSelectedStation('');
  };

  const handleRemoveStation = (id: string) => {
    setStations(stations.filter(station => station.id !== id));
  };

  const handleMoveStation = (id: string, direction: 'up' | 'down') => {
    const index = stations.findIndex(station => station.id === id);
    if (index === -1) return;

    const newStations = [...stations];
    if (direction === 'up' && index > 0) {
      [newStations[index], newStations[index - 1]] = [newStations[index - 1], newStations[index]];
    } else if (direction === 'down' && index < newStations.length - 1) {
      [newStations[index], newStations[index + 1]] = [newStations[index + 1], newStations[index]];
    }

    setStations(newStations);
  };

  // 拖拽功能
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverItem.current = id;
  };

  const handleDragEnd = () => {
    if (draggedItem && dragOverItem.current && draggedItem !== dragOverItem.current) {
      const draggedIndex = stations.findIndex(s => s.id === draggedItem);
      const overIndex = stations.findIndex(s => s.id === dragOverItem.current);
      
      const newStations = [...stations];
      const [removed] = newStations.splice(draggedIndex, 1);
      newStations.splice(overIndex, 0, removed);
      
      setStations(newStations);
    }
    setDraggedItem(null);
    dragOverItem.current = null;
  };

  const handleSave = () => {
    onSave({
      controlMode,
      stations: controlMode === '代管' ? stations : [],
      timeConfig,
      passengerFlowThreshold,
      columnOrder: columns.map(c => c.id)
    });
    onClose();
  };

  // 列配置相关函数
  const handleColumnDragStart = (e: React.DragEvent, id: string) => {
    setDraggedColumn(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverColumn.current = id;
  };

  const handleColumnDragEnd = () => {
    if (draggedColumn && dragOverColumn.current && draggedColumn !== dragOverColumn.current) {
      const draggedIndex = columns.findIndex(c => c.id === draggedColumn);
      const overIndex = columns.findIndex(c => c.id === dragOverColumn.current);
      
      const newColumns = [...columns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(overIndex, 0, removed);
      
      setColumns(newColumns);
    }
    setDraggedColumn(null);
    dragOverColumn.current = null;
  };

  const handleMoveColumn = (id: string, direction: 'up' | 'down') => {
    const index = columns.findIndex(c => c.id === id);
    if (index === -1) return;

    const newColumns = [...columns];
    if (direction === 'up' && index > 0) {
      [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
    } else if (direction === 'down' && index < newColumns.length - 1) {
      [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    }

    setColumns(newColumns);
  };

  const handleToggleColumnVisible = (id: string) => {
    setColumns(prev => prev.map(c => 
      c.id === id ? { ...c, visible: !c.visible } : c
    ));
  };

  if (!visible) return null;

  const getContainerStyle = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: `${DRAWER_WIDTH}px`,
    background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
    zIndex: 1000,
    boxShadow: darkMode ? '-8px 0 24px rgba(0,0,0,0.4)' : '-8px 0 24px rgba(29,78,95,0.12)',
    display: 'flex',
    flexDirection: 'column'
  });

  const getHeaderStyle = (): React.CSSProperties => ({
    padding: HEADER_PADDING,
    borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
  });

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: '17px',
    fontWeight: 600,
    color: darkMode ? '#E2E8F0' : '#1F2937',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '8px',
    borderLeft: '3px solid #1890ff'
  });

  const getCloseButtonStyle = (): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    color: darkMode ? '#94A3B8' : '#64748B',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  });

  const getCardStyle = (): React.CSSProperties => ({
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
  });

  return (
    <div style={getContainerStyle()} ref={drawerRef}>
      <div style={getHeaderStyle()}>
        <div style={getTitleStyle()}>
          <Settings size={20} />
          <span>界面配置</span>
        </div>
        <div 
          style={getCloseButtonStyle()} 
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(42, 107, 124, 0.25)' : '#E5E7EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF';
          }}
        >
          <X size={18} />
        </div>
      </div>

      <div style={{ padding: CONTENT_PADDING, flex: 1, overflowY: 'auto' }}>
        {/* 第一行：时间调整 + 管控模式 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {/* 时间调整 */}
          <div style={{ ...getCardStyle(), flex: 1, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>时间调整</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <InputNumber
                min={1}
                max={24}
                value={timeConfig}
                onChange={(value) => setTimeConfig(value as number)}
                style={{
                  width: '100px',
                  height: '40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  color: '#1890ff',
                  borderRadius: '8px'
                }}
              />
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '14px' }}>小时</span>
            </div>
          </div>

          {/* 管控模式 */}
          <div style={{ ...getCardStyle(), flex: 1, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>管控模式</span>
            </div>
            <Radio.Group value={controlMode} onChange={handleModeChange} style={{ display: 'flex', gap: '16px' }}>
              <Radio value="single" style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>
                单站模式
              </Radio>
              <Radio value="代管" style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>
                代管模式
              </Radio>
            </Radio.Group>
          </div>
        </div>

        {/* 大客流阈值配置 */}
        <div style={getCardStyle()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>大客流阈值配置</span>
          </div>

          {/* 客流配置类型选择 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '10px'
          }}>
            <button
              onClick={() => setSelectedFlowConfig('highSpeed8')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '6px',
                background: selectedFlowConfig === 'highSpeed8'
                  ? (darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.1)')
                  : (darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.06)'),
                border: `1px solid ${darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.15)'}`,
                color: darkMode ? '#5DA3B3' : '#1D4E5F',
                fontSize: '12px',
                fontWeight: selectedFlowConfig === 'highSpeed8' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              高铁8编组
            </button>
            <button
              onClick={() => setSelectedFlowConfig('highSpeed16')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '6px',
                background: selectedFlowConfig === 'highSpeed16'
                  ? (darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.1)')
                  : (darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.06)'),
                border: `1px solid ${darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.15)'}`,
                color: darkMode ? '#5DA3B3' : '#1D4E5F',
                fontSize: '12px',
                fontWeight: selectedFlowConfig === 'highSpeed16' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              高铁16编组
            </button>
            <button
              onClick={() => setSelectedFlowConfig('normalSpeed')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '6px',
                background: selectedFlowConfig === 'normalSpeed'
                  ? (darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.1)')
                  : (darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.06)'),
                border: `1px solid ${darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.15)'}`,
                color: darkMode ? '#5DA3B3' : '#1D4E5F',
                fontSize: '12px',
                fontWeight: selectedFlowConfig === 'normalSpeed' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              普速
            </button>
          </div>

          {/* 客流预警值配置 - 两列布局 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 calc(50% - 8px)' }}>
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px', width: '70px' }}>上车人数:</span>
              <InputNumber
                min={50}
                max={3000}
                step={50}
                value={passengerFlowThreshold[selectedFlowConfig].boarding}
                onChange={(value) => setPassengerFlowThreshold(prev => ({
                  ...prev,
                  [selectedFlowConfig]: {
                    ...prev[selectedFlowConfig],
                    boarding: value as number
                  }
                }))}
                style={{
                  width: '90px',
                  height: '40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  color: '#1890ff',
                  borderRadius: '8px'
                }}
              />
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px' }}>人</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 calc(50% - 8px)' }}>
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px', width: '70px' }}>下车人数:</span>
              <InputNumber
                min={50}
                max={3000}
                step={50}
                value={passengerFlowThreshold[selectedFlowConfig].alighting}
                onChange={(value) => setPassengerFlowThreshold(prev => ({
                  ...prev,
                  [selectedFlowConfig]: {
                    ...prev[selectedFlowConfig],
                    alighting: value as number
                  }
                }))}
                style={{
                  width: '90px',
                  height: '40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  color: '#1890ff',
                  borderRadius: '8px'
                }}
              />
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px' }}>人</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 calc(50% - 8px)' }}>
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px', width: '70px' }}>换乘人数:</span>
              <InputNumber
                min={20}
                max={1500}
                step={20}
                value={passengerFlowThreshold[selectedFlowConfig].transfer}
                onChange={(value) => setPassengerFlowThreshold(prev => ({
                  ...prev,
                  [selectedFlowConfig]: {
                    ...prev[selectedFlowConfig],
                    transfer: value as number
                  }
                }))}
                style={{
                  width: '90px',
                  height: '40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  color: '#1890ff',
                  borderRadius: '8px'
                }}
              />
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px' }}>人</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 calc(50% - 8px)' }}>
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px', width: '70px' }}>总客流:</span>
              <InputNumber
                min={100}
                max={5000}
                step={100}
                value={passengerFlowThreshold[selectedFlowConfig].total}
                onChange={(value) => setPassengerFlowThreshold(prev => ({
                  ...prev,
                  [selectedFlowConfig]: {
                    ...prev[selectedFlowConfig],
                    total: value as number
                  }
                }))}
                style={{
                  width: '90px',
                  height: '40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  color: '#1890ff',
                  borderRadius: '8px'
                }}
              />
              <span style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px' }}>人</span>
            </div>
          </div>
        </div>

        {/* 列配置模块 */}
        <div style={getCardStyle()}>
          <div style={{ 
            marginBottom: '14px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>列展示顺序</span>
            </div>
            <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#6B7280' }}>
              共 {columns.length} 列 · 拖拽或点击箭头调整顺序
            </span>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {columns.map((col, index) => (
              <div
                key={col.id}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, col.id)}
                onDragOver={(e) => handleColumnDragOver(e, col.id)}
                onDragEnd={handleColumnDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  marginBottom: '6px',
                  backgroundColor: darkMode ? 'rgba(42, 107, 124, 0.2)' : 'rgba(29, 78, 95, 0.06)',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  cursor: 'move',
                  opacity: draggedColumn === col.id ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* 拖拽手柄 */}
                <div style={{ 
                  cursor: 'grab',
                  color: darkMode ? '#64748B' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <GripVertical size={16} />
                </div>

                {/* 序号 */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  backgroundColor: darkMode ? 'rgba(42, 107, 124, 0.4)' : 'rgba(29, 78, 95, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: darkMode ? '#E2E8F0' : '#1F2937'
                }}>
                  {index + 1}
                </div>

                {/* 列名称 */}
                <div style={{ 
                  fontWeight: '500', 
                  fontSize: '14px',
                  color: darkMode ? '#E2E8F0' : '#1F2937',
                  flex: 1
                }}>
                  {col.label}
                </div>

                {/* 显示/隐藏开关 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Checkbox
                    checked={col.visible}
                    onChange={() => handleToggleColumnVisible(col.id)}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: darkMode ? '#94A3B8' : '#64748B'
                  }}>
                    显示
                  </span>
                </div>

                {/* 操作按钮组 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {/* 上移 */}
                  <Button
                    type="text"
                    icon={<ChevronUp size={14} />}
                    onClick={() => handleMoveColumn(col.id, 'up')}
                    disabled={index === 0}
                    style={{
                      color: index === 0 
                        ? (darkMode ? '#475569' : '#CBD5E1') 
                        : (darkMode ? '#94A3B8' : '#64748B'),
                      padding: '2px 6px',
                      height: 'auto'
                    }}
                  />
                  {/* 下移 */}
                  <Button
                    type="text"
                    icon={<ChevronDown size={14} />}
                    onClick={() => handleMoveColumn(col.id, 'down')}
                    disabled={index === columns.length - 1}
                    style={{
                      color: index === columns.length - 1 
                        ? (darkMode ? '#475569' : '#CBD5E1') 
                        : (darkMode ? '#94A3B8' : '#64748B'),
                      padding: '2px 6px',
                      height: 'auto'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {controlMode === '代管' && (
          <div style={getCardStyle()}>
            <div style={{ 
              marginBottom: '14px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>代管站配置</span>
              </div>
              <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#6B7280' }}>
                共 {stations.length} 个车站 · 拖拽或点击箭头调整顺序
              </span>
            </div>

            <div style={{ marginBottom: '14px', display: 'flex', gap: '8px' }}>
              <Select
                placeholder="选择站点"
                style={{
                  flex: 1,
                  height: '40px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                  color: '#1890ff'
                }}
                value={selectedStation}
                onChange={setSelectedStation}
                options={[
                  { value: '上海', label: '上海' },
                  { value: '广州南', label: '广州南' },
                  { value: '深圳北', label: '深圳北' },
                  { value: '杭州东', label: '杭州东' },
                  { value: '成都东', label: '成都东' }
                ]}
              />
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={handleAddStation}
                style={{
                  borderRadius: '6px',
                  padding: '0 16px',
                  height: '36px',
                  background: darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff',
                  border: darkMode ? '1px solid rgba(24, 144, 255, 0.4)' : '1px solid #91d5ff',
                  color: darkMode ? '#60a5fa' : '#1890ff'
                }}
              >
                添加
              </Button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {stations.map((station, index) => (
                <div
                  key={station.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, station.id)}
                  onDragOver={(e) => handleDragOver(e, station.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    backgroundColor: darkMode ? 'rgba(42, 107, 124, 0.2)' : 'rgba(29, 78, 95, 0.06)',
                    borderRadius: '8px',
                    border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                    cursor: 'move',
                    opacity: draggedItem === station.id ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* 拖拽手柄 */}
                  <div style={{ 
                    cursor: 'grab',
                    color: darkMode ? '#64748B' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <GripVertical size={18} />
                  </div>

                  {/* 序号 */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: darkMode ? 'rgba(42, 107, 124, 0.4)' : 'rgba(29, 78, 95, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: darkMode ? '#E2E8F0' : '#1F2937'
                  }}>
                    {index + 1}
                  </div>

                  {/* 车站名称 */}
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '15px',
                    color: darkMode ? '#E2E8F0' : '#1F2937',
                    flex: 1
                  }}>
                    {station.name}
                  </div>

                  {/* 操作按钮组 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* 上移 */}
                    <Button
                      type="text"
                      icon={<ChevronUp size={16} />}
                      onClick={() => handleMoveStation(station.id, 'up')}
                      disabled={index === 0}
                      style={{
                        color: index === 0 
                          ? (darkMode ? '#475569' : '#CBD5E1') 
                          : (darkMode ? '#94A3B8' : '#64748B'),
                        padding: '4px 8px',
                        height: 'auto'
                      }}
                    />
                    {/* 下移 */}
                    <Button
                      type="text"
                      icon={<ChevronDown size={16} />}
                      onClick={() => handleMoveStation(station.id, 'down')}
                      disabled={index === stations.length - 1}
                      style={{
                        color: index === stations.length - 1 
                          ? (darkMode ? '#475569' : '#CBD5E1') 
                          : (darkMode ? '#94A3B8' : '#64748B'),
                        padding: '4px 8px',
                        height: 'auto'
                      }}
                    />
                    {/* 移除 */}
                    <Button
                      type="text"
                      icon={<X size={16} />}
                      onClick={() => handleRemoveStation(station.id)}
                      style={{
                        color: darkMode ? '#94A3B8' : '#64748B',
                        padding: '4px 8px',
                        height: 'auto'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        padding: '14px 20px', 
        borderTop: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
      }}>
        <Button
          onClick={onClose}
          style={{
            borderRadius: '6px',
            padding: '0 16px',
            height: '36px',
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
            color: darkMode ? '#94A3B8' : '#64748B'
          }}
        >
          取消
        </Button>
        <Button
          type="primary"
          icon={<Save size={16} />}
          onClick={handleSave}
          style={{
            borderRadius: '6px',
            padding: '0 16px',
            height: '36px',
            background: darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff',
            border: darkMode ? '1px solid rgba(24, 144, 255, 0.4)' : '1px solid #91d5ff',
            color: darkMode ? '#60a5fa' : '#1890ff'
          }}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
