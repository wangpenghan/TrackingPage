import React from 'react';
import { Button } from 'antd';
import { X, Train, QrCode, FileText, User, Phone } from 'lucide-react';

// 客运记录数据接口
export interface PassengerRecord {
  id: string;
  recordNo: string;
  trainNo: string;
  arrivalDate: string;
  recordType: 'lost' | 'special' | 'handover' | 'other';
  recordTypeName: string;
  direction: 'departure' | 'arrival'; // 发/到
  status: string;
  appeal: string;
  itemList: string;
  currentNode: {
    station: string;
    contactName: string;
    contactPhone: string;
    status: string;
  };
  transferRecords: {
    id: string;
    description: string;
    isCurrent?: boolean;
  }[];
}

interface PassengerRecordDrawerProps {
  visible: boolean;
  onClose: () => void;
  record: PassengerRecord | null;
  darkMode?: boolean;
}

// 样式函数 - 与 OperationDrawer 保持一致
const getOverlayStyle = (darkMode: boolean): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  zIndex: 999
});

const getContainerStyle = (darkMode: boolean): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '480px',
  background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
  zIndex: 1000,
  boxShadow: darkMode ? '-8px 0 24px rgba(0,0,0,0.4)' : '-8px 0 24px rgba(29,78,95,0.12)',
  display: 'flex',
  flexDirection: 'column'
});

const getHeaderStyle = (darkMode: boolean): React.CSSProperties => ({
  padding: '14px 20px',
  borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
});

const getTitleStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '17px',
  fontWeight: 600,
  color: darkMode ? '#E2E8F0' : '#1F2937',
  letterSpacing: '0.5px',
  fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
});

const getCloseButtonStyle = (darkMode: boolean): React.CSSProperties => ({
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  color: darkMode ? '#94A3B8' : '#64748B',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF'
});

const getContentStyle = (darkMode: boolean): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  background: darkMode ? 'transparent' : '#FAF8F5',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const getCardStyle = (darkMode: boolean): React.CSSProperties => ({
  borderRadius: '10px',
  background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
  padding: '16px',
  border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
  boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
});

const getLabelStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '12px',
  color: darkMode ? '#94A3B8' : '#64748B',
  fontWeight: 500,
  letterSpacing: '0.3px',
  flexShrink: 0
});

const getValueStyle = (darkMode: boolean): React.CSSProperties => ({
  fontSize: '13px',
  color: darkMode ? '#F1F5F9' : '#1F2937',
  lineHeight: 1.6
});

export const PassengerRecordDrawer: React.FC<PassengerRecordDrawerProps> = ({
  visible,
  onClose,
  record,
  darkMode = false
}) => {
  if (!visible || !record) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 类型图标颜色
  const getTypeIconBg = () => {
    return darkMode
      ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)'
      : 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 50%, #FEF7E6 100%)';
  };

  // 方向文字
  const getDirectionText = () => {
    return record.direction === 'departure' ? '发' : '到';
  };

  return (
    <>
      {/* 遮罩层 */}
      <div style={getOverlayStyle(darkMode)} onClick={handleOverlayClick} />

      {/* 抽屉容器 */}
      <div style={getContainerStyle(darkMode)}>
        {/* 头部 */}
        <div style={getHeaderStyle(darkMode)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Train size={20} color={darkMode ? '#94A3B8' : '#64748B'} />
            <div>
              <div style={getTitleStyle(darkMode)}>{record.trainNo}</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#64748B' : '#94A3B8', marginTop: '2px' }}>
                {record.arrivalDate}（到达日期）
              </div>
            </div>
          </div>
          <Button
            type="text"
            icon={<X size={20} />}
            onClick={onClose}
            style={getCloseButtonStyle(darkMode)}
          />
        </div>

        {/* 内容区域 */}
        <div style={getContentStyle(darkMode)}>
          {/* 记录类型标签 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '10px',
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
            boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* 类型图标 */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: getTypeIconBg(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: darkMode ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(217, 119, 6, 0.2)',
                fontSize: '16px',
                fontWeight: 'bold',
                color: darkMode ? '#FBBF24' : '#92400E'
              }}>
                {getDirectionText()}
              </div>
              {/* 类型名称 */}
              <span style={{
                fontSize: '15px',
                fontWeight: 600,
                color: darkMode ? '#F1F5F9' : '#1F2937'
              }}>
                {record.recordTypeName}
              </span>
            </div>
            {/* 状态标签 */}
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#D97706',
              padding: '4px 12px',
              borderRadius: '6px',
              background: darkMode ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.08)'
            }}>
              {record.status}
            </span>
          </div>

          {/* 记录详情卡片 */}
          <div style={getCardStyle(darkMode)}>
            {/* 记录编号 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={getLabelStyle(darkMode)}>记录编号：</span>
                <span style={{ ...getValueStyle(darkMode), fontWeight: 600, fontSize: '14px' }}>
                  {record.recordNo}
                </span>
              </div>
              <QrCode size={24} color={darkMode ? '#64748B' : '#94A3B8'} />
            </div>

            {/* 车次信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={getLabelStyle(darkMode)}>车次信息：</span>
              <span style={getValueStyle(darkMode)}>
                {record.trainNo} {record.arrivalDate}（到达日期）
              </span>
            </div>

            {/* 记录诉求 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ ...getLabelStyle(darkMode), marginBottom: '6px' }}>记录诉求：</div>
              <div style={{
                ...getValueStyle(darkMode),
                padding: '10px 12px',
                background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
                borderRadius: '8px',
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
              }}>
                {record.appeal}
              </div>
            </div>

            {/* 物品清单 */}
            <div>
              <div style={{ ...getLabelStyle(darkMode), marginBottom: '6px' }}>物品清单：</div>
              <div style={{
                ...getValueStyle(darkMode),
                padding: '10px 12px',
                background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
                borderRadius: '8px',
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
              }}>
                {record.itemList}
              </div>
            </div>
          </div>

          {/* 流转记录 */}
          <div style={getCardStyle(darkMode)}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: darkMode ? '#E2E8F0' : '#374151',
              marginBottom: '16px'
            }}>
              流转记录：
            </div>

            {/* 当前处理节点 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '16px',
              padding: '12px',
              background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
              borderRadius: '8px',
              border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
            }}>
              {/* 站点图标 */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: darkMode ? 'linear-gradient(135deg, #2A6B7C 0%, #1D4E5F 100%)' : 'linear-gradient(135deg, #2A6B7C 0%, #1D4E5F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={20} color="#FFFFFF" />
              </div>

              {/* 站点信息 */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: darkMode ? '#F1F5F9' : '#1F2937',
                  marginBottom: '4px'
                }}>
                  {record.currentNode.station}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: darkMode ? '#94A3B8' : '#64748B'
                }}>
                  <User size={14} />
                  <span>{record.currentNode.contactName}</span>
                  <span style={{ color: darkMode ? '#64748B' : '#94A3B8' }}>-</span>
                  <Phone size={14} />
                  <span>{record.currentNode.contactPhone}</span>
                </div>
              </div>

              {/* 状态标签 */}
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#D97706',
                padding: '3px 10px',
                borderRadius: '6px',
                background: darkMode ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.08)',
                flexShrink: 0
              }}>
                {record.currentNode.status}
              </span>
            </div>

            {/* 时间线 */}
            <div style={{ paddingLeft: '22px' }}>
              {record.transferRecords.map((item, index) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  position: 'relative',
                  marginBottom: index < record.transferRecords.length - 1 ? '16px' : 0
                }}>
                  {/* 时间线节点 */}
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: darkMode ? '#64748B' : '#94A3B8',
                    flexShrink: 0,
                    marginTop: '4px'
                  }} />

                  {/* 连接线 */}
                  {index < record.transferRecords.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '5px',
                      top: '16px',
                      width: '2px',
                      height: '24px',
                      background: darkMode ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.4)'
                    }} />
                  )}

                  {/* 节点描述 */}
                  <span style={{
                    fontSize: '13px',
                    color: darkMode ? '#94A3B8' : '#64748B'
                  }}>
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PassengerRecordDrawer;
