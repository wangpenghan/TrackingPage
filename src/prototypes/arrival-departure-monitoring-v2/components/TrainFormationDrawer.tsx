import React, { useState, useMemo, useEffect } from 'react';
import { Tooltip, Switch, Modal } from 'antd';
import { 
  SettingOutlined, 
  EditOutlined, 
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StopOutlined,
  DesktopOutlined,
  CarOutlined,
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Button } from 'antd';
import { mockTrainSchedules } from '../mock-data';
import './TrainFormationDrawer.css';
import FormationConfigModal from './FormationConfigModal';

// 类型定义
export type FormationType = '8' | '16' | '8+8';
export type SequenceType = 'normal' | 'reverse';
export type LandmarkColor = 'blue' | 'purple' | 'yellow' | 'green';

export interface TrainFormation {
  trainId: string;
  trainNo: string;
  trainModel: string;
  formationType: FormationType;
  sequence: SequenceType;
  direction: 'up' | 'down';
  landmarkColor: LandmarkColor;
}

export interface Carriage {
  number: number;
  isHead: boolean;
  position: number;
}

export interface PlatformScreen {
  id: string;
  name: string;
  position: number;
  targetCarriage: number;
  actualCarriage?: number;
}

export interface Platform {
  id: string;
  name: string;
  direction: 'NS' | 'EW';
  totalLength: number;
  marginStart: number;
  marginEnd: number;
  screens: PlatformScreen[];
}

interface TrainFormationDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
}

// 生成车厢数据
function generateCarriages(
  formationType: FormationType,
  sequence: SequenceType,
  direction: 'up' | 'down' = 'up'
): Carriage[] {
  const carriages: Carriage[] = [];
  
  let carriageNumbers: number[] = [];
  let headPositions: number[] = [];
  
  switch (formationType) {
    case '8':
      carriageNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
      headPositions = [0, 7];
      break;
    case '16':
      carriageNumbers = Array.from({ length: 16 }, (_, i) => i + 1);
      headPositions = [0, 15];
      break;
    case '8+8':
      carriageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      headPositions = [0, 7, 8, 15];
      break;
  }
  
  if (sequence === 'reverse') {
    carriageNumbers = carriageNumbers.reverse();
  }
  
  const total = carriageNumbers.length;
  // 上北下南：北方向在上方(position=8)，南方向在下方(position=92)
  const northStopPosition = 8;
  const southStopPosition = 92;
  const trackLength = southStopPosition - northStopPosition;

  let startOffset: number;
  let availableRange: number;
  // 车厢高度32px，中心偏移为16px，转换为百分比约为2%
  const carriageCenterOffset = 2;

  if (formationType === '8') {
    availableRange = 40;
    if (direction === 'up') {
      // 上行车：第一个车厢中心对齐北方向(上方)停车标记中心
      startOffset = northStopPosition - carriageCenterOffset;
    } else {
      // 下行车：最后一个车厢中心对齐南方向(下方)停车标记中心
      startOffset = southStopPosition - availableRange + carriageCenterOffset;
    }
  } else {
    // 16节和8+8节车厢：默认从北方向开始，第一个车厢中心对齐北方向
    startOffset = northStopPosition - carriageCenterOffset;
    availableRange = trackLength;
  }

  const spacingFactor = formationType === '8' ? 0.9 : 0.95;
  const actualRange = availableRange * spacingFactor;
  const spacingOffset = (availableRange - actualRange) / 2;

  carriageNumbers.forEach((num, index) => {
    const position = startOffset + spacingOffset + (index / (total - 1)) * actualRange;
    
    carriages.push({
      number: num,
      isHead: headPositions.includes(sequence === 'reverse' ? total - 1 - index : index),
      position
    });
  });
  
  return carriages;
}

// 获取地标颜色
function getLandmarkColor(color: LandmarkColor): string {
  const colorMap: Record<LandmarkColor, string> = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    yellow: '#eab308',
    green: '#22c55e'
  };
  return colorMap[color] || '#3b82f6';
}

// 获取编组类型文本
function getFormationTypeText(type: FormationType): string {
  const textMap: Record<FormationType, string> = {
    '8': '8编组',
    '16': '16编组',
    '8+8': '8编组重联'
  };
  return textMap[type];
}

// 默认站台信息
const defaultPlatform: Platform = {
  id: 'P001',
  name: '1号站台',
  direction: 'NS',
  totalLength: 450,
  marginStart: 50,
  marginEnd: 50,
  screens: [
    { id: 'S001', name: '1-6车屏', position: 20, targetCarriage: 3 },
    { id: 'S002', name: '7-12车屏', position: 50, targetCarriage: 9 },
    { id: 'S003', name: '13-16车屏', position: 80, targetCarriage: 15 }
  ]
};

// 获取默认编组信息
function getDefaultFormation(trainNo: string, trainModel: string): TrainFormation {
  return {
    trainId: 'T001',
    trainNo: trainNo,
    trainModel: trainModel,
    formationType: '16',
    sequence: 'normal',
    direction: 'up',
    landmarkColor: 'blue'
  };
}

export const TrainFormationDrawer: React.FC<TrainFormationDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false
}) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);
  const trainNo = train?.trainNo || 'G1234';
  const trainModel = train?.attributes?.trainModel || 'CR400BF';
  
  // 从列车数据获取地标颜色
  const getTrainLandmarkColor = (): LandmarkColor => {
    if (!train) return 'blue';
    const colorMap: Record<string, LandmarkColor> = {
      '蓝色': 'blue',
      '紫色': 'purple',
      '黄色': 'yellow',
      '绿色': 'green',
      '橙色': 'blue'
    };
    return colorMap[train.attributes.landmarkColor] || 'blue';
  };

  // 初始状态
  const initialFormation = {
    ...getDefaultFormation(trainNo, trainModel),
    landmarkColor: getTrainLandmarkColor()
  };
  const initialScreens = defaultPlatform.screens;
  const initialGlobalOffset = 0;

  const [formation, setFormation] = useState<TrainFormation>(initialFormation);
  const [platform] = useState<Platform>(defaultPlatform);
  const [screens, setScreens] = useState<PlatformScreen[]>(initialScreens);
  const [isEditMode, setIsEditMode] = useState(false);
  const [globalOffset, setGlobalOffset] = useState(initialGlobalOffset);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [adjustMode, setAdjustMode] = useState<'global' | 'single'>('global');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [directionConfigModalVisible, setDirectionConfigModalVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 方位配置状态
  const [topDirection, setTopDirection] = useState<'东' | '西' | '南' | '北'>('北');
  const [bottomDirection, setBottomDirection] = useState<'东' | '西' | '南' | '北'>('南');

  // 当 trainId 变化时更新 formation
  useEffect(() => {
    if (trainId && train) {
      setFormation(prev => ({
        ...prev,
        trainNo: train.trainNo,
        trainModel: train.attributes.trainModel,
        landmarkColor: getTrainLandmarkColor()
      }));
    }
  }, [trainId, train]);

  // 检测是否有未保存的修改
  useEffect(() => {
    const hasChanges = JSON.stringify(formation) !== JSON.stringify(initialFormation) ||
                      JSON.stringify(screens) !== JSON.stringify(initialScreens) ||
                      globalOffset !== initialGlobalOffset;
    setHasUnsavedChanges(hasChanges);
  }, [formation, screens, globalOffset, initialFormation, initialScreens, initialGlobalOffset]);

  // 处理关闭
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

  // 生成车厢数据
  const carriages = useMemo(() => {
    return generateCarriages(formation.formationType, formation.sequence, formation.direction);
  }, [formation.formationType, formation.sequence, formation.direction]);

  // 根据编组规则计算地标颜色
  const landmarkColor = useMemo(() => {
    const { formationType, sequence, direction } = formation;
    // 地标颜色规则：
    // 16正序 → 黄色
    // 16倒序 → 绿色
    // 8上行正序 → 蓝色
    // 8下行正序 → 黄色
    // 8上行倒序 → 绿色
    // 8下行倒序 → 紫色
    if (formationType === '16') {
      return sequence === 'normal' ? '#eab308' : '#22c55e';
    } else if (formationType === '8') {
      if (sequence === 'normal') {
        return direction === 'up' ? '#3b82f6' : '#eab308';
      } else {
        return direction === 'up' ? '#22c55e' : '#8b5cf6';
      }
    }
    return '#3b82f6';
  }, [formation.formationType, formation.sequence, formation.direction]);

  const handleScreenClick = (screenId: string) => {
    if (isEditMode) {
      setSelectedScreenId(screenId === selectedScreenId ? null : screenId);
      setAdjustMode('single');
    }
  };

  const handleGlobalOffsetChange = (delta: number) => {
    setGlobalOffset(prev => prev + delta);
  };

  const handleScreenOffsetChange = (screenId: string, delta: number) => {
    setScreens(prev => prev.map(screen => 
      screen.id === screenId 
        ? { ...screen, targetCarriage: Math.max(1, screen.targetCarriage + delta) }
        : screen
    ));
  };

  const handleReset = () => {
    setGlobalOffset(initialGlobalOffset);
    setScreens(initialScreens);
    setSelectedScreenId(null);
  };

  const handleApply = () => {
    console.log('应用调整:', { globalOffset, screens });
    setIsEditMode(false);
    setSelectedScreenId(null);
    setHasUnsavedChanges(false);
    onClose();
  };

  const toggleSequence = () => {
    setFormation(prev => ({
      ...prev,
      sequence: prev.sequence === 'normal' ? 'reverse' : 'normal'
    }));
  };

  const toggleDirection = () => {
    setFormation(prev => ({
      ...prev,
      direction: prev.direction === 'up' ? 'down' : 'up'
    }));
  };

  // 处理编组配置保存
  const handleFormationSave = (newFormation: TrainFormation) => {
    setFormation(newFormation);
    setConfigModalVisible(false);
    setGlobalOffset(0);
  };

  const landmarkColors: { value: LandmarkColor; label: string }[] = [
    { value: 'blue', label: '蓝' },
    { value: 'purple', label: '紫' },
    { value: 'yellow', label: '黄' },
    { value: 'green', label: '绿' }
  ];

  const getActualCarriage = (targetCarriage: number) => {
    return targetCarriage + globalOffset;
  };

  const selectedScreen = screens.find(s => s.id === selectedScreenId);

  if (!visible) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="train-formation-drawer-overlay"
        onClick={handleClose}
      />
      
      {/* 抽屉容器 */}
      <div 
        className={`train-formation-drawer ${darkMode ? '' : 'light'}`}
        data-theme={darkMode ? 'dark' : 'light'}
      >
        {/* 头部区域 */}
        <div className="drawer-header">
          <div className="header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937' }}>编组维护</div>
            </div>
            <div className="train-info">
              <div className="train-no-badge">{formation.trainNo}</div>
              <div className="train-model-text">{formation.trainModel}</div>
            </div>
            <div className="train-tags">
              <span className="train-tag formation">{getFormationTypeText(formation.formationType)}</span>
              <span className="train-tag sequence">{formation.sequence === 'normal' ? '正序' : '倒序'}</span>
              <span className="train-tag direction">{formation.direction === 'up' ? '上行' : '下行'}</span>
              {hasUnsavedChanges && (
                <span className="train-tag unsaved">未保存</span>
              )}
            </div>
          </div>
          <div className="header-right">
            <div className="landmark-indicator">
              <span className="landmark-label">地标</span>
              <div 
                className="landmark-color" 
                style={{ backgroundColor: landmarkColor }}
              />
            </div>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={handleClose}
              className="close-btn"
            />
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="drawer-body">
          {/* 左侧：站台可视化 */}
          <div className="platform-section">
            <div className="platform-visualization">
              {/* 站台名称 */}
              <div className="platform-title-bar">{platform.name}</div>

              {/* 站台轨道区域 */}
              <div className="platform-track">
                {/* 轨道线 */}
                <div className="track-line" />

                {/* 停车标记 */}
                <div className="stop-markers">
                  <div className="stop-marker-with-direction">
                    <div className={`direction-badge ${topDirection === '北' || topDirection === '南' ? topDirection === '北' ? 'north' : 'south' : 'east-west'}`}>{topDirection}</div>
                    <div className="stop-marker">
                      <div className="stop-icon-wrapper">
                        <StopOutlined className="stop-icon" />
                      </div>
                      <span className="stop-label">停</span>
                    </div>
                  </div>
                  <div className="stop-marker-with-direction">
                    <div className="stop-marker">
                      <div className="stop-icon-wrapper">
                        <StopOutlined className="stop-icon" />
                      </div>
                      <span className="stop-label">停</span>
                    </div>
                    <div className={`direction-badge ${bottomDirection === '北' || bottomDirection === '南' ? bottomDirection === '北' ? 'north' : 'south' : 'east-west'}`}>{bottomDirection}</div>
                  </div>
                </div>

                {/* 列车编组区域 */}
                <div className="formation-area">
                  <div className="carriages-track">
                    {carriages.map((carriage, index) => {
                      const actualNumber = getActualCarriage(carriage.number);
                      const displayNumber = actualNumber > 0 ? actualNumber : 1;
                      
                      return (
                        <React.Fragment key={carriage.number}>
                          <Tooltip 
                            title={`${carriage.isHead ? '车头' : '车厢'} - ${displayNumber}车`}
                            placement="left"
                          >
                            <div
                              className={`carriage-node ${carriage.isHead ? 'head' : 'normal'}`}
                              style={{
                                top: `${carriage.position}%`,
                                borderColor: carriage.isHead ? landmarkColor : undefined
                              }}
                            >
                              <span className="carriage-number">
                                {carriage.isHead && <CarOutlined className="head-indicator" />}
                                {displayNumber}
                              </span>
                            </div>
                          </Tooltip>
                          {index < carriages.length - 1 && (
                            <div 
                              className="carriage-connector"
                              style={{
                                top: `${carriage.position}%`,
                                height: `${(carriages[index + 1]?.position || 95) - carriage.position}%`
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* 站台屏区域 */}
                <div className="screens-area">
                  {screens.map(screen => {
                    const actualCarriage = getActualCarriage(screen.targetCarriage);
                    const hasOffset = actualCarriage !== screen.targetCarriage;
                    
                    return (
                      <Tooltip 
                        key={screen.id}
                        title={
                          <div className="screen-tooltip">
                            <div className="tooltip-header">{screen.name}</div>
                            <div className="tooltip-row">
                              <span className="label">目标车厢</span>
                              <span className="value">{screen.targetCarriage}车</span>
                            </div>
                            <div className="tooltip-row">
                              <span className="label">实际车厢</span>
                              <span className={`value ${hasOffset ? 'offset' : ''}`}>
                                {actualCarriage}车
                              </span>
                            </div>
                            <div className="tooltip-row">
                              <span className="label">位置</span>
                              <span className="value">{screen.position.toFixed(1)}%</span>
                            </div>
                          </div>
                        }
                        placement="right"
                      >
                        <div
                          className={`screen-node ${selectedScreenId === screen.id ? 'selected' : ''} ${hasOffset ? 'has-offset' : ''}`}
                          style={{ 
                            top: `${screen.position}%`,
                            borderColor: selectedScreenId === screen.id ? landmarkColor : `${landmarkColor}80`,
                            background: selectedScreenId === screen.id ? `${landmarkColor}30` : `${landmarkColor}15`,
                            boxShadow: selectedScreenId === screen.id ? `0 0 0 3px ${landmarkColor}40, 0 4px 12px rgba(0,0,0,0.15)` : 'none',
                            transform: selectedScreenId === screen.id ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleScreenClick(screen.id)}
                        >
                          <div className="screen-icon-box" style={{ background: `${landmarkColor}25` }}>
                            <DesktopOutlined className="screen-icon" style={{ color: landmarkColor }} />
                          </div>
                          <div className="screen-info">
                            <span className="screen-name">{screen.name}</span>
                            <span className="screen-target" style={{ fontSize: '16px', fontWeight: 700, color: landmarkColor }}>
                              {actualCarriage}车
                              {hasOffset && <span className="offset-badge">偏移</span>}
                            </span>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：操作面板 */}
          <div className="operation-section">
            {/* 快捷操作 */}
            <div className="operation-card">
              <div className="operation-card-title">快捷操作</div>
              <div className="quick-actions">
                <button
                  className="action-btn"
                  onClick={() => setConfigModalVisible(true)}
                >
                  <SettingOutlined style={{ fontSize: '12px' }} />
                  <span>编组配置</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={toggleSequence}
                >
                  <CarOutlined style={{ fontSize: '12px' }} />
                  <span>切换{formation.sequence === 'normal' ? '倒序' : '正序'}</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={toggleDirection}
                >
                  <ArrowUpOutlined style={{ fontSize: '12px' }} />
                  <span>切换{formation.direction === 'up' ? '下行' : '上行'}</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setDirectionConfigModalVisible(true)}
                >
                  <SettingOutlined style={{ fontSize: '12px' }} />
                  <span>方位配置</span>
                </button>
                {/* 地标颜色选择 */}
                <div className="landmark-color-selector">
                  <span className="landmark-color-label">地标颜色</span>
                  <div className="landmark-color-options">
                    {landmarkColors.map(color => (
                      <button
                        key={color.value}
                        className={`landmark-color-option ${formation.landmarkColor === color.value ? 'active' : ''}`}
                        style={{ backgroundColor: getLandmarkColor(color.value) }}
                        onClick={() => setFormation(prev => ({ ...prev, landmarkColor: color.value }))}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="edit-mode-control">
                  <div className="edit-mode-label">
                    调整模式
                    <span>{isEditMode ? '可进行偏移调整' : '仅查看模式'}</span>
                  </div>
                  <Switch
                    checked={isEditMode}
                    onChange={setIsEditMode}
                    checkedChildren={<EditOutlined />}
                    unCheckedChildren={<EyeOutlined />}
                  />
                </div>
              </div>
            </div>

            {/* 偏移调整面板 */}
            {isEditMode && (
              <div className="adjustment-panel">
                <div className="adjustment-tabs">
                  <button 
                    className={`adjustment-tab ${adjustMode === 'global' ? 'active' : ''}`}
                    onClick={() => setAdjustMode('global')}
                  >
                    整体偏移
                  </button>
                  <button 
                    className={`adjustment-tab ${adjustMode === 'single' ? 'active' : ''}`}
                    onClick={() => {
                      setAdjustMode('single');
                      if (!selectedScreenId && screens.length > 0) {
                        setSelectedScreenId(screens[0].id);
                      }
                    }}
                  >
                    单屏调整
                  </button>
                </div>

                {adjustMode === 'global' ? (
                  <div className="offset-control global">
                    <span className="offset-label">全局偏移量（所有车厢）</span>
                    <div className="offset-input-group">
                      <button 
                        className="offset-btn"
                        onClick={() => handleGlobalOffsetChange(-1)}
                      >
                        <MinusOutlined />
                      </button>
                      <div className={`offset-value ${globalOffset !== 0 ? 'has-offset' : ''}`}>
                        {globalOffset > 0 ? `+${globalOffset}` : globalOffset}
                      </div>
                      <button 
                        className="offset-btn"
                        onClick={() => handleGlobalOffsetChange(1)}
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="offset-control single">
                    <span className="offset-label">
                      {selectedScreen ? `调整 ${selectedScreen.name}` : '请选择站台屏'}
                    </span>
                    {selectedScreen && (
                      <div className="offset-input-group">
                        <button 
                          className="offset-btn"
                          onClick={() => handleScreenOffsetChange(selectedScreen.id, -1)}
                        >
                          <MinusOutlined />
                        </button>
                        <div className="offset-value">
                          {selectedScreen.targetCarriage}车
                        </div>
                        <button 
                          className="offset-btn"
                          onClick={() => handleScreenOffsetChange(selectedScreen.id, 1)}
                        >
                          <PlusOutlined />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="offset-actions">
                  <button className="action-btn secondary" onClick={handleReset}>
                    <ReloadOutlined />
                    <span>重置</span>
                  </button>
                  <button className="action-btn primary" onClick={handleApply}>
                    <CheckOutlined />
                    <span>应用</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="drawer-footer">
          <button className="footer-btn cancel" onClick={handleClose}>
            取消
          </button>
          <button className="footer-btn confirm" onClick={handleApply}>
            确认
          </button>
        </div>

        {/* 编组配置模态框 */}
        <FormationConfigModal
          visible={configModalVisible}
          formation={formation}
          onCancel={() => setConfigModalVisible(false)}
          onSave={handleFormationSave}
          onChanges={(hasChanges) => setHasUnsavedChanges(hasChanges)}
        />

        {/* 方位配置模态框 */}
        <Modal
          title="方位配置"
          open={directionConfigModalVisible}
          onCancel={() => setDirectionConfigModalVisible(false)}
          onOk={() => setDirectionConfigModalVisible(false)}
          okText="确认"
          cancelText="取消"
          width={400}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#E2E8F0' : '#374151' }}>上方对应：</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['东', '西', '南', '北'] as const).map((dir) => (
                  <Button
                    key={dir}
                    type={topDirection === dir ? 'primary' : 'default'}
                    style={{ flex: 1 }}
                    onClick={() => setTopDirection(dir)}
                  >
                    {dir}
                  </Button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#E2E8F0' : '#374151' }}>下方对应：</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['东', '西', '南', '北'] as const).map((dir) => (
                  <Button
                    key={dir}
                    type={bottomDirection === dir ? 'primary' : 'default'}
                    style={{ flex: 1 }}
                    onClick={() => setBottomDirection(dir)}
                  >
                    {dir}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default TrainFormationDrawer;
