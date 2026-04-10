import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// 统计数据接口
export interface StatData {
  operationPlan: {
    today: string;
    origin: string;
    pass: string;
    end: string;
    water: string;
    sewage: string;
    parcel: string;
    meal: string;
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

// 模拟统计数据
export const mockStats: StatData = {
  operationPlan: {
    today: '348/648',
    origin: '45/120',
    pass: '200/400',
    end: '103/128',
    water: '60/128',
    sewage: '20/97',
    parcel: '10/45',
    meal: '15/53'
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

export interface OperationTaskItem {
  jobType: string;
  workerName: string;
  location: string;
  taskContent: string;
  planTime: string;
  actualTime?: string;
  status: 'pending' | 'completed' | 'delay' | 'late' | 'absent';
}

export interface OperationTaskGroup {
  type: string;
  items: OperationTaskItem[];
}

// Alarm handling
export const fixedAlarmTrains = new Set<string>();
export const fixAlarm = (trainId: string) => {
  fixedAlarmTrains.add(trainId);
};

// Store for completed operations
const completedOperationsMap = new Map<string, { completed: boolean; remarks: string; timestamp: string }>();

export const getTrainRemarks = (trainId: string): string => {
  return completedOperationsMap.get(trainId)?.remarks || '';
};

export const saveTrainRemarks = (trainId: string, remarks: string) => {
  const existing = completedOperationsMap.get(trainId) || { completed: false, remarks: '', timestamp: '' };
  completedOperationsMap.set(trainId, { ...existing, remarks });
};

export const completeAllAbnormalOperations = (trainId: string, remarks: string) => {
  const existing = completedOperationsMap.get(trainId) || { completed: false, remarks: '', timestamp: '' };
  completedOperationsMap.set(trainId, { 
    ...existing, 
    completed: true, 
    remarks,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
  });
  fixAlarm(trainId);
};

export const getOperationDetails = (train: TrainSchedule): OperationTaskGroup[] => {
  const completedInfo = completedOperationsMap.get(train.id);
  const isCompleted = completedInfo?.completed;
  const completedTime = completedInfo?.timestamp || dayjs().format('YYYY-MM-DD HH:mm:ss');

  const groups: OperationTaskGroup[] = [];
  const today = dayjs().format('YYYY-MM-DD');
  
  const toDateTime = (timeStr: string, offsetMinutes: number = 0) => {
    if (!timeStr || timeStr === '-') return dayjs().format('YYYY-MM-DD HH:mm:ss');
    const dateStr = timeStr.includes(' ') ? timeStr : `${today} ${timeStr}`;
    return dayjs(dateStr).add(offsetMinutes, 'minute').format('YYYY-MM-DD HH:mm:ss');
  };

  const baseTime = toDateTime(train.arrival.time);

  const getStatus = (defaultStatus: 'pending' | 'completed') => {
    if (isCompleted) return 'completed';
    return defaultStatus;
  };
  
  const getActualTime = (defaultActualTime: string | undefined, planTime: string) => {
    if (isCompleted) {
      return defaultActualTime || completedTime;
    }
    return defaultActualTime;
  };

  // 1. 检票口客运员
  groups.push({
    type: '检票口客运员',
    items: [
      {
        jobType: '检票口客运员',
        workerName: '张检票',
        location: train.location.checkInGate || '检票口',
        taskContent: '出务报道',
        planTime: dayjs(baseTime).subtract(40, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed',
        actualTime: dayjs(baseTime).subtract(38, 'minute').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        jobType: '检票口客运员',
        workerName: '张检票',
        location: train.location.checkInGate || '检票口',
        taskContent: '作业开始',
        planTime: dayjs(baseTime).subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: getStatus('pending'),
        actualTime: getActualTime(undefined, dayjs(baseTime).subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss'))
      },
      {
        jobType: '检票口客运员',
        workerName: '张检票',
        location: train.location.checkInGate || '检票口',
        taskContent: '作业完毕',
        planTime: dayjs(baseTime).add(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: getStatus('pending'),
        actualTime: getActualTime(undefined, dayjs(baseTime).add(5, 'minute').format('YYYY-MM-DD HH:mm:ss'))
      }
    ]
  });

  // 2. 出站口客运员
  groups.push({
    type: '出站口客运员',
    items: [
      {
        jobType: '出站口客运员',
        workerName: '李出站',
        location: train.location.exitGate || '出站口',
        taskContent: '出务报道',
        planTime: dayjs(baseTime).subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed',
        actualTime: dayjs(baseTime).subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        jobType: '出站口客运员',
        workerName: '李出站',
        location: train.location.exitGate || '出站口',
        taskContent: '作业开始',
        planTime: dayjs(baseTime).subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: getStatus('pending'),
        actualTime: getActualTime(undefined, dayjs(baseTime).subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'))
      },
      {
        jobType: '出站口客运员',
        workerName: '李出站',
        location: train.location.exitGate || '出站口',
        taskContent: '作业完毕',
        planTime: dayjs(baseTime).add(25, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: getStatus('pending'),
        actualTime: getActualTime(undefined, dayjs(baseTime).add(25, 'minute').format('YYYY-MM-DD HH:mm:ss'))
      }
    ]
  });

  // 3. 上水员
  if (train.tags.water) {
    groups.push({
      type: '上水员',
      items: [
        {
          jobType: '上水员',
          workerName: '王上水',
          location: `${train.location.track}道`,
          taskContent: '作业开始',
          planTime: dayjs(baseTime).add(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
          status: getStatus('pending'),
          actualTime: getActualTime(undefined, dayjs(baseTime).add(10, 'minute').format('YYYY-MM-DD HH:mm:ss'))
        },
        {
          jobType: '上水员',
          workerName: '王上水',
          location: `${train.location.track}道`,
          taskContent: '作业完毕',
          planTime: dayjs(baseTime).add(20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
          status: getStatus('pending'),
          actualTime: getActualTime(undefined, dayjs(baseTime).add(20, 'minute').format('YYYY-MM-DD HH:mm:ss'))
        }
      ]
    });
  }

  // 4. 站台客运员
  groups.push({
    type: '站台客运员',
    items: [
      {
        jobType: '站台客运员',
        workerName: '赵站台',
        location: `${train.location.platform}站台`,
        taskContent: '接车',
        planTime: dayjs(baseTime).subtract(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: getStatus('pending'),
        actualTime: getActualTime(undefined, dayjs(baseTime).subtract(10, 'minute').format('YYYY-MM-DD HH:mm:ss'))
      },
      {
        jobType: '站台客运员',
        workerName: '赵站台',
        location: `${train.location.platform}站台`,
        taskContent: '送车',
        planTime: dayjs(baseTime).add(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: getStatus('pending'),
        actualTime: getActualTime(undefined, dayjs(baseTime).add(15, 'minute').format('YYYY-MM-DD HH:mm:ss'))
      }
    ]
  });

  groups.push({
    type: '站台值班员',
    items: [
      {
        jobType: '站台值班员',
        workerName: '孙值班',
        location: `${train.location.platform}站台`,
        taskContent: '巡视',
        planTime: dayjs(baseTime).subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed',
        actualTime: dayjs(baseTime).subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss')
      }
    ]
  });

  return groups;
};

// 异常信息接口
export interface AbnormalInfo {
  type: 'checkIn' | 'platform' | 'exit' | 'water' | 'sewage' | 'parcel' | 'meal';
  typeName: string;
  description: string;
  status: 'late' | 'missed' | 'overdue';
  plannedTime: string;
  actualTime?: string;
}

// 车长信息接口
export interface TrainMaster {
  name: string;
  phone: string;
}

// 作业状态类型
export type OperationStatus = 'pending' | 'active' | 'completed' | 'absent' | 'alarm';

// 作业项接口
export interface OperationItem {
  actualCount: number;
  plannedCount: number;
  status: OperationStatus;
}

export interface TrainSchedule {
  id: string;
  trainNo: string;
  departureTrainNo?: string;
  trainType: 'cyan' | 'purple' | 'yellow' | 'default';
  status: 'origin' | 'pass' | 'end';
  stationName: string;
  stationId: string;
  runningSection: {
    from: string;
    to: string;
  };
  tags: {
    water: boolean;
    sewage: boolean;
    parcel: boolean;
    meal: boolean;
    overnight: boolean;
    turnaround: boolean;
    overcrowd: boolean;
    special: boolean;
  };
  // 车长信息
  trainMasters: TrainMaster[];
  arrival: {
    time: string;
    actualTime?: string;
    dispatchTime?: string;
    lateEarly?: string;
    crossDay?: boolean;
    isTdStopped?: boolean;
  };
  departure: {
    time: string;
    actualTime?: string;
    dispatchTime?: string;
    lateEarly?: string;
    crossDay?: boolean;
    isTdStopped?: boolean;
  };
  attributes: {
    direction: 'up' | 'down';
    formation: number;
    formationOrder: 'normal' | 'reverse';
    isCoupled: boolean;
    trainModel: string;
    landmarkColor: string;
  };
  location: {
    track: string;
    platform: string;
    checkInGate: string;
    exitGate: string;
    currentPos: string;
    trackChange?: boolean;
    actualTrack?: string;
    actualPlatform?: string;
  };
  devices: {
    broadcast: { value: string; state: 'normal' | 'abnormal' | 'none' };
    guide: { value: string; state: 'normal' | 'abnormal' | 'none' };
    gate: { value: string; state: 'normal' | 'abnormal' | 'none' };
  };
  // 扩展的作业状态
  operations: {
    broadcast: OperationItem;      // 广播
    checkInOpen: OperationItem;    // 开检
    checkInClose: OperationItem;   // 停检
    checkIn: OperationItem;        // 检票口
    platform: OperationItem;       // 站台
    exit: OperationItem;           // 出站口
    passenger: OperationItem;      // 客运作业
    water: OperationItem;          // 上水作业
    sewage: OperationItem;         // 吸污作业
  };
  // 开检/停检时间
  checkInTimes: {
    open: string;   // 格式: MM/DD HH:mm
    close: string;  // 格式: MM/DD HH:mm
  };
  connection?: {
    trainNo: string;
    time: number;
  };
  passengerFlow?: {
    boarding: number | string;
    alighting: number | string;
    transfer: number | string;
    total: number | string;
  };
  routeStations?: {
    name: string;
    time: string;
    departure?: string;
    type: 'stop' | 'pass';
    status: 'normal' | 'late';
    lateTime?: string;
    turnaround?: boolean;
    currentStatus?: 'passed' | 'current' | 'upcoming';
    speedLimit?: number;
  }[];
  jointOperations?: {
    id: string;
    name: string;
    person: string;
    status: 'green' | 'red';
  }[];
  trainMaster?: string;
  abnormalInfo?: AbnormalInfo[];
}

const getRouteStations = (from: string, to: string, status?: 'origin' | 'pass' | 'end'): TrainSchedule['routeStations'] => {
  if (from === '重庆西' && to === '成都东') {
    return [
      { name: '重庆西', time: '15:20', departure: '15:20', type: 'stop', status: 'normal', currentStatus: 'passed', speedLimit: 250 },
      { name: '内江北', time: '16:05', departure: '16:08', type: 'stop', status: 'normal', currentStatus: 'current', speedLimit: 200 },
      { name: '资阳北', time: '16:35', type: 'pass', status: 'normal', currentStatus: 'upcoming', speedLimit: 250 },
      { name: '成都东', time: '16:50', type: 'stop', status: 'normal', currentStatus: 'upcoming', speedLimit: 120, turnaround: true }
    ];
  }
  if (from === '成都东' && to === '贵阳北') {
    return [
      { name: '成都东', time: '17:05', departure: '17:05', type: 'stop', status: 'normal', currentStatus: 'passed', speedLimit: 120 },
      { name: '宜宾西', time: '18:15', departure: '18:19', type: 'stop', status: 'normal', currentStatus: 'current', speedLimit: 250 },
      { name: '毕节', time: '19:02', type: 'pass', status: 'normal', currentStatus: 'upcoming', speedLimit: 200 },
      { name: '贵阳北', time: '19:48', type: 'stop', status: 'normal', currentStatus: 'upcoming', speedLimit: 120 }
    ];
  }
  let route = [
    { name: from, time: '10:00', departure: '10:00', type: 'stop' as const, status: 'normal' as const, currentStatus: 'passed' as const, speedLimit: 120 },
    { name: '中间站A', time: '11:30', departure: '11:35', type: 'stop' as const, status: 'normal' as const, currentStatus: 'current' as const, speedLimit: 200 },
    { name: '中间站B', time: '12:45', type: 'pass' as const, status: 'normal' as const, currentStatus: 'upcoming' as const, speedLimit: 250 },
    { name: to, time: '14:00', type: 'stop' as const, status: 'normal' as const, currentStatus: 'upcoming' as const, speedLimit: 120 }
  ];
  
  if (status === 'pass' && !route.some(station => station.name === '重庆东')) {
    route.splice(2, 0, {
      name: '重庆东',
      time: '12:00',
      departure: '12:05',
      type: 'stop',
      status: 'normal',
      currentStatus: 'upcoming',
      speedLimit: 120
    });
    route.forEach((station, index) => {
      if (index === 0) {
        station.currentStatus = 'passed';
      } else if (index === 1) {
        station.currentStatus = 'current';
      } else {
        station.currentStatus = 'upcoming';
      }
    });
  }
  
  return route;
};

export const summarizeOperations = (groups: OperationTaskGroup[]) => {
  const init = {
    checkIn: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false },
    platform: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false },
    exit: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false },
    water: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false },
    sewage: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false },
    parcel: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false },
    meal: { actualCount: 0, plannedCount: 0, finishedCount: 0, status: 'absent' as 'pending' | 'active' | 'completed' | 'absent' | 'alarm', hasLate: false, hasMissed: false, hasOverdue: false }
  };
  const getCat = (type: string) => {
    if (type.includes('检票')) return 'checkIn';
    if (type.includes('站台') || type.includes('值班员')) return 'platform';
    if (type.includes('出站')) return 'exit';
    if (type.includes('上水')) return 'water';
    if (type.includes('吸污')) return 'sewage';
    if (type.includes('行包')) return 'parcel';
    if (type.includes('送餐')) return 'meal';
    return null;
  };
  
  const now = new Date();
  
  let hasPlatform = false;
  let hasCheckIn = false;
  let hasExit = false;
  let hasWater = false;
  let hasSewage = false;
  let hasParcel = false;
  let hasMeal = false;
  
  groups.forEach(g => {
    const cat = getCat(g.type);
    if (!cat) return;
    
    const planned = 1;
    const arrived = g.items.length > 0 && !!g.items[0].actualTime ? 1 : 0;
    const finished = g.items.every(i => !!i.actualTime) ? 1 : 0;
    
    const hasLate = g.items.some(i => i.actualTime && new Date(i.actualTime) > new Date(i.planTime));
    const hasMissed = g.items.some(i => !i.actualTime);
    const hasOverdue = g.items.some(i => !i.actualTime && new Date(i.planTime) < now);
    
    init[cat].plannedCount += planned;
    init[cat].actualCount += arrived;
    init[cat].finishedCount += finished;
    init[cat].hasLate = init[cat].hasLate || hasLate;
    init[cat].hasMissed = init[cat].hasMissed || hasMissed;
    init[cat].hasOverdue = init[cat].hasOverdue || hasOverdue;
    
    if (cat === 'platform') hasPlatform = true;
    if (cat === 'checkIn') hasCheckIn = true;
    if (cat === 'exit') hasExit = true;
    if (cat === 'water') hasWater = true;
    if (cat === 'sewage') hasSewage = true;
    if (cat === 'parcel') hasParcel = true;
    if (cat === 'meal') hasMeal = true;
  });
  
  if (hasCheckIn) init.checkIn.plannedCount = 1;
  if (hasExit) init.exit.plannedCount = 1;
  if (hasWater) init.water.plannedCount = 1;
  if (hasSewage) init.sewage.plannedCount = 1;
  if (hasParcel) init.parcel.plannedCount = 1;
  if (hasMeal) init.meal.plannedCount = 1;
  if (hasPlatform) init.platform.plannedCount = 2;
  
  Object.keys(init).forEach(key => {
    const k = key as keyof typeof init;
    if (init[k].plannedCount === 0) {
      init[k].status = 'absent';
    } else if (init[k].finishedCount === init[k].plannedCount) {
      init[k].status = 'completed';
    } else if (init[k].hasOverdue) {
      init[k].status = 'alarm';
    } else if (init[k].actualCount > 0) {
      init[k].status = 'active';
    } else {
      init[k].status = 'pending';
    }
  });

  return init;
};

const getPassengerFlow = (status: string) => {
  const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const boarding = status === 'end' ? '--' : getRandom(1, 2000);
  const alighting = status === 'origin' ? '--' : getRandom(1, 2000);
  const transfer = getRandom(1, 500);
  const total = 1061;

  return { boarding, alighting, transfer, total };
};

// 生成车长信息
const getTrainMasters = (count: number = 2): TrainMaster[] => {
  const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
  const result: TrainMaster[] = [];
  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const phone = `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
    result.push({ name, phone });
  }
  return result;
};

// 生成作业状态
const getOperationStatus = (): OperationStatus => {
  const statuses: OperationStatus[] = ['pending', 'active', 'completed', 'absent', 'alarm'];
  const weights = [0.2, 0.3, 0.3, 0.1, 0.1]; // alarm 概率 10%
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < statuses.length; i++) {
    sum += weights[i];
    if (random < sum) return statuses[i];
  }
  return 'pending';
};

// 生成作业项
const getOperationItem = (): OperationItem => ({
  actualCount: Math.floor(Math.random() * 3),
  plannedCount: 3,
  status: getOperationStatus(),
});

// 生成开检/停检时间
const getCheckInTimes = (arrivalTime: string): { open: string; close: string } => {
  // 从到达时间解析
  const [hours, minutes] = arrivalTime.split(':').map(Number);
  const baseDate = new Date(2024, 2, 21, hours, minutes); // 3月21日
  
  // 开检时间：到达前15分钟
  const openTime = new Date(baseDate.getTime() - 15 * 60 * 1000);
  // 停检时间：到达前5分钟
  const closeTime = new Date(baseDate.getTime() - 5 * 60 * 1000);
  
  const formatTime = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${m}/${d} ${h}:${min}`;
  };
  
  return {
    open: formatTime(openTime),
    close: formatTime(closeTime),
  };
};

export const mockTrainSchedules: TrainSchedule[] = [
  {
    id: uuidv4(),
    trainNo: 'G100',
    trainType: 'yellow',
    status: 'end',
    stationName: '重庆东',
    stationId: '1',
    trainMasters: getTrainMasters(2),
    runningSection: { from: '重庆西', to: '重庆东' },
    tags: { water: false, sewage: true, parcel: false, meal: false, overnight: false, turnaround: true, overcrowd: false, special: true },
    arrival: { time: '11:00', actualTime: '11:00', dispatchTime: '11:00', lateEarly: '0' },
    departure: { time: '11:15', actualTime: '11:15', dispatchTime: '11:15', lateEarly: '0' },
    attributes: { direction: 'up', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '紫色' },
    location: { track: '5', platform: '5', checkInGate: '-', exitGate: '北出站口', currentPos: '列车已到达' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '-', state: 'none' } },
    operations: {
      broadcast: getOperationItem(),
      checkInOpen: getOperationItem(),
      checkInClose: getOperationItem(),
      checkIn: { actualCount: 0, plannedCount: 3, status: 'alarm' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 2, plannedCount: 2, status: 'active' },
      passenger: getOperationItem(),
      water: getOperationItem(),
      sewage: getOperationItem(),
    },
    checkInTimes: getCheckInTimes('11:00'),
    connection: { trainNo: 'G101', time: 15 },
    passengerFlow: getPassengerFlow('end'),
    routeStations: getRouteStations('重庆西', '成都东', 'end')
  },
  {
    id: uuidv4(),
    trainNo: 'G101',
    trainType: 'cyan',
    status: 'origin',
    stationName: '重庆东',
    stationId: '1',
    trainMaster: '上海/13987654321',
    runningSection: { from: '重庆东', to: '贵阳北' },
    tags: { water: true, sewage: false, parcel: false, meal: true, overnight: false, turnaround: false, overcrowd: false, special: true },
    arrival: { time: '11:15', actualTime: '11:15', lateEarly: '0' },
    departure: { time: '11:30', actualTime: '11:30', lateEarly: '0' },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CRH380', landmarkColor: '蓝色' },
    location: { track: '5', platform: '5', checkInGate: 'A5', exitGate: '-', currentPos: '正在候车' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
    operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'active' }, platform: { actualCount: 2, plannedCount: 3, status: 'active' }, exit: { actualCount: 0, plannedCount: 2, status: 'absent' } },
    passengerFlow: getPassengerFlow('origin'),
    routeStations: getRouteStations('成都东', '贵阳北', 'origin')
  },
  {
    id: uuidv4(),
    trainNo: 'D200',
    trainType: 'purple',
    status: 'pass',
    stationName: '巴南',
    stationId: '2',
    trainMaster: '广州/13765432109',
    runningSection: { from: '西安北', to: '昆明南' },
    tags: { water: false, sewage: false, parcel: false, meal: false, overnight: false, turnaround: false, overcrowd: true, special: false },
    arrival: { time: '17:30', actualTime: '17:28', dispatchTime: '17:28', lateEarly: '-2' },
    departure: { time: '17:35', actualTime: '17:35', dispatchTime: '17:35', lateEarly: '0' },
    attributes: { direction: 'up', formation: 16, formationOrder: 'reverse', isCoupled: true, trainModel: 'CR400BF', landmarkColor: '黄色' },
    location: { track: '3', platform: '3', checkInGate: 'B3', exitGate: '西出站口', currentPos: '正在检票', trackChange: true, actualTrack: '4', actualPlatform: '4' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
    operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'pending' }, platform: { actualCount: 2, plannedCount: 3, status: 'pending' }, exit: { actualCount: 2, plannedCount: 2, status: 'pending' } },
    passengerFlow: getPassengerFlow('pass'),
  },
  {
    id: uuidv4(),
    trainNo: 'D201',
    departureTrainNo: 'D202',
    trainType: 'purple',
    status: 'pass',
    stationName: '巴南',
    stationId: '2',
    trainMaster: '北京/13812345678',
    runningSection: { from: '昆明南', to: '西安北' },
    tags: { water: false, sewage: false, parcel: true, meal: false, overnight: false, turnaround: false, overcrowd: false, special: false },
    arrival: { time: '10:35', actualTime: '10:40', dispatchTime: '10:40', lateEarly: '+5', isTdStopped: true },
    departure: { time: '10:43', actualTime: '10:48', dispatchTime: '10:48', lateEarly: '+5', isTdStopped: true },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CRH2A', landmarkColor: '绿色' },
    location: { track: '4', platform: '4', checkInGate: 'A4', exitGate: '东出站口', currentPos: '晚点未定' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
    operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'active' }, platform: { actualCount: 2, plannedCount: 3, status: 'alarm' }, exit: { actualCount: 2, plannedCount: 2, status: 'completed' } },
    connection: { trainNo: 'D202', time: 20 },
    passengerFlow: getPassengerFlow('pass'),
  },
  {
    id: uuidv4(),
    trainNo: 'K900',
    trainType: 'yellow',
    status: 'end',
    stationName: '重庆东',
    stationId: '1',
    trainMaster: '上海/13987654321',
    runningSection: { from: '达州', to: '重庆东' },
    tags: { water: true, sewage: true, parcel: true, meal: false, overnight: true, turnaround: false, overcrowd: false, special: false },
    arrival: { time: '18:00', actualTime: '18:00', lateEarly: '0' },
    departure: { time: '18:30', actualTime: '18:30', lateEarly: '0' },
    attributes: { direction: 'up', formation: 8, formationOrder: 'normal', isCoupled: true, trainModel: 'CRH5', landmarkColor: '无' },
    location: { track: '8', platform: '8', checkInGate: '-', exitGate: '北出站口', currentPos: '正点到达' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '-', state: 'none' } },
    operations: { checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' }, platform: { actualCount: 2, plannedCount: 3, status: 'pending' }, exit: { actualCount: 2, plannedCount: 2, status: 'pending' } },
    connection: { trainNo: '0K900', time: 30 },
    passengerFlow: getPassengerFlow('end'),
  },
  {
    id: uuidv4(),
    trainNo: 'G500',
    trainType: 'cyan',
    status: 'origin',
    trainMaster: '北京/13812345678',
    runningSection: { from: '重庆东', to: '北京西' },
    tags: { water: true, sewage: false, parcel: false, meal: true, overnight: false, turnaround: false, overcrowd: false, special: true },
    arrival: { time: '18:15', actualTime: '18:15', lateEarly: '0' },
    departure: { time: '18:30', actualTime: '18:30', lateEarly: '0' },
    attributes: { direction: 'down', formation: 16, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '蓝色' },
    location: { track: '2', platform: '2', checkInGate: 'A2', exitGate: '-', currentPos: '停止检票' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
    operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'pending' }, platform: { actualCount: 2, plannedCount: 3, status: 'active' }, exit: { actualCount: 0, plannedCount: 2, status: 'absent' } },
    passengerFlow: getPassengerFlow('origin'),
  },
  {
    id: uuidv4(),
    trainNo: 'G201',
    trainType: 'cyan',
    status: 'origin',
    trainMaster: '北京/13812345678',
    runningSection: { from: '重庆东', to: '上海虹桥' },
    tags: { water: true, sewage: false, parcel: false, meal: true, overnight: false, turnaround: false, overcrowd: false, special: true },
    arrival: { time: '09:00', actualTime: '09:00', lateEarly: '0' },
    departure: { time: '09:15', actualTime: '09:15', lateEarly: '0' },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '蓝色' },
    location: { track: '10', platform: '10', checkInGate: 'A10', exitGate: '-', currentPos: '正在候车', trackChange: true, actualTrack: '9G/9' },
    devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
    operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'active' }, platform: { actualCount: 2, plannedCount: 3, status: 'active' }, exit: { actualCount: 0, plannedCount: 2, status: 'absent' } },
    passengerFlow: getPassengerFlow('origin'),
    routeStations: [
      { name: '重庆东', time: '09:15', departure: '09:15', type: 'stop', status: 'normal', currentStatus: 'passed' },
      { name: '重庆北', time: '09:40', departure: '09:45', type: 'stop', status: 'normal', currentStatus: 'passed' },
      { name: '长寿北', time: '10:10', type: 'pass', status: 'normal', currentStatus: 'passed' },
      { name: '涪陵北', time: '10:30', departure: '10:33', type: 'stop', status: 'normal', currentStatus: 'passed' },
      { name: '石柱县', time: '11:05', type: 'pass', status: 'normal', currentStatus: 'passed' },
      { name: '恩施', time: '11:50', departure: '11:55', type: 'stop', status: 'normal', currentStatus: 'current' },
      { name: '建始', time: '12:20', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '宜昌东', time: '13:10', departure: '13:16', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '荆州', time: '13:50', departure: '13:53', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '仙桃西', time: '14:15', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '天门南', time: '14:30', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '汉口', time: '15:00', departure: '15:05', type: 'stop', status: 'normal', currentStatus: 'upcoming', turnaround: true },
      { name: '武汉', time: '15:20', departure: '15:24', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '红安西', time: '15:50', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '麻城北', time: '16:10', departure: '16:13', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '金寨', time: '16:50', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '六安', time: '17:20', departure: '17:23', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '合肥南', time: '17:50', departure: '17:56', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '南京南', time: '18:50', departure: '18:56', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '镇江南', time: '19:15', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '常州北', time: '19:35', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '无锡东', time: '19:50', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '苏州北', time: '20:05', departure: '20:08', type: 'stop', status: 'normal', currentStatus: 'upcoming' },
      { name: '昆山南', time: '20:20', type: 'pass', status: 'normal', currentStatus: 'upcoming' },
      { name: '上海虹桥', time: '20:40', type: 'stop', status: 'normal', currentStatus: 'upcoming' }
    ],
  }
];

// Generate more mock data
const generateMoreMockData = (count: number) => {
  const stations = ['重庆北', '贵阳北', '西安北', '昆明南', '绵阳', '德阳', '乐山', '宜宾', '广元', '达州'];
  const trainTypes: ('cyan' | 'purple' | 'yellow' | 'default')[] = ['cyan', 'purple', 'yellow', 'default'];
  const statuses: ('origin' | 'pass' | 'end')[] = ['origin', 'pass', 'end'];
  const trainMasters = ['北京/13812345678', '上海/13987654321', '广州/13765432109'];

  for (let i = 0; i < count; i++) {
    const trainNo = `G${2000 + i}`;
    const status = statuses[i % 3];
    const trainType = trainTypes[i % 4];
    const trainMaster = trainMasters[i % 3];
    
    let fromStation = stations[Math.floor(Math.random() * stations.length)];
    let toStation = stations[Math.floor(Math.random() * stations.length)];
    while (fromStation === toStation) {
      toStation = stations[Math.floor(Math.random() * stations.length)];
    }

    if (status === 'origin') fromStation = '重庆东';
    else if (status === 'end') toStation = '重庆东';

    let currentPos = '';
    if (status === 'end') {
      const endStatuses = ['正点到达', '正点到达', '正点到达', '列车已到达', '列车已到达', '停运', '晚点未定'];
      currentPos = endStatuses[Math.floor(Math.random() * endStatuses.length)];
    } else {
      const depStatuses = ['正在候车', '正在候车', '正在候车', '准备检票', '正在检票', '停止检票', '晚点未定', '列车离站', '停运预告'];
      currentPos = depStatuses[Math.floor(Math.random() * depStatuses.length)];
    }

    const hour = 10 + Math.floor(i/4);
    const minute = 10 + (i%4)*15;
    const planTime = new Date();
    planTime.setHours(hour, minute, 0, 0);
    
    const isLate = Math.random() > 0.8;
    const isEarly = !isLate && Math.random() > 0.9;
    const lateMinutes = isLate ? Math.floor(Math.random() * 10) + 1 : (isEarly ? -(Math.floor(Math.random() * 10) + 1) : 0);
    const actualTime = new Date(planTime.getTime() + lateMinutes * 60000);
    
    const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const planTimeStr = formatTime(planTime);
    const actualTimeStr = formatTime(actualTime);
    const lateEarlyStr = lateMinutes === 0 ? '0' : (lateMinutes > 0 ? `+${lateMinutes}` : `${lateMinutes}`);

    const isCoupled = Math.random() > 0.8;
    const formation = isCoupled ? 8 : (Math.random() > 0.5 ? 8 : 16);
    
    // 根据状态确定所属车站
    const stationName = status === 'end' ? toStation : fromStation;
    const stationId = stationName === '重庆东' ? '1' : 
                     stationName === '巴南' ? '2' : 
                     stationName === '南川北' ? '3' : '4';
    
    mockTrainSchedules.push({
      id: uuidv4(),
      trainNo,
      trainType,
      status,
      stationName,
      stationId,
      trainMaster,
      runningSection: { from: fromStation, to: toStation },
      tags: {
        water: Math.random() > 0.8,
        sewage: Math.random() > 0.8,
        parcel: Math.random() > 0.8,
        meal: Math.random() > 0.8,
        overnight: Math.random() > 0.9,
        turnaround: Math.random() > 0.7,
        overcrowd: Math.random() > 0.9,
        special: Math.random() > 0.95
      },
      arrival: { time: planTimeStr, actualTime: actualTimeStr, dispatchTime: actualTimeStr, lateEarly: lateEarlyStr },
      departure: { time: `${hour}:${25 + (i%4)*15}`, actualTime: `${hour}:${25 + (i%4)*15}`, dispatchTime: `${hour}:${25 + (i%4)*15}`, lateEarly: '0' },
      attributes: { 
        direction: Math.random() > 0.5 ? 'up' : 'down', 
        formation,
        formationOrder: 'normal',
        isCoupled,
        trainModel: ['CR400AF', 'CRH380', 'CRH2A', 'CR400BF'][Math.floor(Math.random() * 4)],
        landmarkColor: ['紫色', '蓝色', '黄色', '绿色', '橙色'][Math.floor(Math.random() * 5)]
      },
      location: { 
        track: `${(i % 10) + 1}`, 
        platform: `${(i % 10) + 1}`, 
        checkInGate: `A${(i % 10) + 1}`, 
        exitGate: '东出站口', 
        currentPos 
      },
      devices: { 
        broadcast: { value: '9/9', state: Math.random() > 0.9 ? 'abnormal' : 'normal' }, 
        guide: { value: '6/6', state: Math.random() > 0.9 ? 'abnormal' : 'normal' }, 
        gate: { value: '5/5', state: Math.random() > 0.9 ? 'abnormal' : 'normal' } 
      },
      operations: {
        broadcast: getOperationItem(),
        checkInOpen: getOperationItem(),
        checkInClose: getOperationItem(),
        checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
        platform: { actualCount: 2, plannedCount: 3, status: 'active' },
        exit: { actualCount: 2, plannedCount: 2, status: 'active' },
        passenger: getOperationItem(),
        water: getOperationItem(),
        sewage: getOperationItem(),
      },
      checkInTimes: getCheckInTimes(planTimeStr),
      connection: { trainNo: `G${1000 + i}`, time: 15 },
      passengerFlow: getPassengerFlow(status),
      routeStations: getRouteStations(fromStation, toStation, status),
      jointOperations: (() => {
        const allJobs = [
          { id: 'water', name: '上水', person: '张三' },
          { id: 'sewage', name: '吸污', person: '张少三' },
          { id: 'meal', name: '送餐', person: '王雯' },
          { id: 'express', name: '快运', person: '李叔同' }
        ];
        const count = Math.floor(Math.random() * 4) + 1;
        const shuffled = [...allJobs].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(job => ({
          ...job,
          status: Math.random() > 0.3 ? 'green' as const : 'red' as const
        }));
      })()
    });
  }
};

generateMoreMockData(20);

// 客运记录数据接口
export interface PassengerRecord {
  id: string;
  recordNo: string;
  trainNo: string;
  arrivalDate: string;
  recordType: 'lost' | 'special' | 'handover' | 'other';
  recordTypeName: string;
  direction: 'departure' | 'arrival';
  status: string;
  appeal: string;
  itemList: string;
  currentNode: {
    station: string;
    contactName: string;
    contactPhone: string;
    status: string;
  };
  transferRecords: {
    id: string;
    description: string;
    isCurrent?: boolean;
  }[];
}

// 模拟客运记录数据
export const mockPassengerRecords: PassengerRecord[] = [
  {
    id: uuidv4(),
    recordNo: '京202508040000001',
    trainNo: 'G57',
    arrivalDate: '2025-08-04',
    recordType: 'lost',
    recordTypeName: '遗失物品',
    direction: 'departure',
    status: '待交接',
    appeal: '遗失物品移交 石家庄站：将遗失在列车的物品黑色的双肩包运送到石家庄站，请按章办理。',
    itemList: '一个黑色的双肩包（小米的）内有零食，小风扇和书本',
    currentNode: { station: '北京西', contactName: '李飞', contactPhone: '12345678901', status: '列车待接取' },
    transferRecords: [{ id: '1', description: 'G57(2025-08-04始发)' }, { id: '2', description: '石家庄' }]
  },
  {
    id: uuidv4(),
    recordNo: '京202508040000002',
    trainNo: 'G100',
    arrivalDate: '2025-08-04',
    recordType: 'special',
    recordTypeName: '重点旅客',
    direction: 'arrival',
    status: '处理中',
    appeal: '协助重点旅客出站：一位行动不便的老年旅客需要轮椅协助出站，请安排工作人员接应。',
    itemList: '轮椅服务、行李协助',
    currentNode: { station: '成都东', contactName: '王芳', contactPhone: '13800138000', status: '等待到达' },
    transferRecords: [
      { id: '1', description: '重庆西(2025-08-04始发)' },
      { id: '2', description: '内江北' },
      { id: '3', description: '成都东' }
    ]
  }
];
