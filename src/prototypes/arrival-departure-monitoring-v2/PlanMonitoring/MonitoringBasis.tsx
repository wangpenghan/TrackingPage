import React, { useState } from 'react';
import { MonitoringBasis as MonitoringBasisType, PlanType } from './types';
import { getPlanTypeName } from './mock-data';

interface MonitoringBasisProps {
  monitoringBases: MonitoringBasisType[];
  selectedPlanType?: PlanType;
  darkMode?: boolean;
}

export const MonitoringBasis: React.FC<MonitoringBasisProps> = ({
  monitoringBases,
  selectedPlanType,
  darkMode = false
}) => {
  const [expandedBasis, setExpandedBasis] = useState<string | null>(null);

  // 过滤监测依据数据
  const filteredBases = selectedPlanType
    ? monitoringBases.filter(basis => basis.planType === selectedPlanType)
    : monitoringBases;

  // 按计划类型分组
  const groupedBases = filteredBases.reduce((groups, basis) => {
    const planType = basis.planType;
    if (!groups[planType]) {
      groups[planType] = [];
    }
    groups[planType].push(basis);
    return groups;
  }, {} as Record<PlanType, MonitoringBasisType[]>);

  // 处理展开/折叠事件
  const handleToggleExpand = (basisId: string) => {
    setExpandedBasis(expandedBasis === basisId ? null : basisId);
  };

  // 获取计划类型对应的颜色
  const getPlanTypeColor = (planType: PlanType) => {
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

  if (filteredBases.length === 0) {
    return (
      <div
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '16px',
            color: darkMode ? '#94a3b8' : '#64748b',
            marginBottom: '8px'
          }}
        >
          暂无监测依据
        </div>
        <div
          style={{
            fontSize: '14px',
            color: darkMode ? '#64748b' : '#94a3b8'
          }}
        >
          监测依据用于判断计划是否应该存在，避免误报
        </div>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedBases).map(([planType, planBases]) => (
        <div key={planType} style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                width: '8px',
                height: '24px',
                borderRadius: '4px',
                background: getPlanTypeColor(planType as PlanType)
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 'bold',
                color: darkMode ? '#e2e8f0' : '#1e293b'
              }}
            >
              {getPlanTypeName(planType)}监测依据
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: darkMode ? '#94a3b8' : '#64748b'
                }}
              >
                ({planBases.length}条)
              </span>
            </h3>
          </div>

          <div
            style={{
              background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {planBases.map((basis) => (
              <div key={basis.id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <div
                  onClick={() => handleToggleExpand(basis.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        marginBottom: '4px'
                      }}
                    >
                      {basis.description}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: darkMode ? '#94a3b8' : '#64748b'
                      }}
                    >
                      有效时间: {basis.validFrom} - {basis.validTo}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {expandedBasis === basis.id ? '▼' : '▶'}
                  </div>
                </div>

                {expandedBasis === basis.id && (
                  <div
                    style={{
                      padding: '0 16px 16px',
                      borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        color: darkMode ? '#cbd5e1' : '#475569',
                        marginBottom: '8px'
                      }}
                    >
                      <strong>覆盖车次:</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      {basis.trainNumbers.map((trainNo, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            fontSize: '12px',
                            color: darkMode ? '#e2e8f0' : '#1e293b'
                          }}
                        >
                          {trainNo}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        marginTop: '12px',
                        fontSize: '12px',
                        color: darkMode ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}
                    >
                      说明: 此监测依据用于判断上述车次是否应该存在对应计划，避免误报
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};