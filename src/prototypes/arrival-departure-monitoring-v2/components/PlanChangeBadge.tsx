import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PlanChangeBadgeProps {
  changeType?: 'none' | 'yesterday' | 'kemo' | 'both';
  changeCount?: number;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
  onDoubleClick?: (e: React.MouseEvent) => void;
  hasAnyChange?: boolean;
}

export const PlanChangeBadge: React.FC<PlanChangeBadgeProps> = ({
  changeType,
  changeCount = 0,
  size = 'medium',
  darkMode = false,
  onDoubleClick,
  hasAnyChange
}) => {
  const shouldShow = hasAnyChange || (changeType && changeType !== 'none');
  if (!shouldShow) return null;

  const sizeMap = {
    small: { icon: 14, badge: 10, padding: '2px 4px', fontSize: '11px' },
    medium: { icon: 18, badge: 12, padding: '4px 8px', fontSize: '12px' },
    large: { icon: 22, badge: 14, padding: '6px 12px', fontSize: '14px' }
  };

  const currentSize = sizeMap[size];

  const config = {
    icon: <AlertTriangle size={currentSize.icon} />,
    label: '计划变更',
    bgColor: darkMode ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)',
    borderColor: darkMode ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 59, 48, 0.3)',
    textColor: '#FF3B30',
    hoverBg: darkMode ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.2)'
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
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
      title={`计划变更，双击查看详情`}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = config.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = config.bgColor;
      }}
    >
      {config.icon}
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
