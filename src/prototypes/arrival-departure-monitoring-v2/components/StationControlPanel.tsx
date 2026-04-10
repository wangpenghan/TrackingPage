import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  trainCount: number; // 当日计划总数
  abnormalCount: number; // 正在作业数量
  alarmCount: number; // 异常作业数量（原4小时内）
  // 计划变更统计
  planChangeStats: {
    yesterday: number; // 昨日变更数量
    kemo: number;      // 客模变更数量
    both: number;      // 多方变更数量
    total: number;     // 总变更数量
  };
  delayCount?: number;
}

interface StationControlPanelProps {
  stations: Station[];
  darkMode?: boolean;
  selectedStationId?: string;
  onStationSelect?: (stationId: string, stationName: string, clickType: 'normal' | 'abnormal' | 'operating') => void;
}

export const StationControlPanel: React.FC<StationControlPanelProps> = ({
  stations,
  darkMode = false,
  selectedStationId: propSelectedStationId,
  onStationSelect
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>('1'); // 默认选中重庆东
  const selectedStationId = propSelectedStationId ?? internalSelectedId;

  // 模拟数据：各站计划变更统计
  const simulatedStations = stations.map(station => {
    if (station.name === '巴南') {
      return {
        ...station,
        alarmCount: 2, // 巴南异常作业数量为2
        abnormalCount: 1, // 巴南正在作业数量为1
        planChangeStats: {
          yesterday: 1,
          kemo: 0,
          both: 1,
          total: 2
        }
      };
    } else if (station.name === '重庆东') {
      return {
        ...station,
        alarmCount: 0, // 重庆东异常作业为0
        abnormalCount: 0,
        planChangeStats: {
          yesterday: 2,
          kemo: 1,
          both: 1,
          total: 4
        }
      };
    }
    return {
      ...station,
      alarmCount: 0, // 其他站异常作业为0
      abnormalCount: 0,
      planChangeStats: {
        yesterday: 0,
        kemo: 0,
        both: 0,
        total: 0
      }
    };
  });

  const handleStationClick = (station: Station, clickType: 'normal' | 'abnormal' | 'operating') => {
    setInternalSelectedId(station.id);
    if (onStationSelect) {
      onStationSelect(station.id, station.name, clickType);
    }
  };

  return (
    <div
      style={{
        background: darkMode ? '#1c1c1c' : '#f5f5f5',
        borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
        padding: '16px 24px',
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 105
      }}
    >
      {simulatedStations.map((station) => (
        <div
          key={station.id}
          style={{
            background: selectedStationId === station.id
              ? (darkMode ? '#2d2d2d' : '#ffffff')
              : (darkMode ? '#252525' : '#f0f0f0'),
            border: selectedStationId === station.id
              ? (darkMode ? '1px solid #4a4a4a' : '1px solid #d0d0d0')
              : (darkMode ? '1px solid #333' : '1px solid #e0e0e0'),
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '320px',
            boxShadow: selectedStationId === station.id
              ? (darkMode ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.15)')
              : (darkMode ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'),
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => handleStationClick(station, 'normal')}
        >
          <MapPin
            size={20}
            color={selectedStationId === station.id
              ? (darkMode ? '#007aff' : '#0066cc')
              : (darkMode ? '#8e8e93' : '#666666')}
            style={{ flexShrink: 0 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '20px' }}>
            <div style={{ fontWeight: '600', fontSize: '16px', color: selectedStationId === station.id ? (darkMode ? '#ffffff' : '#000000') : (darkMode ? '#e0e0e0' : '#333333') }}>
              {station.name}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
              {/* 当日计划 - 蓝色 */}
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStationClick(station, 'normal');
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: darkMode ? '#007aff' : '#0066cc',
                  marginBottom: '4px'
                }} />
                <div style={{ fontSize: '14px', fontWeight: '500', color: selectedStationId === station.id ? (darkMode ? '#ffffff' : '#000000') : (darkMode ? '#e0e0e0' : '#333333') }}>
                  {station.trainCount}
                </div>
                <div style={{ fontSize: '10px', color: darkMode ? '#8e8e93' : '#999999', marginTop: '2px' }}>
                  当日计划
                </div>
              </div>
              {/* 正在作业 - 绿色 */}
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: station.abnormalCount > 0 ? 'pointer' : 'default' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (station.abnormalCount > 0) {
                    handleStationClick(station, 'operating');
                  }
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: station.abnormalCount > 0
                    ? (darkMode ? '#34c759' : '#34c759')
                    : (darkMode ? '#8e8e93' : '#999999'),
                  marginBottom: '4px'
                }} />
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: selectedStationId === station.id ? (darkMode ? '#ffffff' : '#000000') : (darkMode ? '#e0e0e0' : '#333333'),
                  cursor: station.abnormalCount > 0 ? 'pointer' : 'default'
                }}>
                  {station.abnormalCount}
                </div>
                <div style={{ fontSize: '10px', color: darkMode ? '#8e8e93' : '#999999', marginTop: '2px' }}>
                  正在作业
                </div>
              </div>
              {/* 异常作业 - 红色闪烁 */}
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: station.alarmCount > 0 ? 'pointer' : 'default' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (station.alarmCount > 0) {
                    handleStationClick(station, 'abnormal');
                  }
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: station.alarmCount > 0
                    ? (darkMode ? '#ff3b30' : '#ff3b30')
                    : (darkMode ? '#8e8e93' : '#999999'),
                  marginBottom: '4px',
                  animation: station.alarmCount > 0 ? 'blink 1s infinite' : 'none'
                }} />
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: selectedStationId === station.id ? (darkMode ? '#ffffff' : '#000000') : (darkMode ? '#e0e0e0' : '#333333'),
                  cursor: station.alarmCount > 0 ? 'pointer' : 'default'
                }}>
                  {station.alarmCount > 0 ? station.alarmCount : 0}
                </div>
                <div style={{ fontSize: '10px', color: darkMode ? '#8e8e93' : '#999999', marginTop: '2px' }}>
                  异常作业
                </div>
              </div>
              {/* 计划变更 - 按类型分色 */}
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: station.planChangeStats.total > 0 ? 'pointer' : 'default' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (station.planChangeStats.total > 0) {
                    handleStationClick(station, 'abnormal');
                  }
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: station.planChangeStats.total > 0
                    ? (station.planChangeStats.both > 0 
                        ? (darkMode ? '#ff453a' : '#ff3b30')  // 多方变更-红色
                        : station.planChangeStats.kemo > 0 
                          ? (darkMode ? '#ff9f0a' : '#ff9500')  // 客模变更-橙色
                          : (darkMode ? '#0a84ff' : '#007aff'))  // 昨日变更-蓝色
                    : (darkMode ? '#8e8e93' : '#999999'),
                  marginBottom: '4px',
                  animation: station.planChangeStats.total > 0 ? 'blink 1s infinite' : 'none'
                }} />
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: selectedStationId === station.id ? (darkMode ? '#ffffff' : '#000000') : (darkMode ? '#e0e0e0' : '#333333'),
                  cursor: station.planChangeStats.total > 0 ? 'pointer' : 'default'
                }}>
                  {station.planChangeStats.total > 0 ? station.planChangeStats.total : 0}
                </div>
                <div style={{ fontSize: '10px', color: darkMode ? '#8e8e93' : '#999999', marginTop: '2px' }}>
                  计划变更
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* 添加闪烁动画样式 */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
