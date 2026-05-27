import React, { useState, useRef, useEffect } from 'react';
import { Button, DatePicker, Tabs, message, Select } from 'antd';
import { X, Layers, Play, Square, Clock, Save, TrainFront } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DRAWER_WIDTH = 560;
const HEADER_PADDING = '14px 20px';
const CONTENT_PADDING = '16px 20px';
const CARD_BORDER_RADIUS = '10px';
const BUTTON_BORDER_RADIUS = '8px';

type SceneMode = 'special' | 'emergency' | 'delay';
type SpecialTransportStatus = 'stopped' | 'auto-running' | 'manual-running';

interface SceneModeDrawerProps {
  visible: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const SceneModeDrawer: React.FC<SceneModeDrawerProps> = ({
  visible,
  onClose,
  darkMode = false
}) => {
  const [activeMode, setActiveMode] = useState<SceneMode>('special');
  const [specialStatus, setSpecialStatus] = useState<SpecialTransportStatus>('stopped');
  const [autoTimeRange, setAutoTimeRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [manualStatus, setManualStatus] = useState<'stopped' | 'running'>('stopped');
  const drawerRef = useRef<HTMLDivElement>(null);

  const [selectedTrains, setSelectedTrains] = useState<string[]>([]);
  const [trainSearchValue, setTrainSearchValue] = useState('');

  const mockTrainList = [
    { trainNumber: 'G101', destination: '北京南', departureTime: '08:30' },
    { trainNumber: 'G102', destination: '上海虹桥', departureTime: '09:15' },
    { trainNumber: 'G103', destination: '广州南', departureTime: '10:00' },
    { trainNumber: 'G201', destination: '深圳北', departureTime: '11:30' },
    { trainNumber: 'G202', destination: '武汉', departureTime: '12:45' },
    { trainNumber: 'G301', destination: '成都东', departureTime: '14:00' },
    { trainNumber: 'G302', destination: '重庆北', departureTime: '15:20' },
    { trainNumber: 'G401', destination: '西安北', departureTime: '16:30' },
    { trainNumber: 'D102', destination: '杭州东', departureTime: '08:00' },
    { trainNumber: 'D201', destination: '南京南', departureTime: '09:45' },
    { trainNumber: 'K101', destination: '长沙', departureTime: '10:30' },
    { trainNumber: 'Z201', destination: '郑州', departureTime: '11:00' },
  ];

  // 点击外部关闭抽屉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // 处理自动模式保存
  const handleAutoModeSave = () => {
    if (!autoTimeRange || !autoTimeRange[0] || !autoTimeRange[1]) {
      message.warning('请选择起止时间');
      return;
    }
    
    const startTime = autoTimeRange[0].format('YYYY/MM/DD HH:mm');
    const endTime = autoTimeRange[1].format('YYYY/MM/DD HH:mm');
    
    setSpecialStatus('auto-running');
    message.success(`已保存自动模式配置：${startTime} 至 ${endTime}`);
  };

  // 处理手动启动
  const handleManualStart = () => {
    setManualStatus('running');
    setSpecialStatus('manual-running');
    message.success('专运模式已手动启动');
  };

  // 处理手动停止
  const handleManualStop = () => {
    setManualStatus('stopped');
    setSpecialStatus('stopped');
    message.info('专运模式已停止');
  };

  // 处理按车次启动专运
  const handleTrainBasedStart = () => {
    if (selectedTrains.length === 0) {
      message.warning('请选择要启动专运的车次');
      return;
    }
    
    const trainNames = selectedTrains.join('、');
    setSpecialStatus('manual-running');
    message.success(`已为以下车次启动专运模式：${trainNames}`);
  };

  // 车次模糊搜索过滤
  const filterTrains = (input: string, option: any) => {
    const searchLower = input.toLowerCase();
    const trainNumber = option.value?.toLowerCase() || '';
    const destination = option.label?.props?.destination?.toLowerCase() || '';
    return trainNumber.includes(searchLower) || destination.includes(searchLower);
  };

  // 获取状态显示文本
  const getStatusText = () => {
    switch (specialStatus) {
      case 'auto-running':
        return '自动运行中';
      case 'manual-running':
        return '手动运行中';
      default:
        return '未启动';
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (specialStatus) {
      case 'auto-running':
        return darkMode ? '#60A5FA' : '#3B82F6';
      case 'manual-running':
        return darkMode ? '#34D399' : '#10B981';
      default:
        return darkMode ? '#94A3B8' : '#6B7280';
    }
  };

  if (!visible) return null;

  const getContainerStyle = (): React.CSSProperties => ({
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
  });

  const getHeaderStyle = (): React.CSSProperties => ({
    padding: HEADER_PADDING,
    borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
  });

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: '17px',
    fontWeight: 600,
    color: darkMode ? '#E2E8F0' : '#1F2937',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: '12px',
    borderLeft: '3px solid #2A6B7C'
  });

  const getCloseButtonStyle = (): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: darkMode ? '#94A3B8' : '#64748B',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  });

  const getCardStyle = (): React.CSSProperties => ({
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    borderRadius: CARD_BORDER_RADIUS,
    padding: '20px',
    marginBottom: '16px',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)',
    boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(29, 78, 95, 0.08)'
  });

  const getTagStyle = (isActive: boolean = false): React.CSSProperties => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    background: isActive 
      ? (darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.1)')
      : (darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.06)'),
    color: darkMode ? '#5DA3B3' : '#1D4E5F',
    border: `1px solid ${darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.15)'}`,
    marginBottom: '16px'
  });

  const tabItems = [
    {
      key: 'special',
      label: '专运模式',
      children: (
        <div style={{ paddingTop: '8px' }}>
          {/* 状态指示器 */}
          <div style={{
            ...getCardStyle(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getStatusColor(),
                boxShadow: `0 0 8px ${getStatusColor()}`
              }} />
              <span style={{ fontSize: '14px', color: darkMode ? '#E2E8F0' : '#374151', fontWeight: 500 }}>
                当前状态
              </span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: getStatusColor() }}>
              {getStatusText()}
            </span>
          </div>

          {/* 自动模式卡片 */}
          <div style={getCardStyle()}>
            <div style={getTagStyle(true)}>自动模式</div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '13px', 
                color: darkMode ? '#94A3B8' : '#64748B', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={14} />
                起止时间
              </div>
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY/MM/DD HH:mm"
                value={autoTimeRange}
                onChange={(dates) => setAutoTimeRange(dates as [Dayjs | null, Dayjs | null])}
                style={{
                  width: '100%',
                  height: '40px',
                  fontSize: '15px',
                  fontWeight: 600,
                  background: darkMode ? 'rgba(42, 107, 124, 0.1)' : '#f9fafb',
                  border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.2)',
                  borderRadius: '8px'
                }}
                placeholder={['开始时间', '结束时间']}
              />
            </div>

            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleAutoModeSave}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: BUTTON_BORDER_RADIUS,
                background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
                border: 'none',
                boxShadow: '0 2px 4px rgba(29, 78, 95, 0.2)',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              保存
            </Button>
          </div>

          {/* 手动模式卡片 */}
          <div style={getCardStyle()}>
            <div style={getTagStyle(true)}>手动模式</div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                size="large"
                onClick={handleManualStart}
                disabled={manualStatus === 'running'}
                style={{
                  flex: 1,
                  height: '56px',
                  borderRadius: BUTTON_BORDER_RADIUS,
                  background: manualStatus === 'running' 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5')
                    : (darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5'),
                  border: `1px solid ${manualStatus === 'running'
                    ? (darkMode ? 'rgba(16, 185, 129, 0.4)' : '#6EE7B7')
                    : (darkMode ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0')}`,
                  color: darkMode ? '#34D399' : '#059669',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Play size={18} fill={manualStatus === 'running' ? '#34D399' : '#059669'} />
                {manualStatus === 'running' ? '已启动' : '启动'}
              </Button>

              <Button
                size="large"
                onClick={handleManualStop}
                disabled={manualStatus === 'stopped'}
                style={{
                  flex: 1,
                  height: '56px',
                  borderRadius: BUTTON_BORDER_RADIUS,
                  background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                  border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'}`,
                  color: darkMode ? '#F87171' : '#DC2626',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: manualStatus === 'stopped' ? 0.5 : 1
                }}
              >
                <Square size={18} fill={darkMode ? '#F87171' : '#DC2626'} />
                停止
              </Button>
            </div>
          </div>

          {/* 按车次启动专运卡片 */}
          <div style={getCardStyle()}>
            <div style={getTagStyle(true)}>按车次启动</div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '13px', 
                color: darkMode ? '#94A3B8' : '#64748B', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <TrainFront size={14} />
                选择车次（支持多选和模糊搜索）
              </div>
              <Select
                mode="multiple"
                placeholder="输入车次号或目的地进行搜索"
                value={selectedTrains}
                onChange={setSelectedTrains}
                onSearch={setTrainSearchValue}
                onInputKeyDown={(e) => {
                  if (e.key === 'Enter' && trainSearchValue) {
                    const matchingTrain = mockTrainList.find(
                      t => t.trainNumber.toLowerCase().includes(trainSearchValue.toLowerCase()) ||
                           t.destination.toLowerCase().includes(trainSearchValue.toLowerCase())
                    );
                    if (matchingTrain && !selectedTrains.includes(matchingTrain.trainNumber)) {
                      setSelectedTrains([...selectedTrains, matchingTrain.trainNumber]);
                      setTrainSearchValue('');
                    }
                  }
                }}
                filterOption={filterTrains}
                showSearch
                allowClear
                style={{
                  width: '100%',
                  fontSize: '14px'
                }}
                styles={{
                  popup: {
                    maxHeight: '300px'
                  }
                }}
                maxTagCount={3}
                maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}个车次`}
              >
                {mockTrainList.map((train) => (
                  <Option 
                    key={train.trainNumber} 
                    value={train.trainNumber}
                    destination={train.destination}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '2px 0'
                    }}>
                      <span style={{ fontWeight: 600 }}>{train.trainNumber}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: darkMode ? '#94A3B8' : '#64748B',
                        marginLeft: '12px'
                      }}>
                        {train.destination} · {train.departureTime}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {selectedTrains.length > 0 && (
              <div style={{
                padding: '10px 12px',
                background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
                borderRadius: '8px',
                marginBottom: '12px',
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: darkMode ? '#94A3B8' : '#64748B',
                  marginBottom: '6px'
                }}>
                  已选择 {selectedTrains.length} 个车次：
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px' 
                }}>
                  {selectedTrains.map((trainNum) => {
                    const train = mockTrainList.find(t => t.trainNumber === trainNum);
                    return (
                      <div 
                        key={trainNum}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: darkMode ? 'rgba(42, 107, 124, 0.2)' : 'rgba(29, 78, 95, 0.08)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: darkMode ? '#E2E8F0' : '#1F2937'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{trainNum}</span>
                        {train && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: darkMode ? '#94A3B8' : '#6B7280' 
                          }}>
                            {train.destination}
                          </span>
                        )}
                        <span
                          onClick={() => setSelectedTrains(selectedTrains.filter(t => t !== trainNum))}
                          style={{
                            cursor: 'pointer',
                            marginLeft: '4px',
                            color: darkMode ? '#F87171' : '#DC2626',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              type="primary"
              icon={<Play size={16} />}
              onClick={handleTrainBasedStart}
              disabled={selectedTrains.length === 0}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: BUTTON_BORDER_RADIUS,
                background: selectedTrains.length > 0
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.15)',
                border: 'none',
                boxShadow: selectedTrains.length > 0 
                  ? '0 2px 4px rgba(16, 185, 129, 0.3)' 
                  : 'none',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {selectedTrains.length > 0 
                ? `为 ${selectedTrains.length} 个车次启动专运` 
                : '启动专运'}
            </Button>
          </div>

          {/* 说明文字 */}
          <div style={{
            padding: '12px 16px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: darkMode ? '#94A3B8' : '#64748B',
              lineHeight: '1.6'
            }}>
              专运模式下，系统将启用特定的上下屏显示规则和广播规则。支持三种启动方式：自动模式在设定时间范围内自动运行，手动模式一键全量启动，按车次启动可针对特定车次精准启用专运。
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'emergency',
      label: '应急模式',
      children: (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center',
          color: darkMode ? '#94A3B8' : '#64748B'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={28} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
          </div>
          <p style={{ fontSize: '14px', margin: 0 }}>应急模式配置开发中...</p>
        </div>
      )
    },
    {
      key: 'delay',
      label: '大面积晚点模式',
      children: (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center',
          color: darkMode ? '#94A3B8' : '#64748B'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={28} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
          </div>
          <p style={{ fontSize: '14px', margin: 0 }}>大面积晚点模式配置开发中...</p>
        </div>
      )
    }
  ];

  return (
    <div style={getContainerStyle()} ref={drawerRef}>
      {/* 头部 */}
      <div style={getHeaderStyle()}>
        <div style={getTitleStyle()}>
          <Layers size={20} />
          <span>情景模式</span>
        </div>
        <div 
          style={getCloseButtonStyle()} 
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(42, 107, 124, 0.25)' : '#E5E7EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF';
          }}
        >
          <X size={18} />
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ 
        padding: CONTENT_PADDING, 
        flex: 1, 
        overflowY: 'auto',
        background: darkMode ? 'transparent' : 'transparent'
      }}>
        <Tabs
          activeKey={activeMode}
          onChange={(key) => setActiveMode(key as SceneMode)}
          items={tabItems}
          style={{
            '.ant-tabs-nav': {
              marginBottom: '16px'
            },
            '.ant-tabs-tab': {
              color: darkMode ? '#94A3B8' : '#64748B'
            },
            '.ant-tabs-tab-active': {
              color: darkMode ? '#5DA3B3' : '#1D4E5F'
            },
            '.ant-tabs-ink-bar': {
              background: '#2A6B7C'
            }
          }}
        />
      </div>
    </div>
  );
};
