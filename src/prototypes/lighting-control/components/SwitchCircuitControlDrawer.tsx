import React, { useState, useEffect } from 'react';
import { Circuit, switchModeConfigs, globalCustomCircuits, setGlobalCustomCircuits } from '../mock-data';
import { X, Check, GripVertical, Settings } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  CircuitFullOn, 
  CircuitHalfOnA, 
  CircuitHalfOnB, 
  CircuitQuarterOn, 
  CircuitFullOff,
  CircuitCustom,
  getSwitchModeIcon
} from './CircuitIcons';

interface SortableCircuitRowProps {
  circuit: Circuit;
  index: number;
  isEditing: boolean;
  onToggle: (id: number) => void;
  darkMode: boolean;
}

const SortableCircuitRow: React.FC<SortableCircuitRowProps> = ({ 
  circuit, index, isEditing, onToggle, darkMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: circuit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`circuit-row ${circuit.selected ? 'selected' : ''} ${!isEditing ? 'disabled' : ''}`}
      onClick={() => isEditing && onToggle(circuit.id)}
    >
      <div className="circuit-left">
        {isEditing && (
          <div {...attributes} {...listeners} className="drag-handle">
            <GripVertical size={18} />
          </div>
        )}
        <div className={`circuit-status-indicator ${circuit.status === 'on' ? 'on' : 'off'}`}>
          {circuit.status === 'on' ? '●' : '○'}
        </div>
        <div className="circuit-info">
          <span className="circuit-name">{circuit.name}</span>
          <span className="circuit-status-text">
            实际状态：{circuit.status === 'on' ? '开启' : '关闭'}
          </span>
        </div>
      </div>
      <div className="circuit-right">
        {circuit.selected ? (
          <div className="selected-badge">
            <Check size={14} />
            已选
          </div>
        ) : (
          <div className="unselected-badge">未选</div>
        )}
      </div>
    </div>
  );
};

interface SwitchCircuitControlDrawerProps {
  onClose: () => void;
  onConfirm: (mode: string) => void;
  initialMode: string;
  circuits: Circuit[];
  darkMode: boolean;
}

export const SwitchCircuitControlDrawer: React.FC<SwitchCircuitControlDrawerProps> = ({ 
  onClose, onConfirm, initialMode, circuits: initialCircuits, darkMode }) => {
  const [selectedMode, setSelectedMode] = useState<string>(initialMode);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasCustomMode, setHasCustomMode] = useState<boolean>(initialMode === 'custom');
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    const config = switchModeConfigs[selectedMode];
    const defaultCircuits = selectedMode === 'custom' 
      ? globalCustomCircuits 
      : config.defaultCircuits;
    
    setCircuits(initialCircuits.map(c => ({
      ...c,
      selected: defaultCircuits.includes(c.id)
    })));
  }, [selectedMode, initialCircuits]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCircuits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    setIsEditing(false);
    
    const config = switchModeConfigs[mode];
    const defaultCircuits = mode === 'custom' 
      ? globalCustomCircuits 
      : config.defaultCircuits;
    
    setCircuits(initialCircuits.map(c => ({
      ...c,
      selected: defaultCircuits.includes(c.id)
    })));
  };

  const toggleCircuit = (id: number) => {
    if (!isEditing) return;
    
    const newCircuits = circuits.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    );
    setCircuits(newCircuits);
  };

  const handleAdjustCircuits = () => {
    if (isEditing) {
      // 完成编辑，保存为自定义模式
      const selectedIds = circuits.filter(c => c.selected).map(c => c.id);
      setGlobalCustomCircuits(selectedIds);
      setHasCustomMode(true);
      setSelectedMode('custom');
      setSaveMessage('已保存为自定义模式');
      setTimeout(() => setSaveMessage(''), 2000);
    }
    setIsEditing(!isEditing);
  };

  const renderCircuitPreview = (mode: string) => {
    const config = switchModeConfigs[mode];
    const circuitsToShow = mode === 'custom' 
      ? globalCustomCircuits 
      : config.defaultCircuits;
    
    return (
      <div className="circuit-preview">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => (
          <div 
            key={id}
            className={`preview-dot ${circuitsToShow.includes(id) ? 'on' : 'off'}`}
          />
        ))}
      </div>
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedMode);
    onClose();
  };

  const config = switchModeConfigs[selectedMode];
  const circuitIds = circuits.map(c => c.id);
  const selectedCount = circuits.filter(c => c.selected).length;
  
  // 预设模式列表（不包含自定义）
  const presetModes = [
    { key: 'full-on', name: '全开', Icon: CircuitFullOn },
    { key: 'half-on-a', name: '1/2开-A', Icon: CircuitHalfOnA },
    { key: 'half-on-b', name: '1/2开-B', Icon: CircuitHalfOnB },
    { key: 'quarter-on', name: '1/4开', Icon: CircuitQuarterOn },
    { key: 'full-off', name: '全关', Icon: CircuitFullOff },
  ];

  // 图例包含自定义
  const legendItems = [
    ...presetModes,
    { key: 'custom', name: '自定义', Icon: CircuitCustom },
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer" style={{ width: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>开关与回路控制</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="legend-section" style={{ flexShrink: 0 }}>
            <div className="legend-title">图标说明</div>
            <div className="legend-grid">
              {legendItems.map((item) => (
                <div key={item.key} className="legend-item">
                  <item.Icon size={28} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="split-layout" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <div className="mode-selector-panel" style={{ overflow: 'auto' }}>
              <div className="panel-title">选择模式</div>
              {presetModes.map(({ key, name, Icon }) => (
                <div
                  key={key}
                  className={`mode-card ${selectedMode === key ? 'active' : ''}`}
                  onClick={() => handleModeChange(key)}
                >
                  <div className="mode-card-header">
                    <div className="mode-icon">
                      <Icon size={22} />
                    </div>
                    <div className="mode-name">{name}</div>
                  </div>
                  {renderCircuitPreview(key)}
                  <div className="mode-hint">预设模式</div>
                </div>
              ))}
              {hasCustomMode && (
                <div
                  className={`mode-card ${selectedMode === 'custom' ? 'active' : ''}`}
                  onClick={() => handleModeChange('custom')}
                >
                  <div className="mode-card-header">
                    <div className="mode-icon">
                      <CircuitCustom size={22} />
                    </div>
                    <div className="mode-name">自定义</div>
                  </div>
                  {renderCircuitPreview('custom')}
                  <div className="mode-hint">用户自定义</div>
                </div>
              )}
            </div>

            <div className="circuits-detail-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="panel-header" style={{ flexShrink: 0 }}>
                <div className="panel-title">回路详情</div>
                <div className="panel-actions">
                  <button 
                    className={`adjust-btn ${isEditing ? 'active' : ''}`}
                    onClick={handleAdjustCircuits}
                  >
                    <Settings size={14} />
                    {isEditing ? '完成调整' : '回路调整'}
                  </button>
                  {saveMessage && (
                    <span className="save-message">{saveMessage}</span>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="editing-notice" style={{ flexShrink: 0 }}>
                  编辑模式：拖拽排序或点击回路进行选择/取消，完成后点击"完成调整"保存为自定义模式
                </div>
              )}
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={circuitIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="circuits-list" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                    {circuits.map((circuit, index) => (
                      <SortableCircuitRow
                        key={circuit.id}
                        circuit={circuit}
                        index={index}
                        isEditing={isEditing}
                        onToggle={toggleCircuit}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="summary-info" style={{ flexShrink: 0 }}>
                <div className="summary-item">
                  <span className="label">已选回路：</span>
                  <span className="value">{selectedCount}/10</span>
                </div>
                <div className="summary-item">
                  <span className="label">当前模式：</span>
                  <span className="value mode-name">{config.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="drawer-footer" style={{ flexShrink: 0 }}>
            <button className="footer-btn cancel" onClick={onClose}>取消</button>
            <button className="footer-btn confirm" onClick={handleConfirm}>确定</button>
          </div>
        </div>

        <style jsx>{`
          .legend-section {
            padding: 16px;
            background: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .legend-title {
            font-size: 13px;
            font-weight: 600;
            color: ${darkMode ? '#94A3B8' : '#64748B'};
            margin-bottom: 12px;
          }

          .legend-grid {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .legend-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: ${darkMode ? '#94A3B8' : '#64748B'};
          }

          .split-layout {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }

          .mode-selector-panel {
            width: 200px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .circuits-detail-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .panel-title {
            font-size: 14px;
            font-weight: 600;
            color: ${darkMode ? '#94A3B8' : '#64748B'};
          }

          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .panel-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .adjust-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            background: ${darkMode ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.1)'};
            color: #0EA5E9;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .adjust-btn:hover {
            background: ${darkMode ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)'};
          }

          .adjust-btn.active {
            background: #0EA5E9;
            color: white;
          }

          .save-message {
            font-size: 12px;
            color: #34C759;
            font-weight: 600;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .editing-notice {
            padding: 8px 12px;
            background: ${darkMode ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)'};
            border-radius: 8px;
            font-size: 12px;
            color: #0EA5E9;
            margin-bottom: 12px;
            border-left: 3px solid #0EA5E9;
          }

          .mode-card {
            padding: 10px 12px;
            border-radius: 10px;
            border: 2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
            background: ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
            cursor: pointer;
            transition: all 0.2s;
          }

          .mode-card:hover {
            border-color: rgba(0, 122, 255, 0.5);
            background: ${darkMode ? 'rgba(0, 122, 255, 0.05)' : 'rgba(0, 122, 255, 0.03)'};
          }

          .mode-card.active {
            border-color: #007AFF;
            background: ${darkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.08)'};
          }

          .mode-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .mode-icon {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mode-name {
            font-weight: 600;
            font-size: 14px;
          }

          .circuit-preview {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-bottom: 4px;
          }

          .preview-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
          }

          .preview-dot.on {
            background: #34C759;
            border-color: #34C759;
          }

          .preview-dot.off {
            background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          }

          .mode-hint {
            font-size: 11px;
            color: ${darkMode ? '#64748B' : '#94A3B8'};
          }

          .circuits-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .circuit-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 14px;
            border-radius: 10px;
            border: 2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
            background: ${darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'};
            cursor: pointer;
            transition: all 0.2s;
          }

          .circuit-row:hover:not(.disabled) {
            border-color: rgba(0, 122, 255, 0.4);
          }

          .circuit-row.selected {
            border-color: #34C759;
            background: ${darkMode ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.08)'};
          }

          .circuit-row.disabled {
            cursor: default;
            opacity: 0.8;
          }

          .circuit-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .drag-handle {
            cursor: grab;
            display: flex;
            align-items: center;
            padding: 4px;
            color: ${darkMode ? '#64748B' : '#94A3B8'};
          }

          .drag-handle:active {
            cursor: grabbing;
          }

          .circuit-status-indicator {
            font-size: 16px;
            line-height: 1;
          }

          .circuit-status-indicator.on {
            color: #34C759;
          }

          .circuit-status-indicator.off {
            color: ${darkMode ? '#64748B' : '#94A3B8'};
          }

          .circuit-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .circuit-name {
            font-weight: 600;
            font-size: 14px;
          }

          .circuit-status-text {
            font-size: 12px;
            color: ${darkMode ? '#64748B' : '#94A3B8'};
          }

          .circuit-right {
            display: flex;
            align-items: center;
          }

          .selected-badge, .unselected-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
          }

          .selected-badge {
            background: #34C759;
            color: white;
          }

          .unselected-badge {
            background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
            color: ${darkMode ? '#94A3B8' : '#64748B'};
          }

          .summary-info {
            display: flex;
            gap: 20px;
            padding: 14px;
            border-radius: 10px;
            background: ${darkMode ? 'rgba(0, 122, 255, 0.08)' : 'rgba(0, 122, 255, 0.05)'};
            margin-top: 12px;
          }

          .summary-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .summary-item .label {
            font-size: 13px;
            color: ${darkMode ? '#94A3B8' : '#64748B'};
          }

          .summary-item .value {
            font-size: 14px;
            font-weight: 600;
          }

          .summary-item .value.mode-name {
            color: #007AFF;
          }

          .drawer-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding-top: 16px;
            border-top: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          }

          .footer-btn {
            padding: 12px 28px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
          }

          .footer-btn.cancel {
            background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
            color: ${darkMode ? '#FFFFFF' : '#1D1D1F'};
          }

          .footer-btn.confirm {
            background: #007AFF;
            color: #FFFFFF;
          }

          .footer-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </div>
  );
};
