/**
 * @name 照明控制
 */
import React, { useState, useEffect } from 'react';
import './style.css';
import { mockAreas, mockCircuits, Area, areaCategories } from './mock-data';
import { LightingDetailDrawer } from './components/LightingDetailDrawer';
import { SwitchCircuitControlDrawer } from './components/SwitchCircuitControlDrawer';
import { Sun } from 'lucide-react';
import { getCircuitIcon } from './components/CircuitIcons';

const Component: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showLightingDetail, setShowLightingDetail] = useState(false);
  const [showSwitchCircuit, setShowSwitchCircuit] = useState(false);
  const [selectedAreaForDetail, setSelectedAreaForDetail] = useState<Area | null>(null);
  const [currentAreaForSwitch, setCurrentAreaForSwitch] = useState<Area | null>(null);
  const [areas, setAreas] = useState<Area[]>(mockAreas);
  const [selectedAreaCategory, setSelectedAreaCategory] = useState<string>('全站');

  useEffect(() => {
    const hour = new Date().getHours();
    setDarkMode(hour >= 18 || hour < 6);
  }, []);

  const openLightingDetail = (area: Area) => {
    setSelectedAreaForDetail(area);
    setShowLightingDetail(true);
  };

  const openSwitchCircuit = (area: Area) => {
    setCurrentAreaForSwitch(area);
    setShowSwitchCircuit(true);
  };

  const handleModeConfirm = (mode: string) => {
    if (!currentAreaForSwitch) return;
    setAreas(areas.map(area => {
      if (area.id === currentAreaForSwitch.id) {
        return { 
          ...area, 
          switchMode: mode
        };
      }
      return area;
    }));
  };

  const toggleControlMode = (areaId: string) => {
    setAreas(areas.map(area => {
      if (area.id === areaId) {
        const newMode = area.controlMode === 'auto' ? 'manual' : 'auto';
        return {
          ...area,
          controlMode: newMode,
          countdown: newMode === 'manual' ? '29:58' : undefined
        };
      }
      return area;
    }));
  };

  const setAllControlMode = (mode: 'auto' | 'manual') => {
    setAreas(areas.map(area => ({
      ...area,
      controlMode: mode,
      countdown: mode === 'manual' ? '29:58' : undefined
    })));
  };

  const toggleAutoRecovery = (areaId: string) => {
    setAreas(areas.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          autoRecovery: !area.autoRecovery
        };
      }
      return area;
    }));
  };

  const getSelectedAreaForTop = () => {
    return areas.find(a => a.name.includes('1站台')) || areas[0];
  };

  const selectedAreaForTop = getSelectedAreaForTop();

  return (
    <div className={`lighting-control-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="page-header">
        <div className="area-selector">
          <span className="label">区域选择</span>
          {areaCategories.map((cat) => (
            <label key={cat} className="radio-label">
              <input
                type="radio"
                name="area-category"
                value={cat}
                checked={selectedAreaCategory === cat}
                onChange={(e) => setSelectedAreaCategory(e.target.value)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <div className="illuminance-display">
          <span className="label">当前照度</span>
          <span className="value">{selectedAreaForTop?.illuminance}</span>
          <div className="icon-wrapper">
            <Sun size={20} />
          </div>
        </div>

        <div className="toolbar">
          <button className="mode-btn" onClick={() => setAllControlMode('manual')}>一键人工</button>
          <button className="mode-btn" onClick={() => setAllControlMode('auto')}>一键自动</button>
        </div>
      </div>

      <div className="areas-grid">
        {areas.map((area) => {
          const SwitchModeIcon = getCircuitIcon(area.switchMode);
          return (
            <div 
              key={area.id} 
              className={`area-card ${darkMode ? 'dark' : 'light'} ${area.controlMode === 'manual' ? 'manual-mode' : ''}`}
            >
              <div className="card-header">
                <h3>{area.name}</h3>
              </div>

              <div className="card-content">
                <div className="control-mode">
                  <span>{area.controlMode === 'auto' ? '自动控制' : '人工控制'}</span>
                  <div 
                    className={`toggle ${area.controlMode === 'manual' ? 'on' : ''}`}
                    onClick={() => toggleControlMode(area.id)}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                </div>

                <div className="illuminance-section">
                  <button 
                    className="illuminance-btn"
                    onClick={() => openLightingDetail(area)}
                  >
                    <Sun size={20} />
                    <span className="illuminance-value">{area.illuminance}</span>
                  </button>
                  <button className="small-btn" onClick={() => openSwitchCircuit(area)}>
                    <SwitchModeIcon size={24} />
                  </button>
                </div>

                <div className="auto-recovery">
                  <span>定时恢复自动</span>
                  <button 
                    className={`recovery-btn ${area.autoRecovery ? 'on' : 'off'}`}
                    onClick={() => toggleAutoRecovery(area.id)}
                  >
                    {area.autoRecovery ? '开' : '关'}
                  </button>
                  {area.controlMode === 'manual' && area.autoRecovery && area.countdown && (
                    <div className="countdown">
                      <span>⏱️</span>
                      <span>{area.countdown}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showLightingDetail && selectedAreaForDetail && (
        <LightingDetailDrawer 
          onClose={() => setShowLightingDetail(false)}
          lightingDetails={selectedAreaForDetail.lightingDetails}
          darkMode={darkMode}
          area={selectedAreaForDetail}
        />
      )}

      {showSwitchCircuit && currentAreaForSwitch && (
        <SwitchCircuitControlDrawer
          onClose={() => setShowSwitchCircuit(false)}
          onConfirm={handleModeConfirm}
          initialMode={currentAreaForSwitch.switchMode}
          circuits={mockCircuits}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default Component;
