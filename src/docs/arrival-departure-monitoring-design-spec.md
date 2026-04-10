# 到发盯控页面设计规范

## 页面概述

**页面名称**: 到发盯控  
**所属模块**: 综合指挥  
**功能描述**: 实时监控列车到发情况，支持多站盯控模式，展示列车运行状态、作业进度、设备状态等信息，并提供异常作业提醒功能。

---

## 布局结构

### 整体布局
```
┌─────────────────────────────────────────┐
│  AbnormalAlertPanel (异常提醒面板)       │
├─────────────────────────────────────────┤
│  FilterBar (筛选工具栏)                  │
├─────────────────────────────────────────┤
│                                         │
│  TrainTable (列车卡片网格)               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │  1  │ │  2  │ │  3  │ │  4  │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
└─────────────────────────────────────────┘
```

### 响应式断点

| 断点 | 网格列数(标准) | 网格列数(简洁) |
|------|---------------|---------------|
| < 640px | 1 | 1 |
| 641-1024px | 2 | 2 |
| 1025-1440px | 3 | 4 |
| > 1440px | 4 | 5 |

---

## 颜色系统

### 浅色模式
```css
--bg-page: #f0f2f5
--bg-card: #ffffff
--bg-header: linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)
--text-primary: #1f2937
--text-secondary: #6b7280
--border-color: #e5e7eb
--primary: #3b82f6
```

### 深色模式
```css
--bg-page: #0f172a
--bg-card: #1e293b
--bg-header: linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)
--text-primary: #e2e8f0
--text-secondary: #94a3b8
--border-color: #334155
--primary: #60a5fa
```

### 车次类型颜色
| 类型 | 背景色 | 文字色 |
|------|--------|--------|
| cyan (动车) | #0891b2 | #ffffff |
| purple (普速) | #7c3aed | #ffffff |
| yellow (特快) | #ca8a04 | #ffffff |
| default | #6b7280 | #ffffff |

### 状态颜色
| 状态 | 浅色模式背景 | 深色模式背景 | 文字色 |
|------|-------------|-------------|--------|
| 正常 | #d1fae5 | #064e3b | #059669 |
| 警告 | #fef3c7 | #7c2d12 | #d97706 |
| 错误 | #fee2e2 | #7f1d1d | #dc2626 |
| 信息 | #dbeafe | #1e3a5f | #1d4ed8 |

### 异常提醒面板颜色
| 模式 | 背景 | 边框 | 标题背景 |
|------|------|------|----------|
| 浅色 | #fef3c7 | #fbbf24 | #fde68a |
| 深色 | #7c2d12 | #ea580c | #9a3412 |

---

## 组件规范

### 1. AbnormalAlertPanel (异常提醒面板)

**位置**: FilterBar 上方  
**显示条件**: 存在异常车次时显示  
**布局**: 垂直堆叠

**标题栏样式**:
- 背景: 警告色深一级
- 内边距: 10px 16px
- 底部边框: 1px
- 图标: AlertTriangle, 18px
- 文字: "作业异常提醒 (数量)", 14px, 600字重

**异常列表样式**:
- 布局: flex, 横向排列, 可滚动
- 内边距: 12px 16px
- 异常项间距: 12px

**异常项样式**:
- 背景: 半透明 (浅色 60%白 / 深色 20%黑)
- 边框: 1px 警告色
- 圆角: 6px
- 内边距: 8px 12px
- 内容: 站名 · 车次 · 岗位 · 时间
- 字体: 12-13px
- 不换行: white-space: nowrap

### 2. FilterBar (筛选工具栏)

**布局**: flex, 左对齐，允许换行  
**内边距**: 12px 16px  
**背景**: 卡片色  
**边框**: 底部 1px

**按钮样式**:
- 背景: #f3f4f6 (浅色) / #334155 (深色)
- 圆角: 6px
- 内边距: 6px 12px
- 字体: 14px
- 图标: 16px

**车站配置按钮**:
- 显示当前管辖车站数量
- 点击打开 StationConfigModal

### 3. StationConfigModal (车站配置弹窗)

**尺寸**: 400px 宽, 最大 90vw  
**圆角**: 12px  
**阴影**: 大阴影

**车站列表项**:
- 背景: #f9fafb (浅色) / #0f172a (深色)
- 边框: 1px (选中时主色)
- 圆角: 8px
- 内边距: 12px
- 内容: 复选框 + 站名 + 列车数 + 统计标签

### 4. TrainCard (列车卡片)

**布局**: 垂直堆叠  
**圆角**: 12px  
**背景**: 卡片色  
**边框**: 1px (选中时 2px 主色)

**头部区域**:
- 内边距: 12px 16px
- 底部边框: 1px
- 左侧: 序号 + 站名 + 车次号 + 状态标签
- 右侧: 特殊标记 (特/折等)

**序号样式**:
- 背景: #f3f4f6 (浅色) / #334155 (深色)
- 颜色: #6b7280 (浅色) / #94a3b8 (深色)
- 圆角: 6px
- 内边距: 4px 8px
- 字体: 12px, 600字重
- 最小宽度: 28px
- 居中对齐

**站名标签样式**:
- 背景: rgba(59, 130, 246, 0.2) (深色) / #dbeafe (浅色)
- 颜色: #60a5fa (深色) / #1d4ed8 (浅色)
- 圆角: 4px
- 内边距: 4px 8px
- 字体: 12px, 500字重
- 最大宽度: 80px
- 溢出: 省略号

**车次号样式**:
- 圆角: 6px
- 内边距: 4px 10px
- 字体: 14px, 700字重

**主体内容**:
- 内边距: 12px 16px
- 运行区间: 14px, 600字重
- 时间: 18px, 700字重 (晚点红色)
- 位置信息: 13px, 次要色

---

## 交互规范

### 卡片交互
- **悬停**: 上移 2px, 阴影加深
- **选中**: 2px 主色边框 + 外发光
- **点击**: 展开/收起详情

### 筛选交互
- 搜索: 实时过滤
- 时间筛选: 下拉选择
- 主题切换: 即时生效
- 模式切换: 即时生效
- 车站配置: 弹窗选择，保存到 localStorage

### 异常提醒交互
- 点击异常项: 跳转到对应车次并高亮
- 悬停异常项: 背景加深

### 数据排序
- 默认按到达时间升序排列
- 支持实际时间或计划时间
- 跨站数据统一排序

---

## 数据结构

### TrainSchedule 核心字段
```typescript
interface TrainSchedule {
  id: string;                    // 唯一标识
  trainNo: string;               // 车次号
  trainType: 'cyan' | 'purple' | 'yellow' | 'default';
  status: 'origin' | 'pass' | 'end';
  stationName: string;           // 所属车站名称
  stationId: string;             // 车站ID
  runningSection: {
    from: string;
    to: string;
  };
  arrival: {
    time: string;                // 计划到达时间
    actualTime?: string;         // 实际到达时间
    lateEarly?: string;          // 早晚点 (+5/-3)
  };
  departure: {
    time: string;
    actualTime?: string;
    lateEarly?: string;
  };
  location: {
    track: string;               // 股道
    platform: string;            // 站台
    checkInGate: string;         // 检票口
    exitGate: string;            // 出站口
    currentPos: string;          // 当前位置描述
  };
  operations: {
    checkIn: { 
      actualCount: number; 
      plannedCount: number; 
      status: 'pending' | 'active' | 'completed' | 'absent' | 'alarm' 
    };
    platform: { 
      actualCount: number; 
      plannedCount: number; 
      status: 'pending' | 'active' | 'completed' | 'absent' | 'alarm' 
    };
    exit: { 
      actualCount: number; 
      plannedCount: number; 
      status: 'pending' | 'active' | 'completed' | 'absent' | 'alarm' 
    };
  };
  tags: {
    water: boolean;              // 上水
    sewage: boolean;             // 吸污
    parcel: boolean;             // 行包
    meal: boolean;               // 送餐
    turnaround: boolean;         // 折返
    special: boolean;            // 重点
  };
  abnormalInfo?: AbnormalInfo[]; // 异常信息
}

interface AbnormalInfo {
  type: 'checkIn' | 'platform' | 'exit' | 'water' | 'sewage' | 'parcel' | 'meal';
  typeName: string;              // 岗位名称
  status: 'late' | 'missed' | 'overdue';
  plannedTime: string;
  actualTime?: string;
}

interface Station {
  id: string;
  name: string;
  trainCount: number;
  abnormalCount: number;
  alarmCount: number;
  delayCount: number;
  isActive: boolean;             // 是否启用该站
}
```

---

## 使用示例

### 创建新列车卡片
```tsx
<TrainCard 
  train={trainData}
  index={1}
  darkMode={false}
  simpleMode={false}
  isExpanded={false}
  onToggle={() => {}}
  isSelected={false}
/>
```

### 多站数据管理
```tsx
const { filteredTrains, stationStats, activeStationCount } = useMultiStation(
  mockTrainSchedules,
  stations
);
```

### 异常检测
```tsx
const abnormalTrains = getAbnormalTrains(trains);
const stats = getAbnormalStats(trains);
```

### 主题切换
```tsx
const [darkMode, setDarkMode] = useState(false);
// 切换时自动应用深色/浅色样式
```

---

## 注意事项

1. **序号显示**: 从 1 开始递增，不受过滤影响重新编号
2. **时间排序**: 优先使用 actualTime，否则使用 time
3. **响应式**: 网格列数随屏幕宽度自动调整
4. **深色模式**: 所有颜色需同时提供深色模式值
5. **状态标签**: 根据 currentPos 动态计算颜色
6. **多站模式**: 跨站数据统一排序，显示站名标签
7. **异常检测**: operations.status === 'alarm' 时触发异常提醒
8. **配置持久化**: 车站配置保存到 localStorage

---

## 更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-03-21 | 初始版本，包含完整设计规范 |
| 2026-03-21 | 添加序号显示，按到达时间排序 |
| 2026-03-21 | 移除顶部面包屑导航 |
| 2026-03-21 | 增加多站盯控模式 |
| 2026-03-21 | 增加异常作业提醒面板 |
| 2026-03-21 | 增加车站配置功能 |
