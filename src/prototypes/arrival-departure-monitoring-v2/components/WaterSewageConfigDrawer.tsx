import React, { useState, useEffect, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import { X, Droplets } from 'lucide-react';
import { CloseOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockTrainSchedules } from '../mock-data';
import { SewageIcon } from './icons/SewageIcon';
import './WaterSewageConfigDrawer.css';

// 类型定义
export type FormationType = '8' | '16' | '8+8';
export type SequenceType = 'normal' | 'reverse';

export interface Carriage {
  number: number;
  position: number;
  isHead: boolean;
}

interface WaterSewageConfigDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
  onConfigChange?: (trainId: string, config: { waterCarriages: number[]; sewageCarriages: number[] }) => void;
}

type ConfigType = 'none' | 'all' | 'odd' | 'even' | 'custom';
type ServiceType = 'water' | 'sewage';

interface ServiceConfig {
  type: ConfigType;
  customCarriages: number[];
}

// 生成车厢数据
function generateCarriages(
  formationType: FormationType,
  sequence: SequenceType,
  direction: 'up' | 'down' = 'up'
): Carriage[] {
  const carriages: Carriage[] = [];
  
  let carriageNumbers: number[] = [];
  
  switch (formationType) {
    case '8':
      carriageNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
      break;
    case '16':
      carriageNumbers = Array.from({ length: 16 }, (_, i) => i + 1);
      break;
    case '8+8':
      carriageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      break;
  }
  
  if (sequence === 'reverse') {
    carriageNumbers = carriageNumbers.reverse();
  }
  
  const total = carriageNumbers.length;
  
  carriageNumbers.forEach((num, index) => {
    // 判断是否为车头：8编组是1和8，16编组是1和16，8+8是1、8、9、16
    const isHead = formationType === '8' 
      ? (index === 0 || index === total - 1)
      : formationType === '16'
        ? (index === 0 || index === total - 1)
        : (index === 0 || index === 7 || index === 8 || index === total - 1);
    
    carriages.push({
      number: num,
      position: index,
      isHead
    });
  });
  
  return carriages;
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

export const WaterSewageConfigDrawer: React.FC<WaterSewageConfigDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false,
  onConfigChange
}) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);
  
  // 获取编组信息
  const formationInfo = useMemo(() => {
    if (!train) return { type: '16' as FormationType, sequence: 'normal' as SequenceType, direction: 'up' as 'up' | 'down' };
    const formation = train.attributes?.formation;
    let type: FormationType = '16';
    if (formation === 8) type = '8';
    else if (formation === '8+8') type = '8+8';
    return { type, sequence: 'normal' as SequenceType, direction: 'up' as 'up' | 'down' };
  }, [train]);

  // 生成车厢
  const carriages = useMemo(() => {
    return generateCarriages(formationInfo.type, formationInfo.sequence, formationInfo.direction);
  }, [formationInfo]);

  // 上水配置
  const [waterConfig, setWaterConfig] = useState<ServiceConfig>({
    type: 'none',
    customCarriages: []
  });

  // 吸污配置
  const [sewageConfig, setSewageConfig] = useState<ServiceConfig>({
    type: 'none',
    customCarriages: []
  });

  // 当前编辑的服务类型
  const [activeService, setActiveService] = useState<ServiceType>('water');

  // 当抽屉打开时，加载当前配置
  useEffect(() => {
    if (visible && train) {
      const savedWaterCarriages = (train as any).waterCarriages || [];
      const savedSewageCarriages = (train as any).sewageCarriages || [];
      
      setWaterConfig({
        type: savedWaterCarriages.length > 0 ? 'custom' : 'none',
        customCarriages: savedWaterCarriages
      });
      setSewageConfig({
        type: savedSewageCarriages.length > 0 ? 'custom' : 'none',
        customCarriages: savedSewageCarriages
      });
    }
  }, [visible, train]);

  // 获取当前激活的配置
  const getActiveConfig = () => activeService === 'water' ? waterConfig : sewageConfig;
  const getActiveSetter = () => activeService === 'water' ? setWaterConfig : setSewageConfig;

  // 处理配置类型变化
  const handleTypeChange = (type: ConfigType) => {
    const setter = getActiveSetter();
    const carriageNumbers = carriages.map(c => c.number);
    let customCarriages: number[] = [];
    
    switch (type) {
      case 'all':
        customCarriages = [...carriageNumbers];
        break;
      case 'odd':
        customCarriages = carriageNumbers.filter(n => n % 2 === 1);
        break;
      case 'even':
        customCarriages = carriageNumbers.filter(n => n % 2 === 0);
        break;
      case 'custom':
        customCarriages = getActiveConfig().customCarriages.length > 0 
          ? getActiveConfig().customCarriages 
          : [];
        break;
      default:
        customCarriages = [];
    }
    
    setter({ type, customCarriages });
  };

  // 处理车厢点击选择
  const handleCarriageClick = (carriageNum: number) => {
    const setter = getActiveSetter();
    const currentConfig = getActiveConfig();
    
    // 如果当前不是自定义模式，切换到自定义模式
    const newCustomCarriages = currentConfig.customCarriages.includes(carriageNum)
      ? currentConfig.customCarriages.filter(n => n !== carriageNum)
      : [...currentConfig.customCarriages, carriageNum].sort((a, b) => a - b);
    
    setter({
      type: 'custom',
      customCarriages: newCustomCarriages
    });
  };

  // 检查车厢是否有指定服务
  const hasService = (carriageNum: number, service: ServiceType) => {
    const config = service === 'water' ? waterConfig : sewageConfig;
    return config.customCarriages.includes(carriageNum);
  };

  // 保存配置
  const handleSave = () => {
    if (!train) return;
    
    const trainIndex = mockTrainSchedules.findIndex(t => t.id === train.id);
    if (trainIndex !== -1) {
      (mockTrainSchedules[trainIndex] as any).waterCarriages = waterConfig.customCarriages;
      (mockTrainSchedules[trainIndex] as any).sewageCarriages = sewageConfig.customCarriages;
      
      mockTrainSchedules[trainIndex].tags = {
        ...mockTrainSchedules[trainIndex].tags,
        water: waterConfig.customCarriages.length > 0,
        sewage: sewageConfig.customCarriages.length > 0
      };
    }
    
    if (onConfigChange) {
      onConfigChange(train.id, {
        waterCarriages: waterConfig.customCarriages,
        sewageCarriages: sewageConfig.customCarriages
      });
    }
    
    onClose();
  };

  // 重置配置
  const handleReset = () => {
    setWaterConfig({ type: 'none', customCarriages: [] });
    setSewageConfig({ type: 'none', customCarriages: [] });
  };

  if (!visible) return null;

  const configTypes: { value: ConfigType; label: string }[] = [
    { value: 'none', label: '无' },
    { value: 'all', label: '整列' },
    { value: 'odd', label: '单数' },
    { value: 'even', label: '双数' },
    { value: 'custom', label: '自定义' }
  ];

  // 获取股道号
  const trackNumber = train?.location?.track || '5';

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="water-sewage-drawer-overlay"
        onClick={onClose}
      />
      
      {/* 抽屉容器 */}
      <div 
        className={`water-sewage-drawer ${darkMode ? '' : 'light'}`}
        data-theme={darkMode ? 'dark' : 'light'}
      >
        {/* 头部区域 */}
        <div className="ws-drawer-header">
          <div className="ws-header-left">
            <div className="ws-title">上水吸污配置</div>
            <div className="ws-train-info">
              <span className="ws-train-no">{train?.trainNo || 'C6402'}</span>
              <span className="ws-train-model">{train?.attributes?.trainModel || 'CRH2A'}</span>
              <span className="ws-formation-tag">{getFormationTypeText(formationInfo.type)}</span>
              <span className="ws-track-tag">{trackNumber}道</span>
            </div>
          </div>
          <div className="ws-header-right">
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              className="ws-close-btn"
            />
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="ws-drawer-body">
          {/* 左侧：列车编组可视化 */}
          <div className="ws-formation-section">
            <div className="ws-formation-visualization">
              {/* 车厢列表 - 垂直排列（从上到下：1车到16车） */}
              <div className="ws-carriages-wrapper">
                <div className="ws-carriages-column">
                  {carriages.map((carriage, index) => (
                    <Tooltip 
                      key={carriage.number}
                      title={`${carriage.number}车`}
                      placement="right"
                    >
                      <div className="ws-carriage-wrapper">
                        {/* 上水标记列 */}
                        <div className="ws-service-column water-column">
                          {hasService(carriage.number, 'water') && (
                            <div className="ws-service-marker water" title="上水">
                              <Droplets size={12} />
                            </div>
                          )}
                        </div>
                        
                        {/* 车厢主体 - 水平摆放（宽大于高） */}
                        <div
                          className={`ws-carriage-node ${
                            hasService(carriage.number, activeService) ? 'selected' : ''
                          }`}
                          onClick={() => handleCarriageClick(carriage.number)}
                        >
                          <span className="ws-carriage-number">{carriage.number}</span>
                        </div>
                        
                        {/* 吸污标记列 */}
                        <div className="ws-service-column sewage-column">
                          {hasService(carriage.number, 'sewage') && (
                            <div className="ws-service-marker sewage" title="吸污">
                              <SewageIcon size={12} />
                            </div>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* 图例说明 */}
              <div className="ws-legend">
                <div className="ws-legend-item">
                  <div className="ws-legend-icon water"><Droplets size={14} /></div>
                  <span>上水</span>
                </div>
                <div className="ws-legend-item">
                  <div className="ws-legend-icon sewage"><SewageIcon size={14} /></div>
                  <span>吸污</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：配置面板 */}
          <div className="ws-config-section">
            {/* 服务类型切换 */}
            <div className="ws-service-tabs">
              <button
                className={`ws-service-tab ${activeService === 'water' ? 'active' : ''}`}
                onClick={() => setActiveService('water')}
              >
                <Droplets size={16} />
                <span>上水配置</span>
                {waterConfig.customCarriages.length > 0 && (
                  <span className="ws-count-badge">{waterConfig.customCarriages.length}</span>
                )}
              </button>
              <button
                className={`ws-service-tab ${activeService === 'sewage' ? 'active' : ''}`}
                onClick={() => setActiveService('sewage')}
              >
                <SewageIcon size={16} />
                <span>吸污配置</span>
                {sewageConfig.customCarriages.length > 0 && (
                  <span className="ws-count-badge">{sewageConfig.customCarriages.length}</span>
                )}
              </button>
            </div>

            {/* 配置类型选择 */}
            <div className="ws-config-card">
              <div className="ws-config-title">选择范围</div>
              <div className="ws-config-types">
                {configTypes.map(type => (
                  <button
                    key={type.value}
                    className={`ws-config-type-btn ${getActiveConfig().type === type.value ? 'active' : ''}`}
                    onClick={() => handleTypeChange(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 当前配置状态 */}
            <div className="ws-config-card">
              <div className="ws-config-title">
                已选车厢
                <span className="ws-config-count">{getActiveConfig().customCarriages.length} 节</span>
              </div>
              <div className="ws-selected-carriages">
                {getActiveConfig().customCarriages.length > 0 ? (
                  getActiveConfig().customCarriages.map(num => (
                    <span key={num} className="ws-carriage-tag">{num}车</span>
                  ))
                ) : (
                  <span className="ws-empty-text">未选择车厢</span>
                )}
              </div>
            </div>

            {/* 操作提示 */}
            <div className="ws-hint-card">
              <div className="ws-hint-title">操作提示</div>
              <ul className="ws-hint-list">
                <li>点击车厢可直接选择/取消</li>
                <li>整列：所有车厢都进行服务</li>
                <li>单数：仅单数编号车厢</li>
                <li>双数：仅双数编号车厢</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="ws-drawer-footer">
          <button className="ws-footer-btn reset" onClick={handleReset}>
            <ReloadOutlined />
            <span>重置</span>
          </button>
          <div className="ws-footer-actions">
            <button className="ws-footer-btn cancel" onClick={onClose}>
              取消
            </button>
            <button className="ws-footer-btn confirm" onClick={handleSave}>
              <CheckOutlined />
              <span>确定</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WaterSewageConfigDrawer;
