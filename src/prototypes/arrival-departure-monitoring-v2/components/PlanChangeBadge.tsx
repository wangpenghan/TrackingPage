import React from 'react';
import { AlertTriangle, History, GitCompare, AlertCircle } from 'lucide-react';

interface PlanChangeBadgeProps {
  changeType: 'none' | 'yesterday' | 'kemo' | 'both';
  changeCount?: number;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export const PlanChangeBadge: React.FC<PlanChangeBadgeProps> = ({
  changeType,
  changeCount = 0,
  size = 'medium',
  darkMode = false,
  onDoubleClick
}) => {
  if (changeType === 'none') return null;

  const sizeMap = {
    small: { icon: 14, badge: 10, padding: '2px 4px', fontSize: '11px' },
    medium: { icon: 18, badge: 12, padding: '4px 8px', fontSize: '12px' },
    large: { icon: 22, badge: 14, padding: '6px 12px', fontSize: '14px' }
  };

  const currentSize = sizeMap[size];

  // 根据变更类型返回对应的颜色和图标
  const getChangeTypeConfig = () => {
    switch (changeType) {
      case 'yesterday':
        return {
          icon: <History size={currentSize.icon} />,
          label: '昨日变更',
          bgColor: darkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)',
          borderColor: darkMode ? 'rgba(0, 122, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)',
          textColor: '#007AFF',
          hoverBg: darkMode ? 'rgba(0, 122, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)'
        };
      case 'kemo':
        return {
          icon: <GitCompare size={currentSize.icon} />,
          label: '客模变更',
          bgColor: darkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 149, 0, 0.1)',
          borderColor: darkMode ? 'rgba(255, 149, 0, 0.4)' : 'rgba(255, 149, 0, 0.3)',
          textColor: '#FF9500',
          hoverBg: darkMode ? 'rgba(255, 149, 0, 0.3)' : 'rgba(255, 149, 0, 0.2)'
        };
      case 'both':
        return {
          icon: <AlertCircle size={currentSize.icon} />,
          label: '多方变更',
          bgColor: darkMode ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)',
          borderColor: darkMode ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 59, 48, 0.3)',
          textColor: '#FF3B30',
          hoverBg: darkMode ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.2)'
        };
      default:
        return {
          icon: <AlertTriangle size={currentSize.icon} />,
          label: '变更',
          bgColor: darkMode ? 'rgba(142, 142, 147, 0.2)' : 'rgba(142, 142, 147, 0.1)',
          borderColor: darkMode ? 'rgba(142, 142, 147, 0.4)' : 'rgba(142, 142, 147, 0.3)',
          textColor: '#8E8E93',
          hoverBg: darkMode ? 'rgba(142, 142, 147, 0.3)' : 'rgba(142, 142, 147, 0.2)'
        };
    }
  };

  const config = getChangeTypeConfig();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: currentSize.padding,
        cursor: onDoubleClick ? 'pointer' : 'default',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.textColor,
        fontSize: currentSize.fontSize,
        fontWeight: 500
      }}
      onDoubleClick={onDoubleClick}
      title={`${config.label}，双击查看详情`}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = config.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = config.bgColor;
      }}
    >
      {config.icon}
      <span>{config.label}</span>
      {changeCount > 0 && (
        <span
          style={{
            backgroundColor: config.textColor,
            color: 'white',
            fontSize: `${currentSize.badge}px`,
            fontWeight: 'bold',
            borderRadius: '50%',
            minWidth: `${currentSize.badge + 4}px`,
            height: `${currentSize.badge + 4}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '2px'
          }}
        >
          {changeCount}
        </span>
      )}
    </div>
  );
};

export default PlanChangeBadge;
