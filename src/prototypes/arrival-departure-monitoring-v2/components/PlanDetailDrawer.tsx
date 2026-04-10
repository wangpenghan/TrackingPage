import React, { useState } from 'react';
import { Button, Tag, Modal, Select, Input, message, Tooltip, Drawer } from 'antd';
import { X, Save, RotateCcw, Play, Square, Monitor, Volume2, Edit3, Clock, Radio, Eye, RefreshCw } from 'lucide-react';
import { EyeOutlined, ReloadOutlined, RotateCcwOutlined } from '@ant-design/icons';
import { mockTrainSchedules } from '../mock-data';
import dayjs from 'dayjs';

const { Option } = Select;

interface PlanDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
}

interface GuidePlan {
  id: string;
  screenName: string;
  startTime: string;
  endTime: string;
  mode: 'auto' | 'manual';
  signal: 'checkInOpen' | 'arrival' | 'departure';
  status: string;
  baseTime: string;
  offsetMinutes: number;
  isModified?: boolean;
}

interface BroadcastPlan {
  id: string;
  name: string;
  playTime: string;
  playCount: number;
  triggerSignal: 'checkInOpen' | 'arrival' | 'departure';
  mode: 'auto' | 'manual';
  status: string;
  baseTime: string;
  offsetMinutes: number;
  isModified?: boolean;
}

// 信号选项配置
const signalOptions = [
  { value: 'checkInOpen', label: '进站开检', desc: '开始检票时间' },
  { value: 'arrival', label: '到点', desc: '列车到达时间' },
  { value: 'departure', label: '发点', desc: '列车发车时间' },
];

// 获取当前日期字符串 MM/DD
const getCurrentDateString = () => {
  return dayjs().format('MM/DD');
};

// 获取基准时间（返回 MM/DD HH:mm 格式）
const getBaseTime = (train: any, signal: string) => {
  if (!train) return `${getCurrentDateString()} 00:00`;
  const date = getCurrentDateString();
  switch (signal) {
    case 'checkInOpen':
      const checkInTime = dayjs(`2024-01-01 ${train.departure.time}`).subtract(20, 'minute').format('HH:mm');
      return `${date} ${checkInTime}`;
    case 'arrival':
      return `${date} ${train.arrival.time}`;
    case 'departure':
      return `${date} ${train.departure.time}`;
    default:
      return `${date} 00:00`;
  }
};

// 计算开始时间 = 基准时间 + 偏移量（返回 MM/DD HH:mm 格式）
const calculateStartTime = (baseTime: string, offsetMinutes: number) => {
  // baseTime 格式: MM/DD HH:mm
  const [datePart, timePart] = baseTime.split(' ');
  const [month, day] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  const base = dayjs(`2024-${month}-${day} ${hour}:${minute}`);
  const result = base.add(offsetMinutes, 'minute');
  return result.format('MM/DD HH:mm');
};

// 计算偏移量 = 开始时间 - 基准时间
const calculateOffset = (baseTime: string, startTime: string) => {
  // baseTime 和 startTime 格式: MM/DD HH:mm
  const [baseDate, baseTimePart] = baseTime.split(' ');
  const [baseMonth, baseDay] = baseDate.split('/');
  const [baseHour, baseMinute] = baseTimePart.split(':');
  
  const [startDate, startTimePart] = startTime.split(' ');
  const [startMonth, startDay] = startDate.split('/');
  const [startHour, startMinute] = startTimePart.split(':');
  
  const base = dayjs(`2024-${baseMonth}-${baseDay} ${baseHour}:${baseMinute}`);
  const start = dayjs(`2024-${startMonth}-${startDay} ${startHour}:${startMinute}`);
  return start.diff(base, 'minute');
};

const mockGuidePlans: GuidePlan[] = [
  { id: 'g1', screenName: '候车室综合屏', startTime: '03/20 03:23', endTime: '03/20 11:28', mode: 'manual', signal: 'checkInOpen', status: '正在执行', baseTime: '03/20 03:23', offsetMinutes: 0 },
  { id: 'g2', screenName: '检票口引导屏', startTime: '03/20 03:18', endTime: '03/20 11:23', mode: 'auto', signal: 'arrival', status: '正在执行', baseTime: '03/20 03:23', offsetMinutes: -5 },
  { id: 'g3', screenName: '站台引导屏', startTime: '03/20 03:18', endTime: '03/20 11:23', mode: 'auto', signal: 'arrival', status: '正在执行', baseTime: '03/20 03:23', offsetMinutes: -5 },
  { id: 'g4', screenName: '出站口引导屏', startTime: '03/20 03:18', endTime: '03/20 11:23', mode: 'auto', signal: 'arrival', status: '正在执行', baseTime: '03/20 03:23', offsetMinutes: -5 },
  { id: 'g5', screenName: '1号候车屏', startTime: '03/20 04:00', endTime: '03/20 12:00', mode: 'auto', signal: 'checkInOpen', status: '等待执行', baseTime: '03/20 04:00', offsetMinutes: 0 },
  { id: 'g6', screenName: '2号候车屏', startTime: '03/20 04:30', endTime: '03/20 12:30', mode: 'auto', signal: 'checkInOpen', status: '等待执行', baseTime: '03/20 04:30', offsetMinutes: 0 },
];

// 生成20条广播计划数据
const generateBroadcastPlans = (): BroadcastPlan[] => {
  const plans: BroadcastPlan[] = [];
  const broadcastNames = [
    'G2018次列车开始检票通知',
    'G2018次列车即将到达',
    'G2018次列车到达广播',
    'G2018次列车停止检票通知',
    'G2018次列车发车提醒',
    'G2019次列车开始检票通知',
    'G2019次列车即将到达',
    'G2019次列车到达广播',
    'D1234次列车开始检票通知',
    'D1234次列车即将到达',
    'D1234次列车停止检票通知',
    'K5678次列车开始检票通知',
    'K5678次列车到达广播',
    'K5678次列车发车提醒',
    'Z9012次列车开始检票通知',
    'Z9012次列车停止检票通知',
    'T3456次列车开始检票通知',
    'T3456次列车到达广播',
    'C7890次列车开始检票通知',
    'C7890次列车发车提醒'
  ];
  
  const signals: ('checkInOpen' | 'arrival' | 'departure')[] = ['checkInOpen', 'arrival', 'departure'];
  const statuses = ['正在播放', '等待执行', '已停止'];
  
  for (let i = 0; i < 20; i++) {
    const hour = 6 + Math.floor(i / 2);
    const minute = (i % 2) * 30 + Math.floor(Math.random() * 15);
    const timeStr = `03/20 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const mode = i % 3 === 0 ? 'manual' : 'auto';
    
    plans.push({
      id: `b${i + 1}`,
      name: broadcastNames[i],
      playTime: timeStr,
      playCount: Math.floor(Math.random() * 3) + 1,
      triggerSignal: signals[i % 3],
      mode,
      status: i === 0 ? '正在播放' : (i < 5 ? '等待执行' : statuses[i % 3]),
      baseTime: timeStr,
      offsetMinutes: 0
    });
  }
  return plans;
};

const mockBroadcastPlans: BroadcastPlan[] = generateBroadcastPlans();

export const PlanDetailDrawer: React.FC<PlanDetailDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false
}) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);
  const [activeTab, setActiveTab] = useState<'guide' | 'broadcast'>('broadcast');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewScreenName, setPreviewScreenName] = useState('');
  const [guidePlans, setGuidePlans] = useState<GuidePlan[]>(mockGuidePlans);
  const [broadcastPlans, setBroadcastPlans] = useState<BroadcastPlan[]>(mockBroadcastPlans);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set());
  
  // 广播计划筛选状态
  const [broadcastFilter, setBroadcastFilter] = useState<'all' | 'auto' | 'manual'>('all');
  
  // 广播计划搜索关键词
  const [broadcastSearch, setBroadcastSearch] = useState('');
  
  // 筛选后的广播计划
  const filteredBroadcastPlans = broadcastPlans.filter(plan => {
    // 模式筛选
    if (broadcastFilter !== 'all' && plan.mode !== broadcastFilter) return false;
    // 搜索筛选
    if (broadcastSearch && !plan.name.toLowerCase().includes(broadcastSearch.toLowerCase())) return false;
    return true;
  });

  // 编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editType, setEditType] = useState<'guide' | 'broadcast'>('guide');

  // 编辑表单状态
  const [editStartTime, setEditStartTime] = useState('');
  const [editSignal, setEditSignal] = useState<'checkInOpen' | 'arrival' | 'departure'>('checkInOpen');
  const [editBaseTime, setEditBaseTime] = useState('');
  const [editOffset, setEditOffset] = useState(0);

  // 原始值记录
  const [originalValues, setOriginalValues] = useState<any>(null);

  if (!train) return null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认关闭',
        content: '您有未保存的修改，是否继续关闭？',
        okText: '不保存关闭',
        cancelText: '取消',
        onOk: () => {
          onClose();
          resetState();
        },
        styles: getModalStyles(darkMode)
      });
    } else {
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setGuidePlans(mockGuidePlans);
    setBroadcastPlans(mockBroadcastPlans);
    setHasUnsavedChanges(false);
    setModifiedIds(new Set());
    setActiveTab('guide');
  };

  const handleReset = () => {
    setGuidePlans(mockGuidePlans);
    setBroadcastPlans(mockBroadcastPlans);
    setHasUnsavedChanges(false);
    setModifiedIds(new Set());
    message.success('已恢复默认设置');
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
    setModifiedIds(new Set());
    message.success('保存成功');
  };

  // 打开编辑弹窗
  const handleEdit = (plan: any, type: 'guide' | 'broadcast') => {
    setSelectedPlan(plan);
    setEditType(type);
    setEditStartTime(plan.startTime || plan.playTime);
    setEditSignal(plan.signal || plan.triggerSignal);
    setEditBaseTime(plan.baseTime);
    setEditOffset(plan.offsetMinutes);
    setOriginalValues({
      startTime: plan.startTime || plan.playTime,
      signal: plan.signal || plan.triggerSignal,
      baseTime: plan.baseTime,
      offsetMinutes: plan.offsetMinutes
    });
    setEditModalVisible(true);
  };

  // 处理开始时间变化
  const handleStartTimeChange = (value: string) => {
    setEditStartTime(value);
    const newOffset = calculateOffset(editBaseTime, value);
    setEditOffset(newOffset);
  };

  // 处理信号变化
  const handleSignalChange = (value: 'checkInOpen' | 'arrival' | 'departure') => {
    setEditSignal(value);
    const newBaseTime = getBaseTime(train, value);
    setEditBaseTime(newBaseTime);
    const newStartTime = calculateStartTime(newBaseTime, editOffset);
    setEditStartTime(newStartTime);
  };

  // 处理基准时间变化
  const handleBaseTimeChange = (value: string) => {
    setEditBaseTime(value);
    const newStartTime = calculateStartTime(value, editOffset);
    setEditStartTime(newStartTime);
  };

  // 处理偏移量变化
  const handleOffsetChange = (value: number) => {
    setEditOffset(value);
    const newStartTime = calculateStartTime(editBaseTime, value);
    setEditStartTime(newStartTime);
  };

  // 保存编辑
  const handleEditSave = () => {
    if (!selectedPlan) return;

    const newModifiedIds = new Set(modifiedIds);
    newModifiedIds.add(selectedPlan.id);
    setModifiedIds(newModifiedIds);
    setHasUnsavedChanges(true);

    if (editType === 'guide') {
      setGuidePlans(prev => prev.map(p =>
        p.id === selectedPlan.id
          ? { ...p, startTime: editStartTime, signal: editSignal, baseTime: editBaseTime, offsetMinutes: editOffset, isModified: true }
          : p
      ));
    } else {
      setBroadcastPlans(prev => prev.map(p =>
        p.id === selectedPlan.id
          ? { ...p, playTime: editStartTime, triggerSignal: editSignal, baseTime: editBaseTime, offsetMinutes: editOffset, isModified: true }
          : p
      ));
    }
    setEditModalVisible(false);
    message.success('修改已应用');
  };

  // 获取当前时间字符串 MM/DD HH:mm
  const getCurrentTimeString = () => {
    const now = dayjs();
    return now.format('MM/DD HH:mm');
  };

  // 验证时间顺序：开始时间必须在结束时间之前
  const validateTimeOrder = (startTime: string, endTime: string): boolean => {
    // 解析时间，格式: MM/DD HH:mm
    const [startDate, startTimePart] = startTime.split(' ');
    const [startMonth, startDay] = startDate.split('/');
    const [startHour, startMinute] = startTimePart.split(':');
    
    const [endDate, endTimePart] = endTime.split(' ');
    const [endMonth, endDay] = endDate.split('/');
    const [endHour, endMinute] = endTimePart.split(':');
    
    const start = dayjs(`2024-${startMonth}-${startDay} ${startHour}:${startMinute}`);
    const end = dayjs(`2024-${endMonth}-${endDay} ${endHour}:${endMinute}`);
    return start.isBefore(end);
  };

  // 执行上屏操作
  const handleScreenUp = (plan: GuidePlan, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTime = getCurrentTimeString();
    
    // 验证时间顺序
    if (!validateTimeOrder(currentTime, plan.endTime)) {
      message.error('开始时间必须在结束时间之前，请重新调整');
      // 标记为异常状态
      setGuidePlans(prev => prev.map(p =>
        p.id === plan.id
          ? { ...p, startTime: currentTime, status: '异常', isModified: true }
          : p
      ));
      setModifiedIds(prev => new Set(prev).add(plan.id));
      setHasUnsavedChanges(true);
      return;
    }
    
    setGuidePlans(prev => prev.map(p =>
      p.id === plan.id
        ? { ...p, startTime: currentTime, status: '正在执行', isModified: true }
        : p
    ));
    setModifiedIds(prev => new Set(prev).add(plan.id));
    setHasUnsavedChanges(true);
    message.success(`${plan.screenName} 已上屏，开始时间更新为当前时间`);
  };

  // 执行下屏操作
  const handleScreenDown = (plan: GuidePlan, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTime = getCurrentTimeString();
    
    // 验证时间顺序
    if (!validateTimeOrder(plan.startTime, currentTime)) {
      message.error('开始时间必须在结束时间之前，请重新调整');
      // 标记为异常状态
      setGuidePlans(prev => prev.map(p =>
        p.id === plan.id
          ? { ...p, endTime: currentTime, status: '异常', isModified: true }
          : p
      ));
      setModifiedIds(prev => new Set(prev).add(plan.id));
      setHasUnsavedChanges(true);
      return;
    }
    
    setGuidePlans(prev => prev.map(p =>
      p.id === plan.id
        ? { ...p, endTime: currentTime, status: '已停止', isModified: true }
        : p
    ));
    setModifiedIds(prev => new Set(prev).add(plan.id));
    setHasUnsavedChanges(true);
    message.success(`${plan.screenName} 已下屏，结束时间更新为当前时间`);
  };

  // 广播操作
  const handleBroadcastAction = (plan: BroadcastPlan, action: 'play' | 'stop', e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTime = getCurrentTimeString();
    
    if (action === 'play') {
      setBroadcastPlans(prev => prev.map(p =>
        p.id === plan.id
          ? { ...p, playTime: currentTime, status: '正在播放', isModified: true }
          : p
      ));
      setModifiedIds(prev => new Set(prev).add(plan.id));
      setHasUnsavedChanges(true);
      message.success(`${plan.name} 开始播放`);
    } else {
      setBroadcastPlans(prev => prev.map(p =>
        p.id === plan.id
          ? { ...p, status: '已停止', isModified: true }
          : p
      ));
      setModifiedIds(prev => new Set(prev).add(plan.id));
      setHasUnsavedChanges(true);
      message.success(`${plan.name} 已停止`);
    }
  };

  // 检查是否有变化
  const hasChanges = () => {
    if (!originalValues) return false;
    return (
      editStartTime !== originalValues.startTime ||
      editSignal !== originalValues.signal ||
      editBaseTime !== originalValues.baseTime ||
      editOffset !== originalValues.offsetMinutes
    );
  };

  const getStatusTag = (status: string, isModified?: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      '正在执行': { bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7', text: '#10B981', border: darkMode ? 'rgba(16, 185, 129, 0.3)' : '#86EFAC' },
      '正在播放': { bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7', text: '#10B981', border: darkMode ? 'rgba(16, 185, 129, 0.3)' : '#86EFAC' },
      '等待执行': { bg: darkMode ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE', text: '#3B82F6', border: darkMode ? 'rgba(59, 130, 246, 0.3)' : '#93C5FD' },
      '待执行': { bg: darkMode ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE', text: '#3B82F6', border: darkMode ? 'rgba(59, 130, 246, 0.3)' : '#93C5FD' },
      '已停止': { bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', text: '#EF4444', border: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5' },
      '异常': { bg: darkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', text: '#F59E0B', border: darkMode ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A' }
    };
    const color = colorMap[status] || { bg: darkMode ? 'rgba(148, 163, 184, 0.15)' : '#F3F4F6', text: darkMode ? '#94A3B8' : '#6B7280', border: darkMode ? 'rgba(148, 163, 184, 0.3)' : '#E5E7EB' };
    return (
      <Tag style={{
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 500,
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isModified && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />}
        {status}
      </Tag>
    );
  };

  const getSignalLabel = (signal: string) => {
    const option = signalOptions.find(s => s.value === signal);
    return option?.label || signal;
  };

  // 处理预览、回读、刷屏按钮点击
  const handlePreview = (plan: GuidePlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewScreenName(plan.screenName);
    setPreviewModalVisible(true);
  };

  const handleReadBack = (plan: GuidePlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewScreenName(plan.screenName);
    setPreviewModalVisible(true);
    message.success('回读成功');
  };

  const handleRefreshScreen = (plan: GuidePlan, e: React.MouseEvent) => {
    e.stopPropagation();
    message.success('刷屏成功');
  };

  // 表格行组件 - 引导计划（2行布局）
  const GuidePlanRow = ({ plan }: { plan: GuidePlan }) => (
    <div
      style={{
        ...getGuideRowStyle(darkMode),
        ...(modifiedIds.has(plan.id) ? getModifiedRowStyle(darkMode) : {})
      }}
    >
      {/* 第一行：屏名称 + 状态 + 操作（编辑、上屏、下屏） */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        {/* 屏名称（可占满剩余空间） */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Monitor size={16} color={darkMode ? '#60A5FA' : '#3B82F6'} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {plan.screenName}
          </span>
        </div>

        {/* 状态 - 垂直居中 */}
        <div style={{ marginLeft: '12px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {getStatusTag(plan.status, modifiedIds.has(plan.id))}
        </div>

        {/* 操作列 - 垂直居中（编辑、上屏、下屏） */}
        <div style={{ marginLeft: '12px', display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
          <Tooltip title="编辑">
            <button
              onClick={() => handleEdit(plan, 'guide')}
              style={getIconButtonStyle(darkMode, 'primary')}
            >
              <Edit3 size={14} />
            </button>
          </Tooltip>
          <Tooltip title="上屏">
            <button
              onClick={(e) => handleScreenUp(plan, e)}
              style={getIconButtonStyle(darkMode, 'success')}
            >
              <Play size={14} />
            </button>
          </Tooltip>
          <Tooltip title="下屏">
            <button
              onClick={(e) => handleScreenDown(plan, e)}
              style={getIconButtonStyle(darkMode, 'danger')}
            >
              <Square size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 第二行：预览、回读、刷屏按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Tooltip title="预览">
          <button
            onClick={(e) => handlePreview(plan, e)}
            style={{
              ...getIconButtonStyle(darkMode, 'primary'),
              width: 'auto',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <EyeOutlined size={14} />
            <span style={{ fontSize: '12px' }}>预览</span>
          </button>
        </Tooltip>
        <Tooltip title="回读">
          <button
            onClick={(e) => handleReadBack(plan, e)}
            style={{
              ...getIconButtonStyle(darkMode, 'success'),
              width: 'auto',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={14} />
            <span style={{ fontSize: '12px' }}>回读</span>
          </button>
        </Tooltip>
        <Tooltip title="刷屏">
          <button
            onClick={(e) => handleRefreshScreen(plan, e)}
            style={{
              ...getIconButtonStyle(darkMode, 'primary'),
              width: 'auto',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={14} />
            <span style={{ fontSize: '12px' }}>刷屏</span>
          </button>
        </Tooltip>
      </div>

      {/* 第三行：开始时间 + 结束时间 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 开始时间 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#FFFFFF',
            background: plan.mode === 'auto' ? '#10B981' : '#F59E0B',
            padding: '2px 6px',
            borderRadius: '4px',
            minWidth: '20px',
            textAlign: 'center'
          }}>开</span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: plan.mode === 'auto'
                ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5')
                : (darkMode ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7'),
              border: `1px solid ${plan.mode === 'auto'
                ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : '#A7F3D0')
                : (darkMode ? 'rgba(245, 158, 11, 0.2)' : '#FDE68A')}`
            }}
          >
            <Clock size={12} color={plan.mode === 'auto' ? '#10B981' : '#F59E0B'} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: plan.mode === 'auto' ? '#10B981' : '#F59E0B', whiteSpace: 'nowrap' }}>
              {plan.startTime}
            </span>
          </div>
        </div>

        {/* 结束时间 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#FFFFFF',
            background: '#64748B',
            padding: '2px 6px',
            borderRadius: '4px',
            minWidth: '20px',
            textAlign: 'center'
          }}>结</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: darkMode ? '#E2E8F0' : '#374151', whiteSpace: 'nowrap' }}>
            {plan.endTime}
          </span>
        </div>
      </div>
    </div>
  );

  const BroadcastPlanRow = ({ plan, index }: { plan: BroadcastPlan; index: number }) => (
    <div
      style={{
        ...getRowStyle(darkMode),
        ...(modifiedIds.has(plan.id) ? getModifiedRowStyle(darkMode) : {})
      }}
    >
      {/* 序号 */}
      <div style={{ 
        width: '28px', 
        flexShrink: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: '8px'
      }}>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          color: darkMode ? '#64748B' : '#9CA3AF',
          background: darkMode ? 'rgba(100, 116, 139, 0.2)' : '#F1F5F9',
          padding: '2px 6px',
          borderRadius: '4px',
          minWidth: '24px',
          textAlign: 'center'
        }}>
          {index + 1}
        </span>
      </div>

      {/* 广播词 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Volume2 size={14} color={darkMode ? '#60A5FA' : '#3B82F6'} />
        <span style={{ fontSize: '13px', fontWeight: 500, color: darkMode ? '#E2E8F0' : '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {plan.name}
        </span>
      </div>

      {/* 播放时间 - 手动黄色自动绿色，不换行 */}
      <div style={{ flexShrink: 0, marginLeft: '12px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: plan.mode === 'auto'
              ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7')
              : (darkMode ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7'),
            border: `1px solid ${plan.mode === 'auto'
              ? (darkMode ? 'rgba(16, 185, 129, 0.3)' : '#86EFAC')
              : (darkMode ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A')}`,
            whiteSpace: 'nowrap'
          }}
        >
          <Clock size={12} color={plan.mode === 'auto' ? '#10B981' : '#F59E0B'} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: plan.mode === 'auto' ? '#10B981' : '#F59E0B', whiteSpace: 'nowrap' }}>
            {plan.playTime}
          </span>
        </div>
      </div>

      {/* 次数 */}
      <div style={{ width: '50px', flexShrink: 0, textAlign: 'center', marginLeft: '12px' }}>
        <span style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#6B7280' }}>{plan.playCount}次</span>
      </div>

      {/* 状态 - 垂直居中 */}
      <div style={{ width: '90px', flexShrink: 0, marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
        {getStatusTag(plan.status, modifiedIds.has(plan.id))}
      </div>

      {/* 操作列 - 垂直居中，去掉编辑 */}
      <div style={{ flexShrink: 0, marginLeft: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Tooltip title="播放">
          <button
            onClick={(e) => handleBroadcastAction(plan, 'play', e)}
            style={getIconButtonStyle(darkMode, 'success')}
          >
            <Play size={14} />
          </button>
        </Tooltip>
        <Tooltip title="停止">
          <button
            onClick={(e) => handleBroadcastAction(plan, 'stop', e)}
            style={getIconButtonStyle(darkMode, 'danger')}
          >
            <Square size={14} />
          </button>
        </Tooltip>
      </div>
    </div>
  );



  const BroadcastTableHeader = () => (
    <div style={getHeaderRowStyle(darkMode)}>
      <span style={{ ...getHeaderCellStyle(darkMode), flex: 1, minWidth: 0 }}>广播词</span>
      <span style={{ ...getHeaderCellStyle(darkMode), width: '80px', flexShrink: 0 }}>播放时间</span>
      <span style={{ ...getHeaderCellStyle(darkMode), width: '50px', flexShrink: 0, textAlign: 'center' }}>次数</span>
      <span style={{ ...getHeaderCellStyle(darkMode), width: '90px', flexShrink: 0 }}>状态</span>
      <span style={{ ...getHeaderCellStyle(darkMode), width: '100px', flexShrink: 0, textAlign: 'right' }}>操作</span>
    </div>
  );

  return (
    <>
      {/* 抽屉面板 - Web应用风格 */}
      <Drawer
        title={null}
        placement="right"
        onClose={handleClose}
        open={visible}
        width={700}
        styles={{
          header: { display: 'none' },
          body: { padding: 0, background: darkMode ? '#0f172a' : '#f8fafc' },
          mask: { background: 'rgba(0, 0, 0, 0.45)' }
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Web应用风格标题栏 */}
          <div style={getWebHeaderStyle(darkMode)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1e293b' }}>
                旅服计划
              </span>
              {hasUnsavedChanges && (
                <span style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  background: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B',
                  border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                }}>
                  未保存
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={getTrainBadgeStyle(darkMode)}>{train.trainNo}</div>
              <button onClick={handleClose} style={getCloseBtnStyle(darkMode)}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Tab切换 */}
            <div style={getTabContainerStyle(darkMode)}>
              <button
                onClick={() => setActiveTab('guide')}
                style={{
                  ...getTabBtnStyle(darkMode),
                  ...(activeTab === 'guide' ? getActiveTabStyle(darkMode) : {})
                }}
              >
                <Monitor size={16} style={{ marginRight: '6px' }} />
                引导计划
              </button>
              <button
                onClick={() => setActiveTab('broadcast')}
                style={{
                  ...getTabBtnStyle(darkMode),
                  ...(activeTab === 'broadcast' ? getActiveTabStyle(darkMode) : {})
                }}
              >
                <Volume2 size={16} style={{ marginRight: '6px' }} />
                广播计划
              </button>
            </div>

            {/* 广播计划筛选和搜索 */}
            {activeTab === 'broadcast' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setBroadcastFilter('all')}
                  style={{
                    ...getFilterBtnStyle(darkMode),
                    ...(broadcastFilter === 'all' ? getActiveFilterBtnStyle(darkMode) : {})
                  }}
                >
                  全部
                </button>
                <button
                  onClick={() => setBroadcastFilter('auto')}
                  style={{
                    ...getFilterBtnStyle(darkMode),
                    ...(broadcastFilter === 'auto' ? getActiveFilterBtnStyle(darkMode) : {})
                  }}
                >
                  自动
                </button>
                <button
                  onClick={() => setBroadcastFilter('manual')}
                  style={{
                    ...getFilterBtnStyle(darkMode),
                    ...(broadcastFilter === 'manual' ? getActiveFilterBtnStyle(darkMode) : {})
                  }}
                >
                  手动
                </button>
                <Input
                  placeholder="搜索广播词..."
                  value={broadcastSearch}
                  onChange={(e) => setBroadcastSearch(e.target.value)}
                  style={{
                    flex: 1,
                    marginLeft: '8px',
                    background: darkMode ? 'rgba(0,0,0,0.2)' : '#ffffff',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    color: darkMode ? '#E2E8F0' : '#1F2937',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                  prefix={<span style={{ color: darkMode ? '#64748B' : '#9CA3AF', marginLeft: '8px' }}>🔍</span>}
                />
              </div>
            )}

            {/* 表格 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'guide' && (
                <>
                  {guidePlans.map(plan => <GuidePlanRow key={plan.id} plan={plan} />)}
                </>
              )}
              {activeTab === 'broadcast' && (
                <>
                  {filteredBroadcastPlans.map((plan, index) => <BroadcastPlanRow key={plan.id} plan={plan} index={index} />)}
                </>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* 编辑弹窗 */}
      <Modal
        title={<span style={{ fontSize: '15px', fontWeight: 600 }}>编辑计划时间</span>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        width={420}
        footer={null}
        centered
        maskClosable={false}
        closeIcon={<X size={18} />}
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' },
          header: { 
            background: darkMode ? 'linear-gradient(180deg, #2D3748 0%, #1E293B 100%)' : 'linear-gradient(180deg, #F7F8FA 0%, #E8E8E8 100%)',
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            padding: '16px 20px'
          },
          content: { 
            background: darkMode ? '#1E293B' : '#FFFFFF',
            padding: 0,
            borderRadius: '12px',
            boxShadow: darkMode
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          },
          body: { padding: '24px', background: darkMode ? '#1E293B' : '#FFFFFF' }
        }}
      >
        {/* 弹窗内容 */}
        <div>
          {/* 开始时间 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={getEditFormLabelStyle(darkMode)}>
              <Clock size={14} style={{ marginRight: '6px' }} />
              开始时间
              {hasChanges() && editStartTime !== originalValues?.startTime && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>已修改</span>
              )}
            </label>
            <Input
              value={editStartTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              placeholder="MM/DD HH:mm"
              style={getEditInputStyle(darkMode)}
            />
          </div>

          {/* 触发信号 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={getEditFormLabelStyle(darkMode)}>
              <Radio size={14} style={{ marginRight: '6px' }} />
              触发信号
              {hasChanges() && editSignal !== originalValues?.signal && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>已修改</span>
              )}
            </label>
            <Select
              value={editSignal}
              onChange={handleSignalChange}
              style={{ width: '100%', fontSize: '16px', fontWeight: 600, color: '#1890ff' }}
              size="large"
              dropdownStyle={{ background: darkMode ? '#1E293B' : '#FFFFFF', borderRadius: '8px' }}
              optionLabelProp="label"
            >
              {signalOptions.map(opt => (
                <Option key={opt.value} value={opt.value} label={opt.label}>
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#E2E8F0' : '#1F2937', lineHeight: '1.5' }}>{opt.label}</span>
                    <span style={{ fontSize: '12px', color: darkMode ? '#64748B' : '#9CA3AF', lineHeight: '1.5' }}>{opt.desc}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {/* 偏移量 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={getEditFormLabelStyle(darkMode)}>
              <Clock size={14} style={{ marginRight: '6px' }} />
              相对基准（分钟）
              {hasChanges() && editOffset !== originalValues?.offsetMinutes && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>已修改</span>
              )}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="range"
                min="-60"
                max="60"
                value={editOffset}
                onChange={(e) => handleOffsetChange(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: '#3B82F6', height: '6px' }}
              />
              <Input
                type="number"
                value={editOffset}
                onChange={(e) => handleOffsetChange(parseInt(e.target.value) || 0)}
                style={{ ...getEditInputStyle(darkMode), width: '90px', textAlign: 'center' }}
              />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: darkMode ? '#64748B' : '#9CA3AF' }}>
              负值表示提前，正值表示延后
            </div>
          </div>

          {/* 按钮组 */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditModalVisible(false)}
              style={getEditCancelBtnStyle(darkMode)}
            >
              取消
            </button>
            <button
              onClick={handleEditSave}
              style={getEditSaveBtnStyle(darkMode)}
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      {/* 预览/回读弹窗 */}
      <Modal
        title={<span style={{ fontSize: '15px', fontWeight: 600 }}>{previewScreenName} - 实际显示效果</span>}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={500}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
        centered
        styles={{
          mask: { background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' },
          header: { 
            background: darkMode ? 'linear-gradient(180deg, #2D3748 0%, #1E293B 100%)' : 'linear-gradient(180deg, #F7F8FA 0%, #E8E8E8 100%)',
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          },
          content: { 
            background: darkMode ? '#1E293B' : '#FFFFFF',
            borderRadius: '12px',
            boxShadow: darkMode
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          },
          body: { padding: '24px', background: darkMode ? '#1E293B' : '#FFFFFF' }
        }}
      >
        {/* 模拟屏显效果 */}
        <div style={{
          background: darkMode ? '#0f172a' : '#1f2937',
          padding: '32px',
          borderRadius: '12px',
          border: `2px solid ${darkMode ? '#334155' : '#374151'}`,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#fbbf24',
            fontSize: '48px',
            fontWeight: 700,
            letterSpacing: '4px',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
            marginBottom: '16px'
          }}>
            G1234
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '16px'
          }}>
            <div style={{
              color: '#60a5fa',
              fontSize: '24px',
              fontWeight: 600
            }}>
              3车
            </div>
            <div style={{
              color: '#a78bfa',
              fontSize: '20px',
              fontWeight: 600
            }}>
              北京西→郑州东
            </div>
            <div style={{
              color: '#34d399',
              fontSize: '20px',
              fontWeight: 600
            }}>
              10:30开
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '18px',
            fontWeight: 500
          }}>
            请在黄色地标排队等候
          </div>
        </div>
      </Modal>
    </>
  );
};

// Web应用风格样式
const getWebHeaderStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '16px 20px',
  background: darkMode ? '#1e293b' : '#ffffff',
  borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const getTrainBadgeStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
  padding: '4px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#F59E0B',
  border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
});

const getCloseBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: 'none',
  background: darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
  color: darkMode ? '#94A3B8' : '#64748B',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const getTabContainerStyle = (darkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  gap: '8px',
  padding: '4px',
  background: darkMode ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
  borderRadius: '8px'
});

const getTabBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px 16px',
  borderRadius: '6px',
  border: 'none',
  background: 'transparent',
  color: darkMode ? '#94A3B8' : '#64748B',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
});

const getActiveTabStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? '#3B82F6' : '#ffffff',
  color: darkMode ? '#ffffff' : '#1e293b',
  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)'
});

const getFilterBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '6px 16px',
  borderRadius: '6px',
  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`,
  background: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
  color: darkMode ? '#94A3B8' : '#64748B',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const getActiveFilterBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? '#3B82F6' : '#3B82F6',
  color: '#ffffff',
  border: '1px solid #3B82F6'
});

const getHeaderRowStyle = (darkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#ffffff',
  borderRadius: '8px',
  marginBottom: '8px',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid #e2e8f0'
});

const getHeaderCellStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 600,
  color: darkMode ? '#94A3B8' : '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
});

const getRowStyle = (darkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  padding: '14px 16px',
  background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#ffffff',
  borderRadius: '8px',
  marginBottom: '8px',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.15)' : '1px solid #e2e8f0',
  transition: 'all 0.2s'
});

const getGuideRowStyle = (darkMode: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 16px',
  background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#ffffff',
  borderRadius: '8px',
  marginBottom: '8px',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.15)' : '1px solid #e2e8f0',
  transition: 'all 0.2s'
});

const getModifiedRowStyle = (darkMode: boolean): React.CSSProperties => ({
  border: `2px solid ${darkMode ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.6)'}`,
  background: darkMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)'
});

const getIconButtonStyle = (darkMode: boolean, variant: 'primary' | 'success' | 'danger'): React.CSSProperties => {
  const colors = {
    primary: { bg: darkMode ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', color: '#3B82F6', border: darkMode ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' },
    success: { bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5', color: '#10B981', border: darkMode ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0' },
    danger: { bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2', color: '#EF4444', border: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#FECACA' }
  };
  const color = colors[variant];
  return {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: `1px solid ${color.border}`,
    background: color.bg,
    color: color.color,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  };
};

// macOS风格弹窗样式
const getMacModalContainerStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? '#1E293B' : '#FFFFFF',
  borderRadius: '12px',
  boxShadow: darkMode
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden'
});

const getMacTitleBarStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '14px 16px',
  background: darkMode
    ? 'linear-gradient(180deg, #2D3748 0%, #1E293B 100%)'
    : 'linear-gradient(180deg, #F7F8FA 0%, #E8E8E8 100%)',
  borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const getMacFormLabelStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: 600,
  color: darkMode ? '#94A3B8' : '#6B7280',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center'
});

const getMacInputStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? 'rgba(0, 0, 0, 0.2)' : '#F8FAFC',
  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
  borderRadius: '8px',
  color: darkMode ? '#E2E8F0' : '#1F2937',
  padding: '10px 14px',
  fontSize: '14px'
});

const getMacCancelBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
  color: darkMode ? '#E2E8F0' : '#374151',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const getMacSaveBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#3B82F6',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.2s'
});

const getModalStyles = (darkMode: boolean) => ({
  header: { background: darkMode ? '#1E293B' : '#FFFFFF', color: darkMode ? '#E2E8F0' : '#1F2937', borderBottom: darkMode ? '1px solid #334155' : '1px solid #E2E8F0' },
  body: { background: darkMode ? '#1E293B' : '#FFFFFF', padding: '20px' },
  footer: { background: darkMode ? '#1E293B' : '#FFFFFF', borderTop: darkMode ? '1px solid #334155' : '1px solid #E2E8F0' }
});

// 编辑弹窗样式
const getEditModalContainerStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? '#1E293B' : '#FFFFFF',
  borderRadius: '12px',
  boxShadow: darkMode
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden'
});

const getEditModalHeaderStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '16px 20px',
  background: darkMode
    ? 'linear-gradient(180deg, #2D3748 0%, #1E293B 100%)'
    : 'linear-gradient(180deg, #F7F8FA 0%, #E8E8E8 100%)',
  borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const getEditFormLabelStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: 600,
  color: darkMode ? '#94A3B8' : '#6B7280',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center'
});

const getEditInputStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode ? 'rgba(0, 0, 0, 0.2)' : '#F8FAFC',
  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
  borderRadius: '8px',
  color: darkMode ? '#E2E8F0' : '#1F2937',
  padding: '10px 14px',
  fontSize: '14px'
});

const getEditCancelBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
  color: darkMode ? '#E2E8F0' : '#374151',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const getEditSaveBtnStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#3B82F6',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.2s'
});
