/**
 * 代管盯控 - 时间轴
 */
import React from 'react';
import type { TimelineState } from '../../types';

interface TimelineProps {
  state: TimelineState;
  timeTicks: Date[];
  currentTimePosition: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onDragStart: (clientX: number) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: () => void;
  onWheel: (deltaY: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  timeTicks,
  currentTimePosition,
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onWheel
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    onDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    onDragEnd();
  };

  const handleMouseLeave = () => {
    onDragEnd();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    onWheel(e.deltaY);
  };

  return (
    <div
      ref={containerRef}
      className="timeline-container"
      style={{
        height: 60,
        position: 'relative',
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* 时间刻度 */}
      <div
        className="timeline-ticks"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {timeTicks.map((tick, index) => {
          const left = (index / (timeTicks.length - 1)) * 100;
          return (
            <div
              key={tick.getTime()}
              style={{
                position: 'absolute',
                left: `${left}%`,
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: 1,
                  height: 12,
                  background: 'var(--muted-foreground)',
                  margin: '0 auto 4px'
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--muted-foreground)',
                  whiteSpace: 'nowrap'
                }}
              >
                {formatTime(tick)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 当前时间标记线 */}
      <div
        className="timeline-current-marker"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${(currentTimePosition / (containerRef.current?.clientWidth || 1)) * 100}%`,
          width: 2,
          background: 'var(--destructive)',
          boxShadow: '0 0 4px var(--destructive)',
          zIndex: 10,
          transform: 'translateX(-50%)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          当前
        </div>
      </div>
    </div>
  );
};
