'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrainFront,
  ArrowRight,
  Droplets,
  Trash2,
  AlertTriangle,
  DoorOpen,
  Ticket,
  Timer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  UserPlus,
  UserMinus,
  Repeat
} from 'lucide-react';
import { TrainCardNorth, TrainCardSouth, TrainCardStatus, TrainType, ServiceTag } from '@/components/TrainCard';

// ============ 类型定义 ============
type TrainTypeOld = 'G' | 'D' | 'C';
type TaskType = '检票' | '站台' | '出站' | '上水' | '吸污';
type TaskStatus = 'pending' | 'running' | 'completed' | 'error';

interface TrainTask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  progress?: number;
}

interface TrainCard {
  id: string;
  trainNo: string;
  trainType: TrainTypeOld;
  arrivalTime: string;
  departureTime: string;
  track: string;
  delayMinutes: number;
  stopMinutes: number;
  from: string;
  to: string;
  tasks: TrainTask[];
  // 编组信息
  formationCount: 8 | 16; // 编组数
  sequenceType: '正' | '倒'; // 正倒序
  lineDirection: '上' | '下'; // 上下行
  directionLabel: '北' | '南' | '东' | '西'; // 方向标识
  stopType: '始发' | '途径' | '终到'; // 站点类型
  // 重点作业标签
  priorityTasks: string[]; // 上水、吸污、送餐、行包、快运、专运、超员
  // 客流信息
  passengerUp?: number;   // 上车人数（始发车和途径车有）
  passengerDown?: number; // 下车人数（途径车和终到车有）
  passengerTransfer?: number; // 换乘人数（途径车和终到车有）
  // 新增：使用封装的车次卡片状态
  cardStatus?: TrainCardStatus;
  services?: ServiceTag[];
  trackChange?: string;
}

interface StationRowConfig {
  id: string;
  name: string;
  color: string;
  stationName?: string;
}

// ============ 站点行配置 ============
const stationRows: StationRowConfig[] = [
  {
    id: 'yuxia',
    name: '渝厦高铁场',
    color: '#3b82f6',
    stationName: '重庆东'
  },
  {
    id: 'donghuan',
    name: '东环城际场',
    color: '#ef4444',
    stationName: '重庆东'
  },
  {
    id: 'banan',
    name: '巴南',
    color: '#10b981'
  },
  {
    id: 'nanchuanbei',
    name: '南川北',
    color: '#f59e0b'
  },
  {
    id: 'shuijiangxi',
    name: '水江西',
    color: '#8b5cf6'
  }
];

// ============ 车次类型配色 ============
const trainTypeConfig: Record<TrainType, { gradient: string; accent: string }> = {
  G: { gradient: 'from-blue-500 to-cyan-400', accent: '#3b82f6' },
  D: { gradient: 'from-cyan-500 to-teal-400', accent: '#06b6d4' },
  C: { gradient: 'from-emerald-500 to-green-400', accent: '#10b981' }
};

// ============ 地标颜色规则 ============
// 16正序 → 黄色 (#eab308)
// 16倒序 → 绿色 (#22c55e)
// 地标颜色 - 柔和低对比度配色
const getPlatformColor = (count: 8 | 16, sequence: '正' | '倒', line: '上' | '下'): string => {
  if (count === 16) {
    return sequence === '正' ? '#CA8A04' : '#16A34A'; // 暗金色 : 深绿色
  } else {
    // 8编组
    if (sequence === '正') {
      return line === '上' ? '#2563EB' : '#CA8A04'; // 深蓝 : 暗金色
    } else {
      return line === '上' ? '#16A34A' : '#7C3AED'; // 深绿色 : 紫色
    }
  }
};

// ============ 站点类型颜色 ============
// 始发 → 橙色 (#f97316)
// 途径 → 紫气东来的紫 (#7c3aed)
// 终到 → 青绿色 (#10b981)
const getStopTypeColor = (stopType: '始发' | '途径' | '终到'): string => {
  switch (stopType) {
    case '始发': return '#f97316'; // 橙色
    case '途径': return '#7c3aed'; // 紫色（更纯正的紫）
    case '终到': return '#10b981'; // 青绿色
  }
};

// ============ 作业配置 ============
const taskConfig: Record<TaskType, { icon: typeof Ticket; color: string; label: string }> = {
  '检票': { icon: Ticket, color: '#8b5cf6', label: '检票' },
  '站台': { icon: DoorOpen, color: '#3b82f6', label: '站台' },
  '出站': { icon: ArrowRight, color: '#10b981', label: '出站' },
  '上水': { icon: Droplets, color: '#06b6d4', label: '上水' },
  '吸污': { icon: Trash2, color: '#f59e0b', label: '吸污' }
};

// ============ 生成模拟数据 ============
// 站点地理顺序（从近到远）：重庆东 - 巴南 - 南川北 - 水江西
const STATION_ORDER = ['yuxia', 'donghuan', 'banan', 'nanchuanbei', 'shuijiangxi'];
const STATION_NAMES: Record<string, string> = {
  'yuxia': '重庆东(渝厦)',
  'donghuan': '重庆东(东环)',
  'banan': '巴南',
  'nanchuanbei': '南川北',
  'shuijiangxi': '水江西'
};

const generateMockData = (): Map<string, TrainCard[]> => {
  const trainsByStation = new Map<string, TrainCard[]>();
  const trainTypes: TrainTypeOld[] = ['G', 'D', 'C'];
  const taskTypes: TaskType[] = ['检票', '站台', '出站', '上水', '吸污'];
  
  // 重庆东的两个站场
  const chongqingEastStations = ['yuxia', 'donghuan'];
  // 其他站点（按地理顺序）
  const otherStationsOrdered = ['banan', 'nanchuanbei', 'shuijiangxi'];
  
  // 存储所有车次的完整信息（用于跨站关联）
  interface StationTime {
    stationId: string;
    arrival: string;
    departure: string;
    track: string;
    stopType: '始发' | '途径' | '终到';
  }
  
  interface TrainInfo {
    trainNo: string;
    trainType: TrainTypeOld;
    formationCount: 8 | 16;
    sequenceType: '正' | '倒';
    lineDirection: '上' | '下';
    directionLabel: '北' | '南' | '东' | '西';
    from: string;
    to: string;
    priorityTasks: string[];
    services: ServiceTag[];
    // 车次经过的所有站点时间（按时间顺序）
    stationTimes: StationTime[];
    cardStatus: TrainCardStatus;
    delayMinutes: number;
  }
  
  const allTrains: TrainInfo[] = [];
  
  // 辅助函数：分钟转时间字符串
  const minutesToTime = (minutes: number): string => {
    const hour = Math.floor(minutes / 60) % 24;
    const minute = minutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };
  
  // 生成12趟车次
  const trainCount = 12;
  
  for (let i = 0; i < trainCount; i++) {
    const trainType = trainTypes[i % 3];
    const trainNo = `${trainType}${100 + i * 50}`;
    
    // 随机编组信息
    const formationCount: 8 | 16 = Math.random() > 0.5 ? 16 : 8;
    const sequenceType: '正' | '倒' = Math.random() > 0.5 ? '正' : '倒';
    const lineDirection: '上' | '下' = Math.random() > 0.5 ? '上' : '下';
    const directionLabel: '北' | '南' | '东' | '西' = (['北', '南', '东', '西'] as const)[Math.floor(Math.random() * 4)];
    
    // 重点作业标签
    const allPriorityTasks = ['上水', '吸污', '送餐', '行包', '快运', '专运', '超员'];
    const priorityTaskCount = Math.floor(Math.random() * 3);
    const priorityTasks = allPriorityTasks.sort(() => Math.random() - 0.5).slice(0, priorityTaskCount);
    
    // 生成服务标签
    const allServices = ['水', '污', '包', '餐', '库'];
    const serviceCount = Math.floor(Math.random() * 3) + 3;
    const services: ServiceTag[] = allServices.sort(() => Math.random() - 0.5).slice(0, serviceCount).map(label => ({ label }));
    
    // 生成卡片状态
    const statusOptions: TrainCardStatus[] = ['normal', 'delayed', 'track-change', 'early', 'one-hour-out', 'departed', 'suspended'];
    const cardStatus: TrainCardStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const delayMinutes = cardStatus === 'delayed' ? Math.floor(Math.random() * 30) + 5 : 0;
    const trackChange = cardStatus === 'track-change' ? `${Math.floor(Math.random() * 10) + 10}→${Math.floor(Math.random() * 10) + 10}` : undefined;
    
    // 随机选择重庆东的一个站场
    const cqStation = chongqingEastStations[Math.floor(Math.random() * chongqingEastStations.length)];
    
    // 随机决定方向：顺向（重庆东→水江西）或逆向（水江西→重庆东）
    const isForward = Math.random() > 0.5;
    
    // 车次经过的所有站点时间
    const stationTimes: StationTime[] = [];
    
    // 基础时间
    let baseHour = 6 + i;
    let baseMinute = Math.floor(Math.random() * 50);
    let currentTime = baseHour * 60 + baseMinute;
    
    if (isForward) {
      // ===== 顺向：重庆东 → 巴南 → 南川北 → 水江西 =====
      const from = '重庆东';
      const destinations = ['成都东', '贵阳北', '武汉', '西安北', '长沙南'];
      const to = destinations[Math.floor(Math.random() * destinations.length)];
      
      // 1. 重庆东（始发或途径）
      const cqArrival = minutesToTime(currentTime);
      const cqStop = 8 + Math.floor(Math.random() * 5); // 停靠8-12分钟
      currentTime += cqStop;
      const cqDeparture = minutesToTime(currentTime);
      const cqStopType: '始发' | '途径' = Math.random() > 0.3 ? '途径' : '始发';
      
      stationTimes.push({
        stationId: cqStation,
        arrival: cqArrival,
        departure: cqDeparture,
        track: String(Math.floor(Math.random() * 8) + 1),
        stopType: cqStopType
      });
      
      // 2. 选择要停靠的其他站点（从巴南、南川北、水江西中选1-2个）
      const stopCount = 1 + Math.floor(Math.random() * 2);
      const stationsToStop = otherStationsOrdered.slice(0, stopCount + 1); // 按顺序取前N个
      
      stationsToStop.forEach((stationId, idx) => {
        // 行驶时间（20-40分钟）
        const travelTime = 20 + Math.floor(Math.random() * 20);
        currentTime += travelTime;
        const arrival = minutesToTime(currentTime);
        
        // 停靠时间（5-10分钟）
        const stop = 5 + Math.floor(Math.random() * 5);
        currentTime += stop;
        const departure = minutesToTime(currentTime);
        
        // 最后一个停靠站设为终到
        const isLast = idx === stationsToStop.length - 1;
        
        stationTimes.push({
          stationId,
          arrival,
          departure,
          track: String(Math.floor(Math.random() * 5) + 1),
          stopType: isLast ? '终到' : '途径'
        });
      });
      
      allTrains.push({
        trainNo, trainType, formationCount, sequenceType, lineDirection, directionLabel,
        from, to, priorityTasks, services, cardStatus, delayMinutes, stationTimes
      });
      
    } else {
      // ===== 逆向：水江西 → 南川北 → 巴南 → 重庆东 =====
      const from = '水江西';
      const to = '重庆东';
      
      // 1. 水江西（始发或途径）
      const sjArrival = minutesToTime(currentTime);
      const sjStop = 5 + Math.floor(Math.random() * 5);
      currentTime += sjStop;
      const sjDeparture = minutesToTime(currentTime);
      const sjStopType: '始发' | '途径' = Math.random() > 0.3 ? '途径' : '始发';
      
      stationTimes.push({
        stationId: 'shuijiangxi',
        arrival: sjArrival,
        departure: sjDeparture,
        track: String(Math.floor(Math.random() * 5) + 1),
        stopType: sjStopType
      });
      
      // 2. 选择要停靠的中间站点（从南川北、巴南中选0-1个）
      const middleStations = ['nanchuanbei', 'banan'];
      const stopCount = Math.floor(Math.random() * 2);
      const stationsToStop = middleStations.slice(0, stopCount + 1);
      
      stationsToStop.forEach((stationId, idx) => {
        // 行驶时间（20-40分钟）
        const travelTime = 20 + Math.floor(Math.random() * 20);
        currentTime += travelTime;
        const arrival = minutesToTime(currentTime);
        
        // 停靠时间（5-10分钟）
        const stop = 5 + Math.floor(Math.random() * 5);
        currentTime += stop;
        const departure = minutesToTime(currentTime);
        
        stationTimes.push({
          stationId,
          arrival,
          departure,
          track: String(Math.floor(Math.random() * 5) + 1),
          stopType: '途径'
        });
      });
      
      // 3. 重庆东（终到）
      const travelToCQ = 20 + Math.floor(Math.random() * 20);
      currentTime += travelToCQ;
      const cqArrival = minutesToTime(currentTime);
      
      stationTimes.push({
        stationId: cqStation,
        arrival: cqArrival,
        departure: minutesToTime(currentTime + 10), // 终到后停靠一段时间
        track: String(Math.floor(Math.random() * 8) + 1),
        stopType: '终到'
      });
      
      allTrains.push({
        trainNo, trainType, formationCount, sequenceType, lineDirection, directionLabel,
        from, to, priorityTasks, services, cardStatus, delayMinutes, stationTimes
      });
    }
  }
  
  // 按站点组织数据
  stationRows.forEach(station => {
    const trains: TrainCard[] = [];
    
    allTrains.forEach((trainInfo) => {
      // 查找该车次是否在该站点停靠
      const stationTime = trainInfo.stationTimes.find(st => st.stationId === station.id);
      
      if (!stationTime) return;
      
      // 生成任务状态
      const tasks: TrainTask[] = taskTypes.slice(0, 3 + Math.floor(Math.random() * 2)).map((type, idx) => {
        const rand = Math.random();
        let status: TaskStatus;
        if (rand < 0.7) status = 'completed';
        else if (rand < 0.85) status = 'running';
        else if (rand < 0.95) status = 'pending';
        else status = 'error';
        
        return {
          id: `task-${trainInfo.trainNo}-${station.id}-${idx}`,
          type,
          status,
          progress: status === 'running' ? Math.floor(Math.random() * 60) + 20 : undefined
        };
      });
      
      // 客流信息
      let passengerUp: number | undefined;
      let passengerDown: number | undefined;
      let passengerTransfer: number | undefined;
      
      if (stationTime.stopType === '始发') {
        passengerUp = Math.floor(Math.random() * 800) + 200;
      } else if (stationTime.stopType === '终到') {
        passengerDown = Math.floor(Math.random() * 800) + 200;
        passengerTransfer = Math.floor(Math.random() * 100);
      } else {
        passengerUp = Math.floor(Math.random() * 500) + 50;
        passengerDown = Math.floor(Math.random() * 500) + 50;
        passengerTransfer = Math.floor(Math.random() * 80);
      }
      
      trains.push({
        id: `train-${trainInfo.trainNo}-${station.id}`,
        trainNo: trainInfo.trainNo,
        trainType: trainInfo.trainType,
        arrivalTime: stationTime.arrival,
        departureTime: stationTime.departure,
        track: stationTime.track,
        delayMinutes: trainInfo.delayMinutes,
        stopMinutes: 8,
        from: trainInfo.from,
        to: trainInfo.to,
        tasks,
        formationCount: trainInfo.formationCount,
        sequenceType: trainInfo.sequenceType,
        lineDirection: trainInfo.lineDirection,
        directionLabel: trainInfo.directionLabel,
        stopType: stationTime.stopType,
        priorityTasks: trainInfo.priorityTasks,
        passengerUp,
        passengerDown,
        passengerTransfer,
        cardStatus: trainInfo.cardStatus,
        services: trainInfo.services,
        trackChange: trainInfo.trackChange
      });
    });
    
    trains.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    trainsByStation.set(station.id, trains);
  });
  
  return trainsByStation;
};

// 重点作业标签颜色
// macOS 风格重点作业标记配色 - 支持深色模式
const PRIORITY_TASK_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  '上水': { bg: '#DBEAFE', text: '#1E40AF', darkBg: '#1E3A5F', darkText: '#60A5FA' },    // 蓝色
  '吸污': { bg: '#DCFCE7', text: '#166534', darkBg: '#14532D', darkText: '#4ADE80' },    // 绿色
  '送餐': { bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FBBF24' },    // 黄色
  '行包': { bg: '#F3E8FF', text: '#6B21A8', darkBg: '#581C87', darkText: '#C084FC' },    // 紫色
  '快运': { bg: '#FFE4E6', text: '#BE123C', darkBg: '#881337', darkText: '#FB7185' },    // 红色
  '专运': { bg: '#FFEDD5', text: '#9A3412', darkBg: '#7C2D12', darkText: '#FB923C' },    // 橙色
  '超员': { bg: '#FEE2E2', text: '#DC2626', darkBg: '#7F1D1D', darkText: '#FCA5A5' },    // 红色（警示）
};

// macOS 风格状态色条颜色
const STATUS_BAR_COLORS: Record<TaskStatus, { bg: string; darkBg: string }> = {
  pending: { bg: '#C7C7CC', darkBg: '#48484A' },      // 系统灰色
  running: { bg: '#34C759', darkBg: '#30D158' },      // 系统绿色
  completed: { bg: '#007AFF', darkBg: '#0A84FF' },    // 系统蓝色
  error: { bg: '#FF3B30', darkBg: '#FF453A' },        // 系统红色
};

// macOS 风格车次类型配色
const TRAIN_TYPE_COLORS: Record<'始发' | '途径' | '终到', { bg: string; darkBg: string }> = {
  '始发': { bg: '#FF9500', darkBg: '#FF9F0A' },  // 系统橙色
  '途径': { bg: '#AF52DE', darkBg: '#BF5AF2' },  // 系统紫色
  '终到': { bg: '#32ADE6', darkBg: '#64D2FF' },  // 系统青色
};

// 状态颜色 - macOS 风格
const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  pending: '#C7C7CC',      // 系统灰色
  running: '#34C759',      // 系统绿色
  completed: '#007AFF',    // 系统蓝色
  error: '#FF3B30',        // 系统红色
};

// ============ 封装车次卡片包装组件 ============
interface WrappedTrainCardProps {
  train: TrainCard;
  left: number;
  width: number;
  bottom: number;
  isSelected: boolean;
  isLinked?: boolean;
  isDimmed?: boolean;
  onSelect: () => void;
  useNewCard?: boolean;
}

const WrappedTrainCard: React.FC<WrappedTrainCardProps> = ({
  train,
  left,
  width,
  bottom,
  isSelected,
  isLinked,
  isDimmed,
  onSelect,
  useNewCard = true,
}) => {
  const isNorth = train.lineDirection === '上';
  const trainTypeMap: Record<'始发' | '途径' | '终到', TrainType> = {
    '始发': 'sf',
    '途径': 'tj',
    '终到': 'zd'
  };
  
  const cardProps = {
    trainNumber: train.trainNo,
    route: `${train.from}→${train.to}`,
    track: `${train.track}${train.sequenceType}${train.lineDirection === '上' ? '正北' : '正南'}`,
    departureTime: train.departureTime,
    trackChange: train.trackChange,
    delayMinutes: train.delayMinutes,
    status: train.cardStatus || 'normal',
    trainType: trainTypeMap[train.stopType],
    services: train.services || [],
  };
  
  // 检查是否是停运状态
  const isSuspended = train.cardStatus === 'suspended';
  
  return (
    <motion.div
      className="absolute cursor-pointer group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isDimmed ? 0.35 : 1, 
        scale: isSelected ? 1.02 : 1,
        filter: isDimmed ? 'blur(2px)' : 'blur(0px)'
      }}
      whileHover={{ scale: isDimmed ? 1 : 1.01, y: isDimmed ? 0 : -2, zIndex: isDimmed ? undefined : 50 }}
      whileTap={{ scale: isDimmed ? 1 : 0.99 }}
      onClick={onSelect}
      transition={{ duration: 0.18 }}
      style={{ 
        left: `${left}px`, 
        bottom: `${bottom}px`,
        width: `${width}px`, 
        minWidth: '210px',
        zIndex: isSelected ? 100 : (isLinked ? 90 : undefined),
        pointerEvents: isDimmed ? 'none' : 'auto',
        overflow: 'visible'
      }}
    >
      {useNewCard ? (
        isNorth ? (
          <TrainCardNorth {...cardProps} />
        ) : (
          <TrainCardSouth {...cardProps} />
        )
      ) : (
        isNorth ? (
          <TrainCardNorth {...cardProps} />
        ) : (
          <TrainCardSouth {...cardProps} />
        )
      )}
    </motion.div>
  );
};

// ============ 车次卡片组件 (macOS 风格) ============
const TrainCardComponentOld = ({ 
  train, 
  left, 
  width, 
  bottom, 
  isSelected,
  isLinked,
  isDimmed,
  onSelect,
  isDark
}: { 
  train: TrainCard; 
  left: number; 
  width: number; 
  bottom: number;
  isSelected: boolean;
  isLinked?: boolean;
  isDimmed?: boolean;
  onSelect: () => void;
  isDark: boolean;
}) => {
  const trainColorSet = TRAIN_TYPE_COLORS[train.stopType];
  const trainColor = isDark ? trainColorSet.darkBg : trainColorSet.bg;
  const platformColor = getPlatformColor(train.formationCount, train.sequenceType, train.lineDirection);
  
  // 根据 direction 决定缺口位置 - 高铁流线型车头方向
  const isUpDirection = train.lineDirection === '上';
  
  // 转换状态格式
  const taskStatuses = ['检票', '站台', '出站', '上水'].map((label) => {
    const task = train.tasks.find(t => t.type === label);
    return task ? task.status : 'pending';
  });
  
  // 检测是否有作业异常
  const hasError = taskStatuses.includes('error');

  // macOS 风格颜色
  const cardBg = isDark ? '#2C2C2E' : '#F8FAFD';
  const cardBgHover = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.015)';
  const primaryText = isDark ? '#FFFFFF' : '#1E293B';
  const secondaryText = isDark ? '#98989D' : '#64748B';
  const tertiaryText = isDark ? '#636366' : '#94A3B8';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.25)';

  return (
    <motion.div
      className="absolute cursor-pointer group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isDimmed ? 0.35 : 1, 
        scale: isSelected ? 1.02 : 1,
        filter: isDimmed ? 'blur(2px)' : 'blur(0px)'
      }}
      whileHover={{ scale: isDimmed ? 1 : 1.01, y: isDimmed ? 0 : -2, zIndex: isDimmed ? undefined : 50 }}
      whileTap={{ scale: isDimmed ? 1 : 0.99 }}
      onClick={onSelect}
      transition={{ duration: 0.18 }}
      style={{ 
        left: `${left}px`, 
        bottom: `${bottom}px`,
        width: `${width}px`, 
        minWidth: '280px',
        zIndex: isSelected ? 100 : (isLinked ? 90 : undefined),
        pointerEvents: isDimmed ? 'none' : 'auto'
      }}
    >
      {/* macOS 风格卡片主体 - 增强立体效果 */}
      <motion.div
        className="relative overflow-hidden"
        animate={hasError ? {
          boxShadow: [
            `0 0 0 1.5px ${isDark ? '#FF453A' : '#E11D48'}, 0 6px 20px ${isDark ? 'rgba(255,69,58,0.35)' : 'rgba(225,29,72,0.15)'}`,
            `0 0 0 2px ${isDark ? '#FF453A' : '#E11D48'}, 0 8px 24px ${isDark ? 'rgba(255,69,58,0.45)' : 'rgba(225,29,72,0.22)'}`,
            `0 0 0 1.5px ${isDark ? '#FF453A' : '#E11D48'}, 0 6px 20px ${isDark ? 'rgba(255,69,58,0.35)' : 'rgba(225,29,72,0.15)'}`,
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: hasError 
            ? (isDark ? 'linear-gradient(145deg, #3A2A2A 0%, #2C2222 100%)' : 'linear-gradient(145deg, #FFF5F5 0%, #FEF0F0 100%)')
            : isDark 
              ? 'linear-gradient(145deg, #3A3A3C 0%, #2C2C2E 50%, #1C1C1E 100%)'
              : 'linear-gradient(145deg, #FBFCFE 0%, #F3F6FA 50%, #EEF2F7 100%)',
          boxShadow: hasError
            ? `0 0 0 1.5px ${isDark ? '#FF453A' : '#E11D48'}`
            : isSelected
              ? `0 6px 24px ${isDark ? 'rgba(0,122,255,0.3)' : 'rgba(0,122,255,0.18)'}, 0 0 0 1.5px ${isDark ? '#0A84FF' : '#007AFF'}, inset 0 1px 0 ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}`
              : isLinked
                ? `0 6px 24px ${isDark ? 'rgba(48,209,88,0.3)' : 'rgba(52,199,89,0.18)'}, 0 0 0 1.5px ${isDark ? '#30D158' : '#34C759'}, inset 0 1px 0 ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}`
                : isDark
                  ? `0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
                  : `0 2px 10px rgba(100,116,139,0.1), 0 1px 3px rgba(100,116,139,0.08), inset 0 1px 0 rgba(255,255,255,0.95)`,
          border: `1px solid ${borderColor}`,
          // 高铁车头形状：顶部单侧大圆角指示方向
          borderTopLeftRadius: isUpDirection ? '40px' : '12px',
          borderBottomLeftRadius: '12px',
          borderTopRightRadius: isUpDirection ? '12px' : '40px',
          borderBottomRightRadius: '12px',
        }}
      >
        {/* 悬停效果层 */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ 
            background: hasError ? 'transparent' : cardBgHover,
            borderTopLeftRadius: isUpDirection ? '40px' : '12px',
            borderBottomLeftRadius: '12px',
            borderTopRightRadius: isUpDirection ? '12px' : '40px',
            borderBottomRightRadius: '12px',
          }}
        />
        
        {/* 顶部区域：重点作业标签 + 客流信息 */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 relative"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(148,163,184,0.08)',
            borderTopLeftRadius: isUpDirection ? '40px' : '12px',
            borderTopRightRadius: isUpDirection ? '12px' : '40px',
            borderBottom: `1px solid ${borderColor}`,
            paddingLeft: isUpDirection ? '24px' : '12px',
            paddingRight: isUpDirection ? '12px' : '24px',
          }}
        >
          {/* 左侧：重点作业标签 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {train.priorityTasks.map((task) => {
              const colors = PRIORITY_TASK_COLORS[task];
              return (
                <span 
                  key={task}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                  style={{ 
                    backgroundColor: isDark ? colors.darkBg : colors.bg, 
                    color: isDark ? colors.darkText : colors.text 
                  }}
                >
                  {task}
                </span>
              );
            })}
          </div>
          
          {/* 右侧：客流信息 */}
          <div className="flex items-center gap-3">
            {train.passengerUp !== undefined && (
              <div className="flex items-center gap-1">
                <UserPlus className="w-3 h-3" style={{ color: isDark ? '#30D158' : '#34C759' }} />
                <span className="text-[10px] font-semibold" style={{ color: isDark ? '#30D158' : '#34C759' }}>{train.passengerUp}</span>
              </div>
            )}
            {train.passengerDown !== undefined && (
              <div className="flex items-center gap-1">
                <UserMinus className="w-3 h-3" style={{ color: isDark ? '#FF9F0A' : '#FF9500' }} />
                <span className="text-[10px] font-semibold" style={{ color: isDark ? '#FF9F0A' : '#FF9500' }}>{train.passengerDown}</span>
              </div>
            )}
            {train.passengerTransfer !== undefined && (
              <div className="flex items-center gap-1">
                <Repeat className="w-3 h-3" style={{ color: isDark ? '#0A84FF' : '#007AFF' }} />
                <span className="text-[10px] font-semibold" style={{ color: isDark ? '#0A84FF' : '#007AFF' }}>{train.passengerTransfer}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 车次信息行 */}
        <div className="flex items-center justify-between px-3 py-2 relative"
          style={{ 
            background: `linear-gradient(135deg, ${trainColor}${isDark ? '20' : '10'} 0%, ${trainColor}${isDark ? '10' : '05'} 100%)`,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {/* 左侧：车次标签 + 站点 */}
          <div className="flex items-center gap-3">
            {/* 车次标签 */}
            <div
              className="px-3 py-1 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: trainColor,
              }}
            >
              <span className="text-white font-semibold text-sm tracking-wide">
                {train.trainNo}
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: primaryText }}>{train.from}→{train.to}</span>
          </div>

          {/* 右侧：编组信息 */}
          <div className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: platformColor }}
              title={`${train.formationCount}编组 ${train.sequenceType}序`}
            />
            <span className="text-xs font-mono" style={{ color: secondaryText }}>
              {train.formationCount}{train.sequenceType}{train.lineDirection === '上' ? '北' : '南'}
            </span>
          </div>
        </div>

        {/* 中部数据区 - 时间信息 */}
        <div className="flex items-center gap-2 px-3 py-2 relative"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(148,163,184,0.05)',
          }}
        >
          {/* 到点 */}
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px]" style={{ color: tertiaryText }}>到</span>
            <span className="text-sm font-mono font-semibold" style={{ color: primaryText }}>{train.arrivalTime}</span>
          </div>
          {/* 分隔线 */}
          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />
          {/* 发点 */}
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px]" style={{ color: tertiaryText }}>发</span>
            <span className="text-sm font-mono font-semibold" style={{ color: primaryText }}>{train.departureTime}</span>
          </div>
          {/* 分隔线 */}
          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />
          {/* 站停时间 */}
          <div className="flex items-center gap-1.5 flex-1 justify-center"
            style={{ 
              backgroundColor: isDark ? 'rgba(48,209,88,0.1)' : 'rgba(5,150,105,0.08)',
              borderRadius: '6px',
              padding: '2px 6px',
            }}
          >
            <Timer className="w-3 h-3" style={{ color: isDark ? '#30D158' : '#059669' }} />
            <span className="text-xs font-semibold" style={{ color: isDark ? '#30D158' : '#059669' }}>{train.stopMinutes}分</span>
          </div>
          {/* 分隔线 */}
          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />
          {/* 股道 */}
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            <span className="text-[10px]" style={{ color: tertiaryText }}>股道</span>
            <span className="text-base font-bold" style={{ color: primaryText }}>{train.track}</span>
          </div>
        </div>

        {/* 底部状态区 - 色条指示 */}
        <div className="flex items-stretch justify-between relative"
          style={{ 
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          }}
        >
          {['检票', '站台', '出站', '水污'].map((label, index) => {
            const status = taskStatuses[index];
            const colorSet = STATUS_BAR_COLORS[status];
            const barColor = isDark ? colorSet.darkBg : colorSet.bg;

            return (
              <div key={label} className="flex-1 flex flex-col items-center px-1.5 pt-1.5 pb-0">
                <span 
                  className="text-[10px] font-medium mb-1" 
                  style={{ color: hasError ? (isDark ? '#FF453A' : '#FF3B30') : secondaryText }}
                >
                  {label}
                </span>
                <div 
                  className="w-full h-2 rounded-t transition-colors"
                  style={{ backgroundColor: barColor }}
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ 主页面组件 ============
export default function SupervisionGlassPage() {
  const [isDark, setIsDark] = useState(false);
  const [useNewTrainCard, setUseNewTrainCard] = useState(true); // 新增：是否使用新的车次卡片
  const [scrollLeft, setScrollLeft] = useState(0);
  const [pixelsPerMinute, setPixelsPerMinute] = useState(5);
  const [trainsByStation, setTrainsByStation] = useState<Map<string, TrainCard[]> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [linkedTrainIds, setLinkedTrainIds] = useState<Set<string>>(new Set()); // 相同车次关联
  
  // 最小卡片宽度
  const MIN_CARD_WIDTH = 320;
  const CARD_GAP = 20; // 卡片之间最小间距（像素）
  
  // 客户端生成数据，避免 Hydration 错误
  useEffect(() => {
    const data = generateMockData();
    setTrainsByStation(data);
    
    // 自动计算最小缩放比例，确保卡片不重叠
    let minTimeGap = Infinity;
    
    data.forEach((trains) => {
      // 按到达时间排序
      const sortedTrains = [...trains].sort((a, b) => 
        a.arrivalTime.localeCompare(b.arrivalTime)
      );
      
      // 计算相邻车次的最小时间间隔
      for (let i = 0; i < sortedTrains.length - 1; i++) {
        const current = sortedTrains[i];
        const next = sortedTrains[i + 1];
        
        // 当前车次出发时间和下一车次到达时间的间隔
        const currentEnd = timeToMinutesStatic(current.departureTime);
        const nextStart = timeToMinutesStatic(next.arrivalTime);
        const gap = nextStart - currentEnd;
        
        if (gap < minTimeGap) {
          minTimeGap = gap;
        }
      }
    });
    
    // 计算最小像素比例
    // 如果最小时间间隔小于等于0（有重叠），需要更大的缩放
    if (minTimeGap <= 0) {
      // 完全重叠的情况，需要把卡片分开
      // 假设最小需要10分钟的间隔
      minTimeGap = 10;
    }
    
    // 计算所需的像素比例：MIN_CARD_WIDTH + CARD_GAP 需要对应 minTimeGap 分钟
    const minPixelsPerMinute = Math.max(5, Math.ceil((MIN_CARD_WIDTH + CARD_GAP) / Math.max(minTimeGap, 1)));
    
    // 设置一个合理的缩放比例（至少5，最大不超过15）
    const finalScale = Math.min(15, Math.max(5, minPixelsPerMinute));
    setPixelsPerMinute(finalScale);
  }, []);
  
  // 时间转换辅助函数（静态版本，用于初始化）
  const timeToMinutesStatic = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  // 每分钟更新当前时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  // 滚动容器引用
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  
  // 鼠标拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0);
  
  const startHour = 6;
  const endHour = 24;
  const leftPanelWidth = 150;
  const totalWidth = (endHour - startHour) * 60 * pixelsPerMinute;
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const timeToPixels = (time: string) => {
    return (timeToMinutes(time) - startHour * 60) * pixelsPerMinute;
  };
  
  const durationToPixels = (arrival: string, departure: string) => {
    return (timeToMinutes(departure) - timeToMinutes(arrival)) * pixelsPerMinute;
  };
  
  // 卡片实际高度（根据卡片内容计算）
  // 顶部区域：py-1(4px*2) + 内容20px = 28px
  // 深色标题栏：py-2(8px*2) + 内容24px = 40px
  // 中部数据区：py-2(8px*2) + 内容24px = 40px
  // 底部状态区：py-2(8px*2) + 内容20px = 36px
  // 总计：144px
  const CARD_HEIGHT = 144;
  const CARD_MARGIN_BOTTOM = 8;
  const CARD_MARGIN_TOP = 8;
  const MIN_ROW_HEIGHT = 120;
  const MAX_ROW_HEIGHT = 180;
  
  // 计算单个卡片高度
  const getCardHeight = (train: TrainCard) => {
    return CARD_HEIGHT;
  };
  
  // 计算行高（返回每行的高度数组）
  const calculateRowHeights = (trains: TrainCard[]): number[] => {
    const sortedTrains = [...trains].sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    const rowEndTimes: number[] = [];
    const rowMaxHeights: number[] = [];
    
    sortedTrains.forEach(train => {
      const start = timeToMinutes(train.arrivalTime);
      const end = timeToMinutes(train.departureTime);
      const cardHeight = getCardHeight(train) + CARD_MARGIN_BOTTOM + CARD_MARGIN_TOP;
      
      let placedRow = -1;
      for (let i = 0; i < rowEndTimes.length; i++) {
        // 使用更大的时间间隔避免卡片重叠
        if (rowEndTimes[i] + 15 <= start) {
          placedRow = i;
          break;
        }
      }
      
      if (placedRow === -1) {
        rowEndTimes.push(end);
        rowMaxHeights.push(cardHeight);
      } else {
        rowEndTimes[placedRow] = end;
        rowMaxHeights[placedRow] = Math.max(rowMaxHeights[placedRow], cardHeight);
      }
    });
    
    return rowMaxHeights.length > 0 ? rowMaxHeights : [CARD_HEIGHT + CARD_MARGIN_BOTTOM + CARD_MARGIN_TOP];
  };
  
  // 计算总行高
  const calculateTotalRowHeight = (trains: TrainCard[]): number => {
    const rowHeights = calculateRowHeights(trains);
    const rawTotal = rowHeights.reduce((sum, h) => sum + h, 0);
    if (trains.length === 0) return MIN_ROW_HEIGHT;
    if (trains.length === 1) return Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, rawTotal));
    return Math.max(MIN_ROW_HEIGHT, rawTotal);
  };
  
  // 获取车次位置
  const getTrainPositions = (trains: TrainCard[]) => {
    const sortedTrains = [...trains].sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    const rows: { train: TrainCard; row: number; bottom: number }[] = [];
    const rowEndTimes: number[] = [];
    const rowHeights = calculateRowHeights(trains);
    
    sortedTrains.forEach(train => {
      const start = timeToMinutes(train.arrivalTime);
      const end = timeToMinutes(train.departureTime);
      
      let placedRow = -1;
      for (let i = 0; i < rowEndTimes.length; i++) {
        // 使用更大的时间间隔避免卡片重叠
        if (rowEndTimes[i] + 15 <= start) {
          placedRow = i;
          break;
        }
      }
      
      if (placedRow === -1) {
        placedRow = rowEndTimes.length;
        rowEndTimes.push(end);
      } else {
        rowEndTimes[placedRow] = end;
      }
      
      // 计算卡片的底部位置
      let bottom = CARD_MARGIN_BOTTOM;
      for (let i = 0; i < placedRow; i++) {
        bottom += rowHeights[i];
      }
      
      rows.push({ train, row: placedRow, bottom });
    });
    
    return rows;
  };
  
  // 鼠标滚轮处理 - 水平滚动
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY !== 0) {
      setScrollLeft(prev => Math.max(0, prev + e.deltaY * 0.5));
    }
  }, []);
  
  // 垂直滚动同步处理
  const handleVerticalScroll = useCallback((source: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    const targetRef = source === 'left' ? rightPanelRef : leftPanelRef;
    const sourceRef = source === 'left' ? leftPanelRef : rightPanelRef;
    
    if (targetRef.current && sourceRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
    }
  }, []);
  
  // 鼠标拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 如果点击的是按钮或链接，不触发拖拽
    if ((e.target as HTMLElement).closest('button, a')) return;
    
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setDragStartScroll(scrollLeft);
    // 获取当前垂直滚动位置
    const currentScrollTop = rightPanelRef.current?.scrollTop || 0;
    setDragStartScrollTop(currentScrollTop);
    e.preventDefault();
  }, [scrollLeft]);
  
  // 鼠标拖拽移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // 水平滚动
    const deltaX = e.clientX - dragStartX;
    const newScrollLeft = Math.max(0, Math.min(totalWidth - 800, dragStartScroll - deltaX));
    setScrollLeft(newScrollLeft);
    
    // 垂直滚动
    const deltaY = e.clientY - dragStartY;
    const newScrollTop = Math.max(0, dragStartScrollTop - deltaY);
    
    // 同步左右两个面板的垂直滚动
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = newScrollTop;
    }
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTop = newScrollTop;
    }
  }, [isDragging, dragStartX, dragStartY, dragStartScroll, dragStartScrollTop, totalWidth]);
  
  // 鼠标离开区域
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // 点击空白处取消选择（不恢复自动滚动）
  const handleBackgroundClick = useCallback(() => {
    setSelectedTrainId(null);
    setLinkedTrainIds(new Set());
  }, []);
  
  // 鼠标拖拽结束 - 检测是否是点击
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // 如果鼠标移动距离很小（<5px），认为是点击而非拖拽
    const deltaX = Math.abs(e.clientX - dragStartX);
    const deltaY = Math.abs(e.clientY - dragStartY);
    
    if (deltaX < 5 && deltaY < 5) {
      // 点击空白区域，取消选中
      handleBackgroundClick();
    }
    
    setIsDragging(false);
  }, [dragStartX, dragStartY, handleBackgroundClick]);
  
  // ========== 新增功能 ==========
  
  // 自动滚动开关
  const [autoScroll, setAutoScroll] = useState(false);
  
  // 自动滚动到当前时间
  const scrollToCurrentTime = useCallback(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetScrollLeft = Math.max(0, (currentMinutes - startHour * 60) * pixelsPerMinute - 400);
    
    // 平滑滚动动画
    const startScroll = scrollLeft;
    const diff = targetScrollLeft - startScroll;
    const duration = 800;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setScrollLeft(startScroll + diff * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [scrollLeft, startHour, pixelsPerMinute]);
  
  // 时间自动滚动效果 - 卡片随时间向左移动
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      setScrollLeft(prev => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const targetScrollLeft = Math.max(0, (currentMinutes - startHour * 60) * pixelsPerMinute - 400);
        
        // 平滑过渡
        const diff = targetScrollLeft - prev;
        if (Math.abs(diff) < 1) return prev;
        return prev + diff * 0.1; // 缓动
      });
    }, 1000); // 每秒更新一次
    
    return () => clearInterval(interval);
  }, [autoScroll, startHour, pixelsPerMinute]);
  
  // 车次选择处理 - 关联相同车次并自动调整视图
  const handleTrainSelect = useCallback((trainId: string, trainNo: string) => {
    // 关闭自动滚动
    setAutoScroll(false);
    
    setSelectedTrainId(trainId);
    
    // 查找相同车次号的所有车次
    const linked = new Set<string>();
    linked.add(trainId);
    
    const linkedTrains: { train: TrainCard; stationId: string }[] = [];
    
    trainsByStation?.forEach((trains, stationId) => {
      trains.forEach(t => {
        if (t.trainNo === trainNo) {
          linked.add(t.id);
          linkedTrains.push({ train: t, stationId });
        }
      });
    });
    
    setLinkedTrainIds(linked);
    
    // 如果有多个关联车次，自动调整缩放和位置
    if (linkedTrains.length > 0) {
      // 计算所有关联车次的时间范围
      let minTime = Infinity;
      let maxTime = 0;
      
      // 内联时间计算函数
      const getTimeInMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };
      
      linkedTrains.forEach(({ train }) => {
        const arrival = getTimeInMinutes(train.arrivalTime);
        const departure = getTimeInMinutes(train.departureTime);
        minTime = Math.min(minTime, arrival);
        maxTime = Math.max(maxTime, departure);
      });
      
      // 计算所需的缩放比例和滚动位置
      const timeRange = maxTime - minTime;
      const visibleWidth = 800; // 可见区域宽度
      const targetPixelsPerMinute = Math.max(5, Math.min(12, visibleWidth / (timeRange + 60))); // 加1小时余量
      
      // 平滑过渡到新的缩放比例
      setPixelsPerMinute(targetPixelsPerMinute);
      
      // 计算滚动位置（居中显示）
      const centerTime = (minTime + maxTime) / 2;
      const targetScrollLeft = Math.max(0, (centerTime - startHour * 60 - 6) * targetPixelsPerMinute - visibleWidth / 2);
      
      // 使用动画平滑滚动
      setTimeout(() => {
        setScrollLeft(targetScrollLeft);
      }, 100);
    }
  }, [trainsByStation, startHour]);
  
  // 计算站停时间
  const getStopDuration = useCallback((arrival: string, departure: string) => {
    const [aH, aM] = arrival.split(':').map(Number);
    const [dH, dM] = departure.split(':').map(Number);
    return (dH * 60 + dM) - (aH * 60 + aM);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const timeLineLeft = (currentMinutes - startHour * 60) * pixelsPerMinute - scrollLeft;
  
  // 数据加载中
  if (!trainsByStation) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEF2F7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-500/60 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-medium text-sm">加载中...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`h-screen overflow-hidden flex flex-col transition-colors duration-280 ${
      isDark ? 'bg-slate-950' : 'bg-[#EEF2F7]'
    }`}>
      {/* 顶部工具栏 */}
      <header className={`flex-shrink-0 border-b transition-all duration-280 ${
        isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-[#F3F6FA]/90 backdrop-blur-lg border-slate-200/60 shadow-sm'
      }`}>
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg ${isDark ? 'shadow-cyan-500/30' : 'shadow-cyan-500/20'}`}>
              <TrainFront className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-700'}`}>代管盯控</h1>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>客运指挥界面</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button 
              onClick={() => setPixelsPerMinute(prev => Math.max(prev - 1, 2))} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl border transition-all duration-200 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' : 'bg-[#EEF2F7] hover:bg-[#E4EAF2] border-slate-200/80 text-slate-500 shadow-sm'}`}>
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            <span className={`w-24 text-center text-sm font-mono ${isDark ? 'text-white/50' : 'text-slate-400'}`}>{pixelsPerMinute.toFixed(1)} px/min</span>
            <motion.button 
              onClick={() => setPixelsPerMinute(prev => Math.min(prev + 1, 12))} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl border transition-all duration-200 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' : 'bg-[#EEF2F7] hover:bg-[#E4EAF2] border-slate-200/80 text-slate-500 shadow-sm'}`}>
              <ZoomIn className="w-4 h-4" />
            </motion.button>
            <motion.button 
              onClick={() => { setPixelsPerMinute(5); setScrollLeft(0); }} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl border transition-all duration-200 ml-2 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' : 'bg-[#EEF2F7] hover:bg-[#E4EAF2] border-slate-200/80 text-slate-500 shadow-sm'}`}>
              <RotateCcw className="w-4 h-4" />
            </motion.button>
            
            {/* 切换车次卡片样式 */}
            <motion.button
              onClick={() => setUseNewTrainCard(!useNewTrainCard)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ml-2 ${
                useNewTrainCard
                  ? (isDark 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' 
                      : 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15 border-transparent')
                  : (isDark 
                      ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' 
                      : 'bg-[#EEF2F7] text-slate-500 border-slate-200/80 hover:bg-[#E4EAF2]')
              }`}
            >
              <TrainFront className="w-4 h-4" />
              <span className="text-xs font-medium">{useNewTrainCard ? '新版卡片' : '旧版卡片'}</span>
            </motion.button>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#EEF2F7] border-slate-200/80 shadow-sm'}`}>
              <Timer className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-base font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-600'}`}>
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
            
            {/* 回到当前时间按钮 */}
            <motion.button 
              onClick={scrollToCurrentTime}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30' 
                  : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md shadow-blue-500/15'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>回到当前</span>
            </motion.button>
            
            {/* 自动滚动开关 */}
            <motion.button 
              onClick={() => setAutoScroll(!autoScroll)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                autoScroll
                  ? (isDark 
                      ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400 border border-green-500/50' 
                      : 'bg-[#059669] text-white shadow-md shadow-emerald-500/15')
                  : (isDark 
                      ? 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10' 
                      : 'bg-[#EEF2F7] text-slate-500 border border-slate-200/80 hover:bg-[#E4EAF2]')
              }`}
            >
              <motion.div
                animate={{ rotate: autoScroll ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Timer className="w-4 h-4" />
              </motion.div>
              <span>{autoScroll ? '自动跟踪' : '自动滚动'}</span>
            </motion.button>
            
            <motion.button onClick={() => setIsDark(!isDark)} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-280 ${
                isDark ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300/50 shadow-md shadow-amber-500/20' : 'bg-[#EEF2F7] border-slate-200/80 text-slate-500 shadow-sm hover:bg-[#E4EAF2]'
              }`}>
              {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧站点列表 */}
        <div className={`flex-shrink-0 border-r overflow-hidden ${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-[#F3F6FA] border-slate-200/60'}`}
          style={{ width: `${leftPanelWidth}px` }}>
          
          {/* 站点列表头部 */}
          <div className={`h-10 border-b flex items-center px-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200/60 bg-[#EEF2F7]'}`}>
            <span className={`text-sm font-semibold ${isDark ? 'text-white/70' : 'text-slate-500'}`}>站点</span>
          </div>
          
          {/* 站点行 */}
          <div 
            ref={leftPanelRef} 
            className="overflow-y-auto h-[calc(100%-40px)]" 
            style={{ scrollbarWidth: 'none' }}
            onScroll={handleVerticalScroll('left')}
          >
            {stationRows.map((station, stationIndex) => {
              const trains = trainsByStation?.get(station.id) || [];
              const rowHeight = calculateTotalRowHeight(trains);
              
              // 隔行变色
              const isEvenRow = stationIndex % 2 === 0;
              
              // 显示颜色标识和名称（如果有stationName则显示"站名 场名"格式）
              const displayName = station.stationName 
                ? `${station.stationName} ${station.name}`
                : station.name;
              
              return (
                <motion.div 
                  key={station.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(226,232,240,0.8)',
                    transition: { duration: 0.15 }
                  }}
                  className={`border-b flex items-center px-4 ${isDark ? 'border-white/5' : 'border-slate-200/50'}`}
                  style={{ 
                    height: `${rowHeight}px`,
                    backgroundColor: isDark
                      ? (isEvenRow ? 'rgba(30, 41, 59, 0.3)' : 'rgba(15, 23, 42, 0.5)')
                      : (isEvenRow ? '#F3F6FA' : '#EEF2F7')
                  }}>
                  {/* 颜色标识条 */}
                  <motion.div 
                    className="w-2.5 h-7 rounded-sm mr-3 flex-shrink-0"
                    style={{ backgroundColor: station.color }}
                    whileHover={{ 
                      height: 32,
                      boxShadow: `0 0 15px ${station.color}`,
                      transition: { duration: 0.2 }
                    }}
                  />
                  <div className="flex flex-col">
                    {station.stationName && (
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                        {station.stationName}
                      </span>
                    )}
                    <motion.span 
                      className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                      whileHover={{ scale: 1.02 }}
                    >
                      {station.name}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* 右侧甘特图区域 */}
        <div 
          className="flex-1 overflow-hidden relative select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* 时间刻度行 */}
          <div className={`h-10 border-b flex-shrink-0 overflow-hidden ${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-[#EEF2F7] border-slate-200/60'}`}>
            <div className="relative h-full" style={{ width: `${totalWidth}px`, transform: `translateX(-${scrollLeft}px)` }}>
              {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute top-0 bottom-0 flex flex-col justify-center cursor-default" 
                  style={{ left: `${i * 60 * pixelsPerMinute}px`, width: '1px' }}>
                  <div className={`w-px h-full ${isDark ? 'bg-white/10' : 'bg-slate-300/60'}`} />
                  <motion.span 
                    whileHover={{ scale: 1.1, color: '#2563EB' }}
                    className={`absolute left-2 text-sm font-mono font-medium ${isDark ? 'text-white/50' : 'text-slate-400'}`}
                  >
                    {String(startHour + i).padStart(2, '0')}:00
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* 甘特图内容 */}
          <div 
            ref={rightPanelRef} 
            className="overflow-y-auto h-[calc(100%-40px)]" 
            style={{ scrollbarWidth: 'none' }}
            onScroll={handleVerticalScroll('right')}
          >
            <div className="relative" style={{ width: `${totalWidth}px` }}>
              {stationRows.map((station, stationIndex) => {
                const trains = trainsByStation.get(station.id) || [];
                const positions = getTrainPositions(trains);
                const totalRowHeight = calculateTotalRowHeight(trains);
                
                // 隔行变色
                const isEvenRow = stationIndex % 2 === 0;
                
                // 场/站行 - 显示车次
                return (
                  <div key={station.id} 
                    className={`relative border-b ${isDark ? 'border-white/5' : 'border-slate-200/50'}`}
                    style={{ 
                      height: `${totalRowHeight}px`,
                      backgroundColor: isDark
                        ? (isEvenRow ? 'rgba(30, 41, 59, 0.3)' : 'rgba(15, 23, 42, 0.5)')
                        : (isEvenRow ? '#F3F6FA' : '#EEF2F7')
                    }}>
                    
                    {/* 网格背景 */}
                    <div className="absolute inset-0" style={{ transform: `translateX(-${scrollLeft}px)` }}>
                      {Array.from({ length: endHour - startHour }).map((_, i) => (
                        <div key={i} className={`absolute top-0 bottom-0 w-px ${isDark ? 'bg-white/5' : 'bg-slate-300/30'}`}
                          style={{ left: `${i * 60 * pixelsPerMinute}px` }} />
                      ))}
                    </div>
                    
                    {/* 车次卡片 - 底部对齐，动态计算位置 */}
                    {positions.map(({ train, row, bottom }) => (
                      useNewTrainCard ? (
                        <WrappedTrainCard 
                          key={train.id} 
                          train={train}
                          left={timeToPixels(train.arrivalTime) - scrollLeft}
                          width={Math.max(durationToPixels(train.arrivalTime, train.departureTime), 210)}
                          bottom={bottom}
                          isSelected={selectedTrainId === train.id}
                          isLinked={linkedTrainIds.has(train.id)}
                          isDimmed={selectedTrainId !== null && selectedTrainId !== train.id && !linkedTrainIds.has(train.id)}
                          onSelect={() => handleTrainSelect(train.id, train.trainNo)}
                        />
                      ) : (
                        <TrainCardComponentOld 
                          key={train.id} 
                          train={train}
                          left={timeToPixels(train.arrivalTime) - scrollLeft}
                          width={Math.max(durationToPixels(train.arrivalTime, train.departureTime), 320)}
                          bottom={bottom}
                          isSelected={selectedTrainId === train.id}
                          isLinked={linkedTrainIds.has(train.id)}
                          isDimmed={selectedTrainId !== null && selectedTrainId !== train.id && !linkedTrainIds.has(train.id)}
                          onSelect={() => handleTrainSelect(train.id, train.trainNo)}
                          isDark={isDark}
                        />
                      )
                    ))}
                  </div>
                );
              })}
              
              {/* 当前时间线 */}
              {timeLineLeft >= 0 && timeLineLeft <= totalWidth && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`absolute top-0 bottom-0 w-px pointer-events-none z-20 ${isDark ? 'bg-red-500/70' : 'bg-rose-400/60'}`}
                  style={{ left: `${timeLineLeft}px` }}>
                  <div className={`absolute -top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-red-500' : 'bg-rose-400'} shadow-md ${isDark ? 'shadow-red-500/40' : 'shadow-rose-400/30'}`}>
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-red-500' : 'bg-rose-400'} animate-ping opacity-40`} />
                  </div>
                </motion.div>
              )}
              
              {/* 车次连接线 - 已移除 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
