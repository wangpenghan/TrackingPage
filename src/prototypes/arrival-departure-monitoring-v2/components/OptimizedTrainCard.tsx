import React from 'react';
import { TrainSchedule } from '../mock-data';
import { AlertTriangle, Clock, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface OptimizedTrainCardProps {
  train: TrainSchedule;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  darkMode?: boolean;
}

/**
 * 优化的车次卡片组件
 * 设计原则：
 * 1. 信息分层：第一层（必看）→ 第二层（常看）→ 第三层（按需）
 * 2. 视觉层级：车次号最大，时间次之，其他信息最小
 * 3. 色彩简化：只用 4 种核心颜色
 * 4. 布局优化：两行布局，避免水平滚动
 */
export const OptimizedTrainCard: React.FC<OptimizedTrainCardProps> = ({
  train,
  index,
  isSelected,
  onSelect,
  darkMode = false
}) => {
  // 判断是否晚点
  const isLate = train.arrival.lateEarly?.startsWith('+');
  const isEarly = train.arrival.lateEarly?.startsWith('-');
  const isSuspended = train.location.currentPos.includes('停运');

  // 获取异常标记
  const hasAbnormal = train.tags.overcrowd || train.tags.special || isLate;

  // 获取关键标签（只显示最重要的）
  const keyTags = [
    train.tags.water && { icon: '🚰', label: '上水', color: 'blue' },
    train.tags.sewage && { icon: '💧', label: '吸污', color: 'orange' },
    train.tags.overcrowd && { icon: '⚠️', label: '超员', color: 'red' },
    train.tags.special && { icon: '👑', label: '专运', color: 'yellow' }
  ].filter(Boolean);

  // 时间显示格式
  const formatTime = (time: string) => time || '--';

  return (
    <div
      className={`optimized-train-card ${isSelected ? 'selected' : ''} ${isSuspended ? 'suspended' : ''}`}
      onClick={onSelect}
      style={{
        background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#ffffff',
        border: isSelected ? '2px solid #3b82f6' : `1px solid ${darkMode ? 'rgba(71, 85, 105, 0.5)' : '#e5e7eb'}`,
        borderRadius: '12px',
        marginBottom: '12px',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : `0 1px 3px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`,
        transition: 'all 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* ========== 第一行：核心信息 ========== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          background: darkMode ? 'rgba(51, 65, 85, 0.5)' : '#f9fafb',
          borderBottom: `1px solid ${darkMode ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'}`,
          flexWrap: 'wrap'
        }}
      >
        {/* 序号 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #2a4365 0%, #1a365d 100%)',
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            flexShrink: 0
          }}
        >
          {index + 1}
        </div>

        {/* 车次号 - 最突出 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              fontFamily: 'Noto Serif SC, serif',
              letterSpacing: '1px',
              minWidth: '80px',
              textAlign: 'center',
              padding: '4px 8px',
              background: train.status === 'origin' ? '#dcfce7' : train.status === 'end' ? '#fee2e2' : '#dbeafe',
              borderRadius: '8px',
              border: train.status === 'origin' ? '1px solid #86efac' : train.status === 'end' ? '1px solid #fca5a5' : '1px solid #93c5fd'
            }}
          >
            {train.trainNo}
          </div>
        </div>

        {/* 时间信息 - 清晰展示 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            minWidth: '200px'
          }}
        >
          {/* 到点 */}
          {train.status !== 'origin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>↑</span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  color: isLate ? '#dc2626' : isEarly ? '#2563eb' : darkMode ? '#f1f5f9' : '#1e293b'
                }}
              >
                {formatTime(train.arrival.time)}
              </span>
              {isLate && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#ffffff',
                    background: '#dc2626',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {train.arrival.lateEarly}
                </span>
              )}
            </div>
          )}

          {/* 发点 */}
          {train.status !== 'end' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>↓</span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
              >
                {formatTime(train.departure.time)}
              </span>
            </div>
          )}
        </div>

        {/* 异常标记 - 强调显示 */}
        {hasAbnormal && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={16} color="#dc2626" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b' }}>
              {isLate ? '晚点' : train.tags.overcrowd ? '超员' : '专运'}
            </span>
          </div>
        )}
      </div>

      {/* ========== 第二行：位置和作业信息 ========== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          padding: '12px 16px'
        }}
      >
        {/* 位置信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
          <div style={{ fontSize: '13px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>
            <div style={{ fontWeight: '600' }}>{train.location.track}道 / {train.location.platform}站</div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              {train.location.checkInGate !== '-' ? `检票: ${train.location.checkInGate}` : '无检票'}
            </div>
          </div>
        </div>

        {/* 作业状态 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
          <div style={{ fontSize: '13px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>
            <div style={{ fontWeight: '600' }}>
              {train.operations.checkIn.status === 'completed' ? '✓ 检票完成' : '检票中'}
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              {train.operations.platform.status === 'completed' ? '✓ 站台完成' : '站台中'}
            </div>
          </div>
        </div>

        {/* 关键标签 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {keyTags.map((tag: any, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: tag.color === 'blue' ? '#dbeafe' : tag.color === 'orange' ? '#fed7aa' : tag.color === 'red' ? '#fee2e2' : '#fef3c7',
                border: tag.color === 'blue' ? '1px solid #93c5fd' : tag.color === 'orange' ? '1px solid #fdba74' : tag.color === 'red' ? '1px solid #fca5a5' : '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: tag.color === 'blue' ? '#1e40af' : tag.color === 'orange' ? '#92400e' : tag.color === 'red' ? '#991b1b' : '#92400e'
              }}
            >
              <span>{tag.icon}</span>
              <span>{tag.label}</span>
            </div>
          ))}
        </div>

        {/* 客流信息 */}
        {train.passengerFlow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
            <div style={{ fontSize: '13px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>
              <div style={{ fontWeight: '600' }}>
                {train.status === 'origin' ? `上车: ${train.passengerFlow.boarding}` : train.status === 'end' ? `下车: ${train.passengerFlow.alighting}` : `上/下: ${train.passengerFlow.boarding}/${train.passengerFlow.alighting}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
