# 计划比对页面需求文档

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-05-10 | 初始创建，整合数据编辑、优化清单与现有功能 |

---

## 1. 功能清单

### 核心功能

| 功能项 | 描述 | 优先级 |
|--------|------|--------|
| 差异自动检测与分类 | 对比两份计划，识别新增/减少/变更/无变化 | P0 |
| 差异汇总统计 | 顶部展示差异类型数量、核对进度 | P0 |
| 筛选与搜索 | 按差异类型、核对状态筛选，搜索车次 | P0 |
| 核对状态管理 | 标记未核对/已核对/有疑问/已确认 | P0 |
| 锁定与解锁 | 单条锁定/解锁、批量解锁、同步更新 | P1 |
| 冲突检测与处理 | 锁定计划被后台重生成时提示处理 | P1 |
| 数据编辑 | 弹窗编辑车次基础信息（始发/终到/时间/股道等） | P1 |
| 批量操作 | 选中车次批量核对、批量处理冲突 | P2 |
| 导出/打印 | 打印核对清单、导出对比结果 | P2 |

### 编辑功能字段列表

所有字段变量名保持小写：

| 字段 | 类型 | 说明 |
|------|------|------|
| originstation | string | 始发站 |
| terminalstation | string | 终到站 |
| arrivaltime | string | 到点（datetime-local 格式） |
| departuretime | string | 开点（datetime-local 格式） |
| track | string | 股道 |
| formation | string | 编组 |
| model | string | 车型 |
| watersupply | string | 上水（是/否） |
| sewagesuction | string | 吸污（是/否） |
| baggage | string | 行包（是/否） |

---

## 2. 优化清单（可落地项）

### P0：必须先修

1. **核对状态与疑问状态分离显示**
   - 避免图标重叠
   - 核对状态放在卡片头部主区域
   - 疑问状态作为附加提示放在合适位置

2. **统一车次颜色映射**
   - 始发：黄色系
   - 途径：紫色系
   - 终到：青色系

### P1：紧接着修

3. **强化变更类型视觉区分**
   - 新增：绿色 + 左侧色条 + 图标
   - 减少：红色 + 左侧色条 + 图标
   - 变更：蓝色或橙色 + 左侧色条 + 图标
   - 无变化：灰色

4. **重点变化突出处理**
   - P0 变更字段高亮显示
   - 重点车次（focusflag）添加视觉提示

### P2：体验优化

5. **布局间距与层级优化**
   - 调整卡片间距，保证视觉呼吸感
   - 信息层级清晰：车次 > 差异类型 > 核对状态

6. **多分辨率适配**
   - 检查在不同屏幕宽度下的显示稳定性
   - 关键信息不被截断

7. **快捷键使用引导**
   - 保持现有快捷键功能
   - 优化帮助弹窗的易读性

---

## 3. 数据模型

### 计划车次（templatedata）

```typescript
interface templatedata {
  id: string;
  trainno: string;
  traintype: 'high-speed' | 'normal';
  originstation?: string;
  terminalstation?: string;
  arrivaltime?: string;
  departuretime?: string;
  track?: string;
  platform?: string;
  gates?: string;
  exitgate?: string;
  formation?: string;
  model?: string;
  stopdirection?: string;
  orderdirection?: '正序' | '倒序';
  landmarkcolor?: '红' | '绿' | '黄' | '蓝';
  focusflag?: boolean;
  watersupply?: string;
  sewagesuction?: string;
  baggage?: string;
  entrycheckoffset?: number;
  exitcheckoffset?: number;
  status?: string;
}
```

### 差异（plandifference）

```typescript
interface plandifference {
  trainno: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  olddata?: templatedata;
  newdata?: templatedata;
  changedfields?: changedfield[];
}

interface changedfield {
  field: keyof templatedata;
  oldvalue: any;
  newvalue: any;
  priority: 'P0' | 'P1' | 'P2';
}
```

### 锁定状态（planlockstate）

```typescript
interface planlockstate {
  id: string;
  trainno: string;
  diagramno: string;
  islocked: boolean;
  lockedat?: string;
  lockedby?: string;
  lockedreason?: string;
  regeneratedat?: string;
  regenerateddata?: templatedata;
  conflictstatus?: 'none' | 'detected' | 'resolved';
}
```

### 核对进度（checkprogress）

```typescript
interface checkprogress {
  id: string;
  trainno: string;
  diagramno: string;
  checkstatus: 'unchecked' | 'checked' | 'questioned' | 'confirmed';
  checkedby?: string;
  checkedat?: string;
  notes?: string;
  questiontype?: 'data_anomaly' | 'mismatch_paper' | 'need_approval';
  mentions?: string[];
}
```

---

## 4. 页面结构

```
src/prototypes/plan-comparison/
├── index.tsx          # 主页面组件
├── types.ts           # 类型定义
├── mock-data.ts       # 模拟数据
├── style.css          # 样式
├── requirements.md    # 本文档
└── index.html         # 入口页
```

---

## 5. 验收标准

1. 编辑弹窗能够正确打开、填写、保存
2. 保存后差异列表自动重新计算并更新展示
3. 筛选、搜索、锁定、核对等功能正常工作
4. 视觉设计符合优化清单中的要求
