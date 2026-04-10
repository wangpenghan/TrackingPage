import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Table } from 'antd';
import { X, Users, ArrowUp, ArrowDown, RotateCcw as TransferIcon } from 'lucide-react';
import { mockTrainSchedules, TrainSchedule } from '../mock-data';

interface PassengerFlowDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
}

// 换乘信息数据类型
interface TransferInfo {
  trainNo: string;
  transferCount: number;
}

export const PassengerFlowDrawer: React.FC<PassengerFlowDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false
}) => {
  const train = mockTrainSchedules.find(t => t.id === trainId);

  // 模拟换乘信息数据
  const [transferInfo] = useState<TransferInfo[]>([
    { trainNo: 'G235', transferCount: 5 },
    { trainNo: 'D6678', transferCount: 6 },
    { trainNo: 'D6870', transferCount: 2 },
    { trainNo: 'G91', transferCount: 1 },
    { trainNo: 'G48', transferCount: 4 },
    { trainNo: 'G335', transferCount: 2 }
  ]);

  if (!visible || !train) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 换乘信息表格列
  const transferColumns = [
    {
      title: '车次',
      dataIndex: 'trainNo',
      key: 'trainNo',
      align: 'center' as const,
      render: (text: string) => (
        <span style={{ 
          fontWeight: 600, 
          color: darkMode ? '#E2E8F0' : '#1F2937',
          fontFamily: 'Oswald, sans-serif'
        }}>
          {text}
        </span>
      )
    },
    {
      title: '换乘人数',
      dataIndex: 'transferCount',
      key: 'transferCount',
      align: 'center' as const,
      render: (text: number) => (
        <span style={{ 
          fontWeight: 600, 
          color: darkMode ? '#10B981' : '#059669',
          fontSize: '16px'
        }}>
          {text}
        </span>
      )
    }
  ];

  return (
    <>
      <div style={getOverlayStyle(darkMode)} onClick={handleOverlayClick} />
      
      <div style={getContainerStyle(darkMode)}>
        <div style={getHeaderStyle(darkMode)}>
          <div style={getTitleStyle(darkMode)}>
            客流信息
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={getTrainNoBadgeStyle(darkMode)}>{train.trainNo}</div>
            <Button 
              type="text" 
              icon={<X size={20} />} 
              onClick={onClose} 
              style={getCloseButtonStyle(darkMode)}
            />
          </div>
        </div>

        <div style={getContentStyle(darkMode)}>
          {/* 车次基本信息 */}
          <Row gutter={12} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <div style={{
                background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '8px',
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
              }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>运行区间</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
                  {train.runningSection.from} → {train.runningSection.to}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{
                background: darkMode ? 'rgba(42, 107, 124, 0.12)' : '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '8px',
                border: darkMode ? '1px solid rgba(42, 107, 124, 0.25)' : '1px solid rgba(29, 78, 95, 0.08)'
              }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>股道/站台</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: darkMode ? '#F1F5F9' : '#1F2937', whiteSpace: 'nowrap' }}>
                  {train.location.track}G / {train.location.platform}
                </div>
              </div>
            </Col>
          </Row>

          {/* 客流信息展示 - 只读 */}
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
            padding: '16px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)',
            marginBottom: '16px'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: darkMode ? '#E2E8F0' : '#374151', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users size={18} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
              客流信息
            </div>
            
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ 
                  background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
                  padding: '16px',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(16, 185, 129, 0.15)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '12px',
                    color: darkMode ? '#10B981' : '#059669',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    <ArrowUp size={16} />
                    上车人数
                  </div>
                  <div style={{ 
                    height: '44px', 
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontFamily: 'Oswald, sans-serif',
                    color: darkMode ? '#10B981' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {train.passengerFlow?.boarding || '-'}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  background: darkMode ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7',
                  padding: '16px',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.15)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '12px',
                    color: darkMode ? '#F59E0B' : '#D97706',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    <ArrowDown size={16} />
                    下车人数
                  </div>
                  <div style={{ 
                    height: '44px', 
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontFamily: 'Oswald, sans-serif',
                    color: darkMode ? '#F59E0B' : '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {train.passengerFlow?.alighting || '-'}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  background: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#DBEAFE',
                  padding: '16px',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.15)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '12px',
                    color: darkMode ? '#60A5FA' : '#2563EB',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    <TransferIcon size={16} />
                    换乘人数
                  </div>
                  <div style={{ 
                    height: '44px', 
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontFamily: 'Oswald, sans-serif',
                    color: darkMode ? '#60A5FA' : '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {train.passengerFlow?.transfer || '-'}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* 换乘信息 */}
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.08)' : '#FFFFFF',
            padding: '16px',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: darkMode ? '#E2E8F0' : '#374151', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <TransferIcon size={18} color={darkMode ? '#5DA3B3' : '#1D4E5F'} />
              换乘信息
            </div>
            
            <Table
              dataSource={transferInfo}
              columns={transferColumns}
              pagination={false}
              size="small"
              rowKey="trainNo"
              style={{
                background: 'transparent'
              }}
              rowClassName={() => darkMode ? 'dark-table-row' : ''}
            />
          </div>
        </div>
      </div>
    </>
  );
};

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
  width: '560px',
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
  fontWeight: '600',
  color: darkMode ? '#E2E8F0' : '#1F2937',
  letterSpacing: '0.5px',
  fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
});

const getTrainNoBadgeStyle = (darkMode: boolean): React.CSSProperties => ({
  background: darkMode
    ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
    : 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 50%, #FEF7E6 100%)',
  padding: '6px 20px',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: darkMode ? '#FBBF24' : '#92400E',
  border: darkMode ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(217, 119, 6, 0.2)',
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
  padding: '20px',
  background: darkMode ? 'transparent' : '#FAF8F5'
});
