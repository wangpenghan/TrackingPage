# 管控平台 DMR 系统规格文档

## 概述

管控平台 DMR（Digital Mobile Radio）系统是一个用于铁路/交通行业的对讲通信管理系统，提供分组通话和录音回放功能。

## 功能模块

### 1. 侧边栏导航 (DMRSidebar)

**功能描述：**
- 显示系统标题和图标
- 提供通话组列表（客运组、售票组、服务台、保洁组、商务组等）
- 提供录音回放入口
- 支持分组切换，当前选中项高亮显示

**交互：**
- 点击分组切换主内容区
- 选中状态使用蓝色背景高亮

### 2. PTT 对讲通话 (PTTCall)

**功能描述：**
- 大圆形 PTT（Push-To-Talk）按钮，支持按住说话
- 实时显示通话时长
- DMR 连接状态指示器
- 自动录音功能（可开关）
- 音频设备选择（麦克风、扬声器）
- 静音检测和自动关闭提醒

**交互：**
- 鼠标按住/松开或空格键控制通话
- 设置面板可配置自动录音和音频设备
- 30秒静音自动提醒，30秒后自动关闭

**状态：**
- 空闲（灰色）
- 正在连接（黄色）
- 通话中（绿色，带脉冲动画）
- 自动关闭（红色）

### 3. 录音回放 (RecordingList)

**功能描述：**
- 录音列表展示（分组、日期、时间、大小）
- 搜索功能（关键词搜索）
- 分组筛选
- 日期范围筛选
- 分页显示
- 播放/暂停控制

**交互：**
- 搜索框实时筛选
- 下拉选择分组
- 日期选择器选择范围
- 点击播放按钮切换播放状态
- 分页导航

## 数据结构

### Group 分组
```typescript
interface Group {
  id: string;        // 分组ID
  name: string;      // 分组名称
  category: 'call' | 'playback';  // 分类
}
```

### RecordingItem 录音项
```typescript
interface RecordingItem {
  key: string;       // 唯一标识
  groupId: string;   // 所属分组ID
  groupName: string; // 所属分组名称
  timestamp: string; // 时间戳
  duration: number;  // 时长（秒）
  size: number;      // 文件大小（字节）
  date: string;      // 日期 YYYY-MM-DD
  time: string;      // 时间 HH-mm-ss
}
```

## 样式规范

### 颜色
- 主色调：蓝色 (#3b82f6)
- 成功/通话中：绿色 (#22c55e)
- 警告：黄色 (#f59e0b)
- 错误/断开：红色 (#ef4444)
- 背景：灰色渐变 (#f5f7fa -> #e4e8ec)
- 文字：深灰 (#1f2937)、中灰 (#6b7280)

### 布局
- 侧边栏宽度：256px (w-64)
- 顶部状态栏高度：64px (h-16)
- PTT 按钮尺寸：288x288px (w-72 h-72)
- 圆角：标准 8px (rounded-lg)、大圆角 12px (rounded-xl)

### 字体
- 主字体：PingFang SC、Microsoft YaHei
- 数字字体：等宽字体 (font-mono)
- 标题：text-xl (20px)、text-2xl (24px)
- 正文：text-sm (14px)、text-base (16px)

## 文件结构

```
dmr-control-system/
├── components/
│   ├── DMRSidebar.tsx      # 侧边栏组件
│   ├── PTTCall.tsx         # PTT通话组件
│   └── RecordingList.tsx   # 录音列表组件
├── data/
│   ├── groups.ts           # 分组数据
│   └── mockRecordings.ts   # 模拟录音数据
├── types/
│   └── dmr.ts              # 类型定义
├── index.tsx               # 主入口组件
├── index.html              # HTML入口
├── style.css               # 样式文件
└── spec.md                 # 规格文档
```

## 依赖

- React 18+
- Tailwind CSS
- Lucide React (图标库)

## 使用方式

1. 在项目中引入主组件：
```tsx
import DMRControlSystem from './prototypes/dmr-control-system';

function App() {
  return <DMRControlSystem />;
}
```

2. 确保项目已配置 Tailwind CSS

3. 安装依赖：
```bash
npm install lucide-react
```

## 注意事项

1. 音频功能需要 HTTPS 或 localhost 环境
2. 麦克风权限需要用户授权
3. 录音功能为模拟实现，实际项目中需要接入后端 API
4. DMR 连接状态为模拟数据
