import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TrainSchedule, AbnormalInfo } from './mock-data';
import { getAbnormalTrains } from './utils/abnormalDetector';
import { getStationColor } from './hooks/useMultiStation';

interface AbnormalAlertPanelProps {
  trains: TrainSchedule[];
  darkMode?: boolean;
  onAbnormalClick?: (trainId: string) => void;
}

/**
 * 获取车次颜色（与V2保持一致）
 */
const getTrainTypeColor = (trainType: string) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    'cyan': {
      bg: '#e0f2fe',
      text: '#0284c7',
    },
    'purple': {
      bg: '#f3e8ff',
      text: '#9333ea',
    },
    'yellow': {
      bg: '#fef9c3',
      text: '#a16207',
    },
    'default': {
      bg: '#dcfce7',
      text: '#16a34a',
    },
  };

  return colorMap[trainType] || colorMap['default'];
};

export const AbnormalAlertPanel: React.FC<AbnormalAlertPanelProps> = ({
  trains,
  darkMode = false,
  onAbnormalClick,
}) => {
  const abnormalTrains = getAbnormalTrains(trains);

  if (abnormalTrains.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: darkMode ? '#7c2d12' : '#fef3c7',
        border: `1px solid ${darkMode ? '#ea580c' : '#fbbf24'}`,
        borderRadius: '8px',
        margin: '12px 16px',
        overflow: 'hidden',
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: darkMode ? '#9a3412' : '#fde68a',
          borderBottom: `1px solid ${darkMode ? '#ea580c' : '#fbbf24'}`,
        }}
      >
        <AlertTriangle size={18} color={darkMode ? '#fbbf24' : '#d97706'} />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: darkMode ? '#fbbf24' : '#92400e',
          }}
        >
          作业异常提醒 ({abnormalTrains.length})
        </span>
      </div>

      {/* 异常列表 - 分段式展示 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 16px',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: darkMode ? '#ea580c transparent' : '#fbbf24 transparent',
        }}
      >
        {abnormalTrains.map(({ train, abnormalities }) =>
          abnormalities.map((abnormal, idx) => {
            const stationColor = getStationColor(train.stationId);
            const trainColor = getTrainTypeColor(train.trainType);
            
            return (
              <button
                key={`${train.id}-${idx}`}
                onClick={() => onAbnormalClick?.(train.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${darkMode ? '#ea580c' : '#fbbf24'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? 'rgba(0,0,0,0.35)'
                    : 'rgba(255,255,255,1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? 'rgba(0,0,0,0.2)'
                    : 'rgba(255,255,255,0.8)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* 时间 - 主键，大号字体 */}
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: darkMode ? '#fca5a5' : '#dc2626',
                    fontFamily: 'monospace',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {abnormal.plannedTime}
                </span>

                {/* 分隔线 */}
                <span
                  style={{
                    width: '1px',
                    height: '20px',
                    background: darkMode ? 'rgba(234,88,12,0.4)' : 'rgba(251,191,36,0.6)',
                  }}
                />

                {/* 车站标签 */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: darkMode ? stationColor.dark.bg : stationColor.light.bg,
                    color: darkMode ? stationColor.dark.text : stationColor.light.text,
                    border: `1px solid ${darkMode ? stationColor.dark.border : stationColor.light.border}`,
                  }}
                >
                  {train.stationName}
                </span>

                {/* 车次 - 使用V2颜色 */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: darkMode ? 'rgba(255,255,255,0.15)' : trainColor.bg,
                    color: darkMode ? '#fff' : trainColor.text,
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${trainColor.bg}`,
                  }}
                >
                  {train.trainNo}
                </span>

                {/* 分隔线 */}
                <span
                  style={{
                    width: '1px',
                    height: '16px',
                    background: darkMode ? 'rgba(234,88,12,0.3)' : 'rgba(251,191,36,0.4)',
                  }}
                />

                {/* 异常内容描述 */}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: darkMode ? '#fdba74' : '#c2410c',
                  }}
                >
                  {abnormal.description}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
