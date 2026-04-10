import React, { useState } from 'react';
import { Button, Tag, Tooltip, Popover, Checkbox, Input } from 'antd';
import { mockTrainSchedules, getOperationDetails, OperationTaskGroup, summarizeOperations, TrainSchedule } from './mock-data';
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Droplets, Package, Users, Zap, AlertTriangle, 
  Utensils, BedDouble, RotateCcw, Crown, ArrowRight, LogOut,
  Calendar, Clock, ArrowUp, ArrowDown, Radio, Settings, Link,
  ClipboardList, TrainFront, HardHat, FileText, Ticket,
  Mic, List, CheckSquare, CheckCircle
} from 'lucide-react';
import { SewageIcon } from './components/icons/SewageIcon';
import { WaterIcon } from './components/icons/WaterIcon';
import { TrainDetailDrawer } from './TrainDetailDrawer';
import { OperationDrawer, OperationType } from './OperationDrawer';
import { PlanInterventionDrawer } from './components/PlanInterventionDrawer';
import { TrainFormationDrawer } from './components/TrainFormationDrawer';
import { PassengerRecordDrawer } from './components/PassengerRecordDrawer';
import { OperationDetailDrawer } from './components/OperationDetailDrawer';
import { PlanDetailDrawer } from './components/PlanDetailDrawer';
import { RouteStationsDrawer } from './RouteStationsDrawer';
import { OperationLogDrawer } from './components/OperationLogDrawer';
import { PassengerFlowDrawer } from './components/PassengerFlowDrawer';
import { WaterSewageConfigDrawer } from './components/WaterSewageConfigDrawer';
import { PlanChangeBadge } from './components/PlanChangeBadge';
import { PlanChangeDrawer } from './components/PlanChangeDrawer';
import { PlanChangeOverview } from './components/PlanChangeOverview';
import { mockPassengerRecords } from './mock-data';
import dayjs from 'dayjs';
import { PlanFilterState } from './components/PlanFilterDrawer';

export interface TrainTableProps {
  viewMode: 'normal' | 'intervention';
  onViewModeChange: (mode: 'normal' | 'intervention') => void;
  selectedTrainId?: string | null;
  onSelectTrain?: (id: string | null) => void;
  onDataChange?: () => void;
  searchTerm?: string;
  planFilters?: PlanFilterState;
  dataVersion?: number;
  darkMode?: boolean;
  operationDrawerVisible?: boolean;
  onOperationDrawerClose?: () => void;
  operationTrainId?: string | null;
  operationType?: OperationType;
  onOpenOperationDrawer?: (trainId: string, type: OperationType) => void;
  simpleMode?: boolean;
  passengerFlowThreshold?: { boarding: number; alighting: number; transfer: number };
  currentStation?: string; // 当前车站
  controlMode?: 'single' | '代管'; // 控制模式
  quickFilterType?: 'none' | 'abnormal' | 'operating'; // 快速筛选类型
  columnOrder?: string[];
}

export const TrainTable: React.FC<TrainTableProps> = ({
  viewMode,
  onViewModeChange,
  selectedTrainId,
  onSelectTrain,
  onDataChange,
  searchTerm = '',
  planFilters,
  dataVersion,
  darkMode = false,
  operationDrawerVisible = false,
  onOperationDrawerClose,
  operationTrainId,
  operationType,
  onOpenOperationDrawer,
  simpleMode = false,
  passengerFlowThreshold = { boarding: 500, alighting: 500, transfer: 200 },
  currentStation = '重庆东',
  controlMode = '代管',
  quickFilterType = 'none'
}) => {
  const [visibleLocations, setVisibleLocations] = useState({
    platform: false,
    checkInGate: true,
    exitGate: false
  });

  const [visibleTags, setVisibleTags] = useState({
    checkInReady: true,
    water: true,
    sewage: true,
    parcel: true,
    meal: true,
    overnight: true,
    turnaround: true,
    overcrowd: true,
    special: true
  });

  const [visibleDevices, setVisibleDevices] = useState({
    broadcast: true,
    guide: true,
    gate: true
  });

  const [visiblePassengerFlow, setVisiblePassengerFlow] = useState({
    boarding: true,
    alighting: true,
    transfer: true
  });

  const [highlightedTrains, setHighlightedTrains] = useState<string[]>([]);
  // selectedTrainId is now a prop
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTrainId, setDrawerTrainId] = useState<string | null>(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState<string>('passenger_service_info');
  const [ignoredUpdate, setIgnoredUpdate] = useState(0); // For forcing re-render
  const requestedTabRef = React.useRef<string | null>(null);
  const rowRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // 计划干预抽屉状态
  const [planInterventionVisible, setPlanInterventionVisible] = useState(false);
  const [planInterventionTrainId, setPlanInterventionTrainId] = useState<string | null>(null);

  // 上水吸污配置抽屉状态
  const [waterSewageConfigVisible, setWaterSewageConfigVisible] = useState(false);
  const [waterSewageConfigTrainId, setWaterSewageConfigTrainId] = useState<string | null>(null);

  // 编组维护抽屉状态
  const [formationDrawerVisible, setFormationDrawerVisible] = useState(false);
  const [formationDrawerTrainId, setFormationDrawerTrainId] = useState<string | null>(null);

  // 客运记录抽屉状态
  const [passengerRecordVisible, setPassengerRecordVisible] = useState(false);
  const [passengerRecord, setPassengerRecord] = useState<typeof mockPassengerRecords[0] | null>(null);
  
  // 作业详情抽屉状态
  const [operationDetailVisible, setOperationDetailVisible] = useState(false);
  const [operationDetailTrainId, setOperationDetailTrainId] = useState<string | null>(null);
  
  // 计划详情抽屉状态
  const [planDetailVisible, setPlanDetailVisible] = useState(false);
  const [planDetailTrainId, setPlanDetailTrainId] = useState<string | null>(null);
  
  // 途径站抽屉状态
  const [routeStationsVisible, setRouteStationsVisible] = useState(false);
  const [routeStationsTrainId, setRouteStationsTrainId] = useState<string | null>(null);
  
  // 操作日志抽屉状态
  const [operationLogVisible, setOperationLogVisible] = useState(false);
  const [operationLogTrainId, setOperationLogTrainId] = useState<string | null>(null);
  
  // 客流信息抽屉状态
  const [passengerFlowVisible, setPassengerFlowVisible] = useState(false);
  const [passengerFlowTrainId, setPassengerFlowTrainId] = useState<string | null>(null);
  
  // 计划变更抽屉状态
  const [planChangeVisible, setPlanChangeVisible] = useState(false);
  const [planChangeTrainId, setPlanChangeTrainId] = useState<string | null>(null);
  
  // 计划变更总览状态
  const [planChangeOverviewVisible, setPlanChangeOverviewVisible] = useState(false);
  
  // 本地数据版本（用于强制重新渲染）
  const [localDataVersion, setLocalDataVersion] = useState(0);
  
  const [connectionLines, setConnectionLines] = useState<{ from: string; to: string }[]>([]);
  const [activeConnection, setActiveConnection] = useState<{ from: string; to: string } | null>(null);
  const [highlightedLines, setHighlightedLines] = useState<string[]>([]);
  const [timeColors, setTimeColors] = useState({
    late: '#ff4d4f', // 默认晚点颜色
    early: '#1890ff', // 默认早点颜色
    normal: '#333' // 默认正常颜色
  });
  const [visibleOperations, setVisibleOperations] = useState({
    checkIn: true, // 检票
    platform: true, // 站台
    exit: true, // 出站
    water: true, // 上水
    sewage: true, // 吸污
    parcel: true, // 行包
    meal: true // 送餐
  });
  const [visibleExitGate, setVisibleExitGate] = useState(true);
  
  // 监听筛选条件变化，自动滚动到顶部
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [planFilters, searchTerm]);

  const incomingConnectionMap = React.useMemo(() => {
    // Build a map of connection targets to their sources
    const map = new Map<string, TrainSchedule>();
    mockTrainSchedules.forEach(train => {
      if (train.connection) {
        map.set(train.connection.trainNo, train);
      }
    });
    return map;
  }, [dataVersion]);

  const sortedSchedules = React.useMemo(() => {
    return [...mockTrainSchedules].sort((a, b) => {
      // Helper to get effective sort time and order
      const getSortInfo = (train: TrainSchedule) => {
        // If this train is a connection target (Origin train from an End train)
        // Use the target train's own departure time (not the source train's arrival)
        const sourceTrain = incomingConnectionMap.get(train.trainNo);
        if (sourceTrain) {
          return {
            time: train.departure.actualTime || train.departure.time || '00:00',
            crossDay: train.departure.crossDay ? 1 : 0,
            isConnectionTarget: true
          };
        }
        // Otherwise use its own arrival time
        return {
          time: train.arrival.actualTime || train.arrival.time || '00:00',
          crossDay: train.arrival.crossDay ? 1 : 0,
          isConnectionTarget: false
        };
      };

      const infoA = getSortInfo(a);
      const infoB = getSortInfo(b);

      // 1. Cross Day Logic
      if (infoA.crossDay !== infoB.crossDay) return infoA.crossDay - infoB.crossDay;
      
      // 2. Time Logic
      const timeCompare = infoA.time.localeCompare(infoB.time);
      if (timeCompare !== 0) return timeCompare;

      // 3. If times are equal (e.g. connected trains), put source before target
      // If A is source of B
      if (a.connection?.trainNo === b.trainNo) return -1;
      // If B is source of A
      if (b.connection?.trainNo === a.trainNo) return 1;

      return 0;
    });
  }, [dataVersion, incomingConnectionMap]);

  const filteredSchedules = React.useMemo(() => {
    let result = sortedSchedules;

    // Filter by Current Station
    result = result.filter(train => train.station === currentStation);

    // Filter by Plan Filters
    if (planFilters) {
      // Filter by Train Type (highSpeed/normalSpeed) - 只有当至少选一个时才筛选
      if (planFilters.highSpeed || planFilters.normalSpeed) {
        result = result.filter(train => {
          const isHighSpeed = train.trainNo.startsWith('G') || train.trainNo.startsWith('D');
          if (planFilters.highSpeed && isHighSpeed) return true;
          if (planFilters.normalSpeed && !isHighSpeed) return true;
          return false;
        });
      }

      // Filter by Operation Type (origin/pass/end) - 只有当至少选一个时才筛选
      if (planFilters.origin || planFilters.pass || planFilters.end) {
        result = result.filter(train => {
          if (train.status === 'origin' && planFilters.origin) return true;
          if (train.status === 'pass' && planFilters.pass) return true;
          if (train.status === 'end' && planFilters.end) return true;
          return false;
        });
      }

      // Filter by Train Category (passenger/non-passenger) - 只有当至少选一个时才筛选
      if (planFilters.passengerTrain || planFilters.nonPassengerTrain) {
        result = result.filter(train => {
          // 目前所有车次都是客运列车，非客运列车暂时按假数据处理
          const isPassenger = true; 
          if (planFilters.passengerTrain && isPassenger) return true;
          if (planFilters.nonPassengerTrain && !isPassenger) return true;
          return false;
        });
      }

      // Filter by Tracks - 只有当选了至少一个且不是全部时才筛选
      if (planFilters.tracks.length > 0) {
        result = result.filter(train => planFilters.tracks.includes(train.location.track));
      }

      // Filter by Waiting Rooms - 只有当选了至少一个且不是全部时才筛选
      if (planFilters.waitingRooms.length > 0) {
        result = result.filter(train => {
          const trackNum = parseInt(train.location.track);
          return planFilters.waitingRooms.some(room => {
            const roomNum = parseInt(room);
            return trackNum >= (roomNum - 1) * 3 + 1 && trackNum <= roomNum * 3;
          });
        });
      }

      // Filter by Plan Change - 只有当开启时才筛选
      if (planFilters.planChange) {
        result = result.filter(train => train.planChangeInfo?.hasAnyChange);
      }
      if (planFilters.yesterdayChange) {
        result = result.filter(train => train.planChangeInfo?.changeType === 'yesterday');
      }
      if (planFilters.kemoChange) {
        result = result.filter(train => train.planChangeInfo?.changeType === 'kemo');
      }
      if (planFilters.bothChange) {
        result = result.filter(train => train.planChangeInfo?.changeType === 'both');
      }
    }

    // Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(train => 
        train.trainNo.toLowerCase().includes(lowerTerm) ||
        train.runningSection?.from?.toLowerCase().includes(lowerTerm) ||
        train.runningSection?.to?.toLowerCase().includes(lowerTerm) ||
        train.location.track.toLowerCase().includes(lowerTerm) ||
        train.location.platform.toLowerCase().includes(lowerTerm)
      );
    }
    
    return result;
  }, [sortedSchedules, searchTerm, planFilters, currentStation]);

  const isCheckInReady = (train: TrainSchedule) => {
    if (train.status === 'end') return false;
    
    // Logic: Check-in ready if current time is within 20 mins before departure
    // and hasn't departed yet.
    // For simplicity, we use a fixed time window relative to planned departure
    const now = dayjs();
    // Assuming today's date for the time string
    const todayStr = now.format('YYYY-MM-DD');
    const departureTime = dayjs(`${todayStr} ${train.departure.time}`);
    
    if (!departureTime.isValid()) return false;
    
    const checkInStart = departureTime.subtract(20, 'minute');
    
    // Show if now is after check-in start and before departure (or slightly after)
    // AND it's not already completed/departed (simplified check)
    return now.isAfter(checkInStart) && now.isBefore(departureTime.add(5, 'minute'));
  };

  // Update connection lines whenever sortedSchedules changes or on mount
  React.useEffect(() => {
    // Find all visible connections in the sorted list
    const lines: { from: string; to: string }[] = [];
    
    // Create a set of visible train IDs for quick lookup
    const visibleTrainNos = new Set(sortedSchedules.map(t => t.trainNo));
    
    sortedSchedules.forEach(train => {
      // 过滤掉途径车的连接，因为途径车的当前行数据只是到站车次和离站车次不一样
      if (train.connection && visibleTrainNos.has(train.connection.trainNo) && train.status !== 'pass') {
        lines.push({
          from: train.trainNo,
          to: train.connection.trainNo
        });
      }
    });
    
    setConnectionLines(lines);
  }, [sortedSchedules]);

  // Sync selectedTrainId prop to drawerTrainId state
  // and set default tab to 'operation_info' if switching to intervention mode
  React.useEffect(() => {
    if (selectedTrainId) {
      setDrawerTrainId(selectedTrainId);

      // When selectedTrainId changes (e.g. from clicking message),
      // if we are in or switching to intervention mode, set tab to operation_info
      // unless a specific tab was requested via handleSelectTrain
      if (requestedTabRef.current) {
        setDrawerInitialTab(requestedTabRef.current);
        requestedTabRef.current = null;
      } else if (viewMode === 'intervention') {
        setDrawerInitialTab('operation_info');
      }

      // Auto scroll to the selected train
      const train = sortedSchedules.find(t => t.id === selectedTrainId);
      if (train) {
        setTimeout(() => {
          const row = rowRefs.current[train.trainNo];
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [selectedTrainId, viewMode, sortedSchedules]);

  // 快速筛选效果：异常/正在作业自动定位和选中
  React.useEffect(() => {
    if (quickFilterType === 'none') return;

    // 筛选出符合条件的车次
    const filteredTrains = filteredSchedules.filter(train => {
      if (quickFilterType === 'abnormal') {
        // 异常：超员、专运、晚点
        return train.tags.overcrowd || train.tags.special || train.arrival.lateEarly?.startsWith('+');
      } else if (quickFilterType === 'operating') {
        // 正在作业
        return train.operationStatus === 'operating' || train.location.currentPos === '正在作业';
      }
      return false;
    });

    if (filteredTrains.length > 0) {
      // 自动选中第一条
      const firstTrain = filteredTrains[0];
      if (onSelectTrain) {
        onSelectTrain(firstTrain.id);
      }

      // 滚动定位
      setTimeout(() => {
        const row = rowRefs.current[firstTrain.trainNo];
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [quickFilterType, filteredSchedules, onSelectTrain]);

  const handleSelectTrain = (trainId: string, shouldScroll: boolean = false, switchToIntervention: boolean = false, targetTab?: string) => {
    const train = filteredSchedules.find(t => t.id === trainId);
    if (!train) return;

    if (targetTab) {
      requestedTabRef.current = targetTab;
    } else {
      requestedTabRef.current = null;
    }

    if (onSelectTrain) {
      onSelectTrain(trainId);
    }
    setHighlightedTrains([train.trainNo]);
    
    // Highlight lines connected to this train
    const relatedLines = connectionLines.filter(line => line.from === train.trainNo || line.to === train.trainNo);
    const lineIds = relatedLines.map(line => `${line.from}-${line.to}`);
    setHighlightedLines(lineIds);

    if (switchToIntervention) {
        setDrawerTrainId(trainId);
        onViewModeChange('intervention');
        setDrawerVisible(false);
    } else if (viewMode === 'intervention') {
        setDrawerTrainId(trainId);
    }

    if (shouldScroll) {
        setTimeout(() => {
          const row = rowRefs.current[train.trainNo];
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
    }
  };

  const handleConnectionClick = (e: React.MouseEvent, _currentTrainNo: string, connectedTrainNo: string) => {
    e.stopPropagation();
    const targetTrain = filteredSchedules.find(t => t.trainNo === connectedTrainNo);
    if (targetTrain) {
      handleSelectTrain(targetTrain.id, true);
    }
  };

  const handleTimeDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    if (onOpenOperationDrawer) {
      onOpenOperationDrawer(trainId, 'timeAdjust');
    }
  };

  const handleCheckInOutDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    if (onOpenOperationDrawer) {
      onOpenOperationDrawer(trainId, 'checkInOutAdjust');
    }
  };

  // 处理双击股道/站台打开股道调整抽屉
  const handleTrackPlatformDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    if (onOpenOperationDrawer) {
      onOpenOperationDrawer(trainId, 'trackPlatformAdjust');
    }
  };

  // 处理双击地标颜色打开编组维护抽屉
  const handleLandmarkColorDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setFormationDrawerTrainId(trainId);
    setFormationDrawerVisible(true);
  };

  const handleGateDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    if (onOpenOperationDrawer) {
      onOpenOperationDrawer(trainId, 'gateAdjust');
    }
  };

  // 处理双击车次数据面板打开计划干预抽屉
  const handleTrainCardDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setPlanInterventionTrainId(trainId);
    setPlanInterventionVisible(true);
  };

  // 处理双击车次打开编组维护抽屉
  const handleTrainNoDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setFormationDrawerTrainId(trainId);
    setFormationDrawerVisible(true);
  };

  const handleCloseFormationDrawer = () => {
    setFormationDrawerVisible(false);
    setFormationDrawerTrainId(null);
  };

  // 键盘上下箭头切换选中行
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只有在有选中行且没有打开抽屉的情况下才响应
      if (!selectedTrainId || drawerVisible || planInterventionVisible || formationDrawerVisible || 
          passengerRecordVisible || operationDetailVisible || planDetailVisible || 
          routeStationsVisible || passengerFlowVisible || operationDrawerVisible) {
        return;
      }

      const currentIndex = filteredSchedules.findIndex(t => t.id === selectedTrainId);
      if (currentIndex === -1) return;

      let newIndex = -1;
      if (e.key === 'ArrowUp') {
        // 向上选择上一行
        newIndex = currentIndex > 0 ? currentIndex - 1 : filteredSchedules.length - 1;
      } else if (e.key === 'ArrowDown') {
        // 向下选择下一行
        newIndex = currentIndex < filteredSchedules.length - 1 ? currentIndex + 1 : 0;
      }

      if (newIndex !== -1) {
        e.preventDefault();
        const newTrain = filteredSchedules[newIndex];
        handleSelectTrain(newTrain.id, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrainId, filteredSchedules, drawerVisible, planInterventionVisible, formationDrawerVisible, 
      passengerRecordVisible, operationDetailVisible, planDetailVisible, routeStationsVisible, 
      passengerFlowVisible, operationDrawerVisible, handleSelectTrain]);

  const handleClosePlanInterventionDrawer = () => {
    setPlanInterventionVisible(false);
    setPlanInterventionTrainId(null);
  };

  // 处理双击上水/吸污标签打开上水吸污配置抽屉
  const handleOpenWaterSewageConfig = (trainId: string) => {
    setWaterSewageConfigTrainId(trainId);
    setWaterSewageConfigVisible(true);
  };

  const handleCloseWaterSewageConfig = () => {
    setWaterSewageConfigVisible(false);
    setWaterSewageConfigTrainId(null);
  };

  // 处理双击客运记录标签打开客运记录抽屉
  const handlePassengerRecordDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    // 根据 trainId 查找对应的客运记录，如果没有则使用第一条模拟数据
    const record = mockPassengerRecords.find(r => r.trainNo === trainId) || mockPassengerRecords[0];
    setPassengerRecord(record);
    setPassengerRecordVisible(true);
  };

  const handleClosePassengerRecordDrawer = () => {
    setPassengerRecordVisible(false);
    setPassengerRecord(null);
  };

  // 处理双击作业卡片打开作业详情抽屉
  const handleOperationCardDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    console.log('双击作业卡片，trainId:', trainId);
    setOperationDetailTrainId(trainId);
    setOperationDetailVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#52c41a'; // Green
      case 'completed': return '#1890ff'; // Blue
      case 'pending': return '#faad14'; // Orange
      case 'alarm': return '#ff4d4f'; // Red (Alarm/Overdue)
      default: return '#d9d9d9'; // Grey
    }
  };

  // DispatchReminderModal removed as per user request


  const handleCloseDrawer = () => {
    const targetTrainId = drawerTrainId;
    
    if (viewMode === 'intervention') {
      onViewModeChange('normal');
      // Wait for the transition (300ms) to finish before scrolling
      if (targetTrainId) {
        setTimeout(() => {
          handleSelectTrain(targetTrainId, true);
        }, 350);
      }
    } else {
      setDrawerVisible(false);
      // For normal drawer overlay, scroll immediately (or with default 100ms in handleSelectTrain)
      if (targetTrainId) {
        handleSelectTrain(targetTrainId, true);
      }
    }
  };

  const renderPassengerFlowItem = (value: number | undefined | string, color: string) => {
    return (
      <div 
        style={{ 
          borderColor: color, 
          color: color,
          flex: 1,
          height: '18px', 
          borderRadius: '4px', 
          padding: '0 2px', 
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          minWidth: '40px',
          borderWidth: '1px',
          borderStyle: 'solid',
          backgroundColor: '#fff'
        }}
      >
        {value ?? '-'}
      </div>
    );
  };

  const renderProgressBar = (deviceInfo: { value: string; state: 'normal' | 'abnormal' | 'none' }) => {
    const { value, state } = deviceInfo;
    
    // Determine color based on state
    // Use strong colors for hollow style (border + text)
    let color = '#d9d9d9'; // Default / none (Grey)
    if (state === 'normal') {
      color = '#52c41a'; // Green (Active)
    } else if (state === 'abnormal') {
      color = '#ff4d4f'; // Red (Error)
    }
  
    return (
      <div 
        style={{ 
          borderColor: color, 
          color: color,
          flex: 1,
          height: '18px', 
          borderRadius: '4px', 
          padding: '0 2px', 
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          minWidth: '60px',
          borderWidth: '1px',
          borderStyle: 'solid',
          backgroundColor: '#fff' // Ensure white background for hollow effect
        }}
      >
        {value}
      </div>
    );
  };

  const renderOperationStatus = (op: { actualCount: number; plannedCount: number; status: string; hasLate?: boolean; hasMissed?: boolean }) => {
    // Handle cases where no operation is planned (e.g. Origin/End stations)
    if (op.plannedCount === 0) {
      return (
        <div 
          className="operation-status absent" 
          style={{ 
            flex: 1,
            height: '18px', 
            borderRadius: '4px', 
            padding: '0 2px', 
            fontSize: '12px',
            border: '1px solid #d9d9d9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            minWidth: '60px'
          }} 
        >
          -
        </div>
      );
    }
    
    // For all other cases, show actual/planned
    const label = `${op.actualCount}/${op.plannedCount}`;
    const color = getStatusColor(op.status);
    
    return (
      <div 
        className="operation-status" 
        style={{ 
          borderColor: color, 
          color: color,
          flex: 1,
          height: '18px', 
          borderRadius: '4px', 
          padding: '0 2px', 
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          minWidth: '60px',
          borderWidth: '1px',
          borderStyle: 'solid',
          gap: '0'
        }}
      >
        {label}
      </div>
    );
  };

  const renderPlanStatus = (status: string, isSuspended: boolean = false) => {
    let style: React.CSSProperties = { 
      fontSize: '14px', 
      fontWeight: '500',
      color: '#999', // Default gray text for suspended trains
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };

    // 精简状态显示映射
    const statusMap: Record<string, string> = {
      '正在候车': '候',
      '预告': '预',
      '正在检票': '开',
      '准备检票': '开',
      '停止检票': '停',
      '列车已到达': '到',
      '正点到达': '到',
      '列车离站': '离',
      '晚点': '晚',
      '停运': '停运',
      '晚点未定': '晚未'
    };

    const displayStatus = statusMap[status] || status;

    // 调整字体大小，2个字时使用更小的字体
    if (displayStatus.length === 2) {
      style.fontSize = '12px';
    }

    // 停运列车不显示色彩标记
    if (!isSuspended) {
      switch (status) {
        case '正在检票':
        case '准备检票':
          style.color = '#52c41a'; // Green
          break;
        case '停止检票':
          style.color = '#999'; // Gray
          break;
        case '停运':
          style.color = '#999'; // Gray for 停运
          break;
        case '晚点未定':
        case '晚点':
          style.color = '#ff4d4f'; // Red
          break;
        case '正在候车':
        case '列车已到达':
      case '正点到达':
      case '列车离站':
      case '预告':
        style.color = '#1890ff'; // Blue
        break;
      default:
        style.color = '#1890ff'; // Default Blue
        break;
      }
    }

    return (
      <div style={style}>
        {displayStatus || '-'}
      </div>
    );
  };

  const getTrainStatusStyle = (status: string) => {
    switch (status) {
      case 'origin': return { borderLeft: '4px solid #52c41a' }; // Green for Origin
      case 'end': return { borderLeft: '4px solid #ff4d4f' }; // Red for End
      case 'pass': return { borderLeft: '4px solid #1890ff' }; // Blue for Pass
      default: return {};
    }
  };

  const getTrainPillStyle = (status: string) => {
    switch (status) {
      case 'origin':
        return {
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          border: '1px solid #86efac',
          color: '#16a34a'
        };
      case 'end':
        return {
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '1px solid #fca5a5',
          color: '#dc2626'
        };
      case 'pass':
        return {
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          border: '1px solid #93c5fd',
          color: '#2563eb'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
          border: '1px solid #5eead4',
          color: '#0f766e'
        };
    }
  };

  const locationOptions = [
    { label: '站台', value: 'platform' },
    { label: '检票口', value: 'checkInGate' },
    { label: '出站口', value: 'exitGate' },
  ];

  const locationSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {locationOptions.map(opt => (
        <Checkbox 
          key={opt.value}
          checked={visibleLocations[opt.value as keyof typeof visibleLocations]}
          onChange={(e) => setVisibleLocations(prev => ({ ...prev, [opt.value]: e.target.checked }))}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );

  const tagOptions = [
    { label: '具备检票条件', value: 'checkInReady' },
    { label: '上水', value: 'water' },
    { label: '吸污', value: 'sewage' },
    { label: '行包', value: 'parcel' },
    { label: '送餐', value: 'meal' },
    { label: '过夜', value: 'overnight' },
    { label: '折返', value: 'turnaround' },
    { label: '超员', value: 'overcrowd' },
    { label: '专运', value: 'special' },
  ] as const;

  const tagsSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tagOptions.map(opt => (
        <Checkbox 
          key={opt.value}
          checked={visibleTags[opt.value as keyof typeof visibleTags]}
          onChange={(e) => setVisibleTags(prev => ({ ...prev, [opt.value]: e.target.checked }))}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );

  const deviceOptions = [
    { label: '广播', value: 'broadcast' },
    { label: '引导', value: 'guide' },
    { label: '闸机', value: 'gate' },
  ];

  const deviceSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {deviceOptions.map(opt => (
        <Checkbox 
          key={opt.value}
          checked={visibleDevices[opt.value as keyof typeof visibleDevices]}
          onChange={(e) => setVisibleDevices(prev => ({ ...prev, [opt.value]: e.target.checked }))}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );

  const passengerFlowOptions = [
    { label: '上车', value: 'boarding' },
    { label: '下车', value: 'alighting' },
    { label: '换乘', value: 'transfer' },
  ];

  const passengerFlowSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {passengerFlowOptions.map(opt => (
        <Checkbox 
          key={opt.value}
          checked={visiblePassengerFlow[opt.value as keyof typeof visiblePassengerFlow]}
          onChange={(e) => setVisiblePassengerFlow(prev => ({ ...prev, [opt.value]: e.target.checked }))}
        >
          {opt.label}
        </Checkbox>
      ))}
    </div>
  );

  // 时间颜色配置面板
  const timeColorSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>晚点颜色:</span>
        <Input 
          value={timeColors.late} 
          onChange={(e) => setTimeColors(prev => ({ ...prev, late: e.target.value }))}
          style={{ width: '100px' }}
        />
        <div style={{ width: '20px', height: '20px', backgroundColor: timeColors.late, border: '1px solid #d9d9d9' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>早点颜色:</span>
        <Input 
          value={timeColors.early} 
          onChange={(e) => setTimeColors(prev => ({ ...prev, early: e.target.value }))}
          style={{ width: '100px' }}
        />
        <div style={{ width: '20px', height: '20px', backgroundColor: timeColors.early, border: '1px solid #d9d9d9' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>正常颜色:</span>
        <Input 
          value={timeColors.normal} 
          onChange={(e) => setTimeColors(prev => ({ ...prev, normal: e.target.value }))}
          style={{ width: '100px' }}
        />
        <div style={{ width: '20px', height: '20px', backgroundColor: timeColors.normal, border: '1px solid #d9d9d9' }} />
      </div>
    </div>
  );

  // 作业状态配置面板
  const operationSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
      <Checkbox 
        checked={visibleOperations.checkIn}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, checkIn: e.target.checked }))}
      >
        检票
      </Checkbox>
      <Checkbox 
        checked={visibleOperations.platform}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, platform: e.target.checked }))}
      >
        站台
      </Checkbox>
      <Checkbox 
        checked={visibleOperations.exit}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, exit: e.target.checked }))}
      >
        出站
      </Checkbox>
      <Checkbox 
        checked={visibleOperations.water}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, water: e.target.checked }))}
      >
        上水
      </Checkbox>
      <Checkbox 
        checked={visibleOperations.sewage}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, sewage: e.target.checked }))}
      >
        吸污
      </Checkbox>
      <Checkbox 
        checked={visibleOperations.parcel}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, parcel: e.target.checked }))}
      >
        行包
      </Checkbox>
      <Checkbox 
        checked={visibleOperations.meal}
        onChange={(e) => setVisibleOperations(prev => ({ ...prev, meal: e.target.checked }))}
      >
        送餐
      </Checkbox>
    </div>
  );

  // 出站口显示配置
  const exitGateSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
      <Checkbox 
        checked={visibleExitGate}
        onChange={(e) => setVisibleExitGate(e.target.checked)}
      >
        显示出站口
      </Checkbox>
    </div>
  );

  const getLandmarkStyle = (colorName: string, isTrackChange: boolean = false) => {
    // If track changed, use the distinct Gold/Orange alert style
    if (isTrackChange) {
      return {
        bg: '#fffbe6',
        border: '#ffe58f',
        text: '#d46b08',
        label: '#d48806'
      };
    }

    // 根据车次类型返回对应的柔和地标颜色
    const colorMap: Record<string, { bg: string; border: string; text: string; label: string }> = {
      'cyan': {
        bg: '#e0f2fe',      // 浅蓝背景
        border: '#7dd3fc',  // 柔和蓝边框
        text: '#0284c7',    // 深蓝文字
        label: '#0369a1'    // 标签文字
      },
      'purple': {
        bg: '#f3e8ff',      // 浅紫背景
        border: '#d8b4fe',  // 柔和紫边框
        text: '#9333ea',    // 深紫文字
        label: '#7c3aed'    // 标签文字
      },
      'yellow': {
        bg: '#fef9c3',      // 浅黄背景
        border: '#fde047',  // 柔和黄边框
        text: '#a16207',    // 深黄文字
        label: '#854d0e'    // 标签文字
      },
      'default': {
        bg: '#dcfce7',      // 浅绿背景
        border: '#86efac',  // 柔和绿边框
        text: '#16a34a',    // 深绿文字
        label: '#15803d'    // 标签文字
      }
    };

    return colorMap[colorName] || colorMap['cyan'];
  };

  // 获取早晚点背景色
  const getLateEarlyBackgroundStyle = (lateEarly: string, darkMode: boolean, isSuspended: boolean = false) => {
    // 停运列车不显示色彩标记
    if (isSuspended) {
      return {};
    }
    
    // 处理空值、'0'、'-'等无意义值
    if (!lateEarly || lateEarly === '0' || lateEarly === '-') {
      return {};
    }

    const isLate = lateEarly.startsWith('+');
    const isEarly = lateEarly.startsWith('-');

    if (isLate) {
      // 晚点：红色背景
      return {
        backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fff1f0',
        border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #ffa39e',
        borderRadius: '8px'
      };
    } else if (isEarly) {
      // 早点：蓝色背景
      return {
        backgroundColor: darkMode ? 'rgba(24, 144, 255, 0.15)' : '#e6f7ff',
        border: darkMode ? '1px solid rgba(24, 144, 255, 0.3)' : '1px solid #91d5ff',
        borderRadius: '8px'
      };
    }

    return {};
  };

  const getRowCenterY = (trainNo: string) => {
    if (!trainNo) return null;
    const row = rowRefs.current[trainNo];
    if (!row || typeof row.offsetTop !== 'number' || typeof row.offsetHeight !== 'number') return null;
    return row.offsetTop + row.offsetHeight / 2;
  };

  const handleCloseOperationDetail = () => {
    setOperationDetailVisible(false);
    setOperationDetailTrainId(null);
  };

  // 处理双击旅服作业数据面板打开计划详情抽屉
  const handleServiceOperationDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setPlanDetailTrainId(trainId);
    setPlanDetailVisible(true);
  };

  const handleClosePlanDetail = () => {
    setPlanDetailVisible(false);
    setPlanDetailTrainId(null);
  };

  // 处理双击运行区间打开途径站抽屉
  const handleRunningSectionDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setRouteStationsTrainId(trainId);
    setRouteStationsVisible(true);
  };

  const handleCloseRouteStationsDrawer = () => {
    setRouteStationsVisible(false);
    setRouteStationsTrainId(null);
  };

  // 处理双击客流信息打开客流信息抽屉
  const handlePassengerFlowDoubleClick = (e: React.MouseEvent, trainId: string) => {
    e.stopPropagation();
    setPassengerFlowTrainId(trainId);
    setPassengerFlowVisible(true);
  };

  const handleClosePassengerFlowDrawer = () => {
    setPassengerFlowVisible(false);
    setPassengerFlowTrainId(null);
  };

  // 处理计划变更抽屉
  const handleOpenPlanChange = (trainId: string) => {
    setPlanChangeTrainId(trainId);
    setPlanChangeVisible(true);
  };

  const handleClosePlanChange = () => {
    setPlanChangeVisible(false);
    setPlanChangeTrainId(null);
  };

  // Helper to render lines for all visible connections
  const renderConnectionLines = () => {
    return (
      <div className="link-overlay">
        {connectionLines.map((line, index) => {
          // Safety check for line data
          if (!line || !line.from || !line.to) return null;
          
          const y1 = getRowCenterY(line.from);
          const y2 = getRowCenterY(line.to);
          
          if (y1 === null || y2 === null) return null;
          
          const isHighlighted = highlightedLines.includes(`${line.from}-${line.to}`) || highlightedLines.includes(`${line.to}-${line.from}`);
          const lineColor = isHighlighted ? '#1890ff' : '#0ea5e9';
          const lineWidth = isHighlighted ? '3px' : '2px';
          const outerCircleSize = isHighlighted ? 20 : 16;
          const innerCircleSize = isHighlighted ? 10 : 8;
          
          // 左移线条位置
          const baseLeft = -10;
          
          return (
            <React.Fragment key={`${line.from}-${line.to}`}>
              {/* 垂直线段 */}
              <div 
                className="link-vert" 
                style={{ 
                  top: Math.min(y1, y2), 
                  height: Math.abs(y2 - y1),
                  left: baseLeft,
                  backgroundColor: lineColor,
                  width: lineWidth,
                  zIndex: isHighlighted ? 10 : 1
                }} 
              />
              
              {/* 顶部圆点 - 外圈 */}
              <div 
                className="link-tick" 
                style={{ 
                  top: y1 - outerCircleSize/2, 
                  left: baseLeft - outerCircleSize/2 + 1, 
                  width: outerCircleSize,
                  height: outerCircleSize,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `2px solid ${lineColor}`,
                  boxShadow: isHighlighted ? '0 0 0 2px rgba(24,144,255,0.2)' : 'none',
                  zIndex: isHighlighted ? 10 : 1
                }} 
              />
              
              {/* 顶部圆点 - 内圈 */}
              <div 
                className="link-tick" 
                style={{ 
                  top: y1 - innerCircleSize/2, 
                  left: baseLeft - innerCircleSize/2 + 1, 
                  width: innerCircleSize,
                  height: innerCircleSize,
                  borderRadius: '50%',
                  background: lineColor,
                  zIndex: isHighlighted ? 11 : 2
                }} 
              />
              
              {/* 底部圆点 - 外圈 */}
              <div 
                className="link-tick" 
                style={{ 
                  top: y2 - outerCircleSize/2, 
                  left: baseLeft - outerCircleSize/2 + 1, 
                  width: outerCircleSize,
                  height: outerCircleSize,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `2px solid ${lineColor}`,
                  boxShadow: isHighlighted ? '0 0 0 2px rgba(24,144,255,0.2)' : 'none',
                  zIndex: isHighlighted ? 10 : 1
                }} 
              />
              
              {/* 底部圆点 - 内圈 */}
              <div 
                className="link-tick" 
                style={{ 
                  top: y2 - innerCircleSize/2, 
                  left: baseLeft - innerCircleSize/2 + 1, 
                  width: innerCircleSize,
                  height: innerCircleSize,
                  borderRadius: '50%',
                  background: lineColor,
                  zIndex: isHighlighted ? 11 : 2
                }} 
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div className={`train-grid-header train-grid-layout ${viewMode === 'intervention' ? 'collapsed' : ''} ${simpleMode ? 'simple-mode' : ''}`}>
        <div className="grid-header-cell">车次</div>
        <div className="grid-header-cell">到点</div>
        <div className="grid-header-cell">发点</div>
        <div className="grid-header-cell">开停检时间</div>
        {/* 股道/站台列 - 简洁模式下也显示 */}
        <div className="grid-header-cell hide-on-collapse">股道/站台</div>
        <div className="grid-header-cell hide-on-collapse" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 简洁模式下只显示检票口 */}
          <span>{!simpleMode && visibleExitGate ? '检票口/出站口' : '检票口'}</span>
          {!simpleMode && (
            <Popover content={exitGateSettingsContent} title="配置">
              <Settings size={14} style={{ cursor: 'pointer', color: '#666' }} />
            </Popover>
          )}
        </div>
        <div className="grid-header-cell hide-on-collapse">客流信息</div>
        <div className="grid-header-cell hide-on-collapse">旅服作业</div>
        <div className="grid-header-cell hide-on-collapse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Ticket size={16} />
          <span>检票作业</span>
        </div>
        <div className="grid-header-cell hide-on-collapse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrainFront size={16} />
          <span>站台作业</span>
        </div>
        <div className="grid-header-cell hide-on-collapse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={16} />
          <span>出站作业</span>
        </div>
        <div className="grid-header-cell hide-on-collapse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link size={16} />
          <span>结合部作业</span>
        </div>
        <div className="grid-header-cell hide-on-collapse">状态</div>
        {/* 日志列 - 简洁模式下也显示 */}
        <div className="grid-header-cell hide-on-collapse" style={{ borderRight: 'none' }}>日志</div>
      </div>

      {/* Body */}
      <div 
        className={`train-grid-container ${viewMode === 'intervention' ? 'collapsed' : ''} ${simpleMode ? 'simple-mode' : ''}`}
        style={{ 
          flex: 1, 
          height: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
          transition: 'all 0.3s ease',
          borderRight: viewMode === 'intervention' ? '1px solid #e4e4e7' : 'none',
          marginTop: '5px'
        }}
        ref={(el) => {
          containerRef.current = el;
          tableContainerRef.current = el;
        }}
      >
        {filteredSchedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>暂无数据</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative', width: '100%', minWidth: 'min-content' }}>
            {renderConnectionLines()}
            {filteredSchedules.map((item, index) => {
              const sourceTrain = incomingConnectionMap.get(item.trainNo);
              const isSuspended = item.location.currentPos.includes('停运');
              const groups = !isSuspended ? getOperationDetails(item) : null;
              const summary = !isSuspended && groups ? summarizeOperations(groups) : null;

          // Format check times
          let checkOpenTime = '--';
          let checkCloseTime = '--';
          if (item.departure.time && item.departure.time !== '-') {
            checkOpenTime = dayjs().format('M/D') + ' ' + dayjs(`2024-01-01 ${item.departure.time}`).subtract(20, 'minute').format('HH:mm');
            checkCloseTime = dayjs().format('M/D') + ' ' + dayjs(`2024-01-01 ${item.departure.time}`).subtract(5, 'minute').format('HH:mm');
          }

          return (
            <div
              key={item.id}
              className={`train-card ${selectedTrainId === item.id ? 'selected-card' : ''} ${isSuspended ? 'suspended-train' : ''}`}
              ref={(el) => { rowRefs.current[item.trainNo] = el; }}
              onClick={() => handleSelectTrain(item.id)}
            >
              {/* Topbar */}
              <div className="card-topbar" style={{ flexWrap: 'wrap', height: 'auto' }}>
                <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="badge-index">{index + 1}</div>

                  <div 
                    className="badge-gray"
                    onDoubleClick={(e) => handleRunningSectionDoubleClick(e, item.id)}
                    style={{ cursor: 'pointer' }}
                    title="双击打开途径站信息"
                  >
                    {item.runningSection?.from || '-'}→{item.runningSection?.to || '-'}
                  </div>
                  {/* 计划变更标记 */}
                  {item.planChangeInfo?.hasAnyChange && (
                    <PlanChangeBadge
                      changeType={item.planChangeInfo.changeType}
                      changeCount={item.planChangeInfo.changeCount}
                      size="medium"
                      darkMode={darkMode}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleOpenPlanChange(item.id);
                      }}
                    />
                  )}
                  {/* 编组信息组 - 双击打开编组维护 */}
                  <div 
                    className="formation-info-group"
                    onDoubleClick={(e) => handleTrainNoDoubleClick(e, item.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    title="双击打开编组维护"
                  >
                    <div className="badge-gray">{item.attributes.trainModel}</div>
                    <div
                      className="badge-landmark"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f5f5f5',
                        border: '1px solid #d9d9d9',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#333'
                      }}
                    >
                      <span>{item.attributes.formation}{item.attributes.formationOrder === 'normal' ? '正' : '倒'}{item.attributes.direction === 'up' ? '北' : '南'}</span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          background: (() => {
                            // 地标颜色规则：
                            // 16正序 → 黄色
                            // 16倒序 → 绿色
                            // 8上行正序 → 蓝色
                            // 8下行正序 → 黄色
                            // 8上行倒序 → 绿色
                            // 8下行倒序 → 紫色
                            const { formation, formationOrder, direction } = item.attributes;
                            // formation可能是数字或字符串，统一转换为数字比较
                            const formationNum = typeof formation === 'string' ? parseInt(formation, 10) : formation;
                            if (formationNum === 16) {
                              return formationOrder === 'normal' ? '#facc15' : '#4ade80';
                            } else if (formationNum === 8) {
                              if (formationOrder === 'normal') {
                                return direction === 'up' ? '#3b82f6' : '#facc15';
                              } else {
                                return direction === 'up' ? '#4ade80' : '#c084fc';
                              }
                            }
                            // 默认颜色
                            return '#3b82f6';
                          })()
                        }}
                      />
                    </div>

                  </div>
                  {/* 常用标签：上水、吸污 */}
                  {item.tags.water && (
                    <div 
                      className="service-tag blue" 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleOpenWaterSewageConfig(item.id);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="双击配置上水车厢"
                    >
                      <WaterIcon size={18}/> 上水
                    </div>
                  )}
                  {item.tags.sewage && (
                    <div 
                      className="service-tag orange" 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleOpenWaterSewageConfig(item.id);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="双击配置吸污车厢"
                    >
                      <SewageIcon size={18}/> 吸污
                    </div>
                  )}
                </div>
                <div className="topbar-right hide-on-collapse">
                  {/* 不常用标签 */}
                  {/* 临站发车标记 - 使用indigo色 */}
                  {index === 1 && <div className="service-tag indigo"><TrainFront size={14}/> 临站发车</div>}
                  {item.tags.parcel && <div className="service-tag purple"><Package size={14}/> 行包</div>}
                  {item.tags.meal && <div className="service-tag cyan"><Utensils size={14}/> 送餐</div>}
                  {item.tags.overnight && <div className="service-tag teal"><BedDouble size={14}/> 过夜</div>}
                  {item.tags.turnaround && <div className="service-tag gold"><RotateCcw size={14}/> 折返</div>}
                  {item.tags.overcrowd && <div className="service-tag red-outline"><Users size={14}/> 超员</div>}
                  {item.tags.special && <div className="service-tag yellow-outline"><Crown size={14}/> 专运</div>}
                  {/* 开检就绪 */}
                  {item.tags.checkInReady && (
                    <div
                      className="service-tag checkin-ready-tag"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#52c41a',
                        border: '1px solid #52c41a',
                        background: '#f6ffed',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      <CheckSquare size={14}/> 开检就绪
                    </div>
                  )}
                  {/* 客运记录 */}
                  {item.tags.special && (
                    <div
                      className="service-tag yellow-outline passenger-record-tag"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}
                      onDoubleClick={(e) => handlePassengerRecordDoubleClick(e, item.id)}
                    >
                      <FileText size={14}/> 客运记录
                    </div>
                  )}
                  {/* 列车长信息 */}
                  <div className="badge-gray">
                    列车长: {item.trainMaster || '未知'}
                  </div>
                  {/* 站名标签 - 仅在代管模式显示，放在最右边 */}
                  {controlMode === '代管' && (
                    <div className="badge-station">{item.station}</div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`card-content train-grid-layout ${simpleMode ? 'simple-mode' : ''}`}>
                {/* 1. 车次 */}
                <div 
                  className="cell-train-no"
                  onDoubleClick={(e) => handleTrainCardDoubleClick(e, item.id)}
                  style={{ cursor: 'pointer' }}
                  title="双击打开计划干预"
                >
                  {/* 接续车次 - 途径车不显示 */}
                  {item.status !== 'pass' && sourceTrain && (
                    <div className={`train-sub-pill source ${sourceTrain.status}`} onClick={(e) => handleConnectionClick(e, item.trainNo, sourceTrain.trainNo)} style={{ fontSize: '16px' }}>
                      {sourceTrain.trainNo}
                    </div>
                  )}
                  <div className={`train-main-pill ${isSuspended ? 'suspended' : item.status}`} style={{ fontSize: '24px', fontWeight: 600 }}>
                    {item.trainNo}
                  </div>
                  {/* 接续车次 - 途径车不显示 */}
                  {item.status !== 'pass' && item.departureTrainNo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className={`train-sub-pill target ${item.status}`} style={{ fontSize: '16px' }}>
                        {item.departureTrainNo}
                      </div>
                      {item.connection && item.connection.trainNo === item.departureTrainNo && (
                        <div className="connection-time" style={{ fontSize: '16px' }}>
                          {item.connection.time}分
                        </div>
                      )}
                    </div>
                  )}
                  {item.status !== 'pass' && item.connection && (!item.departureTrainNo || item.connection.trainNo !== item.departureTrainNo) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className={`train-sub-pill target ${filteredSchedules.find(t => t.trainNo === item.connection!.trainNo)?.status || 'pass'}`} onClick={(e) => handleConnectionClick(e, item.trainNo, item.connection!.trainNo)} style={{ fontSize: '16px' }}>
                        {item.connection.trainNo}
                      </div>
                      <div className="connection-time" style={{ fontSize: '16px' }}>
                        {item.connection.time}分
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. 到点 */}
                <div
                  className="info-stack"
                  style={{
                    cursor: 'pointer',
                    ...getLateEarlyBackgroundStyle(
                      (item.status !== 'origin' && item.arrival.actualTime && item.arrival.lateEarly && item.arrival.lateEarly !== '0') ? item.arrival.lateEarly : '0',
                      darkMode,
                      isSuspended
                    ),
                    padding: '4px'
                  }}
                  onDoubleClick={(e) => handleTimeDoubleClick(e, item.id)}
                >
                  {item.status !== 'origin' && (
                    <>
                      {(() => {
                        const hasActualTime = !!item.arrival.actualTime;
                        const hasLateEarly = hasActualTime && item.arrival.lateEarly && item.arrival.lateEarly !== '0';
                        const hasTdStopped = item.arrival.isTdStopped;
                        const isOnlyPlanned = !hasLateEarly && !hasTdStopped;
                        return (
                          <div className="info-row">
                            <div className="icon-circle bg-gray">到</div>
                            <span style={isOnlyPlanned ? { fontSize: '24px', fontWeight: 600 } : undefined}>
                              {item.arrival.time || '--'}
                            </span>
                          </div>
                        );
                      })()}
                      {(item.arrival.actualTime && item.arrival.lateEarly && item.arrival.lateEarly !== '0') && (
                        <div className="info-row">
                          <div className="icon-circle bg-cyan">实</div>
                          <span className={item.arrival.lateEarly.startsWith('-') ? 'text-blue' : 'text-red'}>
                            {item.arrival.actualTime}
                          </span>
                          <span className={item.arrival.lateEarly.startsWith('-') ? 'tag-blue-bg' : 'tag-red-bg'}>
                            {item.arrival.lateEarly}
                          </span>
                        </div>
                      )}
                      {item.arrival.isTdStopped && (
                        <div className="info-row">
                          <div className="icon-circle bg-yellow">TD</div>
                          <span className="text-yellow">{item.arrival.dispatchTime}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 3. 发点 */}
                <div
                  className="info-stack"
                  style={{
                    cursor: 'pointer',
                    ...getLateEarlyBackgroundStyle(
                      (item.status !== 'end' && item.departure.actualTime && item.departure.lateEarly && item.departure.lateEarly !== '0') ? item.departure.lateEarly : '0',
                      darkMode,
                      isSuspended
                    ),
                    padding: '4px'
                  }}
                  onDoubleClick={(e) => handleTimeDoubleClick(e, item.id)}
                >
                  {item.status !== 'end' && (
                    <>
                      {(() => {
                        const hasActualTime = !!item.departure.actualTime;
                        const hasLateEarly = hasActualTime && item.departure.lateEarly && item.departure.lateEarly !== '0';
                        const hasTdStopped = item.departure.isTdStopped;
                        const isOnlyPlanned = !hasLateEarly && !hasTdStopped;
                        return (
                          <div className="info-row">
                            <div className="icon-circle bg-gray">发</div>
                            <span style={isOnlyPlanned ? { fontSize: '24px', fontWeight: 600 } : undefined}>
                              {item.departure.time || '--'}
                            </span>
                          </div>
                        );
                      })()}
                      {(item.departure.actualTime && item.departure.lateEarly && item.departure.lateEarly !== '0') && (
                        <div className="info-row">
                          <div className="icon-circle bg-cyan">实</div>
                          <span className={item.departure.lateEarly.startsWith('-') ? 'text-blue' : 'text-red'}>
                            {item.departure.actualTime}
                          </span>
                          <span className={item.departure.lateEarly.startsWith('-') ? 'tag-blue-bg' : 'tag-red-bg'}>
                            {item.departure.lateEarly}
                          </span>
                        </div>
                      )}
                      {item.departure.isTdStopped && (
                        <div className="info-row">
                          <div className="icon-circle bg-yellow">TD</div>
                          <span className="text-yellow">{item.departure.dispatchTime}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 4. 开停检时间 */}
                <div
                  className="info-stack"
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={(e) => handleCheckInOutDoubleClick(e, item.id)}
                >
                  {item.status !== 'end' && (
                    <>
                      <div className="info-row">
                        <div className="icon-square bg-green text-white">开</div>
                        <span style={{ fontSize: '16px' }}>{checkOpenTime || '--'}</span>
                      </div>
                      <div className="info-row">
                        <div className="icon-square bg-red text-white">停</div>
                        <span style={{ fontSize: '16px' }}>{checkCloseTime || '--'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* 5. 股道/站台 - 简洁模式下也显示 */}
                <div
                  className={`info-stack hide-on-collapse ${(item.location as any).trackChange ? 'track-change-alert' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={(e) => handleTrackPlatformDoubleClick(e, item.id)}
                >
                  {(() => {
                    const hasTrackChange = (item.location as any).trackChange;
                    const isOnlyPlanned = !hasTrackChange;
                    return (
                      <div className="info-row">
                        <div className="icon-circle bg-gray">图</div>
                        <span style={isOnlyPlanned ? { fontSize: simpleMode ? '18px' : '24px', fontWeight: 600 } : undefined}>
                          {item.location.track}G/{item.location.platform}
                        </span>
                      </div>
                    );
                  })()}
                  {(item.location as any).trackChange && (
                    <div className="info-row">
                      <div className="icon-circle bg-yellow">实</div>
                      <span className="text-red">{(item.location as any).actualTrack}</span>
                    </div>
                  )}
                </div>

                {/* 6. 检票口/出站口 */}
                <div 
                  className="info-stack hide-on-collapse"
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={(e) => handleGateDoubleClick(e, item.id)}
                >
                  <div className="info-row">
                    <div className="icon-square bg-blue text-white">检</div>
                    <span style={{ fontSize: simpleMode ? '18px' : '14px', fontWeight: simpleMode ? 600 : 400 }}>{item.status === 'end' ? '--' : item.location.checkInGate}</span>
                  </div>
                  {/* 简洁模式下隐藏出站口 */}
                  {!simpleMode && visibleExitGate && (
                    <div className="info-row">
                      <div className="icon-square bg-gray text-white">出</div>
                      <span style={{ fontSize: '14px' }}>{item.status === 'origin' ? '--' : item.location.exitGate}</span>
                    </div>
                  )}
                </div>

                {/* 7. 客流信息 */}
                <div 
                  className="box-cell hide-on-collapse" 
                  style={{ cursor: 'pointer' }}
                  onDoubleClick={(e) => handlePassengerFlowDoubleClick(e, item.id)}
                  title="双击打开客流信息"
                >
                  {(() => {
                    const isOrigin = item.status === 'origin';
                    const isEnd = item.status === 'end';
                    const isStopover = !isOrigin && !isEnd;
                    const largeFontSize = '20px';
                    
                    if (isOrigin) {
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
                              <ArrowUp size={12} color="#10b981"/> 上车
                            </div>
                            <span style={{ 
                              fontFamily: 'Oswald', 
                              whiteSpace: 'nowrap',
                              fontSize: largeFontSize,
                              fontWeight: 600,
                              color: '#10b981'
                            }}>
                              {item.passengerFlow?.boarding || '-'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    if (isEnd) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px', padding: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
                              <ArrowDown size={12} color="#f59e0b"/> 下车
                            </div>
                            <span style={{ 
                              fontFamily: 'Oswald', 
                              whiteSpace: 'nowrap',
                              fontSize: largeFontSize,
                              fontWeight: 600,
                              color: '#f59e0b'
                            }}>
                              {item.passengerFlow?.alighting || '-'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
                              <RotateCcw size={12} color="#3b82f6"/> 换乘
                            </div>
                            <span style={{ 
                              fontFamily: 'Oswald', 
                              whiteSpace: 'nowrap',
                              fontSize: largeFontSize,
                              fontWeight: 600,
                              color: '#3b82f6'
                            }}>
                              {item.passengerFlow?.transfer || '-'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        <div className="box-row">
                          <div className="box-row-left"><ArrowUp size={14} color="#10b981"/> 上车</div>
                          <span style={{fontFamily: 'Oswald', whiteSpace: 'nowrap'}}>{item.passengerFlow?.boarding || '-'}</span>
                        </div>
                        <div className="box-row">
                          <div className="box-row-left"><ArrowDown size={14} color="#f59e0b"/> 下车</div>
                          <span style={{fontFamily: 'Oswald', whiteSpace: 'nowrap'}}>{item.passengerFlow?.alighting || '-'}</span>
                        </div>
                        <div className="box-row">
                          <div className="box-row-left"><RotateCcw size={14} color="#3b82f6"/> 换乘</div>
                          <span style={{fontFamily: 'Oswald', whiteSpace: 'nowrap'}}>{item.passengerFlow?.transfer || '-'}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 8. 旅服作业 */}
                {(() => {
                  // 判断是否有作业 - 停运列车不显示作业
                  const hasOperation = !isSuspended;
                  
                  if (!hasOperation) {
                    return (
                      <div className="box-cell hide-on-collapse" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>
                        -
                      </div>
                    );
                  }
                  
                  const hasAbnormal = item.devices.broadcast.state === 'abnormal' ||
                                      item.devices.guide.state === 'abnormal' ||
                                      item.devices.gate.state === 'abnormal';
                  
                  return simpleMode ? (
                    // 简洁模式：显示已完成/正在作业/异常状态
                    <div 
                      className="box-cell hide-on-collapse" 
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '12px' }} 
                      onDoubleClick={(e) => handleServiceOperationDoubleClick(e, item.id)}
                    >
                    {/* 异常指示灯 */}
                    {hasAbnormal && <div className="abnormal-indicator indicator-abnormal"></div>}
                    {(() => {
                      let status: 'completed' | 'inProgress' | 'abnormal' = 'completed';
                      let statusText = '已完成';
                      let barColor = '';
                      let bgGradient = '';
                      let textColor = darkMode ? '#94A3B8' : '#64748B';
                      
                      if (hasAbnormal) {
                        // 异常：使用红色渐变
                        status = 'abnormal';
                        statusText = '异常';
                        barColor = 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)';
                        bgGradient = darkMode 
                          ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.25) 0%, rgba(127, 29, 29, 0.2) 100%)'
                          : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)';
                        textColor = '#DC2626';
                      } else if (index % 4 === 0) {
                        // 正在作业：使用浅绿色渐变（随机约25%的车次）
                        status = 'inProgress';
                        statusText = '正在作业';
                        barColor = 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)'
                          : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
                        textColor = '#16A34A';
                      } else {
                        // 已完成：无特殊背景
                        status = 'completed';
                        statusText = '已完成';
                      }
                      
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '18px',
                          fontWeight: 600,
                          width: '100%',
                          height: '100%',
                          background: bgGradient || 'transparent',
                          color: textColor
                        }}>
                          {barColor && (
                            <div style={{
                              width: '6px',
                              height: '100%',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              borderRadius: '8px 0 0 8px',
                              background: barColor
                            }} />
                          )}
                          <span style={barColor ? { marginLeft: '1px', width: '88px' } : {}}>
                            {statusText}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  // 标准模式：显示详细设备信息
                  (() => {
                    let cellClass = 'box-cell hide-on-collapse';
                    if (hasAbnormal) cellClass += ' has-absent';
                    
                    return (
                      <div 
                        className={cellClass} 
                        style={{ cursor: 'pointer', borderRadius: '12px', position: 'relative' }} 
                        onDoubleClick={(e) => handleServiceOperationDoubleClick(e, item.id)}
                      >
                        {/* 异常指示灯 - 只保留这一个 */}
                        {hasAbnormal && <div className="abnormal-indicator indicator-abnormal"></div>}
                        <div className="box-row">
                          <div className="box-row-left"><Mic size={14}/> 广播</div>
                          <div className="box-row-left">
                            {/* 去掉每个设备前面的圆点 */}
                            <span className={item.devices.broadcast.state === 'abnormal' ? 'text-red' : ''}>{item.devices.broadcast.value}</span>
                          </div>
                        </div>
                        <div className="box-row">
                          <div className="box-row-left"><List size={14}/> 引导</div>
                          <div className="box-row-left">
                            {/* 去掉每个设备前面的圆点 */}
                            <span className={item.devices.guide.state === 'abnormal' ? 'text-red' : ''}>{item.devices.guide.value}</span>
                          </div>
                        </div>
                        <div className="box-row">
                          <div className="box-row-left"><Ticket size={14}/> 闸机</div>
                          <div className="box-row-left">
                            {/* 去掉每个设备前面的圆点 */}
                            <span className={item.devices.gate.state === 'abnormal' ? 'text-red' : ''}>{item.devices.gate.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                );
                })()}

                {/* 9. 检票作业 */}
                {(() => {
                  // 判断是否有作业
                  const hasOperation = !isSuspended && summary && summary.checkIn && summary.checkIn.plannedCount > 0;
                  
                  // 简洁模式：只显示总体状态
                  if (simpleMode) {
                    let status: 'notStarted' | 'inProgress' | 'completed' | 'abnormal' = 'notStarted';
                    let statusText = '未开始';
                    let barColor = '';
                    let bgGradient = '';
                    let textColor = darkMode ? '#94A3B8' : '#64748B';
                    
                    if (hasOperation) {
                      const hasAbsent = summary.checkIn.actualCount < summary.checkIn.plannedCount && summary.checkIn.actualCount > 0;
                      const hasStarted = summary.checkIn.actualCount > 0;
                      const allCompleted = summary.checkIn.actualCount >= summary.checkIn.plannedCount;
                      
                      if (allCompleted) {
                        // 已完成：使用页面整体风格，无特殊标记
                        status = 'completed';
                        statusText = '已完成';
                      } else if (hasAbsent) {
                        // 异常：使用红色渐变
                        status = 'abnormal';
                        statusText = '异常';
                        barColor = 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.25) 0%, rgba(127, 29, 29, 0.2) 100%)'
                          : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)';
                        textColor = '#DC2626';
                      } else if (hasStarted) {
                        // 正在作业：使用浅绿色渐变
                        status = 'inProgress';
                        statusText = '正在作业';
                        barColor = 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)'
                          : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
                        textColor = '#16A34A';
                      }
                    }
                    
                    return (
                      <div 
                        className="box-cell hide-on-collapse" 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '12px' }} 
                        onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}
                      >
                        {/* 异常指示灯 */}
                        {(() => {
                          const hasAbsent = hasOperation && summary.checkIn.actualCount < summary.checkIn.plannedCount && summary.checkIn.actualCount > 0;
                          return hasAbsent ? <div className="abnormal-indicator indicator-abnormal"></div> : null;
                        })()}
                        {hasOperation ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 600,
                            width: '100%',
                            height: '100%',
                            background: bgGradient || 'transparent',
                            color: textColor
                          }}>
                            {barColor && (
                              <div style={{
                                width: '6px',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                borderRadius: '8px 0 0 8px',
                                background: barColor
                              }} />
                            )}
                            <span style={barColor ? { paddingLeft: '4px' } : {}}>
                              {statusText}
                            </span>
                          </div>
                        ) : (
                          <div style={{ color: '#999', fontSize: '18px' }}>-</div>
                        )}
                      </div>
                    );
                  }
                  
                  // 标准模式：显示详细人员信息
                  const hasAbsent = hasOperation && index === 0;
                  const plannedCount = hasOperation ? summary.checkIn.plannedCount : 0;
                  
                  // 根据数据量计算字体大小
                  let fontSize = '14px';
                  if (plannedCount <= 2) {
                    fontSize = '18px';
                  } else if (plannedCount <= 4) {
                    fontSize = '15px';
                  } else {
                    fontSize = '12px';
                  }
                  
                  let cellClass = 'box-cell hide-on-collapse';
                  if (hasAbsent) cellClass += ' has-absent';

                  return (
                    <div className={cellClass} style={{ cursor: 'pointer', borderRadius: '12px', position: 'relative' }} onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}>
                      {/* 异常指示灯 - 只保留这一个 */}
                      {hasAbsent && (
                        <div className="abnormal-indicator indicator-abnormal"></div>
                      )}
                      
                      {hasOperation ? (
                        <>
                          {(() => {
                            const jobs = [];
                            for (let i = 0; i < summary.checkIn.plannedCount; i++) {
                              const isArrived = i < summary.checkIn.actualCount;
                              // 状态具体到每个作业人员
                              let personName = '未开始';
                              let isTransparent = false;
                              
                              // 模拟：第1个检票员未到岗（红色），第2个检票员出务预告（黄色闪烁）
                              if (i === 0 && index === 0) {
                                // 第一个检票员未到岗
                                personName = '未到岗';
                              } else if (i === 1 && index === 0) {
                                // 第二个检票员出务预告（黄色闪烁），不显示文字
                                personName = '检票员' + (i + 1);
                                isTransparent = true;
                              } else if (isArrived) {
                                // 已报到
                                personName = '检票员' + (i + 1);
                                isTransparent = i === 0; // 检票员1背景透明
                              }
                              
                              jobs.push({
                                id: `checkIn-${i}`,
                                person: personName,
                                isTransparent,
                                isError: i === 0 && index === 0 // "未到岗"是error状态
                              });
                            }
                            return jobs;
                          })().map((job) => (
                            <div key={job.id} className="box-row">
                              <div className="box-row-left" style={{ flex: 1, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                <div className="box-row-left" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                                  {/* 去掉每个作业人员前面的圆点 */}
                                  <div 
                                    className={`person-label ${job.isError ? 'error' : 'normal'}`}
                                    style={{ 
                                      ...(job.isTransparent ? { backgroundColor: 'transparent', padding: '2px 0' } : {}),
                                      fontSize: fontSize
                                    }}
                                  >
                                    {job.person}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>-</div>
                      )}
                    </div>
                  );
                })()}

                {/* 10. 站台作业 */}
                {(() => {
                  // 判断是否有作业
                  const hasOperation = !isSuspended && summary && summary.platform && summary.platform.plannedCount > 0;
                  
                  // 简洁模式：只显示总体状态
                  if (simpleMode) {
                    let status: 'notStarted' | 'inProgress' | 'completed' | 'abnormal' = 'notStarted';
                    let statusText = '未开始';
                    let barColor = '';
                    let bgGradient = '';
                    let textColor = darkMode ? '#94A3B8' : '#64748B';
                    
                    if (hasOperation) {
                      const hasStarted = summary.platform.actualCount > 0;
                      const allCompleted = summary.platform.actualCount >= summary.platform.plannedCount;
                      
                      if (allCompleted) {
                        // 已完成：使用页面整体风格，无特殊标记
                        status = 'completed';
                        statusText = '已完成';
                      } else if (hasStarted) {
                        // 正在作业：使用浅绿色渐变
                        status = 'inProgress';
                        statusText = '正在作业';
                        barColor = 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)'
                          : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
                        textColor = '#16A34A';
                      }
                    }

                    return (
                      <div
                        className="box-cell hide-on-collapse"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                        onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}
                      >
                        {hasOperation ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 600,
                            width: '100%',
                            height: '100%',
                            background: bgGradient || 'transparent',
                            color: textColor
                          }}>
                            {barColor && (
                              <div style={{
                                width: '6px',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                borderRadius: '8px 0 0 8px',
                                background: barColor
                              }} />
                            )}
                            <span style={barColor ? { paddingLeft: '4px' } : {}}>
                              {statusText}
                            </span>
                          </div>
                        ) : (
                          <div style={{ color: '#999', fontSize: '18px' }}>-</div>
                        )}
                      </div>
                    );
                  }
                  
                  // 标准模式：显示详细人员信息
                  const plannedCount = hasOperation ? summary.platform.plannedCount : 0;
                  
                  // 根据数据量计算字体大小
                  let fontSize = '14px';
                  if (plannedCount <= 2) {
                    fontSize = '18px';
                  } else if (plannedCount <= 4) {
                    fontSize = '15px';
                  } else {
                    fontSize = '12px';
                  }
                  
                  let cellClass = 'box-cell hide-on-collapse';

                  return (
                    <div className={cellClass} style={{ cursor: 'pointer', position: 'relative' }} onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}>
                      {/* 异常指示灯 - 站台作业目前没有异常状态，暂时不添加 */}
                      
                      {hasOperation ? (
                        <>
                          {(() => {
                            const jobs = [];
                            // 随机人员名称列表
                            const randomNames = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十'];
                            for (let i = 0; i < summary.platform.plannedCount; i++) {
                              const isArrived = i < summary.platform.actualCount;
                              let dotStatus = 'white';
                              let personName = '未开始';
                              
                              if (isArrived) {
                                // 已报到
                                dotStatus = 'green';
                                personName = randomNames[Math.floor(Math.random() * randomNames.length)];
                              }
                              
                              jobs.push({
                                id: `platform-${i}`,
                                person: personName,
                                status: dotStatus
                              });
                            }
                            return jobs;
                          })().map((job) => (
                            <div key={job.id} className="box-row">
                              <div className="box-row-left" style={{ flex: 1, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                <div className="box-row-left" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                                  <div className={`dot ${job.status}`}></div>
                                  <div 
                                    className={`person-label ${job.status === 'red' ? 'error' : 'normal'}`}
                                    style={{ fontSize: fontSize }}
                                  >
                                    {job.person}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>-</div>
                      )}
                    </div>
                  );
                })()}

                {/* 11. 出站作业 */}
                {(() => {
                  // 判断是否有作业
                  const hasOperation = !isSuspended && summary && summary.exit && summary.exit.plannedCount > 0;
                  
                  // 简洁模式：只显示总体状态
                  if (simpleMode) {
                    let status: 'notStarted' | 'inProgress' | 'completed' | 'abnormal' = 'notStarted';
                    let statusText = '未开始';
                    let barColor = '';
                    let bgGradient = '';
                    let textColor = darkMode ? '#94A3B8' : '#64748B';
                    
                    if (hasOperation) {
                      const hasStarted = summary.exit.actualCount > 0;
                      const allCompleted = summary.exit.actualCount >= summary.exit.plannedCount;
                      
                      if (allCompleted) {
                        // 已完成：使用页面整体风格，无特殊标记
                        status = 'completed';
                        statusText = '已完成';
                      } else if (hasStarted) {
                        // 正在作业：使用浅绿色渐变
                        status = 'inProgress';
                        statusText = '正在作业';
                        barColor = 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)'
                          : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
                        textColor = '#16A34A';
                      }
                    }

                    return (
                      <div
                        className="box-cell hide-on-collapse"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                        onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}
                      >
                        {hasOperation ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 600,
                            width: '100%',
                            height: '100%',
                            background: bgGradient || 'transparent',
                            color: textColor
                          }}>
                            {barColor && (
                              <div style={{
                                width: '6px',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                borderRadius: '8px 0 0 8px',
                                background: barColor
                              }} />
                            )}
                            <span style={barColor ? { paddingLeft: '4px' } : {}}>
                              {statusText}
                            </span>
                          </div>
                        ) : (
                          <div style={{ color: '#999', fontSize: '18px' }}>-</div>
                        )}
                      </div>
                    );
                  }
                  
                  // 标准模式：显示详细人员信息
                  const plannedCount = hasOperation ? summary.exit.plannedCount : 0;
                  
                  // 根据数据量计算字体大小
                  let fontSize = '14px';
                  if (plannedCount <= 2) {
                    fontSize = '18px';
                  } else if (plannedCount <= 4) {
                    fontSize = '15px';
                  } else {
                    fontSize = '12px';
                  }
                  
                  let cellClass = 'box-cell hide-on-collapse';

                  return (
                    <div className={cellClass} style={{ cursor: 'pointer', position: 'relative' }} onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}>
                      {/* 异常指示灯 - 出站作业目前没有异常状态，暂时不添加 */}
                      
                      {hasOperation ? (
                        <>
                          {(() => {
                            const jobs = [];
                            const randomNames = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十'];
                            for (let i = 0; i < summary.exit.plannedCount; i++) {
                              const isArrived = i < summary.exit.actualCount;
                              let dotStatus = 'white';
                              let personName = randomNames[i % randomNames.length];
                              
                              if (isArrived) {
                                // 已报到
                                dotStatus = 'green';
                              }
                              
                              jobs.push({
                                id: `exit-${i}`,
                                person: personName,
                                status: dotStatus
                              });
                            }
                            return jobs;
                          })().map((job) => (
                            <div key={job.id} className="box-row">
                              <div className="box-row-left" style={{ flex: 1, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                <div className="box-row-left" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                                  <div className={`dot ${job.status}`}></div>
                                  <div 
                                    className={`person-label ${job.status === 'red' ? 'error' : 'normal'}`}
                                    style={{ fontSize: fontSize }}
                                  >
                                    {job.person}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>-</div>
                      )}
                    </div>
                  );
                })()}

                {/* 12. 结合部作业 */}
                {(() => {
                  // 判断是否有作业
                  const jointOps = item.jointOperations || [];
                  const hasOperation = !isSuspended && jointOps.length > 0;
                  
                  // 简洁模式：只显示总体状态
                  if (simpleMode) {
                    let status: 'notStarted' | 'inProgress' | 'completed' | 'abnormal' = 'notStarted';
                    let statusText = '未开始';
                    let barColor = '';
                    let bgGradient = '';
                    let textColor = darkMode ? '#94A3B8' : '#64748B';
                    
                    if (hasOperation) {
                      const hasStarted = jointOps.some((job: any) => job.status === 'green' || job.status === 'yellow');
                      const allCompleted = jointOps.every((job: any) => job.status === 'green');
                      const hasAbnormal = jointOps.some((job: any) => job.status === 'red');
                      
                      if (allCompleted) {
                        // 已完成：使用页面整体风格，无特殊标记
                        status = 'completed';
                        statusText = '已完成';
                      } else if (hasAbnormal) {
                        // 异常：使用红色渐变
                        status = 'abnormal';
                        statusText = '异常';
                        barColor = 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.25) 0%, rgba(127, 29, 29, 0.2) 100%)'
                          : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)';
                        textColor = '#DC2626';
                      } else if (hasStarted) {
                        // 正在作业：使用浅绿色渐变
                        status = 'inProgress';
                        statusText = '正在作业';
                        barColor = 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)';
                        bgGradient = darkMode
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)'
                          : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
                        textColor = '#16A34A';
                      }
                    }

                    return (
                      <div
                        className="box-cell hide-on-collapse"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                        onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}
                      >
                        {hasOperation ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 600,
                            width: '100%',
                            height: '100%',
                            background: bgGradient || 'transparent',
                            color: textColor
                          }}>
                            {barColor && (
                              <div style={{
                                width: '6px',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                borderRadius: '8px 0 0 8px',
                                background: barColor
                              }} />
                            )}
                            <span style={barColor ? { paddingLeft: '4px' } : {}}>
                              {statusText}
                            </span>
                          </div>
                        ) : (
                          <div style={{ color: '#999', fontSize: '18px' }}>-</div>
                        )}
                      </div>
                    );
                  }
                  
                  // 标准模式：显示详细人员信息
                  const hasAbnormal = jointOps.some((job: any) => job.status === 'red');
                  const plannedCount = jointOps.length;
                  
                  // 根据数据量计算字体大小
                  let fontSize = '14px';
                  if (plannedCount <= 2) {
                    fontSize = '18px';
                  } else if (plannedCount <= 4) {
                    fontSize = '15px';
                  } else {
                    fontSize = '12px';
                  }
                  
                  let cellClass = 'box-cell hide-on-collapse';

                  return (
                    <div className={cellClass} style={{ cursor: 'pointer', position: 'relative' }} onDoubleClick={(e) => handleOperationCardDoubleClick(e, item.id)}>
                      {/* 异常指示灯 - 只保留这一个 */}
                      {hasAbnormal && (
                        <div className="abnormal-indicator indicator-abnormal"></div>
                      )}
                      
                      {hasOperation ? (
                        <>
                          {jointOps.map((job: any) => (
                            <div key={job.id} className="box-row">
                              <div className="box-row-left" style={{ flex: 1, justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                  {job.id === 'water' && <svg width="14" height="14" viewBox="0 0 24 24" fill="#0ea5e9"><path d="M12 2C12 2 12 6 12 6C12 6 12 10 12 10C16 10 19 13 19 17C19 17 19 22 19 22H5C5 22 5 17 5 17C5 13 8 10 12 10C12 10 12 6 12 6C12 6 12 2 12 2Z"/><path d="M12 10C12 10 12 14 12 14C14 14 16 16 16 18C16 18 16 20 16 20H8C8 20 8 18 8 18C8 16 10 14 12 14C12 14 12 10 12 10Z"/></svg>}
                                  {job.id === 'sewage' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10H20"/><path d="M8 4H16"/><path d="M8 16H16"/><path d="M12 4V16"/><path d="M8 10V16"/><path d="M16 10V16"/></svg>}
                                  {job.id === 'meal' && <Utensils size={14} color="#14b8a6"/>}
                                  {job.id === 'express' && <Package size={14} color="#ef4444"/>}
                                  <span style={{ whiteSpace: 'nowrap' }}>{job.name}</span>
                                </div>
                                <div className="box-row-left" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                                  {/* 去掉每个作业前面的圆点 */}
                                  <div 
                                    className={`person-label ${job.status === 'red' ? 'error' : 'normal'}`}
                                    style={{ fontSize: fontSize }}
                                  >
                                    {job.person}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>-</div>
                      )}
                    </div>
                  );
                })()}

                {/* 13. 计划状态 */}
                <div className="status-block hide-on-collapse">
                  {(() => {
                    const now = new Date();
                    const arrivalTime = new Date();
                    
                    let isNotArrived = true;
                    let isArrived = false;
                    
                    if (item.arrival.time && item.arrival.time !== '-') {
                      const [hours, minutes] = item.arrival.time.split(':').map(Number);
                      arrivalTime.setHours(hours, minutes, 0, 0);
                      isNotArrived = now < arrivalTime;
                      isArrived = !isNotArrived;
                    }
                    
                    const isChecking = item.location.currentPos.includes('检票') || item.location.currentPos === '开';
                    const isSuspended = item.location.currentPos.includes('停运');
                    const isLate = item.location.currentPos.includes('晚点');
                    
                    let statusText = '到';
                    let statusClass = 'blue';
                    
                    if (isChecking) {
                      statusText = '开';
                      statusClass = 'green';
                    } else if (isSuspended) {
                      statusText = '停运';
                      statusClass = 'gray';
                    } else if (isLate) {
                      statusText = '晚';
                      statusClass = 'red';
                    } else if (isNotArrived) {
                      statusText = '候';
                      statusClass = 'normal';
                    }
                    
                    return (
                      <div className={`status-square ${statusClass}`}>
                        {statusText}
                      </div>
                    );
                  })()}
                </div>

                {/* 14. 日志 - 简洁模式下也显示 */}
                <div className="hide-on-collapse" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <button
                    className="log-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOperationLogVisible(true);
                      setOperationLogTrainId(item.id);
                    }}
                    style={{
                      width: simpleMode ? '36px' : '40px',
                      height: simpleMode ? '36px' : '40px',
                      borderRadius: '8px',
                      border: '1px solid #e4e4e7',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#e4e4e7';
                    }}
                  >
                    <FileText size={simpleMode ? 18 : 20} color="#3b82f6" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
        </div>
        )}
      </div>

      {/* Drawers */}
      {viewMode === 'intervention' && (
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <TrainDetailDrawer 
            visible={true} 
            onClose={handleCloseDrawer} 
            trainId={drawerTrainId}
            mode="embedded" 
            initialTab={drawerInitialTab}
            onDispose={() => setIgnoredUpdate((n: number) => n + 1)}
            onDataChange={onDataChange}
          />
        </div>
      )}
      <TrainDetailDrawer 
        visible={drawerVisible} 
        onClose={handleCloseDrawer} 
        trainId={drawerTrainId}
        initialTab={drawerInitialTab}
        onDispose={() => setIgnoredUpdate((n: number) => n + 1)}
        onDataChange={onDataChange}
        darkMode={darkMode}
      />
      <OperationDrawer
        visible={operationDrawerVisible}
        onClose={onOperationDrawerClose || (() => {})}
        trainId={operationTrainId || null}
        operationType={operationType || null}
        darkMode={darkMode}
      />

      {/* 计划干预抽屉 */}
      <PlanInterventionDrawer
        visible={planInterventionVisible}
        onClose={handleClosePlanInterventionDrawer}
        trainId={planInterventionTrainId}
        darkMode={darkMode}
        onTagsChange={(trainId, tags) => {
          // 更新本地数据状态
          const trainIndex = filteredSchedules.findIndex(t => t.id === trainId);
          if (trainIndex !== -1) {
            // 触发数据更新通知
            if (onDataChange) {
              onDataChange();
            }
          }
        }}
        onDataChange={() => {
          // 触发数据更新通知
          if (onDataChange) {
            onDataChange();
          }
        }}
      />

      {/* 编组维护抽屉 */}
      <TrainFormationDrawer
        visible={formationDrawerVisible}
        onClose={handleCloseFormationDrawer}
        trainId={formationDrawerTrainId}
        darkMode={darkMode}
      />

      {/* 客运记录抽屉 */}
      <PassengerRecordDrawer
        visible={passengerRecordVisible}
        onClose={handleClosePassengerRecordDrawer}
        record={passengerRecord}
        darkMode={darkMode}
      />

      {/* 作业详情抽屉 */}
      <OperationDetailDrawer
        visible={operationDetailVisible}
        onClose={handleCloseOperationDetail}
        trainId={operationDetailTrainId}
        darkMode={darkMode}
      />
      {/* 计划详情抽屉 */}
      <PlanDetailDrawer
        visible={planDetailVisible}
        onClose={handleClosePlanDetail}
        trainId={planDetailTrainId}
        darkMode={darkMode}
      />
      <RouteStationsDrawer
        visible={routeStationsVisible}
        onClose={handleCloseRouteStationsDrawer}
        train={routeStationsTrainId ? mockTrainSchedules.find(t => t.id === routeStationsTrainId) : null}
        darkMode={darkMode}
      />
      
      {/* 客流信息抽屉 */}
      <PassengerFlowDrawer
        visible={passengerFlowVisible}
        onClose={handleClosePassengerFlowDrawer}
        trainId={passengerFlowTrainId}
        darkMode={darkMode}
      />

      {/* 上水吸污配置抽屉 */}
      <WaterSewageConfigDrawer
        visible={waterSewageConfigVisible}
        onClose={handleCloseWaterSewageConfig}
        trainId={waterSewageConfigTrainId}
        darkMode={darkMode}
        onConfigChange={(trainId, config) => {
          // 触发数据更新
          if (onDataChange) {
            onDataChange();
          }
        }}
      />

      {/* 操作日志抽屉 */}
      <OperationLogDrawer
        visible={operationLogVisible}
        onClose={() => {
          setOperationLogVisible(false);
          setOperationLogTrainId(null);
        }}
        trainId={operationLogTrainId}
        darkMode={darkMode}
      />

      {/* 计划变更抽屉 */}
      <PlanChangeDrawer
        visible={planChangeVisible}
        onClose={handleClosePlanChange}
        trainId={planChangeTrainId}
        darkMode={darkMode}
        onDataChange={() => setLocalDataVersion(v => v + 1)}
      />

      {/* 计划变更总览 */}
      <PlanChangeOverview
        visible={planChangeOverviewVisible}
        onClose={() => setPlanChangeOverviewVisible(false)}
        darkMode={darkMode}
        trains={mockTrainSchedules}
        onViewTrain={(trainId) => {
          setPlanChangeOverviewVisible(false);
          handleOpenPlanChange(trainId);
        }}
        onBatchResolve={(strategy) => {
          // 批量处理所有变更
          mockTrainSchedules.forEach(train => {
            if (train.planChangeInfo?.hasAnyChange) {
              const changeItems = [
                'arrivalTime', 'departureTime', 'track', 'formation',
                'trainModel', 'water', 'sewage', 'parcel'
              ];
              changeItems.forEach(field => {
                const fieldInfo = (train.planChangeInfo as any)[field];
                if (fieldInfo && fieldInfo.diffType !== 'none') {
                  if (strategy === 'lock') {
                    if (!train.planChangeInfo!.lockedFields.includes(field)) {
                      train.planChangeInfo!.lockedFields.push(field);
                    }
                  } else if (strategy === 'yesterday') {
                    fieldInfo.today = fieldInfo.yesterday;
                    fieldInfo.diffType = 'none';
                  } else if (strategy === 'kemo') {
                    fieldInfo.today = fieldInfo.kemo;
                    fieldInfo.diffType = 'none';
                  }
                }
              });
              // 重新计算变更状态
              let changeCount = 0;
              changeItems.forEach(field => {
                const fieldInfo = (train.planChangeInfo as any)[field];
                if (fieldInfo && fieldInfo.diffType !== 'none') {
                  changeCount++;
                }
              });
              train.planChangeInfo!.changeCount = changeCount;
              train.planChangeInfo!.hasAnyChange = changeCount > 0;
              if (changeCount === 0) {
                train.planChangeInfo!.changeType = 'none';
              }
            }
          });
          setLocalDataVersion(v => v + 1);
        }}
      />
    </div>
  );
};
