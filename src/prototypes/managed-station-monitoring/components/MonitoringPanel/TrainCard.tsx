/**
 * 代管盯控 - 车次卡片
 */
import React from 'react';
import { Tooltip, Badge } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  TeamOutlined,
  CrownOutlined,
  FireOutlined
} from '@ant-design/icons';
import type { TrainSchedule, DisplayConfig, ThemeMode } from '../../types';

interface TrainCardProps {
  train: TrainSchedule;
  display: DisplayConfig;
  theme: ThemeMode;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const TrainCard: React.FC<TrainCardProps> = ({
  train,
  display,
  theme,
  isSelected,
  isHighlighted,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  // 计算站停时间（分钟）
  const getStopDuration = (): number => {
    if (train.isOrigin || train.isEnd) return 0;
    const arrival = train.arrival.time;
    const departure = train.departure.time;
    if (!arrival || !departure) return 0;

    const [arrHour, arrMin] = arrival.split(':').map(Number);
    const [depHour, depMin] = departure.split(':').map(Number);
    return (depHour * 60 + depMin) - (arrHour * 60 + arrMin);
  };

  const stopDuration = getStopDuration();
  const stopPercent = Math.min(100, Math.max(10, (stopDuration / 30) * 100)); // 30分钟为100%

  // 获取状态颜色
  const getStatusColor = () => {
    if (train.isOrigin) return '#10b981'; // 绿色-始发车
    if (train.isEnd) return '#ef4444'; // 红色-终到车
    return '#3b82f6'; // 蓝色-途径车
  };

  // 获取方向图标
  const DirectionIcon = train.directionIndicator === 'north' ? ArrowUpOutlined : ArrowDownOutlined;

  // 是否有异常
  const hasAbnormal = train.arrival.lateEarly || train.departure.lateEarly || train.trackChange;

  return (
    <Tooltip
      title={
        <div style={{ padding: 8 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{train.trainNo}</div>
          <div>车站：{train.station}</div>
          <div>股道：{train.track}</div>
          {train.platform && <div>站台：{train.platform}</div>}
          {train.master1 && <div>列车长1：{train.master1}</div>}
          {train.master2 && <div>列车长2：{train.master2}</div>}
          {train.passengerFlow && (
            <div>
              客流：上{train.passengerFlow.boarding}/下{train.passengerFlow.alighting}/换{train.passengerFlow.transfer}
            </div>
          )}
          {(train.arrival.lateEarly || train.departure.lateEarly) && (
            <div style={{ color: '#f97316' }}>
              晚点：{train.arrival.lateEarly || train.departure.lateEarly}
            </div>
          )}
          {train.trackChange && (
            <div style={{ color: '#ef4444' }}>
              股道变更：{train.trackChange.from} → {train.trackChange.to}
            </div>
          )}
        </div>
      }
      placement="top"
    >
      <div
        className={`train-card ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          padding: '8px 12px',
          marginBottom: 5,
          background: isSelected
            ? 'var(--primary)'
            : isHighlighted
              ? 'var(--accent)'
              : 'var(--card)',
          border: `1px solid ${isSelected ? 'var(--primary)' : isHighlighted ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 6,
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          minWidth: 140
        }}
      >
        {/* 顶部信息行 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 'bold', fontSize: 14 }}>{train.trainNo}</span>
            <DirectionIcon style={{ fontSize: 12, color: getStatusColor() }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{train.track}道</span>
        </div>

        {/* 时间信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {!train.isOrigin && (
            <span style={{ fontSize: 12 }}>
              到 {train.arrival.time}
              {train.arrival.lateEarly && (
                <span style={{ color: '#f97316', marginLeft: 4 }}>({train.arrival.lateEarly})</span>
              )}
            </span>
          )}
          {!train.isEnd && (
            <span style={{ fontSize: 12 }}>
              发 {train.departure.time}
              {train.departure.lateEarly && (
                <span style={{ color: '#f97316', marginLeft: 4 }}>({train.departure.lateEarly})</span>
              )}
            </span>
          )}
        </div>

        {/* 站停时间线 */}
        {!train.isOrigin && !train.isEnd && (
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                height: 4,
                background: 'var(--muted)',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${stopPercent}%`,
                  height: '100%',
                  background: getStatusColor(),
                  borderRadius: 2
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
              停{stopDuration}分
            </div>
          </div>
        )}

        {/* 重点事项图标 */}
        {display.showKeyItems && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {train.keyItems.water && <Badge color="blue" />}
            {train.keyItems.sewage && <Badge color="orange" />}
            {train.keyItems.parcel && <Badge color="purple" />}
            {train.keyItems.meal && <Badge color="cyan" />}
            {train.keyItems.highFlow && <FireOutlined style={{ color: '#f97316', fontSize: 12 }} />}
            {train.keyItems.overcrowd && <TeamOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
            {train.keyItems.special && <CrownOutlined style={{ color: '#eab308', fontSize: 12 }} />}
          </div>
        )}

        {/* 异常标记 */}
        {hasAbnormal && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#ef4444'
            }}
          />
        )}
      </div>
    </Tooltip>
  );
};
