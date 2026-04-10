import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

// 全开 - 明亮的灯泡，带光芒效果
export const CircuitFullOn: React.FC<IconProps> = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* 光芒 */}
      <path d="M14 2V4M14 24V26M4 14H2M26 14H24M6.34 6.34L4.93 4.93M23.07 23.07L21.66 21.66M6.34 21.66L4.93 23.07M23.07 4.93L21.66 6.34" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      {/* 灯泡底座 */}
      <rect x="10" y="20" width="8" height="3" rx="1" fill="#6B7280"/>
      {/* 灯泡主体 - 完全发光 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 15.31 8.03 18.15 11 19.23V20H17V19.23C19.97 18.15 22 15.31 22 12C22 7.58 18.42 4 14 4Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5"/>
      {/* 内部发光效果 */}
      <circle cx="14" cy="12" r="5" fill="#FEF3C7"/>
    </svg>
  );
};

// 1/2开-A - 左侧发光
export const CircuitHalfOnA: React.FC<IconProps> = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* 左侧光芒 */}
      <path d="M4 14H2M6.34 6.34L4.93 4.93M6.34 21.66L4.93 23.07" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* 灯泡底座 */}
      <rect x="10" y="20" width="8" height="3" rx="1" fill="#6B7280"/>
      {/* 灯泡主体 - 左半发光 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 15.31 8.03 18.15 11 19.23V20H17V19.23C19.97 18.15 22 15.31 22 12C22 7.58 18.42 4 14 4Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5"/>
      {/* 左侧发光 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 14.5 7.2 16.7 9 18.1V20H14V4Z" fill="#FCD34D"/>
      <circle cx="11" cy="12" r="3" fill="#FEF3C7"/>
    </svg>
  );
};

// 1/2开-B - 右侧发光
export const CircuitHalfOnB: React.FC<IconProps> = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* 右侧光芒 */}
      <path d="M26 14H24M23.07 6.34L21.66 4.93M23.07 21.66L21.66 23.07" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* 灯泡底座 */}
      <rect x="10" y="20" width="8" height="3" rx="1" fill="#6B7280"/>
      {/* 灯泡主体 - 右半发光 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 15.31 8.03 18.15 11 19.23V20H17V19.23C19.97 18.15 22 15.31 22 12C22 7.58 18.42 4 14 4Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5"/>
      {/* 右侧发光 */}
      <path d="M14 4C18.42 4 22 7.58 22 12C22 14.5 20.8 16.7 19 18.1V20H14V4Z" fill="#FCD34D"/>
      <circle cx="17" cy="12" r="3" fill="#FEF3C7"/>
    </svg>
  );
};

// 1/4开 - 微亮
export const CircuitQuarterOn: React.FC<IconProps> = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* 微弱光芒 */}
      <path d="M14 2V4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      {/* 灯泡底座 */}
      <rect x="10" y="20" width="8" height="3" rx="1" fill="#6B7280"/>
      {/* 灯泡主体 - 微亮 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 15.31 8.03 18.15 11 19.23V20H17V19.23C19.97 18.15 22 15.31 22 12C22 7.58 18.42 4 14 4Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>
      {/* 顶部微亮 */}
      <path d="M14 4C11.5 4 9.2 5.2 7.8 7C9.5 8.5 11 10 14 10C17 10 18.5 8.5 20.2 7C18.8 5.2 16.5 4 14 4Z" fill="#FDE68A"/>
    </svg>
  );
};

// 全关 - 熄灭的灯泡
export const CircuitFullOff: React.FC<IconProps> = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* 灯泡底座 */}
      <rect x="10" y="20" width="8" height="3" rx="1" fill="#6B7280"/>
      {/* 灯泡主体 - 熄灭 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 15.31 8.03 18.15 11 19.23V20H17V19.23C19.97 18.15 22 15.31 22 12C22 7.58 18.42 4 14 4Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5"/>
      {/* 叉号表示关闭 */}
      <path d="M11 11L17 17M17 11L11 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

// 自定义模式 - 带齿轮的灯泡
export const CircuitCustom: React.FC<IconProps> = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* 灯泡底座 */}
      <rect x="10" y="20" width="8" height="3" rx="1" fill="#6B7280"/>
      {/* 灯泡主体 */}
      <path d="M14 4C9.58 4 6 7.58 6 12C6 15.31 8.03 18.15 11 19.23V20H17V19.23C19.97 18.15 22 15.31 22 12C22 7.58 18.42 4 14 4Z" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1.5"/>
      {/* 内部发光 */}
      <circle cx="14" cy="12" r="4" fill="#7DD3FC"/>
      {/* 齿轮图标 */}
      <g transform="translate(14, 12)">
        <circle cx="0" cy="0" r="2.5" fill="#0284C7"/>
        <path d="M0 -4L0.5 -3.2L1.5 -3.8L1.8 -2.8L2.8 -2.5L2.5 -1.5L3.5 -1L2.8 0L3.5 1L2.5 1.5L2.8 2.5L1.8 2.8L1.5 3.8L0.5 3.2L0 4L-0.5 3.2L-1.5 3.8L-1.8 2.8L-2.8 2.5L-2.5 1.5L-3.5 1L-2.8 0L-3.5 -1L-2.5 -1.5L-2.8 -2.5L-1.8 -2.8L-1.5 -3.8L-0.5 -3.2Z" fill="#0EA5E9"/>
      </g>
    </svg>
  );
};

export const getCircuitIcon = (mode: string) => {
  switch (mode) {
    case 'full-on':
      return CircuitFullOn;
    case 'full-off':
      return CircuitFullOff;
    case 'half-on':
      return CircuitHalfOnA;
    case 'half-on-a':
      return CircuitHalfOnA;
    case 'half-on-b':
      return CircuitHalfOnB;
    case 'quarter-on':
      return CircuitQuarterOn;
    case 'custom':
      return CircuitCustom;
    default:
      return CircuitFullOn;
  }
};

export const getSwitchModeIcon = (modeKey: string) => {
  switch (modeKey) {
    case 'full-on':
      return CircuitFullOn;
    case 'full-off':
      return CircuitFullOff;
    case 'half-on-a':
      return CircuitHalfOnA;
    case 'half-on-b':
      return CircuitHalfOnB;
    case 'quarter-on':
      return CircuitQuarterOn;
    case 'custom':
      return CircuitCustom;
    default:
      return CircuitFullOn;
  }
};
