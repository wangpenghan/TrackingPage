/**
 * @name 客运模板
 *
 * 车次生命周期管理页面 - macOS 风格设计
 * 从车次启用、日常调度变更、调图批量变更，到最终停运的完整生命周期管理
 *
 * 设计规范：macOS 统一风格样式，简洁精致专业
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
  const [selectedTrain, setSelectedTrain] = useState<PassengerTrain | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const trains = useMemo(() => mockPassengerTemplateTrains(), []);

  const filteredTrains = useMemo(() => {
    return trains.filter(train => {
      const matchesSearch = !searchTerm.trim() ||
        train.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.basicInfo.model.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || train.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trains, searchTerm, filterStatus]);

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
      running: { bg: 'var(--pt-info-soft)', color: 'var(--pt-primary)' },
      changed: { bg: 'var(--pt-warning-soft)', color: 'var(--pt-warning)' },
      disabled: { bg: 'rgba(142, 142, 147, 0.12)', color: '#8E8E93' }
    };
    return colors[status] || colors.enabled;
  };

  const getTrainTypeLabel = (type: string) => type === 'highspeed' ? '高铁' : '普速';

  // 运行时间视图组件 - 参考图片美化版
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
        let textColor = '#1C1C1E';
        let dotColor = 'transparent';

        if (isRunning) {
          bgColor = '#1C1C1E';
          textColor = '#FFFFFF';
          dotColor = '#FFFFFF';
        } else {
          textColor = '#8E8E93';
        }

        days.push(
          <div
            key={day}
            style={{
              height: '64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              borderRadius: isToday ? '8px' : '0',
              background: bgColor,
              color: textColor,
              cursor: 'pointer',
              fontWeight: isRunning ? 600 : 500,
              border: isToday ? '2px solid #0071E3' : 'none',
              margin: isToday ? '-2px' : '0',
            }}
          >
            <span>{day}</span>
            {isRunning && (
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: dotColor,
                marginTop: '2px',
              }} />
            )}
          </div>
        );
      }
      return days;
    };

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div style={{ width: '100%' }}>
        <div style={{
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1C1C1E',
            marginBottom: '4px',
          }}>
            运行时间
          </div>
          <div style={{
            fontSize: '13px',
            color: '#8E8E93',
          }}>
            车次的运行时间信息
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 左侧信息面板 */}
          <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 始发信息 */}
            <div>
              <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>始发信息</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1C1C1E', marginBottom: '4px' }}>08:27</div>
              <div style={{ fontSize: '20px', color: '#1C1C1E' }}>重庆东</div>
            </div>

            {/* 终到信息 */}
            <div>
              <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>终到信息</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1C1C1E', marginBottom: '4px' }}>21:37</div>
              <div style={{ fontSize: '20px', color: '#1C1C1E' }}>汕头</div>
            </div>

            {/* 运行周期卡片 */}
            <div style={{
              padding: '16px',
              background: '#F5F5F7',
              borderRadius: '16px',
              border: '1px solid #E5E5EA',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CalendarIcon size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1C1E' }}>每7天开行</div>
                  <div style={{ fontSize: '13px', color: '#8E8E93' }}>1天/周</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {['一', '二', '三', '四', '五', '六', '日'].map((d, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      background: idx === 0 ? '#0071E3' : '#F5F5F7',
                      color: idx === 0 ? '#FFFFFF' : '#8E8E93',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #E5E5EA',
                display: 'inline-block',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0071E3',
                  padding: '4px 10px',
                  background: 'rgba(0, 113, 227, 0.1)',
                  borderRadius: '6px',
                }}>
                  周一
                </span>
              </div>
            </div>

            {/* 基本图号 */}
            <div>
              <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '4px' }}>基本图号</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1C1C1E' }}>2026G2327</div>
            </div>
          </div>

          {/* 右侧日历 */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={18} color="#8E8E93" />
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#1C1C1E' }}>2026年03月</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={18} color="#8E8E93" />
                </button>
                <button style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0071E3',
                  cursor: 'pointer',
                }}>
                  今天
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={18} color="#8E8E93" />
                </button>
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(180deg, #F5F5F7 0%, #EBEBED 100%)',
              borderRadius: '20px',
              border: '1px solid #E5E5EA',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#8E8E93',
                      fontWeight: 600,
                      padding: '8px 0',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {renderCalendar()}
              </div>
            </div>

            {/* 图例 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px',
            }}>
              {[
                { bg: '#F5F5F7', label: '非有效期' },
                { bg: '#EBEBED', label: '有效期内' },
                { bg: '#1C1C1E', label: '已执行', dot: true },
                { bg: '#1C1C1E', label: '未执行', dot: false },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8E8E93' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: idx >= 2 ? '50%' : '3px',
                    background: item.bg,
                    border: idx === 0 ? '1px solid #E5E5EA' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {idx >= 2 && item.dot && (
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
                    )}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 编辑抽屉组件
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
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, animation: 'fadeIn 0.2s ease' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '680px',
            background: 'var(--pt-card-bg)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--pt-border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,252,1) 100%)',
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--pt-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--pt-primary) 0%, var(--pt-primary-light) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Edit3 size={18} color="white" />
                </div>
                编辑配置 - {train.trainNo}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--pt-text-secondary)', marginTop: '6px', marginLeft: '48px' }}>
                当前版本: <span style={{ fontWeight: 600, color: 'var(--pt-text-primary)' }}>{train.currentVersion}</span>
              </div>
            </div>
            <button onClick={onClose} className="pt-icon-button">
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* 基础配置 */}
            <div style={{ marginBottom: '24px' }}>
              <div className="pt-section-title">基础配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>到达车次</label>
                  <input 
                    type="text" 
                    value={formData.arrivalTrainNo}
                    onChange={(e) => handleInputChange('arrivalTrainNo', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>出发车次</label>
                  <input 
                    type="text" 
                    value={formData.departureTrainNo}
                    onChange={(e) => handleInputChange('departureTrainNo', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>始发站</label>
                  <input 
                    type="text" 
                    value={formData.originStation}
                    onChange={(e) => handleInputChange('originStation', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>终到站</label>
                  <input 
                    type="text" 
                    value={formData.terminalStation}
                    onChange={(e) => handleInputChange('terminalStation', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>
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

            {/* 时间配置 */}
            <div style={{ marginBottom: '24px' }}>
              <div className="pt-section-title">时间配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>开检时间偏移</label>
                  <input 
                    type="number" 
                    value={formData.checkInTimeOffset}
                    onChange={(e) => handleInputChange('checkInTimeOffset', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>停检时间偏移</label>
                  <input 
                    type="number" 
                    value={formData.checkInStopTimeOffset}
                    onChange={(e) => handleInputChange('checkInStopTimeOffset', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>结束检票偏移</label>
                  <input 
                    type="number" 
                    value={formData.checkOutTimeOffset}
                    onChange={(e) => handleInputChange('checkOutTimeOffset', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>始发发车时间</label>
                  <input 
                    type="text" 
                    value={formData.originDepartureTime}
                    onChange={(e) => handleInputChange('originDepartureTime', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

            {/* 车辆配置 */}
            <div style={{ marginBottom: '24px' }}>
              <div className="pt-section-title">车辆配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>车型</label>
                  <input 
                    type="text" 
                    value={formData.trainModel}
                    onChange={(e) => handleInputChange('trainModel', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>编组数</label>
                  <input 
                    type="number" 
                    value={formData.trainFormation}
                    onChange={(e) => handleInputChange('trainFormation', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>停放位置</label>
                  <input 
                    type="text" 
                    value={formData.parkingPosition}
                    onChange={(e) => handleInputChange('parkingPosition', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>进站方向</label>
                  <input 
                    type="text" 
                    value={formData.inboundDirection}
                    onChange={(e) => handleInputChange('inboundDirection', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>出站方向</label>
                  <input 
                    type="text" 
                    value={formData.outboundDirection}
                    onChange={(e) => handleInputChange('outboundDirection', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>编组方向</label>
                  <select 
                    value={formData.formationDirection}
                    onChange={(e) => handleInputChange('formationDirection', e.target.value)}
                    className="pt-input"
                  >
                    <option value="正向">正向</option>
                    <option value="倒序">倒序</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 规则配置 */}
            <div style={{ marginBottom: '24px' }}>
              <div className="pt-section-title">规则配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>车次模式</label>
                  <select 
                    value={formData.trainMode}
                    onChange={(e) => handleInputChange('trainMode', e.target.value as any)}
                    className="pt-input"
                  >
                    <option value="auto">自动</option>
                    <option value="manual">手动</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>运营类型</label>
                  <input 
                    type="text" 
                    value={formData.operationType}
                    onChange={(e) => handleInputChange('operationType', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>运行周期</label>
                  <input 
                    type="number" 
                    value={formData.operationCycle}
                    onChange={(e) => handleInputChange('operationCycle', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>运行规则</label>
                  <input 
                    type="number" 
                    value={formData.operationRule}
                    onChange={(e) => handleInputChange('operationRule', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>基本图号</label>
                  <input 
                    type="text" 
                    value={formData.basicDiagramNo}
                    onChange={(e) => handleInputChange('basicDiagramNo', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>是否有效</label>
                  <select 
                    value={formData.isValid ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('isValid', e.target.value === 'true')}
                    className="pt-input"
                  >
                    <option value="true">是</option>
                    <option value="false">否</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 有效期配置 */}
            <div style={{ marginBottom: '24px' }}>
              <div className="pt-section-title">有效期配置</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>开始日期</label>
                  <input 
                    type="date" 
                    value={formData.startValidDate}
                    onChange={(e) => handleInputChange('startValidDate', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>结束日期</label>
                  <input 
                    type="date" 
                    value={formData.endValidDate}
                    onChange={(e) => handleInputChange('endValidDate', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>距始发站天数</label>
                  <input 
                    type="number" 
                    value={formData.originStationDistanceDays}
                    onChange={(e) => handleInputChange('originStationDistanceDays', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>距终到站天数</label>
                  <input 
                    type="number" 
                    value={formData.terminalStationDistanceDays}
                    onChange={(e) => handleInputChange('terminalStationDistanceDays', parseInt(e.target.value))}
                    className="pt-input" 
                  />
                </div>
              </div>
            </div>

            {/* 关联计划配置 */}
            <div style={{ marginBottom: '24px' }}>
              <div className="pt-section-title">关联计划配置 <span style={{ fontSize: '11px', color: 'var(--pt-text-tertiary)', fontWeight: 400 }}>（基于自动关联规则生成）</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>开检计划</label>
                  <input 
                    type="text" 
                    value={formData.checkInPlan}
                    onChange={(e) => handleInputChange('checkInPlan', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>上屏计划</label>
                  <input 
                    type="text" 
                    value={formData.screenPlan}
                    onChange={(e) => handleInputChange('screenPlan', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>广播计划</label>
                  <input 
                    type="text" 
                    value={formData.broadcastPlan}
                    onChange={(e) => handleInputChange('broadcastPlan', e.target.value)}
                    className="pt-input" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--pt-text-secondary)', fontWeight: 500 }}>作业排班</label>
                  <input 
                    type="text" 
                    value={formData.schedulePlan}
                    onChange={(e) => handleInputChange('schedulePlan', e.target.value)}
                    className="pt-input" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--pt-border-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            background: 'var(--pt-surface)'
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

  // 历史抽屉组件
  const HistoryDrawer = ({ train, onClose }: { train: PassengerTrain; onClose: () => void }) => {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, animation: 'fadeIn 0.2s ease' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '480px',
            background: 'var(--pt-card-bg)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--pt-border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,252,1) 100%)',
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--pt-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--pt-purple) 0%, #C77DEE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <History size={18} color="white" />
                </div>
                变更历史 - {train.trainNo}
              </div>
            </div>
            <button onClick={onClose} className="pt-icon-button">
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div className="pt-timeline">
              {train.lifecycle.map((record, index) => (
                <div key={index} className="pt-timeline-item">
                  <div className={`pt-timeline-dot ${record.type}`} />
                  <div style={{
                    background: 'var(--pt-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--pt-border-light)',
                  }}>
                    <div className="pt-timeline-date">{record.date}</div>
                    <span className={`pt-timeline-type ${record.type}`}>
                      {record.type === 'enable' ? '车次启用' :
                        record.type === 'daily' ? '日常调度' :
                          record.type === 'diagram' ? '调图变更' : '车次停运'}
                    </span>
                    <div className="pt-timeline-description">{record.description}</div>
                    {record.changes && record.changes.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {record.changes.map((change, cidx) => (
                          <div key={cidx} className={`pt-change-item ${change.type}`}>
                            <span className="pt-change-field">{change.field}</span>
                            <span className="pt-change-arrow">→</span>
                            <span style={{ fontWeight: 500 }}>{change.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
      {/* 顶部工具栏 */}
      <header className="pt-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--pt-primary) 0%, var(--pt-primary-light) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <TrainFront size={22} color="white" />
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
            <Search size={18} className="pt-search-icon" />
            <input
              type="text"
              placeholder="搜索车次或车型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pt-search-input"
            />
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--pt-border)' }} />

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

      {/* 主内容区 */}
      <main className="pt-main">
        {/* 左侧：车次列表 */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
          <div className="pt-panel" style={{ height: '100%' }}>
            <div className="pt-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Train size={18} color="var(--pt-primary)" />
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
            </div>
            <div className="pt-panel-content">
              {/* 筛选标签 */}
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

              {/* 车次卡片列表 */}
              <div>
                {filteredTrains.map((train) => {
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
                          <span className={`pt-train-type ${train.trainType}`}>
                            {getTrainTypeLabel(train.trainType)}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
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
                          padding: '4px 10px',
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
                            <Layers size={13} />
                            {train.basicInfo.model}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} />
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
                          <History size={13} />
                          {train.lifecycle.length}次变更
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredTrains.length === 0 && (
                  <div className="pt-empty-state">
                    <div className="pt-empty-icon">
                      <Train size={36} color="var(--pt-text-tertiary)" />
                    </div>
                    <div className="pt-empty-text">未找到匹配的车次</div>
                    <div className="pt-empty-subtext">请尝试调整搜索条件</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：车次详情 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="pt-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="pt-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Route size={18} color="var(--pt-primary)" />
                车次详情
              </div>
              {selectedTrain && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowEditDrawer(true)}
                    className="pt-button pt-button-primary"
                    style={{ height: '32px', padding: '0 14px', fontSize: '13px' }}
                  >
                    <Edit3 size={14} />
                    编辑配置
                  </button>
                  <button
                    onClick={() => setShowHistoryDrawer(true)}
                    className="pt-button pt-button-secondary"
                    style={{ height: '32px', padding: '0 14px', fontSize: '13px' }}
                  >
                    <History size={14} />
                    查看历史
                  </button>
                </div>
              )}
            </div>

            <div className="pt-panel-content" style={{ padding: '20px', overflowY: 'auto' }}>
              {selectedTrain ? (
                <>
                  {/* 车次头部信息 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'linear-gradient(145deg, var(--pt-surface) 0%, rgba(0, 113, 227, 0.03) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--pt-border-light)',
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, var(--pt-primary) 0%, var(--pt-primary-light) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0, 113, 227, 0.35)',
                    }}>
                      <Train size={26} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--pt-text-primary)', letterSpacing: '-0.02em' }}>
                          {selectedTrain.trainNo}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          background: selectedTrain.trainType === 'highspeed' ? 'var(--pt-info-soft)' : 'var(--pt-warning-soft)',
                          color: selectedTrain.trainType === 'highspeed' ? 'var(--pt-primary)' : 'var(--pt-warning)',
                        }}>
                          {getTrainTypeLabel(selectedTrain.trainType)}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          background: 'var(--pt-surface)',
                          color: 'var(--pt-text-secondary)',
                          border: '1px solid var(--pt-border-light)'
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
                      <div style={{ fontSize: '13px', color: 'var(--pt-text-secondary)' }}>
                        当前版本: <span style={{ fontWeight: 600, color: 'var(--pt-text-primary)' }}>{selectedTrain.currentVersion}</span>
                        <span style={{ margin: '0 8px', color: 'var(--pt-border-strong)' }}>|</span>
                        启用日期: <span style={{ fontWeight: 600, color: 'var(--pt-text-primary)' }}>{selectedTrain.startDate}</span>
                        <span style={{ margin: '0 8px', color: 'var(--pt-border-strong)' }}>|</span>
                        来源: <span style={{ fontWeight: 600, color: getSourceColor(selectedTrain.source).color }}>{getSourceLabel(selectedTrain.source)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 基本信息 */}
                  <div className="pt-section" style={{ marginBottom: '16px' }}>
                    <div className="pt-section-title">基本信息</div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                    }}>
                      {[
                        { label: '车次', value: selectedTrain.trainNo },
                        { label: '车型', value: selectedTrain.basicInfo.model },
                        { label: '编组数', value: `${selectedTrain.basicInfo.formationCount}辆` },
                        { label: '编组方向', value: selectedTrain.basicInfo.formationDirection },
                        { label: '股道', value: selectedTrain.basicInfo.track },
                        { label: '方向', value: selectedTrain.basicInfo.direction === 'up' ? '上行' : '下行' },
                        { label: '状态', value: getStatusLabel(selectedTrain.status) },
                        { label: '版本', value: selectedTrain.currentVersion },
                      ].map((item, idx) => (
                        <div key={idx} className="pt-info-item" style={{ padding: '10px' }}>
                          <span className="pt-info-label">{item.label}</span>
                          <span className="pt-info-value">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 作业规则 */}
                  <div className="pt-section" style={{ marginBottom: '16px' }}>
                    <div className="pt-section-title">作业规则</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {[
                        { label: '运行周期', value: `${selectedTrain.operationRules.operationCycle}天` },
                        { label: '正倒序维护', value: selectedTrain.operationRules.orderMaintenance ? '✓ 是' : '✗ 否' },
                        { label: '车型维护', value: selectedTrain.operationRules.modelMaintenance ? '✓ 是' : '✗ 否' },
                        { label: '股道维护', value: selectedTrain.operationRules.trackMaintenance ? '✓ 是' : '✗ 否' },
                      ].map((item, idx) => (
                        <div key={idx} className="pt-info-item" style={{ padding: '10px' }}>
                          <span className="pt-info-label">{item.label}</span>
                          <span className="pt-info-value">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 关联计划 */}
                  <div className="pt-section" style={{ marginBottom: '16px' }}>
                    <div className="pt-section-title">关联计划</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {[
                        { label: '开检计划', value: selectedTrain.relatedPlans.checkInPlan, icon: CheckCircle2, color: 'var(--pt-success)' },
                        { label: '上屏计划', value: selectedTrain.relatedPlans.screenPlan, icon: Monitor, color: 'var(--pt-primary)' },
                        { label: '广播计划', value: selectedTrain.relatedPlans.broadcastPlan, icon: Mic, color: 'var(--pt-warning)' },
                        { label: '作业排班', value: selectedTrain.relatedPlans.schedulePlan, icon: Users, color: 'var(--pt-purple)' },
                      ].map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          background: 'var(--pt-surface)',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--pt-border-light)',
                          transition: 'all var(--transition-fast)',
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--pt-border)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--pt-border-light)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <item.icon size={13} color={item.color} />
                            <span style={{ fontSize: '11px', color: 'var(--pt-text-tertiary)', fontWeight: 600 }}>{item.label}</span>
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--pt-text-primary)', fontWeight: 600 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 自动关联规则 */}
                  <div className="pt-section" style={{ marginBottom: '16px' }}>
                    <div className="pt-section-title">自动关联规则</div>
                    <div style={{
                      background: 'var(--pt-surface)',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--pt-border-light)',
                      fontSize: '12px',
                      color: 'var(--pt-text-primary)',
                      lineHeight: '2',
                    }}>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div><strong style={{ color: 'var(--pt-text-secondary)' }}>车型：</strong>{selectedTrain.autoMatchRules.model.join('、')}</div>
                        <div><strong style={{ color: 'var(--pt-text-secondary)' }}>编组数：</strong>{selectedTrain.autoMatchRules.formationCount.join('、')}辆</div>
                        <div><strong style={{ color: 'var(--pt-text-secondary)' }}>编组方向：</strong>{selectedTrain.autoMatchRules.formationDirection.join('、')}</div>
                        <div><strong style={{ color: 'var(--pt-text-secondary)' }}>站停时间：</strong>{selectedTrain.autoMatchRules.stopTime.join('、')}分钟</div>
                        <div><strong style={{ color: 'var(--pt-text-secondary)' }}>方向：</strong>{selectedTrain.autoMatchRules.direction.map(d => d === 'up' ? '上行' : '下行').join('、')}</div>
                      </div>
                    </div>
                  </div>

                  {/* 车站列表 - 新增，利用空白区域 */}
                  <div className="pt-section" style={{ marginBottom: '16px' }}>
                    <div className="pt-section-title">途经车站</div>
                    <div style={{
                      background: 'var(--pt-surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--pt-border-light)',
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedTrain.stations.map((station, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            background: station.isOrigin ? 'var(--pt-success-soft)' : station.isTerminal ? 'var(--pt-error-soft)' : 'var(--pt-surface)',
                            border: `1px solid ${station.isOrigin ? 'var(--pt-success)' : station.isTerminal ? 'var(--pt-error)' : 'var(--pt-border-light)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            color: 'var(--pt-text-primary)',
                            fontWeight: station.isOrigin || station.isTerminal ? 600 : 500,
                          }}>
                            <span>{station.stationName}</span>
                            {idx < selectedTrain.stations.length - 1 && (
                              <span style={{ color: 'var(--pt-text-tertiary)' }}>→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 运行时间模块 - 移到最下面 */}
                  <div style={{ marginTop: '24px' }}>
                    <CalendarView train={selectedTrain} />
                  </div>
                </>
              ) : (
                <div className="pt-empty-state" style={{ padding: '80px 20px' }}>
                  <div className="pt-empty-icon">
                    <Train size={40} color="var(--pt-text-tertiary)" />
                  </div>
                  <div className="pt-empty-text">请选择左侧车次查看详情</div>
                  <div className="pt-empty-subtext">点击车次卡片查看完整生命周期信息</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 编辑抽屉 */}
      {showEditDrawer && selectedTrain && (
        <EditDrawer train={selectedTrain} onClose={() => setShowEditDrawer(false)} />
      )}

      {/* 历史抽屉 */}
      {showHistoryDrawer && selectedTrain && (
        <HistoryDrawer train={selectedTrain} onClose={() => setShowHistoryDrawer(false)} />
      )}
    </div>
  );
};

export default Component;
