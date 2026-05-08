# 车站客运模板管理页面 - 规格文档

## 功能概述

车站客运模板管理页面，用于管理车站接发车作业模板，支持：
- 模板列表展示（车次、到发时间、股道站台、上水吸污等信息）
- 多条件筛选查询（车站、车次、车型、状态）
- 快捷状态筛选（未确认、未同步、已完成）
- 批量操作（批量确认、批量同步、批量删除）
- 单个模板操作（查看、编辑、确认、同步、删除）
- 展开/折叠查看详细信息
- 编辑抽屉支持修改模板所有字段

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- lucide-react 图标库
- class-variance-authority 组件变体管理

## 目录结构

```
src/prototypes/station-passenger-template/
├── index.tsx                    # 入口文件
├── types.ts                      # 类型定义（全小写）
├── spec.md                       # 本文档
├── requirements.md               # 需求记录
├── lib/
│   └── utils.ts                  # 工具函数
└── components/
    ├── templatecard.tsx          # 模板卡片组件（全小写）
    ├── templatelist.tsx          # 模板列表组件（全小写）
    ├── detailview.tsx            # 详情查看抽屉（全小写）
    ├── editdrawer.tsx            # 编辑抽屉（全小写）
    └── ui/
        └── variants.ts           # 组件变体定义（全小写）
```

## 数据结构

所有类型和字段均为全小写命名：

### `templatedata` 接口

```typescript
export interface templatedata {
  id: string
  trainnumber: string          // 出发车次
  arrivaltrainno?: string      // 到达车次/接续车次
  departuretrainno?: string    // 始发车次
  connectingtrain?: string     // 接续车次
  arrivaltime: string          // 到达时间
  departuretime: string        // 发车时间
  stopduration: number         // 站停时长（分钟）
  platform: string             // 站台
  track: string                // 股道
  parkingspot: string          // 停车位
  entrydirection: string       // 进路方向
  exitdirection: string       // 出站方向
  entrycheckbasis: string      // 开检基准
  entrycheckoffset: number     // 开检提前时间（分钟）
  entrystopbasis: string       // 停检基准
  entrystopoffset: number      // 停检提前时间（分钟）
  gates: string                // 检票口
  waitingroom: string          // 候车室
  exitgate: string             // 出站口
  formation: number            // 编组辆数
  formationdir: string         // 编组方向
  model: string                // 车型
  bureau: string               // 担当局
  station: string              // 所属车站
  fromstation: string          // 始发站
  tostation: string            // 终到站
  traintype: '始发' | '终到' | '途径'  // 列车类型
  cycle: number                // 运行周期
  rule: number                 // 运行规律
  diagramno: string            // 基本图号
  landmarkcolor: '绿' | '黄' | '蓝' | '紫'  // 地标颜色
  validstart: string           // 起始有效期
  validend: string             // 终止有效期
  isvalid: boolean             // 是否有效
  statusflag: string           // 状态标记
  confirmed: boolean           // 是否确认
  synced: boolean              // 是否同步
  operator: string             // 操作人员
  operatetime: string          // 操作时间
  exitbasis: string            // 出站检票基准
  haswater: boolean            // 是否需要上水
  hassuction: boolean          // 是否需要吸污
  capacity?: number            // 列车定员
  broadcastgroup?: string      // 广播分组
  trainnomode?: string         // 车次模式
  trainclass?: string          // 列车等级
  gatefromstation?: string     // 闸机始发站
  gatetostation?: string       // 闸机终到站
  starttime?: string           // 始发时间
  endtime?: string             // 终到时间
}
```

### `filteroptions` 接口

```typescript
export interface filteroptions {
  station: string
  trainnumber: string
  traintype: string
  validity: string
  status: string
  sortby: string
}
```

### `statustype` 类型

```typescript
export type statustype = 'red' | 'orange' | 'blue' | 'white'
```

## 组件设计

### 页面入口 `stationpassengertemplate`

- **位置**: `index.tsx`
- **功能**: 页面容器，渲染列表组件
- **导出**: 默认导出

### 列表组件 `templatelist`

- **位置**: `components/templatelist.tsx`
- **功能**:
  - 管理模板数据状态
  - 提供筛选栏（车站、车次、类型、排序）
  - 提供快捷筛选标签（全部、未确认、未同步、已完成）
  - 提供工具栏（批量操作、导入导出、添加）
  - 渲染模板卡片列表
  - 管理编辑抽屉状态
- **状态**:
  - `templates` - 模板数据数组
  - `filters` - 筛选条件
  - `selectedids` - 选中的模板ID列表
  - `expandedids` - 展开的模板ID集合
  - `iseditopen` - 编辑抽屉是否打开
  - `currentedittemplate` - 当前编辑的模板

### 卡片组件 `templatecard`

- **位置**: `components/templatecard.tsx`
- **功能**:
  - 单条模板信息展示
  - 根据状态显示不同背景颜色
  - 支持展开/折叠查看详情
  - 悬停显示操作按钮
  - 点击卡片切换选中和展开状态
- **Props**: `templatecardprops`
  - `template` - 模板数据
  - `isselected` - 是否选中
  - `isexpanded` - 是否展开
  - `onselect` - 选中回调
  - `onaction` - 操作回调
  - `ontoggleexpand` - 切换展开回调
  - `onviewdetail` - 查看详情回调

### 编辑抽屉 `editdrawer`

- **位置**: `components/editdrawer.tsx`
- **功能**: 编辑模板所有字段
- **Props**: `editdrawerprops`
  - `isopen` - 是否打开
  - `onclose` - 关闭回调
  - `template` - 当前编辑的模板
  - `onsave` - 保存回调

### 详情查看 `detailview`

- **位置**: `components/detailview.tsx`
- **功能**: 只读查看模板所有详情

## 视觉设计

### 颜色状态映射

| 状态 | 背景色 | 边框色 | 说明 |
|------|--------|--------|------|
| 未确认未同步 | red | #FECACA | 红色背景 |
| 已确认未同步 | blue | #BFDBFE | 蓝色背景 |
| 已确认已同步 | white | #E5E7EB | 白色背景 |

### 布局结构

- 筛选区：顶部固定，背景白色
- 快捷筛选区：筛选区下方，背景白色
- 列表区：占据剩余空间，浅色背景
- 卡片：圆角边框，根据状态变色
- 详情展开：虚线分隔，浅色背景

### 响应式

- 桌面端：完整展示所有列
- 移动端：自动适配，横向可滚动

## 交互设计

### 卡片交互

- 悬停：边框颜色加深，轻微阴影
- 点击：切换选中状态，切换展开状态
- 操作按钮：只在悬停或选中时显示

### 筛选交互

- 输入车次即时过滤
- 选择类型即时过滤
- 点击快捷标签切换筛选
- 重置按钮清空所有筛选

### 批量操作

- 复选框选中多个模板
- 根据选中状态自动显示可用操作
- 操作前确认对话框
- 操作完成清空选中

## 样式规范

遵循 [DESIGN_GUIDE.md](../../../../.trae/rules/DESIGN_GUIDE.md) 设计规范：

- 使用语义化 CSS 变量
- 遵循间距和圆角规范
- 符合对比度要求
- 使用 Tailwind 工具类
- 无硬编码颜色
- 组件和文件名全小写
- 变量、函数、接口全小写（用户要求）

## 测试数据

内置 23 条测试数据：
- 3条未确认/未同步数据
- 20条已确认/已同步数据
- 包含始发、终到、途径三种类型
- 包含四种地标颜色
- 包含不同车型和担当局

## 待完成事项

- 导入/导出功能待实现
- 新增模板功能待实现
- 同步功能待对接后端API

---

**最后更新**: 2026-05-07
**维护者**: 客运模板系统团队
