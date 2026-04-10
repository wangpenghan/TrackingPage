import React from 'react';
import { Button } from 'antd';
import { X, ArrowUpDown, Repeat, Clock3, MapPin, ChevronsRight, AlertTriangle } from 'lucide-react';
import { TrainSchedule } from './mock-data';

interface RouteStationsDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: TrainSchedule | null;
  darkMode?: boolean;
}

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif";
const FONT_FAMILY_MONO = "'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace";

const getPalette = (darkMode: boolean) => ({
  // Mac风格色彩
  primary: darkMode ? '#007aff' : '#0066cc',
  primarySoft: darkMode ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 102, 204, 0.1)',
  success: darkMode ? '#34c759' : '#30a14e',
  successSoft: darkMode ? 'rgba(52, 199, 89, 0.15)' : 'rgba(48, 161, 78, 0.1)',
  warning: darkMode ? '#ff9500' : '#ff9f0a',
  warningSoft: darkMode ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 159, 10, 0.1)',
  danger: darkMode ? '#ff3b30' : '#ff453a',
  dangerSoft: darkMode ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 69, 58, 0.1)',
  bg: darkMode ? '#1c1c1c' : '#f5f5f5',
  panel: darkMode ? '#252525' : '#ffffff',
  card: darkMode ? '#2d2d2d' : '#ffffff',
  cardAlt: darkMode ? '#333333' : '#f0f0f0',
  border: darkMode ? '#4a4a4a' : '#d0d0d0',
  borderSoft: darkMode ? '#3a3a3a' : '#e0e0e0',
  textMain: darkMode ? '#ffffff' : '#000000',
  textSub: darkMode ? '#e0e0e0' : '#333333',
  textWeak: darkMode ? '#8e8e93' : '#999999',
  shadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
});

export const RouteStationsDrawer: React.FC<RouteStationsDrawerProps> = ({
  visible,
  onClose,
  train,
  darkMode = false
}) => {
  if (!visible || !train) return null;
  const colors = getPalette(darkMode);

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const calculateStopTime = (arrivalTime: string, departureTime: string): number => {
    if (!arrivalTime || !departureTime) return 0;
    
    const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);
    const [departureHour, departureMinute] = departureTime.split(':').map(Number);
    
    const arrivalTotalMinutes = arrivalHour * 60 + arrivalMinute;
    const departureTotalMinutes = departureHour * 60 + departureMinute;
    
    return departureTotalMinutes - arrivalTotalMinutes;
  };

  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case 'passed':
        return {
          text: colors.textWeak,
          badge: darkMode ? 'rgba(142, 142, 147, 0.15)' : 'rgba(153, 153, 153, 0.1)'
        };
      case 'current':
        return {
          text: colors.success,
          badge: colors.successSoft
        };
      case 'upcoming':
        return {
          text: colors.primary,
          badge: colors.primarySoft
        };
      default:
        return {
          text: colors.textSub,
          badge: darkMode ? 'rgba(142, 142, 147, 0.15)' : 'rgba(153, 153, 0.1)'
        };
    }
  };

  const getOverlayStyle = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 999
  });

  const getContainerStyle = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '560px',
    background: colors.bg,
    zIndex: 1000,
    boxShadow: colors.shadow,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: FONT_FAMILY
  });

  const getHeaderStyle = (): React.CSSProperties => ({
    padding: '14px 20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.panel
  });

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: '17px',
    fontWeight: '600',
    color: colors.textMain,
    letterSpacing: '0.4px',
    fontFamily: FONT_FAMILY
  });

  const getTrainNoBadgeStyle = (): React.CSSProperties => ({
    background: colors.warningSoft,
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.warning,
    border: `1px solid ${darkMode ? 'rgba(255, 149, 0, 0.3)' : 'rgba(255, 159, 10, 0.2)'}`,
    fontFamily: FONT_FAMILY
  });

  const getCloseButtonStyle = (): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: colors.textWeak,
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease'
  });

  const getContentStyle = (): React.CSSProperties => ({
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    background: 'transparent'
  });

  const getCardStyle = (): React.CSSProperties => ({
    borderRadius: '10px',
    background: colors.card,
    padding: '14px 16px',
    border: `1px solid ${colors.border}`,
    marginBottom: '16px',
    boxShadow: colors.shadow
  });

  const getCardTitleStyle = (): React.CSSProperties => ({
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textWeak,
    marginBottom: '12px',
    letterSpacing: '0.2px',
    fontFamily: FONT_FAMILY
  });

  const isFirstStation = (index: number) => index === 0;
  const isLastStation = (index: number) => train.routeStations ? index === train.routeStations.length - 1 : false;

  return (
    <>
      <div style={getOverlayStyle()} onClick={handleOverlayClick} />
      
      <div style={getContainerStyle()}>
        <div style={getHeaderStyle()}>
          <div>
            <div style={getTitleStyle()}>
              途径站信息
            </div>
            <div style={{ marginTop: '4px', color: colors.textWeak, fontSize: '12px' }}>
              实时查看当前车次沿线站点状态与到离站时间
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={getTrainNoBadgeStyle()}>{train.trainNo}</div>
            <Button 
              type="text" 
              icon={<X size={18} />} 
              onClick={handleClose} 
              style={getCloseButtonStyle()}
            />
          </div>
        </div>

        <div style={getContentStyle()}>
          <div style={getCardStyle()}>
            <div style={getCardTitleStyle()}>
              运行区间
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.textWeak, fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} />
                  始发
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.textMain }}>
                  {train.runningSection.from}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: colors.primarySoft,
                border: `1px solid ${colors.border}`
              }}>
                <ChevronsRight style={{ color: colors.primary }} size={16} />
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ color: colors.textWeak, fontSize: '12px', marginBottom: '4px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} />
                  终到
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.textMain }}>
                  {train.runningSection.to}
                </div>
              </div>
            </div>
          </div>

          <div style={getCardStyle()}>
            <div style={{ ...getCardTitleStyle(), marginBottom: '10px' }}>
              途径站详情
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', padding: '0 8px 8px' }}>
              <div style={{ fontSize: '12px', color: colors.textWeak, fontWeight: 500 }}>到点</div>
              <div style={{ fontSize: '12px', color: colors.textWeak, fontWeight: 500 }}>站名</div>
              <div style={{ fontSize: '12px', color: colors.textWeak, textAlign: 'right', fontWeight: 500 }}>站停时间</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {train.routeStations?.map((station, index) => {
                const status = getStatusConfig(station.currentStatus);
                const firstStation = isFirstStation(index);
                const lastStation = isLastStation(index);
                const isCurrent = station.currentStatus === 'current';
                const isUpcoming = station.currentStatus === 'upcoming';
                const isNextStation = index > 0 && train.routeStations[index - 1].currentStatus === 'current';
                
                // 计算站停时间
                const stopTime = calculateStopTime(station.time, station.departure || '');
                
                return (
                  <div
                    key={station.name}
                    style={{
                      borderRadius: '8px',
                      background: isNextStation ? colors.warningSoft : status.badge,
                      border: `1px solid ${isNextStation ? colors.warning : colors.border}`,
                      padding: '8px 12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', alignItems: 'center' }}>
                      {/* 到点 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock3 size={12} color={colors.textWeak} />
                        {!firstStation ? (
                          <span style={{ fontSize: '14px', fontWeight: 600, color: isNextStation ? colors.warning : status.text, fontFamily: FONT_FAMILY_MONO }}>
                            {station.time}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: colors.textWeak }}>始发站</span>
                        )}
                      </div>
                      
                      {/* 站名和标签 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: isCurrent ? 700 : 600,
                          color: isCurrent ? colors.success : isNextStation ? colors.warning : colors.textMain
                        }}>
                          {station.name}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {/* 正倒序标签 */}
                          {firstStation ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: '999px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: colors.primarySoft,
                              color: colors.primary,
                              border: `1px solid ${colors.border}`
                            }}>
                              <ArrowUpDown size={8} />
                              {train.attributes.formationOrder === 'normal' ? '正序' : '倒序'}
                            </div>
                          ) : null}
                          
                          {/* 晚点标签 */}
                          {station.delay && station.delay > 0 ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: '999px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: colors.dangerSoft,
                              color: colors.danger,
                              border: `1px solid ${colors.border}`
                            }}>
                              <AlertTriangle size={8} />
                              晚点{station.delay}分
                            </div>
                          ) : null}
                          
                          {/* 折返标签 */}
                          {station.turnaround ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: '999px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: colors.warningSoft,
                              color: colors.warning,
                              border: `1px solid ${colors.border}`
                            }}>
                              <Repeat size={8} />
                              折返
                            </div>
                          ) : null}
                          
                          {/* 当前站标签 */}
                          {isCurrent ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: '999px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: colors.successSoft,
                              color: colors.success,
                              border: `1px solid ${colors.border}`
                            }}>
                              已到达
                            </div>
                          ) : null}
                          
                          {/* 前方到站标签 */}
                          {isNextStation ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: '999px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: colors.warningSoft,
                              color: colors.warning,
                              border: `1px solid ${colors.border}`
                            }}>
                              前方到站
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      {/* 站停时间 */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                        {stopTime > 0 ? (
                          <span style={{ fontSize: '14px', fontWeight: 600, color: isNextStation ? colors.warning : status.text, fontFamily: FONT_FAMILY_MONO }}>
                            {stopTime}分
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
