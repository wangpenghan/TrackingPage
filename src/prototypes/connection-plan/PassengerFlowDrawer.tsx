import React from 'react';
import { Button } from 'antd';
import { X } from 'lucide-react';
import { TrainData } from './index';
import './style.css';

interface PassengerFlowDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: TrainData | null;
  isArrival: boolean;
  onSwitchTrain?: (train: TrainData, isArrival: boolean) => void;
}

interface CarInfo {
  number: number;
  businessSeats?: number;
  firstClassSeats?: number;
  secondClassSeats?: number;
  isDiningCar?: boolean;
}

interface ConductorInfo {
  name1: string;
  phone1: string;
  name2: string;
  phone2: string;
  bureau: string;
  depot: string;
  team: string;
  group: string;
}

interface TransferItem {
  trainNo: string;
  transferCount: number;
}

const get8CarComposition = (): CarInfo[] => [
  { number: 1, businessSeats: 5, firstClassSeats: 28 },
  { number: 2, secondClassSeats: 90 },
  { number: 3, secondClassSeats: 90, isDiningCar: true },
  { number: 4, secondClassSeats: 75 },
  { number: 5, secondClassSeats: 90 },
  { number: 6, secondClassSeats: 90 },
  { number: 7, secondClassSeats: 90 },
  { number: 8, businessSeats: 5, firstClassSeats: 28 },
];

const get16CarComposition = (): CarInfo[] => [
  { number: 1, businessSeats: 5, firstClassSeats: 28 },
  { number: 2, secondClassSeats: 90 },
  { number: 3, secondClassSeats: 90 },
  { number: 4, secondClassSeats: 90 },
  { number: 5, secondClassSeats: 90, isDiningCar: true },
  { number: 6, secondClassSeats: 90 },
  { number: 7, secondClassSeats: 75 },
  { number: 8, secondClassSeats: 90 },
  { number: 9, secondClassSeats: 90 },
  { number: 10, secondClassSeats: 90 },
  { number: 11, secondClassSeats: 90 },
  { number: 12, secondClassSeats: 90 },
  { number: 13, secondClassSeats: 75 },
  { number: 14, secondClassSeats: 90 },
  { number: 15, secondClassSeats: 90 },
  { number: 16, businessSeats: 5, firstClassSeats: 28 },
];

const mockConductorData: ConductorInfo = {
  name1: '张建国',
  phone1: '139****5678',
  name2: '李明辉',
  phone2: '138****9012',
  bureau: '成都铁路局',
  depot: '重庆客运段',
  team: '渝沪一队',
  group: 'G312班组'
};

const getMockTransferData = (trainNo: string): TransferItem[] => {
  const map: Record<string, TransferItem[]> = {
    'G312': [
      { trainNo: 'G1314', transferCount: 45 },
      { trainNo: 'D2238', transferCount: 32 },
      { trainNo: 'C6402', transferCount: 28 },
    ],
    'G202': [
      { trainNo: 'G201', transferCount: 78 },
      { trainNo: 'K1154', transferCount: 25 },
      { trainNo: 'D2224', transferCount: 18 },
    ],
    'G1542': [
      { trainNo: 'G1541', transferCount: 52 },
      { trainNo: 'D1834', transferCount: 36 },
    ],
    'G8608': [
      { trainNo: 'G1321', transferCount: 41 },
      { trainNo: 'D2240', transferCount: 27 },
    ],
    'G666': [
      { trainNo: 'G888', transferCount: 33 },
      { trainNo: 'D2264', transferCount: 19 },
    ],
  };
  return map[trainNo] || [];
};

export const PassengerFlowDrawer: React.FC<PassengerFlowDrawerProps> = ({
  visible,
  onClose,
  train,
  isArrival,
  onSwitchTrain,
}) => {
  if (!visible || !train) return null;

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');

  const displayTrainNo = isArrival ? train.arrivalTrainNo : train.departureTrainNo;
  const connectedTrainNo = isArrival ? train.departureTrainNo : train.arrivalTrainNo;
  const isConnectedTrain = train.arrivalTrainNo !== train.departureTrainNo;

  const formationNum = parseInt(train.formation) || 8;
  const cars = formationNum <= 8 ? get8CarComposition() : get16CarComposition();
  const isThroughTrain = train.arrivalTrainNo === train.departureTrainNo;
  const isTerminationTrain = isArrival && !isThroughTrain;
  const showTransfer = isThroughTrain || isTerminationTrain;
  const transferData = showTransfer ? getMockTransferData(displayTrainNo) : [];

  const getTrainTypeLabel = () => {
    const same = train.arrivalTrainNo === train.departureTrainNo;
    if (same) return '途经车';
    return isArrival ? '终到车' : '始发车';
  };

  const getCurrentTrainTypeClass = () => {
    const currentTrainNo = displayTrainNo;
    if (currentTrainNo.startsWith('0') || currentTrainNo.startsWith('DJ')) return 'gray';
    if (train.arrivalTrainNo === train.departureTrainNo) return 'purple';
    return isArrival ? 'cyan' : 'yellow';
  };

  const getConnectedTrainTypeClass = () => {
    if (connectedTrainNo.startsWith('0') || connectedTrainNo.startsWith('DJ')) return 'gray';
    if (train.arrivalTrainNo === train.departureTrainNo) return 'purple';
    return isArrival ? 'yellow' : 'cyan';
  };

  const currentTrainTypeClass = getCurrentTrainTypeClass();
  const connectedTrainTypeClass = getConnectedTrainTypeClass();

  const getTrainPillStyles = (typeClass: string): React.CSSProperties => {
    switch(typeClass) {
      case 'cyan':
        return { background: 'linear-gradient(180deg, #60d0e0 0%, #40c0d0 100%)', color: '#104048', borderColor: '#30a0b0' };
      case 'purple':
        return { background: 'linear-gradient(180deg, #d8c8e8 0%, #c0a8d0 100%)', color: '#503070', borderColor: '#a080b8' };
      case 'yellow':
        return { background: 'linear-gradient(180deg, #ffc864 0%, #ffb432 100%)', color: '#704000', borderColor: '#e89018' };
      default:
        return { background: 'linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%)', color: '#505050', borderColor: '#a0a0a0' };
    }
  };

  const getCarColor = (car: CarInfo): { bg: string; border: string; text: string } => {
    if (car.isDiningCar) return { bg: '#FFF3E0', border: '#FFB74D', text: '#E65100' };
    if (car.businessSeats) return { bg: '#F3E5F5', border: '#CE93D8', text: '#7B1FA2' };
    if (car.firstClassSeats) return { bg: '#E3F2FD', border: '#64B5F6', text: '#1565C0' };
    return { bg: '#F1F8E9', border: '#AED581', text: '#33691E' };
  };

  const getSeatLabel = (car: CarInfo): string => {
    const parts: string[] = [];
    if (car.businessSeats) parts.push(`商${car.businessSeats}`);
    if (car.firstClassSeats) parts.push(`一${car.firstClassSeats}`);
    if (car.secondClassSeats) parts.push(`二${car.secondClassSeats}`);
    if (car.isDiningCar) parts.push('餐');
    return parts.join(' ');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const totalSeats = cars.reduce((sum, car) => {
    return sum + (car.businessSeats || 0) + (car.firstClassSeats || 0) + (car.secondClassSeats || 0);
  }, 0);

  return (
    <>
      <div style={getOverlayStyle()} onClick={handleOverlayClick} />
      <div style={getContainerStyle()}>
        <div style={getHeaderStyle()}>
          <div style={getTitleStyle()}>
            客流信息
            <span style={getTypeBadgeStyle()}>{getTrainTypeLabel()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className={`train-pill ${currentTrainTypeClass}`}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '18px',
                fontFamily: '"Noto Serif SC", serif', letterSpacing: '1px',
                width: 'auto', minWidth: '90px', maxWidth: '120px', border: '2px solid',
                ...getTrainPillStyles(currentTrainTypeClass)
              }}
            >
              {displayTrainNo}
            </div>

            {isConnectedTrain && (
              <>
                <span style={{
                  padding: '2px 8px', fontSize: '11px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                  color: '#0E7490', fontWeight: '600',
                  border: '1px solid rgba(14, 116, 144, 0.3)', flexShrink: 0
                }}>
                  {isArrival ? '接续' : '折返'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <div className={`train-pill ${connectedTrainTypeClass}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '11px',
                    fontFamily: '"Noto Serif SC", serif', letterSpacing: '0.5px',
                    width: 'auto', minWidth: '60px', maxWidth: '90px', border: '1.5px solid',
                    cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, opacity: 0.85,
                    ...getTrainPillStyles(connectedTrainTypeClass)
                  }}
                  onClick={() => onSwitchTrain && onSwitchTrain(train, !isArrival)}
                  title={`点击跳转到${isArrival ? '始发车' : '终到车'}`}
                >
                  {connectedTrainNo}
                </div>
              </>
            )}

            <Button type="text" icon={<X size={16} />} onClick={onClose} style={getCloseButtonStyle()} />
          </div>
        </div>

        <div style={getContentStyle()}>
          <div style={getSectionStyle()}>
            <div style={getSectionTitleStyle()}>
              列车信息
              <span style={getSubtitleStyle()}>定员: {totalSeats}人</span>
            </div>
            <div style={getTrainLayoutStyle()}>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {cars.map((car) => {
                  const color = getCarColor(car);
                  return (
                    <div
                      key={car.number}
                      className="pf-car-block"
                      data-car={car.number}
                      title={`${car.number}车: ${getSeatLabel(car)}`}
                      style={{
                        width: '60px',
                        background: color.bg,
                        border: `1.5px solid ${color.border}`,
                        borderRadius: '6px',
                        padding: '4px 2px',
                        textAlign: 'center',
                        fontSize: '10px',
                        cursor: 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: color.text, fontSize: '11px' }}>{car.number}车</span>
                      <span style={{ color: color.text, fontSize: '9px', lineHeight: '1.2', whiteSpace: 'pre-wrap' }}>
                        {getSeatLabel(car)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={getSectionStyle()}>
            <div style={getSectionTitleStyle()}>车长信息</div>
            <div style={getInfoGridStyle()}>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>车长1</span>
                <span style={getInfoValueStyle()}>{mockConductorData.name1}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>联系电话</span>
                <span style={getInfoValueStyle()}>{mockConductorData.phone1}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>车长2</span>
                <span style={getInfoValueStyle()}>{mockConductorData.name2}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>联系电话</span>
                <span style={getInfoValueStyle()}>{mockConductorData.phone2}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>担当局</span>
                <span style={getInfoValueStyle()}>{mockConductorData.bureau}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>担当段</span>
                <span style={getInfoValueStyle()}>{mockConductorData.depot}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>担当车队</span>
                <span style={getInfoValueStyle()}>{mockConductorData.team}</span>
              </div>
              <div style={getInfoItemStyle()}>
                <span style={getInfoLabelStyle()}>担当班组</span>
                <span style={getInfoValueStyle()}>{mockConductorData.group}</span>
              </div>
            </div>
          </div>

          {showTransfer && (
          <div style={getSectionStyle()}>
            <div style={getSectionTitleStyle()}>换乘信息</div>
            <div style={getTransferTableStyle()}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8F7F4' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151' }}>换乘车次</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151' }}>换乘人数</th>
                  </tr>
                </thead>
                <tbody>
                  {transferData.length > 0 ? transferData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1F2937' }}>{item.trainNo}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#8B5CF6' }}>{item.transferCount}人</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>暂无换乘信息</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
};

const getOverlayStyle = (): React.CSSProperties => ({
  position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
  background: 'rgba(0, 0, 0, 0.5)', zIndex: 999
});

const getContainerStyle = (): React.CSSProperties => ({
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: '580px', background: '#FAF8F5', zIndex: 1000,
  boxShadow: '-8px 0 24px rgba(29,78,95,0.12)',
  display: 'flex', flexDirection: 'column'
});

const getHeaderStyle = (): React.CSSProperties => ({
  padding: '14px 16px', borderBottom: '1px solid rgba(29, 78, 95, 0.1)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: '#fff', flexShrink: 0
});

const getTitleStyle = (): React.CSSProperties => ({
  fontSize: '15px', fontWeight: '600', color: '#1F2937',
  letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px'
});

const getTypeBadgeStyle = (): React.CSSProperties => ({
  fontSize: '11px', fontWeight: 600, color: '#64748B',
  background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px'
});

const getCloseButtonStyle = (): React.CSSProperties => ({
  width: '28px', height: '28px', borderRadius: '6px',
  color: '#64748B', background: '#F5F3EF',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const getContentStyle = (): React.CSSProperties => ({
  flex: 1, padding: '12px 16px', overflow: 'auto',
  display: 'flex', flexDirection: 'column', gap: '12px'
});

const getSectionStyle = (): React.CSSProperties => ({
  background: '#fff', borderRadius: '8px',
  border: '1px solid rgba(29, 78, 95, 0.08)',
  padding: '14px', flexShrink: 0
});

const getSectionTitleStyle = (): React.CSSProperties => ({
  fontSize: '14px', fontWeight: 600, color: '#1F2937',
  marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'
});

const getSubtitleStyle = (): React.CSSProperties => ({
  fontSize: '12px', fontWeight: 500, color: '#6B7280'
});

const getTrainLayoutStyle = (): React.CSSProperties => ({
  overflow: 'auto'
});

const getInfoGridStyle = (): React.CSSProperties => ({
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
});

const getInfoItemStyle = (): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column', gap: '2px',
  padding: '6px 8px', background: '#F9FAFB', borderRadius: '4px'
});

const getInfoLabelStyle = (): React.CSSProperties => ({
  fontSize: '11px', color: '#9CA3AF', fontWeight: 500
});

const getInfoValueStyle = (): React.CSSProperties => ({
  fontSize: '13px', fontWeight: 600, color: '#1F2937'
});

const getTransferTableStyle = (): React.CSSProperties => ({
  borderRadius: '6px', border: '1px solid #F0F0F0', overflow: 'hidden'
});
