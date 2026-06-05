/**
 * @name 编组维护抽屉
 * @description 用于查看和调整列车编组信息，包括编组数、编组方向、进站方向、地标颜色等
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, Select } from 'antd';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { TrainData } from './index';
import './style.css';

const { Option } = Select;

interface FormationDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: TrainData | null;
  isArrival: boolean;
  onSwitchTrain?: (train: TrainData, isArrival: boolean) => void;
}

interface GuideScreen {
  id: string;
  name: string;
  zone: 'north' | 'south';
  targetCar: number;
}

// ============================================================
// 固定常量（基于16编组基准设计）
// ============================================================
const CAR_UNIT_HEIGHT = 56;        // 每节车厢高度 px（固定值）
const MAX_CARS = 16;               // 最大编组数
const nsBandDistance = MAX_CARS * CAR_UNIT_HEIGHT;  // = 896px
const nsBandTopPx = 80;           // 北停车标 Y 位置
const nsBandBottomPx = nsBandTopPx + nsBandDistance;  // 南停车标 Y = 976px
const trackHeight = nsBandBottomPx + 80;  // 总画布高度 = 1056px

// ============================================================
// 地标颜色计算（与主表一致）
// ============================================================
const getLandmarkColor = (formation: string, order: string) => {
  if (formation === '8') {
    return order === '↑' ? '#007AFF' : '#9B59B6';
  } else if (formation === '16') {
    return order === '↑' ? '#F39C12' : '#27AE60';
  }
  return '#999';
};

// ============================================================
// 根据编组数和进站方向生成默认引导屏配置
// ============================================================
const generateDefaultScreens = (carCount: '8' | '16', entryDirection: '南' | '北'): GuideScreen[] => {
  const num = parseInt(carCount);
  const mid = Math.floor(num / 2);

  return [
    { id: 's1', name: 'A站台东侧引导屏', zone: 'north', targetCar: Math.min(2, num) },
    { id: 's2', name: 'B站台西侧引导屏', zone: 'north', targetCar: Math.min(mid, num) },
    { id: 's3', name: 'C站台东侧引导屏', zone: 'south', targetCar: Math.min(mid + 1, num) },
    { id: 's4', name: 'D站台西侧引导屏', zone: 'south', targetCar: Math.min(num - 1, num) },
  ];
};

export const FormationDrawer: React.FC<FormationDrawerProps> = ({
  visible,
  onClose,
  train,
  isArrival,
  onSwitchTrain,
}) => {
  // ============================================================
  // 从 train 数据初始化方向/进站方向
  // ============================================================
  const getDefaultDirection = useCallback(() => {
    if (!train) return '正序' as const;
    return train.formationOrder === '↓' ? '倒序' : '正序';
  }, [train]);

  const getDefaultEntryDirection = useCallback(() => {
    if (!train) return '南' as const;
    return train.formationDirection;
  }, [train]);

  const getDefaultCarCount = useCallback(() => {
    if (!train?.formation) return '8' as const;
    return train.formation === '16' ? '16' : '8';
  }, [train]);

  const defaultCarCount = getDefaultCarCount();
  const defaultDirection = getDefaultDirection();
  const defaultEntryDirection = getDefaultEntryDirection();

  const [carCount, setCarCount] = useState<'8' | '16'>(defaultCarCount);
  const [direction, setDirection] = useState<'正序' | '倒序'>(defaultDirection);
  const [entryDirection, setEntryDirection] = useState<'南' | '北'>(defaultEntryDirection);
  const [screens, setScreens] = useState<GuideScreen[]>(() =>
    generateDefaultScreens(defaultCarCount, defaultEntryDirection)
  );

  // 监听 train 变化同步更新状态
  useEffect(() => {
    if (train?.formation) {
      const newCarCount = train.formation === '16' ? '16' : '8';
      const newDirection = train.formationOrder === '↓' ? '倒序' : '正序';
      const newEntryDirection = train.formationDirection;

      setCarCount(newCarCount);
      setDirection(newDirection);
      setEntryDirection(newEntryDirection);
      setScreens(generateDefaultScreens(newCarCount, newEntryDirection));
    }
  }, [train]);

  const formationNum = parseInt(carCount);

  // ============================================================
  // 编组车厢编号数组（按方向排列）
  // ============================================================
  const carNumbers = useMemo(() => {
    const nums = Array.from({ length: formationNum }, (_, i) => i + 1);
    return direction === '倒序' ? nums.reverse() : nums;
  }, [formationNum, direction]);

  // ============================================================
  // 编组起始 Y 位置计算
  // - 16编组：从北停车标开始
  // - 8编组南进：靠北停车（从北停车标开始）
  // - 8编组北进：靠南停车（从南停车标向上排列）
  // ============================================================
  const formationStartY = useMemo(() => {
    if (formationNum === 16) return nsBandTopPx;
    // 8编组：南进靠北，北进靠南
    return entryDirection === '南'
      ? nsBandTopPx
      : nsBandBottomPx - formationNum * CAR_UNIT_HEIGHT;
  }, [formationNum, entryDirection]);

  // 8编组空闲区域起点
  const idleAreaStartY = useMemo(() => {
    if (formationNum === 16) return -1; // 无空闲区域
    // 南进时空闲区在南侧，北进时空闲区在北侧
    return entryDirection === '南'
      ? formationStartY + formationNum * CAR_UNIT_HEIGHT
      : nsBandTopPx;
  }, [formationNum, entryDirection, formationStartY]);

  // P0-2: 引导屏目标车厢合法性校验
  useEffect(() => {
    setScreens(prev => prev.map(s => ({
      ...s,
      targetCar: Math.min(Math.max(s.targetCar, 1), formationNum),
    })));
  }, [formationNum]);

  // P2: 空状态处理
  if (!visible) return null;
  if (!train) {
    return (
      <>
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          background: 'rgba(0, 0, 0, 0.5)', zIndex: 999
        }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} />
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '700px', background: '#FAF8F5', zIndex: 1000,
          boxShadow: '-8px 0 24px rgba(29,78,95,0.12)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: '16px', color: '#9CA3AF' }}>暂无列车数据</div>
          <Button style={{ marginTop: '16px' }} onClick={onClose}>关闭</Button>
        </div>
      </>
    );
  }

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');

  const displayTrainNo = isArrival ? train.arrivalTrainNo : train.departureTrainNo;
  const connectedTrainNo = isArrival ? train.departureTrainNo : train.arrivalTrainNo;
  const isConnectedTrain = train.arrivalTrainNo !== train.departureTrainNo;

  const entryLabel = entryDirection === '南' ? '北' : '南';

  // P0-4: 统一地标颜色计算
  const order = direction === '正序' ? '↑' : '↓';
  const landmarkColor = getLandmarkColor(carCount, order);

  const headCar = direction === '正序' ? 1 : formationNum;
  const tailCar = direction === '正序' ? formationNum : 1;

  // P1-1: 修正车头朝向计算
  const isHeadAtNorth = entryDirection === '南' ? direction === '正序' : direction === '倒序';

  const handleSwitchToConnected = () => {
    if (onSwitchTrain) {
      onSwitchTrain(train, !isArrival);
    }
  };

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

  const currentTrainTypeClass = (() => {
    const ctn = displayTrainNo;
    if (ctn.startsWith('0') || ctn.startsWith('DJ')) return 'gray';
    if (train.arrivalTrainNo === train.departureTrainNo) return 'purple';
    return isArrival ? 'cyan' : 'yellow';
  })();

  const connectedTrainTypeClass = (() => {
    if (connectedTrainNo.startsWith('0') || connectedTrainNo.startsWith('DJ')) return 'gray';
    if (train.arrivalTrainNo === train.departureTrainNo) return 'purple';
    return isArrival ? 'yellow' : 'cyan';
  })();

  const handleCarCountChange = (value: '8' | '16') => {
    setCarCount(value);
    setScreens(generateDefaultScreens(value, entryDirection));
  };

  const handleEntryDirectionChange = (value: '南' | '北') => {
    setEntryDirection(value);
    setScreens(generateDefaultScreens(carCount, value));
  };

  const moveScreenUp = (screenId: string) => {
    setScreens(prev => prev.map(s => {
      if (s.id !== screenId) return s;
      return { ...s, targetCar: Math.min(s.targetCar + 1, formationNum) };
    }));
  };

  const moveScreenDown = (screenId: string) => {
    setScreens(prev => prev.map(s => {
      if (s.id !== screenId) return s;
      return { ...s, targetCar: Math.max(s.targetCar - 1, 1) };
    }));
  };

  // P1-4: 修正全部移动行为（保持相对间距）
  const moveAllScreens = (delta: number) => {
    setScreens(prev => {
      const cars = prev.map(s => s.targetCar + delta);
      const maxCar = Math.max(...cars);
      const minCar = Math.min(...cars);
      // 如果整体越界，自动截断增量
      const clampedDelta = delta > 0
        ? Math.min(delta, formationNum - maxCar)
        : Math.max(delta, 1 - minCar);
      return prev.map(s => ({
        ...s,
        targetCar: Math.max(1, Math.min(s.targetCar + clampedDelta, formationNum)),
      }));
    });
  };

  const moveAllScreensUp = () => moveAllScreens(-1);
  const moveAllScreensDown = () => moveAllScreens(1);

  // ============================================================
  // 车厢垂直位置计算
  // ============================================================
  const getCarYPx = (carNum: number): number => {
    const idx = carNumbers.indexOf(carNum);
    return formationStartY + idx * CAR_UNIT_HEIGHT;
  };

  // ============================================================
  // 引导屏垂直位置（卡片中心对齐车厢中心）
  // ============================================================
  const getScreenYPx = (screen: GuideScreen): number => {
    const idx = carNumbers.indexOf(screen.targetCar);
    return formationStartY + idx * CAR_UNIT_HEIGHT + CAR_UNIT_HEIGHT / 2;
  };

  const trainLabel = `${carCount}节 ${direction} ${entryDirection}进`;

  const sortedScreens = [...screens].sort((a, b) => {
    if (a.zone !== b.zone) return a.zone === 'north' ? -1 : 1;
    return a.targetCar - b.targetCar;
  });

  // P0-3: 保存/恢复默认
  const handleReset = () => {
    setCarCount(defaultCarCount);
    setDirection(defaultDirection);
    setEntryDirection(defaultEntryDirection);
    setScreens(generateDefaultScreens(defaultCarCount, defaultEntryDirection));
  };

  const handleSave = () => {
    console.log('保存编组配置:', {
      carCount,
      direction,
      entryDirection,
      screens,
    });
    onClose();
  };

  // 获取地标颜色名称
  const getLandmarkColorName = () => {
    if (carCount === '8') {
      return direction === '正序' ? '蓝色' : '紫色';
    } else {
      return direction === '正序' ? '黄色' : '绿色';
    }
  };

  // 空闲股道区域高度
  const idleAreaHeight = formationNum === 16 ? 0 : nsBandDistance - formationNum * CAR_UNIT_HEIGHT;

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(0, 0, 0, 0.5)', zIndex: 999
      }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '700px', background: '#FAF8F5', zIndex: 1000,
        boxShadow: '-8px 0 24px rgba(29,78,95,0.12)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* 头部 */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid rgba(29, 78, 95, 0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fff', flexShrink: 0
        }}>
          <div style={{
            fontSize: '15px', fontWeight: '600', color: '#1F2937',
            letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            编组维护
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
                  onClick={handleSwitchToConnected}
                  title={`点击跳转到${isArrival ? '始发车' : '终到车'}`}
                >
                  {connectedTrainNo}
                </div>
              </>
            )}

            <Button type="text" icon={<X size={16} />} onClick={onClose} style={{
              width: '28px', height: '28px', borderRadius: '6px',
              color: '#64748B', background: '#F5F3EF',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} />
          </div>
        </div>

        {/* 主区域 */}
        <div style={{ flex: 1, padding: '12px 16px', overflow: 'auto', display: 'flex', gap: '16px' }}>
          {/* 左侧可视化区域 */}
          <div style={{
            flex: 1, background: '#fff', borderRadius: '8px',
            border: '1px solid rgba(29, 78, 95, 0.08)', padding: '12px',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              height: `${trackHeight}px`, position: 'relative',
              display: 'flex', alignItems: 'stretch'
            }}>
              {/* 南北方向标记区 */}
              <div style={{
                width: '60px', flexShrink: 0, position: 'relative',
              }}>
                {/* 北标记 */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  paddingTop: '10px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#22C55E' }}>北</span>
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '12px solid #22C55E',
                    marginTop: '2px'
                  }} />
                </div>

                {/* 北停车标 P */}
                <div style={{
                  position: 'absolute', top: `${nsBandTopPx}px`, left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '3px solid #EF4444', background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>P</span>
                </div>

                {/* 南停车标 P */}
                <div style={{
                  position: 'absolute', top: `${nsBandBottomPx}px`, left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '3px solid #EF4444', background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>P</span>
                </div>

                {/* 南标记 */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  paddingBottom: '10px'
                }}>
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '12px solid #FA8C16',
                    marginBottom: '2px'
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#FA8C16' }}>南</span>
                </div>
              </div>

              {/* 股道指示条 */}
              <div style={{
                width: '20px', flexShrink: 0, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: '8px',
                  background: '#D0D0D0',
                  transform: 'translateX(-50%)',
                  borderRadius: '4px',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: `${nsBandTopPx}px`,
                    height: `${nsBandDistance}px`,
                    left: '50%',
                    width: '3px',
                    background: 'repeating-linear-gradient(180deg, #999 0px, #999 10px, transparent 10px, transparent 20px)',
                    transform: 'translateX(-50%)',
                  }} />
                </div>
              </div>

              {/* 车厢队列 */}
              <div style={{
                width: '130px', flexShrink: 0, position: 'relative',
              }}>
                {/* 8编组空闲区域（浅灰条纹背景） */}
                {formationNum === 8 && idleAreaHeight > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: `${idleAreaStartY}px`,
                    width: '130px',
                    height: `${idleAreaHeight}px`,
                    background: '#F0F0F0',
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 16px)',
                    borderRadius: '4px',
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '12px',
                      color: '#9CA3AF',
                      fontWeight: 500,
                    }}>
                      空
                    </span>
                  </div>
                )}

                {/* 车厢 */}
                {carNumbers.map((carNum) => {
                  const yPx = getCarYPx(carNum);
                  const isHead = carNum === headCar;

                  return (
                    <div key={carNum} style={{
                      position: 'absolute',
                      left: 0, top: `${yPx}px`,
                      width: '130px', height: `${CAR_UNIT_HEIGHT - 2}px`,
                      background: isHead
                        ? `linear-gradient(135deg, ${landmarkColor}, ${landmarkColor}cc)`
                        : '#F3F4F6',
                      border: `2px solid ${isHead ? landmarkColor : '#D1D5DB'}`,
                      borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isHead ? `0 4px 12px ${landmarkColor}40` : 'none',
                    }}>
                      <span style={{
                        fontSize: '15px', fontWeight: 700,
                        color: isHead ? '#fff' : '#374151',
                      }}>
                        {carNum}{isHead && '头'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 引导屏区域 */}
              <div style={{
                flex: 1, marginLeft: '20px', position: 'relative',
                height: '100%', display: 'flex', flexDirection: 'column'
              }}>
                {/* 站台引导屏背景 */}
                <div style={{
                  position: 'absolute', top: `${nsBandTopPx}px`, bottom: `${trackHeight - nsBandBottomPx}px`,
                  left: 0, right: 0,
                  background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    position: 'absolute', top: '-22px', left: '12px',
                    fontSize: '12px', fontWeight: 600, color: '#94A3B8',
                    background: '#fff', padding: '2px 10px',
                  }}>
                    站台引导屏
                  </div>

                  {/* P1-3: 南北区隔标记 */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, #CBD5E1 20%, #CBD5E1 80%, transparent 100%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '8px',
                    transform: 'translateY(-50%)',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#94A3B8',
                    background: '#fff',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid #E2E8F0',
                  }}>
                    南北分界
                  </div>
                </div>

                {/* 引导屏卡片 */}
                {sortedScreens.map((screen) => {
                  const yPx = getScreenYPx(screen);
                  return (
                    <div key={screen.id} style={{
                      position: 'absolute',
                      left: '16px', right: '16px',
                      top: `${yPx}px`,
                      transform: 'translateY(-50%)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      zIndex: 5,
                    }}>
                      <div className="formation-screen-badge" style={{
                        borderColor: landmarkColor,
                        background: `${landmarkColor}12`,
                        minWidth: '160px',
                        flex: 1,
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          width: '100%',
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                            {screen.name}
                          </span>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: landmarkColor, marginLeft: '8px' }}>
                            {screen.targetCar}车
                          </span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center',
                        flexShrink: 0,
                      }}>
                        <button
                          className="formation-screen-arrow"
                          onClick={() => moveScreenUp(screen.id)}
                          title="上移"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          className="formation-screen-arrow"
                          onClick={() => moveScreenDown(screen.id)}
                          title="下移"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 底部控制栏 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '12px', padding: '8px 0 2px 0', borderTop: '1px solid #F0F0F0', marginTop: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>全部屏移动:</span>
                <Button size="small" icon={<ChevronUp size={14} />} onClick={moveAllScreensUp} style={{ fontSize: '12px' }}>
                  全部上移
                </Button>
                <Button size="small" icon={<ChevronDown size={14} />} onClick={moveAllScreensDown} style={{ fontSize: '12px' }}>
                  全部下移
                </Button>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', background: '#F3F4F6', borderRadius: '4px'
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: landmarkColor, display: 'inline-block' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
                  {trainLabel} | 停车位: {entryLabel}侧 | 车头: {isHeadAtNorth ? '朝北' : '朝南'}
                </span>
              </div>
            </div>

            {/* P0-3: 保存/恢复默认按钮 */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '8px',
              padding: '8px 0 0 0', borderTop: '1px solid #F0F0F0', marginTop: '8px'
            }}>
              <Button onClick={handleReset}>恢复默认</Button>
              <Button type="primary" onClick={handleSave}>保存</Button>
            </div>
          </div>

          {/* 右侧配置面板 */}
          <div style={{
            width: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            {/* 配置信息 */}
            <div style={{
              background: '#fff', borderRadius: '8px',
              border: '1px solid rgba(29, 78, 95, 0.08)', padding: '12px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>配置信息</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '3px' }}>车型</label>
                  <Select style={{ width: '100%' }} value="CR400AF">
                    <Option value="CR400AF">CR400AF</Option>
                    <Option value="CR400BF">CR400BF</Option>
                    <Option value="CRH380A">CRH380A</Option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '3px' }}>编组数</label>
                  <Select style={{ width: '100%' }} value={carCount} onChange={handleCarCountChange}>
                    <Option value="8">8节</Option>
                    <Option value="16">16节</Option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '3px' }}>编组方向</label>
                  <Select style={{ width: '100%' }} value={direction} onChange={setDirection}>
                    <Option value="正序">正序</Option>
                    <Option value="倒序">倒序</Option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '3px' }}>进站方向</label>
                  <Select style={{ width: '100%' }} value={entryDirection} onChange={handleEntryDirectionChange}>
                    <Option value="南">南进</Option>
                    <Option value="北">北进</Option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '3px' }}>地标颜色</label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 8px', background: '#F3F4F6', borderRadius: '4px',
                  }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '3px', background: landmarkColor, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: landmarkColor }}>
                      {getLandmarkColorName()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 编组预览 */}
            <div style={{
              background: '#fff', borderRadius: '8px',
              border: '1px solid rgba(29, 78, 95, 0.08)', padding: '12px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>编组预览</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  当前编组: <strong style={{ color: '#1F2937' }}>{carCount}节</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  编组方向: <strong style={{ color: '#1F2937' }}>{direction}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  车头位置: <strong style={{ color: '#1F2937' }}>{headCar}车</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  车尾位置: <strong style={{ color: '#1F2937' }}>{tailCar}车</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  进站方向: <strong style={{ color: '#1F2937' }}>{entryDirection}进</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  停车位: <strong style={{ color: '#1F2937' }}>{entryLabel}侧</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  车头朝向: <strong style={{ color: '#1F2937' }}>{isHeadAtNorth ? '朝北' : '朝南'}</strong>
                </div>
              </div>
            </div>

            {/* 引导屏列表 */}
            <div style={{
              background: '#fff', borderRadius: '8px',
              border: '1px solid rgba(29, 78, 95, 0.08)', padding: '12px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>引导屏列表</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {screens.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{s.name}</span>
                    <span style={{ fontWeight: 700, color: landmarkColor }}>{s.targetCar}车</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
