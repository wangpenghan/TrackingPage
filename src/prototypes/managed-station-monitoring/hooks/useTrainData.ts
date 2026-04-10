/**
 * 代管盯控 - 车次数据管理 Hook
 */
import { useState, useCallback, useMemo } from 'react';
import type { TrainSchedule, PanelConfig, StationConfig, QuickFilterType } from '../types';
import { mockTrainSchedules } from '../mock-data';

export const useTrainData = (
  panels: PanelConfig[],
  stations: StationConfig[]
) => {
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [highlightedTrainNo, setHighlightedTrainNo] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('none');

  // 获取面板对应的车站
  const getStationByPanel = useCallback((panel: PanelConfig): StationConfig | undefined => {
    return stations.find(s => s.id === panel.stationId);
  }, [stations]);

  // 筛选符合面板条件的车次
  const getTrainsForPanel = useCallback((panel: PanelConfig): TrainSchedule[] => {
    const station = getStationByPanel(panel);
    if (!station) return [];

    return mockTrainSchedules.filter(train => {
      // 匹配车站
      if (train.station !== station.name) return false;

      // 匹配股道范围
      const trackNum = parseInt(train.track, 10);
      if (isNaN(trackNum)) return false;
      if (trackNum < panel.trackRange.start || trackNum > panel.trackRange.end) return false;

      return true;
    }).sort((a, b) => {
      // 按到站时间排序
      const timeA = a.arrival.time || a.departure.time;
      const timeB = b.arrival.time || b.departure.time;
      return timeA.localeCompare(timeB);
    });
  }, [getStationByPanel]);

  // 应用快速筛选
  const applyQuickFilter = useCallback((trains: TrainSchedule[]): TrainSchedule[] => {
    if (quickFilter === 'none') return trains;

    return trains.filter(train => {
      switch (quickFilter) {
        case 'abnormal':
          return !!train.arrival.lateEarly || !!train.departure.lateEarly ||
                 train.keyItems.overcrowd || train.keyItems.special;
        case 'late':
          return !!train.arrival.lateEarly || !!train.departure.lateEarly;
        case 'overcrowd':
          return train.keyItems.overcrowd;
        case 'special':
          return train.keyItems.special;
        case 'operating':
          // 假设正在作业的车次有特定标记
          return false;
        default:
          return true;
      }
    });
  }, [quickFilter]);

  // 获取跨站车次（同车次号出现在多个车站）
  const getCrossStationTrains = useCallback((): Map<string, TrainSchedule[]> => {
    const trainMap = new Map<string, TrainSchedule[]>();

    mockTrainSchedules.forEach(train => {
      const existing = trainMap.get(train.trainNo) || [];
      existing.push(train);
      trainMap.set(train.trainNo, existing);
    });

    // 只保留出现在多个车站的车次
    const crossStationMap = new Map<string, TrainSchedule[]>();
    trainMap.forEach((trains, trainNo) => {
      const stations = new Set(trains.map(t => t.station));
      if (stations.size > 1) {
        crossStationMap.set(trainNo, trains);
      }
    });

    return crossStationMap;
  }, []);

  // 获取接续关系
  const getConnections = useCallback((panelTrains: TrainSchedule[]): Array<{
    from: TrainSchedule;
    to: TrainSchedule;
    time: number;
  }> => {
    const connections: Array<{ from: TrainSchedule; to: TrainSchedule; time: number }> = [];

    panelTrains.forEach(train => {
      if (train.connection) {
        const targetTrain = panelTrains.find(t => t.trainNo === train.connection?.trainNo);
        if (targetTrain) {
          connections.push({
            from: train,
            to: targetTrain,
            time: train.connection.time
          });
        }
      }
    });

    return connections;
  }, []);

  // 选择车次
  const selectTrain = useCallback((trainId: string | null) => {
    setSelectedTrainId(trainId);
    if (trainId) {
      const train = mockTrainSchedules.find(t => t.id === trainId);
      if (train) {
        setHighlightedTrainNo(train.trainNo);
      }
    }
  }, []);

  // 高亮车次
  const highlightTrain = useCallback((trainNo: string | null) => {
    setHighlightedTrainNo(trainNo);
  }, []);

  // 获取选中的车次
  const selectedTrain = useMemo(() => {
    if (!selectedTrainId) return null;
    return mockTrainSchedules.find(t => t.id === selectedTrainId) || null;
  }, [selectedTrainId]);

  return {
    selectedTrainId,
    selectedTrain,
    highlightedTrainNo,
    quickFilter,
    setQuickFilter,
    getTrainsForPanel,
    getCrossStationTrains,
    getConnections,
    applyQuickFilter,
    selectTrain,
    highlightTrain
  };
};
