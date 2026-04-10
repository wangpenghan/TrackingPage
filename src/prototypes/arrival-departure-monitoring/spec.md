# 到发盯控页面规格文档

## 页面概述

**页面名称**: 到发盯控  
**所属模块**: 综合指挥  
**功能描述**: 实时监控列车到发情况，展示列车运行状态、作业进度、设备状态等信息，支持干预操作。

## 页面结构

### 1. 顶部区域

#### 1.1 面包屑导航
- 路径: 首页 / 综合指挥 / 到发盯控

#### 1.2 时间显示 (HeaderStats)
- 当前日期 (YYYY年MM月DD日格式)
- 当前时间 (HH:mm:ss格式，每秒更新)
- 样式: 卡片式展示，带边框和阴影

### 2. 筛选工具栏 (FilterBar)

#### 2.1 时间筛选
- 选项: 全部、1小时内、2小时内、4小时内、6小时内、12小时内、24小时内
- 默认: 4小时内

#### 2.2 搜索框
- 占位符: "搜索车次/股道/站台..."
- 支持实时搜索

#### 2.3 功能按钮
- **简洁/标准模式切换**: 切换卡片显示详细程度
- **主题切换**: 深色/浅色模式
- **配置**: 打开配置面板
- **干预模式**: 进入/退出干预模式
- **执行干预**: 选中列车后显示

### 3. 列车卡片列表 (TrainTable)

#### 3.1 卡片布局
- 网格布局，响应式适配
- 标准模式: minmax(400px, 1fr)
- 简洁模式: minmax(320px, 1fr)

#### 3.2 卡片内容

##### 头部区域
- 车次号 (带颜色标识: cyan/青、purple/紫、yellow/黄)
- 当前状态标签 (正在候车、正在检票、停止检票、晚点未定等)
- 特殊标记 (特、折等)

##### 主体内容
- **运行区间**: 始发站 → 终到站
- **时间信息**: 到达时间、出发时间、早晚点信息
- **位置信息**: 股道、站台

##### 标准模式额外信息
- 检票口/出站口
- 旅服设备状态 (广播、引导、闸机)
- 客流信息 (上车、下车、换乘人数)
- 作业状态 (检票、站台、出站)

##### 标签区域
- 上水、吸污、行包、送餐等服务标签

## 数据结构

### TrainSchedule 接口
```typescript
interface TrainSchedule {
  id: string;                    // 唯一标识
  trainNo: string;               // 车次号
  trainType: 'cyan' | 'purple' | 'yellow' | 'default';
  status: 'origin' | 'pass' | 'end';  // 本站状态
  runningSection: {              // 运行区间
    from: string;
    to: string;
  };
  tags: {                        // 服务标签
    water: boolean;              // 上水
    sewage: boolean;             // 吸污
    parcel: boolean;             // 行包
    meal: boolean;               // 送餐
    overnight: boolean;          // 过夜
    turnaround: boolean;         // 折返
    overcrowd: boolean;          // 大客流
    special: boolean;            // 重点
  };
  arrival: {                     // 到达信息
    time: string;
    actualTime?: string;
    lateEarly?: string;          // 早晚点
  };
  departure: {                   // 出发信息
    time: string;
    actualTime?: string;
    lateEarly?: string;
  };
  location: {                    // 位置信息
    track: string;               // 股道
    platform: string;            // 站台
    checkInGate: string;         // 检票口
    exitGate: string;            // 出站口
    currentPos: string;          // 当前位置描述
  };
  devices: {                     // 设备状态
    broadcast: { value: string; state: 'normal' | 'abnormal' | 'none' };
    guide: { value: string; state: 'normal' | 'abnormal' | 'none' };
    gate: { value: string; state: 'normal' | 'abnormal' | 'none' };
  };
  operations: {                  // 作业状态
    checkIn: { actualCount: number; plannedCount: number; status: string };
    platform: { actualCount: number; plannedCount: number; status: string };
    exit: { actualCount: number; plannedCount: number; status: string };
  };
  passengerFlow?: {              // 客流信息
    boarding: number | string;
    alighting: number | string;
    transfer: number | string;
    total: number | string;
  };
}
```

## 交互逻辑

### 1. 卡片选择
- 点击卡片可选中/取消选中
- 选中后卡片边框高亮显示
- 选中状态下可执行干预操作

### 2. 搜索过滤
- 实时过滤车次号、股道、站台
- 支持模糊匹配

### 3. 时间过滤
- 根据选择的时间范围过滤列车
- 基于到达时间进行判断

### 4. 模式切换
- **简洁模式**: 只显示核心信息 (车次、状态、时间、位置)
- **标准模式**: 显示完整信息 (设备、客流、作业状态)

### 5. 主题切换
- 深色模式: 深蓝灰色系背景
- 浅色模式: 白色/浅灰色背景

## 样式规范

### 颜色系统

#### 浅色模式
- 背景: #f0f2f5 (页面), #fff (卡片)
- 文字: #1f2937 (主文字), #6b7280 (次要文字)
- 边框: #e5e7eb
- 主色: #3b82f6

#### 深色模式
- 背景: #0f172a (页面), #1e293b (卡片)
- 文字: #e2e8f0 (主文字), #94a3b8 (次要文字)
- 边框: #334155
- 主色: #60a5fa

### 车次类型颜色
- cyan: #0891b2
- purple: #7c3aed
- yellow: #ca8a04
- default: #6b7280

### 状态颜色
- 正常: #10b981
- 警告: #f59e0b
- 错误: #ef4444
- 信息: #3b82f6

## 响应式断点

| 断点 | 网格列数(标准) | 网格列数(简洁) |
|------|---------------|---------------|
| < 640px | 1 | 1 |
| 641-1024px | 2 | 2 |
| 1025-1440px | 3 | 4 |
| > 1440px | 4 | 5 |

## 依赖项

- React 18+
- lucide-react (图标库)
- dayjs (日期处理)
- uuid (唯一ID生成)

## 迁移说明

本页面从 APP 项目迁移至 Axhub Make 原型系统，主要改动：

1. 移除了与后端 API 的依赖，使用 mock 数据
2. 简化了部分复杂组件 (如地图、图表等)
3. 保留了核心功能和交互逻辑
4. 适配了 Axhub Make 的组件规范
5. 支持深色/浅色主题切换
6. 添加了简洁/标准显示模式
