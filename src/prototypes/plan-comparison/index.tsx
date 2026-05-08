import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Minus, Edit, Search, Lock, Unlock, RefreshCw,
  ChevronDown, X, CheckCircle2, AlertCircle, HelpCircle,
  Circle, MessageSquare, Keyboard, ChevronUp, Eye, Printer,
  ArrowRight, PanelRightClose, PanelRightOpen,
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
  formatChangedField,
} from './types';
import type { planDifference, planLockState, checkProgress, templateData } from './types';
import './style.css';

const DIFF_COLORS = {
  added: { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  removed: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-200' },
  modified: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  unchanged: { bg: 'bg-white', border: 'border-l-gray-300', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const DIFF_ICONS = {
  added: Plus,
  removed: Minus,
  modified: Edit,
  unchanged: Circle,
};

const DIFF_LABELS = {
  added: '新增',
  removed: '减少',
  modified: '变更',
  unchanged: '无变',
};

const CHECK_STATUS_CONFIG = {
  unchecked: { icon: Circle, color: 'text-gray-400', label: '未核对' },
  checked: { icon: CheckCircle2, color: 'text-emerald-600', label: '已核对' },
  questioned: { icon: HelpCircle, color: 'text-amber-500', label: '有疑问' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-600', label: '已确认' },
};

interface DiffFilter {
  type: 'all' | 'added' | 'removed' | 'modified' | 'unchanged';
  checkStatus: 'all' | 'unchecked' | 'checked' | 'questioned' | 'confirmed';
  showDiffOnly: boolean;
}

type WorkflowStep = 'understand' | 'verify' | 'confirm';

const Component: React.FC = () => {
  const [differences] = useState<planDifference[]>(() => detectPlanDifferences(mockOldPlan, mockNewPlan));
  const [lockStates, setLockStates] = useState<planLockState[]>(mockLockStates);
  const [checkProgressMap, setCheckProgressMap] = useState<Map<string, checkProgress>>(() => {
    const map = new Map();
    mockCheckProgress.forEach(cp => map.set(cp.trainNo, cp));
    return map;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<DiffFilter>({ type: 'all', checkStatus: 'all', showDiffOnly: false });
  const [selectedDiff, setSelectedDiff] = useState<planDifference | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictTrains, setConflictTrains] = useState<planLockState[]>([]);
  const [selectedTrains, setSelectedTrains] = useState<Set<string>>(new Set());
  const [showQuestionModal, setShowQuestionModal] = useState<templateData | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [sortField, setSortField] = useState<'departureTime' | 'trainNo'>('departureTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [currentFocusedIndex, setCurrentFocusedIndex] = useState(-1);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showDetailPanel, setShowDetailPanel] = useState(true);

  const lockedConflicts = useMemo(() => {
    return detectLockedPlanRegeneration(lockStates, mockNewPlan).conflicts;
  }, [lockStates]);

  useEffect(() => {
    if (lockedConflicts.length > 0 && !showConflictModal) {
      setConflictTrains(lockedConflicts);
      setShowConflictModal(true);
    }
  }, [lockedConflicts]);

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
      if (sortField === 'trainNo') {
        return sortOrder === 'asc' ? a.trainNo.localeCompare(b.trainNo) : b.trainNo.localeCompare(a.trainNo);
      }
      const timeA = a.newData?.departureTime || a.oldData?.departureTime || '00:00';
      const timeB = b.newData?.departureTime || b.oldData?.departureTime || '00:00';
      return sortOrder === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    });

    return filtered;
  }, [differences, searchTerm, filter, sortField, sortOrder, checkProgressMap]);

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

  const currentStep = useMemo((): WorkflowStep => {
    if (checkSummary.checked < summary.total) return 'verify';
    return 'confirm';
  }, [checkSummary, summary]);

  const notify = (type: 'success' | 'warning' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSort = (field: 'departureTime' | 'trainNo') => {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleLockToggle = (trainNo: string) => {
    setLockStates(prev => prev.map(lock =>
      lock.trainNo === trainNo ? { ...lock, isLocked: !lock.isLocked } : lock
    ));
    const isNowLocked = !lockStates.find(l => l.trainNo === trainNo)?.isLocked;
    notify('success', `${isNowLocked ? '已锁定' : '已解锁'}车次 ${trainNo}`);
  };

  const handleCheckStatus = (trainNo: string, status: checkProgress['checkStatus']) => {
    setCheckProgressMap(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(trainNo);
      if (existing) {
        newMap.set(trainNo, { ...existing, checkStatus: status, checkedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') });
      } else {
        newMap.set(trainNo, {
          id: `check-${Date.now()}`,
          trainNo,
          diagramNo: '2025-Q4',
          checkStatus: status,
          checkedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        });
      }
      return newMap;
    });
  };

  const handleBatchSelect = (trainNo: string) => {
    setSelectedTrains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trainNo)) newSet.delete(trainNo);
      else newSet.add(trainNo);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTrains.size === filteredDifferences.length) {
      setSelectedTrains(new Set());
    } else {
      setSelectedTrains(new Set(filteredDifferences.map(d => d.trainNo)));
    }
  };

  const handleBatchMarkChecked = () => {
    selectedTrains.forEach(trainNo => handleCheckStatus(trainNo, 'checked'));
    notify('success', `已标记 ${selectedTrains.size} 条为已核对`);
    setSelectedTrains(new Set());
  };

  const handleBatchLock = (lock: boolean) => {
    selectedTrains.forEach(trainNo => {
      const existing = lockStates.find(l => l.trainNo === trainNo);
      if (existing) {
        setLockStates(prev => prev.map(l => l.trainNo === trainNo ? { ...l, isLocked: lock } : l));
      } else if (lock) {
        setLockStates(prev => [...prev, {
          id: `lock-${Date.now()}-${trainNo}`,
          trainNo,
          diagramNo: '2025-Q4',
          isLocked: true,
          lockedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          lockedBy: '当前用户',
        }]);
      }
    });
    notify('success', `已${lock ? '锁定' : '解锁'} ${selectedTrains.size} 条`);
    setSelectedTrains(new Set());
  };

  const handleUnlockAll = () => {
    setLockStates(prev => prev.map(l => ({ ...l, isLocked: false })));
    notify('success', `已解锁 ${lockStates.filter(l => l.isLocked).length} 条计划`);
  };

  const handleSyncUpdate = () => {
    setLockStates(prev => prev.map(l => ({ ...l, isLocked: false })));
    notify('success', `已同步更新 ${differences.filter(d => d.type !== 'removed').length} 条计划`);
  };

  const handleConflictAction = (action: 'keep' | 'apply' | 'review') => {
    if (action === 'apply') {
      setLockStates(prev => prev.map(l => ({ ...l, isLocked: false, conflictStatus: 'resolved' as const })));
      notify('success', '已应用新计划并解锁');
    } else if (action === 'keep') {
      setLockStates(prev => prev.map(l => ({ ...l, conflictStatus: 'resolved' as const })));
      notify('warning', '已保持锁定状态');
    }
    setShowConflictModal(false);
  };

  const toggleCardExpand = (type: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) newSet.delete(type);
      else newSet.add(type);
      return newSet;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentFocusedIndex(i => Math.min(i + 1, filteredDifferences.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentFocusedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === ' ' && currentFocusedIndex >= 0) {
        e.preventDefault();
        const diff = filteredDifferences[currentFocusedIndex];
        handleCheckStatus(diff.trainNo, checkProgressMap.get(diff.trainNo)?.checkStatus === 'checked' ? 'unchecked' : 'checked');
      } else if (e.key === 'Enter' && currentFocusedIndex >= 0) {
        e.preventDefault();
        setSelectedDiff(filteredDifferences[currentFocusedIndex]);
      } else if (e.key === 'Escape') {
        setSelectedDiff(null);
        setShowQuestionModal(null);
        setShowConflictModal(false);
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFocusedIndex, filteredDifferences, checkProgressMap]);

  const pendingChanges = differences.filter(d => d.type !== 'unchanged' && !checkProgressMap.get(d.trainNo)?.checkStatus).length;
  const questionChanges = checkSummary.questioned;

  return (
    <div className="plan-comparison">
      <header className="pc-header">
        <div className="pc-header-left">
          <h1 className="pc-title">计划比对</h1>
          <span className="pc-subtitle">今日计划 vs 次日新计划</span>
        </div>
        <div className="pc-header-right">
          <span className="pc-time-badge">计划生成：{planGenerateTime}</span>
        </div>
      </header>

      <div className="pc-step-indicator">
        <div className="pc-step-item">
          <div className={`pc-step-circle ${currentStep !== 'understand' ? 'completed' : 'active'}`}>
            {currentStep !== 'understand' ? '✓' : '1'}
          </div>
          <span className="pc-step-label">了解变更</span>
        </div>
        <div className="pc-step-line" />
        <div className="pc-step-item">
          <div className={`pc-step-circle ${currentStep === 'confirm' ? 'completed' : currentStep === 'verify' ? 'active' : 'pending'}`}>
            {currentStep === 'confirm' ? '✓' : '2'}
          </div>
          <span className="pc-step-label">逐一核对</span>
        </div>
        <div className="pc-step-line" />
        <div className="pc-step-item">
          <div className={`pc-step-circle ${currentStep === 'confirm' ? 'active' : 'pending'}`}>3</div>
          <span className="pc-step-label">确认锁定</span>
        </div>
      </div>

      <div className="pc-summary-section">
        <h2 className="pc-section-title">差异汇总</h2>
        <div className="pc-summary-cards">
          {(['added', 'removed', 'modified', 'unchanged'] as const).map(type => (
            <div
              key={type}
              className={`pc-summary-card pc-card-${type}`}
            >
              <div className="pc-card-header" onClick={() => type !== 'unchanged' && toggleCardExpand(type)}>
                <div className="pc-card-icon">
                  {React.createElement(DIFF_ICONS[type], { className: 'pc-icon-sm' })}
                </div>
                <div className="pc-card-content">
                  <span className="pc-card-count">{summary[type]}</span>
                  <span className="pc-card-label">{DIFF_LABELS[type]}</span>
                </div>
                {type !== 'unchanged' && (
                  <ChevronDown className={`pc-expand-icon ${expandedCards.has(type) ? 'expanded' : ''}`} />
                )}
              </div>
              {expandedCards.has(type) && (
                <div className="pc-card-expanded">
                  {differences.filter(d => d.type === type).map(diff => (
                    <div
                      key={diff.trainNo}
                      className="pc-card-item"
                      onClick={() => setSelectedDiff(diff)}
                    >
                      <span className="pc-item-trainno">{diff.trainNo}</span>
                      {type === 'modified' && diff.changedFields && diff.changedFields[0] && (
                        <span className="pc-item-change">{formatChangedField(diff)}</span>
                      )}
                      {(type === 'added' || type === 'removed') && (
                        <span className="pc-item-time">
                          {diff.newData?.departureTime || diff.oldData?.departureTime || '—'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pc-toolbar">
        <div className="pc-toolbar-left">
          <div className="pc-search-box">
            <Search className="pc-search-icon" />
            <input
              type="text"
              data-search
              placeholder="搜索车次..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pc-search-input"
            />
          </div>
          <div className="pc-filter-tabs">
            <button
              className={`pc-filter-tab ${filter.type === 'all' ? 'active' : ''}`}
              onClick={() => setFilter(f => ({ ...f, type: 'all' }))}
            >
              全部
            </button>
            <button
              className={`pc-filter-tab ${filter.type === 'added' ? 'active added' : ''}`}
              onClick={() => setFilter(f => ({ ...f, type: f.type === 'added' ? 'all' : 'added' }))}
            >
              新增
            </button>
            <button
              className={`pc-filter-tab ${filter.type === 'removed' ? 'active removed' : ''}`}
              onClick={() => setFilter(f => ({ ...f, type: f.type === 'removed' ? 'all' : 'removed' }))}
            >
              减少
            </button>
            <button
              className={`pc-filter-tab ${filter.type === 'modified' ? 'active modified' : ''}`}
              onClick={() => setFilter(f => ({ ...f, type: f.type === 'modified' ? 'all' : 'modified' }))}
            >
              变更
            </button>
          </div>
          <label className="pc-checkbox-label">
            <input
              type="checkbox"
              checked={filter.showDiffOnly}
              onChange={e => setFilter(f => ({ ...f, showDiffOnly: e.target.checked }))}
            />
            <span>仅显示有差异</span>
          </label>
        </div>
        <div className="pc-toolbar-right">
          <button className="pc-btn pc-btn-icon" onClick={() => setShowKeyboardHelp(true)} title="快捷键帮助">
            <Keyboard className="pc-icon-sm" />
          </button>
          <button
            className="pc-btn pc-btn-icon"
            onClick={() => setShowDetailPanel(v => !v)}
            title={showDetailPanel ? '隐藏详情面板' : '显示详情面板'}
          >
            {showDetailPanel ? <PanelRightClose className="pc-icon-sm" /> : <PanelRightOpen className="pc-icon-sm" />}
          </button>
        </div>
      </div>

      <div className="pc-main">
        <div className={`pc-table-container ${!showDetailPanel ? 'full-width' : ''}`}>
          <div className="pc-table-header">
            <div className="pc-table-row pc-table-header-row">
              <div className="pc-cell pc-cell-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTrains.size === filteredDifferences.length && filteredDifferences.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="pc-cell pc-cell-trainno" onClick={() => handleSort('trainNo')}>
                车次 {sortField === 'trainNo' && (sortOrder === 'asc' ? <ChevronUp className="pc-icon-xs" /> : <ChevronDown className="pc-icon-xs" />)}
              </div>
              <div className="pc-cell pc-cell-type">类型</div>
              <div className="pc-cell pc-cell-time" onClick={() => handleSort('departureTime')}>
                到达 {sortField === 'departureTime' && (sortOrder === 'asc' ? <ChevronUp className="pc-icon-xs" /> : <ChevronDown className="pc-icon-xs" />)}
              </div>
              <div className="pc-cell pc-cell-time">发车</div>
              <div className="pc-cell pc-cell-track">股道</div>
              <div className="pc-cell pc-cell-platform">站台</div>
              <div className="pc-cell pc-cell-gates">检票口</div>
              <div className="pc-cell pc-cell-status">状态</div>
              <div className="pc-cell pc-cell-check">核对</div>
            </div>
          </div>

          <div className="pc-table-body">
            {filteredDifferences.length === 0 ? (
              <div className="pc-empty">
                <Search className="pc-empty-icon" />
                <span>未找到匹配的列车数据</span>
              </div>
            ) : (
              filteredDifferences.map((diff, idx) => {
                const data = diff.newData || diff.oldData;
                if (!data) return null;
                const lock = lockStates.find(l => l.trainNo === diff.trainNo);
                const check = checkProgressMap.get(diff.trainNo);
                const colors = DIFF_COLORS[diff.type];
                const isSelected = selectedTrains.has(diff.trainNo);
                const isFocused = currentFocusedIndex === idx;
                const isDetailSelected = selectedDiff?.trainNo === diff.trainNo;

                return (
                  <div
                    key={diff.trainNo}
                    className={`pc-table-row ${colors.bg} ${colors.border} ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${isDetailSelected ? 'detail-selected' : ''}`}
                    onClick={() => setSelectedDiff(diff)}
                  >
                    <div className="pc-cell pc-cell-checkbox" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBatchSelect(diff.trainNo)}
                      />
                    </div>
                    <div className="pc-cell pc-cell-trainno">
                      <span className={`pc-trainno ${colors.text}`}>
                        {React.createElement(DIFF_ICONS[diff.type], { className: 'pc-icon-xs' })}
                        {diff.trainNo}
                      </span>
                      {lock?.isLocked && (
                        <Lock className="pc-icon-xs pc-lock-icon" />
                      )}
                    </div>
                    <div className="pc-cell pc-cell-type">
                      <span className={`pc-type-badge ${colors.badge}`}>{DIFF_LABELS[diff.type]}</span>
                    </div>
                    <div className="pc-cell pc-cell-time">{data.arrivalTime || '—'}</div>
                    <div className="pc-cell pc-cell-time">{data.departureTime || '—'}</div>
                    <div className="pc-cell pc-cell-track">
                      {diff.type === 'modified' && diff.changedFields?.some(f => f.field === 'track') ? (
                        <span className="pc-changed-value">
                          {diff.oldData?.track} → <strong>{data.track}</strong>
                        </span>
                      ) : (
                        data.track || '—'
                      )}
                    </div>
                    <div className="pc-cell pc-cell-platform">
                      {diff.type === 'modified' && diff.changedFields?.some(f => f.field === 'platform') ? (
                        <span className="pc-changed-value">
                          {diff.oldData?.platform} → <strong>{data.platform}</strong>
                        </span>
                      ) : (
                        data.platform || '—'
                      )}
                    </div>
                    <div className="pc-cell pc-cell-gates">
                      {diff.type === 'modified' && diff.changedFields?.some(f => f.field === 'gates') ? (
                        <span className="pc-changed-value">
                          {diff.oldData?.gates} → <strong>{data.gates}</strong>
                        </span>
                      ) : (
                        data.gates || '—'
                      )}
                    </div>
                    <div className="pc-cell pc-cell-status">
                      <span className="pc-status-tag">{data.status}</span>
                    </div>
                    <div className="pc-cell pc-cell-check" onClick={e => e.stopPropagation()}>
                      <button
                        className={`pc-check-btn ${CHECK_STATUS_CONFIG[check?.checkStatus || 'unchecked'].color}`}
                        onClick={() => {
                          const statusOrder: checkProgress['checkStatus'][] = ['unchecked', 'checked', 'questioned', 'confirmed'];
                          const currentIdx = statusOrder.indexOf(check?.checkStatus || 'unchecked');
                          const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
                          handleCheckStatus(diff.trainNo, nextStatus);
                        }}
                        title={CHECK_STATUS_CONFIG[check?.checkStatus || 'unchecked'].label}
                      >
                        {React.createElement(CHECK_STATUS_CONFIG[check?.checkStatus || 'unchecked'].icon, { className: 'pc-icon-sm' })}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pc-table-footer">
            <div className="pc-progress-section">
              <span className="pc-progress-text">
                核对进度：已核对 {checkSummary.checked}/{checkSummary.total} ({Math.round(checkSummary.checked / checkSummary.total * 100)}%)
              </span>
              {questionChanges > 0 && (
                <span className="pc-progress-warning">有疑问 {questionChanges} 条</span>
              )}
              <div className="pc-progress-track">
                <div
                  className="pc-progress-fill"
                  style={{ width: `${checkSummary.checked / checkSummary.total * 100}%` }}
                />
              </div>
            </div>

            {selectedTrains.size > 0 && (
              <div className="pc-batch-actions">
                <span className="pc-batch-info">已选 {selectedTrains.size} 条</span>
                <button className="pc-btn pc-btn-sm pc-btn-primary" onClick={handleBatchMarkChecked}>
                  <CheckCircle2 className="pc-icon-xs" /> 批量标记已核对
                </button>
                <button className="pc-btn pc-btn-sm pc-btn-ghost" onClick={() => handleBatchLock(true)}>
                  <Lock className="pc-icon-xs" /> 批量锁定
                </button>
                <button className="pc-btn pc-btn-sm pc-btn-ghost" onClick={() => handleBatchLock(false)}>
                  <Unlock className="pc-icon-xs" /> 批量解锁
                </button>
              </div>
            )}
          </div>
        </div>

        {showDetailPanel && (
          <div className="pc-detail-panel">
            {selectedDiff ? (
              <>
                <div className="pc-detail-header">
                  <div className="pc-detail-title">
                    <span className={`pc-type-badge ${DIFF_COLORS[selectedDiff.type].badge}`}>
                      {DIFF_LABELS[selectedDiff.type]}
                    </span>
                    <span className="pc-detail-trainno">{selectedDiff.trainNo}</span>
                  </div>
                  <button className="pc-btn pc-btn-icon pc-btn-sm" onClick={() => setSelectedDiff(null)}>
                    <X className="pc-icon-xs" />
                  </button>
                </div>

                <div className="pc-detail-section">
                  <h4 className="pc-detail-section-title">基本信息</h4>
                  <div className="pc-detail-grid">
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">车次</span>
                      <span className="pc-detail-value">{selectedDiff.newData?.trainNo || selectedDiff.oldData?.trainNo}</span>
                    </div>
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">类型</span>
                      <span className="pc-detail-value">{selectedDiff.newData?.status || selectedDiff.oldData?.status}</span>
                    </div>
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">车型</span>
                      <span className="pc-detail-value">{selectedDiff.newData?.model || selectedDiff.oldData?.model}</span>
                    </div>
                  </div>
                </div>

                <div className="pc-detail-section">
                  <h4 className="pc-detail-section-title">时间信息</h4>
                  <div className="pc-detail-grid">
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">到达</span>
                      <span className="pc-detail-value">{selectedDiff.newData?.arrivalTime || selectedDiff.oldData?.arrivalTime}</span>
                    </div>
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">发车</span>
                      <span className="pc-detail-value">
                        {selectedDiff.type === 'modified' && selectedDiff.changedFields?.some(f => f.field === 'departureTime') ? (
                          <span className="pc-value-changed">
                            {selectedDiff.oldData?.departureTime} → <strong>{selectedDiff.newData?.departureTime}</strong>
                          </span>
                        ) : (
                          selectedDiff.newData?.departureTime || selectedDiff.oldData?.departureTime || '—'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pc-detail-section">
                  <h4 className="pc-detail-section-title">站场信息</h4>
                  <div className="pc-detail-grid">
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">股道</span>
                      <span className="pc-detail-value">
                        {selectedDiff.type === 'modified' && selectedDiff.changedFields?.some(f => f.field === 'track') ? (
                          <span className="pc-value-changed">
                            {selectedDiff.oldData?.track} → <strong>{selectedDiff.newData?.track}</strong>
                          </span>
                        ) : (
                          selectedDiff.newData?.track || selectedDiff.oldData?.track || '—'
                        )}
                      </span>
                    </div>
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">站台</span>
                      <span className="pc-detail-value">{selectedDiff.newData?.platform || selectedDiff.oldData?.platform || '—'}</span>
                    </div>
                    <div className="pc-detail-item">
                      <span className="pc-detail-label">检票口</span>
                      <span className="pc-detail-value">{selectedDiff.newData?.gates || selectedDiff.oldData?.gates || '—'}</span>
                    </div>
                  </div>
                </div>

                {selectedDiff.type === 'modified' && selectedDiff.changedFields && selectedDiff.changedFields.length > 0 && (
                  <div className="pc-detail-section">
                    <h4 className="pc-detail-section-title">变更字段</h4>
                    <div className="pc-changes-list">
                      {selectedDiff.changedFields.map((change, idx) => (
                        <div key={idx} className={`pc-change-item pc-change-priority-${change.priority}`}>
                          <div className="pc-change-field">
                            <span className="pc-priority-badge">{change.priority}</span>
                            {getFieldLabel(change.field)}
                          </div>
                          <div className="pc-change-values">
                            <span className="pc-old-value">{String(change.oldValue || '—')}</span>
                            <span className="pc-change-arrow">→</span>
                            <span className="pc-new-value">{String(change.newValue || '—')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pc-detail-section">
                  <h4 className="pc-detail-section-title">核对状态</h4>
                  <div className="pc-check-status-grid">
                    {(['unchecked', 'checked', 'questioned', 'confirmed'] as const).map(status => {
                      const config = CHECK_STATUS_CONFIG[status];
                      const isActive = checkProgressMap.get(selectedDiff.trainNo)?.checkStatus === status;
                      return (
                        <button
                          key={status}
                          className={`pc-status-btn ${isActive ? 'active' : ''} ${config.color}`}
                          onClick={() => handleCheckStatus(selectedDiff.trainNo, status)}
                        >
                          {React.createElement(config.icon, { className: 'pc-icon-xs' })}
                          <span>{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pc-detail-actions">
                  <button
                    className="pc-btn pc-btn-primary"
                    onClick={() => handleCheckStatus(selectedDiff.trainNo, 'checked')}
                  >
                    <CheckCircle2 className="pc-icon-sm" /> 快速标记已核对
                  </button>
                  <button
                    className={`pc-btn ${lockStates.find(l => l.trainNo === selectedDiff.trainNo)?.isLocked ? 'pc-btn-ghost' : 'pc-btn-warning'}`}
                    onClick={() => handleLockToggle(selectedDiff.trainNo)}
                  >
                    <Lock className="pc-icon-sm" />
                    {lockStates.find(l => l.trainNo === selectedDiff.trainNo)?.isLocked ? '解锁该车次' : '锁定该车次'}
                  </button>
                  <button
                    className="pc-btn pc-btn-ghost"
                    onClick={() => setShowQuestionModal(selectedDiff.newData || selectedDiff.oldData!)}
                  >
                    <HelpCircle className="pc-icon-sm" /> 标记疑问
                  </button>
                </div>
              </>
            ) : (
              <div className="pc-detail-empty">
                <Eye className="pc-empty-icon" />
                <span>点击表格中的行查看详情</span>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="pc-decision-footer">
        <div className="pc-decision-info">
          <span className="pc-decision-step">您正在进行 [步骤 2: 逐一核对变更]</span>
          {pendingChanges > 0 && (
            <span className="pc-decision-warning">
              还有 {pendingChanges} 条变更需要核对
              {questionChanges > 0 && `，${questionChanges} 条待确认`}
            </span>
          )}
          {pendingChanges === 0 && (
            <span className="pc-decision-success">所有变更已核对完成，请选择处理方式</span>
          )}
        </div>
        <div className="pc-decision-actions">
          <button className="pc-btn pc-btn-ghost" onClick={handleUnlockAll}>
            <Unlock className="pc-icon-sm" /> 全部解锁
          </button>
          <button className="pc-btn pc-btn-primary" onClick={handleSyncUpdate}>
            <RefreshCw className="pc-icon-sm" /> 同步更新
          </button>
          <button className="pc-btn pc-btn-ghost">
            <Printer className="pc-icon-sm" /> 打印清单
          </button>
        </div>
      </footer>

      {showConflictModal && (
        <div className="pc-modal-overlay">
          <div className="pc-modal pc-conflict-modal">
            <div className="pc-modal-header">
              <div className="pc-modal-title">
                <AlertCircle className="pc-icon-sm pc-warning-icon" />
                <span>检测到计划变更</span>
              </div>
              <button className="pc-modal-close" onClick={() => setShowConflictModal(false)}>
                <X className="pc-icon-sm" />
              </button>
            </div>
            <div className="pc-modal-body">
              <p className="pc-conflict-desc">以下已锁定的计划已被后台重新生成，请选择处理方式：</p>
              <div className="pc-conflict-list">
                {conflictTrains.map(train => (
                  <div key={train.trainNo} className="pc-conflict-item">
                    <Lock className="pc-icon-xs" />
                    <span className="pc-conflict-trainno">{train.trainNo}</span>
                    <span className="pc-conflict-info">
                      已锁定（{train.lockedAt} {train.lockedBy}）
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pc-modal-footer pc-conflict-actions">
              <button className="pc-btn pc-btn-ghost" onClick={() => handleConflictAction('review')}>
                <Eye className="pc-icon-sm" /> 查看新变化
              </button>
              <button className="pc-btn pc-btn-ghost" onClick={() => handleConflictAction('keep')}>
                <Lock className="pc-icon-sm" /> 保持锁定
              </button>
              <button className="pc-btn pc-btn-primary" onClick={() => handleConflictAction('apply')}>
                <RefreshCw className="pc-icon-sm" /> 应用新计划
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="pc-modal-overlay" onClick={() => setShowQuestionModal(null)}>
          <div className="pc-modal pc-question-modal" onClick={e => e.stopPropagation()}>
            <div className="pc-modal-header">
              <div className="pc-modal-title">
                <HelpCircle className="pc-icon-sm pc-warning-icon" />
                <span>标记疑问 - {showQuestionModal.trainNo}</span>
              </div>
              <button className="pc-modal-close" onClick={() => setShowQuestionModal(null)}>
                <X className="pc-icon-sm" />
              </button>
            </div>
            <div className="pc-modal-body">
              <div className="pc-question-type">
                <label>疑问类型</label>
                <div className="pc-question-options">
                  <label className="pc-radio-label">
                    <input type="radio" name="questionType" value="data_anomaly" defaultChecked />
                    <span>数据异常</span>
                  </label>
                  <label className="pc-radio-label">
                    <input type="radio" name="questionType" value="mismatch_paper" />
                    <span>与纸质文件不符</span>
                  </label>
                  <label className="pc-radio-label">
                    <input type="radio" name="questionType" value="need_approval" />
                    <span>需要调度长确认</span>
                  </label>
                </div>
              </div>
              <div className="pc-question-notes">
                <label>备注</label>
                <textarea placeholder="请输入备注信息..." rows={3}></textarea>
              </div>
            </div>
            <div className="pc-modal-footer">
              <button className="pc-btn pc-btn-ghost" onClick={() => setShowQuestionModal(null)}>取消</button>
              <button
                className="pc-btn pc-btn-primary"
                onClick={() => {
                  handleCheckStatus(showQuestionModal.trainNo, 'questioned');
                  setShowQuestionModal(null);
                  notify('warning', `已标记 ${showQuestionModal.trainNo} 为有疑问`);
                }}
              >
                <MessageSquare className="pc-icon-sm" /> 保存并标记
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeyboardHelp && (
        <div className="pc-modal-overlay" onClick={() => setShowKeyboardHelp(false)}>
          <div className="pc-modal pc-help-modal" onClick={e => e.stopPropagation()}>
            <div className="pc-modal-header">
              <div className="pc-modal-title">
                <Keyboard className="pc-icon-sm" />
                <span>快捷键帮助</span>
              </div>
              <button className="pc-modal-close" onClick={() => setShowKeyboardHelp(false)}>
                <X className="pc-icon-sm" />
              </button>
            </div>
            <div className="pc-modal-body">
              <div className="pc-help-section">
                <h4>导航</h4>
                <div className="pc-help-item"><kbd>↑</kbd> / <kbd>↓</kbd> <span>上一条/下一条车次</span></div>
                <div className="pc-help-item"><kbd>Space</kbd> <span>标记当前行为"已核对"</span></div>
                <div className="pc-help-item"><kbd>Enter</kbd> <span>查看详情</span></div>
                <div className="pc-help-item"><kbd>Ctrl+F</kbd> <span>搜索车次</span></div>
                <div className="pc-help-item"><kbd>Esc</kbd> <span>关闭弹窗</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={`pc-toast pc-toast-${notification.type}`}>
          {notification.type === 'success' && <CheckCircle2 className="pc-icon-sm" />}
          {notification.type === 'warning' && <AlertCircle className="pc-icon-sm" />}
          {notification.type === 'error' && <AlertCircle className="pc-icon-sm" />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default Component;
