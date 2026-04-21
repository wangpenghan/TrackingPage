import React, { useState } from 'react';

interface Abnormality {
  id: string;
  trainNo: string;
  type: 'broadcast' | 'guide' | 'personnel' | 'monitoring' | 'missing' | 'failed';
  reason: string;
  time: string;
}

interface PlanMonitoringProps {
  darkMode?: boolean;
}

export const PlanMonitoring: React.FC<PlanMonitoringProps> = ({ darkMode = false }) => {
  const [abnormalities, setAbnormalities] = useState<Abnormality[]>([
    {
      id: '1',
      trainNo: 'G1001',
      type: 'personnel',
      reason: '客运人员派班计划缺失',
      time: '08:15'
    },
    {
      id: '2',
      trainNo: 'D2345',
      type: 'broadcast',
      reason: '广播计划执行失败',
      time: '08:20'
    },
    {
      id: '3',
      trainNo: 'C5678',
      type: 'missing',
      reason: '引导计划缺失',
      time: '08:25'
    }
  ]);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAbnormality, setSelectedAbnormality] = useState<Abnormality | null>(null);

  // 获取异常类型中文名称
  const getAbnormalityType = (type: Abnormality['type']) => {
    const types: Record<Abnormality['type'], string> = {
      broadcast: '广播',
      guide: '引导',
      personnel: '人员',
      monitoring: '监测依据',
      missing: '计划缺失',
      failed: '执行失败'
    };
    return types[type];
  };

  // 获取异常类型颜色
  const getAbnormalityColor = (type: Abnormality['type']) => {
    const colors: Record<Abnormality['type'], string> = {
      broadcast: '#f59e0b',
      guide: '#3b82f6',
      personnel: '#ef4444',
      monitoring: '#8b5cf6',
      missing: '#10b981',
      failed: '#ec4899'
    };
    return colors[type];
  };

  // 计算各类异常数量
  const abnormalityCounts = {
    broadcast: abnormalities.filter(a => a.type === 'broadcast').length,
    guide: abnormalities.filter(a => a.type === 'guide').length,
    personnel: abnormalities.filter(a => a.type === 'personnel').length,
    monitoring: abnormalities.filter(a => a.type === 'monitoring').length,
    missing: abnormalities.filter(a => a.type === 'missing').length,
    failed: abnormalities.filter(a => a.type === 'failed').length
  };

  // 总异常数量
  const totalAbnormalities = abnormalities.length;

  // 处理双击查看详情
  const handleDoubleClick = (abnormality: Abnormality) => {
    setSelectedAbnormality(abnormality);
    setDetailVisible(true);
  };

  return (
    <div
      style={{
        padding: '16px 20px',
        background: darkMode ? '#1E293B' : '#FFFFFF',
        borderBottom: darkMode ? '1px solid #334155' : '1px solid #E2E8F0',
        position: 'relative',
        zIndex: 110
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold',
          color: darkMode ? '#FFFFFF' : '#1E293B'
        }}>
          计划监测
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          background: totalAbnormalities === 0 ? 
            (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') : 
            (darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
          borderRadius: '16px',
          border: totalAbnormalities === 0 ? 
            (darkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)') : 
            (darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)')
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: totalAbnormalities === 0 ? 
              (darkMode ? '#10B981' : '#059669') : 
              (darkMode ? '#EF4444' : '#DC2626')
          }}>
            {totalAbnormalities === 0 ? '状态正常' : `异常: ${totalAbnormalities} 项`}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* 广播异常 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            cursor: abnormalityCounts.broadcast > 0 ? 'pointer' : 'default'
          }}
          onDoubleClick={() => abnormalityCounts.broadcast > 0 && 
            handleDoubleClick(abnormalities.find(a => a.type === 'broadcast')!)}
        >
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: getAbnormalityColor('broadcast') 
          }} />
          <span style={{
            fontSize: '14px',
            color: darkMode ? '#E2E8F0' : '#334155'
          }}>广播</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: darkMode ? '#F59E0B' : '#D97706'
          }}>{abnormalityCounts.broadcast}</span>
        </div>

        {/* 引导异常 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            cursor: abnormalityCounts.guide > 0 ? 'pointer' : 'default'
          }}
          onDoubleClick={() => abnormalityCounts.guide > 0 && 
            handleDoubleClick(abnormalities.find(a => a.type === 'guide')!)}
        >
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: getAbnormalityColor('guide') 
          }} />
          <span style={{
            fontSize: '14px',
            color: darkMode ? '#E2E8F0' : '#334155'
          }}>引导</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: darkMode ? '#3B82F6' : '#2563EB'
          }}>{abnormalityCounts.guide}</span>
        </div>

        {/* 人员异常 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            cursor: abnormalityCounts.personnel > 0 ? 'pointer' : 'default'
          }}
          onDoubleClick={() => abnormalityCounts.personnel > 0 && 
            handleDoubleClick(abnormalities.find(a => a.type === 'personnel')!)}
        >
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: getAbnormalityColor('personnel') 
          }} />
          <span style={{
            fontSize: '14px',
            color: darkMode ? '#E2E8F0' : '#334155'
          }}>人员</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: darkMode ? '#EF4444' : '#DC2626'
          }}>{abnormalityCounts.personnel}</span>
        </div>

        {/* 监测依据异常 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            cursor: abnormalityCounts.monitoring > 0 ? 'pointer' : 'default'
          }}
          onDoubleClick={() => abnormalityCounts.monitoring > 0 && 
            handleDoubleClick(abnormalities.find(a => a.type === 'monitoring')!)}
        >
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: getAbnormalityColor('monitoring') 
          }} />
          <span style={{
            fontSize: '14px',
            color: darkMode ? '#E2E8F0' : '#334155'
          }}>监测依据</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: darkMode ? '#8B5CF6' : '#7C3AED'
          }}>{abnormalityCounts.monitoring}</span>
        </div>

        {/* 计划缺失 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            cursor: abnormalityCounts.missing > 0 ? 'pointer' : 'default'
          }}
          onDoubleClick={() => abnormalityCounts.missing > 0 && 
            handleDoubleClick(abnormalities.find(a => a.type === 'missing')!)}
        >
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: getAbnormalityColor('missing') 
          }} />
          <span style={{
            fontSize: '14px',
            color: darkMode ? '#E2E8F0' : '#334155'
          }}>计划缺失</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: darkMode ? '#10B981' : '#059669'
          }}>{abnormalityCounts.missing}</span>
        </div>

        {/* 执行失败 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
            cursor: abnormalityCounts.failed > 0 ? 'pointer' : 'default'
          }}
          onDoubleClick={() => abnormalityCounts.failed > 0 && 
            handleDoubleClick(abnormalities.find(a => a.type === 'failed')!)}
        >
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: getAbnormalityColor('failed') 
          }} />
          <span style={{
            fontSize: '14px',
            color: darkMode ? '#E2E8F0' : '#334155'
          }}>执行失败</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: darkMode ? '#EC4899' : '#DB2777'
          }}>{abnormalityCounts.failed}</span>
        </div>
      </div>

      {/* 异常详情弹窗 */}
      {detailVisible && selectedAbnormality && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setDetailVisible(false)}
        >
          <div
            style={{
              background: darkMode ? '#1E293B' : '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              width: '400px',
              maxWidth: '90vw',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: darkMode ? '#FFFFFF' : '#1E293B'
            }}>
              异常详情
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>车次</span>
                <span style={{ 
                  color: darkMode ? '#E2E8F0' : '#1E293B',
                  fontWeight: 'bold'
                }}>
                  {selectedAbnormality.trainNo}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>异常类型</span>
                <span style={{ 
                  color: getAbnormalityColor(selectedAbnormality.type),
                  fontWeight: 'bold'
                }}>
                  {getAbnormalityType(selectedAbnormality.type)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>异常原因</span>
                <span style={{ 
                  color: darkMode ? '#E2E8F0' : '#1E293B',
                  fontWeight: 'bold'
                }}>
                  {selectedAbnormality.reason}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>发生时间</span>
                <span style={{ 
                  color: darkMode ? '#E2E8F0' : '#1E293B',
                  fontWeight: 'bold'
                }}>
                  {selectedAbnormality.time}
                </span>
              </div>
            </div>
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'right' 
            }}>
              <button
                style={{
                  padding: '8px 16px',
                  background: darkMode ? '#3B82F6' : '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onClick={() => setDetailVisible(false)}
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