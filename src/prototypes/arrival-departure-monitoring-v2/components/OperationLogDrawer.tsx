import React, { useState, useMemo } from 'react';
import { Button, Tag, Input, Table } from 'antd';
import { X, FileText, User, Clock, Search } from 'lucide-react';
import { mockTrainSchedules } from '../mock-data';

interface OperationLogDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
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
    success: '#34C759',
    warning: '#FF9500'
  },
  dark: {
    background: '#1C1C1E',
    cardBackground: '#2C2C2E',
    textPrimary: '#F5F5F7',
    textSecondary: '#8E8E93',
    accent: '#0A84FF',
    accentHover: '#409CFF',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A'
  }
};

// 模拟操作日志数据
interface OperationLog {
  id: string;
  time: string;
  operator: string;
  operationType: 'modify' | 'execute' | 'confirm' | 'system';
  operationTypeName: string;
  content: string;
  ip?: string;
}

const generateMockLogs = (trainNo: string): OperationLog[] => {
  const now = new Date();
  const logs: OperationLog[] = [
    {
      id: '1',
      time: new Date(now.getTime() - 5 * 60000).toISOString(),
      operator: '张三',
      operationType: 'modify',
      operationTypeName: '修改',
      content: `修改车次 ${trainNo} 晚点时间为 5分钟`,
      ip: '192.168.1.101'
    },
    {
      id: '2',
      time: new Date(now.getTime() - 15 * 60000).toISOString(),
      operator: '系统',
      operationType: 'system',
      operationTypeName: '广播',
      content: '手动触发到站广播',
      ip: '192.168.1.205'
    },
    {
      id: '3',
      time: new Date(now.getTime() - 25 * 60000).toISOString(),
      operator: '李四',
      operationType: 'confirm',
      operationTypeName: '作业',
      content: '综控员确认上水作业完成',
      ip: '192.168.1.112'
    },
    {
      id: '4',
      time: new Date(now.getTime() - 40 * 60000).toISOString(),
      operator: '系统',
      operationType: 'system',
      operationTypeName: '闸机',
      content: '检票口6B开启检票',
      ip: '192.168.1.55'
    },
    {
      id: '5',
      time: new Date(now.getTime() - 60 * 60000).toISOString(),
      operator: '王五',
      operationType: 'execute',
      operationTypeName: '执行',
      content: `执行车次 ${trainNo} 进站开检操作`,
      ip: '192.168.1.88'
    },
    {
      id: '6',
      time: new Date(now.getTime() - 90 * 60000).toISOString(),
      operator: '系统',
      operationType: 'system',
      operationTypeName: '广播',
      content: '自动触发候车广播',
      ip: '192.168.1.205'
    },
    {
      id: '7',
      time: new Date(now.getTime() - 120 * 60000).toISOString(),
      operator: '赵六',
      operationType: 'modify',
      operationTypeName: '修改',
      content: `修改车次 ${trainNo} 股道为 12道`,
      ip: '192.168.1.102'
    },
    {
      id: '8',
      time: new Date(now.getTime() - 150 * 60000).toISOString(),
      operator: '系统',
      operationType: 'system',
      operationTypeName: '广播',
      content: '自动触发检票广播',
      ip: '192.168.1.205'
    },
    {
      id: '9',
      time: new Date(now.getTime() - 180 * 60000).toISOString(),
      operator: '钱七',
      operationType: 'execute',
      operationTypeName: '执行',
      content: `执行车次 ${trainNo} 出站开检操作`,
      ip: '192.168.1.89'
    },
    {
      id: '10',
      time: new Date(now.getTime() - 210 * 60000).toISOString(),
      operator: '系统',
      operationType: 'system',
      operationTypeName: '闸机',
      content: '检票口6B关闭检票',
      ip: '192.168.1.55'
    },
    {
      id: '11',
      time: new Date(now.getTime() - 240 * 60000).toISOString(),
      operator: '孙八',
      operationType: 'confirm',
      operationTypeName: '作业',
      content: '综控员确认吸污作业完成',
      ip: '192.168.1.113'
    },
    {
      id: '12',
      time: new Date(now.getTime() - 300 * 60000).toISOString(),
      operator: '系统',
      operationType: 'system',
      operationTypeName: '广播',
      content: '自动触发安全提示广播',
      ip: '192.168.1.205'
    }
  ];
  return logs;
};

export const OperationLogDrawer: React.FC<OperationLogDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false
}) => {
  // 所有 Hook 必须在条件判断之前调用
  const [searchTerm, setSearchTerm] = useState('');
  
  const train = mockTrainSchedules.find(t => t.id === trainId);
  const colors = darkMode ? macOSColors.dark : macOSColors.light;
  const logs = train ? generateMockLogs(train.trainNo) : [];

  // 模糊搜索过滤 - 必须在条件判断之前
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    
    const term = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.operator.toLowerCase().includes(term) ||
      log.operationTypeName.toLowerCase().includes(term) ||
      log.content.toLowerCase().includes(term) ||
      log.ip?.toLowerCase().includes(term) ||
      new Date(log.time).toLocaleString('zh-CN').toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  if (!visible || !train) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getOperationTypeColor = (type: string) => {
    switch (type) {
      case 'modify':
        return darkMode ? '#FF9F0A' : '#FF9500';
      case 'execute':
        return darkMode ? '#0A84FF' : '#007AFF';
      case 'confirm':
        return darkMode ? '#30D158' : '#34C759';
      case 'system':
        return darkMode ? '#8E8E93' : '#86868B';
      default:
        return darkMode ? '#8E8E93' : '#86868B';
    }
  };

  const getOperationTypeBg = (type: string) => {
    switch (type) {
      case 'modify':
        return darkMode ? 'rgba(255, 159, 10, 0.15)' : 'rgba(255, 149, 0, 0.1)';
      case 'execute':
        return darkMode ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)';
      case 'confirm':
        return darkMode ? 'rgba(48, 209, 88, 0.15)' : 'rgba(52, 199, 89, 0.1)';
      case 'system':
        return darkMode ? 'rgba(142, 142, 147, 0.15)' : 'rgba(134, 134, 139, 0.1)';
      default:
        return darkMode ? 'rgba(142, 142, 147, 0.15)' : 'rgba(134, 134, 139, 0.1)';
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 80,
      render: (type: string, record: OperationLog) => (
        <Tag
          style={{
            margin: 0,
            borderRadius: '6px',
            padding: '2px 10px',
            fontSize: '12px',
            fontWeight: 500,
            border: 'none',
            background: getOperationTypeBg(type),
            color: getOperationTypeColor(type)
          }}
        >
          {record.operationTypeName}
        </Tag>
      )
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <span
          style={{
            fontSize: '13px',
            color: colors.textPrimary,
            lineHeight: '1.5'
          }}
        >
          {content}
        </span>
      )
    },
    {
      title: '时间/IP',
      dataIndex: 'time',
      key: 'time',
      width: 200,
      render: (time: string, record: OperationLog) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: 'SF Mono, monospace'
            }}
          >
            {formatTime(time)}
          </span>
          {record.ip && (
            <Tag
              style={{
                margin: 0,
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '4px',
                background: darkMode ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.12)',
                color: darkMode ? '#64D2FF' : '#007AFF',
                border: `1px solid ${darkMode ? 'rgba(10, 132, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)'}`,
                fontFamily: 'SF Mono, monospace',
                width: 'fit-content',
                fontWeight: 500
              }}
            >
              {record.ip}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
      render: (operator: string) => (
        <span
          style={{
            fontSize: '13px',
            color: colors.textPrimary,
            fontWeight: 500
          }}
        >
          {operator}
        </span>
      )
    }
  ];

  return (
    <>
      {/* 遮罩层 */}
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

      {/* 抽屉容器 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '960px',
          background: colors.background,
          zIndex: 1000,
          boxShadow: darkMode ? '-8px 0 32px rgba(0,0,0,0.5)' : '-8px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 头部 */}
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
            <FileText size={20} color={colors.accent} />
            操作日志
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: darkMode
                  ? 'rgba(255, 159, 10, 0.15)'
                  : 'rgba(255, 149, 0, 0.1)',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.warning,
                border: `1px solid ${darkMode ? 'rgba(255, 159, 10, 0.25)' : 'rgba(255, 149, 0, 0.2)'}`
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

        {/* 搜索栏 */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${colors.border}`,
            background: colors.cardBackground
          }}
        >
          <Input
            placeholder="搜索操作人、类型、内容、IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<Search size={16} color={colors.textSecondary} />}
            style={{
              height: '36px',
              borderRadius: '8px',
              background: darkMode ? '#1C1C1E' : '#F5F5F7',
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              fontSize: '16px',
              fontWeight: 600
            }}
          />
        </div>

        {/* 内容区 - 表格 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            background: colors.background
          }}
        >
          <div
            style={{
              background: colors.cardBackground,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden'
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredLogs}
              rowKey="id"
              pagination={false}
              size="small"
              bordered={false}
              style={{
                '--ant-table-header-bg': darkMode ? '#2C2C2E' : '#F5F5F7',
                '--ant-table-header-color': colors.textSecondary,
                '--ant-table-row-hover-bg': darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              } as React.CSSProperties}
            />
          </div>
          
          {/* 统计信息 */}
          <div
            style={{
              marginTop: '12px',
              padding: '0 4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}
            >
              共 {filteredLogs.length} 条记录
              {searchTerm && ` (搜索: "${searchTerm}")`}
            </span>
          </div>
        </div>

        {/* 底部按钮 */}
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

export default OperationLogDrawer;
