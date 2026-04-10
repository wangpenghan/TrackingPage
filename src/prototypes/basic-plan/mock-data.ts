export interface Station {
  stationName: string;
  stationOrder: number;
  arrivalTime?: string;
  departureTime?: string;
  fullTrainNo?: string;
  startingTrainNo?: string;
  arrivalTrainNo?: string;
  departureTrainNo?: string;
  track?: string;
  updateTime?: string;
}

export interface Train {
  id: string;
  trainNo: string;
  trainType: 'high-speed' | 'normal';
  diagramNo: string;
  operationRule: 'daily' | 'alternate' | 'custom';
  operationCycle: number;
  operationPattern: number[];
  originStation: string;
  destinationStation: string;
  stations: Station[];
  trainModel?: string;
  formationCount?: number;
  capacity?: number;
  turningStation?: string;
  routeInfo?: string;
  passingLines?: string[];
  passingBureaus?: string[];
  remarks?: string;
  fullTrainNo?: string;
  startingTrainNo?: string;
}

export const stationNames = [
  '北京西', '石家庄', '郑州东', '武汉', '长沙南', '广州南', '深圳北',
  '上海虹桥', '南京南', '杭州东', '合肥南', '西安北', '成都东', '重庆西',
  '天津西', '济南西', '徐州东', '南昌西', '福州', '厦门北'
];

const generateStations = (count: number, startOrder: number = 1, trainNo: string = 'G123'): Station[] => {
  const stations: Station[] = [];
  let currentTime = 6 * 60; 

  for (let i = 0; i < count; i++) {
    const stationName = stationNames[(startOrder + i - 1) % stationNames.length];
    const isFirst = i === 0;
    const isLast = i === count - 1;

    const station: Station = {
      stationName,
      stationOrder: startOrder + i,
      fullTrainNo: trainNo,
      startingTrainNo: trainNo,
      arrivalTrainNo: !isFirst ? trainNo : undefined,
      departureTrainNo: !isLast ? trainNo : undefined,
      track: `${1 + Math.floor(Math.random() * 20)}`,
      updateTime: '2025-05-13 00:34:16'
    };

    if (!isFirst) {
      const arrivalHour = Math.floor(currentTime / 60);
      const arrivalMin = currentTime % 60;
      station.arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`;
      currentTime += 3; 
    }

    if (!isLast) {
      const departureHour = Math.floor(currentTime / 60);
      const departureMin = currentTime % 60;
      station.departureTime = `${String(departureHour).padStart(2, '0')}:${String(departureMin).padStart(2, '0')}`;
      currentTime += 30 + Math.floor(Math.random() * 30); 
    }

    stations.push(station);
  }

  return stations;
};

const generateTrain = (id: number): Train => {
  const trainNoPrefix = Math.random() > 0.5 ? 'G' : 'D';
  const trainNo = `${trainNoPrefix}${100 + Math.floor(Math.random() * 900)}`;
  const trainType = Math.random() > 0.3 ? 'high-speed' : 'normal';
  
  const operationRuleTypes: Array<'daily' | 'alternate' | 'custom'> = ['daily', 'alternate', 'custom'];
  const operationRule = operationRuleTypes[Math.floor(Math.random() * operationRuleTypes.length)];
  
  let operationCycle = 1;
  let operationPattern: number[] = [1];
  
  if (operationRule === 'alternate') {
    operationCycle = 2;
    operationPattern = Math.random() > 0.5 ? [1, 0] : [0, 1];
  } else if (operationRule === 'custom') {
    operationCycle = 3 + Math.floor(Math.random() * 4);
    operationPattern = Array.from({ length: operationCycle }, () => Math.random() > 0.4 ? 1 : 0);
    if (operationPattern.every(p => p === 0)) {
      operationPattern[0] = 1;
    }
  }

  const stationCount = 10 + Math.floor(Math.random() * 21); 
  const stations = generateStations(stationCount, 1, trainNo);

  const trainModels = ['CRH380A', 'CRH380B', 'CR400AF', 'CR400BF', 'CR200J', 'CRH1A', 'CRH2A'];
  const passingLinesList = [
    ['京广线', '京沪线'],
    ['京沪线', '沪昆线'],
    ['西成客专', '徐兰高铁'],
    ['京广高铁', '广深港高铁'],
    ['沪汉蓉通道', '宁蓉线']
  ];
  const passingBureausList = [
    ['北京局', '济南局', '上海局'],
    ['成都局', '西安局', '郑州局'],
    ['上海局', '南昌局', '广州局'],
    ['沈阳局', '北京局', '太原局']
  ];

  return {
    id: `train-${id}`,
    trainNo,
    trainType,
    diagramNo: `2025-Q${1 + Math.floor(Math.random() * 4)}`,
    operationRule,
    operationCycle,
    operationPattern,
    originStation: stations[0].stationName,
    destinationStation: stations[stations.length - 1].stationName,
    stations,
    trainModel: trainModels[Math.floor(Math.random() * trainModels.length)],
    formationCount: Math.random() > 0.5 ? 16 : 8,
    capacity: 500 + Math.floor(Math.random() * 800),
    turningStation: Math.random() > 0.7 ? stations[Math.floor(stations.length / 2)].stationName : undefined,
    routeInfo: `${trainNo}-${trainNo}${100 + Math.floor(Math.random() * 900)}`,
    passingLines: passingLinesList[Math.floor(Math.random() * passingLinesList.length)],
    passingBureaus: passingBureausList[Math.floor(Math.random() * passingBureausList.length)],
    remarks: Math.random() > 0.6 ? '编组乘务员使用' : undefined,
    fullTrainNo: trainNo,
    startingTrainNo: trainNo
  };
};

export const generateDiagramTrains = (diagramNo: string, baseId: number, count: number): Train[] => {
  const trains: Train[] = [];
  for (let i = 0; i < count; i++) {
    const train = generateTrain(baseId + i);
    train.diagramNo = diagramNo;
    trains.push(train);
  }
  return trains;
};

export const mockBasicPlanTrains: Train[] = [
  ...generateDiagramTrains('2025-Q1', 1, 20),
  ...generateDiagramTrains('2025-Q2', 100, 18),
  ...generateDiagramTrains('2025-Q3', 200, 22),
  ...generateDiagramTrains('2025-Q4', 300, 19),
];

export const diagramNos = ['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4'];

export const validateTrainData = (train: Train): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  for (let i = 0; i < train.stations.length; i++) {
    const station = train.stations[i];
    const prevStation = i > 0 ? train.stations[i - 1] : null;

    if (i === 0) {
      if (station.arrivalTime) {
        issues.push(`始发站 ${station.stationName} 不应有到达时间`);
      }
    }

    if (i === train.stations.length - 1) {
      if (station.departureTime) {
        issues.push(`终到站 ${station.stationName} 不应有发车时间`);
      }
    }

    if (station.arrivalTime && station.departureTime) {
      const arrival = parseTime(station.arrivalTime);
      const departure = parseTime(station.departureTime);
      if (arrival >= departure) {
        issues.push(`${station.stationName} 到达时间 (${station.arrivalTime}) 不早于发车时间 (${station.departureTime})`);
      }
    }

    if (prevStation && prevStation.departureTime && station.arrivalTime) {
      const prevDeparture = parseTime(prevStation.departureTime);
      const arrival = parseTime(station.arrivalTime);
      if (arrival <= prevDeparture) {
        issues.push(`${station.stationName} 到达时间 (${station.arrivalTime}) 不晚于前一站 ${prevStation.stationName} 发车时间 (${prevStation.departureTime})`);
      }
    }
  }

  return { valid: issues.length === 0, issues };
};

const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export interface DiagramChanges {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  addedTrains: Train[];
  removedTrains: Train[];
  modifiedTrains: Train[];
}

export const calculateDiagramChanges = (currentTrains: Train[], prevTrains: Train[]): DiagramChanges => {
  const currentTrainNos = new Set(currentTrains.map(t => t.trainNo));
  const prevTrainNos = new Set(prevTrains.map(t => t.trainNo));

  const addedTrains: Train[] = [];
  const removedTrains: Train[] = [];
  const modifiedTrains: Train[] = [];
  let unchanged = 0;

  currentTrains.forEach(train => {
    if (!prevTrainNos.has(train.trainNo)) {
      addedTrains.push(train);
    } else {
      const prevTrain = prevTrains.find(t => t.trainNo === train.trainNo);
      if (prevTrain) {
        const hasChanged = 
          prevTrain.originStation !== train.originStation ||
          prevTrain.destinationStation !== train.destinationStation ||
          prevTrain.trainModel !== train.trainModel ||
          prevTrain.formationCount !== train.formationCount ||
          prevTrain.operationRule !== train.operationRule ||
          JSON.stringify(prevTrain.passingLines) !== JSON.stringify(train.passingLines);
        
        if (hasChanged) {
          modifiedTrains.push(train);
        } else {
          unchanged++;
        }
      }
    }
  });

  prevTrains.forEach(train => {
    if (!currentTrainNos.has(train.trainNo)) {
      removedTrains.push(train);
    }
  });

  return { 
    added: addedTrains.length, 
    removed: removedTrains.length, 
    modified: modifiedTrains.length, 
    unchanged,
    addedTrains,
    removedTrains,
    modifiedTrains
  };
};
