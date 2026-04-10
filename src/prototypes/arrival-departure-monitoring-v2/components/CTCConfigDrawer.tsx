import React, { useState, useRef, useEffect } from 'react';
import { Button, Radio, Input, List, Tabs, Switch } from 'antd';
import { Save, X, Zap, Lock, Unlock, CheckCircle, XCircle } from 'lucide-react';

const DRAWER_WIDTH = 580;
const HEADER_PADDING = '16px 24px';
const CONTENT_PADDING = '20px 24px';
const CARD_BORDER_RADIUS = '12px';
const BUTTON_BORDER_RADIUS = '8px';

interface CTCConfigDrawerProps {
  visible: boolean;
  onClose: () => void;
  darkMode?: boolean;
  onSave?: (config: {
    ctcStatus: 'auto' | 'manual';
    password: string;
    selectedTracks: string[];
    selectedStations: string[];
  }) => void;
}

export const CTCConfigDrawer: React.FC<CTCConfigDrawerProps> = ({
  visible,
  onClose,
  darkMode = false,
  onSave
}) => {
  const [ctcStatus, setCtcStatus] = useState<'auto' | 'semi' | 'manual'>('auto');
  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>(['all']);
  const [selectedStations, setSelectedStations] = useState<string[]>(['all']);
  const [isLocked, setIsLocked] = useState(true); // 默认锁定状态
  const [showPasswordInput, setShowPasswordInput] = useState(false); // 是否显示密码输入框
  const [viewMode, setViewMode] = useState<'track' | 'station'>('track'); // 股道/站场切换模式
  const drawerRef = useRef<HTMLDivElement>(null);

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

  const handleTrackSelect = (track: string) => {
    if (isLocked) return; // 锁定状态下不可操作
    
    if (track === 'all') {
      setSelectedTracks(['all']);
    } else {
      const newSelection = selectedTracks.filter(t => t !== 'all');
      if (selectedTracks.includes(track)) {
        const filtered = newSelection.filter(t => t !== track);
        setSelectedTracks(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setSelectedTracks([...newSelection, track]);
      }
    }
  };

  const handleStationSelect = (station: string) => {
    if (isLocked) return; // 锁定状态下不可操作
    
    if (station === 'all') {
      setSelectedStations(['all']);
    } else {
      const newSelection = selectedStations.filter(s => s !== 'all');
      if (selectedStations.includes(station)) {
        const filtered = newSelection.filter(s => s !== station);
        setSelectedStations(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setSelectedStations([...newSelection, station]);
      }
    }
  };

  const handleSave = () => {
    onSave?.({
      ctcStatus,
      password,
      selectedTracks,
      selectedStations
    });
    onClose();
  };

  const handleStopAll = () => {
    if (isLocked) return; // 锁定状态下不可操作
    
    // 批量停止所有车次
    const allTrains = [...tracks.map(track => `${track}-G1234`), ...stations.flatMap(station => [`${station}-G1234`, `${station}-G5678`, `${station}-G9012`])];
    const newStatus = Object.fromEntries(allTrains.map(train => [train, false]));
    setTrainStatus(prev => ({
      ...prev,
      ...newStatus
    }));
  };

  const handleStartAll = () => {
    if (isLocked) return; // 锁定状态下不可操作
    
    // 批量启动所有车次
    const allTrains = [...tracks.map(track => `${track}-G1234`), ...stations.flatMap(station => [`${station}-G1234`, `${station}-G5678`, `${station}-G9012`])];
    const newStatus = Object.fromEntries(allTrains.map(train => [train, true]));
    setTrainStatus(prev => ({
      ...prev,
      ...newStatus
    }));
  };

  const handleUnlock = () => {
    setShowPasswordInput(true);
  };

  const handlePasswordSubmit = () => {
    // 简单的前端密码验证，实际项目中应该使用后端验证
    if (inputPassword === '1') { // 密码改为 1
      setIsLocked(false);
      setShowPasswordInput(false);
      setInputPassword('');
    } else {
      // 密码错误提示
      alert('密码错误，请重试');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordInput(false);
    setInputPassword('');
  };

  const tracks = Array.from({ length: 20 }, (_, i) => `${i + 1}股道`);
  const stations = ['渝厦高铁场', '东环城际场']; // 站场数据

  // 模拟车次状态数据
  const [trainStatus, setTrainStatus] = useState<Record<string, boolean>>(
    Object.fromEntries(
      tracks.map(track => [`${track}-G1234`, true])
    )
  );

  // 计算当前 CTC 状态
  const calculateCTCStatus = () => {
    const allTrains = [...tracks.map(track => `${track}-G1234`), ...stations.flatMap(station => [`${station}-G1234`, `${station}-G5678`, `${station}-G9012`])];
    const trainValues = allTrains.map(train => trainStatus[train] || false);
    
    if (trainValues.every(value => value)) {
      return 'auto'; // 全部自动
    } else if (trainValues.every(value => !value)) {
      return 'manual'; // 全部手动
    } else {
      return 'semi'; // 半自动
    }
  };

  // 当前 CTC 状态
  const currentCTCStatus = calculateCTCStatus();

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
    fontSize: '18px',
    fontWeight: 600,
    color: darkMode ? '#E2E8F0' : '#1F2937',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: '12px',
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

  const getCardStyle = (): React.CSSProperties => ({
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
    borderRadius: CARD_BORDER_RADIUS,
    padding: '20px',
    marginBottom: '20px',
    border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.1)',
    boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(29, 78, 95, 0.08)'
  });

  return (
    <div style={getContainerStyle()} ref={drawerRef}>
      <div style={getHeaderStyle()}>
        <div style={getTitleStyle()}>
          <Zap size={20} />
          <span>CTC配置</span>
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

      <div style={{ padding: CONTENT_PADDING, flex: 1, overflowY: 'auto' }}>
        {/* 状态和CTC状态合并 */}
        <div style={getCardStyle()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>状态</span>
          </div>
          
          {/* 锁定状态 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
            borderRadius: '6px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLocked ? (
                <Lock size={20} color={darkMode ? '#94A3B8' : '#64748B'} />
              ) : (
                <Unlock size={20} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
              )}
              <span style={{ color: darkMode ? '#E2E8F0' : '#4B5563' }}>
                {isLocked ? '当前处于锁定状态，需要解锁后才能修改配置' : '已解锁，可以修改配置'}
              </span>
            </div>
            {isLocked && (
              <Button
                type="primary"
                onClick={handleUnlock}
                style={{
                  background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
                  border: 'none',
                  borderRadius: BUTTON_BORDER_RADIUS,
                  height: '36px',
                  padding: '0 16px',
                  boxShadow: '0 2px 4px rgba(29, 78, 95, 0.2)'
                }}
              >
                解锁
              </Button>
            )}
          </div>

          {/* 密码输入框 - 点击解锁后显示 */}
          {showPasswordInput && (
            <div style={{ 
              padding: '16px',
              background: darkMode ? 'rgba(24, 144, 255, 0.1)' : '#e6f7ff',
              borderRadius: '8px',
              border: darkMode ? '1px solid rgba(24, 144, 255, 0.3)' : '1px solid #91d5ff',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: darkMode ? '#E2E8F0' : '#374151',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  请输入密码
                </label>
                <Input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="输入密码"
                  style={{
                    height: '40px',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: darkMode ? 'rgba(42, 107, 124, 0.1)' : '#fff',
                    border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.2)',
                    color: darkMode ? '#1890ff' : '#1890ff',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  type="primary"
                  onClick={handlePasswordSubmit}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
                    border: 'none',
                    borderRadius: BUTTON_BORDER_RADIUS,
                    height: '36px'
                  }}
                >
                  确认
                </Button>
                <Button
                  onClick={handlePasswordCancel}
                  style={{
                    flex: 1,
                    borderRadius: BUTTON_BORDER_RADIUS,
                    height: '36px',
                    borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.2)',
                    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
                    color: darkMode ? '#5DA3B3' : '#1D4E5F'
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
          
          {/* CTC状态 */}
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '8px', display: 'block' }}>CTC状态</span>
            <Radio.Group 
              value={isLocked ? currentCTCStatus : ctcStatus} 
              onChange={isLocked ? undefined : (e) => setCtcStatus(e.target.value)}
              disabled={isLocked}
              style={{ width: '100%' }}
            >
              <Radio.Button 
                value="auto" 
                style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  background: (isLocked ? currentCTCStatus : ctcStatus) === 'auto' 
                    ? (darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff')
                    : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
                  borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.12)',
                  color: darkMode ? '#E2E8F0' : '#4B5563',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                自动模式
              </Radio.Button>
              <Radio.Button 
                value="semi"
                style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  background: (isLocked ? currentCTCStatus : ctcStatus) === 'semi'
                    ? (darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff')
                    : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
                  borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.12)',
                  color: darkMode ? '#E2E8F0' : '#4B5563',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                半自动模式
              </Radio.Button>
              <Radio.Button 
                value="manual"
                style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  background: (isLocked ? currentCTCStatus : ctcStatus) === 'manual'
                    ? (darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff')
                    : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
                  borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.12)',
                  color: darkMode ? '#E2E8F0' : '#4B5563',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                手动模式
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* 股道/站场选择 - 互斥模式切换 */}
        <div style={getCardStyle()}>
          {/* 模式切换标签 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>|</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#E2E8F0' : '#374151' }}>
                {viewMode === 'track' ? '股道' : '站场'}
              </span>
            </div>
            <Radio.Group 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              size="small"
            >
              <Radio.Button 
                value="track"
                style={{ 
                  background: viewMode === 'track' 
                    ? (darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff')
                    : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
                  borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.12)',
                  color: darkMode ? '#E2E8F0' : '#4B5563'
                }}
              >
                股道
              </Radio.Button>
              <Radio.Button 
                value="station"
                style={{ 
                  background: viewMode === 'station'
                    ? (darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff')
                    : (darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF'),
                  borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.12)',
                  color: darkMode ? '#E2E8F0' : '#4B5563'
                }}
              >
                站场
              </Radio.Button>
            </Radio.Group>
          </div>
          
          {/* 股道列表 */}
          {viewMode === 'track' && (
            <>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
                borderRadius: '6px',
                background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
                marginBottom: '16px'
              }}>
                <List
                  size="small"
                  dataSource={tracks}
                  renderItem={(track) => {
                    const trainId = `${track}-G1234`;
                    const isAuto = trainStatus[trainId] || false;
                    return (
                      <List.Item
                        style={{
                          padding: '10px 16px',
                          borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAuto ? (
                              <CheckCircle size={16} color={darkMode ? '#52c41a' : '#52c41a'} />
                            ) : (
                              <XCircle size={16} color={darkMode ? '#ff4d4f' : '#ff4d4f'} />
                            )}
                            <span style={{ color: darkMode ? '#E2E8F0' : '#4B5563' }}>{track}</span>
                            <span style={{ 
                              fontSize: '12px', 
                              color: darkMode ? '#94A3B8' : '#64748B',
                              marginLeft: '8px'
                            }}>G1234</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              fontSize: '12px', 
                              color: isAuto 
                                ? (darkMode ? '#52c41a' : '#52c41a') 
                                : (darkMode ? '#ff4d4f' : '#ff4d4f')
                            }}>
                              {isAuto ? '自动接收' : '已停止'}
                            </span>
                            <Switch
                              checked={isAuto}
                              onChange={(checked) => {
                                if (!isLocked) {
                                  setTrainStatus(prev => ({
                                    ...prev,
                                    [trainId]: checked
                                  }));
                                }
                              }}
                              disabled={isLocked}
                              size="small"
                            />
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
              
              {/* Mac风格按钮 - 放在股道面板下面 */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  onClick={handleStopAll}
                  disabled={isLocked}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    background: darkMode ? 'rgba(42, 107, 124, 0.2)' : '#f5f5f5',
                    border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid #d9d9d9',
                    color: darkMode ? '#E2E8F0' : '#333',
                    boxShadow: darkMode ? '0 1px 2px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(42, 107, 124, 0.3)' : '#e6e6e6';
                    e.currentTarget.style.boxShadow = darkMode ? '0 2px 4px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(42, 107, 124, 0.2)' : '#f5f5f5';
                    e.currentTarget.style.boxShadow = darkMode ? '0 1px 2px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <XCircle size={16} />
                  停止全部
                </Button>
                <Button
                  onClick={handleStartAll}
                  disabled={isLocked}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    background: darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff',
                    border: darkMode ? '1px solid rgba(24, 144, 255, 0.3)' : '1px solid #91d5ff',
                    color: darkMode ? '#91d5ff' : '#1890ff',
                    boxShadow: darkMode ? '0 1px 2px rgba(24, 144, 255, 0.2)' : '0 1px 2px rgba(24, 144, 255, 0.15)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(24, 144, 255, 0.3)' : '#bae7ff';
                    e.currentTarget.style.boxShadow = darkMode ? '0 2px 4px rgba(24, 144, 255, 0.3)' : '0 2px 4px rgba(24, 144, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff';
                    e.currentTarget.style.boxShadow = darkMode ? '0 1px 2px rgba(24, 144, 255, 0.2)' : '0 1px 2px rgba(24, 144, 255, 0.15)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <CheckCircle size={16} />
                  启动全部
                </Button>
              </div>
            </>
          )}
          
          {/* 站场列表 */}
          {viewMode === 'station' && (
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.12)',
              borderRadius: '6px',
              background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)'
            }}>
              <List
                size="small"
                dataSource={stations}
                renderItem={(station) => {
                  // 模拟每个站场的车次
                  const stationTrains = [`${station}-G1234`, `${station}-G5678`, `${station}-G9012`];
                  return (
                    <div key={station}>
                      <List.Item
                        style={{
                          padding: '10px 16px',
                          borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)',
                          background: darkMode ? 'rgba(42, 107, 124, 0.15)' : 'rgba(29, 78, 95, 0.08)'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: darkMode ? '#E2E8F0' : '#374151' }}>{station}</span>
                      </List.Item>
                      {stationTrains.map((train) => {
                        const isAuto = trainStatus[train] || false;
                        return (
                          <List.Item
                            key={train}
                            style={{
                              padding: '8px 16px 8px 32px',
                              borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.1)' : '1px solid rgba(29, 78, 95, 0.04)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isAuto ? (
                                  <CheckCircle size={16} color={darkMode ? '#52c41a' : '#52c41a'} />
                                ) : (
                                  <XCircle size={16} color={darkMode ? '#ff4d4f' : '#ff4d4f'} />
                                )}
                                <span style={{ color: darkMode ? '#E2E8F0' : '#4B5563' }}>{train}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: isAuto 
                                    ? (darkMode ? '#52c41a' : '#52c41a') 
                                    : (darkMode ? '#ff4d4f' : '#ff4d4f')
                                }}>
                                  {isAuto ? '自动接收' : '已停止'}
                                </span>
                                <Switch
                                  checked={isAuto}
                                  onChange={(checked) => {
                                    if (!isLocked) {
                                      setTrainStatus(prev => ({
                                        ...prev,
                                        [train]: checked
                                      }));
                                    }
                                  }}
                                  disabled={isLocked}
                                  size="small"
                                />
                              </div>
                            </div>
                          </List.Item>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </div>
          )}
        </div>

      </div>

      <div style={{ 
        padding: '14px 20px', 
        borderTop: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={onClose}
          style={{ 
            height: '40px', 
            borderRadius: BUTTON_BORDER_RADIUS,
            borderColor: darkMode ? 'rgba(42, 107, 124, 0.3)' : 'rgba(29, 78, 95, 0.2)',
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
            color: darkMode ? '#5DA3B3' : '#1D4E5F',
            padding: '0 20px'
          }}
        >
          取消
        </Button>
        <Button 
          type="primary"
          icon={<Save size={16} />}
          onClick={handleSave}
          style={{ 
            height: '40px', 
            borderRadius: BUTTON_BORDER_RADIUS,
            background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
            border: 'none',
            boxShadow: '0 2px 4px rgba(29, 78, 95, 0.2)',
            color: '#fff',
            padding: '0 20px'
          }}
        >
          确认
        </Button>
      </div>

    </div>
  );
};
