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
  questioned: { label: '有疑问', color: '#F59E0B', icon: HelpCircle },
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
    const [showQuestionModal, setShowQuestionModal] = useState<templateData | null>(null);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const [sortField, setSortField] = useState<'departureTime' | 'trainNo' | 'priority' | 'locked'>('departureTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
    const [showDetailPanel, setShowDetailPanel] = useState(true);
    const [showConflictDrawer, setShowConflictDrawer] = useState(false);
    const [legendVisible, setLegendVisible] = useState(true);
    const [compareDate, setCompareDate] = useState<{ from: string; to: string }>(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      return { from: formatDate(today), to: formatDate(tomorrow) };
    });
    const [showEditModal, setShowEditModal] = useState<{ trainNo: string; data: templateData } | null>(null);
    const questionTypeRef = useRef<string>('data_anomaly');
    const questionNotesRef = useRef<HTMLTextAreaElement>(null);

  const lockedConflicts = useMemo(() => detectLockedPlanRegeneration(lockStates, newPlan).conflicts, [lockStates, newPlan]);

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

    filtered = filtered.filter(d => {
      if (filter.checkStatus === 'all') return true;
      const check = checkProgressMap.get(d.trainNo);
      return check?.checkStatus === filter.checkStatus;
    });

    filtered.sort((a, b) => {
      const lockA = lockStates.find(l => l.trainNo === a.trainNo)?.isLocked ? 1 : 0;
      const lockB = lockStates.find(l => l.trainNo === b.trainNo)?.isLocked ? 1 : 0;
      const priorityA = a.changedFields?.some(f => f.priority === 'P0') ? 0 : a.changedFields?.some(f => f.priority === 'P1') ? 1 : a.changedFields?.some(f => f.priority === 'P2') ? 2 : 3;
      const priorityB = b.changedFields?.some(f => f.priority === 'P0') ? 0 : b.changedFields?.some(f => f.priority === 'P1') ? 1 : b.changedFields?.some(f => f.priority === 'P2') ? 2 : 3;

      if (sortField === 'priority') {
        return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      }
      if (sortField === 'locked') {
        return sortOrder === 'asc' ? lockA - lockB : lockB - lockA;
      }
      if (sortField === 'trainNo') {
        return sortOrder === 'asc' ? a.trainNo.localeCompare(b.trainNo) : b.trainNo.localeCompare(a.trainNo);
      }
      const timeA = a.newData?.departureTime || a.oldData?.departureTime || '00:00';
      const timeB = b.newData?.departureTime || b.oldData?.departureTime || '00:00';
      return sortOrder === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    });

    return filtered;
  }, [differences, searchTerm, filter, sortField, sortOrder, checkProgressMap, lockStates]);

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
      questioned: checkList.filter(c => c.checkStatus === 'questioned').length,
      unchecked: differences.filter(d => !checkProgressMap.has(d.trainNo) || checkProgressMap.get(d.trainNo)?.checkStatus === 'unchecked').length,
    };
  }, [checkProgressMap, differences]);

  const currentStep = useMemo((): 'understand' | 'verify' | 'confirm' => {
    if (checkSummary.checked < summary.total) return 'verify';
    return 'confirm';
  }, [checkSummary, summary]);

  const pendingChanges = differences.filter(d => d.type !== 'unchanged' && !checkProgressMap.get(d.trainNo)?.checkStatus).length;
  const questionChanges = checkSummary.questioned;
  const p0Count = differences.filter(d => d.changedFields?.some(f => f.priority === 'P0')).length;
  const waitingCount = differences.filter(d => {
    const check = checkProgressMap.get(d.trainNo);
    return !check || check.checkStatus === 'unchecked';
  }).length;
  const selectedConflicts = lockedConflicts.filter(item => selectedTrains.has(item.trainNo));

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

  const handleSort = (field: 'departureTime' | 'trainNo' | 'priority' | 'locked') => {
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

  const handleConflictAction = (action: 'keep' | 'apply' | 'review', trainNo?: string) => {
    if (action === 'apply') {
      setLockStates(prev => prev.map(l => ({ ...l, isLocked: false, conflictStatus: 'resolved' as const })));
      notify('success', '已应用新计划并解锁');
      setShowConflictDrawer(false);
    } else if (action === 'keep') {
      setLockStates(prev => prev.map(l => ({ ...l, conflictStatus: 'resolved' as const })));
      notify('warning', '已保持锁定状态');
    } else if (action === 'review' && trainNo) {
      const diff = differences.find(d => d.trainNo === trainNo);
      if (diff) setSelectedDiff(diff);
      notify('success', `已定位到 ${trainNo} 的差异详情`);
    }
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

      <div className="pc-toolbar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div className="pc-toolbar-left" style={{ flexWrap: 'wrap', gap: '6px' }}>
          <div className="pc-filter-group">
            <span className="pc-filter-label">变更类型</span>
            <div className="pc-filter-tabs">
              <button className={`pc-filter-tab ${filter.type === 'all' && !filter.showDiffOnly ? 'active' : ''}`} onClick={() => setFilter(prev => ({ ...prev, type: 'all', showDiffOnly: false }))}>
                全部 <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>{summary.total}</span>
              </button>
              {(['added', 'removed', 'modified', 'unchanged'] as const).map(t => {
                const cfg = typeConfig[t];
                return (
                  <button key={t} className={`pc-filter-tab pc-filter-tab-${t} ${filter.type === t ? `active ${t}` : ''}`} onClick={() => setFilter(prev => ({ ...prev, type: t, showDiffOnly: false }))}>
                    {cfg.label} <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>{summary[t]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pc-filter-group">
            <span className="pc-filter-label">核对状态</span>
            <div className="pc-filter-tabs">
              {(['all', 'unchecked', 'checked', 'questioned'] as const).map(s => {
                const label = s === 'all' ? '全部' : checkStatusConfig[s].label;
                const isUncheckedFilter = s === 'unchecked';
                const uncheckedCount = summary.unchecked;
                return (
                  <button
                    key={s}
                    className={`pc-filter-tab pc-filter-tab-${s} ${filter.checkStatus === s ? 'active' : ''}`}
                    onClick={() => setFilter(prev => ({ ...prev, checkStatus: s }))}
                    style={isUncheckedFilter ? {
                      borderColor: '#F59E0B',
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      color: '#D97706',
                      fontWeight: 700,
                      boxShadow: '0 0 0 1px rgba(245,158,11,0.4)'
                    } : undefined}
                  >
                    {label}
                    {isUncheckedFilter && <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.8 }}>({uncheckedCount})</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {lockedConflicts.length > 0 && (
            <button style={{ ...btnStyles.ghost, padding: '6px 12px', fontSize: '12px', backgroundColor: '#FFFBEB', borderColor: '#FCD34D', color: '#92400E' }} onClick={() => setShowConflictDrawer(true)}>
              <AlertCircle style={{ width: '14px', height: '14px' }} /> 冲突 {lockedConflicts.length}
            </button>
          )}
          {p0Count > 0 && (
            <button style={{ ...btnStyles.ghost, padding: '6px 12px', fontSize: '12px', backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }} onClick={() => handleSort('priority')}>
              P0 {p0Count}
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
          {/* 颜色图例 */}
          <div className="pc-legend-bar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="pc-legend-section">
                <span className="pc-legend-title">图例</span>
                {legendVisible && (
                  <>
                    <span className="pc-legend-item"><span className="pc-legend-dot origin" />始发</span>
                    <span className="pc-legend-item"><span className="pc-legend-dot pass" />途经</span>
                    <span className="pc-legend-item"><span className="pc-legend-dot terminal" />终到</span>
                    <span style={{ width: 1, height: 16, backgroundColor: '#E5E7EB', margin: '0 12px' }} />
                    <span className="pc-legend-item"><span className="pc-legend-dot added" />新增</span>
                    <span className="pc-legend-item"><span className="pc-legend-dot removed" />减少</span>
                    <span className="pc-legend-item"><span className="pc-legend-dot modified" />变更</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setLegendVisible(!legendVisible)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', border: '1px solid #E5E7EB',
                  borderRadius: '4px', backgroundColor: '#fff',
                  cursor: 'pointer', color: '#6B7280', fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {legendVisible ? '收起' : '展开'}
                <span style={{ fontSize: '10px' }}>{legendVisible ? '▲' : '▼'}</span>
              </button>
            </div>
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
              const priority = diff.changedFields?.some(f => f.priority === 'P0') ? 'P0' : diff.changedFields?.some(f => f.priority === 'P1') ? 'P1' : diff.changedFields?.some(f => f.priority === 'P2') ? 'P2' : '—';
              const mergedText = formatMergedField(data);
              const typeClass = getTypeClass(data?.status);
              const typeColor = getTypeColor(data?.status);
              const typeLabel = getTypeLabel(data?.status);
              const isUnchecked = !check || check.checkStatus === 'unchecked';
              return (
                <div
                  key={diff.trainNo}
                  className={`pc-card pc-card-${diff.type} pc-card-check-${check?.checkStatus || 'unchecked'} ${isSelected ? 'detail-selected' : ''}`}
                  onClick={() => setSelectedDiff(diff)}
                  style={{
                    boxShadow: isUnchecked ? '0 0 0 2px rgba(245, 158, 11, 0.3)' : undefined,
                    transform: isUnchecked ? 'translateZ(0)' : undefined,
                  }}
                >
                  {/* 顶部标题区域 - 车次信息放在首位 */}
                  <div className="pc-card-header-row">
                    <div className="pc-card-header-left">
                      {/* 车次信息 - 最优先显示 */}
                      <div className="pc-trainno-wrapper">
                        <span className={`pc-trainno pc-trainno-strong pc-trainno-${typeClass}`}>{diff.trainNo}</span>
                      </div>
                      {/* 核对状态显示 - 固定信息在左边 */}
                      <div className="pc-status-display">
                        {check?.checkStatus === 'checked' && (
                          <span className="pc-status-badge checked">
                            <Check style={{ width: '14px', height: '14px' }} />
                            已核对
                          </span>
                        )}
                        {check?.checkStatus === 'questioned' && (
                          <span className="pc-status-badge questioned">
                            <HelpCircle style={{ width: '14px', height: '14px' }} />
                            有疑问
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
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#D97706',
                            fontWeight: 700,
                            boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.2)'
                          }}>
                            <Circle style={{ width: '14px', height: '14px' }} />
                            未核对
                          </span>
                        )}
                      </div>
                      {/* 变更类型标签 - 动态信息在右边 */}
                      <div className="pc-card-badges">
                        {diff.type !== 'unchanged' && (
                          <span className={`pc-type-badge pc-type-badge-${diff.type}`}>
                            {diff.type === 'added' && <Plus style={{ width: '12px', height: '12px' }} />}
                            {diff.type === 'removed' && <Minus style={{ width: '12px', height: '12px' }} />}
                            {diff.type === 'modified' && <Edit style={{ width: '12px', height: '12px' }} />}
                            {cfg.label}
                          </span>
                        )}
                        {isLocked && <span className="pc-lock-badge"><Lock style={{ width: '10px', height: '10px' }} />锁定</span>}
                        {data?.focusFlag && <span className="pc-focus-dot" title="重点关注" />}
                        {priority !== '—' && <span className="pc-priority-badge" style={{ backgroundColor: priority === 'P0' ? '#EF4444' : priority === 'P1' ? '#F59E0B' : '#9CA3AF' }}>{priority}</span>}
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
                      <button className="pc-ghost-btn" onClick={() => setShowQuestionModal(data || null)} title="疑问">
                        <HelpCircle style={{ width: '14px', height: '14px' }} />
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
                </div>
              );
            })}
          </div>

          <div className="pc-card-summary" style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="pc-summary-tag total">共 {filteredDifferences.length} 条</span>
              <span className="pc-summary-tag checked">已核对 {checkSummary.checked}</span>
              <span className="pc-summary-tag questioned">有疑问 {questionChanges}</span>
              <span className="pc-summary-tag unchecked">未核对 {pendingChanges}</span>
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
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>差异详情</h3>
              {selectedDiff && <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>{selectedDiff.trainNo} · {typeConfig[selectedDiff.type].label}</p>}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {selectedDiff ? (
                <>
                  {selectedDiff.type === 'modified' && selectedDiff.changedFields && selectedDiff.changedFields.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', margin: '0 0 12px 0' }}>变更字段 ({selectedDiff.changedFields.length})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedDiff.changedFields.map((field, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', backgroundColor: '#F9FAFB', borderRadius: '6px', fontSize: '12px' }}>
                            <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, backgroundColor: field.priority === 'P0' ? '#FEF2F2' : field.priority === 'P1' ? '#FFFBEB' : '#F3F4F6', color: field.priority === 'P0' ? '#DC2626' : field.priority === 'P1' ? '#D97706' : '#6B7280' }}>{field.priority}</span>
                            <span style={{ fontWeight: 500, color: '#374151', flex: 1 }}>{getFieldLabel(field.field)}</span>
                            <span style={{ color: '#9CA3AF' }}>{String(field.oldValue || '—')}</span>
                            <span style={{ color: '#6B7280' }}>→</span>
                            <span style={{ color: '#1D4ED8', fontWeight: 700 }}>{String(field.newValue || '—')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '16px 0', borderTop: '1px solid #F3F4F6' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', margin: '0 0 12px 0' }}>核对状态</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {(['unchecked', 'checked', 'questioned', 'confirmed'] as const).map(status => {
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
                              backgroundColor: isActive ? (status === 'checked' ? '#ECFDF5' : status === 'questioned' ? '#FFFBEB' : status === 'confirmed' ? '#EFF6FF' : '#F3F4F6') : '#fff',
                              border: isActive ? `1px solid ${status === 'checked' ? '#A7F3D0' : status === 'questioned' ? '#FCD34D' : status === 'confirmed' ? '#BFDBFE' : '#D1D5DB'}` : '1px solid #E5E7EB',
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
                    <button style={btnStyles.ghost} onClick={() => setShowQuestionModal(selectedDiff.newData || selectedDiff.oldData!)}>
                      <HelpCircle style={{ width: '14px', height: '14px' }} /> 标记疑问
                    </button>
                  </div>
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
              setShowConflictDrawer(true);
              notify('warning', `已打开 ${selectedTrains.size} 条选中车次的冲突处理面板`);
            }}>批量冲突处理</button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#fff', borderTop: '1px solid #E5E7EB',
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center' }}>
          {pendingChanges > 0 && (
            <div style={{ fontSize: '13px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle style={{ width: '16px', height: '16px' }} />
              还有 {pendingChanges} 条变更需要核对{questionChanges > 0 && `，${questionChanges} 条待确认`}
            </div>
          )}
          {pendingChanges === 0 && (
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

      {showConflictDrawer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.18)', zIndex: 998 }} onClick={() => setShowConflictDrawer(false)}>
          <div style={{ position: 'absolute', right: 0, top: 0, width: '380px', height: '100%', backgroundColor: '#fff', borderLeft: '1px solid #E5E7EB', boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>冲突处理面板</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{selectedConflicts.length > 0 ? `已选中 ${selectedConflicts.length} 条冲突车次` : `共 ${lockedConflicts.length} 条冲突车次`}</div>
              </div>
              <button style={{ ...btnStyles.ghost, padding: '6px 10px' }} onClick={() => setShowConflictDrawer(false)}><X style={{ width: '14px', height: '14px' }} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {(selectedConflicts.length > 0 ? selectedConflicts : lockedConflicts).map(item => (
                <div key={item.id} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', marginBottom: '10px', backgroundColor: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#111827' }}>{item.trainNo}</strong>
                    <span style={{ fontSize: '12px', color: '#F59E0B' }}>{item.conflictStatus === 'resolved' ? '已处理' : '待处理'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>{item.lockedReason || '锁定计划已被后台重新生成，请确认处理方式。'}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button style={btnStyles.ghost} onClick={() => handleConflictAction('review', item.trainNo)}>查看新变化</button>
                    <button style={btnStyles.ghost} onClick={() => handleConflictAction('keep', item.trainNo)}>保持锁定</button>
                    <button style={btnStyles.primary} onClick={() => handleConflictAction('apply', item.trainNo)}>应用新计划</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
              <button style={btnStyles.ghost} onClick={() => setShowConflictDrawer(false)}>关闭</button>
              <button style={btnStyles.primary} onClick={() => notify('success', '冲突处理结果已保存')}>保存结果</button>
            </div>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '400px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HelpCircle style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>标记疑问</span>
              </div>
              <button onClick={() => setShowQuestionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}><X style={{ width: '18px', height: '18px' }} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 16px 0' }}>车次 <strong>{showQuestionModal.trainNo}</strong> 标记为有疑问后，需要调度长确认。</p>
              <div className="pc-question-type">
                <label>疑问类型</label>
                <div className="pc-question-options">
                  <label className="pc-radio-label"><input type="radio" name="questionType" defaultChecked onChange={() => { questionTypeRef.current = 'data_anomaly'; }} /> 数据异常</label>
                  <label className="pc-radio-label"><input type="radio" name="questionType" onChange={() => { questionTypeRef.current = 'mismatch_paper'; }} /> 与纸质文件不一致</label>
                  <label className="pc-radio-label"><input type="radio" name="questionType" onChange={() => { questionTypeRef.current = 'need_approval'; }} /> 需要审批</label>
                </div>
              </div>
              <div className="pc-question-notes">
                <label>备注说明</label>
                <textarea ref={questionNotesRef} rows={3} placeholder="请输入疑问说明..." style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', marginTop: '8px', resize: 'vertical', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button style={btnStyles.ghost} onClick={() => setShowQuestionModal(null)}>取消</button>
              <button style={btnStyles.primary} onClick={() => {
                handleCheckStatus(showQuestionModal.trainNo, 'questioned', {
                  questionType: questionTypeRef.current,
                  notes: questionNotesRef.current?.value || '',
                });
                setShowQuestionModal(null);
                questionTypeRef.current = 'data_anomaly';
                notify('warning', `已标记 ${showQuestionModal.trainNo} 为有疑问`);
              }}>
                <MessageSquare style={{ width: '14px', height: '14px' }} /> 保存并标记
              </button>
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
                  { key: 'Shift+Space', desc: '标记有疑问' },
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
