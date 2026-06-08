import React, { useState, useEffect } from 'react';
import { Button, Select, Checkbox, Row, Col, Tooltip, Popconfirm, Modal } from 'antd';
import { X, Save, RotateCcw, Pause, Hand, Play } from 'lucide-react';
import dayjs from 'dayjs';
import { mockTrainSchedules, TrainSchedule } from './mock-data';
import { TimeAdjustDrawer } from './components/TimeAdjustDrawer';

const { Option } = Select;

export type OperationType = 'timeAdjust' | 'checkInOutAdjust' | 'trackPlatformAdjust' | 'gateAdjust' | null;

interface OperationDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  operationType: OperationType;
  darkMode?: boolean;
}

export const OperationDrawer: React.FC<OperationDrawerProps> = ({
  visible,
  onClose,
  trainId,
  operationType,
  darkMode = false
}) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  if (!visible || !train) return null;

  const getDrawerTitle = () => {
    switch (operationType) {
      case 'timeAdjust':
        return '时间调整';
      case 'checkInOutAdjust':
        return '开停检调整';
      case 'trackPlatformAdjust':
        return '股道/站台调整';
      case 'gateAdjust':
        return '候检信息调整';
      default:
        return '操作面板';
    }
  };

  const handleUnsavedChanges = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认关闭',
        content: '您有未保存的修改，是否继续关闭？',
        okText: '不保存关闭',
        cancelText: '取消',
        onOk: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = () => {
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const renderContent = () => {
    switch (operationType) {
      case 'timeAdjust':
        return <TimeAdjustDrawer train={train} onClose={handleClose} onSaveAndClose={handleSaveAndClose} darkMode={darkMode} onUnsavedChanges={handleUnsavedChanges} />;
      case 'checkInOutAdjust':
        return <CheckInOutAdjustPanel train={train} onClose={handleClose} darkMode={darkMode} onUnsavedChanges={handleUnsavedChanges} />;
      case 'trackPlatformAdjust':
        return <TrackPlatformAdjustPanel train={train} onClose={handleClose} darkMode={darkMode} onUnsavedChanges={handleUnsavedChanges} />;
      case 'gateAdjust':
        return <GateAdjustPanel train={train} onClose={handleClose} darkMode={darkMode} onUnsavedChanges={handleUnsavedChanges} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div style={getOverlayStyle(darkMode)} onClick={handleOverlayClick} />
      
      <div style={getContainerStyle(darkMode)}>
        <div style={getHeaderStyle(darkMode)}>
          <div style={getTitleStyle(darkMode)}>
            {getDrawerTitle()}
            {hasUnsavedChanges && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.1)',
                color: darkMode ? '#F59E0B' : '#D97706',
                border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.2)'}`
              }}>未保存</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={getTrainNoBadgeStyle(darkMode)}>{train.trainNo}</div>
            <Button 
              type="text" 
              icon={<X size={20} />} 
              onClick={handleClose} 
              style={getCloseButtonStyle(darkMode)}
            />
          </div>
        </div>

        <div style={getContentStyle(darkMode)}>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

const getOverlayStyle = (darkMode: boolean): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  zIndex: 999
});

const getContainerStyle = (darkMode: boolean): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '560px',
  background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
  zIndex: 1000,
  boxShadow: darkMode ? '-8px 0 24px rgba(0,0,0,0.4)' : '-8px 0 24px rgba(29,78,95,0.12)',
  display: 'flex',
  flexDirection: 'column'
});

const getHeaderStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '14px 20px',
  borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
});

const getTitleStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '17px',
  fontWeight: '600',
  color: darkMode ? '#E2E8F0' : '#1F2937',
  letterSpacing: '0.5px',
  fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
});

const getTrainNoBadgeStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode
    ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
    : 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 50%, #FEF7E6 100%)',
  padding: '6px 20px',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: darkMode ? '#FBBF24' : '#92400E',
  border: darkMode ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(217, 119, 6, 0.2)',
  fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
});

const getCloseButtonStyle = (darkMode: boolean): React.CSSProperties => ({
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  color: darkMode ? '#94A3B8' : '#64748B',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF'
});

const getContentStyle = (darkMode: boolean): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  background: darkMode ? 'transparent' : '#FAF8F5'
});

const getCardStyle = (darkMode: boolean): React.CSSProperties => ({
  borderRadius: '10px',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
  padding: '14px 16px',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
  boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
});

const getCtcCardStyle = (darkMode: boolean): React.CSSProperties => ({
  borderRadius: '10px',
  background: darkMode 
    ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(180, 83, 9, 0.08) 100%)' 
    : 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 50%, #FEF7E6 100%)',
  padding: '14px 16px',
  border: darkMode ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(217, 119, 6, 0.2)',
  boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
});

const getPrimaryButtonStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '0 20px',
  fontSize: '13px',
  height: '36px',
  fontWeight: 500,
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
  border: 'none',
  color: '#FFFFFF',
  boxShadow: 'none'
});

const getSecondaryButtonStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '0 16px',
  fontSize: '13px',
  height: '40px',
  fontWeight: 500,
  borderRadius: '8px',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
  color: darkMode ? '#5DA3B3' : '#1D4E5F',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.2)',
  boxShadow: 'none'
});

const getSelectStyle = (darkMode: boolean): React.CSSProperties => ({
  width: '100%',
  height: '40px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)',
  color: '#1890ff'
});

const getInputStyle = (darkMode: boolean): React.CSSProperties => ({
  width: '100%',
  height: '40px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)',
  color: '#1890ff'
});

const getLabelStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '12px',
  marginBottom: '6px',
  color: darkMode ? '#94A3B8' : '#6B7280',
  fontWeight: '500',
  letterSpacing: '0.3px'
});

const getInfoCardTitleStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '12px',
  color: darkMode ? '#94A3B8' : '#6B7280',
  marginBottom: '4px',
  fontWeight: '500',
  letterSpacing: '0.3px'
});

const getInfoCardValueStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '17px',
  fontWeight: 'bold',
  color: darkMode ? '#F1F5F9' : '#1F2937',
  fontFamily: "'Noto Serif SC', 'Source Serif Pro', serif"
});

const CheckInOutAdjustPanel: React.FC<{ train: TrainSchedule; onClose: () => void; darkMode: boolean; onUnsavedChanges: (hasChanges: boolean) => void }> = ({ train, onClose, darkMode, onUnsavedChanges }) => {
  const now = dayjs();
  const displayDateStr = now.format('YYYY/M/D');

  // 获取基准时间（到点或发点）
  const getBaseTime = (base: 'arrival' | 'departure') => {
    const timeStr = base === 'arrival' 
      ? (train.arrival.actualTime || train.arrival.time)
      : (train.departure.actualTime || train.departure.time);
    return dayjs(`${now.format('YYYY-MM-DD')} ${timeStr}`);
  };

  // 初始状态 - 默认使用发点作为基准
  const defaultCheckInBase = 'departure';
  const defaultCheckInOffset = -20; // 发车前20分钟
  const defaultCheckOutBase = 'departure';
  const defaultCheckOutOffset = -5; // 发车前5分钟

  // 开检状态
  const [checkInBase, setCheckInBase] = useState<'arrival' | 'departure'>(defaultCheckInBase);
  const [checkInOffset, setCheckInOffset] = useState<number>(defaultCheckInOffset);

  // 停检状态
  const [checkOutBase, setCheckOutBase] = useState<'arrival' | 'departure'>(defaultCheckOutBase);
  const [checkOutOffset, setCheckOutOffset] = useState<number>(defaultCheckOutOffset);

  // 计算当前开检/停检时间
  const getCheckInTime = () => getBaseTime(checkInBase).add(checkInOffset, 'minute');
  const getCheckOutTime = () => getBaseTime(checkOutBase).add(checkOutOffset, 'minute');

  // 检测是否有未保存的修改
  useEffect(() => {
    const hasChanges = 
      checkInBase !== defaultCheckInBase || 
      checkInOffset !== defaultCheckInOffset || 
      checkOutBase !== defaultCheckOutBase || 
      checkOutOffset !== defaultCheckOutOffset;
    onUnsavedChanges(hasChanges);
  }, [checkInBase, checkInOffset, checkOutBase, checkOutOffset, onUnsavedChanges]);

  // 参数变化颜色提醒样式
  const getChangedStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
    borderColor: isChanged ? (darkMode ? '#F59E0B' : '#D97706') : undefined,
    backgroundColor: isChanged 
      ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)') 
      : undefined
  });

  // 判断值是否变化
  const isCheckInBaseChanged = checkInBase !== defaultCheckInBase;
  const isCheckInOffsetChanged = checkInOffset !== defaultCheckInOffset;
  const isCheckOutBaseChanged = checkOutBase !== defaultCheckOutBase;
  const isCheckOutOffsetChanged = checkOutOffset !== defaultCheckOutOffset;

  // 计算相对时间样式 - 放大突出
  const getOffsetStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
    fontSize: '28px',
    fontWeight: 'bold',
    color: isChanged ? (darkMode ? '#F59E0B' : '#D97706') : (darkMode ? '#F1F5F9' : '#1F2937'),
    transition: 'all 0.2s ease',
    textShadow: isChanged ? (darkMode ? '0 0 8px rgba(245, 158, 11, 0.4)' : '0 0 8px rgba(217, 119, 6, 0.3)') : 'none'
  });

  // 快速调整按钮
  const handleQuickAdjust = (type: 'checkIn' | 'checkOut', delta: number) => {
    if (type === 'checkIn') {
      setCheckInOffset(prev => prev + delta);
    } else {
      setCheckOutOffset(prev => prev + delta);
    }
  };

  const handleReset = () => {
    setCheckInBase(defaultCheckInBase);
    setCheckInOffset(defaultCheckInOffset);
    setCheckOutBase(defaultCheckOutBase);
    setCheckOutOffset(defaultCheckOutOffset);
  };

  const handleSave = () => {
    console.log('Save check in/out adjustments:', {
      checkIn: {
        time: getCheckInTime().format('YYYY-MM-DD HH:mm'),
        base: checkInBase,
        offset: checkInOffset
      },
      checkOut: {
        time: getCheckOutTime().format('YYYY-MM-DD HH:mm'),
        base: checkOutBase,
        offset: checkOutOffset
      }
    });
    onUnsavedChanges(false);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 实际时间信息 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
        padding: '14px 16px',
        borderRadius: '10px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '6px' }}>实际到点</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {train.arrival.actualTime || train.arrival.time}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '6px' }}>实际发点</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {train.departure.actualTime || train.departure.time}
            </div>
          </Col>
        </Row>
      </div>

      {/* 开停检调整 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '16px',
        borderRadius: '10px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <Row gutter={20}>
          {/* 左侧 - 开检调整 */}
          <Col span={12}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              padding: '8px 0',
              background: darkMode ? 'rgba(42, 107, 124, 0.2)' : 'rgba(29, 78, 95, 0.05)',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: '700',
                color: darkMode ? '#E2E8F0' : '#374151'
              }}>开检时间</span>
            </div>
            
            {/* 相对时间 - 核心交互区域 */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              marginBottom: '16px',
              background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F8FAFC',
              borderRadius: '10px',
              border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)'
            }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '8px', fontWeight: '500' }}>相对于基准时间</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                  onClick={() => handleQuickAdjust('checkIn', -1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB',
                    background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#FFFFFF',
                    color: darkMode ? '#E2E8F0' : '#374151',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  -
                </button>
                <div style={getOffsetStyle(isCheckInOffsetChanged, darkMode)}>
                  {checkInOffset > 0 ? `+${checkInOffset}` : checkInOffset}
                </div>
                <button
                  onClick={() => handleQuickAdjust('checkIn', 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB',
                    background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#FFFFFF',
                    color: darkMode ? '#E2E8F0' : '#374151',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  +
                </button>
              </div>
              <div style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748B', fontWeight: '500' }}>分钟</div>
            </div>

            {/* 快速调整按钮 */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleQuickAdjust('checkIn', -5)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                -5
              </button>
              <button
                onClick={() => handleQuickAdjust('checkIn', -1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                -1
              </button>
              <button
                onClick={() => handleQuickAdjust('checkIn', 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                +1
              </button>
              <button
                onClick={() => handleQuickAdjust('checkIn', 5)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                +5
              </button>
            </div>

            {/* 计算出的实际开检时间 */}
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
              borderRadius: '8px',
              marginBottom: '12px',
              border: darkMode ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #A7F3D0'
            }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#6EE7B7' : '#065F46', marginBottom: '4px' }}>开检时间</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#A7F3D0' : '#047857', fontFamily: 'monospace' }}>
                {getCheckInTime().format('HH:mm')}
              </div>
            </div>

            {/* 基准选择 */}
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '6px', fontWeight: '500' }}>基准时间</div>
            <Select 
              value={checkInBase} 
              onChange={setCheckInBase}
              style={{ ...getSelectStyle(darkMode), height: '40px', ...getChangedStyle(isCheckInBaseChanged, darkMode) }}
            >
              <Option value="arrival">到点 - {train.arrival.actualTime || train.arrival.time}</Option>
              <Option value="departure">发点 - {train.departure.actualTime || train.departure.time}</Option>
            </Select>
          </Col>

          {/* 右侧 - 停检调整 */}
          <Col span={12}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              padding: '8px 0',
              background: darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: '700',
                color: darkMode ? '#FCA5A5' : '#991B1B'
              }}>停检时间</span>
            </div>
            
            {/* 相对时间 - 核心交互区域 */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              marginBottom: '16px',
              background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F8FAFC',
              borderRadius: '10px',
              border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)'
            }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '8px', fontWeight: '500' }}>相对于基准时间</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                  onClick={() => handleQuickAdjust('checkOut', -1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB',
                    background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#FFFFFF',
                    color: darkMode ? '#E2E8F0' : '#374151',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  -
                </button>
                <div style={getOffsetStyle(isCheckOutOffsetChanged, darkMode)}>
                  {checkOutOffset > 0 ? `+${checkOutOffset}` : checkOutOffset}
                </div>
                <button
                  onClick={() => handleQuickAdjust('checkOut', 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB',
                    background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#FFFFFF',
                    color: darkMode ? '#E2E8F0' : '#374151',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  +
                </button>
              </div>
              <div style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748B', fontWeight: '500' }}>分钟</div>
            </div>

            {/* 快速调整按钮 */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleQuickAdjust('checkOut', -5)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                -5
              </button>
              <button
                onClick={() => handleQuickAdjust('checkOut', -1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                -1
              </button>
              <button
                onClick={() => handleQuickAdjust('checkOut', 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                +1
              </button>
              <button
                onClick={() => handleQuickAdjust('checkOut', 5)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F3F4F6',
                  color: darkMode ? '#94A3B8' : '#64748B',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                +5
              </button>
            </div>

            {/* 计算出的实际停检时间 */}
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
              borderRadius: '8px',
              marginBottom: '12px',
              border: darkMode ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #FECACA'
            }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#FCA5A5' : '#991B1B', marginBottom: '4px' }}>停检时间</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#FECACA' : '#B91C1C', fontFamily: 'monospace' }}>
                {getCheckOutTime().format('HH:mm')}
              </div>
            </div>

            {/* 基准选择 */}
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '6px', fontWeight: '500' }}>基准时间</div>
            <Select 
              value={checkOutBase} 
              onChange={setCheckOutBase}
              style={{ ...getSelectStyle(darkMode), height: '40px', ...getChangedStyle(isCheckOutBaseChanged, darkMode) }}
            >
              <Option value="arrival">到点 - {train.arrival.actualTime || train.arrival.time}</Option>
              <Option value="departure">发点 - {train.departure.actualTime || train.departure.time}</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* 底部按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
        <Button onClick={handleReset} style={{ ...getSecondaryButtonStyle(darkMode), height: '42px', fontSize: '14px' }} icon={<RotateCcw size={16} />}>
          恢复默认
        </Button>
        <Popconfirm
          title="确认保存开停检调整？"
          description={`开检时间：${getCheckInTime().format('YYYY-MM-DD HH:mm')}\n停检时间：${getCheckOutTime().format('YYYY-MM-DD HH:mm')}`}
          onConfirm={handleSave}
          okText="确认"
          cancelText="取消"
        >
          <Button 
            type="primary" 
            style={{ ...getPrimaryButtonStyle(darkMode), height: '42px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            icon={<Save size={16} />}
          >
            保存
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

const TrackPlatformAdjustPanel: React.FC<{ train: TrainSchedule; onClose: () => void; darkMode: boolean; onUnsavedChanges: (hasChanges: boolean) => void }> = ({ train, onClose, darkMode, onUnsavedChanges }) => {
  const [linkageAdjust, setLinkageAdjust] = useState(true);
  const [isAutoReceive, setIsAutoReceive] = useState(true);

  // 图定值
  const scheduledTrack = train.location.track;
  const scheduledPlatform = train.location.platform;

  // 根据图定股道获取默认联动信息
  const defaultLinkageInfo = (() => {
    const trackNum = parseInt(`${scheduledTrack}`);
    if (trackNum <= 10) {
      return { waitingHall: 'high', checkInGate: '6b7b', exitGate: 'a2' };
    } else {
      return { waitingHall: 'normal', checkInGate: '1a1b', exitGate: 'b1' };
    }
  })();

  // 初始状态
  const initialState = {
    actualTrack: `${scheduledTrack}G`,
    actualPlatform: scheduledPlatform,
    waitingHall: defaultLinkageInfo.waitingHall,
    checkInGate: train.location.checkInGate || defaultLinkageInfo.checkInGate,
    exitGate: train.location.exitGate || defaultLinkageInfo.exitGate
  };

  // 状态管理
  const [actualTrack, setActualTrack] = useState(initialState.actualTrack);
  const [actualPlatform, setActualPlatform] = useState(initialState.actualPlatform);
  const [waitingHall, setWaitingHall] = useState(initialState.waitingHall);
  const [checkInGate, setCheckInGate] = useState(initialState.checkInGate);
  const [exitGate, setExitGate] = useState(initialState.exitGate);

  // 检测是否有未保存的修改
  useEffect(() => {
    const currentState = {
      actualTrack,
      actualPlatform,
      waitingHall,
      checkInGate,
      exitGate
    };
    const hasChanges = JSON.stringify(currentState) !== JSON.stringify(initialState);
    onUnsavedChanges(hasChanges);
  }, [actualTrack, actualPlatform, waitingHall, checkInGate, exitGate, initialState, onUnsavedChanges]);

  // 参数变化颜色提醒样式
  const getChangedStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
    borderColor: isChanged ? (darkMode ? '#F59E0B' : '#D97706') : undefined,
    backgroundColor: isChanged
      ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)')
      : undefined
  });

  // 判断值是否变化（与初始状态比较，只有用户修改后才标记）
  const isTrackChanged = actualTrack !== initialState.actualTrack;
  const isPlatformChanged = actualPlatform !== initialState.actualPlatform;
  const isWaitingHallChanged = waitingHall !== initialState.waitingHall;
  const isCheckInGateChanged = checkInGate !== initialState.checkInGate;
  const isExitGateChanged = exitGate !== initialState.exitGate;

  const trackOptions = Array.from({ length: 20 }, (_, i) => ({ value: `${i + 1}G`, label: `${i + 1}G` }));
  const platformOptions = Array.from({ length: 20 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` }));
  const waitingHallOptions = [
    { value: 'high', label: '高架层候车大厅' },
    { value: 'normal', label: '普通候车室' }
  ];
  const checkInGateOptions = [
    { value: '6b7b', label: '6B_7B' },
    { value: '1a1b', label: '1A_1B' },
    { value: '2a2b', label: '2A_2B' }
  ];
  const exitGateOptions = [
    { value: 'a2', label: 'A2出站口' },
    { value: 'b1', label: 'B1出站口' }
  ];

  // 股道-站台联动映射（股道1-10对应站台1-10，股道11-20对应站台1-10）
  const getPlatformFromTrack = (track: string) => {
    const trackNum = parseInt(track.replace('G', ''));
    return String(trackNum <= 10 ? trackNum : trackNum - 10);
  };

  // 股道-候车室/检票口/出站口联动映射
  const getLinkageInfo = (track: string) => {
    const trackNum = parseInt(track.replace('G', ''));
    // 股道1-10：高架层候车大厅 + 6B_7B检票口 + A2出站口
    // 股道11-20：普通候车室 + 1A_1B检票口 + B1出站口
    if (trackNum <= 10) {
      return { waitingHall: 'high', checkInGate: '6b7b', exitGate: 'a2' };
    } else {
      return { waitingHall: 'normal', checkInGate: '1a1b', exitGate: 'b1' };
    }
  };

  // 处理股道变化
  const handleTrackChange = (track: string) => {
    setActualTrack(track);
    // 联动修改站台
    const newPlatform = getPlatformFromTrack(track);
    setActualPlatform(newPlatform);

    // 如果开启联动调整，自动修改候车室/检票口/出站口
    if (linkageAdjust) {
      const linkageInfo = getLinkageInfo(track);
      setWaitingHall(linkageInfo.waitingHall);
      setCheckInGate(linkageInfo.checkInGate);
      setExitGate(linkageInfo.exitGate);
    }
  };

  // 处理站台变化（反向联动股道）
  const handlePlatformChange = (platform: string) => {
    setActualPlatform(platform);
    const platformNum = parseInt(platform);
    const currentTrackNum = parseInt(actualTrack.replace('G', ''));
    // 保持股道组（1-10或11-20），只修改站台号
    const newTrackNum = currentTrackNum <= 10 ? platformNum : platformNum + 10;
    const newTrack = `${newTrackNum}G`;
    setActualTrack(newTrack);

    // 如果开启联动调整，自动修改候车室/检票口/出站口
    if (linkageAdjust) {
      const linkageInfo = getLinkageInfo(newTrack);
      setWaitingHall(linkageInfo.waitingHall);
      setCheckInGate(linkageInfo.checkInGate);
      setExitGate(linkageInfo.exitGate);
    }
  };

  // 处理停止接收
  const handleStopReceive = () => {
    setIsAutoReceive(false);
    console.log('停止接收CTC');
  };

  // 处理手动接收
  const handleManualReceive = () => {
    setIsAutoReceive(true);
    console.log('手动接收CTC');
  };

  const handleReset = () => {
    // 恢复为图定信息（保持联动状态和CTC接收状态不变）
    setActualTrack(initialState.actualTrack);
    setActualPlatform(initialState.actualPlatform);
    setWaitingHall(initialState.waitingHall);
    setCheckInGate(initialState.checkInGate);
    setExitGate(initialState.exitGate);
    // 注意：不修改 linkageAdjust 和 isAutoReceive，保持当前状态
  };

  const handleSave = () => {
    console.log('Save track/platform adjustments:', {
      track: actualTrack,
      platform: actualPlatform,
      waitingHall,
      checkInGate,
      exitGate
    });
    onUnsavedChanges(false);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 图定信息 - 紧凑布局 */}
      <Row gutter={12}>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>图定股道</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937' }}>{scheduledTrack}G</div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>图定站台</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937' }}>{scheduledPlatform}</div>
          </div>
        </Col>
      </Row>

      {/* CTC信息 - 与时间调整面板风格一致 */}
      <div style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(180, 83, 9, 0.06) 100%)'
          : 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 100%)',
        padding: '10px 12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(217, 119, 6, 0.25)' : '1px solid rgba(217, 119, 6, 0.15)'
      }}>
        <Row gutter={12} align="middle">
          <Col span={7}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>CTC股道</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937' }}>{scheduledTrack}G</div>
          </Col>
          <Col span={6}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>CTC状态</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isAutoReceive 
                ? (darkMode ? 'rgba(125, 211, 252, 0.15)' : '#E0F2FE')
                : (darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2'),
              color: isAutoReceive 
                ? (darkMode ? '#38BDF8' : '#0369A1')
                : (darkMode ? '#F87171' : '#DC2626'),
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              border: isAutoReceive
                ? (darkMode ? '1px solid rgba(125, 211, 252, 0.3)' : '1px solid rgba(56, 189, 248, 0.2)')
                : (darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(220, 38, 38, 0.2)')
            }}>
              {isAutoReceive ? '自动接收' : '已停止'}
            </div>
          </Col>
          <Col span={11} style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <Tooltip title="停止接收">
              <Button
                size="small"
                icon={<Pause size={14} />}
                onClick={handleStopReceive}
                style={{ 
                  height: '32px', 
                  width: '32px',
                  padding: 0,
                  borderRadius: '6px', 
                  ...getSecondaryButtonStyle(darkMode),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Tooltip>
            <Tooltip title="手动接收">
              <Button
                size="small"
                icon={<Hand size={14} />}
                onClick={handleManualReceive}
                style={{ 
                  height: '32px', 
                  width: '32px',
                  padding: 0,
                  borderRadius: '6px', 
                  ...getSecondaryButtonStyle(darkMode),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Tooltip>
          </Col>
        </Row>
      </div>

      {/* 实际股道/站台调整 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151', marginBottom: '10px' }}>实际调整</div>
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>实际股道</div>
            <Select 
              value={actualTrack}
              onChange={handleTrackChange}
              style={{ ...getSelectStyle(darkMode), ...getChangedStyle(isTrackChanged, darkMode) }}
            >
              {trackOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>实际站台</div>
            <Select 
              value={actualPlatform}
              onChange={handlePlatformChange}
              style={{ ...getSelectStyle(darkMode), ...getChangedStyle(isPlatformChanged, darkMode) }}
            >
              {platformOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* 联动调整 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151', flex: 1 }}>关联信息</span>
          <Checkbox 
            checked={linkageAdjust} 
            onChange={(e) => setLinkageAdjust(e.target.checked)}
            style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}
          >
            联动调整
          </Checkbox>
        </div>
        <Row gutter={12}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>候车室</div>
            <Select 
              value={waitingHall} 
              onChange={setWaitingHall}
              style={{ ...getSelectStyle(darkMode), height: '36px', ...getChangedStyle(isWaitingHallChanged, darkMode) }}
            >
              {waitingHallOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>检票口</div>
            <Select 
              value={checkInGate} 
              onChange={setCheckInGate}
              style={{ ...getSelectStyle(darkMode), ...getChangedStyle(isCheckInGateChanged, darkMode) }}
            >
              {checkInGateOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>出站口</div>
            <Select 
              value={exitGate} 
              onChange={setExitGate}
              style={{ ...getSelectStyle(darkMode), ...getChangedStyle(isExitGateChanged, darkMode) }}
            >
              {exitGateOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* 底部按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
        <Button onClick={handleReset} style={{ ...getSecondaryButtonStyle(darkMode), height: '40px', fontSize: '14px' }} icon={<RotateCcw size={14} />}>
          恢复默认
        </Button>
        <Button 
          type="primary" 
          onClick={handleSave} 
          style={{ ...getPrimaryButtonStyle(darkMode), height: '40px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          icon={<Save size={14} />}
        >
          保存
        </Button>
      </div>
    </div>
  );
};

const GateAdjustPanel: React.FC<{ train: TrainSchedule; onClose: () => void; darkMode: boolean; onUnsavedChanges: (hasChanges: boolean) => void }> = ({ train, onClose, darkMode, onUnsavedChanges }) => {
  // 根据图定股道获取默认联动信息
  const scheduledTrack = train.location.track;
  const defaultLinkageInfo = (() => {
    const trackNum = parseInt(`${scheduledTrack}`);
    if (trackNum <= 10) {
      return { waitingHall: 'high', checkInGate: '6b7b', exitGate: 'a2' };
    } else {
      return { waitingHall: 'normal', checkInGate: '1a1b', exitGate: 'b1' };
    }
  })();

  // 初始状态
  const initialState = {
    waitingHall: defaultLinkageInfo.waitingHall,
    checkInGate: train.location.checkInGate || defaultLinkageInfo.checkInGate,
    exitGate: train.location.exitGate || defaultLinkageInfo.exitGate
  };

  // 状态管理
  const [waitingHall, setWaitingHall] = useState(initialState.waitingHall);
  const [checkInGate, setCheckInGate] = useState(initialState.checkInGate);
  const [exitGate, setExitGate] = useState(initialState.exitGate);

  // 检测是否有未保存的修改
  useEffect(() => {
    const currentState = {
      waitingHall,
      checkInGate,
      exitGate
    };
    const hasChanges = JSON.stringify(currentState) !== JSON.stringify(initialState);
    onUnsavedChanges(hasChanges);
  }, [waitingHall, checkInGate, exitGate, initialState, onUnsavedChanges]);

  const waitingHallOptions = [
    { value: 'high', label: '高架层候车大厅' },
    { value: 'normal', label: '普通候车室' }
  ];
  const checkInGateOptions = [
    { value: '6b7b', label: '6B_7B' },
    { value: '1a1b', label: '1A_1B' },
    { value: '2a2b', label: '2A_2B' }
  ];
  const exitGateOptions = [
    { value: 'a2', label: 'A2出站口' },
    { value: 'b1', label: 'B1出站口' }
  ];

  // 参数变化颜色提醒样式
  const getChangedStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
    borderColor: isChanged ? (darkMode ? '#F59E0B' : '#D97706') : undefined,
    backgroundColor: isChanged
      ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)')
      : undefined
  });

  // 判断值是否变化
  const isWaitingHallChanged = waitingHall !== defaultLinkageInfo.waitingHall;
  const isCheckInGateChanged = checkInGate !== defaultLinkageInfo.checkInGate;
  const isExitGateChanged = exitGate !== defaultLinkageInfo.exitGate;

  const handleReset = () => {
    setWaitingHall(initialState.waitingHall);
    setCheckInGate(initialState.checkInGate);
    setExitGate(initialState.exitGate);
  };

  const handleSave = () => {
    console.log('Save gate adjustments:', { waitingHall, checkInGate, exitGate });
    onUnsavedChanges(false);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 实际信息 - 紧凑布局 */}
      <Row gutter={12}>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>实际股道</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937' }}>{train.location.track}G</div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>实际站台</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937' }}>{train.location.platform}</div>
          </div>
        </Col>
      </Row>

      {/* 候检信息调整 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151', marginBottom: '10px' }}>候检信息调整</div>
        <Row gutter={12}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>候车室</div>
            <Select 
              value={waitingHall} 
              onChange={setWaitingHall}
              style={{ ...getSelectStyle(darkMode), height: '36px', ...getChangedStyle(isWaitingHallChanged, darkMode) }}
            >
              {waitingHallOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>检票口</div>
            <Select 
              value={checkInGate} 
              onChange={setCheckInGate}
              style={{ ...getSelectStyle(darkMode), ...getChangedStyle(isCheckInGateChanged, darkMode) }}
            >
              {checkInGateOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>出站口</div>
            <Select 
              value={exitGate} 
              onChange={setExitGate}
              style={{ ...getSelectStyle(darkMode), ...getChangedStyle(isExitGateChanged, darkMode) }}
            >
              {exitGateOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* 底部按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
        <Button onClick={handleReset} style={{ ...getSecondaryButtonStyle(darkMode) }} icon={<RotateCcw size={14} />}>
          恢复默认
        </Button>
        <Button 
          type="primary" 
          onClick={handleSave} 
          style={{ ...getPrimaryButtonStyle(darkMode), display: 'flex', alignItems: 'center', gap: '6px' }}
          icon={<Save size={14} />}
        >
          保存
        </Button>
      </div>
    </div>
  );
};
