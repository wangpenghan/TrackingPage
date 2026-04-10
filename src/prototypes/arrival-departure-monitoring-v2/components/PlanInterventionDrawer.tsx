import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, DatePicker, Popconfirm } from 'antd';
import { X, Save, RotateCcw, AlertCircle, Droplets } from 'lucide-react';
import { mockTrainSchedules } from '../mock-data';
import { SewageIcon } from './icons/SewageIcon';
import dayjs from 'dayjs';

const { Option } = Select;

interface PlanInterventionDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
  onTagsChange?: (trainId: string, tags: { water?: boolean; sewage?: boolean }) => void;
  onDataChange?: () => void;
}

// macOS 风格配色
const macOSColors = {
  light: {
    background: '#F5F5F7',
    cardBackground: '#FFFFFF',
    textPrimary: '#1D1D1F',
    textSecondary: '#86868B',
    accent: '#007AFF',
    accentHover: '#0051D5',
    border: '#D2D2D7',
    danger: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759'
  },
  dark: {
    background: '#1C1C1E',
    cardBackground: '#2C2C2E',
    textPrimary: '#F5F5F7',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    accentHover: '#409CFF',
    border: '#38383A',
    danger: '#FF453A',
    warning: '#FF9F0A',
    success: '#30D158'
  }
};

export const PlanInterventionDrawer: React.FC<PlanInterventionDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false,
  onTagsChange,
  onDataChange
}) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);
  const colors = darkMode ? macOSColors.dark : macOSColors.light;

  // 作业标记状态 - 与外部数据同步
  const [operationTags, setOperationTags] = useState({
    water: false,
    sewage: false
  });

  // 当抽屉打开或车次变化时，同步外部数据
  useEffect(() => {
    if (visible && train) {
      setOperationTags({
        water: train.tags?.water || false,
        sewage: train.tags?.sewage || false
      });
      
      // 从列车数据初始化表单
      const newFormData = {
        origin: train.route?.start || train.station || '北京西',
        destination: train.route?.end || '郑州东',
        trainModel: train.attributes?.trainModel || 'CRH3800',
        formation: String(train.attributes?.formation || '16'),
        formationOrder: train.attributes?.formationOrder || 'normal',
        broadcastGroup: 'xxxxx'
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
    }
  }, [visible, trainId, train]);

  // 处理作业标记切换（仅更新本地状态，保存时生效）
  const handleTagToggle = (tagType: 'water' | 'sewage') => {
    setOperationTags(prev => ({
      ...prev,
      [tagType]: !prev[tagType]
    }));
  };

  // 保存作业标记
  const saveOperationTags = () => {
    if (!train) return;
    
    // 同步更新外部数据
    if (onTagsChange) {
      onTagsChange(train.id, operationTags);
    }
    
    // 同步更新 mockTrainSchedules 中的数据
    const trainIndex = mockTrainSchedules.findIndex(t => t.id === train.id);
    if (trainIndex !== -1) {
      mockTrainSchedules[trainIndex] = {
        ...mockTrainSchedules[trainIndex],
        tags: {
          ...mockTrainSchedules[trainIndex].tags,
          water: operationTags.water,
          sewage: operationTags.sewage
        }
      };
    }
  };

  // 初始表单状态
  // 初始表单数据
  const defaultFormData = {
    origin: '北京西',
    destination: '郑州东',
    trainModel: 'CRH3800',
    formation: '16',
    formationOrder: 'normal',
    broadcastGroup: 'xxxxx'
  };

  // 表单状态
  const [initialFormData, setInitialFormData] = useState(defaultFormData);
  const [formData, setFormData] = useState(defaultFormData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 晚点未定状态
  const [isLateUndetermined, setIsLateUndetermined] = useState(false);

  // 未定恢复弹窗状态
  const [recoveryModalVisible, setRecoveryModalVisible] = useState(false);
  const [recoveryTimes, setRecoveryTimes] = useState({
    arrivalTime: dayjs(),
    departureTime: dayjs()
  });

  // 检测是否有未保存的修改
  React.useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialFormData]);

  if (!visible || !train) return null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认关闭',
        content: '您有未保存的修改，是否继续关闭？',
        okText: '不保存关闭',
        cancelText: '取消',
        onOk: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const handleSave = () => {
    console.log('Save plan intervention:', formData);
    
    // 保存数据到 mockTrainSchedules
    if (train) {
      const trainIndex = mockTrainSchedules.findIndex(t => t.id === train.id);
      if (trainIndex !== -1) {
        mockTrainSchedules[trainIndex] = {
          ...mockTrainSchedules[trainIndex],
          route: {
            ...mockTrainSchedules[trainIndex].route,
            start: formData.origin,
            end: formData.destination
          },
          station: formData.origin,
          attributes: {
            ...mockTrainSchedules[trainIndex].attributes,
            trainModel: formData.trainModel,
            formation: parseInt(formData.formation) || 16,
            formationOrder: formData.formationOrder as 'normal' | 'reverse'
          },
          tags: {
            ...mockTrainSchedules[trainIndex].tags,
            water: operationTags.water,
            sewage: operationTags.sewage
          }
        };
      }
    }
    
    // 保存数据到初始状态，但不关闭抽屉
    setInitialFormData({ ...formData });
    setHasUnsavedChanges(false);
    // 保存作业标记
    saveOperationTags();
    // 通知父组件数据已更改
    if (onDataChange) {
      onDataChange();
    }
    // 不调用 onClose()，保持抽屉打开
  };

  // 处理晚点未定按钮点击
  const handleLateUndeterminedClick = () => {
    if (isLateUndetermined) {
      setRecoveryModalVisible(true);
    } else {
      setIsLateUndetermined(true);
    }
  };

  // 处理未定恢复确认
  const handleRecoveryConfirm = () => {
    console.log('未定恢复，时间设置为:', {
      arrivalTime: recoveryTimes.arrivalTime.format('YYYY-MM-DD HH:mm'),
      departureTime: recoveryTimes.departureTime.format('YYYY-MM-DD HH:mm')
    });
    setIsLateUndetermined(false);
    setRecoveryModalVisible(false);
  };

  // 处理未定恢复取消
  const handleRecoveryCancel = () => {
    setRecoveryModalVisible(false);
  };

  // 检查字段是否变化
  const isFieldChanged = (field: keyof typeof formData) => {
    return formData[field] !== initialFormData[field];
  };

  // 变化标记组件
  const ChangeIndicator = ({ changed }: { changed: boolean }) => {
    if (!changed) return null;
    return (
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: colors.warning,
          marginLeft: '6px',
          flexShrink: 0
        }}
        title="已修改"
      />
    );
  };

  // 变化检测样式
  const getChangedStyle = (isChanged: boolean): React.CSSProperties => ({
    borderColor: isChanged ? colors.warning : undefined,
    backgroundColor: isChanged
      ? (darkMode ? 'rgba(255, 159, 10, 0.1)' : 'rgba(255, 149, 0, 0.05)')
      : undefined
  });

  return (
    <>
      <div style={getOverlayStyle(darkMode)} onClick={handleOverlayClick} />

      <div style={getContainerStyle(darkMode, colors)}>
        <div style={getHeaderStyle(darkMode, colors)}>
          <div style={getTitleStyle(darkMode, colors)}>
            计划干预
            {hasUnsavedChanges && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(255, 159, 10, 0.2)' : 'rgba(255, 149, 0, 0.15)',
                color: colors.warning,
                border: `1px solid ${darkMode ? 'rgba(255, 159, 10, 0.3)' : 'rgba(255, 149, 0, 0.25)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertCircle size={10} />
                未保存
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={getTrainNoBadgeStyle(darkMode, colors)}>{train.trainNo}</div>
            <Button
              type="text"
              icon={<X size={20} />}
              onClick={handleClose}
              style={getCloseButtonStyle(darkMode, colors)}
            />
          </div>
        </div>

        <div style={getContentStyle(darkMode, colors)}>
          {/* 基本信息卡片 */}
          <div style={getCardStyle(darkMode, colors)}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: colors.accent
              }}>基本信息</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 始发站 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  始发站:
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Input
                    value={formData.origin}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    style={{ ...getInputStyle(darkMode, colors), flex: 1, ...getChangedStyle(isFieldChanged('origin')) }}
                  />
                  <ChangeIndicator changed={isFieldChanged('origin')} />
                </div>
              </div>

              {/* 终到站 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  终到站:
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Input
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    style={{ ...getInputStyle(darkMode, colors), flex: 1, ...getChangedStyle(isFieldChanged('destination')) }}
                  />
                  <ChangeIndicator changed={isFieldChanged('destination')} />
                </div>
              </div>

              {/* 车型 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  车型:
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Select
                    value={formData.trainModel}
                    onChange={(value) => setFormData(prev => ({ ...prev, trainModel: value }))}
                    style={{ ...getSelectStyle(darkMode, colors), flex: 1, ...getChangedStyle(isFieldChanged('trainModel')) }}
                    dropdownStyle={{ zIndex: 2000 }}
                    showSearch
                    allowClear
                    placeholder="请输入或选择车型"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="CRH3800">CRH3800</Option>
                    <Option value="CRH2A">CRH2A</Option>
                    <Option value="CRH380B">CRH380B</Option>
                    <Option value="CR400AF">CR400AF</Option>
                    <Option value="CR400BF">CR400BF</Option>
                    <Option value="CRH1A">CRH1A</Option>
                    <Option value="CRH1B">CRH1B</Option>
                    <Option value="CRH1E">CRH1E</Option>
                    <Option value="CRH2C">CRH2C</Option>
                    <Option value="CRH2E">CRH2E</Option>
                    <Option value="CRH3C">CRH3C</Option>
                    <Option value="CRH5A">CRH5A</Option>
                    <Option value="CRH5G">CRH5G</Option>
                    <Option value="CRH6A">CRH6A</Option>
                    <Option value="CRH6F">CRH6F</Option>
                    <Option value="CR300AF">CR300AF</Option>
                    <Option value="CR300BF">CR300BF</Option>
                  </Select>
                  <ChangeIndicator changed={isFieldChanged('trainModel')} />
                </div>
              </div>

              {/* 编组数 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  编组数:
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Input
                    value={formData.formation}
                    onChange={(e) => setFormData(prev => ({ ...prev, formation: e.target.value }))}
                    style={{ ...getInputStyle(darkMode, colors), flex: 1, ...getChangedStyle(isFieldChanged('formation')) }}
                  />
                  <ChangeIndicator changed={isFieldChanged('formation')} />
                </div>
              </div>

              {/* 编组方向 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  编组方向:
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Select
                    value={formData.formationOrder}
                    onChange={(value) => setFormData(prev => ({ ...prev, formationOrder: value }))}
                    style={{ ...getSelectStyle(darkMode, colors), flex: 1, ...getChangedStyle(isFieldChanged('formationOrder')) }}
                    dropdownStyle={{ zIndex: 2000 }}
                  >
                    <Option value="normal">正序</Option>
                    <Option value="reverse">倒序</Option>
                  </Select>
                  <ChangeIndicator changed={isFieldChanged('formationOrder')} />
                </div>
              </div>

              {/* 广播分组 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  广播分组:
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Select
                    value={formData.broadcastGroup}
                    onChange={(value) => setFormData(prev => ({ ...prev, broadcastGroup: value }))}
                    style={{ ...getSelectStyle(darkMode, colors), flex: 1, ...getChangedStyle(isFieldChanged('broadcastGroup')) }}
                    dropdownStyle={{ zIndex: 2000 }}
                    showSearch
                    allowClear
                    placeholder="请输入或选择广播分组"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="xxxxx">xxxxx</Option>
                    <Option value="group1">分组1</Option>
                    <Option value="group2">分组2</Option>
                    <Option value="group3">分组3</Option>
                    <Option value="group4">分组4</Option>
                    <Option value="group5">分组5</Option>
                    <Option value="north-area">北区</Option>
                    <Option value="south-area">南区</Option>
                    <Option value="east-area">东区</Option>
                    <Option value="west-area">西区</Option>
                    <Option value="hall-1">候车室1</Option>
                    <Option value="hall-2">候车室2</Option>
                    <Option value="hall-3">候车室3</Option>
                    <Option value="hall-4">候车室4</Option>
                    <Option value="hall-5">候车室5</Option>
                    <Option value="hall-6">候车室6</Option>
                  </Select>
                  <ChangeIndicator changed={isFieldChanged('broadcastGroup')} />
                </div>
              </div>

              {/* 作业标记 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...getLabelStyle(darkMode, colors), width: '70px', textAlign: 'right', flexShrink: 0 }}>
                  作业标记:
                </span>
                <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                  {/* 上水标记 */}
                  <button
                    onClick={() => handleTagToggle('water')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${operationTags.water ? '#007AFF' : colors.border}`,
                      background: operationTags.water 
                        ? (darkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)')
                        : colors.cardBackground,
                      color: operationTags.water ? '#007AFF' : colors.textPrimary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '13px',
                      fontWeight: operationTags.water ? 600 : 400
                    }}
                  >
                    <Droplets size={14} />
                    <span>上水</span>
                  </button>

                  {/* 吸污标记 */}
                  <button
                    onClick={() => handleTagToggle('sewage')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${operationTags.sewage ? '#007AFF' : colors.border}`,
                      background: operationTags.sewage 
                        ? (darkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)')
                        : colors.cardBackground,
                      color: operationTags.sewage ? '#007AFF' : colors.textPrimary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '13px',
                      fontWeight: operationTags.sewage ? 600 : 400
                    }}
                  >
                    <SewageIcon size={14} />
                    <span>吸污</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button
              onClick={handleReset}
              style={{ ...getSecondaryButtonStyle(darkMode, colors), height: '36px', fontSize: '13px' }}
              icon={<RotateCcw size={14} />}
            >
              恢复默认
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              style={{ ...getPrimaryButtonStyle(darkMode, colors), height: '36px', fontSize: '13px' }}
              icon={<Save size={14} />}
            >
              保存
            </Button>
          </div>

          {/* 操作按钮区域 */}
          <div style={getCardStyle(darkMode, colors)}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>操作控制</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px'
            }}>
              {/* 立即执行 - 主按钮 */}
              <Button
                type="primary"
                style={{
                  height: '36px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: colors.accent,
                  border: 'none'
                }}
              >
                立即执行
              </Button>

              {/* 进站开检 */}
              <Popconfirm
                title="确认执行进站开检？"
                description="此操作将触发进站开检流程，请确认是否继续。"
                onConfirm={() => console.log('执行进站开检')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  进站开检
                </Button>
              </Popconfirm>

              {/* 进站停检 */}
              <Popconfirm
                title="确认执行进站停检？"
                description="此操作将触发进站停检流程，请确认是否继续。"
                onConfirm={() => console.log('执行进站停检')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  进站停检
                </Button>
              </Popconfirm>

              {/* 出站开检 */}
              <Popconfirm
                title="确认执行出站开检？"
                description="此操作将触发出站开检流程，请确认是否继续。"
                onConfirm={() => console.log('执行出站开检')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  出站开检
                </Button>
              </Popconfirm>

              {/* 出站停检 */}
              <Popconfirm
                title="确认执行出站停检？"
                description="此操作将触发出站停检流程，请确认是否继续。"
                onConfirm={() => console.log('执行出站停检')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  出站停检
                </Button>
              </Popconfirm>

              {/* 列车到达 */}
              <Popconfirm
                title="确认执行列车到达？"
                description="此操作将标记列车已到达，请确认是否继续。"
                onConfirm={() => console.log('执行列车到达')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  列车到达
                </Button>
              </Popconfirm>

              {/* 列车离站 */}
              <Popconfirm
                title="确认执行列车离站？"
                description="此操作将标记列车已离站，请确认是否继续。"
                onConfirm={() => console.log('执行列车离站')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  列车离站
                </Button>
              </Popconfirm>

              {/* 预告 */}
              <Popconfirm
                title="确认发送预告？"
                description="此操作将发送列车预告信息，请确认是否继续。"
                onConfirm={() => console.log('执行预告')}
                okText="确认"
                cancelText="取消"
                placement="top"
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button style={{ height: '36px', fontSize: '13px', borderRadius: '8px', ...getSecondaryButtonStyle(darkMode, colors), width: '100%' }}>
                  预告
                </Button>
              </Popconfirm>

              {/* 晚点未定 / 未定恢复 */}
              {isLateUndetermined ? (
                <Button
                  onClick={handleLateUndeterminedClick}
                  style={{
                    height: '36px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    background: darkMode ? 'rgba(255, 69, 58, 0.15)' : '#FFF5F5',
                    color: colors.danger,
                    border: `1px solid ${colors.danger}`,
                    fontWeight: 600
                  }}
                >
                  未定恢复
                </Button>
              ) : (
                <Popconfirm
                  title="确认设置为晚点未定？"
                  description="设置后列车将被标记为晚点未定状态，请确认是否继续。"
                  onConfirm={handleLateUndeterminedClick}
                  okText="确认"
                  cancelText="取消"
                  placement="top"
                  overlayStyle={{ maxWidth: '380px' }}
                >
                  <Button
                    style={{
                      height: '40px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      background: colors.cardBackground,
                      color: colors.textSecondary,
                      border: `1px solid ${colors.border}`,
                      fontWeight: 500,
                      width: '100%'
                    }}
                  >
                    晚点未定
                  </Button>
                </Popconfirm>
              )}

              {/* 到停开 */}
              <Popconfirm
                title="⚠️ 危险操作确认"
                description="到停开操作将强制停止列车作业，此操作不可逆，请确认是否继续？"
                onConfirm={() => console.log('执行到停开')}
                okText="确认执行"
                cancelText="取消"
                placement="top"
                okButtonProps={{ danger: true }}
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button
                  danger
                  style={{
                    height: '40px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    borderStyle: 'dashed',
                    width: '100%'
                  }}
                >
                  到停开
                </Button>
              </Popconfirm>

              {/* 发停开 */}
              <Popconfirm
                title="⚠️ 危险操作确认"
                description="发停开操作将强制停止发车作业，此操作不可逆，请确认是否继续？"
                onConfirm={() => console.log('执行发停开')}
                okText="确认执行"
                cancelText="取消"
                placement="top"
                okButtonProps={{ danger: true }}
                overlayStyle={{ maxWidth: '380px' }}
              >
                <Button
                  danger
                  style={{
                    height: '40px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    borderStyle: 'dashed',
                    width: '100%'
                  }}
                >
                  发停开
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      </div>

      {/* 未定恢复弹窗 */}
      <Modal
        title="未定恢复"
        open={recoveryModalVisible}
        onOk={handleRecoveryConfirm}
        onCancel={handleRecoveryCancel}
        okText="确认"
        cancelText="取消"
        width={400}
        styles={{
          header: {
            background: darkMode ? macOSColors.dark.cardBackground : macOSColors.light.cardBackground,
            color: darkMode ? macOSColors.dark.textPrimary : macOSColors.light.textPrimary,
            borderBottom: darkMode ? `1px solid ${macOSColors.dark.border}` : `1px solid ${macOSColors.light.border}`
          },
          body: {
            background: darkMode ? macOSColors.dark.cardBackground : macOSColors.light.cardBackground,
            padding: '20px'
          },
          footer: {
            background: darkMode ? macOSColors.dark.cardBackground : macOSColors.light.cardBackground,
            borderTop: darkMode ? `1px solid ${macOSColors.dark.border}` : `1px solid ${macOSColors.light.border}`
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>
            请设置恢复后的实际时间：
          </div>

          {/* 实际到站时间 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.textPrimary }}>
              实际到站时间：
            </span>
            <DatePicker
              showTime
              value={recoveryTimes.arrivalTime}
              onChange={(date) => date && setRecoveryTimes(prev => ({ ...prev, arrivalTime: date }))}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </div>

          {/* 实际离站时间 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.textPrimary }}>
              实际离站时间：
            </span>
            <DatePicker
              showTime
              value={recoveryTimes.departureTime}
              onChange={(date) => date && setRecoveryTimes(prev => ({ ...prev, departureTime: date }))}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

// 样式函数
const getOverlayStyle = (darkMode: boolean): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
  zIndex: 999
});

const getContainerStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '480px',
  background: colors.background,
  zIndex: 1000,
  boxShadow: darkMode ? '-8px 0 32px rgba(0,0,0,0.5)' : '-8px 0 32px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column'
});

const getHeaderStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  padding: '16px 20px',
  borderBottom: `1px solid ${colors.border}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: colors.cardBackground
});

const getTitleStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  fontSize: '17px',
  fontWeight: 600,
  color: colors.textPrimary,
  letterSpacing: '-0.01em',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
  display: 'flex',
  alignItems: 'center'
});

const getTrainNoBadgeStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  background: darkMode
    ? 'rgba(255, 159, 10, 0.15)'
    : 'rgba(255, 149, 0, 0.1)',
  padding: '6px 16px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 600,
  color: colors.warning,
  border: `1px solid ${darkMode ? 'rgba(255, 159, 10, 0.25)' : 'rgba(255, 149, 0, 0.2)'}`,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
});

const getCloseButtonStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  color: colors.textSecondary,
  background: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease'
});

const getContentStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  background: colors.background,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const getCardStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  borderRadius: '12px',
  background: colors.cardBackground,
  padding: '16px',
  border: `1px solid ${colors.border}`,
  boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
});

const getPrimaryButtonStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  padding: '0 20px',
  fontSize: '13px',
  height: '36px',
  fontWeight: 500,
  borderRadius: '8px',
  background: colors.accent,
  border: 'none',
  color: '#FFFFFF',
  boxShadow: 'none'
});

const getSecondaryButtonStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  padding: '0 16px',
  fontSize: '13px',
  height: '40px',
  fontWeight: 500,
  borderRadius: '8px',
  background: colors.cardBackground,
  color: colors.textPrimary,
  border: `1px solid ${colors.border}`,
  boxShadow: 'none'
});

const getSelectStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  width: '100%',
  height: '40px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  background: colors.cardBackground,
  border: `1px solid ${colors.border}`,
  color: colors.accent
});

const getInputStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  width: '100%',
  height: '40px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  background: colors.cardBackground,
  border: `1px solid ${colors.border}`,
  color: colors.accent
});

const getLabelStyle = (darkMode: boolean, colors: typeof macOSColors.light): React.CSSProperties => ({
  fontSize: '13px',
  color: colors.textSecondary,
  fontWeight: 500
});
