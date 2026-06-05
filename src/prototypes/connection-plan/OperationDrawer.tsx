import React, { useState, useMemo } from 'react';
import { Button, Input, Modal } from 'antd';
import { X, CheckCircle, ArrowRight, Edit3 } from 'lucide-react';
import './style.css';

const { TextArea } = Input;

interface OperationDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: any;
  operationType: 'departure' | 'platform' | 'checkin';
  onSwitchTrain?: (train: any, isArrival: boolean) => void;
  isArrival?: boolean;
}

interface OperationItem {
  type: string;
  name: string;
  position: string;
  content: string;
  scheduledTime: string;
  actualTime: string;
  status: 'completed' | 'pending' | 'ongoing';
}

export const OperationDrawer: React.FC<OperationDrawerProps> = ({
  visible,
  onClose,
  train,
  operationType,
  onSwitchTrain,
  isArrival
}) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'flow' | 'remark' | 'complete'>('flow');
  const [remark, setRemark] = useState<string>('');
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [tempRemark, setTempRemark] = useState('');

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');

  const operationData = useMemo<OperationItem[]>(() => {
    if (!train) return [];

    const baseOperations: OperationItem[] = [];
    const isInsp = isArrival
      ? isInspection(train.arrivalTrainNo)
      : isInspection(train.departureTrainNo);
    const sameTrain = train.arrivalTrainNo === train.departureTrainNo;

    if (isArrival) {
      if (isInsp) {
        baseOperations.push(
          { type: '线路所值班员', name: '周线路', position: '线路所', content: '出务报道', scheduledTime: '15:50', actualTime: '15:52', status: 'completed' },
          { type: '线路所值班员', name: '周线路', position: '线路所', content: '接车', scheduledTime: '15:58', actualTime: '', status: 'pending' },
          { type: '站台客运员', name: '赵站台', position: '19站台', content: '接车', scheduledTime: '16:00', actualTime: '16:05', status: 'completed' },
          { type: '站台客运员', name: '赵站台', position: '19站台', content: '送车', scheduledTime: '16:10', actualTime: '', status: 'pending' }
        );
      } else if (!sameTrain) {
        baseOperations.push(
          { type: '出站口客运员', name: '李出站', position: '北广场', content: '出务报道', scheduledTime: '16:55', actualTime: '16:55', status: 'completed' },
          { type: '出站口客运员', name: '李出站', position: '北广场', content: '作业开始', scheduledTime: '17:10', actualTime: '17:20', status: 'completed' },
          { type: '出站口客运员', name: '李出站', position: '北广场', content: '作业完毕', scheduledTime: '17:35', actualTime: '', status: 'pending' },
          { type: '站台客运员', name: '赵站台', position: '1站台', content: '接车', scheduledTime: '17:15', actualTime: '17:18', status: 'completed' },
          { type: '站台客运员', name: '赵站台', position: '1站台', content: '送车', scheduledTime: '17:25', actualTime: '', status: 'pending' },
          { type: '上水员', name: '王上水', position: '3道', content: '上水作业开始', scheduledTime: '17:18', actualTime: '17:20', status: 'completed' },
          { type: '上水员', name: '王上水', position: '3道', content: '上水作业完毕', scheduledTime: '17:35', actualTime: '', status: 'pending' },
          { type: '站台值班员', name: '孙值班', position: '1站台', content: '巡视', scheduledTime: '17:10', actualTime: '17:10', status: 'completed' }
        );
      } else {
        baseOperations.push(
          { type: '站台客运员', name: '赵站台', position: '3站台', content: '接车', scheduledTime: '17:02', actualTime: '17:04', status: 'completed' },
          { type: '站台客运员', name: '赵站台', position: '3站台', content: '送车', scheduledTime: '17:10', actualTime: '', status: 'pending' },
          { type: '站台值班员', name: '孙值班', position: '3站台', content: '巡视', scheduledTime: '17:00', actualTime: '17:02', status: 'completed' }
        );
      }
    } else {
      if (isInsp) {
        baseOperations.push(
          { type: '线路所值班员', name: '周线路', position: '线路所', content: '出务报道', scheduledTime: '18:20', actualTime: '', status: 'pending' },
          { type: '线路所值班员', name: '周线路', position: '线路所', content: '送车', scheduledTime: '18:30', actualTime: '', status: 'pending' }
        );
      } else if (!sameTrain) {
        baseOperations.push(
          { type: '检票口客运员', name: '张检票', position: 'A1', content: '出务报道', scheduledTime: '15:10', actualTime: '15:15', status: 'completed' },
          { type: '检票口客运员', name: '张检票', position: 'A1', content: '作业开始', scheduledTime: '15:30', actualTime: '', status: 'pending' },
          { type: '检票口客运员', name: '张检票', position: 'A1', content: '作业完毕', scheduledTime: '16:00', actualTime: '', status: 'pending' },
          { type: '上水员', name: '王上水', position: '1道', content: '上水作业开始', scheduledTime: '15:40', actualTime: '', status: 'pending' },
          { type: '上水员', name: '王上水', position: '1道', content: '上水作业完毕', scheduledTime: '16:20', actualTime: '', status: 'pending' },
          { type: '站台客运员', name: '赵站台', position: '1站台', content: '接车', scheduledTime: '15:45', actualTime: '', status: 'pending' },
          { type: '站台客运员', name: '赵站台', position: '1站台', content: '送车', scheduledTime: '16:05', actualTime: '', status: 'pending' },
          { type: '站台值班员', name: '孙值班', position: '1站台', content: '巡视', scheduledTime: '15:30', actualTime: '15:32', status: 'completed' }
        );
      } else {
        baseOperations.push(
          { type: '检票口客运员', name: '张检票', position: 'A2/A3', content: '出务报道', scheduledTime: '14:30', actualTime: '14:35', status: 'completed' },
          { type: '检票口客运员', name: '张检票', position: 'A2/A3', content: '作业开始', scheduledTime: '14:55', actualTime: '', status: 'pending' },
          { type: '检票口客运员', name: '张检票', position: 'A2/A3', content: '作业完毕', scheduledTime: '15:20', actualTime: '', status: 'pending' },
          { type: '上水员', name: '王上水', position: '3道', content: '上水作业开始', scheduledTime: '14:40', actualTime: '14:45', status: 'completed' },
          { type: '上水员', name: '王上水', position: '3道', content: '上水作业完毕', scheduledTime: '15:10', actualTime: '', status: 'pending' },
          { type: '站台客运员', name: '赵站台', position: '3站台', content: '接车', scheduledTime: '15:00', actualTime: '15:02', status: 'completed' },
          { type: '站台客运员', name: '赵站台', position: '3站台', content: '送车', scheduledTime: '15:12', actualTime: '', status: 'pending' },
          { type: '站台值班员', name: '孙值班', position: '3站台', content: '巡视', scheduledTime: '14:50', actualTime: '14:50', status: 'completed' }
        );
      }
    }
    return baseOperations;
  }, [train, isArrival, operationType]);

  const [operationDataState, setOperationDataState] = useState<OperationItem[]>([]);

  React.useEffect(() => {
    setOperationDataState(operationData);
  }, [operationData]);

  // 辅助函数：比较时间，返回 actualTime > scheduledTime
  const isTimeDelayed = (scheduledTime: string, actualTime: string): boolean => {
    if (!scheduledTime || !actualTime) return false;
    const [sHour, sMin] = scheduledTime.split(':').map(Number);
    const [aHour, aMin] = actualTime.split(':').map(Number);
    if (aHour > sHour) return true;
    if (aHour === sHour && aMin > sMin) return true;
    return false;
  };

  // 辅助函数：检查当前时间是否已超过计划时间且未打卡
  const isOverdueAndPending = (scheduledTime: string, actualTime: string): boolean => {
    if (actualTime) return false; // 已打卡的不检查
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const [sHour, sMin] = scheduledTime.split(':').map(Number);
    
    if (currentHour > sHour) return true;
    if (currentHour === sHour && currentMin > sMin) return true;
    return false;
  };

  if (!visible || !train) return null;

  const isConnectedTrain = !isInspection(train.arrivalTrainNo) && !isInspection(train.departureTrainNo) && train.arrivalTrainNo !== train.departureTrainNo;
  const hasTwoPlatformOperations = train.platformOperations?.arrival && train.platformOperations?.departure;

  const getTitle = () => {
    switch (operationType) {
      case 'departure':
        return '出站作业信息';
      case 'platform':
        return '站台作业信息';
      case 'checkin':
        return '检票作业信息';
      default:
        return '作业信息';
    }
  };

  const displayTrainNo = operationType === 'platform' 
    ? (hasTwoPlatformOperations ? (isArrival ? train.arrivalTrainNo : train.departureTrainNo) : train.arrivalTrainNo)
    : (isArrival ? train.arrivalTrainNo : train.departureTrainNo);

  const connectedTrainNo = isArrival ? train.departureTrainNo : train.arrivalTrainNo;

  const getCurrentTrainTypeClass = () => {
    if (!train) return 'gray';
    const currentTrainNo = displayTrainNo;
    
    if (currentTrainNo.startsWith('0') || currentTrainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (train.arrivalTrainNo === train.departureTrainNo) {
      return 'purple';
    }
    if (isArrival) {
      return 'cyan';
    }
    return 'yellow';
  };

  const currentTrainTypeClass = getCurrentTrainTypeClass();

  const getConnectedTrainTypeClass = () => {
    if (!train) return 'gray';
    if (connectedTrainNo.startsWith('0') || connectedTrainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (train.arrivalTrainNo === train.departureTrainNo) {
      return 'purple';
    }
    return isArrival ? 'yellow' : 'cyan';
  };

  const connectedTrainTypeClass = getConnectedTrainTypeClass();

  const getTrainPillStyles = (typeClass: string) => {
    switch(typeClass) {
      case 'cyan':
        return {
          background: 'linear-gradient(180deg, #60d0e0 0%, #40c0d0 100%)',
          color: '#104048',
          borderColor: '#30a0b0'
        };
      case 'purple':
        return {
          background: 'linear-gradient(180deg, #d8c8e8 0%, #c0a8d0 100%)',
          color: '#503070',
          borderColor: '#a080b8'
        };
      case 'yellow':
        return {
          background: 'linear-gradient(180deg, #ffc864 0%, #ffb432 100%)',
          color: '#704000',
          borderColor: '#e89018'
        };
      default:
        return {
          background: 'linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%)',
          color: '#505050',
          borderColor: '#a0a0a0'
        };
    }
  };

  const isTerminationTrain = isArrival && train.arrivalTrainNo !== train.departureTrainNo && !isInspection(train.arrivalTrainNo);

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: '已完成' },
      pending: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB', label: '未开始' },
      ongoing: { bg: '#FEFCE8', text: '#854D0E', border: '#FDE047', label: '进行中' }
    };
    const color = colors[status as keyof typeof colors] || colors.pending;
    
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: color.bg,
        borderRadius: '12px',
        border: `1px solid ${color.border}`,
        fontSize: '11px',
        color: color.text
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: status === 'completed' ? '#10B981' : status === 'ongoing' ? '#F59E0B' : '#9CA3AF'
        }} />
        {color.label}
      </div>
    );
  };

  const handleCompleteAll = () => {
    Modal.confirm({
      title: '确认完成作业',
      content: '确认将所有未完成的作业标记为已完成？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const updatedData = operationDataState.map(item => ({
          ...item,
          status: item.status === 'completed' ? item.status : 'completed',
          actualTime: item.status === 'completed' ? item.actualTime : currentTime
        }));
        setOperationDataState(updatedData);
        Modal.success({
          title: '操作成功',
          content: '所有作业已全部标记为完成'
        });
      }
    });
  };

  const handleOpenRemarkModal = () => {
    setTempRemark(remark);
    setRemarkModalVisible(true);
  };

  const handleSaveRemark = () => {
    setRemark(tempRemark);
    setRemarkModalVisible(false);
  };

  const groupByType = () => {
    const groups: Record<string, OperationItem[]> = {};
    operationDataState.forEach(item => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
    });
    return groups;
  };

  const renderFlowChart = () => {
    const groups = groupByType();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px' }}>
        {Object.entries(groups).map(([type, items], groupIndex) => (
          <div key={type} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              minWidth: '100px', 
              padding: '8px 12px', 
              background: '#F3F4F6', 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: '600',
              color: '#374151',
              textAlign: 'center'
            }}>
              {type}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {items.map((item, itemIndex) => {
                const isDelayed = isTimeDelayed(item.scheduledTime, item.actualTime);
                const isOverdue = isOverdueAndPending(item.scheduledTime, item.actualTime);
                
                return (
                  <React.Fragment key={itemIndex}>
                    <div style={{ 
                      padding: '10px 14px', 
                      background: isOverdue ? '#FEE2E2' : (item.status === 'completed' ? '#ECFDF5' : item.status === 'ongoing' ? '#FEFCE8' : '#F9FAFB'), 
                      borderRadius: '8px', 
                      border: `2px solid ${isOverdue ? '#DC2626' : (item.status === 'completed' ? '#A7F3D0' : item.status === 'ongoing' ? '#FDE047' : '#E5E7EB')}`,
                      fontSize: '12px',
                      minWidth: '120px',
                      textAlign: 'center',
                      boxShadow: isOverdue ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : 'none'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px', 
                        color: isOverdue ? '#DC2626' : '#1F2937',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isOverdue && <span style={{ fontSize: '14px' }}>⚠️</span>}
                        {item.content}
                        {isOverdue && <span style={{ fontSize: '14px' }}>⚠️</span>}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '11px' }}>{item.scheduledTime}</div>
                      {item.actualTime && (
                        <div style={{ 
                          color: isDelayed ? '#DC2626' : '#10B981', 
                          fontSize: '11px', 
                          marginTop: '2px',
                          fontWeight: '600'
                        }}>
                          实: {item.actualTime}
                        </div>
                      )}
                      {isOverdue && !item.actualTime && (
                        <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '2px', fontWeight: '600' }}>
                          逾期未打卡！
                        </div>
                      )}
                    </div>
                    {itemIndex < items.length - 1 && (
                      <ArrowRight size={16} style={{ color: '#9CA3AF' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={getOverlayStyle()} onClick={onClose} />
      
      <div style={getContainerStyle()}>
        <div style={getHeaderStyle()}>
          <div style={getTitleStyle()}>
            作业监控
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              className={`train-pill ${currentTrainTypeClass}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '18px',
                fontFamily: '"Noto Serif SC", serif',
                letterSpacing: '1px',
                width: 'auto',
                minWidth: '90px',
                maxWidth: '120px',
                border: '2px solid',
                ...getTrainPillStyles(currentTrainTypeClass)
              }}
            >
              {displayTrainNo}
            </div>

            {isConnectedTrain && operationType === 'platform' && (
              <span style={{
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                color: '#0E7490',
                fontWeight: '600',
                border: '1px solid rgba(14, 116, 144, 0.3)',
                flexShrink: 0
              }}>
                {isTerminationTrain ? '接续' : '折返'}
              </span>
            )}

            {isConnectedTrain && operationType === 'platform' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}

            {isConnectedTrain && operationType === 'platform' && (
              <div
                className={`train-pill ${connectedTrainTypeClass}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '11px',
                  fontFamily: '"Noto Serif SC", serif',
                  letterSpacing: '0.5px',
                  width: 'auto',
                  minWidth: '60px',
                  maxWidth: '90px',
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  opacity: 0.85,
                  ...getTrainPillStyles(connectedTrainTypeClass)
                }}
                onClick={() => onSwitchTrain && onSwitchTrain(train, !isArrival)}
                title={`点击跳转到${isArrival ? '始发车' : '终到车'}`}
              >
                {connectedTrainNo}
              </div>
            )}

            <Button
              type="text"
              icon={<X size={16} />}
              onClick={onClose}
              style={getCloseButtonStyle()}
            />
          </div>
        </div>

        <div style={getContentStyle()}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Button 
              style={getTopButtonStyle(activeTab === 'monitor' ? 'active' : '')} 
              onClick={() => setActiveTab('monitor')}
            >
              作业监控
            </Button>
            <Button 
              style={getTopButtonStyle(activeTab === 'flow' ? 'active' : '')} 
              onClick={() => setActiveTab('flow')}
            >
              作业流程
            </Button>
            <Button 
              style={getTopButtonStyle(activeTab === 'remark' ? 'active' : '')} 
              onClick={() => setActiveTab('remark')}
            >
              备注
            </Button>
            <Button 
              style={getTopButtonStyle(activeTab === 'complete' ? 'active' : '')} 
              onClick={handleCompleteAll}
              icon={<CheckCircle size={14} />}
            >
              作业完成
            </Button>
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'monitor' && (
              <div style={getTableWrapperStyle()}>
                <table style={getTableStyle()}>
                  <thead style={getTableHeadStyle()}>
                    <tr>
                      <th style={getThStyle()}>作业类型</th>
                      <th style={getThStyle()}>姓名</th>
                      <th style={getThStyle()}>位置</th>
                      <th style={getThStyle()}>作业内容</th>
                      <th style={getThStyle()}>计划时间</th>
                      <th style={getThStyle()}>实际时间</th>
                      <th style={getThStyle()}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operationDataState.map((item, index) => {
                      const isDelayed = isTimeDelayed(item.scheduledTime, item.actualTime);
                      const isOverdue = isOverdueAndPending(item.scheduledTime, item.actualTime);
                      
                      return (
                        <tr 
                          key={index} 
                          style={{ 
                            ...getTableRowStyle(),
                            background: isOverdue ? '#FEF2F2' : undefined
                          }}
                        >
                          <td style={getTdStyle({ fontWeight: '500' })}>{item.type}</td>
                          <td style={getTdStyle()}>{item.name}</td>
                          <td style={getTdStyle()}>{item.position}</td>
                          <td style={getTdStyle({ 
                            color: isOverdue ? '#DC2626' : '#1F2937', 
                            fontWeight: isOverdue ? '700' : '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          })}>
                            {isOverdue && <span style={{ fontSize: '14px' }}>⚠️</span>}
                            {item.content}
                          </td>
                          <td style={getTdStyle({ color: '#64748B' })}>
                            <span style={{ marginRight: '4px' }}>⦿</span>
                            {item.scheduledTime}
                          </td>
                          <td style={getTdStyle({ 
                            color: item.actualTime ? (isDelayed ? '#DC2626' : '#10B981') : '#64748B', 
                            fontWeight: item.actualTime ? '700' : '400'
                          })}>
                            {item.actualTime ? (
                              <>
                                {isDelayed && <span style={{ marginRight: '4px' }}>⏰</span>}
                                {item.actualTime}
                              </>
                            ) : (
                              isOverdue ? <span style={{ fontWeight: '700' }}>逾期未打卡！</span> : '-'
                            )}
                          </td>
                          <td style={getTdStyle()}>{getStatusBadge(item.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'flow' && (
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid rgba(29, 78, 95, 0.08)', flex: 1, overflow: 'auto' }}>
                {renderFlowChart()}
              </div>
            )}

            {activeTab === 'remark' && (
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid rgba(29, 78, 95, 0.08)', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>备注信息</span>
                  <Button type="primary" size="small" icon={<Edit3 size={14} />} onClick={handleOpenRemarkModal}>
                    编辑备注
                  </Button>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: '#F9FAFB', 
                  borderRadius: '6px', 
                  border: '1px solid #E5E7EB',
                  fontSize: '13px',
                  color: '#374151',
                  flex: 1,
                  whiteSpace: 'pre-wrap'
                }}>
                  {remark || '暂无备注'}
                </div>
              </div>
            )}

            {activeTab === 'complete' && (
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid rgba(29, 78, 95, 0.08)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <CheckCircle size={64} style={{ color: '#10B981', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>作业完成确认</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
                  点击下方按钮将所有未完成的作业标记为已完成
                </div>
                <Button type="primary" size="large" onClick={handleCompleteAll} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                  确认完成全部作业
                </Button>
              </div>
            )}
          </div>

          {remark && (
            <div style={getRemarkStyle()}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '12px' }}>
                <span style={{ fontSize: '14px' }}>📋</span>
                备注:
              </span>
              <span style={{ color: '#1F2937', fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{remark}</span>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="编辑备注"
        open={remarkModalVisible}
        onOk={handleSaveRemark}
        onCancel={() => setRemarkModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <TextArea
          value={tempRemark}
          onChange={(e) => setTempRemark(e.target.value)}
          rows={6}
          placeholder="请输入备注信息..."
          style={{ marginTop: '12px' }}
        />
      </Modal>
    </>
  );
};

const getOverlayStyle = (): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999
});

const getContainerStyle = (): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '720px',
  background: '#FAF8F5',
  zIndex: 1000,
  boxShadow: '-8px 0 24px rgba(29,78,95,0.12)',
  display: 'flex',
  flexDirection: 'column'
});

const getHeaderStyle = (): React.CSSProperties => ({
  padding: '14px 16px',
  borderBottom: '1px solid rgba(29, 78, 95, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#fff',
  flexShrink: 0
});

const getTitleStyle = (): React.CSSProperties => ({
  fontSize: '15px',
  fontWeight: '600',
  color: '#1F2937',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center'
});

const getCloseButtonStyle = (): React.CSSProperties => ({
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  color: '#64748B',
  background: '#F5F3EF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const getContentStyle = (): React.CSSProperties => ({
  flex: 1,
  padding: '16px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
});

const getTopButtonStyle = (active: string): React.CSSProperties => ({
  height: '32px',
  fontSize: '12px',
  fontWeight: '500',
  borderRadius: '6px',
  padding: '0 14px',
  background: active === 'active' ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : '#fff',
  color: active === 'active' ? '#fff' : '#1D4E5F',
  border: active === 'active' ? 'none' : '1px solid rgba(29, 78, 95, 0.15)',
  boxShadow: active === 'active' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
});

const getTableWrapperStyle = (): React.CSSProperties => ({
  flex: 1,
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid rgba(29, 78, 95, 0.08)',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column'
});

const getTableStyle = (): React.CSSProperties => ({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px'
});

const getTableHeadStyle = (): React.CSSProperties => ({
  background: '#F8F7F4',
  position: 'sticky',
  top: 0,
  zIndex: 1
});

const getThStyle = (): React.CSSProperties => ({
  padding: '12px 10px',
  textAlign: 'left',
  borderBottom: '1px solid #E5E7EB',
  color: '#374151',
  fontWeight: '600'
});

const getTdStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  padding: '10px 10px',
  borderBottom: '1px solid #E5E7EB',
  ...extra
});

const getTableRowStyle = (): React.CSSProperties => ({
  borderBottom: '1px solid #E5E7EB',
  height: '44px'
});

const getRemarkStyle = (): React.CSSProperties => ({
  marginTop: '12px',
  background: '#fff',
  padding: '12px 14px',
  borderRadius: '6px',
  border: '1px solid rgba(29, 78, 95, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});
