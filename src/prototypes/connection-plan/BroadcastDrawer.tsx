import React, { useState, useMemo, useEffect } from 'react';
import { Play, Pause, Edit3, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, X, Save, Check } from 'lucide-react';
import './style.css';

interface BroadcastItem {
  id: string;
  name: string;
  startTime: string;
  playCount: number;
  triggerSignal: string;
  status: '未执行' | '开始执行' | '已完成' | '执行冲突';
  areas: string[];
  mode: 'manual' | 'auto';
  hasConflict?: boolean;
}

interface AreaTreeNode {
  id: string;
  name: string;
  checked: boolean;
  children?: AreaTreeNode[];
}

interface BroadcastDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: any;
  onSwitchTrain?: (train: any, isArrival: boolean) => void;
  isArrival?: boolean;
}

const mockArrivalBroadcastData: BroadcastItem[] = [
  {
    id: 'a1',
    name: '站前广场宣传-重庆东',
    startTime: '2026-06-03 10:26:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['站前广场'],
    mode: 'manual'
  },
  {
    id: 'a2',
    name: '通知工作人员接车-重庆东',
    startTime: '2026-06-03 10:40:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '开始执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'a3',
    name: '车到前宣传-重庆东',
    startTime: '2026-06-03 10:47:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '开始执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'a4',
    name: '列车进站广播-重庆东',
    startTime: '2026-06-03 10:55:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'manual'
  },
  {
    id: 'a5',
    name: '列车到达通告-重庆东',
    startTime: '2026-06-03 10:55:00',
    playCount: 1,
    triggerSignal: '列车到达',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'a6',
    name: '列车到达出站层宣传通告-重庆东',
    startTime: '2026-06-03 10:56:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['1-9出站口'],
    mode: 'auto'
  },
  {
    id: 'a7',
    name: '途径动车检票前5分钟宣传-重庆东',
    startTime: '2026-06-03 10:56:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '执行冲突',
    areas: ['4AB', '5AB', '商业层', '站前广场', '西侧候车区', '中部候车区', '东侧候车区', '夹层', '下层候车区'],
    mode: 'auto',
    hasConflict: true
  },
  {
    id: 'a8',
    name: '便捷换乘宣传',
    startTime: '2026-06-03 10:56:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'a9',
    name: '站台安全宣传-CQD',
    startTime: '2026-06-03 10:59:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'a10',
    name: '验检合一提示',
    startTime: '2026-06-03 10:59:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4AB', '5AB', '商业层', '站前广场', '西侧候车区', '中部候车区', '东侧候车区', '夹层', '下层候车区'],
    mode: 'auto'
  }
];

const mockDepartureBroadcastData: BroadcastItem[] = [
  {
    id: 'd1',
    name: '途径动车开检-重庆东',
    startTime: '2026-06-03 11:01:00',
    playCount: 1,
    triggerSignal: '进站立即开检',
    status: '未执行',
    areas: ['4AB', '5AB', '商业层', '站前广场', '西侧候车区', '中部候车区', '东侧候车区', '夹层', '下层候车区'],
    mode: 'auto'
  },
  {
    id: 'd2',
    name: '站台地标宣传-重庆东',
    startTime: '2026-06-03 11:02:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'd3',
    name: '途径动车第一次催检-重庆东',
    startTime: '2026-06-03 11:04:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4AB', '5AB', '商业层', '站前广场', '西侧候车区', '中部候车区', '东侧候车区', '夹层', '下层候车区'],
    mode: 'auto'
  },
  {
    id: 'd4',
    name: '途径动车第二次催检-重庆东',
    startTime: '2026-06-03 11:06:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '执行冲突',
    areas: ['4AB', '5AB', '商业层', '站前广场', '西侧候车区', '中部候车区', '东侧候车区', '夹层', '下层候车区'],
    mode: 'auto',
    hasConflict: true
  },
  {
    id: 'd5',
    name: '途径动车停检-重庆东',
    startTime: '2026-06-03 11:11:00',
    playCount: 1,
    triggerSignal: '进站立即停检',
    status: '未执行',
    areas: ['4AB', '5AB', '商业层', '站前广场', '西侧候车区', '中部候车区', '东侧候车区', '夹层', '下层候车区'],
    mode: 'auto'
  },
  {
    id: 'd6',
    name: '途径动车送车词-重庆东',
    startTime: '2026-06-03 11:14:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'd7',
    name: '途径动车打铃10S-重庆东',
    startTime: '2026-06-03 11:15:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'd8',
    name: '清站通告-重庆东',
    startTime: '2026-06-03 11:18:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  },
  {
    id: 'd9',
    name: '发车前安全提示-重庆东',
    startTime: '2026-06-03 11:16:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4AB', '5AB'],
    mode: 'auto'
  },
  {
    id: 'd10',
    name: '旅客上车提醒-重庆东',
    startTime: '2026-06-03 11:17:00',
    playCount: 1,
    triggerSignal: '时间',
    status: '未执行',
    areas: ['4、5站台'],
    mode: 'auto'
  }
];

const areaTreeData: AreaTreeNode[] = [
  {
    id: 'chongqing-east',
    name: '重庆东',
    checked: false,
    children: [
      {
        id: 'waiting-area',
        name: '候车区（室）',
        checked: false,
        children: [
          { id: 'waiting-hall-a', name: '候车大厅A', checked: false },
          { id: 'waiting-hall-b', name: '候车大厅B', checked: false },
          { id: 'waiting-hall-c', name: '候车大厅C', checked: false },
          { id: 'commercial-floor', name: '商业层', checked: false },
          { id: 'west-waiting', name: '西侧候车区', checked: false },
          { id: 'middle-waiting', name: '中部候车区', checked: false },
          { id: 'east-waiting', name: '东侧候车区', checked: false },
          { id: 'mezzanine', name: '夹层', checked: false },
          { id: 'lower-waiting', name: '下层候车区', checked: false }
        ]
      },
      {
        id: 'ticket-gate',
        name: '检票口',
        checked: false,
        children: [
          { id: 'gate-4ab', name: '4AB', checked: false },
          { id: 'gate-5ab', name: '5AB', checked: false },
          { id: 'gate-1a', name: 'A1', checked: false },
          { id: 'gate-2a', name: 'A2', checked: false },
          { id: 'gate-3a', name: 'A3', checked: false }
        ]
      },
      {
        id: 'platform',
        name: '站台',
        checked: false,
        children: [
          { id: 'platform-1', name: '1站台', checked: false },
          { id: 'platform-2-3', name: '2、3站台', checked: false },
          { id: 'platform-4-5', name: '4、5站台', checked: false },
          { id: 'platform-6-7', name: '6、7站台', checked: false },
          { id: 'platform-8-9', name: '8、9站台', checked: false },
          { id: 'platform-10-11', name: '10、11站台', checked: false },
          { id: 'platform-12-13', name: '12、13站台', checked: false },
          { id: 'platform-14-15', name: '14、15站台', checked: false },
          { id: 'platform-16-17', name: '16、17站台', checked: false },
          { id: 'platform-18-19', name: '18、19站台', checked: false },
          { id: 'platform-20-21', name: '20、21站台', checked: false },
          { id: 'platform-22-23', name: '22、23站台', checked: false },
          { id: 'platform-24-25', name: '24、25站台', checked: false },
          { id: 'platform-26-27', name: '26、27站台', checked: false },
          { id: 'platform-28-29', name: '28、29站台', checked: false }
        ]
      },
      {
        id: 'exit',
        name: '出站口',
        checked: false,
        children: [
          { id: 'exit-1-9', name: '1-9出站口', checked: false },
          { id: 'exit-south', name: '渝厦场南侧出站口', checked: false },
          { id: 'exit-north', name: '渝厦场北侧出站口', checked: false },
          { id: 'exit-chengyu', name: '成渝场出站口', checked: false }
        ]
      },
      {
        id: 'ticket-area',
        name: '售票区',
        checked: false,
        children: [
          { id: 'ticket-hall', name: '票厅+自助', checked: false }
        ]
      },
      {
        id: 'square',
        name: '广场',
        checked: false,
        children: [
          { id: 'forecourt', name: '站前广场', checked: false },
          { id: 'west-square', name: '西广场', checked: false },
          { id: 'east-square', name: '东广场', checked: false }
        ]
      },
      {
        id: 'office-area',
        name: '办公区',
        checked: false
      },
      {
        id: 'entrance',
        name: '进站口',
        checked: false,
        children: [
          { id: 'entrance-main', name: '主进站口', checked: false },
          { id: 'entrance-west', name: '西进站口', checked: false },
          { id: 'entrance-east', name: '东进站口', checked: false }
        ]
      }
    ]
  }
];

const AreaTree: React.FC<{
  data: AreaTreeNode[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}> = ({ data, selectedIds, onToggle }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['chongqing-east']));
  
  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderNode = (node: AreaTreeNode, level: number = 0) => {
    const isSelected = selectedIds.includes(node.id);
    const isExpanded = expandedIds.has(node.id);
    
    return (
      <div key={node.id} className="area-tree-node">
        <div 
          className={`area-tree-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {node.children && node.children.length > 0 && (
            <span className="area-tree-arrow" onClick={(e) => toggleExpand(e, node.id)}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {!node.children && <span style={{ marginRight: '4px', width: '14px', display: 'inline-block' }} />}
          <span 
            className={`area-tree-checkbox ${isSelected ? 'checked' : ''}`}
            onClick={() => onToggle(node.id)}
          >
            {isSelected && <Check size={10} />}
          </span>
          <span className="area-tree-label" onClick={() => onToggle(node.id)}>{node.name}</span>
        </div>
        {node.children && node.children.length > 0 && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div>{data.map(node => renderNode(node))}</div>;
};

export const BroadcastDrawer: React.FC<BroadcastDrawerProps> = ({ 
  visible, 
  onClose, 
  train,
  onSwitchTrain,
  isArrival
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'checkin' | 'platform' | 'exit' | 'other'>('all');
  const [broadcastData, setBroadcastData] = useState<BroadcastItem[]>(isArrival ? mockArrivalBroadcastData : mockDepartureBroadcastData);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastItem | null>(null);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);

  useEffect(() => {
    setBroadcastData(isArrival ? mockArrivalBroadcastData : mockDepartureBroadcastData);
    setActiveTab('all');
  }, [isArrival]);

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');
  const isConnectedTrain = train ? (!isInspection(train.arrivalTrainNo) && !isInspection(train.departureTrainNo) && train.arrivalTrainNo !== train.departureTrainNo) : false;
  const isTerminationTrain = isArrival && train?.arrivalTrainNo !== train?.departureTrainNo && !isInspection(train?.arrivalTrainNo || '');
  const connectedTrainNo = train ? (isArrival ? train.departureTrainNo : train.arrivalTrainNo) : '';
  
  const getTrainTypeClass = (trainNo: string, isArr: boolean, arrivalNo: string, departureNo: string): string => {
    if (trainNo.startsWith('0') || trainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (arrivalNo === departureNo) {
      return 'purple';
    }
    if (isArr) {
      return 'cyan';
    }
    return 'yellow';
  };
  
  const currentTrainNo = isArrival ? train?.arrivalTrainNo : train?.departureTrainNo;
  const currentTrainTypeClass = train ? getTrainTypeClass(currentTrainNo || '', isArrival, train.arrivalTrainNo, train.departureTrainNo) : '';
  const connectedTrainTypeClass = train ? getTrainTypeClass(connectedTrainNo, !isArrival, train.arrivalTrainNo, train.departureTrainNo) : '';

  const statusConfig = {
    '未执行': { color: '#6B7280', bg: '#F3F4F6', text: '未执行' },
    '开始执行': { color: '#D97706', bg: '#FEFCE8', text: '执行中' },
    '已完成': { color: '#10B981', bg: '#ECFDF5', text: '已完成' },
    '执行冲突': { color: '#DC2626', bg: '#FEF2F2', text: '执行冲突' }
  };

  const areaKeywords: Record<string, string[]> = {
    'waiting': ['候车', '候车区', '商业层'],
    'checkin': ['检票', 'AB', 'A口', 'B口'],
    'platform': ['站台'],
    'exit': ['出站口'],
    'other': ['进站口', '售票', '广场', '办公区']
  };

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return broadcastData;
    
    const keywords = areaKeywords[activeTab] || [];
    return broadcastData.filter(item => 
      item.areas.some(area => 
        keywords.some(keyword => area.includes(keyword))
      )
    );
  }, [broadcastData, activeTab]);

  const getAreaStats = useMemo(() => {
    const stats: Record<string, { count: number; conflictCount: number }> = {};
    
    Object.keys(areaKeywords).forEach(key => {
      const keywords = areaKeywords[key];
      const filtered = broadcastData.filter(item => 
        item.areas.some(area => keywords.some(keyword => area.includes(keyword)))
      );
      stats[key] = {
        count: filtered.length,
        conflictCount: filtered.filter(item => item.status === '执行冲突').length
      };
    });
    
    stats['all'] = {
      count: broadcastData.length,
      conflictCount: broadcastData.filter(item => item.status === '执行冲突').length
    };
    
    return stats;
  }, [broadcastData]);

  // 辅助函数：比较时间，返回 actualTime > scheduledTime
  const isTimeDelayed = (scheduledTime: string, actualTime: string): boolean => {
    if (!scheduledTime || !actualTime) return false;
    const [sHour, sMin] = scheduledTime.split(':').map(Number);
    const [aHour, aMin] = actualTime.split(':').map(Number);
    if (aHour > sHour) return true;
    if (aHour === sHour && aMin > sMin) return true;
    return false;
  };

  // 辅助函数：检查当前时间是否已超过计划时间且未打卡
  const isOverdueAndPending = (scheduledTime: string, actualTime: string): boolean => {
    if (actualTime) return false; // 已打卡的不检查
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const [sHour, sMin] = scheduledTime.split(':').map(Number);
    
    if (currentHour > sHour) return true;
    if (currentHour === sHour && currentMin > sMin) return true;
    return false;
  };

  const handleEditAreas = (broadcast: BroadcastItem) => {
    setEditingBroadcast(broadcast);
    const ids = areaTreeData.flatMap(node => {
      const findMatchingIds = (n: AreaTreeNode): string[] => {
        if (broadcast.areas.some(a => a.includes(n.name))) {
          return [n.id, ...(n.children?.flatMap(findMatchingIds) || [])];
        }
        return n.children?.flatMap(findMatchingIds) || [];
      };
      return findMatchingIds(node);
    });
    setSelectedAreaIds(ids);
    setEditModalVisible(true);
  };

  const handleSaveAreas = () => {
    if (!editingBroadcast) return;
    const selectedNames = selectedAreaIds.map(id => {
      const findName = (nodes: AreaTreeNode[]): string | null => {
        for (const node of nodes) {
          if (node.id === id) return node.name;
          if (node.children) {
            const found = findName(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findName(areaTreeData);
    }).filter(Boolean);
    
    setBroadcastData(prev => 
      prev.map(item => 
        item.id === editingBroadcast.id 
          ? { ...item, areas: selectedNames as string[] } 
          : item
      )
    );
    setEditModalVisible(false);
    setEditingBroadcast(null);
  };

  const handleToggleArea = (id: string) => {
    setSelectedAreaIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!visible) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content broadcast-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3 className="drawer-title">广播计划</h3>
          </div>
          <div className="drawer-header-right">
            {train && (
              <div className="train-info-badge-group">
                <span className={`train-pill ${currentTrainTypeClass}`}>
                  {currentTrainNo}
                </span>
                {isConnectedTrain && (
                  <>
                    <span className="connection-label">
                      {isTerminationTrain ? '接续' : '折返'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span 
                      className={`train-pill-small ${connectedTrainTypeClass} clickable`}
                      title={`点击跳转到${isArrival ? '始发车' : '终到车'}`}
                      onClick={() => onSwitchTrain && onSwitchTrain(train, !isArrival)}
                    >
                      {connectedTrainNo}
                    </span>
                  </>
                )}
              </div>
            )}
            <button className="drawer-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="broadcast-tabs">
          <button 
            className={`broadcast-tab ${activeTab === 'all' ? 'active' : ''} ${getAreaStats['all'].conflictCount > 0 ? 'has-conflict' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部 <span className="tab-count">({getAreaStats['all'].conflictCount > 0 ? `${getAreaStats['all'].conflictCount}/` : ''}{getAreaStats['all'].count})</span>
          </button>
          <button 
            className={`broadcast-tab ${activeTab === 'waiting' ? 'active' : ''} ${getAreaStats['waiting']?.conflictCount > 0 ? 'has-conflict' : ''}`}
            onClick={() => setActiveTab('waiting')}
          >
            候车室 <span className="tab-count">({getAreaStats['waiting']?.conflictCount > 0 ? `${getAreaStats['waiting'].conflictCount}/` : ''}{getAreaStats['waiting']?.count || 0})</span>
          </button>
          <button 
            className={`broadcast-tab ${activeTab === 'checkin' ? 'active' : ''} ${getAreaStats['checkin']?.conflictCount > 0 ? 'has-conflict' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            检票口 <span className="tab-count">({getAreaStats['checkin']?.conflictCount > 0 ? `${getAreaStats['checkin'].conflictCount}/` : ''}{getAreaStats['checkin']?.count || 0})</span>
          </button>
          <button 
            className={`broadcast-tab ${activeTab === 'platform' ? 'active' : ''} ${getAreaStats['platform']?.conflictCount > 0 ? 'has-conflict' : ''}`}
            onClick={() => setActiveTab('platform')}
          >
            站台 <span className="tab-count">({getAreaStats['platform']?.conflictCount > 0 ? `${getAreaStats['platform'].conflictCount}/` : ''}{getAreaStats['platform']?.count || 0})</span>
          </button>
          <button 
            className={`broadcast-tab ${activeTab === 'exit' ? 'active' : ''} ${getAreaStats['exit']?.conflictCount > 0 ? 'has-conflict' : ''}`}
            onClick={() => setActiveTab('exit')}
          >
            出站口 <span className="tab-count">({getAreaStats['exit']?.conflictCount > 0 ? `${getAreaStats['exit'].conflictCount}/` : ''}{getAreaStats['exit']?.count || 0})</span>
          </button>
          <button 
            className={`broadcast-tab ${activeTab === 'other' ? 'active' : ''} ${getAreaStats['other']?.conflictCount > 0 ? 'has-conflict' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            其他区域 <span className="tab-count">({getAreaStats['other']?.conflictCount > 0 ? `${getAreaStats['other'].conflictCount}/` : ''}{getAreaStats['other']?.count || 0})</span>
          </button>
        </div>

        <div className="drawer-body">
          <div className="broadcast-list-view">
            {filteredData.map((item) => {
              const isDelayed = isTimeDelayed(item.startTime.split(' ')[1], '');
              const isOverdue = isOverdueAndPending(item.startTime.split(' ')[1], '');
              
              return (
                <div 
                  key={item.id} 
                  className={`broadcast-list-item ${isOverdue ? 'overdue' : ''} ${item.status === '执行冲突' ? 'conflict' : ''}`}
                >
                  <div className="broadcast-list-main">
                    <div className="broadcast-list-info">
                      <div className="broadcast-list-title">
                        {item.status === '执行冲突' && <span className="conflict-indicator">!</span>}
                        {item.name}
                      </div>
                      <div className="broadcast-list-meta">
                        <span className="broadcast-time">{item.startTime.split(' ')[1]}</span>
                        <span className="broadcast-trigger">{item.triggerSignal}</span>
                        <span className={`broadcast-status-text ${item.status}`} style={{
                          color: statusConfig[item.status].color
                        }}>
                          {statusConfig[item.status].text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="broadcast-list-areas">
                      {item.areas.map((area, idx) => (
                        <span key={idx} className="broadcast-area-tag-compact">{area}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="broadcast-list-actions">
                    <button 
                      className="broadcast-action-btn-compact" 
                      onClick={() => handleEditAreas(item)}
                      title="编辑分区"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button 
                      className={`broadcast-action-btn-compact ${item.status === '开始执行' ? 'danger' : 'success'}`}
                      title={item.status === '开始执行' ? '停止' : '立即执行'}
                    >
                      {item.status === '开始执行' ? (
                        <Pause size={12} />
                      ) : (
                        <Play size={12} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredData.length === 0 && (
            <div className="drawer-empty-state">
              <span>暂无该区域的广播计划</span>
            </div>
          )}
        </div>

        {/* 编辑分区弹窗 */}
        {editModalVisible && editingBroadcast && (
          <div className="modal-overlay" onClick={() => setEditModalVisible(false)}>
            <div className="modal-content edit-area-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">修改广播区域</span>
                <button className="modal-close-btn" onClick={() => setEditModalVisible(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body edit-area-body">
                <AreaTree 
                  data={areaTreeData} 
                  selectedIds={selectedAreaIds} 
                  onToggle={handleToggleArea} 
                />
              </div>
              <div className="modal-footer">
                <button className="modal-btn secondary" onClick={() => setEditModalVisible(false)}>关闭</button>
                <button className="modal-btn primary" onClick={handleSaveAreas}>
                  <Save size={14} style={{ marginRight: '6px' }} />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};