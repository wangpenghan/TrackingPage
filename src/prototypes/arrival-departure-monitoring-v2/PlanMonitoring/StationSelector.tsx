import React from 'react';
import { StationMonitoringData } from './types';

interface StationSelectorProps {
  stations: StationMonitoringData[];
  selectedStationId: string;
  onStationSelect: (stationId: string) => void;
  darkMode?: boolean;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStationId,
  onStationSelect,
  darkMode = false
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        padding: '12px 0',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
        marginBottom: '20px',
        paddingBottom: '8px'
      }}
    >
      {stations.map(station => {
        const isSelected = station.stationId === selectedStationId;
        const hasAbnormalities = station.totalAbnormalities > 0;
        const totalPlans = station.planTypes.broadcast.total + station.planTypes.guide.total + station.planTypes.personnel.total;
        
        // 计算各类异常数量
        const missingCount = station.planTypes.broadcast.missing + station.planTypes.guide.missing + station.planTypes.personnel.missing;
        const failedCount = station.planTypes.broadcast.failed + station.planTypes.guide.failed + station.planTypes.personnel.failed;

        return (
          <button
            key={station.stationId}
            onClick={() => onStationSelect(station.stationId)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: '16px',
              border: isSelected
                ? `2px solid ${darkMode ? '#3b82f6' : '#2563eb'}`
                : `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: isSelected
                ? darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)'
                : darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = darkMode
                ? '0 6px 16px rgba(0,0,0,0.35)'
                : '0 6px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* 站点名称和异常标记 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: isSelected 
                    ? (darkMode ? '#3b82f6' : '#2563eb') 
                    : (darkMode ? '#e2e8f0' : '#1e293b')
                }}
              >
                {station.stationName}
              </span>
              {hasAbnormalities && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span
                    style={{
                      background: darkMode ? '#ef4444' : '#dc2626',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}
                  >
                    {station.totalAbnormalities}
                  </span>
                </div>
              )}
            </div>
            
            {/* 计划总数 */}
            <div
              style={{
                fontSize: '13px',
                color: darkMode ? '#94a3b8' : '#64748b',
                marginBottom: '4px'
              }}
            >
              计划总数: {totalPlans}
            </div>
            
            {/* 异常详情 */}
            {hasAbnormalities && (
              <div
                style={{
                  fontSize: '12px',
                  color: darkMode ? '#fca5a5' : '#dc2626'
                }}
              >
                缺失: {missingCount} | 失败: {failedCount}
              </div>
            )}
            
            {/* 状态指示器 */}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: hasAbnormalities 
                  ? (darkMode ? '#ef4444' : '#dc2626') 
                  : (darkMode ? '#10b981' : '#059669')
              }}
            />
          </button>
        );
      })}
    </div>
  );
};
