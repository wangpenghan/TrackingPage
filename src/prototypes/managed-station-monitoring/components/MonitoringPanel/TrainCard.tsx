/**
 * 代管盯控 - 小火车风格车次卡片
 */
import React, { useState, useEffect } from 'react';
import { Tooltip, Badge } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  TeamOutlined,
  CrownOutlined
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
  const [isHovered, setIsHovered] = useState(false);
  
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

  // 处理悬停状态
  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave();
  };

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
        className={`train-card ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          marginBottom: 20,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          filter: hasAbnormal ? 'drop-shadow(0 0 8px #ef4444)' : 'none'
        }}
      >
        {/* 蒸汽效果 */}
        <div className="train-steam">
          <div className={`steam ${isHovered ? 'steam-active' : ''}`}></div>
          <div className={`steam ${isHovered ? 'steam-active' : ''}`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`steam ${isHovered ? 'steam-active' : ''}`} style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* 火车主体 */}
        <div
          style={{
            position: 'relative',
            background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}80 100%)`,
            borderRadius: '8px 12px 12px 8px',
            padding: '12px 16px',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)',
            minWidth: 160
          }}
        >
          {/* 火车头 */}
          <div
            style={{
              position: 'absolute',
              right: -20,
              top: 0,
              bottom: 0,
              width: 20,
              background: '#dc2626',
              clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
            }}
          />

          {/* 烟囱 */}
          <div
            style={{
              position: 'absolute',
              top: -8,
              right: 10,
              width: 8,
              height: 12,
              background: '#374151',
              borderRadius: '2px 2px 0 0'
            }}
          />

          {/* 顶部信息行 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 'bold', fontSize: 16, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>{train.trainNo}</span>
              <DirectionIcon style={{ fontSize: 14 }} />
            </div>
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 10 }}>{train.track}道</span>
          </div>

          {/* 时间信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 12 }}>
            {!train.isOrigin && (
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                到 {train.arrival.time}
                {train.arrival.lateEarly && (
                  <span style={{ color: '#fef3c7', marginLeft: 4 }}>({train.arrival.lateEarly})</span>
                )}
              </div>
            )}
            {!train.isEnd && (
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                发 {train.departure.time}
                {train.departure.lateEarly && (
                  <span style={{ color: '#fef3c7', marginLeft: 4 }}>({train.departure.lateEarly})</span>
                )}
              </div>
            )}
          </div>

          {/* 站停时间线 */}
          {!train.isOrigin && !train.isEnd && (
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  height: 4,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${stopPercent}%`,
                    height: '100%',
                    background: 'white',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                停{stopDuration}分
              </div>
            </div>
          )}

          {/* 重点事项图标 */}
          {display.showKeyItems && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {train.keyItems.water && <Badge color="#60a5fa" size="small" />}
              {train.keyItems.sewage && <Badge color="#f97316" size="small" />}
              {train.keyItems.parcel && <Badge color="#a78bfa" size="small" />}
              {train.keyItems.meal && <Badge color="#22d3ee" size="small" />}
              {train.keyItems.highFlow && <FireOutlined style={{ color: '#fef3c7', fontSize: 12 }} />}
              {train.keyItems.overcrowd && <TeamOutlined style={{ color: '#fecaca', fontSize: 12 }} />}
              {train.keyItems.special && <CrownOutlined style={{ color: '#fef3c7', fontSize: 12 }} />}
            </div>
          )}

          {/* 异常标记 */}
          {hasAbnormal && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid white',
                animation: 'pulse 1s infinite'
              }}
            />
          )}
        </div>

        {/* 车轮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 10px' }}>
          <div className="train-wheel"></div>
          <div className="train-wheel"></div>
          <div className="train-wheel"></div>
          <div className="train-wheel"></div>
        </div>

        {/* 轨道 */}
        <div
          style={{
            height: 2,
            background: '#6b7280',
            marginTop: 4,
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 1,
              background: '#9ca3af',
              transform: 'translateY(-50%)'
            }}
          />
        </div>
      </div>
    </Tooltip>
  );
};
