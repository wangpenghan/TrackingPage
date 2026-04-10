import React, { useState, useEffect, useMemo } from 'react';
import { Button, Table, Tag, Modal, Input } from 'antd';
import { X, Users, CheckCircle2, Circle, Clock, MapPin, FileText, Train, Ticket, DoorOpen, Droplets, Search, RefreshCw, User } from 'lucide-react';
import dayjs from 'dayjs';
import { 
  mockTrainSchedules, 
  getOperationDetails, 
  OperationTaskGroup, 
  OperationTaskItem 
} from '../mock-data';

interface OperationDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  darkMode?: boolean;
}

// 作业派班弹窗组件
interface DispatchModalProps {
  visible: boolean;
  onClose: () => void;
  onChanges: (hasChanges: boolean) => void;
  trainNo: string;
  darkMode?: boolean;
}

interface DispatchJob {
  id: string;
  jobType: 'platform' | 'ticket' | 'exit' | 'water';
  jobTypeName: string;
  location: string;
  startTime: string;
  endTime: string;
  staffId?: string;
  staffName?: string;
  staffCode?: string;
}

interface TeamMember {
  id: string;
  name: string;
  code: string;
  teamId: string;
  teamName: string;
  status: 'available' | 'busy' | 'offline';
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

const generateTeamMembers = (teamId: string, teamName: string, count: number): TeamMember[] => {
  const chineseNames = [
    '张伟', '王芳', '李娜', '刘洋', '陈明', '杨静', '赵强', '黄燕', '周杰', '吴敏',
    '徐磊', '孙婷', '马云', '朱军', '胡歌', '林心如', '何勇', '高圆圆', '罗翔', '梁静',
    '孙俪', '邓超', '黄渤', '舒淇', '韩寒', '刘诗诗', '冯绍峰', '杨幂', '冯巩', '王珞丹'
  ];
  const statuses: ('available' | 'busy' | 'offline')[] = ['available', 'busy', 'offline'];
  
  return Array.from({ length: count }, (_, index) => {
    const name = chineseNames[index % chineseNames.length] + (Math.floor(index / chineseNames.length) > 0 ? Math.floor(index / chineseNames.length) : '');
    return {
      id: `p${teamId.slice(1)}${index + 1}`,
      name,
      code: `COE${String(110000 + index + 1).padStart(6, '0')}`,
      teamId,
      teamName,
      status: statuses[Math.floor(Math.random() * 3)]
    };
  });
};

const TEAMS: Team[] = [
  {
    id: 't1',
    name: '服务一班',
    members: generateTeamMembers('t1', '服务一班', 20)
  },
  {
    id: 't2',
    name: '服务二班',
    members: generateTeamMembers('t2', '服务二班', 20)
  },
  {
    id: 't3',
    name: '服务三班',
    members: generateTeamMembers('t3', '服务三班', 20)
  },
  {
    id: 't4',
    name: '服务四班',
    members: generateTeamMembers('t4', '服务四班', 20)
  },
];

const INITIAL_JOBS: DispatchJob[] = [
  {
    id: 'j1',
    jobType: 'platform',
    jobTypeName: '站台作业',
    location: '8端',
    startTime: '11:21',
    endTime: '11:45',
    staffId: 'p1',
    staffName: '阳晓军',
    staffCode: 'COE110024'
  },
  {
    id: 'j2',
    jobType: 'platform',
    jobTypeName: '站台作业',
    location: '9中',
    startTime: '11:27',
    endTime: '11:51',
    staffId: 'p4',
    staffName: '吴行舟',
    staffCode: 'COE110010'
  },
  {
    id: 'j3',
    jobType: 'ticket',
    jobTypeName: '检票作业',
    location: '8B、9B',
    startTime: '11:21',
    endTime: '11:43',
    staffId: 'p2',
    staffName: '张婷',
    staffCode: 'COE110007'
  },
  {
    id: 'j4',
    jobType: 'exit',
    jobTypeName: '出站作业',
    location: '-',
    startTime: '-',
    endTime: '-'
  },
  {
    id: 'j5',
    jobType: 'water',
    jobTypeName: '上水吸污作业',
    location: '9道',
    startTime: '11:15',
    endTime: '11:40'
  }
];

const JOB_ICONS = {
  platform: Train,
  ticket: Ticket,
  exit: DoorOpen,
  water: Droplets
};

// macOS 配色常量
const MACOS_COLORS = {
  // 按钮颜色
  primary: {
    light: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
    dark: 'linear-gradient(180deg, #0A84FF 0%, #0066CC 100%)'
  },
  // 关闭按钮颜色
  close: {
    light: '#FF5F57',
    dark: '#FF5F57'
  },
  // 背景色
  bg: {
    light: '#FFFFFF',
    dark: '#1E1E1E'
  },
  // 文字色
  text: {
    light: '#1D1D1F',
    dark: '#E5E5E5'
  },
  // 次要文字
  textSecondary: {
    light: '#6B7280',
    dark: '#8E8E93'
  },
  // 边框色
  border: {
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(255, 255, 255, 0.1)'
  },
  // 卡片背景
  cardBg: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(60, 60, 60, 0.6)'
  }
};

const DispatchModal: React.FC<DispatchModalProps> = ({ visible, onClose, onChanges, trainNo, darkMode = false }) => {
  const [jobs, setJobs] = useState<DispatchJob[]>(INITIAL_JOBS);
  const [savedJobs, setSavedJobs] = useState<DispatchJob[]>(INITIAL_JOBS);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggingMember, setDraggingMember] = useState<TeamMember | null>(null);
  const [draggingOverJob, setDraggingOverJob] = useState<string | null>(null);

  // 检查作业是否有修改（未保存）
  const hasJobChanged = (job: DispatchJob): boolean => {
    const saved = savedJobs.find(j => j.id === job.id);
    if (!saved) return false;
    return job.staffId !== saved.staffId || 
           job.staffName !== saved.staffName ||
           job.staffCode !== saved.staffCode;
  };

  // 检查是否有任何未保存的修改
  const hasUnsavedChanges = useMemo(() => {
    return jobs.some(job => hasJobChanged(job));
  }, [jobs, savedJobs]);

  // 监听修改状态变化，通知父组件
  useEffect(() => {
    onChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, onChanges]);

  // 刷新数据
  const handleRefresh = () => {
    setJobs([...savedJobs]);
  };

  // 保存草稿 - 更新保存状态为当前状态
  const handleSaveDraft = () => {
    setSavedJobs([...jobs]);
  };

  const allMembers = useMemo(() => {
    return TEAMS.flatMap(team => team.members);
  }, []);

  const filteredMembers = useMemo(() => {
    let members = allMembers;
    
    if (selectedTeam !== 'all') {
      members = members.filter(m => m.teamId === selectedTeam);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      members = members.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.code.toLowerCase().includes(query)
      );
    }
    
    return members;
  }, [allMembers, selectedTeam, searchQuery]);

  const assignMemberToJob = (jobId: string, member: TeamMember) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            staffId: member.id, 
            staffName: member.name, 
            staffCode: member.code 
          }
        : job
    ));
  };

  const removeMemberFromJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            staffId: undefined, 
            staffName: undefined, 
            staffCode: undefined 
          }
        : job
    ));
  };

  const handleDragStart = (member: TeamMember) => {
    setDraggingMember(member);
  };

  const handleDragEnd = () => {
    if (draggingMember && draggingOverJob) {
      assignMemberToJob(draggingOverJob, draggingMember);
    }
    setDraggingMember(null);
    setDraggingOverJob(null);
  };

  const handleDragOver = (e: React.DragEvent, jobId: string) => {
    e.preventDefault();
    setDraggingOverJob(jobId);
  };

  const handleDragLeave = () => {
    setDraggingOverJob(null);
  };

  const getJobIcon = (jobType: string) => {
    const Icon = JOB_ICONS[jobType as keyof typeof JOB_ICONS] || Train;
    return <Icon size={16} />;
  };

  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  const groupedJobs = useMemo(() => {
    const groups: Record<string, DispatchJob[]> = {};
    jobs.forEach(job => {
      if (!groups[job.jobType]) {
        groups[job.jobType] = [];
      }
      groups[job.jobType].push(job);
    });
    return groups;
  }, [jobs]);

  const jobTypeOrder = ['platform', 'ticket', 'exit', 'water'] as const;

  const handleCancel = () => {
    setJobs([...savedJobs]);
    onChanges(false);
    onClose();
  };

  const handleConfirm = () => {
    console.log('派班确认:', jobs);
    setSavedJobs([...jobs]);
    onChanges(false);
    onClose();
  };

  // 获取人员状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return darkMode ? '#30D158' : '#28A745';
      case 'busy':
        return darkMode ? '#FF9F0A' : '#FF9500';
      default:
        return darkMode ? '#8E8E93' : '#6B7280';
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>手动派班</span>
          <span style={{
            fontSize: '14px',
            fontWeight: 700,
            color: darkMode ? '#FF9500' : '#D97706',
            background: darkMode ? 'rgba(255, 149, 0, 0.15)' : 'rgba(217, 119, 6, 0.1)',
            padding: '2px 10px',
            borderRadius: '4px'
          }}>
            {trainNo}
          </span>
          {hasUnsavedChanges && (
            <span style={{
              fontSize: '11px',
              color: '#FF9500',
              background: darkMode ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              未保存
            </span>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={1000}
      zIndex={10000}
      getContainer={() => document.body}
      footer={[
        <Button 
          key="draft" 
          onClick={handleSaveDraft}
          style={{
            padding: '0 16px',
            fontSize: '13px',
            height: '36px',
            fontWeight: 500,
            borderRadius: '8px',
            background: darkMode ? '#2C2C2E' : '#FFFFFF',
            color: darkMode ? '#F5F5F7' : '#1D1D1F',
            border: `1px solid ${darkMode ? '#38383A' : '#D2D2D7'}`,
            boxShadow: 'none'
          }}
        >
          保存草稿
        </Button>,
        <Button 
          key="cancel" 
          onClick={handleCancel}
          style={{
            padding: '0 16px',
            fontSize: '13px',
            height: '36px',
            fontWeight: 500,
            borderRadius: '8px',
            background: darkMode ? '#2C2C2E' : '#FFFFFF',
            color: darkMode ? '#F5F5F7' : '#1D1D1F',
            border: `1px solid ${darkMode ? '#38383A' : '#D2D2D7'}`,
            boxShadow: 'none'
          }}
        >
          取消
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleConfirm}
          style={{
            padding: '0 20px',
            fontSize: '13px',
            height: '36px',
            fontWeight: 500,
            borderRadius: '8px',
            background: darkMode ? '#0A84FF' : '#007AFF',
            border: 'none',
            color: '#FFFFFF',
            boxShadow: 'none'
          }}
        >
          正式派班
        </Button>
      ]}
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)'
        },
        content: {
          background: darkMode ? MACOS_COLORS.bg.dark : MACOS_COLORS.bg.light,
          borderRadius: '10px',
          overflow: 'hidden'
        },
        header: {
          borderBottom: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
          padding: '16px 20px'
        },
        footer: {
          borderTop: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
          padding: '16px 20px'
        }
      }}
    >
      <div style={{
        display: 'flex',
        gap: '20px',
        height: 'calc(80vh - 140px)'
      }}>
        {/* 作业派班区域 */}
        <div style={{
          width: '360px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 4px'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light
            }}>作业派班</span>
            <Button
              type="text"
              icon={<RefreshCw size={14} />}
              onClick={handleRefresh}
              style={{ 
                color: darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light,
                height: '24px',
                fontSize: '12px'
              }}
            >
              刷新
            </Button>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {jobTypeOrder.map(jobType => {
              const typeJobs = groupedJobs[jobType];
              if (!typeJobs || typeJobs.length === 0) return null;
              
              const firstJob = typeJobs[0];
              
              return (
                <div key={jobType} style={{
                  borderRadius: '10px',
                  background: darkMode ? MACOS_COLORS.cardBg.dark : MACOS_COLORS.cardBg.light,
                  border: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '10px 14px',
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderBottom: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light }}>
                      {getJobIcon(jobType)}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light
                    }}>{firstJob.jobTypeName}</span>
                  </div>
                  <div>
                    {typeJobs.map(job => {
                      const isChanged = hasJobChanged(job);
                      const isDraggingOver = draggingOverJob === job.id;
                      return (
                        <div
                          key={job.id}
                          style={{
                            background: isChanged 
                              ? (darkMode ? 'rgba(255, 149, 0, 0.1)' : 'rgba(255, 149, 0, 0.05)') 
                              : isDraggingOver
                                ? (darkMode ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)')
                                : 'transparent',
                            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)'}`,
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} color={darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light} />
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light 
                                }}>{job.location}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} color={darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light} />
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light,
                                  fontFamily: 'SF Mono, SFMono-Regular, Consolas, monospace'
                                }}>
                                  {job.startTime !== '-' ? `${job.startTime}-${job.endTime}` : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              width: '85px',
                              height: '26px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px',
                              border: job.staffId
                                ? `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`
                                : `1.5px dashed ${isDraggingOver 
                                    ? '#0A84FF' 
                                    : (darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)')}`,
                              background: job.staffId 
                                ? (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)') 
                                : (isDraggingOver 
                                    ? (darkMode ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)')
                                    : 'transparent'),
                              flexShrink: 0,
                              transition: 'all 0.15s ease'
                            }}
                            onDragOver={(e) => handleDragOver(e, job.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDragEnd}
                          >
                            {job.staffId ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light,
                                  fontWeight: 500
                                }}>{job.staffName}</span>
                                <Button
                                  type="text"
                                  icon={<X size={10} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMemberFromJob(job.id);
                                  }}
                                  size="small"
                                  style={{ 
                                    padding: '0 2px', 
                                    color: darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light,
                                    height: '18px',
                                    minWidth: '18px'
                                  }}
                                />
                              </div>
                            ) : (
                              <span style={{ 
                                fontSize: '11px', 
                                color: isDraggingOver 
                                  ? '#0A84FF' 
                                  : (darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light)
                              }}>拖放派班</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 班组人员区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderLeft: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
          paddingLeft: '20px',
          minWidth: 0
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light,
              padding: '0 4px'
            }}>班组人员</span>
            <Input
              placeholder="搜索姓名或工号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search size={14} color={darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light} />}
              style={{
                height: '32px',
                borderRadius: '6px',
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
                color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light,
                fontSize: '16px',
                fontWeight: 600
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            <Button
              type={selectedTeam === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedTeam('all')}
              size="small"
              style={selectedTeam === 'all' ? {
                background: darkMode ? MACOS_COLORS.primary.dark : MACOS_COLORS.primary.light,
                borderColor: 'transparent',
                color: '#FFFFFF',
                height: '24px',
                fontSize: '12px',
                borderRadius: '4px'
              } : {
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light,
                border: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
                height: '24px',
                fontSize: '12px',
                borderRadius: '4px'
              }}
            >
              全部
            </Button>
            {TEAMS.map(team => (
              <Button
                key={team.id}
                type={selectedTeam === team.id ? 'primary' : 'default'}
                onClick={() => setSelectedTeam(team.id)}
                size="small"
                style={selectedTeam === team.id ? {
                  background: darkMode ? MACOS_COLORS.primary.dark : MACOS_COLORS.primary.light,
                  borderColor: 'transparent',
                  color: '#FFFFFF',
                  height: '24px',
                  fontSize: '12px',
                  borderRadius: '4px'
                } : {
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light,
                  border: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
                  height: '24px',
                  fontSize: '12px',
                  borderRadius: '4px'
                }}
              >
                {team.name}
              </Button>
            ))}
          </div>
          
          {/* 人员列表 - 按照图1布局 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '4px'
          }}>
            {filteredMembers.map(member => (
              <div
                key={member.id}
                style={{
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                  border: `1px solid ${darkMode ? MACOS_COLORS.border.dark : MACOS_COLORS.border.light}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'grab',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                draggable
                onDragStart={() => handleDragStart(member)}
                onDragEnd={handleDragEnd}
              >
                {/* 用户头像图标 */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: getStatusColor(member.status),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
                
                {/* 姓名 */}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: darkMode ? MACOS_COLORS.text.dark : MACOS_COLORS.text.light,
                  flex: 1
                }}>{member.name}</span>
                
                {/* 工号 */}
                <span style={{
                  fontSize: '13px',
                  color: darkMode ? MACOS_COLORS.textSecondary.dark : MACOS_COLORS.textSecondary.light,
                  fontFamily: 'SF Mono, SFMono-Regular, Consolas, monospace'
                }}>{member.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const OperationDetailDrawer: React.FC<OperationDetailDrawerProps> = ({
  visible,
  onClose,
  trainId,
  darkMode = false
}) => {
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const train = mockTrainSchedules.find(t => t.id === trainId);
  const operationGroups = train ? getOperationDetails(train) : [];

  // 将分组数据转换为表格数据
  const tableData = useMemo(() => {
    const data: Array<{
      key: string;
      jobType: string;
      workerName: string;
      location: string;
      taskContent: string;
      planTime: string;
      actualTime?: string;
      status: 'completed' | 'pending';
      rowSpan?: number;
    }> = [];

    operationGroups.forEach(group => {
      group.items.forEach((item, index) => {
        data.push({
          key: `${group.type}-${index}`,
          jobType: group.type,
          workerName: item.workerName,
          location: item.location,
          taskContent: item.taskContent,
          planTime: dayjs(item.planTime).format('HH:mm'),
          actualTime: item.actualTime ? dayjs(item.actualTime).format('HH:mm') : undefined,
          status: item.status === 'completed' ? 'completed' : 'pending',
          rowSpan: index === 0 ? group.items.length : 0
        });
      });
    });

    return data;
  }, [operationGroups]);

  // 判断实际时间是否异常（晚于计划时间）
  const isTimeAbnormal = (planTime: string, actualTime?: string) => {
    if (!actualTime) return false;
    const plan = dayjs(`2024-01-01 ${planTime}`);
    const actual = dayjs(`2024-01-01 ${actualTime}`);
    return actual.isAfter(plan);
  };

  // 处理未保存修改的关闭确认
  const handleUnsavedChanges = (callback: () => void) => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '未保存的修改',
        content: '您有未保存的修改，是否继续离开？',
        okText: '继续离开',
        cancelText: '取消',
        onOk: callback,
        okType: 'default',
        style: {
          background: darkMode ? '#1E293B' : '#FFFFFF',
          borderRadius: '12px',
          border: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)'
        },
        cancelButtonProps: {
          style: {
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF',
            color: darkMode ? '#E2E8F0' : '#1F2937'
          }
        },
        okButtonProps: {
          style: {
            background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
            color: '#EF4444'
          }
        }
      });
    } else {
      callback();
    }
  };

  const handleClose = () => {
    handleUnsavedChanges(onClose);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!visible) return null;

  // 样式函数 - 复用 OperationDrawer 的样式
  const getOverlayStyle = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    zIndex: 1001
  });

  const getContainerStyle = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '660px',
    background: darkMode ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
    zIndex: 1002,
    boxShadow: darkMode ? '-8px 0 24px rgba(0,0,0,0.4)' : '-8px 0 24px rgba(29,78,95,0.12)',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none'
  });

  const getHeaderStyle = (): React.CSSProperties => ({
    padding: '14px 20px',
    borderBottom: darkMode ? '1px solid rgba(42, 107, 124, 0.3)' : '1px solid rgba(29, 78, 95, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: darkMode ? 'rgba(13, 27, 42, 0.95)' : '#fff'
  });

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: '17px',
    fontWeight: 600,
    color: darkMode ? '#E2E8F0' : '#1F2937',
    letterSpacing: '0.5px'
  });

  const getTrainNoBadgeStyle = (): React.CSSProperties => ({
    background: darkMode
      ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
      : 'linear-gradient(135deg, #FEF7E6 0%, #FDECD0 50%, #FEF7E6 100%)',
    padding: '6px 20px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: darkMode ? '#FBBF24' : '#92400E',
    border: darkMode ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(217, 119, 6, 0.2)'
  });

  const getCloseButtonStyle = (): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    color: darkMode ? '#94A3B8' : '#64748B',
    background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#F5F3EF'
  });

  const getContentStyle = (): React.CSSProperties => ({
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    background: darkMode ? 'transparent' : '#FAF8F5'
  });

  // 表格列定义
  const columns = [
    {
      title: '作业类型',
      dataIndex: 'jobType',
      key: 'jobType',
      width: 120,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan
      }),
      render: (text: string) => (
        <span style={{
          fontSize: '13px',
          fontWeight: 500,
          color: darkMode ? '#E2E8F0' : '#1F2937'
        }}>{text}</span>
      )
    },
    {
      title: '姓名',
      dataIndex: 'workerName',
      key: 'workerName',
      width: 90,
      onCell: (record: any) => ({
        rowSpan: record.rowSpan
      }),
      render: (text: string) => (
        <span style={{
          fontSize: '13px',
          color: darkMode ? '#E2E8F0' : '#1F2937'
        }}>{text}</span>
      )
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color={darkMode ? '#64748B' : '#9CA3AF'} />
          <span style={{
            fontSize: '13px',
            color: darkMode ? '#E2E8F0' : '#1F2937'
          }}>{text}</span>
        </div>
      )
    },
    {
      title: '作业内容',
      dataIndex: 'taskContent',
      key: 'taskContent',
      width: 100,
      render: (text: string) => (
        <span style={{
          fontSize: '13px',
          color: darkMode ? '#E2E8F0' : '#1F2937'
        }}>{text}</span>
      )
    },
    {
      title: '计划时间',
      dataIndex: 'planTime',
      key: 'planTime',
      width: 90,
      align: 'center' as const,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Clock size={12} color={darkMode ? '#64748B' : '#9CA3AF'} />
          <span style={{
            fontSize: '13px',
            color: darkMode ? '#94A3B8' : '#6B7280'
          }}>{text}</span>
        </div>
      )
    },
    {
      title: '实际时间',
      dataIndex: 'actualTime',
      key: 'actualTime',
      width: 90,
      align: 'center' as const,
      render: (text: string, record: any) => {
        const isAbnormal = isTimeAbnormal(record.planTime, text);
        return (
          <span style={{
            fontSize: '13px',
            fontWeight: isAbnormal ? 600 : 400,
            color: isAbnormal ? '#EF4444' : (darkMode ? '#E2E8F0' : '#1F2937')
          }}>{text || '-'}</span>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: 'completed' | 'pending') => (
        <Tag
          style={{
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            background: status === 'completed'
              ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7')
              : (darkMode ? 'rgba(148, 163, 184, 0.15)' : '#F3F4F6'),
            color: status === 'completed' ? '#10B981' : (darkMode ? '#94A3B8' : '#6B7280')
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {status === 'completed' ? (
              <>
                <CheckCircle2 size={12} />
                <span>已完成</span>
              </>
            ) : (
              <>
                <Circle size={12} />
                <span>未开始</span>
              </>
            )}
          </span>
        </Tag>
      )
    }
  ];

  return (
    <>
      {/* 遮罩层 */}
      <div style={getOverlayStyle()} onClick={handleOverlayClick} />

      {/* 抽屉容器 */}
      <div style={getContainerStyle()}>
        {/* 头部 */}
        <div style={getHeaderStyle()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={getTitleStyle()}>作业监控</div>
            {hasUnsavedChanges && (
              <span style={{
                background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                color: '#EF4444',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600
              }}>未保存</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={getTrainNoBadgeStyle()}>{train?.trainNo || '-'}</div>
            <Button
              type="primary"
              icon={<Users size={16} />}
              onClick={() => setDispatchModalVisible(true)}
              style={{
                height: '36px',
                padding: '0 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                background: darkMode ? '#0A84FF' : '#007AFF',
                border: 'none',
                color: '#FFFFFF',
                boxShadow: 'none'
              }}
            >
              作业派班
            </Button>
            <Button
              icon={<FileText size={16} />}
              onClick={() => console.log('点击备注按钮')}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                background: darkMode ? '#2C2C2E' : '#FFFFFF',
                color: darkMode ? '#F5F5F7' : '#1D1D1F',
                border: `1px solid ${darkMode ? '#38383A' : '#D2D2D7'}`,
                boxShadow: 'none'
              }}
            >
              备注
            </Button>
            <Button
              type="primary"
              icon={<CheckCircle2 size={16} />}
              onClick={() => console.log('点击作业完成按钮')}
              style={{
                height: '36px',
                padding: '0 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                background: darkMode ? '#0A84FF' : '#007AFF',
                border: 'none',
                color: '#FFFFFF',
                boxShadow: 'none'
              }}
            >
              作业完成
            </Button>
            <Button
              type="text"
              icon={<X size={20} />}
              onClick={handleClose}
              style={getCloseButtonStyle()}
            />
          </div>
        </div>

        {/* 内容区 */}
        <div style={getContentStyle()}>


          {/* 作业监控表格 */}
          <div style={{
            background: darkMode ? 'rgba(42, 107, 124, 0.15)' : '#FFFFFF',
            borderRadius: '10px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.35)' : '1px solid rgba(29, 78, 95, 0.08)',
            boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(29, 78, 95, 0.06)',
            overflow: 'hidden'
          }}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="small"
              bordered={false}
              rowClassName={() => darkMode ? 'dark-row' : 'light-row'}
              style={{
                '--ant-table-header-bg': darkMode ? 'rgba(42, 107, 124, 0.2)' : '#F8FAFC',
                '--ant-table-header-color': darkMode ? '#94A3B8' : '#64748B'
              } as React.CSSProperties}
            />
          </div>

          {/* 底部备注 */}
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: darkMode ? 'rgba(42, 107, 124, 0.1)' : '#F8FAFC',
            borderRadius: '8px',
            border: darkMode ? '1px solid rgba(42, 107, 124, 0.2)' : '1px solid rgba(29, 78, 95, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={14} color={darkMode ? '#64748B' : '#9CA3AF'} />
            <span style={{
              fontSize: '12px',
              color: darkMode ? '#94A3B8' : '#6B7280'
            }}>备注：无</span>
          </div>
        </div>
      </div>

      {/* 作业派班弹窗 */}
      <DispatchModal
        visible={dispatchModalVisible}
        onClose={() => setDispatchModalVisible(false)}
        onChanges={(hasChanges) => setHasUnsavedChanges(hasChanges)}
        trainNo={train?.trainNo || '-'}
        darkMode={darkMode}
      />
    </>
  );
};

export default OperationDetailDrawer;
