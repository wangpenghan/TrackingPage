/**
 * 代管盯控 - 配置向导
 */
import React, { useState } from 'react';
import { Modal, Steps, Button, message } from 'antd';
import type { MonitoringConfig, ConfigStep } from '../../types';
import { StationConfig } from './StationConfig';
import { PanelConfig } from './PanelConfig';
import { DisplayConfig } from './DisplayConfig';
import { ReminderConfig } from './ReminderConfig';

interface ConfigWizardProps {
  visible: boolean;
  config: MonitoringConfig;
  onSave: (config: MonitoringConfig) => void;
  onCancel: () => void;
}

const steps: { title: string; key: ConfigStep }[] = [
  { title: '车站配置', key: 'station' },
  { title: '面板配置', key: 'panel' },
  { title: '显示配置', key: 'display' },
  { title: '提醒配置', key: 'reminder' }
];

export const ConfigWizard: React.FC<ConfigWizardProps> = ({
  visible,
  config,
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [localConfig, setLocalConfig] = useState<MonitoringConfig>(config);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // 保存配置
      onSave({ ...localConfig, isFirstRun: false });
      message.success('配置保存成功');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateConfig = (partial: Partial<MonitoringConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...partial }));
  };

  const renderStepContent = () => {
    switch (steps[currentStep].key) {
      case 'station':
        return (
          <StationConfig
            stations={localConfig.stations}
            onChange={(stations) => updateConfig({ stations })}
          />
        );
      case 'panel':
        return (
          <PanelConfig
            panels={localConfig.panels}
            stations={localConfig.stations}
            onChange={(panels) => updateConfig({ panels })}
          />
        );
      case 'display':
        return (
          <DisplayConfig
            display={localConfig.display}
            onChange={(display) => updateConfig({ display })}
          />
        );
      case 'reminder':
        return (
          <ReminderConfig
            reminder={localConfig.reminder}
            stations={localConfig.stations}
            onChange={(reminder) => updateConfig({ reminder })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={visible}
      title="代管盯控配置"
      width={800}
      footer={null}
      onCancel={onCancel}
      maskClosable={false}
      closable={!config.isFirstRun}
    >
      <Steps
        current={currentStep}
        items={steps.map(s => ({ title: s.title }))}
        style={{ marginBottom: 24 }}
      />

      <div style={{ minHeight: 400, maxHeight: 500, overflow: 'auto' }}>
        {renderStepContent()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        {currentStep > 0 && (
          <Button onClick={handlePrev}>
            上一步
          </Button>
        )}
        <Button type="primary" onClick={handleNext}>
          {currentStep === steps.length - 1 ? '完成' : '下一步'}
        </Button>
      </div>
    </Modal>
  );
};
