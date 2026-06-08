/**
 * @name 计划比对
 */
import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Minus, Edit, Search, Lock, Unlock, RefreshCw,
  CheckCircle2, AlertCircle, HelpCircle, Check,
  Circle, MessageSquare, Keyboard, Eye, Printer, X, Clock,
} from 'lucide-react';
import {
  mockOldPlan,
  mockNewPlan,
  mockLockStates,
  mockCheckProgress,
  planGenerateTime,
} from './mock-data';
import {
  detectPlanDifferences,
  detectLockedPlanRegeneration,
  getFieldLabel,
} from './types';
import './style.css';
import type { planDifference, planLockState, checkProgress, templateData, DiffFilter } from './types';

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.FC<{ style?: React.CSSProperties }> }> = {
  added: { label: '新增', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0', icon: Plus },
  removed: { label: '减少', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', icon: Minus },
  modified: { label: '变更', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: Edit },
  unchanged: { label: '无变化', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: Circle },
};

const checkStatusConfig: Record<string, { label: string; color: string; icon: React.FC<{ style?: React.CSSProperties }> }> = {
  unchecked: { label: '未核对', color: '#9CA3AF', icon: Circle },
  checked: { label: '已核对', color: '#059669', icon: CheckCircle2 },
  confirmed: { label: '已确认', color: '#2563EB', icon: CheckCircle2 },
};

const btnStyles: Record<string, React.CSSProperties> = {
  primary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', border: '1px solid #5e6ad2',
    backgroundColor: '#5e6ad2', color: '#fff', whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  ghost: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', border: '1px solid #D1D5DB',
    backgroundColor: 'transparent', color: '#6B7280', whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  warning: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', border: '1px solid #F59E0B',
    backgroundColor: '#F59E0B', color: '#fff', whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
};

const Component: React.FC = () => {
    const [oldPlan, setOldPlan] = useState<templateData[]>(mockOldPlan);
    const [newPlan, setNewPlan] = useState<templateData[]>(mockNewPlan);
    const [differences, setDifferences] = useState<planDifference[]>(() => detectPlanDifferences(mockOldPlan, mockNewPlan));
    const [lockStates, setLockStates] = useState<planLockState[]>(mockLockStates);
    const [checkProgressMap, setCheckProgressMap] = useState<Map<string, checkProgress>>(() => {
      const map = new Map<string, checkProgress>();
      mockCheckProgress.forEach(cp => map.set(cp.trainNo, cp));
      return map;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<DiffFilter>({ type: 'all', checkStatus: 'all', showDiffOnly: false });
    const [selectedDiff, setSelectedDiff] = useState<planDifference | null>(null);
    const [selectedTrains, setSelectedTrains] = useState<Set<string>>(new Set());
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const [sortField, setSortField] = useState<'departureTime' | 'trainNo' | 'locked'>('departureTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
    const [showDetailPanel, setShowDetailPanel] = useState(true);
    const [showConflictListDrawer, setShowConflictListDrawer] = useState(false);
    const [legendVisible, setLegendVisible] = useState(true);
    const [compareDate, setCompareDate] = useState<{ from: string; to: string }>(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      return { from: formatDate(today), to: formatDate(tomorrow) };
    });
    const [showEditModal, setShowEditModal] = useState<{ trainNo: string; data: templateData } | null>(null);
    const [conflictSearchTerm, setConflictSearchTerm] = useState('');
    const [selectedResolutionAction, setSelectedResolutionAction] = useState<'applied' | 'kept' | 'reviewed'>('applied');
    const [resolutionReason, setResolutionReason] = useState('');
    const [showConflictOnly, setShowConflictOnly] = useState(false);
    const [viewingConflict, setViewingConflict] = useState<planLockState | null>(null);

  const lockedConflicts = useMemo(() => {
    return detectLockedPlanRegeneration(lockStates, newPlan).conflicts;
  }, [lockStates, newPlan]);

  const filteredConflicts = useMemo(() => {
    let filtered = [...lockedConflicts];
    if (conflictSearchTerm) {
      filtered = filtered.filter(c => c.trainNo.toLowerCase().includes(conflictSearchTerm.toLowerCase()));
    }
    return filtered.sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2 };
      const aPriority = a.conflictFields?.[0]?.priority || 'P2';
      const bPriority = b.conflictFields?.[0]?.priority || 'P2';
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
  }, [lockedConflicts, conflictSearchTerm]);

  const filteredDifferences = useMemo(() => {
    let filtered = [...differences];

    if (searchTerm) {
      filtered = filtered.filter(d => d.trainNo.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filter.type !== 'all') {
      filtered = filtered.filter(d => d.type === filter.type);
    }

    if (filter.showDiffOnly) {
      filtered = filtered.filter(d => d.type !== 'unchanged');
    }

    if (showConflictOnly) {
      filtered = filtered.filter(d => lockedConflicts.some(c => c.trainNo === d.trainNo));
    }

    filtered = filtered.filter(d => {
      if (filter.checkStatus === 'all') return true;
      const check = checkProgressMap.get(d.trainNo);
      return check?.checkStatus === filter.checkStatus;
    });

    filtered.sort((a, b) => {
      // 1. 按变更类型优先级排序（removed > added > modified > unchanged）
      const typeOrder: Record<string, number> = { 'removed': 0, 'added': 1, 'modified': 2, 'unchanged': 3 };
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;
      
      // 2. 按冲突状态排序（有冲突优先）
      const aHasConflict = lockedConflicts.some(c => c.trainNo === a.trainNo) ? 0 : 1;
      const bHasConflict = lockedConflicts.some(c => c.trainNo === b.trainNo) ? 0 : 1;
      const conflictDiff = aHasConflict - bHasConflict;
      if (conflictDiff !== 0) return conflictDiff;
      
      // 3. 按核对状态排序（unchecked > checked > confirmed）
      const checkOrder: Record<string, number> = { 'unchecked': 0, 'checked': 1, 'confirmed': 2 };
      const aCheckStatus = checkProgressMap.get(a.trainNo)?.checkStatus || 'unchecked';
      const bCheckStatus = checkProgressMap.get(b.trainNo)?.checkStatus || 'unchecked';
      const checkDiff = checkOrder[aCheckStatus] - checkOrder[bCheckStatus];
      if (checkDiff !== 0) return checkDiff;
      
      // 4. 按发车时间排序
      const timeA = a.newData?.departureTime || a.oldData?.departureTime || '00:00';
      const timeB = b.newData?.departureTime || b.oldData?.departureTime || '00:00';
      return sortOrder === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    });

    return filtered;
  }, [differences, searchTerm, filter, sortField, sortOrder, checkProgressMap, lockStates, lockedConflicts, showConflictOnly]);

  const summary = useMemo(() => ({
    total: differences.length,
    added: differences.filter(d => d.type === 'added').length,
    removed: differences.filter(d => d.type === 'removed').length,
    modified: differences.filter(d => d.type === 'modified').length,
    unchanged: differences.filter(d => d.type === 'unchanged').length,
  }), [differences]);

  const checkSummary = useMemo(() => {
    const checkList = Array.from(checkProgressMap.values());
    return {
      total: checkList.length,
      checked: checkList.filter(c => c.checkStatus === 'checked' || c.checkStatus === 'confirmed').length,
      unchecked: differences.filter(d => !checkProgressMap.has(d.trainNo) || checkProgressMap.get(d.trainNo)?.checkStatus === 'unchecked').length,
    };
  }, [checkProgressMap, differences]);

  const currentStep = useMemo((): 'understand' | 'verify' | 'confirm' => {
    if (checkSummary.checked < summary.total) return 'verify';
    return 'confirm';
  }, [checkSummary, summary]);

  const waitingCount = differences.filter(d => {
    const check = checkProgressMap.get(d.trainNo);
    return !check || check.checkStatus === 'unchecked';
  }).length;

  const notify = (type: 'success' | 'warning' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveEdit = (trainNo: string, updatedData: templateData) => {
    // 优先更新新计划，旧计划也同步（模拟实际业务中的维护场景）
    setNewPlan(prev => prev.map(p => p.trainNo === trainNo ? updatedData : p));
    setOldPlan(prev => prev.map(p => p.trainNo === trainNo ? updatedData : p));
    // 重新计算差异
    const newDiffs = detectPlanDifferences(
      oldPlan.map(p => p.trainNo === trainNo ? updatedData : p),
      newPlan.map(p => p.trainNo === trainNo ? updatedData : p)
    );
    setDifferences(newDiffs);
    // 更新当前选中的差异
    setSelectedDiff(prev => prev?.trainNo === trainNo ? newDiffs.find(d => d.trainNo === trainNo) || null : prev);
    setShowEditModal(null);
    notify('success', `${trainNo} 数据已保存`);
  };

  const handleSort = (field: 'departureTime' | 'trainNo' | 'locked') => {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleLockToggle = (trainNo: string) => {
    const currentlyLocked = lockStates.find(l => l.trainNo === trainNo)?.isLocked ?? false;
    setLockStates(prev => prev.map(lock =>
      lock.trainNo === trainNo ? { ...lock, isLocked: !lock.isLocked } : lock
    ));
    notify('success', `${!currentlyLocked ? '已锁定' : '已解锁'}车次 ${trainNo}`);
  };

  const handleCheckStatus = (trainNo: string, status: checkProgress['checkStatus'], extra?: { questionType?: string; notes?: string }) => {
    setCheckProgressMap(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(trainNo);
      if (existing) {
        newMap.set(trainNo, { ...existing, checkStatus: status, ...(extra || {}) });
      } else {
        newMap.set(trainNo, {
          id: trainNo,
          trainNo,
          diagramNo: '',
          checkStatus: status,
          ...(extra || {}),
        });
      }
      return newMap;
    });
  };

  const handleUnlockAll = () => {
    setLockStates(prev => prev.map(l => ({ ...l, isLocked: false })));
    notify('success', `已解锁 ${lockStates.filter(l => l.isLocked).length} 条计划`);
  };

  const handleSyncUpdate = () => {
    setLockStates(prev => prev.map(l => ({ ...l, isLocked: false })));
    notify('success', `已同步更新 ${differences.filter(d => d.type !== 'removed').length} 条计划`);
  };

  const handleConflictAction = (action: 'applied' | 'kept' | 'reviewed', trainNo?: string, reason?: string) => {
    if (!trainNo) return;
    
    const lock = lockStates.find(l => l.trainNo === trainNo);
    if (!lock) return;

    const now = new Date().toISOString();
    const affectedFields = lock.conflictFields?.map(f => f.fieldLabel) || [];
    
    const newRecord = {
      id: `${trainNo}-${Date.now()}`,
      action,
      timestamp: now,
      operator: '当前用户',
      reason,
      affectedFields,
    };

    setLockStates(prev => prev.map(l => {
      if (l.trainNo !== trainNo) return l;
      
      const updatedRecords = [...(l.disposalRecords || []), newRecord];
      const update: typeof l = {
        ...l,
        disposalRecords: updatedRecords,
        lastResolution: {
          action,
          timestamp: now,
          operator: '当前用户',
          reason,
        },
      };

      if (action === 'applied') {
        update.isLocked = false;
        update.conflictStatus = 'handled';
      } else if (action === 'kept') {
        update.conflictStatus = 'handled';
      } else if (action === 'reviewed') {
        update.conflictStatus = 'handled';
      }

      return update;
    }));

    if (action === 'applied') {
      notify('success', `已应用新计划，车次 ${trainNo} 已解锁`);
    } else if (action === 'kept') {
      notify('success', `已保持锁定状态，车次 ${trainNo} 继续锁定`);
    } else if (action === 'reviewed') {
      const diff = differences.find(d => d.trainNo === trainNo);
      if (diff) setSelectedDiff(diff);
      notify('success', `已跳转到 ${trainNo} 的差异详情，请审查后处理`);
    }
    
    setShowConflictOnly(false);
    setViewingConflict(null);
    setSelectedResolutionAction('applied');
    setResolutionReason('');
  };

  const toggleTrainSelection = (trainNo: string) => {
    setSelectedTrains(prev => {
      const next = new Set(prev);
      if (next.has(trainNo)) next.delete(trainNo);
      else next.add(trainNo);
      return next;
    });
  };

  const clearSelection = () => setSelectedTrains(new Set());

  const formatMergedField = (data?: templateData) => {
    if (!data) return null;
    // 编组数只保留数字
    const formationCount = data.model ? data.model.replace(/[^0-9]/g, '') || '—' : '—';
    const formationDir = data.orderDirection ? (data.orderDirection === '正序' ? '正' : '倒') : '—';
    // 停靠方向移除数字
    const stopDir = data.stopDirection ? data.stopDirection.replace(/[0-9]/g, '') || '—' : '—';
    const color = data.landmarkColor || '—';
    return { formationCount, formationDir, stopDir, color };
  };

  const getColorDisplay = (colorName: string) => {
    const colorMap: Record<string, string> = {
      '红': '#EF4444',
      '绿': '#10B981',
      '黄': '#F59E0B',
      '蓝': '#3B82F6',
    };
    return colorMap[colorName] || '#6B7280';
  };

  const getTypeLabel = (status?: string) => {
    if (!status) return '途径';
    return status;
  };

  const getTypeClass = (status?: string) => {
    if (status === '始发') return 'origin';
    if (status === '终到') return 'terminal';
    return 'pass';
  };

  const getTypeColor = (status?: string) => {
    if (status === '始发') return '#fde047';
    if (status === '终到') return '#6ee7b7';
    return '#d8b4fe';
  };

  return (
    <div className="plan-comparison">
      {notification && (
        <div style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)', top: '72px', zIndex: 999,
          padding: '12px 24px', borderRadius: '10px',
          backgroundColor: notification.type === 'success' ? '#10B981' : notification.type === 'error' ? '#EF4444' : '#F59E0B',
          color: '#fff', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}>
          {notification.message}
        </div>
      )}

      <header className="pc-header">
        <div className="pc-header-left">
          <h1 className="pc-title">计划比对</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <input type="date" className="pc-date-input" value={compareDate.from} onChange={e => setCompareDate(prev => ({ ...prev, from: e.target.value }))} />
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>→</span>
            <input type="date" className="pc-date-input" value={compareDate.to} onChange={e => setCompareDate(prev => ({ ...prev, to: e.target.value }))} />
          </div>
        </div>
        <div className="pc-header-right">
          <span style={{ fontSize: '13px', color: '#374151', marginRight: '16px', fontWeight: 600 }}>{checkSummary.checked}/{summary.total} 已核对</span>
          <button style={{ ...btnStyles.ghost, padding: '6px 10px' }} onClick={() => setShowKeyboardHelp(v => !v)}>
            <Keyboard style={{ width: '14px', height: '14px' }} />
          </button>
          <button style={{ ...btnStyles.ghost, padding: '6px 10px', marginLeft: '6px' }} onClick={() => setShowDetailPanel(v => !v)}>
            <Eye style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </header>

      {/* 步骤指示器 */}
      <div className="pc-step-bar">
        <div className="pc-step-item pc-step-1">
          <span className={`pc-step-circle ${currentStep === 'understand' ? 'active' : 'done'}`}>1</span>
          <span className="pc-step-label">了解变更</span>
        </div>
        <div className="pc-step-line" />
        <div className="pc-step-item pc-step-2">
          <span className={`pc-step-circle ${currentStep === 'verify' ? 'active' : checkSummary.checked > 0 ? 'done' : ''}`}>2</span>
          <span className="pc-step-label">逐一核对</span>
        </div>
        <div className="pc-step-line" />
        <div className="pc-step-item pc-step-3">
          <span className={`pc-step-circle ${currentStep === 'confirm' ? 'active' : ''}`}>3</span>
          <span className="pc-step-label">确认锁定</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>当前：</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: currentStep === 'verify' ? '#F59E0B' : currentStep === 'confirm' ? '#10B981' : '#5e6ad2' }}>
            {currentStep === 'understand' ? '了解变更' : currentStep === 'verify' ? '逐一核对变更' : '确认锁定'}
          </span>
        </div>
      </div>

      <div className="pc-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="pc-toolbar-left" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="pc-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pc-filter-label" style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>变更类型：</span>
            <div className="pc-filter-tabs" style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setFilter(prev => ({ ...prev, type: 'all', showDiffOnly: false }))}
                style={{
                  padding: '6px 14px',
                  border: `2px solid ${filter.type === 'all' && !filter.showDiffOnly ? '#3B82F6' : '#D1D5DB'}`,
                  backgroundColor: filter.type === 'all' && !filter.showDiffOnly ? '#EFF6FF' : '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: filter.type === 'all' && !filter.showDiffOnly ? 700 : 500,
                  color: filter.type === 'all' && !filter.showDiffOnly ? '#1D4ED8' : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: filter.type === 'all' && !filter.showDiffOnly ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                }}
              >
                全部 <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>{summary.total}</span>
              </button>
              {(['added', 'removed', 'modified', 'unchanged'] as const).map(t => {
                const cfg = typeConfig[t];
                const isActive = filter.type === t;
                const colors: Record<string, { bg: string; border: string; text: string }> = {
                  added: { bg: '#ECFDF5', border: '#10B981', text: '#047857' },
                  removed: { bg: '#FEF2F2', border: '#EF4444', text: '#B91C1C' },
                  modified: { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' },
                  unchanged: { bg: '#F3F4F6', border: '#9CA3AF', text: '#4B5563' },
                };
                const color = colors[t];
                return (
                  <button 
                    key={t} 
                    onClick={() => setFilter(prev => ({ ...prev, type: t, showDiffOnly: false }))}
                    style={{
                      padding: '6px 14px',
                      border: `2px solid ${isActive ? color.border : '#D1D5DB'}`,
                      backgroundColor: isActive ? color.bg : '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? color.text : '#6B7280',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? `0 2px 8px ${color.border}33` : 'none',
                    }}
                  >
                    {cfg.label} <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>{summary[t]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="pc-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pc-filter-label" style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>核对状态：</span>
            <div className="pc-filter-tabs" style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'unchecked', 'checked'] as const).map(s => {
                const label = s === 'all' ? '全部' : checkStatusConfig[s].label;
                const isActive = filter.checkStatus === s;
                const isUncheckedFilter = s === 'unchecked';
                const uncheckedCount = waitingCount;
                
                if (isActive) {
                  const colors = s === 'checked' 
                    ? { bg: '#ECFDF5', border: '#10B981', text: '#047857' }
                    : s === 'unchecked'
                      ? { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' }
                      : { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' };
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(prev => ({ ...prev, checkStatus: s }))}
                      style={{
                        padding: '6px 14px',
                        border: `2px solid ${colors.border}`,
                        backgroundColor: colors.bg,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: `0 2px 8px ${colors.border}33`,
                      }}
                    >
                      {label}
                      {isUncheckedFilter && <span style={{ marginLeft: '4px', fontSize: '11px' }}>({uncheckedCount})</span>}
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(prev => ({ ...prev, checkStatus: s }))}
                      style={{
                        padding: '6px 14px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#6B7280',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                      {isUncheckedFilter && <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>({uncheckedCount})</span>}
                    </button>
                  );
                }
              })}
            </div>
          </div>
          
          {lockedConflicts.length > 0 && (
            <button 
              style={{ 
                padding: '6px 14px',
                border: `2px solid ${showConflictOnly ? '#DC2626' : '#FECACA'}`,
                backgroundColor: showConflictOnly ? '#DC2626' : '#FEF2F2',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: showConflictOnly ? '#FFFFFF' : '#DC2626',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: showConflictOnly ? '0 2px 8px rgba(220, 38, 38, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }} 
              onClick={() => setShowConflictOnly(!showConflictOnly)}
            >
              <AlertCircle style={{ width: '14px', height: '14px' }} /> 冲突 {lockedConflicts.length}
            </button>
          )}
        </div>
        <div className="pc-toolbar-right">
          <div className="pc-search-box">
            <Search className="pc-search-icon" />
            <input className="pc-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索车次..." />
          </div>
        </div>
      </div>

      <div className="pc-main" style={showDetailPanel ? undefined : { padding: '16px 24px' }}>
        <div className={`pc-table-container ${!showDetailPanel ? 'full-width' : ''}`}>
          {/* 简化的图例区域 */}
          <div style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10B981', marginRight: '4px' }}></span>新增
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#EF4444', marginRight: '4px' }}></span>减少
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#3B82F6', marginRight: '4px' }}></span>变更
            </span>
          </div>

          <div className="pc-card-list">
            {filteredDifferences.map(diff => {
              const cfg = typeConfig[diff.type];
              const check = checkProgressMap.get(diff.trainNo);
              const checkCfg = check ? checkStatusConfig[check.checkStatus] : checkStatusConfig.unchecked;
              const CheckIcon = checkCfg.icon;
              const isSelected = selectedDiff?.trainNo === diff.trainNo;
              const isLocked = lockStates.find(l => l.trainNo === diff.trainNo)?.isLocked;
              const data = diff.newData || diff.oldData;
              const mergedText = formatMergedField(data);
              const typeClass = getTypeClass(data?.status);
              const typeColor = getTypeColor(data?.status);
              const typeLabel = getTypeLabel(data?.status);
              const isUnchecked = !check || check.checkStatus === 'unchecked';
              const hasConflict = lockedConflicts.some(c => c.trainNo === diff.trainNo);
              const conflict = hasConflict ? lockedConflicts.find(c => c.trainNo === diff.trainNo) : null;
              const isConflictHandled = conflict?.conflictStatus === 'handled';
              
              return (
                <div
                  key={diff.trainNo}
                  className={`pc-card pc-card-${diff.type} pc-card-check-${check?.checkStatus || 'unchecked'} ${isSelected ? 'detail-selected' : ''}`}
                  onClick={() => setSelectedDiff(diff)}
                  style={{
                    boxShadow: isUnchecked ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : undefined,
                    backgroundColor: hasConflict 
                      ? (isConflictHandled ? '#ECFDF5' : '#FEE2E2')
                      : undefined,
                    borderLeft: hasConflict 
                      ? `4px solid ${isConflictHandled ? '#059669' : '#DC2626'}`
                      : undefined,
                  }}
                >
                  {/* 顶部标题区域 - 车次信息放在首位 */}
                  <div className="pc-card-header-row">
                    <div className="pc-card-header-left">
                      {/* 车次信息 - 最优先显示 */}
                      <div className="pc-trainno-wrapper">
                        <span className={`pc-trainno pc-trainno-strong pc-trainno-${typeClass}`}>{diff.trainNo}</span>
                        {hasConflict && (
                          <span 
                            style={{
                              marginLeft: '8px',
                              padding: '3px 8px',
                              backgroundColor: isConflictHandled ? '#ECFDF5' : '#FEE2E2',
                              color: isConflictHandled ? '#059669' : '#DC2626',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const conflict = lockedConflicts.find(c => c.trainNo === diff.trainNo);
                              if (conflict) {
                                setViewingConflict(conflict);
                                setSelectedDiff(diff);
                              }
                            }}
                          >
                            <AlertCircle style={{ width: '12px', height: '12px' }} />
                            {isConflictHandled ? '已处理' : '冲突'}
                          </span>
                        )}
                      </div>
                      {/* 核对状态显示 - 固定信息在左边 */}
                      <div className="pc-status-display">
                        {check?.checkStatus === 'checked' && (
                          <span className="pc-status-badge checked">
                            <Check style={{ width: '14px', height: '14px' }} />
                            已核对
                          </span>
                        )}
                        {check?.checkStatus === 'confirmed' && (
                          <span className="pc-status-badge confirmed">
                            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                            已确认
                          </span>
                        )}
                        {isUnchecked && (
                          <span className="pc-status-badge unchecked" style={{
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                            fontWeight: 600,
                          }}>
                            <Circle style={{ width: '14px', height: '14px' }} />
                            未核对
                          </span>
                        )}
                      </div>
                      {/* 锁定状态标签 */}
                      <div className="pc-card-badges">
                        {isLocked && <span className="pc-lock-badge"><Lock style={{ width: '10px', height: '10px' }} />锁定</span>}
                        {data?.focusFlag && <span className="pc-focus-dot" title="重点关注" />}
                      </div>
                    </div>
                    <div className="pc-card-actions" onClick={e => e.stopPropagation()}>
                      <button className="pc-check-btn" title={checkCfg.label} onClick={() => {
                        const next = check?.checkStatus === 'unchecked' ? 'checked' : 'unchecked';
                        handleCheckStatus(diff.trainNo, next);
                        notify('success', `${diff.trainNo} 已标记为${next === 'checked' ? '已核对' : '未核对'}`);
                      }}>
                        <CheckIcon style={{ width: '14px', height: '14px', color: checkCfg.color }} />
                      </button>
                      <button className="pc-ghost-btn" onClick={() => setShowEditModal({ trainNo: diff.trainNo, data: data! })} title="编辑">
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button className="pc-ghost-btn" onClick={() => handleLockToggle(diff.trainNo)} title={isLocked ? '解锁' : '锁定'}>
                        {isLocked ? <Unlock style={{ width: '14px', height: '14px' }} /> : <Lock style={{ width: '14px', height: '14px' }} />}
                      </button>
                    </div>
                  </div>

                  {/* 底部信息区域 */}
                  <div className="pc-card-content-row">
                    <div className="pc-card-grid">
                      <div className="pc-card-item pc-card-item-primary"><span className="item-label">始发</span><strong className="item-value">{data?.originStation?.substring(0, 3) || '—'}</strong></div>
                      <div className="pc-card-item pc-card-item-primary"><span className="item-label">终到</span><strong className="item-value">{data?.terminalStation?.substring(0, 3) || '—'}</strong></div>
                      <div className="pc-card-item pc-card-item-primary"><span className="item-label">到点</span><strong className="item-value">{data?.arrivalTime || '—'}</strong></div>
                      <div className="pc-card-item pc-card-item-primary"><span className="item-label">开点</span><strong className="item-value">{data?.departureTime || '—'}</strong></div>
                      <div className="pc-card-item pc-card-item-primary"><span className="item-label">股道</span><strong className="item-value">{data?.track || '—'}</strong></div>
                     <div className="pc-card-item pc-card-item-primary"><span className="item-label">检票</span><strong className="item-value">{data?.gates?.split('、')[0] || '—'}</strong></div>
                     <div className="pc-card-item"><span className="item-label">车型</span><strong className="item-value">{data?.formation || '—'}</strong></div>
                     <div className="pc-card-item pc-card-item-merged">
                       <span className="item-label">停靠</span>
                       <strong className="item-value">
                         {mergedText ? (
                           <>
                             <span className="pc-merged-part formation">{mergedText.formationCount}</span>
                             <span className="pc-merged-part order">{mergedText.formationDir}</span>
                             <span className="pc-merged-part direction">{mergedText.stopDir}</span>
                             <span className="pc-merged-part color" style={{
                               display: 'inline-flex', alignItems: 'center', gap: '4px',
                             }}>
                               <span style={{
                                 width: '10px', height: '10px', borderRadius: '2px',
                                 backgroundColor: getColorDisplay(mergedText.color),
                                 border: '1px solid rgba(0,0,0,0.1)'
                               }} />
                               {mergedText.color}
                             </span>
                           </>
                         ) : '—'}
                       </strong>
                     </div>
                      <div className="pc-card-item pc-card-item-tags">
                        <span className="item-label">作业</span>
                        <div className="pc-service-tags" style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
                          {data?.waterSupply === '有' && (
                            <span className="pc-service-tag water">上水</span>
                          )}
                          {data?.sewageSuction === '有' && (
                            <span className="pc-service-tag sewage">吸污</span>
                          )}
                          {data?.baggage === '有' && (
                            <span className="pc-service-tag baggage">行包</span>
                          )}
                          {data?.waterSupply !== '有' && data?.sewageSuction !== '有' && data?.baggage !== '有' && (
                            <span className="pc-service-tag none">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 处置记录区域 - 仅在有记录时显示 */}
                  {(() => {
                    const lock = lockStates.find(l => l.trainNo === diff.trainNo);
                    if (!lock || !lock.disposalRecords || lock.disposalRecords.length === 0) return null;
                    
                    const actionLabels: Record<string, { label: string; color: string }> = {
                      applied: { label: '应用新计划', color: '#059669' },
                      kept: { label: '保持锁定', color: '#6B7280' },
                      reviewed: { label: '审查后处理', color: '#D97706' },
                    };
                    
                    return (
                      <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #E5E7EB',
                        backgroundColor: '#FAFAFA',
                      }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 10px 0' }}>处置记录</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {lock.disposalRecords.map((record) => (
                            <div key={record.id} style={{
                              padding: '10px 12px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{record.timestamp.slice(0, 16).replace('T', ' ')}</span>
                                </div>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: actionLabels[record.action].color + '15',
                                  color: actionLabels[record.action].color,
                                }}>
                                  {actionLabels[record.action].label}
                                </span>
                              </div>
                              {record.reason && (
                                <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>原因：{record.reason}</div>
                              )}
                              {record.affectedFields && record.affectedFields.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                                  受影响字段：{record.affectedFields.join('、')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          <div className="pc-card-summary" style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="pc-summary-tag total">共 {filteredDifferences.length} 条</span>
              <span className="pc-summary-tag checked">已核对 {checkSummary.checked}</span>
              <span className="pc-summary-tag unchecked">未核对 {waitingCount}</span>
            </div>
            {selectedTrains.size > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pc-summary-tag selected">已选中 {selectedTrains.size} 条</span>
                <button style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#4B5563', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }} onClick={clearSelection}>清空</button>
              </span>
            )}
          </div>
        </div>

        {showDetailPanel && (
          <div style={{ width: '340px', flexShrink: 0, backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {viewingConflict ? '冲突详情' : '差异详情'}
                </h3>
                {viewingConflict && (
                  <button 
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: '#6B7280', padding: '4px', fontSize: '12px' 
                    }}
                    onClick={() => setViewingConflict(null)}
                  >
                    关闭
                  </button>
                )}
              </div>
              {selectedDiff && <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{selectedDiff.trainNo} · {viewingConflict ? '有冲突' : typeConfig[selectedDiff.type].label}</p>}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {viewingConflict ? (
                <>
                  <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B', marginBottom: '6px' }}>来源：计划生成命令</div>
                    <div style={{ fontSize: '12px', color: '#7F1D1D', lineHeight: 1.5 }}>
                      {viewingConflict.lockedReason || '已锁定的计划收到新的修改命令，检测到冲突。请选择处理方式。'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 8px 0' }}>锁定信息</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>锁定时间</span>
                        <span style={{ color: '#111827' }}>{viewingConflict.lockedAt || '—'}</span>
                      </div>

                    </div>
                  </div>

                  {viewingConflict.conflictFields && viewingConflict.conflictFields.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 10px 0' }}>
                        冲突字段 ({viewingConflict.conflictFields.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {viewingConflict.conflictFields.map((field, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{field.fieldLabel}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                              <span style={{ color: '#9CA3AF', textDecoration: 'line-through' }}>{String(field.oldValue || '—')}</span>
                              <span style={{ color: '#6B7280', fontSize: '10px' }}>→</span>
                              <span style={{ color: '#1D4ED8', fontWeight: 600 }}>{String(field.newValue || '—')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 10px 0' }}>选择处理方式：</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {(['applied', 'kept', 'reviewed'] as const).map(action => {
                        const actionLabels: Record<string, { label: string; desc: string }> = {
                          applied: { label: '应用新计划', desc: '采用新数据，解锁车次' },
                          kept: { label: '保持锁定', desc: '保留原数据，继续锁定' },
                          reviewed: { label: '审查后处理', desc: '查看差异，稍后处理' },
                        };
                        const config = actionLabels[action];
                        return (
                          <label key={action} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '8px', borderRadius: '4px', backgroundColor: selectedResolutionAction === action ? '#EFF6FF' : 'transparent' }}>
                            <input
                              type="radio"
                              name="resolution"
                              checked={selectedResolutionAction === action}
                              onChange={() => setSelectedResolutionAction(action)}
                              style={{ accentColor: '#5e6ad2', marginTop: '2px' }}
                            />
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>{config.label}</div>
                              <div style={{ fontSize: '11px', color: '#6B7280' }}>{config.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>处理原因（可选）：</label>
                      <textarea
                        value={resolutionReason}
                        onChange={(e) => setResolutionReason(e.target.value)}
                        placeholder="请输入处理原因（可选）..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #E5E7EB',
                          fontSize: '12px',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button 
                      style={{ width: '100%', ...btnStyles.primary, fontSize: '13px' }} 
                      onClick={() => {
                        handleConflictAction(selectedResolutionAction, viewingConflict.trainNo, resolutionReason);
                        setViewingConflict(null);
                        setSelectedResolutionAction('applied');
                        setResolutionReason('');
                      }}
                    >
                      确认处理
                    </button>
                  </div>
                </>
              ) : selectedDiff ? (
                <>
                  {selectedDiff.type === 'modified' && selectedDiff.changedFields && selectedDiff.changedFields.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', margin: '0 0 10px 0' }}>变更字段 ({selectedDiff.changedFields.length})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedDiff.changedFields.map((field, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', backgroundColor: '#F9FAFB', borderRadius: '4px', fontSize: '12px' }}>
                            <span style={{ fontWeight: 500, color: '#374151', flex: 1 }}>{getFieldLabel(field.field)}</span>
                            <span style={{ color: '#9CA3AF' }}>{String(field.oldValue || '—')}</span>
                            <span style={{ color: '#6B7280' }}>→</span>
                            <span style={{ color: '#1D4ED8', fontWeight: 600 }}>{String(field.newValue || '—')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '16px 0', borderTop: '1px solid #F3F4F6' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', margin: '0 0 12px 0' }}>核对状态</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {(['unchecked', 'checked', 'confirmed'] as const).map(status => {
                        const isActive = checkProgressMap.get(selectedDiff.trainNo)?.checkStatus === status;
                        const config = checkStatusConfig[status];
                        const StatusIcon = config.icon;
                        return (
                          <button
                            key={status}
                            onClick={() => {
                              handleCheckStatus(selectedDiff.trainNo, status);
                              notify('success', `${selectedDiff.trainNo} 已标记为${checkStatusConfig[status].label}`);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                              backgroundColor: isActive ? (status === 'checked' ? '#ECFDF5' : status === 'confirmed' ? '#EFF6FF' : '#F3F4F6') : '#fff',
                              border: isActive ? `1px solid ${status === 'checked' ? '#A7F3D0' : status === 'confirmed' ? '#BFDBFE' : '#D1D5DB'}` : '1px solid #E5E7EB',
                              borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: isActive ? 600 : 400,
                              color: isActive ? config.color : '#6B7280', transition: 'all 0.15s',
                            }}
                          >
                            <StatusIcon style={{ width: '14px', height: '14px' }} />
                            <span>{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', padding: '16px 0', borderTop: '1px solid #F3F4F6' }}>
                    <button style={btnStyles.primary} onClick={() => setShowEditModal({ trainNo: selectedDiff.trainNo, data: (selectedDiff.newData || selectedDiff.oldData)! })}>
                      <Edit style={{ width: '14px', height: '14px' }} /> 编辑数据
                    </button>
                    <button style={lockStates.find(l => l.trainNo === selectedDiff.trainNo)?.isLocked ? btnStyles.ghost : btnStyles.warning} onClick={() => handleLockToggle(selectedDiff.trainNo)}>
                      <Lock style={{ width: '14px', height: '14px' }} />{lockStates.find(l => l.trainNo === selectedDiff.trainNo)?.isLocked ? '解锁' : '锁定'}
                    </button>
                  </div>

                  {/* 处置记录展示 */}
                  {(() => {
                    const lock = lockStates.find(l => l.trainNo === selectedDiff.trainNo);
                    if (!lock || !lock.disposalRecords || lock.disposalRecords.length === 0) return null;
                    
                    const actionLabels: Record<string, { label: string; color: string }> = {
                      applied: { label: '应用新计划', color: '#059669' },
                      kept: { label: '保持锁定', color: '#6B7280' },
                      reviewed: { label: '审查后处理', color: '#D97706' },
                    };
                    
                    return (
                      <div style={{ padding: '16px 0', borderTop: '1px solid #F3F4F6' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: '0 0 12px 0' }}>处置记录</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {lock.disposalRecords.map((record, i) => (
                            <div key={record.id} style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{record.timestamp.slice(0, 16).replace('T', ' ')}</span>
                                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{record.operator}</span>
                                </div>
                                <span style={{ 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: 600,
                                  backgroundColor: actionLabels[record.action].color + '15',
                                  color: actionLabels[record.action].color,
                                }}>
                                  {actionLabels[record.action].label}
                                </span>
                              </div>
                              {record.reason && (
                                <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>原因：{record.reason}</div>
                              )}
                              {record.affectedFields && record.affectedFields.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>受影响字段：{record.affectedFields.join('、')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', color: '#9CA3AF', textAlign: 'center' }}>
                  <Eye style={{ width: '64px', height: '64px', marginBottom: '16px', opacity: 0.25 }} />
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#6B7280', marginBottom: '6px' }}>点击左侧卡片查看变更详情</span>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>选择一个车次，对比其计划变更</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedTrains.size > 0 && (
        <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', borderTop: '1px solid #E5E7EB', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '13px', color: '#374151' }}>已选中 {selectedTrains.size} 条车次，可批量处理</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={btnStyles.ghost} onClick={clearSelection}>清空选择</button>
            <button style={btnStyles.warning} onClick={() => {
              selectedTrains.forEach(trainNo => handleCheckStatus(trainNo, 'checked'));
              notify('success', `已批量标记 ${selectedTrains.size} 条为已核对`);
              clearSelection();
            }}>批量核对</button>
            <button style={btnStyles.primary} onClick={() => {
              setShowConflictListDrawer(true);
              notify('warning', `已打开冲突车次列表`);
            }}>查看冲突</button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#fff', borderTop: '1px solid #E5E7EB',
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center' }}>
          {waitingCount > 0 && (
            <div style={{ fontSize: '13px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle style={{ width: '16px', height: '16px' }} />
              还有 {waitingCount} 条变更需要核对
            </div>
          )}
          {waitingCount === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                所有变更已核对完成
              </div>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                backgroundColor: '#10B981', color: '#fff', border: 'none', cursor: 'pointer',
              }} onClick={() => {
                // 方案 B 动作：把所有车次标记为已确认，并且锁定
                // 先标记 confirmed
                differences.forEach(diff => {
                  handleCheckStatus(diff.trainNo, 'confirmed');
                });
                // 再全部锁定
                setLockStates(prev => prev.map(lock => ({ ...lock, isLocked: true })));
                notify('success', '所有车次已确认并锁定');
              }}>
                <Lock style={{ width: '14px', height: '14px' }} />
                确认锁定
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={btnStyles.ghost} onClick={handleUnlockAll}><Unlock style={{ width: '14px', height: '14px' }} /> 全部解锁</button>
          <button style={btnStyles.primary} onClick={handleSyncUpdate}><RefreshCw style={{ width: '14px', height: '14px' }} /> 同步更新</button>
          <button style={btnStyles.ghost}><Printer style={{ width: '14px', height: '14px' }} /> 打印清单</button>
        </div>
      </div>

      {/* 冲突车次列表 Drawer */}
      {showConflictListDrawer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.18)', zIndex: 998 }} onClick={() => setShowConflictListDrawer(false)}>
          <div style={{ position: 'absolute', right: 0, top: 0, width: '400px', height: '100%', backgroundColor: '#fff', borderLeft: '1px solid #E5E7EB', boxShadow: '-4px 0 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>冲突处理</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>共 {lockedConflicts.length} 条冲突车次，按优先级排序</div>
              </div>
              <button style={{ ...btnStyles.ghost, padding: '4px 8px' }} onClick={() => setShowConflictListDrawer(false)}><X style={{ width: '14px', height: '14px' }} /></button>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="搜索冲突车次"
                  value={conflictSearchTerm}
                  onChange={e => setConflictSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                    backgroundColor: '#F9FAFB',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
              {filteredConflicts.map(item => {
                const priority = item.conflictFields?.[0]?.priority || 'P2';
                const priorityColors: Record<string, { bg: string; color: string }> = {
                  P0: { bg: '#FEF2F2', color: '#DC2626' },
                  P1: { bg: '#FFFBEB', color: '#D97706' },
                  P2: { bg: '#F3F4F6', color: '#6B7280' },
                };
                const conflictFieldNames = item.conflictFields?.map(f => f.fieldLabel).join('、') || '未知字段';
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '6px', 
                      padding: '10px 12px', 
                      marginBottom: '8px', 
                      cursor: 'pointer',
                      backgroundColor: item.conflictStatus === 'resolved' ? '#F9FAFB' : '#FEF2F2',
                      borderColor: item.conflictStatus === 'resolved' ? '#E5E7EB' : '#FECACA',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => {
                      setShowConflictListDrawer(false);
                      setViewingConflict(item);
                      const diff = differences.find(d => d.trainNo === item.trainNo);
                      if (diff) setSelectedDiff(diff);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#111827', fontSize: '13px' }}>{item.trainNo}</strong>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: priorityColors[priority].bg,
                          color: priorityColors[priority].color,
                        }}>[{priority}]</span>
                      </div>
                      <span style={{ fontSize: '11px', color: item.conflictStatus === 'resolved' ? '#059669' : '#DC2626', fontWeight: 500 }}>
                        {item.conflictStatus === 'resolved' ? '已处理' : '待处理'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
                      冲突字段：{conflictFieldNames}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      锁定于 {item.lockedAt || '未知时间'}
                    </div>
                  </div>
                );
              })}
              {filteredConflicts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: '13px' }}>
                  未找到匹配的冲突车次
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {showEditModal && (
        <EditModal
          trainNo={showEditModal.trainNo}
          initialData={showEditModal.data}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditModal(null)}
        />
      )}

      {showKeyboardHelp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '400px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Keyboard style={{ width: '18px', height: '18px', color: '#374151' }} />
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>快捷键帮助</span>
              </div>
              <button onClick={() => setShowKeyboardHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}><X style={{ width: '18px', height: '18px' }} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: '↑↓', desc: '上下移动聚焦行' },
                  { key: 'Enter', desc: '查看详情' },
                  { key: 'Space', desc: '标记已核对 / 取消核对' },
                  { key: 'Ctrl+F', desc: '搜索车次' },
                  { key: 'Esc', desc: '关闭弹窗' },
                ].map(({ key, desc }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <span style={{ minWidth: '60px', padding: '4px 8px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#374151', textAlign: 'center' }}>{key}</span>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={btnStyles.primary} onClick={() => setShowKeyboardHelp(false)}>知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditModal: React.FC<{
  trainNo: string;
  initialData: any;
  onSave: (trainNo: string, data: any) => void;
  onCancel: () => void;
}> = ({ trainNo, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<any>({ ...initialData });
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '640px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit style={{ width: '18px', height: '18px', color: '#5e6ad2' }} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>修改</span>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}><X style={{ width: '18px', height: '18px' }} /></button>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>始发站</label>
              <input
                type="text"
                value={formData.originStation || ''}
                onChange={e => setFormData({ ...formData, originStation: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>终到站</label>
              <input
                type="text"
                value={formData.terminalStation || ''}
                onChange={e => setFormData({ ...formData, terminalStation: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>到点</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="datetime-local"
                  value={formData.arrivalTime || ''}
                  onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', paddingRight: '36px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s' }}
                />
                <Clock style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9CA3AF' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>开点</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="datetime-local"
                  value={formData.departureTime || ''}
                  onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', paddingRight: '36px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s' }}
                />
                <Clock style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9CA3AF' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>股道</label>
              <select
                value={formData.track || ''}
                onChange={e => setFormData({ ...formData, track: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s', backgroundColor: '#fff' }}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>编组</label>
              <input
                type="text"
                value={formData.formation || ''}
                onChange={e => setFormData({ ...formData, formation: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>车型</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>上水</label>
              <select
                value={formData.waterSupply || '否'}
                onChange={e => setFormData({ ...formData, waterSupply: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s', backgroundColor: '#fff' }}
              >
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>吸污</label>
              <select
                value={formData.sewageSuction || '否'}
                onChange={e => setFormData({ ...formData, sewageSuction: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s', backgroundColor: '#fff' }}
              >
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>行包</label>
              <select
                value={formData.baggage || '否'}
                onChange={e => setFormData({ ...formData, baggage: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border 0.15s', backgroundColor: '#fff' }}
              >
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid #D1D5DB', backgroundColor: 'transparent', color: '#6B7280' }}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid #5e6ad2', backgroundColor: '#5e6ad2', color: '#fff' }}
            onClick={() => onSave(trainNo, formData)}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default Component;
