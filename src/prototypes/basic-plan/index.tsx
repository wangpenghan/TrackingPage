/**
 * @name 基本计划
 * 铁路基本运行图管理页面，展示全路开行列车信息，通过图号区分。
 * 风格对齐客运模板（Indigo 主题）。
 */

import React, { useState, useMemo } from 'react';
import {
  Search, MapPin, Calendar, RotateCcw, Repeat,
  Train as TrainIcon, ChevronDown, X, Clock,
  CheckCircle2, AlertCircle, Edit, Trash2, Plus, ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  mockBasicPlanTrains, diagramNos, stationNames,
  validateTrainData, calculateDiagramChanges,
} from './mock-data';
import type { Train, DiagramChanges } from './mock-data';
import './style.css';

/* ── 工具 ── */
function btnStyle(variant: 'primary' | 'outline' | 'ghost' | 'success' | 'warning'): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '6px', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', border: '1px solid transparent',
    whiteSpace: 'nowrap',
  };
  const map: Record<string, React.CSSProperties> = {
    primary: { ...base, background: '#5e6ad2', color: '#fff', borderColor: '#5e6ad2' },
    outline: { ...base, background: '#fff', color: '#5e6ad2', borderColor: '#5e6ad2' },
    ghost: { ...base, background: 'transparent', color: '#6B7280', borderColor: '#D1D5DB' },
    success: { ...base, background: '#10B981', color: '#fff', borderColor: '#10B981' },
    warning: { ...base, background: '#F59E0B', color: '#fff', borderColor: '#F59E0B' },
  };
  return map[variant] ?? base;
}

/* ── 单行验证：检查某趟车是否满足同步到重庆东客运模板的条件 ── */
function checkSyncEligibility(train: Train): string[] {
  const issues: string[] = [];
  const cqStation = train.stations.find(s => s.stationName === '重庆东');
  if (!cqStation) { issues.push('未经过"重庆东"'); return issues; }
  const idx = train.stations.indexOf(cqStation);
  const isFirst = idx === 0;
  const isLast = idx === train.stations.length - 1;
  if (!cqStation.track) issues.push('缺少"重庆东"股道信息');
  if (!isFirst && !cqStation.arrivalTime) issues.push('缺少"重庆东"到达时间');
  if (!isLast && !cqStation.departureTime) issues.push('缺少"重庆东"发车时间');
  if (issues.length === 0) {
    const v = validateTrainData(train);
    if (!v.valid) issues.push(...v.issues.slice(0, 2));
  }
  return issues;
}

/* ═══════════════════════════════════════
   主组件
═══════════════════════════════════════ */
const Component: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<string>(diagramNos[diagramNos.length - 1]);
  const [localTrains, setLocalTrains] = useState<Train[]>(mockBasicPlanTrains);
  const [prevDiagram, setPrevDiagram] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'high-speed' | 'normal'>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'unsynced' | 'synced'>('all');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [showDiagramDropdown, setShowDiagramDropdown] = useState(false);
  const [showChangesDrawer, setShowChangesDrawer] = useState<'added' | 'removed' | 'modified' | null>(null);
  const [editingStations, setEditingStations] = useState(false);
  const [editedTrain, setEditedTrain] = useState<Train | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string; details?: string[] } | null>(null);

  /* 同步状态：key=trainId, value=true已同步 */
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());

  const notify = (type: 'success' | 'error' | 'warning', message: string, details?: string[]) => {
    setNotification({ type, message, details });
    setTimeout(() => setNotification(null), 6000);
  };

  const currentTrains = useMemo(
    () => localTrains.filter(t => t.diagramNo === selectedDiagram),
    [selectedDiagram, localTrains]
  );

  const filteredTrains = useMemo(() => {
    return currentTrains.filter(train => {
      const isSynced = syncedIds.has(train.id);
      if (syncFilter === 'synced' && !isSynced) return false;
      if (syncFilter === 'unsynced' && isSynced) return false;
      const matchesSearch = !searchTerm.trim() ||
        train.trainNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStation = !selectedStation ||
        train.originStation.includes(selectedStation) ||
        train.destinationStation.includes(selectedStation) ||
        train.stations.some(s => s.stationName.includes(selectedStation));
      const matchesType = filterType === 'all' || train.trainType === filterType;
      return matchesSearch && matchesStation && matchesType;
    });
  }, [currentTrains, searchTerm, selectedStation, filterType, syncFilter, syncedIds]);

  const prevTrains = useMemo(
    () => (prevDiagram ? localTrains.filter(t => t.diagramNo === prevDiagram) : []),
    [prevDiagram, localTrains]
  );

  const diagramChanges = useMemo((): DiagramChanges | null => {
    if (!prevDiagram || prevTrains.length === 0) return null;
    return calculateDiagramChanges(currentTrains, prevTrains);
  }, [currentTrains, prevTrains, prevDiagram]);

  /* 统计 */
  const syncedCount = currentTrains.filter(t => syncedIds.has(t.id)).length;
  const unsyncedCount = currentTrains.length - syncedCount;

  /* 数据维护：找出当前图号中无法同步的车次及原因 */
  const maintenanceItems = useMemo(() => {
    return currentTrains
      .filter(t => !syncedIds.has(t.id))
      .map(t => ({ train: t, issues: checkSyncEligibility(t) }))
      .filter(item => item.issues.length > 0);
  }, [currentTrains, syncedIds]);

  /* 单条同步 */
  const handleSyncOne = (train: Train) => {
    if (syncedIds.has(train.id)) {
      notify('warning', `车次 ${train.trainNo} 已同步，如需重新同步请先将其标记为"未同步"。`);
      return;
    }
    const issues = checkSyncEligibility(train);
    if (issues.length > 0) {
      notify('error', `车次 ${train.trainNo} 不满足同步条件`, issues);
      setSelectedTrain(train);
      return;
    }
    setSyncedIds(prev => new Set([...prev, train.id]));
    notify('success', `车次 ${train.trainNo} 已成功同步至客运模板系统。`);
  };

  /* 批量同步：找出所有满足条件的未同步车次 */
  const handleBatchSync = () => {
    const eligible: Train[] = [];
    const failed: string[] = [];
    currentTrains.forEach(train => {
      if (syncedIds.has(train.id)) return; // 已同步跳过
      const issues = checkSyncEligibility(train);
      if (issues.length === 0) {
        eligible.push(train);
      } else {
        failed.push(`${train.trainNo}（${issues[0]}）`);
      }
    });
    if (eligible.length === 0 && failed.length === 0) {
      notify('warning', '当前图号下所有车次均已同步，无需重复操作。');
      return;
    }
    if (eligible.length > 0) {
      setSyncedIds(prev => new Set([...prev, ...eligible.map(t => t.id)]));
    }
    if (failed.length === 0) {
      notify('success', `批量同步完成，共同步 ${eligible.length} 个车次。`);
    } else {
      notify('warning', `同步完成：${eligible.length} 个成功，${failed.length} 个因条件不满足跳过。`,
        failed.slice(0, 5).concat(failed.length > 5 ? [`...等 ${failed.length - 5} 条`] : [])
      );
    }
  };

  /* 标记为未同步（重置状态） */
  const handleMarkUnsynced = (trainId: string) => {
    setSyncedIds(prev => { const s = new Set(prev); s.delete(trainId); return s; });
  };

  const handleSaveStations = () => {
    if (!editedTrain) return;
    // 更新 localTrains 中的数据
    setLocalTrains(prev => prev.map(t => t.id === editedTrain.id ? editedTrain : t));
    setSelectedTrain(editedTrain);
    setEditingStations(false);
    setEditedTrain(null);
    notify('success', '站点信息已保存');
  };

  const displayTrain = editedTrain || selectedTrain;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ── 顶部工具栏 ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* 左：标题 + 图号 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>基本计划</h1>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E7EB' }} />
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDiagramDropdown(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#374151' }}
              >
                <Calendar style={{ width: '14px', height: '14px', color: '#5e6ad2' }} />
                图号：{selectedDiagram}
                <ChevronDown style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
              </button>
              {showDiagramDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '160px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200 }}>
                  {[...diagramNos].reverse().map(d => (
                    <button key={d}
                      onClick={() => { if (d !== selectedDiagram) { setPrevDiagram(selectedDiagram); setSyncedIds(new Set()); } setSelectedDiagram(d); setShowDiagramDropdown(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: d === selectedDiagram ? '#EEF0FB' : 'transparent', fontSize: '13px', cursor: 'pointer', color: d === selectedDiagram ? '#5e6ad2' : '#374151', fontWeight: d === selectedDiagram ? 600 : 400 }}
                    >{d}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右：筛选 + 批量同步 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9CA3AF' }} />
              <input type="text" placeholder="搜索车次..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', paddingRight: '12px', height: '36px', width: '180px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', outline: 'none', color: '#374151' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowStationDropdown(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', height: '36px', border: '1px solid #D1D5DB', borderRadius: '6px', background: '#fff', fontSize: '13px', cursor: 'pointer', color: selectedStation ? '#374151' : '#9CA3AF', minWidth: '130px' }}>
                <MapPin style={{ width: '13px', height: '13px', color: '#9CA3AF' }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{selectedStation || '按经停站筛选'}</span>
                <ChevronDown style={{ width: '13px', height: '13px', color: '#9CA3AF' }} />
              </button>
              {showStationDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '160px', maxHeight: '260px', overflowY: 'auto', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200 }}>
                  <button onClick={() => { setSelectedStation(''); setShowStationDropdown(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', borderBottom: '1px solid #F3F4F6', background: 'transparent', fontSize: '13px', cursor: 'pointer', color: '#6B7280' }}>全部站名</button>
                  {stationNames.map(s => (
                    <button key={s} onClick={() => { setSelectedStation(s); setShowStationDropdown(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'transparent', fontSize: '13px', cursor: 'pointer', color: s === selectedStation ? '#5e6ad2' : '#374151', fontWeight: s === selectedStation ? 600 : 400 }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
              style={{ height: '36px', padding: '0 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer' }}>
              <option value="all">全部类型</option>
              <option value="high-speed">高铁</option>
              <option value="normal">普速</option>
            </select>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }} />

            {/* 批量同步按钮 */}
            <button onClick={handleBatchSync} style={btnStyle('primary')}>
              <Repeat style={{ width: '14px', height: '14px' }} />
              批量同步至客运模板
            </button>
          </div>
        </div>
      </div>

      {/* ── 副工具栏：同步状态 Tab ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {([
            { key: 'all', label: '全部', count: currentTrains.length },
            { key: 'unsynced', label: '未同步', count: unsyncedCount },
            { key: 'synced', label: '已同步', count: syncedCount },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setSyncFilter(tab.key)}
              style={{
                padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: '13px', fontWeight: syncFilter === tab.key ? 600 : 400,
                color: syncFilter === tab.key ? '#5e6ad2' : '#6B7280',
                borderBottom: syncFilter === tab.key ? '2px solid #5e6ad2' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {tab.label}
              <span style={{
                minWidth: '20px', height: '18px', padding: '0 5px', borderRadius: '999px',
                fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: syncFilter === tab.key ? '#5e6ad2' : '#F3F4F6',
                color: syncFilter === tab.key ? '#fff' : '#6B7280',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* 变更对比条（如果有） */}
        {diagramChanges && prevDiagram && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>与 {prevDiagram} 对比：</span>
            {[
              { type: 'added' as const, label: '新增', count: diagramChanges.added, bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
              { type: 'removed' as const, label: '减少', count: diagramChanges.removed, bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
              { type: 'modified' as const, label: '变更', count: diagramChanges.modified, bg: '#FFFBEB', color: '#92400E', border: '#FCD34D' },
            ].map(item => (
              <button key={item.type}
                onClick={() => item.count > 0 && setShowChangesDrawer(item.type)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '999px', backgroundColor: item.bg, border: `1px solid ${item.border}`, color: item.color, fontSize: '11px', fontWeight: 600, cursor: item.count > 0 ? 'pointer' : 'default', opacity: item.count === 0 ? 0.4 : 1 }}>
                {item.label} {item.count}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 数据维护提醒横幅 ── */}
      {maintenanceItems.length > 0 && (
        <div style={{ margin: '0 24px 0 24px', marginTop: '16px', background: '#FFFBEB', border: '1px solid #FCD34D', borderLeft: '4px solid #F59E0B', borderRadius: '8px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', marginBottom: '8px' }}>
                数据维护提醒 — {maintenanceItems.length} 个车次无法同步至客运模板，需补全信息
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {maintenanceItems.map(({ train, issues }) => (
                  <div key={train.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedTrain(train)}
                      style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#5e6ad2', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      {train.trainNo}
                    </button>
                    <span style={{ fontSize: '12px', color: '#78350F' }}>
                      {train.originStation} → {train.destinationStation}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>·</span>
                    {issues.map((issue, i) => (
                      <span key={i} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontWeight: 600 }}>
                        {issue}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 主列表 ── */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px 120px 180px 130px 110px 150px 1fr 120px', padding: '0 16px', borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
            {['#', '车次', '始发 → 终到', '车型 / 编组', '开行规则', '经过线路', '交路', '同步状态'].map((h, i) => (
              <div key={i} style={{ padding: '11px 8px', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: i === 7 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* 行 */}
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            {filteredTrains.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
                <Search style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
                <div style={{ fontSize: '14px' }}>未找到匹配的列车数据</div>
              </div>
            ) : (
              filteredTrains.map((train, idx) => (
                <TrainRow
                  key={train.id}
                  train={train}
                  index={idx}
                  isSynced={syncedIds.has(train.id)}
                  hasIssues={!syncedIds.has(train.id) && checkSyncEligibility(train).length > 0}
                  onOpen={() => setSelectedTrain(train)}
                  onSync={() => handleSyncOne(train)}
                  onMarkUnsynced={() => handleMarkUnsynced(train.id)}
                />
              ))
            )}
          </div>

          <div style={{ padding: '8px 24px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '12px', color: '#9CA3AF' }}>
            显示 {filteredTrains.length} / {currentTrains.length} 条 · 已同步 {syncedCount} 条
          </div>
        </div>
      </div>

      {/* ── 站点详情侧边抽屉 ── */}
      {selectedTrain && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} onClick={() => { setSelectedTrain(null); setEditingStations(false); setEditedTrain(null); }} />
          <div style={{ position: 'relative', width: '560px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)' }}>

            {/* 头部 */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF0FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrainIcon style={{ width: '22px', height: '22px', color: '#5e6ad2' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{selectedTrain.trainNo}</span>
                    {syncedIds.has(selectedTrain.id) ? (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#ECFDF5', color: '#065F46', fontWeight: 600, border: '1px solid #A7F3D0' }}>已同步</span>
                    ) : (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontWeight: 600, border: '1px solid #FCD34D' }}>未同步</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>图号：{selectedTrain.diagramNo} · {selectedTrain.trainType === 'high-speed' ? '高铁' : '普速'} · 共 {displayTrain?.stations.length} 站</div>
                </div>
              </div>
              <button onClick={() => { setSelectedTrain(null); setEditingStations(false); setEditedTrain(null); }}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px', color: '#6B7280' }} />
              </button>
            </div>

            {/* 工具栏 */}
            <div style={{ padding: '10px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                <MapPin style={{ width: '14px', height: '14px', color: '#5e6ad2' }} /> 经停站点
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editingStations ? (
                  <>
                    <button onClick={() => { if (editedTrain) { const ns = { stationName: '新站点', stationOrder: editedTrain.stations.length + 1, updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19) }; setEditedTrain({ ...editedTrain, stations: [...editedTrain.stations, ns] }); } }} style={btnStyle('outline')}>
                      <Plus style={{ width: '13px', height: '13px' }} /> 添加站点
                    </button>
                    <button onClick={() => { setEditingStations(false); setEditedTrain(null); }} style={btnStyle('ghost')}>取消</button>
                    <button onClick={handleSaveStations} style={btnStyle('success')}>确认保存</button>
                  </>
                ) : (
                  <button onClick={() => { setEditedTrain(JSON.parse(JSON.stringify(selectedTrain))); setEditingStations(true); }} style={btnStyle('outline')}>
                    <Edit style={{ width: '13px', height: '13px' }} /> 编辑站点
                  </button>
                )}
              </div>
            </div>

            {/* 站点列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px', backgroundColor: '#F9FAFB' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayTrain?.stations.map((station, i) => {
                  const total = displayTrain.stations.length;
                  const isFirst = i === 0;
                  const isLast = i === total - 1;
                  const isCQ = station.stationName === '重庆东';
                  return (
                    <div key={`${station.stationOrder}-${i}`} style={{ background: '#fff', border: `1px solid ${isCQ ? '#5e6ad2' : '#E5E7EB'}`, borderRadius: '8px', padding: '12px 14px', position: 'relative', boxShadow: isCQ ? '0 0 0 2px #EEF0FB' : 'none' }}>
                      {isCQ && <div style={{ position: 'absolute', top: '-9px', right: '12px', background: '#5e6ad2', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>当前监控站</div>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: isFirst ? '#ECFDF5' : isLast ? '#FEF2F2' : '#F3F4F6', color: isFirst ? '#065F46' : isLast ? '#991B1B' : '#6B7280' }}>
                            {station.stationOrder}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {editingStations ? (
                              <input value={station.stationName}
                                onChange={e => { if (editedTrain) { const s = [...editedTrain.stations]; s[i] = { ...s[i], stationName: e.target.value }; setEditedTrain({ ...editedTrain, stations: s }); } }}
                                style={{ fontSize: '14px', fontWeight: 600, border: 'none', borderBottom: '1px dashed #5e6ad2', outline: 'none', background: 'transparent', width: '110px' }} />
                            ) : (
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{station.stationName}</div>
                            )}
                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>
                              股道：{editingStations ? (
                                <input value={station.track || ''} onChange={e => { if (editedTrain) { const s = [...editedTrain.stations]; s[i] = { ...s[i], track: e.target.value }; setEditedTrain({ ...editedTrain, stations: s }); } }}
                                  style={{ width: '40px', border: 'none', borderBottom: '1px dashed #D1D5DB', outline: 'none', fontSize: '12px', background: 'transparent' }} />
                              ) : station.track ? station.track : <span style={{ color: '#FBBF24' }}>未填</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                          {!isFirst && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <Clock style={{ width: '12px', height: '12px', color: '#9CA3AF' }} />
                              <span style={{ color: '#9CA3AF' }}>到</span>
                              {editingStations ? (
                                <input type="text" placeholder="--:--" value={station.arrivalTime || ''} onChange={e => { if (editedTrain) { const s = [...editedTrain.stations]; s[i] = { ...s[i], arrivalTime: e.target.value }; setEditedTrain({ ...editedTrain, stations: s }); } }}
                                  style={{ width: '48px', fontFamily: 'monospace', fontWeight: 600, fontSize: '12px', border: 'none', borderBottom: '1px dashed #D1D5DB', outline: 'none', background: 'transparent', textAlign: 'right' }} />
                              ) : <span style={{ fontFamily: 'monospace', fontWeight: 600, color: station.arrivalTime ? '#374151' : '#FBBF24' }}>{station.arrivalTime || '--:--'}</span>}
                            </div>
                          )}
                          {!isLast && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <Clock style={{ width: '12px', height: '12px', color: '#5e6ad2' }} />
                              <span style={{ color: '#9CA3AF' }}>发</span>
                              {editingStations ? (
                                <input type="text" placeholder="--:--" value={station.departureTime || ''} onChange={e => { if (editedTrain) { const s = [...editedTrain.stations]; s[i] = { ...s[i], departureTime: e.target.value }; setEditedTrain({ ...editedTrain, stations: s }); } }}
                                  style={{ width: '48px', fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', border: 'none', borderBottom: '1px dashed #5e6ad2', outline: 'none', background: 'transparent', textAlign: 'right', color: '#5e6ad2' }} />
                              ) : <span style={{ fontFamily: 'monospace', fontWeight: 700, color: station.departureTime ? '#5e6ad2' : '#FBBF24' }}>{station.departureTime || '--:--'}</span>}
                            </div>
                          )}
                        </div>
                        {editingStations && (
                          <button onClick={() => { if (editedTrain) { const s = editedTrain.stations.filter((_, si) => si !== i).map((st, si) => ({ ...st, stationOrder: si + 1 })); setEditedTrain({ ...editedTrain, stations: s }); } }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#D1D5DB', flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#D1D5DB'; }}>
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 底部操作 */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              {syncedIds.has(selectedTrain.id) ? (
                <button onClick={() => handleMarkUnsynced(selectedTrain.id)} style={btnStyle('warning')}>
                  <RefreshCw style={{ width: '14px', height: '14px' }} /> 标记为未同步
                </button>
              ) : (
                <button disabled={editingStations} onClick={() => handleSyncOne(selectedTrain)}
                  style={{ ...btnStyle('primary'), opacity: editingStations ? 0.4 : 1, cursor: editingStations ? 'not-allowed' : 'pointer' }}>
                  <Repeat style={{ width: '14px', height: '14px' }} /> 同步至客运模板
                </button>
              )}
              {!editingStations && (
                <button onClick={() => setSelectedTrain(null)} style={btnStyle('ghost')}>关闭</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 变更详情抽屉 ── */}
      {showChangesDrawer && diagramChanges && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} onClick={() => setShowChangesDrawer(null)} />
          <div style={{ position: 'relative', width: '400px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{showChangesDrawer === 'added' ? '新增车次' : showChangesDrawer === 'removed' ? '减少车次' : '变更车次'}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>共 {showChangesDrawer === 'added' ? diagramChanges.added : showChangesDrawer === 'removed' ? diagramChanges.removed : diagramChanges.modified} 条</div>
              </div>
              <button onClick={() => setShowChangesDrawer(null)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: '16px', height: '16px', color: '#6B7280' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {(showChangesDrawer === 'added' ? diagramChanges.addedTrains : showChangesDrawer === 'removed' ? diagramChanges.removedTrains : diagramChanges.modifiedTrains).map(train => (
                <div key={train.id} onClick={() => { setSelectedTrain(train); setShowChangesDrawer(null); }}
                  style={{ padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#5e6ad2'; e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#fff'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', color: '#111827' }}>{train.trainNo}</span>
                    <span style={{ fontSize: '12px', color: '#5e6ad2', fontWeight: 600 }}>查看 →</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{train.originStation} → {train.destinationStation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 通知 ── */}
      {notification && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '320px', maxWidth: '480px', background: '#fff', border: `1px solid ${notification.type === 'success' ? '#A7F3D0' : notification.type === 'error' ? '#FECACA' : '#FCD34D'}`, borderLeft: `4px solid ${notification.type === 'success' ? '#10B981' : notification.type === 'error' ? '#EF4444' : '#F59E0B'}`, borderRadius: '8px', padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {notification.type === 'success' ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10B981', flexShrink: 0, marginTop: '1px' }} /> : <AlertCircle style={{ width: '18px', height: '18px', color: notification.type === 'error' ? '#EF4444' : '#F59E0B', flexShrink: 0, marginTop: '1px' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{notification.message}</div>
              {notification.details && notification.details.length > 0 && (
                <ul style={{ marginTop: '6px', paddingLeft: '16px' }}>
                  {notification.details.map((d, i) => <li key={i} style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>{d}</li>)}
                </ul>
              )}
            </div>
            <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', flexShrink: 0 }}>
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── 列表行 ── */
const TrainRow: React.FC<{
  train: Train;
  index: number;
  isSynced: boolean;
  hasIssues: boolean;
  onOpen: () => void;
  onSync: () => void;
  onMarkUnsynced: () => void;
}> = ({ train, index, isSynced, hasIssues, onOpen, onSync, onMarkUnsynced }) => {
  const [hovered, setHovered] = useState(false);
  const ruleMap: Record<string, { label: string; bg: string; color: string }> = {
    daily: { label: '每日', bg: '#ECFDF5', color: '#065F46' },
    alternate: { label: '隔日', bg: '#FFFBEB', color: '#92400E' },
    custom: { label: '定制', bg: '#EEF2FF', color: '#3730A3' },
  };
  const rc = ruleMap[train.operationRule] ?? ruleMap.daily;

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '48px 120px 180px 130px 110px 150px 1fr 120px', padding: '0 16px', borderBottom: `1px solid ${hasIssues ? '#FDE68A' : '#F3F4F6'}`, backgroundColor: hovered ? (hasIssues ? '#FFFBEB' : '#F5F6FE') : hasIssues ? '#FFFDF0' : index % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer', transition: 'background 0.1s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      <div style={{ padding: '13px 8px', fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {index + 1}
        {hasIssues && <span title="数据不完整，无法同步" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0, display: 'inline-block' }} />}
      </div>

      <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <TrainIcon style={{ width: '14px', height: '14px', color: '#5e6ad2', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'monospace', color: '#111827' }}>{train.trainNo}</span>
        <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, background: train.trainType === 'high-speed' ? '#DBEAFE' : '#F3F4F6', color: train.trainType === 'high-speed' ? '#1E40AF' : '#6B7280' }}>
          {train.trainType === 'high-speed' ? '高铁' : '普速'}
        </span>
      </div>

      <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>{train.originStation}</span>
        <ArrowRight style={{ width: '11px', height: '11px', color: '#D1D5DB', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>{train.destinationStation}</span>
      </div>

      <div style={{ padding: '13px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>
        <span style={{ fontSize: '12px', color: '#374151' }}>{train.trainModel || '—'}</span>
        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{train.formationCount} / {train.capacity} 人</span>
      </div>

      <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: rc.bg, color: rc.color }}>{rc.label}</span>
        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>周期 {train.operationCycle}天</span>
      </div>

      <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        {train.passingLines?.slice(0, 2).map(l => (
          <span key={l} style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#F3F4F6', color: '#6B7280' }}>{l}</span>
        ))}
        {(train.passingLines?.length ?? 0) > 2 && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>+{(train.passingLines?.length ?? 0) - 2}</span>}
      </div>

      {/* 交路列 */}
      <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <span style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={train.routeInfo || '—'}>{train.routeInfo || '—'}</span>
      </div>

      {/* 同步状态列 */}
      <div style={{ padding: '13px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isSynced ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#ECFDF5', color: '#065F46', fontWeight: 600, border: '1px solid #A7F3D0' }}>已同步</span>
            {hovered && (
              <button title="标记为未同步" onClick={e => { e.stopPropagation(); onMarkUnsynced(); }}
                style={{ background: 'none', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '3px', cursor: 'pointer', display: 'flex', color: '#9CA3AF' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.borderColor = '#F59E0B'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}>
                <RefreshCw style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontWeight: 600, border: '1px solid #FCD34D' }}>未同步</span>
            {hovered && (
              <button title="同步此车次" onClick={e => { e.stopPropagation(); onSync(); }}
                style={{ background: 'none', border: '1px solid #5e6ad2', borderRadius: '4px', padding: '3px', cursor: 'pointer', display: 'flex', color: '#5e6ad2' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF0FB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                <Repeat style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
