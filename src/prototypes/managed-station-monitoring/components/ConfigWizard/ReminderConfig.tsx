/**
 * 代管盯控 - 提醒配置
 */
import React from 'react';
import { Card, Switch, Space, Select, InputNumber, Typography } from 'antd';
import type { ReminderConfig as ReminderConfigType, StationConfig as StationConfigType } from '../../types';

const { Title, Text } = Typography;

interface ReminderConfigProps {
  reminder: ReminderConfigType;
  stations: StationConfigType[];
  onChange: (reminder: ReminderConfigType) => void;
}

export const ReminderConfig: React.FC<ReminderConfigProps> = ({ reminder, stations, onChange }) => {
  const allStationNames = stations.map(s => s.name);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card
        title="临站发车提醒"
        extra={
          <Switch
            checked={reminder.enableNearbyDeparture}
            onChange={(checked) => onChange({ ...reminder, enableNearbyDeparture: checked })}
          />
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>前方站选择：</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="选择前方站"
              value={reminder.nearbyStations}
              onChange={(values) => onChange({ ...reminder, nearbyStations: values })}
              options={allStationNames.map(name => ({ label: name, value: name }))}
              disabled={!reminder.enableNearbyDeparture}
            />
          </div>
        </Space>
      </Card>

      <Card
        title="出务预告提醒"
        extra={
          <Switch
            checked={reminder.enableDispatchNotice}
            onChange={(checked) => onChange({ ...reminder, enableDispatchNotice: checked })}
          />
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>早点大于（分钟）重新派班：</Text>
            <InputNumber
              min={0}
              max={120}
              value={reminder.reDispatchEarly}
              onChange={(value) => onChange({ ...reminder, reDispatchEarly: value || 30 })}
              style={{ marginLeft: 8, width: 100 }}
              disabled={!reminder.enableDispatchNotice}
            />
          </div>
          <div>
            <Text>晚点大于（分钟）重新派班：</Text>
            <InputNumber
              min={0}
              max={120}
              value={reminder.reDispatchLate}
              onChange={(value) => onChange({ ...reminder, reDispatchLate: value || 15 })}
              style={{ marginLeft: 8, width: 100 }}
              disabled={!reminder.enableDispatchNotice}
            />
          </div>
        </Space>
      </Card>

      <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <Title level={5}>说明</Title>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>临站发车提醒：当选择的前方站有车次发车时进行提醒</li>
          <li>出务预告提醒：当车次早晚点时间超过设定值时提醒重新派班</li>
        </ul>
      </div>
    </Space>
  );
};
