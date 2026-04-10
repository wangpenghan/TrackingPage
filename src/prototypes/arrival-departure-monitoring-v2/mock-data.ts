
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// 统计数据接口
export interface StatData {
  operationPlan: {
    today: string;    // 今日计划
    origin: string;   // 始发
    pass: string;     // 途径
    end: string;      // 终到
    water: string;    // 上水
    sewage: string;   // 吸污
    parcel: string;   // 行包
    meal: string;     // 送餐
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

// Store for completed operations: trainId -> { completed: boolean, remarks: string, timestamp: string }
const completedOperationsMap = new Map<string, { completed: boolean, remarks: string, timestamp: string }>();

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
  // Also fix alarm if any
  fixAlarm(trainId);
};

export const getOperationDetails = (train: TrainSchedule): OperationTaskGroup[] => {
  // Check if train operations are completed
  const completedInfo = completedOperationsMap.get(train.id);
  const isCompleted = completedInfo?.completed;
  const completedTime = completedInfo?.timestamp || dayjs().format('YYYY-MM-DD HH:mm:ss');

  const groups: OperationTaskGroup[] = [];
  const today = dayjs().format('YYYY-MM-DD');
  
  // Helper to construct full datetime string
  const toDateTime = (timeStr: string, offsetMinutes: number = 0) => {
    if (!timeStr || timeStr === '-') return dayjs().format('YYYY-MM-DD HH:mm:ss');
    const dateStr = timeStr.includes(' ') ? timeStr : `${today} ${timeStr}`;
    return dayjs(dateStr).add(offsetMinutes, 'minute').format('YYYY-MM-DD HH:mm:ss');
  };

  const baseTime = toDateTime(train.arrival.time);

  // Helper to get status and actual time based on completion state
  const getStatus = (defaultStatus: 'pending' | 'completed', defaultActualTime?: string) => {
    if (isCompleted) return 'completed';
    return defaultStatus;
  };
  
  const getActualTime = (defaultActualTime: string | undefined, planTime: string) => {
    if (isCompleted) {
        return defaultActualTime || completedTime; // Use completion time if no actual time
    }
    return defaultActualTime;
  };

  // 1. 检票口客运员 (Check-in) - 1 person
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
        // Case: Late Check-in (Actual > Plan) -> Red Time
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

  // 2. 出站口客运员 (Exit) - 1 person
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

  // 3. 上水员 (Water) - Conditional
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

  // 4. 站台 (Platform) - Agent + Duty Officer
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

export interface TrainSchedule {
  id: string;
  // 基础信息
  trainNo: string; // 到站车次 (G2826)
  departureTrainNo?: string; // 始发车次
  trainType: 'cyan' | 'purple' | 'yellow' | 'default'; // 车次颜色类型
  status: 'origin' | 'pass' | 'end'; // 始发/途径/终到
  runningSection: {
    from: string;
    to: string;
  };
  
  // 重点标记
  tags: {
    water: boolean; // 上水
    sewage: boolean; // 吸污
    parcel: boolean; // 行包
    meal: boolean; // 送餐
    overnight: boolean; // 过夜
    turnaround: boolean; // 折返
    overcrowd: boolean; // 超员
    special: boolean; // 专运
    checkInReady: boolean; // 满足开检条件
  };

  // 时间信息
  arrival: {
    time: string; // 计划时间
    actualTime?: string; // 实际时间
    dispatchTime?: string; // 调度时间
    lateEarly?: string; // 正晚点 (+5, -2)
    crossDay?: boolean; // 跨天标识
    isTdStopped?: boolean; // 是否停止接收TD
  };
  departure: {
    time: string; // 计划时间
    actualTime?: string; // 实际时间
    dispatchTime?: string; // 调度时间
    lateEarly?: string; // 正晚点
    crossDay?: boolean; // 跨天标识
    isTdStopped?: boolean; // 是否停止接收TD
  };

  // 列车属性
  attributes: {
    direction: 'up' | 'down'; // 进站方向 (上行/下行)
    formation: number; // 编组数 (8/16)
    formationOrder: 'normal' | 'reverse'; // 编组方向 (正序/倒序)
    isCoupled: boolean; // 是否重联
    trainModel: string; // 车型
    landmarkColor: string; // 地标颜色
  };

  // 位置资源
  location: {
    track: string; // 股道
    platform: string; // 站台
    checkInGate: string; // 检票口
    exitGate: string; // 出站口
    currentPos: string; // 计划状态 (原当前位置)
    trackChange?: boolean; // 股道变更
    actualTrack?: string; // 实际股道
    actualPlatform?: string; // 实际站台
  };

  // 设备状态
  devices: {
    broadcast: { value: string; state: 'normal' | 'abnormal' | 'none' }; // 广播
    guide: { value: string; state: 'normal' | 'abnormal' | 'none' }; // 引导
    gate: { value: string; state: 'normal' | 'abnormal' | 'none' }; // 闸机
  };

  // 作业状态
  operations: {
    checkIn: { actualCount: number; plannedCount: number; status: 'pending' | 'active' | 'completed' | 'absent' };
    platform: { actualCount: number; plannedCount: number; status: 'pending' | 'active' | 'completed' | 'absent' };
    exit: { actualCount: number; plannedCount: number; status: 'pending' | 'active' | 'completed' | 'absent' };
  };

  // 接续信息
  connection?: {
    trainNo: string;
    time: number; // 接续时间
  };
  
  // 客流信息
  passengerFlow?: {
    boarding: number | string; // 上车人数
    alighting: number | string; // 下车人数
    transfer: number | string; // 换乘人数
    total: number | string; // 定员/总人数
  };
  
  // 途径站信息
  routeStations?: {
    name: string;
    time: string;
    departure?: string;
    type: 'stop' | 'pass';
    status: 'normal' | 'late';
    lateTime?: string;
    turnaround?: boolean; // 折返标记
    currentStatus?: 'passed' | 'current' | 'upcoming'; // 当前状态
    speedLimit?: number; // 区间限速
  }[];
  
  // 结合部作业
  jointOperations?: {
    id: string;
    name: string;
    person: string;
    status: 'green' | 'red';
  }[];
  
  // 列车长信息
  trainMaster?: string;
  
  // 所属车站
  station: string; // '重庆东' | '巴南' | '南川北' | '水江西'
  
  // 作业状态标记
  operationStatus?: 'pending' | 'operating' | 'completed';
  
  // 计划变更信息（包含昨日计划和客模比对）
  planChangeInfo?: {
    // 到点变更
    arrivalTime: {
      today: string;        // 当日计划
      yesterday: string;    // 昨日计划
      kemo: string;         // 客模信息
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 发点变更
    departureTime: {
      today: string;
      yesterday: string;
      kemo: string;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 股道变更
    track: {
      today: string;
      yesterday: string;
      kemo: string;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 编组变更
    formation: {
      today: number;
      yesterday: number;
      kemo: number;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 车型变更
    trainModel: {
      today: string;
      yesterday: string;
      kemo: string;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 上水变更
    water: {
      today: boolean;
      yesterday: boolean;
      kemo: boolean;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 吸污变更
    sewage: {
      today: boolean;
      yesterday: boolean;
      kemo: boolean;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 行包变更
    parcel: {
      today: boolean;
      yesterday: boolean;
      kemo: boolean;
      diffType: 'none' | 'yesterday' | 'kemo' | 'both';
    };
    // 业务变更类型
    businessChangeTypes: Array<
      'suspended' |       // 停运
      'added' |           // 新增
      'reduced' |         // 减少
      'trackChange' |     // 变股道
      'trainModelChange' | // 变车型
      'waterChange' |     // 上水调整
      'sewageChange' |    // 吸污调整
      'timeChange' |      // 变时间
      'stationChange'     // 变站名
    >;
    // 计划状态
    planStatus: 'synced' | 'pending' | 'locked';
    // 变更来源
    changeSource: 'manual' | 'kemo';
    // 变更摘要
    changeSummary: string;
    // 整体变更状态
    hasAnyChange: boolean;
    changeType: 'none' | 'yesterday' | 'kemo' | 'both';
    changeCount: number;
    // 被锁定的字段列表
    lockedFields: string[];
  };
}

// 模拟场景:
// 1. G100 (终到) -> G101 (始发)
// 2. K900 (终到) -> 0K900 (入库)
// 3. D200 (途径) -> 无接续
// 4. D201 (途径) -> D202 (接续示例)
// 5. G500 (始发) -> 无接续

// 计算变更类型辅助函数
function calculateDiffType(today: string | number | boolean, yesterday: string | number | boolean, kemo: string | number | boolean): 'none' | 'yesterday' | 'kemo' | 'both' {
  const diffYesterday = today !== yesterday;
  const diffKemo = today !== kemo;
  
  if (!diffYesterday && !diffKemo) return 'none';
  if (diffYesterday && !diffKemo) return 'yesterday';
  if (!diffYesterday && diffKemo) return 'kemo';
  return 'both';
}

// 生成计划变更信息
function generatePlanChangeInfo(today: TrainSchedule): TrainSchedule['planChangeInfo'] {
  // 根据车次生成不同的变更场景
  const trainNo = today.trainNo;
  
  // 场景1: 无变更 (G100)
  if (trainNo === 'G100') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: [],
      planStatus: 'synced',
      changeSource: 'manual',
      changeSummary: '无变更',
      hasAnyChange: false,
      changeType: 'none',
      changeCount: 0,
      lockedFields: []
    };
  }
  
  // 场景2: 昨日变更 (G101) - 股道变更 + 变股道业务类型
  if (trainNo === 'G101') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: '5', yesterday: '6', kemo: '5', diffType: 'yesterday' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['trackChange'],
      planStatus: 'pending',
      changeSource: 'manual',
      changeSummary: '股道由6道变更为5道',
      hasAnyChange: true,
      changeType: 'yesterday',
      changeCount: 1,
      lockedFields: []
    };
  }
  
  // 场景3: 客模变更 (D200) - 车型变更业务类型
  if (trainNo === 'D200') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
      formation: { today: 8, yesterday: 8, kemo: 16, diffType: 'kemo' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: 'CRH2A', diffType: 'kemo' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['trainModelChange', 'timeChange'],
      planStatus: 'pending',
      changeSource: 'kemo',
      changeSummary: '车型由CR400BF变更为CRH2A，到发时间由16:24/16:34变更为16:30/16:40',
      hasAnyChange: true,
      changeType: 'kemo',
      changeCount: 1,
      lockedFields: []
    };
  }
  
  // 场景4: 多方变更 (G8601) - 多个业务变更类型
  if (trainNo === 'G8601') {
    return {
      arrivalTime: { today: '10:00', yesterday: '10:05', kemo: '10:03', diffType: 'both' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: '3', yesterday: '5', kemo: '4', diffType: 'both' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: !today.tags.water, kemo: !today.tags.water, diffType: 'yesterday' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['trackChange', 'waterChange', 'stationChange'],
      planStatus: 'pending',
      changeSource: 'manual',
      changeSummary: '股道变更、上水作业调整、终到站由重庆北变更为重庆东',
      hasAnyChange: true,
      changeType: 'both',
      changeCount: 3,
      lockedFields: []
    };
  }
  
  // 场景5: 昨日变更 (D201) - 停运业务类型
  if (trainNo === 'D201') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
      departureTime: { today: '14:30', yesterday: '14:35', kemo: '14:30', diffType: 'yesterday' },
      track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['suspended'],
      planStatus: 'pending',
      changeSource: 'manual',
      changeSummary: '列车停运',
      hasAnyChange: true,
      changeType: 'yesterday',
      changeCount: 1,
      lockedFields: []
    };
  }
  
  // 场景6: 客模变更 (K900) - 吸污调整业务类型
  if (trainNo === 'K900') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: 'CRH5', yesterday: 'CRH5', kemo: 'CRH5', diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: false, kemo: true, diffType: 'kemo' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['sewageChange', 'reduced'],
      planStatus: 'pending',
      changeSource: 'kemo',
      changeSummary: '新增吸污作业、减少编组',
      hasAnyChange: true,
      changeType: 'kemo',
      changeCount: 1,
      lockedFields: []
    };
  }
  
  // 场景7: 新增车次 (G500) - 新增业务类型
  if (trainNo === 'G500') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: '-', kemo: today.arrival.time, diffType: 'kemo' },
      departureTime: { today: today.departure.time, yesterday: '-', kemo: today.departure.time, diffType: 'kemo' },
      track: { today: today.location.track, yesterday: '-', kemo: today.location.track, diffType: 'kemo' },
      formation: { today: today.attributes.formation, yesterday: 0, kemo: today.attributes.formation, diffType: 'kemo' },
      trainModel: { today: today.attributes.trainModel, yesterday: '-', kemo: today.attributes.trainModel, diffType: 'kemo' },
      water: { today: today.tags.water, yesterday: false, kemo: today.tags.water, diffType: 'kemo' },
      sewage: { today: today.tags.sewage, yesterday: false, kemo: today.tags.sewage, diffType: 'kemo' },
      parcel: { today: today.tags.parcel, yesterday: false, kemo: today.tags.parcel, diffType: 'kemo' },
      businessChangeTypes: ['added'],
      planStatus: 'pending',
      changeSource: 'manual',
      changeSummary: '新增车次',
      hasAnyChange: true,
      changeType: 'kemo',
      changeCount: 1,
      lockedFields: []
    };
  }
  
  // 场景8: 变终到站 (K9999) - 变终到站业务类型
  if (trainNo === 'K9999') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['stationChange'],
      planStatus: 'locked',
      changeSource: 'manual',
      changeSummary: '始发站由贵阳变更为重庆北、终到站由重庆北变更为重庆东',
      hasAnyChange: true,
      changeType: 'yesterday',
      changeCount: 1,
      lockedFields: ['destination']
    };
  }
  
  // 场景9: 变时间 (Z50)
  if (trainNo === 'Z50') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: '01:00', kemo: today.arrival.time, diffType: 'yesterday' },
      departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
      track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['timeChange'],
      planStatus: 'pending',
      changeSource: 'manual',
      changeSummary: '到发时间由01:00变更为01:20',
      hasAnyChange: true,
      changeType: 'yesterday',
      changeCount: 1,
      lockedFields: []
    };
  }

  // 场景10: 变股道 + 变时间 (G201)
  if (trainNo === 'G201') {
    return {
      arrivalTime: { today: today.arrival.time, yesterday: '08:45', kemo: '08:50', diffType: 'both' },
      departureTime: { today: today.departure.time, yesterday: '09:00', kemo: '09:05', diffType: 'both' },
      track: { today: today.location.track, yesterday: '9', kemo: '8', diffType: 'both' },
      formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
      trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
      water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
      sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
      parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
      businessChangeTypes: ['trackChange', 'timeChange'],
      planStatus: 'pending',
      changeSource: 'kemo',
      changeSummary: '股道由9道变更为10道，到发时间由08:45/09:00变更为09:00/09:15',
      hasAnyChange: true,
      changeType: 'both',
      changeCount: 2,
      lockedFields: []
    };
  }

  // 对于G2000+的车次，随机分配变更场景
  if (trainNo.startsWith('G2')) {
    const scenario = Math.floor(Math.random() * 10);
    switch(scenario) {
      case 0: // 变股道
        return {
          arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
          departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
          track: { today: today.location.track, yesterday: String(parseInt(today.location.track) + 1), kemo: today.location.track, diffType: 'yesterday' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
          water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
          sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['trackChange'],
          planStatus: 'pending',
          changeSource: 'manual',
          changeSummary: `股道由${parseInt(today.location.track) + 1}道变更为${today.location.track}道`,
          hasAnyChange: true,
          changeType: 'yesterday',
          changeCount: 1,
          lockedFields: []
        };
      case 1: // 变时间
        return {
          arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: '10:30', diffType: 'kemo' },
          departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: '10:45', diffType: 'kemo' },
          track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
          water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
          sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['timeChange'],
          planStatus: 'pending',
          changeSource: 'kemo',
          changeSummary: '到发时间调整',
          hasAnyChange: true,
          changeType: 'kemo',
          changeCount: 1,
          lockedFields: []
        };
      case 2: // 变车型
        return {
          arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
          departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
          track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation === 8 ? 16 : 8, diffType: 'kemo' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: 'CRH380A', diffType: 'kemo' },
          water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
          sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['trainModelChange'],
          planStatus: 'pending',
          changeSource: 'kemo',
          changeSummary: `车型由${today.attributes.trainModel}变更为CRH380A`,
          hasAnyChange: true,
          changeType: 'kemo',
          changeCount: 1,
          lockedFields: []
        };
      case 3: // 上水调整
        return {
          arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
          departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
          track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
          water: { today: today.tags.water, yesterday: !today.tags.water, kemo: today.tags.water, diffType: 'yesterday' },
          sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['waterChange'],
          planStatus: 'pending',
          changeSource: 'manual',
          changeSummary: '上水作业调整',
          hasAnyChange: true,
          changeType: 'yesterday',
          changeCount: 1,
          lockedFields: []
        };
      case 4: // 吸污调整
        return {
          arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
          departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
          track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
          water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
          sewage: { today: today.tags.sewage, yesterday: !today.tags.sewage, kemo: today.tags.sewage, diffType: 'yesterday' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['sewageChange'],
          planStatus: 'pending',
          changeSource: 'manual',
          changeSummary: '吸污作业调整',
          hasAnyChange: true,
          changeType: 'yesterday',
          changeCount: 1,
          lockedFields: []
        };
      case 5: // 变股道 + 变时间
        return {
          arrivalTime: { today: today.arrival.time, yesterday: '09:30', kemo: '09:35', diffType: 'both' },
          departureTime: { today: today.departure.time, yesterday: '09:45', kemo: '09:50', diffType: 'both' },
          track: { today: today.location.track, yesterday: '6', kemo: '7', diffType: 'both' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
          water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
          sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['trackChange', 'timeChange'],
          planStatus: 'pending',
          changeSource: 'kemo',
          changeSummary: '股道变更、到发时间变更',
          hasAnyChange: true,
          changeType: 'both',
          changeCount: 2,
          lockedFields: []
        };
      case 6: // 新增车次
        return {
          arrivalTime: { today: today.arrival.time, yesterday: '-', kemo: today.arrival.time, diffType: 'kemo' },
          departureTime: { today: today.departure.time, yesterday: '-', kemo: today.departure.time, diffType: 'kemo' },
          track: { today: today.location.track, yesterday: '-', kemo: today.location.track, diffType: 'kemo' },
          formation: { today: today.attributes.formation, yesterday: 0, kemo: today.attributes.formation, diffType: 'kemo' },
          trainModel: { today: today.attributes.trainModel, yesterday: '-', kemo: today.attributes.trainModel, diffType: 'kemo' },
          water: { today: today.tags.water, yesterday: false, kemo: today.tags.water, diffType: 'kemo' },
          sewage: { today: today.tags.sewage, yesterday: false, kemo: today.tags.sewage, diffType: 'kemo' },
          parcel: { today: today.tags.parcel, yesterday: false, kemo: today.tags.parcel, diffType: 'kemo' },
          businessChangeTypes: ['added'],
          planStatus: 'pending',
          changeSource: 'kemo',
          changeSummary: '新增车次',
          hasAnyChange: true,
          changeType: 'kemo',
          changeCount: 1,
          lockedFields: []
        };
      case 7: // 减少编组
        return {
          arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
          departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
          track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
          formation: { today: today.attributes.formation, yesterday: today.attributes.formation === 16 ? 8 : 16, kemo: today.attributes.formation, diffType: 'yesterday' },
          trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
          water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
          sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
          parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
          businessChangeTypes: ['reduced'],
          planStatus: 'pending',
          changeSource: 'manual',
          changeSummary: '减少编组',
          hasAnyChange: true,
          changeType: 'yesterday',
          changeCount: 1,
          lockedFields: []
        };
      default: // 无变更
        break;
    }
  }

  // 默认: 无变更
  return {
    arrivalTime: { today: today.arrival.time, yesterday: today.arrival.time, kemo: today.arrival.time, diffType: 'none' },
    departureTime: { today: today.departure.time, yesterday: today.departure.time, kemo: today.departure.time, diffType: 'none' },
    track: { today: today.location.track, yesterday: today.location.track, kemo: today.location.track, diffType: 'none' },
    formation: { today: today.attributes.formation, yesterday: today.attributes.formation, kemo: today.attributes.formation, diffType: 'none' },
    trainModel: { today: today.attributes.trainModel, yesterday: today.attributes.trainModel, kemo: today.attributes.trainModel, diffType: 'none' },
    water: { today: today.tags.water, yesterday: today.tags.water, kemo: today.tags.water, diffType: 'none' },
    sewage: { today: today.tags.sewage, yesterday: today.tags.sewage, kemo: today.tags.sewage, diffType: 'none' },
    parcel: { today: today.tags.parcel, yesterday: today.tags.parcel, kemo: today.tags.parcel, diffType: 'none' },
    businessChangeTypes: [],
    planStatus: 'synced',
    changeSource: 'yesterday',
    changeSummary: '无变更',
    hasAnyChange: false,
    changeType: 'none',
    changeCount: 0,
    lockedFields: []
  };
}

// Helper to generate route stations
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
  // Default random route
  let route = [
    { name: from, time: '10:00', departure: '10:00', type: 'stop', status: 'normal', currentStatus: 'passed', speedLimit: 120 },
    { name: '中间站A', time: '11:30', departure: '11:35', type: 'stop', status: 'normal', currentStatus: 'current', speedLimit: 200 },
    { name: '中间站B', time: '12:45', type: 'pass', status: 'normal', currentStatus: 'upcoming', speedLimit: 250 },
    { name: to, time: '14:00', type: 'stop', status: 'normal', currentStatus: 'upcoming', speedLimit: 120 }
  ];
  
  // Ensure passing trains include 重庆东
  if (status === 'pass' && !route.some(station => station.name === '重庆东')) {
    // Insert 重庆东 between the second and third station
    route.splice(2, 0, {
      name: '重庆东',
      time: '12:00',
      departure: '12:05',
      type: 'stop',
      status: 'normal',
      currentStatus: 'upcoming',
      speedLimit: 120
    });
    // Update currentStatus for stations after insertion
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
    
    // Count people (groups), not tasks
    const planned = 1;
    // "Arrived" means the first task (usually reporting for duty) is completed
    const arrived = g.items.length > 0 && !!g.items[0].actualTime ? 1 : 0;
    // "Finished" means all tasks in the group are completed
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
  
  // Apply staffing rules to planned counts:
  // Check-in: 1, Exit: 1, Water: 1, Platform: 2 (Agent + Duty Officer)
  if (hasCheckIn) init.checkIn.plannedCount = 1;
  if (hasExit) init.exit.plannedCount = 1;
  if (hasWater) init.water.plannedCount = 1;
  if (hasSewage) init.sewage.plannedCount = 1;
  if (hasParcel) init.parcel.plannedCount = 1;
  if (hasMeal) init.meal.plannedCount = 1;
  if (hasPlatform) init.platform.plannedCount = 2;
  
  // Determine overall status for the category
  Object.keys(init).forEach(key => {
    const k = key as keyof typeof init;
    if (init[k].plannedCount === 0) {
      init[k].status = 'absent';
    } else if (init[k].finishedCount === init[k].plannedCount) {
      // All staff finished all tasks
      init[k].status = 'completed';
    } else if (init[k].hasOverdue) {
      // Anyone missing and overdue -> Alarm (Red)
      // This takes precedence over 'active' to ensure users notice the issue
      init[k].status = 'alarm';
    } else if (init[k].actualCount > 0) {
      // Some staff arrived but not all finished, and no one is overdue -> Working (Active)
      init[k].status = 'active';
    } else {
      // No one arrived, not overdue yet
      init[k].status = 'pending';
    }
  });

  return init;
};

// Helper to generate passenger flow
const getPassengerFlow = (status: string) => {
  const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Rules:
  // Origin: Alighting is '--'
  // End: Boarding is '--'
  // Others: Random 1-2000
  
  const boarding = status === 'end' ? '--' : getRandom(1, 2000);
  const alighting = status === 'origin' ? '--' : getRandom(1, 2000);
  const transfer = getRandom(1, 500);
  const total = 1061; // Fixed capacity

  return {
    boarding,
    alighting,
    transfer,
    total
  };
};

// 获取当前时间，用于模拟开检条件
const now = dayjs();
const currentTime = now.format('HH:mm');
const timePlus5Min = now.add(5, 'minute').format('HH:mm');
const timePlus10Min = now.add(10, 'minute').format('HH:mm');
const timePlus15Min = now.add(15, 'minute').format('HH:mm');

export const mockTrainSchedules: TrainSchedule[] = [
  {
    id: uuidv4(),
    trainNo: 'G100',
    trainType: 'yellow', // 终到
    status: 'end',
    trainMaster: '北京/13812345678',
    runningSection: { from: '重庆西', to: '重庆东' },
    tags: {
      water: false, sewage: true, parcel: false, meal: false,
      overnight: false, turnaround: true, overcrowd: false, special: true,
      checkInReady: true
    },
    // 模拟前2趟车满足开检条件：发车时间在当前时间后5-15分钟内
    arrival: { time: timePlus5Min, actualTime: timePlus5Min, dispatchTime: timePlus5Min, lateEarly: '0' },
    departure: { time: timePlus15Min, actualTime: timePlus15Min, dispatchTime: timePlus15Min, lateEarly: '0' },
    attributes: { direction: 'up', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '紫色' },
    location: { track: '5', platform: '5', checkInGate: '-', exitGate: '北出站口', currentPos: '列车已到达' },
    devices: {
      broadcast: { value: '9/9', state: 'normal' },
      guide: { value: '6/6', state: 'normal' },
      gate: { value: '-', state: 'none' }
    },
    operations: {
      checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 2, plannedCount: 2, status: 'active' }
    },
    connection: { trainNo: 'G101', time: 15 }, // 终到接续始发
    passengerFlow: getPassengerFlow('end'),
    routeStations: getRouteStations('重庆西', '成都东', 'end'),
    station: '重庆东'
  },
  {
    id: uuidv4(),
    trainNo: 'G101',
    trainType: 'cyan', // 始发
    status: 'origin',
    trainMaster: '上海/13987654321',
    runningSection: { from: '重庆东', to: '贵阳北' },
    tags: {
      water: true, sewage: false, parcel: false, meal: true,
      overnight: false, turnaround: false, overcrowd: false, special: true,
      checkInReady: true
    },
    // 第二趟车也满足开检条件：发车时间在当前时间后10-20分钟内
    arrival: { time: timePlus10Min, actualTime: timePlus10Min, lateEarly: '0' },
    departure: { time: now.add(20, 'minute').format('HH:mm'), actualTime: now.add(20, 'minute').format('HH:mm'), lateEarly: '0' },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CRH380', landmarkColor: '蓝色' },
    location: { track: '5', platform: '5', checkInGate: 'A5', exitGate: '-', currentPos: '正在候车' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '5/5', state: 'normal' } 
    },
    operations: {
      checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
    },
    // 始发车没有接续车次
    passengerFlow: getPassengerFlow('origin'),
    routeStations: getRouteStations('成都东', '贵阳北', 'origin'),
    station: '重庆东'
  },
  {
    id: uuidv4(),
    trainNo: 'D200',
    trainType: 'purple', // 途径
    status: 'pass',
    trainMaster: '广州/13765432109',
    tags: {
      water: false, sewage: false, parcel: false, meal: false,
      overnight: false, turnaround: false, overcrowd: true, special: false,
      checkInReady: true
    },
    arrival: { time: '17:30', actualTime: '17:28', dispatchTime: '17:28', lateEarly: '-2' },
    departure: { time: '17:35', actualTime: '17:35', dispatchTime: '17:35', lateEarly: '0' },
    attributes: { direction: 'up', formation: 16, formationOrder: 'reverse', isCoupled: true, trainModel: 'CR400BF', landmarkColor: '黄色' },
    location: { track: '3', platform: '3', checkInGate: 'B3', exitGate: '西出站口', currentPos: '正在检票', trackChange: true, actualTrack: '4', actualPlatform: '4' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '5/5', state: 'normal' } 
    },
    operations: {
      checkIn: { actualCount: 1, plannedCount: 3, status: 'pending' },
      platform: { actualCount: 2, plannedCount: 3, status: 'pending' },
      exit: { actualCount: 2, plannedCount: 2, status: 'pending' }
    },
    // 途径车没有接续
    passengerFlow: getPassengerFlow('pass'),
    station: '重庆东'
  },
  {
    id: uuidv4(),
    trainNo: 'G8601',
    trainType: 'cyan',
    status: 'origin',
    trainMaster: '成都/13612349876',
    runningSection: { from: '重庆东', to: '黔江' },
    tags: {
      water: true, sewage: false, parcel: false, meal: true,
      overnight: false, turnaround: false, overcrowd: false, special: false,
      checkInReady: false
    },
    arrival: { time: '11:30', actualTime: '11:26', dispatchTime: '11:26', lateEarly: '-4' },
    departure: { time: '11:45', actualTime: '11:42', dispatchTime: '11:42', lateEarly: '-3' },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '蓝色' },
    location: { track: '7', platform: '7', checkInGate: 'A7', exitGate: '-', currentPos: '正在候车' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '5/5', state: 'normal' } 
    },
    operations: {
      checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
    },
    passengerFlow: getPassengerFlow('origin'),
    routeStations: getRouteStations('重庆东', '黔江', 'origin'),
    station: '重庆东'
  },
  {
    id: uuidv4(),
    trainNo: 'D201',
    departureTrainNo: 'D202',
    trainType: 'purple', // 途径
    status: 'pass',
    trainMaster: '北京/13812345678',
    runningSection: { from: '昆明南', to: '西安北' },
    tags: {
      water: false, sewage: false, parcel: true, meal: false,
      overnight: false, turnaround: false, overcrowd: false, special: false,
      checkInReady: false
    },
    arrival: { time: '10:35', actualTime: '10:40', dispatchTime: '10:40', lateEarly: '+5', isTdStopped: true },
    departure: { time: '10:43', actualTime: '10:48', dispatchTime: '10:48', lateEarly: '+5', isTdStopped: true },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CRH2A', landmarkColor: '绿色' },
    location: { track: '4', platform: '4', checkInGate: 'A4', exitGate: '东出站口', currentPos: '晚点未定' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '5/5', state: 'normal' } 
    },
    operations: {
      checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 2, plannedCount: 2, status: 'completed' }
    },
    connection: { trainNo: 'D202', time: 20 }, // 途径车有接续示例
    passengerFlow: getPassengerFlow('pass'),
    station: '重庆东'
  },
  {
    id: uuidv4(),
    trainNo: 'K900',
    trainType: 'yellow', // 终到
    status: 'end',
    trainMaster: '上海/13987654321',
    runningSection: { from: '达州', to: '重庆东' },
    tags: {
      water: true, sewage: true, parcel: true, meal: false,
      overnight: true, turnaround: false, overcrowd: false, special: false,
      checkInReady: false
    },
    arrival: { time: '18:00', actualTime: '18:00', lateEarly: '0' },
    departure: { time: '18:30', actualTime: '18:30', lateEarly: '0' },
    attributes: { direction: 'up', formation: 8, formationOrder: 'normal', isCoupled: true, trainModel: 'CRH5', landmarkColor: '无' },
    location: { track: '8', platform: '8', checkInGate: '-', exitGate: '北出站口', currentPos: '正点到达' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '-', state: 'none' } 
    },
    operations: {
      checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' },
      platform: { actualCount: 2, plannedCount: 3, status: 'pending' },
      exit: { actualCount: 2, plannedCount: 2, status: 'pending' }
    },
    connection: { trainNo: '0K900', time: 30 }, // 终到接续入库
    passengerFlow: getPassengerFlow('end'),
  },
  {
    id: uuidv4(),
    trainNo: '0K900',
    trainType: 'default', // 入库车次
    status: 'origin',
    trainMaster: '广州/13765432109',
    runningSection: { from: '重庆东', to: '重庆南车辆段' },
    tags: {
      water: false, sewage: false, parcel: false, meal: false,
      overnight: false, turnaround: false, overcrowd: false, special: false,
      checkInReady: false
    },
    arrival: { time: '18:30', actualTime: '18:30', lateEarly: '0' },
    departure: { time: '19:00', actualTime: '19:00', lateEarly: '0' },
    attributes: { direction: 'down', formation: 16, formationOrder: 'normal', isCoupled: false, trainModel: 'CRH5', landmarkColor: '无' },
    location: { track: '调车', platform: '-', checkInGate: '-', exitGate: '-', currentPos: '列车离站' },
    devices: { 
      broadcast: { value: '-', state: 'none' }, 
      guide: { value: '-', state: 'none' }, 
      gate: { value: '-', state: 'none' } 
    },
    operations: {
      checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' },
      platform: { actualCount: 0, plannedCount: 3, status: 'absent' },
      exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
    },
    // 入库示例
    passengerFlow: getPassengerFlow('origin'),
  },
  {
    id: uuidv4(),
    trainNo: 'G500',
    trainType: 'cyan', // 始发
    status: 'origin',
    trainMaster: '北京/13812345678',
    runningSection: { from: '重庆东', to: '北京西' },
    tags: {
      water: true, sewage: false, parcel: false, meal: true,
      overnight: false, turnaround: false, overcrowd: false, special: true,
      checkInReady: false
    },
    arrival: { time: '18:15', actualTime: '18:15', lateEarly: '0' },
    departure: { time: '18:30', actualTime: '18:30', lateEarly: '0' },
    attributes: { direction: 'down', formation: 16, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '蓝色' },
    location: { track: '2', platform: '2', checkInGate: 'A2', exitGate: '-', currentPos: '停止检票' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '5/5', state: 'normal' } 
    },
    operations: {
      checkIn: { actualCount: 1, plannedCount: 3, status: 'pending' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
    },
    // 始发无接续
    passengerFlow: getPassengerFlow('origin'),
  },
  {
    id: uuidv4(),
    trainNo: 'K9999',
    trainType: 'yellow',
    status: 'end',
    trainMaster: '上海/13987654321',
    runningSection: { from: '北京西', to: '重庆东' },
    tags: {
      water: false, sewage: false, parcel: false, meal: false,
      overnight: false, turnaround: false, overcrowd: false, special: false
    },
    arrival: { time: '00:30', actualTime: '00:30', lateEarly: '0', crossDay: true },
    departure: { time: '-', actualTime: '-', lateEarly: '-' },
    attributes: { direction: 'down', formation: 18, formationOrder: 'normal', isCoupled: false, trainModel: '25K', landmarkColor: '无' },
    location: { track: '8', platform: '8', checkInGate: '-', exitGate: '东出站口', currentPos: '停运' },
    devices: { 
      broadcast: { value: '-/-', state: 'none' }, 
      guide: { value: '-/-', state: 'none' }, 
      gate: { value: '-', state: 'none' } 
    },
    operations: {
      checkIn: { actualCount: 0, plannedCount: 0, status: 'none' },
      platform: { actualCount: 0, plannedCount: 0, status: 'none' },
      exit: { actualCount: 0, plannedCount: 0, status: 'none' }
    },
    passengerFlow: getPassengerFlow('end'),
  },
  { id: uuidv4(),
    trainNo: 'Z50',
    trainType: 'default',
    status: 'end',
    trainMaster: '广州/13765432109',
    runningSection: { from: '拉萨', to: '重庆东' },
    tags: {
      water: true, sewage: true, parcel: false, meal: false,
      overnight: true, turnaround: false, overcrowd: false, special: false
    },
    arrival: { time: '01:20', actualTime: '01:20', lateEarly: '0', crossDay: true },
    departure: { time: '-', actualTime: '-', lateEarly: '-' },
    attributes: { direction: 'up', formation: 18, formationOrder: 'normal', isCoupled: false, trainModel: '25G', landmarkColor: '橙色' },
    location: { track: '9', platform: '9', checkInGate: '-', exitGate: '北出站口', currentPos: '晚点未定' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '-', state: 'none' } 
    },
    operations: {
      checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' },
      platform: { actualCount: 2, plannedCount: 3, status: 'pending' },
      exit: { actualCount: 2, plannedCount: 2, status: 'pending' }
    },
    passengerFlow: getPassengerFlow('end'),
  },
  { id: uuidv4(),
    trainNo: 'G201',
    trainType: 'cyan',
    status: 'origin',
    trainMaster: '北京/13812345678',
    runningSection: { from: '重庆东', to: '上海虹桥' },
    tags: {
      water: true, sewage: false, parcel: false, meal: true,
      overnight: false, turnaround: false, overcrowd: false, special: true,
      checkInReady: true
    },
    arrival: { time: '09:00', actualTime: '09:00', lateEarly: '0' },
    departure: { time: '09:15', actualTime: '09:15', lateEarly: '0' },
    attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '蓝色' },
    location: { track: '10', platform: '10', checkInGate: 'A10', exitGate: '-', currentPos: '正在候车', trackChange: true, actualTrack: '9G/9' },
    devices: { 
      broadcast: { value: '9/9', state: 'normal' }, 
      guide: { value: '6/6', state: 'normal' }, 
      gate: { value: '5/5', state: 'normal' } 
    },
    operations: {
      checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
      platform: { actualCount: 2, plannedCount: 3, status: 'active' },
      exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
    },
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

// Generate more mock data to reach 60 entries
const generateMoreMockData = (count: number) => {
  const stations = ['重庆北', '贵阳北', '西安北', '昆明南', '绵阳', '德阳', '乐山', '宜宾', '广元', '达州'];
  const trainTypes: ('cyan' | 'purple' | 'yellow' | 'default')[] = ['cyan', 'purple', 'yellow', 'default'];
  const statuses: ('origin' | 'pass' | 'end')[] = ['origin', 'pass', 'end'];
  const trainMasters = ['北京/13812345678', '上海/13987654321', '广州/13765432109'];

  for (let i = 0; i < count; i++) {
    const isEven = i % 2 === 0;
    const trainNo = `G${2000 + i}`;
    const status = statuses[i % 3];
    const trainType = trainTypes[i % 4];
    const trainMaster = trainMasters[i % 3];
    
    let fromStation = stations[Math.floor(Math.random() * stations.length)];
    let toStation = stations[Math.floor(Math.random() * stations.length)];
    // Ensure from != to
    while (fromStation === toStation) {
      toStation = stations[Math.floor(Math.random() * stations.length)];
    }

    if (status === 'origin') {
      fromStation = '重庆东';
    } else if (status === 'end') {
      toStation = '重庆东';
    }

    // Determine status based on train type
    let currentPos = '';
    if (status === 'end') {
      // Arrival: ['正点到达', '停运', '晚点未定', '列车已到达']
      const endStatuses = ['正点到达', '正点到达', '正点到达', '列车已到达', '列车已到达', '停运', '晚点未定'];
      currentPos = endStatuses[Math.floor(Math.random() * endStatuses.length)];
    } else {
      // Departure/Through: ['正在候车', '', '停运预告', '准备检票', '正在检票', '停止检票', '晚点未定', '列车离站']
      const depStatuses = ['正在候车', '正在候车', '正在候车', '准备检票', '正在检票', '停止检票', '晚点未定', '列车离站', '停运预告'];
      currentPos = depStatuses[Math.floor(Math.random() * depStatuses.length)];
    }

    const hour = 10 + Math.floor(i/4);
      const minute = 10 + (i%4)*15;
      const planTime = new Date();
      planTime.setHours(hour, minute, 0, 0);
      
      const isLate = Math.random() > 0.8;
      const isEarly = !isLate && Math.random() > 0.9; // 10% chance to be early if not late
      const lateMinutes = isLate ? Math.floor(Math.random() * 10) + 1 : (isEarly ? -(Math.floor(Math.random() * 10) + 1) : 0);
      const actualTime = new Date(planTime.getTime() + lateMinutes * 60000);
      
      const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      const planTimeStr = formatTime(planTime);
      const actualTimeStr = formatTime(actualTime);
      const lateEarlyStr = lateMinutes === 0 ? '0' : (lateMinutes > 0 ? `+${lateMinutes}` : `${lateMinutes}`);

      const isCoupled = Math.random() > 0.8;
      const formation = isCoupled ? 8 : (Math.random() > 0.5 ? 8 : 16);
      
      mockTrainSchedules.push({
        id: uuidv4(),
        trainNo: trainNo,
        trainType: trainType,
        status: status,
        trainMaster: trainMaster,
        runningSection: { 
          from: fromStation, 
          to: toStation 
        },
        tags: {
          water: Math.random() > 0.8,
          sewage: Math.random() > 0.8,
          parcel: Math.random() > 0.8,
          meal: Math.random() > 0.8,
          overnight: Math.random() > 0.9,
          turnaround: Math.random() > 0.7,
          overcrowd: Math.random() > 0.9,
          special: Math.random() > 0.95,
          checkInReady: i === 0 // G2000 开检就绪
        },
        arrival: { 
          time: planTimeStr, 
          actualTime: actualTimeStr, 
          dispatchTime: actualTimeStr,
          lateEarly: lateEarlyStr
        },
        departure: { 
          time: `${hour}:${25 + (i%4)*15}`, 
          actualTime: `${hour}:${25 + (i%4)*15}`, 
          dispatchTime: `${hour}:${25 + (i%4)*15}`,
          lateEarly: '0' 
        },
      attributes: { 
        direction: Math.random() > 0.5 ? 'up' : 'down', 
        formation: formation,
        formationOrder: 'normal',
        isCoupled: isCoupled,
        trainModel: ['CR400AF', 'CRH380', 'CRH2A', 'CR400BF'][Math.floor(Math.random() * 4)],
        landmarkColor: ['紫色', '蓝色', '黄色', '绿色', '橙色'][Math.floor(Math.random() * 5)]
      },
      location: { 
        track: `${(i % 10) + 1}`, 
        platform: `${(i % 10) + 1}`, 
        checkInGate: `A${(i % 10) + 1}`, 
        exitGate: '东出站口', 
        currentPos: currentPos 
      },
      devices: { 
        broadcast: { value: '9/9', state: Math.random() > 0.9 ? 'abnormal' : 'normal' }, 
        guide: { value: '6/6', state: Math.random() > 0.9 ? 'abnormal' : 'normal' }, 
        gate: { value: '5/5', state: Math.random() > 0.9 ? 'abnormal' : 'normal' } 
      },
      operations: {
        checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
        platform: { actualCount: 2, plannedCount: 3, status: 'active' },
        exit: { actualCount: 2, plannedCount: 2, status: 'active' }
      },
      passengerFlow: getPassengerFlow(status),
      routeStations: getRouteStations(fromStation, toStation, status),
      jointOperations: (() => {
        // 只有G2001显示完整4个作业
        if (trainNo === 'G2001') {
          const allJobs = [
            { id: 'water', name: '上水', person: '张三' },
            { id: 'sewage', name: '吸污', person: '张少三' },
            { id: 'meal', name: '送餐', person: '王雯' },
            { id: 'express', name: '快运', person: '李叔同' }
          ];
          return allJobs.map(job => ({
            ...job,
            status: Math.random() > 0.3 ? 'green' as const : 'red' as const
          }));
        }
        
        // 其他车次随机显示4种情况之一：
        // 1. 只有上水
        // 2. 只有吸污
        // 3. 上水+吸污
        // 4. 没有作业
        const mode = Math.floor(Math.random() * 4);
        const jobs: any[] = [];
        
        if (mode === 0) {
          // 只有上水
          jobs.push({ id: 'water', name: '上水', person: '张三', status: Math.random() > 0.3 ? 'green' as const : 'red' as const });
        } else if (mode === 1) {
          // 只有吸污
          jobs.push({ id: 'sewage', name: '吸污', person: '张少三', status: Math.random() > 0.3 ? 'green' as const : 'red' as const });
        } else if (mode === 2) {
          // 上水+吸污
          jobs.push({ id: 'water', name: '上水', person: '张三', status: Math.random() > 0.3 ? 'green' as const : 'red' as const });
          jobs.push({ id: 'sewage', name: '吸污', person: '张少三', status: Math.random() > 0.3 ? 'green' as const : 'red' as const });
        }
        // mode 3: 没有作业
        
        return jobs;
      })()
    });
  }
};

generateMoreMockData(55); // Generate 55 more to reach ~60 total

// 为所有现有数据添加 station 字段（默认为重庆东）
mockTrainSchedules.forEach(train => {
  if (!train.station) {
    train.station = '重庆东';
  }
});

// ==================== 巴南站模拟数据 ====================
const generateBanNanData = () => {
  const banNanTrains: TrainSchedule[] = [
    {
      id: uuidv4(),
      trainNo: 'G3001',
      trainType: 'cyan',
      status: 'origin',
      trainMaster: '成都/13811112222',
      runningSection: { from: '巴南', to: '重庆东' },
      tags: {
        water: true, sewage: false, parcel: false, meal: true,
        overnight: false, turnaround: false, overcrowd: true, special: false, // 异常：超员
        checkInReady: true
      },
      arrival: { time: '08:00', actualTime: '08:00', lateEarly: '0' },
      departure: { time: '08:15', actualTime: '08:15', lateEarly: '0' },
      attributes: { direction: 'up', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400AF', landmarkColor: '蓝色' },
      location: { track: '1', platform: '1', checkInGate: 'A1', exitGate: '-', currentPos: '正在作业' },
      devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
      operations: { checkIn: { actualCount: 2, plannedCount: 3, status: 'active' }, platform: { actualCount: 3, plannedCount: 3, status: 'active' }, exit: { actualCount: 0, plannedCount: 2, status: 'absent' } },
      passengerFlow: getPassengerFlow('origin'),
      station: '巴南',
      operationStatus: 'operating' // 正在作业
    },
    {
      id: uuidv4(),
      trainNo: 'G3002',
      trainType: 'yellow',
      status: 'end',
      trainMaster: '北京/13922223333',
      runningSection: { from: '贵阳北', to: '巴南' },
      tags: {
        water: false, sewage: true, parcel: false, meal: false,
        overnight: false, turnaround: false, overcrowd: false, special: true, // 异常：专运
        checkInReady: false
      },
      arrival: { time: '09:30', actualTime: '09:35', lateEarly: '+5' },
      departure: { time: '09:45', actualTime: '09:50', lateEarly: '+5' },
      attributes: { direction: 'down', formation: 16, formationOrder: 'normal', isCoupled: false, trainModel: 'CRH380', landmarkColor: '黄色' },
      location: { track: '2', platform: '2', checkInGate: '-', exitGate: '南出站口', currentPos: '晚点未定' },
      devices: { broadcast: { value: '9/9', state: 'abnormal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '-', state: 'none' } },
      operations: { checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' }, platform: { actualCount: 2, plannedCount: 3, status: 'active' }, exit: { actualCount: 2, plannedCount: 2, status: 'pending' } },
      passengerFlow: getPassengerFlow('end'),
      station: '巴南'
    },
    {
      id: uuidv4(),
      trainNo: 'D3003',
      trainType: 'purple',
      status: 'pass',
      trainMaster: '广州/13733334444',
      runningSection: { from: '昆明南', to: '西安北' },
      tags: {
        water: false, sewage: false, parcel: true, meal: false,
        overnight: false, turnaround: false, overcrowd: false, special: false,
        checkInReady: true
      },
      arrival: { time: '10:00', actualTime: '10:00', lateEarly: '0' },
      departure: { time: '10:05', actualTime: '10:05', lateEarly: '0' },
      attributes: { direction: 'up', formation: 8, formationOrder: 'reverse', isCoupled: true, trainModel: 'CRH2A', landmarkColor: '绿色' },
      location: { track: '3', platform: '3', checkInGate: 'B3', exitGate: '西出站口', currentPos: '正在检票' },
      devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
      operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'active' }, platform: { actualCount: 2, plannedCount: 3, status: 'active' }, exit: { actualCount: 2, plannedCount: 2, status: 'pending' } },
      passengerFlow: getPassengerFlow('pass'),
      station: '巴南'
    },
    {
      id: uuidv4(),
      trainNo: 'G3004',
      trainType: 'cyan',
      status: 'origin',
      trainMaster: '上海/13644445555',
      runningSection: { from: '巴南', to: '贵阳北' },
      tags: {
        water: true, sewage: false, parcel: false, meal: true,
        overnight: false, turnaround: false, overcrowd: false, special: false,
        checkInReady: false
      },
      arrival: { time: '11:00', actualTime: '11:00', lateEarly: '0' },
      departure: { time: '11:20', actualTime: '11:20', lateEarly: '0' },
      attributes: { direction: 'down', formation: 8, formationOrder: 'normal', isCoupled: false, trainModel: 'CR400BF', landmarkColor: '蓝色' },
      location: { track: '1', platform: '1', checkInGate: 'A1', exitGate: '-', currentPos: '正在候车' },
      devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '5/5', state: 'normal' } },
      operations: { checkIn: { actualCount: 1, plannedCount: 3, status: 'pending' }, platform: { actualCount: 2, plannedCount: 3, status: 'active' }, exit: { actualCount: 0, plannedCount: 2, status: 'absent' } },
      passengerFlow: getPassengerFlow('origin'),
      station: '巴南'
    },
    {
      id: uuidv4(),
      trainNo: 'K3005',
      trainType: 'yellow',
      status: 'end',
      trainMaster: '武汉/13555556666',
      runningSection: { from: '达州', to: '巴南' },
      tags: {
        water: true, sewage: true, parcel: true, meal: false,
        overnight: true, turnaround: false, overcrowd: false, special: false,
        checkInReady: false
      },
      arrival: { time: '12:00', actualTime: '12:00', lateEarly: '0' },
      departure: { time: '12:30', actualTime: '12:30', lateEarly: '0' },
      attributes: { direction: 'up', formation: 8, formationOrder: 'normal', isCoupled: true, trainModel: 'CRH5', landmarkColor: '无' },
      location: { track: '4', platform: '4', checkInGate: '-', exitGate: '北出站口', currentPos: '正点到达' },
      devices: { broadcast: { value: '9/9', state: 'normal' }, guide: { value: '6/6', state: 'normal' }, gate: { value: '-', state: 'none' } },
      operations: { checkIn: { actualCount: 0, plannedCount: 3, status: 'absent' }, platform: { actualCount: 2, plannedCount: 3, status: 'pending' }, exit: { actualCount: 2, plannedCount: 2, status: 'pending' } },
      passengerFlow: getPassengerFlow('end'),
      station: '巴南'
    }
  ];
  
  // 添加更多巴南数据
  for (let i = 0; i < 20; i++) {
    const isOperating = i === 5; // 第6条为正在作业
    const isAbnormal = i === 3 || i === 7; // 第4、8条为异常
    
    banNanTrains.push({
      id: uuidv4(),
      trainNo: `G${3100 + i}`,
      trainType: ['cyan', 'purple', 'yellow', 'default'][i % 4] as 'cyan' | 'purple' | 'yellow' | 'default',
      status: ['origin', 'pass', 'end'][i % 3] as 'origin' | 'pass' | 'end',
      trainMaster: ['成都/13811112222', '北京/13922223333', '广州/13733334444'][i % 3],
      runningSection: { 
        from: i % 3 === 0 ? '巴南' : ['贵阳北', '昆明南', '西安北'][i % 3], 
        to: i % 3 === 2 ? '巴南' : ['重庆东', '成都东', '贵阳北'][i % 3] 
      },
      tags: {
        water: i % 4 === 0,
        sewage: i % 5 === 0,
        parcel: i % 6 === 0,
        meal: i % 3 === 0,
        overnight: i % 7 === 0,
        turnaround: i % 8 === 0,
        overcrowd: isAbnormal, // 异常标记
        special: isAbnormal && i === 3, // 专运异常
        checkInReady: i === 10
      },
      arrival: { 
        time: `${8 + Math.floor(i/4)}:${10 + (i%4)*15}`, 
        actualTime: `${8 + Math.floor(i/4)}:${10 + (i%4)*15}`, 
        lateEarly: '0' 
      },
      departure: { 
        time: `${8 + Math.floor(i/4)}:${25 + (i%4)*15}`, 
        actualTime: `${8 + Math.floor(i/4)}:${25 + (i%4)*15}`, 
        lateEarly: '0' 
      },
      attributes: { 
        direction: i % 2 === 0 ? 'up' : 'down', 
        formation: i % 3 === 0 ? 16 : 8,
        formationOrder: i % 2 === 0 ? 'normal' : 'reverse',
        isCoupled: i % 4 === 0,
        trainModel: ['CR400AF', 'CRH380', 'CRH2A', 'CR400BF'][i % 4],
        landmarkColor: ['紫色', '蓝色', '黄色', '绿色', '橙色'][i % 5]
      },
      location: { 
        track: `${(i % 4) + 1}`, 
        platform: `${(i % 4) + 1}`, 
        checkInGate: i % 3 === 2 ? '-' : `A${(i % 4) + 1}`, 
        exitGate: i % 3 === 0 ? '-' : ['南出站口', '北出站口'][i % 2], 
        currentPos: ['正在候车', '正在检票', '停止检票', '正点到达'][i % 4]
      },
      devices: { 
        broadcast: { value: '9/9', state: 'normal' }, 
        guide: { value: '6/6', state: 'normal' }, 
        gate: { value: i % 3 === 2 ? '-' : '5/5', state: i % 3 === 2 ? 'none' : 'normal' } 
      },
      operations: {
        checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
        platform: { actualCount: 2, plannedCount: 3, status: 'active' },
        exit: { actualCount: i % 3 === 2 ? 2 : 0, plannedCount: 2, status: i % 3 === 2 ? 'active' : 'absent' }
      },
      passengerFlow: getPassengerFlow(['origin', 'pass', 'end'][i % 3] as 'origin' | 'pass' | 'end'),
      station: '巴南',
      operationStatus: isOperating ? 'operating' : 'pending'
    });
  }
  
  mockTrainSchedules.push(...banNanTrains);
};

generateBanNanData();

// ==================== 南川北站模拟数据 ====================
const generateNanChuanData = () => {
  const nanChuanTrains: TrainSchedule[] = [];
  
  for (let i = 0; i < 12; i++) {
    nanChuanTrains.push({
      id: uuidv4(),
      trainNo: `G${3200 + i}`,
      trainType: ['cyan', 'purple', 'yellow'][i % 3] as 'cyan' | 'purple' | 'yellow',
      status: ['origin', 'pass', 'end'][i % 3] as 'origin' | 'pass' | 'end',
      trainMaster: ['成都/13811112222', '北京/13922223333'][i % 2],
      runningSection: { 
        from: i % 3 === 0 ? '南川北' : ['重庆东', '巴南'][i % 2], 
        to: i % 3 === 2 ? '南川北' : ['贵阳北', '昆明南'][i % 2] 
      },
      tags: {
        water: i % 3 === 0,
        sewage: i % 4 === 0,
        parcel: i % 5 === 0,
        meal: i % 6 === 0,
        overnight: false,
        turnaround: i % 7 === 0,
        overcrowd: false,
        special: i === 5,
        checkInReady: i === 0
      },
      arrival: { 
        time: `${9 + Math.floor(i/3)}:${(i%3)*20}`, 
        actualTime: `${9 + Math.floor(i/3)}:${(i%3)*20}`, 
        lateEarly: '0' 
      },
      departure: { 
        time: `${9 + Math.floor(i/3)}:${10 + (i%3)*20}`, 
        actualTime: `${9 + Math.floor(i/3)}:${10 + (i%3)*20}`, 
        lateEarly: '0' 
      },
      attributes: { 
        direction: i % 2 === 0 ? 'up' : 'down', 
        formation: 8,
        formationOrder: 'normal',
        isCoupled: false,
        trainModel: ['CR400AF', 'CRH380'][i % 2],
        landmarkColor: ['蓝色', '黄色'][i % 2]
      },
      location: { 
        track: `${(i % 2) + 1}`, 
        platform: `${(i % 2) + 1}`, 
        checkInGate: i % 3 === 2 ? '-' : `A${(i % 2) + 1}`, 
        exitGate: i % 3 === 0 ? '-' : '出站口', 
        currentPos: ['正在候车', '正在检票'][i % 2]
      },
      devices: { 
        broadcast: { value: '9/9', state: 'normal' }, 
        guide: { value: '6/6', state: 'normal' }, 
        gate: { value: i % 3 === 2 ? '-' : '5/5', state: i % 3 === 2 ? 'none' : 'normal' } 
      },
      operations: {
        checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
        platform: { actualCount: 2, plannedCount: 3, status: 'active' },
        exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
      },
      passengerFlow: getPassengerFlow(['origin', 'pass', 'end'][i % 3] as 'origin' | 'pass' | 'end'),
      station: '南川北'
    });
  }
  
  mockTrainSchedules.push(...nanChuanTrains);
};

generateNanChuanData();

// ==================== 水江西站模拟数据 ====================
const generateShuiJiangData = () => {
  const shuiJiangTrains: TrainSchedule[] = [];
  
  for (let i = 0; i < 8; i++) {
    shuiJiangTrains.push({
      id: uuidv4(),
      trainNo: `G${3300 + i}`,
      trainType: ['cyan', 'purple'][i % 2] as 'cyan' | 'purple',
      status: ['origin', 'pass', 'end'][i % 3] as 'origin' | 'pass' | 'end',
      trainMaster: ['广州/13733334444', '武汉/13555556666'][i % 2],
      runningSection: { 
        from: i % 3 === 0 ? '水江西' : ['重庆东', '南川北'][i % 2], 
        to: i % 3 === 2 ? '水江西' : ['巴南', '贵阳北'][i % 2] 
      },
      tags: {
        water: i % 2 === 0,
        sewage: i % 3 === 0,
        parcel: false,
        meal: i % 4 === 0,
        overnight: false,
        turnaround: false,
        overcrowd: false,
        special: false,
        checkInReady: i === 2
      },
      arrival: { 
        time: `${10 + Math.floor(i/2)}:${(i%2)*30}`, 
        actualTime: `${10 + Math.floor(i/2)}:${(i%2)*30}`, 
        lateEarly: '0' 
      },
      departure: { 
        time: `${10 + Math.floor(i/2)}:${15 + (i%2)*30}`, 
        actualTime: `${10 + Math.floor(i/2)}:${15 + (i%2)*30}`, 
        lateEarly: '0' 
      },
      attributes: { 
        direction: i % 2 === 0 ? 'up' : 'down', 
        formation: 8,
        formationOrder: 'normal',
        isCoupled: false,
        trainModel: 'CRH2A',
        landmarkColor: '绿色'
      },
      location: { 
        track: '1', 
        platform: '1', 
        checkInGate: i % 3 === 2 ? '-' : 'A1', 
        exitGate: i % 3 === 0 ? '-' : '出站口', 
        currentPos: ['正在候车', '正在检票'][i % 2]
      },
      devices: { 
        broadcast: { value: '9/9', state: 'normal' }, 
        guide: { value: '6/6', state: 'normal' }, 
        gate: { value: i % 3 === 2 ? '-' : '5/5', state: i % 3 === 2 ? 'none' : 'normal' } 
      },
      operations: {
        checkIn: { actualCount: 1, plannedCount: 3, status: 'active' },
        platform: { actualCount: 2, plannedCount: 3, status: 'active' },
        exit: { actualCount: 0, plannedCount: 2, status: 'absent' }
      },
      passengerFlow: getPassengerFlow(['origin', 'pass', 'end'][i % 3] as 'origin' | 'pass' | 'end'),
      station: '水江西'
    });
  }
  
  mockTrainSchedules.push(...shuiJiangTrains);
};

generateShuiJiangData();

// ==================== 客运记录数据 ====================

// 客运记录数据接口
export interface PassengerRecord {
  id: string;
  recordNo: string;
  trainNo: string;
  arrivalDate: string;
  recordType: 'lost' | 'special' | 'handover' | 'other';
  recordTypeName: string;
  direction: 'departure' | 'arrival'; // 发/到
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
    currentNode: {
      station: '北京西',
      contactName: '李飞',
      contactPhone: '12345678901',
      status: '列车待接取'
    },
    transferRecords: [
      { id: '1', description: 'G57(2025-08-04始发)' },
      { id: '2', description: '石家庄' }
    ]
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
    currentNode: {
      station: '成都东',
      contactName: '王芳',
      contactPhone: '13800138000',
      status: '等待到达'
    },
    transferRecords: [
      { id: '1', description: '重庆西(2025-08-04始发)' },
      { id: '2', description: '内江北' },
      { id: '3', description: '成都东' }
    ]
  },
  {
    id: uuidv4(),
    recordNo: '京202508040000003',
    trainNo: 'D200',
    arrivalDate: '2025-08-04',
    recordType: 'handover',
    recordTypeName: '交接班',
    direction: 'departure',
    status: '已完成',
    appeal: '交接班事项：列车长交接班，请确认车厢内设备完好，无遗留问题。',
    itemList: '交接班记录、设备检查单',
    currentNode: {
      station: '西安北',
      contactName: '张伟',
      contactPhone: '13900139000',
      status: '已交接'
    },
    transferRecords: [
      { id: '1', description: '西安北(2025-08-04始发)' },
      { id: '2', description: '汉中' },
      { id: '3', description: '广元' },
      { id: '4', description: '成都东' }
    ]
  },
  {
    id: uuidv4(),
    recordNo: '京202508040000004',
    trainNo: 'G2826',
    arrivalDate: '2025-08-04',
    recordType: 'lost',
    recordTypeName: '遗失物品',
    direction: 'arrival',
    status: '待认领',
    appeal: '遗失物品登记：在车厢内发现一部苹果手机，已妥善保管，请失主联系认领。',
    itemList: 'iPhone 15 Pro 一部，黑色手机壳',
    currentNode: {
      station: '昆明南',
      contactName: '刘洋',
      contactPhone: '13700137000',
      status: '等待认领'
    },
    transferRecords: [
      { id: '1', description: '成都东(2025-08-04始发)' },
      { id: '2', description: '贵阳北' },
      { id: '3', description: '昆明南' }
    ]
  },
  {
    id: uuidv4(),
    recordNo: '京202508040000005',
    trainNo: 'K900',
    arrivalDate: '2025-08-04',
    recordType: 'other',
    recordTypeName: '其他事项',
    direction: 'departure',
    status: '处理中',
    appeal: '特殊旅客服务：携带婴儿旅客需要母婴室服务，请提前准备。',
    itemList: '母婴室预约、行李协助',
    currentNode: {
      station: '北京西',
      contactName: '陈静',
      contactPhone: '13600136000',
      status: '准备中'
    },
    transferRecords: [
      { id: '1', description: '北京西(2025-08-04始发)' },
      { id: '2', description: '石家庄' },
      { id: '3', description: '郑州东' }
    ]
  }
];

// 为所有车次生成计划变更信息
mockTrainSchedules.forEach(train => {
  train.planChangeInfo = generatePlanChangeInfo(train);
});
