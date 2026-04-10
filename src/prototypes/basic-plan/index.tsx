/**
 * @name 基本计划
 *
 * 铁路基本运行图管理页面
 * 展示全路所有开行列车信息，通过图号区分
 * 
 * 设计规范：大胆创新、界面色彩参考 macOS 统一风格样式
 */

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, RotateCcw, Repeat, Train as TrainIcon, ChevronDown, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockBasicPlanTrains, diagramNos, stationNames, Train, validateTrainData, calculateDiagramChanges, DiagramChanges } from './mock-data';
import './style.css';

const macOSColors = {
  background: '#F5F5F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#86868B',
  accent: '#007AFF',
  accentHover: '#0051D5',
  border: '#D2D2D7',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30'
};

const Component: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<string>(diagramNos[diagramNos.length - 1]);
  const [prevDiagram, setPrevDiagram] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'high-speed' | 'normal'>('all');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [showDiagramDropdown, setShowDiagramDropdown] = useState(false);
  const [showChangesDrawer, setShowChangesDrawer] = useState<'added' | 'removed' | 'modified' | null>(null);

  const filteredTrains = useMemo(() => {
    return mockBasicPlanTrains.filter(train => {
      const matchesDiagram = train.diagramNo === selectedDiagram;
      
      const matchesSearch = !searchTerm.trim() || 
        train.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.diagramNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStation = !selectedStation || 
        train.originStation.includes(selectedStation) ||
        train.destinationStation.includes(selectedStation) ||
        train.stations.some(s => s.stationName.includes(selectedStation));

      const matchesType = filterType === 'all' || train.trainType === filterType;

      return matchesDiagram && matchesSearch && matchesStation && matchesType;
    });
  }, [selectedDiagram, searchTerm, selectedStation, filterType]);

  const currentTrains = useMemo(() => {
    return mockBasicPlanTrains.filter(t => t.diagramNo === selectedDiagram);
  }, [selectedDiagram]);

  const prevTrains = useMemo(() => {
    if (!prevDiagram) return [];
    return mockBasicPlanTrains.filter(t => t.diagramNo === prevDiagram);
  }, [prevDiagram]);

  const diagramChanges = useMemo((): DiagramChanges | null => {
    if (!prevDiagram || prevTrains.length === 0) return null;
    return calculateDiagramChanges(currentTrains, prevTrains);
  }, [currentTrains, prevTrains, prevDiagram]);

  const stats = useMemo(() => {
    const trainModelCounts = new Map<string, number>();
    const bureauCounts = new Map<string, number>();
    const formationCounts = new Map<number, number>();

    currentTrains.forEach(train => {
      if (train.trainModel) {
        trainModelCounts.set(train.trainModel, (trainModelCounts.get(train.trainModel) || 0) + 1);
      }
      if (train.formationCount) {
        formationCounts.set(train.formationCount, (formationCounts.get(train.formationCount) || 0) + 1);
      }
      if (train.passingBureaus) {
        train.passingBureaus.forEach(bureau => {
          bureauCounts.set(bureau, (bureauCounts.get(bureau) || 0) + 1);
        });
      }
    });

    return {
      total: currentTrains.length,
      highSpeed: currentTrains.filter(t => t.trainType === 'high-speed').length,
      normal: currentTrains.filter(t => t.trainType === 'normal').length,
      daily: currentTrains.filter(t => t.operationRule === 'daily').length,
      alternate: currentTrains.filter(t => t.operationRule === 'alternate').length,
      custom: currentTrains.filter(t => t.operationRule === 'custom').length,
      trainModelCounts,
      bureauCounts,
      formationCounts
    };
  }, [currentTrains]);

  const getOperationRuleLabel = (rule: string) => {
    switch (rule) {
      case 'daily': return '每日开行';
      case 'alternate': return '隔日开行';
      case 'custom': return '周期开行';
      default: return rule;
    }
  };

  const getOperationRuleIcon = (rule: string) => {
    switch (rule) {
      case 'daily': return <Calendar size={14} />;
      case 'alternate': return <RotateCcw size={14} />;
      case 'custom': return <Repeat size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  const getOperationRuleColor = (rule: string) => {
    switch (rule) {
      case 'daily': return macOSColors.success;
      case 'alternate': return macOSColors.warning;
      case 'custom': return macOSColors.accent;
      default: return macOSColors.textSecondary;
    }
  };

  const renderOperationPattern = (train: Train) => {
    if (train.operationRule === 'daily') return null;
    
    return (
      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
        {train.operationPattern.map((run, idx) => (
          <div
            key={idx}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              background: run ? `${getOperationRuleColor(train.operationRule)}20` : `${macOSColors.border}40`,
              color: run ? getOperationRuleColor(train.operationRule) : macOSColors.textSecondary,
              border: `1px solid ${run ? getOperationRuleColor(train.operationRule) : macOSColors.border}`
            }}
          >
            {idx + 1}
          </div>
        ))}
      </div>
    );
  };

  const validation = selectedTrain ? validateTrainData(selectedTrain) : { valid: true, issues: [] };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: macOSColors.background,
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: macOSColors.textPrimary,
              margin: 0
            }}>
              基本计划
            </h1>
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDiagramDropdown(!showDiagramDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: macOSColors.cardBackground,
                  border: `1px solid ${macOSColors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: macOSColors.textPrimary,
                  cursor: 'pointer'
                }}
              >
                <MapPin size={18} color={macOSColors.accent} />
                {selectedDiagram}
                <ChevronDown size={16} color={macOSColors.textSecondary} />
              </button>
              
              {showDiagramDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: macOSColors.cardBackground,
                  border: `1px solid ${macOSColors.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  minWidth: '140px'
                }}>
                  {[...diagramNos].reverse().map(diagram => (
                    <button
                      key={diagram}
                      onClick={() => {
                        if (diagram !== selectedDiagram) {
                          setPrevDiagram(selectedDiagram);
                          setSelectedDiagram(diagram);
                        }
                        setShowDiagramDropdown(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        background: diagram === selectedDiagram ? `${macOSColors.accent}10` : 'transparent',
                        border: 'none',
                        fontSize: '14px',
                        color: diagram === selectedDiagram ? macOSColors.accent : macOSColors.textPrimary,
                        cursor: 'pointer',
                        fontWeight: diagram === selectedDiagram ? 600 : 400
                      }}
                    >
                      {diagram}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <MapPin size={18} color={macOSColors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <div
              onClick={() => setShowStationDropdown(!showStationDropdown)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                border: `1px solid ${macOSColors.border}`,
                fontSize: '14px',
                background: macOSColors.cardBackground,
                color: selectedStation ? macOSColors.textPrimary : macOSColors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{selectedStation || '选择站名...'}</span>
              <ChevronDown size={16} color={macOSColors.textSecondary} />
            </div>
            {showStationDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: macOSColors.cardBackground,
                border: `1px solid ${macOSColors.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                zIndex: 100,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div
                  onClick={() => {
                    setSelectedStation('');
                    setShowStationDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '14px',
                    color: macOSColors.textSecondary,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${macOSColors.border}`
                  }}
                >
                  全部站名
                </div>
                {stationNames
                  .filter(station => 
                    !searchTerm || station.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(station => (
                    <div
                      key={station}
                      onClick={() => {
                        setSelectedStation(station);
                        setShowStationDropdown(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        background: station === selectedStation ? `${macOSColors.accent}10` : 'transparent',
                        border: 'none',
                        fontSize: '14px',
                        color: station === selectedStation ? macOSColors.accent : macOSColors.textPrimary,
                        cursor: 'pointer'
                      }}
                    >
                      {station}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={18} color={macOSColors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜索图号、车次..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                border: `1px solid ${macOSColors.border}`,
                fontSize: '14px',
                background: macOSColors.cardBackground,
                color: macOSColors.textPrimary,
                outline: 'none'
              }}
            />
          </div>
        </div>

        {diagramChanges && prevDiagram && (
          <div style={{
            background: `${macOSColors.cardBackground}`,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${macOSColors.border}`,
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color={macOSColors.textSecondary} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: macOSColors.textPrimary }}>
                  与 {prevDiagram} 对比
                </span>
              </div>
              <span style={{ fontSize: '12px', color: macOSColors.textSecondary }}>
                当前图: {selectedDiagram}
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {[
                { 
                  type: 'added' as const,
                  label: '新增车次', 
                  value: diagramChanges.added, 
                  color: macOSColors.success,
                  icon: '+',
                  trains: diagramChanges.addedTrains
                },
                { 
                  type: 'removed' as const,
                  label: '减少车次', 
                  value: diagramChanges.removed, 
                  color: macOSColors.error,
                  icon: '−',
                  trains: diagramChanges.removedTrains
                },
                { 
                  type: 'modified' as const,
                  label: '变更车次', 
                  value: diagramChanges.modified, 
                  color: macOSColors.warning,
                  icon: '~',
                  trains: diagramChanges.modifiedTrains
                },
                { 
                  type: 'unchanged' as const,
                  label: '保持不变', 
                  value: diagramChanges.unchanged, 
                  color: macOSColors.textSecondary,
                  icon: '=',
                  trains: []
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => item.type !== 'unchanged' && item.value > 0 && setShowChangesDrawer(item.type)}
                  style={{
                    background: `${item.color}10`,
                    borderRadius: '10px',
                    padding: '14px',
                    textAlign: 'center',
                    cursor: item.type !== 'unchanged' && item.value > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (item.type !== 'unchanged' && item.value > 0) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: item.color,
                      fontFamily: 'SF Mono, monospace'
                    }}>
                      {item.icon}
                    </span>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: item.color
                    }}>
                      {item.value}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: macOSColors.textSecondary,
                    fontWeight: 500
                  }}>
                    {item.label}
                  </div>
                  {item.type !== 'unchanged' && item.value > 0 && (
                    <div style={{
                      fontSize: '11px',
                      color: item.color,
                      marginTop: '4px',
                      opacity: 0.7
                    }}>
                      点击查看
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px', 
          marginBottom: '24px'
        }}>
          {[
            { label: '总列数', value: stats.total, icon: <TrainIcon size={20} />, color: macOSColors.accent },
            { label: '高铁', value: stats.highSpeed, icon: <TrainIcon size={20} />, color: macOSColors.success },
            { label: '普速', value: stats.normal, icon: <TrainIcon size={20} />, color: macOSColors.warning },
            { label: '开行类型', value: `${stats.daily}/${stats.alternate}/${stats.custom}`, icon: <Calendar size={20} />, color: macOSColors.textSecondary }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: macOSColors.cardBackground,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${macOSColors.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${stat.color}15`
                }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: macOSColors.textPrimary }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '13px', color: macOSColors.textSecondary }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>



        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'all', label: '全部' },
            { key: 'high-speed', label: '高铁' },
            { key: 'normal', label: '普速' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: filterType === filter.key ? 'none' : `1px solid ${macOSColors.border}`,
                background: filterType === filter.key ? macOSColors.accent : macOSColors.cardBackground,
                color: filterType === filter.key ? '#FFFFFF' : macOSColors.textPrimary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

          <div style={{
            background: macOSColors.cardBackground,
            borderRadius: '16px',
            border: `1px solid ${macOSColors.border}`,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(50px, 60px) minmax(80px, 90px) minmax(80px, 90px) minmax(90px, 110px) minmax(90px, 110px) minmax(80px, 90px) minmax(60px, 70px) minmax(60px, 70px) minmax(80px, 100px) minmax(80px, 90px) minmax(200px, 1fr) minmax(80px, 100px)',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: `2px solid ${macOSColors.border}`,
              background: `${macOSColors.background}80`
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>序号</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>车次</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>车型</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>始发站</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>终到站</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>编组/定员</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>周期</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>规则</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>调向站</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>开行类型</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>交路信息/经过线路</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: macOSColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>操作</div>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 480px)', overflowY: 'auto' }}>
              {filteredTrains.map((train, index) => (
                <div
                  key={train.id}
                  onClick={() => setSelectedTrain(train)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(50px, 60px) minmax(80px, 90px) minmax(80px, 90px) minmax(90px, 110px) minmax(90px, 110px) minmax(80px, 90px) minmax(60px, 70px) minmax(60px, 70px) minmax(80px, 100px) minmax(80px, 90px) minmax(200px, 1fr) minmax(80px, 100px)',
                    gap: '12px',
                    padding: '14px 20px',
                    borderBottom: `1px solid ${macOSColors.border}30`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: index % 2 === 0 ? macOSColors.cardBackground : `${macOSColors.background}30`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${macOSColors.accent}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? macOSColors.cardBackground : `${macOSColors.background}30`;
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: macOSColors.textSecondary, display: 'flex', alignItems: 'center' }}>
                    {index + 1}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: macOSColors.textPrimary,
                      fontFamily: 'SF Mono, monospace'
                    }}>
                      {train.trainNo}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {train.trainModel && (
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: `${macOSColors.textSecondary}10`,
                        color: macOSColors.textSecondary,
                        fontWeight: 500
                      }}>
                        {train.trainModel}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: macOSColors.textPrimary }}>
                      {train.originStation}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: macOSColors.textPrimary }}>
                      {train.destinationStation}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: `${macOSColors.success}10`,
                      color: macOSColors.success,
                      fontWeight: 600
                    }}>
                      {train.formationCount}
                    </span>
                    <span style={{ fontSize: '12px', color: macOSColors.textSecondary }}>
                      {train.capacity}人
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: macOSColors.textPrimary }}>
                      {train.operationCycle}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {train.operationRule === 'daily' && (
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        background: `${macOSColors.success}15`,
                        color: macOSColors.success,
                        fontWeight: 600
                      }}>
                        每日
                      </span>
                    )}
                    {train.operationRule === 'alternate' && (
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        background: `${macOSColors.warning}15`,
                        color: macOSColors.warning,
                        fontWeight: 600
                      }}>
                        隔日
                      </span>
                    )}
                    {train.operationRule === 'custom' && (
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        background: `${macOSColors.accent}15`,
                        color: macOSColors.accent,
                        fontWeight: 600
                      }}>
                        周期
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {train.turningStation && (
                      <span style={{
                        fontSize: '12px',
                        color: macOSColors.warning,
                        fontWeight: 500
                      }}>
                        {train.turningStation}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {train.remarks && (
                      <span style={{
                        fontSize: '12px',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        background: `${macOSColors.accent}10`,
                        color: macOSColors.accent,
                        fontWeight: 500
                      }}>
                        {train.remarks}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                    {train.routeInfo && (
                      <span style={{
                        fontSize: '11px',
                        color: macOSColors.textSecondary,
                        marginBottom: '2px',
                        display: 'block',
                        width: '100%'
                      }}>
                        {train.routeInfo}
                      </span>
                    )}
                    {train.passingLines && train.passingLines.slice(0, 4).map(line => (
                      <span key={line} style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${macOSColors.accent}10`,
                        color: macOSColors.accent,
                        fontWeight: 500
                      }}>
                        {line}
                      </span>
                    ))}
                    {train.passingLines && train.passingLines.length > 4 && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${macOSColors.textSecondary}10`,
                        color: macOSColors.textSecondary,
                        fontWeight: 500
                      }}>
                        +{train.passingLines.length - 4}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrain(train);
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: macOSColors.accent,
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.background = macOSColors.accentHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = macOSColors.accent;
                      }}
                    >
                      站详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {filteredTrains.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: macOSColors.textSecondary
          }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontSize: '16px' }}>未找到匹配的列车</div>
          </div>
        )}
      </div>

      {selectedTrain && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 999
            }}
            onClick={() => setSelectedTrain(null)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '750px',
            maxHeight: '85vh',
            background: macOSColors.cardBackground,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${macOSColors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexShrink: 0
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 700, color: macOSColors.textPrimary }}>
                    {selectedTrain.trainNo}
                  </span>
                  {selectedTrain.trainModel && (
                    <span style={{ 
                      fontSize: '13px', 
                      color: macOSColors.textSecondary,
                      background: `${macOSColors.border}40`,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {selectedTrain.trainModel}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: macOSColors.textSecondary }}>
                  <span>图号: {selectedTrain.diagramNo}</span>
                  {selectedTrain.formationCount && <span>{selectedTrain.formationCount}辆编组</span>}
                  {selectedTrain.capacity && <span>定员 {selectedTrain.capacity}</span>}
                  {selectedTrain.routeInfo && <span>交路: {selectedTrain.routeInfo}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedTrain(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: `${macOSColors.border}30`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '16px'
                }}
              >
                <X size={20} color={macOSColors.textSecondary} />
              </button>
            </div>

            {!validation.valid && (
              <div style={{
                padding: '16px 24px',
                background: `${macOSColors.error}10`,
                borderBottom: `1px solid ${macOSColors.error}20`,
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={20} color={macOSColors.error} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: macOSColors.error, marginBottom: '6px' }}>
                      数据验证发现问题
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: macOSColors.error }}>
                      {validation.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              padding: '16px 24px',
              background: `${macOSColors.background}50`,
              borderBottom: `1px solid ${macOSColors.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedTrain.passingLines && selectedTrain.passingLines.map((line, idx) => (
                  <span key={idx} style={{
                    fontSize: '12px',
                    padding: '5px 12px',
                    borderRadius: '14px',
                    background: `${macOSColors.accent}12`,
                    color: macOSColors.accent,
                    fontWeight: 500
                  }}>
                    {line}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedTrain.passingBureaus && selectedTrain.passingBureaus.map((bureau, idx) => (
                  <span key={idx} style={{
                    fontSize: '12px',
                    padding: '5px 12px',
                    borderRadius: '14px',
                    background: `${macOSColors.textSecondary}10`,
                    color: macOSColors.textSecondary,
                    fontWeight: 500
                  }}>
                    {bureau}
                  </span>
                ))}
              </div>
              {selectedTrain.turningStation && (
                <span style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '14px',
                  background: `${macOSColors.warning}12`,
                  color: macOSColors.warning,
                  fontWeight: 500
                }}>
                  调向站: {selectedTrain.turningStation}
                </span>
              )}
              {selectedTrain.remarks && (
                <span style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '14px',
                  background: `${macOSColors.success}12`,
                  color: macOSColors.success,
                  fontWeight: 500
                }}>
                  {selectedTrain.remarks}
                </span>
              )}
            </div>

            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                color: macOSColors.textSecondary,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                停靠站详情 ({selectedTrain.stations.length}站)
              </div>
              <div style={{ position: 'relative' }}>
                {selectedTrain.stations.map((station, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === selectedTrain.stations.length - 1;
                  
                  return (
                    <div key={station.stationOrder} style={{ 
                      display: 'flex', 
                      marginBottom: isLast ? 0 : '20px',
                      background: idx % 2 === 0 ? `${macOSColors.background}30` : 'transparent',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginLeft: '-16px',
                      marginRight: '-16px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        marginRight: '16px',
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isFirst || isLast ? macOSColors.accent : macOSColors.cardBackground,
                          border: `3px solid ${isFirst || isLast ? macOSColors.accent : macOSColors.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                          boxShadow: isFirst || isLast ? `0 2px 8px ${macOSColors.accent}30` : 'none'
                        }}>
                          {isFirst || isLast ? (
                            <CheckCircle2 size={14} color="#FFFFFF" />
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: macOSColors.textSecondary }}>
                              {station.stationOrder}
                            </span>
                          )}
                        </div>
                        {!isLast && (
                          <div style={{
                            width: '2px',
                            flex: 1,
                            background: macOSColors.border,
                            marginTop: '4px'
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          gap: '16px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: macOSColors.textPrimary, marginBottom: '4px' }}>
                              {station.stationName}
                              {isFirst && <span style={{ marginLeft: '8px', fontSize: '11px', color: macOSColors.success, fontWeight: 500 }}>始发站</span>}
                              {isLast && <span style={{ marginLeft: '8px', fontSize: '11px', color: macOSColors.error, fontWeight: 500 }}>终到站</span>}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: macOSColors.textSecondary }}>
                              {station.arrivalTrainNo && !isFirst && <span>到达车次: {station.arrivalTrainNo}</span>}
                              {station.departureTrainNo && !isLast && <span>出发车次: {station.departureTrainNo}</span>}
                              {station.track && <span>股道: {station.track}</span>}
                              {station.updateTime && <span>更新: {station.updateTime.split(' ')[0]}</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '140px' }}>
                            {!isFirst && station.arrivalTime && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                                <Clock size={14} color={macOSColors.textSecondary} />
                                <span style={{ 
                                  fontSize: '15px', 
                                  fontWeight: 500, 
                                  color: macOSColors.textSecondary,
                                  fontFamily: 'SF Mono, monospace'
                                }}>
                                  {station.arrivalTime}
                                </span>
                                <span style={{ fontSize: '11px', color: macOSColors.textSecondary }}>到</span>
                              </div>
                            )}
                            {!isLast && station.departureTime && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <Clock size={14} color={macOSColors.accent} />
                                <span style={{ 
                                  fontSize: '15px', 
                                  fontWeight: 600, 
                                  color: macOSColors.accent,
                                  fontFamily: 'SF Mono, monospace'
                                }}>
                                  {station.departureTime}
                                </span>
                                <span style={{ fontSize: '11px', color: macOSColors.accent }}>发</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${macOSColors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '12px', color: macOSColors.textSecondary }}>
                共 {selectedTrain.stations.length} 个停靠站
              </div>
              <button
                onClick={() => setSelectedTrain(null)}
                style={{
                  padding: '10px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: macOSColors.accent,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = macOSColors.accentHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = macOSColors.accent;
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}

      {showChangesDrawer && diagramChanges && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 999
            }}
            onClick={() => setShowChangesDrawer(null)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            maxHeight: '70vh',
            background: macOSColors.cardBackground,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${macOSColors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: macOSColors.textPrimary }}>
                  {showChangesDrawer === 'added' && '新增车次列表'}
                  {showChangesDrawer === 'removed' && '减少车次列表'}
                  {showChangesDrawer === 'modified' && '变更车次列表'}
                </div>
                <div style={{ fontSize: '13px', color: macOSColors.textSecondary, marginTop: '4px' }}>
                  共 {
                    showChangesDrawer === 'added' ? diagramChanges.added :
                    showChangesDrawer === 'removed' ? diagramChanges.removed :
                    diagramChanges.modified
                  } 个车次
                </div>
              </div>
              <button
                onClick={() => setShowChangesDrawer(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: `${macOSColors.border}30`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '16px'
                }}
              >
                <X size={20} color={macOSColors.textSecondary} />
              </button>
            </div>

            <div style={{
              padding: '16px 24px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0
            }}>
              {(() => {
                let trains: Train[] = [];
                if (showChangesDrawer === 'added') trains = diagramChanges.addedTrains;
                if (showChangesDrawer === 'removed') trains = diagramChanges.removedTrains;
                if (showChangesDrawer === 'modified') trains = diagramChanges.modifiedTrains;

                return trains.map((train, idx) => (
                  <div
                    key={train.id}
                    onClick={() => {
                      setSelectedTrain(train);
                      setShowChangesDrawer(null);
                    }}
                    style={{
                      background: macOSColors.background,
                      borderRadius: '10px',
                      padding: '14px 16px',
                      marginBottom: idx === trains.length - 1 ? 0 : '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `1px solid ${macOSColors.border}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${macOSColors.accent}10`;
                      e.currentTarget.style.borderColor = macOSColors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = macOSColors.background;
                      e.currentTarget.style.borderColor = macOSColors.border;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: macOSColors.textPrimary }}>
                          {train.trainNo}
                        </div>
                        <div style={{ fontSize: '12px', color: macOSColors.textSecondary, marginTop: '2px' }}>
                          {train.originStation} → {train.destinationStation}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {train.trainModel && (
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            background: `${macOSColors.textSecondary}10`,
                            color: macOSColors.textSecondary,
                            fontWeight: 500
                          }}>
                            {train.trainModel}
                          </span>
                        )}
                        <span style={{ fontSize: '13px', color: macOSColors.accent, fontWeight: 500 }}>
                          查看 →
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${macOSColors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <button
                onClick={() => setShowChangesDrawer(null)}
                style={{
                  padding: '10px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: macOSColors.accent,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = macOSColors.accentHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = macOSColors.accent;
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Component;
