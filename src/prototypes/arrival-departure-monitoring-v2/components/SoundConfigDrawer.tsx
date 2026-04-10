import React, { useState, useEffect, useRef } from 'react';
import { Checkbox, Input, Button, List } from 'antd';
import { X, Bell, Volume2, VolumeX, Save } from 'lucide-react';
import dayjs from 'dayjs';
import { mockTrainSchedules, getOperationDetails, summarizeOperations } from '../mock-data';

const DRAWER_WIDTH = 560;
const HEADER_PADDING = '14px 20px';
const CONTENT_PADDING = '16px 20px';

interface SoundConfig {
  neighborStationDeparture: boolean;
  dutyPreview: boolean;
  dutyNotStartedAlarm: boolean;
  earlyThreshold: number;
  lateThreshold: number;
  forwardStations: string;
}

interface SoundConfigDrawerProps {
  visible: boolean;
  onClose: () => void;
  darkMode?: boolean;
  dataVersion?: number;
  onMessageClick?: (trainNo: string) => void;
}

const defaultConfig: SoundConfig = {
  neighborStationDeparture: true,
  dutyPreview: false,
  dutyNotStartedAlarm: true,
  earlyThreshold: 20,
  lateThreshold: 30,
  forwardStations: '巴南|迎龙,珞璜南,统景,南彭、庙坝、武隆南',
};

export const SoundConfigDrawer: React.FC<SoundConfigDrawerProps> = ({
  visible,
  onClose,
  darkMode = false,
  dataVersion,
  onMessageClick
}) => {
  const [config, setConfig] = useState<SoundConfig>(defaultConfig);
  const [isMuted, setIsMuted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      const saved = localStorage.getItem('soundConfig');
      if (saved) {
        setConfig({ ...defaultConfig, ...JSON.parse(saved) });
      } else {
        setConfig(defaultConfig);
      }
    }
  }, [visible]);

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

  const handleSave = () => {
    localStorage.setItem('soundConfig', JSON.stringify(config));
    onClose();
  };

  const abnormalMessages = React.useMemo(() => {
    const messages: { id: string; trainNo: string; time: string; fullTime: dayjs.Dayjs; content: string }[] = [];
    
    mockTrainSchedules.forEach((train) => {
      const details = getOperationDetails(train);
      const summary = summarizeOperations(details);
      const abnormalParts: string[] = [];

      if (summary.checkIn.status === 'alarm') abnormalParts.push('检票口');
      if (summary.platform.status === 'alarm') abnormalParts.push('站台');
      if (summary.exit.status === 'alarm') abnormalParts.push('出站口');
      if (summary.water.status === 'alarm') abnormalParts.push('上水');

      if (abnormalParts.length > 0) {
        let timeObj = dayjs(train.arrival.time, 'HH:mm');
        const now = dayjs();
        if (timeObj.hour() < 4 && now.hour() > 20) {
          timeObj = timeObj.add(1, 'day');
        }
        
        const stationName = train.runningSection?.to || '成都东';
        
        abnormalParts.forEach((position) => {
          messages.push({
            id: `${train.id}_${position}`,
            trainNo: train.trainNo,
            time: train.arrival.time,
            fullTime: timeObj,
            content: `${stationName}站${train.trainNo}${position}：未到岗`
          });
        });
      }
    });
    
    return messages.sort((a, b) => a.fullTime.valueOf() - b.fullTime.valueOf());
  }, [dataVersion]);

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
    gap: '8px',
    paddingLeft: '8px',
    borderLeft: '3px solid #1890ff'
  });

  const getCloseButtonStyle = (): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    color: darkMode ? '#94A3B8' : '#64748B',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  });

  const checkboxStyle = {
    color: darkMode ? '#E2E8F0' : '#4B5563',
    fontSize: '14px',
  };

  const inputStyle = {
    background: darkMode ? '#1E293B' : '#FFFFFF',
    border: darkMode ? '1px solid #334155' : '1px solid rgba(29, 78, 95, 0.2)',
    color: darkMode ? '#F8FAFC' : '#0F172A',
    borderRadius: '6px',
  };

  return (
    <div style={getContainerStyle()} ref={drawerRef}>
      <div style={getHeaderStyle()}>
        <div style={getTitleStyle()}>
          <Bell size={20} />
          <span>声音与消息设置</span>
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

      <div style={{ padding: CONTENT_PADDING, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 配置面板 - 组合在一起，紧凑布局 */}
        <div style={{
          background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
          borderRadius: '8px',
          padding: '12px 16px',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)'
        }}>
          {/* 声音设置 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>声音设置</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Checkbox
                checked={config.neighborStationDeparture}
                onChange={(e) => setConfig({ ...config, neighborStationDeparture: e.target.checked })}
                style={checkboxStyle}
              >
                邻站发车
              </Checkbox>
              <Checkbox
                checked={config.dutyPreview}
                onChange={(e) => setConfig({ ...config, dutyPreview: e.target.checked })}
                style={checkboxStyle}
              >
                出务预告
              </Checkbox>
              <Checkbox
                checked={config.dutyNotStartedAlarm}
                onChange={(e) => setConfig({ ...config, dutyNotStartedAlarm: e.target.checked })}
                style={checkboxStyle}
              >
                未出务警报
              </Checkbox>
            </div>
          </div>

          {/* 时间范围设置 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>重新派班时间范围（分钟）</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...checkboxStyle, whiteSpace: 'nowrap', fontSize: '13px' }}>早点大于</span>
                <Input
              type="number"
              value={config.earlyThreshold}
              onChange={(e) => setConfig({ ...config, earlyThreshold: parseInt(e.target.value) || 0 })}
              style={{ ...inputStyle, width: '70px', fontSize: '16px', fontWeight: 600 }}
            />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...checkboxStyle, whiteSpace: 'nowrap', fontSize: '13px' }}>晚点大于</span>
                <Input
              type="number"
              value={config.lateThreshold}
              onChange={(e) => setConfig({ ...config, lateThreshold: parseInt(e.target.value) || 0 })}
              style={{ ...inputStyle, width: '70px', fontSize: '16px', fontWeight: 600 }}
            />
              </div>
            </div>
          </div>

          {/* 前方站设置 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>前方站设置</span>
            </div>
            <Input.TextArea
              value={config.forwardStations}
              onChange={(e) => setConfig({ ...config, forwardStations: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: 'none', fontSize: '16px', fontWeight: 600 }}
              placeholder="请输入前方站名称，多个站点用逗号或顿号分隔"
            />
          </div>

          {/* 保存按钮 */}
          <Button 
            type="primary"
            block
            icon={<Save size={16} />}
            onClick={handleSave}
            style={{ 
              height: '36px', 
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
              border: 'none',
              boxShadow: '0 2px 4px rgba(29, 78, 95, 0.15)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            保存配置
          </Button>
        </div>

        {/* 异常消息面板 - 高度自适应剩余空间 */}
        <div style={{
          background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.9)',
          borderRadius: '8px',
          padding: '0',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.5)' : '1px solid rgba(29, 78, 95, 0.2)',
          overflow: 'hidden',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 标题栏 */}
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.4)' : 'rgba(29, 78, 95, 0.12)',
            padding: '10px 16px',
            borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>作业异常消息</span>
            <div 
              style={{ marginLeft: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: darkMode ? '#94A3B8' : '#6B7280' }} 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span style={{ fontSize: '12px' }}>{isMuted ? '已静音' : '未静音'}</span>
            </div>
          </div>
          
          {/* 数据区域 - 自适应高度 */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.03)'
          }}>
            {abnormalMessages.length > 0 ? (
              <List
                size="small"
                dataSource={abnormalMessages}
                renderItem={(item, index) => (
                  <List.Item 
                    style={{ 
                      padding: '10px 12px', 
                      marginBottom: index < abnormalMessages.length - 1 ? '8px' : '0',
                      background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
                      border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      onMessageClick?.(item.trainNo);
                      onClose();
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: darkMode ? '#E2E8F0' : '#1D4E5F' }}>{item.trainNo}</span>
                        <span style={{ color: darkMode ? '#64748B' : '#9CA3AF', fontSize: '12px' }}>{item.time}</span>
                      </div>
                      <div style={{ color: darkMode ? '#94A3B8' : '#6B7280', fontSize: '13px' }}>{item.content}</div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: darkMode ? '#94A3B8' : '#6B7280' }}>
                暂无异常消息
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
