/**
 * @name 车次卡片设计方案展示
 * 展示5种不同的高铁异形卡片设计方案
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrainFront, ArrowRight } from 'lucide-react';

const mockTrainData = {
  trainNo: 'G8602',
  trainType: 'G',
  arrivalTime: '07:12',
  departureTime: '',
  track: '3',
  from: '成都东',
  to: '重庆东',
  delayMinutes: 0,
  stopType: '终到' as const,
  formationCount: 8,
  sequenceType: '正',
  directionLabel: '南',
};

const TrainSilhouette1 = () => (
  <svg viewBox="0 0 260 80" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="trainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e40af" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
      <linearGradient id="gloss1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <path
      d="M 0 80 L 0 35 Q 0 15 20 10 L 100 5 Q 140 3 160 15 L 180 25 Q 200 35 220 45 L 260 50 L 260 80 Z"
      fill="url(#trainGrad1)"
    />
    <path
      d="M 0 35 Q 0 15 20 10 L 100 5 Q 140 3 160 15 L 180 25 Q 200 35 220 45 L 260 50"
      fill="url(#gloss1)"
    />
    <ellipse cx="45" cy="70" rx="12" ry="8" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="95" cy="70" rx="12" ry="8" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="145" cy="70" rx="12" ry="8" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="195" cy="70" rx="12" ry="8" fill="rgba(0,0,0,0.2)" />
    <rect x="100" y="20" width="30" height="20" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
  </svg>
);

const TrainSilhouette2 = () => (
  <svg viewBox="0 0 260 80" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="trainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="50%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#5eead4" />
      </linearGradient>
      <filter id="glow2">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M 0 80 L 0 40 Q 30 30 80 25 Q 150 20 200 35 Q 240 45 260 50 L 260 80 Z"
      fill="url(#trainGrad2)"
      filter="url(#glow2)"
    />
    <ellipse cx="50" cy="68" rx="10" ry="6" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="110" cy="65" rx="10" ry="6" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="170" cy="68" rx="10" ry="6" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="230" cy="70" rx="10" ry="6" fill="rgba(0,0,0,0.2)" />
    <path d="M 80 30 Q 150 25 200 35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
  </svg>
);

const TrainSilhouette3 = () => (
  <svg viewBox="0 0 260 80" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="trainGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#581c87" />
        <stop offset="50%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
      <pattern id="rivets3" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.2)" />
      </pattern>
    </defs>
    <path
      d="M 0 80 L 0 35 L 15 35 Q 15 20 40 15 L 120 10 Q 180 8 220 25 L 240 35 L 260 40 L 260 80 Z"
      fill="url(#trainGrad3)"
    />
    <rect x="0" y="35" width="260" height="45" fill="url(#rivets3)" />
    <rect x="15" y="25" width="25" height="15" rx="2" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" />
    <rect x="60" y="25" width="25" height="15" rx="2" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" />
    <rect x="105" y="25" width="25" height="15" rx="2" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" />
    <ellipse cx="45" cy="72" rx="11" ry="7" fill="rgba(0,0,0,0.25)" />
    <ellipse cx="95" cy="72" rx="11" ry="7" fill="rgba(0,0,0,0.25)" />
    <ellipse cx="145" cy="72" rx="11" ry="7" fill="rgba(0,0,0,0.25)" />
    <ellipse cx="195" cy="72" rx="11" ry="7" fill="rgba(0,0,0,0.25)" />
    <circle cx="245" cy="50" r="6" fill="rgba(255,200,0,0.8)" />
  </svg>
);

const TrainSilhouette4 = () => (
  <svg viewBox="0 0 260 80" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="trainGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="50%" stopColor="#312e81" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <filter id="glow4">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="neon4" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <path
      d="M 0 80 L 0 40 Q 20 35 60 32 Q 140 28 200 40 Q 240 48 260 55 L 260 80 Z"
      fill="url(#trainGrad4)"
      filter="url(#glow4)"
    />
    <path
      d="M 0 40 Q 20 35 60 32 Q 140 28 200 40 Q 240 48 260 55"
      stroke="url(#neon4)"
      strokeWidth="2"
      fill="none"
      filter="url(#glow4)"
    />
    <ellipse cx="50" cy="70" rx="9" ry="5" fill="rgba(6,182,212,0.5)" />
    <ellipse cx="100" cy="68" rx="9" ry="5" fill="rgba(139,92,246,0.5)" />
    <ellipse cx="150" cy="68" rx="9" ry="5" fill="rgba(236,72,153,0.5)" />
    <ellipse cx="200" cy="70" rx="9" ry="5" fill="rgba(6,182,212,0.5)" />
    <rect x="60" y="35" width="80" height="20" rx="5" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.5)" />
    <line x1="120" y1="45" x2="120" y2="45" stroke="#06b6d4" strokeWidth="2" />
  </svg>
);

const TrainSilhouette5 = () => (
  <svg viewBox="0 0 260 80" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="trainGrad5" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#18181b" />
        <stop offset="100%" stopColor="#27272a" />
      </linearGradient>
    </defs>
    <path
      d="M 0 80 L 0 35 L 10 35 L 10 25 L 25 15 L 150 10 L 200 25 L 220 35 L 250 45 L 260 50 L 260 80 Z"
      fill="url(#trainGrad5)"
      stroke="#3f3f46"
      strokeWidth="1"
    />
    <line x1="10" y1="25" x2="25" y2="15" stroke="#52525b" strokeWidth="2" />
    <line x1="25" y1="15" x2="150" y2="10" stroke="#52525b" strokeWidth="2" />
    <line x1="150" y1="10" x2="200" y2="25" stroke="#52525b" strokeWidth="2" />
    <line x1="200" y1="25" x2="220" y2="35" stroke="#52525b" strokeWidth="2" />
    <line x1="220" y1="35" x2="250" y2="45" stroke="#52525b" strokeWidth="2" />
    <line x1="250" y1="45" x2="260" y2="50" stroke="#52525b" strokeWidth="2" />
    <circle cx="50" cy="72" r="5" fill="none" stroke="#52525b" strokeWidth="1.5" />
    <circle cx="110" cy="72" r="5" fill="none" stroke="#52525b" strokeWidth="1.5" />
    <circle cx="170" cy="72" r="5" fill="none" stroke="#52525b" strokeWidth="1.5" />
    <circle cx="230" cy="72" r="5" fill="none" stroke="#52525b" strokeWidth="1.5" />
    <rect x="50" y="30" width="40" height="15" rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
    <rect x="100" y="30" width="40" height="15" rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
    <rect x="150" y="30" width="40" height="15" rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
  </svg>
);

const DesignCard = ({
  title,
  description,
  silhouette: Silhouette,
  colorScheme,
  example,
}: {
  title: string;
  description: string;
  silhouette: React.ComponentType;
  colorScheme: string;
  example: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div
        className="relative h-48 rounded-xl overflow-hidden mb-4"
        style={{
          background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`,
        }}
      >
        <div className="relative h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative w-64 h-32"
              style={{
                background: colorScheme.container,
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}
            >
              <Silhouette />

              <div className="absolute inset-0 p-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ background: '#059669' }}
                  >
                    {mockTrainData.trainType}
                  </span>
                  <span className="text-xl font-bold" style={{ color: colorScheme.primary }}>
                    {mockTrainData.trainNo}
                  </span>
                  <span className="text-sm text-gray-400">
                    {mockTrainData.from.slice(0, 2)}→{mockTrainData.to.slice(0, 2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">到</span>
                    <span className="text-lg font-bold" style={{ color: colorScheme.secondary }}>
                      {mockTrainData.arrivalTime}
                    </span>
                  </div>
                  <div
                    className="px-3 py-1 rounded-lg text-sm font-bold"
                    style={{
                      background: colorScheme.accent + '20',
                      color: colorScheme.accent,
                      border: `1px solid ${colorScheme.accent}40`,
                    }}
                  >
                    {mockTrainData.track}
                  </div>
                </div>
              </div>

              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center"
                >
                  <span className="px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-medium">
                    悬停预览
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-3 rounded-lg text-xs"
        style={{ background: colorScheme.accent + '10', color: colorScheme.accent }}
      >
        <strong>配色方案：</strong> {example}
      </div>
    </motion.div>
  );
};

export default function TrainCardShowcase() {
  const designs = [
    {
      title: '方案一：流线型子弹头',
      description: '经典高铁造型，流线型车头设计，强调速度感与现代感。',
      silhouette: TrainSilhouette1,
      colorScheme: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#0ea5e9',
        container: 'linear-gradient(180deg, rgba(30,64,175,0.95) 0%, rgba(59,130,246,0.95) 50%, rgba(255,255,255,0.98) 100%)',
      },
      example: '深蓝 #1e40af → 亮蓝 #3b82f6 → 天蓝 #0ea5e9',
    },
    {
      title: '方案二：低阻力水滴型',
      description: '灵感来自水滴形状，更加有机柔和，适合长时间盯控。',
      silhouette: TrainSilhouette2,
      colorScheme: {
        primary: '#0f766e',
        secondary: '#14b8a6',
        accent: '#5eead4',
        container: 'linear-gradient(180deg, rgba(15,118,110,0.95) 0%, rgba(20,184,166,0.95) 50%, rgba(255,255,255,0.98) 100%)',
      },
      example: '深青 #0f766e → 青绿 #14b8a6 → 薄荷 #5eead4',
    },
    {
      title: '方案三：蒸汽复古融合',
      description: '复古蒸汽机车优雅线条与现代设计结合，高贵典雅。',
      silhouette: TrainSilhouette3,
      colorScheme: {
        primary: '#581c87',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        container: 'linear-gradient(180deg, rgba(88,28,135,0.95) 0%, rgba(124,58,237,0.95) 50%, rgba(255,255,255,0.98) 100%)',
      },
      example: '深紫 #581c87 → 紫色 #7c3aed → 淡紫 #a78bfa',
    },
    {
      title: '方案四：未来飞行器',
      description: '科幻飞行器设计语言，全息玻璃效果，强烈科技感。',
      silhouette: TrainSilhouette4,
      colorScheme: {
        primary: '#312e81',
        secondary: '#4338ca',
        accent: '#8b5cf6',
        container: 'linear-gradient(180deg, rgba(30,27,75,0.95) 0%, rgba(49,46,129,0.95) 50%, rgba(255,255,255,0.98) 100%)',
      },
      example: '靛蓝 #312e81 → 靛紫 #4338ca → 紫罗兰 #8b5cf6',
    },
    {
      title: '方案五：极简几何线条',
      description: '最少线条勾勒高铁轮廓，极简主义，信息优先。',
      silhouette: TrainSilhouette5,
      colorScheme: {
        primary: '#27272a',
        secondary: '#3f3f46',
        accent: '#52525b',
        container: 'linear-gradient(180deg, rgba(39,39,42,0.95) 0%, rgba(63,63,70,0.95) 50%, rgba(255,255,255,0.98) 100%)',
      },
      example: '纯黑 #27272a → 深灰 #3f3f46 → 中灰 #52525b',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚄 高铁异形卡片设计方案
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            5种不同风格的高铁侧视剪影卡片设计，采用浅色容器 + 深色车头剪影的组合，
            减少视觉疲劳，突出卡片信息。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {designs.map((design, index) => (
            <DesignCard key={index} {...design} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📊 设计对比
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">方案</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">视觉强度</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">专业感</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">科技感</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">可读性</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">推荐指数</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">流线型子弹头</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600 font-bold">⭐⭐⭐⭐⭐</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">低阻力水滴型</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600 font-bold">⭐⭐⭐⭐</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">蒸汽复古融合</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600 font-bold">⭐⭐⭐</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">未来飞行器</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600 font-bold">⭐⭐⭐</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">极简几何线条</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600 font-bold">⭐⭐⭐⭐</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">💡 设计说明</h3>
          <ul className="space-y-2 text-blue-700">
            <li>• 所有方案都采用 <strong>深色车头剪影</strong> + <strong>浅色容器</strong> 的组合</li>
            <li>• 车头部分使用 SVG 绘制，包含高铁侧视轮廓、车窗、车轮等元素</li>
            <li>• 容器部分保持浅色背景，减少视觉疲劳，便于长时间盯控</li>
            <li>• 不同方案采用不同的配色系统，可根据实际需求选择</li>
            <li>• 卡片支持悬停效果，可增强交互体验</li>
          </ul>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="mb-4">请选择你喜欢的方案（1-5），我将为你实现到主页面中！</p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              选择方案1
            </button>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              选择方案2
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              选择方案3
            </button>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              选择方案4
            </button>
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              选择方案5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
