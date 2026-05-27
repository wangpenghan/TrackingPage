import React from 'react';

interface ServiceTag {
  label: string;
}

interface TrainCardNorthProps {
  trainNumber?: string;
  route?: string;
  track?: string;
  departureTime?: string;
  trackChange?: string;
  delayMinutes?: number;
  status?: 'normal' | 'track-change' | 'delayed' | 'delayed-track-change' | 'early' | 'one-hour-out' | 'departed' | 'suspended';
  trainType?: 'sf' | 'tj' | 'zd';
  services?: ServiceTag[];
}

const TrainCardNorth: React.FC<TrainCardNorthProps> = ({
  trainNumber = 'G1101',
  route = '重庆东→北京西',
  track = '16正北',
  departureTime = '08:19',
  trackChange = '25→24',
  delayMinutes,
  status = 'normal',
  trainType = 'sf',
  services = [
    { label: '水' },
    { label: '污' },
    { label: '包' },
    { label: '餐' },
    { label: '库' },
  ],
}) => {
  const showTrackChange = status === 'track-change' || status === 'delayed-track-change';
  const isDelayed = status === 'delayed' || status === 'delayed-track-change';
  const isEarly = status === 'early';
  const isOneHourOut = status === 'one-hour-out';
  const isDeparted = status === 'departed';
  const isSuspended = status === 'suspended';
  const showTrackInfo = status !== 'delayed-track-change';

  const getBackgroundGradient = () => {
    if (isDelayed || showTrackChange) {
      return 'linear-gradient(180deg, #E60000 0%, #800000 100%)';
    }
    return 'linear-gradient(180deg, #D9D9D9 0%, rgba(115,115,115,0.86) 100%)';
  };

  return (
    <div 
      className="relative" 
      style={{ width: '210px', height: isSuspended ? '125px' : '109px', overflow: isSuspended ? 'visible' : 'hidden' }}
    >
      {/* 服务标签 - 右对齐（停运状态不显示） */}
      {!isSuspended && services.map((service, index) => {
        const positions = [181, 154, 127, 100, 73];
        const left = positions[index] ?? 73 - (index - 4) * 27;
        return (
          <div
            key={index}
            className="absolute"
            style={{ left: `${left}px`, top: '0px', width: '24px', height: '24px' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: '#C5F6FF',
                border: '1px solid #627C94',
                borderRadius: '5px',
              }}
            />
            <span
              className="absolute font-bold"
              style={{
                left: '5px',
                top: '3px',
                color: '#000000',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {service.label}
            </span>
          </div>
        );
      })}

      {/* 主内容区（停运状态调整top值） */}
      <div className="absolute" style={{ top: isSuspended ? '0px' : '25px', left: '0', width: '210px', height: '84px' }}>
        {/* 顶部背景 - 带火车头 */}
        <svg 
          width="210" 
          height="52" 
          viewBox="0 0 210 52" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: '0px', left: '0px' }}
        >
          <path 
            d="M68.2734 0.5H201C205.694 0.5 209.5 4.30558 209.5 9V51.5H0.5V47.749C0.500054 43.6368 2.37458 39.7488 5.5918 37.1875L38.6885 10.8389C47.0965 4.14507 57.5262 0.500031 68.2734 0.5Z" 
            fill="url(#north-grad)" 
            stroke={isOneHourOut ? '#E69360' : isDeparted ? '#627C94' : isSuspended ? '#E66062' : '#60BDE6'}
          />
          <defs>
            <linearGradient id="north-grad" x1="105" y1="0" x2="105" y2="52" gradientUnits="userSpaceOnUse">
              {isOneHourOut ? (
                <>
                  <stop stopColor="#FFF7E3"/>
                  <stop offset="1" stopColor="#E6B760"/>
                </>
              ) : isDeparted ? (
                <>
                  <stop stopColor="#E6E6E6"/>
                  <stop offset="1" stopColor="#808080"/>
                </>
              ) : isSuspended ? (
                <>
                  <stop stopColor="#FFE3E3"/>
                  <stop offset="1" stopColor="#E66060"/>
                </>
              ) : (
                <>
                  <stop stopColor="#E3F7FF"/>
                  <stop offset="1" stopColor="#60BDE6"/>
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        
        {/* 底部背景 */}
        <svg 
          width="210" 
          height="32" 
          viewBox="0 0 210 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: '52px', left: '0px' }}
        >
          <path d="M0 0H210V23C210 27.9706 205.971 32 201 32H9.00001C4.02944 32 0 27.9706 0 23V0Z" fill={isSuspended ? "#FFD4D0" : "#D9D9D9"}/>
          <path d="M209.5 0.5V23C209.5 27.6944 205.694 31.5 201 31.5H9C4.30558 31.5 0.5 27.6944 0.5 23V0.5H209.5Z" stroke={isSuspended ? "rgba(54, 5, 5, 0.34)" : "#051A36"} strokeOpacity="0.34"/>
        </svg>

        {/* 车次标签 */}
        <div className="absolute" style={{ left: '44px', top: '5px', width: '88px', height: '28px' }}>
          <svg width="88" height="28" viewBox="0 0 88 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M22.4004 0.5H82C85.0376 0.5 87.5 2.96243 87.5 6V22C87.5 25.0376 85.0376 27.5 82 27.5H5.59961C2.78327 27.4998 0.500211 25.2167 0.5 22.4004C0.5 10.3054 10.3054 0.5 22.4004 0.5Z" 
              fill="rgba(0,0,0,0.7)" 
              stroke="#2E3237"
            />
          </svg>
          <span
            className="absolute"
            style={{
              left: '25.5px',
              top: '5px',
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '16px',
              background: trainType === 'sf' 
                ? 'linear-gradient(180deg, #FFA50A 0%, #FFD07E 100%)' 
                : trainType === 'tj' 
                  ? 'linear-gradient(180deg, #FF36CD 0%, #FF94E4 100%)' 
                  : 'linear-gradient(180deg, #00C8FF 0%, #D8F7FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {trainNumber}
          </span>
        </div>

        {/* 路线 */}
        <span
          className="absolute"
          style={{
            left: '19px',
            top: '35px',
            width: '113px',
            color: '#3D3B3B',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '13px',
          }}
        >
          {route}
        </span>

        {/* 股道框 */}
        <div className="absolute" style={{ left: '139px', top: '5px', width: '65px', height: '44px' }}>
          <svg width="65" height="44" viewBox="0 0 65 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="64" height="43" rx="8.5" fill="url(#track-grad)" stroke="#4B4F52"/>
            <defs>
              <linearGradient id="track-grad" x1="32.5" y1="0" x2="32.5" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D9D9D9"/>
                <stop offset="1" stopColor="#737373"/>
              </linearGradient>
            </defs>
          </svg>
          <span
            className="absolute"
            style={{
              left: '7px',
              top: '6px',
              color: '#2E3237',
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            {showTrackInfo ? track : ''}
          </span>
          {showTrackInfo && (
            <svg width="46" height="9" viewBox="0 0 46 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute" style={{ left: '10px', top: '29px' }}>
              <rect x="0.5" y="0.5" width="45" height="8" rx="4" fill="#00FF2F" stroke="#413F3F"/>
            </svg>
          )}
        </div>

        {/* 晚点圆圈 - 与车次框底部对齐 */}
        {isDelayed && delayMinutes && (
          <div className="absolute" style={{ left: '0px', top: '-7px', width: '40px', height: '40px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="20" rx="19.5" ry="19.5" fill="#FCB3AD" stroke="#C00F0C"/>
            </svg>
            <span
              className="absolute"
              style={{
                left: '50%',
                top: '11px',
                transform: 'translateX(-50%)',
                width: '40px',
                textAlign: 'center',
                color: '#000000',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {delayMinutes}
            </span>
          </div>
        )}

        {/* 早点圆圈 - 与车次框底部对齐 */}
        {isEarly && delayMinutes && (
          <div className="absolute" style={{ left: '0px', top: '-7px', width: '40px', height: '40px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="20" rx="19.5" ry="19.5" fill="#E3F7FF" stroke="#60BDE6"/>
            </svg>
            <span
              className="absolute"
              style={{
                left: '50%',
                top: '11px',
                transform: 'translateX(-50%)',
                width: '40px',
                textAlign: 'center',
                color: '#000000',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              -{delayMinutes}
            </span>
          </div>
        )}

        {/* 停运圆圈 - 与晚点圆圈位置一致 */}
        {isSuspended && (
          <div className="absolute" style={{ left: '0px', top: '-7px', width: '40px', height: '40px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="20" rx="19.5" ry="19.5" fill="#C00F0C" stroke="#E66062"/>
            </svg>
            <span
              className="absolute"
              style={{
                left: '50%',
                top: '11px',
                transform: 'translateX(-50%)',
                width: '40px',
                textAlign: 'center',
                color: '#FFFFFF',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              停
            </span>
          </div>
        )}

        {/* 时间框 */}
        <div className="absolute" style={{ left: '8px', top: '56px', width: '124px', height: '24px' }}>
          <svg width="124" height="24" viewBox="0 0 124 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute" style={{ left: '0', top: '0' }}>
            <rect x="0.5" y="0.5" width="123" height="23" rx="8.5" fill="url(#time-grad)" stroke="#7D7979"/>
            <defs>
              <linearGradient id="time-grad" x1="62" y1="0" x2="62" y2="24" gradientUnits="userSpaceOnUse">
                {isDelayed ? (
                  <>
                    <stop stopColor="#E60000"/>
                    <stop offset="1" stopColor="#800000"/>
                  </>
                ) : (
                  <>
                    <stop stopColor="#D9D9D9"/>
                    <stop offset="1" stopColor="rgba(115,115,115,0.86)"/>
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          <span
            className="absolute"
            style={{
              left: '50%',
              top: '3px',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              color: isDelayed ? '#FFFFFF' : '#2E3237',
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {departureTime}
          </span>
        </div>

        {/* 变道框或股道号 */}
        <div className="absolute" style={{ left: '139px', top: '56px', width: '66px', height: '24px' }}>
          <svg width="66" height="24" viewBox="0 0 66 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="65" height="23" rx="8.5" fill="url(#change-grad)" stroke="#7D7979"/>
            <defs>
              <linearGradient id="change-grad" x1="33" y1="0" x2="33" y2="24" gradientUnits="userSpaceOnUse">
                {showTrackChange ? (
                  <>
                    <stop stopColor="#E60000"/>
                    <stop offset="1" stopColor="#800000"/>
                  </>
                ) : (
                  <>
                    <stop stopColor="#E6E6E6"/>
                    <stop offset="1" stopColor="#808080"/>
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          <span
            className="absolute"
            style={{
              left: showTrackChange ? '8px' : '0',
              top: '3px',
              width: showTrackChange ? '' : '66px',
              textAlign: showTrackChange ? 'left' : 'center',
              color: showTrackChange ? '#FFF0F1' : '#413F3F',
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {showTrackChange ? trackChange : track.split('正')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrainCardNorth;