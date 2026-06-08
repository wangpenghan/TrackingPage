import React, { useState, useEffect, useMemo } from 'react';
import { Input, Row, Col, Button } from 'antd';
import { Pause, Play, ChevronDown, ChevronUp, Clock, RotateCcw, Save } from 'lucide-react';
import dayjs from 'dayjs';
import { TrainSchedule } from '../mock-data';

export type TrainTypeMode = 'pass' | 'origin' | 'end';

const CD = "'Noto Sans SC'";
const FW = 700;

// 颜色主题配置
const COLORS = {
  light: {
    bg: '#FFFFFF',
    bgSecondary: '#F2F2F7',
    bgTertiary: '#FDECA4',
    border: '#E0E0E0',
    borderSecondary: '#C7C7C7',
    text: '#373737',
    textSecondary: '#6B748B',
    textTertiary: '#94A3B8',
    primary: '#007AFF',
    success: '#4ADE80',
    warning: '#D9B975',
    error: '#DC2626',
    ctcBg: '#FDECA4',
    ctcBorder: '#F5DA9C',
    checkInBg: 'rgba(22, 92, 59, 0.12)',
    checkInBorder: '#C4F4EB',
    checkInHdrBg: 'linear-gradient(180deg, #ECFDF5 0%, #ECFDF5 100%)',
    checkInText: '#21868C',
    checkInValue: '#134E4A',
    checkOutBg: 'rgba(118, 13, 13, 0.12)',
    checkOutBorder: '#FECACA',
    checkOutHdrBg: 'linear-gradient(180deg, #FEF2F2 0%, #FEF2F2 100%)',
    checkOutText: '#9A1B1D',
    checkOutValue: '#B91C35',
    otherBg: 'rgba(123, 122, 122, 0.2)'
  },
  dark: {
    bg: '#1E293B',
    bgSecondary: '#0F172A',
    bgTertiary: '#334155',
    border: '#475569',
    borderSecondary: '#64748B',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    primary: '#3B82F6',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    ctcBg: '#1E293B',
    ctcBorder: '#475569',
    checkInBg: 'rgba(22, 92, 59, 0.25)',
    checkInBorder: 'rgba(196, 244, 235, 0.4)',
    checkInHdrBg: 'rgba(22, 92, 59, 0.2)',
    checkInText: '#6EE7B7',
    checkInValue: '#A7F3D0',
    checkOutBg: 'rgba(118, 13, 13, 0.25)',
    checkOutBorder: 'rgba(254, 202, 202, 0.4)',
    checkOutHdrBg: 'rgba(118, 13, 13, 0.2)',
    checkOutText: '#FCA5A5',
    checkOutValue: '#FECACA',
    otherBg: 'rgba(123, 122, 122, 0.2)'
  }
};

interface TimeAdjustDrawerProps {
  train: TrainSchedule;
  onClose: () => void;
  onSaveAndClose?: () => void;
  darkMode: boolean;
  onUnsavedChanges: (hasChanges: boolean) => void;
  onlyAdjustCheckTime?: boolean;
}

export const TimeAdjustDrawer: React.FC<TimeAdjustDrawerProps> = ({
  train,
  onClose,
  onSaveAndClose,
  darkMode = false,
  onUnsavedChanges,
  onlyAdjustCheckTime = false
}) => {
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const now = dayjs();
  const todayStr = now.format('YYYY-MM-DD');

  const trainType: TrainTypeMode = train.status === 'origin' ? 'origin'
    : train.status === 'end' ? 'end'
    : 'pass';

  const showArrival = trainType === 'pass' || trainType === 'end';
  const showDeparture = trainType === 'pass' || trainType === 'origin';

  // 时间验证函数
  const isValidTime = (time: string): boolean => {
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const [isCumulative, setIsCumulative] = useState(false);
  const [isPostponed, setIsPostponed] = useState(true);
  const [adjustValue, setAdjustValue] = useState('');
  const [ctcStatus, setCtcStatus] = useState<'auto' | 'stopped'>('auto');

  const initialTimes = useMemo(() => ({
    arrivalDate: todayStr,
    arrivalTime: train.arrival?.time || '',
    departureDate: todayStr,
    departureTime: train.departure?.time || '',
    checkInOpenTime: dayjs(`${todayStr} ${train.departure.time}`).subtract(15, 'minute').format('YYYY-MM-DD HH:mm'),
    checkInCloseTime: dayjs(`${todayStr} ${train.departure.time}`).subtract(trainType === 'origin' ? 3 : 5, 'minute').format('YYYY-MM-DD HH:mm'),
    checkOutOpenTime: dayjs(`${todayStr} ${train.arrival.time}`).format('YYYY-MM-DD HH:mm'),
    checkOutCloseTime: dayjs(`${todayStr} ${train.departure.time}`).add(30, 'minute').format('YYYY-MM-DD HH:mm'),
    checkInOpenOffset: -15,
    checkInCloseOffset: trainType === 'origin' ? -3 : -5,
    checkOutOpenOffset: 0,
    checkOutCloseOffset: 30
  }), [train, todayStr, trainType]);

  const ctcData = useMemo(() => ({
    arrivalTime: train.arrival?.actualTime || train.arrival?.time || '',
    departureTime: train.departure?.actualTime || train.departure?.time || ''
  }), [train]);

  const [times, setTimes] = useState(initialTimes);

  useEffect(() => {
    setTimes(initialTimes);
    setAdjustValue('');
    setIsCumulative(false);
    setIsPostponed(true);
    setCtcStatus('auto');
  }, [train.id]);

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

      if (type === 'arrival' && showArrival && !isValidTime(baseArrivalTime)) return prev;
      if (type === 'departure' && showDeparture && !isValidTime(baseDepartureTime)) return prev;

      const newArrivalTime = type === 'arrival' && showArrival
        ? dayjs(`${prev.arrivalDate} ${baseArrivalTime}`).add(minutes, 'minute').format('HH:mm')
        : prev.arrivalTime;

      const newDepartureTime = type === 'departure' && showDeparture
        ? dayjs(`${prev.departureDate} ${baseDepartureTime}`).add(minutes, 'minute').format('HH:mm')
        : prev.departureTime;

      // 检查时间是否实际发生了变化
      const arrivalChanged = newArrivalTime !== prev.arrivalTime;
      const departureChanged = newDepartureTime !== prev.departureTime;
      
      // 顺延状态下且时间实际变化时，才同步更新开停检时间
      const shouldUpdateCheckIn = isPostponed && departureChanged && type === 'departure';
      const shouldUpdateCheckOutOpen = isPostponed && arrivalChanged && type === 'arrival';
      const shouldUpdateCheckOutClose = isPostponed && (departureChanged && type === 'departure' || arrivalChanged && type === 'arrival');
      
      return {
        ...prev,
        arrivalTime: newArrivalTime,
        departureTime: newDepartureTime,
        checkInOpenTime: shouldUpdateCheckIn
          ? dayjs(`${prev.arrivalDate} ${prev.checkInOpenTime.split(' ')[1] || prev.checkInOpenTime}`).add(minutes, 'minute').format('YYYY-MM-DD HH:mm')
          : prev.checkInOpenTime,
        checkInCloseTime: shouldUpdateCheckIn
          ? dayjs(`${prev.arrivalDate} ${prev.checkInCloseTime.split(' ')[1] || prev.checkInCloseTime}`).add(minutes, 'minute').format('YYYY-MM-DD HH:mm')
          : prev.checkInCloseTime,
        checkOutOpenTime: shouldUpdateCheckOutOpen
          ? dayjs(`${prev.arrivalDate} ${prev.checkOutOpenTime.split(' ')[1] || prev.checkOutOpenTime}`).add(minutes, 'minute').format('YYYY-MM-DD HH:mm')
          : prev.checkOutOpenTime,
        checkOutCloseTime: shouldUpdateCheckOutClose
          ? dayjs(`${prev.arrivalDate} ${prev.checkOutCloseTime.split(' ')[1] || prev.checkOutCloseTime}`).add(type === 'departure' ? minutes : 0, 'minute').format('YYYY-MM-DD HH:mm')
          : prev.checkOutCloseTime
      };
    });
  };

  const handleToggleCtcReceive = () => {
    setCtcStatus(prev => prev === 'auto' ? 'stopped' : 'auto');
  };

  const handleManualReceive = () => {
    setTimes(prev => ({
      ...prev,
      arrivalTime: ctcData.arrivalTime,
      departureTime: ctcData.departureTime
    }));
  };

  const handleReset = () => {
    setTimes(initialTimes);
    setAdjustValue('');
    setIsCumulative(false);
    setIsPostponed(true);
    setCtcStatus('auto');
  };

  const handleSave = () => {
    if (onSaveAndClose) {
      onSaveAndClose();
    } else {
      onUnsavedChanges(false);
      onClose();
    }
  };

  const handleOffsetChange = (field: 'checkInOpenOffset' | 'checkInCloseOffset' | 'checkOutOpenOffset' | 'checkOutCloseOffset', delta: number) => {
    setTimes(prev => {
      const newOffset = prev[field] + delta;
      const baseTime = field.includes('In') ? prev.departureTime : prev.arrivalTime;
      if (!isValidTime(baseTime)) return prev;
      const newTime = dayjs(`${prev.arrivalDate} ${baseTime}`).add(newOffset, 'minute').format('YYYY-MM-DD HH:mm');
      return {
        ...prev,
        [field]: newOffset,
        [`${field.replace('Offset', 'Time')}`]: newTime
      };
    });
  };

  const txt = (s: number, c: string) => ({ fontFamily: CD, fontWeight: FW, fontSize: s, lineHeight: `${s + 7}px`, color: c });

  const ScheduleCard: React.FC<{ title: string; value: string; active: boolean; hasChange?: boolean; disabled?: boolean }> = ({ title, value, active, hasChange = false, disabled = false }) => {
    const displayValue = active && value ? value : '--:--';
    return (
      <div
        style={{
          flex: 1,
          height: 50,
          borderRadius: 5,
          border: active ? '1px solid #C4F4EB' : `1px solid ${colors.borderSecondary}`,
          background: disabled ? colors.bgSecondary : active ? 'linear-gradient(90deg, #EEFDF9 0%, #D1FBF2 100%)' : colors.bgSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span style={{ ...txt(12, active ? '#21868C' : colors.textSecondary), textAlign: 'center' }}>{title}</span>
        <span style={{ ...txt(16, hasChange ? '#E53935' : active ? '#134E4A' : colors.text), textAlign: 'center', fontWeight: hasChange ? '700' : '400' }}>{displayValue}</span>
      </div>
    );
  };

  const CheckTimeCard: React.FC<{
    title: string; time: string; offset: number; defaultOffset: number;
    offsetField: 'checkInOpenOffset' | 'checkInCloseOffset' | 'checkOutOpenOffset' | 'checkOutCloseOffset';
    isInbound: boolean; isOpen: boolean; showFull?: boolean; hasLinkedChange?: boolean;
  }> = ({ title, time, offset, defaultOffset, offsetField, isInbound, isOpen, showFull = true, hasLinkedChange = false }) => {
    const sf = showFull;
    const ib = isInbound;
    const hasChange = offset !== defaultOffset || hasLinkedChange;

    const lc = ib ? (isOpen ? colors.checkInText : colors.checkOutText) : colors.text;
    const vc = ib ? (isOpen ? colors.checkInValue : colors.checkOutValue) : colors.text;
    const bg = ib ? (isOpen ? colors.checkInBg : colors.checkOutBg) : colors.otherBg;
    const hdrBg = ib ? (isOpen ? colors.checkInHdrBg : colors.checkOutHdrBg) : colors.otherBg;
    const hdrBd = ib ? (isOpen ? `1px solid ${colors.checkInBorder}` : `1px solid ${colors.checkOutBorder}`) : `1px solid ${colors.borderSecondary}`;

    const handleResetOffset = () => {
      const delta = defaultOffset - offset;
      handleOffsetChange(offsetField, delta);
    };

    return (
      <div style={{ width: '100%', background: bg, border: `1px solid ${colors.borderSecondary}`, borderRadius: 5, display: 'flex', flexDirection: 'column', padding: '8px 8px 12px' }}>
        <div style={{ background: hdrBg, border: hdrBd, borderRadius: 4, padding: '6px 8px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ ...txt(11, lc) }}>{title}</span>
          <span style={{ ...txt(13, hasChange ? '#E53935' : vc), fontWeight: hasChange ? '700' : '600' }}>{time}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <button onClick={() => handleOffsetChange(offsetField, -1)} style={{ width: 28, height: 28, background: colors.bg, border: `1px solid ${colors.borderSecondary}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronDown size={16} style={{ color: colors.text }} />
          </button>
          <span style={{ ...txt(16, hasChange ? '#E53935' : colors.text), fontWeight: hasChange ? '700' : '600', minWidth: 40, textAlign: 'center' }}>{offset}</span>
          <button onClick={() => handleOffsetChange(offsetField, 1)} style={{ width: 28, height: 28, background: colors.bg, border: `1px solid ${colors.borderSecondary}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronUp size={16} style={{ color: colors.text }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
          <span style={{ ...txt(10, colors.textSecondary), textAlign: 'center' }}>相对基准时间</span>
          {hasChange && <span style={{ ...txt(9, colors.textSecondary) }}>(默认 {defaultOffset})</span>}
        </div>

        {sf && ib && (
          <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 6 }}>
            {[
              { l: '-5', v: -5 }, { l: '-3', v: -3 }, { l: '↻', v: null, isReset: true }, { l: '+3', v: 3 }, { l: '+5', v: 5 }
            ].map((b, i) =>
              b.isReset ? (
                <button key={i} onClick={handleResetOffset} title={`恢复默认值 (${defaultOffset})`} disabled={!hasChange} style={{ width: 24, height: 24, background: hasChange ? colors.bg : colors.bgSecondary, border: hasChange ? `1px solid ${colors.primary}` : `1px solid ${colors.borderSecondary}`, borderRadius: 3, ...txt(10, hasChange ? colors.primary : colors.textSecondary), cursor: hasChange ? 'pointer' : 'not-allowed' }}>{b.l}</button>
              ) : (
                <button key={i} onClick={() => handleOffsetChange(offsetField, b.v!)} style={{ width: 24, height: 24, background: colors.bg, border: `1px solid ${colors.borderSecondary}`, borderRadius: 3, ...txt(10, colors.text), cursor: 'pointer' }}>{b.l}</button>
              )
            )}
          </div>
        )}

        <div style={{ ...txt(11, colors.text), textAlign: 'center', fontWeight: 600 }}>
          {ib ? (isOpen ? '进站开检' : '进站停检') : (isOpen ? '出站开检' : '出站停检')}
        </div>
      </div>
    );
  };

  const tds = (v: string) => v?.split(' ')[1] || v;

  // 计算变化状态
  const arrivalTimeChanged = times.arrivalTime !== initialTimes.arrivalTime;
  const departureTimeChanged = times.departureTime !== initialTimes.departureTime;
  
  // 计算关联变化（顺延模式下到点变化影响出站开停检，发点变化影响进站开停检
  const checkInTimesLinkedChanged = isPostponed && departureTimeChanged;
  const checkOutTimesLinkedChanged = isPostponed && arrivalTimeChanged;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', background: colors.bg, borderRadius: 8 }}>
      <div
        style={{
          width: '100%',
          height: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: 16
        }}
      >
        <ScheduleCard 
          title="图定到点" 
          value={train.arrival?.time || ''} 
          active={showArrival} 
          disabled={onlyAdjustCheckTime}
        />
        <ScheduleCard 
          title="图定发点" 
          value={train.departure?.time || ''} 
          active={showDeparture} 
          disabled={onlyAdjustCheckTime}
        />
      </div>

      <div style={{ width: '100%', background: colors.ctcBg, border: `1px solid ${colors.ctcBorder}`, borderRadius: 5, padding: '10px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...txt(14, colors.text), fontWeight: 600 }}>CTC时间</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleToggleCtcReceive} style={{ width: 60, height: 28, background: ctcStatus === 'stopped' ? '#FEE2E2' : colors.bgSecondary, border: ctcStatus === 'stopped' ? '1px solid #F7C0AF' : `1px solid ${colors.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Pause size={14} style={{ color: ctcStatus === 'stopped' ? '#DC2626' : colors.text }} />
            </button>
            <button onClick={handleManualReceive} disabled={ctcStatus !== 'stopped'} style={{ width: 60, height: 28, background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ctcStatus === 'stopped' ? 1 : 0.5, cursor: ctcStatus === 'stopped' ? 'pointer' : 'not-allowed' }}>
              <Play size={12} style={{ color: colors.text }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 8 }}>
          <div>
            <span style={{ color: colors.textSecondary }}>到点: </span>
            <span style={{ ...txt(13, showArrival ? colors.primary : colors.text), fontWeight: 600 }}>{showArrival ? ctcData.arrivalTime : '--:--'}</span>
          </div>
          <div>
            <span style={{ color: colors.textSecondary }}>发点: </span>
            <span style={{ ...txt(13, showDeparture ? colors.primary : colors.text), fontWeight: 600 }}>{showDeparture ? ctcData.departureTime : '--:--'}</span>
          </div>
          <div style={{ background: colors.warning, padding: '2px 8px', borderRadius: 4, marginLeft: 'auto' }}>
            <span style={txt(11, colors.text)}>{ctcStatus === 'auto' ? '自动接收中' : '已停止'}</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 5, padding: '12px', opacity: onlyAdjustCheckTime ? 0.5 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <Clock size={18} style={{ color: colors.text }} />
          <span style={{ ...txt(14, colors.text), fontWeight: 600, flex: 1 }}>实际时间调整</span>
          {onlyAdjustCheckTime && <span style={{ ...txt(11, colors.textSecondary) }}>（仅可调整开停检时间）</span>}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <span style={{ ...txt(11, colors.textSecondary) }}>到站时间</span>
            <Input 
              value={showArrival ? times.arrivalTime : '--:--'} 
              onChange={(e) => showArrival && !onlyAdjustCheckTime && setTimes(prev => ({ ...prev, arrivalTime: e.target.value }))} 
              disabled={!showArrival || onlyAdjustCheckTime} 
              style={{ 
                width: '100%', 
                height: 36, 
                background: colors.bg, 
                border: `1px solid ${colors.border}`, 
                borderRadius: 4, 
                textAlign: 'center', 
                ...txt(arrivalTimeChanged ? 15 : 13, arrivalTimeChanged ? '#E53935' : colors.text), 
                fontWeight: arrivalTimeChanged ? '700' : '400',
                marginTop: 4 
              }} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ ...txt(11, colors.textSecondary) }}>离站时间</span>
            <Input 
              value={showDeparture ? times.departureTime : '--:--'} 
              onChange={(e) => showDeparture && !onlyAdjustCheckTime && setTimes(prev => ({ ...prev, departureTime: e.target.value }))} 
              disabled={!showDeparture || onlyAdjustCheckTime} 
              style={{ 
                width: '100%', 
                height: 36, 
                background: colors.bg, 
                border: `1px solid ${colors.border}`, 
                borderRadius: 4, 
                textAlign: 'center', 
                ...txt(departureTimeChanged ? 15 : 13, departureTimeChanged ? '#E53935' : colors.text), 
                fontWeight: departureTimeChanged ? '700' : '400',
                marginTop: 4 
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => handleQuickAdjust('arrival')} disabled={!showArrival || onlyAdjustCheckTime} style={{ flex: 1, height: 36, background: (showArrival && !onlyAdjustCheckTime) ? colors.primary : '#797B7D', border: 'none', borderRadius: 4, ...txt(12, '#FFFFFF'), cursor: (showArrival && !onlyAdjustCheckTime) ? 'pointer' : 'not-allowed' }}>到点调整</button>
          <Input placeholder="分钟" value={adjustValue} onChange={(e) => !onlyAdjustCheckTime && setAdjustValue(e.target.value)} disabled={onlyAdjustCheckTime} style={{ width: 60, height: 36, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, textAlign: 'center', ...txt(12, colors.textSecondary) }} />
          <button onClick={() => !onlyAdjustCheckTime && setIsCumulative(!isCumulative)} disabled={onlyAdjustCheckTime} style={{ width: 36, height: 36, background: colors.bg, border: `1px solid ${colors.borderSecondary}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: onlyAdjustCheckTime ? 'not-allowed' : 'pointer' }}>
            <span style={{ width: 6, height: 6, borderRadius: 10, background: isCumulative ? colors.success : colors.text }} />
            <span style={{ fontSize: 10, color: colors.text, marginTop: 2 }}>{isCumulative ? '累加' : '不累加'}</span>
          </button>
          <button onClick={() => handleQuickAdjust('departure')} disabled={!showDeparture || onlyAdjustCheckTime} style={{ flex: 1, height: 36, background: (showDeparture && !onlyAdjustCheckTime) ? colors.primary : '#797B7D', border: 'none', borderRadius: 4, ...txt(12, '#FFFFFF'), cursor: (showDeparture && !onlyAdjustCheckTime) ? 'pointer' : 'not-allowed' }}>发点调整</button>
        </div>
      </div>

      <div style={{ width: '100%', background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: 5, padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={18} height={18} viewBox="0 0 22 22" fill="none">
              <circle cx={11} cy={11} r={9} stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 11H14" stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
              <path d="M11 8V14" stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span style={{ ...txt(13, colors.text), fontWeight: 600 }}>开停检时间调整</span>
          </div>
          <button onClick={() => setIsPostponed(!isPostponed)} style={{ width: 36, height: 36, background: colors.bg, border: `1px solid ${colors.borderSecondary}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ width: 6, height: 6, borderRadius: 10, background: isPostponed ? colors.success : colors.text }} />
            <span style={{ fontSize: 10, color: colors.text, marginTop: 2 }}>{isPostponed ? '顺延' : '不顺延'}</span>
          </button>
        </div>

        {trainType === 'pass' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CheckTimeCard title="开检时间" time={tds(times.checkInOpenTime)} offset={times.checkInOpenOffset} defaultOffset={-15} offsetField="checkInOpenOffset" isInbound={true} isOpen={true} showFull={true} hasLinkedChange={checkInTimesLinkedChanged} />
            <CheckTimeCard title="停检时间" time={tds(times.checkInCloseTime)} offset={times.checkInCloseOffset} defaultOffset={-5} offsetField="checkInCloseOffset" isInbound={true} isOpen={false} showFull={true} hasLinkedChange={checkInTimesLinkedChanged} />
            <CheckTimeCard title="出站开检" time={tds(times.checkOutOpenTime)} offset={times.checkOutOpenOffset} defaultOffset={0} offsetField="checkOutOpenOffset" isInbound={false} isOpen={true} showFull={false} hasLinkedChange={checkOutTimesLinkedChanged} />
            <CheckTimeCard title="出站停检" time={tds(times.checkOutCloseTime)} offset={times.checkOutCloseOffset} defaultOffset={30} offsetField="checkOutCloseOffset" isInbound={false} isOpen={false} showFull={false} hasLinkedChange={checkOutTimesLinkedChanged} />
          </div>
        )}
        {trainType === 'origin' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CheckTimeCard title="开检时间" time={tds(times.checkInOpenTime)} offset={times.checkInOpenOffset} defaultOffset={-15} offsetField="checkInOpenOffset" isInbound={true} isOpen={true} showFull={true} hasLinkedChange={checkInTimesLinkedChanged} />
            <CheckTimeCard title="停检时间" time={tds(times.checkInCloseTime)} offset={times.checkInCloseOffset} defaultOffset={-3} offsetField="checkInCloseOffset" isInbound={true} isOpen={false} showFull={true} hasLinkedChange={checkInTimesLinkedChanged} />
          </div>
        )}
        {trainType === 'end' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CheckTimeCard title="出站开检" time={tds(times.checkOutOpenTime)} offset={times.checkOutOpenOffset} defaultOffset={0} offsetField="checkOutOpenOffset" isInbound={false} isOpen={true} showFull={false} hasLinkedChange={checkOutTimesLinkedChanged} />
            <CheckTimeCard title="出站停检" time={tds(times.checkOutCloseTime)} offset={times.checkOutCloseOffset} defaultOffset={30} offsetField="checkOutCloseOffset" isInbound={false} isOpen={false} showFull={false} hasLinkedChange={checkOutTimesLinkedChanged} />
          </div>
        )}
      </div>

      <div style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <Button onClick={handleReset} style={{ flex: 1, height: 40, background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF', border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.2)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6, color: darkMode ? '#5DA3B3' : '#1D4E5F' }} icon={<RotateCcw size={16} />}>
          恢复默认
        </Button>
        <Button onClick={handleSave} type="primary" style={{ flex: 1, height: 40, background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)', border: 'none', borderRadius: 5, ...txt(13, '#FFFFFF'), cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} icon={<Save size={16} />}>
          保存
        </Button>
      </div>
    </div>
  );
};
