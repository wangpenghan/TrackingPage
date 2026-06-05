# 接续计划 - 编组维护抽屉面板 (FormationDrawer)

> **版本**：v2 — 优化设计：固定股道高度、16编组基准、8编组按停车位定位
> **日期**：2026-06-05
> **关联原型**：`src/prototypes/connection-plan/`

---

## 📋 业务与功能

### 1.1 核心目标

编组维护抽屉（FormationDrawer）提供列车编组和站台引导屏的可视化调整工具。值班员通过可视化的"列车-站台-引导屏"关系图，直观了解当前列车的停靠位置、编组结构和引导屏覆盖范围，并支持快速调整编组参数和引导屏配置。

**核心设计原则**：股道可视化区域以**16编组列车**为基准——南北停车标之间的股道长度恰好容纳16节车厢（编号1-16）。8编组列车使用相同尺寸的车厢，因此只占据股道的一半长度，其位置根据进站方向和停车位决定。

**用户场景**：
- 综控值班员核对列车编组信息，发现主表显示"16节 正序 北进"，但实际为"8节 倒序 南进"，需要快速纠正
- 站台引导屏分配不合理，值班员调整各屏对应的车厢号
- 接续/折返列车需要查阅关联车次的编组信息

### 1.2 功能清单

| 模块 | 功能 | 优先级 | 状态 |
|------|------|--------|------|
| **编组可视化** | 固定股道示意图：16节基准，南北停车标，股道条 | P0 | ✅ 需重做 |
| | 16编组显示：1号车对齐北停车标，16号车对齐南停车标，填满股道 | P0 | ✅ 需重做 |
| | 8编组显示：每节车厢与16编组同高，总高度占股道一半 | P0 | ❌ 需重做 |
| | 8编组停车位定位：按进站方向决定靠北/靠南停靠 | P0 | ❌ 新增 |
| | 车厢块高亮（车头用地标色，普通车厢灰色） | P0 | ✅ 已有 |
| | 车头朝向标记（▲ 箭头指示方向） | P1 | ✅ 已有 |
| **编组配置** | 车型选择（CR400AF / CR400BF / CRH380A） | P1 | ✅ 已有 |
| | 编组数切换（8节 / 16节） | P0 | ✅ 已有 |
| | 编组方向切换（正序 / 倒序） | P0 | ✅ 已有 |
| | 进站方向切换（南进 / 北进） | P0 | ✅ 已有 |
| | 地标颜色自动计算展示 | P0 | ✅ 已有 |
| **引导屏管理** | 引导屏卡片在可视化区域中浮层展示 | P0 | ✅ 已有 |
| | 单屏上移/下移（变更目标车厢） | P0 | ✅ 已有 |
| | 全部上移/全部下移 | P1 | ✅ 已有 |
| | 引导屏列表在右侧面板中展示 | P1 | ✅ 已有 |
| **操作控制** | 保存变更 | P0 | ❌ 新增 |
| | 恢复默认值 | P0 | ❌ 新增 |
| | 关联车次跳转切换 | P1 | ✅ 已有 |

### 1.3 交互要点

- **打开**：点击主表格"编组"列 → FormationDrawer 右侧滑出
- **关闭**：点击遮罩层 / 关闭按钮（⚠️ 未保存修改将丢失）
- **编组数切换**：Select 切换 8/16 → 可视化区立即重绘车厢排列
- **编组方向切换**：正序↔倒序 → 车厢编号顺序翻转，车头位置交换
- **进站方向切换**：南进↔北进 → 停车位变更，8编组时车厢垂直位置偏移
- **引导屏调整**：点击 ↑↓ 箭头 → 单屏目标车厢 ±1；底部"全部上移/下移"按钮 → 所有屏整体平移
- **保存**：点击"保存"按钮 → 当前配置提交（Mock 阶段可 console.log）
- **恢复默认**：重置为从 `train` 数据初始化的原始值

---

## 📊 空间模型 — 固定股道设计

### 2.1 核心概念

股道可视化区域以**16节车厢编组**为设计基准，核心约束：

```
南北停车标之间的股道距离 = 16节 × 每节高度
```

- **每节车厢高度（固定值）**：`CAR_UNIT_HEIGHT = 56px`（含间隙）
- **股道净高度 = 16 × 56 = 896px**
- **总画布高度 = 顶部留白(80px) + 南北停车标间距(896px) + 底部留白(80px) = 1056px**

### 2.2 16编组（基准模式）

```
  ┌─────────────────────────────────┐
  │         ▲ 北（绿色箭头）          │  topPadding = 80px
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
  │  [1号车 — 车头 ⬆]               │
  │  [2号车]                         │
  │  [3号车]                         │
  │  [4号车]                         │  nsBandDistance = 896px
  │  [5号车]                         │  (16节 × 56px)
  │  [6号车]                         │
  │  ...                             │
  │  [15号车]                        │
  │  [16号车 — 车尾]                 │
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
  │         ▼ 南（橙色箭头）          │  bottomPadding = 80px
  └─────────────────────────────────┘
```

- 1号车顶部切齐北停车标标记线
- 16号车底部切齐南停车标标记线
- 车厢连续排列，填满整个股道

### 2.3 8编组（半长模式）

每节车厢高度与16编组**完全相同**（56px），8节车厢总高度 = **448px**，占据股道的一半。剩余一半为空白区域，位置由**进站方向**和**停车位**决定：

#### 南进（列车从南向北行驶）

列车从南侧驶入站台，车头朝北，**靠北停车**，8节车厢从北停车标开始向下排列：

```
  ┌─────────────────────────────────┐
  │         ▲ 北                     │
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
  │  [1号车 — 车头 ⬆]    ← 车头朝北  │  startY = nsBandTopPx
  │  [2号车]                         │
  │  ...                             │
  │  [8号车 — 车尾]                  │  endY = nsBandTopPx + 448px
  │                                  │
  │     （空白 — 南侧股道）            │
  │                                  │
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
  │         ▼ 南                     │
  └─────────────────────────────────┘
```

**关键公式**：
```
8编组起始偏移 = nsBandTopPx（南进时靠北）
```

#### 北进（列车从北向南行驶）

列车从北侧驶入站台，车头朝南，**靠南停车**，8节车厢从南停车标向上排列：

```
  ┌─────────────────────────────────┐
  │         ▲ 北                     │
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
  │                                  │
  │     （空白 — 北侧股道）            │
  │                                  │
  │  [1号车 — 车头 ⬇]    ← 车头朝南  │  startY = nsBandBottomPx - 448px
  │  [2号车]                         │
  │  ...                             │
  │  [8号车 — 车尾]                  │  endY = nsBandBottomPx
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
  │         ▼ 南                     │
  └─────────────────────────────────┘
```

**关键公式**：
```
8编组起始偏移 = nsBandBottomPx - 8 * CAR_UNIT_HEIGHT（北进时靠南）
```

#### 通用公式

```typescript
const CAR_UNIT_HEIGHT = 56;        // 每节车厢高度（含间隙），px
const MAX_CARS = 16;                // 最大编组
const nsBandDistance = MAX_CARS * CAR_UNIT_HEIGHT;  // = 896px

// 编组起始 Y（车厢 1 号顶部位置）
const getFormationStartY = (carCount: number, entryDir: '南' | '北'): number => {
  if (carCount === 16) return nsBandTopPx;  // 16编组：对齐北停车标
  // 8编组：南进靠北 = 对齐北停车标，北进靠南 = 对齐南停车标
  return entryDir === '南'
    ? nsBandTopPx                              // 靠北
    : nsBandBottomPx - carCount * CAR_UNIT_HEIGHT; // 靠南
};
```

### 2.4 车厢定位

每节车厢的垂直位置基于 `CAR_UNIT_HEIGHT` 固定步长计算：

```typescript
// 车厢编号→垂直位置（按当前编组方向和停车位）
const getCarYPx = (carNum: number): number => {
  const idx = carNumbers.indexOf(carNum);
  return formationStartY + idx * CAR_UNIT_HEIGHT;
};
```

其中 `carNumbers` 按编组方向排列：
- **正序**：`[1, 2, 3, ..., N]`
- **倒序**：`[N, ..., 3, 2, 1]`

### 2.5 引导屏定位

引导屏卡片的目标车厢号可微调，垂直位置与对应车厢对齐：

```typescript
const getScreenYPx = (screen: GuideScreen): number => {
  const idx = carNumbers.indexOf(screen.targetCar);
  return formationStartY + idx * CAR_UNIT_HEIGHT + CAR_UNIT_HEIGHT / 2;
  // 引导屏卡片中心对齐车厢中心
};
```

### 2.6 引导屏双向移动与碰撞预防

**单屏移动**：点击 ↑↓ 箭头，目标车厢号 ±1，自动钳制到 `[1, carCount]`。

**全部移动**：所有屏整体平移，保持相对间距：

```typescript
const moveAllScreens = (delta: number) => {
  setScreens(prev => {
    // 按目标车厢号排序，计算增量
    const sorted = [...prev].sort((a, b) => a.targetCar - b.targetCar);
    const minCar = sorted[0].targetCar + delta;
    const maxCar = sorted[sorted.length - 1].targetCar + delta;

    // 如果整体移动后超出范围，自动调整增量
    const clampedDelta = delta > 0
      ? Math.min(delta, carCount - maxCar)  // 上移：不能超出最大车厢号
      : Math.max(delta, 1 - minCar);         // 下移：不能低于1号车厢

    return prev.map(s => ({
      ...s,
      targetCar: s.targetCar + clampedDelta,
    }));
  });
};
```

---

## 🔍 现存问题清单

### P0 — 必须修复

| ID | 问题 | 严重性 | 涉及文件/行 | 说明 |
|----|------|--------|------------|------|
| P0-1 | **方向/进站未从列车数据初始化** | 高 | `FormationDrawer.tsx:40-41` | `direction` 和 `entryDirection` 初始化为固定值（'正序'/'南'），不读取 `train.formationDirection` 和 `train.formationOrder` |
| P0-2 | **8/16节切换时引导屏越界** | 高 | 新增 `useEffect` | 切换到少编组时，targetCar 超出车厢范围的引导屏未自动钳制 |
| P0-3 | **缺少保存/恢复机制** | 高 | 底部按钮区 | 所有变更仅在本地 state 中，关闭即丢失。与其他抽屉行为不一致 |
| P0-4 | **地标颜色逻辑与主表不一致** | 高 | `FormationDrawer.tsx:73-81` | 主表 `getLandmarkColor(formation, direction, order)` 三参数，抽屉内 `getLandmarkColorBy(carCount, direction)` 只有两参数 |
| P0-5 | **8编组布局错误** | 高 | 全篇重做 | 当前实现将8节车厢拉伸填满股道高度，与设计原则不符。应按16节基准固定每节高度，8节时靠北/靠南定位 |

### P1 — 重要修复

| ID | 问题 | 严重性 | 涉及文件/行 | 说明 |
|----|------|--------|------------|------|
| P1-1 | **车头朝向计算错误** | 中 | `FormationDrawer.tsx:162` | `isHeadAtNorth = entryDirection === '南'` 忽略 direction（正序/倒序） |
| P1-2 | **slotHeight 与 carHeightPx 冗余且定位偏差** | 中 | `FormationDrawer.tsx:56-61,150-160` | 两个独立计算值不一致，导致引导屏位置与车厢不完全对齐 |
| P1-3 | **引导屏南北区概念在UI中无体现** | 中 | 可视化区域 | zone 字段只用于排序，无视觉区分 |
| P1-4 | **全部移动不保持相对间距** | 中 | `FormationDrawer.tsx:136-148` | 逐元素 clamp 破坏相对顺序 |
| P1-5 | **股道高度不固定** | 中 | `FormationDrawer.tsx:56-58` | 当前高度随编组数变化，与"固定股道"设计原则相悖 |

### P2 — 体验优化

| ID | 问题 | 严重性 | 涉及文件/行 | 说明 |
|----|------|--------|------------|------|
| P2-1 | **CSS class 与 inline style 冲突** | 低 | `style.css:2664-2676` | `formation-screen-badge` 定义 `flex-direction: column` 但 inline 使用 `row` |
| P2-2 | **缺少空状态/加载态** | 低 | `FormationDrawer.tsx:63` | `train=null` 时直接 `return null` |
| P2-3 | **缺少 `@name` JSDoc 注释** | 低 | `FormationDrawer.tsx:1` | 不符合开发规范 |
| P2-4 | **引导屏 Mock 数据硬编码** | 低 | `FormationDrawer.tsx:24-29` | 不与编组数关联，16→8切换时越界 |

---

## 🛠 整改方案

### P0 修复

#### P0-1: 从 train 数据初始化方向/进站

```typescript
const defaultDirection = train.formationOrder === '↓' ? '倒序' : '正序';
const defaultEntryDirection = train.formationDirection;
const [direction, setDirection] = useState<'正序' | '倒序'>(defaultDirection);
const [entryDirection, setEntryDirection] = useState<'南' | '北'>(defaultEntryDirection);

// useEffect 同步 train 变化
useEffect(() => {
  if (train) {
    const newDir = train.formationOrder === '↓' ? '倒序' : '正序';
    setDirection(newDir);
    setEntryDirection(train.formationDirection);
    setCarCount(train.formation === '16' ? '16' : '8');
  }
}, [train]);
```

#### P0-2: 引导屏目标车厢合法性校验

```typescript
useEffect(() => {
  setScreens(prev => prev.map(s => ({
    ...s,
    targetCar: Math.min(s.targetCar, formationNum),
  })));
}, [formationNum]);  // formationNum 在 carCount 变化时同步更新
```

#### P0-3: 添加保存/恢复默认

在底部控制栏增加右侧按钮组，参考 TimeAdjustDrawer 的交互模式：

```typescript
// 保存初始快照
const [initialState, setInitialState] = useState({
  carCount: defaultCarCount,
  direction: defaultDirection,
  entryDirection: defaultEntryDirection,
  screens: mockGuideScreens,
});

const handleReset = () => {
  setCarCount(initialState.carCount);
  setDirection(initialState.direction);
  setEntryDirection(initialState.entryDirection);
  setScreens(initialState.screens);
};

const handleSave = () => {
  // TODO: 提交数据
  onClose();
};
```

#### P0-4: 统一地标颜色计算

从 `index.tsx` 导出 `getLandmarkColor` 或复制相同的三参数实现到 FormtionDrawer：

```typescript
const getLandmarkColor = (formation: string, order: string) => {
  if (formation === '8') return order === '↑' ? '#007AFF' : '#9B59B6';
  if (formation === '16') return order === '↑' ? '#F39C12' : '#27AE60';
  return '#999';
};

// 调用
const order = direction === '正序' ? '↑' : '↓';
const landmarkColor = getLandmarkColor(carCount, order);
```

> 注意：主表的三参数 `getLandmarkColor(formation, direction, order)` 中第二个参数 `direction` 目前未实际影响颜色输出，待后续与主表统一接口签名。

#### P0-5: 重做编组定位逻辑（核心改动）

**现状**：每节车厢高度 = `nsBandDistance / carCount`，8节和16节的车厢高度不同。

**修改**：固定每节车厢高度为 `CAR_UNIT_HEIGHT = 56px`，16节刚好填满股道：

```typescript
const CAR_UNIT_HEIGHT = 56;       // 每节车厢高度 px（固定值）
const MAX_CARS = 16;              // 最大编组数
const nsBandDistance = MAX_CARS * CAR_UNIT_HEIGHT;  // = 896px
const nsBandTopPx = 80;           // 北停车标 Y
const nsBandBottomPx = nsBandTopPx + nsBandDistance;  // 南停车标 Y = 976px
const trackHeight = nsBandBottomPx + 80;  // 总画布高度 = 1056px

const formationNum = parseInt(carCount);
const carNumbers = useMemo(() => {
  const nums = Array.from({ length: formationNum }, (_, i) => i + 1);
  return direction === '倒序' ? nums.reverse() : nums;
}, [formationNum, direction]);

// 编组起始 Y — 关键逻辑
const formationStartY = useMemo(() => {
  if (formationNum === 16) return nsBandTopPx;
  // 8编组：南进靠北，北进靠南
  return entryDirection === '南' ? nsBandTopPx : nsBandBottomPx - formationNum * CAR_UNIT_HEIGHT;
}, [formationNum, entryDirection]);

// 车厢垂直位置
const getCarYPx = (carNum: number): number => {
  const idx = carNumbers.indexOf(carNum);
  return formationStartY + idx * CAR_UNIT_HEIGHT;
};

// 引导屏垂直位置（中点对齐车厢）
const getScreenYPx = (screen: GuideScreen): number => {
  const idx = carNumbers.indexOf(screen.targetCar);
  return formationStartY + idx * CAR_UNIT_HEIGHT + CAR_UNIT_HEIGHT / 2;
};
```

### P1 修复

#### P1-1: 修正车头朝向计算

```typescript
// 正序：车头=1号车；倒序：车头=N号车
// 车头朝北的条件：进站方向为南（列车从南向北行驶，头朝北）
//  且为正序（1号车=车头在北端）
//  或倒序时车头在南端 → 头朝南
const isHeadAtNorth = entryDirection === '南' ? direction === '正序' : direction === '倒序';
```

#### P1-2: 统一使用 CAR_UNIT_HEIGHT 定位

消除 `slotHeight` 和 `carHeightPx` 两个冗余变量，全部基于 `CAR_UNIT_HEIGHT` 计算：

```typescript
// 唯一的高度常量
const CAR_UNIT_HEIGHT = 56;
// gapPx 通过 CAR_UNIT_HEIGHT 内部的 padding 实现，或在车厢块内用 margin
```

#### P1-3: 体现南北分区

在引导屏区域添加一条横贯的水平虚线，标记股道中点（448px 偏移处），并加小标签 "南/北分区"。也可在右侧面板引导屏列表中每组屏标题加上 `[南区] / [北区]` 前缀。

#### P1-4: 修正全部移动

```typescript
const moveAllScreens = (delta: number) => {
  setScreens(prev => {
    const cars = prev.map(s => s.targetCar + delta);
    const maxCar = Math.max(...cars);
    const minCar = Math.min(...cars);
    // 如果整体越界，自动截断增量
    const clampedDelta = delta > 0
      ? Math.min(delta, formationNum - maxCar)
      : Math.max(delta, 1 - minCar);
    return prev.map(s => ({
      ...s,
      targetCar: Math.round(s.targetCar + clampedDelta),
    }));
  });
};
// moveAllUp = () => moveAllScreens(-1)
// moveAllDown = () => moveAllScreens(+1)
```

#### P1-5: 固定股道高度

按照 2.1 节固定值实现，取消动态高度计算。

### P2 修复

#### P2-1: 统一 CSS 与 inline style

```css
/* style.css - 修正 */
.formation-screen-badge {
  display: flex;
  flex-direction: row;       /* 改为 row 以匹配 inline */
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid;
  min-width: 160px;
  max-width: 280px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
```

#### P2-2: 空状态

```typescript
if (!visible) return null;
if (!train) {
  return (
    <div style={{ /* ... */ }}>
      <div>暂无列车数据</div>
    </div>
  );
}
```

#### P2-3: JSDoc

```typescript
/**
 * @name 编组维护抽屉
 *
 */
```

#### P2-4: 引导屏数据自适应生成

```typescript
// 根据编组数和进站方向生成默认引导屏
const generateDefaultScreens = (carCount: '8' | '16', entryDirection: '南' | '北'): GuideScreen[] => {
  const num = parseInt(carCount);
  const mid = Math.floor(num / 2);
  return [
    { id: 's1', name: 'A站台东侧引导屏', zone: 'north', targetCar: Math.min(2, num) },
    { id: 's2', name: 'B站台西侧引导屏', zone: 'north', targetCar: Math.min(mid, num) },
    { id: 's3', name: 'C站台东侧引导屏', zone: 'south', targetCar: Math.min(mid + 1, num) },
    { id: 's4', name: 'D站台西侧引导屏', zone: 'south', targetCar: Math.min(num - 1, num) },
  ];
};
```

---

## 📊 内容规划

### 2.1 信息架构

```
编组维护抽屉
├── 头部区域（Header）
│   ├── 标题：编组维护
│   ├── 当前车次胶囊（大号）
│   ├── [接续/折返标记 + 关联车次胶囊]（条件显示，可点击跳转）
│   └── 关闭按钮
│
├── 主区域（Scrollable, flex:1）
│   ├── 左侧：编组可视化示意图
│   │   ├── 南北方向标记 / 停车标 P（固定位置）
│   │   ├── 股道指示条（竖条，南北停车标之间 = 896px）
│   │   ├── 车厢队列（垂直排列，单节高度 56px，固定）
│   │   │   ├── 车头（高亮 — 地标色填充 + 车头标记）
│   │   │   └── 普通车厢（灰色填充 + 编号文字）
│   │   ├── 空闲股道区域（8编组时的空白段，浅灰条纹）
│   │   └── 引导屏卡片（浮层，可单独↑↓移动）
│   │
│   └── 底部控制栏
│       ├── 左侧：全部上移 / 全部下移
│       ├── 中间：地标色块 + 编组摘要 "8节 正序 南进 | 停车位: 北侧 | 车头: 朝北"
│       └── 右侧：恢复默认 / 保存
│
└── 右侧面板（200px，固定宽度）
    ├── 配置信息
    │   ├── 车型（Select: CR400AF/BF/CRH380A）
    │   ├── 编组数（Select: 8节/16节）
    │   ├── 编组方向（Select: 正序/倒序）
    │   ├── 进站方向（Select: 南进/北进）
    │   └── 地标颜色（只读色块 + 文字）
    ├── 编组预览摘要
    │   ├── 当前编组: X节
    │   ├── 编组方向: 正序/倒序
    │   ├── 车头位置: X车
    │   ├── 车尾位置: X车
    │   ├── 进站方向: 南/北
    │   ├── 停车位: 北侧/南侧
    │   └── 车头朝向: 朝北/朝南
    └── 引导屏列表
        └── 各引导屏项：名称 + 目标车厢号
```

### 2.2 数据来源

| 数据 | 来源 | 说明 |
|------|------|------|
| `train.formation` | 主表 TrainData | 编组数（'8'/'16'） |
| `train.formationDirection` | 主表 TrainData | 编组方向（'北'/'南'）→ 初始化 `entryDirection` |
| `train.formationOrder` | 主表 TrainData | 编组顺序（'↑'/'↓'）→ 初始化 `direction` |
| 引导屏配置 | Mock / 后端 | 4块引导屏，按编组数自动生成初始位置 |

### 2.3 关键字段映射

| 字段 | 类型 | 说明 | 默认值来源 |
|------|------|------|-----------|
| `carCount` | `'8' \| '16'` | 编组节数 | `train.formation` |
| `direction` | `'正序' \| '倒序'` | 编组方向 | `train.formationOrder === '↓' → '倒序'` |
| `entryDirection` | `'南' \| '北'` | 进站方向 | `train.formationDirection` |
| `formationStartY` | `number` | 编组起始Y位置 | 见 2.3 通用公式 |
| `screens` | `GuideScreen[]` | 引导屏配置 | 根据 `carCount` 自动生成 |

### 2.4 地标颜色规则

| 编组数 | 编组顺序 | 颜色 | 色值 |
|--------|---------|------|------|
| 8节 | 正序(↑) | 蓝色 | `#007AFF` |
| 8节 | 倒序(↓) | 紫色 | `#9B59B6` |
| 16节 | 正序(↑) | 黄色 | `#F39C12` |
| 16节 | 倒序(↓) | 绿色 | `#27AE60` |

### 2.5 停车位与朝向推导

| 进站方向 | 编组方向 | 停车位 | 车头朝向 | 车头位置 |
|---------|---------|--------|---------|---------|
| 南进 | 正序 | 北侧 | 朝北 | 1号车（北端） |
| 南进 | 倒序 | 北侧 | 朝南 | 8/16号车（南端） |
| 北进 | 正序 | 南侧 | 朝南 | 1号车（南端） |
| 北进 | 倒序 | 南侧 | 朝北 | 8/16号车（北端） |

---

## 🎨 布局与结构

### 3.1 整体布局

- **布局模式**：固定双栏布局（左侧可视化 + 右侧配置面板）
- **抽屉宽度**：700px（固定）
- **右侧面板**：200px（固定宽度）
- **车厢高度**：**固定值 56px**（不随编组数变化）
- **股道净高**：**固定值 896px**（16编组 × 56px）

### 3.2 关键尺寸常量

| 常量名 | 值 | 说明 |
|--------|-----|------|
| `CAR_UNIT_HEIGHT` | 56px | 每节车厢高度（含间隙），固定 |
| `MAX_CARS` | 16 | 最大基础编组数 |
| `nsBandDistance` | 896px | 南北停车标间距（MAX_CARS × CAR_UNIT_HEIGHT） |
| `nsBandTopPx` | 80px | 北停车标 Y 位置（顶留白） |
| `nsBandBottomPx` | 976px | 南停车标 Y 位置（nsBandTopPx + nsBandDistance） |
| `trackHeight` | 1056px | 总画布高度（nsBandBottomPx + 底部留白80px） |
| 南北标记区宽 | 60px | 左侧方向标记+停车标 |
| 股道条宽 | 20px | 在南北标记和车厢之间 |
| 车厢块宽 | 130px | 宽度固定 |
| 引导屏卡片 | min-width 160px | 在示意图右侧浮动 |
| 右侧面板 | 200px | 固定宽度 |

### 3.3 8编组布局示意

**南进（靠北停车）** ：

```
  北 ▲
  ────  ← nsBandTopPx = 80
  ┌───┐
  │ 1 │  ← formationStartY = 80（靠北停车）
  │ 2 │
  │...│     448px（8节×56px）
  │ 8 │
  └───┘
  [   空   ]  ← 空闲股道区域（浅灰条纹背景）
  ────  ← nsBandBottomPx = 976
  南 ▼
```

**北进（靠南停车）** ：

```
  北 ▲
  ────  ← nsBandTopPx = 80
  [   空   ]  ← 空闲股道区域（浅灰条纹背景）
  ┌───┐
  │ 1 │  ← formationStartY = 976 - 448 = 528（靠南停车）
  │ 2 │
  │...│     448px（8节×56px）
  │ 8 │
  └───┘
  ────  ← nsBandBottomPx = 976
  南 ▼
```

---

## 🎨 视觉规范

### 4.1 设计规范来源

- **项目**：接续计划原型现有风格（`connection-plan/style.css`）
- **主题颜色**：灰白底色（`#FAF8F5`）、白色卡片区、蓝色主色调

### 4.2 自定义设计要点

| 元素 | 色值 | 用途 |
|------|------|------|
| 地标蓝 | `#007AFF` | 8节正序地标 |
| 地标紫 | `#9B59B6` | 8节倒序地标 |
| 地标黄 | `#F39C12` | 16节正序地标 |
| 地标绿 | `#27AE60` | 16节倒序地标 |
| 北向标记 | `#22C55E` | 绿色三角箭头 |
| 南向标记 | `#FA8C16` | 橙色三角箭头 |
| 站台标记 P | `#EF4444` | 红色圆环标记 |
| 空闲股道 | `#F0F0F0` 浅灰条纹 | 8编组时空闲股道区域背景 |

### 4.3 组件状态

| 元素 | 状态 | 样式 |
|------|------|------|
| 引导屏箭头 | 默认 | 白色背景，灰色实线边框 1px |
| 引导屏箭头 | 悬停 | 浅灰背景 `#F3F4F6`，深灰边框 `#9CA3AF` |
| 车厢块（普通） | 默认 | `#F3F4F6` 浅灰填充，`#D1D5DB` 边框 2px，圆角 6px |
| 车厢块（车头） | 默认 | 地标色渐变填充，白色文字 `#fff`，降阴影 |
| 引导屏卡片 | 默认 | 地标色边框 1.5px，`landmarkColor + 12` 背景色，阴影 0 1px 4px |
| 保存按钮 | 默认/禁用 | Ant Design Button primary / disabled |
| 恢复默认按钮 | 默认/禁用 | Ant Design Button default / disabled |

---

## ⚙️ 整改优先级与验收清单

### 整改执行计划

| 优先级 | 任务 | 涉及文件/行 | 说明 |
|--------|------|------------|------|
| **P0** | **股道固定高度重构** | `FormationDrawer.tsx` 全篇 | 引入 `CAR_UNIT_HEIGHT=56`、固定 `nsBandDistance`、8编组停车位定位 |
| P0 | direction/entryDirection 从 train 初始化 | `FormationDrawer.tsx:40-41` | 连带添加 `useEffect` 监听 train |
| P0 | 引导屏越界钳制 | `FormationDrawer.tsx` 新增 | 添加 `useEffect` 监听 formationNum |
| P0 | 保存/恢复默认 | `FormationDrawer.tsx` 底部 | 参考 TimeAdjustDrawer 模式 |
| P0 | 统一地标颜色计算 | `FormationDrawer.tsx:73-81` | 三参数→双参数精简，与主表对齐 |
| P1 | 车头朝向修正 | `FormationDrawer.tsx:162` | 将 direction 纳入计算 |
| P1 | 全部移动修正 | `FormationDrawer.tsx:136-148` | 整体平移+统一钳制 |
| P1 | 南北分区标识 | 可视化区域 | 添加分界虚线和标签 |
| P2 | CSS 样式统一 | `style.css:2664-2676` | flex-direction 改为 row |
| P2 | 空状态处理 | `FormationDrawer.tsx:63` | 显示提示信息 |
| P2 | JSDoc 注释 | `FormationDrawer.tsx:1` | 添加 `@name` |
| P2 | 引导屏数据生成 | `FormationDrawer.tsx:24-29` | 根据编组数动态生成 |

### 验收清单

- [ ] 16编组：1号车厢顶部对齐北停车标，16号车厢底部对齐南停车标
- [ ] 8编组南进：车厢从北停车标开始排列，空闲区域在下方
- [ ] 8编组北进：车厢从南停车标向上排列，空闲区域在上方
- [ ] 8编组时每节车厢高度与16编组相同（56px）
- [ ] 8→16切换时所有车厢填满，16→8切换时车厢收缩为半长
- [ ] 引导屏越界钳制：16→8切换时 targetCar>8 的屏自动钳制到8
- [ ] 方向/进站打开时正确显示 train 数据
- [ ] 有"保存"和"恢复默认"按钮
- [ ] 地标颜色与主表列一致
- [ ] 车头朝向：正序+南进→朝北，倒序+南进→朝南
- [ ] 引导屏全部上移/下移保持相对间距
- [ ] 空闲股道区域有浅灰条纹视觉提示（8编组）
- [ ] 文件头包含 `@name` 注释
- [ ] `train=null` 时显示空状态提示
