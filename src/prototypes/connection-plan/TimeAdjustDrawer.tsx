import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import { X, ChevronDown, ChevronUp, RotateCcw, Save } from 'lucide-react';
import { TrainData } from './index';
import './style.css';

interface TimeAdjustDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: TrainData | null;
  isArrival: boolean;
  onSwitchTrain?: (train: TrainData, isArrival: boolean) => void;
}

const CD = "'Noto Sans SC'";
const FW = 700;

type TrainType = 'through' | 'termination' | 'origin';

// 时间工具函数
const addMinutesToTime = (time: string, minutes: number): string => {
  if (!time || time === '--:--') return '--:--';
  const [h, m] = time.split(':').map(Number);
  const totalMins = h * 60 + m + minutes;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const timeToMinutes = (time: string): number => {
  if (!time || time === '--:--') return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const TimeAdjustDrawer: React.FC<TimeAdjustDrawerProps> = ({
  visible,
  onClose,
  train,
  isArrival,
  onSwitchTrain
}) => {
  // 偏移量状态
  const [offsets, setOffsets] = useState({
    checkInOpenOffset: -15,    // 进站开检偏移（分钟）
    checkInCloseOffset: -5,   // 进站停检偏移（分钟）
    checkOutOpenOffset: 0,     // 出站开检偏移（分钟）
    checkOutCloseOffset: 30    // 出站停检偏移（分钟）
  });
  const [isCumulative, setIsCumulative] = useState(false);
  const [isPostponed, setIsPostponed] = useState(true);
  const [adjustValue, setAdjustValue] = useState('');
  const [actualTimes, setActualTimes] = useState({
    arrivalTime: '',
    departureTime: ''
  });
  const [relativeAdjusts, setRelativeAdjusts] = useState({
    arrival: '',
    departure: ''
  });

  // 验证错误
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 计算属性（基于 train 数据）
  const baseArrivalTime = train?.arrivalTime || '10:25';
  const baseDepartureTime = train?.departureTime || '10:40';

  // 检查是否有CTC时间（与图定时间不同）
  const hasArrivalCtc = train?.ctcArrivalTime && train.ctcArrivalTime !== baseArrivalTime;
  const hasDepartureCtc = train?.ctcDepartureTime && train.ctcDepartureTime !== baseDepartureTime;

  // 检查CTC时间与实际时间是否冲突（不一致）
  const hasArrivalConflict = hasArrivalCtc && actualTimes.arrivalTime && train.ctcArrivalTime !== actualTimes.arrivalTime;
  const hasDepartureConflict = hasDepartureCtc && actualTimes.departureTime && train.ctcDepartureTime !== actualTimes.departureTime;
  const hasTimeConflict = hasArrivalConflict || hasDepartureConflict;

  // 从train数据初始化实际时间
  useEffect(() => {
    if (train) {
      setActualTimes({
        arrivalTime: train.actualArrivalTime || '',
        departureTime: train.actualDepartureTime || ''
      });
    }
  }, [train]);

  // 车次类型判断
  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');
  
  const getTrainType = (): TrainType => {
    if (!train) return 'through';
    if (isInspection(train.arrivalTrainNo) || isInspection(train.departureTrainNo)) {
      return 'through';
    }
    if (train.arrivalTrainNo === train.departureTrainNo) {
      return 'through';
    }
    return isArrival ? 'termination' : 'origin';
  };

  const trainType = getTrainType();
  const isThroughTrain = trainType === 'through';
  const isTerminationTrain = trainType === 'termination';
  const isOriginTrain = trainType === 'origin';

  // 判断是否有接续车次（终到转始发）
  const isConnectedTrain = train ? (!isInspection(train.arrivalTrainNo) && !isInspection(train.departureTrainNo) && train.arrivalTrainNo !== train.departureTrainNo) : false;
  const connectedTrainNo = train ? (isArrival ? train.departureTrainNo : train.arrivalTrainNo) : '';

  // 判断是否显示到站相关字段
  const showArrival = isThroughTrain || isTerminationTrain;
  // 判断是否显示发车相关字段
  const showDeparture = isThroughTrain || isOriginTrain;
  // 判断是否显示进站开检字段
  const showCheckIn = isThroughTrain || isOriginTrain;  // 始发车和途经车显示进站开检
  // 判断是否显示出站开检字段
  const showCheckOut = isThroughTrain || isTerminationTrain;  // 终到车和途经车显示出站开检

  // 基准时间：进站基于发点，出站基于到点
  // 顺延模式下使用实际时间，否则使用图定时间
  const effectiveDepartureBase = isPostponed && actualTimes.departureTime ? actualTimes.departureTime : baseDepartureTime;
  const effectiveArrivalBase = isPostponed && actualTimes.arrivalTime ? actualTimes.arrivalTime : baseArrivalTime;
  
  // 进站开停检基于发点
  const checkInBaseTime = effectiveDepartureBase;
  // 出站开停检基于到点
  const checkOutBaseTime = effectiveArrivalBase;

  // 追踪变化的字段
  const departureChanged = actualTimes.departureTime && actualTimes.departureTime !== baseDepartureTime;
  const arrivalChanged = actualTimes.arrivalTime && actualTimes.arrivalTime !== baseArrivalTime;

  // 获取当前车次的样式类名
  const getCurrentTrainTypeClass = () => {
    if (!train) return 'gray';
    const currentTrainNo = isArrival ? train.arrivalTrainNo : train.departureTrainNo;
    
    if (currentTrainNo.startsWith('0') || currentTrainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (train.arrivalTrainNo === train.departureTrainNo) {
      return 'purple';
    }
    if (isArrival) {
      return 'cyan';
    }
    return 'yellow';
  };

  const currentTrainTypeClass = getCurrentTrainTypeClass();
  const currentTrainNo = train ? (isArrival ? train.arrivalTrainNo : train.departureTrainNo) : '';

  // 获取当前车次的样式
  const getCurrentTrainPillStyles = () => {
    switch(currentTrainTypeClass) {
      case 'cyan':
        return {
          background: 'linear-gradient(180deg, #60d0e0 0%, #40c0d0 100%)',
          color: '#104048',
          borderColor: '#30a0b0'
        };
      case 'purple':
        return {
          background: 'linear-gradient(180deg, #d8c8e8 0%, #c0a8d0 100%)',
          color: '#503070',
          borderColor: '#a080b8'
        };
      case 'yellow':
        return {
          background: 'linear-gradient(180deg, #ffc864 0%, #ffb432 100%)',
          color: '#704000',
          borderColor: '#e89018'
        };
      default:
        return {
          background: 'linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%)',
          color: '#505050',
          borderColor: '#a0a0a0'
        };
    }
  };

  const currentTrainPillStyles = getCurrentTrainPillStyles();

  // 获取关联车次的样式类
  const getConnectedTrainTypeClass = () => {
    if (!train) return 'gray';
    if (connectedTrainNo.startsWith('0') || connectedTrainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (train.arrivalTrainNo === train.departureTrainNo) {
      return 'purple';
    }
    return isArrival ? 'yellow' : 'cyan';
  };

  const connectedTrainTypeClass = getConnectedTrainTypeClass();

  // 获取关联车次的样式（缩小版本）
  const getConnectedTrainPillStyles = () => {
    switch(connectedTrainTypeClass) {
      case 'cyan':
        return {
          background: 'linear-gradient(180deg, #60d0e0 0%, #40c0d0 100%)',
          color: '#104048',
          borderColor: '#30a0b0'
        };
      case 'purple':
        return {
          background: 'linear-gradient(180deg, #d8c8e8 0%, #c0a8d0 100%)',
          color: '#503070',
          borderColor: '#a080b8'
        };
      case 'yellow':
        return {
          background: 'linear-gradient(180deg, #ffc864 0%, #ffb432 100%)',
          color: '#704000',
          borderColor: '#e89018'
        };
      default:
        return {
          background: 'linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%)',
          color: '#505050',
          borderColor: '#a0a0a0'
        };
    }
  };

  const connectedTrainPillStyles = getConnectedTrainPillStyles();

  // 计算实际时间 - useEffect
  useEffect(() => {
    setActualTimes({
      arrivalTime: addMinutesToTime(baseArrivalTime, isCumulative ? offsets.checkInOpenOffset : 0),
      departureTime: addMinutesToTime(baseDepartureTime, isCumulative ? offsets.checkOutCloseOffset : 0)
    });
  }, [offsets, isCumulative, baseArrivalTime, baseDepartureTime]);

  // 处理实际时间直接修改
  const handleActualTimeChange = (type: 'arrival' | 'departure', value: string) => {
    // 验证时间格式 HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (value === '' || timeRegex.test(value)) {
      setActualTimes(prev => ({
        ...prev,
        [type === 'arrival' ? 'arrivalTime' : 'departureTime']: value
      }));
    }
  };

  // 处理相对时间输入
  const handleRelativeAdjust = (type: 'arrival' | 'departure', value: string) => {
    // 验证相对时间格式（可选的正负号 + 数字）
    const relativeRegex = /^[+-]?\d*$/;
    if (value === '' || relativeRegex.test(value)) {
      setRelativeAdjusts(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  // 应用相对时间调整
  const applyRelativeAdjust = (type: 'arrival' | 'departure') => {
    const relativeValue = relativeAdjusts[type];
    if (!relativeValue || relativeValue === '') return;

    const minutes = parseInt(relativeValue, 10);
    if (isNaN(minutes)) return;

    const baseTime = type === 'arrival' ? baseArrivalTime : baseDepartureTime;
    const currentActualTime = type === 'arrival' ? actualTimes.arrivalTime : actualTimes.departureTime;
    
    let timeToAdjust = baseTime;
    if (isCumulative && currentActualTime) {
      timeToAdjust = currentActualTime;
    }

    const newTime = addMinutesToTime(timeToAdjust, minutes);
    setActualTimes(prev => ({
      ...prev,
      [type === 'arrival' ? 'arrivalTime' : 'departureTime']: newTime
    }));

    // 清空相对调整输入框
    setRelativeAdjusts(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  // 验证逻辑 - useEffect
  useEffect(() => {
    const errors: string[] = [];
    
    if (showCheckIn) {
      const checkInOpen = addMinutesToTime(checkInBaseTime, offsets.checkInOpenOffset);
      const checkInClose = addMinutesToTime(checkInBaseTime, offsets.checkInCloseOffset);
      
      if (checkInOpen !== '--:--' && checkInClose !== '--:--') {
        if (timeToMinutes(checkInOpen) >= timeToMinutes(checkInClose)) {
          errors.push('进站开检时间必须早于进站停检时间');
        }
      }
    }

    // 出站开停检验证
    if (showCheckOut) {
      const checkOutOpen = addMinutesToTime(checkOutBaseTime, offsets.checkOutOpenOffset);
      const checkOutClose = addMinutesToTime(checkOutBaseTime, offsets.checkOutCloseOffset);
      
      if (checkOutOpen !== '--:--' && checkOutClose !== '--:--') {
        if (timeToMinutes(checkOutOpen) >= timeToMinutes(checkOutClose)) {
          errors.push('出站开检时间必须早于出站停检时间');
        }
      }
    }

    setValidationErrors(errors);
  }, [offsets, checkInBaseTime, checkOutBaseTime, baseDepartureTime, actualTimes, showCheckIn, showCheckOut]);

  // 条件检查 - 必须在所有 Hooks 调用之后
  if (!visible || !train) return null;

  const handleSwitchToConnected = () => {
    if (onSwitchTrain && isConnectedTrain) {
      onSwitchTrain(train, !isArrival);
    }
  };

  // 手动接收：将实际时间设置为CTC时间
  const handleManualReceive = () => {
    if (hasArrivalCtc || hasDepartureCtc) {
      setActualTimes(prev => ({
        arrivalTime: hasArrivalCtc ? train.ctcArrivalTime! : prev.arrivalTime,
        departureTime: hasDepartureCtc ? train.ctcDepartureTime! : prev.departureTime
      }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOffsetChange = (field: keyof typeof offsets, delta: number) => {
    setOffsets(prev => ({
      ...prev,
      [field]: prev[field] + delta
    }));
  };

  const handleQuickAdjust = (type: 'arrival' | 'departure') => {
    if (!adjustValue || isNaN(Number(adjustValue))) return;
    const minutes = Number(adjustValue);
    
    if (type === 'arrival') {
      setOffsets(prev => ({
        ...prev,
        checkInOpenOffset: prev.checkInOpenOffset + minutes,
        checkInCloseOffset: prev.checkInCloseOffset + minutes,
        checkOutOpenOffset: prev.checkOutOpenOffset + minutes,
        checkOutCloseOffset: prev.checkOutCloseOffset + minutes
      }));
    } else {
      setOffsets(prev => ({
        ...prev,
        checkInOpenOffset: prev.checkInOpenOffset + minutes,
        checkInCloseOffset: prev.checkInCloseOffset + minutes,
        checkOutOpenOffset: prev.checkOutOpenOffset + minutes,
        checkOutCloseOffset: prev.checkOutCloseOffset + minutes
      }));
    }
  };

  const handleReset = () => {
    setOffsets({
      checkInOpenOffset: -15,
      checkInCloseOffset: -5,
      checkOutOpenOffset: 0,
      checkOutCloseOffset: 30
    });
    setAdjustValue('');
    setIsCumulative(false);
    setIsPostponed(true);
    setValidationErrors([]);
  };

  const handleSave = () => {
    if (validationErrors.length > 0) {
      return;
    }
    // 保存逻辑
    onClose();
  };

  const txt = (s: number, c: string) => ({ fontFamily: CD, fontWeight: FW, fontSize: s, color: c });

  const colors = {
    bg: '#FFFFFF',
    bgSecondary: '#F2F2F7',
    border: '#E0E0E0',
    borderSecondary: '#C7C7C7',
    text: '#373737',
    textSecondary: '#6B748B',
    primary: '#007AFF',
    success: '#4ADE80',
    warning: '#D9B975',
    error: '#EF4444',
    ctcBg: '#F8F7F4',
    ctcBorder: '#E5E7EB',
    ctcText: '#6B748B',
    ctcValue: '#374151',
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
  };

  // 获取车次类型标签
  const getTrainTypeLabel = () => {
    if (isThroughTrain) return '途经车';
    if (isTerminationTrain) return '终到车';
    return '始发车';
  };

  // CheckTimeCard组件
  const CheckTimeCard: React.FC<{
    title: string; 
    offset: number; 
    defaultOffset: number;
    offsetField: keyof typeof offsets;
    baseTime: string;  // 基准时间
    defaultBaseTime: string;  // 图定基准时间（用于计算图定开检时间）
    disabled?: boolean;
  }> = ({ title, offset, defaultOffset, offsetField, baseTime, defaultBaseTime, disabled = false }) => {
    const hasChange = offset !== defaultOffset;
    const actualTime = addMinutesToTime(baseTime, offset);
    const scheduledTime = addMinutesToTime(defaultBaseTime, defaultOffset);  // 图定开检时间
    const isTimeChanged = actualTime !== scheduledTime;

    const handleResetOffset = () => {
      setOffsets(prev => ({
        ...prev,
        [offsetField]: defaultOffset
      }));
    };

    return (
      <div style={{ 
        width: '100%', 
        background: disabled ? colors.bgSecondary : colors.checkInBg, 
        border: `1px solid ${disabled ? colors.border : colors.checkInBorder}`, 
        borderRadius: 5, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '6px 6px 8px',
        opacity: disabled ? 0.5 : 1
      }}>
        <div style={{ background: disabled ? colors.bgSecondary : colors.checkInHdrBg, border: `1px solid ${colors.checkInBorder}`, borderRadius: 4, padding: '4px 6px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ ...txt(11, disabled ? colors.textSecondary : colors.checkInText) }}>{title}</span>
          <span style={{ ...txt(13, isTimeChanged ? colors.error : (disabled ? colors.textSecondary : colors.checkInValue)), fontWeight: isTimeChanged ? '700' : '600' }}>
            {disabled ? '--:--' : actualTime}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
          <button 
            onClick={() => !disabled && handleOffsetChange(offsetField, -1)} 
            disabled={disabled}
            style={{ 
              width: 24, 
              height: 24, 
              background: colors.bg, 
              border: `1px solid ${colors.borderSecondary}`, 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          >
            <ChevronDown size={14} style={{ color: disabled ? colors.textSecondary : colors.text }} />
          </button>
          <span style={{ ...txt(14, hasChange ? colors.error : colors.text), fontWeight: hasChange ? '700' : '600', minWidth: 35, textAlign: 'center' }}>{offset}</span>
          <button 
            onClick={() => !disabled && handleOffsetChange(offsetField, 1)} 
            disabled={disabled}
            style={{ 
              width: 24, 
              height: 24, 
              background: colors.bg, 
              border: `1px solid ${colors.borderSecondary}`, 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          >
            <ChevronUp size={14} style={{ color: disabled ? colors.textSecondary : colors.text }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 4 }}>
          <span style={{ ...txt(9, colors.textSecondary) }}>相对基准时间</span>
          {hasChange && <span style={{ ...txt(8, colors.textSecondary) }}>(默认 {defaultOffset})</span>}
        </div>

        <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 6 }}>
          {[
            { l: '-5', v: -5 }, 
            { l: '-3', v: -3 }, 
            { l: '↻', v: null, isReset: true }, 
            { l: '+3', v: 3 }, 
            { l: '+5', v: 5 }
          ].map((b, i) =>
            b.isReset ? (
              <button 
                key={i} 
                onClick={handleResetOffset} 
                disabled={!hasChange || disabled} 
                style={{ 
                  width: 22, 
                  height: 22, 
                  background: hasChange && !disabled ? colors.bg : colors.bgSecondary, 
                  border: hasChange && !disabled ? `1px solid ${colors.primary}` : `1px solid ${colors.borderSecondary}`, 
                  borderRadius: 3, 
                  ...txt(9, hasChange && !disabled ? colors.primary : colors.textSecondary), 
                  cursor: hasChange && !disabled ? 'pointer' : 'not-allowed' 
                }}
              >
                {b.l}
              </button>
            ) : (
              <button 
                key={i} 
                onClick={() => !disabled && handleOffsetChange(offsetField, b.v!)} 
                disabled={disabled}
                style={{ 
                  width: 22, 
                  height: 22, 
                  background: colors.bg, 
                  border: `1px solid ${colors.borderSecondary}`, 
                  borderRadius: 3, 
                  ...txt(9, colors.text), 
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1
                }}
              >
                {b.l}
              </button>
            )
          )}
        </div>

        {/* 图定时间 vs 实际时间 - 仅在时间不一致时显示 */}
        {isTimeChanged && (
          <div style={{ 
            padding: '4px 8px', 
            background: '#FEE2E2', 
            borderRadius: 4, 
            textAlign: 'center',
            border: `1px solid #FECACA`
          }}>
            <span style={{ ...txt(10, '#991B1B') }}>
              图定: 
              <span style={{ ...txt(11, '#7F1D1D'), fontWeight: 700, marginLeft: 4 }}>{scheduledTime}</span>
            </span>
            <span style={{ ...txt(10, '#DC2626'), marginLeft: 8, fontWeight: 700 }}>→</span>
            <span style={{ ...txt(10, '#DC2626'), marginLeft: 4 }}>
              实际: 
              <span style={{ ...txt(11, '#991B1B'), fontWeight: 700, marginLeft: 4 }}>{actualTime}</span>
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={getOverlayStyle()} onClick={handleOverlayClick} />

      <div style={getContainerStyle()}>
        <div style={getHeaderStyle()}>
          <div style={getTitleStyle()}>时间调整</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 当前车次 */}
            <div
              className={`train-pill ${currentTrainTypeClass}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '18px',
                fontFamily: '"Noto Serif SC", serif',
                letterSpacing: '1px',
                width: 'auto',
                minWidth: '90px',
                maxWidth: '120px',
                border: '2px solid',
                ...currentTrainPillStyles
              }}
            >
              {currentTrainNo}
            </div>

            {/* 接续/折返标签 */}
            {isConnectedTrain && (
              <span style={{
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                color: '#0E7490',
                fontWeight: '600',
                border: '1px solid rgba(14, 116, 144, 0.3)',
                flexShrink: 0
              }}>
                {isTerminationTrain ? '接续' : '折返'}
              </span>
            )}

            {/* 关联图标 */}
            {isConnectedTrain && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}

            {/* 关联车次 - 明显缩小显示，样式与数据卡片一致 */}
            {isConnectedTrain && (
              <div
                className={`train-pill ${connectedTrainTypeClass}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '11px',
                  fontFamily: '"Noto Serif SC", serif',
                  letterSpacing: '0.5px',
                  width: 'auto',
                  minWidth: '60px',
                  maxWidth: '90px',
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  opacity: 0.85,
                  ...connectedTrainPillStyles
                }}
                onClick={handleSwitchToConnected}
                title={`点击跳转到${isArrival ? '始发车' : '终到车'}`}
              >
                {connectedTrainNo}
              </div>
            )}
            
            <Button
              type="text"
              icon={<X size={16} />}
              onClick={onClose}
              style={getCloseButtonStyle()}
            />
          </div>
        </div>

        <div style={getContentStyle()}>
          {/* 验证错误提示 */}
          {validationErrors.length > 0 && (
            <div style={{ 
              width: '100%', 
              background: '#FEF2F2', 
              border: '1px solid #FECACA', 
              borderRadius: 5, 
              padding: '10px 12px',
              marginBottom: '8px'
            }}>
              {validationErrors.map((error, index) => (
                <div key={index} style={{ ...txt(12, colors.error), display: 'flex', alignItems: 'center', gap: '6px', marginBottom: index < validationErrors.length - 1 ? '4px' : 0 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.error }}></span>
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* 固定时间区域 */}
          <div style={{ width: '100%', display: 'flex', gap: 12 }}>
            {/* 图定到点 - 终到车和途经车显示 */}
            {showArrival && (
              <div
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 5,
                  border: '1px solid #C4F4EB',
                  background: 'linear-gradient(90deg, #EEFDF9 0%, #D1FBF2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ ...txt(12, '#21868C') }}>图定到点</span>
                <span style={{ ...txt(16, '#134E4A'), fontWeight: 600 }}>{baseArrivalTime}</span>
              </div>
            )}
            {/* 图定发点 - 始发车和途经车显示 */}
            {showDeparture && (
              <div
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 5,
                  border: '1px solid #C4F4EB',
                  background: 'linear-gradient(90deg, #EEFDF9 0%, #D1FBF2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ ...txt(12, '#21868C') }}>图定发点</span>
                <span style={{ ...txt(16, '#134E4A'), fontWeight: 600 }}>{baseDepartureTime}</span>
              </div>
            )}
          </div>

          {/* CTC时间区域 - 当CTC时间与实际时间不一致时突出显示 */}
          <div style={{ 
            width: '100%', 
            background: hasTimeConflict ? '#FEFCE8' : colors.ctcBg, 
            border: `1px solid ${hasTimeConflict ? '#FACC15' : colors.ctcBorder}`, 
            borderRadius: 5, 
            padding: '10px 12px',
            boxShadow: hasTimeConflict ? '0 0 12px rgba(250, 204, 21, 0.3)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...txt(14, colors.text), fontWeight: 600 }}>CTC时间</span>
                {hasTimeConflict && (
                  <span style={{ 
                    background: '#FDE047', 
                    color: '#854D0E', 
                    padding: '1px 6px', 
                    borderRadius: 3, 
                    fontSize: 10, 
                    fontWeight: 600 
                  }}>
                    ⚠ 时间不一致
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* 状态标签：有CTC时间显示已停止，没有显示自动接收中 */}
                {(hasArrivalCtc || hasDepartureCtc) ? (
                  <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    已停止
                  </span>
                ) : (
                  <span style={{ background: '#F3F4F6', color: colors.textSecondary, padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                    自动接收中
                  </span>
                )}
                {/* 手动接收按钮 - 仅在有CTC时间时显示 */}
                {(hasArrivalCtc || hasDepartureCtc) && (
                  <button
                    onClick={handleManualReceive}
                    style={{
                      padding: '4px 12px',
                      background: hasTimeConflict ? '#F59E0B' : '#007AFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: hasTimeConflict ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    手动接收
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 12 }}>
              {/* 到点 - 终到车和途经车显示，仅在CTC时间存在且与图定时间不同时显示 */}
              {showArrival && hasArrivalCtc && (
                <div>
                  <span style={{ color: colors.ctcText }}>到点: </span>
                  <span style={{ ...txt(13, hasArrivalConflict ? '#DC2626' : colors.ctcValue), fontWeight: 600 }}>{train.ctcArrivalTime}</span>
                </div>
              )}
              {/* 发点 - 始发车和途经车显示，仅在CTC时间存在且与图定时间不同时显示 */}
              {showDeparture && hasDepartureCtc && (
                <div>
                  <span style={{ color: colors.ctcText }}>发点: </span>
                  <span style={{ ...txt(13, hasDepartureConflict ? '#DC2626' : colors.ctcValue), fontWeight: 600 }}>{train.ctcDepartureTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* 实际时间区域 */}
          <div style={{ width: '100%', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 5, padding: '14px' }}>
            {/* 标题行 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width={16} height={16} viewBox="0 0 22 22" fill="none">
                  <circle cx={11} cy={11} r={9} stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 6V11L14 14" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ ...txt(13, colors.text), fontWeight: 600 }}>实际时间调整</span>
              </div>
              
              {/* 累加模式切换 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#F3F4F6', borderRadius: 6 }}>
                <span style={{ ...txt(11, colors.textSecondary) }}>累加模式</span>
                <button
                  onClick={() => setIsCumulative(!isCumulative)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: isCumulative ? '#007AFF' : '#D1D5DB',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    border: 'none'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'white',
                      top: 2,
                      left: isCumulative ? 18 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                </button>
              </div>
            </div>

            {/* 时间调整区域 */}
            <div style={{ display: 'flex', gap: 16 }}>
              {/* 实际到点 - 终到车和途经车显示 */}
              {showArrival && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '12px', background: '#FAFAFA', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ ...txt(12, colors.text), fontWeight: 600 }}>实际到点</span>
                    {actualTimes.arrivalTime && actualTimes.arrivalTime !== baseArrivalTime && (() => {
                      const actual = timeToMinutes(actualTimes.arrivalTime);
                      const base = timeToMinutes(baseArrivalTime);
                      const diff = actual - base;
                      const isLate = diff > 0;
                      const isEarly = diff < 0;
                      
                      return (
                        <span style={{ 
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '11px',
                          fontWeight: '600',
                          background: isLate ? '#FEE2E2' : isEarly ? '#DCFCE7' : '#F3F4F6',
                          color: isLate ? '#DC2626' : isEarly ? '#16A34A' : '#6B7280'
                        }}>
                          {isLate ? `晚${Math.abs(diff)}分` : isEarly ? `早${Math.abs(diff)}分` : '正点'}
                        </span>
                      );
                    })()}
                  </div>
                  
                  {/* 时间输入行 */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Input 
                        value={actualTimes.arrivalTime} 
                        onChange={(e) => handleActualTimeChange('arrival', e.target.value)}
                        placeholder="HH:MM"
                        style={{ 
                          height: 42, 
                          textAlign: 'center', 
                          fontSize: '20px', 
                          fontWeight: '700',
                          fontFamily: 'monospace',
                          background: '#FFFFFF',
                          border: actualTimes.arrivalTime && actualTimes.arrivalTime !== baseArrivalTime 
                            ? '2px solid #007AFF' 
                            : '1px solid #D1D5DB',
                          borderRadius: 6
                        }} 
                      />
                      {actualTimes.arrivalTime && actualTimes.arrivalTime !== baseArrivalTime && (
                        <span style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 16,
                          height: 16,
                          background: '#007AFF',
                          color: 'white',
                          borderRadius: '50%',
                          fontSize: '9px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>✓</span>
                      )}
                    </div>
                  </div>

                  {/* 相对调整行 */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ ...txt(10, colors.textSecondary), minWidth: 60 }}>相对调整</span>
                    <Input 
                      value={relativeAdjusts.arrival} 
                      onChange={(e) => handleRelativeAdjust('arrival', e.target.value)}
                      placeholder="±N"
                      style={{ 
                        width: 70,
                        height: 32, 
                        textAlign: 'center', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        background: '#FEF3C7',
                        border: '1px solid #F59E0B',
                        borderRadius: 5
                      }} 
                    />
                    <button
                      onClick={() => applyRelativeAdjust('arrival')}
                      disabled={!relativeAdjusts.arrival}
                      style={{
                        flex: 1,
                        height: 32,
                        background: relativeAdjusts.arrival ? '#F59E0B' : '#E5E7EB',
                        color: relativeAdjusts.arrival ? 'white' : '#9CA3AF',
                        borderRadius: 5,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: relativeAdjusts.arrival ? 'pointer' : 'not-allowed',
                        border: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      应用
                    </button>
                  </div>
                </div>
              )}

              {/* 实际发点 - 始发车和途经车显示 */}
              {showDeparture && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '12px', background: '#FAFAFA', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ ...txt(12, colors.text), fontWeight: 600 }}>实际发点</span>
                    {actualTimes.departureTime && actualTimes.departureTime !== baseDepartureTime && (() => {
                      const actual = timeToMinutes(actualTimes.departureTime);
                      const base = timeToMinutes(baseDepartureTime);
                      const diff = actual - base;
                      const isLate = diff > 0;
                      const isEarly = diff < 0;
                      
                      return (
                        <span style={{ 
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '11px',
                          fontWeight: '600',
                          background: isLate ? '#FEE2E2' : isEarly ? '#DCFCE7' : '#F3F4F6',
                          color: isLate ? '#DC2626' : isEarly ? '#16A34A' : '#6B7280'
                        }}>
                          {isLate ? `晚${Math.abs(diff)}分` : isEarly ? `早${Math.abs(diff)}分` : '正点'}
                        </span>
                      );
                    })()}
                  </div>
                  
                  {/* 时间输入行 */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Input 
                        value={actualTimes.departureTime} 
                        onChange={(e) => handleActualTimeChange('departure', e.target.value)}
                        placeholder="HH:MM"
                        style={{ 
                          height: 42, 
                          textAlign: 'center', 
                          fontSize: '20px', 
                          fontWeight: '700',
                          fontFamily: 'monospace',
                          background: '#FFFFFF',
                          border: actualTimes.departureTime && actualTimes.departureTime !== baseDepartureTime 
                            ? '2px solid #007AFF' 
                            : '1px solid #D1D5DB',
                          borderRadius: 6
                        }} 
                      />
                      {actualTimes.departureTime && actualTimes.departureTime !== baseDepartureTime && (
                        <span style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 16,
                          height: 16,
                          background: '#007AFF',
                          color: 'white',
                          borderRadius: '50%',
                          fontSize: '9px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>✓</span>
                      )}
                    </div>
                  </div>

                  {/* 相对调整行 */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ ...txt(10, colors.textSecondary), minWidth: 60 }}>相对调整</span>
                    <Input 
                      value={relativeAdjusts.departure} 
                      onChange={(e) => handleRelativeAdjust('departure', e.target.value)}
                      placeholder="±N"
                      style={{ 
                        width: 70,
                        height: 32, 
                        textAlign: 'center', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        background: '#FEF3C7',
                        border: '1px solid #F59E0B',
                        borderRadius: 5
                      }} 
                    />
                    <button
                      onClick={() => applyRelativeAdjust('departure')}
                      disabled={!relativeAdjusts.departure}
                      style={{
                        flex: 1,
                        height: 32,
                        background: relativeAdjusts.departure ? '#F59E0B' : '#E5E7EB',
                        color: relativeAdjusts.departure ? 'white' : '#9CA3AF',
                        borderRadius: 5,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: relativeAdjusts.departure ? 'pointer' : 'not-allowed',
                        border: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      应用
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 开停检时间调整区域 */}
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
              
              {/* 顺延模式切换 - 与累加模式风格一致 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: isPostponed ? '#DCFCE7' : '#F3F4F6', borderRadius: 6, border: `1px solid ${isPostponed ? '#86EFAC' : '#E5E7EB'}` }}>
                <span style={{ ...txt(11, isPostponed ? '#15803D' : colors.textSecondary) }}>顺延</span>
                <button
                  onClick={() => setIsPostponed(!isPostponed)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: isPostponed ? '#16A34A' : '#D1D5DB',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    border: 'none'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'white',
                      top: 2,
                      left: isPostponed ? 18 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {showCheckIn && (
                <>
                  <CheckTimeCard 
                    title="进站开检" 
                    offset={offsets.checkInOpenOffset} 
                    defaultOffset={-15} 
                    offsetField="checkInOpenOffset"
                    baseTime={checkInBaseTime}
                    defaultBaseTime={baseDepartureTime}
                    disabled={!showCheckIn}
                  />
                  <CheckTimeCard 
                    title="进站停检" 
                    offset={offsets.checkInCloseOffset} 
                    defaultOffset={-5} 
                    offsetField="checkInCloseOffset"
                    baseTime={checkInBaseTime}
                    defaultBaseTime={baseDepartureTime}
                    disabled={!showCheckIn}
                  />
                </>
              )}
              {showCheckOut && (
                <>
                  <CheckTimeCard 
                    title="出站开检" 
                    offset={offsets.checkOutOpenOffset} 
                    defaultOffset={0} 
                    offsetField="checkOutOpenOffset"
                    baseTime={checkOutBaseTime}
                    defaultBaseTime={baseArrivalTime}
                    disabled={!showCheckOut}
                  />
                  <CheckTimeCard 
                    title="出站停检" 
                    offset={offsets.checkOutCloseOffset} 
                    defaultOffset={30} 
                    offsetField="checkOutCloseOffset"
                    baseTime={checkOutBaseTime}
                    defaultBaseTime={baseArrivalTime}
                    disabled={!showCheckOut}
                  />
                </>
              )}
            </div>
          </div>

          {/* 底部按钮 */}
          <div style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <Button 
              onClick={handleReset} 
              style={{ 
                flex: 1, 
                height: 40, 
                background: '#F5F3EF', 
                border: '1px solid rgba(29, 78, 95, 0.2)', 
                borderRadius: 5, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                gap: 6, 
                color: '#1D4E5F' 
              }} 
              icon={<RotateCcw size={16} />}
            >
              恢复默认
            </Button>
            <Button 
              onClick={handleSave} 
              type="primary" 
              disabled={validationErrors.length > 0}
              style={{ 
                flex: 1, 
                height: 40, 
                background: validationErrors.length > 0 ? '#C7C7C7' : 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)', 
                border: 'none', 
                borderRadius: 5, 
                ...txt(13, '#FFFFFF'), 
                cursor: validationErrors.length > 0 ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 6 
              }} 
              icon={<Save size={16} />}
            >
              保存
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const getOverlayStyle = (): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1001
});

const getContainerStyle = (): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '560px',
  background: '#FAF8F5',
  zIndex: 1002,
  boxShadow: '-8px 0 24px rgba(29,78,95,0.12)',
  display: 'flex',
  flexDirection: 'column'
});

const getHeaderStyle = (): React.CSSProperties => ({
  padding: '14px 18px',
  borderBottom: '1px solid rgba(29, 78, 95, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#fff',
  flexShrink: 0
});

const getTitleStyle = (): React.CSSProperties => ({
  fontSize: '15px',
  fontWeight: '600',
  color: '#1F2937',
  letterSpacing: '0.5px'
});

const getCloseButtonStyle = (): React.CSSProperties => ({
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  color: '#64748B',
  background: '#F5F3EF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const getContentStyle = (): React.CSSProperties => ({
  flex: 1,
  padding: '16px 18px',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
});

export { TimeAdjustDrawer };
