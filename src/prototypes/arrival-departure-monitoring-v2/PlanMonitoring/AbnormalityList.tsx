import React, { useState } from 'react';
import { Abnormality, PlanType } from './types';
import { getPlanTypeName, getStatusName, getMonitoringBasisById } from './mock-data';

interface AbnormalityListProps {
  abnormalities: Abnormality[];
  selectedPlanType?: PlanType;
  darkMode?: boolean;
}

export const AbnormalityList: React.FC<AbnormalityListProps> = ({
  abnormalities,
  selectedPlanType,
  darkMode = false
}) => {
  const [selectedAbnormality, setSelectedAbnormality] = useState<Abnormality | null>(null);

  // 过滤异常数据
  const filteredAbnormalities = selectedPlanType
    ? abnormalities.filter(abnormality => abnormality.planType === selectedPlanType)
    : abnormalities;

  // 按计划类型分组
  const groupedAbnormalities = filteredAbnormalities.reduce((groups, abnormality) => {
    const planType = abnormality.planType;
    if (!groups[planType]) {
      groups[planType] = [];
    }
    groups[planType].push(abnormality);
    return groups;
  }, {} as Record<PlanType, Abnormality[]>);

  // 处理双击事件
  const handleDoubleClick = (abnormality: Abnormality) => {
    setSelectedAbnormality(abnormality);
  };

  // 关闭详情弹窗
  const closeDetailModal = () => {
    setSelectedAbnormality(null);
  };

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missing':
        return darkMode ? '#ef4444' : '#dc2626';
      case 'failed':
        return darkMode ? '#f59e0b' : '#d97706';
      default:
        return darkMode ? '#64748b' : '#475569';
    }
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

  if (filteredAbnormalities.length === 0) {
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
          暂无异常信息
        </div>
        <div
          style={{
            fontSize: '14px',
            color: darkMode ? '#64748b' : '#94a3b8'
          }}
        >
          当前站点的计划执行正常
        </div>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedAbnormalities).map(([planType, planAbnormalities]) => (
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
              {getPlanTypeName(planType)}
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: darkMode ? '#94a3b8' : '#64748b'
                }}
              >
                ({planAbnormalities.length}个异常)
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
            {planAbnormalities.map((abnormality) => {
              const monitoringBasis = abnormality.monitoringBasisId 
                ? getMonitoringBasisById(abnormality.monitoringBasisId)
                : undefined;

              return (
                <div
                  key={abnormality.id}
                  onDoubleClick={() => handleDoubleClick(abnormality)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
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
                  {/* 状态标记 */}
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getStatusColor(abnormality.status),
                      marginRight: '12px'
                    }}
                  />

                  {/* 车次 */}
                  <div
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: darkMode ? '#e2e8f0' : '#1e293b'
                    }}
                  >
                    {abnormality.trainNo}
                  </div>

                  {/* 异常状态 */}
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: getStatusColor(abnormality.status) + '20',
                      color: getStatusColor(abnormality.status),
                      marginRight: '12px'
                    }}
                  >
                    {getStatusName(abnormality.status)}
                  </div>

                  {/* 时间 */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      marginRight: '12px'
                    }}
                  >
                    {abnormality.time}
                  </div>

                  {/* 原因 */}
                  <div
                    style={{
                      flex: 2,
                      fontSize: '13px',
                      color: darkMode ? '#cbd5e1' : '#475569',
                      textAlign: 'right'
                    }}
                  >
                    {abnormality.reason}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* 异常详情弹窗 */}
      {selectedAbnormality && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeDetailModal}
        >
          <div
            style={{
              background: darkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '16px',
              padding: '24px',
              width: '500px',
              maxWidth: '90%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: darkMode ? '#e2e8f0' : '#1e293b'
                }}
              >
                异常详情
              </h3>
              <button
                onClick={closeDetailModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontWeight: '500'
                }}
              >
                车次:
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  fontWeight: '600'
                }}
              >
                {selectedAbnormality.trainNo}
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontWeight: '500'
                }}
              >
                计划类型:
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: getPlanTypeColor(selectedAbnormality.planType)
                }}
              >
                {getPlanTypeName(selectedAbnormality.planType)}
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontWeight: '500'
                }}
              >
                异常状态:
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: getStatusColor(selectedAbnormality.status)
                }}
              >
                {getStatusName(selectedAbnormality.status)}
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontWeight: '500'
                }}
              >
                发生时间:
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#e2e8f0' : '#1e293b'
                }}
              >
                {selectedAbnormality.time}
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontWeight: '500'
                }}
              >
                异常原因:
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#e2e8f0' : '#1e293b'
                }}
              >
                {selectedAbnormality.reason}
              </div>

              {selectedAbnormality.monitoringBasisId && (
                <>
                  <div
                    style={{
                      fontSize: '14px',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      fontWeight: '500'
                    }}
                  >
                    监测依据:
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: darkMode ? '#e2e8f0' : '#1e293b'
                    }}
                  >
                    {getMonitoringBasisById(selectedAbnormality.monitoringBasisId)?.description || '未知'}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={closeDetailModal}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: darkMode ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode 
                    ? 'rgba(255,255,255,0.1)' 
                    : '#f8fafc';
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};