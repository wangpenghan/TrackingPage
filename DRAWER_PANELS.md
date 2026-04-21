# 到发盯控页面抽屉面板清单

## 抽屉面板列表

| 序号 | 抽屉面板名称 | 组件文件 | 功能描述 |
|------|-------------|----------|----------|
| 1 | 作业详情抽屉 | [OperationDetailDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/OperationDetailDrawer.tsx) | 显示作业监控详情，支持备注编辑和作业完成确认 |
| 2 | 计划变更抽屉 | [PlanChangeDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/PlanChangeDrawer.tsx) | 显示计划变更详情，对比今天与昨天的计划差异 |
| 3 | 上水吸污配置抽屉 | [WaterSewageConfigDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/WaterSewageConfigDrawer.tsx) | 配置列车上水和吸污作业 |
| 4 | 编组维护抽屉 | [TrainFormationDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/TrainFormationDrawer.tsx) | 管理列车编组信息和地标颜色 |
| 5 | 计划详情抽屉 | [PlanDetailDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/PlanDetailDrawer.tsx) | 显示详细的列车运行计划 |
| 6 | 音效配置抽屉 | [SoundConfigDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/SoundConfigDrawer.tsx) | 配置系统音效设置 |
| 7 | 计划筛选抽屉 | [PlanFilterDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/PlanFilterDrawer.tsx) | 筛选列车计划的各种条件 |
| 8 | 场景模式抽屉 | [SceneModeDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/SceneModeDrawer.tsx) | 切换不同的场景模式 |
| 9 | 计划干预抽屉 | [PlanInterventionDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/PlanInterventionDrawer.tsx) | 手动干预和调整列车计划 |
| 10 | CTC配置抽屉 | [CTCConfigDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/CTCConfigDrawer.tsx) | 配置CTC（调度集中系统）相关设置 |
| 11 | 客运记录抽屉 | [PassengerRecordDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/PassengerRecordDrawer.tsx) | 显示客运记录信息 |
| 12 | 操作日志抽屉 | [OperationLogDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/OperationLogDrawer.tsx) | 记录系统操作日志 |
| 13 | 控制模式抽屉 | [ControlModeDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/ControlModeDrawer.tsx) | 切换控制模式（单站/代管） |
| 14 | 客流信息抽屉 | [PassengerFlowDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/components/PassengerFlowDrawer.tsx) | 显示详细的客流信息 |
| 15 | 列车详情抽屉 | [TrainDetailDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/TrainDetailDrawer.tsx) | 显示列车详细信息 |
| 16 | 作业抽屉 | [OperationDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/OperationDrawer.tsx) | 处理各种作业操作 |
| 17 | 途径站抽屉 | [RouteStationsDrawer.tsx](file:///workspace/TrackingPage/src/prototypes/arrival-departure-monitoring-v2/RouteStationsDrawer.tsx) | 显示列车途径站信息 |

## 统计信息

- **总数量**: 17个抽屉面板
- **主要类别**:
  - 作业管理: 4个（作业详情、作业、上水吸污配置、编组维护）
  - 计划管理: 4个（计划变更、计划详情、计划筛选、计划干预）
  - 配置管理: 3个（音效配置、CTC配置、控制模式）
  - 信息展示: 6个（客运记录、操作日志、客流信息、列车详情、途径站、场景模式）

## 技术特点

1. **统一设计风格**: 所有抽屉面板采用一致的macOS风格设计
2. **响应式布局**: 适配不同屏幕尺寸
3. **深色模式支持**: 所有抽屉面板都支持深色模式
4. **交互优化**: 包含微交互效果和动画过渡
5. **状态管理**: 使用React useState和useEffect进行状态管理
6. **模块化设计**: 每个抽屉面板都是独立的组件，便于维护和扩展