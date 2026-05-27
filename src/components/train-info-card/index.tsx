import React from 'react';

interface ServiceTag {
  label: string;
}

interface TrainInfoCardProps {
  trainNumber?: string;
  route?: string;
  track?: string;
  departureTime?: string;
  trackChange?: string;
  services?: ServiceTag[];
}

const TrainInfoCard: React.FC<TrainInfoCardProps> = ({
  trainNumber = 'G1101',
  route = '重庆东→北京西',
  track = '16正北',
  departureTime = '08:19',
  trackChange = '25→24',
  services = [
    { label: '水' },
    { label: '污' },
    { label: '包' },
    { label: '餐' },
    { label: '库' },
  ],
}) => {
  return (
    <div className="relative w-[210px] h-[109px] overflow-hidden">
      <div className="absolute inset-0 flex flex-col">
        <div
          className="w-full h-[52px]"
          style={{
            background: 'linear-gradient(180deg, #E3F7FF 0%, #60BDE6 100%)',
            border: '1px solid #60BDE6',
          }}
        />
        <div
          className="w-full h-[32px]"
          style={{
            background: '#D9D9D9',
            border: '1px solid rgba(5, 26, 54, 0.34)',
          }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full" style={{ top: '25px' }}>
        <div className="relative w-full">
          <div
            className="absolute"
            style={{ left: '44px', top: '5px', width: '88px', height: '28px' }}
          >
            <div
              className="absolute inset-0 rounded"
              style={{
                background: 'linear-gradient(90deg, #ECE6DA 0%, #FFD18F 100%)',
                border: '1px solid #D48806',
                borderRadius: '6px',
              }}
            />
            <span
              className="absolute font-bold text-[16px] leading-none"
              style={{
                left: '25.5px',
                top: '5px',
                color: '#D48806',
                fontFamily: 'Inter',
                fontWeight: 700,
              }}
            >
              {trainNumber}
            </span>
          </div>

          <span
            className="absolute text-[13px]"
            style={{
              left: '19px',
              top: '35px',
              width: '113px',
              color: '#3D3B3B',
              fontFamily: 'Inter',
              fontWeight: 400,
            }}
          >
            {route}
          </span>

          <div
            className="absolute"
            style={{ left: '139px', top: '5px', width: '65px', height: '44px' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #D9D9D9 0%, #737373 100%)',
                border: '1px solid #4B4F52',
                borderRadius: '9px',
              }}
            />
            <span
              className="absolute font-bold text-[16px] leading-none"
              style={{
                left: '7px',
                top: '6px',
                color: '#2E3237',
                fontFamily: 'Inter',
                fontWeight: 700,
              }}
            >
              {track}
            </span>
            <div
              className="absolute rounded-full"
              style={{
                left: '10px',
                top: '29px',
                width: '46px',
                height: '9px',
                background: '#00FF2F',
                border: '1px solid #413F3F',
              }}
            />
          </div>

          <div
            className="absolute"
            style={{ left: '44px', top: '56px', width: '88px', height: '24px' }}
          >
            <div
              className="absolute"
              style={{
                left: '-36px',
                top: '0',
                width: '124px',
                height: '24px',
                background: 'linear-gradient(180deg, #D9D9D9 0%, rgba(115,115,115,0.86) 100%)',
                border: '1px solid #7D7979',
                borderRadius: '9px',
              }}
            />
            <span
              className="absolute font-bold text-[14px] text-center leading-none"
              style={{
                left: '-18px',
                top: '3px',
                width: '88px',
                color: '#2E3237',
                fontFamily: 'Inter',
                fontWeight: 700,
              }}
            >
              {departureTime}
            </span>
          </div>

          <div
            className="absolute"
            style={{ left: '139px', top: '56px', width: '66px', height: '24px' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #E60000 0%, #800000 100%)',
                border: '1px solid #7D7979',
                borderRadius: '9px',
              }}
            />
            <span
              className="absolute font-bold text-[14px] leading-none"
              style={{
                left: '8px',
                top: '3px',
                color: '#FFF0F1',
                fontFamily: 'Inter',
                fontWeight: 700,
              }}
            >
              {trackChange}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 flex flex-row" style={{ top: '0px', left: '0px' }}>
        {services.map((service, index) => {
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
                className="absolute font-bold text-[14px] leading-none"
                style={{
                  left: '5px',
                  top: '3px',
                  color: '#000000',
                  fontFamily: 'Inter',
                  fontWeight: 700,
                }}
              >
                {service.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainInfoCard;
