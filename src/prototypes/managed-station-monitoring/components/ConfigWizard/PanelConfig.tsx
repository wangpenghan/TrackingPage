/**
 * 代管盯控 - 面板配置
 */
import React from 'react';
import { Button, Input, Space, Card, Select, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { PanelConfig as PanelConfigType, StationConfig as StationConfigType } from '../../types';

interface PanelConfigProps {
  panels: PanelConfigType[];
  stations: StationConfigType[];
  onChange: (panels: PanelConfigType[]) => void;
}

export const PanelConfig: React.FC<PanelConfigProps> = ({ panels, stations, onChange }) => {
  const addPanel = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;

    const existingPanels = panels.filter(p => p.stationId === stationId);
    const newPanel: PanelConfigType = {
      id: `panel-${Date.now()}`,
      name: `${station.name}面板${existingPanels.length + 1}`,
      stationId,
      trackRange: { start: 1, end: 4 }
    };
    onChange([...panels, newPanel]);
  };

  const removePanel = (id: string) => {
    onChange(panels.filter(p => p.id !== id));
  };

  const updatePanel = (id: string, updates: Partial<PanelConfigType>) => {
    onChange(panels.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // 按车站分组显示面板
  const panelsByStation = stations.map(station => ({
    station,
    panels: panels.filter(p => p.stationId === station.id)
  }));

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        {panelsByStation.map(({ station, panels: stationPanels }) => (
          <Card
            key={station.id}
            size="small"
            title={station.name}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addPanel(station.id)}
              >
                添加面板
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {stationPanels.length === 0 && (
                <div style={{ color: '#999', textAlign: 'center', padding: 16 }}>
                  暂无面板，点击右上角添加
                </div>
              )}
              {stationPanels.map(panel => (
                <Card
                  key={panel.id}
                  size="small"
                  type="inner"
                  title={
                    <Input
                      value={panel.name}
                      onChange={(e) => updatePanel(panel.id, { name: e.target.value })}
                      style={{ width: 200 }}
                      placeholder="面板名称"
                    />
                  }
                  extra={
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removePanel(panel.id)}
                    />
                  }
                >
                  <Space>
                    <span>股道范围：</span>
                    <InputNumber
                      min={1}
                      max={50}
                      value={panel.trackRange.start}
                      onChange={(value) => updatePanel(panel.id, {
                        trackRange: { ...panel.trackRange, start: value || 1 }
                      })}
                      placeholder="起始"
                    />
                    <span>至</span>
                    <InputNumber
                      min={1}
                      max={50}
                      value={panel.trackRange.end}
                      onChange={(value) => updatePanel(panel.id, {
                        trackRange: { ...panel.trackRange, end: value || 4 }
                      })}
                      placeholder="结束"
                    />
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        ))}
      </Space>
    </div>
  );
};
