/**
 * 代管盯控 - 配置管理 Hook
 */
import { useState, useCallback, useEffect } from 'react';
import type { MonitoringConfig, StationConfig, PanelConfig, DisplayConfig, ReminderConfig } from '../types';
import { loadConfig, saveConfig, defaultConfig } from '../mock-data';

export const useConfig = () => {
  const [config, setConfig] = useState<MonitoringConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载配置
  useEffect(() => {
    const loaded = loadConfig();
    setConfig(loaded);
    setIsLoaded(true);
  }, []);

  // 保存配置
  const persistConfig = useCallback((newConfig: MonitoringConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  }, []);

  // 更新车站配置
  const updateStations = useCallback((stations: StationConfig[]) => {
    setConfig(prev => {
      const newConfig = { ...prev, stations };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  // 更新面板配置
  const updatePanels = useCallback((panels: PanelConfig[]) => {
    setConfig(prev => {
      const newConfig = { ...prev, panels };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  // 更新显示配置
  const updateDisplay = useCallback((display: DisplayConfig) => {
    setConfig(prev => {
      const newConfig = { ...prev, display };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  // 更新提醒配置
  const updateReminder = useCallback((reminder: ReminderConfig) => {
    setConfig(prev => {
      const newConfig = { ...prev, reminder };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  // 完成首次配置
  const completeFirstRun = useCallback(() => {
    setConfig(prev => {
      const newConfig = { ...prev, isFirstRun: false };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  // 重置配置
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
    saveConfig(defaultConfig);
  }, []);

  return {
    config,
    isLoaded,
    updateStations,
    updatePanels,
    updateDisplay,
    updateReminder,
    completeFirstRun,
    resetConfig,
    persistConfig
  };
};
