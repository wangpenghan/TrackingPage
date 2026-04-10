import React, { useState, useEffect } from 'react';
import { Button, Tag, message } from 'antd';
import { X, Clock, Train, Package, Droplets, History, GitCompare, AlertCircle, ArrowRight, CheckCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockTrainSchedules, TrainSchedule } from '../mock-data';

interface PlanChangeDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
  onResolve?: (trainId: string, field: string, strategy: 'yesterday' | 'kemo' | 'lock') => void;
  onDataChange?: () => void;
}

// macOS 风格配色
const macOSColors = {
  light: {
    background: '#F5F5F7',
    cardBackground: '#FFFFFF',
    textPrimary: '#1D1D1F',
    textSecondary: '#86868B',
    accent: '#007AFF',
    border: '#D2D2D7',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    blue: '#007AFF',
    orange: '#FF9500',
    red: '#FF3B30'
  },
  dark: {
    background: '#1C1C1E',
    cardBackground: '#2C2C2E',
    textPrimary: '#F5F5F7',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    blue: '#0A84FF',
    orange: '#FF9F0A',
    red: '#FF453A'
  }
};

// 变更类型配置
const changeTypeConfig = {
  none: { label: '无变更', color: '#34C759', icon: CheckCircle },
  yesterday: { label: '昨日变更', color: '#007AFF', icon: History },
  kemo: { label: '客模变更', color: '#FF9500', icon: GitCompare },
  both: { label: '多方变更', color: '#FF3B30', icon: AlertCircle }
};

export const PlanChangeDrawer: React.FC<PlanChangeDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false,
  onResolve,
  onDataChange
}) => {
  const colors = darkMode ? macOSColors.dark : macOSColors.light;
  const [train, setTrain] = useState<TrainSchedule | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 当trainId变化时更新train数据
  useEffect(() => {
    if (trainId) {
      const found = mockTrainSchedules.find(t => t.id === trainId);
      setTrain(found || null);
      setCurrentIndex(0);
    }
  }, [trainId]);

  if (!visible || !train || !train.planChangeInfo) return null;

  const { planChangeInfo } = train;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 获取变更项列表
  const getChangeItems = () => {
    const items = [];
    const fields = [
      { key: 'arrivalTime', label: '到点', icon: Clock },
      { key: 'departureTime', label: '发点', icon: Clock },
      { key: 'track', label: '股道', icon: Train },
      { key: 'formation', label: '编组', icon: Train },
      { key: 'trainModel', label: '车型', icon: Train },
      { key: 'water', label: '上水', icon: Droplets },
      { key: 'sewage', label: '吸污', icon: Droplets },
      { key: 'parcel', label: '行包', icon: Package }
    ];

    fields.forEach(field => {
      const info = planChangeInfo[field.key as keyof typeof planChangeInfo] as any;
      if (info && info.diffType !== 'none') {
        items.push({
          ...field,
          diffType: info.diffType,
          today: info.today,
          yesterday: info.yesterday,
          kemo: info.kemo
        });
      }
    });

    return items;
  };

  const changeItems = getChangeItems();

  // 处理策略 - 更新本地状态和mock数据
  const handleResolve = (field: string, strategy: 'yesterday' | 'kemo' | 'lock') => {
    if (!train || !train.planChangeInfo) return;
    
    const fieldMap: Record<string, string> = {
      'arrivalTime': '到点',
      'departureTime': '发点',
      'track': '股道',
      'formation': '编组',
      'trainModel': '车型',
      'water': '上水',
      'sewage': '吸污',
      'parcel': '行包'
    };
    
    const fieldName = fieldMap[field] || field;
    
    if (strategy === 'lock') {
      // 锁定当日 - 添加到lockedFields
      if (!train.planChangeInfo.lockedFields.includes(field)) {
        train.planChangeInfo.lockedFields.push(field);
        message.success(`已锁定${fieldName}`);
      } else {
        message.info(`${fieldName}已处于锁定状态`);
      }
    } else {
      // 以昨日或客模为主 - 更新当日计划
      const fieldInfo = train.planChangeInfo[field as keyof typeof train.planChangeInfo] as any;
      if (fieldInfo) {
        if (strategy === 'yesterday') {
          fieldInfo.today = fieldInfo.yesterday;
          fieldInfo.diffType = 'none';
          message.success(`已将${fieldName}更新为昨日计划`);
        } else if (strategy === 'kemo') {
          fieldInfo.today = fieldInfo.kemo;
          fieldInfo.diffType = 'none';
          message.success(`已将${fieldName}更新为客模信息`);
        }
        
        // 重新计算变更状态
        recalculateChangeStatus();
      }
    }
    
    // 触发数据更新回调
    if (onDataChange) {
      onDataChange();
    }
    
    // 强制重新渲染
    setTrain({ ...train });
  };
  
  // 重新计算变更状态
  const recalculateChangeStatus = () => {
    if (!train || !train.planChangeInfo) return;
    
    let changeCount = 0;
    const fields = ['arrivalTime', 'departureTime', 'track', 'formation', 'trainModel', 'water', 'sewage', 'parcel'];
    
    fields.forEach(field => {
      const info = train.planChangeInfo![field as keyof typeof train.planChangeInfo] as any;
      if (info && info.diffType !== 'none') {
        changeCount++;
      }
    });
    
    train.planChangeInfo.changeCount = changeCount;
    train.planChangeInfo.hasAnyChange = changeCount > 0;
    
    // 如果没有变更了，设置changeType为none
    if (changeCount === 0) {
      train.planChangeInfo.changeType = 'none';
    }
  };
  
  // 导航到上一个/下一个变更项
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (changeItems.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : changeItems.length - 1));
    } else {
      setCurrentIndex(prev => (prev < changeItems.length - 1 ? prev + 1 : 0));
    }
  };

  // 渲染变更项卡片
  const renderChangeCard = (item: any, index: number) => {
    const config = changeTypeConfig[item.diffType as keyof typeof changeTypeConfig];
    const Icon = item.icon;

    // 判断值是否相同
    const isYesterdayDiff = item.today !== item.yesterday;
    const isKemoDiff = item.today !== item.kemo;
    
    // 检查是否被锁定
    const isLocked = planChangeInfo.lockedFields.includes(item.key);

    return (
      <div
        key={index}
        style={{
          background: colors.cardBackground,
          borderRadius: '12px',
          border: `2px solid ${isLocked ? '#8E8E93' : config.color}`,
          padding: '16px',
          marginBottom: '12px',
          boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          opacity: isLocked ? 0.8 : 1
        }}
      >
        {/* 卡片头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${colors.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon size={20} color={isLocked ? '#8E8E93' : config.color} />
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: colors.textPrimary
            }}>
              {item.label}变更
            </span>
            {isLocked && (
              <Tag
                style={{
                  background: '#8E8E9320',
                  borderColor: '#8E8E93',
                  color: '#8E8E93',
                  fontWeight: 500,
                  fontSize: '11px',
                  padding: '0 6px'
                }}
              >
                <Lock size={10} style={{ marginRight: '2px' }} />
                已锁定
              </Tag>
            )}
          </div>
          <Tag
            style={{
              background: `${config.color}20`,
              borderColor: config.color,
              color: config.color,
              fontWeight: 500
            }}
          >
            {config.label}
          </Tag>
        </div>

        {/* 三列对比信息 */}
        <div style={{ marginBottom: '16px' }}>
          {/* 当日计划 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: darkMode ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
            borderRadius: '8px',
            marginBottom: '8px'
          }}>
            <span style={{
              width: '80px',
              fontSize: '13px',
              color: colors.textSecondary,
              fontWeight: 500
            }}>
              当日计划
            </span>
            <span style={{
              flex: 1,
              fontSize: '14px',
              color: colors.accent,
              fontWeight: 600
            }}>
              {formatValue(item.today)}
            </span>
            <CheckCircle size={16} color={colors.accent} />
          </div>

          {/* 昨日计划 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: isYesterdayDiff
              ? (darkMode ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)')
              : 'transparent',
            borderRadius: '8px',
            marginBottom: '8px',
            border: isYesterdayDiff ? `1px dashed ${colors.blue}` : '1px dashed transparent'
          }}>
            <span style={{
              width: '80px',
              fontSize: '13px',
              color: colors.textSecondary,
              fontWeight: 500
            }}>
              昨日计划
            </span>
            <span style={{
              flex: 1,
              fontSize: '14px',
              color: isYesterdayDiff ? colors.blue : colors.textPrimary,
              fontWeight: isYesterdayDiff ? 600 : 400
            }}>
              {formatValue(item.yesterday)}
            </span>
            {isYesterdayDiff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight size={14} color={colors.blue} />
                <span style={{ fontSize: '12px', color: colors.blue }}>差异</span>
              </div>
            )}
          </div>

          {/* 客模信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: isKemoDiff
              ? (darkMode ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.08)')
              : 'transparent',
            borderRadius: '8px',
            border: isKemoDiff ? `1px dashed ${colors.orange}` : '1px dashed transparent'
          }}>
            <span style={{
              width: '80px',
              fontSize: '13px',
              color: colors.textSecondary,
              fontWeight: 500
            }}>
              客模信息
            </span>
            <span style={{
              flex: 1,
              fontSize: '14px',
              color: isKemoDiff ? colors.orange : colors.textPrimary,
              fontWeight: isKemoDiff ? 600 : 400
            }}>
              {formatValue(item.kemo)}
            </span>
            {isKemoDiff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight size={14} color={colors.orange} />
                <span style={{ fontSize: '12px', color: colors.orange }}>差异</span>
              </div>
            )}
          </div>
        </div>

        {/* 处理策略按钮 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <Button
            size="small"
            disabled={isLocked}
            onClick={() => handleResolve(item.key, 'yesterday')}
            style={{
              background: isLocked ? '#C7C7CC' : colors.blue,
              borderColor: isLocked ? '#C7C7CC' : colors.blue,
              color: 'white',
              fontSize: '12px'
            }}
          >
            以昨日为主
          </Button>
          <Button
            size="small"
            disabled={isLocked}
            onClick={() => handleResolve(item.key, 'kemo')}
            style={{
              background: isLocked ? '#C7C7CC' : colors.orange,
              borderColor: isLocked ? '#C7C7CC' : colors.orange,
              color: 'white',
              fontSize: '12px'
            }}
          >
            以客模为主
          </Button>
          <Button
            size="small"
            onClick={() => handleResolve(item.key, 'lock')}
            style={{
              background: isLocked ? '#34C759' : colors.textSecondary,
              borderColor: isLocked ? '#34C759' : colors.textSecondary,
              color: 'white',
              fontSize: '12px'
            }}
          >
            {isLocked ? '已锁定' : '锁定当日'}
          </Button>
        </div>
      </div>
    );
  };

  // 格式化值显示
  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    return String(value);
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
          zIndex: 999
        }}
        onClick={handleOverlayClick}
      />

      {/* 抽屉容器 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '700px',
          background: colors.background,
          zIndex: 1000,
          boxShadow: darkMode ? '-8px 0 32px rgba(0,0,0,0.5)' : '-8px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 头部 */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: colors.cardBackground
          }}
        >
          <div
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <GitCompare size={20} color={colors.accent} />
            计划变更详情
            {/* 导航按钮 */}
            {changeItems.length > 1 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                marginLeft: '12px',
                padding: '2px 8px',
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: '6px'
              }}>
                <Button
                  type="text"
                  size="small"
                  icon={<ChevronLeft size={14} />}
                  onClick={() => handleNavigate('prev')}
                  disabled={changeItems.length <= 1}
                  style={{ 
                    padding: '2px 4px',
                    color: colors.textSecondary,
                    minWidth: '24px'
                  }}
                />
                <span style={{ 
                  fontSize: '13px', 
                  color: colors.textSecondary,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {currentIndex + 1}/{changeItems.length}
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<ChevronRight size={14} />}
                  onClick={() => handleNavigate('next')}
                  disabled={changeItems.length <= 1}
                  style={{ 
                    padding: '2px 4px',
                    color: colors.textSecondary,
                    minWidth: '24px'
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: darkMode
                  ? 'rgba(10, 132, 255, 0.15)'
                  : 'rgba(0, 122, 255, 0.1)',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.accent,
                border: `1px solid ${darkMode ? 'rgba(10, 132, 255, 0.25)' : 'rgba(0, 122, 255, 0.2)'}`
              }}
            >
              {train.trainNo}
            </div>
            <Button
              type="text"
              icon={<X size={20} />}
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                color: colors.textSecondary,
                background: 'transparent',
                border: 'none'
              }}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.cardBackground,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: colors.textSecondary, fontSize: '14px' }}>变更项点：</span>
              <span style={{
                color: planChangeInfo.changeCount > 0 ? colors.error : colors.success,
                fontSize: '14px',
                fontWeight: 600
              }}>
                {planChangeInfo.changeCount} 项
              </span>
            </div>
            {planChangeInfo.changeType !== 'none' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: colors.textSecondary, fontSize: '14px' }}>变更类型：</span>
                <Tag
                  style={{
                    background: `${changeTypeConfig[planChangeInfo.changeType].color}20`,
                    borderColor: changeTypeConfig[planChangeInfo.changeType].color,
                    color: changeTypeConfig[planChangeInfo.changeType].color,
                    fontWeight: 500,
                    margin: 0
                  }}
                >
                  {changeTypeConfig[planChangeInfo.changeType].label}
                </Tag>
              </div>
            )}
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            比对时间：{new Date().toLocaleString('zh-CN')}
          </div>
        </div>

        {/* 内容区 - 变更项卡片列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            background: colors.background
          }}
        >
          {changeItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: colors.textSecondary
            }}>
              <CheckCircle size={48} color={colors.success} style={{ marginBottom: '16px' }} />
              <span style={{ fontSize: '16px' }}>无计划变更</span>
              <span style={{ fontSize: '14px', marginTop: '8px' }}>当日计划与昨日计划、客模信息一致</span>
            </div>
          ) : (
            // 只显示当前选中的变更项，或者显示全部
            changeItems.length > 1 ? (
              // 多个变更项时，只显示当前选中的
              renderChangeCard(changeItems[currentIndex], currentIndex)
            ) : (
              // 只有一个变更项时，直接显示
              renderChangeCard(changeItems[0], 0)
            )
          )}
        </div>

        {/* 底部按钮 - 批量处理 */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${colors.border}`,
            background: colors.cardBackground,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* 左侧：批量处理按钮 */}
          {changeItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="small"
                onClick={() => {
                  changeItems.forEach(item => {
                    if (!planChangeInfo.lockedFields.includes(item.key)) {
                      handleResolve(item.key, 'yesterday');
                    }
                  });
                }}
                style={{
                  background: colors.blue,
                  borderColor: colors.blue,
                  color: 'white',
                  fontSize: '12px'
                }}
              >
                全部以昨日为主
              </Button>
              <Button
                size="small"
                onClick={() => {
                  changeItems.forEach(item => {
                    if (!planChangeInfo.lockedFields.includes(item.key)) {
                      handleResolve(item.key, 'kemo');
                    }
                  });
                }}
                style={{
                  background: colors.orange,
                  borderColor: colors.orange,
                  color: 'white',
                  fontSize: '12px'
                }}
              >
                全部以客模为主
              </Button>
              <Button
                size="small"
                onClick={() => {
                  changeItems.forEach(item => {
                    handleResolve(item.key, 'lock');
                  });
                }}
                style={{
                  background: colors.textSecondary,
                  borderColor: colors.textSecondary,
                  color: 'white',
                  fontSize: '12px'
                }}
              >
                全部锁定
              </Button>
            </div>
          )}
          
          {/* 右侧：关闭按钮 */}
          <Button
            type="primary"
            onClick={onClose}
            style={{
              padding: '0 20px',
              fontSize: '13px',
              height: '36px',
              fontWeight: 500,
              borderRadius: '8px',
              background: colors.accent,
              border: 'none',
              color: '#FFFFFF'
            }}
          >
            关闭
          </Button>
        </div>
      </div>
    </>
  );
};

export default PlanChangeDrawer;
