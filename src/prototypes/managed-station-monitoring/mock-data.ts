/**
 * 代管盯控 - 模拟数据
 */
import type { TrainSchedule, StationConfig, PanelConfig, DisplayConfig, ReminderConfig, MonitoringConfig } from './types';

// 默认车站配置
export const defaultStations: StationConfig[] = [
  {
    id: 'station-1',
    name: '重庆东',
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
    directions: ['up', 'down'],
    formationOrder: ['normal', 'reverse'],
    waitingRooms: ['1', '2', '3', '4'],
    checkInGates: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'],
    exitGates: ['A', 'B', 'C'],
    trainTypes: ['highSpeed', 'normal']
  },
  {
    id: 'station-2',
    name: '巴南',
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8'],
    directions: ['up', 'down'],
    formationOrder: ['normal', 'reverse'],
    waitingRooms: ['1', '2'],
    checkInGates: ['A1', 'A2', 'B1'],
    exitGates: ['A', 'B'],
    trainTypes: ['highSpeed', 'normal']
  },
  {
    id: 'station-3',
    name: '南川北',
    tracks: ['1', '2', '3', '4', '5', '6'],
    directions: ['up', 'down'],
    formationOrder: ['normal', 'reverse'],
    waitingRooms: ['1'],
    checkInGates: ['A1', 'A2'],
    exitGates: ['A'],
    trainTypes: ['highSpeed', 'normal']
  },
  {
    id: 'station-4',
    name: '水江西',
    tracks: ['1', '2', '3', '4'],
    directions: ['up', 'down'],
    formationOrder: ['normal', 'reverse'],
    waitingRooms: ['1'],
    checkInGates: ['A1'],
    exitGates: ['A'],
    trainTypes: ['highSpeed', 'normal']
  }
];

// 默认面板配置 - 重庆东2个面板，其他小站1个面板
export const defaultPanels: PanelConfig[] = [
  { id: 'panel-1', name: '重庆东1-8股道', stationId: 'station-1', trackRange: { start: 1, end: 8 } },
  { id: 'panel-2', name: '重庆东9-16股道', stationId: 'station-1', trackRange: { start: 9, end: 16 } },
  { id: 'panel-3', name: '巴南全部股道', stationId: 'station-2', trackRange: { start: 1, end: 8 } },
  { id: 'panel-4', name: '南川北全部股道', stationId: 'station-3', trackRange: { start: 1, end: 6 } },
  { id: 'panel-5', name: '水江西全部股道', stationId: 'station-4', trackRange: { start: 1, end: 4 } }
];

// 默认显示配置
export const defaultDisplayConfig: DisplayConfig = {
  showPlatform: true,
  showMaster1: true,
  showMaster2: false,
  showPassengerFlow: true,
  showKeyItems: true,
  keyItems: ['water', 'sewage', 'parcel', 'meal', 'highFlow', 'overcrowd', 'special']
};

// 默认提醒配置
export const defaultReminderConfig: ReminderConfig = {
  enableNearbyDeparture: true,
  enableDispatchNotice: true,
  nearbyStations: ['重庆西', '重庆北'],
  reDispatchEarly: 30,
  reDispatchLate: 15
};

// 默认完整配置 - 首次运行不显示配置向导
export const defaultConfig: MonitoringConfig = {
  stations: defaultStations,
  panels: defaultPanels,
  display: defaultDisplayConfig,
  reminder: defaultReminderConfig,
  isFirstRun: false
};

// 生成车次号
const generateTrainNo = (index: number, type: 'highSpeed' | 'normal'): string => {
  const prefixes = type === 'highSpeed' ? ['G', 'D'] : ['K', 'T', 'Z'];
  const prefix = prefixes[index % prefixes.length];
  const num = 1000 + index * 13;
  return `${prefix}${num}`;
};

// 生成时间
const generateTime = (baseHour: number, offsetMinutes: number): string => {
  const hour = baseHour + Math.floor(offsetMinutes / 60);
  const minute = offsetMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// 生成随机重点事项
const generateKeyItems = (): TrainSchedule['keyItems'] => ({
  water: Math.random() > 0.7,
  sewage: Math.random() > 0.8,
  parcel: Math.random() > 0.85,
  meal: Math.random() > 0.8,
  highFlow: Math.random() > 0.75,
  samePlatform: Math.random() > 0.9,
  risk: Math.random() > 0.95,
  overcrowd: Math.random() > 0.85,
  special: Math.random() > 0.95
});

// 生成模拟车次数据
export const generateMockTrainSchedules = (): TrainSchedule[] => {
  const trains: TrainSchedule[] = [];
  let trainIdCounter = 1;

  // 跨站车次（同车次号出现在多个车站）
  const crossStationTrains = [
    { trainNo: 'G8888', type: 'highSpeed' as const, stations: ['重庆东', '巴南', '南川北'] },
    { trainNo: 'D4567', type: 'highSpeed' as const, stations: ['重庆东', '巴南'] },
    { trainNo: 'G1234', type: 'highSpeed' as const, stations: ['巴南', '南川北', '水江西'] },
    { trainNo: 'D1002', type: 'highSpeed' as const, stations: ['重庆东', '南川北'] },
    { trainNo: 'G1003', type: 'highSpeed' as const, stations: ['重庆东', '巴南', '南川北', '水江西'] }
  ];

  // 生成跨站车次
  crossStationTrains.forEach((crossTrain, idx) => {
    let currentTime = 480 + idx * 45; // 从8:00开始，间隔45分钟

    crossTrain.stations.forEach((station, stationIdx) => {
      const isFirst = stationIdx === 0;
      const isLast = stationIdx === crossTrain.stations.length - 1;
      const stopMinutes = isFirst || isLast ? 30 : 3; // 始发/终到停30分钟，途径停3分钟

      const arrivalTime = isFirst ? undefined : generateTime(8, currentTime);
      const departureTime = isLast ? undefined : generateTime(8, currentTime + (isFirst ? 0 : stopMinutes));

      // 部分车次有晚点
      const hasLate = Math.random() > 0.8;
      const lateMinutes = hasLate ? Math.floor(Math.random() * 15) + 1 : 0;

      // 部分车次有股道变更
      const hasTrackChange = Math.random() > 0.9;
      const trackNum = Math.floor(Math.random() * 8) + 1;
      const actualTrack = hasTrackChange ? String(trackNum + 1) : undefined;

      trains.push({
        id: `train-${trainIdCounter++}`,
        trainNo: crossTrain.trainNo,
        station,
        arrival: {
          time: arrivalTime || '',
          actualTime: hasLate && !isFirst ? generateTime(8, currentTime + lateMinutes) : undefined,
          lateEarly: hasLate && !isFirst ? `+${lateMinutes}` : undefined
        },
        departure: {
          time: departureTime || '',
          actualTime: hasLate && !isLast ? generateTime(8, currentTime + (isFirst ? 0 : stopMinutes) + lateMinutes) : undefined,
          lateEarly: hasLate && !isLast ? `+${lateMinutes}` : undefined
        },
        track: String(trackNum),
        direction: idx % 2 === 0 ? 'up' : 'down',
        directionIndicator: idx % 2 === 0 ? 'north' : 'south',
        trainType: crossTrain.type,
        isOrigin: isFirst,
        isEnd: isLast,
        platform: `${trackNum}`,
        master1: `张${String.fromCharCode(65 + (idx % 26))}`,
        master2: Math.random() > 0.5 ? `李${String.fromCharCode(65 + ((idx + 1) % 26))}` : undefined,
        passengerFlow: {
          boarding: Math.floor(Math.random() * 800) + 100,
          alighting: Math.floor(Math.random() * 600) + 50,
          transfer: Math.floor(Math.random() * 200)
        },
        keyItems: generateKeyItems(),
        trackChange: hasTrackChange ? { from: String(trackNum), to: actualTrack! } : undefined
      });

      currentTime += stopMinutes + 25; // 运行25分钟到下一站
    });
  });

  // 为每个车站生成独立车次
  defaultStations.forEach((station, stationIdx) => {
    const trainCount = 15 + Math.floor(Math.random() * 15); // 每个车站15-30个车次

    for (let i = 0; i < trainCount; i++) {
      const trainType: 'highSpeed' | 'normal' = Math.random() > 0.3 ? 'highSpeed' : 'normal';
      const trainNo = generateTrainNo(trains.length + i, trainType);
      const isOrigin = Math.random() > 0.7;
      const isEnd = !isOrigin && Math.random() > 0.7;
      const baseTime = 360 + (stationIdx * 60) + (i * 12); // 分散时间

      // 部分车次有接续关系
      const hasConnection = !isEnd && Math.random() > 0.85;
      const connectionTrainNo = hasConnection ? generateTrainNo(trains.length + i + 1000, trainType) : undefined;

      trains.push({
        id: `train-${trainIdCounter++}`,
        trainNo,
        station: station.name,
        arrival: {
          time: isOrigin ? '' : generateTime(6, baseTime),
          actualTime: Math.random() > 0.85 ? generateTime(6, baseTime + Math.floor(Math.random() * 10)) : undefined,
          lateEarly: Math.random() > 0.85 ? `+${Math.floor(Math.random() * 10) + 1}` : undefined
        },
        departure: {
          time: isEnd ? '' : generateTime(6, baseTime + (isOrigin ? 0 : 5)),
          actualTime: Math.random() > 0.85 ? generateTime(6, baseTime + (isOrigin ? 0 : 5) + Math.floor(Math.random() * 10)) : undefined,
          lateEarly: Math.random() > 0.85 ? `+${Math.floor(Math.random() * 10) + 1}` : undefined
        },
        track: station.tracks[Math.floor(Math.random() * station.tracks.length)],
        direction: i % 2 === 0 ? 'up' : 'down',
        directionIndicator: i % 2 === 0 ? 'north' : 'south',
        trainType,
        isOrigin,
        isEnd,
        connection: connectionTrainNo ? { trainNo: connectionTrainNo, time: Math.floor(Math.random() * 60) + 30 } : undefined,
        platform: station.tracks[Math.floor(Math.random() * station.tracks.length)],
        master1: `王${String.fromCharCode(65 + (i % 26))}`,
        passengerFlow: {
          boarding: Math.floor(Math.random() * 600) + 50,
          alighting: Math.floor(Math.random() * 400) + 30,
          transfer: Math.floor(Math.random() * 150)
        },
        keyItems: generateKeyItems()
      });
    }
  });

  return trains;
};

// 模拟车次数据
export const mockTrainSchedules: TrainSchedule[] = generateMockTrainSchedules();

// 从localStorage加载配置
export const loadConfig = (): MonitoringConfig => {
  try {
    const saved = localStorage.getItem('managed-station-monitoring-config');
    if (saved) {
      return { ...defaultConfig, ...JSON.parse(saved), isFirstRun: false };
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
  return defaultConfig;
};

// 保存配置到localStorage
export const saveConfig = (config: MonitoringConfig): void => {
  try {
    localStorage.setItem('managed-station-monitoring-config', JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config:', e);
  }
};
