import React, { useState, useEffect } from 'react';
import { Tabs, Button, Input, Select, Table, Tag, DatePicker, Checkbox, Row, Col, Card, Switch, Space, Modal, Popconfirm, message } from 'antd';
import { X, Save, Play, RefreshCw, AlertCircle, Edit, Square, Link, RotateCcw, FileText, Ticket, Train, DoorOpen } from 'lucide-react';
import dayjs from 'dayjs';

import { mockTrainSchedules, TrainSchedule, getOperationDetails, OperationTaskGroup, OperationTaskItem, fixAlarm, fixedAlarmTrains, completeAllAbnormalOperations, getTrainRemarks, saveTrainRemarks } from './mock-data';
import { OperationDetailDrawer } from './components/OperationDetailDrawer';

interface TrainDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  mode?: 'drawer' | 'embedded';
  initialTab?: string;
  onDispose?: (trainId: string) => void;
  onDataChange?: () => void;
  darkMode?: boolean;
}

const { TabPane } = Tabs;
const { Option } = Select;

// 统一样式常量 - 与 OperationDrawer 保持一致
const DRAWER_WIDTH = 560;
const HEADER_PADDING = '14px 20px';
const CONTENT_PADDING = '16px 20px';
const CARD_BORDER_RADIUS = '10px';
const CARD_PADDING = '14px 16px';
const BUTTON_HEIGHT = '40px';
const BUTTON_BORDER_RADIUS = '8px';
const INPUT_HEIGHT = '38px';
const INPUT_BORDER_RADIUS = '8px';
const LABEL_FONT_SIZE = '12px';
const TITLE_FONT_SIZE = '17px';
const CONTENT_FONT_SIZE = '13px';

export const TrainDetailDrawer: React.FC<TrainDetailDrawerProps> = ({ visible, onClose, trainId, mode = 'drawer', initialTab, onDispose, onDataChange, darkMode = false }) => {
  const [isCtcEnabled, setIsCtcEnabled] = useState(true);
  const [activeTravelServiceTab, setActiveTravelServiceTab] = useState('guide');
  const [activeTab, setActiveTab] = useState(initialTab || 'passenger_service_info');
  const [operationDetailVisible, setOperationDetailVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  React.useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const handleOpenOperationDetail = () => {
    console.log('handleOpenOperationDetail 被调用，当前 trainId:', trainId);
    setOperationDetailVisible(true);
  };

  const handleCloseOperationDetail = () => {
    setOperationDetailVisible(false);
  };

  const handleUnsavedChanges = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认关闭',
        content: '您有未保存的修改，是否继续关闭？',
        okText: '不保存关闭',
        cancelText: '取消',
        onOk: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  if (!visible) return null;

  const getContainerStyle = (darkMode: boolean, mode: 'drawer' | 'embedded'): React.CSSProperties => {
    if (mode === 'drawer') {
      return {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: `${DRAWER_WIDTH}px`,
        background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
        zIndex: 1000,
        boxShadow: darkMode ? '-8px 0 24px rgba(0,0,0,0.4)' : '-8px 0 24px rgba(29,78,95,0.12)',
        display: 'flex',
        flexDirection: 'column'
      };
    }
    return {
      flex: 1,
      background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
      height: '100%',
      overflow: 'hidden'
    };
  };

  const getHeaderStyle = (darkMode: boolean): React.CSSProperties => ({
    padding: HEADER_PADDING,
    borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
  });

  const getTitleStyle = (darkMode: boolean): React.CSSProperties => ({
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 600,
    color: darkMode ? '#E2E8F0' : '#1F2937',
    letterSpacing: '0.5px',
    fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
  });

  const getCloseButtonStyle = (darkMode: boolean): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    color: darkMode ? '#94A3B8' : '#64748B',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF'
  });

  return (
    <div style={getContainerStyle(darkMode, mode)}>
      <div style={getHeaderStyle(darkMode)}>
        <div style={getTitleStyle(darkMode)}>
          车次详情
          {hasUnsavedChanges && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              fontSize: '11px',
              borderRadius: '10px',
              background: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.1)',
              color: darkMode ? '#F59E0B' : '#D97706',
              border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.2)'}`
            }}>未保存</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button 
            type="text" 
            icon={<X size={20} />} 
            onClick={handleClose} 
            style={getCloseButtonStyle(darkMode)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          .train-detail-tabs { height: 100%; }
          .train-detail-tabs .ant-tabs-content-holder { height: 100% !important; display: flex; flex-direction: column; }
          .train-detail-tabs .ant-tabs-content { height: 100% !important; flex: 1; display: flex; flex-direction: column; }
          .train-detail-tabs .ant-tabs-tabpane { height: 100%; display: flex; flex-direction: column; outline: none; }
          .train-detail-tabs .ant-tabs-content .ant-tabs-tabpane:not(.ant-tabs-tabpane-active) { display: none !important; }
          .train-detail-tabs .ant-tabs-tab { background: transparent !important; }
          .train-detail-tabs .ant-tabs-tab-active { background: transparent !important; }
          .train-detail-tabs .ant-tabs-ink-bar { background: #D97706 !important; }
        `}</style>
        <Tabs 
          className="train-detail-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left" 
          style={{ height: '100%' }}
          tabBarStyle={{ 
            width: '64px', 
            paddingTop: '16px', 
            background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(29, 78, 95, 0.03)',
            borderRight: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}
          items={[
            {
              key: 'passenger_service_info',
              label: <div style={{ 
                writingMode: 'vertical-lr', 
                padding: '16px 4px', 
                letterSpacing: '6px', 
                fontSize: '13px',
                color: darkMode ? '#94A3B8' : '#64748B',
                fontWeight: 500
              }}>旅服信息</div>,
              children: <TravelServiceInfo 
                trainId={trainId} 
                key={trainId} 
                activeTab={activeTravelServiceTab}
                onTabChange={setActiveTravelServiceTab}
                onDataChange={onDataChange}
                onUnsavedChanges={handleUnsavedChanges}
                darkMode={darkMode}
              />
            },
            {
              key: 'station_train_info',
              label: <div style={{ 
                writingMode: 'vertical-lr', 
                padding: '16px 4px', 
                letterSpacing: '6px', 
                fontSize: '13px',
                color: darkMode ? '#94A3B8' : '#64748B',
                fontWeight: 500
              }}>站车信息</div>,
              children: <StationTrainInfo trainId={trainId} key={trainId} darkMode={darkMode} />
            },
            {
              key: 'operation_info',
              label: <div style={{ 
                writingMode: 'vertical-lr', 
                padding: '16px 4px', 
                letterSpacing: '6px', 
                fontSize: '13px',
                color: darkMode ? '#94A3B8' : '#64748B',
                fontWeight: 500
              }}>作业信息</div>,
              children: <OperationInfo trainId={trainId} onDispose={onDispose} onDataChange={onDataChange} darkMode={darkMode} onOpenOperationDetail={handleOpenOperationDetail} />
            },
            {
              key: 'tag_log',
              label: <div style={{ 
                writingMode: 'vertical-lr', 
                padding: '16px 4px', 
                letterSpacing: '6px', 
                fontSize: '13px',
                color: darkMode ? '#94A3B8' : '#64748B',
                fontWeight: 500
              }}>操作日志</div>,
              children: <TagLog darkMode={darkMode} />
            }
          ]}
        />
      </div>

      {/* 作业详情抽屉 */}
      <OperationDetailDrawer
        visible={operationDetailVisible}
        onClose={handleCloseOperationDetail}
        trainId={trainId}
        darkMode={darkMode}
      />
    </div>
  );
};

interface TravelServiceInfoProps {
  trainId: string | null;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  onDataChange?: () => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
  darkMode?: boolean;
}

const TravelServiceInfo: React.FC<TravelServiceInfoProps> = ({ trainId, activeTab, onTabChange, onDataChange, onUnsavedChanges, darkMode = false }) => {
  const isEditingBasic = true;
  const isEditingLocation = true;
  const isEditingTime = true;
  const [isCtcEnabled, setIsCtcEnabled] = useState(true);
  const [isLateUndetermined, setIsLateUndetermined] = useState(false);
  const [isLateUndeterminedModalVisible, setIsLateUndeterminedModalVisible] = useState(false);
  const [isUndeterminedRecoveryModalVisible, setIsUndeterminedRecoveryModalVisible] = useState(false);
  const [broadcastFilter, setBroadcastFilter] = useState<'all' | 'daily' | 'thematic' | 'conflict'>('all');
  const [guideFilter, setGuideFilter] = useState<'all' | 'entrance' | 'waiting' | 'platform' | 'exit'>('all');
  const [guidePreviewVisible, setGuidePreviewVisible] = useState(false);
  const [selectedGuideRecord, setSelectedGuideRecord] = useState<any>(null);
  const [hasGuideChanges, setHasGuideChanges] = useState(false);
  const [hasBroadcastChanges, setHasBroadcastChanges] = useState(false);
  const [guideData, setGuideData] = useState<any[]>([
    { key: '1', screenName: '候车室综合屏', area: 'waiting', startTime: '2026-02-03 03:22:00', endTime: '2026-02-03 11:28:00', upperMode: 'manual', upperSignal: '无', lowerMode: 'manual', lowerSignal: '无', priority: 10, status: '正在执行', hasOcrSupport: true, ocrStatus: 'normal' },
    { key: '2', screenName: '检票口引导屏', area: 'entrance', startTime: '2026-02-03 03:22:00', endTime: '2026-02-03 11:23:00', upperMode: 'automatic', upperSignal: '无', lowerMode: 'automatic', lowerSignal: '无', priority: 10, status: '正在执行', hasOcrSupport: true, ocrStatus: 'abnormal' },
    { key: '3', screenName: '1站台引导屏', area: 'platform', startTime: '2026-02-03 03:22:00', endTime: '2026-02-03 11:23:00', upperMode: 'automatic', upperSignal: '无', lowerMode: 'automatic', lowerSignal: '无', priority: 10, status: '等待执行', hasOcrSupport: false },
    { key: '4', screenName: '2站台引导屏', area: 'platform', startTime: '2026-02-03 03:22:00', endTime: '2026-02-03 11:23:00', upperMode: 'automatic', upperSignal: '无', lowerMode: 'automatic', lowerSignal: '无', priority: 10, status: '等待执行', hasOcrSupport: true, ocrStatus: 'normal' },
    { key: '5', screenName: '出站口引导屏', area: 'exit', startTime: '2026-02-03 03:22:00', endTime: '2026-02-03 11:23:00', upperMode: 'manual', upperSignal: '无', lowerMode: 'manual', lowerSignal: '无', priority: 10, status: '已完成', hasOcrSupport: true, ocrStatus: 'normal' },
    { key: '6', screenName: '北进站口引导屏', area: 'entrance', startTime: '2026-02-03 03:22:00', endTime: '2026-02-03 11:23:00', upperMode: 'automatic', upperSignal: '无', lowerMode: 'automatic', lowerSignal: '无', priority: 10, status: '正在执行', hasOcrSupport: true, ocrStatus: 'normal' },
  ]);
  const [broadcastData, setBroadcastData] = useState<any[]>([
    { key: '1', area: '候车室全区', content: `${train?.trainNo || 'G100'}次列车开始检票通知`, startTime: '2026-02-03 16:22:00', status: '正在播放', triggerSignal: '时间', mode: 'manual', playCount: 1 },
    { key: '2', area: '5号站台', content: `${train?.trainNo || 'G100'}次列车即将到达`, startTime: '2026-02-03 16:40:00', status: '等待执行', triggerSignal: '时间', mode: 'automatic', playCount: 1 },
    { key: '3', area: '出站口', content: `${train?.trainNo || 'G100'}次列车到达广播`, startTime: '2026-02-03 16:50:00', status: '等待执行', triggerSignal: '时间', mode: 'manual', playCount: 1 },
  ]);

  const train = mockTrainSchedules.find(t => t.id === trainId);
  
  const [adjustValue, setAdjustValue] = useState<string>('');
  const [isCumulative, setIsCumulative] = useState(false);
  const [isDefer, setIsDefer] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [manualCommandModalVisible, setManualCommandModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [manualCommandTime, setManualCommandTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'));
  const [times, setTimes] = useState({
    actualArrival: dayjs().format('YYYY-MM-DD HH:mm'),
    actualDeparture: dayjs().format('YYYY-MM-DD HH:mm'),
    checkInStart: dayjs().format('YYYY-MM-DD HH:mm'),
    checkInStop: dayjs().format('YYYY-MM-DD HH:mm'),
    exitStart: dayjs().format('YYYY-MM-DD HH:mm'),
    exitStop: dayjs().format('YYYY-MM-DD HH:mm')
  });
  const [basicInfoChanges, setBasicInfoChanges] = useState<Record<string, any>>({});
  const [locationInfoChanges, setLocationInfoChanges] = useState<Record<string, any>>({});
  const [timeInfoChanges, setTimeInfoChanges] = useState<Record<string, any>>({});

  const getInitialTimes = (trainData: any) => {
    const now = dayjs().format('YYYY-MM-DD');
    return {
      actualArrival: `${now} ${trainData.arrival.time}`,
      actualDeparture: `${now} ${trainData.departure.time}`,
      checkInStart: `${now} 16:22`,
      checkInStop: `${now} 16:31`,
      exitStart: `${now} 16:22`,
      exitStop: `${now} 17:00`
    };
  };

  useEffect(() => {
    if (train) {
      setTimes(getInitialTimes(train));
    }
  }, [train]);

  // 检测是否有未保存的修改
  useEffect(() => {
    const hasChanges = Object.keys(basicInfoChanges).length > 0 || 
                      Object.keys(locationInfoChanges).length > 0 || 
                      Object.keys(timeInfoChanges).length > 0;
    if (onUnsavedChanges) {
      onUnsavedChanges(hasChanges);
    }
  }, [basicInfoChanges, locationInfoChanges, timeInfoChanges, onUnsavedChanges]);

  const handleTimeCancel = () => {
    if (train) {
      setTimes(getInitialTimes(train));
    }
    setTimeInfoChanges({});
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousTimes = history[history.length - 1];
    setTimes(previousTimes);
    setHistory(prev => prev.slice(0, -1));
  };

  // 切换引导计划上下屏模式
  const handleGuideModeChange = (key: string, type: 'upper' | 'lower', checked: boolean) => {
    setGuideData(prev => prev.map(item => {
      if (item.key === key) {
        return {
          ...item,
          [type === 'upper' ? 'upperMode' : 'lowerMode']: checked ? 'manual' : 'automatic'
        };
      }
      return item;
    }));
    setHasGuideChanges(true);
    if (onUnsavedChanges) onUnsavedChanges(true);
  };

  // 切换广播计划模式
  const handleBroadcastModeChange = (key: string, checked: boolean) => {
    setBroadcastData(prev => prev.map(item => {
      if (item.key === key) {
        return {
          ...item,
          mode: checked ? 'manual' : 'automatic'
        };
      }
      return item;
    }));
    setHasBroadcastChanges(true);
    if (onUnsavedChanges) onUnsavedChanges(true);
  };

  // 保存引导计划
  const handleSaveGuide = () => {
    setHasGuideChanges(false);
    if (onDataChange) onDataChange();
    if (onUnsavedChanges) onUnsavedChanges(hasBroadcastChanges);
    message.success('引导计划已保存');
  };

  // 保存广播计划
  const handleSaveBroadcast = () => {
    setHasBroadcastChanges(false);
    if (onDataChange) onDataChange();
    if (onUnsavedChanges) onUnsavedChanges(hasGuideChanges);
    message.success('广播计划已保存');
  };

  if (!train) {
    return <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: darkMode ? '#64748B' : '#94A3B8',
      fontSize: '14px'
    }}>请选择车次查看详情</div>;
  }

  const trainInfo = {
    trainNo: train.trainNo,
    arrival: `${dayjs().format('YYYY-MM-DD')} ${train.arrival.time}`,
    departure: `${dayjs().format('YYYY-MM-DD')} ${train.departure.time}`,
    from: train.runningSection.from,
    to: train.runningSection.to,
    status: train.arrival.lateEarly && train.arrival.lateEarly.startsWith('+') ? `晚点${train.arrival.lateEarly}` : '正点',
    date: dayjs().format('YYYY-MM-DD')
  };

  // 统一的卡片样式 - 与 OperationDrawer 保持一致
  const getCardStyle = (darkMode: boolean): React.CSSProperties => ({
    borderRadius: CARD_BORDER_RADIUS,
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    transition: 'all 0.3s ease',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
    boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
  });

  // 统一的输入框样式
  const getInputStyle = (darkMode: boolean): React.CSSProperties => ({
    width: '100%',
    height: INPUT_HEIGHT,
    fontSize: CONTENT_FONT_SIZE,
    borderRadius: INPUT_BORDER_RADIUS,
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)'
  });

  // 统一的主按钮样式
  const getPrimaryButtonStyle = (darkMode: boolean): React.CSSProperties => ({
    padding: '10px 28px',
    fontSize: CONTENT_FONT_SIZE,
    height: BUTTON_HEIGHT,
    fontWeight: 500,
    borderRadius: BUTTON_BORDER_RADIUS,
    background: darkMode ? 'linear-gradient(135deg, #2A6B7C 0%, #1D4E5F 100%)' : 'linear-gradient(135deg, #2A6B7C 0%, #1D4E5F 100%)',
    boxShadow: darkMode ? '0 2px 8px rgba(42, 107, 124, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.2)'
  });

  // 统一的次按钮样式
  const getSecondaryButtonStyle = (darkMode: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: CONTENT_FONT_SIZE,
    height: BUTTON_HEIGHT,
    fontWeight: 500,
    borderRadius: BUTTON_BORDER_RADIUS,
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    color: darkMode ? '#E2E8F0' : '#64748B',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)',
    boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(29, 78, 95, 0.06)'
  });

  // 统一的标签样式
  const getLabelStyle = (darkMode: boolean): React.CSSProperties => ({
    fontSize: LABEL_FONT_SIZE,
    marginBottom: '6px',
    color: darkMode ? '#94A3B8' : '#6B7280',
    fontWeight: 500,
    letterSpacing: '0.3px'
  });

  const handleQuickAdjust = (type: 'arrival' | 'departure' | 'checkInStart' | 'checkInStop' | 'exitStart' | 'exitStop') => {
    if (!adjustValue || isNaN(Number(adjustValue))) return;
    
    setHistory(prev => [...prev, times]);

    const minutes = Number(adjustValue);
    const newTimes = { ...times };
    const now = dayjs().format('YYYY-MM-DD');
    
    const calculateTime = (key: keyof typeof times, scheduleTime?: string) => {
      let baseTime;
      if (isCumulative) {
        baseTime = dayjs(times[key]);
      } else {
        if (scheduleTime) {
           baseTime = dayjs(`${now} ${scheduleTime}`);
        } else {
           const mockScheduleMap: Record<string, string> = {
             checkInStart: '16:22',
             checkInStop: '16:31',
             exitStart: '16:22',
             exitStop: '17:00'
           };
           baseTime = dayjs(`${now} ${mockScheduleMap[key as string] || '00:00'}`);
        }
      }

      if (baseTime.isValid()) {
        return baseTime.add(minutes, 'minute').format('YYYY-MM-DD HH:mm');
      }
      return times[key];
    };

    const changedFields: string[] = [];

    switch (type) {
      case 'arrival':
        const newArrival = calculateTime('actualArrival', train?.arrival.time);
        newTimes.actualArrival = newArrival;
        changedFields.push('actualArrival');
        
        if (isDefer) {
          newTimes.checkInStart = calculateTime('checkInStart'); 
          newTimes.checkInStop = calculateTime('checkInStop');
          changedFields.push('checkInStart', 'checkInStop');
        }
        break;
        
      case 'departure':
        const newDeparture = calculateTime('actualDeparture', train?.departure.time);
        newTimes.actualDeparture = newDeparture;
        changedFields.push('actualDeparture');
        
        if (isDefer) {
          newTimes.exitStart = calculateTime('exitStart');
          newTimes.exitStop = calculateTime('exitStop');
          changedFields.push('exitStart', 'exitStop');
        }
        break;
        
      case 'checkInStart':
        newTimes.checkInStart = calculateTime('checkInStart');
        changedFields.push('checkInStart');
        break;
      case 'checkInStop':
        newTimes.checkInStop = calculateTime('checkInStop');
        changedFields.push('checkInStop');
        break;
      case 'exitStart':
        newTimes.exitStart = calculateTime('exitStart');
        changedFields.push('exitStart');
        break;
      case 'exitStop':
        newTimes.exitStop = calculateTime('exitStop');
        changedFields.push('exitStop');
        break;
    }
    
    setTimes(newTimes);
    
    setTimeInfoChanges(prev => {
      const updates = { ...prev };
      changedFields.forEach(field => {
        updates[field] = true;
      });
      return updates;
    });
  };

  const handleTimeChange = (key: keyof typeof times, date: dayjs.Dayjs | null) => {
    if (!date) return;
    const newTime = date.format('YYYY-MM-DD HH:mm');
    setTimes(prev => ({ ...prev, [key]: newTime }));
    setTimeInfoChanges(prev => ({ ...prev, [key]: true }));
  };

  const renderBatchSaveControl = (changes: Record<string, any>, onSave: () => void, onCancel: () => void) => {
    const hasChanges = Object.keys(changes).length > 0;
    if (!hasChanges) return null;
    
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button 
          type="primary" 
          size="small" 
          icon={<Save size={14} />} 
          onClick={() => {
            onSave();
            if (onUnsavedChanges) {
              const hasAnyChanges = Object.keys(basicInfoChanges).length > 0 || 
                                 Object.keys(locationInfoChanges).length > 0 || 
                                 Object.keys(timeInfoChanges).length > 0;
              onUnsavedChanges(hasAnyChanges);
            }
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '13px',
            fontWeight: 500,
            height: '32px',
            borderRadius: '8px',
            background: darkMode ? '#0A84FF' : '#007AFF',
            border: 'none',
            color: '#FFFFFF',
            boxShadow: 'none'
          }}
        >
          批量保存
        </Button>
        <Button 
          size="small" 
          icon={<X size={14} />} 
          onClick={() => {
            onCancel();
            if (onUnsavedChanges) {
              const hasAnyChanges = Object.keys(basicInfoChanges).length > 0 || 
                                 Object.keys(locationInfoChanges).length > 0 || 
                                 Object.keys(timeInfoChanges).length > 0;
              onUnsavedChanges(hasAnyChanges);
            }
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '13px',
            fontWeight: 500,
            height: '32px',
            borderRadius: '8px',
            background: darkMode ? '#2C2C2E' : '#FFFFFF',
            color: darkMode ? '#F5F5F7' : '#1D1D1F',
            border: `1px solid ${darkMode ? '#38383A' : '#D2D2D7'}`,
            boxShadow: 'none'
          }}
        >
          取消
        </Button>
      </div>
    );
  };

  const trackOptions = Array.from({ length: 20 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}道` }));
  const platformOptions = Array.from({ length: 20 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}站台` }));

  const handleLocationChange = (field: string, value: string) => {
    setLocationInfoChanges(prev => ({ ...prev, [field]: value }));
    
    if (field === 'track' || field === 'platform') {
        const waitingHalls = ['high', 'normal'];
        const checkInGates = ['6b7b', '1a1b', '2a2b'];
        const exitGates = ['a2', 'b1'];
        
        const randomWaitingHall = waitingHalls[Math.floor(Math.random() * waitingHalls.length)];
        const randomCheckInGate = checkInGates[Math.floor(Math.random() * checkInGates.length)];
        const randomExitGate = exitGates[Math.floor(Math.random() * exitGates.length)];
        
        setLocationInfoChanges(prev => ({
            ...prev,
            [field]: value,
            waitingHall: randomWaitingHall,
            checkInGate: randomCheckInGate,
            exitGate: randomExitGate
        }));
    }
  };

  const BasicInfoInput = ({ field, defaultValue, style, type = 'input', options = [] }: { field: string, defaultValue: string, style?: React.CSSProperties, type?: 'input' | 'select', options?: { value: string, label: string }[] }) => {
    const value = basicInfoChanges[field] !== undefined ? basicInfoChanges[field] : defaultValue;
    const isChanged = basicInfoChanges[field] !== undefined && basicInfoChanges[field] !== defaultValue;

    const handleChange = (val: string) => {
      setBasicInfoChanges(prev => {
        if (val === defaultValue) {
          const { [field]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [field]: val };
      });
    };

    const commonStyle = {
      ...style,
      border: isChanged ? '1px solid #D97706' : (darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)'),
      backgroundColor: isChanged ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : '#FFF7ED') : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
      borderRadius: INPUT_BORDER_RADIUS,
      height: INPUT_HEIGHT,
      fontSize: '16px',
      fontWeight: 600,
      color: '#1890ff'
    };

    if (type === 'select') {
      return (
        <Select 
          value={value} 
          onChange={handleChange}
          size="small" 
          style={commonStyle}
          dropdownStyle={{ zIndex: 2000 }}
          showSearch
          allowClear
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase()?.includes(input.toLowerCase())
          }
          optionFilterProp="children"
        >
          {options?.map(opt => (
            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
          ))}
        </Select>
      );
    }

    return (
      <Input 
        value={value} 
        onChange={(e) => handleChange(e.target.value)}
        size="small" 
        style={commonStyle} 
      />
    );
  };

  const LocationInfoInput = ({ field, defaultValue, style, type = 'input', options = [], onChange }: { field: string, defaultValue: string, style?: React.CSSProperties, type?: 'input' | 'select', options?: { value: string, label: string }[], onChange?: (val: string) => void }) => {
    const value = locationInfoChanges[field] !== undefined ? locationInfoChanges[field] : defaultValue;
    const isChanged = locationInfoChanges[field] !== undefined && locationInfoChanges[field] !== defaultValue;

    const handleChange = (val: string) => {
      setLocationInfoChanges(prev => {
        if (val === defaultValue) {
          const { [field]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [field]: val };
      });
      if (onChange) onChange(val);
    };

    const commonStyle = {
      ...style,
      border: isChanged ? '1px solid #D97706' : (darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)'),
      backgroundColor: isChanged ? (darkMode ? 'rgba(217, 119, 6, 0.1)' : '#FFF7ED') : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
      borderRadius: INPUT_BORDER_RADIUS,
      height: INPUT_HEIGHT,
      fontSize: '16px',
      fontWeight: 600,
      color: '#1890ff'
    };

    const renderInput = () => {
      if (type === 'select') {
      return (
        <Select
          value={value}
          onChange={handleChange}
          size="small"
          style={commonStyle}
          dropdownStyle={{ zIndex: 2000 }}
          showSearch
          allowClear
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase()?.includes(input.toLowerCase())
          }
          optionFilterProp="children"
        >
          {options?.map(opt => (
            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
          ))}
        </Select>
      );
    }
      return (
        <Input 
          value={value} 
          onChange={(e) => handleChange(e.target.value)}
          size="small" 
          style={commonStyle} 
        />
      );
    };

    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {renderInput()}
        <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isChanged && (
            <Button 
              type="text" 
              size="small" 
              icon={<Save size={16} color="#D97706" />} 
              title="保存此项"
              style={{ padding: 0, width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => {
                setLocationInfoChanges(prev => {
                  const { [field]: _, ...rest } = prev;
                  return rest;
                });
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const handleLateUndeterminedConfirm = () => {
    setIsLateUndetermined(true);
    setIsLateUndeterminedModalVisible(false);
  };

  const handleUndeterminedRecoveryConfirm = () => {
    const arrivalTime = dayjs(times.actualArrival);
    const departureTime = dayjs(times.actualDeparture);
    
    if (arrivalTime.isAfter(departureTime)) {
      Modal.error({
        title: '时间错误',
        content: '到站时间必须早于离站时间，请重新调整。',
      });
      return;
    }
    
    setIsLateUndetermined(false);
    setIsUndeterminedRecoveryModalVisible(false);
  };

  const handleManualCommand = (record: any) => {
    setCurrentRecord(record);
    setManualCommandTime(dayjs().format('YYYY-MM-DD HH:mm'));
    setManualCommandModalVisible(true);
  };

  const confirmManualCommand = () => {
    console.log('手动录入命令', { record: currentRecord, commandTime: manualCommandTime });
    setManualCommandModalVisible(false);
    setCurrentRecord(null);
    if (onDataChange) {
      onDataChange();
    }
  };

  const TimeAdjustRow = ({ label, time, disabled, scheduledTime, onChange }: any) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '10px 12px', 
      borderRadius: '8px', 
      background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC', 
      border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
    }}>
      <span style={{ 
        width: '72px', 
        fontSize: LABEL_FONT_SIZE, 
        color: darkMode ? '#94A3B8' : '#64748B', 
        fontWeight: 500, 
        flexShrink: 0 
      }}>{label}</span>
      <DatePicker 
        showTime 
        value={time ? dayjs(time) : null}
        onChange={onChange}
        disabled={disabled}
        style={{ flex: 1, height: INPUT_HEIGHT }}
        format="YYYY-MM-DD HH:mm"
        size="middle"
      />
    </div>
  );

  const LabelValue = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: LABEL_FONT_SIZE, color: darkMode ? '#94A3B8' : '#64748B' }}>{label}</span>
      <span style={{ fontSize: '14px', color: color || (darkMode ? '#F8FAFC' : '#1D4E5F'), fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      height: '100%', 
      overflow: 'hidden', 
      padding: CONTENT_PADDING, 
      background: darkMode ? '#0D1B2A' : '#FAF8F5', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      
      <Row gutter={12} style={{ marginBottom: '12px', flex: '0 0 auto' }}>
        <Col span={6}>
          <Card 
            title={<span style={{ color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '14px', fontWeight: 600 }}>图定信息</span>} 
            bordered={false} 
            size="small" 
            bodyStyle={{ padding: CARD_PADDING }} 
            style={{ 
              ...getCardStyle(darkMode),
              height: '260px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <LabelValue label="车次" value={trainInfo.trainNo} />
               <LabelValue label="始发车次" value={trainInfo.trainNo} />
               <LabelValue label="运行区间" value={`${trainInfo.from} - ${trainInfo.to}`} />
               <LabelValue label="图定到点" value={trainInfo.arrival} />
               <LabelValue label="图定发点" value={trainInfo.departure} />
               <LabelValue label="当前状态" value={trainInfo.status} color={trainInfo.status.includes('晚点') ? '#EF4444' : '#10B981'} />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card 
            title={<span style={{ color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '14px', fontWeight: 600 }}>时间调整</span>} 
            bordered={false} 
            size="small" 
            bodyStyle={{ padding: CARD_PADDING, display: 'flex', flexDirection: 'column', gap: '12px' }}
            style={{ 
              ...getCardStyle(darkMode),
              height: '260px'
            }}
            extra={renderBatchSaveControl(timeInfoChanges, () => setTimeInfoChanges({}), handleTimeCancel)}
          >
            <div style={{ display: 'flex', gap: '12px', height: '100%' }}>
              <div style={{ 
                flex: '0 0 180px', 
                background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC', 
                padding: '12px', 
                borderRadius: '8px', 
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px' 
              }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '13px' }}>快速调整</div>
                   <Button 
                     type="text" 
                     size="small" 
                     icon={<RotateCcw size={16} />} 
                     onClick={handleUndo} 
                     disabled={!isEditingTime || history.length === 0}
                     title="撤销上一步"
                     style={{ padding: '6px', height: '32px', width: '32px', borderRadius: '8px', color: history.length > 0 ? '#D97706' : (darkMode ? '#64748B' : '#94A3B8') }}
                   />
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <Checkbox 
                        style={{ marginLeft: 0, fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }} 
                        disabled={!isEditingTime}
                        checked={isCumulative}
                        onChange={(e) => setIsCumulative(e.target.checked)}
                    >
                        累加
                    </Checkbox>
                    <Checkbox 
                        style={{ marginLeft: 0, fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }} 
                        disabled={!isEditingTime}
                        checked={isDefer}
                        onChange={(e) => setIsDefer(e.target.checked)}
                    >
                        顺延
                    </Checkbox>
                 </div>

                 <Input
                   placeholder="输入调整分钟数"
                   value={adjustValue}
                   onChange={(e) => setAdjustValue(e.target.value)}
                   style={{
                     fontSize: '16px',
                     fontWeight: 600,
                     color: '#1890ff',
                     background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                     border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.15)',
                     borderRadius: INPUT_BORDER_RADIUS,
                     height: INPUT_HEIGHT
                   }}
                   addonAfter="分钟"
                   size="middle"
                   disabled={!isEditingTime}
                 />
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: 'auto' }}>
                    <Button type="primary" ghost size="middle" onClick={() => handleQuickAdjust('arrival')} disabled={!isEditingTime} style={{ fontSize: '12px', height: '32px', borderRadius: '6px', borderColor: '#D97706', color: '#D97706' }}>到点</Button>
                    <Button type="primary" ghost size="middle" onClick={() => handleQuickAdjust('departure')} disabled={!isEditingTime} style={{ fontSize: '12px', height: '32px', borderRadius: '6px', borderColor: '#D97706', color: '#D97706' }}>发点</Button>
                    <Button size="middle" onClick={() => handleQuickAdjust('checkInStart')} disabled={!isEditingTime} style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}>进开</Button>
                    <Button size="middle" onClick={() => handleQuickAdjust('checkInStop')} disabled={!isEditingTime} style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}>进停</Button>
                    <Button size="middle" onClick={() => handleQuickAdjust('exitStart')} disabled={!isEditingTime} style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}>出开</Button>
                    <Button size="middle" onClick={() => handleQuickAdjust('exitStop')} disabled={!isEditingTime} style={{ fontSize: '12px', height: '32px', borderRadius: '6px' }}>出停</Button>
                 </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
                <TimeAdjustRow label="实际到点" time={times.actualArrival} disabled={!isEditingTime} scheduledTime={trainInfo.arrival} onChange={(date: any) => handleTimeChange('actualArrival', date)} />
                <TimeAdjustRow label="实际发点" time={times.actualDeparture} disabled={!isEditingTime} scheduledTime={trainInfo.departure} onChange={(date: any) => handleTimeChange('actualDeparture', date)} />
                <TimeAdjustRow label="进站开检" time={times.checkInStart} disabled={!isEditingTime} scheduledTime={`${trainInfo.date} 16:22`} onChange={(date: any) => handleTimeChange('checkInStart', date)} />
                <TimeAdjustRow label="进站停检" time={times.checkInStop} disabled={!isEditingTime} scheduledTime={`${trainInfo.date} 16:31`} onChange={(date: any) => handleTimeChange('checkInStop', date)} />
                <TimeAdjustRow label="出站开检" time={times.exitStart} disabled={!isEditingTime} scheduledTime={`${trainInfo.date} 16:22`} onChange={(date: any) => handleTimeChange('exitStart', date)} />
                <TimeAdjustRow label="出站停检" time={times.exitStop} disabled={!isEditingTime} scheduledTime={`${trainInfo.date} 17:00`} onChange={(date: any) => handleTimeChange('exitStop', date)} />
              </div>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card 
            title={<span style={{ color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '14px', fontWeight: 600 }}>基本信息</span>} 
            bordered={false} 
            size="small" 
            bodyStyle={{ padding: CARD_PADDING }} 
            style={{ 
              ...getCardStyle(darkMode),
              height: '260px'
            }}
            extra={renderBatchSaveControl(basicInfoChanges, () => setBasicInfoChanges({}), () => setBasicInfoChanges({}))}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>始发站:</span>
                <BasicInfoInput field="origin" defaultValue="北京西" style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>终到站:</span>
                <BasicInfoInput field="destination" defaultValue="郑州东" style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>车型:</span>
                <BasicInfoInput field="trainModel" defaultValue="crh380" type="select" options={[{ value: "crh380", label: "CRH3800" }]} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>编组数:</span>
                <BasicInfoInput field="formation" defaultValue={train?.attributes.formation.toString() || '0'} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>编组方向:</span>
                <BasicInfoInput 
                  field="formationOrder"
                  defaultValue={train?.attributes.formationOrder || 'normal'} 
                  type="select"
                  options={[
                    { value: "normal", label: "正序" },
                    { value: "reverse", label: "倒序" }
                  ]}
                  style={{ flex: 1 }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>广播分组:</span>
                <BasicInfoInput field="broadcastGroup" defaultValue="xxxxx" type="select" options={[{ value: "xxxxx", label: "xxxxx" }]} style={{ flex: 1 }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ marginBottom: '12px', flex: '0 0 auto' }}>
        <Col span={24}>
          <Card 
            title={<span style={{ color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '14px', fontWeight: 600 }}>位置信息</span>} 
            bordered={false} 
            size="small" 
            bodyStyle={{ padding: CARD_PADDING }} 
            style={{ 
              ...getCardStyle(darkMode)
            }}
            extra={renderBatchSaveControl(locationInfoChanges, () => setLocationInfoChanges({}), () => setLocationInfoChanges({}))}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ ...getLabelStyle(darkMode), width: '50px', textAlign: 'right', marginBottom: 0 }}>股道:</span>
                <LocationInfoInput field="track" defaultValue="8" type="select" options={trackOptions} onChange={(val: string) => handleLocationChange('track', val)} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ ...getLabelStyle(darkMode), width: '50px', textAlign: 'right', marginBottom: 0 }}>站台:</span>
                <LocationInfoInput field="platform" defaultValue="8" type="select" options={platformOptions} onChange={(val: string) => handleLocationChange('platform', val)} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>候车室:</span>
                <LocationInfoInput field="waitingHall" defaultValue="high" type="select" options={[{ value: "high", label: "高架层候车大厅" }, { value: "normal", label: "普通候车室" }]} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>检票口:</span>
                <LocationInfoInput field="checkInGate" defaultValue="6b7b" type="select" options={[{ value: "6b7b", label: "6B_7B" }, { value: "1a1b", label: "1A_1B" }, { value: "2a2b", label: "2A_2B" }]} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ ...getLabelStyle(darkMode), width: '60px', textAlign: 'right', marginBottom: 0 }}>出站口:</span>
                <LocationInfoInput field="exitGate" defaultValue="a2" type="select" options={[{ value: "a2", label: "A2出站口" }, { value: "b1", label: "B1出站口" }]} style={{ flex: 1 }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Row gutter={12} style={{ height: '100%' }}>
           <Col span={5} style={{ height: '100%' }}>
             <Card 
              bordered={false} 
              bodyStyle={{ padding: '12px', height: '100%', overflow: 'auto' }} 
              style={{ ...getCardStyle(darkMode), height: '100%' }}
            >
            <div className="ops-btn-grid" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridAutoRows: 'minmax(36px, auto)',
              alignContent: 'start',
              gap: '6px',
              height: '100%'
            }}>
               <Button 
                 type="primary" 
                 block 
                 style={{ 
                   gridColumn: 'span 2', 
                   height: '40px', 
                   fontSize: '14px', 
                   fontWeight: 600, 
                   borderRadius: BUTTON_BORDER_RADIUS,
                   background: darkMode ? 'linear-gradient(135deg, #2A6B7C 0%, #1D4E5F 100%)' : 'linear-gradient(135deg, #2A6B7C 0%, #1D4E5F 100%)'
                 }}
               >
                 立即执行
               </Button>
               <Popconfirm title="确认执行进站开检？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>进站开检</Button>
               </Popconfirm>
               <Popconfirm title="确认执行进站停检？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>进站停检</Button>
               </Popconfirm>
               <Popconfirm title="确认执行出站开检？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>出站开检</Button>
               </Popconfirm>
               <Popconfirm title="确认执行出站停检？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>出站停检</Button>
               </Popconfirm>
               <Popconfirm title="确认执行列车到达？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>列车到达</Button>
               </Popconfirm>
               <Popconfirm title="确认执行列车离站？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>列车离站</Button>
               </Popconfirm>
               <Popconfirm title="确认发布预告？" okText="确认" cancelText="取消">
                 <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>预告</Button>
               </Popconfirm>
               <Button block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }} onClick={() => setIsLateUndeterminedModalVisible(true)}>晚点未定</Button>
               {isLateUndetermined && (
                 <Button 
                   block 
                   style={{ 
                     height: '36px', 
                     fontSize: '12px', 
                     borderRadius: '6px', 
                     backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', 
                     borderColor: '#EF4444', 
                     color: '#EF4444' 
                   }} 
                   onClick={() => setIsUndeterminedRecoveryModalVisible(true)}
                 >
                   未定恢复
                 </Button>
               )}
               <Popconfirm title="确认执行到停开？" okText="确认" cancelText="取消">
                 <Button danger block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>到停开</Button>
               </Popconfirm>
               <Popconfirm title="确认执行发停开？" okText="确认" cancelText="取消">
                 <Button danger block style={{ height: '36px', fontSize: '12px', borderRadius: '6px' }}>发停开</Button>
               </Popconfirm>
               <Popconfirm title={`确认${isCtcEnabled ? '停用' : '启用'}CTC？`} okText="确认" cancelText="取消" onConfirm={() => setIsCtcEnabled(!isCtcEnabled)}>
                 <Button 
                   block
                   style={{ 
                     gridColumn: 'span 2',
                     borderColor: isCtcEnabled ? '#10B981' : '#EF4444', 
                     color: isCtcEnabled ? '#10B981' : '#EF4444', 
                     background: isCtcEnabled ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4') : (darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2'), 
                     fontWeight: 600,
                     height: '36px',
                     fontSize: '12px',
                     borderRadius: '6px'
                   }} 
                 >
                   {isCtcEnabled ? 'CTC启用' : 'CTC停用'}
                 </Button>
               </Popconfirm>
            </div>
             </Card>
           </Col>

           <Col span={19} style={{ height: '100%' }}>
              <Card 
                bordered={false} 
                bodyStyle={{ padding: 0, height: '100%' }} 
                style={{ ...getCardStyle(darkMode), height: '100%', overflow: 'hidden' }}
              >
          <div className="full-height-tabs" style={{ height: '100%' }}>
            <Tabs 
              activeKey={activeTab || 'gate'} 
              onChange={onTabChange}
              style={{ height: '100%' }} 
              tabBarStyle={{ padding: '0 16px', margin: 0, borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.08)' }}
              items={[
                {
                  key: 'guide',
                  label: <span style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748B' }}>引导计划</span>,
                  children: (
                    <div style={{ padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* 引导计划过滤标签 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC', borderRadius: '8px', border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)' }}>
                          <Button 
                            type={guideFilter === 'all' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setGuideFilter('all')}
                            style={{ 
                              borderRadius: '6px',
                              background: guideFilter === 'all' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: guideFilter === 'all' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: guideFilter === 'all' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            全部 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{guideData.length}</Tag>
                          </Button>
                          <Button 
                            type={guideFilter === 'entrance' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setGuideFilter('entrance')}
                            style={{ 
                              borderRadius: '6px',
                              background: guideFilter === 'entrance' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: guideFilter === 'entrance' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: guideFilter === 'entrance' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            进站口 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{guideData.filter(item => item.area === 'entrance').length}</Tag>
                          </Button>
                          <Button 
                            type={guideFilter === 'waiting' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setGuideFilter('waiting')}
                            style={{ 
                              borderRadius: '6px',
                              background: guideFilter === 'waiting' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: guideFilter === 'waiting' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: guideFilter === 'waiting' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            候车室 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{guideData.filter(item => item.area === 'waiting').length}</Tag>
                          </Button>
                          <Button 
                            type={guideFilter === 'platform' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setGuideFilter('platform')}
                            style={{ 
                              borderRadius: '6px',
                              background: guideFilter === 'platform' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: guideFilter === 'platform' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: guideFilter === 'platform' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            站台 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{guideData.filter(item => item.area === 'platform').length}</Tag>
                          </Button>
                          <Button 
                            type={guideFilter === 'exit' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setGuideFilter('exit')}
                            style={{ 
                              borderRadius: '6px',
                              background: guideFilter === 'exit' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: guideFilter === 'exit' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: guideFilter === 'exit' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            出站口 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{guideData.filter(item => item.area === 'exit').length}</Tag>
                          </Button>
                        </div>
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<Save size={14} />}
                          onClick={handleSaveGuide}
                          disabled={!hasGuideChanges}
                          style={{ borderRadius: '6px', fontSize: '12px' }}
                        >
                          保存
                        </Button>
                      </div>
                      <Table 
                        columns={[
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>屏名称</span>, 
                            dataIndex: 'screenName', 
                            width: 200, 
                            render: (text: string, record: any) => (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                <span style={{ fontWeight: 500, color: darkMode ? '#E2E8F0' : '#1F2937' }}>{text}</span>
                                <Tag color={record.status === '正在执行' ? 'success' : 'default'} style={{ margin: 0 }}>{record.status}</Tag>
                              </div>
                            )
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>开始时间</span>, 
                            dataIndex: 'startTime', 
                            width: 90, 
                            render: (text: string) => {
                              const time = dayjs(text);
                              const isCrossDay = !time.isSame(dayjs('2026-02-03'), 'day');
                              return <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{time.format('HH:mm')}{isCrossDay && <sup style={{color: '#EF4444', marginLeft: 2}}>+1</sup>}</span>;
                            }
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>结束时间</span>, 
                            dataIndex: 'endTime', 
                            width: 90, 
                            render: (text: string) => {
                              const time = dayjs(text);
                              const isCrossDay = !time.isSame(dayjs('2026-02-03'), 'day');
                              return <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{time.format('HH:mm')}{isCrossDay && <sup style={{color: '#EF4444', marginLeft: 2}}>+1</sup>}</span>;
                            }
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>上屏模式</span>, 
                            dataIndex: 'upperMode', 
                            width: 80, 
                            align: 'center', 
                            render: (mode: string, record: any) => (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>{mode === 'manual' ? '手动' : '自动'}</span>
                                <Switch size="small" checked={mode === 'manual'} onChange={(checked) => handleGuideModeChange(record.key, 'upper', checked)} />
                              </div>
                            )
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>上屏信号</span>, 
                            dataIndex: 'upperSignal', 
                            width: 80, 
                            align: 'center', 
                            render: (text: string) => <span style={{ color: darkMode ? '#64748B' : '#94A3B8' }}>{text || '无'}</span> 
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>下屏模式</span>, 
                            dataIndex: 'lowerMode', 
                            width: 80, 
                            align: 'center', 
                            render: (mode: string, record: any) => (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>{mode === 'manual' ? '手动' : '自动'}</span>
                                <Switch size="small" checked={mode === 'manual'} onChange={(checked) => handleGuideModeChange(record.key, 'lower', checked)} />
                              </div>
                            )
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>下屏信号</span>, 
                            dataIndex: 'lowerSignal', 
                            width: 80, 
                            align: 'center', 
                            render: (text: string) => <span style={{ color: darkMode ? '#64748B' : '#94A3B8' }}>{text || '无'}</span> 
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>OCR识别</span>, 
                            dataIndex: 'ocrStatus', 
                            width: 80, 
                            align: 'center', 
                            render: (text: string, record: any) => {
                              if (!record.hasOcrSupport) {
                                return <span style={{ color: darkMode ? '#64748B' : '#94A3B8', fontSize: '12px' }}>不支持</span>;
                              }
                              return (
                                <Tag color={text === 'abnormal' ? 'error' : (text === 'normal' ? 'success' : 'default')}>
                                  {text === 'abnormal' ? '异常' : '正常'}
                                </Tag>
                              );
                            }
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>操作</span>, 
                            key: 'action', 
                            width: 160, 
                            align: 'center', 
                            render: (_, record: any) => (
                              <Space size="small">
                                <Button type="text" size="small" icon={<Link size={14} />} style={{ color: '#D97706' }} title="关联屏" />
                                <Button type="text" size="small" icon={<Play size={14} />} style={{ color: '#10B981' }} title="预览" onClick={() => { setSelectedGuideRecord(record); setGuidePreviewVisible(true); }} />
                                <Button type="text" size="small" icon={<RefreshCw size={14} />} style={{ color: '#3B82F6' }} title="回读" onClick={() => { setSelectedGuideRecord(record); setGuidePreviewVisible(true); }} />
                                <Button type="text" size="small" icon={<Square size={14} fill="currentColor" />} style={{ color: '#EF4444' }} title="停止执行" />
                                <Button type="text" size="small" icon={<FileText size={14} />} style={{ color: '#10B981' }} title="手动录入" onClick={() => handleManualCommand(record)} />
                              </Space>
                            )
                          },
                        ]}
                        dataSource={guideData.filter(item => guideFilter === 'all' ? true : item.area === guideFilter)}
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{ y: 400 }}
                        style={{ flex: 1 }}
                      />
                    </div>
                  )
                },
                {
                  key: 'broadcast',
                  label: <span style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748B' }}>广播计划</span>,
                  children: (
                    <div style={{ padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC', borderRadius: '8px', border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)' }}>
                          <Button 
                            type={broadcastFilter === 'all' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setBroadcastFilter('all')}
                            style={{ 
                              borderRadius: '6px',
                              background: broadcastFilter === 'all' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: broadcastFilter === 'all' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: broadcastFilter === 'all' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            全部 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{broadcastData.length}</Tag>
                          </Button>
                          <Button 
                            type={broadcastFilter === 'daily' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setBroadcastFilter('daily')}
                            style={{ 
                              borderRadius: '6px',
                              background: broadcastFilter === 'daily' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: broadcastFilter === 'daily' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: broadcastFilter === 'daily' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            日常广播 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{2}</Tag>
                          </Button>
                          <Button 
                            type={broadcastFilter === 'thematic' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setBroadcastFilter('thematic')}
                            style={{ 
                              borderRadius: '6px',
                              background: broadcastFilter === 'thematic' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : 'transparent',
                              borderColor: broadcastFilter === 'thematic' ? (darkMode ? '#2A6B7C' : '#2A6B7C') : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: broadcastFilter === 'thematic' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            专题广播 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px' }}>{1}</Tag>
                          </Button>
                          <Button 
                            type={broadcastFilter === 'conflict' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setBroadcastFilter('conflict')}
                            style={{ 
                              borderRadius: '6px',
                              background: broadcastFilter === 'conflict' ? '#EF4444' : 'transparent',
                              borderColor: broadcastFilter === 'conflict' ? '#EF4444' : (darkMode ? 'rgba(42, 107, 124, 0.35)' : 'rgba(29, 78, 95, 0.15)'),
                              color: broadcastFilter === 'conflict' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B'),
                              fontSize: '12px'
                            }}
                          >
                            冲突广播 <Tag style={{ marginLeft: '4px', marginRight: 0, fontSize: '10px', padding: '0 4px', height: '18px', lineHeight: '18px', background: broadcastFilter === 'conflict' ? 'rgba(255,255,255,0.2)' : (darkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2'), color: broadcastFilter === 'conflict' ? '#FFFFFF' : '#EF4444' }}>0</Tag>
                          </Button>
                        </div>
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<Save size={14} />}
                          onClick={handleSaveBroadcast}
                          disabled={!hasBroadcastChanges}
                          style={{ borderRadius: '6px', fontSize: '12px' }}
                        >
                          保存
                        </Button>
                      </div>
                      <Table 
                        columns={[
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>广播词名称</span>, 
                            dataIndex: 'content', 
                            render: (text: string, record: any) => (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 500, color: darkMode ? '#E2E8F0' : '#1F2937' }}>{text}</span>
                                <div><Tag color={record.status === '正在播放' ? 'success' : 'default'} style={{ margin: 0 }}>{record.status}</Tag></div>
                              </div>
                            )
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>播放时间</span>, 
                            dataIndex: 'startTime', 
                            width: 90, 
                            render: (text: string) => {
                              const time = dayjs(text);
                              const isCrossDay = !time.isSame(dayjs('2026-02-03'), 'day');
                              return <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{time.format('HH:mm')}{isCrossDay && <sup style={{color: '#EF4444', marginLeft: 2}}>+1</sup>}</span>;
                            }
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>播放次数</span>, 
                            dataIndex: 'playCount', 
                            width: 70, 
                            align: 'center', 
                            render: (text: number) => <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{text || 1}</span> 
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>触发信号</span>, 
                            dataIndex: 'triggerSignal', 
                            width: 80, 
                            align: 'center', 
                            render: (text: string) => <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>{text}</span> 
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>广播区域</span>, 
                            dataIndex: 'area', 
                            width: 120,
                            render: (text: string) => <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{text}</span>
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>播放模式</span>, 
                            dataIndex: 'mode', 
                            width: 80, 
                            align: 'center', 
                            render: (mode: string, record: any) => (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>{mode === 'manual' ? '手动' : '自动'}</span>
                                <Switch size="small" checked={mode === 'manual'} onChange={(checked) => handleBroadcastModeChange(record.key, checked)} />
                              </div>
                            )
                          },
                          { 
                            title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>操作</span>, 
                            key: 'action', 
                            width: 120, 
                            align: 'center', 
                            render: () => (
                              <Space size="small">
                                <Button type="text" size="small" icon={<Play size={14} />} style={{ color: '#D97706' }} title="立即执行" />
                                <Button type="text" size="small" icon={<Square size={14} fill="currentColor" />} style={{ color: '#EF4444' }} title="停止执行" />
                              </Space>
                            )
                          },
                        ]}
                        dataSource={broadcastData}
                        pagination={false}
                        size="small"
                        bordered
                        style={{ flex: 1, overflow: 'hidden' }}
                      />
                    </div>
                  )
                },
                {
                  key: 'gate',
                  label: <span style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748B' }}>CTC计划</span>,
                  children: (
                    <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '420px' }}>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            padding: '12px',
                            borderRadius: '8px',
                            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
                            border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
                          }}>
                            <span style={{ width: '60px', textAlign: 'right', fontSize: LABEL_FONT_SIZE, color: darkMode ? '#94A3B8' : '#64748B' }}>到点:</span>
                            <div style={{ 
                              flex: 1, 
                              background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF', 
                              border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.15)', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              fontSize: '14px', 
                              textAlign: 'center', 
                              fontWeight: 600, 
                              color: darkMode ? '#E2E8F0' : '#1F2937' 
                            }}>2025/5/30 12:47</div>
                            <span style={{ width: '40px', textAlign: 'right', fontSize: LABEL_FONT_SIZE, color: darkMode ? '#94A3B8' : '#64748B' }}>晚到:</span>
                            <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>+5</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            padding: '12px',
                            borderRadius: '8px',
                            background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
                            border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
                          }}>
                            <span style={{ width: '60px', textAlign: 'right', fontSize: LABEL_FONT_SIZE, color: darkMode ? '#94A3B8' : '#64748B' }}>发点:</span>
                            <div style={{ 
                              flex: 1, 
                              background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF', 
                              border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.15)', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              fontSize: '14px', 
                              textAlign: 'center', 
                              fontWeight: 600, 
                              color: darkMode ? '#E2E8F0' : '#1F2937' 
                            }}>2025/5/30 12:52</div>
                            <span style={{ width: '40px', textAlign: 'right', fontSize: LABEL_FONT_SIZE, color: darkMode ? '#94A3B8' : '#64748B' }}>晚发:</span>
                            <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>+5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </div>
              </Card>
           </Col>
        </Row>
      </div>

      {/* 引导屏预览 Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>
              {selectedGuideRecord?.screenName || '引导屏预览'}
            </span>
            <Tag color="success" style={{ margin: 0 }}>{selectedGuideRecord?.status || '正在执行'}</Tag>
          </div>
        }
        open={guidePreviewVisible}
        onCancel={() => setGuidePreviewVisible(false)}
        footer={null}
        width={500}
        bodyStyle={{ padding: '20px', background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F8FAFC' }}
        maskClosable
      >
        <div style={{ 
          background: darkMode ? '#1E293B' : '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#EF4444',
              textShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
              letterSpacing: '4px'
            }}>
              G{selectedGuideRecord ? Math.floor(Math.random() * 900 + 100) : '100'}
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: darkMode ? '#E2E8F0' : '#1F2937',
              marginTop: '8px',
              fontWeight: 500
            }}>
              即将到达
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            padding: '12px',
            background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#F0FDF4',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>到达站台</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#10B981' }}>8</div>
            </div>
            <div style={{ width: '1px', background: darkMode ? 'rgba(42, 107, 124, 0.3)' : '#E5E7EB' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>候车区域</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#10B981' }}>8B-9B</div>
            </div>
          </div>

          <div style={{ 
            fontSize: '13px', 
            color: darkMode ? '#94A3B8' : '#64748B', 
            textAlign: 'center',
            padding: '8px 0',
            borderTop: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid #E5E7EB'
          }}>
            请各位旅客注意安全,站在安全线内候车
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '16px',
          padding: '12px 16px',
          background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
          borderRadius: '8px',
          fontSize: '12px',
          color: darkMode ? '#94A3B8' : '#64748B'
        }}>
          <div>执行模式: <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{selectedGuideRecord?.upperMode === 'manual' ? '手动' : '自动'}</span></div>
          <div>上屏信号: <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{selectedGuideRecord?.upperSignal || '无'}</span></div>
          <div>下屏信号: <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{selectedGuideRecord?.lowerSignal || '无'}</span></div>
        </div>
      </Modal>
    </div>
  );
};

interface StationTrainInfoProps {
  trainId: string | null;
  darkMode?: boolean;
}

const StationTrainInfo: React.FC<StationTrainInfoProps> = ({ trainId, darkMode = false }) => {
  // 统一的卡片样式
  const getCardStyle = (darkMode: boolean): React.CSSProperties => ({
    borderRadius: '10px',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
    boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
  });

  return (
    <div style={{ 
      height: '100%', 
      overflow: 'auto', 
      padding: '16px 20px',
      background: darkMode ? '#0D1B2A' : '#FAF8F5'
    }}>
      <Card 
        title={<span style={{ color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '14px', fontWeight: 600 }}>站车信息</span>}
        bordered={false}
        style={getCardStyle(darkMode)}
        bodyStyle={{ padding: '14px 16px' }}
      >
        <div style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>站车信息内容</div>
      </Card>
    </div>
  );
};

interface OperationInfoProps {
  trainId: string | null;
  onDispose?: (trainId: string) => void;
  onDataChange?: () => void;
  darkMode?: boolean;
  onOpenOperationDetail?: () => void;
}

const OperationInfo: React.FC<OperationInfoProps> = ({ trainId, onDispose, onDataChange, darkMode = false, onOpenOperationDetail }) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);
  
  // 统一的卡片样式
  const getCardStyle = (darkMode: boolean): React.CSSProperties => ({
    borderRadius: '10px',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
    boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none'
  });

  // 作业卡片样式
  const getOperationCardStyle = (type: 'checkIn' | 'platform' | 'exit' | 'joint'): React.CSSProperties => {
    const colors = {
      checkIn: { bg: darkMode ? 'rgba(250, 204, 21, 0.15)' : '#FEF9C3', border: darkMode ? 'rgba(250, 204, 21, 0.3)' : '#FDE047', icon: '#EAB308' },
      platform: { bg: darkMode ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7', border: darkMode ? 'rgba(34, 197, 94, 0.3)' : '#86EFAC', icon: '#22C55E' },
      exit: { bg: darkMode ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE', border: darkMode ? 'rgba(59, 130, 246, 0.3)' : '#93C5FD', icon: '#3B82F6' },
      joint: { bg: darkMode ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF', border: darkMode ? 'rgba(168, 85, 247, 0.3)' : '#D8B4FE', icon: '#A855F7' }
    };
    
    return {
      padding: '16px',
      borderRadius: '10px',
      background: colors[type].bg,
      border: `1px solid ${colors[type].border}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      height: '100%',
      userSelect: 'none'
    };
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('双击作业卡片，trainId:', trainId);
    if (onOpenOperationDetail) {
      onOpenOperationDetail();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('单击作业卡片，trainId:', trainId);
    if (onOpenOperationDetail) {
      onOpenOperationDetail();
    }
  };

  if (!train) {
    return (
      <div style={{ 
        height: '100%', 
        overflow: 'auto', 
        padding: '16px 20px',
        background: darkMode ? '#0D1B2A' : '#FAF8F5'
      }}>
        <div style={{ color: darkMode ? '#94A3B8' : '#64748B', textAlign: 'center', paddingTop: '40px' }}>
          请选择车次查看作业信息
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      overflow: 'auto', 
      padding: '16px 20px',
      background: darkMode ? '#0D1B2A' : '#FAF8F5'
    }}>
      <Card 
        title={<span style={{ color: darkMode ? '#E2E8F0' : '#1F2937', fontSize: '14px', fontWeight: 600 }}>作业信息</span>}
        bordered={false}
        style={getCardStyle(darkMode)}
        bodyStyle={{ padding: '14px 16px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {/* 检票作业卡片 */}
          <div 
            style={getOperationCardStyle('checkIn')}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Ticket size={18} color="#EAB308" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>检票作业</span>
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
              计划: {train.operations.checkIn.plannedCount}人 | 实际: {train.operations.checkIn.actualCount}人
            </div>
            <div style={{ marginTop: '8px' }}>
              <Tag color={train.operations.checkIn.status === 'completed' ? 'success' : train.operations.checkIn.status === 'active' ? 'processing' : 'default'}>
                {train.operations.checkIn.status === 'completed' ? '已完成' : train.operations.checkIn.status === 'active' ? '进行中' : '待开始'}
              </Tag>
            </div>
          </div>

          {/* 站台作业卡片 */}
          <div 
            style={getOperationCardStyle('platform')}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Train size={18} color="#22C55E" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>站台作业</span>
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
              计划: {train.operations.platform.plannedCount}人 | 实际: {train.operations.platform.actualCount}人
            </div>
            <div style={{ marginTop: '8px' }}>
              <Tag color={train.operations.platform.status === 'completed' ? 'success' : train.operations.platform.status === 'active' ? 'processing' : 'default'}>
                {train.operations.platform.status === 'completed' ? '已完成' : train.operations.platform.status === 'active' ? '进行中' : '待开始'}
              </Tag>
            </div>
          </div>

          {/* 出站作业卡片 */}
          <div 
            style={getOperationCardStyle('exit')}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DoorOpen size={18} color="#3B82F6" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>出站作业</span>
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
              计划: {train.operations.exit.plannedCount}人 | 实际: {train.operations.exit.actualCount}人
            </div>
            <div style={{ marginTop: '8px' }}>
              <Tag color={train.operations.exit.status === 'completed' ? 'success' : train.operations.exit.status === 'active' ? 'processing' : 'default'}>
                {train.operations.exit.status === 'completed' ? '已完成' : train.operations.exit.status === 'active' ? '进行中' : '待开始'}
              </Tag>
            </div>
          </div>

          {/* 结合部作业卡片 */}
          <div 
            style={getOperationCardStyle('joint')}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Link size={18} color="#A855F7" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>结合部作业</span>
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B' }}>
              上水: {train.tags.water ? '需要' : '不需要'} | 吸污: {train.tags.sewage ? '需要' : '不需要'}
            </div>
            <div style={{ marginTop: '8px' }}>
              <Tag color={train.tags.water || train.tags.sewage ? 'processing' : 'default'}>
                {train.tags.water || train.tags.sewage ? '有作业' : '无作业'}
              </Tag>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12px', color: darkMode ? '#64748B' : '#9CA3AF', textAlign: 'center' }}>
          双击任意作业卡片查看作业详情
        </div>
      </Card>
    </div>
  );
};

interface TagLogProps {
  darkMode?: boolean;
}

const TagLog: React.FC<TagLogProps> = ({ darkMode = false }) => {
  return (
    <div style={{ 
      padding: '16px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      boxSizing: 'border-box',
      background: darkMode ? '#0D1B2A' : '#FAF8F5'
    }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Table 
            columns={[
              { title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>IP地址</span>, dataIndex: 'ip', width: 120 },
              { 
                title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>模块</span>, 
                dataIndex: 'module', 
                width: 100,
                filters: [
                  { text: '客户端', value: '客户端' },
                  { text: '广播', value: '广播' },
                  { text: '引导', value: '引导' },
                  { text: '闸机', value: '闸机' },
                  { text: '作业', value: '作业' },
                  { text: '风险', value: '风险' },
                ],
                onFilter: (value: any, record: any) => record.module === value,
                render: (text: string) => {
                  const colors: Record<string, string> = {
                    '客户端': 'blue',
                    '广播': 'cyan',
                    '引导': 'green',
                    '闸机': 'orange',
                    '作业': 'purple',
                    '风险': 'red',
                  };
                  return <Tag color={colors[text] || 'default'}>{text}</Tag>;
                }
              },
              { title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>内容</span>, dataIndex: 'content', render: (text: string) => <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{text}</span> },
              { title: <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>时间</span>, dataIndex: 'time', width: 160 },
            ]}
            dataSource={[
              { key: '1', ip: '192.168.1.101', module: '客户端', content: '修改晚点时间为 5分钟', time: '2026-02-03 10:00:01' },
              { key: '2', ip: '192.168.1.205', module: '广播', content: '手动触发到站广播', time: '2026-02-03 09:58:22' },
              { key: '3', ip: '192.168.1.112', module: '作业', content: '综控员确认上水作业完成', time: '2026-02-03 09:55:00' },
              { key: '4', ip: '192.168.1.55', module: '闸机', content: '检票口6B开启检票', time: '2026-02-03 09:40:00' },
            ]}
            pagination={false}
            size="small"
            bordered
            scroll={{ y: 'calc(100% - 40px)' }}
            style={{ height: '100%' }}
          />
        </div>
      </div>

      {/* 引导屏预览 Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>
              {selectedGuideRecord?.screenName || '引导屏预览'}
            </span>
            <Tag color="success" style={{ margin: 0 }}>{selectedGuideRecord?.status || '正在执行'}</Tag>
          </div>
        }
        open={guidePreviewVisible}
        onCancel={() => setGuidePreviewVisible(false)}
        footer={null}
        width={500}
        bodyStyle={{ padding: '20px', background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F8FAFC' }}
        maskClosable
      >
        <div style={{ 
          background: darkMode ? '#1E293B' : '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#EF4444',
              textShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
              letterSpacing: '4px'
            }}>
              G{selectedGuideRecord ? Math.floor(Math.random() * 900 + 100) : '100'}
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: darkMode ? '#E2E8F0' : '#1F2937',
              marginTop: '8px',
              fontWeight: 500
            }}>
              即将到达
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            padding: '12px',
            background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#F0FDF4',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>到达站台</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#10B981' }}>8</div>
            </div>
            <div style={{ width: '1px', background: darkMode ? 'rgba(42, 107, 124, 0.3)' : '#E5E7EB' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>候车区域</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#10B981' }}>8B-9B</div>
            </div>
          </div>

          <div style={{ 
            fontSize: '13px', 
            color: darkMode ? '#94A3B8' : '#64748B', 
            textAlign: 'center',
            padding: '8px 0',
            borderTop: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid #E5E7EB'
          }}>
            请各位旅客注意安全,站在安全线内候车
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '16px',
          padding: '12px 16px',
          background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
          borderRadius: '8px',
          fontSize: '12px',
          color: darkMode ? '#94A3B8' : '#64748B'
        }}>
          <div>执行模式: <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{selectedGuideRecord?.upperMode === 'manual' ? '手动' : '自动'}</span></div>
          <div>上屏信号: <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{selectedGuideRecord?.upperSignal || '无'}</span></div>
          <div>下屏信号: <span style={{ color: darkMode ? '#E2E8F0' : '#1F2937' }}>{selectedGuideRecord?.lowerSignal || '无'}</span></div>
        </div>
      </Modal>
    </div>
  );
};
