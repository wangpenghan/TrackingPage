/**
 * 代管盯控 - 盯控面板
 */
import React, { useRef, useEffect } from 'react';
import { Card, Empty } from 'antd';
import { TrainCard } from './TrainCard';
import type {
  TrainSchedule,
  PanelConfig,
  StationConfig,
  DisplayConfig,
  ThemeMode
} from '../../types';

interface MonitoringPanelProps {
  panel: PanelConfig;
  station: StationConfig;
  trains: TrainSchedule[];
  display: DisplayConfig;
  theme: ThemeMode;
  selectedTrainId: string | null;
  highlightedTrainNo: string | null;
  onSelectTrain: (trainId: string) => void;
  onHighlightTrain: (trainNo: string | null) => void;
  onTrainCardRef?: (trainId: string, element: HTMLDivElement | null) => void;
}

export const MonitoringPanel: React.FC<MonitoringPanelProps> = ({
  panel,
  station,
  trains,
  display,
  theme,
  selectedTrainId,
  highlightedTrainNo,
  onSelectTrain,
  onHighlightTrain,
  onTrainCardRef
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      ref={panelRef}
      className="monitoring-panel"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600 }}>{panel.name}</span>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            ({trains.length}列)
          </span>
        </div>
      }
      style={{
        marginBottom: 16,
        background: 'var(--background)',
        border: '1px solid var(--border)'
      }}
      bodyStyle={{ padding: 12 }}
    >
      {trains.length === 0 ? (
        <Empty description="暂无车次" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 8
          }}
        >
          {trains.map(train => (
            <div
              key={train.id}
              ref={(el) => onTrainCardRef?.(train.id, el)}
            >
              <TrainCard
                train={train}
                display={display}
                theme={theme}
                isSelected={selectedTrainId === train.id}
                isHighlighted={highlightedTrainNo === train.trainNo}
                onClick={() => onSelectTrain(train.id)}
                onMouseEnter={() => onHighlightTrain(train.trainNo)}
                onMouseLeave={() => onHighlightTrain(null)}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
