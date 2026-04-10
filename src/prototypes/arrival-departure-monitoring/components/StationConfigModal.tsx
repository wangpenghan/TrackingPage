import React from 'react';
import { X, Train } from 'lucide-react';
import { Station } from '../hooks/useMultiStation';

interface StationConfigModalProps {
  visible: boolean;
  onClose: () => void;
  stations: Station[];
  onStationsChange: (stations: Station[]) => void;
  darkMode?: boolean;
}

export const StationConfigModal: React.FC<StationConfigModalProps> = ({
  visible,
  onClose,
  stations,
  onStationsChange,
  darkMode = false,
}) => {
  if (!visible) return null;

  const toggleStation = (stationId: string) => {
    const newStations = stations.map(s =>
      s.id === stationId ? { ...s, isActive: !s.isActive } : s
    );
    onStationsChange(newStations);
  };

  const activeCount = stations.filter(s => s.isActive).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: darkMode ? '#1e293b' : '#fff',
          borderRadius: '12px',
          width: '400px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: darkMode ? '#e2e8f0' : '#1f2937',
            }}
          >
            管辖车站配置
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: darkMode ? '#94a3b8' : '#6b7280',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 车站列表 */}
        <div
          style={{
            padding: '16px 20px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: darkMode ? '#94a3b8' : '#6b7280',
              marginBottom: '12px',
            }}
          >
            已选择 {activeCount} 个车站
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stations.map(station => (
              <label
                key={station.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: darkMode ? '#0f172a' : '#f9fafb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: `1px solid ${
                    station.isActive
                      ? darkMode
                        ? '#3b82f6'
                        : '#bfdbfe'
                      : darkMode
                      ? '#334155'
                      : '#e5e7eb'
                  }`,
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={station.isActive}
                  onChange={() => toggleStation(station.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: darkMode ? '#e2e8f0' : '#1f2937',
                      }}
                    >
                      {station.name}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: darkMode ? '#94a3b8' : '#6b7280',
                      }}
                    >
                      <Train size={12} />
                      {station.trainCount}列
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '12px',
                      color: darkMode ? '#94a3b8' : '#6b7280',
                    }}
                  >
                    {station.abnormalCount > 0 && (
                      <span style={{ color: '#ef4444' }}>
                        异常 {station.abnormalCount}
                      </span>
                    )}
                    {station.delayCount > 0 && (
                      <span style={{ color: '#f59e0b' }}>
                        晚点 {station.delayCount}
                      </span>
                    )}
                    {station.alarmCount > 0 && (
                      <span style={{ color: '#3b82f6' }}>
                        告警 {station.alarmCount}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: darkMode ? '#334155' : '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              color: darkMode ? '#e2e8f0' : '#374151',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
