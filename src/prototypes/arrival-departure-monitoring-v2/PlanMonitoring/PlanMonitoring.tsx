import React, { useState } from 'react';
import { StationSelector } from './StationSelector';
import { PlanTypeCard } from './PlanTypeCard';
import { AbnormalityList } from './AbnormalityList';
import { MonitoringBasis } from './MonitoringBasis';
import { mockMonitoringData, mockAbnormalities, getStationAbnormalities } from './mock-data';
import { PlanType, StationMonitoringData } from './types';

interface PlanMonitoringProps {
  darkMode?: boolean;
}

export const PlanMonitoring: React.FC<PlanMonitoringProps> = ({
  darkMode = false
}) => {
  // 状态管理
  const [selectedStationId, setSelectedStationId] = useState<string>(Object.keys(mockMonitoringData)[0]);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'abnormalities' | 'monitoringBasis'>('abnormalities');

  // 获取当前站点数据
  const currentStationData = mockMonitoringData[selectedStationId];
  const currentAbnormalities = getStationAbnormalities(selectedStationId);

  // 处理站点选择
  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
    setSelectedPlanType(undefined);
  };

  // 处理计划类型选择
  const handlePlanTypeSelect = (planType: PlanType) => {
    setSelectedPlanType(selectedPlanType === planType ? undefined : planType);
  };

  // 切换标签页
  const handleTabChange = (tab: 'abnormalities' | 'monitoringBasis') => {
    setActiveTab(tab);
  };

  // 获取所有站点数据
  const allStations = Object.values(mockMonitoringData);

  if (!currentStationData) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: darkMode ? '#94a3b8' : '#64748b'
        }}
      >
        未找到站点数据
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 标题 */}
      <div
        style={{
          marginBottom: '24px',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: darkMode ? '#e2e8f0' : '#1e293b',
            marginBottom: '8px'
          }}
        >
          计划监测
        </h2>
        <div
          style={{
            fontSize: '14px',
            color: darkMode ? '#94a3b8' : '#64748b'
          }}
        >
          实时监测广播、引导、人员计划的执行情况
        </div>
      </div>

      {/* 站点选择器 */}
      <StationSelector
        stations={allStations}
        selectedStationId={selectedStationId}
        onStationSelect={handleStationSelect}
        darkMode={darkMode}
      />

      {/* 站点状态概览 */}
      <div
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: darkMode ? '#e2e8f0' : '#1e293b'
            }}
          >
            {currentStationData.stationName} - 计划执行状态
          </h3>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              background: currentStationData.totalAbnormalities > 0
                ? (darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)')
                : (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'),
              color: currentStationData.totalAbnormalities > 0
                ? (darkMode ? '#ef4444' : '#dc2626')
                : (darkMode ? '#10b981' : '#059669'),
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {currentStationData.totalAbnormalities > 0 
              ? `共 ${currentStationData.totalAbnormalities} 个异常` 
              : '一切正常'}
          </div>
        </div>

        {/* 计划类型卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <PlanTypeCard
            planType="broadcast"
            total={currentStationData.planTypes.broadcast.total}
            missing={currentStationData.planTypes.broadcast.missing}
            failed={currentStationData.planTypes.broadcast.failed}
            onCardClick={handlePlanTypeSelect}
            darkMode={darkMode}
          />
          <PlanTypeCard
            planType="guide"
            total={currentStationData.planTypes.guide.total}
            missing={currentStationData.planTypes.guide.missing}
            failed={currentStationData.planTypes.guide.failed}
            onCardClick={handlePlanTypeSelect}
            darkMode={darkMode}
          />
          <PlanTypeCard
            planType="personnel"
            total={currentStationData.planTypes.personnel.total}
            missing={currentStationData.planTypes.personnel.missing}
            failed={currentStationData.planTypes.personnel.failed}
            onCardClick={handlePlanTypeSelect}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* 标签页切换 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
        }}
      >
        <button
          onClick={() => handleTabChange('abnormalities')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'abnormalities'
              ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
              : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'abnormalities'
              ? `2px solid ${darkMode ? '#3b82f6' : '#2563eb'}`
              : 'none',
            color: activeTab === 'abnormalities'
              ? (darkMode ? '#3b82f6' : '#2563eb')
              : (darkMode ? '#94a3b8' : '#64748b'),
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          异常信息
        </button>
        <button
          onClick={() => handleTabChange('monitoringBasis')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'monitoringBasis'
              ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
              : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'monitoringBasis'
              ? `2px solid ${darkMode ? '#3b82f6' : '#2563eb'}`
              : 'none',
            color: activeTab === 'monitoringBasis'
              ? (darkMode ? '#3b82f6' : '#2563eb')
              : (darkMode ? '#94a3b8' : '#64748b'),
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          监测依据
        </button>
      </div>

      {/* 内容区域 */}
      <div>
        {activeTab === 'abnormalities' ? (
          <AbnormalityList
            abnormalities={currentAbnormalities}
            selectedPlanType={selectedPlanType}
            darkMode={darkMode}
          />
        ) : (
          <MonitoringBasis
            monitoringBases={currentStationData.monitoringBases}
            selectedPlanType={selectedPlanType}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};