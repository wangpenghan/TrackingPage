/**
 * 代管盯控 - 显示配置
 */
import React from 'react';
import { Checkbox, Card, Space, Typography } from 'antd';
import type { DisplayConfig as DisplayConfigType } from '../../types';

const { Title } = Typography;

interface DisplayConfigProps {
  display: DisplayConfigType;
  onChange: (display: DisplayConfigType) => void;
}

const displayOptions = [
  { label: '站台', value: 'showPlatform' },
  { label: '列车长1', value: 'showMaster1' },
  { label: '列车长2', value: 'showMaster2' },
  { label: '客流信息', value: 'showPassengerFlow' },
  { label: '重点事项', value: 'showKeyItems' }
];

const keyItemOptions = [
  { label: '上水', value: 'water' },
  { label: '吸污', value: 'sewage' },
  { label: '行包', value: 'parcel' },
  { label: '送餐', value: 'meal' },
  { label: '大客流', value: 'highFlow' },
  { label: '同站台', value: 'samePlatform' },
  { label: '风险', value: 'risk' },
  { label: '超员', value: 'overcrowd' },
  { label: '专运', value: 'special' }
];

export const DisplayConfig: React.FC<DisplayConfigProps> = ({ display, onChange }) => {
  const handleDisplayChange = (checkedValues: string[]) => {
    onChange({
      ...display,
      showPlatform: checkedValues.includes('showPlatform'),
      showMaster1: checkedValues.includes('showMaster1'),
      showMaster2: checkedValues.includes('showMaster2'),
      showPassengerFlow: checkedValues.includes('showPassengerFlow'),
      showKeyItems: checkedValues.includes('showKeyItems')
    });
  };

  const handleKeyItemsChange = (checkedValues: string[]) => {
    onChange({
      ...display,
      keyItems: checkedValues as DisplayConfigType['keyItems']
    });
  };

  const currentDisplayValues = [
    display.showPlatform && 'showPlatform',
    display.showMaster1 && 'showMaster1',
    display.showMaster2 && 'showMaster2',
    display.showPassengerFlow && 'showPassengerFlow',
    display.showKeyItems && 'showKeyItems'
  ].filter(Boolean) as string[];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="车次卡片显示内容">
        <Checkbox.Group
          value={currentDisplayValues}
          onChange={handleDisplayChange}
          options={displayOptions}
        />
      </Card>

      <Card title="重点事项显示">
        <Checkbox.Group
          value={display.keyItems}
          onChange={handleKeyItemsChange}
          options={keyItemOptions}
        />
      </Card>

      <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <Title level={5}>说明</Title>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>车次卡片上显示的内容可在上方勾选配置</li>
          <li>重点事项会在车次卡片上以图标或标签形式展示</li>
          <li>鼠标悬停卡片时会显示完整信息</li>
        </ul>
      </div>
    </Space>
  );
};
