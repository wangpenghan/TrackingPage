import React, { useState, useEffect, useRef } from 'react';
import { Button, Checkbox, Input, InputNumber } from 'antd';
import { X, Filter, RefreshCw, Clock } from 'lucide-react';

const DRAWER_WIDTH = 560;
const HEADER_PADDING = '14px 20px';
const CONTENT_PADDING = '16px 20px';

export interface PlanFilterState {
  highSpeed: boolean;
  normalSpeed: boolean;
  tracks: string[];
  waitingRooms: string[];
  timeConfig: number;
  origin: boolean;
  pass: boolean;
  end: boolean;
  through: boolean;
  passengerTrain: boolean;
  nonPassengerTrain: boolean;
  yuxiaHighSpeedField: boolean;
  donghuanIntercityField: boolean;
  // 计划变更筛选
  planChange: boolean;
  yesterdayChange: boolean;
  kemoChange: boolean;
  bothChange: boolean;
}

interface PlanFilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: PlanFilterState) => void;
  darkMode?: boolean;
  initialFilters?: PlanFilterState;
}

const DEFAULT_FILTERS: PlanFilterState = {
  // 列车类型默认全部选中（高铁+普速）
  highSpeed: true,
  normalSpeed: true,
  // 其他筛选条件默认不选
  tracks: [],
  waitingRooms: [],
  timeConfig: 4,
  origin: false,
  pass: false,
  end: false,
  through: false,
  passengerTrain: false,
  nonPassengerTrain: false,
  yuxiaHighSpeedField: false,
  donghuanIntercityField: false,
  // 计划变更筛选默认关闭
  planChange: false,
  yesterdayChange: false,
  kemoChange: false,
  bothChange: false
};

export const PlanFilterDrawer: React.FC<PlanFilterDrawerProps> = ({
  visible,
  onClose,
  onApply,
  darkMode = false,
  initialFilters
}) => {
  const [filters, setFilters] = useState<PlanFilterState>(initialFilters || DEFAULT_FILTERS);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters || DEFAULT_FILTERS);
    }
  }, [visible, initialFilters]);

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

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleTrackChange = (track: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tracks: checked
        ? [...prev.tracks, track]
        : prev.tracks.filter(t => t !== track)
    }));
  };

  const handleWaitingRoomChange = (room: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      waitingRooms: checked
        ? [...prev.waitingRooms, room]
        : prev.waitingRooms.filter(r => r !== room)
    }));
  };

  const toggleAllTracks = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tracks: checked ? Array.from({ length: 20 }, (_, i) => `${i + 1}`) : []
    }));
  };

  const toggleAllWaitingRooms = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      waitingRooms: checked ? ['1', '2', '3', '4', '5', '6'] : []
    }));
  };

  if (!visible) return null;

  // macOS 风格配色
  const getContainerStyle = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: `${DRAWER_WIDTH}px`,
    background: darkMode ? '#1E1E1E' : '#F5F5F7',
    zIndex: 1000,
    boxShadow: darkMode ? '-8px 0 32px rgba(0,0,0,0.5)' : '-8px 0 32px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column'
  });

  const getHeaderStyle = (): React.CSSProperties => ({
    padding: HEADER_PADDING,
    borderBottom: darkMode ? '1px solid #3A3A3C' : '1px solid #D1D1D6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: darkMode ? '#2C2C2E' : '#FFFFFF'
  });

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: '17px',
    fontWeight: 600,
    color: darkMode ? '#FFFFFF' : '#1D1D1F',
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  const getCloseButtonStyle = (): React.CSSProperties => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: darkMode ? '#8E8E93' : '#8E8E93',
    background: darkMode ? '#3A3A3C' : '#E5E5EA',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    border: 'none'
  });

  // macOS 风格卡片
  const getCardStyle = (): React.CSSProperties => ({
    background: darkMode ? '#2C2C2E' : '#FFFFFF',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '12px',
    border: darkMode ? '1px solid #3A3A3C' : '1px solid #E5E5EA',
    boxShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
  });

  const allTracksChecked = filters.tracks.length === 20;
  const indeterminateTracks = filters.tracks.length > 0 && filters.tracks.length < 20;

  const allWaitingRoomsChecked = filters.waitingRooms.length === 6;
  const indeterminateWaitingRooms = filters.waitingRooms.length > 0 && filters.waitingRooms.length < 6;

  // macOS 风格按钮 - 选中效果使用蓝色
  const getButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    borderRadius: '6px',
    padding: '5px 14px',
    height: '32px',
    background: isSelected
      ? '#007AFF'
      : (darkMode ? '#3A3A3C' : '#F2F2F7'),
    border: `1px solid ${isSelected
      ? '#007AFF'
      : (darkMode ? '#48484A' : '#E5E5EA')}`,
    color: isSelected ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#1D1D1F'),
    fontSize: '13px',
    fontWeight: isSelected ? 500 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  // 股道/候车室按钮样式 - macOS 风格
  const getGridButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    borderRadius: '6px',
    padding: '6px 0',
    height: '32px',
    background: isSelected
      ? '#007AFF'
      : (darkMode ? '#3A3A3C' : '#F2F2F7'),
    border: `1px solid ${isSelected
      ? '#007AFF'
      : (darkMode ? '#48484A' : '#E5E5EA')}`,
    color: isSelected ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#1D1D1F'),
    fontSize: '13px',
    fontWeight: isSelected ? 500 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  });

  // 标题样式 - macOS 风格
  const getSectionTitleStyle = (): React.CSSProperties => ({
    fontSize: '13px',
    fontWeight: 600,
    color: darkMode ? '#FFFFFF' : '#1D1D1F',
    marginBottom: '10px',
    letterSpacing: '-0.01em'
  });

  return (
    <div style={getContainerStyle()} ref={drawerRef}>
      <div style={getHeaderStyle()}>
        <div style={getTitleStyle()}>
          <Filter size={20} />
          <span>计划筛选</span>
        </div>
        <button
          style={getCloseButtonStyle()}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = darkMode ? '#48484A' : '#D1D1D6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = darkMode ? '#3A3A3C' : '#E5E5EA';
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: CONTENT_PADDING, flex: 1, overflowY: 'auto' }}>
        {/* 第一行：计划类型 + 时间配置 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {/* 计划类型 */}
          <div style={{ ...getCardStyle(), flex: 1, marginBottom: 0 }}>
            <div style={getSectionTitleStyle()}>计划类型</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilters(prev => ({ ...prev, highSpeed: !prev.highSpeed }))}
                style={getButtonStyle(filters.highSpeed)}
              >
                高铁
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, normalSpeed: !prev.normalSpeed }))}
                style={getButtonStyle(filters.normalSpeed)}
              >
                普速
              </button>
            </div>
          </div>

          {/* 时间配置 */}
          <div style={{ ...getCardStyle(), flex: 1, marginBottom: 0 }}>
            <div style={getSectionTitleStyle()}>时间配置</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: darkMode ? '#8E8E93' : '#8E8E93', fontSize: '13px' }}>未来</span>
              <InputNumber
            min={1}
            max={24}
            value={filters.timeConfig}
            onChange={(value) => setFilters(prev => ({ ...prev, timeConfig: value as number }))}
            style={{
              width: '60px',
              height: '40px',
              fontSize: '16px',
              fontWeight: 600,
              background: darkMode ? '#1C1C1E' : '#FFFFFF',
              border: darkMode ? '1px solid #3A3A3C' : '1px solid #D1D1D6',
              color: '#1890ff',
              borderRadius: '8px'
            }}
          />
              <span style={{ color: darkMode ? '#8E8E93' : '#8E8E93', fontSize: '13px' }}>小时内</span>
            </div>
          </div>
        </div>

        {/* 第二行：列车类型 + 站场筛选 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {/* 列车类型 */}
          <div style={{ ...getCardStyle(), flex: 1, marginBottom: 0 }}>
            <div style={getSectionTitleStyle()}>列车类型</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilters(prev => ({ ...prev, origin: !prev.origin }))}
                style={getButtonStyle(filters.origin)}
              >
                始发
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, pass: !prev.pass }))}
                style={getButtonStyle(filters.pass)}
              >
                途径
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, end: !prev.end }))}
                style={getButtonStyle(filters.end)}
              >
                终到
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, through: !prev.through }))}
                style={getButtonStyle(filters.through)}
              >
                通过
              </button>
            </div>
          </div>

          {/* 站场筛选 */}
          <div style={{ ...getCardStyle(), flex: 1, marginBottom: 0 }}>
            <div style={getSectionTitleStyle()}>站场筛选</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilters(prev => ({ ...prev, yuxiaHighSpeedField: !prev.yuxiaHighSpeedField }))}
                style={getButtonStyle(filters.yuxiaHighSpeedField)}
              >
                渝厦高铁场
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, donghuanIntercityField: !prev.donghuanIntercityField }))}
                style={getButtonStyle(filters.donghuanIntercityField)}
              >
                东环城际场
              </button>
            </div>
          </div>
        </div>

        {/* 股道 */}
        <div style={getCardStyle()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={getSectionTitleStyle()}>股道</div>
            <Checkbox
              checked={allTracksChecked}
              indeterminate={indeterminateTracks}
              onChange={(e) => toggleAllTracks(e.target.checked)}
              style={{ color: darkMode ? '#8E8E93' : '#8E8E93', fontSize: '12px' }}
            >
              全选
            </Checkbox>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {Array.from({ length: 20 }, (_, i) => `${i + 1}`).map(track => (
              <button
                key={track}
                onClick={() => handleTrackChange(track, !filters.tracks.includes(track))}
                style={getGridButtonStyle(filters.tracks.includes(track))}
              >
                {track}道
              </button>
            ))}
          </div>
        </div>

        {/* 候车室 */}
        <div style={getCardStyle()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={getSectionTitleStyle()}>候车室</div>
            <Checkbox
              checked={allWaitingRoomsChecked}
              indeterminate={indeterminateWaitingRooms}
              onChange={(e) => toggleAllWaitingRooms(e.target.checked)}
              style={{ color: darkMode ? '#8E8E93' : '#8E8E93', fontSize: '12px' }}
            >
              全选
            </Checkbox>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['1', '2', '3', '4', '5', '6'].map(room => (
              <button
                key={room}
                onClick={() => handleWaitingRoomChange(room, !filters.waitingRooms.includes(room))}
                style={getGridButtonStyle(filters.waitingRooms.includes(room))}
              >
                {room}候车室
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        padding: '14px 20px',
        borderTop: darkMode ? '1px solid #3A3A3C' : '1px solid #D1D1D6',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        background: darkMode ? '#2C2C2E' : '#FFFFFF'
      }}>
        <Button
          icon={<RefreshCw size={14} />}
          onClick={handleReset}
          style={{
            padding: '0 16px',
            fontSize: '13px',
            height: '36px',
            fontWeight: 500,
            borderRadius: '8px',
            background: darkMode ? '#2C2C2E' : '#FFFFFF',
            color: darkMode ? '#F5F5F7' : '#1D1D1F',
            border: `1px solid ${darkMode ? '#38383A' : '#D2D2D7'}`,
            boxShadow: 'none'
          }}
        >
          重置
        </Button>
        <Button
          type="primary"
          onClick={handleApply}
          style={{
            padding: '0 20px',
            fontSize: '13px',
            height: '36px',
            fontWeight: 500,
            borderRadius: '8px',
            background: darkMode ? '#0A84FF' : '#007AFF',
            border: 'none',
            color: '#FFFFFF',
            boxShadow: 'none'
          }}
        >
          应用
        </Button>
      </div>
    </div>
  );
};
