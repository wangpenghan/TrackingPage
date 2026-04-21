/**
 * @name 代管盯控 v9
 *
 * 火车文化主题的图形化监控页面
 * 融入铁路元素、蒸汽朋克风格和现代高铁美学
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button, Tag, Tooltip, Checkbox, Popover, Slider, Modal } from 'antd';
import {
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  ClockCircleOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  TrainFront,
  ArrowRight,
  Droplets,
  Trash2,
  Ticket,
  DoorOpen,
  Timer,
  Train,
  Activity,
  BarChart3,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { TrainData, Connection, TrainTask } from './types';
import './style.css';

// ============ 类型定义 ============
type TaskType = '检票' | '站台' | '出站' | '上水' | '吸污';
type TaskStatus = 'pending' | 'running' | 'completed' | 'error';

interface StationRowConfig {
  id: string;
  name: string;
  color: string;
  stationName?: string;
}

// ============ 站点行配置 ============
const stationRows: StationRowConfig[] = [
  {
    id: 'yuxia',
    name: '渝厦高铁场',
    color: '#3b82f6',
    stationName: '重庆东'
  },
  {
    id: 'donghuan',
    name: '东环城际场',
    color: '#ef4444',
    stationName: '重庆东'
  },
  {
    id: 'banan',
    name: '巴南',
    color: '#10b981'
  },
  {
    id: 'nanchuanbei',
    name: '南川北',
    color: '#f59e0b'
  },
  {
    id: 'shuijiangxi',
    name: '水江西',
    color: '#8b5cf6'
  }
];

// ============ 地标颜色规则 ============
const getPlatformColor = (count: 8 | 16, sequence: '正' | '倒', line: '上' | '下'): string => {
  if (count === 16) {
    return sequence === '正' ? '#eab308' : '#22c55e';
  } else {
    if (sequence === '正') {
      return line === '上' ? '#3b82f6' : '#eab308';
    } else {
      return line === '上' ? '#22c55e' : '#7c3aed';
    }
  }
};

// ============ 作业状态颜色 ============
const STATUS_BUTTON_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  pending: { bg: '#F5F5F5', text: '#1D1D1F' },
  running: { bg: '#A5D6A7', text: '#1D1D1F' },
  completed: { bg: '#90CAF9', text: '#1D1D1F' },
  error: { bg: '#EF9A9A', text: '#1D1D1F' },
};

// ============ 生成模拟数据 ============
const generateMockData = (): Map<string, TrainData[]> => {
  const trainsByStation = new Map<string, TrainData[]>();
  const taskTypes: TaskType[] = ['检票', '站台', '出站', '上水', '吸污'];
  
  const routes = [
    ['重庆东', '成都东'], ['重庆东', '贵阳北'], ['成都东', '重庆东'],
    ['巴南', '南川北'], ['南川北', '水江西'], ['水江西', '巴南'],
    ['重庆东', '武汉'], ['武汉', '重庆东']
  ];

  stationRows.forEach((station, stationIdx) => {
    const trains: TrainData[] = [];
    const trainCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < trainCount; i++) {
      const trainType = ['G', 'D', 'C'][Math.floor(Math.random() * 3)] as 'G' | 'D' | 'C';
      const [from, to] = routes[Math.floor(Math.random() * routes.length)];
      
      const baseHour = 8 + i * 2;
      const baseMinute = Math.floor(Math.random() * 50);
      const arrivalTime = `${String(baseHour).padStart(2, '0')}:${String(baseMinute).padStart(2, '0')}`;
      const stopMinutes = 8 + Math.floor(Math.random() * 10);
      const departureMinute = (baseMinute + stopMinutes) % 60;
      const departureHour = baseHour + Math.floor((baseMinute + stopMinutes) / 60);
      const departureTime = `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`;
      
      const taskCount = 3 + Math.floor(Math.random() * 3);
      const selectedTasks = [...taskTypes].slice(0, taskCount);
      const tasks: TrainTask[] = selectedTasks.map((type, idx) => {
        const rand = Math.random();
        let status: TaskStatus;
        if (rand < 0.7) status = 'completed';
        else if (rand < 0.85) status = 'running';
        else if (rand < 0.95) status = 'pending';
        else status = 'error';
        
        return {
          id: `task-${stationIdx}-${i}-${idx}`,
          type,
          status,
          progress: status === 'running' ? Math.floor(Math.random() * 60) + 20 : undefined
        };
      });
      
      const formationCount: 8 | 16 = Math.random() > 0.5 ? 16 : 8;
      const sequenceType: '正' | '倒' = Math.random() > 0.5 ? '正' : '倒';
      const lineDirection: '上' | '下' = Math.random() > 0.5 ? '上' : '下';
      const stopTypes: ('origin' | 'transit' | 'destination')[] = ['origin', 'transit', 'destination'];
      const serviceType = stopTypes[Math.floor(Math.random() * 3)];
      
      trains.push({
        id: `train-${stationIdx}-${i}`,
        trainNo: `${trainType}${100 + Math.floor(Math.random() * 900)}`,
        trainType,
        arrivalTime,
        departureTime,
        track: String(Math.floor(Math.random() * 8) + 1),
        delayMinutes: Math.random() > 0.9 ? Math.floor(Math.random() * 10) : 0,
        stopMinutes,
        from,
        to,
        tasks,
        formationCount,
        sequenceType,
        lineDirection,
        serviceType,
        direction: lineDirection === '上' ? 'up' : 'down',
        panelId: station.id,
        workStatus: tasks[0]?.status === 'completed' ? 'completed' : tasks[0]?.status === 'running' ? 'executing' : tasks[0]?.status === 'error' ? 'abnormal' : 'notExecuted',
        runningSection: { from, to },
        passengerFlow: {
          boarding: 200 + Math.floor(Math.random() * 300),
          alighting: 150 + Math.floor(Math.random() * 200),
          transfer: 50 + Math.floor(Math.random() * 100)
        },
        trainMaster: `张${stationIdx}${i}`,
        tags: {
          water: tasks.some(t => t.type === '上水'),
          sewage: tasks.some(t => t.type === '吸污'),
          parcel: Math.random() > 0.7,
          meal: Math.random() > 0.8,
          overnight: Math.random() > 0.9,
          turnaround: Math.random() > 0.85,
          overcrowd: Math.random() > 0.9,
          special: Math.random() > 0.95,
          checkInReady: Math.random() > 0.5
        },
        status: 'normal'
      });
    }
    
    trains.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    trainsByStation.set(station.id, trains);
  });
  
  return trainsByStation;
};

// ============ 车次卡片组件 ============
const TrainCardComponent = ({ 
  train, 
  left, 
  width, 
  top, 
  isSelected,
  onSelect,
  isDark
}: { 
  train: TrainData; 
  left: number; 
  width: number;
  top: number;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // 是否有异常
  const hasAbnormal = train.delayMinutes > 0 || train.status !== 'normal';

  // 处理悬停状态
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 获取作业标签颜色
  const getTaskColor = (type: TaskType) => {
    switch (type) {
      case '检票':
        return { bg: '#4caf50', text: 'white' };
      case '站台':
        return { bg: '#4caf50', text: 'white' };
      case '出站':
        return { bg: '#2196f3', text: 'white' };
      case '上水':
        return { bg: '#f44336', text: 'white' };
      case '吸污':
        return { bg: '#2196f3', text: 'white' };
      default:
        return { bg: '#9e9e9e', text: 'white' };
    }
  };

  return (
    <div
      className="train-card-wrapper-new"
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        position: 'absolute',
        left: `${left}px`, 
        top: `${top}px`,
        width: '200px', 
        height: '140px',
        zIndex: isSelected || isHovered ? 100 : 1,
        opacity: 1,
        transform: isSelected || isHovered ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
    >
      {/* 卡片主体 */}
      <div
        className="train-card-main"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: '#e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          border: '2px solid #bdbdbd'
        }}
      >
        {/* 顶部车次号和编组信息 */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* 车次号 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              padding: '4px 12px',
              borderRadius: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {train.trainNo}
            </span>
          </div>

          {/* 编组信息 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>倒</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {train.lineDirection}
            </span>
          </div>
        </div>

        {/* 运行区段 */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '12px',
            right: '12px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'left'
          }}
        >
          {train.runningSection?.from}→{train.runningSection?.to}
        </div>

        {/* 时间信息区域 */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* 到达和出发时间 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {train.arrivalTime}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {train.departureTime}
            </span>
          </div>
          
          {/* 轨道信息 */}
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
            {train.track}
          </span>
        </div>

        {/* 作业标签 */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          {train.tasks.map((task, idx) => {
            const taskColor = getTaskColor(task.type);

            return (
              <div
                key={idx}
                style={{
                  background: taskColor.bg,
                  color: taskColor.text,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {task.type}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============ 主页面组件 ============
const Component: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [trainsByStation] = useState<Map<string, TrainData[]>>(() => generateMockData());
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [configVisible, setConfigVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollLeft, setScrollLeft] = useState(0);
  const [pixelsPerMinute, setPixelsPerMinute] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  
  // 鼠标拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const startHour = 6;
  const endHour = 24;
  const leftPanelWidth = 150;
  const totalWidth = (endHour - startHour) * 60 * pixelsPerMinute;
  
  const isDark = theme === 'dark';

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const heights: Record<string, number> = {};
    stationRows.forEach(station => {
      const trains = trainsByStation.get(station.id) || [];
      heights[station.id] = calculateRowHeight(trains);
    });
    setRowHeights(heights);
  }, [trainsByStation]);

  const timeToPixels = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h * 60 + m - startHour * 60) * pixelsPerMinute;
  };

  const durationToPixels = (arrival: string, departure: string) => {
    const [arrH, arrM] = arrival.split(':').map(Number);
    const [depH, depM] = departure.split(':').map(Number);
    return ((depH * 60 + depM) - (arrH * 60 + arrM)) * pixelsPerMinute;
  };

  const calculateRowHeight = (trains: TrainData[]): number => {
    const sortedTrains = [...trains].sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    const rowEndTimes: number[] = [];
    
    sortedTrains.forEach(train => {
      const [arrH, arrM] = train.arrivalTime.split(':').map(Number);
      const [depH, depM] = train.departureTime.split(':').map(Number);
      const start = arrH * 60 + arrM;
      const end = depH * 60 + depM;
      
      let placedRow = -1;
      for (let i = 0; i < rowEndTimes.length; i++) {
        if (rowEndTimes[i] + 5 <= start) {
          placedRow = i;
          break;
        }
      }
      
      if (placedRow === -1) {
        rowEndTimes.push(end);
      } else {
        rowEndTimes[placedRow] = end;
      }
    });
    
    return Math.max(rowEndTimes.length, 1) * 160;
  };

  const getTrainPositions = (trains: TrainData[]) => {
    const sortedTrains = [...trains].sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    const rows: { train: TrainData; row: number }[] = [];
    const rowEndTimes: number[] = [];
    
    sortedTrains.forEach(train => {
      const [arrH, arrM] = train.arrivalTime.split(':').map(Number);
      const [depH, depM] = train.departureTime.split(':').map(Number);
      const start = arrH * 60 + arrM;
      const end = depH * 60 + depM;
      
      let placedRow = -1;
      for (let i = 0; i < rowEndTimes.length; i++) {
        if (rowEndTimes[i] + 5 <= start) {
          placedRow = i;
          break;
        }
      }
      
      if (placedRow === -1) {
        placedRow = rowEndTimes.length;
        rowEndTimes.push(end);
      } else {
        rowEndTimes[placedRow] = end;
      }
      
      rows.push({ train, row: placedRow });
    });
    
    return rows;
  };

  // 鼠标滚轮处理
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY !== 0) {
      setScrollLeft(prev => Math.max(0, Math.min(totalWidth - 800, prev + e.deltaY * 0.5)));
    }
  }, [totalWidth]);

  // 鼠标拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, .train-card')) return;
    
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartScroll(scrollLeft);
    e.preventDefault();
  }, [scrollLeft]);

  // 鼠标拖拽移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const newScrollLeft = Math.max(0, Math.min(totalWidth - 800, dragStartScroll - deltaX));
    setScrollLeft(newScrollLeft);
  }, [isDragging, dragStartX, dragStartScroll, totalWidth]);

  // 鼠标拖拽结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 鼠标离开区域
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const timeLineLeft = (currentMinutes - startHour * 60) * pixelsPerMinute - scrollLeft;

  return (
    <div 
      ref={containerRef}
      className="monitoring-page"
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: isDark ? '#0f172a' : '#f8fafc'
      }}
    >
      {/* 顶部工具栏 */}
      <header style={{
        flexShrink: 0,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
        background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          padding: '0 20px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
            }}>
              <TrainFront size={20} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: isDark ? '#fff' : '#1e293b' }}>代管盯控</h1>
              <p style={{ margin: 0, fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>甘特图风格</p>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '10px',
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <SearchOutlined style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="搜索车次..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                width: '120px',
                color: isDark ? '#fff' : '#334155'
              }}
            />
          </div>
          
          {/* 缩放控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setPixelsPerMinute(prev => Math.max(prev - 0.5, 2))}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer'
              }}
            >
              <ZoomOutOutlined style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }} />
            </button>
            <span style={{ 
              width: '80px', 
              textAlign: 'center', 
              fontSize: '13px', 
              fontFamily: 'monospace',
              color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b'
            }}>
              {pixelsPerMinute.toFixed(1)} px/分
            </span>
            <button 
              onClick={() => setPixelsPerMinute(prev => Math.min(prev + 0.5, 12))}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer'
              }}
            >
              <ZoomInOutlined style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }} />
            </button>
            <button 
              onClick={() => { setPixelsPerMinute(5); setScrollLeft(0); }}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              <ReloadOutlined style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }} />
            </button>
          </div>
          
          {/* 时间和主题切换 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
            }}>
              <ClockCircleOutlined style={{ color: '#06b6d4' }} />
              <span style={{ 
                fontSize: '15px', 
                fontFamily: 'monospace', 
                fontWeight: 600,
                color: isDark ? '#fff' : '#334155'
              }}>
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <Tooltip title={isDark ? '浅色模式' : '深色模式'}>
              <button 
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isDark ? '#fbbf24' : '#6366f1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isDark ? <SunOutlined style={{ color: '#fff' }} /> : <MoonOutlined style={{ color: '#fff' }} />}
              </button>
            </Tooltip>
            
            <Tooltip title="设置">
              <button 
                onClick={() => setConfigVisible(true)}
                style={{
                  padding: '8px',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                  cursor: 'pointer'
                }}
              >
                <SettingOutlined style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }} />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>
      
      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧站点列表 */}
        <div 
          style={{
            flexShrink: 0,
            width: `${leftPanelWidth}px`,
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}
        >
          {/* 站点列表头部 */}
          <div style={{
            height: '40px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>站点</span>
          </div>
          
          {/* 站点行 */}
          <div style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
            {stationRows.map(station => {
              const rowHeight = rowHeights[station.id] || 150;
              const displayName = station.stationName 
                ? `${station.stationName} ${station.name}`
                : station.name;
              
              return (
                <div 
                  key={station.id}
                  style={{
                    height: `${rowHeight}px`,
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px'
                  }}
                >
                  <div 
                    style={{
                      width: '4px',
                      height: '28px',
                      borderRadius: '2px',
                      backgroundColor: station.color,
                      marginRight: '12px'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {station.stationName && (
                      <span style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                        {station.stationName}
                      </span>
                    )}
                    <span style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#fff' : '#334155' }}>
                      {station.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 右侧甘特图区域 */}
        <div 
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* 时间刻度行 */}
          <div style={{
            height: '40px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                position: 'relative', 
                height: '100%', 
                width: `${totalWidth}px`,
                transform: `translateX(-${scrollLeft}px)`
              }}
            >
              {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
                <div 
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${i * 60 * pixelsPerMinute}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{
                    width: '1px',
                    height: '100%',
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                  }} />
                  <span style={{
                    position: 'absolute',
                    left: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8'
                  }}>
                    {String(startHour + i).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 甘特图内容 */}
          <div style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
            <div style={{ position: 'relative', width: `${totalWidth}px` }}>
              {stationRows.map(station => {
                const trains = trainsByStation.get(station.id) || [];
                const positions = getTrainPositions(trains);
                const rowHeight = rowHeights[station.id] || 150;
                
                return (
                  <div 
                    key={station.id}
                    style={{
                      position: 'relative',
                      height: `${rowHeight}px`,
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                      overflow: 'hidden'
                    }}
                  >
                    {/* 网格背景 */}
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        transform: `translateX(-${scrollLeft}px)`
                      }}
                    >
                      {Array.from({ length: endHour - startHour }).map((_, i) => (
                        <div 
                          key={i}
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                            left: `${i * 60 * pixelsPerMinute}px`
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* 车次卡片 */}
                    {positions.map(({ train, row }) => (
                      <TrainCardComponent 
                        key={train.id} 
                        train={train}
                        left={timeToPixels(train.arrivalTime) - scrollLeft}
                        width={Math.max(durationToPixels(train.arrivalTime, train.departureTime), 220)}
                        top={row * 160 + 10}
                        isSelected={selectedTrainId === train.id}
                        onSelect={() => setSelectedTrainId(selectedTrainId === train.id ? null : train.id)}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                );
              })}
              
              {/* 当前时间线 */}
              {timeLineLeft >= 0 && timeLineLeft <= totalWidth && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: '#ef4444',
                    left: `${timeLineLeft}px`,
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 配置弹窗 */}
      <Modal
        open={configVisible}
        title="监控配置"
        onCancel={() => setConfigVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigVisible(false)}>取消</Button>,
          <Button key="ok" type="primary" onClick={() => setConfigVisible(false)}>确定</Button>
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>站点配置</h4>
          {stationRows.map(station => (
            <div 
              key={station.id}
              style={{
                marginBottom: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: station.color
                  }}
                />
                <span style={{ color: isDark ? '#fff' : '#334155' }}>
                  {station.stationName ? `${station.stationName} ${station.name}` : station.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* 脉冲动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default Component;
