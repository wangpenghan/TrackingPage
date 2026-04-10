export interface TrainTask {
  id: string;
  type: '检票' | '站台' | '出站' | '上水' | '吸污';
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
}

export interface TrainData {
  id: string;
  trainNo: string;
  trainType?: 'G' | 'D' | 'C';
  direction: 'up' | 'down';
  lineDirection?: '上' | '下';
  arrivalTime: string;
  departureTime: string;
  track: string;
  status: 'normal' | 'early' | 'late';
  delayMinutes: number;
  stopMinutes?: number;
  serviceType: 'origin' | 'destination' | 'transit';
  connectionId?: string;
  panelId: string;
  workStatus: 'notExecuted' | 'executing' | 'completed' | 'abnormal';
  // 编组信息
  formationCount?: 8 | 16;
  formation?: number;
  sequenceType?: '正' | '倒';
  formationOrder?: 'normal' | 'reverse';
  trainDirection?: 'up' | 'down';
  // 运行区间
  from?: string;
  to?: string;
  runningSection?: {
    from: string;
    to: string;
  };
  // 作业任务
  tasks?: TrainTask[];
  // 客流信息
  passengerFlow?: {
    boarding: number;
    alighting: number;
    transfer: number;
  };
  // 列车长
  trainMaster?: string;
  // 标签
  tags?: {
    water: boolean;
    sewage: boolean;
    parcel: boolean;
    meal: boolean;
    overnight: boolean;
    turnaround: boolean;
    overcrowd: boolean;
    special: boolean;
    checkInReady: boolean;
  };
}

export interface TrainPosition {
  train: TrainData;
  left: number;
  width: number;
  stopBarWidth: number;
}

export interface Lane {
  id: string;
  name: string;
  direction: 'up' | 'down';
  trains: TrainPosition[];
}

export interface Panel {
  id: string;
  name: string;
  lanes: Lane[];
}

export interface Connection {
  trainNo: string;
  from: {
    panelId: string;
    panelName: string;
    x: number;
    y: number;
    time: string;
  };
  to: {
    panelId: string;
    panelName: string;
    x: number;
    y: number;
    time: string;
  };
  isSelected: boolean;
}

export interface TimeRange {
  start: number;
  end: number;
}
