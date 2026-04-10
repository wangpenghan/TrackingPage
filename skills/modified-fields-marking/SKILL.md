---
name: modified-fields-marking
description: 自动应用被修改字段显示明显标记规则的技能，确保在所有表单、配置和编辑界面中，被修改的字段能够以明显且一致的方式展示出来。
---

# 被修改字段显示明显标记规则技能

本技能用于在项目开发过程中自动应用和执行 `rules/modified-fields-marking-guide.md` 中定义的被修改字段显示明显标记规则。

## 适用场景

当用户要求：
- 创建新的表单、配置或编辑界面时
- 修改现有表单或配置界面时
- 添加数据编辑功能时
- 提及需要"修改标记"、"变更指示"、"未保存提示"等类似需求时

自动触发此技能，确保被修改的字段能够以明显且一致的方式展示出来。

## 执行步骤

### 1. 阅读规则文档
首先读取 `rules/modified-fields-marking-guide.md` 文档，确保完全理解规则要求。

### 2. 检查现有实现
检查项目中是否已有参考实现（如 `src/prototypes/arrival-departure-monitoring-v2/components/PlanInterventionDrawer.tsx`），学习已有的实现方式。

### 3. 应用标记样式
根据规则文档，为修改的字段应用以下标记：

#### 变化标记（Change Indicator）
- 位置：修改字段的右侧
- 样式：
  - 形状：圆形
  - 尺寸：6px × 6px
  - 颜色：
    - 浅色模式：`#FF9500`（橙色）
    - 深色模式：`#FF9F0A`（橙色）
  - 间距：左侧 6px
- Tooltip：鼠标悬停显示"已修改"

#### 字段边框和背景变化
- 边框颜色：
  - 浅色模式：`#FF9500`
  - 深色模式：`#FF9F0A`
- 背景颜色：
  - 浅色模式：`rgba(255, 149, 0, 0.05)`
  - 深色模式：`rgba(255, 159, 10, 0.1)`

#### 整体未保存提示
- 在头部或标题区域显示"未保存"标签
- 样式：
  - 背景：
    - 浅色模式：`rgba(255, 149, 0, 0.15)`
    - 深色模式：`rgba(255, 159, 10, 0.2)`
  - 边框：
    - 浅色模式：`rgba(255, 149, 0, 0.25)`
    - 深色模式：`rgba(255, 159, 10, 0.3)`
  - 文字颜色：橙色

### 4. 实现变化检测
使用以下模式实现变化检测：

```typescript
// 变化检测 Hook
const useFieldChangeDetector = (initialData: any) => {
  const [formData, setFormData] = useState(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialData]);

  const isFieldChanged = (field: string) => {
    return formData[field] !== initialData[field];
  };

  return { formData, setFormData, hasUnsavedChanges, isFieldChanged };
};
```

### 5. 实现变化标记组件
```typescript
// 变化标记组件
const ChangeIndicator = ({ changed, darkMode }: { changed: boolean; darkMode?: boolean }) => {
  if (!changed) return null;
  return (
    <div
      style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: darkMode ? '#FF9F0A' : '#FF9500',
        marginLeft: '6px',
        flexShrink: 0
      }}
      title="已修改"
    />
  );
};
```

### 6. 实现变化字段样式
```typescript
// 变化字段样式
const getChangedStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
  borderColor: isChanged ? (darkMode ? '#FF9F0A' : '#FF9500') : undefined,
  backgroundColor: isChanged
    ? (darkMode ? 'rgba(255, 159, 10, 0.1)' : 'rgba(255, 149, 0, 0.05)')
    : undefined
});
```

## 参考实现

项目中已有完整的参考实现：
- `src/prototypes/arrival-departure-monitoring-v2/components/PlanInterventionDrawer.tsx`

该文件包含了完整的变化检测和标记实现，可作为参考模板。

## 验收标准

1. 所有可编辑字段都有变化检测机制
2. 修改的字段右侧显示 6px 橙色圆点标记
3. 修改的字段有橙色边框和淡橙色背景
4. 整体有未保存提示标签
5. 支持深色/浅色模式切换
6. Tooltip 提示"已修改"
