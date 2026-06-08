# 计划比对 - 冲突处理与处置记录设计规格

> 文档类型：功能设计规格  
> 创建日期：2026-06-01  
> 关联原型：`src/prototypes/plan-comparison/index.tsx`  
> 功能范围：冲突检测、冲突处理、处置记录

---

## 一、现状问题分析

### 1.1 冲突处理逻辑不清晰

**当前实现**：
- 冲突检测基于"已锁定的计划收到新修改"（`detectLockedPlanRegeneration`）
- 冲突状态只有 `none | detected | resolved` 三种
- 处理方式只有"应用新计划"和"保持锁定"两种，缺乏"审查"选项的实际处理

**问题**：
- 冲突的具体内容（哪些字段冲突）没有清晰展示
- 处理决策没有记录（为什么选择应用或保持）
- 无法追溯冲突处理的历史

### 1.2 页面配色眼花缭乱

**当前配色**：
- 变更类型：新增（绿）、减少（红）、变更（蓝）、无变化（灰）
- 核对状态：未核对（灰）、已核对（绿）、已确认（蓝）
- 冲突状态：待处理（红）、已处理（绿）
- 优先级：P0（红）、P1（黄）、P2（灰）

**问题**：
- 颜色过多（6+ 种），信息密度高
- 同一颜色用于不同维度（绿色既表示"新增"又表示"已核对"）
- 冲突相关的红色与"减少"的红色容易混淆

### 1.3 冲突处理流程不完整

**当前流程**：
1. 点击顶部"冲突"按钮 → 显示冲突列表抽屉
2. 点击冲突车次 → 显示冲突详情模态框
3. 选择"应用"或"保持" → 关闭模态框

**缺失**：
- 冲突详情中没有显示具体冲突的字段和数值对比
- 没有"审查"选项的实际处理（跳转到差异详情）
- 处理后没有处置记录的展示

---

## 二、冲突处理流程设计

### 2.1 冲突类型定义

```typescript
interface ConflictRecord {
  id: string;                          // 唯一标识
  trainNo: string;                     // 车次号
  conflictType: 'locked-regenerated';  // 冲突类型（当前仅支持此类型）
  detectedAt: string;                  // 检测时间
  lockedAt: string;                    // 锁定时间
  lockedBy: string;                    // 锁定人
  lockedReason: string;                // 锁定原因
  
  // 冲突内容
  conflictFields: ConflictField[];      // 冲突的字段列表
  oldData: templateData;               // 锁定时的数据
  newData: templateData;               // 新计划的数据
  
  // 处理信息
  resolution: 'pending' | 'applied' | 'kept' | 'reviewed';
  resolvedAt?: string;                 // 处理时间
  resolvedBy?: string;                 // 处理人
  resolutionReason?: string;           // 处理原因
  
  // 处置记录
  disposalRecords: DisposalRecord[];   // 处置历史
}

interface ConflictField {
  field: keyof templateData;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  conflictType: 'value-changed' | 'field-added' | 'field-removed';
}

interface DisposalRecord {
  id: string;
  conflictId: string;
  action: 'applied' | 'kept' | 'reviewed';
  actionLabel: string;
  timestamp: string;
  operator: string;
  reason?: string;
  affectedFields: string[];           // 受影响的字段
  notes?: string;
}
```

### 2.2 冲突处理流程

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 冲突检测                                                  │
│    - 已锁定的计划收到新修改                                  │
│    - 对比锁定时的数据与新计划数据                            │
│    - 识别冲突字段（按优先级排序）                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. 冲突列表展示                                              │
│    - 顶部"冲突 N"按钮（红色警告）                            │
│    - 点击打开冲突列表抽屉                                    │
│    - 显示所有冲突车次（按优先级排序）                        │
│    - 每条冲突显示：车次、冲突字段数、优先级、处理状态        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 冲突详情展示                                              │
│    - 点击冲突车次卡片 → 打开冲突详情抽屉                     │
│    - 显示冲突内容：                                          │
│      • 锁定信息（时间、人、原因）                            │
│      • 冲突字段对比（旧值 → 新值）                           │
│      • 优先级标签                                            │
│    - 显示处理选项：应用 / 保持 / 审查                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. 冲突处理                                                  │
│    - 应用：采用新计划数据，解锁车次，记录处置                │
│    - 保持：保留锁定状态，记录处置                            │
│    - 审查：跳转到差异详情，稍后处理                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. 处置记录展示                                              │
│    - 冲突标记消失（变为"已处理"）                            │
│    - 在车次卡片下方显示处置记录                              │
│    - 记录内容：处理时间、处理人、处理方式、原因              │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、UI 设计规格

### 3.1 冲突列表抽屉

**触发**：点击顶部"冲突 N"按钮

**布局**：右侧抽屉，宽度 400px

```
┌─────────────────────────────────────────┐
│ 冲突处理                          [×]    │
│ 共 N 条冲突车次，按优先级排序            │
├─────────────────────────────────────────┤
│ 搜索冲突车次 [搜索框]                    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ D3709                    [P0] 待处理 │ │
│ │ 冲突字段：发车时间、股道              │ │
│ │ 锁定于 2026-06-01 10:30              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ D3710                    [P1] 已处理 │ │
│ │ 冲突字段：编组                        │ │
│ │ 锁定于 2026-06-01 09:15              │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
└─────────────────────────────────────────┘
```

**冲突卡片样式**：
- 背景：`#FEF2F2`（浅红）
- 边框：`#FECACA`（浅红）
- 标题：车次号（粗体）+ 优先级标签 + 处理状态
- 内容：冲突字段列表 + 锁定时间
- 点击打开冲突详情抽屉

### 3.2 冲突详情抽屉

**触发**：点击冲突列表中的冲突卡片

**布局**：右侧抽屉，宽度 500px

```
┌──────────────────────────────────────────────┐
│ D3709 冲突详情                          [×]   │
├──────────────────────────────────────────────┤
│ 锁定信息                                      │
│ ├─ 锁定时间：2026-06-01 10:30                │
│ ├─ 锁定人：张三                              │
│ └─ 锁定原因：计划已确认，不再修改            │
├──────────────────────────────────────────────┤
│ 冲突内容（3 个字段冲突）                      │
│ ┌──────────────────────────────────────────┐ │
│ │ 发车时间                                  │ │
│ │ 旧值：09:00  →  新值：09:15               │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 股道                                      │ │
│ │ 旧值：3  →  新值：5                       │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 编组                                      │ │
│ │ 旧值：8  →  新值：16                      │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ 处理方式                                      │
│ ┌──────────────────────────────────────────┐ │
│ │ 选择处理方式：                            │ │
│ │ ○ 应用新计划（采用新数据，解锁车次）     │ │
│ │ ○ 保持锁定（保留原数据，继续锁定）       │ │
│ │ ○ 审查后处理（跳转差异详情，稍后处理）   │ │
│ │                                          │ │
│ │ 处理原因（可选）：                        │ │
│ │ [输入框_____________________________]     │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ [取消]                    [确认处理]          │
└──────────────────────────────────────────────┘
```

**冲突字段卡片**：
- 字段名称（粗体）
- 旧值 → 新值（对比展示，灰色删除线 + 蓝色新值）
- 简洁展示，无优先级标记

### 3.3 处置记录展示

**位置**：车次卡片下方（冲突处理后）

```
┌─────────────────────────────────────────────┐
│ D3709 | 09:00 | 3号 | 8编 | 绿 | [已处理]   │
├─────────────────────────────────────────────┤
│ 处置记录                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ 2026-06-01 11:30 | 李四 | 应用新计划    │ │
│ │ 原因：客流增加，需要增加编组             │ │
│ │ 受影响字段：发车时间、股道、编组         │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 2026-06-01 10:45 | 王五 | 审查后处理    │ │
│ │ 原因：需要与调度室确认                   │ │
│ │ 受影响字段：编组                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**处置记录卡片**：
- 时间戳（灰色）
- 操作人（灰色）
- 处理方式（彩色标签）
- 处理原因（可选）
- 受影响字段列表

---

## 四、配色方案优化

### 4.1 配色原则

- **维度分离**：不同维度用不同的颜色系统
- **优先级突出**：P0 最醒目，P1 次之，P2 最淡
- **状态清晰**：成功/待处理/进行中 用标准信号色

### 4.2 配色方案优化（简化版）

**核心原则**：避免重复标记，用最少的颜色传达信息

#### 当前问题：重复标记

当前实现中，变更类型被标记了两次：
1. **卡片整体变色**：背景渐变 + 左边框 + 阴影（绿/红/蓝/灰）
2. **标签标记**：右上角的"新增/减少/变更"标签

这导致信息冗余，占用过多视觉空间。

#### 简化方案

**方案 A：保留卡片变色，移除标签**（推荐）
- 卡片背景和左边框已经清晰表达了变更类型
- 移除右上角的"新增/减少/变更"标签
- 节省空间，减少视觉混乱
- 用户可以通过卡片颜色快速识别变更类型

**方案 B：保留标签，简化卡片**
- 卡片只用白色背景 + 1px 边框
- 保留左边框颜色（细化为 2px）
- 保留标签标记
- 更简洁，但失去了卡片的视觉层级感

**推荐采用方案 A**：
- 卡片变色是更强的视觉信号，用户一眼就能识别
- 标签是冗余的，可以删除
- 节省卡片空间，让内容更紧凑

#### 维度 1：变更类型（必要）

用于区分列表中的不同变更类型，通过卡片背景和左边框表达

| 类型 | 左边框 | 背景 | 说明 |
|------|--------|------|------|
| 新增 | `#10B981` | `#F0FDF4 → #ECFDF5` | 绿色渐变 |
| 减少 | `#EF4444` | `#FEF2F2 → #FEE2E2` | 红色渐变 |
| 变更 | `#3B82F6` | `#EFF6FF → #DBEAFE` | 蓝色渐变 |
| 无变化 | `#D1D5DB` | `#FFFFFF` | 白色 |

#### 维度 2：冲突状态（必要）

用于标记冲突的处理状态，与变更类型完全分离

| 状态 | 颜色 | 背景 | 说明 |
|------|------|------|------|
| 待处理 | `#DC2626` | `#FEE2E2` | 深红（警告） |
| 已处理 | `#059669` | `#ECFDF5` | 深绿（成功） |

#### 维度 3：核对状态（简化）

简化为"已处理/未处理"两种状态

| 状态 | 颜色 | 说明 |
|------|------|------|
| 未核对 | `#9CA3AF` | 灰色 |
| 已核对/已确认 | `#059669` | 绿色 |

#### 删除的颜色

- **变更类型标签** → 删除，用卡片背景代替
- **步骤指示器的三色** → 改为单一强调色（蓝色）
- **通知条的琥珀色** → 改为绿/红两色
- **其他辅助色** → 统一用灰色系

### 4.3 配色使用规则

- **卡片背景**：通过渐变背景和左边框表达变更类型，无需额外标签
- **冲突标记**：冲突卡片用"待处理"色（深红背景），已处理用"已处理"色（深绿背景）
- **冲突详情抽屉**：冲突字段用灰色背景，简洁展示字段名和新旧值对比
- **处置记录**：处理方式用对应的操作色（应用=绿、保持=灰）
- **核对状态**：统一用绿色表示"已处理"，灰色表示"未处理"

---

## 五、数据结构更新

### 5.1 planLockState 扩展

```typescript
interface planLockState {
  id: string;
  trainNo: string;
  diagramNo: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  lockedReason?: string;
  regeneratedAt?: string;
  regeneratedData?: templateData;
  
  // 新增：冲突处理
  conflictStatus?: 'none' | 'detected' | 'resolved';
  conflictFields?: ConflictField[];      // 冲突的字段列表
  conflictDetectedAt?: string;           // 冲突检测时间
  
  // 新增：处置记录
  disposalRecords?: DisposalRecord[];    // 处置历史
  lastResolution?: {
    action: 'applied' | 'kept' | 'reviewed';
    timestamp: string;
    operator: string;
    reason?: string;
  };
}

interface ConflictField {
  field: keyof templateData;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  priority: 'P0' | 'P1' | 'P2';
}

interface DisposalRecord {
  id: string;
  action: 'applied' | 'kept' | 'reviewed';
  timestamp: string;
  operator: string;
  reason?: string;
  affectedFields: string[];
}
```

### 5.2 冲突检测函数更新

```typescript
export function detectLockedPlanRegeneration(
  currentLocks: planLockState[],
  newPlan: templateData[]
): { regenerated: planLockState[]; conflicts: planLockState[] } {
  const regenerated: planLockState[] = [];
  const conflicts: planLockState[] = [];

  for (const lock of currentLocks) {
    if (!lock.isLocked) continue;

    const newData = newPlan.find(t => t.trainNo === lock.trainNo);
    if (!newData) continue;

    const changedFields = lock.regeneratedData
      ? detectFieldChanges(lock.regeneratedData, newData)
      : [];

    if (changedFields.length > 0) {
      // 转换为 ConflictField 格式
      const conflictFields: ConflictField[] = changedFields.map(cf => ({
        field: cf.field,
        fieldLabel: getFieldLabel(cf.field),
        oldValue: cf.oldValue,
        newValue: cf.newValue,
      }));

      regenerated.push({
        ...lock,
        regeneratedAt: new Date().toISOString(),
        regeneratedData: newData,
        conflictStatus: 'detected',
        conflictFields,
        conflictDetectedAt: new Date().toISOString(),
      });
      conflicts.push({
        ...lock,
        conflictStatus: 'detected',
        conflictFields,
      });
    }
  }

  return { regenerated, conflicts };
}
```

---

## 六、交互流程详细说明

### 6.1 冲突处理流程

#### 步骤 1：冲突检测与列表展示

```
用户操作：页面加载或计划更新
系统动作：
  1. 调用 detectLockedPlanRegeneration()
  2. 识别所有冲突（已锁定 + 新修改）
  3. 提取冲突字段，按优先级排序
  4. 显示顶部"冲突 N"按钮（红色警告）
  5. 冲突列表按优先级排序（P0 > P1 > P2）
```

#### 步骤 2：打开冲突列表

```
用户操作：点击顶部"冲突 N"按钮
系统动作：
  1. 打开右侧冲突列表抽屉
  2. 显示所有冲突车次卡片
  3. 每张卡片显示：
     - 车次号
     - 冲突字段数（按优先级分类）
     - 最高优先级标签
     - 处理状态（待处理/已处理）
     - 锁定时间
  4. 支持搜索和筛选
```

#### 步骤 3：查看冲突详情

```
用户操作：点击冲突列表中的冲突卡片
系统动作：
  1. 打开冲突详情抽屉
  2. 显示锁定信息：
     - 锁定时间、锁定人、锁定原因
  3. 显示冲突字段对比：
     - 按优先级排序（P0 > P1 > P2）
     - 每个字段显示：优先级、字段名、旧值、新值
  4. 显示处理选项：
     - 应用新计划（采用新数据，解锁）
     - 保持锁定（保留原数据，继续锁定）
     - 审查后处理（跳转差异详情）
  5. 提供处理原因输入框（可选）
```

#### 步骤 4：处理冲突

```
用户操作：选择处理方式并点击"确认处理"
系统动作（应用新计划）：
  1. 更新 planLockState：
     - isLocked = false
     - conflictStatus = 'resolved'
  2. 创建处置记录：
     - action = 'applied'
     - timestamp = 当前时间
     - operator = 当前用户
     - reason = 用户输入的原因
     - affectedFields = 冲突字段列表
  3. 更新 newPlan 数据（如需要）
  4. 关闭冲突详情抽屉
  5. 刷新冲突列表（该冲突消失或标记为已处理）
  6. 显示成功通知

系统动作（保持锁定）：
  1. 创建处置记录：
     - action = 'kept'
     - timestamp = 当前时间
     - operator = 当前用户
     - reason = 用户输入的原因
  2. 更新 conflictStatus = 'resolved'
  3. 关闭冲突详情抽屉
  4. 刷新冲突列表（该冲突标记为已处理）
  5. 显示成功通知

系统动作（审查后处理）：
  1. 创建处置记录：
     - action = 'reviewed'
     - timestamp = 当前时间
     - operator = 当前用户
  2. 跳转到差异详情页面
  3. 关闭冲突详情抽屉
  4. 冲突状态保持为 'detected'（待后续处理）
```

#### 步骤 5：显示处置记录

```
用户操作：冲突处理完成后，查看车次卡片
系统动作：
  1. 冲突标记消失（变为"已处理"或消失）
  2. 在车次卡片下方显示处置记录区块
  3. 显示最近的处置记录：
     - 时间戳
     - 操作人
     - 处理方式（彩色标签）
     - 处理原因
     - 受影响字段
  4. 支持展开/折叠处置记录历史
```

### 6.2 快捷操作

#### 批量处理冲突

```
用户操作：在冲突列表中选择多个冲突
系统动作：
  1. 显示"批量应用"、"批量保持"按钮
  2. 点击后弹出确认对话框
  3. 一次性处理所有选中冲突
  4. 显示处理结果统计
```

#### 冲突优先级排序

```
用户操作：打开冲突列表
系统动作：
  1. 默认按优先级排序（P0 > P1 > P2）
  2. 支持按处理状态排序（待处理 > 已处理）
  3. 支持按锁定时间排序（最新 > 最旧）
```

---

## 七、通知与反馈

### 7.1 成功通知

```
场景：冲突处理成功
显示：顶部绿色通知条
内容：
  - 应用新计划：✓ 已应用新计划，车次 D3709 已解锁
  - 保持锁定：✓ 已保持锁定状态，车次 D3709 继续锁定
  - 审查后处理：✓ 已跳转到差异详情，请审查后处理
持续时间：3 秒自动消失
```

### 7.2 警告通知

```
场景：冲突处理有风险
显示：顶部黄色通知条
内容：
  - 应用新计划会覆盖已锁定的数据，请确认
  - 保持锁定会忽略新计划的修改，请确认
```

### 7.3 错误通知

```
场景：冲突处理失败
显示：顶部红色通知条
内容：
  - 冲突处理失败，请重试
  - 数据保存失败，请检查网络连接
```

---

## 九、排序优化

### 9.1 当前问题

当前排序逻辑只按"锁定状态、车次号、发车时间"排序，没有按变更类型的优先级排序。

用户打开页面时看到的顺序是随机的，不够有目的性。

### 9.2 优化方案

**默认排序优先级**（从高到低）：

1. **变更类型优先级**（最重要）
   - 减少（最需要关注，可能影响运力）
   - 新增（需要确认）
   - 变更（需要审查）
   - 无变化（可以忽略）

2. **冲突状态**（次重要）
   - 有冲突（待处理）
   - 无冲突

3. **核对状态**（第三重要）
   - 未核对
   - 已核对
   - 已确认

4. **发车时间**（最后）
   - 按时间升序排列

**排序伪代码**：

```typescript
function compareByPriority(a, b) {
  // 1. 按变更类型优先级排序
  const typeOrder = { 'removed': 0, 'added': 1, 'modified': 2, 'unchanged': 3 };
  if (typeOrder[a.type] !== typeOrder[b.type]) {
    return typeOrder[a.type] - typeOrder[b.type];
  }
  
  // 2. 按冲突状态排序
  const aHasConflict = lockedConflicts.some(c => c.trainNo === a.trainNo) ? 0 : 1;
  const bHasConflict = lockedConflicts.some(c => c.trainNo === b.trainNo) ? 0 : 1;
  if (aHasConflict !== bHasConflict) {
    return aHasConflict - bHasConflict;
  }
  
  // 3. 按核对状态排序
  const checkOrder = { 'unchecked': 0, 'checked': 1, 'confirmed': 2 };
  const aCheckStatus = checkProgressMap.get(a.trainNo)?.checkStatus || 'unchecked';
  const bCheckStatus = checkProgressMap.get(b.trainNo)?.checkStatus || 'unchecked';
  if (checkOrder[aCheckStatus] !== checkOrder[bCheckStatus]) {
    return checkOrder[aCheckStatus] - checkOrder[bCheckStatus];
  }
  
  // 4. 按发车时间排序
  const timeA = a.newData?.departureTime || a.oldData?.departureTime || '00:00';
  const timeB = b.newData?.departureTime || b.oldData?.departureTime || '00:00';
  return timeA.localeCompare(timeB);
}
```

### 9.3 效果

**排序后的列表顺序**：

```
┌─────────────────────────────────────────┐
│ 减少（红色）- 有冲突 - 未核对           │
│ 减少（红色）- 有冲突 - 已核对           │
│ 减少（红色）- 无冲突 - 未核对           │
│ 减少（红色）- 无冲突 - 已核对           │
├─────────────────────────────────────────┤
│ 新增（绿色）- 有冲突 - 未核对           │
│ 新增（绿色）- 有冲突 - 已核对           │
│ 新增（绿色）- 无冲突 - 未核对           │
│ 新增（绿色）- 无冲突 - 已核对           │
├─────────────────────────────────────────┤
│ 变更（蓝色）- 有冲突 - 未核对           │
│ 变更（蓝色）- 有冲突 - 已核对           │
│ 变更（蓝色）- 无冲突 - 未核对           │
│ 变更（蓝色）- 无冲突 - 已核对           │
├─────────────────────────────────────────┤
│ 无变化（灰色）- 无冲突 - 已核对         │
└─────────────────────────────────────────┘
```

**用户体验**：
- 打开页面时立即看到最需要关注的"减少"变更
- 有冲突的车次聚集在一起，便于批量处理
- 未核对的车次排在前面，提醒用户需要处理
- 整个列表有明确的优先级顺序，更有目的性

### 8.1 优先级

1. **P0 - 冲突处理核心流程**
   - 冲突检测与列表展示
   - 冲突详情展示
   - 应用/保持处理逻辑

2. **P1 - 处置记录与配色优化**
   - 处置记录数据结构
   - 处置记录展示
   - 配色方案更新
   - 排序优化

3. **P2 - 增强功能**
   - 批量处理
   - 审查后处理跳转
   - 处置记录导出

### 8.2 关键文件修改

- `types.ts`：扩展 `planLockState`，新增 `ConflictField` 和 `DisposalRecord` 接口
- `index.tsx`：
  - 更新冲突检测逻辑
  - 新增冲突详情抽屉组件
  - 优化排序逻辑（按变更类型 > 冲突状态 > 核对状态 > 发车时间）
  - 新增处置记录展示组件
  - 更新配色方案
- `style.css`：新增冲突相关样式类

### 8.3 测试场景

- 单个冲突处理（应用/保持/审查）
- 多个冲突处理
- 处置记录展示与历史查询
- 配色在不同主题下的显示效果
- 快捷键支持（如 Ctrl+Enter 确认处理）

---

## 九、顶部筛选栏优化

### 9.1 当前问题

**问题 1：默认和选中颜色分不清楚**
- 默认状态：白色背景 + 灰色文字 + 灰色边框
- 选中状态：渐变背景 + 深色文字 + 彩色边框
- 但"全部"按钮的默认状态和其他按钮的选中状态都是浅蓝色，容易混淆

**问题 2：交互逻辑混乱**
- 变更类型和核对状态混在一起，没有清晰的分组
- "全部"按钮既可以筛选变更类型，也可以筛选核对状态
- 冲突按钮是独立的，与其他筛选按钮的交互逻辑不一致
- 用户不清楚点击按钮后会发生什么

**问题 3：视觉层级不清晰**
- 所有按钮大小相同，没有优先级区分
- 重要的筛选条件（变更类型）和次要的筛选条件（核对状态）没有区分
- 冲突按钮的重要性没有突出

### 9.2 优化方案

#### 方案 A：分组 + 清晰的选中状态（推荐）

**布局**：
```
┌─────────────────────────────────────────────────────────────┐
│ 变更类型：[全部] [新增] [减少] [变更] [无变化]              │
│ 核对状态：[全部] [未核对] [已核对]                          │
│ [冲突 N]                                    [搜索框]        │
└─────────────────────────────────────────────────────────────┘
```

**样式规则**：

1. **分组标签**（灰色，左对齐）
   - 字体：12px，灰色 `#6B7280`
   - 右边距：8px

2. **默认按钮**（清晰的未选中状态）
   - 背景：白色 `#FFFFFF`
   - 边框：1px 灰色 `#D1D5DB`
   - 文字：灰色 `#6B7280`
   - 无颜色提示

3. **选中按钮**（强烈的选中状态）
   - 背景：对应颜色的渐变（绿/红/蓝/灰）
   - 边框：2px 对应颜色
   - 文字：深色 + 加粗
   - 阴影：轻微阴影增强视觉

4. **Hover 状态**（轻微反馈）
   - 背景：对应颜色的浅色
   - 边框：1px 对应颜色

**颜色对应**：
- 新增：绿色 `#10B981`
- 减少：红色 `#EF4444`
- 变更：蓝色 `#3B82F6`
- 无变化：灰色 `#9CA3AF`
- 已核对：绿色 `#10B981`
- 未核对：琥珀色 `#F59E0B`（警告色，提醒用户有待处理项）

#### 方案 B：标签页式（更激进）

**布局**：
```
┌─────────────────────────────────────────────────────────────┐
│ [变更类型 ▼] [核对状态 ▼] [冲突 N]      [搜索框]           │
└─────────────────────────────────────────────────────────────┘
```

**优势**：
- 节省空间
- 清晰的分组
- 下拉菜单避免按钮过多

**劣势**：
- 需要额外点击才能看到选项
- 不如方案 A 直观

**推荐采用方案 A**：
- 所有筛选条件一目了然
- 用户可以快速切换筛选条件
- 视觉反馈清晰

### 9.3 交互优化

#### 筛选逻辑

**变更类型筛选**：
- 点击"全部"：显示所有变更类型
- 点击"新增/减少/变更/无变化"：只显示该类型
- 同时只能选择一个变更类型

**核对状态筛选**：
- 点击"全部"：显示所有核对状态
- 点击"未核对/已核对"：只显示该状态
- 同时只能选择一个核对状态

**冲突筛选**：
- 点击"冲突 N"：切换显示/隐藏冲突车次
- 与其他筛选条件独立，可以组合使用
- 按钮状态：未激活（浅红）→ 激活（深红）

#### 默认状态

- 变更类型：全部
- 核对状态：全部
- 冲突：不显示（如果有冲突，显示按钮但未激活）

#### 快捷操作

- 点击"只看差异"复选框：隐藏"无变化"的车次
- 搜索框：实时搜索车次号

### 9.4 样式代码示例

```css
/* 筛选组 */
.pc-filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pc-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
}

/* 筛选按钮 */
.pc-filter-tab {
  padding: 6px 14px;
  border: 1px solid #D1D5DB;
  background-color: #FFFFFF;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.15s;
}

.pc-filter-tab:hover {
  border-color: #9CA3AF;
  background-color: #F9FAFB;
}

/* 选中状态 - 通用 */
.pc-filter-tab.active {
  border-width: 2px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 选中状态 - 变更类型 */
.pc-filter-tab.pc-filter-tab-added.active {
  background: linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%);
  border-color: #10B981;
  color: #047857;
}

.pc-filter-tab.pc-filter-tab-removed.active {
  background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
  border-color: #EF4444;
  color: #B91C1C;
}

.pc-filter-tab.pc-filter-tab-modified.active {
  background: linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%);
  border-color: #3B82F6;
  color: #1D4ED8;
}

/* 选中状态 - 核对状态 */
.pc-filter-tab.pc-filter-tab-checked.active {
  background: linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%);
  border-color: #10B981;
  color: #047857;
}

.pc-filter-tab.pc-filter-tab-unchecked.active {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-color: #F59E0B;
  color: #B45309;
}

/* 冲突按钮 */
.pc-conflict-btn {
  padding: 6px 12px;
  border: 1px solid #FECACA;
  background-color: #FEF2F2;
  color: #DC2626;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.pc-conflict-btn:hover {
  background-color: #FEE2E2;
}

.pc-conflict-btn.active {
  background-color: #DC2626;
  color: #FFFFFF;
  border-color: #DC2626;
}
```

### 9.5 实现建议

1. **重构筛选栏 HTML**
   - ✅ 已完成：分离变更类型和核对状态的分组
   - ✅ 已完成：添加分组标签
   - ✅ 已完成：调整冲突按钮的位置

2. **增强选中状态的视觉反馈**（需要改进）
   - 当前：蓝色边框 + 白色背景
   - 改进：蓝色渐变背景 + 加粗边框 + 深蓝文字
   - 代码：
     ```css
     .pc-filter-tab.active {
       background: linear-gradient(135deg, #EEF0FB 0%, #E0E7FF 100%);
       border: 2px solid #5e6ad2;
       color: #5e6ad2;
       font-weight: 700;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
     }
     ```

3. **为未核对状态添加警告色**（需要改进）
   - 当前：灰色边框，与默认状态无区分
   - 改进：琥珀色边框 + 琥珀色文字，提醒用户有待处理项
   - 代码：
     ```css
     .pc-filter-tab.pc-filter-tab-unchecked {
       border-color: #F59E0B;
       color: #D97706;
     }
     
     .pc-filter-tab.pc-filter-tab-unchecked.active {
       background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
       border-color: #F59E0B;
       color: #B45309;
       font-weight: 700;
     }
     ```

4. **统一冲突按钮样式**（需要改进）
   - 当前：红色文字 + 红色圆圈图标
   - 改进：红色背景 + 白色文字（未激活）或深红背景（激活）
   - 代码：
     ```css
     .pc-conflict-btn {
       padding: 6px 12px;
       background-color: #FEF2F2;
       border: 1px solid #FECACA;
       color: #DC2626;
       font-weight: 700;
       border-radius: 6px;
       cursor: pointer;
       transition: all 0.15s;
     }
     
     .pc-conflict-btn:hover {
       background-color: #FEE2E2;
     }
     
     .pc-conflict-btn.active {
       background-color: #DC2626;
       color: #FFFFFF;
       border-color: #DC2626;
     }
     ```

5. **测试场景**
   - 单个筛选条件的切换
   - 多个筛选条件的组合
   - 搜索框与筛选条件的组合
   - 冲突按钮的激活/取消
   - 未核对状态的警告色显示
