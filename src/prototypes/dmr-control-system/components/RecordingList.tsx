import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Calendar, Clock, Mic, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { RecordingItem } from '../types/dmr';
import { MOCK_RECORDINGS } from '../data/mockRecordings';
import { CALL_GROUPS } from '../data/groups';

interface RecordingListProps {
  groupName?: string;
}

export default function RecordingList({ groupName }: RecordingListProps) {
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 加载录音列表
  const loadRecordings = () => {
    setLoading(true);

    setTimeout(() => {
      let filteredRecordings = [...MOCK_RECORDINGS];

      if (groupName) {
        filteredRecordings = filteredRecordings.filter(r => r.groupName === groupName);
      }

      filteredRecordings.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      setRecordings(filteredRecordings);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadRecordings();
  }, [groupName]);

  // 筛选录音
  useEffect(() => {
    let filtered = [...recordings];

    // 搜索关键词筛选
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.groupName.toLowerCase().includes(keyword) ||
        r.date.includes(keyword) ||
        r.time.includes(keyword)
      );
    }

    // 分组筛选
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(r => r.groupId === selectedGroup);
    }

    // 日期范围筛选
    if (startDate) {
      filtered = filtered.filter(r => r.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.date <= endDate);
    }

    setFilteredRecordings(filtered);
    setCurrentPage(1);
  }, [recordings, searchKeyword, selectedGroup, startDate, endDate]);

  // 重置筛选
  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedGroup('all');
    setStartDate('');
    setEndDate('');
  };

  // 播放录音
  const handlePlay = (recording: RecordingItem) => {
    try {
      if (playingId === recording.key) {
        setPlayingId(null);
        return;
      }

      setPlayingId(recording.key);
      console.log('播放录音:', recording.key);
    } catch (err) {
      console.error('播放录音失败:', err);
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 格式化时间显示
  const formatDisplayTime = (timeStr: string) => {
    return timeStr.replace(/-/g, ':');
  };

  // 获取唯一分组列表
  const uniqueGroups = useMemo(() => {
    const groups = new Set(recordings.map(r => r.groupName));
    return Array.from(groups).sort();
  }, [recordings]);

  // 分页数据
  const paginatedRecordings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecordings.slice(start, start + pageSize);
  }, [filteredRecordings, currentPage]);

  const totalPages = Math.ceil(filteredRecordings.length / pageSize);

  // 统计筛选结果
  const filterCount = useMemo(() => {
    return filteredRecordings.length;
  }, [filteredRecordings]);

  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-50 overflow-hidden h-full">
      {/* 标题 */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mic className="w-6 h-6 text-blue-600" />
          录音回放
          {groupName && <span className="text-gray-500 font-normal">- {groupName}</span>}
        </h2>
        <p className="text-sm text-gray-500 mt-1">模拟模式（使用模拟数据）</p>
      </div>

      {/* 筛选器区域 */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
          {(searchKeyword || selectedGroup !== 'all' || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              重置
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索分组、时间..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分组筛选 */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部分组</option>
            {CALL_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          {/* 开始日期 */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="开始日期"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 结束日期 */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="结束日期"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 筛选结果统计 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            找到 <span className="font-semibold text-blue-600">{filterCount}</span> 条录音
          </span>
        </div>
      </div>

      {/* 录音列表 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            加载中...
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Mic className="w-16 h-16 mb-4 text-gray-300" />
            <p>暂无录音文件</p>
            {(searchKeyword || selectedGroup !== 'all' || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedRecordings.map((recording) => (
              <div
                key={recording.key}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{recording.groupName}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {recording.date}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDisplayTime(recording.time)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      文件大小: {formatSize(recording.size)} | 时长: {recording.duration}秒
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlay(recording)}
                      className={`p-2 rounded-lg transition-colors ${
                        playingId === recording.key
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {playingId === recording.key ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {!loading && filteredRecordings.length > 0 && (
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页，共 {filteredRecordings.length} 条
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
