/**
 * @name 客运模板 V2
 *
 * 车次生命周期管理页面 - 优化版
 * 简化设计风格，保留配色方案
 */

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Trash2, Upload, Download, Edit3, History, X, CheckCircle2, Play, Clock, XCircle,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, Settings, Monitor, Mic, Users,
  MapPin, Train, Layers, Route, ArrowRight, Filter, MoreHorizontal, ChevronDown, TrainFront
} from 'lucide-react';
import { mockPassengerTemplateTrains, PassengerTrain } from './mock-data';
import './style.css';

const Component: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState('重庆东站');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'running' | 'changed' | 'disabled'>('all');
  const [filterTrainType, setFilterTrainType] = useState<'all' | 'highspeed' | 'normal'>('all');
  const [filterValidity, setFilterValidity] = useState<'all' | 'valid' | 'invalid'>('all');
  const [sortBy, setSortBy] = useState<'trainNo' | 'departureTime' | 'arrivalTime'>('trainNo');
  const [selectedTrain, setSelectedTrain] = useState<PassengerTrain | null>(null);
  const [selectedTrainIds, setSelectedTrainIds] = useState<Set<string>>(new Set());
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [listViewMode, setListViewMode] = useState<'card' | 'table'>('card');

  const handleSelectAll = () => {
    if (selectedTrainIds.size === filteredTrains.length) {
      setSelectedTrainIds(new Set());
    } else {
      setSelectedTrainIds(new Set(filteredTrains.map(t => t.id)));
    }
  };

  const handleSelectTrain = (trainId: string, checked: boolean) => {
    const newSelected = new Set(selectedTrainIds);
    if (checked) {
      newSelected.add(trainId);
    } else {
      newSelected.delete(trainId);
    }
    setSelectedTrainIds(newSelected);
  };

  const trains = useMemo(() => mockPassengerTemplateTrains(), []);

  const filteredTrains = useMemo(() => {
    return trains.filter(train => {
      const matchesSearch = !searchTerm.trim() ||
        train.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.basicInfo.model.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || train.status === filterStatus;
      const matchesTrainType = filterTrainType === 'all' || train.trainType === filterTrainType;
      const matchesValidity = filterValidity === 'all' || 
        (filterValidity === 'valid' && train.editConfig.isValid) ||
        (filterValidity === 'invalid' && !train.editConfig.isValid);
      
      return matchesSearch && matchesStatus && matchesTrainType && matchesValidity;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'departureTime':
          return a.editConfig.originDepartureTime.localeCompare(b.editConfig.originDepartureTime);
        case 'arrivalTime':
          return a.editConfig.terminalArrivalTime.localeCompare(b.editConfig.terminalArrivalTime);
        case 'trainNo':
        default:
          return a.trainNo.localeCompare(b.trainNo);
      }
    });
  }, [trains, searchTerm, filterStatus, filterTrainType, filterValidity, sortBy]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      enabled: '已启用',
      running: '运行中',
      changed: '变更中',
      disabled: '已停运'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      enabled: <CheckCircle2 size={14} />,
      running: <Play size={14} />,
      changed: <Clock size={14} />,
      disabled: <XCircle size={14} />
    };
    return icons[status] || <CheckCircle2 size={14} />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      enabled: { bg: 'var(--pt-success-soft)', color: 'var(--pt-success)' },
      running: { bg: 'var(--pt-primary-soft)', color: 'var(--pt-primary)' },
      changed: { bg: 'var(--pt-warning-soft)', color: 'var(--pt-warning)' },
      disabled: { bg: 'rgba(142, 142, 147, 0.1)', color: '#8E8E93' }
    };
    return colors[status] || colors.enabled;
  };

  const getTrainTypeLabel = (type: string) => type === 'highspeed' ? '高铁' : '普速';

  const CalendarView = ({ train }: { train: PassengerTrain }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));

    const renderCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const days: JSX.Element[] = [];
      for (let i = 0; i < startingDay; i++) {
        days.push(<div key={`empty-${i}`} />);
      }

      const runningDays = [2, 9, 16, 23, 30];

      for (let day = 1; day <= daysInMonth; day++) {
        const isRunning = runningDays.includes(day);
        const isToday = day === 31 && month === 2;

        let bgColor = 'transparent';
        let textColor = 'var(--pt-text-primary)';
        let dotColor = 'transparent';

        if (isRunning) {
          bgColor = 'var(--pt-primary)';
          textColor = '#FFFFFF';
          dotColor = '#FFFFFF';
        } else {
          textColor = 'var(--pt-text-secondary)';
        }

        days.push(
          <div
            key={day}
            className="pt-calendar-day"
            style={{
              height: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              borderRadius: 'var(--radius-sm)',
              background: bgColor,
              color: textColor,
              cursor: 'pointer',
              fontWeight: isRunning ? 600 : 500,
              border: isToday ? '2px solid var(--pt-primary)' : '2px solid transparent',
            }}
          >
            <span>{day}</span>
            {isRunning && (
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: dotColor,
                marginTop: '3px',
              }} />
            )}
          </div>
        );
      }
      return days;
    };

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div style={{ width: '100%', marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'flex-start' }}>
          {/* 左侧信息面板 - 运行周期 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 运行周期 */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', marginBottom: '8px' }}>运行周期</div>
              <div style={{ 
                padding: '12px', 
                background: 'var(--pt-surface)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--pt-border-light)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--pt-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CalendarIcon size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pt-text-primary)' }}>每7天开行</div>
                    <div style={{ fontSize: '12px', color: 'var(--pt-text-secondary)' }}>1天/周</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['一', '二', '三', '四', '五', '六', '日'].map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        background: idx === 0 ? 'var(--pt-primary)' : 'var(--pt-surface)',
                        color: idx === 0 ? '#FFFFFF' : 'var(--pt-text-secondary)',
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧日历 */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="var(--pt-text-secondary)" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pt-text-primary)' }}>2026年03月</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--pt-border-light)',
                    background: 'var(--pt-card-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={16} color="var(--pt-text-secondary)" />
                </button>
                <button style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--pt-border-light)',
                  background: 'var(--pt-card-bg)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--pt-primary)',
                  cursor: 'pointer',
                }}>
                  今天
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--pt-border-light)',
                    background: 'var(--pt-card-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={16} color="var(--pt-text-secondary)" />
                </button>
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: 'var(--pt-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--pt-border-light)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      textAlign: 'center',
                      fontSize: '12px',
                      color: 'var(--pt-text-secondary)',
                      fontWeight: 600,
                      padding: '8px 0',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {renderCalendar()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditDrawer = ({ train, onClose }: { train: PassengerTrain; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      station: train.editConfig.station,
      trainType: train.editConfig.trainType,
      isSync: train.editConfig.isSync,
      arrivalTrainNo: train.editConfig.arrivalTrainNo,
      departureTrainNo: train.editConfig.departureTrainNo,
      originTrainNo: train.editConfig.originTrainNo,
      originStation: train.editConfig.originStation,
      terminalStation: train.editConfig.terminalStation,
      checkInTime基准: train.editConfig.checkInTime基准,
      checkInStopTime基准: train.editConfig.checkInStopTime基准,
      checkInTimeOffset: train.editConfig.checkInTimeOffset,
      checkInStopTimeOffset: train.editConfig.checkInStopTimeOffset,
      checkOutTimeOffset: train.editConfig.checkOutTimeOffset,
      trainModel: train.editConfig.trainModel,
      trainFormation: train.editConfig.trainFormation,
      parkingPosition: train.editConfig.parkingPosition,
      inboundDirection: train.editConfig.inboundDirection,
      outboundDirection: train.editConfig.outboundDirection,
      formationDirection: train.editConfig.formationDirection,
      isValid: train.editConfig.isValid,
      trainMode: train.editConfig.trainMode,
      startValidDate: train.editConfig.startValidDate,
      endValidDate: train.editConfig.endValidDate || '',
      syncOriginStationName: train.editConfig.syncOriginStationName,
      syncTerminalStationName: train.editConfig.syncTerminalStationName,
      originDepartureTime: train.editConfig.originDepartureTime,
      terminalArrivalTime: train.editConfig.terminalArrivalTime,
      operationType: train.editConfig.operationType,
      operationCycle: train.editConfig.operationCycle,
      operationRule: train.editConfig.operationRule,
      originStationDistanceDays: train.editConfig.originStationDistanceDays,
      terminalStationDistanceDays: train.editConfig.terminalStationDistanceDays,
      basicDiagramNo: train.editConfig.basicDiagramNo,
      checkInPlan: train.editConfig.checkInPlan || train.relatedPlans.checkInPlan,
      screenPlan: train.editConfig.screenPlan || train.relatedPlans.screenPlan,
      broadcastPlan: train.editConfig.broadcastPlan || train.relatedPlans.broadcastPlan,
      schedulePlan: train.editConfig.schedulePlan || train.relatedPlans.schedulePlan,
    });

    const handleInputChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
      console.log('保存配置:', formData);
      onClose();
    };

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '640px',
            background: 'var(--pt-card-bg)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--pt-border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--pt-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--pt-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Edit3 size={16} color="white" />
                </div>
                编辑配置 - {train.trainNo}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', marginTop: '4px', marginLeft: '42px' }}>
                当前版本: <span style={{ fontWeight: 600, color: 'var(--pt-text-primary)' }}>{train.currentVersion}</span>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--pt-border-light)',
              background: 'var(--pt-card-bg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">基础配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>车站</label>
                  <select 
                    value={formData.station}
                    onChange={(e) => handleInputChange('station', e.target.value)}
                    className="pt-input"
                  >
                    <option value="重庆东">重庆东</option>
                    <option value="重庆北">重庆北</option>
                    <option value="重庆西">重庆西</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>车次类型</label>
                  <select 
                    value={formData.trainType}
                    onChange={(e) => handleInputChange('trainType', e.target.value as any)}
                    className="pt-input"
                  >
                    <option value="origin">始发</option>
                    <option value="passing">途经</option>
                    <option value="terminal">终到</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>到达车次</label>
                  <input 
                    type="text" 
                    value={formData.arrivalTrainNo}
                    onChange={(e) => handleInputChange('arrivalTrainNo', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>出发车次</label>
                  <input 
                    type="text" 
                    value={formData.departureTrainNo}
                    onChange={(e) => handleInputChange('departureTrainNo', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>始发站</label>
                  <input 
                    type="text" 
                    value={formData.originStation}
                    onChange={(e) => handleInputChange('originStation', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>终到站</label>
                  <input 
                    type="text" 
                    value={formData.terminalStation}
                    onChange={(e) => handleInputChange('terminalStation', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isSync}
                      onChange={(e) => handleInputChange('isSync', e.target.checked)}
                    />
                    是否同步
                  </label>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">时间配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>开检时间基准</label>
                  <select 
                    value={formData.checkInTime基准}
                    onChange={(e) => handleInputChange('checkInTime基准', e.target.value)}
                    className="pt-input"
                  >
                    <option value="到点">到点</option>
                    <option value="发点">发点</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>开检停检基准</label>
                  <select 
                    value={formData.checkInStopTime基准}
                    onChange={(e) => handleInputChange('checkInStopTime基准', e.target.value)}
                    className="pt-input"
                  >
                    <option value="到点">到点</option>
                    <option value="发点">发点</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>开检时间偏移</label>
                  <input 
                    type="number" 
                    value={formData.checkInTimeOffset}
                    onChange={(e) => handleInputChange('checkInTimeOffset', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>停检时间偏移</label>
                  <input 
                    type="number" 
                    value={formData.checkInStopTimeOffset}
                    onChange={(e) => handleInputChange('checkInStopTimeOffset', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>结束检票偏移</label>
                  <input 
                    type="number" 
                    value={formData.checkOutTimeOffset}
                    onChange={(e) => handleInputChange('checkOutTimeOffset', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>始发发车时间</label>
                  <input 
                    type="text" 
                    value={formData.originDepartureTime}
                    onChange={(e) => handleInputChange('originDepartureTime', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>终到到达时间</label>
                  <input 
                    type="text" 
                    value={formData.terminalArrivalTime}
                    onChange={(e) => handleInputChange('terminalArrivalTime', e.target.value)}
                    className="pt-input" 
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">车辆配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>列车车型</label>
                  <select 
                    value={formData.trainModel}
                    onChange={(e) => handleInputChange('trainModel', e.target.value)}
                    className="pt-input"
                  >
                    <option value="CR400AF">CR400AF</option>
                    <option value="CRH2A">CRH2A</option>
                    <option value="CRH380A">CRH380A</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>列车编组</label>
                  <select 
                    value={formData.trainFormation}
                    onChange={(e) => handleInputChange('trainFormation', e.target.value)}
                    className="pt-input"
                  >
                    <option value="8">8</option>
                    <option value="16">16</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>停车位</label>
                  <select 
                    value={formData.parkingPosition}
                    onChange={(e) => handleInputChange('parkingPosition', e.target.value)}
                    className="pt-input"
                  >
                    <option value="东（北）">东（北）</option>
                    <option value="西（南）">西（南）</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>进站方向</label>
                  <select 
                    value={formData.inboundDirection}
                    onChange={(e) => handleInputChange('inboundDirection', e.target.value)}
                    className="pt-input"
                  >
                    <option value="西（南）">西（南）</option>
                    <option value="东（北）">东（北）</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>出站方向</label>
                  <select 
                    value={formData.outboundDirection}
                    onChange={(e) => handleInputChange('outboundDirection', e.target.value)}
                    className="pt-input"
                  >
                    <option value="西（南）">西（南）</option>
                    <option value="东（北）">东（北）</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>编组方向</label>
                  <select 
                    value={formData.formationDirection}
                    onChange={(e) => handleInputChange('formationDirection', e.target.value)}
                    className="pt-input"
                  >
                    <option value="倒序">倒序</option>
                    <option value="正序">正序</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">位置配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>股道</label>
                  <select 
                    value="4"
                    className="pt-input"
                  >
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>检票口</label>
                  <input 
                    type="text" 
                    value="请选择"
                    className="pt-input" 
                    disabled
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">有效期配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>起始有效期</label>
                  <input 
                    type="text" 
                    value={formData.startValidDate}
                    onChange={(e) => handleInputChange('startValidDate', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>终止有效期</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input 
                      type="text" 
                      value={formData.endValidDate}
                      onChange={(e) => handleInputChange('endValidDate', e.target.value)}
                      className="pt-input" 
                      style={{ flex: 1 }}
                    />
                    <button style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--pt-border-light)',
                      background: 'var(--pt-card-bg)',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--pt-primary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      当天
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>
                <input 
                  type="checkbox" 
                  checked={formData.isValid}
                  onChange={(e) => handleInputChange('isValid', e.target.checked)}
                />
                是否有效
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">运行配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>运行类型</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <select 
                      value={formData.operationType}
                      onChange={(e) => handleInputChange('operationType', e.target.value)}
                      className="pt-input"
                      style={{ flex: 1 }}
                    >
                      <option value="每日开行">每日开行</option>
                      <option value="隔日开行">隔日开行</option>
                    </select>
                    <button style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--pt-border-light)',
                      background: 'var(--pt-card-bg)',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--pt-primary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      设置
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>运行周期</label>
                  <input 
                    type="text" 
                    value={formData.operationCycle}
                    onChange={(e) => handleInputChange('operationCycle', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>运行规律</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input 
                      type="text" 
                      value={formData.operationRule}
                      onChange={(e) => handleInputChange('operationRule', e.target.value)}
                      className="pt-input" 
                      style={{ flex: 1 }}
                    />
                    <button style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--pt-border-light)',
                      background: 'var(--pt-primary)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      预览
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">扩展信息</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>担当局</label>
                  <select className="pt-input">
                    <option value="">请选择</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>列车等级</label>
                  <select className="pt-input">
                    <option value="高铁">高铁</option>
                    <option value="动车">动车</option>
                    <option value="普速">普速</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>列车车底</label>
                  <input 
                    type="text" 
                    placeholder="示例:CR400AF-2008"
                    className="pt-input" 
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="pt-section-title">距离配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>始发站距离到站天数</label>
                  <input 
                    type="number" 
                    value={formData.originStationDistanceDays}
                    onChange={(e) => handleInputChange('originStationDistanceDays', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>终到站距离到站天数</label>
                  <input 
                    type="number" 
                    value={formData.terminalStationDistanceDays}
                    onChange={(e) => handleInputChange('terminalStationDistanceDays', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>基本图号</label>
                  <input 
                    type="text" 
                    value={formData.basicDiagramNo}
                    onChange={(e) => handleInputChange('basicDiagramNo', e.target.value)}
                    className="pt-input" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--pt-border-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <button onClick={onClose} className="pt-button pt-button-secondary">取消</button>
            <button onClick={handleSave} className="pt-button pt-button-primary">
              <Save size={16} />
              保存配置
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getTrainTypeDetailLabel = (type: string) => {
    const labels: Record<string, string> = {
      origin: '始发',
      passing: '途经',
      terminal: '终到'
    };
    return labels[type] || type;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      basic: '基本图',
      ticket: '客票日计划',
      dispatch: '调度日计划',
      manual: '手动添加'
    };
    return labels[source] || source;
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      basic: { bg: 'var(--pt-primary-soft)', color: 'var(--pt-primary)' },
      ticket: { bg: 'var(--pt-success-soft)', color: 'var(--pt-success)' },
      dispatch: { bg: 'var(--pt-warning-soft)', color: 'var(--pt-warning)' },
      manual: { bg: 'var(--pt-purple-soft)', color: 'var(--pt-purple)' }
    };
    return colors[source] || colors.basic;
  };

  return (
    <div className="pt-page">
      <header className="pt-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--pt-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrainFront size={20} color="white" />
          </div>
          <div>
            <div className="pt-header-title">客运模板</div>
            <div className="pt-header-subtitle">车次生命周期管理</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="pt-select"
          >
            <option value="重庆东站">重庆东站</option>
            <option value="重庆北站">重庆北站</option>
            <option value="重庆西站">重庆西站</option>
          </select>

          <div className="pt-search">
            <Search size={16} className="pt-search-icon" />
            <input
              type="text"
              placeholder="搜索车次或车型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pt-search-input"
            />
          </div>

          <select
            value={filterTrainType}
            onChange={(e) => setFilterTrainType(e.target.value as any)}
            className="pt-select"
            style={{ minWidth: '100px' }}
          >
            <option value="all">列车类型</option>
            <option value="highspeed">高铁</option>
            <option value="normal">普速</option>
          </select>

          <select
            value={filterValidity}
            onChange={(e) => setFilterValidity(e.target.value as any)}
            className="pt-select"
            style={{ minWidth: '100px' }}
          >
            <option value="all">有效性</option>
            <option value="valid">有效</option>
            <option value="invalid">无效</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="pt-select"
            style={{ minWidth: '100px' }}
          >
            <option value="trainNo">按车次排序</option>
            <option value="departureTime">按发车时间</option>
            <option value="arrivalTime">按到达时间</option>
          </select>

          <button className="pt-button pt-button-primary" style={{ fontSize: '13px' }}>
            查询
          </button>

          {selectedTrainIds.size > 0 && (
            <>
              <div style={{ width: '1px', height: '20px', background: 'var(--pt-border-light)' }} />
              <button className="pt-button pt-button-secondary" style={{ color: 'var(--pt-error)' }}>
                <Trash2 size={16} />
                批量删除 ({selectedTrainIds.size})
              </button>
            </>
          )}

          <div style={{ width: '1px', height: '20px', background: 'var(--pt-border-light)' }} />

          <button className="pt-button pt-button-secondary">
            <Upload size={16} />
            导入
          </button>
          <button className="pt-button pt-button-secondary">
            <Download size={16} />
            导出
          </button>
          <button className="pt-button pt-button-primary">
            <Plus size={16} />
            新增车次
          </button>
        </div>
      </header>

      <main className="pt-main">
        <div style={{ width: '420px', display: 'flex', flexDirection: 'column' }}>
          <div className="pt-panel" style={{ height: '100%' }}>
            <div className="pt-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Train size={16} color="var(--pt-primary)" />
                车次列表
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  background: 'var(--pt-primary-soft)',
                  color: 'var(--pt-primary)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600
                }}>
                  共 {filteredTrains.length} 列
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--pt-surface)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--pt-border-light)' }}>
                <button
                  onClick={() => setListViewMode('card')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: listViewMode === 'card' ? 'var(--pt-primary)' : 'transparent',
                    color: listViewMode === 'card' ? 'white' : 'var(--pt-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  卡片
                </button>
                <button
                  onClick={() => setListViewMode('table')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: listViewMode === 'table' ? 'var(--pt-primary)' : 'transparent',
                    color: listViewMode === 'table' ? 'white' : 'var(--pt-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  表格
                </button>
              </div>
            </div>
            <div className="pt-panel-content">
              <div className="pt-filter-tags">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'enabled', label: '已启用' },
                  { key: 'running', label: '运行中' },
                  { key: 'changed', label: '变更中' },
                ].map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => setFilterStatus(tag.key as typeof filterStatus)}
                    className={`pt-filter-tag ${filterStatus === tag.key ? 'active' : ''}`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              <div>
                {listViewMode === 'card' ? (
                  filteredTrains.map((train) => {
                    const statusStyle = getStatusColor(train.status);
                    const sourceStyle = getSourceColor(train.source);
                    return (
                      <div
                        key={train.id}
                        onClick={() => setSelectedTrain(train)}
                        className={`pt-train-card ${selectedTrain?.id === train.id ? 'selected' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="pt-train-number">{train.trainNo}</span>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 600,
                              background: train.trainType === 'highspeed' ? 'var(--pt-primary-soft)' : 'var(--pt-warning-soft)',
                              color: train.trainType === 'highspeed' ? 'var(--pt-primary)' : 'var(--pt-warning)',
                            }}>
                              {getTrainTypeLabel(train.trainType)}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 600,
                              background: 'var(--pt-surface)',
                              color: 'var(--pt-text-secondary)',
                              border: '1px solid var(--pt-border-light)'
                            }}>
                              {getTrainTypeDetailLabel(train.trainTypeDetail)}
                            </span>
                          </div>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 600,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}>
                            {getStatusIcon(train.status)}
                            {getStatusLabel(train.status)}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--pt-text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Layers size={12} />
                              {train.basicInfo.model}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} />
                              {train.basicInfo.track}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 600,
                            background: sourceStyle.bg,
                            color: sourceStyle.color
                          }}>
                            {getSourceLabel(train.source)}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--pt-border-light)',
                          fontSize: '12px',
                        }}>
                          <span style={{ color: 'var(--pt-text-tertiary)', fontWeight: 500 }}>
                            {train.currentVersion}
                          </span>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--pt-text-secondary)',
                            fontWeight: 500
                          }}>
                            <History size={12} />
                            {train.lifecycle.length}次变更
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="pt-table-container" style={{ overflowX: 'auto', background: 'var(--pt-card-bg)' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      fontSize: '13px',
                      minWidth: '1400px',
                    }}>
                      <thead>
                        <tr style={{ background: 'var(--pt-surface)' }}>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '40px',
                            position: 'sticky',
                            left: 0,
                            background: 'var(--pt-surface)',
                            zIndex: 2,
                          }} className="pt-table-header-sticky">
                            <input
                              type="checkbox"
                              checked={selectedTrainIds.size > 0 && selectedTrainIds.size === filteredTrains.length}
                              onChange={handleSelectAll}
                              style={{ cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '60px',
                          }} className="pt-table-header-sticky">序号</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '100px',
                          }} className="pt-table-header-sticky">出发车次</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '100px',
                          }} className="pt-table-header-sticky">到达车次</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '90px',
                          }} className="pt-table-header-sticky">始发站</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '90px',
                          }} className="pt-table-header-sticky">终到站</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '80px',
                          }} className="pt-table-header-sticky">发车时间</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '80px',
                          }} className="pt-table-header-sticky">到达时间</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '60px',
                          }} className="pt-table-header-sticky">股道</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '80px',
                          }} className="pt-table-header-sticky">车型</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '90px',
                          }} className="pt-table-header-sticky">运行周期</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '90px',
                          }} className="pt-table-header-sticky">状态</th>
                          <th style={{ 
                            padding: '12px 10px', 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: 'var(--pt-text-secondary)', 
                            borderBottom: '2px solid var(--pt-border-light)',
                            width: '80px',
                          }} className="pt-table-header-sticky">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrains.map((train, idx) => {
                          const statusStyle = getStatusColor(train.status);
                          const isSelected = selectedTrainIds.has(train.id);
                          return (
                            <tr
                              key={train.id}
                              onClick={() => setSelectedTrain(train)}
                              style={{
                                cursor: 'pointer',
                                background: selectedTrain?.id === train.id 
                                  ? 'var(--pt-primary-soft)' 
                                  : isSelected 
                                    ? 'rgba(0, 113, 227, 0.04)' 
                                    : idx % 2 === 0 
                                      ? 'transparent' 
                                      : 'var(--pt-surface)',
                                transition: 'all var(--transition-fast)',
                              }}
                              onMouseEnter={(e) => {
                                if (selectedTrain?.id !== train.id && !isSelected) {
                                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedTrain?.id !== train.id && !isSelected) {
                                  e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--pt-surface)';
                                }
                              }}
                            >
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)',
                                position: 'sticky',
                                left: 0,
                                background: selectedTrain?.id === train.id 
                                  ? 'var(--pt-primary-soft)' 
                                  : isSelected 
                                    ? 'rgba(0, 113, 227, 0.04)' 
                                    : idx % 2 === 0 
                                      ? 'var(--pt-card-bg)' 
                                      : 'var(--pt-surface)',
                                zIndex: 1,
                              }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleSelectTrain(train.id, e.target.checked);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-secondary)' 
                              }}>{idx + 1}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                fontWeight: 600, 
                                color: 'var(--pt-primary)' 
                              }}>{train.trainNo}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.editConfig.arrivalTrainNo}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.editConfig.originStation}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.editConfig.terminalStation}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.editConfig.originDepartureTime}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.editConfig.terminalArrivalTime}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.basicInfo.track}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.basicInfo.model}</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)', 
                                color: 'var(--pt-text-primary)' 
                              }}>{train.operationRules.operationCycle}天</td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)' 
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  padding: '3px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  fontWeight: 600,
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                }}>
                                  {getStatusIcon(train.status)}
                                  {getStatusLabel(train.status)}
                                </span>
                              </td>
                              <td style={{ 
                                padding: '12px 10px', 
                                borderBottom: '1px solid var(--pt-border-light)' 
                              }}>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTrain(train);
                                      setShowEditDrawer(true);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--pt-primary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      fontSize: '12px',
                                      fontWeight: 500,
                                    }}
                                  >
                                    编辑
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredTrains.length === 0 && (
                  <div className="pt-empty-state">
                    <div className="pt-empty-icon">
                      <Train size={32} color="var(--pt-text-tertiary)" />
                    </div>
                    <div className="pt-empty-text">未找到匹配的车次</div>
                    <div className="pt-empty-subtext">请尝试调整搜索条件</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="pt-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="pt-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Route size={16} color="var(--pt-primary)" />
                车次详情
              </div>
              {selectedTrain && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowEditDrawer(true)}
                    className="pt-button pt-button-primary"
                    style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
                  >
                    <Edit3 size={14} />
                    编辑配置
                  </button>
                </div>
              )}
            </div>

            <div className="pt-panel-content" style={{ padding: '16px', overflowY: 'auto' }}>
              {selectedTrain ? (
                <>
                  {/* 图号展示 */}
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '12px' }}>
                    图号: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{selectedTrain.basicInfo.diagramNo || '20260112'}</span>
                  </div>

                  {/* 顶部信息主卡片 */}
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'var(--muted)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Train size={22} color="var(--primary-foreground)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)' }}>
                            {selectedTrain.trainNo}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                            background: selectedTrain.trainType === 'highspeed' ? 'var(--primary)' : 'var(--warning)',
                            color: 'var(--primary-foreground)',
                          }}>
                            {getTrainTypeLabel(selectedTrain.trainType)}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                            background: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                            border: '1px solid var(--border)'
                          }}>
                            {getTrainTypeDetailLabel(selectedTrain.trainTypeDetail)}
                          </span>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 600,
                            background: getStatusColor(selectedTrain.status).bg,
                            color: getStatusColor(selectedTrain.status).color,
                          }}>
                            {getStatusIcon(selectedTrain.status)}
                            {getStatusLabel(selectedTrain.status)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          当前版本: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{selectedTrain.currentVersion}</span>
                          <span style={{ margin: '0 6px', color: 'var(--border)' }}>|</span>
                          启用日期: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{selectedTrain.startDate}</span>
                          <span style={{ margin: '0 6px', color: 'var(--border)' }}>|</span>
                          来源: <span style={{ fontWeight: 600, color: getSourceColor(selectedTrain.source).color }}>{getSourceLabel(selectedTrain.source)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 信息标签行 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                      {/* 编组信息（含地标颜色） */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>编组:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                          {selectedTrain.basicInfo.formationCount}
                          {selectedTrain.basicInfo.formationDirection === '正向' ? '正' : '倒'}
                          {selectedTrain.basicInfo.upDown === 'up' ? '上' : '下'}
                          {selectedTrain.basicInfo.isReturn ? '折' : ''}
                        </span>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: selectedTrain.basicInfo.landmarkColor || '#1377EB',
                          marginLeft: '4px',
                        }}></div>
                      </div>

                      {/* 车底-车型 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>车型:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                          {selectedTrain.basicInfo.trainBottom ? `${selectedTrain.basicInfo.trainBottom}-${selectedTrain.editConfig.trainModel}` : selectedTrain.editConfig.trainModel}
                        </span>
                      </div>

                      {/* 股道 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>股道:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                          {selectedTrain.basicInfo.track}道
                        </span>
                      </div>

                      {/* 定员 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>定员:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                          {selectedTrain.basicInfo.capacity || '558'}人
                        </span>
                      </div>

                      {/* 地标规则按钮 */}
                      <button style={{
                        marginLeft: 'auto',
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}>
                        地标颜色规则
                      </button>
                    </div>
                  </div>

                  {/* 时间配置分组 */}
                  <div className="pt-section" style={{ marginBottom: '20px' }}>
                    <div className="pt-section-card">
                      <div className="pt-section-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} color="var(--primary)" />
                            <div className="pt-section-card-title">时间配置</div>
                          </div>
                          <button style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: 'var(--secondary)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                          }}>
                            规则配置
                          </button>
                        </div>
                        <div className="pt-section-card-subtitle">基于到点、发点自动计算各环节时间（根据配置规则自动匹配）</div>
                      </div>
                      <div className="pt-section-card-content">
                        {/* 核心时间 */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '16px', 
                          marginBottom: '24px',
                          padding: '16px',
                          background: 'var(--muted)',
                          borderRadius: 'var(--radius-md)',
                        }}>
                          <div className="pt-section-card-item">
                            <div className="pt-section-card-item-label">到点（到达时间）</div>
                            <div className="pt-section-card-item-value" style={{ fontSize: '18px' }}>{selectedTrain.editConfig.arrivalTime || '08:27'}</div>
                          </div>
                          <div className="pt-section-card-item">
                            <div className="pt-section-card-item-label">发点（发车时间）</div>
                            <div className="pt-section-card-item-value" style={{ fontSize: '18px' }}>{selectedTrain.editConfig.departureTime || '08:45'}</div>
                          </div>
                        </div>

                        {/* 时间规则分组 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                          {/* 进站开检规则 */}
                          <div style={{
                            padding: '16px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px', fontSize: '14px' }}>进站开检规则</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">基准</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkInTime基准 || '发点'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">偏移量</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkInTimeOffset || '-16'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">实际时间</div>
                                <div className="pt-section-card-item-value" style={{ color: 'var(--primary)' }}>{selectedTrain.editConfig.checkInActualTime || '08:11'}</div>
                              </div>
                            </div>
                          </div>

                          {/* 进站停检规则 */}
                          <div style={{
                            padding: '16px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px', fontSize: '14px' }}>进站停检规则</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">基准</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkInStopTime基准 || '发点'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">偏移量</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkInStopTimeOffset || '-3'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">实际时间</div>
                                <div className="pt-section-card-item-value" style={{ color: 'var(--primary)' }}>{selectedTrain.editConfig.checkInStopActualTime || '08:24'}</div>
                              </div>
                            </div>
                          </div>

                          {/* 出站开检规则 */}
                          <div style={{
                            padding: '16px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px', fontSize: '14px' }}>出站开检规则</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">基准</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkOutTime基准 || '到点'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">偏移量</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkOutTimeOffset || '1'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">实际时间</div>
                                <div className="pt-section-card-item-value" style={{ color: 'var(--primary)' }}>{selectedTrain.editConfig.checkOutActualTime || '08:28'}</div>
                              </div>
                            </div>
                          </div>

                          {/* 出站停检规则 */}
                          <div style={{
                            padding: '16px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px', fontSize: '14px' }}>出站停检规则</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">基准</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkOutStopTime基准 || '到点'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">偏移量</div>
                                <div className="pt-section-card-item-value">{selectedTrain.editConfig.checkOutStopTimeOffset || '10'}</div>
                              </div>
                              <div className="pt-section-card-item">
                                <div className="pt-section-card-item-label">实际时间</div>
                                <div className="pt-section-card-item-value" style={{ color: 'var(--primary)' }}>{selectedTrain.editConfig.checkOutStopActualTime || '08:37'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 停靠信息分组 - 站台平面图 */}
                  <div className="pt-section" style={{ marginBottom: '20px' }}>
                    <div className="pt-section-card">
                      <div className="pt-section-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Train size={18} color="var(--primary)" />
                            <div className="pt-section-card-title">停靠信息</div>
                            <span style={{ 
                              fontSize: '13px', 
                              color: 'var(--muted-foreground)',
                              fontWeight: 500
                            }}>
                              {selectedTrain.basicInfo.platform || '4'}站台
                            </span>
                          </div>
                          <button style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: 'var(--secondary)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                          }}>
                            配置
                          </button>
                        </div>
                      </div>
                      <div className="pt-section-card-content">
                        {/* 站台平面图 */}
                        <div style={{ 
                          padding: '20px 10px', 
                          background: 'var(--muted)', 
                          borderRadius: 'var(--radius-md)',
                          position: 'relative'
                        }}>
                          {/* 方向标记 */}
                          <div style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '10px', 
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)' }}>北</div>
                            <div style={{
                              width: '0',
                              height: '0',
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderBottom: '10px solid var(--primary)',
                            }}></div>
                          </div>

                          <div style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            right: '10px', 
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <div style={{
                              width: '0',
                              height: '0',
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: '10px solid var(--muted-foreground)',
                            }}></div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)' }}>南</div>
                          </div>

                          {/* 站台区域 */}
                          <div style={{ 
                            margin: '0 40px', 
                            position: 'relative',
                            height: '140px'
                          }}>
                            {/* 北侧站台线 */}
                            <div style={{
                              position: 'absolute',
                              top: '0',
                              left: '30px',
                              right: '30px',
                              height: '3px',
                              background: 'var(--border)'
                            }}></div>

                            {/* 停车线区域 - 贯穿站台2根线 */}
                            <div style={{
                              position: 'absolute',
                              top: '0',
                              bottom: '0',
                              left: '30px',
                              right: '30px',
                              pointerEvents: 'none'
                            }}>
                              {/* 左侧停车标记（北） */}
                              <div 
                                style={{
                                  position: 'absolute',
                                  left: '0',
                                  top: '0',
                                  bottom: '-20px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  padding: '4px 8px',
                                  borderRadius: '4px'
                                }}
                              >
                                <div style={{
                                  position: 'absolute',
                                  top: '0',
                                  bottom: '20px',
                                  left: '50%',
                                  width: '2px',
                                  transform: 'translateX(-50%)',
                                  background: selectedTrain.editConfig.parkingPosition?.includes('北') ? '#22c55e' : 'var(--border)'
                                }}></div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: selectedTrain.editConfig.parkingPosition?.includes('北') ? '#22c55e' : 'var(--muted-foreground)',
                                  background: selectedTrain.editConfig.parkingPosition?.includes('北') ? 'rgba(34, 197, 94, 0.1)' : 'var(--muted)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  zIndex: 1
                                }}>
                                  停
                                </span>
                              </div>

                              {/* 右侧停车标记（南） */}
                              <div 
                                style={{
                                  position: 'absolute',
                                  right: '0',
                                  top: '0',
                                  bottom: '-20px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  padding: '4px 8px',
                                  borderRadius: '4px'
                                }}
                              >
                                <div style={{
                                  position: 'absolute',
                                  top: '0',
                                  bottom: '20px',
                                  left: '50%',
                                  width: '2px',
                                  transform: 'translateX(-50%)',
                                  background: selectedTrain.editConfig.parkingPosition?.includes('南') ? '#22c55e' : 'var(--border)'
                                }}></div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: selectedTrain.editConfig.parkingPosition?.includes('南') ? '#22c55e' : 'var(--muted-foreground)',
                                  background: selectedTrain.editConfig.parkingPosition?.includes('南') ? 'rgba(34, 197, 94, 0.1)' : 'var(--muted)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  zIndex: 1
                                }}>
                                  停
                                </span>
                              </div>
                            </div>

                            {/* 列车显示区域 - 8编组长度为停车线距离的一半，16编组不超出范围，车头蓝色其他灰色，对齐停车线 */}
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '30px',
                              right: '30px',
                              transform: 'translateY(-50%)',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {(() => {
                                const formationCount = selectedTrain.basicInfo.formationCount || 8;
                                const is8Formation = formationCount <= 8;
                                const isPositive = selectedTrain.basicInfo.formationDirection === '正向';
                                const parkingPosition = selectedTrain.editConfig.parkingPosition || '';
                                const isParkingLeft = parkingPosition.includes('北');
                                const isParkingRight = parkingPosition.includes('南');
                                
                                let headCarriageNumber = 1;
                                if (isPositive) {
                                  headCarriageNumber = isParkingLeft ? formationCount : 1;
                                } else {
                                  headCarriageNumber = isParkingLeft ? 1 : formationCount;
                                }
                                
                                return (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: is8Formation ? '50%' : '100%',
                                    marginLeft: isParkingLeft ? '0' : 'auto',
                                    marginRight: isParkingRight ? '0' : 'auto'
                                  }}>
                                    {Array.from({ length: formationCount }).map((_, idx) => {
                                      const carriageNumber = isPositive ? idx + 1 : formationCount - idx;
                                      const isHead = carriageNumber === headCarriageNumber;
                                      return (
                                        <div key={idx} style={{
                                          position: 'relative',
                                          flex: '1',
                                          minWidth: '0',
                                          height: '50px',
                                          background: isHead ? 'var(--primary)' : 'var(--muted)',
                                          borderRadius: '3px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          margin: idx > 0 ? '0 0 0 2px' : '0'
                                        }}>
                                          <span style={{
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            color: isHead ? 'var(--primary-foreground)' : 'var(--foreground)'
                                          }}>
                                            {carriageNumber}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* 南侧站台线 */}
                            <div style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '30px',
                              right: '30px',
                              height: '3px',
                              background: 'var(--border)'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 作业位置分组 */}
                  <div className="pt-section" style={{ marginBottom: '20px' }}>
                    <div className="pt-section-card">
                      <div className="pt-section-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="var(--primary)" />
                            <div className="pt-section-card-title">作业位置</div>
                          </div>
                          <button style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: 'var(--secondary)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                          }}>
                            配置规则
                          </button>
                        </div>
                        <div className="pt-section-card-subtitle">站台、检票口等作业位置信息（默认根据股道自动匹配）</div>
                      </div>
                      <div className="pt-section-card-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                          {[
                            { label: '站台', value: `${selectedTrain.basicInfo.platform || '4'}站台` },
                            { label: '候车室', value: selectedTrain.basicInfo.waitingRoom || '候车大厅' },
                            { label: '检票口', value: selectedTrain.basicInfo.checkInGate || '3A、4A' },
                            { label: '出站口', value: selectedTrain.basicInfo.exitGate || '南出站口' },
                          ].map((item, idx) => (
                            <div key={idx} className="pt-section-card-item">
                              <div className="pt-section-card-item-label">{item.label}</div>
                              <div className="pt-section-card-item-value">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 运行配置分组 */}
                  <div className="pt-section" style={{ marginBottom: '20px' }}>
                    <div className="pt-section-card">
                      <div className="pt-section-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CalendarIcon size={18} color="var(--primary)" />
                          <div className="pt-section-card-title">运行配置</div>
                        </div>
                        <div className="pt-section-card-subtitle">车次运行日历视图</div>
                      </div>
                      <div className="pt-section-card-content">
                        {/* 日历视图 */}
                        <CalendarView train={selectedTrain} />
                      </div>
                    </div>
                  </div>

                  {/* 关联模板分组 */}
                  <div className="pt-section" style={{ marginBottom: '20px' }}>
                    <div className="pt-section-card">
                      <div className="pt-section-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Layers size={18} color="var(--primary)" />
                          <div className="pt-section-card-title">关联模板</div>
                        </div>
                        <div className="pt-section-card-subtitle">车次关联的各类业务模板</div>
                      </div>
                      <div className="pt-section-card-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                          {[
                            { label: '广播模板', value: selectedTrain.relatedPlans.broadcastPlan || '客运始发广播模板', isActive: true },
                            { label: '开检计划模板', value: '预留中', isActive: false },
                            { label: '上屏计划模板', value: '预留中', isActive: false },
                            { label: '作业排班模板', value: '预留中', isActive: false },
                          ].map((item, idx) => (
                            <div key={idx} className="pt-section-card-item" style={{
                              opacity: item.isActive ? 1 : 0.6
                            }}>
                              <div className="pt-section-card-item-label">{item.label}</div>
                              <div className="pt-section-card-item-value" style={{
                                color: item.isActive ? 'var(--foreground)' : 'var(--muted-foreground)'
                              }}>
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pt-empty-state">
                  <div className="pt-empty-icon">
                    <TrainFront size={32} color="var(--muted-foreground)" />
                  </div>
                  <div className="pt-empty-text">请选择一个车次</div>
                  <div className="pt-empty-subtext">在左侧列表中选择车次查看详情</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedTrain && showEditDrawer && (
        <EditDrawer train={selectedTrain} onClose={() => setShowEditDrawer(false)} />
      )}
    </div>
  );
};

export default Component;
