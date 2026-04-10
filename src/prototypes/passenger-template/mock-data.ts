export interface LifecycleRecord {
  version: string;
  date: string;
  type: 'enable' | 'daily' | 'diagram' | 'disable';
  description: string;
  changes: {
    field: string;
    oldValue?: string;
    newValue?: string;
    changeType: 'add' | 'remove' | 'modify' | 'none';
  }[];
}

export interface BasicInfo {
  model: string;
  formationCount: number;
  formationDirection: string;
  track: string;
  direction: 'up' | 'down';
}

export interface OperationRules {
  operationCycle: number;
  orderMaintenance: boolean;
  modelMaintenance: boolean;
  trackMaintenance: boolean;
}

export interface RelatedPlans {
  checkInPlan: string;
  screenPlan: string;
  broadcastPlan: string;
  schedulePlan: string;
}

export interface AutoMatchRules {
  model: string[];
  formationCount: number[];
  formationDirection: string[];
  stopTime: number[];
  direction: ('up' | 'down')[];
}

export interface OperationDay {
  date: string;
  isRunning: boolean;
  changeVersion?: string;
  changeType?: 'enable' | 'daily' | 'diagram' | 'disable';
}

export interface StationInfo {
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  stopTime: string;
  track: string;
  platform: string;
  isOrigin: boolean;
  isTerminal: boolean;
}

export interface EditConfig {
  station: string;
  trainType: 'origin' | 'passing' | 'terminal';
  isSync: boolean;
  arrivalTrainNo: string;
  departureTrainNo: string;
  originTrainNo: string;
  originStation: string;
  terminalStation: string;
  checkInTime基准: string;
  checkInStopTime基准: string;
  checkInTimeOffset: number;
  checkInStopTimeOffset: number;
  checkOutTimeOffset: number;
  trainModel: string;
  trainFormation: number;
  trainCapacity?: string;
  parkingPosition: string;
  inboundDirection: string;
  outboundDirection: string;
  formationDirection: string;
  isValid: boolean;
  trainMode: 'auto' | 'manual';
  startValidDate: string;
  endValidDate?: string;
  syncOriginStationName: string;
  syncTerminalStationName: string;
  originDepartureTime: string;
  terminalArrivalTime: string;
  operationType: string;
  operationCycle: number;
  operationRule: number;
  connectedTrain?: string;
  statusTag?: string;
  broadcastTemplateGroup?: string;
  originStationDistanceDays: number;
  terminalStationDistanceDays: number;
  basicDiagramNo: string;
  platforms: string[];
  waitingRooms: string[];
  exitGates: string[];
  checkInPlan: string;
  screenPlan: string;
  broadcastPlan: string;
  schedulePlan: string;
}

export interface PassengerTrain {
  id: string;
  trainNo: string;
  trainType: 'highspeed' | 'normal';
  trainTypeDetail: 'origin' | 'passing' | 'terminal';
  source: 'basic' | 'ticket' | 'dispatch' | 'manual';
  status: 'enabled' | 'running' | 'changed' | 'disabled';
  currentVersion: string;
  startDate: string;
  endDate?: string;
  lifecycle: LifecycleRecord[];
  operationDays: OperationDay[];
  basicInfo: BasicInfo;
  operationRules: OperationRules;
  relatedPlans: RelatedPlans;
  autoMatchRules: AutoMatchRules;
  editConfig: EditConfig;
  stations: StationInfo[];
}

function generateOperationDays(startDate: string, endDate: string, lifecycle: LifecycleRecord[]): OperationDay[] {
  const days: OperationDay[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const record = lifecycle.find(r => r.date === dateStr);

    days.push({
      date: dateStr,
      isRunning: true,
      changeVersion: record?.version,
      changeType: record?.type,
    });
  }

  return days;
}

export function mockPassengerTemplateTrains(): PassengerTrain[] {
  const train1Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-01-01',
      type: 'enable',
      description: '车次启用，初始版本',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CRH380', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '8', changeType: 'add' },
        { field: '股道', oldValue: undefined, newValue: '3道', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-01-15',
      type: 'daily',
      description: '日常调度：调整股道',
      changes: [
        { field: '股道', oldValue: '3道', newValue: '5道', changeType: 'modify' },
      ],
    },
    {
      version: 'v1.2',
      date: '2026-02-01',
      type: 'diagram',
      description: '春运调图：批量变更',
      changes: [
        { field: '车型', oldValue: 'CRH380', newValue: 'CR400AF', changeType: 'modify' },
        { field: '编组数', oldValue: '8', newValue: '16', changeType: 'modify' },
        { field: '上水作业', oldValue: '无', newValue: '有', changeType: 'add' },
      ],
    },
    {
      version: 'v1.3',
      date: '2026-02-10',
      type: 'daily',
      description: '日常调度：调整上水作业',
      changes: [
        { field: '上水时间', oldValue: '5分钟', newValue: '8分钟', changeType: 'modify' },
      ],
    },
  ];

  const train2Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-01-15',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CRH3C', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '8', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-02-15',
      type: 'daily',
      description: '日常调度：调整编组方向',
      changes: [
        { field: '编组方向', oldValue: '正向', newValue: '倒向', changeType: 'modify' },
      ],
    },
    {
      version: 'v1.2',
      date: '2026-03-01',
      type: 'diagram',
      description: '春季调图：批量变更',
      changes: [
        { field: '吸污作业', oldValue: '无', newValue: '有', changeType: 'add' },
      ],
    },
  ];

  const train3Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-02-01',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: '25G', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '18', changeType: 'add' },
      ],
    },
  ];

  const train4Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2025-12-01',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: '25T', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-03-15',
      type: 'disable',
      description: '车次停运',
      changes: [
        { field: '状态', oldValue: '运行中', newValue: '已停运', changeType: 'remove' },
      ],
    },
  ];

  const train5Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-01-20',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CRH2A', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '8', changeType: 'add' },
      ],
    },
  ];

  const train6Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-02-10',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CRH380B', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '16', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-02-20',
      type: 'daily',
      description: '日常调度：调整站台',
      changes: [
        { field: '站台', oldValue: '2站台', newValue: '5站台', changeType: 'modify' },
      ],
    },
  ];

  const train7Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-01-05',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CR400BF', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '8', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-01-25',
      type: 'diagram',
      description: '春运调图：批量变更',
      changes: [
        { field: '编组数', oldValue: '8', newValue: '16', changeType: 'modify' },
      ],
    },
  ];

  const train8Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-03-01',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: '25K', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '18', changeType: 'add' },
      ],
    },
  ];

  const train9Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-02-15',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CRH1A', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '8', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-03-01',
      type: 'daily',
      description: '日常调度：调整股道',
      changes: [
        { field: '股道', oldValue: '3道', newValue: '7道', changeType: 'modify' },
      ],
    },
    {
      version: 'v1.2',
      date: '2026-03-10',
      type: 'changed',
      description: '变更中：等待确认',
      changes: [
        { field: '车型', oldValue: 'CRH1A', newValue: 'CRH2A', changeType: 'modify' },
      ],
    },
  ];

  const train10Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-01-10',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: '25G', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '16', changeType: 'add' },
      ],
    },
  ];

  const train11Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-02-05',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CRH5A', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '8', changeType: 'add' },
      ],
    },
    {
      version: 'v1.1',
      date: '2026-02-25',
      type: 'diagram',
      description: '春季调图：批量变更',
      changes: [
        { field: '股道', oldValue: '4道', newValue: '8道', changeType: 'modify' },
        { field: '上水作业', oldValue: '无', newValue: '有', changeType: 'add' },
      ],
    },
  ];

  const train12Lifecycle: LifecycleRecord[] = [
    {
      version: 'v1.0',
      date: '2026-03-05',
      type: 'enable',
      description: '车次启用',
      changes: [
        { field: '车型', oldValue: undefined, newValue: 'CR400AF', changeType: 'add' },
        { field: '编组数', oldValue: undefined, newValue: '16', changeType: 'add' },
      ],
    },
  ];

  return [
    {
      id: '1',
      trainNo: 'G1234',
      trainType: 'highspeed',
      trainTypeDetail: 'origin',
      source: 'basic',
      status: 'running',
      currentVersion: 'v1.3',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      lifecycle: train1Lifecycle,
      operationDays: generateOperationDays('2026-01-01', '2026-03-31', train1Lifecycle),
      basicInfo: {
        model: 'CR400AF',
        formationCount: 16,
        formationDirection: '正向',
        track: '5道',
        direction: 'up',
      },
      operationRules: {
        operationCycle: 1,
        orderMaintenance: true,
        modelMaintenance: true,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划A',
        screenPlan: '上屏计划B',
        broadcastPlan: '广播计划C',
        schedulePlan: '排班计划D',
      },
      autoMatchRules: {
        model: ['CR400AF', 'CRH380'],
        formationCount: [8, 16],
        formationDirection: ['正向'],
        stopTime: [5, 8, 10],
        direction: ['up'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'origin',
        isSync: true,
        arrivalTrainNo: 'G1234',
        departureTrainNo: 'G1234',
        originTrainNo: 'G1234',
        originStation: '重庆东',
        terminalStation: '汕头',
        checkInTime基准: '发点',
        checkInStopTime基准: '发点',
        checkInTimeOffset: -16,
        checkInStopTimeOffset: -3,
        checkOutTimeOffset: 1,
        trainModel: 'CR400AF',
        trainFormation: 8,
        parkingPosition: '东（北）',
        inboundDirection: '西（南）',
        outboundDirection: '西（南）',
        formationDirection: '倒序',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-01-26',
        endValidDate: '2026-04-09',
        syncOriginStationName: '重庆东',
        syncTerminalStationName: '汕头',
        originDepartureTime: '08:27',
        terminalArrivalTime: '21:37',
        operationType: '每日开行',
        operationCycle: 1,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260112',
        platforms: ['4站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝厦场南侧出站口'],
        checkInPlan: '开检计划A',
        screenPlan: '上屏计划B',
        broadcastPlan: '广播计划C',
        schedulePlan: '排班计划D',
      },
      stations: [
        {
          stationName: '重庆东',
          arrivalTime: '08:27',
          departureTime: '08:27',
          stopTime: '0',
          track: '4',
          platform: '4站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '遵义',
          arrivalTime: '09:45',
          departureTime: '09:48',
          stopTime: '3',
          track: '3',
          platform: '3站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '贵阳北',
          arrivalTime: '10:30',
          departureTime: '10:35',
          stopTime: '5',
          track: '8',
          platform: '8站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '汕头',
          arrivalTime: '21:37',
          departureTime: '21:37',
          stopTime: '0',
          track: '6',
          platform: '6站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '2',
      trainNo: 'G5678',
      trainType: 'highspeed',
      trainTypeDetail: 'passing',
      source: 'ticket',
      status: 'changed',
      currentVersion: 'v1.2',
      startDate: '2026-01-15',
      endDate: '2026-06-30',
      lifecycle: train2Lifecycle,
      operationDays: generateOperationDays('2026-01-15', '2026-06-30', train2Lifecycle),
      basicInfo: {
        model: 'CRH3C',
        formationCount: 8,
        formationDirection: '倒向',
        track: '4道',
        direction: 'down',
      },
      operationRules: {
        operationCycle: 2,
        orderMaintenance: true,
        modelMaintenance: false,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划E',
        screenPlan: '上屏计划F',
        broadcastPlan: '广播计划G',
        schedulePlan: '排班计划H',
      },
      autoMatchRules: {
        model: ['CRH3C'],
        formationCount: [8],
        formationDirection: ['倒向'],
        stopTime: [3, 5],
        direction: ['down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'passing',
        isSync: true,
        arrivalTrainNo: 'G5677',
        departureTrainNo: 'G5678',
        originTrainNo: 'G5677',
        originStation: '成都东',
        terminalStation: '武汉',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: -5,
        checkInStopTimeOffset: -2,
        checkOutTimeOffset: 3,
        trainModel: 'CRH3C',
        trainFormation: 8,
        parkingPosition: '西（南）',
        inboundDirection: '东（北）',
        outboundDirection: '东（北）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-01-15',
        endValidDate: '2026-06-30',
        syncOriginStationName: '成都东',
        syncTerminalStationName: '武汉',
        originDepartureTime: '07:00',
        terminalArrivalTime: '12:30',
        operationType: '每日开行',
        operationCycle: 2,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260115',
        platforms: ['2站台'],
        waitingRooms: ['候车大厅', '商务候车室'],
        exitGates: ['渝场北侧出站口'],
      },
      stations: [
        {
          stationName: '成都东',
          arrivalTime: '07:00',
          departureTime: '07:00',
          stopTime: '0',
          track: '1',
          platform: '1站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '08:15',
          departureTime: '08:20',
          stopTime: '5',
          track: '2',
          platform: '2站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '武汉',
          arrivalTime: '12:30',
          departureTime: '12:30',
          stopTime: '0',
          track: '5',
          platform: '5站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '3',
      trainNo: 'K1234',
      trainType: 'normal',
      trainTypeDetail: 'terminal',
      source: 'dispatch',
      status: 'enabled',
      currentVersion: 'v1.0',
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      lifecycle: train3Lifecycle,
      operationDays: generateOperationDays('2026-02-01', '2026-12-31', train3Lifecycle),
      basicInfo: {
        model: '25G',
        formationCount: 18,
        formationDirection: '正向',
        track: '8道',
        direction: 'up',
      },
      operationRules: {
        operationCycle: 7,
        orderMaintenance: false,
        modelMaintenance: true,
        trackMaintenance: false,
      },
      relatedPlans: {
        checkInPlan: '开检计划I',
        screenPlan: '上屏计划J',
        broadcastPlan: '广播计划K',
        schedulePlan: '排班计划L',
      },
      autoMatchRules: {
        model: ['25G', '25K'],
        formationCount: [16, 18, 20],
        formationDirection: ['正向', '倒向'],
        stopTime: [10, 15, 20],
        direction: ['up', 'down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'terminal',
        isSync: false,
        arrivalTrainNo: 'K1234',
        departureTrainNo: 'K1234',
        originTrainNo: 'K1234',
        originStation: '广州',
        terminalStation: '重庆东',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: 10,
        checkInStopTimeOffset: 5,
        checkOutTimeOffset: 0,
        trainModel: '25G',
        trainFormation: 18,
        parkingPosition: '东（北）',
        inboundDirection: '西（南）',
        outboundDirection: '西（南）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'manual',
        startValidDate: '2026-02-01',
        endValidDate: '2026-12-31',
        syncOriginStationName: '广州',
        syncTerminalStationName: '重庆东',
        originDepartureTime: '18:00',
        terminalArrivalTime: '06:30',
        operationType: '每日开行',
        operationCycle: 7,
        operationRule: 1,
        originStationDistanceDays: 1,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260201',
        platforms: ['10站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场南侧出站口'],
      },
      stations: [
        {
          stationName: '广州',
          arrivalTime: '18:00',
          departureTime: '18:00',
          stopTime: '0',
          track: '3',
          platform: '3站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '柳州',
          arrivalTime: '23:45',
          departureTime: '23:55',
          stopTime: '10',
          track: '6',
          platform: '6站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '06:30',
          departureTime: '06:30',
          stopTime: '0',
          track: '10',
          platform: '10站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '4',
      trainNo: 'Z5678',
      trainType: 'normal',
      trainTypeDetail: 'passing',
      source: 'manual',
      status: 'disabled',
      currentVersion: 'v1.1',
      startDate: '2025-12-01',
      endDate: '2026-03-15',
      lifecycle: train4Lifecycle,
      operationDays: generateOperationDays('2025-12-01', '2026-03-15', train4Lifecycle),
      basicInfo: {
        model: '25T',
        formationCount: 18,
        formationDirection: '正向',
        track: '10道',
        direction: 'down',
      },
      operationRules: {
        operationCycle: 1,
        orderMaintenance: true,
        modelMaintenance: true,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划M',
        screenPlan: '上屏计划N',
        broadcastPlan: '广播计划O',
        schedulePlan: '排班计划P',
      },
      autoMatchRules: {
        model: ['25T'],
        formationCount: [18],
        formationDirection: ['正向'],
        stopTime: [8, 10],
        direction: ['down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'passing',
        isSync: false,
        arrivalTrainNo: 'Z5677',
        departureTrainNo: 'Z5678',
        originTrainNo: 'Z5677',
        originStation: '北京西',
        terminalStation: '昆明',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: 8,
        checkInStopTimeOffset: 3,
        checkOutTimeOffset: 2,
        trainModel: '25T',
        trainFormation: 18,
        parkingPosition: '西（南）',
        inboundDirection: '东（北）',
        outboundDirection: '东（北）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'manual',
        startValidDate: '2025-12-01',
        endValidDate: '2026-03-15',
        syncOriginStationName: '北京西',
        syncTerminalStationName: '昆明',
        originDepartureTime: '10:00',
        terminalArrivalTime: '14:30',
        operationType: '每日开行',
        operationCycle: 1,
        operationRule: 1,
        originStationDistanceDays: 1,
        terminalStationDistanceDays: 1,
        basicDiagramNo: '20251201',
        platforms: ['7站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场北侧出站口'],
      },
      stations: [
        {
          stationName: '北京西',
          arrivalTime: '10:00',
          departureTime: '10:00',
          stopTime: '0',
          track: '2',
          platform: '2站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '08:45',
          departureTime: '08:55',
          stopTime: '10',
          track: '7',
          platform: '7站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '昆明',
          arrivalTime: '14:30',
          departureTime: '14:30',
          stopTime: '0',
          track: '4',
          platform: '4站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '5',
      trainNo: 'D1234',
      trainType: 'highspeed',
      trainTypeDetail: 'origin',
      source: 'basic',
      status: 'enabled',
      currentVersion: 'v1.0',
      startDate: '2026-01-20',
      endDate: '2026-12-31',
      lifecycle: train5Lifecycle,
      operationDays: generateOperationDays('2026-01-20', '2026-12-31', train5Lifecycle),
      basicInfo: {
        model: 'CRH2A',
        formationCount: 8,
        formationDirection: '正向',
        track: '2道',
        direction: 'up',
      },
      operationRules: {
        operationCycle: 1,
        orderMaintenance: true,
        modelMaintenance: false,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划Q',
        screenPlan: '上屏计划R',
        broadcastPlan: '广播计划S',
        schedulePlan: '排班计划T',
      },
      autoMatchRules: {
        model: ['CRH2A', 'CRH2B'],
        formationCount: [8],
        formationDirection: ['正向'],
        stopTime: [3, 5],
        direction: ['up'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'origin',
        isSync: true,
        arrivalTrainNo: 'D1234',
        departureTrainNo: 'D1234',
        originTrainNo: 'D1234',
        originStation: '重庆东',
        terminalStation: '成都东',
        checkInTime基准: '发点',
        checkInStopTime基准: '发点',
        checkInTimeOffset: -10,
        checkInStopTimeOffset: -2,
        checkOutTimeOffset: 1,
        trainModel: 'CRH2A',
        trainFormation: 8,
        parkingPosition: '东（北）',
        inboundDirection: '西（南）',
        outboundDirection: '西（南）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-01-20',
        endValidDate: '2026-12-31',
        syncOriginStationName: '重庆东',
        syncTerminalStationName: '成都东',
        originDepartureTime: '07:30',
        terminalArrivalTime: '09:00',
        operationType: '每日开行',
        operationCycle: 1,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260120',
        platforms: ['2站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场南侧出站口'],
      },
      stations: [
        {
          stationName: '重庆东',
          arrivalTime: '07:30',
          departureTime: '07:30',
          stopTime: '0',
          track: '2',
          platform: '2站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '成都东',
          arrivalTime: '09:00',
          departureTime: '09:00',
          stopTime: '0',
          track: '5',
          platform: '5站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '6',
      trainNo: 'G2345',
      trainType: 'highspeed',
      trainTypeDetail: 'terminal',
      source: 'ticket',
      status: 'running',
      currentVersion: 'v1.1',
      startDate: '2026-02-10',
      endDate: '2026-12-31',
      lifecycle: train6Lifecycle,
      operationDays: generateOperationDays('2026-02-10', '2026-12-31', train6Lifecycle),
      basicInfo: {
        model: 'CRH380B',
        formationCount: 16,
        formationDirection: '正向',
        track: '6道',
        direction: 'down',
      },
      operationRules: {
        operationCycle: 2,
        orderMaintenance: false,
        modelMaintenance: true,
        trackMaintenance: false,
      },
      relatedPlans: {
        checkInPlan: '开检计划U',
        screenPlan: '上屏计划V',
        broadcastPlan: '广播计划W',
        schedulePlan: '排班计划X',
      },
      autoMatchRules: {
        model: ['CRH380B', 'CRH380BL'],
        formationCount: [16],
        formationDirection: ['正向', '倒向'],
        stopTime: [5, 8, 10],
        direction: ['down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'terminal',
        isSync: true,
        arrivalTrainNo: 'G2345',
        departureTrainNo: 'G2345',
        originTrainNo: 'G2345',
        originStation: '上海虹桥',
        terminalStation: '重庆东',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: 5,
        checkInStopTimeOffset: 2,
        checkOutTimeOffset: 0,
        trainModel: 'CRH380B',
        trainFormation: 16,
        parkingPosition: '西（南）',
        inboundDirection: '东（北）',
        outboundDirection: '东（北）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-02-10',
        endValidDate: '2026-12-31',
        syncOriginStationName: '上海虹桥',
        syncTerminalStationName: '重庆东',
        originDepartureTime: '08:00',
        terminalArrivalTime: '15:30',
        operationType: '每日开行',
        operationCycle: 2,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260210',
        platforms: ['5站台'],
        waitingRooms: ['候车大厅', '商务候车室'],
        exitGates: ['渝厦场北侧出站口'],
      },
      stations: [
        {
          stationName: '上海虹桥',
          arrivalTime: '08:00',
          departureTime: '08:00',
          stopTime: '0',
          track: '10',
          platform: '10站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '南京南',
          arrivalTime: '09:15',
          departureTime: '09:18',
          stopTime: '3',
          track: '8',
          platform: '8站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '15:30',
          departureTime: '15:30',
          stopTime: '0',
          track: '6',
          platform: '5站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '7',
      trainNo: 'G3456',
      trainType: 'highspeed',
      trainTypeDetail: 'passing',
      source: 'dispatch',
      status: 'running',
      currentVersion: 'v1.1',
      startDate: '2026-01-05',
      endDate: '2026-12-31',
      lifecycle: train7Lifecycle,
      operationDays: generateOperationDays('2026-01-05', '2026-12-31', train7Lifecycle),
      basicInfo: {
        model: 'CR400BF',
        formationCount: 16,
        formationDirection: '倒向',
        track: '9道',
        direction: 'up',
      },
      operationRules: {
        operationCycle: 1,
        orderMaintenance: true,
        modelMaintenance: true,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划Y',
        screenPlan: '上屏计划Z',
        broadcastPlan: '广播计划AA',
        schedulePlan: '排班计划AB',
      },
      autoMatchRules: {
        model: ['CR400BF', 'CR400AF'],
        formationCount: [8, 16],
        formationDirection: ['正向', '倒向'],
        stopTime: [5, 8],
        direction: ['up', 'down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'passing',
        isSync: false,
        arrivalTrainNo: 'G3455',
        departureTrainNo: 'G3456',
        originTrainNo: 'G3455',
        originStation: '西安北',
        terminalStation: '长沙南',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: -8,
        checkInStopTimeOffset: -1,
        checkOutTimeOffset: 2,
        trainModel: 'CR400BF',
        trainFormation: 16,
        parkingPosition: '东（北）',
        inboundDirection: '西（南）',
        outboundDirection: '西（南）',
        formationDirection: '倒向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-01-05',
        endValidDate: '2026-12-31',
        syncOriginStationName: '西安北',
        syncTerminalStationName: '长沙南',
        originDepartureTime: '06:00',
        terminalArrivalTime: '12:00',
        operationType: '每日开行',
        operationCycle: 1,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260105',
        platforms: ['9站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场南侧出站口'],
      },
      stations: [
        {
          stationName: '西安北',
          arrivalTime: '06:00',
          departureTime: '06:00',
          stopTime: '0',
          track: '3',
          platform: '3站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '09:30',
          departureTime: '09:35',
          stopTime: '5',
          track: '9',
          platform: '9站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '长沙南',
          arrivalTime: '12:00',
          departureTime: '12:00',
          stopTime: '0',
          track: '6',
          platform: '6站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '8',
      trainNo: 'K2345',
      trainType: 'normal',
      trainTypeDetail: 'origin',
      source: 'basic',
      status: 'enabled',
      currentVersion: 'v1.0',
      startDate: '2026-03-01',
      endDate: '2026-12-31',
      lifecycle: train8Lifecycle,
      operationDays: generateOperationDays('2026-03-01', '2026-12-31', train8Lifecycle),
      basicInfo: {
        model: '25K',
        formationCount: 18,
        formationDirection: '正向',
        track: '12道',
        direction: 'down',
      },
      operationRules: {
        operationCycle: 7,
        orderMaintenance: true,
        modelMaintenance: false,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划AC',
        screenPlan: '上屏计划AD',
        broadcastPlan: '广播计划AE',
        schedulePlan: '排班计划AF',
      },
      autoMatchRules: {
        model: ['25K', '25G'],
        formationCount: [16, 18],
        formationDirection: ['正向'],
        stopTime: [10, 15],
        direction: ['down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'origin',
        isSync: false,
        arrivalTrainNo: 'K2345',
        departureTrainNo: 'K2345',
        originTrainNo: 'K2345',
        originStation: '重庆东',
        terminalStation: '贵阳',
        checkInTime基准: '发点',
        checkInStopTime基准: '发点',
        checkInTimeOffset: 15,
        checkInStopTimeOffset: 5,
        checkOutTimeOffset: 0,
        trainModel: '25K',
        trainFormation: 18,
        parkingPosition: '西（南）',
        inboundDirection: '东（北）',
        outboundDirection: '东（北）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'manual',
        startValidDate: '2026-03-01',
        endValidDate: '2026-12-31',
        syncOriginStationName: '重庆东',
        syncTerminalStationName: '贵阳',
        originDepartureTime: '18:00',
        terminalArrivalTime: '23:30',
        operationType: '隔日开行',
        operationCycle: 7,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260301',
        platforms: ['12站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场北侧出站口'],
      },
      stations: [
        {
          stationName: '重庆东',
          arrivalTime: '18:00',
          departureTime: '18:00',
          stopTime: '0',
          track: '12',
          platform: '12站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '贵阳',
          arrivalTime: '23:30',
          departureTime: '23:30',
          stopTime: '0',
          track: '5',
          platform: '5站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '9',
      trainNo: 'D3456',
      trainType: 'highspeed',
      trainTypeDetail: 'terminal',
      source: 'ticket',
      status: 'changed',
      currentVersion: 'v1.2',
      startDate: '2026-02-15',
      endDate: '2026-12-31',
      lifecycle: train9Lifecycle,
      operationDays: generateOperationDays('2026-02-15', '2026-12-31', train9Lifecycle),
      basicInfo: {
        model: 'CRH1A',
        formationCount: 8,
        formationDirection: '正向',
        track: '7道',
        direction: 'up',
      },
      operationRules: {
        operationCycle: 2,
        orderMaintenance: false,
        modelMaintenance: true,
        trackMaintenance: false,
      },
      relatedPlans: {
        checkInPlan: '开检计划AG',
        screenPlan: '上屏计划AH',
        broadcastPlan: '广播计划AI',
        schedulePlan: '排班计划AJ',
      },
      autoMatchRules: {
        model: ['CRH1A', 'CRH1B'],
        formationCount: [8],
        formationDirection: ['正向'],
        stopTime: [3, 5],
        direction: ['up'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'terminal',
        isSync: true,
        arrivalTrainNo: 'D3456',
        departureTrainNo: 'D3456',
        originTrainNo: 'D3456',
        originStation: '汉口',
        terminalStation: '重庆东',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: 8,
        checkInStopTimeOffset: 3,
        checkOutTimeOffset: 1,
        trainModel: 'CRH1A',
        trainFormation: 8,
        parkingPosition: '东（北）',
        inboundDirection: '西（南）',
        outboundDirection: '西（南）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-02-15',
        endValidDate: '2026-12-31',
        syncOriginStationName: '汉口',
        syncTerminalStationName: '重庆东',
        originDepartureTime: '10:00',
        terminalArrivalTime: '13:30',
        operationType: '每日开行',
        operationCycle: 2,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260215',
        platforms: ['7站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝厦场南侧出站口'],
      },
      stations: [
        {
          stationName: '汉口',
          arrivalTime: '10:00',
          departureTime: '10:00',
          stopTime: '0',
          track: '4',
          platform: '4站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '13:30',
          departureTime: '13:30',
          stopTime: '0',
          track: '7',
          platform: '7站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '10',
      trainNo: 'K3456',
      trainType: 'normal',
      trainTypeDetail: 'passing',
      source: 'dispatch',
      status: 'enabled',
      currentVersion: 'v1.0',
      startDate: '2026-01-10',
      endDate: '2026-12-31',
      lifecycle: train10Lifecycle,
      operationDays: generateOperationDays('2026-01-10', '2026-12-31', train10Lifecycle),
      basicInfo: {
        model: '25G',
        formationCount: 16,
        formationDirection: '倒向',
        track: '11道',
        direction: 'down',
      },
      operationRules: {
        operationCycle: 1,
        orderMaintenance: true,
        modelMaintenance: false,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划AK',
        screenPlan: '上屏计划AL',
        broadcastPlan: '广播计划AM',
        schedulePlan: '排班计划AN',
      },
      autoMatchRules: {
        model: ['25G', '25K'],
        formationCount: [16, 18],
        formationDirection: ['正向', '倒向'],
        stopTime: [8, 10, 15],
        direction: ['up', 'down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'passing',
        isSync: false,
        arrivalTrainNo: 'K3455',
        departureTrainNo: 'K3456',
        originTrainNo: 'K3455',
        originStation: '兰州',
        terminalStation: '南宁',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: 12,
        checkInStopTimeOffset: 5,
        checkOutTimeOffset: 0,
        trainModel: '25G',
        trainFormation: 16,
        parkingPosition: '西（南）',
        inboundDirection: '东（北）',
        outboundDirection: '东（北）',
        formationDirection: '倒向',
        isValid: true,
        trainMode: 'manual',
        startValidDate: '2026-01-10',
        endValidDate: '2026-12-31',
        syncOriginStationName: '兰州',
        syncTerminalStationName: '南宁',
        originDepartureTime: '08:00',
        terminalArrivalTime: '20:00',
        operationType: '每日开行',
        operationCycle: 1,
        operationRule: 1,
        originStationDistanceDays: 1,
        terminalStationDistanceDays: 1,
        basicDiagramNo: '20260110',
        platforms: ['11站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场北侧出站口'],
      },
      stations: [
        {
          stationName: '兰州',
          arrivalTime: '08:00',
          departureTime: '08:00',
          stopTime: '0',
          track: '3',
          platform: '3站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '14:00',
          departureTime: '14:10',
          stopTime: '10',
          track: '11',
          platform: '11站台',
          isOrigin: false,
          isTerminal: false,
        },
        {
          stationName: '南宁',
          arrivalTime: '20:00',
          departureTime: '20:00',
          stopTime: '0',
          track: '7',
          platform: '7站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '11',
      trainNo: 'D4567',
      trainType: 'highspeed',
      trainTypeDetail: 'origin',
      source: 'manual',
      status: 'running',
      currentVersion: 'v1.1',
      startDate: '2026-02-05',
      endDate: '2026-12-31',
      lifecycle: train11Lifecycle,
      operationDays: generateOperationDays('2026-02-05', '2026-12-31', train11Lifecycle),
      basicInfo: {
        model: 'CRH5A',
        formationCount: 8,
        formationDirection: '正向',
        track: '3道',
        direction: 'up',
      },
      operationRules: {
        operationCycle: 2,
        orderMaintenance: true,
        modelMaintenance: true,
        trackMaintenance: false,
      },
      relatedPlans: {
        checkInPlan: '开检计划AO',
        screenPlan: '上屏计划AP',
        broadcastPlan: '广播计划AQ',
        schedulePlan: '排班计划AR',
      },
      autoMatchRules: {
        model: ['CRH5A', 'CRH5G'],
        formationCount: [8],
        formationDirection: ['正向'],
        stopTime: [3, 5],
        direction: ['up'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'origin',
        isSync: true,
        arrivalTrainNo: 'D4567',
        departureTrainNo: 'D4567',
        originTrainNo: 'D4567',
        originStation: '重庆东',
        terminalStation: '遂宁',
        checkInTime基准: '发点',
        checkInStopTime基准: '发点',
        checkInTimeOffset: -8,
        checkInStopTimeOffset: -2,
        checkOutTimeOffset: 1,
        trainModel: 'CRH5A',
        trainFormation: 8,
        parkingPosition: '东（北）',
        inboundDirection: '西（南）',
        outboundDirection: '西（南）',
        formationDirection: '正向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-02-05',
        endValidDate: '2026-12-31',
        syncOriginStationName: '重庆东',
        syncTerminalStationName: '遂宁',
        originDepartureTime: '09:00',
        terminalArrivalTime: '10:30',
        operationType: '每日开行',
        operationCycle: 2,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260205',
        platforms: ['3站台'],
        waitingRooms: ['候车大厅', '商务候车室'],
        exitGates: ['渝厦场南侧出站口'],
      },
      stations: [
        {
          stationName: '重庆东',
          arrivalTime: '09:00',
          departureTime: '09:00',
          stopTime: '0',
          track: '3',
          platform: '3站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '遂宁',
          arrivalTime: '10:30',
          departureTime: '10:30',
          stopTime: '0',
          track: '4',
          platform: '4站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
    {
      id: '12',
      trainNo: 'G4567',
      trainType: 'highspeed',
      trainTypeDetail: 'terminal',
      source: 'basic',
      status: 'enabled',
      currentVersion: 'v1.0',
      startDate: '2026-03-05',
      endDate: '2026-12-31',
      lifecycle: train12Lifecycle,
      operationDays: generateOperationDays('2026-03-05', '2026-12-31', train12Lifecycle),
      basicInfo: {
        model: 'CR400AF',
        formationCount: 16,
        formationDirection: '倒向',
        track: '8道',
        direction: 'down',
      },
      operationRules: {
        operationCycle: 1,
        orderMaintenance: false,
        modelMaintenance: true,
        trackMaintenance: true,
      },
      relatedPlans: {
        checkInPlan: '开检计划AS',
        screenPlan: '上屏计划AT',
        broadcastPlan: '广播计划AU',
        schedulePlan: '排班计划AV',
      },
      autoMatchRules: {
        model: ['CR400AF', 'CR400BF'],
        formationCount: [8, 16],
        formationDirection: ['正向', '倒向'],
        stopTime: [5, 8, 10],
        direction: ['up', 'down'],
      },
      editConfig: {
        station: '重庆东',
        trainType: 'terminal',
        isSync: true,
        arrivalTrainNo: 'G4567',
        departureTrainNo: 'G4567',
        originTrainNo: 'G4567',
        originStation: '郑州东',
        terminalStation: '重庆东',
        checkInTime基准: '到点',
        checkInStopTime基准: '到点',
        checkInTimeOffset: 10,
        checkInStopTimeOffset: 3,
        checkOutTimeOffset: 0,
        trainModel: 'CR400AF',
        trainFormation: 16,
        parkingPosition: '西（南）',
        inboundDirection: '东（北）',
        outboundDirection: '东（北）',
        formationDirection: '倒向',
        isValid: true,
        trainMode: 'auto',
        startValidDate: '2026-03-05',
        endValidDate: '2026-12-31',
        syncOriginStationName: '郑州东',
        syncTerminalStationName: '重庆东',
        originDepartureTime: '07:00',
        terminalArrivalTime: '12:30',
        operationType: '每日开行',
        operationCycle: 1,
        operationRule: 1,
        originStationDistanceDays: 0,
        terminalStationDistanceDays: 0,
        basicDiagramNo: '20260305',
        platforms: ['8站台'],
        waitingRooms: ['候车大厅'],
        exitGates: ['渝场南侧出站口'],
      },
      stations: [
        {
          stationName: '郑州东',
          arrivalTime: '07:00',
          departureTime: '07:00',
          stopTime: '0',
          track: '5',
          platform: '5站台',
          isOrigin: true,
          isTerminal: false,
        },
        {
          stationName: '重庆东',
          arrivalTime: '12:30',
          departureTime: '12:30',
          stopTime: '0',
          track: '8',
          platform: '8站台',
          isOrigin: false,
          isTerminal: true,
        },
      ],
    },
  ];
}
