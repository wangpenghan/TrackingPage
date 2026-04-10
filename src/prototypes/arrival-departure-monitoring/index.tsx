/**
 * @name 到发盯控-看板
 * 综合指挥/到发盯控页面 - 多站盯控模式
 */
import React, { useState, useMemo } from 'react';
import { FilterBar } from './FilterBar';
import { TrainTable } from './TrainTable';
import { AbnormalAlertPanel } from './AbnormalAlertPanel';
import { StationConfigModal } from './components/StationConfigModal';
import { mockTrainSchedules } from './mock-data';
import { useMultiStation, Station, DEFAULT_STATIONS } from './hooks/useMultiStation';
import './style.css';
import './grid-style.css';

import { OperationType } from './OperationDrawer';
import { PlanFilterState } from './components/PlanFilterDrawer';

const DEFAULT_PLAN_FILTERS: PlanFilterState = {
  highSpeed: true,
  normalSpeed: true,
  tracks: Array.from({ length: 20 }, (_, i) => `${i + 1}`),
  waitingRooms: ['1', '2', '3', '4', '5', '6'],
  timeConfig: 4
};

const Component: React.FC = () => {
  const [viewMode, setViewMode] = useState<'normal' | 'intervention'>('normal');
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilters, setPlanFilters] = useState<PlanFilterState>(DEFAULT_PLAN_FILTERS);
  const [darkMode, setDarkMode] = useState(false);
  const [operationDrawerVisible, setOperationDrawerVisible] = useState(false);
  const [operationTrainId, setOperationTrainId] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<OperationType>(null);
  const [stationConfigVisible, setStationConfigVisible] = useState(false);
  
  // 简洁模式状态
  const [simpleMode, setSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('arrival-departure-simple-mode') === 'true';
  });
  
  // 车站配置状态
  const [stations, setStations] = useState<Station[]>(() => {
    const saved = localStorage.getItem('arrival-departure-stations');
    return saved ? JSON.parse(saved) : DEFAULT_STATIONS;
  });
  
  // 大客流阈值配置
  const [passengerFlowThreshold, setPassengerFlowThreshold] = useState({
    boarding: 500,
    alighting: 500,
    transfer: 200
  });

  // 使用多站数据管理 Hook
  const { filteredTrains, stationStats, activeStationCount } = useMultiStation(
    mockTrainSchedules,
    stations
  );

  // 保存车站配置
  const handleStationsChange = (newStations: Station[]) => {
    setStations(newStations);
    localStorage.setItem('arrival-departure-stations', JSON.stringify(newStations));
  };

  const handleMessageClick = (trainNo: string) => {
    const train = filteredTrains.find(t => t.trainNo === trainNo);
    if (train) {
      setSelectedTrainId(train.id);
      setViewMode('intervention');
    }
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  const handleThemeToggle = () => {
    setDarkMode(prev => !prev);
  };

  const handlePlanFilterChange = (filters: PlanFilterState) => {
    setPlanFilters(filters);
  };

  const handleOpenOperationDrawer = (trainId: string, type: OperationType) => {
    setOperationTrainId(trainId);
    setOperationType(type);
    setOperationDrawerVisible(true);
  };

  const handleCloseOperationDrawer = () => {
    setOperationDrawerVisible(false);
    setOperationTrainId(null);
    setOperationType(null);
  };

  const handleSimpleModeChange = () => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    localStorage.setItem('arrival-departure-simple-mode', String(newMode));
  };

  // 处理异常项点击，跳转到对应车次
  const handleAbnormalClick = (trainId: string) => {
    setSelectedTrainId(trainId);
    // 滚动到对应元素
    const element = document.getElementById(`train-card-${trainId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`} style={{ background: darkMode ? '#0f172a' : '#f5f5f5' }}>
      
      <div className="monitoring-page flex-1 overflow-auto" style={{ background: darkMode ? '#0f172a' : '#f0f2f5' }}>
        {/* 异常提醒面板 */}
        <AbnormalAlertPanel 
          trains={filteredTrains}
          darkMode={darkMode}
          onAbnormalClick={handleAbnormalClick}
        />
        
        <FilterBar 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          hasSelection={!!selectedTrainId}
          onExecute={() => {
            console.log('Execute intervention for train:', selectedTrainId);
          }}
          onMessageClick={handleMessageClick}
          dataVersion={dataVersion}
          onSearch={setSearchTerm}
          darkMode={darkMode}
          onThemeToggle={handleThemeToggle}
          onPlanFilterChange={handlePlanFilterChange}
          planFilters={planFilters}
          simpleMode={simpleMode}
          onSimpleModeChange={handleSimpleModeChange}
          stations={stations}
          onStationConfigOpen={() => setStationConfigVisible(true)}
          activeStationCount={activeStationCount}
        />
        
        <TrainTable 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          selectedTrainId={selectedTrainId}
          onSelectTrain={setSelectedTrainId}
          onDataChange={handleDataChange}
          searchTerm={searchTerm}
          planFilters={planFilters}
          dataVersion={dataVersion}
          darkMode={darkMode}
          operationDrawerVisible={operationDrawerVisible}
          onOperationDrawerClose={handleCloseOperationDrawer}
          operationTrainId={operationTrainId}
          operationType={operationType}
          onOpenOperationDrawer={handleOpenOperationDrawer}
          simpleMode={simpleMode}
          passengerFlowThreshold={passengerFlowThreshold}
          trains={filteredTrains}
        />
      </div>

      {/* 车站配置弹窗 */}
      <StationConfigModal
        visible={stationConfigVisible}
        onClose={() => setStationConfigVisible(false)}
        stations={stations}
        onStationsChange={handleStationsChange}
        darkMode={darkMode}
      />
    </div>
  );
};

export default Component;
