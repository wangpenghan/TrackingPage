/**
 * 代管盯控 - 时间轴逻辑 Hook
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { TimelineState } from '../types';

// 默认时间范围：当前时间前后2小时
const getDefaultTimeRange = () => {
  const now = new Date();
  const start = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return { start, end, now };
};

export const useTimeline = (trainCount: number = 0) => {
  const { start, end, now } = getDefaultTimeRange();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  const [state, setState] = useState<TimelineState>({
    startTime: start,
    endTime: end,
    currentTime: now,
    zoom: 1,
    isDragging: false
  });

  // 根据车次密度计算时间刻度间隔（分钟）
  const timeInterval = useMemo(() => {
    if (trainCount > 30) return 5;
    if (trainCount > 15) return 15;
    return 30;
  }, [trainCount]);

  // 生成时间刻度
  const timeTicks = useMemo(() => {
    const ticks: Date[] = [];
    const start = new Date(state.startTime);
    start.setMinutes(0, 0, 0);

    const end = new Date(state.endTime);
    const intervalMs = timeInterval * 60 * 1000;

    for (let t = start.getTime(); t <= end.getTime(); t += intervalMs) {
      ticks.push(new Date(t));
    }

    return ticks;
  }, [state.startTime, state.endTime, timeInterval]);

  // 计算时间对应的像素位置
  const timeToPosition = useCallback((time: Date): number => {
    const totalDuration = state.endTime.getTime() - state.startTime.getTime();
    const elapsed = time.getTime() - state.startTime.getTime();
    const containerWidth = containerRef.current?.clientWidth || 1000;
    return (elapsed / totalDuration) * containerWidth * state.zoom;
  }, [state.startTime, state.endTime, state.zoom]);

  // 计算像素位置对应的时间
  const positionToTime = useCallback((position: number): Date => {
    const containerWidth = containerRef.current?.clientWidth || 1000;
    const totalDuration = state.endTime.getTime() - state.startTime.getTime();
    const elapsed = (position / (containerWidth * state.zoom)) * totalDuration;
    return new Date(state.startTime.getTime() + elapsed);
  }, [state.startTime, state.endTime, state.zoom]);

  // 拖动开始
  const handleDragStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    lastXRef.current = clientX;
    setState(prev => ({ ...prev, isDragging: true }));
  }, []);

  // 拖动中
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const deltaX = clientX - lastXRef.current;
    lastXRef.current = clientX;

    const containerWidth = containerRef.current?.clientWidth || 1000;
    const totalDuration = state.endTime.getTime() - state.startTime.getTime();
    const timeDelta = (deltaX / (containerWidth * state.zoom)) * totalDuration;

    setState(prev => ({
      ...prev,
      startTime: new Date(prev.startTime.getTime() - timeDelta),
      endTime: new Date(prev.endTime.getTime() - timeDelta)
    }));
  }, [state.endTime, state.startTime, state.zoom]);

  // 拖动结束
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  // 缩放
  const handleZoom = useCallback((delta: number) => {
    setState(prev => {
      const newZoom = Math.max(0.5, Math.min(3, prev.zoom + delta));
      return { ...prev, zoom: newZoom };
    });
  }, []);

  // 回到当前时间
  const resetToCurrentTime = useCallback(() => {
    const { start, end, now } = getDefaultTimeRange();
    setState(prev => ({
      ...prev,
      startTime: start,
      endTime: end,
      currentTime: now
    }));
  }, []);

  // 更新当前时间
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({ ...prev, currentTime: new Date() }));
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, []);

  // 当前时间位置
  const currentTimePosition = useMemo(() => {
    return timeToPosition(state.currentTime);
  }, [state.currentTime, timeToPosition]);

  return {
    state,
    containerRef,
    timeTicks,
    timeInterval,
    currentTimePosition,
    timeToPosition,
    positionToTime,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleZoom,
    resetToCurrentTime
  };
};
