import React, { useState, useMemo } from 'react';
import { Drawer, Button, Tag, Checkbox, Input } from 'antd';
import { X, Eye, Search, Clock, Check, Lock, ArrowRight } from 'lucide-react';
import { TrainSchedule, mockTrainSchedules } from '../mock-data';

interface PlanChangeOverviewProps {
  visible: boolean;
  onClose: () => void;
  trains: TrainSchedule[];
  darkMode?: boolean;
  onViewTrain?: (trainId: string) => void;
  onBatchConfirm?: (trainIds: string[]) => void;
  onBatchLock?: (trainIds: string[]) => void;
}

type BusinessChangeType = 
  | 'suspended' 
  | 'added' 
  | 'reduced'
  | 'trackChange' 
  | 'trainModelChange' 
  | 'waterChange' 
  | 'sewageChange' 
  | 'timeChange'
  | 'stationChange';

const changeTypeConfig: Record<BusinessChangeType, { label: string; color: string }> = {
  suspended: { label: '停运', color: '#FF3B30' },
  added: { label: '新增', color: '#FF3B30' },
  reduced: { label: '减少', color: '#FF3B30' },
  trackChange: { label: '变股道', color: '#007AFF' },
  trainModelChange: { label: '变车型', color: '#AF52DE' },
  waterChange: { label: '上水调整', color: '#34C759' },
  sewageChange: { label: '吸污调整', color: '#34C759' },
  timeChange: { label: '变时间', color: '#007AFF' },
  stationChange: { label: '变站名', color: '#007AFF' },
};

const planStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  synced: { label: '已同步', color: '#34C759', icon: <Check size={14} /> },
  pending: { label: '待确认', color: '#FF9500', icon: <Clock size={14} /> },
  locked: { label: '已锁定', color: '#8E8E93', icon: <Lock size={14} /> },
};

const parseChangeSummary = (summary: string) => {
  const changes: { type: string; from: string; to: string }[] = [];
  
  const trackMatch = summary.match(/股道由([^变]+)变更为([^变]+)/);
  if (trackMatch) {
    changes.push({ type: '股道', from: trackMatch[1], to: trackMatch[2] });
  }
  
  const modelMatch = summary.match(/车型由([^变]+)变更为([^变]+)/);
  if (modelMatch) {
    changes.push({ type: '车型', from: modelMatch[1], to: modelMatch[2] });
  }
  
  const timeMatch = summary.match(/到发时间由([^变]+)变更为([^变]+)/);
  if (timeMatch) {
    changes.push({ type: '时间', from: timeMatch[1], to: timeMatch[2] });
  }
  
  const destMatch = summary.match(/终到站由([^变]+)变更为([^变]+)/);
  if (destMatch) {
    changes.push({ type: '终到站', from: destMatch[1], to: destMatch[2] });
  }
  
  const originMatch = summary.match(/始发站由([^变]+)变更为([^变]+)/);
  if (originMatch) {
    changes.push({ type: '始发站', from: originMatch[1], to: originMatch[2] });
  }
  
  return changes;
};

export const PlanChangeOverview: React.FC<PlanChangeOverviewProps> = ({
  visible,
  onClose,
  darkMode = false,
  onViewTrain,
  onBatchConfirm,
  onBatchLock,
}) => {
  const [selectedTrainIds, setSelectedTrainIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<BusinessChangeType | 'all' | 'pending' | 'unlocked'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const colors = {
    background: darkMode ? '#1C1C1E' : '#F2F2F7',
    cardBackground: darkMode ? '#2C2C2E' : '#FFFFFF',
    textPrimary: darkMode ? '#FFFFFF' : '#000000',
    textSecondary: darkMode ? '#98989D' : '#8E8E93',
    border: darkMode ? '#38383A' : '#E5E5EA',
    accent: '#007AFF',
  };

  const changedTrains = useMemo(() => {
    if (!mockTrainSchedules || !Array.isArray(mockTrainSchedules)) return [];
    return mockTrainSchedules.filter(train => train.planChangeInfo?.hasAnyChange);
  }, []);

  const changeTypeStats = useMemo(() => {
    const stats: Record<BusinessChangeType, number> = {
      suspended: 0,
      added: 0,
      reduced: 0,
      trackChange: 0,
      trainModelChange: 0,
      waterChange: 0,
      sewageChange: 0,
      timeChange: 0,
      stationChange: 0,
    };
    const statusStats: { pending: number; unlocked: number } = { pending: 0, unlocked: 0 };
    
    changedTrains.forEach(train => {
      const types = train.planChangeInfo?.businessChangeTypes || [];
      types.forEach(type => {
        if (type in stats) {
          stats[type as BusinessChangeType]++;
        }
      });
      if (train.planChangeInfo?.planStatus === 'pending') {
        statusStats.pending++;
      }
      if (train.planChangeInfo?.planStatus !== 'locked') {
        statusStats.unlocked++;
      }
    });
    
    return { ...stats, ...statusStats };
  }, [changedTrains]);

  const filteredTrains = useMemo(() => {
    let result = changedTrains;
    
    if (activeFilter === 'pending') {
      result = result.filter(train => train.planChangeInfo?.planStatus === 'pending');
    } else if (activeFilter === 'unlocked') {
      result = result.filter(train => train.planChangeInfo?.planStatus !== 'locked');
    } else if (activeFilter !== 'all') {
      result = result.filter(train => 
        train.planChangeInfo?.businessChangeTypes?.includes(activeFilter)
      );
    }
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(train => 
        train.trainNo.toLowerCase().includes(lowerTerm)
      );
    }
    
    return result;
  }, [changedTrains, activeFilter, searchTerm]);

  const toggleTrainSelection = (trainId: string) => {
    setSelectedTrainIds(prev => 
      prev.includes(trainId) 
        ? prev.filter(id => id !== trainId) 
        : [...prev, trainId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTrainIds.length === filteredTrains.length) {
      setSelectedTrainIds([]);
    } else {
      setSelectedTrainIds(filteredTrains.map(t => t.id));
    }
  };

  const handleBatchConfirm = () => {
    if (selectedTrainIds.length > 0 && onBatchConfirm) {
      onBatchConfirm(selectedTrainIds);
      setSelectedTrainIds([]);
    }
  };

  const handleBatchLock = () => {
    if (selectedTrainIds.length > 0 && onBatchLock) {
      onBatchLock(selectedTrainIds);
      setSelectedTrainIds([]);
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Search size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>
              计划变更总览
            </div>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>
              共 {changedTrains.length} 列
            </div>
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={720}
      maskClosable={true}
      destroyOnClose={false}
      styles={{
        header: { 
          background: colors.cardBackground,
          borderBottom: `1px solid ${colors.border}`,
          padding: '16px 24px'
        },
        body: { 
          background: colors.background,
          padding: '16px 24px'
        }
      }}
      closeIcon={
        <Button 
          type="text" 
          icon={<X size={20} />} 
          onClick={onClose}
          style={{ color: colors.textSecondary }}
        />
      }
    >
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <Tag
          onClick={() => setActiveFilter('all')}
          style={{
            cursor: 'pointer',
            background: activeFilter === 'all' ? `${colors.accent}15` : 'transparent',
            borderColor: activeFilter === 'all' ? colors.accent : colors.border,
            color: activeFilter === 'all' ? colors.accent : colors.textSecondary,
            fontWeight: 500,
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          全部 {changedTrains.length}
        </Tag>
        
        <Tag
          onClick={() => setActiveFilter('pending')}
          style={{
            cursor: 'pointer',
            background: activeFilter === 'pending' ? '#FF950015' : 'transparent',
            borderColor: activeFilter === 'pending' ? '#FF9500' : colors.border,
            color: activeFilter === 'pending' ? '#FF9500' : colors.textSecondary,
            fontWeight: 500,
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          待确认 {changeTypeStats.pending || 0}
        </Tag>
        
        <Tag
          onClick={() => setActiveFilter('unlocked')}
          style={{
            cursor: 'pointer',
            background: activeFilter === 'unlocked' ? '#8E8E9315' : 'transparent',
            borderColor: activeFilter === 'unlocked' ? '#8E8E93' : colors.border,
            color: activeFilter === 'unlocked' ? '#8E8E93' : colors.textSecondary,
            fontWeight: 500,
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          未锁定 {changeTypeStats.unlocked || 0}
        </Tag>
        
        {Object.entries(changeTypeConfig).map(([type, config]) => {
          const count = changeTypeStats[type as BusinessChangeType];
          if (count === 0) return null;
          return (
            <Tag
              key={type}
              onClick={() => setActiveFilter(type as BusinessChangeType)}
              style={{
                cursor: 'pointer',
                background: activeFilter === type ? `${config.color}15` : 'transparent',
                borderColor: activeFilter === type ? config.color : colors.border,
                color: activeFilter === type ? config.color : colors.textSecondary,
                fontWeight: 500,
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              {config.label}
              <span style={{ marginLeft: '4px', opacity: 0.7 }}>{count}</span>
            </Tag>
          );
        })}
      </div>

      <Input
        placeholder="搜索车次号..."
        prefix={<Search size={16} color={colors.textSecondary} />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '16px' }}
      />

      {selectedTrainIds.length > 0 && (
        <div style={{
          background: `${colors.accent}10`,
          border: `1px solid ${colors.accent}30`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>
            已选择 <strong>{selectedTrainIds.length}</strong> 列
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              size="small"
              onClick={handleBatchConfirm}
              style={{ background: '#34C759', borderColor: '#34C759' }}
            >
              批量确认
            </Button>
            <Button
              type="default"
              size="small"
              onClick={handleBatchLock}
            >
              批量锁定
            </Button>
          </div>
        </div>
      )}

      <div style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '12px',
          padding: '0 4px'
        }}>
          <Checkbox
            checked={selectedTrainIds.length === filteredTrains.length && filteredTrains.length > 0}
            indeterminate={selectedTrainIds.length > 0 && selectedTrainIds.length < filteredTrains.length}
            onChange={toggleSelectAll}
          />
          <span style={{ fontSize: '13px', color: colors.textSecondary, marginLeft: '8px' }}>
            全选
          </span>
        </div>

        {filteredTrains.map((train) => {
          const info = train.planChangeInfo;
          if (!info) return null;
          
          const isSelected = selectedTrainIds.includes(train.id);
          const statusConfig = info.planStatus ? planStatusConfig[info.planStatus] : { label: '未知', color: '#8E8E93', icon: null };
          const sourceLabel = info.changeSource === 'manual' ? '人工修改' : 
                             info.changeSource === 'kemo' ? '客模变更' : '客模变更';
          const changes = parseChangeSummary(info.changeSummary || '');

          return (
            <div
              key={train.id}
              style={{
                background: colors.cardBackground,
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '10px',
                border: isSelected ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = darkMode ? '#3A3A3C' : '#F9F9F9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.cardBackground;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ paddingTop: '4px' }}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleTrainSelection(train.id)}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: colors.textPrimary,
                      }}>
                        {train.trainNo}
                      </span>

                      {info.businessChangeTypes && info.businessChangeTypes.length > 0 && info.businessChangeTypes.map((type) => {
                        const config = changeTypeConfig[type as BusinessChangeType];
                        if (!config) return null;
                        return (
                          <Tag
                            key={type}
                            style={{
                              background: `${config.color}15`,
                              borderColor: config.color,
                              color: config.color,
                              fontWeight: 500,
                              fontSize: '11px',
                              margin: 0,
                            }}
                          >
                            {config.label}
                          </Tag>
                        );
                      })}
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: statusConfig.color,
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: darkMode ? '#38383A' : '#F5F5F7',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '13px',
                        color: colors.textSecondary,
                        fontWeight: 600,
                      }}>
                        {sourceLabel}
                      </span>
                    </div>

                    {changes.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        {changes.map((change, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                          }}>
                            <span style={{
                              color: colors.textSecondary,
                              fontWeight: 500,
                              minWidth: '50px',
                            }}>
                              {change.type}：
                            </span>
                            <span style={{
                              color: colors.textSecondary,
                              textDecoration: 'line-through',
                            }}>
                              {change.from}
                            </span>
                            <ArrowRight size={14} color={colors.accent} />
                            <span style={{
                              color: colors.textPrimary,
                              fontWeight: 600,
                            }}>
                              {change.to}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                        fontWeight: 500,
                      }}>
                        {info.changeSummary}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="text"
                  size="small"
                  icon={<Eye size={16} />}
                  onClick={() => onViewTrain?.(train.id)}
                  style={{
                    color: colors.accent,
                    padding: '4px 8px',
                  }}
                >
                  查看
                </Button>
              </div>
            </div>
          );
        })}

        {filteredTrains.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: colors.textSecondary,
            fontSize: '14px',
          }}>
            暂无匹配的变更车次
          </div>
        )}
      </div>
    </Drawer>
  );
};
