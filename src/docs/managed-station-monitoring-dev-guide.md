# 代管盯控页面 - 前端/UI开发说明文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 页面名称 | 代管盯控 |
| 文档版本 | v1.0 |
| 创建日期 | 2026-03-24 |
| 适用对象 | 前端开发工程师、UI设计师 |
| 原型路径 | `src/prototypes/managed-station-monitoring/` |

---

## 一、页面概述

### 1.1 业务背景
代管盯控页面用于同时监控多个代管车站的列车到发情况。与单站到发盯控不同，代管盯控以**时间轴为核心**，展示多个车站的列车运行状态，支持同车次跨多个车站的虚线连接展示。

### 1.2 核心功能
- 甘特图风格的时间轴展示
- 多车站列车状态监控
- 同车次跨站虚线连接
- 车次卡片详细信息展示
- 深色/浅色主题切换
- 时间轴缩放与拖拽

---

## 二、技术栈

| 技术项 | 版本/说明 |
|--------|-----------|
| 框架 | React 18+ |
| 语言 | TypeScript |
| UI组件库 | Ant Design 5.x |
| 图标库 | Lucide React + Ant Design Icons |
| 样式方案 | CSS Variables + 内联样式 |
| 构建工具 | Vite |

---

## 三、项目结构

```
src/prototypes/managed-station-monitoring/
├── index.tsx                 # 主页面组件（入口）
├── types.ts                  # TypeScript类型定义
├── utils.ts                  # 工具函数
├── style.css                 # 全局样式
├── spec.md                   # 产品规格文档
├── mock-data.ts              # 模拟数据
├── hooks/                    # 自定义Hooks
│   ├── useTrainData.ts       # 车次数据管理
│   ├── useTimeline.ts        # 时间轴逻辑
│   └── useConfig.ts          # 配置管理
├── components/               # 子组件
│   ├── Toolbar/              # 工具栏
│   ├── Timeline/             # 时间轴
│   ├── MonitoringPanel/      # 监控面板
│   │   ├── index.tsx
│   │   └── TrainCard.tsx     # 车次卡片
│   ├── TrainConnections/     # 车次连接线
│   └── ConfigWizard/         # 配置向导
│       ├── index.tsx
│       ├── StationConfig.tsx
│       ├── PanelConfig.tsx
│       ├── DisplayConfig.tsx
│       └── ReminderConfig.tsx
```

---

## 四、数据接口

### 4.1 核心数据类型

```typescript
// 车次数据
interface TrainData {
  id: string;                          // 唯一标识
  trainNo: string;                     // 车次号（如 G8888）
  trainType?: 'G' | 'D' | 'C';         // 车次类型
  direction: 'up' | 'down';            // 上下行方向
  lineDirection?: '上' | '下';         // 线路方向
  arrivalTime: string;                 // 到达时间（HH:mm）
  departureTime: string;               // 出发时间（HH:mm）
  track: string;                       // 股道号
  status: 'normal' | 'early' | 'late'; // 状态
  delayMinutes: number;                // 延误分钟数
  stopMinutes?: number;                // 停靠时长
  serviceType: 'origin' | 'destination' | 'transit'; // 服务类型
  panelId: string;                     // 所属面板ID
  workStatus: 'notExecuted' | 'executing' | 'completed' | 'abnormal'; // 作业状态
  
  // 编组信息
  formationCount?: 8 | 16;             // 编组辆数
  sequenceType?: '正' | '倒';          // 正倒序
  
  // 运行区间
  runningSection?: {
    from: string;                      // 始发站
    to: string;                        // 终到站
  };
  
  // 作业任务
  tasks?: TrainTask[];
  
  // 客流信息
  passengerFlow?: {
    boarding: number;                  // 上车人数
    alighting: number;                 // 下车人数
    transfer: number;                  // 换乘人数
  };
  
  // 列车长
  trainMaster?: string;
  
  // 标签
  tags?: {
    water: boolean;                    // 上水
    sewage: boolean;                   // 吸污
    parcel: boolean;                   // 行包
    meal: boolean;                     // 配餐
    overnight: boolean;                // 过夜
    turnaround: boolean;               // 折返
    overcrowd: boolean;                // 超员
    special: boolean;                  // 特殊
    checkInReady: boolean;             // 检票就绪
  };
}

// 作业任务
interface TrainTask {
  id: string;
  type: '检票' | '站台' | '出站' | '上水' | '吸污';
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
}
```

### 4.2 站点配置

```typescript
interface StationRowConfig {
  id: string;           // 站点ID
  name: string;         // 站点名称
  color: string;        // 标识颜色
  stationName?: string; // 所属车站名（如重庆东）
}

// 当前配置的站点
const stationRows: StationRowConfig[] = [
  { id: 'yuxia', name: '渝厦高铁场', color: '#3b82f6', stationName: '重庆东' },
  { id: 'donghuan', name: '东环城际场', color: '#ef4444', stationName: '重庆东' },
  { id: 'banan', name: '巴南', color: '#10b981' },
  { id: 'nanchuanbei', name: '南川北', color: '#f59e0b' },
  { id: 'shuijiangxi', name: '水江西', color: '#8b5cf6' }
];
```

---

## 五、UI设计规范

### 5.1 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  [工具栏] 标题 | 搜索 | 缩放控制 | 当前时间 | 主题切换 | 设置  │  ← 56px
├──────────┬──────────────────────────────────────────────────┤
│          │  [时间轴] 06:00 ──────── 12:00 ──────── 18:00   │  ← 40px
│  [站点]  ├──────────────────────────────────────────────────┤
│  列表    │                                                  │
│  150px   │  [甘特图区域]                                     │
│          │  ┌───────────────────────────────────────────┐   │
│  渝厦    │  │ 车次卡片 G8888  17:00  17:30  股道5        │   │
│  高铁场  │  │ [检票][站台][出站][水污]                   │   │
│          │  └───────────────────────────────────────────┘   │
│  东环    │                                                  │
│  城际场  │  ┌───────────────────────────────────────────┐   │
│          │  │ 车次卡片 D1234  18:00  18:15  股道3        │   │
│  ...     │  │ [检票][站台][出站][水污]                   │   │
│          │  └───────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────┘
           ↑
        左侧站点列表 (150px)
```

### 5.2 色彩规范

#### 主题色

| 模式 | 用途 | 色值 |
|------|------|------|
| 浅色 | 页面背景 | `#f8fafc` |
| 浅色 | 卡片背景 | `#ffffff` |
| 浅色 | 主文本 | `#1e293b` |
| 浅色 | 次文本 | `#64748b` |
| 深色 | 页面背景 | `#0f172a` |
| 深色 | 卡片背景 | `#1e293b` |
| 深色 | 主文本 | `#f1f5f9` |
| 深色 | 次文本 | `#94a3b8` |

#### 车次类型色

| 类型 | 色值 | 说明 |
|------|------|------|
| G（高铁） | `#3b82f6` | 蓝色 |
| D（动车） | `#06b6d4` | 青色 |
| C（城际） | `#10b981` | 绿色 |

#### 作业状态色

| 状态 | 背景色 | 说明 |
|------|--------|------|
| 未开始 | `#F2F2F2` | 灰色 |
| 进行中-检票/水污 | `#CAF982` | 浅绿色 |
| 进行中-其他 | `#81D3F8` | 浅蓝色 |
| 已完成 | `#CAF982` | 浅绿色 |
| 异常 | `#EF9A9A` | 红色 |

#### 地标颜色规则

```typescript
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
```

### 5.3 字体规范

| 元素 | 字号 | 字重 | 字体 |
|------|------|------|------|
| 页面标题 | 18px | 800 | system-ui |
| 车次号 | 20px | bold | system-ui |
| 时间显示 | 18px | 600 | monospace |
| 股道号 | 20px | bold | system-ui |
| 作业按钮 | 14px | 600 | system-ui |
| 运行区间 | 13px | 500 | system-ui |

### 5.4 尺寸规范

| 元素 | 尺寸 |
|------|------|
| 顶部工具栏高度 | 56px |
| 左侧站点列表宽度 | 150px |
| 时间轴高度 | 40px |
| 车次卡片宽度 | 280px |
| 车次卡片高度 | 125px |
| 车次卡片行间距 | 150px |
| 作业按钮高度 | 28px |
| 圆角（卡片） | 16px |
| 圆角（按钮） | 14px |
| 圆角（标签） | 20px |

---

## 六、组件说明

### 6.1 车次卡片（TrainCard）

#### 结构
```
┌─────────────────────────────────────────┐
│ ┌──────┐  成都东 → 重庆东    ● 16正北   │  ← 头部 (40px)
│ │G8888 │                               │
│ └──────┘                               │
├─────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌──────┐         │  ← 数据区 (40px)
│ │ 17:00  │ │ 17:30  │ │  5   │         │
│ └────────┘ └────────┘ └──────┘         │
├─────────────────────────────────────────┤
│ [检票] [站台] [出站] [水污]             │  ← 作业区 (35px)
└─────────────────────────────────────────┘
```

#### 样式细节
- **车次号标签**：橙色背景 `#F59A23`，圆角 20px，内边距 6px 18px
- **地标指示器**：蓝色圆点 `#2196F3` + 文字，浅蓝背景 `#F0F8FF`
- **时间框**：灰色背景 `#F5F5F5`，圆角 12px
- **股道框**：黄色背景 `#FFEB3B`，圆角 12px
- **作业按钮**：根据状态显示不同背景色，圆角 14px

### 6.2 时间轴

- **刻度**：每小时一个主刻度，显示 `HH:00`
- **当前时间线**：红色 `#ef4444`，宽度 2px，带脉冲动画
- **拖拽**：支持鼠标拖拽左右移动
- **缩放**：支持滚轮缩放，范围 2-12 px/分钟

### 6.3 站点列表

- 左侧固定宽度 150px
- 每个站点行显示彩色标识条 + 站点名称
- 行高根据该站点车次数量动态计算

---

## 七、交互说明

### 7.1 时间轴交互

| 操作 | 效果 |
|------|------|
| 鼠标拖拽 | 左右移动时间轴 |
| 滚轮 | 缩放时间刻度 |
| 点击缩放按钮 | 调整 pixelsPerMinute（2-12范围） |
| 点击重置按钮 | 恢复默认缩放和位置 |

### 7.2 车次卡片交互

| 操作 | 效果 |
|------|------|
| 点击卡片 | 选中/取消选中，显示选中角标 |
| 选中状态 | 卡片放大 1.02 倍，添加橙色边框和阴影 |

### 7.3 主题切换

- 点击主题按钮切换深色/浅色模式
- 切换时所有组件颜色平滑过渡
- 深色模式使用高对比度配色

---

## 八、关键算法

### 8.1 车次位置计算

```typescript
// 时间转像素位置
const timeToPixels = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return (h * 60 + m - startHour * 60) * pixelsPerMinute;
};

// 计算停靠时长对应的像素宽度
const durationToPixels = (arrival: string, departure: string) => {
  const [arrH, arrM] = arrival.split(':').map(Number);
  const [depH, depM] = departure.split(':').map(Number);
  return ((depH * 60 + depM) - (arrH * 60 + arrM)) * pixelsPerMinute;
};
```

### 8.2 行高计算（防重叠）

```typescript
const calculateRowHeight = (trains: TrainData[]): number => {
  const sortedTrains = [...trains].sort((a, b) => 
    a.arrivalTime.localeCompare(b.arrivalTime)
  );
  const rowEndTimes: number[] = [];
  
  sortedTrains.forEach(train => {
    const start = timeToMinutes(train.arrivalTime);
    const end = timeToMinutes(train.departureTime);
    
    // 查找可放置的行
    let placedRow = -1;
    for (let i = 0; i < rowEndTimes.length; i++) {
      if (rowEndTimes[i] + 5 <= start) {  // 5分钟间隔
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
  
  return Math.max(rowEndTimes.length, 1) * 150;  // 每行150px
};
```

---

## 九、开发注意事项

### 9.1 性能优化

1. **虚拟滚动**：当车次数量较多时，考虑使用虚拟滚动优化
2. **防抖处理**：时间轴拖拽和缩放操作需要防抖
3. **Memo优化**：车次卡片使用 React.memo 避免不必要的重渲染

### 9.2 响应式适配

| 断点 | 适配策略 |
|------|----------|
| ≥1400px | 标准布局，完整功能 |
| 768-1399px | 保持布局，适当缩小卡片 |
| <768px | 简化展示，隐藏次要信息 |

### 9.3 浏览器兼容

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 十、验收标准

### 10.1 功能验收

- [ ] 时间轴正常显示，刻度清晰
- [ ] 车次卡片正确显示所有信息
- [ ] 时间轴拖拽和缩放流畅
- [ ] 主题切换正常，无闪烁
- [ ] 车次卡片选中状态正确
- [ ] 当前时间线实时更新

### 10.2 视觉验收

- [ ] 色彩符合设计规范
- [ ] 字体大小和字重正确
- [ ] 间距和对齐符合规范
- [ ] 圆角和阴影效果正确
- [ ] 动画效果流畅自然

### 10.3 性能验收

- [ ] 首屏加载时间 < 2s
- [ ] 时间轴拖拽帧率 > 30fps
- [ ] 内存占用合理，无泄漏

---

## 十一、附录

### 11.1 相关文档

- [产品规格文档](../prototypes/managed-station-monitoring/spec.md)
- [设计规范](../../themes/trae-design/)

### 11.2 参考资源

- Ant Design 组件库：https://ant.design/components/overview
- Lucide Icons：https://lucide.dev/icons/

---

*文档结束*
