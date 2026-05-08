# 页面地图

## 1. 文档目标

- 说明主要原型入口与用途，便于人与 Agent 快速跳转

## 2. 页面结构（摘要）

```text
src/prototypes/
├── operation-monitoring/          作业盯控
├── arrival-departure-monitoring/  到发盯控
├── arrival-departure-monitoring-v2/
├── managed-station-monitoring/    代管盯控
├── dmr-control-system/
├── lighting-control/
├── basic-plan/
├── passenger-template/
├── passenger-template-v2/
└── ...
```

## 3. 页面清单

| 页面/模块 | 路径或入口 | 用途 | 关联规格 |
|-----------|------------|------|-----------|
| 作业盯控 | `src/prototypes/operation-monitoring/` | 作业单元、到发列、站台作业与异常提醒 | `spec.md` |
| 到发盯控 v2（当前主推） | `src/prototypes/arrival-departure-monitoring-v2/` | 到发盯控主界面：表格/筛选/多抽屉与 Axure 式 API | `spec.md` |
| 到发盯控（旧版） | `src/prototypes/arrival-departure-monitoring/` | 早期到发盯控，侧栏/入口若未挂载则视为未使用 | `spec.md` |
| 代管盯控 | `src/prototypes/managed-station-monitoring/` | 代管站场景 | `spec.md` |
| 其他模板/演示 | `passenger-template*`、`basic-plan`、`lighting-control` 等 | 模板或独立演示 | 各目录 `spec.md`（若有） |

## 4. 协作记忆入口

- 作业盯控评审与待办对齐：`src/docs/operation-monitoring-collab-notes.md`

## 5. 待确认项

- 侧边栏展示名与上表中文名以 Axhub 配置为准，路径以仓库目录为准
