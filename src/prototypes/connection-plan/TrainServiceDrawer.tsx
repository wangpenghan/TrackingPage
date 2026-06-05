import React, { useState, useEffect } from 'react';
import { Button, Select, Input, Modal, Checkbox } from 'antd';
import { X, Save, RotateCcw, ArrowRight } from 'lucide-react';
import { TrainData } from './index';
import './style.css';

const { Option } = Select;
const { Group } = Checkbox;

interface TrainServiceDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: TrainData | null;
  isArrival: boolean;
  onSwitchTrain?: (train: TrainData, isArrival: boolean) => void;
  allTrains?: TrainData[];
}

type TrainType = 'through' | 'termination' | 'origin';

export const TrainServiceDrawer: React.FC<TrainServiceDrawerProps> = ({
  visible,
  onClose,
  train,
  isArrival,
  onSwitchTrain,
  allTrains
}) => {
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; title: string; content: string; onConfirm?: () => void }>({ visible: false, title: '', content: '' });
  const [track, setTrack] = useState('4');
  const [platform, setPlatform] = useState('4站台');
  const [waitingHall, setWaitingHall] = useState('候车大厅A');
  const [exitGate, setExitGate] = useState('渝厦场南侧出站口');
  const [selectedGates, setSelectedGates] = useState<string[]>(['3A', '3B']);
  // 基本信息状态
  const [originStation, setOriginStation] = useState('重庆东');
  const [destinationStation, setDestinationStation] = useState('北海');
  const [trainType, setTrainType] = useState('CR400AF');
  const [marshallingCount, setMarshallingCount] = useState('8');
  const [marshallingDirection, setMarshallingDirection] = useState('正序');
  const [broadcastGroup, setBroadcastGroup] = useState<string>('');

  const [initialValues, setInitialValues] = useState({
    track: '4', 
    platform: '4站台', 
    waitingHall: '候车大厅A', 
    exitGate: '渝厦场南侧出站口', 
    selectedGates: ['3A', '3B'] as string[],
    originStation: '重庆东',
    destinationStation: '北海',
    trainType: 'CR400AF',
    marshallingCount: '8',
    marshallingDirection: '正序',
    broadcastGroup: ''
  });

  const checkInGates = [
    { row: 'A', items: ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'] },
    { row: 'B', items: ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'] }
  ];

  useEffect(() => {
    const trackMap: Record<string, { platform: string; waitingHall: string; exitGate: string; gates: string[] }> = {
      '1': { platform: '1站台', waitingHall: '候车大厅A', exitGate: '渝厦场北侧出站口', gates: ['1A', '1B'] },
      '2': { platform: '2站台', waitingHall: '候车大厅A', exitGate: '渝厦场北侧出站口', gates: ['2A', '2B'] },
      '3': { platform: '3站台', waitingHall: '候车大厅B', exitGate: '渝厦场南侧出站口', gates: ['3A', '3B'] },
      '4': { platform: '4站台', waitingHall: '候车大厅B', exitGate: '渝厦场南侧出站口', gates: ['4A', '4B'] },
    };
    const config = trackMap[track];
    if (config) {
      setPlatform(config.platform);
      setWaitingHall(config.waitingHall);
      setExitGate(config.exitGate);
      setSelectedGates(config.gates);
    }
  }, [track]);

  useEffect(() => {
    if (visible && train) {
      const trainTrack = train.track;
      const trackMap: Record<string, { platform: string; waitingHall: string; exitGate: string; gates: string[] }> = {
        '1': { platform: '1站台', waitingHall: '候车大厅A', exitGate: '渝厦场北侧出站口', gates: ['1A', '1B'] },
        '2': { platform: '2站台', waitingHall: '候车大厅A', exitGate: '渝厦场北侧出站口', gates: ['2A', '2B'] },
        '3': { platform: '3站台', waitingHall: '候车大厅B', exitGate: '渝厦场南侧出站口', gates: ['3A', '3B'] },
        '4': { platform: '4站台', waitingHall: '候车大厅B', exitGate: '渝厦场南侧出站口', gates: ['4A', '4B'] },
        '5': { platform: '5站台', waitingHall: '候车大厅C', exitGate: '成渝场出站口', gates: ['5A', '5B'] },
        '6': { platform: '6站台', waitingHall: '候车大厅C', exitGate: '成渝场出站口', gates: ['6A', '6B'] },
        '19': { platform: '19站台', waitingHall: '候车大厅C', exitGate: '成渝场出站口', gates: ['19A', '19B'] },
      };
      const defaultTrack = (trainTrack && trackMap[trainTrack]) ? trainTrack : '4';
      const config = trackMap[defaultTrack];
      const origin = isArrival ? (train.arrivalRouteFrom || '重庆东') : (train.departureRouteFrom || '重庆东');
      const destination = isArrival ? (train.arrivalRouteTo || '重庆东') : (train.departureRouteTo || '重庆东');
      if (config) {
        setTrack(defaultTrack);
        setPlatform(config.platform);
        setWaitingHall(config.waitingHall);
        setExitGate(config.exitGate);
        setSelectedGates(config.gates);
        setOriginStation(origin);
        setDestinationStation(destination);
        setTrainType('CR400AF');
        setMarshallingCount(train.formation || '8');
        setMarshallingDirection(train.formationDirection === '北' ? '正序' : '倒序');
        setBroadcastGroup('');
        setInitialValues({
          track: defaultTrack,
          platform: config.platform,
          waitingHall: config.waitingHall,
          exitGate: config.exitGate,
          selectedGates: [...config.gates],
          originStation: origin,
          destinationStation: destination,
          trainType: 'CR400AF',
          marshallingCount: train.formation || '8',
          marshallingDirection: train.formationDirection === '北' ? '正序' : '倒序',
          broadcastGroup: ''
        });
      }
    }
  }, [visible, train, isArrival]);

  const isFieldModified = (field: 
    'track' | 'platform' | 'waitingHall' | 'exitGate' | 'selectedGates' |
    'originStation' | 'destinationStation' | 'trainType' | 'marshallingCount' | 'marshallingDirection' | 'broadcastGroup'
  ): boolean => {
    if (field === 'selectedGates') {
      const curr = new Set(selectedGates);
      const orig = new Set(initialValues.selectedGates);
      if (curr.size !== orig.size) return true;
      for (const item of curr) if (!orig.has(item)) return true;
      return false;
    }
    let current: string;
    let original: string;
    switch (field) {
      case 'track':
        current = track; original = initialValues.track; break;
      case 'platform':
        current = platform; original = initialValues.platform; break;
      case 'waitingHall':
        current = waitingHall; original = initialValues.waitingHall; break;
      case 'exitGate':
        current = exitGate; original = initialValues.exitGate; break;
      case 'originStation':
        current = originStation; original = initialValues.originStation; break;
      case 'destinationStation':
        current = destinationStation; original = initialValues.destinationStation; break;
      case 'trainType':
        current = trainType; original = initialValues.trainType; break;
      case 'marshallingCount':
        current = marshallingCount; original = initialValues.marshallingCount; break;
      case 'marshallingDirection':
        current = marshallingDirection; original = initialValues.marshallingDirection; break;
      case 'broadcastGroup':
        current = broadcastGroup; original = initialValues.broadcastGroup; break;
      default:
        return false;
    }
    return current !== original;
  };

  const getModifiedStyle = (baseStyle: React.CSSProperties, isModified: boolean): React.CSSProperties => {
    if (!isModified) return baseStyle;
    return {
      ...baseStyle,
      borderColor: '#D97706',
      borderWidth: '2px',
      boxShadow: '0 0 0 2px rgba(217, 119, 6, 0.1)',
      backgroundColor: '#FFFBEB'
    };
  };

  if (!visible || !train) return null;

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');

  const getTrainOperationType = (): TrainType => {
    if (train.arrivalTrainNo === train.departureTrainNo) {
      return 'through';
    }
    return isArrival ? 'termination' : 'origin';
  };

  const trainOperationType = getTrainOperationType();
  const isThroughTrain = trainOperationType === 'through';
  const isTerminationTrain = trainOperationType === 'termination';
  const isOriginTrain = trainOperationType === 'origin';

  const displayTrainNo = isArrival ? train.arrivalTrainNo : train.departureTrainNo;

  const isConnectedTrain = train.arrivalTrainNo !== train.departureTrainNo;

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

  const handleSwitchToConnected = () => {
    if (onSwitchTrain) {
      onSwitchTrain(train, !isArrival);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTrainTypeLabel = () => {
    if (isThroughTrain) return '途经车';
    if (isTerminationTrain) return '终到车';
    return '始发车';
  };

  const isFieldDisabled = (fieldType: 'arrival' | 'departure' | 'checkIn' | 'checkOut' | 'waitingHall' | 'checkInGate' | 'exitGate') => {
    if (isTerminationTrain) {
      if (fieldType === 'departure' || fieldType === 'checkIn' || fieldType === 'waitingHall' || fieldType === 'checkInGate') {
        return true;
      }
    }
    if (isOriginTrain) {
      if (fieldType === 'arrival' || fieldType === 'checkOut' || fieldType === 'exitGate') {
        return true;
      }
    }
    return false;
  };

  const showConfirm = (title: string, content: string, onConfirm: () => void) => {
    setConfirmModal({ visible: true, title, content, onConfirm });
  };

  const handleActionClick = (actionName: string, skipConfirm: boolean = false) => {
    if (skipConfirm) {
      console.log(`立即执行: ${actionName}`);
    } else {
      showConfirm(
        `确认${actionName}`,
        `确定要执行"${actionName}"操作吗？`,
        () => {
          console.log(`执行操作: ${actionName}`);
        }
      );
    }
  };

  const handleSaveBasicInfo = () => {
    setInitialValues({
      ...initialValues,
      originStation, destinationStation, trainType, marshallingCount, marshallingDirection, broadcastGroup
    });
    console.log('保存基本信息');
  };

  const handleResetBasicInfo = () => {
    setOriginStation(initialValues.originStation);
    setDestinationStation(initialValues.destinationStation);
    setTrainType(initialValues.trainType);
    setMarshallingCount(initialValues.marshallingCount);
    setMarshallingDirection(initialValues.marshallingDirection);
    setBroadcastGroup(initialValues.broadcastGroup);
    console.log('恢复基本信息默认值');
  };

  const handleSaveTrackInfo = () => {
    setInitialValues({
      ...initialValues,
      track, platform, waitingHall, exitGate, selectedGates: [...selectedGates]
    });
    console.log('保存股道站台信息');
  };

  const handleResetTrackInfo = () => {
    setTrack(initialValues.track);
    setPlatform(initialValues.platform);
    setWaitingHall(initialValues.waitingHall);
    setExitGate(initialValues.exitGate);
    setSelectedGates([...initialValues.selectedGates]);
    console.log('恢复股道站台默认值');
  };

  return (
    <>
      <div style={getOverlayStyle()} onClick={handleOverlayClick} />

      <div style={getContainerStyle()}>
        <div style={getHeaderStyle()}>
          <div style={getTitleStyle()}>
            旅服信息
            <span style={getTypeBadgeStyle()}>{getTrainTypeLabel()}</span>
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

            {isConnectedTrain && (
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

            {isConnectedTrain && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}

            {isConnectedTrain && (
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
                onClick={handleSwitchToConnected}
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
          <div style={getGridStyle()}>
            <div style={getCardStyle()}>
              <div style={getCardHeaderStyle()}>
                <span>基本信息</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<RotateCcw size={12} />}
                    onClick={handleResetBasicInfo}
                    style={{ fontSize: '11px', color: '#64748B', padding: '4px 8px' }}
                  >
                    恢复默认
                  </Button>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<Save size={12} />}
                    onClick={handleSaveBasicInfo}
                    style={{ fontSize: '11px', padding: '4px 8px', background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)' }}
                  >
                    保存
                  </Button>
                </div>
              </div>
              <div style={getFormGridStyle()}>
                <div style={getFormItemStyle()}>
                  <label style={getLabelStyle()}>图定到点</label>
                  <div style={getTimeDisplayStyle()}>
                    {isFieldDisabled('arrival') ? '-' : (train.arrivalTime || '16:00')}
                  </div>
                </div>
                <div style={getFormItemStyle()}>
                  <label style={getLabelStyle()}>图定发点</label>
                  <div style={getTimeDisplayStyle()}>
                    {isFieldDisabled('departure') ? '-' : (train.departureTime || '16:00')}
                  </div>
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    始发站
                    {isFieldModified('originStation') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Input 
                    style={getModifiedStyle(getInputStyle(), isFieldModified('originStation'))} 
                    value={originStation} 
                    onChange={(e) => setOriginStation(e.target.value)} 
                  />
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    终到站
                    {isFieldModified('destinationStation') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Input 
                    style={getModifiedStyle(getInputStyle(), isFieldModified('destinationStation'))} 
                    value={destinationStation} 
                    onChange={(e) => setDestinationStation(e.target.value)} 
                  />
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    车型
                    {isFieldModified('trainType') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle(getSelectStyle(), isFieldModified('trainType'))} 
                    value={trainType} 
                    onChange={setTrainType}
                  >
                    <Option value="CR400AF">CR400AF</Option>
                    <Option value="CR400BF">CR400BF</Option>
                    <Option value="CRH380A">CRH380A</Option>
                  </Select>
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    编组数
                    {isFieldModified('marshallingCount') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Input 
                    style={getModifiedStyle(getInputStyle(), isFieldModified('marshallingCount'))} 
                    value={marshallingCount} 
                    onChange={(e) => setMarshallingCount(e.target.value)} 
                  />
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    编组方向
                    {isFieldModified('marshallingDirection') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle(getSelectStyle(), isFieldModified('marshallingDirection'))} 
                    value={marshallingDirection} 
                    onChange={setMarshallingDirection}
                  >
                    <Option value="正序">正序</Option>
                    <Option value="倒序">倒序</Option>
                  </Select>
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    广播分组
                    {isFieldModified('broadcastGroup') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle({ ...getSelectStyle(), height: '34px' }, isFieldModified('broadcastGroup'))} 
                    placeholder="请选择"
                    value={broadcastGroup}
                    onChange={setBroadcastGroup}
                  >
                    <Option value="group1">分组1</Option>
                    <Option value="group2">分组2</Option>
                  </Select>
                </div>
              </div>
            </div>

            <div style={getCardStyle()}>
              <div style={getCardHeaderStyle()}>
                <span>股道站台</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<RotateCcw size={12} />}
                    onClick={handleResetTrackInfo}
                    style={{ fontSize: '11px', color: '#64748B', padding: '4px 8px' }}
                  >
                    恢复默认
                  </Button>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<Save size={12} />}
                    onClick={handleSaveTrackInfo}
                    style={{ fontSize: '11px', padding: '4px 8px', background: 'linear-gradient(135deg, #1D4E5F 0%, #2A6B7C 100%)' }}
                  >
                    保存
                  </Button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    股道
                    {isFieldModified('track') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle(getSelectStyle(), isFieldModified('track'))} 
                    value={track}
                    onChange={setTrack}
                  >
                    <Option value="1">1</Option>
                    <Option value="2">2</Option>
                    <Option value="3">3</Option>
                    <Option value="4">4</Option>
                    <Option value="5">5</Option>
                    <Option value="6">6</Option>
                    <Option value="19">19</Option>
                  </Select>
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    站台
                    {isFieldModified('platform') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle(getSelectStyle(), isFieldModified('platform'))} 
                    value={platform}
                    onChange={setPlatform}
                  >
                    <Option value="1站台">1站台</Option>
                    <Option value="2站台">2站台</Option>
                    <Option value="3站台">3站台</Option>
                    <Option value="4站台">4站台</Option>
                  </Select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    候车室
                    {isFieldModified('waitingHall') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle(getSelectStyle(), isFieldModified('waitingHall'))} 
                    value={waitingHall}
                    onChange={setWaitingHall}
                    disabled={isFieldDisabled('waitingHall')}
                  >
                    <Option value="候车大厅A">候车大厅A</Option>
                    <Option value="候车大厅B">候车大厅B</Option>
                    <Option value="候车大厅C">候车大厅C</Option>
                  </Select>
                </div>
                <div style={getFormItemStyle()}>
                  <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    出站口
                    {isFieldModified('exitGate') && (
                      <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: '#D97706', display: 'inline-block' 
                      }} />
                    )}
                  </label>
                  <Select 
                    style={getModifiedStyle(getSelectStyle(), isFieldModified('exitGate'))} 
                    value={exitGate}
                    onChange={setExitGate}
                    disabled={isFieldDisabled('exitGate')}
                  >
                    <Option value="渝厦场南侧出站口">渝厦场南侧出站口</Option>
                    <Option value="渝厦场北侧出站口">渝厦场北侧出站口</Option>
                    <Option value="成渝场出站口">成渝场出站口</Option>
                  </Select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ ...getLabelStyle(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  检票口
                  {isFieldModified('selectedGates') && (
                    <span style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', 
                      background: '#D97706', display: 'inline-block' 
                    }} />
                  )}
                </label>
                  <div style={{ 
                    background: isFieldDisabled('checkInGate') ? '#F0F0F0' : '#F9FAFB', 
                    borderRadius: '6px', 
                    padding: '8px', 
                    border: isFieldModified('selectedGates') ? '2px solid #D97706' : '1px solid #E5E7EB',
                    boxShadow: isFieldModified('selectedGates') ? '0 0 0 2px rgba(217, 119, 6, 0.1)' : 'none',
                    backgroundColor: isFieldDisabled('checkInGate') ? '#F0F0F0' : (isFieldModified('selectedGates') ? '#FFFBEB' : '#F9FAFB')
                  }}>
                    {checkInGates.map((row, rowIndex) => (
                      <div key={rowIndex} style={{ display: 'flex', gap: '4px', marginBottom: rowIndex < checkInGates.length - 1 ? '4px' : '0' }}>
                        {row.items.map((gate) => {
                          const isA = gate.endsWith('A');
                          const isSelected = selectedGates.includes(gate);
                          const isDisabled = isFieldDisabled('checkInGate');
                          return (
                            <button
                              key={gate}
                              disabled={isDisabled}
                              onClick={() => {
                                if (isDisabled) return;
                                if (isSelected) {
                                  setSelectedGates(selectedGates.filter(g => g !== gate));
                                } else {
                                  setSelectedGates([...selectedGates, gate]);
                                }
                              }}
                              style={{
                                flex: 1,
                                minWidth: '36px',
                                height: '26px',
                                borderRadius: '3px',
                                border: `1px solid ${isDisabled ? '#D0D0D0' : (isSelected ? (isA ? '#007AFF' : '#8B5CF6') : '#E5E7EB')}`,
                                background: isDisabled ? '#E8E8E8' : (isSelected ? (isA ? '#007AFF' : '#8B5CF6') : '#FFFFFF'),
                                color: isDisabled ? '#B0B0B0' : (isSelected ? '#FFFFFF' : (isA ? '#007AFF' : '#8B5CF6')),
                                fontSize: '10px',
                                fontWeight: '600',
                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {gate}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <div style={getCardStyle()}>
              <div style={getCardHeaderStyle()}>快捷操作</div>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', gap: '8px' }}>
                <Button 
                  style={{ 
                    width: '60px',
                    height: '124px',
                    fontSize: '14px',
                    fontWeight: '700',
                    writingMode: 'vertical-rl',
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F3EF 100%)',
                    border: '1px solid #1D4E5F',
                    color: '#1D4E5F',
                    borderRadius: '4px'
                  }}
                  onClick={() => handleActionClick('立即执行', true)}
                >
                  立即执行
                </Button>
                
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    <Button size="small" style={{ ...getActionButtonStyle('#6B7280') }} onClick={() => handleActionClick('预告')}>预告</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#1D4E5F', '#DBEFEF') }} onClick={() => handleActionClick('进站开检')}>进站开检</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#D97706', '#FDF3D7') }} onClick={() => handleActionClick('进站停检')}>进站停检</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#D97706') }} onClick={() => handleActionClick('晚点未定')}>晚点未定</Button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    <Button size="small" style={{ ...getActionButtonStyle('#1D4E5F', '#DCFCE5') }} onClick={() => handleActionClick('出站开检')}>出站开检</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#D97706', '#FDF3D7') }} onClick={() => handleActionClick('出站停检')}>出站停检</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#6B7280') }} onClick={() => handleActionClick('列车到达')}>列车到达</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#6B7280') }} onClick={() => handleActionClick('列车离站')}>列车离站</Button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px' }}>
                    <Button size="small" style={{ ...getActionButtonStyle('#DC2626', '#FEE2E2') }} onClick={() => handleActionClick('到停开')}>到停开</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#DC2626', '#FEE2E2') }} onClick={() => handleActionClick('发停开')}>发停开</Button>
                    <Button size="small" style={{ ...getActionButtonStyle('#6B7280', '#F3F4F6') }} onClick={() => handleActionClick('停用CTC')}>停用CTC</Button>
                  </div>
                </div>
                
                <Button 
                  style={{ 
                    width: '60px',
                    height: '124px',
                    fontSize: '14px',
                    fontWeight: '700',
                    writingMode: 'vertical-rl',
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F3EF 100%)',
                    border: '1px solid #1D4E5F',
                    color: '#1D4E5F',
                    borderRadius: '4px'
                  }}
                  onClick={() => handleActionClick('恢复正点')}
                >
                  恢复正点
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={confirmModal.title}
        open={confirmModal.visible}
        onOk={() => {
          confirmModal.onConfirm?.();
          setConfirmModal({ ...confirmModal, visible: false });
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, visible: false })}
        okText="确定"
        cancelText="取消"
        style={{ top: '40%' }}
        width={380}
      >
        <p style={{ fontSize: '14px' }}>{confirmModal.content}</p>
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
  width: '760px',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
  zIndex: 1000,
  boxShadow: '-8px 0 24px rgba(29,78,95,0.12)',
  display: 'flex',
  flexDirection: 'column'
});

const getHeaderStyle = (): React.CSSProperties => ({
  padding: '10px 16px',
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
  alignItems: 'center',
  gap: '8px'
});

const getTypeBadgeStyle = (): React.CSSProperties => ({
  padding: '2px 8px',
  fontSize: '11px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 100%)',
  color: '#92400E',
  fontWeight: '600',
  border: '1px solid rgba(217, 119, 6, 0.2)'
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
  overflow: 'hidden',
  padding: '10px 16px',
  background: '#FAF8F5',
  display: 'flex',
  flexDirection: 'column'
});

const getGridStyle = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  flex: 1,
  overflow: 'auto'
});

const getCardStyle = (): React.CSSProperties => ({
  borderRadius: '8px',
  background: '#FFFFFF',
  padding: '12px',
  border: '1px solid rgba(29, 78, 95, 0.08)',
  boxShadow: '0 1px 4px rgba(29, 78, 95, 0.04)'
});

const getCardHeaderStyle = (): React.CSSProperties => ({
  fontSize: '12px',
  color: '#1D4E5F',
  marginBottom: '8px',
  fontWeight: '600',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '6px',
  borderBottom: '1px solid rgba(29, 78, 95, 0.08)'
});

const getFormGridStyle = (): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '6px 10px'
});

const getFormItemStyle = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
});

const getLabelStyle = (): React.CSSProperties => ({
  fontSize: '13px',
  color: '#64748B',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: '600'
});

const getInputStyle = (): React.CSSProperties => ({
  height: '34px',
  fontSize: '14px',
  borderRadius: '4px',
  fontWeight: '500'
});

const getSelectStyle = (): React.CSSProperties => ({
  height: '34px',
  width: '100%',
  fontSize: '14px',
  fontWeight: '500'
});

const getTimeDisplayStyle = (): React.CSSProperties => ({
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  background: '#F5F3EF',
  borderRadius: '4px',
  fontSize: '15px',
  fontWeight: '700',
  color: '#1F2937'
});

const getActionButtonStyle = (color: string, bgColor?: string): React.CSSProperties => ({
  height: '36px',
  fontSize: '14px',
  borderRadius: '4px',
  background: bgColor || '#FFFFFF',
  border: `1px solid ${color}`,
  color: color,
  fontWeight: '700'
});
