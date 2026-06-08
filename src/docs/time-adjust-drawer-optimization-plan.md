# 时间调整抽屉（TimeAdjustDrawer）优化方案

> 文档类型：前端优化方案  
> 创建日期：2026-06-01  
> 最后更新：2026-06-01（新增布局松散问题分析）  
> 关联原型：`src/prototypes/arrival-departure-monitoring-v2/components/TimeAdjustDrawer.tsx`  
> 关联文件：`src/prototypes/arrival-departure-monitoring-v2/OperationDrawer.tsx`

---

## 一、问题清单

### P0 — 交互逻辑 Bug

#### 1.1 始发车发点调整失效

**位置**：`handleQuickAdjust`，第 117 行

**现象**：`trainType === 'origin'` 时，`train.arrival.time` 为空字符串，`isValidTime('')` 返回 `false`，导致整个函数提前返回，发点调整无法执行。

**根因**：验证逻辑没有区分列车类型，对所有类型统一验证到发两个时间。

**修复方案**：
```ts
// 修复前
if (!isValidTime(baseArrivalTime) || !isValidTime(baseDepartureTime)) return prev;

// 修复后
if (type === 'arrival' && !isValidTime(baseArrivalTime)) return prev;
if (type === 'departure' && !isValidTime(baseDepartureTime)) return prev;
```

---

### P1 — 交互可用性

#### 1.2 "累加/不累加"按钮无文字标签

**位置**：实际时间调整区块，调整输入框右侧

**现象**：按钮只有一个 6px 圆点，无任何文字说明，用户无法理解其含义。

**修复方案**：在圆点下方补充文字标签，与"顺延/不顺延"保持一致的视觉模式：

```tsx
<button onClick={() => setIsCumulative(!isCumulative)} ...>
  <span style={{ width: 6, height: 6, borderRadius: 10, background: isCumulative ? colors.success : colors.text }} />
  <span style={{ fontSize: 10, color: colors.text, marginTop: 2 }}>
    {isCumulative ? '累加' : '不累加'}
  </span>
</button>
```

#### 1.3 "顺延/不顺延"按钮与标签视觉关联断裂

**位置**：开停检时间调整区块标题行

**现象**：按钮（圆点）和文字标签分属两个独立元素，视觉上不成一体，用户难以理解点击的是什么。

**修复方案**：将文字标签移入按钮内部，与 1.2 保持一致的结构：

```tsx
<button onClick={() => setIsPostponed(!isPostponed)} ...>
  <span style={{ width: 6, height: 6, borderRadius: 10, background: isPostponed ? colors.success : colors.text }} />
  <span style={{ fontSize: 10, color: colors.text, marginTop: 2 }}>
    {isPostponed ? '顺延' : '不顺延'}
  </span>
</button>
```

---

### P1 — 布局架构

#### 1.4 抽屉内容区错误居中

**位置**：`OperationDrawer.tsx`，`getContentStyle`

**现象**：内容区被设置了 `justifyContent: center`，导致 `TimeAdjustDrawer` 在抽屉中水平居中悬浮，与其他面板（`CheckInOutAdjustPanel` 等）左对齐、撑满宽度的行为不一致。

**修复方案**：移除居中属性，恢复与其他面板一致的布局：

```ts
// 修复前
const getContentStyle = (darkMode: boolean): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  background: darkMode ? 'transparent' : '#FAF8F5',
  display: 'flex',
  justifyContent: 'center',   // ← 需要移除
  alignItems: 'flex-start'    // ← 需要移除
});

// 修复后
const getContentStyle = (darkMode: boolean): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  background: darkMode ? 'transparent' : '#FAF8F5'
});
```

#### 1.5 固定高度 `ROOT_HEIGHT` 硬编码

**位置**：第 203-204 行

**现象**：
```ts
const CHECK_AREA_HEIGHT = trainType === 'pass' ? 380 : trainType === 'origin' ? 200 : 160;
const ROOT_HEIGHT = 50 + 20 + 80 + 20 + 155 + 20 + CHECK_AREA_HEIGHT + 20 + 40;
```
任何内部间距调整都会导致内容溢出或底部留白。其他面板（`CheckInOutAdjustPanel`）使用 `flexDirection: column + gap` 自适应高度，无需手动计算。

**修复方案**：移除 `ROOT_HEIGHT` 和 `CHECK_AREA_HEIGHT` 计算，改为 flex 自适应布局：

```tsx
// 修复前
<div style={{ position: 'relative', width: '100%', maxWidth: 480, height: ROOT_HEIGHT, ... }}>

// 修复后
<div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
```

#### 1.6 `ScheduleCard` 固定宽度 220px

**位置**：第 185 行

**现象**：`width: 220` 硬编码，两张卡片在 560px 抽屉中空间分配不均，且不响应容器宽度变化。

**修复方案**：改为 `flex: 1`，让两张卡片等宽填满容器：

```tsx
// 修复前
<div style={{ width: 220, height: 50, ... }}>

// 修复后
<div style={{ flex: 1, height: 50, ... }}>
```

---

### P2 — 状态管理

#### 1.7 切换列车时状态不重置

**位置**：第 102 行

**现象**：`useState(initialTimes)` 只在组件挂载时执行一次。当父组件传入不同的 `train` prop（切换列车）时，`initialTimes` 会更新，但 `times` 状态保留上一列车的值。

**修复方案**：监听 `train.id` 变化，主动重置状态：

```ts
useEffect(() => {
  setTimes(initialTimes);
  setAdjustValue('');
  setIsCumulative(false);
  setIsPostponed(true);
  setCtcStatus('auto');
}, [train.id]);
```

---

### P2 — 视觉规范

#### 1.8 `CheckTimeCard` 颜色不响应深色模式

**位置**：第 216-220 行

**现象**：卡片背景色（绿色/红色半透明）和标题颜色均为硬编码值，深色模式下对比度不足，绿色背景在深色底上几乎不可见。

**修复方案**：将颜色值纳入 `COLORS` 主题配置，深色模式下适当提高透明度或调整色相：

```ts
// 在 COLORS 中补充
light: {
  checkInBg: 'rgba(22, 92, 59, 0.12)',
  checkInBorder: '#C4F4EB',
  checkOutBg: 'rgba(118, 13, 13, 0.12)',
  checkOutBorder: '#FECACA',
},
dark: {
  checkInBg: 'rgba(22, 92, 59, 0.25)',
  checkInBorder: 'rgba(196, 244, 235, 0.4)',
  checkOutBg: 'rgba(118, 13, 13, 0.25)',
  checkOutBorder: 'rgba(254, 202, 202, 0.4)',
},
```

#### 1.9 `ScheduleCard` 激活边框颜色语义错误

**位置**：第 188 行

**现象**：`border: active ? \`1px solid ${colors.text}\`` 使用文字颜色作为边框色，语义不正确，且深色模式下边框会变成浅色，与卡片背景（绿色渐变）不协调。

**修复方案**：恢复原版的语义颜色：

```tsx
border: active ? '1px solid #C4F4EB' : `1px solid ${colors.borderSecondary}`,
```

#### 1.10 底部按钮区块缺少上边距

**位置**：第 370 行

**现象**：底部"恢复默认/保存"按钮与上方开停检区块之间没有间距，视觉上粘连。

**修复方案**：在按钮容器上添加 `marginTop: 12`。

---

### P1 — 布局松散（间距叠加）

> 本节问题为 2026-06-01 运行时观察补充，是当前"布局太松散"的直接原因。

#### 1.11 双重 padding 叠加压缩内容区

**位置**：`OperationDrawer.tsx` `getContentStyle` + `TimeAdjustDrawer.tsx` 根节点

**现象**：抽屉容器已有 `padding: 16px 20px`，组件根节点又额外设置 `padding: 20px`，两层叠加导致左右各损耗 40px（共 80px），内容区实际宽度仅 480px，视觉上两侧留白过多。

```
抽屉宽度 560px
  - 容器 padding: 20px × 2 = 40px
  - 组件 padding: 20px × 2 = 40px（多余）
  = 内容宽度: 480px，损耗 14%
```

**修复方案**：移除组件根节点的 `padding: 20px`，只保留容器的 padding：

```tsx
// 修复前
<div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%',
              background: colors.bg, borderRadius: 8, padding: '20px' }}>

// 修复后
<div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
```

#### 1.12 `gap` 与 `marginBottom` 同时生效，间距叠加

**位置**：`TimeAdjustDrawer.tsx`，根节点 `gap: 12` + 三个子区块各自的 `marginBottom: 20`

**现象**：父容器设置了 `gap: 12`，但图定时间行、CTC 区块、实际时间调整区块各自还带有 `marginBottom: 20`，实际间距为 `12 + 20 = 32px`，是预期值的 2.7 倍，是松散感的直接来源。

**受影响的位置**：
- 图定时间行：`marginBottom: 20`（第 299 行）
- CTC 区块：`marginBottom: 20`（第 306 行）
- 实际时间调整区块：`marginBottom: 20`（第 334 行）

**修复方案**：统一由父容器 `gap` 控制间距，移除三处 `marginBottom`：

```tsx
// 修复前
<div style={{ ..., marginBottom: 20 }}>  // 图定时间行
<div style={{ ..., marginBottom: 20 }}>  // CTC 区块
<div style={{ ..., marginBottom: 20 }}>  // 实际时间调整区块

// 修复后（三处均移除 marginBottom）
<div style={{ ... }}>
```

#### 1.13 CTC 区块固定高度 `height: 80` 底部留白

**位置**：第 306 行

**现象**：`height: 80` 硬编码，但实际内容（标题行 + 一行数据）高度约 60px，底部约 20px 为空白。

**修复方案**：移除固定高度，改为 padding 自适应：

```tsx
// 修复前
<div style={{ width: '100%', height: 80, ..., padding: '12px' }}>

// 修复后
<div style={{ width: '100%', ..., padding: '10px 12px' }}>
```

#### 1.14 `CheckTimeCard` 固定高度底部留白

**位置**：第 243 行

**现象**：`h = sf ? 180 : 140` 硬编码。进站卡片（`showFull=true`）固定 180px，实际内容约 141px，底部约 40px 空白；出站卡片（`showFull=false`）固定 140px，实际内容约 100px，底部约 40px 空白。`pass` 类型有 4 张卡片，合计多余空白约 160px。

**修复方案**：移除固定高度，改为 flex 自适应，底部加 `paddingBottom` 保留呼吸感：

```tsx
// 修复前
<div style={{ width: '100%', height: h, ..., display: 'flex', flexDirection: 'column', padding: 8 }}>

// 修复后
<div style={{ width: '100%', ..., display: 'flex', flexDirection: 'column', padding: '8px 8px 12px' }}>
```

#### 1.15 底部按钮 `marginTop: 12` 与父容器 `gap: 12` 叠加

**位置**：第 400 行

**现象**：按钮行设置了 `marginTop: 12`，父容器已有 `gap: 12`，实际间距 24px，与其他区块间距不一致，底部视觉偏重。

**修复方案**：移除按钮行的 `marginTop: 12`，由父容器 `gap` 统一控制：

```tsx
// 修复前
<div style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 12 }}>

// 修复后
<div style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
```

#### 1.16 `ScheduleCard` 内边距过大

**位置**：第 224 行

**现象**：`padding: '0 32px 0 35px'`，在 flex 等宽的两张卡片里，左右各 32-35px 的内边距占去大量空间，标题与时间值之间的间距显得空旷，与卡片实际内容量不匹配。

**修复方案**：收窄内边距，改为左右对称：

```tsx
// 修复前
padding: '0 32px 0 35px'

// 修复后
padding: '0 20px'
```

---

## 二、优化优先级汇总

| 编号 | 问题 | 优先级 | 影响范围 |
|------|------|--------|----------|
| 1.1 | 始发车发点调整失效 | P0 | 功能 Bug |
| 1.2 | 累加按钮无标签 | P1 | 交互可用性 |
| 1.3 | 顺延按钮标签断裂 | P1 | 交互可用性 |
| 1.4 | 抽屉内容区错误居中 | P1 | 布局一致性 |
| 1.5 | 固定高度硬编码（ROOT_HEIGHT） | P1 | 布局稳定性 |
| 1.6 | ScheduleCard 固定宽度 | P1 | 布局适配 |
| 1.11 | 双重 padding 叠加 | P1 | 布局松散 |
| 1.12 | gap + marginBottom 叠加 | P1 | 布局松散 |
| 1.13 | CTC 区块固定高度留白 | P1 | 布局松散 |
| 1.14 | CheckTimeCard 固定高度留白 | P1 | 布局松散 |
| 1.15 | 按钮 marginTop 与 gap 叠加 | P1 | 布局松散 |
| 1.16 | ScheduleCard 内边距过大 | P1 | 布局松散 |
| 1.7 | 切换列车状态不重置 | P2 | 状态管理 |
| 1.8 | CheckTimeCard 深色模式颜色 | P2 | 视觉规范 |
| 1.9 | ScheduleCard 边框颜色语义 | P2 | 视觉规范 |
| 1.10 | 底部按钮缺少间距 | P2 | 视觉规范 |

---

## 三、实施顺序建议

**第一步（P0）**：修复 1.1，确保始发车发点调整可用。

**第二步（P1 — 布局松散，优先）**：集中修复 1.11～1.16，这 6 个问题是"布局太松散"的直接原因，改动集中在根节点和各区块的 padding/margin/height，可一次性处理：
- 移除组件根节点 `padding: 20px`（1.11）
- 移除三处 `marginBottom: 20`（1.12）
- 移除 CTC 区块 `height: 80`（1.13）
- 移除 `CheckTimeCard` 固定高度（1.14）
- 移除按钮行 `marginTop: 12`（1.15）
- 收窄 `ScheduleCard` 内边距（1.16）

**第三步（P1 — 其他布局）**：修复 1.2、1.3 补全按钮标签；修复 1.4 移除错误居中；修复 1.5、1.6 改为自适应布局。

**第四步（P2）**：修复 1.7 状态重置；修复 1.8、1.9、1.10 视觉细节。
