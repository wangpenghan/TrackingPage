
import React, { useState, useMemo } from 'react';
import { Input, Badge } from 'antd';
import { Search, RefreshCw, Play, Bell, Sun, Moon, Layers, Zap, Filter, Settings, LayoutTemplate, GitCompare } from 'lucide-react';
import dayjs from 'dayjs';
import { mockTrainSchedules, getOperationDetails, summarizeOperations } from './mock-data';
import { PlanFilterDrawer, PlanFilterState } from './components/PlanFilterDrawer';
import { ControlModeDrawer } from './components/ControlModeDrawer';
import { SoundConfigDrawer } from './components/SoundConfigDrawer';
import { CTCConfigDrawer } from './components/CTCConfigDrawer';
import { SceneModeDrawer } from './components/SceneModeDrawer';

interface Station {
  id: string;
  name: string;
  trainCount: number;
  abnormalCount: number;
  alarmCount: number;
  delayCount: number;
}

interface FilterBarProps {
  viewMode?: 'normal' | 'intervention';
  onViewModeChange?: (mode: 'normal' | 'intervention') => void;
  hasSelection?: boolean;
  onExecute?: () => void;
  onMessageClick?: (trainNo: string) => void;
  dataVersion?: number;
  onSearch?: (value: string) => void;
  darkMode?: boolean;
  onThemeToggle?: () => void;
  onPlanFilterChange?: (filters: PlanFilterState) => void;
  planFilters?: PlanFilterState;
  onControlModeChange?: (config: {
    controlMode: 'single' | '代管';
    stations: Station[];
    timeConfig: number;
    passengerFlowThreshold: {
      highSpeed8: { boarding: number; alighting: number; transfer: number; total: number };
      highSpeed16: { boarding: number; alighting: number; transfer: number; total: number };
      normalSpeed: { boarding: number; alighting: number; transfer: number; total: number };
    };
    columnOrder?: string[];
  }) => void;
  simpleMode?: boolean;
  onSimpleModeChange?: () => void;
  initialColumnOrder?: string[];
  initialPassengerFlowThreshold?: {
    highSpeed8: { boarding: number; alighting: number; transfer: number; total: number };
    highSpeed16: { boarding: number; alighting: number; transfer: number; total: number };
    normalSpeed: { boarding: number; alighting: number; transfer: number; total: number };
  };
  onPlanChangeOverviewClick?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  viewMode, 
  onViewModeChange, 
  hasSelection, 
  onExecute, 
  onMessageClick, 
  dataVersion, 
  onSearch, 
  darkMode,
  onThemeToggle,
  onPlanFilterChange,
  planFilters,
  onControlModeChange,
  simpleMode = false,
  onSimpleModeChange,
  initialColumnOrder,
  initialPassengerFlowThreshold,
  onPlanChangeOverviewClick
}) => {
  const [activeTime, setActiveTime] = useState('4小时');
  const [timeConfig, setTimeConfig] = useState(4);
  const [soundConfigOpen, setSoundConfigOpen] = useState(false);
  const [planFilterDrawerOpen, setPlanFilterDrawerOpen] = useState(false);
  const [controlModeDrawerOpen, setControlModeDrawerOpen] = useState(false);
  const [ctcConfigDrawerOpen, setCtcConfigDrawerOpen] = useState(false);
  const [sceneModeDrawerOpen, setSceneModeDrawerOpen] = useState(false);
  
  const abnormalMessages = useMemo(() => {
    const messages: { id: string; trainNo: string; time: string; fullTime: dayjs.Dayjs; content: string }[] = [];
    
    mockTrainSchedules.forEach((train) => {
      const details = getOperationDetails(train);
      const summary = summarizeOperations(details);
      const abnormalParts: string[] = [];

      if (summary.checkIn.status === 'alarm') abnormalParts.push('检票口');
      if (summary.platform.status === 'alarm') abnormalParts.push('站台');
      if (summary.exit.status === 'alarm') abnormalParts.push('出站口');
      if (summary.water.status === 'alarm') abnormalParts.push('上水');

      if (abnormalParts.length > 0) {
        let timeObj = dayjs(train.arrival.time, 'HH:mm');
        const now = dayjs();
        if (timeObj.hour() < 4 && now.hour() > 20) {
          timeObj = timeObj.add(1, 'day');
        }
        
        const stationName = train.runningSection?.to || '成都东';
        
        abnormalParts.forEach((position) => {
          messages.push({
            id: `${train.id}_${position}`,
            trainNo: train.trainNo,
            time: train.arrival.time,
            fullTime: timeObj,
            content: `${stationName}站${train.trainNo}${position}：未到岗`
          });
        });
      }
    });
    
    return messages.sort((a, b) => a.fullTime.valueOf() - b.fullTime.valueOf());
  }, [dataVersion]);
  
  // 计算有变更的车次数量
  const planChangeCount = useMemo(() => {
    return mockTrainSchedules.filter(train => 
      train.planChangeInfo?.hasAnyChange
    ).length;
  }, [dataVersion]);



  return (
    <div className="filter-bar" style={{ 
      background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FAF8F5 0%, #F5F3EF 100%)', 
      borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.15)' : '1px solid rgba(29, 78, 95, 0.08)',
      marginTop: '0px'
    }}>
      {/* Time Filters */}
      <div className="time-filters" style={{
        background: darkMode ? '#0D1B2A' : '#FFFFFF',
        border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.12)'
      }}>
        {['昨日', '今日', '明日', `${timeConfig}小时`].map((time) => (
          <button
            key={time}
            className={`time-filter-btn ${activeTime === time ? 'active' : ''}`}
            style={{ 
              background: activeTime === time 
                ? 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)' 
                : darkMode ? '#0D1B2A' : '#FFFFFF',
              color: activeTime === time ? '#FFFFFF' : darkMode ? '#94A3B8' : '#6B7280',
              borderRight: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
            }}
            onClick={() => setActiveTime(time)}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Plan Filter Button */}
      <div 
        style={{
          cursor: 'pointer',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: darkMode ? '#0D1B2A' : '#FFFFFF',
          color: darkMode ? '#5DA3B3' : '#1D4E5F',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.12)',
          transition: 'all 0.2s ease'
        }}
        onClick={() => setPlanFilterDrawerOpen(true)}
        title="计划筛选"
      >
        <Filter size={16} />
      </div>

      {/* Search Input */}
      <div style={{ width: '300px' }}>
        <Input 
          prefix={<Search size={16} color={darkMode ? '#94A3B8' : '#64748B'} />} 
          placeholder="请输入查询内容" 
          allowClear
          onChange={(e) => onSearch?.(e.target.value)}
          style={{
            background: darkMode ? '#1E293B' : '#FFFFFF',
            border: darkMode ? '1px solid #334155' : '1px solid rgba(29, 78, 95, 0.12)',
            color: darkMode ? '#F8FAFC' : '#0F172A'
          }}
        />
      </div>

      {/* Refresh Button */}
      <div 
        className="refresh-btn"
        style={{ 
          background: darkMode ? '#0D1B2A' : '#FFFFFF',
          color: darkMode ? '#5DA3B3' : '#1D4E5F',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.12)'
        }}
        title="刷新"
      >
        <RefreshCw size={16} />
      </div>

      {/* Execute Immediately Button */}
      {hasSelection && (
        <div 
          className="time-filter-btn active"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer',
            padding: '0 14px',
            height: '32px',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            background: darkMode ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
            color: darkMode ? '#6EE7B7' : '#047857',
            borderRadius: '8px',
            marginLeft: '8px',
            fontWeight: 500,
            boxShadow: darkMode ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(29, 78, 95, 0.06)'
          }}
          onClick={onExecute}
          title="立即执行"
        >
          <Play size={16} fill={darkMode ? '#6EE7B7' : '#047857'} />
          <span>立即执行</span>
        </div>
      )}

      {/* Operation Message Icon */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Simple Mode Toggle Button */}
        <div 
          onClick={onSimpleModeChange}
          style={{
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: simpleMode 
              ? (darkMode ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)')
              : (darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)'),
            transition: 'all 0.2s ease',
            border: simpleMode
              ? (darkMode ? '1px solid rgba(110, 231, 183, 0.5)' : '1px solid rgba(5, 150, 105, 0.3)')
              : (darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)')
          }}
          title={simpleMode ? "切换到标准模式" : "切换到简洁模式"}
        >
          <LayoutTemplate 
            size={20} 
            color={simpleMode 
              ? (darkMode ? '#6EE7B7' : '#047857')
              : (darkMode ? '#5DA3B3' : '#1D4E5F')
            } 
          />
        </div>

        {/* Theme Toggle Button */}
        <div 
          onClick={onThemeToggle}
          style={{
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            transition: 'all 0.2s ease',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
          }}
          title={darkMode ? "切换到浅色模式" : "切换到深色模式"}
        >
          {darkMode ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6B7280" />}
        </div>

        {/* Config Buttons */}
        {/* Plan Change Overview Button */}
        <div 
          style={{
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: planChangeCount > 0
              ? (darkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 149, 0, 0.1)')
              : (darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)'),
            transition: 'all 0.2s ease',
            border: planChangeCount > 0
              ? (darkMode ? '1px solid rgba(255, 149, 0, 0.5)' : '1px solid rgba(255, 149, 0, 0.3)')
              : (darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)')
          }}
          onClick={onPlanChangeOverviewClick}
          title="计划变更总览"
        >
          <Badge count={planChangeCount} offset={[0, 0]} size="small" style={{ backgroundColor: '#FF9500' }}>
            <GitCompare 
              size={20} 
              color={planChangeCount > 0 ? '#FF9500' : (darkMode ? '#5DA3B3' : '#1D4E5F')} 
            />
          </Badge>
        </div>

        <div 
          style={{
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            transition: 'all 0.2s ease',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
          }}
          onClick={() => setControlModeDrawerOpen(true)}
          title="界面配置"
        >
          <Settings size={20} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
        </div>

        <div 
          style={{
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            transition: 'all 0.2s ease',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
          }}
          onClick={() => setSceneModeDrawerOpen(true)}
          title="情景模式"
        >
          <Layers size={20} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
        </div>

        <div 
          style={{
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            transition: 'all 0.2s ease',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
          }}
          onClick={() => setCtcConfigDrawerOpen(true)}
          title="CTC配置"
        >
          <Zap size={20} color={darkMode ? '#34D399' : '#15803D'} />
        </div>

        <div 
          style={{ 
            cursor: 'pointer', 
            padding: '6px', 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: '8px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            transition: 'all 0.2s ease',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
          }}
          onClick={() => setSoundConfigOpen(true)}
          title="打开声音与消息设置"
        >
          <Badge count={abnormalMessages.length} offset={[0, 0]} size="small">
            <Bell 
              size={20} 
              color={abnormalMessages.length > 0 ? '#B91C1C' : darkMode ? '#64748B' : '#9CA3AF'} 
              className={abnormalMessages.length > 0 ? 'icon-blink' : ''} 
            />
          </Badge>
        </div>
      </div>

      {/* Sound Config Drawer */}
      <SoundConfigDrawer
        visible={soundConfigOpen}
        onClose={() => setSoundConfigOpen(false)}
        darkMode={darkMode}
        dataVersion={dataVersion}
        onMessageClick={onMessageClick}
      />

      {/* Plan Filter Drawer */}
      <PlanFilterDrawer
        visible={planFilterDrawerOpen}
        onClose={() => setPlanFilterDrawerOpen(false)}
        onApply={(filters) => {
          onPlanFilterChange?.(filters);
          setTimeConfig(filters.timeConfig);
          setActiveTime(`${filters.timeConfig}小时`);
        }}
        darkMode={darkMode}
        initialFilters={{
          ...planFilters,
          timeConfig: timeConfig
        }}
      />

      {/* Control Mode Drawer */}
      <ControlModeDrawer
        visible={controlModeDrawerOpen}
        onClose={() => setControlModeDrawerOpen(false)}
        darkMode={darkMode}
        onSave={(config) => {
          onControlModeChange?.(config);
        }}
        initialColumnOrder={initialColumnOrder}
        initialPassengerFlowThreshold={initialPassengerFlowThreshold}
      />

      {/* CTC Config Drawer */}
      <CTCConfigDrawer
        visible={ctcConfigDrawerOpen}
        onClose={() => setCtcConfigDrawerOpen(false)}
        darkMode={darkMode}
        onSave={(config) => {
          console.log('CTC配置已保存:', config);
        }}
      />

      {/* Scene Mode Drawer */}
      <SceneModeDrawer
        visible={sceneModeDrawerOpen}
        onClose={() => setSceneModeDrawerOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
};
