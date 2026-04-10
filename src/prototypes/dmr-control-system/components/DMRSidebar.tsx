import React from 'react';
import { Mic, Radio } from 'lucide-react';
import { CALL_GROUPS, PLAYBACK_GROUPS } from '../data/groups';
import type { Group } from '../types/dmr';

interface DMRSidebarProps {
  selectedGroupId: string;
  onSelectGroup: (group: Group) => void;
}

export default function DMRSidebar({ selectedGroupId, onSelectGroup }: DMRSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* 标题 */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Radio className="w-6 h-6 text-blue-600" />
          管控平台 DMR 系统
        </h1>
      </div>

      {/* 分组列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 通话组分类 */}
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 bg-gray-50 font-semibold text-sm text-gray-700 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            通话组
          </div>
          <div className="divide-y divide-gray-100">
            {CALL_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2 ${
                  selectedGroupId === group.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* 录音回放分类 */}
        <div>
          <div className="px-4 py-3 bg-gray-50 font-semibold text-sm text-gray-700 flex items-center gap-2">
            <Radio className="w-4 h-4" />
            录音回放
          </div>
          <div className="divide-y divide-gray-100">
            {PLAYBACK_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2 ${
                  selectedGroupId === group.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                {group.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
