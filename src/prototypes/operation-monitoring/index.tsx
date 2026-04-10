/**
 * @name 作业盯控
 * 
 * 参考资料：
 * - /assets/docs/设计指导（简约）.md
 * - /src/themes/trae-design/designToken.json
 */

import './style.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Checkbox, Modal, Input, Tooltip, message, Popover, Select, Badge, List, Tag } from 'antd';
import { 
  SettingOutlined, CheckCircleOutlined, FormOutlined
} from '@ant-design/icons';
import { 
  ArrowUp, ArrowDown, Droplet, Biohazard,
  Package, Utensils, BedDouble, RotateCcw, Users, Crown, Bell, Volume2, VolumeX
} from 'lucide-react';
import { getMockData, OperationUnit, Task } from './mock-data';

const { TextArea } = Input;
const { Option } = Select;

const Component: React.FC = () => {
  const [data, setData] = useState<OperationUnit[]>(getMockData());
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<OperationUnit | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrentDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}年${mm}月${dd}日`;
  };

  const formatCurrentTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedStaffNames, setSelectedStaffNames] = useState<string[]>([]);

  const [visibleLocations, setVisibleLocations] = useState<string[]>(['track', 'platform']);
  const [visibleTags, setVisibleTags] = useState<string[]>(['parcel', 'meal', 'overnight', 'turnaround', 'overcrowd', 'special']);
  
  const [arrivalFlowConfig, setArrivalFlowConfig] = useState<string[]>(['alight', 'transfer']);
  const [departureFlowConfig, setDepartureFlowConfig] = useState<string[]>(['board']);

  const [exitOperationConfig, setExitOperationConfig] = useState<string[]>(['task', 'exitGate']);
  const [checkinOperationConfig, setCheckinOperationConfig] = useState<string[]>(['task', 'ticketGate']);
  
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const [abnormalMessages, setAbnormalMessages] = useState<any[]>([]);
  const [messagePopoverOpen, setMessagePopoverOpen] = useState(false);

  const [expandedContent, setExpandedContent] = useState<'job' | 'train'>('job');
  const [expandedTrain, setExpandedTrain] = useState<any>(null);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    if (timeStr.includes(' ')) {
        timeStr = timeStr.split(' ')[1];
    }
    return timeStr.length > 5 ? timeStr.substring(0, 5) : timeStr;
  };

  const parseDateTime = (timeStr: string) => {
    if (!timeStr) return new Date();
    if (timeStr.includes(' ')) return new Date(timeStr.replace(/-/g, '/'));
    return new Date(`2000/01/01 ${timeStr}`);
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const timeA = a.arrivalTrain?.planArrTime || a.departureTrain?.planDepTime || '00:00';
      const timeB = b.arrivalTrain?.planArrTime || b.departureTrain?.planDepTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [data]);

  useEffect(() => {
    const msgs: any[] = [];
    sortedData.forEach(unit => {
      const abnormalTasks = unit.tasks.filter(t => t.status === 'abnormal' || t.status === 'late' || t.status === 'missing');
      if (abnormalTasks.length > 0) {
        const trainCode = unit.arrivalTrain?.code || unit.departureTrain?.code || 'Unknown';
        const taskNames = abnormalTasks.map(t => t.name).join('、');
        msgs.push({
          id: unit.id,
          trainNo: trainCode,
          time: formatCurrentTime(new Date()),
          content: `${trainCode} ${taskNames} 作业超时/异常`
        });
      }
    });
    setAbnormalMessages(msgs);
  }, [data]);

  const handleCompleteAll = (recordId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newData = data.map(item => {
        if (item.id === recordId) {
            const newTasks = item.tasks.map(task => ({
                ...task,
                status: 'completed' as any,
                presentStaffCount: task.requiredStaffCount,
                staff: task.staff.map(s => ({
                    ...s,
                    workItems: s.workItems.map(wi => ({
                        ...wi,
                        status: 'completed' as any,
                        actualTime: wi.actualTime || timeStr
                    }))
                }))
            }));
            return { ...item, tasks: newTasks };
        }
        return item;
    });
    setData(newData);
    message.success('该车次所有作业已完成');
  };

  const handleRowExpand = (recordId: string) => {
    const newExpandedRowKeys = expandedRowKeys.includes(recordId)
      ? []
      : [recordId];
    setExpandedRowKeys(newExpandedRowKeys);
  };

  const handleContentSwitch = (recordId: string, type: 'job' | 'train', trainData?: any) => {
    const isSameRow = expandedRowKeys.includes(recordId);
    const isSameType = expandedContent === type;

    if (isSameRow && isSameType) {
        setExpandedRowKeys([]);
    } else {
        setExpandedRowKeys([recordId]);
        setExpandedContent(type);
        if (trainData) {
            setExpandedTrain(trainData);
        }
        setSelectedRowId(recordId);
    }
  };

  const handleAbnormalMessageClick = (msg: any) => {
      setSelectedRowId(msg.id);
      setExpandedRowKeys([msg.id]);
      setExpandedContent('job');
      setMessagePopoverOpen(false);

      setTimeout(() => {
          const rowElement = document.querySelector(`[data-row-key="${msg.id}"]`);
          if (rowElement) {
              rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 100);
  };

  const TrainInfoPanel = ({ train }: { train: any }) => {
      if (!train) return <div className="p-4 text-center text-gray-400">暂无车次信息</div>;

      return (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-gray-700 m-0 text-lg flex items-center gap-2">
                      <div className="train-no-pill train-default px-2 py-0.5 text-base">{train.code}</div>
                      <span>{train.startStation} - {train.endStation} 途径信息</span>
                   </h3>
                   
                   {train.conductors && train.conductors.length > 0 && (
                      <div className="flex gap-6 bg-white px-6 py-4 rounded border border-gray-200 shadow-sm">
                          {train.conductors.map((c: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3">
                                  <span className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                      <Users size={24} />
                                  </span>
                                  <div className="flex flex-col gap-1">
                                      <span className="font-bold text-gray-700 text-lg">{c.name}</span>
                                      <span className="text-gray-500 font-mono text-lg">{c.phone}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                   )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 overflow-x-auto">
                  <div className="flex items-start min-w-max pb-4">
                      {train.routeStations && train.routeStations.map((station: any, idx: number) => {
                          const isDelay = (station.delayMinutes || 0) > 0;
                          const isStop = station.stopType === 'stop';
                          const isFirst = idx === 0;
                          const isLast = idx === train.routeStations.length - 1;
                          
                          return (
                              <div key={idx} className="flex flex-col items-center relative group" style={{ minWidth: '160px' }}>
                                  {!isFirst && (
                                      <div className="absolute top-[13px] right-1/2 w-1/2 h-1.5 bg-gray-300 z-0" />
                                  )}
                                  {!isLast && (
                                      <div className="absolute top-[13px] left-1/2 w-1/2 h-1.5 bg-gray-300 z-0" />
                                  )}

                                  <div className={`
                                      relative z-10 box-border transition-all duration-300
                                      ${isStop 
                                          ? 'w-8 h-8 rounded-full border-[6px] border-blue-500 bg-white shadow-sm' 
                                          : 'w-4 h-4 rounded-full border-2 border-gray-400 bg-white mt-2'}
                                      ${isDelay ? 'border-red-500' : ''}
                                  `}>
                                  </div>

                                  <div className="mt-4 flex flex-col items-center text-center gap-2">
                                      <div className="font-bold text-gray-700 text-xl">{station.name}</div>
                                      
                                      <div className="flex flex-col gap-1 text-lg font-mono text-gray-500">
                                          {station.arriveTime && (
                                              <div className="flex items-center gap-1">
                                                  {isStop && <span className="scale-90 opacity-75 text-sm">到</span>}
                                                  <span className={isDelay ? 'text-red-500 font-bold' : ''}>{station.arriveTime}</span>
                                                  {isDelay && <span className="text-sm text-red-500 font-bold">+{station.delayMinutes}</span>}
                                              </div>
                                          )}
                                          
                                          {isStop && station.departTime && (
                                              <div className="flex items-center gap-1">
                                                  <span className="scale-90 opacity-75 text-sm">发</span>
                                                  <span className={isDelay ? 'text-red-500 font-bold' : ''}>{station.departTime}</span>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      {(!train.routeStations || train.routeStations.length === 0) && (
                          <div className="w-full text-center text-gray-400 py-8">暂无途径信息</div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const OperationDetailPanel = ({ record }: { record: OperationUnit }) => {
      if (expandedContent === 'train') {
          return <TrainInfoPanel train={expandedTrain} />;
      }

      const tableRows: any[] = [];
      const trainCode = record.arrivalTrain?.code || record.departureTrain?.code || '';
      
      record.tasks.forEach(task => {
        task.staff.forEach(staff => {
            const workItems = staff.workItems || [];
            if (workItems.length === 0) {
                 tableRows.push({
                     taskId: task.id,
                     taskName: task.name,
                     taskRowSpan: 1,
                     staffId: staff.id,
                     staffName: staff.name,
                     staffRowSpan: 1,
                     item: null,
                     isFirstOfTask: false,
                     isFirstOfStaff: true
                 });
            } else {
                workItems.forEach((item, index) => {
                    tableRows.push({
                        taskId: task.id,
                        taskName: task.name,
                        taskRowSpan: 0,
                        staffId: staff.id,
                        staffName: staff.name,
                        staffRowSpan: index === 0 ? workItems.length : 0,
                        item: item,
                        isFirstOfTask: false,
                        isFirstOfStaff: index === 0
                    });
                });
            }
        });
    });

    let currentTaskId: string | null = null;
    let currentTaskStartIndex = 0;
    
    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        if (row.taskId !== currentTaskId) {
            if (currentTaskId !== null) {
                tableRows[currentTaskStartIndex].taskRowSpan = i - currentTaskStartIndex;
            }
            currentTaskId = row.taskId;
            currentTaskStartIndex = i;
            row.isFirstOfTask = true;
        } else {
            row.isFirstOfTask = false;
            row.taskRowSpan = 0;
        }
    }
    if (currentTaskId !== null) {
        tableRows[currentTaskStartIndex].taskRowSpan = tableRows.length - currentTaskStartIndex;
    }

    const isTimeLate = (plan: string, actual?: string) => {
        if (!actual) return false;
        
        const planTime = parseDateTime(plan);
        const actualTime = parseDateTime(actual);
        
        return actualTime > planTime;
    };

    const isCrossDay = (plan: string, actual?: string) => {
        if (!actual) return false;

        if (!actual.includes(' ')) {
             const planStr = plan.includes(' ') ? plan.split(' ')[1].substring(0, 5) : plan;
             const actualStr = actual;
             
             const [pH, pM] = planStr.split(':').map(Number);
             const [aH, aM] = actualStr.split(':').map(Number);
             
             const isTarget = (pH === 23 && pM >= 30) || (pH < 3);
             return isTarget && pH >= 18 && aH < 6;
        }

        const planTime = parseDateTime(plan);
        const actualTime = parseDateTime(actual);
        
        return planTime.getDate() !== actualTime.getDate();
    };

    const isTimeout = (plan: string, actual?: string) => {
        if (actual) return false;
        if (!plan) return false;
        
        const now = new Date();
        let planTime = parseDateTime(plan);
        
        if (!plan.includes(' ')) {
            const [h, m] = plan.split(':').map(Number);
            planTime = new Date();
            planTime.setHours(h, m, 0, 0);
            
            if (now.getHours() < 6 && h >= 18) {
                planTime.setDate(planTime.getDate() - 1);
            } else if (now.getHours() >= 18 && h < 6) {
                planTime.setDate(planTime.getDate() + 1);
            }
        }
        
        return now > planTime;
    };

    return (
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 m-0">
                <Users size={20} />
                {(() => {
                    const type = record.type;
                    const arrivalCode = record.arrivalTrain?.code;
                    const departureCode = record.departureTrain?.code;

                    if (type === 'connected') {
                        return (
                            <div className="flex items-center gap-2">
                                <Tag color="blue" className="text-xl px-2 py-0.5 m-0 font-bold">{arrivalCode}</Tag>
                                <span className="text-gray-400 font-normal text-lg">-</span>
                                <Tag color="gold" className="text-xl px-2 py-0.5 m-0 font-bold">{departureCode}</Tag>
                                <span>作业详情监控</span>
                            </div>
                        );
                    } else if (type === 'through') {
                         return (
                             <div className="flex items-center gap-2">
                                 <Tag color="gold" className="text-xl px-2 py-0.5 m-0 font-bold">{departureCode}</Tag>
                                 <span>作业详情监控</span>
                             </div>
                         );
                    } else if (type === 'origin') {
                         return (
                             <div className="flex items-center gap-2">
                                 <Tag color="gold" className="text-xl px-2 py-0.5 m-0 font-bold">{departureCode}</Tag>
                                 <span>作业详情监控</span>
                             </div>
                         );
                    } else if (type === 'terminating') {
                         return (
                             <div className="flex items-center gap-2">
                                 <Tag color="blue" className="text-xl px-2 py-0.5 m-0 font-bold">{arrivalCode}</Tag>
                                 <span>作业详情监控</span>
                             </div>
                         );
                    }
                    
                    return <span>{trainCode} 作业详情监控</span>;
                })()}
            </h3>
            <div className="flex gap-2">
                <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />} 
                    onClick={() => handleCompleteAll(record.id)}
                    size="small"
                >
                    完成作业
                </Button>
                <Button 
                    icon={<FormOutlined />} 
                    onClick={() => handleOpenRemark(record)}
                    size="small"
                >
                    备注
                </Button>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                        <th className="p-3 border-r border-gray-100 text-center whitespace-nowrap">作业类型</th>
                        <th className="p-3 border-r border-gray-100 text-center whitespace-nowrap">姓名</th>
                        <th className="p-3 border-r border-gray-100 text-center whitespace-nowrap">位置</th>
                        <th className="p-3 border-r border-gray-100 text-left">作业内容</th>
                        <th className="p-3 border-r border-gray-100 text-center whitespace-nowrap">计划时间</th>
                        <th className="p-3 border-r border-gray-100 text-center whitespace-nowrap">实际时间</th>
                        <th className="p-3 text-center whitespace-nowrap">状态</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows.map((row, idx) => {
                        const item = row.item;
                        const isLate = item ? isTimeLate(item.planTime, item.actualTime) : false;
                        const timeout = item ? isTimeout(item.planTime, item.actualTime) : false;
                        const crossDay = item ? isCrossDay(item.planTime, item.actualTime) : false;
                        const isRedTime = item ? (isLate || item.status === 'late' || item.status === 'abnormal') : false;

                        return (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                {row.isFirstOfTask && (
                                    <td className="p-3 border-r border-gray-100 font-bold text-gray-700 text-center bg-gray-50/30 align-middle whitespace-nowrap" rowSpan={row.taskRowSpan}>
                                        {row.taskName}
                                    </td>
                                )}
                                {row.isFirstOfStaff && (
                                    <td className="p-3 border-r border-gray-100 font-medium text-gray-600 text-center align-middle whitespace-nowrap" rowSpan={row.staffRowSpan}>
                                        {row.staffName}
                                    </td>
                                )}
                                <td className="p-3 border-r border-gray-100 text-gray-600 text-center whitespace-nowrap">
                                    {item?.location || '-'}
                                </td>
                                <td className="p-3 border-r border-gray-100 text-gray-700 font-medium">
                                    {item?.content || '-'}
                                </td>
                                <td className="p-3 border-r border-gray-100 text-center text-gray-500 font-medium whitespace-nowrap">
                                    {formatTime(item?.planTime) || '-'}
                                </td>
                                <td className="p-3 border-r border-gray-100 text-center whitespace-nowrap">
                                    {item?.actualTime ? (
                                        <div className="relative inline-block">
                                            <span className={`${isRedTime ? 'text-red-500' : 'text-green-600'} font-bold`}>
                                                {formatTime(item.actualTime)}
                                            </span>
                                            {crossDay && (
                                                <sup className="text-gray-400 text-xs ml-0.5 font-normal">
                                                    +1
                                                </sup>
                                            )}
                                        </div>
                                    ) : (
                                        <span className={timeout ? "text-red-400 font-medium" : "text-gray-300"}>
                                            {timeout ? '未打卡' : '-'}
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-sm inline-block ${
                                        item?.status === 'completed' ? 'bg-[#f6ffed] text-[#389e0d] border border-[#b7eb8f]' :
                                        (item?.status === 'late' || timeout) ? 'bg-[#fff1f0] text-[#cf1322] border border-[#ffccc7]' :
                                        item?.status === 'abnormal' ? 'bg-[#fff2e8] text-[#d4380d] border border-[#ffbb96]' :
                                        'bg-gray-50 text-gray-400 border border-gray-200'
                                    }`}>
                                        {item?.status === 'completed' ? '已完成' :
                                         timeout ? '超时未打卡' :
                                         item?.status === 'late' ? '已超时' :
                                         item?.status === 'abnormal' ? '异常' : '未开始'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {tableRows.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-400">暂无详细作业信息</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        {record.remarks && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-gray-700 flex items-start gap-2">
                <FormOutlined className="mt-1 text-yellow-600" />
                <div>
                    <span className="font-bold mr-2">备注:</span>
                    {record.remarks}
                </div>
            </div>
        )}
      </div>
    );
  };

  const handleOpenRemark = (record: OperationUnit) => {
    setCurrentUnit(record);
    setRemarkText(record.remarks || '');
    setRemarkModalVisible(true);
  };

  const handleSaveRemark = () => {
    if (currentUnit) {
      const newData = data.map(item => 
        item.id === currentUnit.id ? { ...item, remarks: remarkText } : item
      );
      setData(newData);
      message.success('备注已保存');
    }
    setRemarkModalVisible(false);
  };

  const handleOpenAssign = (task: Task) => {
    setCurrentTask(task);
    setSelectedStaffNames(task.staff.map(s => s.name));
    setAssignModalVisible(true);
  };

  const handleAssignOk = () => {
    const newData = data.map(unit => {
      const taskIndex = unit.tasks.findIndex(t => t.id === currentTask?.id);
      if (taskIndex > -1) {
        const updatedTask = { ...unit.tasks[taskIndex] };
        updatedTask.staff = selectedStaffNames.map(name => ({
           id: `staff-${Math.random()}`,
           name: name,
           role: '派班员',
           phone: '139...'
        }));
        updatedTask.presentStaffCount = updatedTask.staff.length;
        
        if (updatedTask.presentStaffCount >= updatedTask.requiredStaffCount) {
             if (updatedTask.status === 'missing') updatedTask.status = 'normal';
        } else {
             updatedTask.status = 'missing';
        }
        
        const newTasks = [...unit.tasks];
        newTasks[taskIndex] = updatedTask;
        return { ...unit, tasks: newTasks };
      }
      return unit;
    });
    
    setData(newData);
    message.success('派班成功');
    setAssignModalVisible(false);
  };

  const renderConductors = (record: OperationUnit, side: 'arr' | 'dep') => {
    const train = side === 'arr' ? record.arrivalTrain : record.departureTrain;
    if (!train || !train.conductors || train.conductors.length === 0) return <span className="text-gray-300">--</span>;

    return (
      <div className="flex flex-col items-center gap-0.5">
        {train.conductors.map((c, idx) => (
          <div key={idx} className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-700">{c.name}</span>
            <span className="text-[10px] text-gray-400 font-mono">{c.phone}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTrainCode = (record: OperationUnit, side: 'arr' | 'dep') => {
    let train = side === 'arr' ? record.arrivalTrain : record.departureTrain;
    if (!train) return null;
    
    let trainClass = 'train-default';

    if (train.runType === 'origin') {
        trainClass = 'train-cyan';
    } else if (train.runType === 'through') {
        trainClass = 'train-purple';
    } else if (train.runType === 'terminating') {
        trainClass = 'train-yellow';
    }

    const stationName = side === 'arr' ? train.startStation : train.endStation;

    return (
      <div 
        className="flex flex-col items-center w-full cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => {
            e.stopPropagation();
            handleContentSwitch(record.id, 'train', train);
        }}
      >
        <div className={`train-no-pill ${trainClass} flex items-center justify-center gap-1`}>
            <span>{train.code}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
            <span className="text-lg font-bold text-gray-500">
            {stationName}
            </span>
        </div>
      </div>
    );
  };

  const ColorLegend = () => (
    <div className="flex items-center gap-3 mr-4 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#e6fffb] to-[#b5f5ec] border border-[#5cdbd3]"></div>
            <span className="text-xs text-gray-600">始发</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#f9f0ff] to-[#efdbff] border border-[#b37feb]"></div>
            <span className="text-xs text-gray-600">途径</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#fffbe6] to-[#ffe58f] border border-[#ffc53d]"></div>
            <span className="text-xs text-gray-600">终到</span>
        </div>
    </div>
  );

  const renderTime = (plan?: string, actual?: string) => {
    if (!plan) return <span className="text-gray-300">--</span>;
    
    const effectiveActual = actual || plan;

    const planDate = parseDateTime(plan);
    let actualDate = parseDateTime(effectiveActual);
    
    if (!plan.includes(' ') && !effectiveActual.includes(' ')) {
        const planHour = planDate.getHours();
        const actualHour = actualDate.getHours();
        if (actualHour < planHour - 12) {
            actualDate.setDate(actualDate.getDate() + 1);
        }
    }

    const diffMinutes = (actualDate.getTime() - planDate.getTime()) / (1000 * 60);
    const isLate = diffMinutes > 0;
    const showActual = diffMinutes !== 0;

    const planRow = (
        <div className={`flex items-center gap-1 ${showActual ? 'mb-1' : ''}`}>
            <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] scale-90 shrink-0">图</span>
            <span className="text-lg text-gray-500 font-sans leading-none">{formatTime(plan)}</span>
        </div>
    );

    if (!showActual) {
        return (
            <div className="flex flex-col items-start justify-center py-1">
              {planRow}
            </div>
        );
    }

    const colorClass = isLate ? 'text-[#ff4d4f]' : 'text-[#52c41a]';
    const bgClass = isLate ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600';

    const actualRow = (
        <div className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded-full ${bgClass} flex items-center justify-center text-[10px] scale-90 shrink-0`}>实</span>
            <span className={`text-lg font-bold ${colorClass} font-sans leading-none`}>{formatTime(effectiveActual)}</span>
            {diffMinutes !== 0 && <span className={`text-xs font-bold ${colorClass} ml-1`}>{diffMinutes > 0 ? `+${Math.round(diffMinutes)}` : Math.round(diffMinutes)}</span>}
        </div>
    );

    return (
      <div className="flex flex-col items-start justify-center py-1">
        {planRow}
        {actualRow}
      </div>
    );
  };

  const renderPassengerFlow = (type: 'arr' | 'dep', record: OperationUnit) => {
    const train = type === 'arr' ? record.arrivalTrain : record.departureTrain;
    if (!train) return null;
    
    if (type === 'arr') {
      const showAlight = arrivalFlowConfig.includes('alight');
      const showTransfer = arrivalFlowConfig.includes('transfer');

      const alightVal = train.alightCount !== undefined ? train.alightCount : null;
      const transferVal = train.transferCount !== undefined ? train.transferCount : null;
      
      if ((!showAlight || alightVal === null) && (!showTransfer || transferVal === null)) return null;

      return (
        <div className="flex flex-col gap-1 whitespace-nowrap items-start pl-2">
          {showAlight && alightVal !== null && (
            <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] scale-90 shrink-0">下</span>
                <span className="text-lg text-orange-600 font-medium font-sans">{alightVal}</span>
            </div>
          )}
          {showTransfer && transferVal !== null && (
            <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] scale-90 shrink-0">换</span>
                <span className="text-lg text-blue-600 font-medium font-sans">{transferVal}</span>
            </div>
          )}
        </div>
      );
    } else {
      const showBoard = departureFlowConfig.includes('board');
      const showTransfer = departureFlowConfig.includes('transfer');

      const boardVal = train.boardCount !== undefined ? train.boardCount : null;
      const transferVal = train.transferCount !== undefined ? train.transferCount : null;

      if ((!showBoard || boardVal === null) && (!showTransfer || transferVal === null)) return null;

      return (
        <div className="flex flex-col gap-1 whitespace-nowrap items-start pl-2">
          {showBoard && boardVal !== null && (
            <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] scale-90 shrink-0">上</span>
                <span className="text-lg text-green-600 font-medium font-sans">{boardVal}</span>
            </div>
          )}
          {showTransfer && transferVal !== null && (
            <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] scale-90 shrink-0">换</span>
                <span className="text-lg text-blue-600 font-medium font-sans">{transferVal}</span>
            </div>
          )}
        </div>
      );
    }
  };

  const renderLocation = (record: OperationUnit) => {
    const isTrackChange = record.track && record.track.includes('→');
    const isPlatformChange = record.platform && record.platform.includes('→');

    const trackLabelClass = isTrackChange 
        ? 'bg-[#ff4d4f] text-white border-[#ff4d4f]' 
        : 'bg-blue-50 text-blue-500 border-blue-100';
        
    const trackValueClass = isTrackChange 
        ? 'bg-[#ff4d4f] text-white px-1.5 py-0.5 rounded shadow-sm' 
        : 'text-gray-700';

    const platformLabelClass = isPlatformChange 
        ? 'bg-[#ff4d4f] text-white border-[#ff4d4f]' 
        : 'bg-cyan-50 text-cyan-500 border-cyan-100';
        
    const platformValueClass = isPlatformChange 
        ? 'bg-[#ff4d4f] text-white px-1.5 py-0.5 rounded shadow-sm' 
        : 'text-[#1890ff]';

    return (
      <div className="flex justify-center w-full py-1">
        <div className="inline-flex flex-col gap-2 items-start min-w-[80px]">
           {visibleLocations.includes('track') && (
               <div className="flex items-center gap-2">
                   <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border shrink-0 ${trackLabelClass}`}>股</span>
                   <span className={`text-lg font-bold font-sans ${trackValueClass}`}>{record.track || ''}</span>
               </div>
           )}
           
           {visibleLocations.includes('platform') && (
                <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border shrink-0 ${platformLabelClass}`}>站</span>
                    <span className={`text-lg font-bold font-sans ${platformValueClass}`}>{record.platform || ''}</span>
                </div>
           )}
        </div>
      </div>
    );
  };

  const renderTaskWithGate = (taskType: string, record: OperationUnit, showGate: boolean, gateType: 'ticket' | 'exit') => {
    const task = record.tasks.find(t => t.type === taskType);
    if (!task) return null;

    const gateInfo = gateType === 'ticket' ? record.departureTrain?.ticketGate : record.arrivalTrain?.exitGate;

    const taskEl = (() => {
        if (task.status === 'na') {
            return null;
        }

        let bgClass = 'bg-gray-100';
        let textClass = 'text-gray-500';
        let statusLabel = '作业未开始';

        switch (task.status) {
        case 'processing':
            bgClass = 'bg-blue-50 border-blue-200';
            textClass = 'text-blue-600';
            statusLabel = '正在作业';
            break;
        case 'completed':
            bgClass = 'bg-[#f6ffed] border-[#b7eb8f]';
            textClass = 'text-[#389e0d]';
            statusLabel = '作业完成';
            break;
        case 'abnormal':
        case 'late':
        case 'missing':
            bgClass = 'bg-[#fff1f0] border-[#ffccc7]';
            textClass = 'text-[#cf1322]';
            statusLabel = task.status === 'missing' ? '超时未打卡' : '作业异常';
            break;
        case 'pending':
        default:
            bgClass = 'bg-gray-50 border-gray-200';
            textClass = 'text-gray-400';
            statusLabel = '作业未开始';
            break;
        }

        return (
         <Tooltip title={
            <div className="flex flex-col gap-1">
                <div>作业状态: {statusLabel}</div>
                <div>计划时间: {task.planTime}</div>
                {task.actualTime && <div>实际时间: {task.actualTime}</div>}
                <div>人员情况: 应到{task.requiredStaffCount}人 / 实到{task.presentStaffCount}人</div>
            </div>
         }>
          <div 
            className={`flex items-center justify-center px-2 py-1 rounded border ${bgClass} cursor-pointer w-full`}
            onClick={(e) => {
                e.stopPropagation();
                handleContentSwitch(record.id, 'job');
            }}
          >
             <span className={`text-sm font-bold ${textClass}`}>{task.presentStaffCount}/{task.requiredStaffCount}</span>
          </div>
         </Tooltip>
        );
    })();

    const additionalInfo = [];

    if (showGate && gateInfo) {
        additionalInfo.push(
            <div key="gate" className="flex items-center gap-1 justify-center mt-1">
                <span className="font-bold text-gray-600">{gateInfo}</span>
            </div>
        );
    }

    if (taskType === 'water_sewage') {
        if (task.waterType === 'water_only') {
             additionalInfo.push(
                <Tooltip key="water" title="仅上水">
                    <Droplet size={16} className="text-[#1890ff] fill-current mt-1" />
                </Tooltip>
             );
        } else if (task.waterType === 'sewage_only') {
             additionalInfo.push(
                <Tooltip key="sewage" title="仅吸污">
                    <Biohazard size={16} className="text-amber-700 mt-1" />
                </Tooltip>
             );
        } else if (task.waterType === 'both') {
             additionalInfo.push(
                <div key="both" className="flex items-center gap-1 mt-1">
                    <Tooltip title="上水">
                        <Droplet size={16} className="text-[#1890ff] fill-current" />
                    </Tooltip>
                    <Tooltip title="吸污">
                        <Biohazard size={16} className="text-amber-700" />
                    </Tooltip>
                </div>
             );
        }
    }
    
    if (taskType === 'platform' && record.platformTags && record.platformTags.length > 0) {
        const tagsToRender = record.platformTags.filter(tag => visibleTags.includes(tag));
        if (tagsToRender.length > 0) {
             additionalInfo.push(
                 <div key="tags" className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                     {tagsToRender.map(tag => {
                         let icon = null;
                         let colorClass = "";
                         let title = "";
                         switch(tag) {
                             case 'parcel': icon = <Package size={14} />; colorClass = "text-amber-700"; title = "行包"; break;
                             case 'meal': icon = <Utensils size={14} />; colorClass = "text-orange-500"; title = "送餐"; break;
                             case 'overnight': icon = <BedDouble size={14} />; colorClass = "text-indigo-500"; title = "过夜"; break;
                             case 'turnaround': icon = <RotateCcw size={14} />; colorClass = "text-green-500"; title = "折返"; break;
                             case 'overcrowd': icon = <Users size={14} />; colorClass = "text-red-500"; title = "超员"; break;
                             case 'special': icon = <Crown size={14} />; colorClass = "text-yellow-500"; title = "专运"; break;
                         }
                         if (!icon) return null;
                         return (
                             <Tooltip key={tag} title={title}>
                                 <span className={colorClass}>{icon}</span>
                             </Tooltip>
                         );
                     })}
                 </div>
             );
        }
    }

    return (
        <div className="flex flex-col gap-0 w-full items-center justify-center">
            {taskEl}
            {additionalInfo}
        </div>
    );
  };
  
  const renderTask = (taskType: string, record: OperationUnit) => {
      return renderTaskWithGate(taskType, record, false, 'ticket');
  };

  const ArrivalFlowHeader = () => (
    <div className="flex items-center justify-center gap-1 cursor-pointer">
      <span>到站客流</span>
      <Popover 
        trigger="click"
        content={
            <Checkbox.Group 
                options={[
                    { label: '下车', value: 'alight', disabled: true },
                    { label: '换乘', value: 'transfer' },
                ]}
                value={arrivalFlowConfig}
                onChange={(vals) => setArrivalFlowConfig(vals as string[])}
            />
        }
      >
         <SettingOutlined className="text-gray-400 hover:text-blue-500" onClick={e => e.stopPropagation()}/>
      </Popover>
    </div>
  );

  const DepartureFlowHeader = () => (
    <div className="flex items-center justify-center gap-1 cursor-pointer">
      <span>离站客流</span>
      <Popover 
        trigger="click"
        content={
            <Checkbox.Group 
                options={[
                    { label: '上车', value: 'board', disabled: true },
                    { label: '换乘', value: 'transfer' },
                ]}
                value={departureFlowConfig}
                onChange={(vals) => setDepartureFlowConfig(vals as string[])}
            />
        }
      >
         <SettingOutlined className="text-gray-400 hover:text-blue-500" onClick={e => e.stopPropagation()}/>
      </Popover>
    </div>
  );

  const ExitOperationHeader = () => (
    <div className="flex items-center justify-center gap-1 cursor-pointer">
      <span>出站作业</span>
      <Popover 
        trigger="click"
        content={
            <Checkbox.Group 
                options={[
                    { label: '作业状态', value: 'task', disabled: true },
                    { label: '出站口', value: 'exitGate' },
                ]}
                value={exitOperationConfig}
                onChange={(vals) => setExitOperationConfig(vals as string[])}
            />
        }
      >
         <SettingOutlined className="text-gray-400 hover:text-blue-500" onClick={e => e.stopPropagation()}/>
      </Popover>
    </div>
  );

  const CheckinOperationHeader = () => (
    <div className="flex items-center justify-center gap-1 cursor-pointer">
      <span>检票作业</span>
      <Popover 
        trigger="click"
        content={
            <Checkbox.Group 
                options={[
                    { label: '作业状态', value: 'task', disabled: true },
                    { label: '检票口', value: 'ticketGate' },
                ]}
                value={checkinOperationConfig}
                onChange={(vals) => setCheckinOperationConfig(vals as string[])}
            />
        }
      >
         <SettingOutlined className="text-gray-400 hover:text-blue-500" onClick={e => e.stopPropagation()}/>
      </Popover>
    </div>
  );

  const LocationHeader = () => (
    <div className="flex items-center justify-center gap-1 cursor-pointer">
      <span>位置信息</span>
      <Popover 
        trigger="click"
        content={
            <Checkbox.Group 
                options={[
                    { label: '股道', value: 'track', disabled: true },
                    { label: '站台', value: 'platform' },
                ]}
                value={visibleLocations}
                onChange={(vals) => setVisibleLocations(vals as string[])}
            />
        }
      >
         <SettingOutlined className="text-gray-400 hover:text-blue-500" onClick={e => e.stopPropagation()}/>
      </Popover>
    </div>
  );

  const PlatformOperationHeader = () => (
    <div className="flex items-center justify-center gap-1 cursor-pointer">
      <span>站台作业</span>
      <Popover 
        trigger="click"
        content={
            <Checkbox.Group 
                options={[
                    { label: '行包', value: 'parcel' },
                    { label: '送餐', value: 'meal' },
                    { label: '过夜', value: 'overnight' },
                    { label: '折返', value: 'turnaround' },
                    { label: '超员', value: 'overcrowd' },
                    { label: '专运', value: 'special' },
                ]}
                value={visibleTags}
                onChange={(vals) => setVisibleTags(vals as string[])}
            />
        }
      >
         <SettingOutlined className="text-gray-400 hover:text-blue-500" onClick={e => e.stopPropagation()}/>
      </Popover>
    </div>
  );

  const renderTrainAttribute = (train: any) => {
    if (!train || !train.attributes) return null;
    const { attributes } = train;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-800">{attributes.formation}</span>
          <span className="text-gray-600 text-base font-medium">{attributes.formationOrder === 'normal' ? '正' : '反'}</span>
          {attributes.direction === 'up' ? 
            <Tooltip title="上行"><div className="flex items-center"><span className="text-base font-bold text-gray-500">南</span><span className="flex items-center justify-center w-6 h-6 bg-red-50 rounded-full"><ArrowUp size={18} className="text-red-600" /></span></div></Tooltip> : 
            <Tooltip title="下行"><div className="flex items-center"><span className="text-base font-bold text-gray-500">北</span><span className="flex items-center justify-center w-6 h-6 bg-green-50 rounded-full"><ArrowDown size={18} className="text-green-600" /></span></div></Tooltip>
          }
        </div>
        {attributes.landmarkColor && (
          <Tooltip title={`地标颜色: ${attributes.landmarkColor}`}>
            <div 
              className="w-16 h-3 rounded shadow-sm border border-gray-100"
              style={{
                backgroundColor: {
                  '红': '#ff4d4f', '红色': '#ff4d4f',
                  '黄': '#fadb14', '黄色': '#fadb14',
                  '绿': '#52c41a', '绿色': '#52c41a',
                  '蓝': '#1890ff', '蓝色': '#1890ff',
                  '紫': '#722ed1', '紫色': '#722ed1',
                  '橙': '#fa8c16', '橙色': '#fa8c16'
                }[attributes.landmarkColor as string] || '#f0f0f0'
              }} 
            />
          </Tooltip>
        )}
      </div>
    );
  };

  const columns: any = [
    {
      title: '序号',
      key: 'index',
      width: 40,
      fixed: 'left',
      align: 'center',
      className: 'bg-gray-50 text-gray-400',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '到站车次盯控',
      className: 'group-header-arrival',
      children: [
        {
          title: '到站车次',
          key: 'arrCode',
          width: 120,
          align: 'center',
          className: 'header-arrival',
          render: (_: any, record: OperationUnit) => renderTrainCode(record, 'arr')
        },
        {
          title: '到站时间',
          key: 'arrTime',
          width: 90, 
          align: 'left',
          className: 'header-arrival',
          render: (_: any, record: OperationUnit) => renderTime(record.arrivalTrain?.planArrTime, record.arrivalTrain?.actualArrTime)
        },
        {
          title: '车长',
          key: 'arrConductor',
          width: 80,
          align: 'center',
          className: 'header-arrival',
          render: (_: any, record: OperationUnit) => renderConductors(record, 'arr')
        },
        {
          title: '列车属性',
          key: 'arrAttr',
          width: 100,
          align: 'center',
          className: 'header-arrival',
          render: (_: any, record: OperationUnit) => renderTrainAttribute(record.arrivalTrain)
        },
        {
            title: '临站发车',
            key: 'prevDep',
            width: 90,
            align: 'center',
            className: 'header-arrival',
            render: (_: any, record: OperationUnit) => <span className="text-gray-500">{formatTime(record.arrivalTrain?.prevStationDepTime) || ''}</span>
        },
        {
          title: <ArrivalFlowHeader />,
          key: 'arrFlow',
          width: 110,
          align: 'center',
          className: 'header-arrival',
          render: (_: any, record: OperationUnit) => renderPassengerFlow('arr', record)
        },
        {
          title: <ExitOperationHeader />,
          key: 'task_exit',
          width: 100,
          align: 'center',
          className: 'header-arrival',
          render: (_: any, record: OperationUnit) => renderTaskWithGate('exit', record, exitOperationConfig.includes('exitGate'), 'exit')
        }
      ]
    },
    {
      title: '站台盯控',
      className: 'group-header-platform',
      children: [
        {
            title: <LocationHeader />,
            key: 'location',
            width: 120,
            align: 'center',
            className: 'header-platform',
            render: (_: any, record: OperationUnit) => renderLocation(record)
        },
        {
          title: <PlatformOperationHeader />,
          key: 'task_platform',
          width: 100,
          align: 'center',
          className: 'header-platform',
          render: (_: any, record: OperationUnit) => renderTask('platform', record)
        },
        {
          title: '上水吸污',
          key: 'task_water',
          width: 100,
          align: 'center',
          className: 'header-platform',
          render: (_: any, record: OperationUnit) => renderTask('water_sewage', record)
        }
      ]
    },
    {
      title: '离站车次盯控',
      className: 'group-header-departure',
      children: [
        {
          title: '离站车次',
          key: 'depCode',
          width: 120,
          align: 'center',
          className: 'header-departure',
          render: (_: any, record: OperationUnit) => renderTrainCode(record, 'dep')
        },
        {
          title: '发车时间',
          key: 'depTime',
          width: 90, 
          align: 'left',
          className: 'header-departure',
          render: (_: any, record: OperationUnit) => renderTime(record.departureTrain?.planDepTime, record.departureTrain?.actualDepTime)
        },
        {
          title: '车长',
          key: 'depConductor',
          width: 80,
          align: 'center',
          className: 'header-departure',
          render: (_: any, record: OperationUnit) => renderConductors(record, 'dep')
        },
        {
          title: '列车属性',
          key: 'depAttr',
          width: 100,
          align: 'center',
          className: 'header-departure',
          render: (_: any, record: OperationUnit) => renderTrainAttribute(record.departureTrain)
        },
        {
          title: <DepartureFlowHeader />,
          key: 'depFlow',
          width: 110,
          align: 'center',
          className: 'header-departure',
          render: (_: any, record: OperationUnit) => renderPassengerFlow('dep', record)
        },
        {
          title: <CheckinOperationHeader />,
          key: 'task_checkin',
          width: 100,
          align: 'center',
          className: 'header-departure',
          render: (_: any, record: OperationUnit) => renderTaskWithGate('check_in', record, checkinOperationConfig.includes('ticketGate'), 'ticket')
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f5f7fa]">
      
      <div className="flex-1 flex flex-col overflow-hidden p-2">
        <div className="bg-white p-4 mb-4 rounded-lg shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-xl font-bold m-0">作业盯控</h1>
           <span className="text-gray-400 text-sm">Operation Monitoring</span>
        </div>

        <div style={{
          width: '340px',
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 12px',
          background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
          borderRadius: '6px',
          boxShadow: '2px 2px 5px #d1d1d1, -2px -2px 5px #ffffff',
          border: '1px solid #e0e0e0',
          fontFamily: "'Orbitron', sans-serif",
          color: '#333'
        }}>
          <div style={{ 
            minWidth: '160px',
            textAlign: 'center',
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            whiteSpace: 'nowrap',
            textShadow: '1px 1px 0px rgba(255,255,255,1)' 
          }}>
            {formatCurrentDate(currentTime)}
          </div>
          <div style={{ 
            width: '1px', 
            height: '24px', 
            background: '#ccc' 
          }} />
          <div style={{ 
            minWidth: '150px',
            textAlign: 'center',
            fontSize: '20px', 
            fontWeight: '900', 
            color: '#333',
            letterSpacing: '2px',
            textShadow: '1px 1px 0px rgba(255,255,255,1)'
          }}>
            {formatCurrentTime(currentTime)}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <ColorLegend />
          <Button type="primary">刷新数据</Button>

          <Popover
            content={
              <div className="w-64 max-h-80 overflow-y-auto">
              <List
                size="small"
                dataSource={abnormalMessages}
                renderItem={(item) => (
                    <List.Item className="cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0" onClick={() => handleAbnormalMessageClick(item)}>
                        <div className="flex flex-col w-full gap-1">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#1890ff]">{item.trainNo}</span>
                                <span className="text-gray-400 text-xs">{item.time}</span>
                            </div>
                            <div className="text-gray-600 text-sm">{item.content}</div>
                        </div>
                    </List.Item>
                )}
                locale={{ emptyText: '暂无异常消息' }}
              />
              </div>
            }
            title={
                <div className="flex justify-between items-center">
                    <span>异常消息提醒</span>
                    <Tooltip title={isSoundEnabled ? "关闭声音提醒" : "开启声音提醒"}>
                        <div 
                            className="cursor-pointer text-gray-500 hover:text-blue-500 flex items-center" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSoundEnabled(!isSoundEnabled);
                            }}
                        >
                            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </div>
                    </Tooltip>
                </div>
            }
            trigger="click"
            open={messagePopoverOpen}
            onOpenChange={setMessagePopoverOpen}
            placement="bottomRight"
          >
             <div className="cursor-pointer p-1 flex items-center">
                 <Badge count={abnormalMessages.length} offset={[0, 0]} size="small">
                    <Bell 
                        size={20} 
                        color={abnormalMessages.length > 0 ? '#ff4d4f' : '#666'} 
                    />
                 </Badge>
             </div>
          </Popover>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden p-2">
        <Table
          columns={columns}
          dataSource={sortedData}
          rowKey="id"
          scroll={{ x: 2000, y: 'calc(100vh - 200px)' }}
          pagination={false}
          className="custom-table"
          bordered
          expandable={{
            expandedRowRender: (record) => <OperationDetailPanel record={record} />,
            expandedRowKeys: expandedRowKeys,
            onExpand: (expanded, record) => handleRowExpand(record.id),
            expandIcon: () => null,
            rowExpandable: () => true,
            columnWidth: 0,
          }}
          onRow={(record) => ({
            onClick: () => setSelectedRowId(record.id),
          })}
          rowClassName={(record) => record.id === selectedRowId ? 'row-selected-custom' : ''}
        />
      </div>

      <Modal
        title="添加备注"
        centered
        open={remarkModalVisible}
        onOk={handleSaveRemark}
        onCancel={() => setRemarkModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <TextArea 
          rows={4} 
          value={remarkText} 
          onChange={e => setRemarkText(e.target.value)} 
          placeholder="请输入备注信息..." 
        />
      </Modal>

      <Modal
        title="人员派班"
        open={assignModalVisible}
        onOk={handleAssignOk}
        onCancel={() => setAssignModalVisible(false)}
      >
        <div className="flex flex-col gap-4">
           <div>
             <div className="mb-2 text-gray-500">当前任务: {currentTask?.name}</div>
             <div className="mb-2 text-gray-500">需作业人数: {currentTask?.requiredStaffCount || 2}人</div>
           </div>
           <div>
             <div className="mb-2">选择人员:</div>
             <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="请选择作业人员"
                value={selectedStaffNames}
                onChange={setSelectedStaffNames}
             >
                <Option value="张三">张三 (客运员)</Option>
                <Option value="李四">李四 (值班员)</Option>
                <Option value="王五">王五 (上水工)</Option>
                <Option value="赵六">赵六 (保洁员)</Option>
             </Select>
           </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default Component;
