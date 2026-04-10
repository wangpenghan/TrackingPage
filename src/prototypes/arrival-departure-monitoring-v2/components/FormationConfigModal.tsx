/**
 * 编组配置模态框
 * 用于配置列车编组信息
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Radio } from 'antd';
import { TrainFormation, FormationType } from './TrainFormationDrawer';

const { Option } = Select;

interface FormationConfigModalProps {
  visible: boolean;
  formation: TrainFormation;
  onCancel: () => void;
  onSave: (formation: TrainFormation) => void;
  onChanges: (hasChanges: boolean) => void;
}

// 获取编组类型文本
const getFormationTypeText = (type: FormationType): string => {
  const textMap: Record<FormationType, string> = {
    '8': '8编组',
    '16': '16编组',
    '8+8': '8编组重联'
  };
  return textMap[type];
};

const FormationConfigModal: React.FC<FormationConfigModalProps> = ({
  visible,
  formation,
  onCancel,
  onSave,
  onChanges
}) => {
  const [form] = Form.useForm();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 检查表单是否有修改
  const checkChanges = () => {
    const values = form.getFieldsValue();
    const hasChanges = values.trainModel !== formation.trainModel || 
                       values.formationType !== formation.formationType;
    setHasUnsavedChanges(hasChanges);
    onChanges(hasChanges);
  };

  // 监听表单变化
  useEffect(() => {
    // 初始检查
    checkChanges();
  }, [form, formation, onChanges]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...formation,
        ...values
      });
      setHasUnsavedChanges(false);
      onChanges(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setHasUnsavedChanges(false);
    onChanges(false);
    onCancel();
  };

  const trainModels = ['CR400BF', 'CR400AF', 'CRH2A', 'CRH380A', 'CRH380B', 'CRH3C', 'CRH5', 'CRH2', '25K', '25G'];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          编组配置
          {hasUnsavedChanges && (
            <span style={{
              background: '#FEF2F2',
              color: '#EF4444',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}>未保存</span>
          )}
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={formation}
        onValuesChange={checkChanges}
      >
        <Form.Item
          label="车型"
          name="trainModel"
          rules={[{ required: true, message: '请选择车型' }]}
        >
          <Select
            placeholder="选择车型"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1890ff'
            }}
          >
            {trainModels.map(model => (
              <Option key={model} value={model}>{model}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="编组类型"
          name="formationType"
          rules={[{ required: true, message: '请选择编组类型' }]}
        >
          <Radio.Group>
            <Radio.Button value="8">{getFormationTypeText('8')}</Radio.Button>
            <Radio.Button value="16">{getFormationTypeText('16')}</Radio.Button>
            <Radio.Button value="8+8">{getFormationTypeText('8+8')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormationConfigModal;
