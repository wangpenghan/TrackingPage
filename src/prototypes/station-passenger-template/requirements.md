# 车站客运模板管理 - 需求变更记录

> 本文档自动记录该页面从创建到最终的所有需求变更过程
> 最后更新：2026-05-07 10:15:00

---

## 需求历史总览

| 版本 | 日期 | 类型 | 摘要 | 状态 |
|------|------|------|------|------|
| v1.0 | 2026-05-07 | 迁移 | 将station-passenger-template移动到src/prototypes，所有变量名改为全小写 | 已完成 |
| v1.1 | 2026-05-08 | 优化 | 非客运车次配置页面简化 - 自动识别0G/DJ等前缀车次，隐藏检票相关字段，显示作业配置 | 已完成 |

---

## v1.0 | 初始版本

### 需求信息
- **版本号**: v1.0
- **需求日期**: 2026-05-07 10:15:00
- **需求类型**: 迁移
- **需求状态**: 已完成

### 需求内容
用户要求：
```
station-passenger-template这个页面移动到D:\TraeProject\TrackingPage\src\prototypes，并启动预览
需求更新requirements
varList 变量列表全部小写
```

### 变更说明
- **变更原因**: 项目结构整理，统一代码命名规范
- **影响范围**: 所有文件，所有变量名、函数名、接口名、组件名
- **兼容性**: 保持原有功能不变，仅命名变更

### 解决方案

#### 任务拆分
| 序号 | 任务名称 | 状态 | 完成时间 |
|------|----------|------|----------|
| 1 | 创建目标目录结构 | 已完成 | 2026-05-07 |
| 2 | 转换types.ts全小写命名 | 已完成 | 2026-05-07 |
| 3 | 转换lib/utils.ts | 已完成 | 2026-05-07 |
| 4 | 转换components/ui/variants.ts | 已完成 | 2026-05-07 |
| 5 | 转换components/detailview.tsx | 已完成 | 2026-05-07 |
| 6 | 转换components/editdrawer.tsx | 已完成 | 2026-05-07 |
| 7 | 转换components/templatecard.tsx | 已完成 | 2026-05-07 |
| 8 | 转换components/templatelist.tsx | 已完成 | 2026-05-07 |
| 9 | 创建入口文件index.tsx | 已完成 | 2026-05-07 |
| 10 | 创建spec.md规格文档 | 已完成 | 2026-05-07 |
| 11 | 创建requirements.md需求记录 | 进行中 | 2026-05-07 |

#### 执行结果
- **设计产出**: [spec.md](spec.md) - 完整规格文档
- **代码实现**:
  - `index.tsx` - 入口文件
  - `types.ts` - 类型定义（全小写）
  - `lib/utils.ts` - 工具函数
  - `components/templatecard.tsx` - 模板卡片
  - `components/templatelist.tsx` - 模板列表
  - `components/detailview.tsx` - 详情查看
  - `components/editdrawer.tsx` - 编辑抽屉
  - `components/ui/variants.ts` - 组件变体
- **视觉验收**: 符合设计规范
- **功能验收**: 保持原有功能，命名全部改为小写

#### 转换说明
- 用户要求"变量列表全部小写"，所以所有自定义标识符都改为小写
- 包括：接口名、类型名、组件名、函数名、变量名、props接口
- JavaScript/TypeScript内置标识符（useState, useMemo, Math, parseInt等）保持不变
- DOM事件属性（onClick, onChange等）保持不变
- 文件名全部改为小写

#### 测试结果
- **命名检查**: 所有自定义变量全小写 - 通过
- **语法检查**: TypeScript语法正确 - 通过
- **结构检查**: 目录结构正确 - 通过

---

## 📝 备注

本次迁移仅移动位置和改变命名，不改变原有功能逻辑。所有功能保持与原版本一致。

---

---

## v1.1 | 非客运车次配置页面简化

### 需求信息
- **版本号**: v1.1
- **需求日期**: 2026-05-08
- **需求类型**: 优化
- **需求状态**: 已完成
- **参考文档**: `src/docs/freight-train-config-simplify-spec.md`

### 需求内容
根据 `freight-train-config-simplify-spec.md` 设计方案，实现非客运车次配置页面简化：
- 自动识别非客运车次（以0G、DJ、0D、动检、出库等前缀开头）
- 非客运车次隐藏检票时间、开检/停检偏移、检票口、候车室、出站口等字段
- 非客运车次显示作业配置区域（上水、吸污）
- 车次号修改时自动切换配置模式
- 从客运切换到非客运时自动清除检票相关字段

### 解决方案

#### 任务拆分
| 序号 | 任务名称 | 状态 | 完成时间 |
|------|----------|------|----------|
| 1 | 更新车次号输入框使用handleTrainNoChange | 已完成 | 2026-05-08 |
| 2 | 检票时间区域添加isFreightMode条件渲染 | 已完成 | 2026-05-08 |
| 3 | 右侧设施配置区域添加isFreightMode条件渲染 | 已完成 | 2026-05-08 |
| 4 | 添加作业配置区域（上水/吸污）用于非客运车次 | 已完成 | 2026-05-08 |
| 5 | 更新requirements.md记录变更 | 已完成 | 2026-05-08 |

#### 核心实现
1. **isFreightTrain检测函数**（sync-utils.ts中已添加）：
   ```typescript
   const freightPrefixes = ['0G', 'DJ', '0D', '动检', '出库', '货运', '调车', '检修', '救援', '路用']
   return freightPrefixes.some(prefix => trainNo.startsWith(prefix) || trainNo.includes(prefix))
   ```

2. **handleTrainNoChange处理函数**（EditDrawer.tsx中已添加）：
   - 当车次号从客运切换到非客运时，自动清除以下字段：
     - entryCheckOffset, entryStopOffset
     - exitCheckOffset, exitStopOffset
     - gates, exitGate, waitingRoom

3. **UI条件渲染**：
   - `!isFreightMode`: 显示检票时间、其他信息区域
   - `isFreightMode`: 显示作业配置（上水、吸污）

#### 执行结果
- **设计产出**: [freight-train-config-simplify-spec.md](../docs/freight-train-config-simplify-spec.md)
- **代码变更**: EditDrawer.tsx
  - 车次号输入框：添加handleTrainNoChange调用，添加"非客运"标签显示
  - 检票时间区域：添加!isFreightMode条件包裹
  - 右侧设施配置：
    - 客运模式：检票口、候车室、出站口
    - 非客运模式：作业配置（上水、吸污）
- **视觉验收**: 符合设计规范
- **功能验收**: 非客运车次配置页面简化功能正常

#### 测试数据
已在TemplateList.tsx中添加模拟数据：
- DJ7873 - 动检车（hasWater: false, hasSuction: false）
- 0G1301 - 出库车（hasWater: true, hasSuction: true）

---

**最后更新**: 2026-05-08 11:00:00
