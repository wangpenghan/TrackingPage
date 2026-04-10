# 下拉框键盘导航与选中效果规则

## 目的
确保所有下拉框组件支持标准的键盘导航操作，并且选中效果醒目清晰，提升用户交互体验和无障碍访问能力。

## 适用场景
项目中所有使用下拉框（Select）的地方，包括但不限于：
- 表单选择
- 筛选器
- 配置面板
- 计划干预页面

## 键盘导航规范

### 支持的键盘操作
- **↑ (上箭头)**：向上移动选中项
- **↓ (下箭头)**：向下移动选中项
- **Enter**：确认选中当前项
- **Escape**：关闭下拉菜单
- **Home**：移动到第一项
- **End**：移动到最后一项

## 选中效果规范

### 视觉要求
选中项必须满足以下醒目效果：
1. **背景色**：使用明显的背景色区分
   - 浅色模式：`#1890ff`（蓝色）或 `#e6f7ff`（浅蓝背景）
   - 深色模式：`#177ddc`（蓝色）或 `rgba(24, 144, 255, 0.2)`
2. **文字颜色**：与背景形成高对比度
   - 深色背景时：白色 `#ffffff`
   - 浅色背景时：深色 `#1890ff`
3. **边框**：可选的高亮边框
4. **悬停态**：与选中态有区分，但同样醒目

### Ant Design Select 配置示例

```typescript
import { Select } from 'antd';

// 自定义下拉框样式
const customSelectStyle = {
  // 下拉菜单整体样式
  '.ant-select-dropdown': {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  
  // 选项默认样式
  '.ant-select-item': {
    padding: '8px 12px',
    borderRadius: '4px',
    margin: '2px 4px',
    transition: 'all 0.2s ease',
  },
  
  // 选项悬停样式
  '.ant-select-item-option:hover': {
    backgroundColor: darkMode ? 'rgba(24, 144, 255, 0.1)' : '#f0f5ff',
  },
  
  // 选项选中样式 - 醒目！
  '.ant-select-item-option-selected': {
    backgroundColor: darkMode ? '#177ddc' : '#1890ff',
    color: '#ffffff',
    fontWeight: 500,
  },
  
  // 选项激活样式（键盘导航时）
  '.ant-select-item-option-active': {
    backgroundColor: darkMode ? 'rgba(24, 144, 255, 0.3)' : '#e6f7ff',
  },
};

// 使用示例
<Select
  showSearch
  optionFilterProp="children"
  filterOption={(input, option) =>
    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
  }
  style={{ width: '100%' }}
>
  {/* 选项 */}
</Select>
```

## 模糊匹配规范

对于支持手动输入的下拉框：
1. 启用 `showSearch` 属性
2. 提供 `filterOption` 函数实现模糊匹配
3. 支持拼音、首字母、汉字等多种匹配方式（如适用）
4. 匹配结果高亮显示

## 实现检查清单

在每个使用下拉框的地方，确保：
- [ ] 支持键盘上下箭头导航
- [ ] 选中效果醒目清晰
- [ ] 支持 Enter 确认选择
- [ ] 支持 Escape 关闭菜单
- [ ] 如需要，支持模糊搜索和手动输入
- [ ] 深色/浅色模式下都有良好的视觉效果

## 参考实现
- `src/prototypes/arrival-departure-monitoring-v2/components/PlanInterventionDrawer.tsx` - 车型和广播分组选择器
