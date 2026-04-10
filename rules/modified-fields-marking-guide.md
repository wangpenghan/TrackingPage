# 被修改字段显示明显标记规则

## 目的
确保在所有表单、配置和编辑界面中，被修改的字段能够以明显且一致的方式展示出来，让用户能够清晰地识别哪些字段发生了变化。

## 适用场景
- 表单编辑页面
- 配置面板
- 计划干预界面
- 所有用户可以修改数据的交互组件

## 标记样式规范

### 1. 变化标记（Change Indicator）
- **位置**：修改字段的右侧
- **样式**：
  - 形状：圆形
  - 尺寸：6px × 6px
  - 颜色：
    - 浅色模式：`#FF9500`（橙色）
    - 深色模式：`#FF9F0A`（橙色）
  - 间距：左侧 6px
- **Tooltip**：鼠标悬停显示"已修改"

### 2. 字段边框和背景变化
- **边框颜色**：
  - 浅色模式：`#FF9500`
  - 深色模式：`#FF9F0A`
- **背景颜色**：
  - 浅色模式：`rgba(255, 149, 0, 0.05)`
  - 深色模式：`rgba(255, 159, 10, 0.1)`

### 3. 整体未保存提示
- 在头部或标题区域显示"未保存"标签
- 样式：
  - 背景：
    - 浅色模式：`rgba(255, 149, 0, 0.15)`
    - 深色模式：`rgba(255, 159, 10, 0.2)`
  - 边框：
    - 浅色模式：`rgba(255, 149, 0, 0.25)`
    - 深色模式：`rgba(255, 159, 10, 0.3)`
  - 文字颜色：橙色

## 实现模式

### React 组件实现示例

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

// 变化标记组件
const ChangeIndicator = ({ changed }: { changed: boolean }) => {
  if (!changed) return null;
  return (
    <div
      style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: colors.warning,
        marginLeft: '6px',
        flexShrink: 0
      }}
      title="已修改"
    />
  );
};

// 变化字段样式
const getChangedStyle = (isChanged: boolean, darkMode: boolean): React.CSSProperties => ({
  borderColor: isChanged ? (darkMode ? '#FF9F0A' : '#FF9500') : undefined,
  backgroundColor: isChanged
    ? (darkMode ? 'rgba(255, 159, 10, 0.1)' : 'rgba(255, 149, 0, 0.05)')
    : undefined
});
```

## 参考实现
项目中已有参考实现：`src/prototypes/arrival-departure-monitoring-v2/components/PlanInterventionDrawer.tsx`

该文件包含了完整的变化检测和标记实现，可作为参考模板。
