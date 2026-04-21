/**
 * @name 到发盯控
 * @mode axure
 * 综合指挥/到发盯控页面
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 * - /rules/axure-api-guide.md
 */
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { HeaderStats } from './HeaderStats';
import { FilterBar } from './FilterBar';
import { TrainTable } from './TrainTable';
import { mockTrainSchedules } from './mock-data';
import { PlanChangeOverview } from './components/PlanChangeOverview';
import { PlanMonitoring } from './PlanMonitoring';
import './style.css';
import './grid-style.css';

import { OperationType } from './OperationDrawer';
import { PlanFilterState } from './components/PlanFilterDrawer';
import { StationControlPanel } from './components/StationControlPanel';
import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

const DEFAULT_PLAN_FILTERS: PlanFilterState = {
  // 列车类型默认全部选中（高铁+普速）
  highSpeed: true,
  normalSpeed: true,
  // 其他筛选条件默认不选
  tracks: [],
  waitingRooms: [],
  timeConfig: 4,
  origin: false,
  pass: false,
  end: false,
  through: false,
  passengerTrain: false,
  nonPassengerTrain: false,
  yuxiaHighSpeedField: false,
  donghuanIntercityField: false,
  // 计划变更筛选默认关闭
  planChange: false,
  yesterdayChange: false,
  kemoChange: false,
  bothChange: false
};

interface Station {
  id: string;
  name: string;
  trainCount: number;
  abnormalCount: number;
  alarmCount: number;
  delayCount: number;
}

// ============ Axure API 常量定义 ============

/**
 * 事件列表 - 定义组件可以触发的事件
 */
const EVENT_LIST: EventItem[] = [
  { name: 'on_train_select', desc: '选中列车时触发，传递列车ID', payload: 'string' },
  { name: 'on_station_change', desc: '切换车站时触发，传递车站名称', payload: 'string' },
  { name: 'on_view_mode_change', desc: '视图模式切换时触发，传递模式名称', payload: 'string' },
  { name: 'on_data_change', desc: '数据发生变化时触发', payload: 'JSON string' },
  { name: 'on_filter_change', desc: '筛选条件变化时触发，传递筛选配置', payload: 'JSON string' }
];

/**
 * 动作列表 - 定义组件可以响应的动作
 */
const ACTION_LIST: Action[] = [
  { name: 'select_train', desc: '选中指定列车，参数：列车ID', params: 'string' },
  { name: 'switch_station', desc: '切换到指定车站，参数：车站名称', params: 'string' },
  { name: 'set_view_mode', desc: '设置视图模式，参数：normal 或 intervention', params: 'string' },
  { name: 'refresh_data', desc: '刷新数据', params: '' },
  { name: 'set_search_term', desc: '设置搜索关键词，参数：搜索字符串', params: 'string' },
  { name: 'toggle_dark_mode', desc: '切换深色模式', params: '' },
  { name: 'set_filters', desc: '设置筛选条件，参数：JSON字符串格式的筛选配置', params: 'JSON string' }
];

/**
 * 变量列表 - 定义组件暴露的内部状态
 */
const VAR_LIST: KeyDesc[] = [
  { name: 'selected_train_id', desc: '当前选中的列车ID' },
  { name: 'current_station', desc: '当前显示的车站名称' },
  { name: 'view_mode', desc: '当前视图模式（normal/intervention）' },
  { name: 'data_version', desc: '数据版本号，用于追踪数据变化' },
  { name: 'search_term', desc: '当前搜索关键词' },
  { name: 'dark_mode', desc: '是否启用深色模式' },
  { name: 'control_mode', desc: '控制模式（single/代管）' },
  { name: 'simple_mode', desc: '是否启用简洁模式' },
  { name: 'train_count', desc: '当前显示列车数量' }
];

/**
 * 配置项列表 - 定义配置面板中的可配置项
 */
const CONFIG_LIST: ConfigItem[] = [
  {
    type: 'select',
    attributeId: 'currentStation',
    displayName: '默认车站',
    info: '页面加载时默认显示的车站',
    initialValue: '重庆东'
  },
  {
    type: 'checkbox',
    attributeId: 'darkMode',
    displayName: '深色模式',
    info: '是否默认启用深色模式',
    initialValue: false
  },
  {
    type: 'checkbox',
    attributeId: 'simpleMode',
    displayName: '简洁模式',
    info: '是否默认启用简洁模式',
    initialValue: false
  },
  {
    type: 'select',
    attributeId: 'controlMode',
    displayName: '控制模式',
    info: '车站控制模式',
    initialValue: '代管'
  },
  {
    type: 'inputNumber',
    attributeId: 'passengerFlowThreshold.boarding',
    displayName: '大客流阈值-上车',
    info: '上车人数超过此值标记为大客流',
    initialValue: 500,
    min: 100,
    max: 5000
  },
  {
    type: 'inputNumber',
    attributeId: 'passengerFlowThreshold.alighting',
    displayName: '大客流阈值-下车',
    info: '下车人数超过此值标记为大客流',
    initialValue: 500,
    min: 100,
    max: 5000
  },
  {
    type: 'inputNumber',
    attributeId: 'passengerFlowThreshold.transfer',
    displayName: '大客流阈值-换乘',
    info: '换乘人数超过此值标记为大客流',
    initialValue: 200,
    min: 50,
    max: 2000
  }
];

/**
 * 数据项列表 - 定义组件接收的数据结构
 */
const DATA_LIST: DataDesc[] = [
  {
    name: 'train_schedules',
    desc: '列车时刻表数据',
    keys: [
      { name: 'id', desc: '列车唯一标识' },
      { name: 'train_no', desc: '列车车次号' },
      { name: 'train_type', desc: '列车类型' },
      { name: 'status', desc: '列车状态' },
      { name: 'station', desc: '所属车站' },
      { name: 'arrival', desc: '到达信息' },
      { name: 'departure', desc: '发车信息' }
    ]
  },
  {
    name: 'stations',
    desc: '车站列表数据',
    keys: [
      { name: 'id', desc: '车站ID' },
      { name: 'name', desc: '车站名称' },
      { name: 'train_count', desc: '列车数量' },
      { name: 'abnormal_count', desc: '异常数量' }
    ]
  }
];

const Component = forwardRef<AxureHandle, AxureProps>(function ArrivalDepartureMonitoring(innerProps, ref) {
  // ============ Props 处理 ============
  const configSource = innerProps && innerProps.config ? innerProps.config : {};
  const dataSource = innerProps && innerProps.data ? innerProps.data : {};
  const onEventHandler = typeof innerProps.onEvent === 'function'
    ? innerProps.onEvent
    : function () { return undefined; };

  // 从 config 获取配置值
  const initialStation = typeof configSource.currentStation === 'string' && configSource.currentStation
    ? configSource.currentStation
    : '重庆东';
  const initialDarkMode = configSource.darkMode === true;
  const initialSimpleMode = configSource.simpleMode === true;
  const initialControlMode = configSource.controlMode === 'single' ? 'single' : '代管';
  const initialPassengerFlowThreshold = {
    highSpeed8: {
      boarding: typeof configSource.passengerFlowThreshold?.highSpeed8?.boarding === 'number'
        ? configSource.passengerFlowThreshold.highSpeed8.boarding
        : 500,
      alighting: typeof configSource.passengerFlowThreshold?.highSpeed8?.alighting === 'number'
        ? configSource.passengerFlowThreshold.highSpeed8.alighting
        : 500,
      transfer: typeof configSource.passengerFlowThreshold?.highSpeed8?.transfer === 'number'
        ? configSource.passengerFlowThreshold.highSpeed8.transfer
        : 200,
      total: typeof configSource.passengerFlowThreshold?.highSpeed8?.total === 'number'
        ? configSource.passengerFlowThreshold.highSpeed8.total
        : 1200
    },
    highSpeed16: {
      boarding: typeof configSource.passengerFlowThreshold?.highSpeed16?.boarding === 'number'
        ? configSource.passengerFlowThreshold.highSpeed16.boarding
        : 800,
      alighting: typeof configSource.passengerFlowThreshold?.highSpeed16?.alighting === 'number'
        ? configSource.passengerFlowThreshold.highSpeed16.alighting
        : 800,
      transfer: typeof configSource.passengerFlowThreshold?.highSpeed16?.transfer === 'number'
        ? configSource.passengerFlowThreshold.highSpeed16.transfer
        : 400,
      total: typeof configSource.passengerFlowThreshold?.highSpeed16?.total === 'number'
        ? configSource.passengerFlowThreshold.highSpeed16.total
        : 2000
    },
    normalSpeed: {
      boarding: typeof configSource.passengerFlowThreshold?.normalSpeed?.boarding === 'number'
        ? configSource.passengerFlowThreshold.normalSpeed.boarding
        : 300,
      alighting: typeof configSource.passengerFlowThreshold?.normalSpeed?.alighting === 'number'
        ? configSource.passengerFlowThreshold.normalSpeed.alighting
        : 300,
      transfer: typeof configSource.passengerFlowThreshold?.normalSpeed?.transfer === 'number'
        ? configSource.passengerFlowThreshold.normalSpeed.transfer
        : 100,
      total: typeof configSource.passengerFlowThreshold?.normalSpeed?.total === 'number'
        ? configSource.passengerFlowThreshold.normalSpeed.total
        : 700
    }
  };

  // ============ 状态定义 ============
  const [viewMode, setViewMode] = useState<'normal' | 'intervention'>('normal');
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilters, setPlanFilters] = useState<PlanFilterState>(DEFAULT_PLAN_FILTERS);
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [operationDrawerVisible, setOperationDrawerVisible] = useState(false);
  const [operationTrainId, setOperationTrainId] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<OperationType>(null);
  const [controlMode, setControlMode] = useState<'single' | '代管'>(initialControlMode);

  // 简洁模式状态
  const [simpleMode, setSimpleMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('arrival-departure-simple-mode');
    return saved !== null ? saved === 'true' : initialSimpleMode;
  });

  // 大客流阈值配置
  const [passengerFlowThreshold, setPassengerFlowThreshold] = useState(initialPassengerFlowThreshold);

  // 当前选中的车站
  const [currentStation, setCurrentStation] = useState<string>(initialStation);
  const [selectedStationId, setSelectedStationId] = useState<string>('1');

  // 列配置顺序
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'trainNo', 'arrival', 'departure', 'checkTime', 'trackPlatform', 
    'gates', 'passengerFlow', 'service', 'checkIn', 'platform', 
    'exit', 'joint', 'planStatus', 'details'
  ]);

  // 各车站的选中行记录 Map<stationName, trainId>
  const [stationSelectionMap, setStationSelectionMap] = useState<Map<string, string | null>>(new Map());

  // 快速定位类型
  const [quickFilterType, setQuickFilterType] = useState<'none' | 'abnormal' | 'operating'>('none');

  // 计划变更总览状态
  const [planChangeOverviewVisible, setPlanChangeOverviewVisible] = useState(false);

  const [managedStations, setManagedStations] = useState<Station[]>([
    { id: '1', name: '重庆东', trainCount: 45, abnormalCount: 2, alarmCount: 8, delayCount: 1 },
    { id: '2', name: '巴南', trainCount: 28, abnormalCount: 1, alarmCount: 5, delayCount: 0 },
    { id: '3', name: '南川北', trainCount: 15, abnormalCount: 0, alarmCount: 3, delayCount: 0 },
    { id: '4', name: '水江西', trainCount: 10, abnormalCount: 0, alarmCount: 1, delayCount: 0 }
  ]);

  // ============ 事件发射器 ============
  const emitEvent = useCallback(function (eventName: string, payload?: string) {
    try {
      onEventHandler(eventName, payload);
    } catch (error) {
      console.warn('事件触发失败:', eventName, error);
    }
  }, [onEventHandler]);

  // ============ 业务逻辑处理 ============
  const handleMessageClick = useCallback((trainNo: string) => {
    const train = mockTrainSchedules.find(t => t.trainNo === trainNo);
    if (train) {
      setSelectedTrainId(train.id);
      setViewMode('intervention');
      emitEvent('on_train_select', train.id);
      emitEvent('on_view_mode_change', 'intervention');
    }
  }, [emitEvent]);

  const handleDataChange = useCallback(() => {
    setDataVersion(prev => {
      const newVersion = prev + 1;
      emitEvent('on_data_change', JSON.stringify({ version: newVersion }));
      return newVersion;
    });
  }, [emitEvent]);

  const handleThemeToggle = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const handlePlanFilterChange = useCallback((filters: PlanFilterState) => {
    setPlanFilters(filters);
    emitEvent('on_filter_change', JSON.stringify(filters));
  }, [emitEvent]);

  const handleOpenOperationDrawer = useCallback((trainId: string, type: OperationType) => {
    setOperationTrainId(trainId);
    setOperationType(type);
    setOperationDrawerVisible(true);
  }, []);

  const handleCloseOperationDrawer = useCallback(() => {
    setOperationDrawerVisible(false);
    setOperationTrainId(null);
    setOperationType(null);
  }, []);

  const handleControlModeChange = useCallback((config: {
    controlMode: 'single' | '代管';
    stations: Station[];
    timeConfig: number;
    passengerFlowThreshold: {
      highSpeed8: { boarding: number; alighting: number; transfer: number; total: number };
      highSpeed16: { boarding: number; alighting: number; transfer: number; total: number };
      normalSpeed: { boarding: number; alighting: number; transfer: number; total: number };
    };
    columnOrder: string[];
  }) => {
    setControlMode(config.controlMode);
    setManagedStations(config.stations);
    setPassengerFlowThreshold(config.passengerFlowThreshold);
    setColumnOrder(config.columnOrder);
  }, []);

  const handleSimpleModeChange = useCallback(() => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    localStorage.setItem('arrival-departure-simple-mode', String(newMode));
  }, [simpleMode]);

  // 处理车站切换
  const handleStationSelect = useCallback((stationId: string, stationName: string, clickType: 'normal' | 'abnormal' | 'operating') => {
    // 1. 保存当前车站的选中状态
    setStationSelectionMap(prev => new Map(prev).set(currentStation, selectedTrainId));

    // 2. 切换到新车站
    setSelectedStationId(stationId);
    setCurrentStation(stationName);
    emitEvent('on_station_change', stationName);

    // 3. 设置快速筛选类型
    if (clickType !== 'normal') {
      setQuickFilterType(clickType);
    } else {
      setQuickFilterType('none');
    }

    // 4. 恢复新车站的选中状态（如果有）
    const savedSelection = stationSelectionMap.get(stationName);
    if (savedSelection) {
      setTimeout(() => {
        setSelectedTrainId(savedSelection);
        emitEvent('on_train_select', savedSelection);
      }, 100);
    } else {
      setSelectedTrainId(null);
    }
  }, [currentStation, selectedTrainId, stationSelectionMap, emitEvent]);

  // 处理视图模式切换
  const handleViewModeChange = useCallback((mode: 'normal' | 'intervention') => {
    setViewMode(mode);
    emitEvent('on_view_mode_change', mode);
  }, [emitEvent]);

  // 处理列车选择
  const handleSelectTrain = useCallback((id: string | null) => {
    setSelectedTrainId(id);
    if (id) {
      emitEvent('on_train_select', id);
    }
  }, [emitEvent]);

  // 处理搜索
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // ============ Axure API 暴露 ============
  useImperativeHandle(ref, function () {
    return {
      // 获取变量
      getVar: function (name: string) {
        const vars: Record<string, any> = {
          selected_train_id: selectedTrainId,
          current_station: currentStation,
          view_mode: viewMode,
          data_version: dataVersion,
          search_term: searchTerm,
          dark_mode: darkMode,
          control_mode: controlMode,
          simple_mode: simpleMode,
          train_count: mockTrainSchedules.filter(t => t.station === currentStation).length
        };
        return vars[name];
      },

      // 触发动作
      fireAction: function (name: string, params?: string) {
        switch (name) {
          case 'select_train':
            if (params) {
              handleSelectTrain(params);
            }
            break;
          case 'switch_station':
            if (params) {
              const station = managedStations.find(s => s.name === params);
              if (station) {
                handleStationSelect(station.id, station.name, 'normal');
              }
            }
            break;
          case 'set_view_mode':
            if (params === 'normal' || params === 'intervention') {
              handleViewModeChange(params);
            }
            break;
          case 'refresh_data':
            handleDataChange();
            break;
          case 'set_search_term':
            if (params !== undefined) {
              handleSearch(params);
            }
            break;
          case 'toggle_dark_mode':
            handleThemeToggle();
            break;
          case 'set_filters':
            if (params) {
              try {
                const filters = JSON.parse(params);
                handlePlanFilterChange({ ...DEFAULT_PLAN_FILTERS, ...filters });
              } catch (error) {
                console.warn('筛选参数解析失败:', error);
              }
            }
            break;
          default:
            console.warn('未知的动作:', name);
        }
      },

      // 暴露列表
      eventList: EVENT_LIST,
      actionList: ACTION_LIST,
      varList: VAR_LIST,
      configList: CONFIG_LIST,
      dataList: DATA_LIST
    };
  }, [
    selectedTrainId,
    currentStation,
    viewMode,
    dataVersion,
    searchTerm,
    darkMode,
    controlMode,
    simpleMode,
    managedStations,
    handleSelectTrain,
    handleStationSelect,
    handleViewModeChange,
    handleDataChange,
    handleSearch,
    handleThemeToggle,
    handlePlanFilterChange
  ]);

  // ============ 渲染 ============
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`} style={{ background: darkMode ? '#1E293B' : '#F8FAFC' }}>

      <div className="monitoring-page flex-1 flex flex-col overflow-hidden" style={{ background: darkMode ? '#0F172A' : '#E2E8F0' }}>
        {/* 计划监测 */}
        <PlanMonitoring darkMode={darkMode} />

        {/* 顶部面包屑 */}
        <div style={{
          padding: '8px 20px',
          background: darkMode ? '#1E293B' : '#FFFFFF',
          fontSize: '14px',
          color: darkMode ? '#94A3B8' : '#64748B',
          borderBottom: darkMode ? '1px solid #334155' : '1px solid #E2E8F0',
          position: 'relative',
          zIndex: 110,
          boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>首页 / 综合指挥 / 到发盯控</div>
            <div style={{ fontSize: '12px', color: darkMode ? '#64748B' : '#94A3B8' }}>
              {new Date().toLocaleString('zh-CN', { hour12: false })}
            </div>
          </div>
        </div>

        {/* 代管站盯控全局面板 */}
        {controlMode === '代管' && managedStations.length > 0 && (
          <StationControlPanel
            stations={managedStations}
            darkMode={darkMode}
            selectedStationId={selectedStationId}
            onStationSelect={handleStationSelect}
          />
        )}

        <FilterBar
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          hasSelection={!!selectedTrainId}
          onExecute={() => {
            console.log('Execute intervention for train:', selectedTrainId);
          }}
          onMessageClick={handleMessageClick}
          dataVersion={dataVersion}
          onSearch={handleSearch}
          darkMode={darkMode}
          onThemeToggle={handleThemeToggle}
          onPlanFilterChange={handlePlanFilterChange}
          planFilters={planFilters}
          onControlModeChange={handleControlModeChange}
          simpleMode={simpleMode}
          onSimpleModeChange={handleSimpleModeChange}
          initialColumnOrder={columnOrder}
          initialPassengerFlowThreshold={passengerFlowThreshold}
          onPlanChangeOverviewClick={() => setPlanChangeOverviewVisible(true)}
        />

        {/* 计划变更总览 */}
        <PlanChangeOverview
          visible={planChangeOverviewVisible}
          onClose={() => setPlanChangeOverviewVisible(false)}
          darkMode={darkMode}
          onViewTrain={(trainId) => {
            setPlanChangeOverviewVisible(false);
            // 找到对应的车次并选中
            const train = mockTrainSchedules.find(t => t.id === trainId);
            if (train) {
              setSelectedTrainId(trainId);
              emitEvent('on_train_select', trainId);
            }
          }}
          onBatchConfirm={(trainIds) => {
            // 批量确认选中的车次
            trainIds.forEach(trainId => {
              const train = mockTrainSchedules.find(t => t.id === trainId);
              if (train?.planChangeInfo) {
                train.planChangeInfo.planStatus = 'synced';
              }
            });
            handleDataChange();
          }}
          onBatchLock={(trainIds) => {
            // 批量锁定选中的车次
            trainIds.forEach(trainId => {
              const train = mockTrainSchedules.find(t => t.id === trainId);
              if (train?.planChangeInfo) {
                train.planChangeInfo.planStatus = 'locked';
              }
            });
            handleDataChange();
          }}
        />

        <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
          <TrainTable
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            selectedTrainId={selectedTrainId}
            onSelectTrain={handleSelectTrain}
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
            currentStation={currentStation}
            controlMode={controlMode}
            quickFilterType={quickFilterType}
            columnOrder={columnOrder}
          />
        </div>
      </div>
    </div>
  );
});

export default Component;
