import React from 'react';
import { PlanType } from './types';
import { getPlanTypeName } from './mock-data';

interface PlanTypeCardProps {
  planType: PlanType;
  total: number;
  missing: number;
  failed: number;
  onCardClick: (planType: PlanType) => void;
  darkMode?: boolean;
}

export const PlanTypeCard: React.FC<PlanTypeCardProps> = ({
  planType,
  total,
  missing,
  failed,
  onCardClick,
  darkMode = false
}) => {
  const hasAbnormalities = missing > 0 || failed > 0;
  const planTypeName = getPlanTypeName(planType);

  // 获取计划类型对应的颜色
  const getPlanTypeColor = () => {
    switch (planType) {
      case 'broadcast':
        return darkMode ? '#3b82f6' : '#2563eb';
      case 'guide':
        return darkMode ? '#10b981' : '#059669';
      case 'personnel':
        return darkMode ? '#f59e0b' : '#d97706';
      default:
        return darkMode ? '#64748b' : '#475569';
    }
  };

  const planTypeColor = getPlanTypeColor();

  return (
    <div
      onClick={() => onCardClick(planType)}
      style={{
        background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = darkMode
          ? '0 6px 16px rgba(0,0,0,0.35)'
          : '0 6px 16px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* 顶部计划类型 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 计划类型图标 */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: planTypeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span
              style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {planTypeName.charAt(0)}
            </span>
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: planTypeColor
            }}
          >
            {planTypeName}
          </h3>
        </div>
        <div
          style={{
            background: hasAbnormalities
              ? (darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)')
              : (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'),
            color: hasAbnormalities
              ? (darkMode ? '#ef4444' : '#dc2626')
              : (darkMode ? '#10b981' : '#059669'),
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {hasAbnormalities ? `异常: ${missing + failed}` : '正常'}
        </div>
      </div>

      {/* 统计信息 */}
      <div style={{ marginBottom: '16px' }}>
        {/* 计划总数 */}
        <div
          style={{
            padding: '12px',
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '12px',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '14px',
                color: darkMode ? '#94a3b8' : '#64748b'
              }}
            >
              计划总数
            </span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: darkMode ? '#e2e8f0' : '#1e293b'
              }}
            >
              {total}
            </span>
          </div>
        </div>

        {/* 监测内容 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* 计划缺失 */}
          <div
            style={{
              padding: '12px',
              background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.05)',
              borderRadius: '12px',
              borderLeft: `4px solid ${darkMode ? '#ef4444' : '#dc2626'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#fca5a5' : '#ef4444',
                  fontWeight: '500'
                }}
              >
                计划缺失
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: darkMode ? '#f87171' : '#dc2626'
                }}
              >
                {missing}
              </span>
            </div>
          </div>

          {/* 执行失败 */}
          <div
            style={{
              padding: '12px',
              background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.05)',
              borderRadius: '12px',
              borderLeft: `4px solid ${darkMode ? '#f59e0b' : '#d97706'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#fcd34d' : '#f59e0b',
                  fontWeight: '500'
                }}
              >
                执行失败
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: darkMode ? '#fbbf24' : '#d97706'
                }}
              >
                {failed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div
        style={{
          fontSize: '13px',
          color: darkMode ? '#94a3b8' : '#64748b',
          textAlign: 'center',
          marginTop: '8px',
          paddingTop: '12px',
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
        }}
      >
        双击查看详细异常信息
      </div>

      {/* 装饰条 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '6px',
          height: '100%',
          background: planTypeColor
        }}
      />
    </div>
  );
};
