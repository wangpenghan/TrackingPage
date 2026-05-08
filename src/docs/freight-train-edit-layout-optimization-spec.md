# 非客运车次编辑页面布局优化设计方案

**版本：** v1.0  
**日期：** 2026-05-08  
**适用模块：** 客运模板 / 编辑抽屉 / 非客运车次配置布局

---

## 1. 现状问题分析

### 1.1 当前布局问题

| 问题编号 | 问题描述 | 影响 |
| :--- | :--- | :--- |
| P1 | 客运/非客运共用同一布局，检票配置虽然隐藏但占用空间定义冗余 | 页面信息结构不清晰，右侧栏不适配 |
| P2 | 右侧栏（w-72）主要设计用于检票口/候车室等客运专用配置，对非客运车次适用性差 | 非客运字段分散，检票配置隐藏后右侧栏显得空洞 |
| P3 | 非客运车次关键字段（到达/发车时间、股道、停车位、作业标记）分散在主区和右侧 | 用户需要反复切换视图才能完整填写 |
| P4 | 时间配置区域（检票时间）占用主区域大量高度，非客运不需要但隐藏代码未清理 | 渲染效率低，代码维护成本高 |
| P5 | 列车信息与空间配置信息没有按逻辑分区 | 字段查找困难，配置效率低 |

### 1.2 需求目标

- 为非客运车次设计专用的紧凑型布局
- 突出关键字段（到达/发车时间、股道、停车位、作业标记）
- 简化页面结构，提高可用性
- 保持与客运车次布局的一致性（通过条件渲染而非完全重写）
- 支持快速切换客运/非客运模式

---

## 2. 非客运车次的关键字段与分类

### 2.1 字段分类

| 分类 | 字段 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| **时间配置** | `arrivalTime`、`departureTime` | ✓ | 到达/发车时间，影响现场调度 |
| **空间配置** | `track`、`platform`、`parkingSpot` | ✓ | 股道、站台、停车位 |
| **编组配置** | `formation`、`model`、`formationDir` | ✓ | 编组数、车型、方向 |
| **作业配置** | `hasWater`、`hasSuction` | ○ | 上水、吸污作业需求 |
| **基础信息** | `trainNo`、`trainType`、`fromStation`、`toStation` | ✓ | 车次、类型、始终站 |
| **运行规律** | `cycle`、`rule`、`validStart`、`validEnd` | ✓ | 开行周期、有效期 |

### 2.2 隐藏字段（客运专用）

- `entryCheckBasis`、`entryCheckOffset`、`entryStopBasis`、`entryStopOffset`
- `exitCheckOffset`、`exitStopOffset`
- `gates`、`exitGate`、`waitingRoom`
- `landmarkColor`（非客运车次不需要）

---

## 3. 新布局方案设计

### 3.1 整体布局结构

```
┌──────────────────────────────────────────────────────────────────┐
│ 编辑客运模板                                 状态标签 [保存] [确认] [关闭] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─ 非客运车次专用布局 ────────────────────────────────────────┐ │
│ │                                                            │ │
│ │ [左侧主区域]                        [右侧快捷栏]          │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐      │ │
│ │ │ 基础信息             │  │ ⏱️  时间配置          │      │ │
│ │ ├──────────────────────┤  │ ┌──────────────────┐│      │ │
│ │ │ 车次号（*）          │  │ │ 到达时间          ││      │ │
│ │ │ 列车类型（*）        │  │ │ 发车时间          ││      │ │
│ │ │ 始发站（*）          │  │ └──────────────────┘│      │ │
│ │ │ 终到站（*）          │  │                      │      │ │
│ │ └──────────────────────┘  │ 📍 空间配置          │      │ │
│ │                           │ ┌──────────────────┐│      │ │
│ │ 列车编组配置             │ │ 股道 ⬜ 站台 ⬜  ││      │ │
│ │ ├──────────────────────┤  │ │ 停车位 ⬜       ││      │ │
│ │ │ 车型（*）            │  │ └──────────────────┘│      │ │
│ │ │ 编组（*）            │  │                      │      │ │
│ │ │ 编组方向（*）        │  │ ⚙️  作业配置        │      │ │
│ │ │ 担当局（*）          │  │ ┌──────────────────┐│      │ │
│ │ │ 列车等级（*）        │  │ │ ☐ 上水作业       ││      │ │
│ │ └──────────────────────┘  │ │ ☐ 吸污作业       ││      │ │
│ │                           │ └──────────────────┘│      │ │
│ │ 运行规律                 │                      │      │ │
│ │ ├──────────────────────┤  │ 📋 基本信息        │      │ │
│ │ │ 运行类型（*）        │  │ ┌──────────────────┐│      │ │
│ │ │ 起算基准（如隔日）   │  │ │ 状态: 有效/无效  ││      │ │
│ │ │ 起始有效期           │  │ │ 同步: 已同步/...  ││      │ │
│ │ │ 终止有效期           │  │ └──────────────────┘│      │ │
│ │ └──────────────────────┘  └──────────────────────┘      │ │
│ │                                                            │ │
│ │ 运行规律日历                                               │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ 日  一  二  三  四  五  六                            │ │ │
│ │ │ ...  🟦 🟨 🟦 🟨  ... (高亮显示开行日)              │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │                                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 左侧主区域布局（非客运模式）

#### 第一行：基础信息（2列）
```tsx
<div className="flex gap-2">
  <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-2">
    <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-1">
      基础信息 (非客运)
    </div>
    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
      {/* 车次号 */}
      {/* 列车类型 */}
      {/* 始发站 */}
      {/* 终到站 */}
    </div>
  </div>
  
  <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-2">
    <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-1">
      列车编组
    </div>
    <div className="grid grid-cols-3 gap-x-2 gap-y-1">
      {/* 车型 */}
      {/* 编组 */}
      {/* 编组方向 */}
      {/* 停车位 */}
      {/* 担当局 */}
      {/* 列车等级 */}
    </div>
  </div>
</div>
```

#### 第二行：运行规律（全宽）
```tsx
<div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
  <div className="text-[12px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded mb-1">
    运行规律
  </div>
  <div className="flex gap-2">
    {/* 左侧配置 */}
    <div className="w-[220px] flex-shrink-0">
      {/* 运行类型、起算基准、有效期等 */}
    </div>
    {/* 右侧日历 */}
    <div className="flex-1">
      {/* 日历显示 */}
    </div>
  </div>
</div>
```

### 3.3 右侧快捷栏布局（非客运模式）

#### 结构设计

右侧栏保持 `w-72` 宽度，但完全重新组织内容：

```tsx
<div className="w-72 overflow-y-auto border-l border-[#E5E7EB] bg-white flex-shrink-0">
  <div className="p-2 space-y-1.5">
    
    {/* 1. 时间配置 - 最高优先级 */}
    <div className="bg-[#EFF6FF] rounded-lg p-2 border border-[#5e6ad2]">
      <h3 className="text-[11px] font-bold text-[#5e6ad2] mb-1">⏱️ 时间配置</h3>
      <div className="space-y-1">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-medium text-[#6B7280]">
            <span className="text-[#EF4444]">*</span> 到达时间
          </label>
          <input type="time" value={formData.arrivalTime} onChange={...}
            className="h-7 px-2 rounded-md border border-[#5e6ad2] text-[12px] bg-[#FAFBFF] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-medium text-[#6B7280]">
            <span className="text-[#EF4444]">*</span> 发车时间
          </label>
          <input type="time" value={formData.departureTime} onChange={...}
            className="h-7 px-2 rounded-md border border-[#5e6ad2] text-[12px] bg-[#FAFBFF] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30" />
        </div>
      </div>
    </div>

    {/* 2. 空间配置 - 第二优先级 */}
    <div className="bg-[#EFF6FF] rounded-lg p-2 border border-[#5e6ad2]/50">
      <h3 className="text-[11px] font-bold text-[#5e6ad2] mb-1">📍 空间配置</h3>
      <div className="grid grid-cols-2 gap-1">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-medium text-[#6B7280]">
            <span className="text-[#EF4444]">*</span> 股道
          </label>
          <select value={formData.track} onChange={...}
            className="h-7 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] font-bold text-[#5e6ad2] bg-white text-center focus:outline-none focus:border-[#5e6ad2]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-medium text-[#6B7280]">
            <span className="text-[#EF4444]">*</span> 站台
          </label>
          <select value={formData.platform} onChange={...}
            className="h-7 px-1.5 rounded-md border border-[#D1D5DB] text-[12px] font-bold text-[#374151] bg-white text-center focus:outline-none focus:border-[#5e6ad2]" />
        </div>
      </div>
      <div className="flex flex-col gap-0.5 mt-1">
        <label className="text-[10px] font-medium text-[#6B7280]">
          <span className="text-[#EF4444]">*</span> 停车位
        </label>
        <select value={formData.parkingSpot} onChange={...}
          className="h-7 px-2 rounded-md border border-[#D1D5DB] text-[12px] bg-white focus:outline-none focus:border-[#5e6ad2]" />
      </div>
    </div>

    {/* 3. 作业配置 - 第三优先级 */}
    <div className="bg-[#FEF3C7] rounded-lg p-2 border border-[#D97706]/50">
      <h3 className="text-[11px] font-bold text-[#D97706] mb-1">⚙️ 作业配置</h3>
      <div className="space-y-1">
        <label className="flex items-center gap-2 p-1.5 bg-white rounded cursor-pointer hover:bg-[#F9F9F9]">
          <input type="checkbox" checked={formData.hasWater} onChange={...}
            className="w-3 h-3 rounded border-[#5e6ad2] text-[#5e6ad2] accent-[#5e6ad2]" />
          <span className="text-[11px] font-medium text-[#374151] flex-1">上水作业</span>
          <span className={cn('text-[9px] px-1 py-0.5 rounded', formData.hasWater ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
            {formData.hasWater ? '需要' : '不需'}
          </span>
        </label>
        <label className="flex items-center gap-2 p-1.5 bg-white rounded cursor-pointer hover:bg-[#F9F9F9]">
          <input type="checkbox" checked={formData.hasSuction} onChange={...}
            className="w-3 h-3 rounded border-[#D97706] text-[#D97706] accent-[#D97706]" />
          <span className="text-[11px] font-medium text-[#374151] flex-1">吸污作业</span>
          <span className={cn('text-[9px] px-1 py-0.5 rounded', formData.hasSuction ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
            {formData.hasSuction ? '需要' : '不需'}
          </span>
        </label>
      </div>
    </div>

    {/* 4. 编组摘要 */}
    <div className="bg-[#F9FAFB] rounded-lg p-2 border border-[#E5E7EB]">
      <h3 className="text-[11px] font-bold text-[#374151] mb-1">编组摘要</h3>
      <div className="text-[11px] text-[#6B7280] space-y-0.5">
        <div className="flex justify-between">
          <span>车型</span>
          <span className="font-medium text-[#111827]">{formData.model || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span>编组</span>
          <span className="font-medium text-[#111827]">{formData.formation || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span>方向</span>
          <span className="font-medium text-[#111827]">{formData.formationDir || '--'}</span>
        </div>
      </div>
    </div>

    {/* 5. 基本状态 */}
    <div className="bg-[#F9FAFB] rounded-lg p-2 border border-[#E5E7EB]">
      <h3 className="text-[11px] font-bold text-[#374151] mb-1">📋 基本状态</h3>
      <div className="text-[11px] text-[#6B7280] space-y-1">
        <div className="flex items-center justify-between">
          <span>有效状态</span>
          <div className="flex items-center gap-1.5">
            <Toggle checked={formData.isValid !== false} onChange={...} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>同步状态</span>
          <div className="flex items-center gap-1.5">
            <Toggle checked={formData.synced} onChange={...} />
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
```

---

## 4. UI 样式规范

### 4.1 标题栏的视觉区分

| 类型 | 背景色 | 文字色 | 图标 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| 非客运标题 | `#FEF3C7` | `#D97706` | ⚠️ | 整个编辑窗口标题改为琥珀色 |
| 时间配置 | `#EFF6FF` | `#5e6ad2` | ⏱️ | 蓝色，最高优先级 |
| 空间配置 | `#EFF6FF` | `#5e6ad2` | 📍 | 蓝色浅色边框 |
| 作业配置 | `#FEF3C7` | `#D97706` | ⚙️ | 琥珀色 |
| 编组摘要 | `#F9FAFB` | `#374151` | — | 灰色，只读信息 |

### 4.2 字段优先级标记

```
[*] 必填字段 - 红色 [*]
[○] 可选字段 - 无标记
```

---

## 5. 交互设计

### 5.1 模式切换（客运 ↔ 非客运）

```
用户修改车次号为非客运前缀（如 0G、DJ）
  ↓
系统自动检测 isFreightMode = true
  ↓
页面重新布局
  ├─ 隐藏左侧"检票时间"区域
  ├─ 右侧栏完全重新组织（时间→空间→作业→摘要）
  ├─ 页面标题换为琥珀色标记
  └─ 自动清空检票相关字段数据
  ↓
用户继续编辑
```

### 5.2 快捷输入流程（非客运）

**典型场景**：用户需要快速填写一条非客运车次

1. 输入车次号（系统自动识别为非客运）
2. 在右侧栏快速输入：
   - ⏱️ 到达/发车时间（最显眼）
   - 📍 股道、站台、停车位
   - ⚙️ 是否需要上水/吸污
3. 在左侧确认基本信息和编组配置
4. 配置运行规律（日历）
5. 点击保存

---

## 6. 代码结构建议

### 6.1 条件渲染优化

```tsx
// 当前代码：检票配置隐藏但仍渲染
{!isFreightMode && (
  <div className="flex gap-2">
    {/* 检票时间配置... */}
  </div>
)}

// 优化后：分离为独立组件
{isFreightMode ? (
  <FreightTrainEditLayout {...props} />
) : (
  <PassengerTrainEditLayout {...props} />
)}
```

### 6.2 右侧栏重构

```tsx
{isFreightMode ? (
  // 非客运专用布局
  <FreightTrainSidebar formData={formData} uf={uf} />
) : (
  // 客运专用布局
  <PassengerTrainSidebar formData={formData} uf={uf} />
)}
```

---

## 7. 实现优先级

| 优先级 | 功能 | 说明 |
| :--- | :--- | :--- |
| **P0** | 右侧栏优化（时间→空间→作业） | 核心优化，直接影响用户体验 |
| **P0** | 左侧检票配置区域隐藏优化 | 减少渲染冗余 |
| **P1** | 页面标题视觉区分 | 增强识别度 |
| **P1** | 编组摘要显示 | 辅助信息，提高可用性 |
| **P2** | 快捷输入流程优化 | 可选，未来迭代 |

---

## 8. 预期效果

### 优化前 vs 优化后

#### 优化前
- 右侧栏：空洞、检票配置堆积（非客运时隐藏，浪费空间）
- 用户需要逐个输入字段，效率低
- 页面结构不清晰

#### 优化后
- 右侧栏：清晰分区、优先级突出
- 时间/空间/作业配置一目了然
- 用户可以快速完成非客运车次配置
- 页面标题颜色提示当前模式
- 编组摘要快速验证数据

---

*文档结束*
