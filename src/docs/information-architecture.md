# 信息架构（摘要）

## 1. 文档目标

- 标定「盯控类」原型与文档的模块边界，避免与模板页、独立演示混淆

## 2. 模块结构

```text
盯控页面（仓库）
├── 列车到发盯控（arrival-departure-monitoring*）
├── 在站作业盯控（operation-monitoring）
├── 代管站盯控（managed-station-monitoring）
└── 其他非盯控主线（照明、DMR、乘客模板等，独立边界）
```

## 3. 模块说明

| 模块 | 子模块/内容 | 说明 | 关联资产 |
|------|----------------|------|-----------|
| 作业盯控 | 主表、展开作业详情、途径信息、设置项 | 以作业单元为行，合并接续关系 | `operation-monitoring/`、`operation-monitoring-collab-notes.md` |
| 到发盯控 | 到发列表与关联能力 | 与作业盯控数据对象不同，勿混用字段 | `arrival-departure-monitoring*` |

## 4. 边界与原则

- 规格与实现以各原型目录下 `spec.md` 为准；总入口只做索引
- 跨原型复用的组件优先查 `src/components/`

## 5. 待确认项

- 若新增「统一盯控门户」类页面，需在本文件补充导航层级
