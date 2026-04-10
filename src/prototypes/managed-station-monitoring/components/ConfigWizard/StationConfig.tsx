/**
 * 代管盯控 - 车站配置
 */
import React, { useState } from 'react';
import { Button, Input, Checkbox, Space, Card, message } from 'antd';
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import type { StationConfig as StationConfigType } from '../../types';

interface StationConfigProps {
  stations: StationConfigType[];
  onChange: (stations: StationConfigType[]) => void;
}

export const StationConfig: React.FC<StationConfigProps> = ({ stations, onChange }) => {
  const [editingStation, setEditingStation] = useState<string | null>(null);

  const addStation = () => {
    const newStation: StationConfigType = {
      id: `station-${Date.now()}`,
      name: `新车站${stations.length + 1}`,
      tracks: ['1', '2', '3', '4'],
      directions: ['up', 'down'],
      formationOrder: ['normal', 'reverse'],
      waitingRooms: ['1'],
      checkInGates: ['A1'],
      exitGates: ['A'],
      trainTypes: ['highSpeed', 'normal']
    };
    onChange([...stations, newStation]);
    setEditingStation(newStation.id);
  };

  const removeStation = (id: string) => {
    if (stations.length <= 1) {
      message.warning('至少保留一个车站');
      return;
    }
    onChange(stations.filter(s => s.id !== id));
  };

  const updateStation = (id: string, updates: Partial<StationConfigType>) => {
    onChange(stations.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveStation = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stations.length - 1) return;

    const newStations = [...stations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStations[index], newStations[targetIndex]] = [newStations[targetIndex], newStations[index]];
    onChange(newStations);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={addStation}>
          添加车站
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        {stations.map((station, index) => (
          <Card
            key={station.id}
            size="small"
            title={
              <Space>
                <DragOutlined style={{ cursor: 'move' }} />
                <Input
                  value={station.name}
                  onChange={(e) => updateStation(station.id, { name: e.target.value })}
                  style={{ width: 150 }}
                  placeholder="车站名称"
                />
              </Space>
            }
            extra={
              <Space>
                <Button
                  size="small"
                  disabled={index === 0}
                  onClick={() => moveStation(index, 'up')}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  disabled={index === stations.length - 1}
                  onClick={() => moveStation(index, 'down')}
                >
                  ↓
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeStation(station.id)}
                />
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>股道范围：</div>
                <Input
                  value={station.tracks.join(', ')}
                  onChange={(e) => updateStation(station.id, {
                    tracks: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：1, 2, 3, 4"
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>上下行：</div>
                <Checkbox.Group
                  value={station.directions}
                  onChange={(values) => updateStation(station.id, { directions: values as ('up' | 'down')[] })}
                  options={[
                    { label: '上行', value: 'up' },
                    { label: '下行', value: 'down' }
                  ]}
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>正倒序：</div>
                <Checkbox.Group
                  value={station.formationOrder}
                  onChange={(values) => updateStation(station.id, { formationOrder: values as ('normal' | 'reverse')[] })}
                  options={[
                    { label: '正序', value: 'normal' },
                    { label: '倒序', value: 'reverse' }
                  ]}
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>候车室：</div>
                <Input
                  value={station.waitingRooms.join(', ')}
                  onChange={(e) => updateStation(station.id, {
                    waitingRooms: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：1, 2, 3"
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>检票口：</div>
                <Input
                  value={station.checkInGates.join(', ')}
                  onChange={(e) => updateStation(station.id, {
                    checkInGates: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：A1, A2, B1"
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>出站口：</div>
                <Input
                  value={station.exitGates.join(', ')}
                  onChange={(e) => updateStation(station.id, {
                    exitGates: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：A, B, C"
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>车型：</div>
                <Checkbox.Group
                  value={station.trainTypes}
                  onChange={(values) => updateStation(station.id, { trainTypes: values as ('highSpeed' | 'normal')[] })}
                  options={[
                    { label: '高铁', value: 'highSpeed' },
                    { label: '普速', value: 'normal' }
                  ]}
                />
              </div>
            </Space>
          </Card>
        ))}
      </Space>
    </div>
  );
};
