import dayjs from 'dayjs';

export type TrainType = 'origin' | 'through' | 'terminating' | 'connected';

export interface WorkItem {
  location: string;
  content: string;
  planTime: string;
  actualTime?: string;
  status: 'completed' | 'late' | 'pending' | 'abnormal';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  workItems: WorkItem[];
}

export interface Task {
  id: string;
  type: 'check_in' | 'platform' | 'exit' | 'water_sewage';
  name: string;
  staff: Staff[];
  status: 'pending' | 'processing' | 'completed' | 'abnormal' | 'na';
  planTime: string;
  actualTime?: string;
  requiredStaffCount: number;
  presentStaffCount: number;
  waterType?: 'water_only' | 'sewage_only' | 'both';
}

export interface TrainStation {
  name: string;
  arriveTime?: string;
  departTime?: string;
  stopType: 'stop' | 'pass';
  delayMinutes?: number;
}

export interface Conductor {
  name: string;
  phone: string;
}

export interface TrainInfo {
  id: string;
  code: string;
  runType: 'origin' | 'through' | 'terminating';
  
  planArrTime?: string;
  actualArrTime?: string;
  planDepTime?: string;
  actualDepTime?: string;
  
  boardCount?: number;
  alightCount?: number;
  transferCount?: number;

  conductorName?: string;
  conductorPhone?: string;
  conductors?: Conductor[];

  track?: string;
  platform?: string;
  ticketGate?: string;
  exitGate?: string;

  marshallingCount?: number;
  stopPosition?: string;
  marshallingDirection?: string;
  
  startStation?: string;
  endStation?: string;
  routeStations?: TrainStation[];

  prevStationDepTime?: string;

  attributes?: {
    formation: string;
    formationOrder: 'normal' | 'reverse';
    direction: 'up' | 'down';
    landmarkColor?: string;
  };
}

export interface OperationUnit {
  id: string;
  type: TrainType;
  
  arrivalTrain?: TrainInfo;
  departureTrain?: TrainInfo;

  track: string;
  platform: string;

  tasks: Task[];
  
  remarks?: string;

  platformTags?: string[];
}

const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '卫十二'];
const roles = ['客运员', '值班员', '上水工', '保洁员'];

const generateWorkItems = (taskType: string, baseTime: dayjs.Dayjs): WorkItem[] => {
  const items: WorkItem[] = [];
  const loc = taskType === 'platform' ? '站台' : (taskType === 'check_in' ? '检票口' : '出站口');
  
  const rand = Math.random();
  const isLateCompleted = rand > 0.7 && rand <= 0.85;
  const isAbnormal = rand > 0.85 && rand <= 0.95;
  const isTimeout = rand > 0.95;

  const h = baseTime.hour();
  const m = baseTime.minute();
  const isNightWindow = (h === 23 && m >= 30) || h < 3;
  const isCrossDay = isNightWindow && Math.random() > 0.7;

  const fmt = (t: dayjs.Dayjs) => t.format('YYYY-MM-DD HH:mm:ss');
   const getActual = (t: dayjs.Dayjs) => {
       if (isCrossDay) {
           return fmt(t.add(1, 'day').startOf('day').add(Math.floor(Math.random() * 60), 'minute'));
       }
       return fmt(t);
   };

  if (taskType === 'platform') {
    items.push({
        location: loc, content: '立岗接车',
        planTime: fmt(baseTime.subtract(15, 'minute')),
        actualTime: isTimeout ? undefined : getActual(baseTime.subtract(15, 'minute')),
        status: isTimeout ? 'pending' : 'completed'
    });
    items.push({
        location: loc, content: '乘降组织',
        planTime: fmt(baseTime.subtract(10, 'minute')),
        actualTime: isLateCompleted ? getActual(baseTime.subtract(5, 'minute')) : (isAbnormal ? undefined : getActual(baseTime.subtract(10, 'minute'))),
        status: isLateCompleted ? 'completed' : (isAbnormal ? 'late' : 'completed')
    });
    items.push({
        location: loc, content: '送车',
        planTime: fmt(baseTime.add(5, 'minute')),
        status: 'pending'
    });
  } else if (taskType === 'check_in') {
     items.push({
      location: loc, content: '出务报道',
      planTime: fmt(baseTime.subtract(30, 'minute')),
      actualTime: getActual(baseTime.subtract(30, 'minute')),
      status: 'completed'
    });
    items.push({
      location: loc, content: '停止检票',
      planTime: fmt(baseTime.subtract(5, 'minute')),
      actualTime: isLateCompleted ? getActual(baseTime) : (isAbnormal ? undefined : getActual(baseTime.subtract(5, 'minute'))),
      status: isLateCompleted ? 'completed' : (isAbnormal ? 'late' : 'completed')
    });
  } else if (taskType === 'exit') {
     items.push({
      location: loc, content: '出务报道',
      planTime: fmt(baseTime.subtract(10, 'minute')),
      actualTime: getActual(baseTime.subtract(10, 'minute')),
      status: 'completed'
    });
    items.push({
      location: loc, content: '作业开始',
      planTime: fmt(baseTime.add(0, 'minute')),
      status: isAbnormal ? 'abnormal' : 'pending'
    });
  } else {
     items.push({
      location: loc, content: '作业开始',
      planTime: fmt(baseTime.subtract(5, 'minute')),
      status: 'completed'
    });
    items.push({
      location: loc, content: '作业结束',
      planTime: fmt(baseTime.add(10, 'minute')),
      status: 'pending'
    });
  }
  return items;
};

const getRandomStaff = (count: number, taskType: string, baseTime: dayjs.Dayjs): Staff[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `staff-${Math.random()}`,
    name: names[Math.floor(Math.random() * names.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    phone: '13800138000',
    workItems: generateWorkItems(taskType, baseTime)
  }));
};

const generateTasks = (type: TrainType, waterConfig: 'water_only' | 'sewage_only' | 'both' | 'none' = 'both', customBaseTime?: dayjs.Dayjs): Task[] => {
  const tasks: Task[] = [];
  const baseTime = customBaseTime || dayjs();

  const deriveStatus = (staff: Staff[]): Task['status'] => {
      if (!staff || staff.length === 0) return 'pending';
      let hasAbnormal = false;
      let hasLate = false;
      let allCompleted = true;
      let hasProcessing = false;

      staff.forEach(s => {
          s.workItems.forEach(wi => {
              if (wi.status === 'abnormal') hasAbnormal = true;
              if (wi.status === 'late') hasLate = true;
              if (wi.status !== 'completed' && wi.status !== 'late') allCompleted = false;
              if (wi.status === 'processing') hasProcessing = true;
          });
      });
      
      let hasTimeout = false;
      const now = dayjs();
      
      staff.forEach(s => {
          s.workItems.forEach(wi => {
              if (wi.status === 'pending') {
                  if (wi.planTime && wi.planTime.includes(' ')) {
                      const pt = dayjs(wi.planTime);
                      if (now.isAfter(pt)) {
                          hasTimeout = true;
                      }
                  }
              }
          });
      });
      
      if (hasTimeout) return 'missing';
      if (hasAbnormal) return 'abnormal';
      if (hasLate) return 'late';
      if (allCompleted) return 'completed';
      if (hasProcessing) return 'processing';
      
      return 'pending';
  };

  if (['origin', 'through', 'connected'].includes(type)) {
    const required = 1;
    const present = Math.random() > 0.2 ? 1 : 0;
    const staff = getRandomStaff(present, 'check_in', baseTime);
    const status = deriveStatus(staff);

    tasks.push({
      id: `t-checkin-${Math.random()}`,
      type: 'check_in',
      name: '检票作业',
      staff: staff,
      requiredStaffCount: required,
      presentStaffCount: present,
      status: status,
      planTime: baseTime.subtract(20, 'minute').format('HH:mm'),
      actualTime: status === 'processing' || status === 'completed' ? baseTime.subtract(19, 'minute').format('HH:mm') : undefined
    });
  } else {
    tasks.push({
      id: `na-checkin-${Math.random()}`, type: 'check_in', name: '检票作业', staff: [], status: 'na', planTime: '-',
      requiredStaffCount: 0, presentStaffCount: 0
    });
  }

  const platformReq = Math.random() > 0.5 ? 2 : 1;
  const platformPres = platformReq === 2 ? (Math.random() > 0.1 ? 2 : 1) : 1;
  const pStaff = getRandomStaff(platformPres, 'platform', baseTime);
  const pStatus = deriveStatus(pStaff);

  tasks.push({
    id: `t-platform-${Math.random()}`,
    type: 'platform',
    name: '站台作业',
    staff: pStaff,
    requiredStaffCount: platformReq,
    presentStaffCount: platformPres,
    status: pStatus,
    planTime: baseTime.subtract(10, 'minute').format('HH:mm'),
    actualTime: baseTime.subtract(10, 'minute').format('HH:mm')
  });

  if (['terminating', 'through', 'connected'].includes(type)) {
    const required = 1;
    const present = Math.random() > 0.1 ? 1 : 0;
    const eStaff = getRandomStaff(present, 'exit', baseTime);
    const eStatus = deriveStatus(eStaff);

    tasks.push({
      id: `t-exit-${Math.random()}`,
      type: 'exit',
      name: '出站作业',
      staff: eStaff,
      requiredStaffCount: required,
      presentStaffCount: present,
      status: eStatus,
      planTime: baseTime.add(5, 'minute').format('HH:mm'),
      actualTime: undefined
    });
  } else {
    tasks.push({
      id: `na-exit-${Math.random()}`, type: 'exit', name: '出站作业', staff: [], status: 'na', planTime: '-',
      requiredStaffCount: 0, presentStaffCount: 0
    });
  }

  if (waterConfig === 'none') {
    tasks.push({
        id: `na-water-${Math.random()}`, type: 'water_sewage', name: '上水吸污', staff: [], status: 'na', planTime: '-',
        requiredStaffCount: 0, presentStaffCount: 0
    });
  } else {
    const required = waterConfig === 'both' ? 2 : 1;
    const present = Math.random() > 0.2 ? required : required - 1;
    const wStaff = getRandomStaff(present, 'water_sewage', baseTime);
    const wStatus = deriveStatus(wStaff);

    tasks.push({
      id: `t-water-${Math.random()}`,
      type: 'water_sewage',
      name: '上水吸污',
      staff: wStaff,
      requiredStaffCount: required,
      presentStaffCount: present,
      status: wStatus,
      planTime: baseTime.add(10, 'minute').format('HH:mm'),
      actualTime: undefined,
      waterType: waterConfig
    });
  }

  return tasks;
};

const getRandomTags = (): string[] => {
  const tags = ['parcel', 'meal', 'overnight', 'turnaround', 'overcrowd', 'special'];
  const shuffled = tags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 4));
};

const generateRouteStations = (start: string = '始发站', end: string = '终到站', baseTime: dayjs.Dayjs = dayjs()): TrainStation[] => {
    const stations = ['天津南', '济南西', '徐州东', '南京南', '上海虹桥', '杭州东', '宁波', '温州南', '福州南', '厦门北', '深圳北'];
    const count = 3 + Math.floor(Math.random() * 3);
    const route: TrainStation[] = [];
    
    route.push({
        name: start,
        departTime: baseTime.subtract(4, 'hour').format('HH:mm'),
        stopType: 'stop'
    });

    for (let i = 0; i < count; i++) {
        const isStop = Math.random() > 0.3;
        const delay = Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0;
        route.push({
            name: stations[i % stations.length],
            arriveTime: baseTime.subtract(3 - i * 0.5, 'hour').format('HH:mm'),
            departTime: baseTime.subtract(3 - i * 0.5 - 0.05, 'hour').format('HH:mm'),
            stopType: isStop ? 'stop' : 'pass',
            delayMinutes: delay
        });
    }

    route.push({
        name: end,
        arriveTime: baseTime.add(1, 'hour').format('HH:mm'),
        stopType: 'stop'
    });
    
    return route;
};

const generateConductors = (): Conductor[] => {
    const surnames = ['王', '李', '张', '赵', '刘', '陈', '杨'];
    return [
        { name: surnames[Math.floor(Math.random() * surnames.length)] + '车长', phone: '139' + Math.floor(10000000 + Math.random() * 90000000) },
        { name: surnames[Math.floor(Math.random() * surnames.length)] + '车长', phone: '138' + Math.floor(10000000 + Math.random() * 90000000) }
    ];
};

export const getMockData = (): OperationUnit[] => {
  const data: OperationUnit[] = [];
  const baseDate = dayjs().hour(6).minute(0).second(0);
  const currentStation = '重庆东';
  const otherStations = ['北京南', '上海虹桥', '广州南', '成都东', '西安北', '武汉', '郑州东', '长沙南'];
  const randomStation = () => otherStations[Math.floor(Math.random() * otherStations.length)];
  const randomColor = () => ['红','蓝','黄','绿', '紫', '白'][Math.floor(Math.random() * 6)];
  const randomGate = () => `${Math.floor(Math.random() * 20) + 1}${Math.random() > 0.5 ? 'A' : 'B'}`;

  for (let i = 0; i < 50; i++) {
    const randType = Math.random();
    let type: TrainType = 'through';
    if (randType < 0.2) type = 'connected';
    else if (randType < 0.6) type = 'through';
    else if (randType < 0.8) type = 'origin';
    else type = 'terminating';

    const track = `${Math.floor(Math.random() * 20) + 1}`;
    const platform = `${Math.ceil(parseInt(track) / 2)}`;
    const timeOffset = i * 15;
    const currentBaseTime = baseDate.add(timeOffset + Math.floor(Math.random() * 10), 'minute');
    
    const trainNum = 1000 + i * 2 + Math.floor(Math.random() * 100);
    const codeArr = `G${trainNum}`;
    const codeDep = type === 'connected' ? `G${trainNum + 1}` : codeArr;

    const arrivalTrain: TrainInfo = {
        id: `t${i}-arr`,
        code: codeArr,
        runType: type === 'connected' ? 'terminating' : (type === 'terminating' ? 'terminating' : 'through'),
        planArrTime: currentBaseTime.format('HH:mm'),
        actualArrTime: Math.random() > 0.8 ? currentBaseTime.add(Math.floor(Math.random() * 10), 'minute').format('HH:mm') : currentBaseTime.format('HH:mm'),
        alightCount: 50 + Math.floor(Math.random() * 200),
        transferCount: Math.floor(Math.random() * 50),
        conductors: generateConductors(),
        marshallingCount: Math.random() > 0.5 ? 16 : 8,
        stopPosition: Math.random() > 0.5 ? 'H' : 'F',
        marshallingDirection: '正向',
        prevStationDepTime: currentBaseTime.subtract(45, 'minute').format('HH:mm'),
        exitGate: randomGate(),
        startStation: randomStation(),
        endStation: currentStation,
        routeStations: [],
        attributes: { formation: '16', formationOrder: 'normal', direction: 'down', landmarkColor: randomColor() }
    };

    const departureTrain: TrainInfo = {
        id: `t${i}-dep`,
        code: codeDep,
        runType: type === 'connected' ? 'origin' : (type === 'origin' ? 'origin' : 'through'),
        planDepTime: currentBaseTime.add(20, 'minute').format('HH:mm'),
        actualDepTime: Math.random() > 0.8 ? currentBaseTime.add(25, 'minute').format('HH:mm') : currentBaseTime.add(20, 'minute').format('HH:mm'),
        boardCount: 50 + Math.floor(Math.random() * 200),
        conductors: generateConductors(),
        marshallingCount: Math.random() > 0.5 ? 16 : 8,
        stopPosition: Math.random() > 0.5 ? 'H' : 'F',
        marshallingDirection: '正向',
        ticketGate: randomGate(),
        startStation: currentStation,
        endStation: randomStation(),
        routeStations: [],
        attributes: { formation: '16', formationOrder: 'normal', direction: 'down', landmarkColor: randomColor() }
    };

    if (type === 'through') {
        const start = randomStation();
        let end = randomStation();
        while (end === start) end = randomStation();
        arrivalTrain.startStation = start;
        arrivalTrain.endStation = end;
        departureTrain.startStation = start;
        departureTrain.endStation = end;
        
        arrivalTrain.routeStations = generateRouteStations(start, end, currentBaseTime);
        departureTrain.routeStations = generateRouteStations(start, end, currentBaseTime.add(20, 'minute'));
    } else if (type === 'origin') {
        departureTrain.routeStations = generateRouteStations(currentStation, departureTrain.endStation!, currentBaseTime.add(20, 'minute'));
    } else if (type === 'terminating') {
        arrivalTrain.routeStations = generateRouteStations(arrivalTrain.startStation!, currentStation, currentBaseTime);
    } else if (type === 'connected') {
        arrivalTrain.routeStations = generateRouteStations(arrivalTrain.startStation!, currentStation, currentBaseTime);
        departureTrain.routeStations = generateRouteStations(currentStation, departureTrain.endStation!, currentBaseTime.add(20, 'minute'));
    }

    const unit: OperationUnit = {
        id: `u${i}`,
        type,
        track,
        platform,
        tasks: [],
        platformTags: getRandomTags()
    };

    const waterConfig = ['water_only', 'sewage_only', 'both', 'none'][Math.floor(Math.random() * 4)] as any;

    if (type === 'origin') {
        unit.departureTrain = departureTrain;
        unit.tasks = generateTasks('origin', waterConfig, currentBaseTime);
    } else if (type === 'terminating') {
        unit.arrivalTrain = arrivalTrain;
        unit.tasks = generateTasks('terminating', waterConfig, currentBaseTime);
    } else {
        unit.arrivalTrain = arrivalTrain;
        unit.departureTrain = departureTrain;
        unit.tasks = generateTasks(type, waterConfig, currentBaseTime);
    }
    
    if (Math.random() > 0.85) {
        unit.remarks = ['重点关注', 'VIP接待', '设备故障', '特殊旅客', '轮椅服务'][Math.floor(Math.random() * 5)];
    }

    data.push(unit);
  }

  return data;
};
