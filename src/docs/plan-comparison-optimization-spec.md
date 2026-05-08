# 计划比对页面优化设计方案

**版本：** v1.0  
**日期：** 2026-05-08  
**适用模块：** 盯控页面 / 计划比对 / 差异识别与锁定管理

---

## 1. 背景与目标

### 1.1 现状问题

| 编号 | 问题描述 | 影响 |
| :--- | :--- | :--- |
| P1 | 差异展示不直观，用户需要逐行对比才能发现变化 | 效率低，容易遗漏变化点 |
| P2 | 缺少差异分类标记（新增/减少/变更），用户无法快速定位关键变化 | 用户需要手工对照纸质文件逐一核对 |
| P3 | 已锁定计划被后台重新生成时，页面直接忽略，用户无感知 | 数据不一致，用户可能基于过期数据做决策 |
| P4 | 缺少"全部解锁"和"同步更新"的交互入口 | 用户无法快速处理批量变更 |
| P5 | 无差异预览面板，用户需要在表格和详情间反复切换 | 操作流程冗长 |

### 1.2 目标

- 直观展示差异类型（新增/减少/变更），用颜色编码快速识别
- 自动检测后台重新生成的锁定计划，提示用户处理
- 提供"全部解锁"和"同步更新"的快速操作入口
- 增加差异预览面板，支持一屏内对比关键变化
- 简化用户核对流程，提高效率

---

## 2. 业务流程梳理

### 2.1 完整流程

```
客运模板完成
    ↓
后台自动生成次日到发计划（新计划）
    ↓
计划比对页面加载
    ├─ 加载今日计划（旧计划）
    ├─ 加载次日新计划
    ├─ 自动对比差异
    └─ 展示差异汇总
    ↓
用户核对纸质文件
    ├─ 新增车次 ✓
    ├─ 减少车次 ✓
    ├─ 变更字段 ✓
    └─ 确认无误
    ↓
用户操作
    ├─ 全部锁定（后台不再自动修改）
    └─ 同步更新（应用新计划）
    ↓
后台处理
    ├─ 若发现不一致，重新生成新计划
    └─ 若已锁定，忽略重新生成（旧逻辑）
    ↓
【问题】已锁定计划被重新生成，用户无感知
```

### 2.2 优化后流程

```
后台重新生成锁定计划
    ↓
系统检测到锁定计划被覆盖
    ↓
页面弹出提示：「检测到计划变更，已锁定的计划已被重新生成」
    ├─ [查看新变化]  → 展示新的差异
    ├─ [保持锁定]    → 忽略新生成，继续使用旧锁定计划
    └─ [应用新计划]  → 解锁并应用新生成的计划
    ↓
用户选择处理方式
```

---

## 3. 差异类型与视觉编码

### 3.1 差异分类

| 差异类型 | 代码 | 说明 | 颜色 | 图标 |
| :--- | :--- | :--- | :--- | :--- |
| 新增车次 | `added` | 新计划中有，旧计划中无 | 绿色（`#10B981`） | `Plus` |
| 减少车次 | `removed` | 旧计划中有，新计划中无 | 红色（`#EF4444`） | `Minus` |
| 字段变更 | `modified` | 车次存在，但某些字段值不同 | 蓝色（`#3B82F6`） | `Edit` |
| 无变化 | `unchanged` | 完全相同 | 灰色（`#D1D5DB`） | — |

### 3.2 变更字段优先级

按影响程度排序，优先展示高优先级变更：

| 优先级 | 字段 | 业务含义 |
| :--- | :--- | :--- |
| P0 | `arrivalTime`、`departureTime` | 到发时间变更，直接影响旅客 |
| P0 | `track`、`platform` | 股道/站台变更，影响现场调度 |
| P1 | `gates`、`exitGate` | 检票口/出站口变更，影响旅客流向 |
| P1 | `formation`、`model` | 编组/车型变更，影响运力 |
| P2 | `entryCheckOffset`、`exitCheckOffset` | 检票时间偏移变更 |
| P2 | 其他字段 | 内部管理信息 |

---

## 4. UI 设计方案

### 4.1 页面整体布局

```
┌─────────────────────────────────────────────────────────────────────┐
│ 计划比对                                                             │
├─────────────────────────────────────────────────────────────────────┤
│ 今日计划 vs 次日新计划                                               │
│ 差异汇总：新增 3 · 减少 1 · 变更 5 · 无变化 15                      │
│                                                                     │
│ [全部解锁]  [同步更新]  [导出对比]  🔍 搜索车次                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ 差异预览面板（右侧固定，宽度 320px）─────────────────────────┐  │
│ │ 差异统计                                                      │  │
│ │ ┌─────────────────────────────────────────────────────────┐ │  │
│ │ │ 新增 3 条                                               │ │  │
│ │ │ · G1234 (09:10 - 09:25)                                │ │  │
│ │ │ · D5678 (14:30 - 14:45)                                │ │  │
│ │ │ · Z9999 (22:00 - 22:15)                                │ │  │
│ │ │                                                         │ │  │
│ │ │ 减少 1 条                                               │ │  │
│ │ │ · G4321 (10:00 - 10:15)                                │ │  │
│ │ │                                                         │ │  │
│ │ │ 变更 5 条                                               │ │  │
│ │ │ · G7181: 股道 4→5, 发车时间 09:10→09:25               │ │  │
│ │ │ · D3710: 检票口变更                                     │ │  │
│ │ │ · ...                                                   │ │  │
│ │ └─────────────────────────────────────────────────────────┘ │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌─ 对比表格（左侧主区域）──────────────────────────────────────┐  │
│ │ 车次  类型  到达  发车  股道  站台  检票口  状态  操作         │  │
│ │ ─────────────────────────────────────────────────────────── │  │
│ │ G473  始发  09:10 09:25  4    4    4A、5A  ✓无变  [详情]    │  │
│ │ G1234 始发  10:00 10:15  5    5    5A、5B  ✨新增  [详情]    │  │
│ │ D3710 途径  14:30 14:45  2    2    2A      ⚠️变更  [详情]    │  │
│ │ G7181 始发  15:00 15:15  4→5  4    4A、5A  ⚠️变更  [详情]    │  │
│ │ G4321 始发  10:00 10:15  3    3    3A      ❌减少  [详情]    │  │
│ │ ...                                                         │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 差异标记样式

#### 新增车次行

```tsx
<tr className="bg-green-50 border-l-4 border-green-500">
  <td className="text-green-700 font-semibold">
    <Plus size={16} className="inline mr-1" />
    G1234
  </td>
  {/* 其他字段 */}
  <td className="text-green-600 text-sm">新增</td>
</tr>
```

#### 减少车次行

```tsx
<tr className="bg-red-50 border-l-4 border-red-500 opacity-60">
  <td className="text-red-700 font-semibold line-through">
    <Minus size={16} className="inline mr-1" />
    G4321
  </td>
  {/* 其他字段 */}
  <td className="text-red-600 text-sm">减少</td>
</tr>
```

#### 字段变更行

```tsx
<tr className="bg-blue-50 border-l-4 border-blue-500">
  <td className="text-blue-700 font-semibold">
    <Edit size={16} className="inline mr-1" />
    D3710
  </td>
  <td>途径</td>
  <td>14:30</td>
  <td>14:45</td>
  <td className="bg-yellow-100 font-semibold">2 → 2</td>
  {/* 变更字段高亮 */}
  <td className="bg-yellow-100 font-semibold">2A → 2B</td>
  <td className="text-blue-600 text-sm">变更</td>
</tr>
```

#### 无变化行

```tsx
<tr className="bg-white">
  <td className="text-gray-700">G473</td>
  {/* 其他字段 */}
  <td className="text-gray-500 text-sm">无变</td>
</tr>
```

---

## 5. 核心功能设计

### 5.1 自动差异检测

```ts
interface PlanDifference {
  trainNo: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  oldData?: TemplateData
  newData?: TemplateData
  changedFields?: {
    field: keyof TemplateData
    oldValue: any
    newValue: any
    priority: 'P0' | 'P1' | 'P2'
  }[]
}

function detectPlanDifferences(
  oldPlan: TemplateData[],
  newPlan: TemplateData[]
): PlanDifference[] {
  const oldMap = new Map(oldPlan.map(t => [t.trainNo, t]))
  const newMap = new Map(newPlan.map(t => [t.trainNo, t]))
  const differences: PlanDifference[] = []

  // 检测新增和变更
  for (const [trainNo, newData] of newMap) {
    const oldData = oldMap.get(trainNo)
    if (!oldData) {
      differences.push({ trainNo, type: 'added', newData })
    } else {
      const changedFields = detectFieldChanges(oldData, newData)
      if (changedFields.length > 0) {
        differences.push({
          trainNo,
          type: 'modified',
          oldData,
          newData,
          changedFields: changedFields.sort((a, b) => {
            const priorityOrder = { P0: 0, P1: 1, P2: 2 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          }),
        })
      } else {
        differences.push({ trainNo, type: 'unchanged', oldData, newData })
      }
    }
  }

  // 检测减少
  for (const [trainNo, oldData] of oldMap) {
    if (!newMap.has(trainNo)) {
      differences.push({ trainNo, type: 'removed', oldData })
    }
  }

  return differences
}

function detectFieldChanges(
  oldData: TemplateData,
  newData: TemplateData
): PlanDifference['changedFields'] {
  const SENSITIVE_FIELDS: Record<string, 'P0' | 'P1' | 'P2'> = {
    arrivalTime: 'P0',
    departureTime: 'P0',
    track: 'P0',
    platform: 'P0',
    gates: 'P1',
    exitGate: 'P1',
    formation: 'P1',
    model: 'P1',
    entryCheckOffset: 'P2',
    exitCheckOffset: 'P2',
  }

  const changes = []
  for (const [field, priority] of Object.entries(SENSITIVE_FIELDS)) {
    const oldVal = oldData[field as keyof TemplateData]
    const newVal = newData[field as keyof TemplateData]
    if (oldVal !== newVal) {
      changes.push({
        field: field as keyof TemplateData,
        oldValue: oldVal,
        newValue: newVal,
        priority,
      })
    }
  }
  return changes
}
```

### 5.2 锁定计划重新生成检测

```ts
interface PlanLockState {
  trainNo: string
  isLocked: boolean
  lockedAt: string
  lockedBy: string
  regeneratedAt?: string  // 后台重新生成的时间戳
  regeneratedData?: TemplateData
}

function detectLockedPlanRegeneration(
  currentLocks: PlanLockState[],
  newPlan: TemplateData[]
): { regenerated: PlanLockState[]; conflicts: PlanLockState[] } {
  const regenerated: PlanLockState[] = []
  const conflicts: PlanLockState[] = []

  for (const lock of currentLocks) {
    if (!lock.isLocked) continue

    const newData = newPlan.find(t => t.trainNo === lock.trainNo)
    if (!newData) continue

    // 检测数据是否被修改（通过比对关键字段）
    const hasChanges = detectFieldChanges(lock.regeneratedData || {}, newData).length > 0

    if (hasChanges) {
      regenerated.push({
        ...lock,
        regeneratedAt: new Date().toISOString(),
        regeneratedData: newData,
      })
      conflicts.push(lock)
    }
  }

  return { regenerated, conflicts }
}
```

### 5.3 全部解锁与同步更新

```ts
// 全部解锁：将所有已锁定的计划标记为未锁定
async function unlockAllPlans(planIds: string[]): Promise<void> {
  const response = await fetch('/api/plans/unlock-batch', {
    method: 'POST',
    body: JSON.stringify({ planIds }),
  })
  if (!response.ok) throw new Error('解锁失败')
}

// 同步更新：应用新计划，覆盖旧计划
async function syncUpdatePlans(newPlan: TemplateData[]): Promise<void> {
  const response = await fetch('/api/plans/sync-update', {
    method: 'POST',
    body: JSON.stringify({ newPlan }),
  })
  if (!response.ok) throw new Error('同步更新失败')
}

// 处理锁定计划重新生成冲突
async function handleLockedPlanConflict(
  trainNo: string,
  action: 'keep' | 'apply' | 'review'
): Promise<void> {
  const response = await fetch('/api/plans/handle-conflict', {
    method: 'POST',
    body: JSON.stringify({ trainNo, action }),
  })
  if (!response.ok) throw new Error('处理冲突失败')
}
```

---

## 6. 交互流程

### 6.1 页面加载流程

```
页面加载
  ↓
1. 获取今日计划（oldPlan）
2. 获取次日新计划（newPlan）
3. 获取当前锁定状态（locks）
  ↓
自动检测
  ├─ detectPlanDifferences(oldPlan, newPlan)
  ├─ detectLockedPlanRegeneration(locks, newPlan)
  └─ 生成差异汇总
  ↓
展示结果
  ├─ 差异预览面板（右侧）
  ├─ 对比表格（左侧）
  └─ 若有锁定计划冲突，弹出提示
```

### 6.2 锁定计划冲突处理流程

```
检测到锁定计划被重新生成
  ↓
弹出二次确认对话框
  ├─ 标题：「⚠️ 检测到计划变更」
  ├─ 内容：「以下已锁定的计划已被后台重新生成，请选择处理方式」
  ├─ 列表：显示冲突的车次及变更内容
  └─ 操作按钮：
      ├─ [查看新变化] → 展示新的差异详情
      ├─ [保持锁定]   → 忽略新生成，继续使用旧锁定计划
      └─ [应用新计划] → 解锁并应用新生成的计划
  ↓
用户选择
  ├─ 查看新变化 → 在差异预览面板中高亮显示冲突车次
  ├─ 保持锁定   → 关闭对话框，保持当前状态
  └─ 应用新计划 → 调用 handleLockedPlanConflict('apply')，刷新页面
```

### 6.3 全部解锁与同步更新流程

```
用户点击「全部解锁」
  ↓
弹出确认对话框
  ├─ 内容：「将解锁所有已锁定的计划，后台可继续自动修改」
  └─ 操作：[取消] [确认解锁]
  ↓
用户确认
  ├─ 调用 unlockAllPlans()
  ├─ 刷新页面
  └─ Toast 提示：「已解锁 N 条计划」

用户点击「同步更新」
  ↓
弹出确认对话框
  ├─ 内容：「将应用次日新计划，覆盖今日计划」
  ├─ 警告：「已锁定的计划将被解锁」
  └─ 操作：[取消] [确认更新]
  ↓
用户确认
  ├─ 调用 syncUpdatePlans(newPlan)
  ├─ 刷新页面
  └─ Toast 提示：「已同步更新 N 条计划」
```

---

## 7. 数据结构扩展

### 7.1 计划锁定状态

```ts
interface PlanLockState {
  id: string
  trainNo: string
  diagramNo: string          // 基本图号
  isLocked: boolean          // 是否锁定
  lockedAt: string           // 锁定时间
  lockedBy: string           // 锁定人员
  lockedReason?: string      // 锁定原因
  regeneratedAt?: string     // 后台重新生成时间
  regeneratedData?: TemplateData  // 重新生成的数据
  conflictStatus?: 'none' | 'detected' | 'resolved'  // 冲突状态
}
```

### 7.2 差异汇总

```ts
interface DifferenceSummary {
  totalCount: number
  addedCount: number
  removedCount: number
  modifiedCount: number
  unchangedCount: number
  differences: PlanDifference[]
  lockedConflicts: PlanLockState[]
}
```

---

## 8. 实现优先级

| 优先级 | 功能 | 说明 |
| :--- | :--- | :--- |
| P0 | 自动差异检测与分类 | 核心功能，支持新增/减少/变更识别 |
| P0 | 差异视觉编码 | 颜色和图标标记，快速识别 |
| P0 | 差异预览面板 | 右侧固定面板，一屏内展示汇总 |
| P1 | 锁定计划重新生成检测 | 检测冲突并提示用户 |
| P1 | 全部解锁与同步更新 | 快速操作入口 |
| P2 | 导出对比结果 | 支持 Excel/PDF 导出 |
| P2 | 高级筛选与搜索 | 按差异类型、优先级筛选 |

---

## 9. 与已有流程的关系

| 流程 | 与本方案的关系 |
| :--- | :--- |
| **客运模板同步** | 模板同步完成后，后台自动生成次日计划，触发计划比对 |
| **基本计划管理** | 计划比对的结果应用到基本计划，更新到发时间、股道等 |
| **同步状态管理** | 计划锁定状态与模板同步状态独立管理，但需要协调 |

---

## 10. 核对工作流优化（下午3点核对场景）

### 10.1 核对进度追踪

**业务场景**：用户核对到一半被打断，或多人协作时需要知道哪些已核对

**数据结构**：
```ts
interface CheckProgress {
  id: string
  trainNo: string
  diagramNo: string
  checkStatus: 'unchecked' | 'checked' | 'questioned' | 'confirmed'
  checkedBy?: string
  checkedAt?: string
  notes?: string
  questionType?: 'data_anomaly' | 'mismatch_paper' | 'need_approval'
}
```

**UI 设计**：
- 表格增加"核对状态"列，显示：
  - 未核对（灰色）：`○`
  - 已核对（绿色）：`✓`
  - 有疑问（黄色）：`?`
  - 已确认（蓝色）：`✔`
- 顶部显示进度条：`已核对 12/24 (50%) | 有疑问 2 | 未核对 10`
- 支持快速标记：点击行右侧的状态按钮快速切换
- 差异预览面板增加"未核对项"快速跳转链接

**交互流程**：
```
用户点击行右侧状态按钮
  ↓
弹出快速标记菜单
  ├─ [✓ 标记已核对]
  ├─ [? 标记有疑问]
  ├─ [✔ 标记已确认]
  └─ [📝 添加备注]
  ↓
状态更新，进度条实时刷新
```

---

### 10.2 纸质文件对照辅助

**业务场景**：用户手里有纸质文件，按时间顺序逐一核对

**功能设计**：

#### 时间排序
- 默认按**发车时间**排序（而非车次号）
- 支持按"到达时间"排序
- 支持按"时间段"筛选：
  - 早班（06:00-12:00）
  - 午班（12:00-18:00）
  - 晚班（18:00-24:00）

#### 打印功能
- 工具栏增加"打印差异清单"按钮
- 打印格式与纸质文件一致：
  ```
  次日计划差异清单
  生成时间：2026-05-08 14:30
  
  【新增车次】
  1. G1234 (09:10 - 09:25) 股道5 站台5
  2. D5678 (14:30 - 14:45) 股道2 站台2
  
  【减少车次】
  1. G4321 (10:00 - 10:15) 股道3 站台3
  
  【变更车次】
  1. G7181: 股道 4→5, 发车时间 09:10→09:25
  2. D3710: 检票口 2A→2B
  ```

#### 过滤模式
- 增加"仅显示有差异"过滤：隐藏无变化车次，快速定位变化点
- 支持按差异类型筛选：新增 / 减少 / 变更 / 无变化

---

### 10.3 快速标记与备注

**业务场景**：核对时发现问题需要记录，或需要后续确认

**UI 设计**：

每行操作区增加快速操作按钮：
```
[✓ 已核对]  [? 有疑问]  [📝 备注]  [详情]
```

**有疑问标记流程**：
```
┌─────────────────────────────────────────┐
│ G7181 - 标记疑问                        │
├─────────────────────────────────────────┤
│ 疑问类型：                              │
│ [○] 数据异常                            │
│ [○] 与纸质文件不符                      │
│ [○] 需要调度长确认                      │
│                                         │
│ 备注：                                  │
│ ┌─────────────────────────────────────┐ │
│ │ 股道变更需要确认是否影响站台布置    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│      [取消]  [保存并标记]               │
└─────────────────────────────────────────┘
```

**备注功能**：
- 支持添加自由文本备注
- 备注自动保存，显示在行内或详情中
- 支持@提及其他用户：`@李四 请确认这个变更`
- 备注历史可查看

---

### 10.4 时间维度信息

**业务场景**：用户需要知道计划何时生成、何时锁定

**UI 设计**：

页面顶部信息栏：
```
┌─────────────────────────────────────────────────────────┐
│ 次日计划生成时间：2026-05-08 14:30                      │
│ 上次核对时间：2026-05-08 14:20 (张三)                   │
│ 当前核对进度：已核对 12/24 (50%)                        │
└─────────────────────────────────────────────────────────┘
```

表格中显示：
- 新增/变更车次旁显示"生成时间"
- 已锁定车次显示：`🔒 已锁定（14:45 张三）`
- 有疑问车次显示：`⚠️ 有疑问（14:50 李四）`

---

### 10.5 键盘快捷键

**业务场景**：提高核对效率，减少鼠标操作

**快捷键设计**：
```
导航：
↑/↓         - 上一条/下一条车次
Home/End    - 跳转到第一条/最后一条
Page Up/Dn  - 上一页/下一页

操作：
Space       - 标记当前行为"已核对"
?           - 标记当前行为"有疑问"
Enter       - 查看详情
Ctrl+F      - 搜索车次
Ctrl+P      - 打印差异清单
Ctrl+E      - 导出对比结果

过滤：
Ctrl+1      - 显示所有
Ctrl+2      - 仅显示有差异
Ctrl+3      - 仅显示新增
Ctrl+4      - 仅显示减少
Ctrl+5      - 仅显示变更

其他：
Esc         - 关闭弹窗/取消操作
Ctrl+Z      - 撤销上一步操作
```

**快捷键提示**：
- 页面右下角显示"快捷键帮助"按钮
- 首次访问时弹出快捷键引导
- 支持自定义快捷键

---

### 10.6 批量操作优化

**业务场景**：某些车次确认无误后批量处理

**UI 设计**：

表格左侧增加复选框，工具栏增加批量操作按钮：
```
[☐ 全选]  [反选]  [批量标记已核对]  [批量锁定]  [批量解锁]

支持按条件快速选择：
[选择所有无变化]  [选择所有新增]  [选择所有变更]  [选择所有有疑问]
```

**批量操作流程**：
```
用户勾选多条车次
  ↓
工具栏显示"已选 N 条"
  ↓
用户点击"批量标记已核对"
  ↓
弹出确认对话框
  ├─ 内容：「将标记 N 条车次为已核对」
  └─ 操作：[取消] [确认]
  ↓
批量更新，进度条刷新
```

---

### 10.7 差异原因说明

**业务场景**：用户想知道为什么会有这个变化

**UI 设计**：

变更字段旁显示原因标签：
```
股道 4→5 (客运模板修改)
发车时间 09:10→09:25 (临时调整)
```

差异详情中显示完整信息：
```
┌─────────────────────────────────────────┐
│ G7181 变更详情                          │
├─────────────────────────────────────────┤
│ 变更字段：                              │
│ · 股道：4 → 5                           │
│ · 发车时间：09:10 → 09:25               │
│                                         │
│ 变更来源：客运模板                      │
│ 修改人员：李四                          │
│ 修改时间：2026-05-08 14:25              │
│ 修改原因：临时调整股道                  │
│                                         │
│ 影响范围：                              │
│ · 站台布置需要调整                      │
│ · 检票口可能需要重新分配                │
└─────────────────────────────────────────┘
```

---

### 10.8 历史对比

**业务场景**：识别异常模式，比如某车次连续多天变更

**UI 设计**：

车次详情中增加"近期变更历史"标签页：
```
┌─────────────────────────────────────────┐
│ G7181 - 近7日变更历史                   │
├─────────────────────────────────────────┤
│ 2026-05-08  股道 4→5, 发车时间变更      │
│ 2026-05-07  检票口变更                  │
│ 2026-05-06  编组变更                    │
│ 2026-05-05  无变化                      │
│ 2026-05-04  到达时间变更                │
│                                         │
│ ⚠️ 该车次近3日连续变更，请关注          │
└─────────────────────────────────────────┘
```

**异常标记**：
- 连续3日以上变更：`⚠️ 异常`
- 同一字段多次变更：`🔄 频繁变更`
- 变更后又改回：`↩️ 反复变更`

---

### 10.9 自动提醒

**业务场景**：避免忘记核对或超时

**提醒设计**：

| 提醒类型 | 触发条件 | 内容 |
| :--- | :--- | :--- |
| 计划生成提醒 | 下午3点 | 次日计划已生成，请及时核对 |
| 核对超时提醒 | 核对超过30分钟 | 核对已超过30分钟，当前进度 50%，预计剩余 15 分钟 |
| 新冲突提醒 | 检测到锁定计划被重新生成 | 检测到 2 条锁定计划被重新生成，请及时处理 |
| 未核对提醒 | 距离下班前30分钟 | 还有 10 条车次未核对，请加快进度 |
| 有疑问提醒 | 有疑问车次超过5条 | 有 6 条车次标记为有疑问，请确认是否需要调度长审批 |

**提醒方式**：
- 页面顶部 Toast 通知
- 浏览器桌面通知（可选）
- 邮件通知（可选）
- 钉钉/企业微信集成（可选）

---

### 10.10 统计面板

**业务场景**：管理层查看核对效率

**UI 设计**：

差异预览面板底部增加统计信息：
```
┌─────────────────────────────────────┐
│ 核对统计                            │
├─────────────────────────────────────┤
│ 总车次：24 条                       │
│ 已核对：12 条 (50%)                 │
│ 有疑问：2 条 (8%)                   │
│ 未核对：10 条 (42%)                 │
│                                     │
│ 平均用时：1.5 分钟/条               │
│ 预计剩余：15 分钟                   │
│ 核对人员：张三、李四                │
│                                     │
│ 差异统计：                          │
│ · 新增：3 条                        │
│ · 减少：1 条                        │
│ · 变更：5 条                        │
│ · 无变化：15 条                     │
└─────────────────────────────────────┘
```

**统计导出**：
- 支持导出核对报告（PDF/Excel）
- 包含核对进度、用时统计、疑问汇总等

---

## 11. 数据结构扩展

### 11.1 核对进度状态
```ts
interface CheckProgress {
  id: string
  trainNo: string
  diagramNo: string
  checkStatus: 'unchecked' | 'checked' | 'questioned' | 'confirmed'
  checkedBy?: string
  checkedAt?: string
  notes?: string
  questionType?: 'data_anomaly' | 'mismatch_paper' | 'need_approval'
  mentions?: string[]  // @提及的用户
}
```

### 11.2 疑问记录
```ts
interface QuestionRecord {
  id: string
  trainNo: string
  questionType: 'data_anomaly' | 'mismatch_paper' | 'need_approval'
  description: string
  createdBy: string
  createdAt: string
  resolvedBy?: string
  resolvedAt?: string
  resolution?: string
}
```

### 11.3 核对统计
```ts
interface CheckStatistics {
  diagramNo: string
  totalCount: number
  checkedCount: number
  questionedCount: number
  uncheckedCount: number
  averageTimePerTrain: number  // 分钟
  estimatedRemainingTime: number  // 分钟
  checkedByUsers: string[]
  startTime: string
  endTime?: string
}
```

---

## 12. 实现优先级（更新）

| 优先级 | 功能 | 说明 |
| :--- | :--- | :--- |
| **P0** | 核对进度追踪 | 核心缺失，影响工作连续性 |
| **P0** | 按时间排序+打印 | 直接影响纸质文件对照效率 |
| **P0** | 快速标记功能 | 提高核对效率的关键 |
| **P0** | 自动差异检测与分类 | 核心功能，支持新增/减少/变更识别 |
| **P0** | 差异视觉编码 | 颜色和图标标记，快速识别 |
| **P1** | 键盘快捷键 | 显著提升操作速度 |
| **P1** | 批量操作优化 | 减少重复操作 |
| **P1** | 时间维度信息 | 增强可追溯性 |
| **P1** | 锁定计划重新生成检测 | 检测冲突并提示用户 |
| **P1** | 全部解锁与同步更新 | 快速操作入口 |
| **P2** | 差异原因说明 | 辅助理解变化 |
| **P2** | 历史对比 | 识别异常模式 |
| **P2** | 自动提醒 | 避免遗漏 |
| **P2** | 统计面板 | 管理需求 |
| **P2** | 导出对比结果 | 支持 Excel/PDF 导出 |
| **P2** | 高级筛选与搜索 | 按差异类型、优先级筛选 |

---

*文档结束*
