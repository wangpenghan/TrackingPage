import { useMemo } from 'react';
import { TrainSchedule } from '../mock-data';

export interface StationColor {
  light: { bg: string; border: string; text: string };
  dark: { bg: string; border: string; text: string };
}

export interface Station {
  id: string;
  name: string;
  trainCount: number;
  abnormalCount: number;
  alarmCount: number;
  delayCount: number;
  isActive: boolean;
  color: StationColor;
}

/**
 * 车站颜色配置
 */
export const STATION_COLORS: Record<string, StationColor> = {
  '1': {
    light: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
    dark: { bg: '#7c2d12', border: '#fbbf24', text: '#fbbf24' },
  },
  '2': {
    light: { bg: '#dbeafe', border: '#60a5fa', text: '#1d4ed8' },
    dark: { bg: '#1e3a5f', border: '#60a5fa', text: '#60a5fa' },
  },
  '3': {
    light: { bg: '#d1fae5', border: '#34d399', text: '#059669' },
    dark: { bg: '#064e3b', border: '#34d399', text: '#34d399' },
  },
  '4': {
    light: { bg: '#f3e8ff', border: '#a78bfa', text: '#7c3aed' },
    dark: { bg: '#581c87', border: '#a78bfa', text: '#a78bfa' },
  },
};

/**
 * 获取车站颜色
 */
export const getStationColor = (stationId: string): StationColor => {
  return STATION_COLORS[stationId] || {
    light: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
    dark: { bg: '#374151', border: '#6b7280', text: '#9ca3af' },
  };
};

/**
 * 多站数据管理 Hook
 * @param allTrains 所有列车数据
 * @param stations 车站配置列表
 * @returns 处理后的列车数据
 */
export const useMultiStation = (
  allTrains: TrainSchedule[],
  stations: Station[]
) => {
  // 获取启用的车站ID列表
  const activeStationIds = useMemo(() => {
    return stations.filter(s => s.isActive).map(s => s.id);
  }, [stations]);

  // 过滤并排序列车数据
  const filteredTrains = useMemo(() => {
    // 1. 过滤出启用车站的列车
    let result = allTrains.filter(train => 
      activeStationIds.includes(train.stationId)
    );

    // 2. 按到达时间排序
    result.sort((a, b) => {
      const timeA = a.arrival.actualTime || a.arrival.time;
      const timeB = b.arrival.actualTime || b.arrival.time;
      return timeA.localeCompare(timeB);
    });

    return result;
  }, [allTrains, activeStationIds]);

  // 按车站分组统计
  const stationStats = useMemo(() => {
    const stats: Record<string, {
      total: number;
      abnormal: number;
      delay: number;
    }> = {};

    stations.forEach(station => {
      const stationTrains = allTrains.filter(t => t.stationId === station.id);
      stats[station.id] = {
        total: stationTrains.length,
        abnormal: stationTrains.filter(t => 
          t.operations.checkIn.status === 'alarm' ||
          t.operations.platform.status === 'alarm' ||
          t.operations.exit.status === 'alarm'
        ).length,
        delay: stationTrains.filter(t => 
          t.arrival.lateEarly && t.arrival.lateEarly.startsWith('+')
        ).length,
      };
    });

    return stats;
  }, [allTrains, stations]);

  return {
    filteredTrains,
    stationStats,
    activeStationCount: activeStationIds.length,
  };
};

/**
 * 默认车站配置
 */
export const DEFAULT_STATIONS: Station[] = [
  { 
    id: '1', 
    name: '重庆东', 
    trainCount: 45, 
    abnormalCount: 2, 
    alarmCount: 8, 
    delayCount: 1, 
    isActive: true,
    color: STATION_COLORS['1'],
  },
  { 
    id: '2', 
    name: '巴南', 
    trainCount: 28, 
    abnormalCount: 1, 
    alarmCount: 5, 
    delayCount: 0, 
    isActive: true,
    color: STATION_COLORS['2'],
  },
  { 
    id: '3', 
    name: '南川北', 
    trainCount: 15, 
    abnormalCount: 0, 
    alarmCount: 3, 
    delayCount: 0, 
    isActive: false,
    color: STATION_COLORS['3'],
  },
  { 
    id: '4', 
    name: '水江西', 
    trainCount: 10, 
    abnormalCount: 0, 
    alarmCount: 1, 
    delayCount: 0, 
    isActive: false,
    color: STATION_COLORS['4'],
  },
];
