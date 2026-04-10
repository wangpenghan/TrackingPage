import { CallGroup, PlaybackGroup } from '../types/dmr';

export const CATEGORIES = {
  CALL: { id: 'call', name: '通话组' },
  PLAYBACK: { id: 'playback', name: '录音回放' }
} as const;

export const CALL_GROUPS: CallGroup[] = [
  { id: 'call-passenger', name: '客运组', category: 'call' },
  { id: 'call-ticket', name: '售票组', category: 'call' },
  { id: 'call-service', name: '服务台', category: 'call' },
  { id: 'call-cleaning', name: '保洁组', category: 'call' },
  { id: 'call-business', name: '商务组', category: 'call' },
  { id: 'call-backup1', name: '备用1', category: 'call' },
  { id: 'call-area-duty', name: '区域值班员', category: 'call' },
  { id: 'call-fast-entrance', name: '快速进站厅', category: 'call' },
  { id: 'call-all-platform', name: '全路站台', category: 'call' },
  { id: 'call-train-driver', name: '动车司机', category: 'call' },
  { id: 'call-all-train', name: '全路列车', category: 'call' },
];

export const PLAYBACK_GROUPS: PlaybackGroup[] = [
  { id: 'playback-recordings', name: '录音回放', category: 'playback' },
];

export const ALL_GROUPS = {
  call: CALL_GROUPS,
  playback: PLAYBACK_GROUPS,
};
