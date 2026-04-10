import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Input, Button } from 'antd';
import { X } from 'lucide-react';

interface SoundConfigModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

interface SoundConfig {
  neighborStationDeparture: boolean;
  dutyPreview: boolean;
  dutyNotStartedAlarm: boolean;
  earlyThreshold: number;
  lateThreshold: number;
  forwardStations: string;
}

const defaultConfig: SoundConfig = {
  neighborStationDeparture: true,
  dutyPreview: false,
  dutyNotStartedAlarm: true,
  earlyThreshold: 20,
  lateThreshold: 30,
  forwardStations: '巴南|迎龙,珞璜南,统景,南彭、庙坝、武隆南',
};

export const SoundConfigModal: React.FC<SoundConfigModalProps> = ({
  open,
  onClose,
  darkMode = false,
}) => {
  const [config, setConfig] = useState<SoundConfig>(defaultConfig);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('soundConfig');
      if (saved) {
        setConfig({ ...defaultConfig, ...JSON.parse(saved) });
      } else {
        setConfig(defaultConfig);
      }
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('soundConfig', JSON.stringify(config));
    onClose();
  };

  const handleCancel = () => {
    const saved = localStorage.getItem('soundConfig');
    if (saved) {
      setConfig({ ...defaultConfig, ...JSON.parse(saved) });
    } else {
      setConfig(defaultConfig);
    }
    onClose();
  };

  const modalStyles = {
    content: {
      background: darkMode
        ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)'
        : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
      borderRadius: '12px',
      padding: '0',
      overflow: 'hidden',
    },
    header: {
      background: darkMode
        ? 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)'
        : 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
      padding: '14px 20px',
      margin: '0',
      borderBottom: 'none',
      borderRadius: '12px 12px 0 0',
    },
    body: {
      padding: '20px',
      background: darkMode
        ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)'
        : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
    },
    mask: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  };

  const checkboxStyle = {
    color: darkMode ? '#E2E8F0' : '#4B5563',
    fontSize: '14px',
  };

  const labelStyle = {
    color: darkMode ? '#E2E8F0' : '#374151',
    fontSize: '14px',
    fontWeight: 500,
  };

  const inputStyle = {
    background: darkMode ? '#1E293B' : '#FFFFFF',
    border: darkMode ? '1px solid #334155' : '1px solid rgba(29, 78, 95, 0.2)',
    color: darkMode ? '#F8FAFC' : '#0F172A',
    borderRadius: '6px',
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
      centered
      closable={false}
      styles={{
        content: modalStyles.content,
        header: modalStyles.header,
        body: modalStyles.body,
        mask: modalStyles.mask,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)',
          padding: '14px 20px',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          声音设置
        </span>
        <div
          onClick={handleCancel}
          style={{
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <X size={18} color="#FFFFFF" />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {/* Sound Settings Checkboxes */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              ...labelStyle,
              marginBottom: '12px',
            }}
          >
            声音设置：
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              padding: '12px 16px',
              background: darkMode ? 'rgba(42, 107, 124, 0.1)' : 'rgba(29, 78, 95, 0.04)',
              borderRadius: '8px',
              border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)',
            }}
          >
            <Checkbox
              checked={config.neighborStationDeparture}
              onChange={(e) =>
                setConfig({ ...config, neighborStationDeparture: e.target.checked })
              }
              style={checkboxStyle}
            >
              邻站发车
            </Checkbox>
            <Checkbox
              checked={config.dutyPreview}
              onChange={(e) =>
                setConfig({ ...config, dutyPreview: e.target.checked })
              }
              style={checkboxStyle}
            >
              出务预告
            </Checkbox>
            <Checkbox
              checked={config.dutyNotStartedAlarm}
              onChange={(e) =>
                setConfig({ ...config, dutyNotStartedAlarm: e.target.checked })
              }
              style={checkboxStyle}
            >
              未出务警报
            </Checkbox>
          </div>
        </div>

        {/* Time Range Settings */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              ...labelStyle,
              marginBottom: '12px',
            }}
          >
            重新派班时间范围（分钟）：
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...checkboxStyle, whiteSpace: 'nowrap' }}>早点大于：</span>
              <Input
                type="number"
                value={config.earlyThreshold}
                onChange={(e) =>
                  setConfig({ ...config, earlyThreshold: parseInt(e.target.value) || 0 })
                }
                style={{ ...inputStyle, width: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...checkboxStyle, whiteSpace: 'nowrap' }}>晚点大于：</span>
              <Input
                type="number"
                value={config.lateThreshold}
                onChange={(e) =>
                  setConfig({ ...config, lateThreshold: parseInt(e.target.value) || 0 })
                }
                style={{ ...inputStyle, width: '80px' }}
              />
            </div>
          </div>
        </div>

        {/* Forward Stations Setting */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              ...labelStyle,
              marginBottom: '12px',
            }}
          >
            前方站设置：
          </div>
          <Input.TextArea
            value={config.forwardStations}
            onChange={(e) =>
              setConfig({ ...config, forwardStations: e.target.value })
            }
            rows={3}
            style={{
              ...inputStyle,
              resize: 'none',
            }}
            placeholder="请输入前方站名称，多个站点用逗号或顿号分隔"
          />
        </div>

        {/* Save Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="primary"
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #2A6B7C 0%, #3B8A9C 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '0 24px',
              height: '36px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(42, 107, 124, 0.3)',
            }}
          >
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};
