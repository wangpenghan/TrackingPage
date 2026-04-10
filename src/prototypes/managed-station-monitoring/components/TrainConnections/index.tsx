/**
 * 代管盯控 - 车次连接（同车次跨站虚线连接）
 */
import React, { useMemo } from 'react';
import type { TrainSchedule, ConnectionLine } from '../../types';

interface TrainConnectionsProps {
  crossStationTrains: Map<string, TrainSchedule[]>;
  trainCardPositions: Map<string, DOMRect>;
  highlightedTrainNo: string | null;
  onHighlightTrain: (trainNo: string | null) => void;
  containerRect: DOMRect | null;
}

export const TrainConnections: React.FC<TrainConnectionsProps> = ({
  crossStationTrains,
  trainCardPositions,
  highlightedTrainNo,
  onHighlightTrain,
  containerRect
}) => {
  // 计算连接线路径
  const connectionLines = useMemo(() => {
    if (!containerRect) return [];

    const lines: Array<{
      trainNo: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];

    crossStationTrains.forEach((trains, trainNo) => {
      // 按车站顺序排序
      const sortedTrains = [...trains].sort((a, b) => {
        const rectA = trainCardPositions.get(a.id);
        const rectB = trainCardPositions.get(b.id);
        if (!rectA || !rectB) return 0;
        return rectA.top - rectB.top;
      });

      // 生成相邻车站之间的连接线
      for (let i = 0; i < sortedTrains.length - 1; i++) {
        const current = sortedTrains[i];
        const next = sortedTrains[i + 1];

        const rectCurrent = trainCardPositions.get(current.id);
        const rectNext = trainCardPositions.get(next.id);

        if (rectCurrent && rectNext) {
          // 计算相对于容器的位置
          const x1 = rectCurrent.left + rectCurrent.width / 2 - containerRect.left;
          const y1 = rectCurrent.top + rectCurrent.height / 2 - containerRect.top;
          const x2 = rectNext.left + rectNext.width / 2 - containerRect.left;
          const y2 = rectNext.top + rectNext.height / 2 - containerRect.top;

          lines.push({ trainNo, x1, y1, x2, y2 });
        }
      }
    });

    return lines;
  }, [crossStationTrains, trainCardPositions, containerRect]);

  if (!containerRect || connectionLines.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: containerRect.width,
        height: containerRect.height,
        pointerEvents: 'none',
        zIndex: 5
      }}
    >
      {connectionLines.map((line, index) => {
        const isHighlighted = highlightedTrainNo === line.trainNo;

        return (
          <g key={`${line.trainNo}-${index}`}>
            {/* 虚线连接 */}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={isHighlighted ? '#3b82f6' : '#64748b'}
              strokeWidth={isHighlighted ? 3 : 1.5}
              strokeDasharray={isHighlighted ? undefined : '5,5'}
              opacity={isHighlighted ? 1 : 0.5}
              style={{
                transition: 'all 0.3s',
                pointerEvents: 'stroke',
                cursor: 'pointer'
              }}
              onMouseEnter={() => onHighlightTrain(line.trainNo)}
              onMouseLeave={() => onHighlightTrain(null)}
            />

            {/* 连接点 - 起点 */}
            <circle
              cx={line.x1}
              cy={line.y1}
              r={isHighlighted ? 6 : 4}
              fill={isHighlighted ? '#3b82f6' : '#64748b'}
              opacity={isHighlighted ? 1 : 0.5}
              style={{ transition: 'all 0.3s' }}
            />

            {/* 连接点 - 终点 */}
            <circle
              cx={line.x2}
              cy={line.y2}
              r={isHighlighted ? 6 : 4}
              fill={isHighlighted ? '#3b82f6' : '#64748b'}
              opacity={isHighlighted ? 1 : 0.5}
              style={{ transition: 'all 0.3s' }}
            />
          </g>
        );
      })}
    </svg>
  );
};
