import { TrainData, TrainPosition, Connection, TimeRange } from './types';

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function calculateStopBarWidth(
  arrivalTime: string,
  departureTime: string,
  pixelsPerMinute: number
): number {
  const arrival = timeToMinutes(arrivalTime);
  const departure = timeToMinutes(departureTime);
  return Math.max((departure - arrival) * pixelsPerMinute, 20);
}

export function calculateTrainPosition(
  train: TrainData,
  timeOffset: number,
  pixelsPerMinute: number,
  timelineStartHour: number
): { left: number; width: number; stopBarWidth: number } {
  const arrivalMinutes = timeToMinutes(train.arrivalTime);
  const departureMinutes = timeToMinutes(train.departureTime);

  const startMinutes = timelineStartHour * 60 + timeOffset;
  const left = (arrivalMinutes - startMinutes) * pixelsPerMinute;
  const stopBarWidth = calculateStopBarWidth(train.arrivalTime, train.departureTime, pixelsPerMinute);
  const width = Math.max(stopBarWidth + 120, 140);

  return { left, width, stopBarWidth };
}

export function sortTrainsByArrival(trains: TrainData[]): TrainData[] {
  return [...trains].sort((a, b) => {
    const aMinutes = timeToMinutes(a.arrivalTime);
    const bMinutes = timeToMinutes(b.arrivalTime);
    return aMinutes - bMinutes;
  });
}

export function detectOverlaps(
  positions: TrainPosition[],
  cardWidth: number = 160
): boolean {
  for (let i = 0; i < positions.length - 1; i++) {
    const current = positions[i];
    const next = positions[i + 1];
    const currentRight = current.left + current.width;
    const nextRight = next.left + next.width;

    if (currentRight > next.left) {
      return true;
    }
  }
  return false;
}

export function calculateAutoScale(
  trains: TrainData[],
  timeOffset: number,
  pixelsPerMinute: number,
  timelineStartHour: number,
  containerWidth: number
): number {
  if (trains.length === 0) return 1;

  const sorted = sortTrainsByArrival(trains);
  let minGap = Infinity;

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = calculateTrainPosition(sorted[i], timeOffset, pixelsPerMinute, timelineStartHour);
    const next = calculateTrainPosition(sorted[i + 1], timeOffset, pixelsPerMinute, timelineStartHour);
    const gap = next.left - (current.left + current.width);

    if (gap < minGap) {
      minGap = gap;
    }
  }

  if (minGap < 10) {
    const scaleFactor = 0.7;
    return scaleFactor;
  }

  return 1;
}

export function calculateConnections(
  trains: TrainData[],
  panelWidths: Map<string, number>
): Connection[] {
  const connections: Connection[] = [];
  const trainGroups = new Map<string, TrainData[]>();

  trains.forEach(train => {
    if (train.connectionId) {
      const existing = trainGroups.get(train.connectionId) || [];
      existing.push(train);
      trainGroups.set(train.connectionId, existing);
    }
  });

  trainGroups.forEach((trainList, trainNo) => {
    if (trainList.length < 2) return;

    const sorted = sortTrainsByArrival(trainList);

    for (let i = 0; i < sorted.length - 1; i++) {
      const fromTrain = sorted[i];
      const toTrain = sorted[i + 1];

      const fromPanelWidth = panelWidths.get(fromTrain.panelId) || 0;
      const toPanelWidth = panelWidths.get(toTrain.panelId) || 0;

      connections.push({
        trainNo,
        from: {
          panelId: fromTrain.panelId,
          panelName: getPanelName(fromTrain.panelId),
          x: fromPanelWidth,
          y: 0,
          time: fromTrain.departureTime
        },
        to: {
          panelId: toTrain.panelId,
          panelName: getPanelName(toTrain.panelId),
          x: 0,
          y: 0,
          time: toTrain.arrivalTime
        },
        isSelected: false
      });
    }
  });

  return connections;
}

function getPanelName(panelId: string): string {
  const names: Record<string, string> = {
    'panel-1': '重庆东',
    'panel-2': '巴南',
    'panel-3': '南川北',
    'panel-4': '水江西'
  };
  return names[panelId] || panelId;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'normal': return '#007aff';
    case 'early': return '#34c759';
    case 'late': return '#ff3b30';
    default: return '#007aff';
  }
}

export function getServiceTypeInfo(type: string): { color: string; label: string } {
  switch (type) {
    case 'origin': return { color: '#007aff', label: '始' };
    case 'destination': return { color: '#34c759', label: '终' };
    case 'transit': return { color: '#8e8e93', label: '过' };
    default: return { color: '#8e8e93', label: '过' };
  }
}

// 根据车次类型获取颜色（参考到发盯控）
export function getTrainTypeColor(trainNo: string): string {
  const type = trainNo.charAt(0).toUpperCase();
  const colors: Record<string, string> = {
    'G': '#3b82f6',  // 高铁-蓝
    'D': '#06b6d4',  // 动车-青
    'C': '#10b981',  // 城际-绿
    'Z': '#8b5cf6',  // 直达-紫
    'T': '#f59e0b',  // 特快-橙
    'K': '#ef4444',  // 快速-红
  };
  return colors[type] || '#6b7280';
}

export function checkTrainDensity(
  trains: TrainData[],
  timeOffset: number,
  pixelsPerMinute: number,
  timelineStartHour: number,
  minGap: number = 20
): boolean {
  if (trains.length < 2) return false;

  const sorted = sortTrainsByArrival(trains);
  const startMinutes = timelineStartHour * 60 + timeOffset;

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentArrival = timeToMinutes(current.arrivalTime);
    const nextArrival = timeToMinutes(next.arrivalTime);

    const currentLeft = (currentArrival - startMinutes) * pixelsPerMinute;
    const nextLeft = (nextArrival - startMinutes) * pixelsPerMinute;

    const currentCardWidth = Math.max(calculateStopBarWidth(current.arrivalTime, current.departureTime, pixelsPerMinute) + 120, 140);
    const gap = nextLeft - (currentLeft + currentCardWidth);

    if (gap < minGap) {
      return true;
    }
  }

  return false;
}

export function calculateOptimalTimeRange(
  trains: TrainData[],
  timeOffset: number,
  pixelsPerMinute: number,
  timelineStartHour: number,
  containerWidth: number,
  maxRangeMinutes: number = 240,
  minRangeMinutes: number = 90
): number {
  let optimalRange = maxRangeMinutes;

  for (let range = maxRangeMinutes; range >= minRangeMinutes; range -= 30) {
    const testPixelsPerMinute = containerWidth / range;
    const isDense = checkTrainDensity(
      trains,
      timeOffset,
      testPixelsPerMinute,
      timelineStartHour,
      20
    );

    if (!isDense) {
      optimalRange = range;
      break;
    }

    optimalRange = range;
  }

  return optimalRange;
}
