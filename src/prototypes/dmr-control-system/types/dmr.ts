// DMR 系统类型定义

export type CallCategory = 'call' | 'playback';

export interface Group {
  id: string;
  name: string;
  category: CallCategory;
  parentId?: string;
}

export interface CallGroup extends Group {
  category: 'call';
}

export interface PlaybackGroup extends Group {
  category: 'playback';
}

export type CallStatus = 'idle' | 'pressed' | 'recording' | 'auto-release';

export interface RecordingMetadata {
  key: string;
  groupId: string;
  groupName: string;
  timestamp: string;
  duration: number;
  size: number;
  date: string;
  time: string;
}

export interface RecordingItem extends RecordingMetadata {
  url?: string;
}
