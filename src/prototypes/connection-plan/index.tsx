/**
 * @name 接续计划
 * @mode axure
 * 综合指挥/接续计划页面
 */
import React, { useState } from 'react';
import './style.css';
import { TrainServiceDrawer } from './TrainServiceDrawer';
import { OperationDrawer } from './OperationDrawer';
import { TimeAdjustDrawer } from './TimeAdjustDrawer';
import { BroadcastDrawer } from './BroadcastDrawer';
import { GuideDrawer } from './GuideDrawer';
import { RouteDrawer } from './RouteDrawer';
import { PassengerFlowDrawer } from './PassengerFlowDrawer';
import { FormationDrawer } from './FormationDrawer';

interface StatData {
  operationPlan: {
    yesterday: string;
    currentPending: string;
    today: string;
  };
  keyPlan: {
    water: string;
    sewage: string;
    parcel: string;
    meal: string;
    turnaround: string;
  };
  riskPlan: {
    a: number;
    b: number;
    c: number;
    d: number;
  };
  ctc: {
    trackChange: number;
    timeChange: number;
  };
}

const mockStats: StatData = {
  operationPlan: {
    yesterday: '654',
    currentPending: '300',
    today: '348/648'
  },
  keyPlan: {
    water: '60/128',
    sewage: '20/97',
    parcel: '10/45',
    meal: '15/53',
    turnaround: '16/36'
  },
  riskPlan: {
    a: 2,
    b: 1,
    c: 5,
    d: 12
  },
  ctc: {
    trackChange: 4,
    timeChange: 12
  }
};

interface DeviceStatus {
  abnormal: number;
  completed: number;
  total: number;
}

interface TrainData {
  id: string;
  arrivalTrainNo: string;
  departureTrainNo: string;
  arrivalStatus: 'on_time' | 'late' | 'stopped';
  departureStatus: 'on_time' | 'late' | 'preparing';
  departureStation: string;
  arrivalStation: string;
  arrivalTime: string;
  actualArrivalTime: string;
  ctcArrivalTime: string;
  departureTime: string;
  actualDepartureTime: string;
  ctcDepartureTime: string;
  track: string;
  platform: string;
  checkInGate: string;
  exitGate: string;
  formation: string;
  formationDirection: '北' | '南';
  formationOrder: '↑' | '↓';
  lateInfo: string;
  checkInStartTime: string;
  checkInEndTime: string;
  devices: {
    gate: DeviceStatus;
    guide: DeviceStatus;
    broadcast: DeviceStatus;
  };
  operations: {
    water: DeviceStatus;
    sewage: DeviceStatus;
    parcel: DeviceStatus;
    meal: DeviceStatus;
    overcrowd: DeviceStatus;
  };
  platformOperations: {
    arrival?: DeviceStatus;
    departure?: DeviceStatus;
  };
  connection: {
    time: string;
    risk: boolean;
    riskLevel: 'A' | 'B' | 'C' | 'D' | 'S';
    special: boolean;
  };
  trainType?: string;
  arrivalRouteFrom?: string;
  arrivalRouteTo?: string;
  departureRouteFrom?: string;
  departureRouteTo?: string;
  passengerFlow?: {
    boarding?: number;
    alighting?: number;
    transfer?: number;
  };
}

const mockTrainData: TrainData[] = [
  {
    id: '1',
    arrivalTrainNo: 'G312',
    departureTrainNo: 'G312',
    arrivalStatus: 'on_time',
    departureStatus: 'on_time',
    departureStation: '成都东',
    arrivalStation: '上海虹桥',
    trainType: 'through',
    arrivalRouteFrom: '成都东',
    arrivalRouteTo: '上海虹桥',
    departureRouteFrom: '成都东',
    departureRouteTo: '上海虹桥',
    arrivalTime: '17:04',
    actualArrivalTime: '',
    ctcArrivalTime: '',
    departureTime: '17:07',
    actualDepartureTime: '',
    ctcDepartureTime: '',
    track: '3',
    platform: '3',
    checkInGate: 'A2/A3',
    exitGate: '8北',
    formation: '8',
    formationDirection: '北',
    formationOrder: '↑',
    lateInfo: '',
    checkInStartTime: '14:00',
    checkInEndTime: '14:30',
    departureTime: '14:45',
    devices: {
      gate: { abnormal: 0, completed: 5, total: 5 },
      guide: { abnormal: 1, completed: 6, total: 12 },
      broadcast: { abnormal: 0, completed: 9, total: 9 }
    },
    operations: {
      water: { abnormal: 0, completed: 3, total: 5 },
      sewage: { abnormal: 0, completed: 0, total: 0 },
      parcel: { abnormal: 0, completed: 8, total: 10 },
      meal: { abnormal: 1, completed: 4, total: 6 },
      overcrowd: { abnormal: 0, completed: 1, total: 1 }
    },
    platformOperations: {
      arrival: { abnormal: 0, completed: 6, total: 8 },
      departure: { abnormal: 0, completed: 4, total: 8 }
    },
    connection: {
      time: '23',
      risk: true,
      riskLevel: 'A',
      special: true
    },
    passengerFlow: {
      boarding: 568,
      alighting: 423,
      transfer: 178
    }
  },
  {
    id: '2',
    arrivalTrainNo: 'G202',
    departureTrainNo: 'G201',
    arrivalStatus: 'late',
    departureStatus: 'on_time',
    departureStation: '上海虹桥',
    arrivalStation: '重庆东',
    trainType: 'terminus',
    arrivalRouteFrom: '上海虹桥',
    arrivalRouteTo: '重庆东',
    departureRouteFrom: '重庆东',
    departureRouteTo: '上海虹桥',
    arrivalTime: '17:18',
    actualArrivalTime: '17:16',
    ctcArrivalTime: '',
    departureTime: '17:50',
    actualDepartureTime: '17:48',
    ctcDepartureTime: '',
    track: '3→1',
    platform: '3',
    checkInGate: 'A1',
    exitGate: '16南',
    formation: '16',
    formationDirection: '南',
    formationOrder: '↓',
    lateInfo: '-2',
    checkInStartTime: '15:20',
    checkInEndTime: '15:40',
    departureTime: '15:50',
    devices: {
      gate: { abnormal: 0, completed: 5, total: 5 },
      guide: { abnormal: 2, completed: 4, total: 12 },
      broadcast: { abnormal: 0, completed: 9, total: 9 }
    },
    operations: {
      water: { abnormal: 0, completed: 0, total: 0 },
      sewage: { abnormal: 0, completed: 0, total: 0 },
      parcel: { abnormal: 0, completed: 0, total: 0 },
      meal: { abnormal: 0, completed: 0, total: 0 },
      overcrowd: { abnormal: 1, completed: 0, total: 1 }
    },
    platformOperations: {
      arrival: { abnormal: 0, completed: 3, total: 4 },
      departure: { abnormal: 1, completed: 5, total: 8 }
    },
    connection: {
      time: '32',
      risk: true,
      riskLevel: 'B',
      special: true
    },
    passengerFlow: {
      boarding: 489,
      alighting: 562,
      transfer: 203
    }
  },
  {
    id: '3',
    arrivalTrainNo: 'G1542',
    departureTrainNo: 'G1542',
    arrivalStatus: 'on_time',
    departureStatus: 'on_time',
    departureStation: '重庆西',
    arrivalStation: '广州南',
    trainType: 'through',
    arrivalRouteFrom: '重庆西',
    arrivalRouteTo: '广州南',
    departureRouteFrom: '重庆西',
    departureRouteTo: '广州南',
    arrivalTime: '17:48',
    actualArrivalTime: '',
    ctcArrivalTime: '17:45',
    departureTime: '17:56',
    actualDepartureTime: '',
    ctcDepartureTime: '17:53',
    track: '19',
    platform: '19',
    checkInGate: 'B18/B19',
    exitGate: '-',
    formation: '8',
    formationDirection: '北',
    formationOrder: '↑',
    lateInfo: '',
    checkInStartTime: '15:00',
    checkInEndTime: '15:15',
    departureTime: '15:45',
    devices: {
      gate: { abnormal: 0, completed: 0, total: 0 },
      guide: { abnormal: 0, completed: 0, total: 0 },
      broadcast: { abnormal: 0, completed: 0, total: 0 }
    },
    operations: {
      water: { abnormal: 0, completed: 5, total: 5 },
      sewage: { abnormal: 0, completed: 4, total: 6 },
      parcel: { abnormal: 0, completed: 3, total: 3 },
      meal: { abnormal: 0, completed: 0, total: 0 },
      overcrowd: { abnormal: 0, completed: 0, total: 0 }
    },
    platformOperations: {
      departure: { abnormal: 0, completed: 7, total: 8 }
    },
    connection: {
      time: '24',
      risk: true,
      riskLevel: 'C',
      special: true
    },
    passengerFlow: {
      boarding: 412,
      alighting: 356,
      transfer: 145
    }
  },
  {
    id: '4',
    arrivalTrainNo: '0G8608',
    departureTrainNo: 'G8608',
    arrivalStatus: 'stopped',
    departureStatus: 'on_time',
    departureStation: '重庆西',
    arrivalStation: '武汉',
    trainType: 'inspection',
    arrivalRouteFrom: '重庆西',
    arrivalRouteTo: '重庆东',
    departureRouteFrom: '重庆东',
    departureRouteTo: '武汉',
    arrivalTime: '16:00',
    actualArrivalTime: '16:05',
    ctcArrivalTime: '15:55',
    departureTime: '16:45',
    actualDepartureTime: '16:50',
    ctcDepartureTime: '16:40',
    track: '6',
    platform: '6',
    checkInGate: '-',
    exitGate: '+54',
    formation: '16',
    formationDirection: '南',
    formationOrder: '↓',
    lateInfo: '+05',
    checkInStartTime: '16:00',
    checkInEndTime: '16:30',
    devices: {
      gate: { abnormal: 1, completed: 4, total: 5 },
      guide: { abnormal: 0, completed: 8, total: 12 },
      broadcast: { abnormal: 0, completed: 9, total: 9 }
    },
    operations: {
      water: { abnormal: 0, completed: 0, total: 0 },
      sewage: { abnormal: 0, completed: 0, total: 0 },
      parcel: { abnormal: 0, completed: 0, total: 0 },
      meal: { abnormal: 0, completed: 0, total: 0 },
      overcrowd: { abnormal: 0, completed: 1, total: 1 }
    },
    platformOperations: {
      arrival: { abnormal: 0, completed: 8, total: 8 },
      departure: { abnormal: 0, completed: 7, total: 8 }
    },
    connection: {
      time: '12',
      risk: true,
      riskLevel: 'D',
      special: false
    },
    passengerFlow: {
      boarding: 876
    }
  },
  {
    id: '5',
    arrivalTrainNo: 'G666',
    departureTrainNo: '0G666',
    arrivalStatus: 'on_time',
    departureStatus: 'stopped',
    departureStation: '北京西',
    arrivalStation: '重庆东',
    trainType: 'terminus',
    arrivalRouteFrom: '北京西',
    arrivalRouteTo: '重庆东',
    departureRouteFrom: '重庆东',
    departureRouteTo: '重庆西',
    arrivalTime: '18:00',
    actualArrivalTime: '',
    ctcArrivalTime: '17:55',
    departureTime: '18:30',
    actualDepartureTime: '',
    ctcDepartureTime: '',
    track: '5',
    platform: '5',
    checkInGate: 'A1/A2',
    exitGate: '8北',
    formation: '16',
    formationDirection: '北',
    formationOrder: '↑',
    lateInfo: '',
    checkInStartTime: '15:00',
    checkInEndTime: '15:30',
    departureTime: '18:30',
    devices: {
      gate: { abnormal: 0, completed: 5, total: 5 },
      guide: { abnormal: 0, completed: 8, total: 12 },
      broadcast: { abnormal: 0, completed: 9, total: 9 }
    },
    operations: {
      water: { abnormal: 0, completed: 5, total: 5 },
      sewage: { abnormal: 0, completed: 4, total: 6 },
      parcel: { abnormal: 0, completed: 3, total: 3 },
      meal: { abnormal: 0, completed: 0, total: 0 },
      overcrowd: { abnormal: 0, completed: 1, total: 1 }
    },
    platformOperations: {
      arrival: { abnormal: 0, completed: 6, total: 8 }
    },
    connection: {
      time: '30',
      risk: false,
      riskLevel: 'D',
      special: false
    },
    passengerFlow: {
      alighting: 723,
      transfer: 289
    }
  }
];

const ConnectionPlan: React.FC = () => {
  const [statsCollapsed, setStatsCollapsed] = useState(true);
  const [activeTimeFilter, setActiveTimeFilter] = useState('4h');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassengerTrain, setShowPassengerTrain] = useState(true);
  const [showNonPassengerTrain, setShowNonPassengerTrain] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainData | null>(null);
  const [isArrivalDrawer, setIsArrivalDrawer] = useState(true);
  const [operationDrawerVisible, setOperationDrawerVisible] = useState(false);
  const [selectedOperationTrain, setSelectedOperationTrain] = useState<TrainData | null>(null);
  const [operationType, setOperationType] = useState<'departure' | 'platform' | 'checkin'>('platform');
  const [isArrivalOperation, setIsArrivalOperation] = useState(true);
  const [timeAdjustDrawerVisible, setTimeAdjustDrawerVisible] = useState(false);
  const [selectedTimeTrain, setSelectedTimeTrain] = useState<TrainData | null>(null);
  const [timeAdjustIsArrival, setTimeAdjustIsArrival] = useState(true);
  const [broadcastDrawerVisible, setBroadcastDrawerVisible] = useState(false);
  const [selectedBroadcastTrain, setSelectedBroadcastTrain] = useState<TrainData | null>(null);
  const [isArrivalBroadcast, setIsArrivalBroadcast] = useState(true);
  const [guideDrawerVisible, setGuideDrawerVisible] = useState(false);
  const [routeDrawerVisible, setRouteDrawerVisible] = useState(false);
  const [selectedGuideTrain, setSelectedGuideTrain] = useState<TrainData | null>(null);
  const [isArrivalGuide, setIsArrivalGuide] = useState(true);
  const [passengerFlowDrawerVisible, setPassengerFlowDrawerVisible] = useState(false);
  const [selectedPassengerFlowTrain, setSelectedPassengerFlowTrain] = useState<TrainData | null>(null);
  const [isArrivalPassengerFlow, setIsArrivalPassengerFlow] = useState(true);
  const [formationDrawerVisible, setFormationDrawerVisible] = useState(false);
  const [selectedFormationTrain, setSelectedFormationTrain] = useState<TrainData | null>(null);
  const [isArrivalFormation, setIsArrivalFormation] = useState(true);
  
  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');

  const timeFilters = [
    { key: 'yesterday', label: '昨日' },
    { key: 'today', label: '今日' },
    { key: 'tomorrow', label: '明日' },
    { key: '4h', label: '4小时' }
  ];

  const handleRefresh = () => {
    console.log('刷新数据');
  };

  const handleConfig = () => {
    console.log('打开界面配置');
  };

  const handleSpecialConfig = () => {
    console.log('打开专运配置');
  };

  const handleTrainClick = (train: TrainData, isArrival: boolean) => {
    const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');
    if (isInspection(isArrival ? train.arrivalTrainNo : train.departureTrainNo)) {
      return;
    }
    setSelectedTrain(train);
    setIsArrivalDrawer(isArrival);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleSwitchTrain = (train: TrainData, isArrival: boolean) => {
    setSelectedTrain(train);
    setIsArrivalDrawer(isArrival);
  };

  const handleSwitchGuideTrain = (train: TrainData, isArrival: boolean) => {
    setSelectedGuideTrain(train);
    setIsArrivalGuide(isArrival);
  };

  const handleOperationClick = (train: TrainData, type: 'departure' | 'platform' | 'checkin', isArrival: boolean) => {
    setSelectedOperationTrain(train);
    setOperationType(type);
    setIsArrivalOperation(isArrival);
    setOperationDrawerVisible(true);
  };

  const handleCloseOperationDrawer = () => {
    setOperationDrawerVisible(false);
  };

  const handleSwitchOperationTrain = (train: TrainData, isArrival: boolean) => {
    setSelectedOperationTrain(train);
    setIsArrivalOperation(isArrival);
  };

  const handleTimeAdjustClick = (train: TrainData, isArrival: boolean) => {
    const isInspection = (trainNo: string) => 
      trainNo.startsWith('0') || 
      trainNo.startsWith('DJ') ||
      trainNo.startsWith('入') ||
      trainNo.startsWith('出') ||
      trainNo.startsWith('CR');
    
    const trainNo = isArrival ? train.arrivalTrainNo : train.departureTrainNo;
    if (isInspection(trainNo)) {
      return;
    }
    
    setSelectedTimeTrain(train);
    setTimeAdjustIsArrival(isArrival);
    setTimeAdjustDrawerVisible(true);
  };

  const handleSwitchTimeAdjustTrain = (train: TrainData, isArrival: boolean) => {
    setTimeAdjustIsArrival(isArrival);
  };

  const handleCloseTimeAdjustDrawer = () => {
    setTimeAdjustDrawerVisible(false);
  };

  const handleBroadcastClick = (train: TrainData, isArrival: boolean) => {
    setSelectedBroadcastTrain(train);
    setIsArrivalBroadcast(isArrival);
    setBroadcastDrawerVisible(true);
  };

  const handleCloseBroadcastDrawer = () => {
    setBroadcastDrawerVisible(false);
  };

  const handleGuideClick = (train: TrainData, isArrival: boolean) => {
    setSelectedGuideTrain(train);
    setIsArrivalGuide(isArrival);
    setGuideDrawerVisible(true);
  };

  const handleRouteClick = (train: TrainData, isArrival: boolean) => {
    setSelectedGuideTrain(train);
    setIsArrivalGuide(isArrival);
    setRouteDrawerVisible(true);
  };

  const handlePassengerFlowClick = (train: TrainData, isArrival: boolean) => {
    setSelectedPassengerFlowTrain(train);
    setIsArrivalPassengerFlow(isArrival);
    setPassengerFlowDrawerVisible(true);
  };

  const handleSwitchPassengerFlowTrain = (train: TrainData, isArrival: boolean) => {
    setSelectedPassengerFlowTrain(train);
    setIsArrivalPassengerFlow(isArrival);
  };

  const handleFormationClick = (train: TrainData, isArrival: boolean) => {
    setSelectedFormationTrain(train);
    setIsArrivalFormation(isArrival);
    setFormationDrawerVisible(true);
  };

  const handleSwitchFormationTrain = (train: TrainData, isArrival: boolean) => {
    setSelectedFormationTrain(train);
    setIsArrivalFormation(isArrival);
  };

  const handleCloseGuideDrawer = () => {
    setGuideDrawerVisible(false);
  };

  const handleSwitchBroadcastTrain = (train: TrainData, isArrival: boolean) => {
    setSelectedBroadcastTrain(train);
    setIsArrivalBroadcast(isArrival);
  };

  const getStatusColor = (status: DeviceStatus): string => {
    if (status.abnormal > 0) return 'red';
    if (status.completed > 0 && status.completed < status.total) return 'green';
    if (status.completed === status.total && status.total > 0) return 'blue';
    return 'gray';
  };

  const formatStatusText = (status: DeviceStatus): string => {
    if (status.total === 0) return '-';
    if (status.abnormal > 0) {
      return `${status.abnormal}/${status.completed}/${status.total}`;
    }
    return `${status.completed}/${status.total}`;
  };

  const renderPassengerFlow = (train: TrainData) => {
    const flow = train.passengerFlow;
    if (!flow) return <span style={{ color: '#ccc' }}>-</span>;
    const items: React.ReactNode[] = [];
    if (flow.boarding !== undefined) {
      items.push(
        <span key="board" className="pf-badge pf-badge-board">
          <span className="pf-circle">上</span>
          <span className="pf-num">{flow.boarding}</span>
        </span>
      );
    }
    if (flow.alighting !== undefined) {
      items.push(
        <span key="alight" className="pf-badge pf-badge-alight">
          <span className="pf-circle">下</span>
          <span className="pf-num">{flow.alighting}</span>
        </span>
      );
    }
    if (flow.transfer !== undefined) {
      items.push(
        <span key="xfer" className="pf-badge pf-badge-xfer">
          <span className="pf-circle">换</span>
          <span className="pf-num">{flow.transfer}</span>
        </span>
      );
    }
    return <div className="passenger-flow">{items}</div>;
  };

  const renderTimeCell = (scheduleTime: string, actualTime: string, ctcTime: string) => {
    const hasLate = actualTime && actualTime !== scheduleTime;
    const hasCtc = ctcTime && ctcTime !== scheduleTime;

    // 将时间字符串转换为分钟数用于正确比较
    const timeToMinutes = (time: string): number => {
      if (!time || time === '--:--') return 0;
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const isLate = hasLate && timeToMinutes(actualTime) > timeToMinutes(scheduleTime);

    return (
      <div className="time-cell-container">
        <div className="time-item scheduled">
          <span className="time-label-circle">图</span>
          <span className="time-value">{scheduleTime}</span>
        </div>
        {hasLate && (
          <div className="time-item actual">
            <span className="time-label-circle actual-label">实</span>
            <span className="time-value">{actualTime}</span>
            <span className={`late-indicator ${isLate ? 'late' : 'early'}`}>
              {isLate ? '+' : ''}{calculateTimeDiff(scheduleTime, actualTime)}
            </span>
          </div>
        )}
        {hasCtc && (
          <div className="time-item ctc">
            <span className="time-label-circle ctc-label">TD</span>
            <span className="time-value">{ctcTime}</span>
          </div>
        )}
      </div>
    );
  };

  const calculateTimeDiff = (schedule: string, actual: string) => {
    const [scheduleHour, scheduleMin] = schedule.split(':').map(Number);
    const [actualHour, actualMin] = actual.split(':').map(Number);
    const diffMin = (actualHour - scheduleHour) * 60 + (actualMin - scheduleMin);
    return Math.abs(diffMin).toString();
  };

  const getTrainTypeClass = (trainNo: string, isArrival: boolean, arrivalTrainNo: string, departureTrainNo: string): string => {
    if (trainNo.startsWith('0') || trainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (arrivalTrainNo === departureTrainNo) {
      return 'purple';
    }
    if (isArrival) {
      return 'cyan';
    }
    return 'yellow';
  };

  const getCheckInStatus = (train: TrainData): 'before' | 'checking' | 'stopped' | 'departed' => {
    const testTime = '15:30';
    const [currentHour, currentMin] = testTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMin;
    
    const [checkInStartHour, checkInStartMin] = train.checkInStartTime.split(':').map(Number);
    const checkInStartMinutes = checkInStartHour * 60 + checkInStartMin;
    
    const [checkInEndHour, checkInEndMin] = train.checkInEndTime.split(':').map(Number);
    const checkInEndMinutes = checkInEndHour * 60 + checkInEndMin;
    
    const [departureHour, departureMin] = train.departureTime.split(':').map(Number);
    const departureMinutes = departureHour * 60 + departureMin;

    if (currentMinutes < checkInStartMinutes) {
      return 'before';
    } else if (currentMinutes >= checkInStartMinutes && currentMinutes < checkInEndMinutes) {
      return 'checking';
    } else if (currentMinutes >= checkInEndMinutes && currentMinutes < departureMinutes) {
      return 'stopped';
    } else {
      return 'departed';
    }
  };

  // 获取地标颜色
  const getLandmarkColor = (formation: string, direction: string, order: string) => {
    const key = `${formation}${direction}${order}`;
    
    if (formation === '8') {
      if (order === '↑') {
        return '#007AFF'; // 蓝色
      } else {
        return '#9B59B6'; // 紫色
      }
    } else if (formation === '16') {
      if (order === '↑') {
        return '#F39C12'; // 黄色
      } else {
        return '#27AE60'; // 绿色
      }
    }
    return '#999'; // 默认灰色
  };

  const renderPlatformOperations = (train: TrainData) => {
    const { platformOperations, arrivalTrainNo, departureTrainNo } = train;
    const isThroughTrain = arrivalTrainNo === departureTrainNo;
    const isArrivalInspection = arrivalTrainNo.startsWith('0') || arrivalTrainNo.startsWith('DJ');
    const isDepartureInspection = departureTrainNo.startsWith('0') || departureTrainNo.startsWith('DJ');

    const hasArrivalOp = platformOperations?.arrival && platformOperations.arrival.total > 0;
    const hasDepartureOp = platformOperations?.departure && platformOperations.departure.total > 0;

    const renderProgressBar = (op: DeviceStatus, label: string) => {
      const percentage = op.total > 0 ? (op.completed / op.total) * 100 : 0;
      return (
        <div className="platform-op-item">
          <span className="platform-op-label">{label}</span>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
          </div>
          <span className="platform-op-value">{op.completed}/{op.total}</span>
        </div>
      );
    };

    if (isThroughTrain) {
      if (hasArrivalOp) {
        return renderProgressBar(platformOperations!.arrival!, '站台作业');
      }
      if (hasDepartureOp) {
        return renderProgressBar(platformOperations!.departure!, '站台作业');
      }
      return null;
    }

    if (isArrivalInspection) {
      if (hasDepartureOp) {
        return renderProgressBar(platformOperations!.departure!, '离站作业');
      }
      return null;
    }

    if (isDepartureInspection) {
      if (hasArrivalOp) {
        return renderProgressBar(platformOperations!.arrival!, '到站作业');
      }
      return null;
    }

    const items = [];
    if (hasArrivalOp) {
      items.push(renderProgressBar(platformOperations!.arrival!, '到站'));
    }
    if (hasDepartureOp) {
      items.push(renderProgressBar(platformOperations!.departure!, '离站'));
    }
    return <div className="platform-op-container">{items}</div>;
  };

  const getPlatformIsArrival = (train: TrainData): boolean => {
    const { platformOperations, arrivalTrainNo, departureTrainNo } = train;
    if (arrivalTrainNo === departureTrainNo) return true;
    const isArrivalInspection = arrivalTrainNo.startsWith('0') || arrivalTrainNo.startsWith('DJ');
    const isDepartureInspection = departureTrainNo.startsWith('0') || departureTrainNo.startsWith('DJ');
    if (isArrivalInspection) return false;
    if (isDepartureInspection) return true;
    return true;
  };

  const renderTrainOperations = (train: TrainData, isArrival: boolean) => {
    const isThroughTrain = train.arrivalTrainNo === train.departureTrainNo;
    const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');
    
    if (isInspection(isArrival ? train.arrivalTrainNo : train.departureTrainNo)) {
      return null;
    }
    
    if (isThroughTrain && !isArrival) {
      return null;
    }
    
    const operations = train.operations;
    const icons = [];
    
    if (operations.water.total > 0) {
      icons.push(<span key="water" className="op-icon water" title="上水">💧</span>);
    }
    if (operations.sewage.total > 0) {
      icons.push(<span key="sewage" className="op-icon sewage" title="吸污">🗑️</span>);
    }
    if (operations.parcel.total > 0) {
      icons.push(<span key="parcel" className="op-icon parcel" title="行包快运">📦</span>);
    }
    if (operations.overcrowd.abnormal > 0) {
      icons.push(<span key="overcrowd" className="op-icon overcrowd" title="超员"><span className="circle-icon">超</span></span>);
    }
    if (train.connection.risk) {
      icons.push(<span key="risk" className={`op-icon risk risk-${train.connection.riskLevel.toLowerCase()}`} title={`风险等级${train.connection.riskLevel}`}><span className="circle-icon">{train.connection.riskLevel}</span></span>);
    }
    if (train.connection.special) {
      icons.push(<span key="special" className="op-icon special" title="重点">⭐</span>);
    }
    
    if (icons.length === 0) {
      return null;
    }
    
    return (
      <div className="train-ops-row">
        {icons}
      </div>
    );
  };

  const renderDeviceStatus = (status: DeviceStatus) => {
    if (status.total === 0) {
      return null;
    }
    
    const color = getStatusColor(status);
    const percentage = status.total > 0 ? (status.completed / status.total) * 100 : 0;
    
    return (
      <div className="device-progress-container">
        <span className={`device-status-text ${color}`}>
          {status.completed}/{status.total}
        </span>
        <div className="device-progress-bar-container">
          <div className={`device-progress-bar ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="connection-plan-container">
      <div className={`stats-header ${statsCollapsed ? 'collapsed' : ''}`}>
        <div 
          className="collapse-btn"
          onClick={() => setStatsCollapsed(!statsCollapsed)}
        >
          <svg 
            className={`collapse-icon ${statsCollapsed ? 'rotated' : ''}`} 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <div className="stats-content">
          <div className="stat-card blue-theme">
            <div className="stat-title">开行计划</div>
            <div className="stat-sub-row">
              <span className="stat-label">昨日</span>
              <span className="stat-label">当前未到站</span>
              <span className="stat-label">今日</span>
            </div>
            <div className="stat-values">
              <span className="stat-value">{mockStats.operationPlan.yesterday}</span>
              <span className="stat-value highlight">{mockStats.operationPlan.currentPending}</span>
              <span className="stat-value">{mockStats.operationPlan.today}</span>
            </div>
          </div>

          <div className="stat-card orange-theme">
            <div className="stat-title">重点计划</div>
            <div className="stat-sub-row">
              <span className="stat-label">上水</span>
              <span className="stat-label">吸污</span>
              <span className="stat-label">行包</span>
              <span className="stat-label">送餐</span>
              <span className="stat-label">折返</span>
            </div>
            <div className="stat-values">
              <span className="stat-value">{mockStats.keyPlan.water}</span>
              <span className="stat-value">{mockStats.keyPlan.sewage}</span>
              <span className="stat-value">{mockStats.keyPlan.parcel}</span>
              <span className="stat-value">{mockStats.keyPlan.meal}</span>
              <span className="stat-value">{mockStats.keyPlan.turnaround}</span>
            </div>
          </div>

          <div className="stat-card risk-theme">
            <div className="stat-title">风险计划</div>
            <div className="stat-sub-row">
              <span className="stat-label">A类</span>
              <span className="stat-label">B类</span>
              <span className="stat-label">C类</span>
              <span className="stat-label">D类</span>
            </div>
            <div className="stat-values risk-values">
              <span className="risk-value risk-a">{mockStats.riskPlan.a}</span>
              <span className="risk-value risk-b">{mockStats.riskPlan.b}</span>
              <span className="risk-value risk-c">{mockStats.riskPlan.c}</span>
              <span className="risk-value risk-d">{mockStats.riskPlan.d}</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn" onClick={handleRefresh}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M4 22h7a4 4 0 0 0 4-4V14" />
              <polyline points="16 22 16 16 22 16" />
              <path d="M15 4a4 4 0 0 0-4 4v7H4" />
            </svg>
            <span>刷新</span>
          </button>
          <button className="action-btn" onClick={handleConfig}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>界面配置</span>
          </button>
          <button className="action-btn special-config" onClick={handleSpecialConfig}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>专运配置</span>
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="time-filters">
          {timeFilters.map(filter => (
            <button
              key={filter.key}
              className={`time-filter-btn ${activeTimeFilter === filter.key ? 'active' : ''}`}
              onClick={() => setActiveTimeFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showPassengerTrain}
              onChange={(e) => setShowPassengerTrain(e.target.checked)}
            />
            <span>动车</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showNonPassengerTrain}
              onChange={(e) => setShowNonPassengerTrain(e.target.checked)}
            />
            <span>非动车</span>
          </label>
        </div>

        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="请输入查询内容"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="train-table">
          <thead>
            <tr>
              <th colSpan={10} className="section-header">到站车次盯控</th>
              <th colSpan={4} className="section-header">接续作业</th>
              <th colSpan={10} className="section-header">离站车次盯控</th>
            </tr>
            <tr>
              <th className="col-serial">序号</th>
              <th>闸机</th>
              <th>引导</th>
              <th>广播</th>
              <th>出站作业</th>
              <th>运行区间</th>
              <th>当前站</th>
              <th>编组</th>
              <th>到站时间</th>
              <th>到站车次</th>
              <th>股道</th>
              <th>站台作业</th>
              <th>接续时间</th>
              <th>客流信息</th>
              <th>接续车次</th>
              <th>发车时间</th>
              <th>编组</th>
              <th>运行区间</th>
              <th>检票时间</th>
              <th>检票口</th>
              <th>检票作业</th>
              <th>广播</th>
              <th>引导</th>
              <th>闸机</th>
            </tr>
          </thead>
          <tbody>
            {mockTrainData.map((train, index) => {
              const checkInStatus = getCheckInStatus(train);
              const departureBgClass = isInspection(train.departureTrainNo) ? '' :
                checkInStatus === 'checking' ? 'bg-checking' : 
                checkInStatus === 'stopped' ? 'bg-stopped' : 
                checkInStatus === 'departed' ? 'bg-departed' : '';
              
              return (
                <tr key={train.id}>
                  <td className="col-serial">{index + 1}</td>
                  <td className="device-cell">{isInspection(train.arrivalTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.devices.gate)}</td>
                  <td 
                    className="device-cell"
                    onClick={() => !isInspection(train.arrivalTrainNo) && handleGuideClick(train, false)}
                    style={{ cursor: isInspection(train.arrivalTrainNo) ? 'default' : 'pointer' }}
                  >{isInspection(train.arrivalTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.devices.guide)}</td>
                  <td 
                    className="device-cell"
                    onClick={() => !isInspection(train.arrivalTrainNo) && handleBroadcastClick(train, false)}
                    style={{ cursor: isInspection(train.arrivalTrainNo) ? 'default' : 'pointer' }}
                  >{isInspection(train.arrivalTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.devices.broadcast)}</td>
                  <td 
                    className="device-cell"
                    onClick={() => handleOperationClick(train, 'departure', true)}
                    style={{ cursor: 'pointer' }}
                  >{renderDeviceStatus(train.operations.water)}</td>
                  <td 
                    className="route-cell"
                    onClick={() => train.arrivalRouteFrom && handleRouteClick(train, true)}
                    style={{ cursor: train.arrivalRouteFrom ? 'pointer' : 'default' }}
                  >
                    <div className="route-info">
                      <span className="route-from">{train.arrivalRouteFrom || '-'}</span>
                      <span className="route-arrow">→</span>
                      <span className="route-to">{train.arrivalRouteTo || '-'}</span>
                    </div>
                  </td>
                  <td className="station-cell">{train.arrivalStation}</td>
                  <td className="formation-cell">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span>{train.formation}{train.formationDirection}{train.formationOrder}</span>
                      <span style={{
                        width: '60px',
                        height: '8px',
                        borderRadius: '4px',
                        background: getLandmarkColor(train.formation, train.formationDirection, train.formationOrder)
                      }} />
                    </div>
                  </td>
                  <td 
                    className="time-cell"
                    onClick={() => handleTimeAdjustClick(train, true)}
                    style={{ cursor: 'pointer' }}
                  >{renderTimeCell(train.arrivalTime, train.actualArrivalTime, train.ctcArrivalTime)}</td>
                  <td 
                    className="train-no-cell"
                    onClick={() => handleTrainClick(train, true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="train-no-content">
                      <span className={`train-pill ${getTrainTypeClass(train.arrivalTrainNo, true, train.arrivalTrainNo, train.departureTrainNo)}`}>
                        {train.arrivalTrainNo}
                      </span>
                      {renderTrainOperations(train, true)}
                    </div>
                  </td>
                  <td
                    className={`track-cell ${train.track.includes('→') ? 'track-changed' : ''}`}
                    onClick={() => handleFormationClick(train, getPlatformIsArrival(train))}
                    style={{ cursor: 'pointer' }}
                  >{train.track}</td>
                  <td 
                    className="platform-op-cell"
                    onClick={() => handleOperationClick(train, 'platform', getPlatformIsArrival(train))}
                    style={{ cursor: 'pointer' }}
                  >{renderPlatformOperations(train)}</td>
                  <td className="conn-time-cell">{train.connection.time}</td>
                  <td 
                    className="passenger-flow-cell"
                    onClick={() => handlePassengerFlowClick(train, getPlatformIsArrival(train))}
                    style={{ cursor: 'pointer' }}
                  >{renderPassengerFlow(train)}</td>
                  <td 
                    className={`train-no-cell ${departureBgClass}`}
                    onClick={() => train.departureTrainNo && handleTrainClick(train, false)}
                    style={{ cursor: train.departureTrainNo ? 'pointer' : 'default' }}
                  >
                    <div className="train-no-content">
                      {train.departureTrainNo ? (
                        <>
                          <span className={`train-pill ${getTrainTypeClass(train.departureTrainNo, false, train.arrivalTrainNo, train.departureTrainNo)}`}>
                            {train.departureTrainNo}
                          </span>
                          {renderTrainOperations(train, false)}
                        </>
                      ) : (
                        <span style={{ color: '#999', fontSize: '14px' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td 
                    className={`time-cell ${departureBgClass}`}
                    onClick={() => handleTimeAdjustClick(train, false)}
                    style={{ cursor: 'pointer' }}
                  >{renderTimeCell(train.departureTime, train.actualDepartureTime, train.ctcDepartureTime)}</td>
                  <td className={`formation-cell ${departureBgClass}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span>{train.formation}{train.formationDirection}{train.formationOrder}</span>
                      <span style={{
                        width: '60px',
                        height: '8px',
                        borderRadius: '4px',
                        background: getLandmarkColor(train.formation, train.formationDirection, train.formationOrder)
                      }} />
                    </div>
                  </td>
                  <td 
                    className={`route-cell ${departureBgClass}`}
                    onClick={() => train.departureRouteFrom && handleRouteClick(train, false)}
                    style={{ cursor: train.departureRouteFrom ? 'pointer' : 'default' }}
                  >
                    <div className="route-info">
                      <span className="route-from">{train.departureRouteFrom || '-'}</span>
                      <span className="route-arrow">→</span>
                      <span className="route-to">{train.departureRouteTo || '-'}</span>
                    </div>
                  </td>
                  <td 
                    className={`checkin-time-cell ${departureBgClass}`}
                    onClick={() => handleTimeAdjustClick(train, false)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isInspection(train.departureTrainNo) ? (
                      <span style={{ color: '#ccc' }}>-</span>
                    ) : (
                      <div className="checkin-time-container">
                        <div className="checkin-item">
                          <span className="checkin-label-circle open-label">开</span>
                          <span className="checkin-value">{train.checkInStartTime}</span>
                        </div>
                        <div className="checkin-item">
                          <span className="checkin-label-circle stop-label">停</span>
                          <span className="checkin-value">{train.checkInEndTime}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className={`gate-cell ${departureBgClass}`}>
                    {isInspection(train.departureTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : train.checkInGate}
                  </td>
                  <td 
                    className={`device-cell ${departureBgClass}`}
                    onClick={() => !isInspection(train.departureTrainNo) && handleOperationClick(train, 'checkin', false)}
                    style={{ cursor: isInspection(train.departureTrainNo) ? 'default' : 'pointer' }}
                  >{isInspection(train.departureTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.operations.water)}</td>
                  <td 
                    className={`device-cell ${departureBgClass}`}
                    onClick={() => !isInspection(train.departureTrainNo) && handleBroadcastClick(train, true)}
                    style={{ cursor: isInspection(train.departureTrainNo) ? 'default' : 'pointer' }}
                  >{isInspection(train.departureTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.devices.broadcast)}</td>
                  <td 
                    className={`device-cell ${departureBgClass}`}
                    onClick={() => !isInspection(train.departureTrainNo) && handleGuideClick(train, true)}
                    style={{ cursor: isInspection(train.departureTrainNo) ? 'default' : 'pointer' }}
                  >{isInspection(train.departureTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.devices.guide)}</td>
                  <td className={`device-cell ${departureBgClass}`}>
                    {isInspection(train.departureTrainNo) ? <span style={{ color: '#ccc' }}>-</span> : renderDeviceStatus(train.devices.gate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <TrainServiceDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        train={selectedTrain}
        isArrival={isArrivalDrawer}
        onSwitchTrain={handleSwitchTrain}
      />
      
      <OperationDrawer
        visible={operationDrawerVisible}
        onClose={handleCloseOperationDrawer}
        train={selectedOperationTrain}
        operationType={operationType}
        onSwitchTrain={handleSwitchOperationTrain}
        isArrival={isArrivalOperation}
      />
      
      <TimeAdjustDrawer
        visible={timeAdjustDrawerVisible}
        onClose={handleCloseTimeAdjustDrawer}
        train={selectedTimeTrain}
        isArrival={timeAdjustIsArrival}
        onSwitchTrain={handleSwitchTimeAdjustTrain}
      />
      
      <BroadcastDrawer
        visible={broadcastDrawerVisible}
        onClose={handleCloseBroadcastDrawer}
        train={selectedBroadcastTrain}
        onSwitchTrain={handleSwitchBroadcastTrain}
        isArrival={isArrivalBroadcast}
      />
      
      <GuideDrawer
        visible={guideDrawerVisible}
        onClose={handleCloseGuideDrawer}
        train={selectedGuideTrain}
        isArrival={isArrivalGuide}
        onSwitchTrain={handleSwitchGuideTrain}
      />

      <RouteDrawer
        visible={routeDrawerVisible}
        onClose={() => setRouteDrawerVisible(false)}
        train={selectedGuideTrain}
        isArrival={isArrivalGuide}
        onSwitchTrain={handleSwitchGuideTrain}
      />

      <PassengerFlowDrawer
        visible={passengerFlowDrawerVisible}
        onClose={() => setPassengerFlowDrawerVisible(false)}
        train={selectedPassengerFlowTrain}
        isArrival={isArrivalPassengerFlow}
        onSwitchTrain={handleSwitchPassengerFlowTrain}
      />

      <FormationDrawer
        visible={formationDrawerVisible}
        onClose={() => setFormationDrawerVisible(false)}
        train={selectedFormationTrain}
        isArrival={isArrivalFormation}
        onSwitchTrain={handleSwitchFormationTrain}
      />
    </div>
  );
};

export default ConnectionPlan;
