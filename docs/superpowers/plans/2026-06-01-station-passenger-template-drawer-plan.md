# Station Passenger Template Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the station passenger template edit drawer layout, reduce blank space, and keep water/sewage tags on one line while documenting the change.

**Architecture:** Reuse the existing `EditDrawer` React component, adjusting utility classes for both passenger and freight modes, and enhance the header with a tooltip. Update accompanying spec and requirements docs to reflect the new layout.

**Tech Stack:** React 18 + TypeScript, Tailwind-style utility classes, project markdown documentation

---

### Task 1: Update spec.md with the approved layout changes

**Files:**
- Modify: `src/prototypes/station-passenger-template/spec.md`

- [ ] **Step 1: Expand editdrawer section to describe the new layout**

  Replace the existing `editdrawer` bullet with:

  ```markdown
  ### `editdrawer`
  
  - **位置**: `components/editdrawer.tsx`
  - **布局**:
    - 客运模式抽屉最大宽度 `max-w-[960px]`，区块统一 `p-2`，栅格间距 `gap-x-2 gap-y-1.5`
    - “编组配置”使用两列排布，底部上水/吸污标签与状态徽章同排展示，徽章最小宽度固定
    - 非客运模式保留黄色主题，细化 padding，并在标题加入“非客运模板：仅显示作业配置字段”提示
  ```

- [ ] **Step 2: Review the section to ensure terminology remains全小写 and matches component names**

### Task 2: Record the requirement update for v1.2

**Files:**
- Modify: `src/prototypes/station-passenger-template/requirements.md`

- [ ] **Step 1: Add v1.2 to the需求历史总览表**

  Insert the row immediately after v1.1:

  ```markdown
  | v1.2 | 2026-06-01 | 优化 | 编辑抽屉布局收紧，修复作业标签换行 | 进行中 |
  ```

- [ ] **Step 2: Append a new详细 section for v1.2**

  Add at the end of the document:

  ```markdown
  ## v1.2 | 编辑抽屉布局优化
  
  ### 需求信息
  - **版本号**: v1.2
  - **需求日期**: 2026-06-01
  - **需求类型**: 优化
  - **需求状态**: 进行中
  
  ### 需求内容
  - 客运模式抽屉宽度及内边距收紧，消除底部大块留白
  - “编组配置”区域调整为两列，字段高度统一
  - 上水作业、吸污作业标签在不同模式下保持单行展示
  - 非客运标题添加“非客运模板：仅显示作业配置字段”提示
  ```

- [ ] **Step 3: After实现并验收本次优化，把该节的状态从“进行中”改为“已完成”**

### Task 3: Refactor EditDrawer layout for passenger and freight modes

**Files:**
- Modify: `src/prototypes/station-passenger-template/components/EditDrawer.tsx`

- [ ] **Step 1: Tighten the drawer shell padding and max widths**

  Update the wrapper classes so passenger mode uses a 960px max width and the main column gains consistent spacing:

  ```tsx
  <div className={cn(
    'relative bg-[#F9FAFB] shadow-2xl flex flex-col h-full overflow-hidden rounded-l-xl',
    isFreightMode ? 'w-full max-w-[780px]' : 'w-full max-w-[960px]'
  )}>
  ...
  <div className="flex-1 overflow-hidden p-2 space-y-1.5">
  ```

- [ ] **Step 2: Adjust the header title to include the freight tooltip**

  Replace the heading block with:

  ```tsx
  <div className="flex items-center gap-2">
    <Train className={cn('w-4 h-4', isFreightMode ? 'text-[#D97706]' : 'text-[#5e6ad2]')} />
    <h2
      className={cn('text-[15px] font-bold', isFreightMode ? 'text-[#D97706]' : 'text-[#111827]')}
      title={isFreightMode ? '非客运模板：仅显示作业配置字段' : undefined}
    >
      {isFreightMode ? '⚠️ 编辑非客运模板' : '编辑客运模板'}
    </h2>
  </div>
  ```

- [ ] **Step 3: Compress passenger-mode基础信息 gap and control heights**

  Within the客运 `基础信息` card, switch the grid to tighter gaps and consistent control heights:

  ```tsx
  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
    ...
    <input ... className="h-7 px-2 rounded-md border border-[#5e6ad2] text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20" />
  ```

- [ ] **Step 4: Rebuild the passenger编组配置 grid to two columns**

  Change the card body to a two-column grid and move the作业标签行到 `col-span-2`：

  ```tsx
  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
    ...
    <div className="col-span-2 flex gap-2 pt-1">
      <label className={cn('flex flex-1 items-center justify-between gap-2 p-2 rounded border cursor-pointer',
        formData.hasWater ? 'bg-[#ECFDF5] border-[#10B981]' : 'bg-[#F9FAFB] border-[#D1D5DB]')}>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={formData.hasWater ?? false} onChange={e => uf('hasWater', e.target.checked)} className="w-4 h-4 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
          <span className="text-[11px] font-medium text-[#374151] whitespace-nowrap">上水作业</span>
        </div>
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded min-w-[52px] text-center',
          formData.hasWater ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
          {formData.hasWater ? '需要' : '不需要'}
        </span>
      </label>
      <label className={cn('flex flex-1 items-center justify-between gap-2 p-2 rounded border cursor-pointer',
        formData.hasSuction ? 'bg-[#ECFDF5] border-[#10B981]' : 'bg-[#F9FAFB] border-[#D1D5DB]')}>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={formData.hasSuction ?? false} onChange={e => uf('hasSuction', e.target.checked)} className="w-4 h-4 rounded border-[#D1D5DB] text-[#5e6ad2] accent-[#5e6ad2]" />
          <span className="text-[11px] font-medium text-[#374151] whitespace-nowrap">吸污作业</span>
        </div>
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded min-w-[52px] text-center',
          formData.hasSuction ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
          {formData.hasSuction ? '需要' : '不需要'}
        </span>
      </label>
    </div>
  </div>
  ```

- [ ] **Step 5: Apply the same single-row treatment to freight mode作业标签**

  Replace the freight-only section with a vertically stacked container to keep badges aligned:

  ```tsx
  <div className="flex flex-col gap-2 pt-1">
    <label className={cn('flex items-center justify-between gap-2 p-2 rounded border cursor-pointer',
      formData.hasWater ? 'bg-[#ECFDF5] border-[#10B981]' : 'bg-[#F9FAFB] border-[#E5E7EB]')}>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={formData.hasWater ?? false} onChange={e => uf('hasWater', e.target.checked)} className="w-4 h-4 rounded border-[#D97706] text-[#D97706] accent-[#D97706]" />
        <span className="text-[12px] font-medium text-[#374151] whitespace-nowrap">上水作业</span>
      </div>
      <span className={cn('text-[11px] px-1.5 py-0.5 rounded min-w-[52px] text-center',
        formData.hasWater ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
        {formData.hasWater ? '需要' : '不需要'}
      </span>
    </label>
    <label className={cn('flex items-center justify-between gap-2 p-2 rounded border cursor-pointer',
      formData.hasSuction ? 'bg-[#ECFDF5] border-[#10B981]' : 'bg-[#F9FAFB] border-[#E5E7EB]')}>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={formData.hasSuction ?? false} onChange={e => uf('hasSuction', e.target.checked)} className="w-4 h-4 rounded border-[#D97706] text-[#D97706] accent-[#D97706]" />
        <span className="text-[12px] font-medium text-[#374151] whitespace-nowrap">吸污作业</span>
      </div>
      <span className={cn('text-[11px] px-1.5 py-0.5 rounded min-w-[52px] text-center',
        formData.hasSuction ? 'bg-[#10B981] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]')}>
        {formData.hasSuction ? '需要' : '不需要'}
      </span>
    </label>
  </div>
  ```

- [ ] **Step 6: Normalize spacing in passenger运行规律和其他信息卡片**

  Ensure both cards use the same tightened gap and control heights:

  ```tsx
  <div className="flex gap-2">
    <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-1.5">
      <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">运行规律</div>
      <div className="flex gap-2 h-[240px]">
        <div className="flex flex-col gap-1.5 flex-1">
          ...
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-1.5 min-w-0">
      <div className="text-[12px] font-bold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded mb-1">其他信息</div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        ...
      </div>
    </div>
  </div>
  ```

- [ ] **Step 7: Verify both modes keep water/污 span text on a single line**

  Inspect the two sections to ensure each `span` uses `whitespace-nowrap` and `min-w-[52px] text-center`.

### Task 4: Run the project's type-check after edits

**Commands:**
- Execute in repository root: `pnpm typecheck`
- Expected: command exits with status 0 and no TypeScript errors

---

## Self-Review Checklist

- Each spec requirement (width tightening, two-column编组, single-line作业标签, tooltip) is covered by Tasks 1-3.
- No placeholders: every step includes concrete code or commands.
- Naming is consistent with existing lowercase conventions and uses existing helper `uf`/`cn` functions.
