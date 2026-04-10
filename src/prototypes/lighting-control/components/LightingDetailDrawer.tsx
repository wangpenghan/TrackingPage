import React from 'react';
import { LightingHour, Area } from '../mock-data';
import { X, Sun } from 'lucide-react';

interface LightingDetailDrawerProps {
  onClose: () => void;
  lightingDetails: LightingHour[];
  darkMode: boolean;
  area: Area;
}

export const LightingDetailDrawer: React.FC<LightingDetailDrawerProps> = ({ 
  onClose, lightingDetails, darkMode, area }) => {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>{area.name} - 照明详情</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer-content">
            <div className="area-info">
              <div className="info-row">
                <span className="info-label">当前照度：</span>
                <span className="info-value">{area.illuminance}</span>
                <Sun size={20} className="sun-icon" />
              </div>
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-color night"></div>
                <span>夜间模式</span>
              </div>
              <div className="legend-item">
                <div className="legend-color plan"></div>
                <span>计划优先</span>
              </div>
              <div className="legend-item">
                <div className="legend-color illuminance"></div>
                <span>照度优先</span>
              </div>
              <div className="legend-item">
                <div className="legend-timer"></div>
                <span>定时关屏任务</span>
              </div>
            </div>

            <div className="timeline-container">
              {lightingDetails.map((hour, index) => (
                <div key={index} className="timeline-row">
                  <div className="hour-label">{hour.hour}</div>
                  <div className={`hour-bar ${hour.period} ${hour.controlMode}`}>
                    {hour.hasTimerTask && (
                      <div className="timer-indicator"></div>
                    )}
                  </div>
                  <div className="triggers">
                    {hour.triggers?.map((trigger, tIndex) => (
                      <div key={tIndex} className={`trigger ${trigger.type}`}>
                        <span className="trigger-time">{trigger.time}</span>
                        <span className="trigger-dot"></span>
                        <span className="trigger-value">{trigger.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style jsx>{`
            .area-info {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 16px;
              background: ${darkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)'};
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .info-row {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-label {
              font-size: 14px;
              color: ${darkMode ? '#94A3B8' : '#64748B'};
            }
            .info-value {
              font-size: 18px;
              font-weight: 700;
              color: #007AFF;
            }
            .sun-icon {
              color: #F59E0B;
            }
            .legend {
              display: flex;
              gap: 16px;
              padding: 12px 16px;
              background: ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
            }
            .legend-color {
              width: 16px;
              height: 16px;
              border-radius: 4px;
            }
            .legend-color.night {
              background: #1C1C1E;
            }
            .legend-color.plan {
              background: #007AFF;
            }
            .legend-color.illuminance {
              background: #F59E0B;
            }
            .legend-timer {
              width: 6px;
              height: 16px;
              background: #FF6B6B;
              border-radius: 3px;
              border: 2px solid #FF4444;
              box-shadow: 0 0 4px rgba(255, 107, 107, 0.5);
            }
            .timeline-container {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .timeline-row {
              display: grid;
              grid-template-columns: 100px 60px 1fr;
              gap: 12px;
              align-items: flex-start;
              min-height: 60px;
              border-bottom: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
              padding: 8px 0;
            }
            .hour-label {
              font-size: 13px;
              font-weight: 500;
              color: ${darkMode ? '#94A3B8' : '#64748B'};
            }
            .hour-bar {
              height: 100%;
              min-height: 50px;
              border-radius: 8px;
              position: relative;
            }
            .hour-bar.night {
              background: #1C1C1E;
            }
            .hour-bar.day.plan {
              background: #007AFF;
            }
            .hour-bar.day.illuminance {
              background: #F59E0B;
            }
            .hour-bar.day.none {
              background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
            }
            .timer-indicator {
              position: absolute;
              left: 50%;
              top: 4px;
              bottom: 4px;
              width: 6px;
              background: #FF6B6B;
              border-radius: 3px;
              border: 2px solid #FF4444;
              box-shadow: 0 0 6px rgba(255, 107, 107, 0.6);
              transform: translateX(-50%);
            }
            .triggers {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .trigger {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 6px 10px;
              background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
              border-radius: 8px;
              font-size: 13px;
            }
            .trigger-time {
              font-weight: 600;
            }
            .trigger-dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
            }
            .trigger.train .trigger-dot {
              background: #007AFF;
            }
            .trigger.lux .trigger-dot {
              background: #1C1C1E;
            }
            .trigger-value {
              font-weight: 700;
            }
          `}</style>
        </div>
      </div>
  );
};
