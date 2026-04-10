/**
 * 代管盯控 - 工具栏
 */
import React from 'react';
import { Button, Space, Tooltip, Select } from 'antd';
import {
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  ClockCircleOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ThemeMode, QuickFilterType } from '../../types';

interface ToolbarProps {
  theme: ThemeMode;
  onThemeToggle: () => void;
  onConfigOpen: () => void;
  onResetTime: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  quickFilter: QuickFilterType;
  onQuickFilterChange: (filter: QuickFilterType) => void;
}

const filterOptions = [
  { label: '全部', value: 'none' },
  { label: '异常', value: 'abnormal' },
  { label: '晚点', value: 'late' },
  { label: '超员', value: 'overcrowd' },
  { label: '专运', value: 'special' }
];

export const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  onThemeToggle,
  onConfigOpen,
  onResetTime,
  onZoomIn,
  onZoomOut,
  quickFilter,
  onQuickFilterChange
}) => {
  return (
    <div
      className="monitoring-toolbar"
      style={{
        height: 56,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'var(--card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--foreground)'
          }}
        >
          代管盯控
        </h1>

        <Select
          value={quickFilter}
          onChange={onQuickFilterChange}
          style={{ width: 120 }}
          options={filterOptions}
          prefix={<FilterOutlined />}
        />
      </div>

      <Space>
        <Tooltip title="缩小">
          <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
        </Tooltip>
        <Tooltip title="放大">
          <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
        </Tooltip>

        <Tooltip title="回到当前时间">
          <Button icon={<ClockCircleOutlined />} onClick={onResetTime}>
            当前时间
          </Button>
        </Tooltip>

        <Tooltip title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
          <Button
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={onThemeToggle}
          >
            {theme === 'dark' ? '浅色' : '深色'}
          </Button>
        </Tooltip>

        <Tooltip title="配置">
          <Button icon={<SettingOutlined />} onClick={onConfigOpen}>
            配置
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
};
