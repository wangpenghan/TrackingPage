/**
 * @name 客运指挥
 * 多站列车盯控系统，时间轴+卡片定位布局。
 * 时间轴支持缩放平移，卡片按到发时间定位，到站/离站双行排列，中间股道分隔。
 * 支持深色/浅色模式切换。
 */

'use client';

import './style.css';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrainFront,
  Timer,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Clock,
  ArrowRight,
  Droplet,
  Biohazard,
  UtensilsCrossed,
  Package,
  Truck,
  Crown,
  Users,
  ArrowRightFromLine,
  ArrowLeftFromLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TrainCardNorth, TrainCardSouth, TrainCardStatus, TrainType, ServiceTag } from '@/components/TrainCard';

type TrainType = 'G' | 'D' | 'C';
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
  trainType: TrainType;
  arrivalTime: string;
  departureTime: string;
  track: string;
  delayMinutes: number;
  stopMinutes: number;
  from: string;
  to: string;
  tasks: TrainTask[];
  formationCount: 8 | 16;
  sequenceType: '正' | '倒';
  lineDirection: '上' | '下';
  directionLabel: '北' | '南' | '东' | '西';
  stopType: '始发' | '途径' | '终到';
  priorityTasks: string[];
  connectedToId?: string;
  passengerUp?: number;
  passengerDown?: number;
  passengerTransfer?: number;
  trackChange?: boolean;
  trackOriginal?: string;
  // 新增字段
  cardStatus?: TrainCardStatus;
  services?: ServiceTag[];
}

interface StationRowConfig {
  id: string;
  name: string;
  color: string;
  stationName?: string;
}

const stationRows: StationRowConfig[] = [
  { id: 'yuxia', name: '渝厦高铁场', color: '#3b82f6', stationName: '重庆东' }
];

const getStopTypeColor = (stopType: '始发' | '途径' | '终到'): string => {
  switch (stopType) {
    case '始发': return '#f97316';
    case '途径': return '#7c3aed';
    case '终到': return '#10b981';
  }
};

const PRIORITY_TASK_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  '上水': { bg: '#DBEAFE', text: '#1E40AF', darkBg: '#1E3A5F', darkText: '#60A5FA' },
  '吸污': { bg: '#DCFCE7', text: '#166534', darkBg: '#14532D', darkText: '#4ADE80' },
  '送餐': { bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FBBF24' },
  '行包': { bg: '#F3E8FF', text: '#6B21A8', darkBg: '#581C87', darkText: '#C084FC' },
  '快运': { bg: '#FFE4E6', text: '#BE123C', darkBg: '#881337', darkText: '#FB7185' },
  '专运': { bg: '#FFEDD5', text: '#9A3412', darkBg: '#7C2D12', darkText: '#FB923C' },
  '超员': { bg: '#FEE2E2', text: '#DC2626', darkBg: '#7F1D1D', darkText: '#FCA5A5' },
  '出库': { bg: '#E0F2FE', text: '#075985', darkBg: '#0C4A6E', darkText: '#38BDF8' },
  '入库': { bg: '#FCE7F3', text: '#9D174D', darkBg: '#831843', darkText: '#F472B6' },
};

const PRIORITY_TASK_ICONS: Record<string, LucideIcon> = {
  '上水': Droplet,
  '吸污': Biohazard,
  '送餐': UtensilsCrossed,
  '行包': Package,
  '快运': Truck,
  '专运': Crown,
  '超员': Users,
  '出库': ArrowRightFromLine,
  '入库': ArrowLeftFromLine,
};

const DIRECTION_CONFIG: Record<string, { arrow: string; color: string; darkColor: string }> = {
  '北': { arrow: '↑', color: '#2563EB', darkColor: '#60A5FA' },
  '南': { arrow: '↓', color: '#DC2626', darkColor: '#F87171' },
  '东': { arrow: '→', color: '#059669', darkColor: '#34D399' },
  '西': { arrow: '←', color: '#D97706', darkColor: '#FBBF24' },
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const generateMockData = (): Map<string, TrainCard[]> => {
  const taskTypes: TaskType[] = ['检票', '站台', '出站', '上水', '吸污'];

  const makeTasks = (trainNo: string, count: number): TrainTask[] => {
    return taskTypes.slice(0, count).map((type, idx) => {
      const rand = Math.random();
      let status: TaskStatus;
      if (rand < 0.6) status = 'completed';
      else if (rand < 0.8) status = 'running';
      else if (rand < 0.95) status = 'pending';
      else status = 'error';
      return {
        id: `task-${trainNo}-yuxia-${idx}`,
        type,
        status,
        progress: status === 'running' ? Math.floor(Math.random() * 60) + 20 : undefined,
      };
    });
  };

  const getRandomPriorityTasks = (): string[] => {
    const pool = ['上水', '吸污', '行包', '快运', '送餐', '出库', '入库'];
    const count = Math.floor(Math.random() * 6); // 0-5
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const getRandomServices = (): ServiceTag[] => {
    const allServices = ['水', '污', '包', '餐', '库'];
    const count = Math.floor(Math.random() * 3) + 3;
    return allServices.sort(() => Math.random() - 0.5).slice(0, count).map(label => ({ label }));
  };

  const getRandomCardStatus = (): TrainCardStatus => {
    const statuses: TrainCardStatus[] = ['normal', 'delayed', 'track-change', 'early', 'one-hour-out', 'departed', 'suspended'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const trains: TrainCard[] = [
    {
      id: 'train-G8602-yuxia', trainNo: 'G8602', trainType: 'G',
      arrivalTime: '07:12', departureTime: '', track: '3',
      delayMinutes: 0, stopMinutes: 0, from: '成都东', to: '重庆东',
      tasks: makeTasks('G8602', 4),
      formationCount: 8, sequenceType: '正', lineDirection: '下', directionLabel: '南',
      stopType: '终到', priorityTasks: getRandomPriorityTasks(),
      connectedToId: 'train-G8605-yuxia',
      passengerDown: 652, passengerTransfer: 45,
      trackChange: false,
    },
    {
      id: 'train-D5134-yuxia', trainNo: 'D5134', trainType: 'D',
      arrivalTime: '08:35', departureTime: '', track: '2',
      delayMinutes: 0, stopMinutes: 0, from: '贵阳北', to: '重庆东',
      tasks: makeTasks('D5134', 3),
      formationCount: 8, sequenceType: '倒', lineDirection: '上', directionLabel: '北',
      stopType: '终到', priorityTasks: getRandomPriorityTasks(),
      passengerDown: 487, passengerTransfer: 32,
      trackChange: true, // 变股道
      trackOriginal: '6',
    },
    {
      id: 'train-G8608-yuxia', trainNo: 'G8608', trainType: 'G',
      arrivalTime: '09:48', departureTime: '', track: '6',
      delayMinutes: 0, stopMinutes: 0, from: '武汉', to: '重庆东',
      tasks: makeTasks('G8608', 4),
      formationCount: 16, sequenceType: '正', lineDirection: '下', directionLabel: '南',
      stopType: '终到', priorityTasks: getRandomPriorityTasks(),
      connectedToId: 'train-G8610-yuxia',
      passengerDown: 923, passengerTransfer: 78,
      trackChange: false,
    },
    {
      id: 'train-C5821-yuxia', trainNo: 'C5821', trainType: 'C',
      arrivalTime: '11:22', departureTime: '', track: '1',
      delayMinutes: 0, stopMinutes: 0, from: '重庆西', to: '重庆东',
      tasks: makeTasks('C5821', 3),
      formationCount: 8, sequenceType: '正', lineDirection: '上', directionLabel: '东',
      stopType: '终到', priorityTasks: getRandomPriorityTasks(),
      connectedToId: 'train-C5832-yuxia',
      passengerDown: 315, passengerTransfer: 18,
      trackChange: false,
    },
    {
      id: 'train-G8616-yuxia', trainNo: 'G8616', trainType: 'G',
      arrivalTime: '13:55', departureTime: '', track: '4',
      delayMinutes: 5, stopMinutes: 0, from: '长沙南', to: '重庆东',
      tasks: makeTasks('G8616', 5),
      formationCount: 16, sequenceType: '倒', lineDirection: '上', directionLabel: '北',
      stopType: '终到', priorityTasks: getRandomPriorityTasks(),
      passengerDown: 756, passengerTransfer: 56,
      trackChange: false,
    },
    {
      id: 'train-G8605-yuxia', trainNo: 'G8605', trainType: 'G',
      arrivalTime: '', departureTime: '07:30', track: '5',
      delayMinutes: 0, stopMinutes: 15, from: '重庆东', to: '长沙南',
      tasks: makeTasks('G8605', 4),
      formationCount: 16, sequenceType: '正', lineDirection: '上', directionLabel: '东',
      stopType: '始发', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 856,
      trackChange: false,
    },
    {
      id: 'train-D5238-yuxia', trainNo: 'D5238', trainType: 'D',
      arrivalTime: '', departureTime: '08:15', track: '7',
      delayMinutes: 0, stopMinutes: 12, from: '重庆东', to: '成都东',
      tasks: makeTasks('D5238', 3),
      formationCount: 8, sequenceType: '正', lineDirection: '下', directionLabel: '西',
      stopType: '始发', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 423,
      trackChange: false,
    },
    {
      id: 'train-G8610-yuxia', trainNo: 'G8610', trainType: 'G',
      arrivalTime: '', departureTime: '10:20', track: '3',
      delayMinutes: 0, stopMinutes: 15, from: '重庆东', to: '武汉',
      tasks: makeTasks('G8610', 4),
      formationCount: 16, sequenceType: '倒', lineDirection: '下', directionLabel: '南',
      stopType: '始发', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 912,
      trackChange: false,
    },
    {
      id: 'train-C5832-yuxia', trainNo: 'C5832', trainType: 'C',
      arrivalTime: '', departureTime: '11:40', track: '1',
      delayMinutes: 0, stopMinutes: 8, from: '重庆东', to: '重庆西',
      tasks: makeTasks('C5832', 3),
      formationCount: 8, sequenceType: '倒', lineDirection: '上', directionLabel: '东',
      stopType: '始发', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 198,
      trackChange: false,
    },
    {
      id: 'train-G8620-yuxia', trainNo: 'G8620', trainType: 'G',
      arrivalTime: '', departureTime: '14:05', track: '6',
      delayMinutes: 0, stopMinutes: 15, from: '重庆东', to: '贵阳北',
      tasks: makeTasks('G8620', 4),
      formationCount: 8, sequenceType: '正', lineDirection: '上', directionLabel: '北',
      stopType: '始发', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 645,
      trackChange: false,
      services: getRandomServices(),
      cardStatus: 'suspended',
    },
    {
      id: 'train-G307-yuxia', trainNo: 'G307', trainType: 'G',
      arrivalTime: '09:05', departureTime: '09:18', track: '4',
      delayMinutes: 0, stopMinutes: 13, from: '西安北', to: '成都东',
      tasks: makeTasks('G307', 5),
      formationCount: 16, sequenceType: '正', lineDirection: '下', directionLabel: '南',
      stopType: '途径', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 312, passengerDown: 445, passengerTransfer: 28,
      trackChange: false,
      services: getRandomServices(),
      cardStatus: 'normal',
    },
    {
      id: 'train-D1805-yuxia', trainNo: 'D1805', trainType: 'D',
      arrivalTime: '11:50', departureTime: '12:03', track: '2',
      delayMinutes: 0, stopMinutes: 13, from: '武汉', to: '贵阳北',
      tasks: makeTasks('D1805', 4),
      formationCount: 8, sequenceType: '倒', lineDirection: '上', directionLabel: '北',
      stopType: '途径', priorityTasks: getRandomPriorityTasks(),
      passengerUp: 189, passengerDown: 267, passengerTransfer: 15,
      trackChange: true, // 变股道
      trackOriginal: '8',
      services: getRandomServices(),
      cardStatus: 'track-change',
    },
  ];

  const trainsByStation = new Map<string, TrainCard[]>();
  trainsByStation.set('yuxia', trains);
  return trainsByStation;
};

const CARD_WIDTH = 240;
const CARD_HEIGHT = 110;
const ROW_HEIGHT = 140;
const TRACK_LINE_HEIGHT = 10;
const MIN_PPM = 2;
const MAX_PPM = 20;
const START_HOUR = 6;
const END_HOUR = 24;
const COLLISION_SHIFT_GAP = 4; // 水平右移间距，重叠时卡片间保留的像素间距

const resolveCollisions = (positions: { id: string; leftPx: number }[]): Map<string, number> => {
  const shiftMap = new Map<string, number>();
  if (positions.length <= 1) {
    positions.forEach(p => shiftMap.set(p.id, 0));
    return shiftMap;
  }

  const sorted = [...positions].sort((a, b) => a.leftPx - b.leftPx);
  let lastRightEdge = 0;

  for (const pos of sorted) {
    const naturalLeft = pos.leftPx;
    if (naturalLeft < lastRightEdge) {
      const shiftAmount = lastRightEdge - naturalLeft + COLLISION_SHIFT_GAP;
      shiftMap.set(pos.id, shiftAmount);
      lastRightEdge = naturalLeft + shiftAmount + CARD_WIDTH;
    } else {
      shiftMap.set(pos.id, 0);
      lastRightEdge = naturalLeft + CARD_WIDTH + 8;
    }
  }

  return shiftMap;
};

const getCardTop = (rowHeight: number, cardHeight: number): number => {
  return (rowHeight - cardHeight) / 2;
};

const TrainCardComponent = ({
  train,
  isSelected,
  isLinked,
  isDimmed,
  onSelect,
  isDark,
  shiftAmount,
}: {
  train: TrainCard;
  isSelected: boolean;
  isLinked?: boolean;
  isDimmed?: boolean;
  onSelect: () => void;
  isDark: boolean;
  shiftAmount?: number;
}) => {
  const stopColor = getStopTypeColor(train.stopType);
  const hasError = train.tasks.some(t => t.status === 'error');
  const isDelayed = train.delayMinutes > 0;
  const dirConf = DIRECTION_CONFIG[train.directionLabel];
  const isShifted = (shiftAmount || 0) > 0;

  const displayTime = train.arrivalTime && train.departureTime 
    ? `${train.arrivalTime}/${train.departureTime}`
    : train.arrivalTime || train.departureTime || '';

  const trackDisplay = train.trackChange && train.trackOriginal
    ? `${train.trackOriginal}→${train.track}`
    : train.track;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isDimmed ? 0.25 : 1,
        filter: isDimmed ? 'blur(0.5px)' : 'blur(0px)',
        transition: { duration: 0.3 }
      }}
      whileHover={{ y: isDimmed ? 0 : -3, transition: { duration: 0.2 } }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className="train-card-container"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        pointerEvents: isDimmed ? 'none' : 'auto',
      } as React.CSSProperties}
    >
      {/* ===== 顶部功能标签 ===== */}
      <div style={{
        position: 'absolute',
        top: '-26px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '5px',
        zIndex: 20,
      }}>
        {['库', '餐', '包', '污', '水'].map((label) => (
          <div
            key={label}
            style={{
              width: '30px',
              height: '22px',
              background: 'rgb(200, 230, 235)',
              border: '2px solid rgb(0, 170, 170)',
              borderRadius: '4px',
              color: 'rgb(0, 100, 100)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ===== SVG背景层 ===== */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          borderBottomRightRadius: '10px',
          filter: 'drop-shadow(4px 4px 14px rgba(0,0,0,0.2)) drop-shadow(1px 1px 4px rgba(0,0,0,0.1))',
        }}
        viewBox="0 0 240 110"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="blueGradCard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D2F0FC" />
            <stop offset="100%" stopColor="#96D2EE" />
          </linearGradient>
          <linearGradient id="grayGradCard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8F8F8" />
            <stop offset="100%" stopColor="#EEEEEE" />
          </linearGradient>
        </defs>
        {/* 蓝色上半部分：弧形左上角 */}
        <path
          d="M 240,0 L 100,0 C 50,0 0,20 0,68 L 0,71 L 230,71 C 240,71 240,71 240,81 L 240,110 L 240,110 L 240,0 Z"
          fill="url(#blueGradCard)"
        />
        {/* 灰色下半部分 */}
        <path
          d="M 230,71 L 100,71 C 50,71 0,71 0,68 L 0,110 L 240,110 L 240,81 C 240,71 240,71 230,71 Z"
          fill="url(#grayGradCard)"
        />
        {/* 分隔线 */}
        <path
          d="M 230,71 L 100,71 C 50,71 0,71 0,68"
          stroke="#C3C3C3"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* ===== 车次号框 ===== */}
      <div style={{
        position: 'absolute',
        left: '45px',
        top: '8px',
        background: 'linear-gradient(180deg, rgb(237, 236, 198) 0%, rgb(221, 228, 195) 100%)',
        border: '2px solid rgb(175, 120, 5)',
        borderRadius: '6px',
        padding: '4px 12px',
        zIndex: 10,
      }}>
        <span style={{
          fontSize: '22px',
          fontWeight: 900,
          color: 'rgb(140, 80, 0)',
          letterSpacing: '1.5px',
          lineHeight: 1.1,
        }}>
          {train.trainNo}
        </span>
      </div>

      {/* ===== 路线文字 ===== */}
      <div style={{
        position: 'absolute',
        left: '30px',
        top: '50px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#1e293b',
        zIndex: 10,
      }}>
        {train.from} → {train.to}
      </div>

      {/* ===== 方向框 ===== */}
      <div style={{
        position: 'absolute',
        right: '8px',
        top: '8px',
        width: '65px',
        height: '52px',
        background: 'linear-gradient(180deg, rgb(215, 215, 215) 0%, rgb(195, 195, 195) 100%)',
        border: '2px solid rgb(155, 155, 155)',
        borderRadius: '7px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        gap: '3px',
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 900,
          color: '#1f2937',
          lineHeight: 1,
        }}>
          {train.formationCount}{train.sequenceType}{train.directionLabel}
        </span>
        <div style={{
          width: '80%',
          height: '10px',
          background: 'rgb(0, 147, 230)',
          borderRadius: '3px',
          marginTop: '1px',
        }} />
      </div>

      {/* ===== 底部内容层 ===== */}
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: '35%',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: '8px',
      }}>
        {/* 时间框 */}
        <div style={{
          flex: 1,
          height: '80%',
          background: 'rgb(230, 230, 230)',
          border: '2px solid rgb(200, 200, 200)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '15px',
            fontWeight: 800,
            color: '#1e293b',
            letterSpacing: '0.3px',
          }}>
            {displayTime}
          </span>
        </div>

        {/* 股道框 */}
        <div style={{
          width: '70px',
          height: '80%',
          background: train.trackChange ? 'rgb(217, 2, 29)' : 'rgb(230, 230, 230)',
          border: `2px solid ${train.trackChange ? 'rgb(176, 0, 0)' : 'rgb(200, 200, 200)'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 900,
            color: train.trackChange ? 'white' : '#1e293b',
            letterSpacing: '0.5px',
          }}>
            {trackDisplay}
          </span>
        </div>
      </div>

      {/* ===== 延误提示 ===== */}
      {isDelayed && (
        <div style={{
          position: 'absolute',
          right: '80px',
          bottom: '12px',
          padding: '2px 6px',
          background: 'rgb(217, 2, 29)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 700,
          color: 'white',
          zIndex: 15,
        }}>
          +{train.delayMinutes}分
        </div>
      )}
    </motion.div>
  );
};

// ============ 新版车次卡片包装组件 ============
const NewTrainCardWrapper = ({
  train,
  isSelected,
  isLinked,
  isDimmed,
  onSelect,
}: {
  train: TrainCard;
  isSelected: boolean;
  isLinked?: boolean;
  isDimmed?: boolean;
  onSelect: () => void;
}) => {
  const isNorth = train.lineDirection === '上' || train.directionLabel === '北' || train.directionLabel === '东';
  const trainTypeMap: Record<'始发' | '途径' | '终到', TrainType> = {
    '始发': 'sf',
    '途径': 'tj',
    '终到': 'zd'
  };
  
  const trackDisplay = train.trackChange && train.trackOriginal
    ? `${train.trackOriginal}→${train.track}`
    : train.track;
  
  const cardProps = {
    trainNumber: train.trainNo,
    route: `${train.from}→${train.to}`,
    track: `${train.track}${train.sequenceType}${train.directionLabel}`,
    departureTime: train.departureTime || train.arrivalTime,
    trackChange: train.trackChange ? trackDisplay : undefined,
    delayMinutes: train.delayMinutes,
    status: train.cardStatus || (train.delayMinutes > 0 ? 'delayed' : train.trackChange ? 'track-change' : 'normal') as TrainCardStatus,
    trainType: trainTypeMap[train.stopType],
    services: train.services || [],
  };
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isDimmed ? 0.35 : 1,
        scale: isSelected ? 1.02 : 1,
        filter: isDimmed ? 'blur(2px)' : 'blur(0px)',
        transition: { duration: 0.18 }
      }}
      whileHover={{ y: isDimmed ? 0 : -2, transition: { duration: 0.2 } }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{
        pointerEvents: isDimmed ? 'none' : 'auto',
        overflow: 'visible'
      } as React.CSSProperties}
    >
      {isNorth ? (
        <TrainCardNorth {...cardProps} />
      ) : (
        <TrainCardSouth {...cardProps} />
      )}
    </motion.div>
  );
};

export default function SupervisionGlassPage() {
  const [isDark, setIsDark] = useState(false);
  const [useNewCard, setUseNewCard] = useState(true); // 是否使用新版车次卡片
  const [trainsByStation, setTrainsByStation] = useState<Map<string, TrainCard[]> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [linkedTrainIds, setLinkedTrainIds] = useState<Set<string>>(new Set());
  const [pixelsPerMinute, setPixelsPerMinute] = useState(5);
  const [scrollLeft, setScrollLeft] = useState(0);

  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  useEffect(() => {
    setTrainsByStation(generateMockData());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const initialScroll = Math.max(0, (nowMinutes - START_HOUR * 60 - 60) * pixelsPerMinute);
      contentRef.current.scrollLeft = initialScroll;
      setScrollLeft(initialScroll);
    }
  }, [pixelsPerMinute, trainsByStation]);

  const handleTrainSelect = useCallback((trainId: string, trainNo: string) => {
    setSelectedTrainId(trainId);
    const linked = new Set<string>();
    linked.add(trainId);
    
    // Find all trains with same trainNo
    const allTrains: TrainCard[] = [];
    trainsByStation?.forEach((trains) => {
      trains.forEach(t => {
        allTrains.push(t);
        if (t.trainNo === trainNo) linked.add(t.id);
      });
    });
    
    // Add connections
    for (const t of allTrains) {
      if (linked.has(t.id) && t.connectedToId) {
        linked.add(t.connectedToId);
      }
      if (linked.has(t.id)) {
        for (const other of allTrains) {
          if (other.connectedToId === t.id) {
            linked.add(other.id);
          }
        }
      }
    }
    
    setLinkedTrainIds(linked);
  }, [trainsByStation]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedTrainId(null);
    setLinkedTrainIds(new Set());
  }, []);

  const totalWidth = useMemo(() => {
    return (END_HOUR - START_HOUR) * 60 * pixelsPerMinute;
  }, [pixelsPerMinute]);

  const handleContentScroll = useCallback(() => {
    if (contentRef.current) {
      const sl = contentRef.current.scrollLeft;
      setScrollLeft(sl);
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = sl;
      }
    }
  }, []);

  const handleTimelineScroll = useCallback(() => {
    if (timelineRef.current) {
      const sl = timelineRef.current.scrollLeft;
      setScrollLeft(sl);
      if (contentRef.current) {
        contentRef.current.scrollLeft = sl;
      }
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      setPixelsPerMinute(prev => {
        const next = Math.max(MIN_PPM, Math.min(MAX_PPM, prev + delta));
        if (next !== prev && contentRef.current) {
          const rect = contentRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const oldScrollLeft = contentRef.current.scrollLeft;
          const ratio = prev > 0 ? next / prev : 1;
          const newScrollLeft = (oldScrollLeft + mouseX) * ratio - mouseX;
          requestAnimationFrame(() => {
            if (contentRef.current) contentRef.current.scrollLeft = newScrollLeft;
            if (timelineRef.current) timelineRef.current.scrollLeft = newScrollLeft;
          });
        }
        return next;
      });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = contentRef.current?.scrollLeft || 0;
    e.currentTarget.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    const newScroll = dragStartScroll.current - dx;
    if (contentRef.current) contentRef.current.scrollLeft = newScroll;
    if (timelineRef.current) timelineRef.current.scrollLeft = newScroll;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      e.currentTarget.style.cursor = 'grab';
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setPixelsPerMinute(prev => Math.min(MAX_PPM, prev + 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPixelsPerMinute(prev => Math.max(MIN_PPM, prev - 1));
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const currentTimePx = (currentTotalMinutes - START_HOUR * 60) * pixelsPerMinute;

  const hourMarks = useMemo(() => {
    const marks: { hour: number; px: number; isCurrent: boolean }[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      const px = (h - START_HOUR) * 60 * pixelsPerMinute;
      marks.push({ hour: h, px, isCurrent: h === currentHour });
    }
    return marks;
  }, [pixelsPerMinute, currentHour]);

  const halfHourMarks = useMemo(() => {
    const marks: { px: number }[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const px = (h - START_HOUR + 0.5) * 60 * pixelsPerMinute;
      marks.push({ px });
    }
    return marks;
  }, [pixelsPerMinute]);

  if (!trainsByStation) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className={`${isDark ? 'text-white/60' : 'text-slate-600'} font-medium`}>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col transition-colors duration-500 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className={`flex-shrink-0 border-b transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="px-4 h-12 flex items-center gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow">
              <TrainFront className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className={`text-sm font-bold leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>客运指挥</h1>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>多站列车盯控</p>
            </div>
          </div>

          <div className={`w-px h-6 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <div className={`h-8 flex items-center gap-1.5 px-3 rounded-lg border shrink-0 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <Timer className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className={`h-8 flex items-center gap-1 px-1.5 rounded-lg border shrink-0 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={handleZoomOut}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                  isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
                disabled={pixelsPerMinute <= MIN_PPM}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className={`text-[10px] w-10 text-center ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                {pixelsPerMinute.toFixed(1)}x
              </span>
              <button
                onClick={handleZoomIn}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                  isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
                disabled={pixelsPerMinute >= MAX_PPM}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                isDark
                  ? 'bg-amber-400/20 border-amber-400/30 text-amber-400 hover:bg-amber-400/30'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            
            <button
              onClick={() => setUseNewCard(!useNewCard)}
              className={`h-8 px-3 rounded-lg border flex items-center gap-2 transition-colors shrink-0 ${
                useNewCard
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <TrainFront className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{useNewCard ? '新版' : '旧版'}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={timelineRef}
        onScroll={handleTimelineScroll}
        className={`flex-shrink-0 border-b transition-colors duration-300 overflow-hidden ${
          isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white/80 border-slate-200/50'
        }`}
        style={{ overflowX: 'hidden', overflowY: 'hidden' }}
      >
        <div className="relative h-9" style={{ width: `${totalWidth}px`, marginLeft: '0px' }}>
          {halfHourMarks.map((m, i) => (
            <div
              key={`half-${i}`}
              className="absolute bottom-1"
              style={{ left: `${m.px}px` }}
            >
              <div className={`w-px h-1.5 ${isDark ? 'bg-white/8' : 'bg-slate-200'}`} />
            </div>
          ))}

          {hourMarks.map((m) => (
            <div
              key={m.hour}
              className="absolute bottom-1 flex flex-col items-center"
              style={{ left: `${m.px}px`, transform: 'translateX(-50%)' }}
            >
              <span className={`text-[10px] leading-none mb-0.5 ${
                m.isCurrent
                  ? 'text-red-500 font-bold'
                  : isDark ? 'text-white/30' : 'text-slate-400'
              }`}>
                {String(m.hour).padStart(2, '0')}
              </span>
              <div className={`w-px h-2 ${m.isCurrent ? 'bg-red-500' : isDark ? 'bg-white/15' : 'bg-slate-300'}`} />
            </div>
          ))}

          {currentTimePx >= 0 && currentTimePx <= totalWidth && (
            <div
              className="absolute top-0.5 bottom-0 flex flex-col items-center pointer-events-none"
              style={{ left: `${currentTimePx}px` }}
            >
              <div className="relative w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50">
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
              </div>
              <div className="w-0.5 flex-1 bg-red-500/40" />
            </div>
          )}
        </div>
      </div>

      <div
        ref={contentRef}
        onScroll={handleContentScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleBackgroundClick}
        className="flex-1 overflow-y-auto overflow-x-auto"
        style={{ cursor: 'grab', scrollbarWidth: 'thin' }}
      >
        <div style={{ width: `${totalWidth}px`, minHeight: '100%' }}>
          {stationRows.map(station => {
            const trains = trainsByStation.get(station.id) || [];
            const arrivals = trains
              .filter(t => t.stopType === '终到')
              .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
            const departures = trains
              .filter(t => t.stopType === '始发' || t.stopType === '途径')
              .sort((a, b) => {
                const aTime = a.departureTime || a.arrivalTime;
                const bTime = b.departureTime || b.arrivalTime;
                return aTime.localeCompare(bTime);
              });

            const arrPositions = arrivals.map(t => ({
              id: t.id,
              leftPx: (timeToMinutes(t.arrivalTime) - START_HOUR * 60) * pixelsPerMinute - CARD_WIDTH / 2,
            }));
            const depPositions = departures.map(t => {
              const timeStr = t.departureTime || t.arrivalTime;
              return {
                id: t.id,
                leftPx: (timeToMinutes(timeStr) - START_HOUR * 60) * pixelsPerMinute - CARD_WIDTH / 2,
              };
            });
            const arrShifts = resolveCollisions(arrPositions);
            const depShifts = resolveCollisions(depPositions);
            const arrRowHeight = ROW_HEIGHT;
            const depRowHeight = ROW_HEIGHT;
            const stationHeight = arrRowHeight + TRACK_LINE_HEIGHT + depRowHeight;
            const arrCardTop = getCardTop(arrRowHeight, CARD_HEIGHT);
            const depCardTop = getCardTop(depRowHeight, CARD_HEIGHT);

            return (
              <div key={station.id} className="mb-2">
                <div className={`flex items-center gap-2 h-8 px-2 sticky left-0 z-10 ${
                  isDark ? 'bg-slate-950/90' : 'bg-slate-50/90'
                }`} style={{ width: 'fit-content', backdropFilter: 'blur(8px)' }}>
                  <div className="w-2.5 h-5 rounded-sm" style={{ background: station.color, boxShadow: `0 0 6px ${station.color}40` }} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {station.stationName} {station.name}
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    {trains.length}趟
                  </span>
                </div>

                <div className="relative" style={{ height: `${stationHeight}px` }}>
                  <div className="absolute inset-0">
                    {hourMarks.map((m) => (
                      <div
                        key={`grid-${m.hour}`}
                        className="absolute top-0 bottom-0"
                        style={{ left: `${m.px}px` }}
                      >
                        <div className={`w-px h-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                      </div>
                    ))}
                    {halfHourMarks.map((m, i) => (
                      <div
                        key={`halfgrid-${i}`}
                        className="absolute top-0 bottom-0"
                        style={{ left: `${m.px}px` }}
                      >
                        <div className={`w-px h-full ${isDark ? 'bg-white/2' : 'bg-slate-50'}`} />
                      </div>
                    ))}
                  </div>

                  {currentTimePx >= 0 && currentTimePx <= totalWidth && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500/30 pointer-events-none z-20"
                      style={{ left: `${currentTimePx}px` }}
                    />
                  )}

                  {(() => {
                    const trainMap = new Map([...arrivals, ...departures].map(t => [t.id, t]));

                    const connections: { fromId: string, toId: string, fromLeft: number, toLeft: number }[] = [];
                    for (const t of arrivals) {
                      if (t.connectedToId && trainMap.has(t.connectedToId)) {
                        const fromLeft = arrPositions.find(p => p.id === t.id)!.leftPx;
                        const toLeft = depPositions.find(p => p.id === t.connectedToId)!.leftPx;
                        connections.push({ fromId: t.id, toId: t.connectedToId, fromLeft, toLeft });
                      }
                    }

                    return (
                      <>
                        {connections.map((conn, idx) => {
                          const fromTrain = trainMap.get(conn.fromId)!;
                          const fromShift = arrShifts.get(conn.fromId) || 0;
                          const toShift = depShifts.get(conn.toId) || 0;
                          const fromX = conn.fromLeft + fromShift + CARD_WIDTH / 2;
                          const toX = conn.toLeft + toShift + CARD_WIDTH / 2;
                          const fromY = arrCardTop + CARD_HEIGHT + 3;
                          const toY = arrRowHeight + TRACK_LINE_HEIGHT + depCardTop - 3;

                          const pathD = `M ${fromX} ${fromY} C ${fromX} ${arrRowHeight - 15}, ${toX} ${arrRowHeight + 15}, ${toX} ${toY}`;
                          const color = getStopTypeColor(fromTrain.stopType);

                          return (
                            <svg
                              key={`conn-${idx}`}
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                overflow: 'visible',
                                zIndex: 1,
                              }}
                            >
                              <defs>
                                <linearGradient
                                  id={`conn-grad-${idx}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                                  <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                                </linearGradient>
                              </defs>
                              <path
                                d={pathD}
                                fill="none"
                                stroke={`url(#conn-grad-${idx})`}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="4 3"
                                opacity="0.85"
                              />
                            </svg>
                          );
                        })}
                      </>
                    );
                  })()}

                  {(() => {
                    return arrivals.map(train => {
                      const shift = arrShifts.get(train.id) || 0;
                      const leftPx = arrPositions.find(p => p.id === train.id)!.leftPx + shift;
                      const topPx = arrCardTop;

                      return (
                        <div key={train.id} style={{ position: 'absolute', left: `${leftPx}px`, top: `${topPx}px`, zIndex: selectedTrainId === train.id ? 20 : 3 }}>
                          {useNewCard ? (
                            <NewTrainCardWrapper
                              train={train}
                              isSelected={selectedTrainId === train.id}
                              isLinked={linkedTrainIds.has(train.id)}
                              isDimmed={selectedTrainId !== null && selectedTrainId !== train.id && !linkedTrainIds.has(train.id)}
                              onSelect={() => handleTrainSelect(train.id, train.trainNo)}
                            />
                          ) : (
                            <TrainCardComponent
                              train={train}
                              isSelected={selectedTrainId === train.id}
                              isLinked={linkedTrainIds.has(train.id)}
                              isDimmed={selectedTrainId !== null && selectedTrainId !== train.id && !linkedTrainIds.has(train.id)}
                              onSelect={() => handleTrainSelect(train.id, train.trainNo)}
                              isDark={isDark}
                              shiftAmount={shift}
                            />
                          )}
                        </div>
                      );
                    });
                  })()}

                  <div className="absolute left-0 right-0" style={{
                    top: `${arrRowHeight}px`,
                    height: `${TRACK_LINE_HEIGHT}px`,
                    pointerEvents: 'none',
                  }}>
                    <div className="w-full h-full relative" style={{
                      background: isDark
                        ? 'repeating-linear-gradient(90deg, rgba(148,163,184,0.08) 0px, rgba(148,163,184,0.08) 2px, transparent 2px, transparent 11px)'
                        : 'repeating-linear-gradient(90deg, rgba(100,116,139,0.06) 0px, rgba(100,116,139,0.06) 2px, transparent 2px, transparent 11px)',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 3,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: isDark
                          ? 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.25) 5%, rgba(148,163,184,0.25) 95%, transparent 100%)'
                          : 'linear-gradient(90deg, transparent 0%, rgba(100,116,139,0.2) 5%, rgba(100,116,139,0.2) 95%, transparent 100%)',
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: 3,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: isDark
                          ? 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.25) 5%, rgba(148,163,184,0.25) 95%, transparent 100%)'
                          : 'linear-gradient(90deg, transparent 0%, rgba(100,116,139,0.2) 5%, rgba(100,116,139,0.2) 95%, transparent 100%)',
                      }} />
                    </div>
                  </div>

                  {(() => {
                    return departures.map(train => {
                      const shift = depShifts.get(train.id) || 0;
                      const leftPx = depPositions.find(p => p.id === train.id)!.leftPx + shift;
                      const topPx = arrRowHeight + TRACK_LINE_HEIGHT + depCardTop;

                      return (
                        <div key={train.id} style={{ position: 'absolute', left: `${leftPx}px`, top: `${topPx}px`, zIndex: selectedTrainId === train.id ? 20 : 3 }}>
                          {useNewCard ? (
                            <NewTrainCardWrapper
                              train={train}
                              isSelected={selectedTrainId === train.id}
                              isLinked={linkedTrainIds.has(train.id)}
                              isDimmed={selectedTrainId !== null && selectedTrainId !== train.id && !linkedTrainIds.has(train.id)}
                              onSelect={() => handleTrainSelect(train.id, train.trainNo)}
                            />
                          ) : (
                            <TrainCardComponent
                              train={train}
                              isSelected={selectedTrainId === train.id}
                              isLinked={linkedTrainIds.has(train.id)}
                              isDimmed={selectedTrainId !== null && selectedTrainId !== train.id && !linkedTrainIds.has(train.id)}
                              onSelect={() => handleTrainSelect(train.id, train.trainNo)}
                              isDark={isDark}
                              shiftAmount={shift}
                            />
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}

          <div style={{ height: '40px' }} />
        </div>
      </div>
    </div>
  );
}
