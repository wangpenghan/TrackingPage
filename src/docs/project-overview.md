# 盯控页面 项目说明清单

> 用途：作为项目文档总入口，帮助人和 Agent 快速理解项目，并按需加载后续子文档。  
> 维护：内容应保持轻量；超过约 1000 行时需拆分为专题子文档，总入口优先控制在 800 行以内。

## 1. 项目简介

- 项目名称：盯控页面（TrackingPage）
- 项目定位：车站综控相关盯控与作业监控类高保真原型集合，支撑评审与迭代
- 目标用户：综控值班员、客运/行车管理人员、产品与设计评审方
- 当前阶段：原型持续迭代，文档与规格与代码同步维护

## 2. 核心场景

- 到发列车盯控与关键信息一览
- 作业单元级全流程盯控（检票、站台、出站、上水等）
- 代管站、照明等配套管控类原型（按需扩展）

## 3. 阅读顺序

1. 先读本文件，确认范围与索引  
2. 按需阅读 `page-map.md`、专题协作笔记或需求文档  
3. 进入具体原型的 `spec.md` 与 `src/prototypes/` 实现

## 4. 文档索引

| 文档 | 用途 | 是否必读 |
|------|------|---------|
| `src/docs/page-map.md` | 页面地图与入口导航 | 按需 |
| `src/docs/information-architecture.md` | 模块边界与信息层级摘要 | 按需 |
| `src/docs/operation-monitoring-collab-notes.md` | 作业盯控：评审结论、与 spec 对齐待办、大屏与无障碍偏好 | 改该原型前建议读 |
| `src/docs/功能文档.md` | 功能模块总述 | 按需 |
| `src/docs/requirements/requirement-registry.md` | 需求登记索引 | 按需 |

其他存量文档（代管盯控、到发盯控设计说明等）仍位于 `src/docs/` 各路径，可按标题检索。

## 5. 主题索引

- 默认主题：以各原型引用为准（常见为 `trae-design`、`antd-new`）
- 主题目录：`src/themes/`
- 说明：作业盯控原型见 `src/prototypes/operation-monitoring/index.tsx` 头部引用

## 6. 数据索引

- 关键数据：各原型目录内 `mock-data` 或等价模块为主
- 数据目录：`src/database/`（全局表说明见 `src/database/README.md`）

## 7. 原型索引

| 原型 | 规格 |
|------|------|
| 作业盯控 | `src/prototypes/operation-monitoring/spec.md` |
| 到发盯控（主推 v2） | 主用：`src/prototypes/arrival-departure-monitoring-v2/spec.md`；旧版：`src/prototypes/arrival-departure-monitoring/spec.md` |
| 代管盯控 | `src/prototypes/managed-station-monitoring/spec.md` |

## 8. 当前待补事项

- 作业盯控：与 `spec.md` 对齐的交互缺口（见 `operation-monitoring-collab-notes.md` 第二节）
- 按需补全 `business-flow.md`、`data-model.md` 等专题文档（当前未建则后续按复杂度引入）
