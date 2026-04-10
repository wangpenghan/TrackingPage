import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Checkbox, Card, Row, Col, Tooltip, DatePicker, TimePicker, Popconfirm, Modal } from 'antd';
import { X, Save, RotateCcw, Pause, Hand, Play } from 'lucide-react';
import dayjs from 'dayjs';
import { mockTrainSchedules, TrainSchedule } from './mock-data';

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const renderContent = () => {
    switch (operationType) {
      case 'timeAdjust':
        return <TimeAdjustPanel train={train} onClose={handleClose} darkMode={darkMode} onUnsavedChanges={handleUnsavedChanges} />;
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

const TimeAdjustPanel: React.FC<{ train: TrainSchedule; onClose: () => void; darkMode: boolean; onUnsavedChanges: (hasChanges: boolean) => void }> = ({ train, onClose, darkMode, onUnsavedChanges }) => {
  const now = dayjs();
  const todayStr = now.format('YYYY-MM-DD');
  const displayDateStr = now.format('YYYY/M/D');

  const [isCumulative, setIsCumulative] = useState(false);
  const [isDefer, setIsDefer] = useState(false);
  const [adjustValue, setAdjustValue] = useState('');
  // CTC状态：'auto' 自动接收, 'stopped' 已停止
  const [ctcStatus, setCtcStatus] = useState<'auto' | 'stopped'>('auto');
  
  // 初始值
  const initialTimes = {
    arrivalDate: todayStr,
    arrivalTime: train.arrival.time,
    departureDate: todayStr,
    departureTime: train.departure.time,
    checkInOpenTime: dayjs(`${todayStr} ${train.departure.time}`).subtract(20, 'minute').format('YYYY-MM-DD HH:mm'),
    checkInCloseTime: dayjs(`${todayStr} ${train.departure.time}`).subtract(5, 'minute').format('YYYY-MM-DD HH:mm'),
    checkOutOpenTime: dayjs(`${todayStr} ${train.arrival.time}`).format('YYYY-MM-DD HH:mm'),
    checkOutCloseTime: dayjs(`${todayStr} ${train.departure.time}`).add(30, 'minute').format('YYYY-MM-DD HH:mm')
  };
  
  // CTC数据（外部接口数据，只读）
  const ctcData = {
    arrivalTime: train.arrival.actualTime || train.arrival.time,
    departureTime: train.departure.actualTime || train.departure.time
  };
  
  const [times, setTimes] = useState(initialTimes);

  const plannedCheckInOpen = dayjs(`${todayStr} ${train.departure.time}`).subtract(20, 'minute').format('YYYY-MM-DD HH:mm');
  const plannedCheckInClose = dayjs(`${todayStr} ${train.departure.time}`).subtract(5, 'minute').format('YYYY-MM-DD HH:mm');
  const plannedCheckOutOpen = dayjs(`${todayStr} ${train.arrival.time}`).format('YYYY-MM-DD HH:mm');
  const plannedCheckOutClose = dayjs(`${todayStr} ${train.departure.time}`).add(30, 'minute').format('YYYY-MM-DD HH:mm');

  // 变化检测样式
  const getChangedStyle = (isChanged: boolean, darkMode: boolean) => ({
    borderColor: isChanged ? (darkMode ? '#F59E0B' : '#D97706') : undefined,
    backgroundColor: isChanged 
      ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)') 
      : undefined
  });

  // 检测是否有未保存的修改
  useEffect(() => {
    const hasChanges = JSON.stringify(times) !== JSON.stringify(initialTimes);
    onUnsavedChanges(hasChanges);
  }, [times, initialTimes, onUnsavedChanges]);

  const handleQuickAdjust = (type: 'arrival' | 'departure') => {
    if (!adjustValue || isNaN(Number(adjustValue))) return;
    const minutes = Number(adjustValue);

    setTimes(prev => {
      const baseArrivalTime = isCumulative ? prev.arrivalTime : train.arrival.time;
      const baseDepartureTime = isCumulative ? prev.departureTime : train.departure.time;

      const newArrivalTime = type === 'arrival'
        ? dayjs(`${prev.arrivalDate} ${baseArrivalTime}`).add(minutes, 'minute').format('HH:mm')
        : prev.arrivalTime;
      const newDepartureTime = type === 'departure'
        ? dayjs(`${prev.departureDate} ${baseDepartureTime}`).add(minutes, 'minute').format('HH:mm')
        : prev.departureTime;

      // 如果勾选了顺延，同步调整开停检时间
      if (isDefer) {
        const arrivalDiff = type === 'arrival' ? minutes : 0;
        const departureDiff = type === 'departure' ? minutes : 0;

        return {
          ...prev,
          arrivalTime: newArrivalTime,
          departureTime: newDepartureTime,
          checkInOpenTime: dayjs(`${prev.arrivalDate} ${prev.checkInOpenTime.split(' ')[1] || prev.checkInOpenTime}`).add(departureDiff, 'minute').format('YYYY-MM-DD HH:mm'),
          checkInCloseTime: dayjs(`${prev.arrivalDate} ${prev.checkInCloseTime.split(' ')[1] || prev.checkInCloseTime}`).add(departureDiff, 'minute').format('YYYY-MM-DD HH:mm'),
          checkOutOpenTime: dayjs(`${prev.arrivalDate} ${prev.checkOutOpenTime.split(' ')[1] || prev.checkOutOpenTime}`).add(arrivalDiff, 'minute').format('YYYY-MM-DD HH:mm'),
          checkOutCloseTime: dayjs(`${prev.arrivalDate} ${prev.checkOutCloseTime.split(' ')[1] || prev.checkOutCloseTime}`).add(departureDiff, 'minute').format('YYYY-MM-DD HH:mm')
        };
      }

      return {
        ...prev,
        arrivalTime: newArrivalTime,
        departureTime: newDepartureTime
      };
    });
  };

  // 切换停止/接收状态
  const handleToggleCtcReceive = () => {
    setCtcStatus(prev => prev === 'auto' ? 'stopped' : 'auto');
  };

  // 手动接收：根据CTC时间调整实际时间
  const handleManualReceive = () => {
    setTimes(prev => {
      const newArrivalTime = ctcData.arrivalTime;
      const newDepartureTime = ctcData.departureTime;
      
      // 如果勾选了顺延，同步调整开停检时间
      if (isDefer) {
        const arrivalDiff = dayjs(`${todayStr} ${newArrivalTime}`).diff(dayjs(`${todayStr} ${prev.arrivalTime}`), 'minute');
        const departureDiff = dayjs(`${todayStr} ${newDepartureTime}`).diff(dayjs(`${todayStr} ${prev.departureTime}`), 'minute');
        
        return {
          ...prev,
          arrivalTime: newArrivalTime,
          departureTime: newDepartureTime,
          checkInOpenTime: dayjs(`${prev.arrivalDate} ${prev.checkInOpenTime.split(' ')[1] || prev.checkInOpenTime}`).add(departureDiff, 'minute').format('YYYY-MM-DD HH:mm'),
          checkInCloseTime: dayjs(`${prev.arrivalDate} ${prev.checkInCloseTime.split(' ')[1] || prev.checkInCloseTime}`).add(departureDiff, 'minute').format('YYYY-MM-DD HH:mm'),
          checkOutOpenTime: dayjs(`${prev.arrivalDate} ${prev.checkOutOpenTime.split(' ')[1] || prev.checkOutOpenTime}`).add(arrivalDiff, 'minute').format('YYYY-MM-DD HH:mm'),
          checkOutCloseTime: dayjs(`${prev.arrivalDate} ${prev.checkOutCloseTime.split(' ')[1] || prev.checkOutCloseTime}`).add(departureDiff, 'minute').format('YYYY-MM-DD HH:mm')
        };
      }
      
      return {
        ...prev,
        arrivalTime: newArrivalTime,
        departureTime: newDepartureTime
      };
    });
  };

  const handleReset = () => {
    setTimes(initialTimes);
    // 不干预CTC状态
    setAdjustValue('');
    setIsCumulative(false);
    setIsDefer(false);
  };

  const handleSave = () => {
    console.log('Save time adjustments:', times);
    onUnsavedChanges(false);
    onClose();
  };

  const getCtcStatusLabel = () => {
    switch (ctcStatus) {
      case 'auto': return '自动接收';
      case 'stopped': return '已停止';
    }
  };

  const getCtcStatusColor = () => {
    switch (ctcStatus) {
      case 'auto': return { bg: darkMode ? 'rgba(125, 211, 252, 0.15)' : '#E0F2FE', color: darkMode ? '#38BDF8' : '#0369A1' };
      case 'stopped': return { bg: darkMode ? 'rgba(248, 113, 113, 0.15)' : '#FEE2E2', color: darkMode ? '#F87171' : '#DC2626' };
    }
  };

  const statusColor = getCtcStatusColor();

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
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>图定到点</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {train.arrival.time}
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>图定发点</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {train.departure.time}
            </div>
          </div>
        </Col>
      </Row>

      {/* CTC信息 - 图标按钮，带状态逻辑 */}
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
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>CTC到点</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {ctcData.arrivalTime}
            </div>
          </Col>
          <Col span={7}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>CTC发点</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {ctcData.departureTime}
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: statusColor.bg,
              color: statusColor.color,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              border: darkMode ? `1px solid ${statusColor.color}40` : `1px solid ${statusColor.color}30`
            }}>
              {getCtcStatusLabel()}
            </div>
          </Col>
          <Col span={6} style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <Tooltip title={ctcStatus === 'auto' ? '停止接收' : '接收CTC'}>
              <Button
                size="small"
                icon={ctcStatus === 'auto' ? <Pause size={14} /> : <Play size={14} />}
                onClick={handleToggleCtcReceive}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getSecondaryButtonStyle(darkMode)
                }}
              />
            </Tooltip>
            <Tooltip title="手动接收">
              <Button
                size="small"
                icon={<Hand size={14} />}
                onClick={handleManualReceive}
                disabled={ctcStatus !== 'stopped'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getSecondaryButtonStyle(darkMode),
                  opacity: ctcStatus !== 'stopped' ? 0.5 : 1
                }}
              />
            </Tooltip>
          </Col>
        </Row>
      </div>

      {/* 实际时间调整 - 2x2紧凑布局 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151', marginBottom: '10px' }}>实际时间调整</div>
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>到站日期</div>
            <Input
              value={times.arrivalDate}
              onChange={(e) => setTimes(prev => ({ ...prev, arrivalDate: e.target.value }))}
              placeholder="YYYY-MM-DD"
              style={{ ...getInputStyle(darkMode), height: '36px', ...getChangedStyle(times.arrivalDate !== initialTimes.arrivalDate, darkMode) }}
            />
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>离站日期</div>
            <Input
              value={times.departureDate}
              onChange={(e) => setTimes(prev => ({ ...prev, departureDate: e.target.value }))}
              placeholder="YYYY-MM-DD"
              style={{ ...getInputStyle(darkMode), height: '36px', ...getChangedStyle(times.departureDate !== initialTimes.departureDate, darkMode) }}
            />
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>到站时间</div>
            <Input
              value={times.arrivalTime}
              onChange={(e) => setTimes(prev => ({ ...prev, arrivalTime: e.target.value }))}
              placeholder="HH:mm"
              style={{ ...getInputStyle(darkMode), height: '36px', ...getChangedStyle(times.arrivalTime !== initialTimes.arrivalTime, darkMode) }}
            />
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>发车时间</div>
            <Input
              value={times.departureTime}
              onChange={(e) => setTimes(prev => ({ ...prev, departureTime: e.target.value }))}
              placeholder="HH:mm"
              style={{ ...getInputStyle(darkMode), height: '36px', ...getChangedStyle(times.departureTime !== initialTimes.departureTime, darkMode) }}
            />
          </Col>
        </Row>
      </div>

      {/* 快速调整 - 累加标签在标题右侧 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>快速调整</span>
          <div
            onClick={() => setIsCumulative(!isCumulative)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isCumulative
                ? (darkMode ? '#2A6B7C' : '#1D4E5F')
                : (darkMode ? 'transparent' : 'transparent'),
              color: isCumulative
                ? '#FFFFFF'
                : (darkMode ? '#94A3B8' : '#9CA3AF'),
              border: `1px solid ${isCumulative
                ? (darkMode ? '#2A6B7C' : '#1D4E5F')
                : (darkMode ? 'rgba(148, 163, 184, 0.3)' : '#D1D5DB')}`,
              boxShadow: isCumulative ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isCumulative ? '#4ADE80' : (darkMode ? '#64748B' : '#9CA3AF')
            }} />
            {isCumulative ? '累加' : '不累加'}
          </div>
        </div>
        <Row gutter={12} align="middle">
          <Col span={6}>
            <Input
              placeholder="分钟"
              value={adjustValue}
              onChange={(e) => setAdjustValue(e.target.value)}
              style={{ ...getInputStyle(darkMode), height: '36px' }}
            />
          </Col>
          <Col span={18} style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => handleQuickAdjust('arrival')}
              style={{ flex: 1, height: '36px', fontSize: '12px', borderRadius: '6px', ...getSecondaryButtonStyle(darkMode) }}
            >
              到点调整
            </Button>
            <Button
              onClick={() => handleQuickAdjust('departure')}
              style={{ flex: 1, height: '36px', fontSize: '12px', borderRadius: '6px', ...getSecondaryButtonStyle(darkMode) }}
            >
              发点调整
            </Button>
          </Col>
        </Row>
      </div>

      {/* 开停检时间 - 联动调整标题，顺延标签 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>联动调整</span>
          <div
            onClick={() => setIsDefer(!isDefer)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isDefer
                ? (darkMode ? '#D97706' : '#D97706')
                : (darkMode ? 'transparent' : 'transparent'),
              color: isDefer
                ? '#FFFFFF'
                : (darkMode ? '#94A3B8' : '#9CA3AF'),
              border: `1px solid ${isDefer
                ? (darkMode ? '#D97706' : '#D97706')
                : (darkMode ? 'rgba(148, 163, 184, 0.3)' : '#D1D5DB')}`,
              boxShadow: isDefer ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isDefer ? '#4ADE80' : (darkMode ? '#64748B' : '#9CA3AF')
            }} />
            {isDefer ? '顺延' : '不顺延'}
          </div>
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>进站开检</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {times.checkInOpenTime !== initialTimes.checkInOpenTime && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>{times.checkInOpenTime}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>进站停检</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {times.checkInCloseTime !== initialTimes.checkInCloseTime && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>{times.checkInCloseTime}</span>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>出站开检</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {times.checkOutOpenTime !== initialTimes.checkOutOpenTime && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>{times.checkOutOpenTime}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>出站停检</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {times.checkOutCloseTime !== initialTimes.checkOutCloseTime && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>{times.checkOutCloseTime}</span>
              </div>
            </div>
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

const CheckInOutAdjustPanel: React.FC<{ train: TrainSchedule; onClose: () => void; darkMode: boolean; onUnsavedChanges: (hasChanges: boolean) => void }> = ({ train, onClose, darkMode, onUnsavedChanges }) => {
  const now = dayjs();
  const today = now.startOf('day');
  const displayDateStr = now.format('YYYY/M/D');

  // 获取基准时间（到点或发点）
  const getBaseTime = (base: 'arrival' | 'departure') => {
    const timeStr = base === 'arrival' 
      ? (train.arrival.actualTime || train.arrival.time)
      : (train.departure.actualTime || train.departure.time);
    return dayjs(`${now.format('YYYY-MM-DD')} ${timeStr}`);
  };

  // 计算默认开检时间（发车前20分钟）
  const defaultOpenTime = getBaseTime('departure').subtract(20, 'minute');
  // 计算默认停检时间（发车前5分钟）
  const defaultCloseTime = getBaseTime('departure').subtract(5, 'minute');

  // 初始状态
  const initialState = {
    checkInDate: defaultOpenTime,
    checkInTime: defaultOpenTime,
    checkInBase: 'arrival' as 'arrival' | 'departure',
    checkInOffset: '-15',
    checkOutDate: defaultCloseTime,
    checkOutTime: defaultCloseTime,
    checkOutBase: 'departure' as 'arrival' | 'departure',
    checkOutOffset: '-3'
  };

  // 开检状态
  const [checkInDate, setCheckInDate] = useState<dayjs.Dayjs>(initialState.checkInDate);
  const [checkInTime, setCheckInTime] = useState<dayjs.Dayjs>(initialState.checkInTime);
  const [checkInBase, setCheckInBase] = useState<'arrival' | 'departure'>(initialState.checkInBase);
  const [checkInOffset, setCheckInOffset] = useState<string>(initialState.checkInOffset);

  // 停检状态
  const [checkOutDate, setCheckOutDate] = useState<dayjs.Dayjs>(initialState.checkOutDate);
  const [checkOutTime, setCheckOutTime] = useState<dayjs.Dayjs>(initialState.checkOutTime);
  const [checkOutBase, setCheckOutBase] = useState<'arrival' | 'departure'>(initialState.checkOutBase);
  const [checkOutOffset, setCheckOutOffset] = useState<string>(initialState.checkOutOffset);

  // 检测是否有未保存的修改
  useEffect(() => {
    const currentState = {
      checkInDate: checkInDate.format('YYYY-MM-DD'),
      checkInTime: checkInTime.format('YYYY-MM-DD HH:mm'),
      checkInBase,
      checkInOffset,
      checkOutDate: checkOutDate.format('YYYY-MM-DD'),
      checkOutTime: checkOutTime.format('YYYY-MM-DD HH:mm'),
      checkOutBase,
      checkOutOffset
    };
    const initialStateStr = {
      checkInDate: initialState.checkInDate.format('YYYY-MM-DD'),
      checkInTime: initialState.checkInTime.format('YYYY-MM-DD HH:mm'),
      checkInBase: initialState.checkInBase,
      checkInOffset: initialState.checkInOffset,
      checkOutDate: initialState.checkOutDate.format('YYYY-MM-DD'),
      checkOutTime: initialState.checkOutTime.format('YYYY-MM-DD HH:mm'),
      checkOutBase: initialState.checkOutBase,
      checkOutOffset: initialState.checkOutOffset
    };
    const hasChanges = JSON.stringify(currentState) !== JSON.stringify(initialStateStr);
    onUnsavedChanges(hasChanges);
  }, [checkInDate, checkInTime, checkInBase, checkInOffset, checkOutDate, checkOutTime, checkOutBase, checkOutOffset, initialState, onUnsavedChanges]);

  // 参数变化颜色提醒样式
  const getChangedStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
    borderColor: isChanged ? (darkMode ? '#F59E0B' : '#D97706') : undefined,
    backgroundColor: isChanged 
      ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)') 
      : undefined
  });

  // 判断值是否变化
  const isCheckInDateChanged = !checkInDate.isSame(defaultOpenTime, 'day');
  const isCheckInTimeChanged = !checkInTime.isSame(defaultOpenTime, 'minute');
  const isCheckInBaseChanged = checkInBase !== 'arrival';
  const isCheckInOffsetChanged = checkInOffset !== '-15';
  const isCheckOutDateChanged = !checkOutDate.isSame(defaultCloseTime, 'day');
  const isCheckOutTimeChanged = !checkOutTime.isSame(defaultCloseTime, 'minute');
  const isCheckOutBaseChanged = checkOutBase !== 'departure';
  const isCheckOutOffsetChanged = checkOutOffset !== '-3';

  // 根据基准和相对时间计算开检时间
  const handleCheckInAdjust = () => {
    const baseTime = getBaseTime(checkInBase);
    const offsetMinutes = parseInt(checkInOffset) || 0;
    const newTime = baseTime.add(offsetMinutes, 'minute');
    setCheckInDate(newTime);
    setCheckInTime(newTime);
  };

  // 根据基准和相对时间计算停检时间
  const handleCheckOutAdjust = () => {
    const baseTime = getBaseTime(checkOutBase);
    const offsetMinutes = parseInt(checkOutOffset) || 0;
    const newTime = baseTime.add(offsetMinutes, 'minute');
    setCheckOutDate(newTime);
    setCheckOutTime(newTime);
  };

  // 当直接修改开检时间时，反向计算相对时间
  const handleCheckInTimeChange = (time: dayjs.Dayjs | null) => {
    if (time) {
      setCheckInTime(time);
      const baseTime = getBaseTime(checkInBase);
      const diffMinutes = time.diff(baseTime, 'minute');
      setCheckInOffset(diffMinutes.toString());
    }
  };

  // 当直接修改停检时间时，反向计算相对时间
  const handleCheckOutTimeChange = (time: dayjs.Dayjs | null) => {
    if (time) {
      setCheckOutTime(time);
      const baseTime = getBaseTime(checkOutBase);
      const diffMinutes = time.diff(baseTime, 'minute');
      setCheckOutOffset(diffMinutes.toString());
    }
  };

  // 当修改基准时，重新计算相对时间
  const handleCheckInBaseChange = (base: 'arrival' | 'departure') => {
    setCheckInBase(base);
    const baseTime = getBaseTime(base);
    const diffMinutes = checkInTime.diff(baseTime, 'minute');
    setCheckInOffset(diffMinutes.toString());
  };

  const handleCheckOutBaseChange = (base: 'arrival' | 'departure') => {
    setCheckOutBase(base);
    const baseTime = getBaseTime(base);
    const diffMinutes = checkOutTime.diff(baseTime, 'minute');
    setCheckOutOffset(diffMinutes.toString());
  };

  const handleReset = () => {
    setCheckInDate(initialState.checkInDate);
    setCheckInTime(initialState.checkInTime);
    setCheckInBase(initialState.checkInBase);
    setCheckInOffset(initialState.checkInOffset);
    setCheckOutDate(initialState.checkOutDate);
    setCheckOutTime(initialState.checkOutTime);
    setCheckOutBase(initialState.checkOutBase);
    setCheckOutOffset(initialState.checkOutOffset);
  };

  const handleSave = () => {
    console.log('Save check in/out adjustments:', {
      checkIn: {
        date: checkInDate.format('YYYY-MM-DD'),
        time: checkInTime.format('HH:mm'),
        base: checkInBase,
        offset: checkInOffset
      },
      checkOut: {
        date: checkOutDate.format('YYYY-MM-DD'),
        time: checkOutTime.format('HH:mm'),
        base: checkOutBase,
        offset: checkOutOffset
      }
    });
    onUnsavedChanges(false);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 实际时间信息 - 紧凑布局 */}
      <Row gutter={12}>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>实际到点</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {train.arrival.actualTime || train.arrival.time}
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>实际发点</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
              {displayDateStr} {train.departure.actualTime || train.departure.time}
            </div>
          </div>
        </Col>
      </Row>

      {/* 进站开检调整 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151', marginBottom: '10px' }}>进站开检调整</div>
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>开检日期</div>
            <DatePicker 
              value={checkInDate}
              onChange={(date) => date && setCheckInDate(date)}
              style={{ ...getSelectStyle(darkMode), height: '36px', width: '100%', ...getChangedStyle(isCheckInDateChanged, darkMode) }}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>开检时间</div>
            <TimePicker 
              value={checkInTime}
              onChange={handleCheckInTimeChange}
              style={{ ...getSelectStyle(darkMode), height: '36px', width: '100%', ...getChangedStyle(isCheckInTimeChanged, darkMode) }}
              format="HH:mm"
              minuteStep={1}
            />
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>开检基准</div>
            <Select 
              value={checkInBase} 
              onChange={handleCheckInBaseChange}
              style={{ ...getSelectStyle(darkMode), height: '36px', ...getChangedStyle(isCheckInBaseChanged, darkMode) }}
            >
              <Option value="arrival">到点</Option>
              <Option value="departure">发点</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>相对时间(分钟)</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input 
                value={checkInOffset}
                onChange={(e) => setCheckInOffset(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '13px', borderRadius: '8px', ...getChangedStyle(isCheckInOffsetChanged, darkMode) }}
              />
              <Button 
                onClick={handleCheckInAdjust}
                style={{ height: '36px', fontSize: '12px', padding: '0 16px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode) }}
              >
                调整
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* 进站停检调整 */}
      <div style={{
        background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
        padding: '12px',
        borderRadius: '8px',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151', marginBottom: '10px' }}>进站停检调整</div>
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>停检日期</div>
            <DatePicker 
              value={checkOutDate}
              onChange={(date) => date && setCheckOutDate(date)}
              style={{ ...getSelectStyle(darkMode), height: '36px', width: '100%', ...getChangedStyle(isCheckOutDateChanged, darkMode) }}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>停检时间</div>
            <TimePicker 
              value={checkOutTime}
              onChange={handleCheckOutTimeChange}
              style={{ ...getSelectStyle(darkMode), height: '36px', width: '100%', ...getChangedStyle(isCheckOutTimeChanged, darkMode) }}
              format="HH:mm"
              minuteStep={1}
            />
          </Col>
        </Row>
        <Row gutter={12} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>停检基准</div>
            <Select 
              value={checkOutBase} 
              onChange={handleCheckOutBaseChange}
              style={{ ...getSelectStyle(darkMode), height: '36px', ...getChangedStyle(isCheckOutBaseChanged, darkMode) }}
            >
              <Option value="departure">发点</Option>
              <Option value="arrival">到点</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>相对时间(分钟)</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input 
                value={checkOutOffset}
                onChange={(e) => setCheckOutOffset(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '13px', borderRadius: '8px', ...getChangedStyle(isCheckOutOffsetChanged, darkMode) }}
              />
              <Button 
                onClick={handleCheckOutAdjust}
                style={{ height: '36px', fontSize: '12px', padding: '0 16px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode) }}
              >
                调整
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* 底部按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
        <Button onClick={handleReset} style={{ ...getSecondaryButtonStyle(darkMode) }} icon={<RotateCcw size={14} />}>
          恢复默认
        </Button>
        <Popconfirm
          title="确认保存开停检调整？"
          description={`开检时间：${checkInDate.format('YYYY-MM-DD')} ${checkInTime.format('HH:mm')}\n停检时间：${checkOutDate.format('YYYY-MM-DD')} ${checkOutTime.format('HH:mm')}`}
          onConfirm={handleSave}
          okText="确认"
          cancelText="取消"
        >
          <Button 
            type="primary" 
            style={{ ...getPrimaryButtonStyle(darkMode), display: 'flex', alignItems: 'center', gap: '6px' }}
            icon={<Save size={14} />}
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
