
const fs = require('fs');
const path = require('path');

const content = `import React, { forwardRef, useState } from 'react';
import { PlanChangeOverview } from './components/PlanChangeOverview';
import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

const EVENT_LIST: EventItem[] = [
  { name: 'on_train_select', desc: '选中列车时触发，传递列车ID', payload: 'string' }
];

const ACTION_LIST: Action[] = [
  { name: 'select_train', desc: '选中指定列车，参数：列车ID', params: 'string' }
];

const VAR_LIST: KeyDesc[] = [
  { name: 'selected_train_id', desc: '当前选中的列车ID' }
];

const CONFIG_LIST: ConfigItem[] = [
  {
    type: 'select',
    attributeId: 'currentStation',
    displayName: '默认车站',
    info: '页面加载时默认显示的车站',
    initialValue: '重庆东'
  }
];

const DATA_LIST: DataDesc[] = [
  {
    name: 'train_schedules',
    desc: '列车时刻表数据',
    keys: [
      { name: 'id', desc: '列车唯一标识' },
      { name: 'train_no', desc: '列车车次号' }
    ]
  }
];

const Component = forwardRef<AxureHandle, AxureProps>(function ArrivalDepartureMonitoring(innerProps, ref) {
  const [planChangeOverviewVisible, setPlanChangeOverviewVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div style={{ 
      padding: '40px', 
      background: darkMode ? '#0f172a' : '#f0f2f5', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ 
        background: darkMode ? '#1e293b' : '#fff', 
        padding: '40px', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: darkMode ? '#fff' : '#1890ff', marginBottom: '20px' }}>✓ 页面加载成功！</h1>
        <p style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '16px', marginBottom: '20px' }}>
          到发盯控系统 - 测试计划变更总览功能
        </p>
        <button 
          onClick={() => setPlanChangeOverviewVisible(true)}
          style={{
            padding: '10px 20px',
            background: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          打开计划变更总览
        </button>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            background: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {darkMode ? '浅色模式' : '深色模式'}
        </button>
      </div>

      <PlanChangeOverview
        visible={planChangeOverviewVisible}
        onClose={() => setPlanChangeOverviewVisible(false)}
        darkMode={darkMode}
        onViewTrain={(trainId) => {
          console.log('查看列车:', trainId);
          setPlanChangeOverviewVisible(false);
        }}
        onBatchConfirm={(trainIds) => {
          console.log('批量确认:', trainIds);
        }}
        onBatchLock={(trainIds) => {
          console.log('批量锁定:', trainIds);
        }}
      />
    </div>
  );
});

export default Component;
`;

const filePath = path.join(__dirname, 'src/prototypes/arrival-departure-monitoring-v2/index.tsx');
fs.writeFileSync(filePath, content, 'utf8');
console.log('File written successfully to:', filePath);
