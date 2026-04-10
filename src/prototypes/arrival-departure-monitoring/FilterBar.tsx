import React, { useState } from 'react';
import { Search, Moon, Sun, Filter, Settings, ChevronDown, Check, Building2 } from 'lucide-react';
import { PlanFilterState } from './components/PlanFilterDrawer';
import { Station } from './hooks/useMultiStation';

interface FilterBarProps {
  viewMode: 'normal' | 'intervention';
  onViewModeChange: (mode: 'normal' | 'intervention') => void;
  hasSelection: boolean;
  onExecute: () => void;
  onMessageClick: (trainNo: string) => void;
  dataVersion: number;
  onSearch: (term: string) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  onPlanFilterChange: (filters: PlanFilterState) => void;
  planFilters: PlanFilterState;
  simpleMode: boolean;
  onSimpleModeChange: () => void;
  stations: Station[];
  onStationConfigOpen: () => void;
  activeStationCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  viewMode,
  onViewModeChange,
  hasSelection,
  onExecute,
  onSearch,
  darkMode,
  onThemeToggle,
  onPlanFilterChange,
  planFilters,
  simpleMode,
  onSimpleModeChange,
  stations,
  onStationConfigOpen,
  activeStationCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const timeOptions = [
    { label: '全部', value: 0 },
    { label: '1小时内', value: 1 },
    { label: '2小时内', value: 2 },
    { label: '4小时内', value: 4 },
    { label: '6小时内', value: 6 },
    { label: '12小时内', value: 12 },
    { label: '24小时内', value: 24 }
  ];

  return (
    <div style={{
      padding: '12px 16px',
      background: darkMode ? '#1e293b' : '#fff',
      borderBottom: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap'
    }}>
      {/* 时间筛选 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowTimeFilter(!showTimeFilter)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: darkMode ? '#334155' : '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            color: darkMode ? '#e2e8f0' : '#374151',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <Filter size={16} />
          {timeOptions.find(opt => opt.value === planFilters.timeConfig)?.label || '全部'}
          <ChevronDown size={14} />
        </button>
        
        {showTimeFilter && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: darkMode ? '#334155' : '#fff',
            border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            minWidth: '120px'
          }}>
            {timeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  onPlanFilterChange({ ...planFilters, timeConfig: opt.value });
                  setShowTimeFilter(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: darkMode ? '#e2e8f0' : '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {opt.label}
                {planFilters.timeConfig === opt.value && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 搜索框 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: darkMode ? '#334155' : '#f3f4f6',
        borderRadius: '6px',
        flex: 1,
        maxWidth: '300px'
      }}>
        <Search size={16} color={darkMode ? '#94a3b8' : '#6b7280'} />
        <input
          type="text"
          placeholder="搜索车次/股道/站台..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: '14px',
            color: darkMode ? '#e2e8f0' : '#374151',
            width: '100%'
          }}
        />
      </div>

      {/* 车站配置按钮 */}
      <button
        onClick={onStationConfigOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: darkMode ? '#334155' : '#f3f4f6',
          border: 'none',
          borderRadius: '6px',
          color: darkMode ? '#e2e8f0' : '#374151',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        <Building2 size={16} />
        车站 ({activeStationCount})
      </button>

      {/* 简洁模式切换 */}
      <button
        onClick={onSimpleModeChange}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: simpleMode ? '#3b82f6' : (darkMode ? '#334155' : '#f3f4f6'),
          border: 'none',
          borderRadius: '6px',
          color: simpleMode ? '#fff' : (darkMode ? '#e2e8f0' : '#374151'),
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        {simpleMode ? '标准' : '简洁'}
      </button>

      {/* 主题切换 */}
      <button
        onClick={onThemeToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 10px',
          background: darkMode ? '#334155' : '#f3f4f6',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        {darkMode ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6b7280" />}
      </button>

      {/* 配置按钮 */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: darkMode ? '#334155' : '#f3f4f6',
          border: 'none',
          borderRadius: '6px',
          color: darkMode ? '#e2e8f0' : '#374151',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        <Settings size={16} />
        配置
      </button>

      {/* 干预模式按钮 */}
      <button
        onClick={() => onViewModeChange(viewMode === 'intervention' ? 'normal' : 'intervention')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: viewMode === 'intervention' ? '#ef4444' : (darkMode ? '#334155' : '#f3f4f6'),
          border: 'none',
          borderRadius: '6px',
          color: viewMode === 'intervention' ? '#fff' : (darkMode ? '#e2e8f0' : '#374151'),
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        {viewMode === 'intervention' ? '退出干预' : '干预模式'}
      </button>

      {/* 执行按钮 */}
      {hasSelection && (
        <button
          onClick={onExecute}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          执行干预
        </button>
      )}
    </div>
  );
};
