import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import { mockTrainSchedules, TrainSchedule } from '../mock-data';

interface PlanChangeDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
}

const macOSColors = {
  light: {
    background: '#F5F5F7',
    cardBackground: '#FFFFFF',
    textPrimary: '#1D1D1F',
    textSecondary: '#86868B',
    accent: '#007AFF',
    border: '#D2D2D7',
    success: '#34C759',
    error: '#FF3B30'
  },
  dark: {
    background: '#1C1C1E',
    cardBackground: '#2C2C2E',
    textPrimary: '#F5F5F7',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    border: '#38383A',
    success: '#30D158',
    error: '#FF453A'
  }
};

export const PlanChangeDrawer: React.FC<PlanChangeDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false
}) => {
  const colors = darkMode ? macOSColors.dark : macOSColors.light;
  const [train, setTrain] = useState<TrainSchedule | null>(null);

  useEffect(() => {
    if (trainId) {
      const found = mockTrainSchedules.find(t => t.id === trainId);
      setTrain(found || null);
    }
  }, [trainId]);

  if (!visible || !train || !train.planChangeInfo) return null;

  const { planChangeInfo } = train;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getChangeItems = () => {
    const items = [];
    const fields = [
      { key: 'arrivalTime', label: '到点' },
      { key: 'departureTime', label: '发点' },
      { key: 'track', label: '股道' },
      { key: 'formation', label: '编组' },
      { key: 'trainModel', label: '车型' },
      { key: 'water', label: '上水' },
      { key: 'sewage', label: '吸污' },
      { key: 'parcel', label: '行包' }
    ];

    fields.forEach(field => {
      const info = planChangeInfo[field.key as keyof typeof planChangeInfo] as any;
      if (info && info.today !== info.yesterday) {
        items.push({
          ...field,
          today: info.today,
          yesterday: info.yesterday
        });
      }
    });

    return items;
  };

  const changeItems = getChangeItems();

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    return String(value);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
          zIndex: 999
        }}
        onClick={handleOverlayClick}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '500px',
          background: colors.background,
          zIndex: 1000,
          boxShadow: darkMode ? '-8px 0 32px rgba(0,0,0,0.5)' : '-8px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: colors.cardBackground
          }}
        >
          <div
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <GitCompare size={20} color={colors.accent} />
            计划变更详情
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: darkMode
                  ? 'rgba(10, 132, 255, 0.15)'
                  : 'rgba(0, 122, 255, 0.1)',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.accent,
                border: `1px solid ${darkMode ? 'rgba(10, 132, 255, 0.25)' : 'rgba(0, 122, 255, 0.2)'}`
              }}
            >
              {train.trainNo}
            </div>
            <Button
              type="text"
              icon={<X size={20} />}
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                color: colors.textSecondary,
                background: 'transparent',
                border: 'none'
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.cardBackground
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '14px' }}>变更项点：</span>
            <span style={{
              color: changeItems.length > 0 ? colors.error : colors.success,
              fontSize: '14px',
              fontWeight: 600
            }}>
              {changeItems.length} 项
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: '20px',
            background: colors.background,
            overflowY: 'auto'
          }}
        >
          {changeItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: colors.textSecondary
            }}>
              <span style={{ fontSize: '16px' }}>无计划变更</span>
              <span style={{ fontSize: '14px', marginTop: '8px' }}>当日计划与昨日计划一致</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {changeItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: colors.cardBackground,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ 
                    minWidth: '60px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.textPrimary
                  }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, fontSize: '14px' }}>
                    <div style={{
                      color: colors.textSecondary,
                      textDecoration: 'line-through',
                      marginBottom: '4px'
                    }}>
                      昨日: {formatValue(item.yesterday)}
                    </div>
                    <div style={{
                      color: colors.accent,
                      fontWeight: 600
                    }}>
                      今日: {formatValue(item.today)}
                    </div>
                  </div>
                  <ArrowRight size={16} color={colors.accent} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${colors.border}`,
            background: colors.cardBackground,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            type="primary"
            onClick={onClose}
            style={{
              padding: '0 20px',
              fontSize: '13px',
              height: '36px',
              fontWeight: 500,
              borderRadius: '8px',
              background: colors.accent,
              border: 'none',
              color: '#FFFFFF'
            }}
          >
            关闭
          </Button>
        </div>
      </div>
    </>
  );
};

export default PlanChangeDrawer;
